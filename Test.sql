WITH hts_patients AS (
    SELECT DISTINCT
        p.id AS personId,
        p.uuid AS personUuid,
        p.first_name AS firstName,
        p.surname AS surname,
        p.other_name AS otherName,
        p.hospital_number AS hospitalNumber,
        CAST(EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) AS INTEGER) AS age,
        INITCAP(p.sex) AS gender,
        p.date_of_birth AS dateOfBirth,
        p.date_of_registration AS dateOfRegistration,
        p.last_modified_date AS dateModified,
        p.contact#>>'{contact,0,contactPoint,value}' AS phoneNumber
    FROM patient_person p
    INNER JOIN hts_client hc
        ON hc.person_uuid = p.uuid AND hc.archived = 0
    INNER JOIN (
        SELECT
            person_uuid,
            MIN(date_created) AS first_hts_registration,
            COUNT(person_uuid) AS hts_count
        FROM hts_client
        WHERE person_uuid IS NOT NULL
            AND archived = 0
            AND facility_id = 1883
        GROUP BY person_uuid
    ) mini
        ON hc.person_uuid = mini.person_uuid
        AND hc.date_created = mini.first_hts_registration
),
duplicate_groups AS (
    SELECT
        TRIM(LOWER(firstName)) AS first_name_key,
        TRIM(LOWER(surname)) AS surname_key,
        dateOfBirth,
        gender,
        COALESCE(phoneNumber, '') AS phone_key,
        COUNT(*) AS duplicateCount,
        STRING_AGG(CAST(personId AS TEXT), ',' ORDER BY personId) AS duplicatePersonIds
    FROM hts_patients
    GROUP BY
        TRIM(LOWER(firstName)),
        TRIM(LOWER(surname)),
        dateOfBirth,
        gender,
        COALESCE(phoneNumber, '')
    HAVING COUNT(*) > 1
),
ranked_duplicates AS (
    SELECT
        hp.*,
        dg.duplicateCount,
        dg.duplicatePersonIds,
        ROW_NUMBER() OVER (
            PARTITION BY
                TRIM(LOWER(hp.firstName)),
                TRIM(LOWER(hp.surname)),
                hp.dateOfBirth,
                hp.gender,
                COALESCE(hp.phoneNumber, '')
            ORDER BY
                COALESCE(hp.dateModified, hp.dateOfRegistration, CAST('1900-01-01' AS DATE)) DESC,
                hp.dateOfRegistration DESC NULLS LAST
        ) AS rn
    FROM hts_patients hp
    INNER JOIN duplicate_groups dg
        ON TRIM(LOWER(hp.firstName)) = dg.first_name_key
        AND TRIM(LOWER(hp.surname)) = dg.surname_key
        AND hp.dateOfBirth = dg.dateOfBirth
        AND hp.gender = dg.gender
        AND COALESCE(hp.phoneNumber, '') = dg.phone_key
)
SELECT
    hospitalNumber,
    personUuid,
    personId,
    firstName,
    surname,
    otherName,
    dateOfBirth,
    dateOfRegistration,
    dateModified,
    age,
    gender,
    phoneNumber,
    duplicateCount,
    duplicatePersonIds,
    CASE WHEN rn = 1 THEN personId ELSE NULL END AS suggestedMasterId,
    CASE WHEN rn = 1 THEN TRUE ELSE FALSE END AS isSuggestedMaster
FROM ranked_duplicates
ORDER BY duplicateCount DESC, firstName, surname, rn;