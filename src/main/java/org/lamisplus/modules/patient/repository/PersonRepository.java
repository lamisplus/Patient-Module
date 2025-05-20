package org.lamisplus.modules.patient.repository;

import org.lamisplus.modules.patient.domain.dto.PersonProjection;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


public interface PersonRepository extends JpaRepository<Person, Long> {

 //   @Override
//    Optional<Person> findById(Long aLong);
//
//    Optional<Person> getPersonByHospitalNumberAndFacilityId(String hospitalNumber, Long facility);
//
//    List<Person> getPersonByHospitalNumber(String hospitalNumber);
//
//    Optional<Person> getPersonByUuidAndFacilityIdAndArchived(String uuid, Long facility, Integer archive);
//
//
//    Optional<Person> getPersonByNinNumberAndFacilityIdAndArchived(String ninNumber, Long facility, Integer archive);
//
//    List<Person> getPersonByNinNumber(String ninNumber);
//
//    Optional<Person> findPersonByNinNumber(String ninNumber);
//
//    List<Person> getAllByArchivedOrderByDateOfRegistrationDesc(int i);
//
//
//    Page<Person> getAllByArchivedOrderByIdDesc(Integer archived, Pageable pageable);
//
//    //@Query(value = "SELECT p.id as id, p.first_name as firstName, p.surname as surname, p.other_name as otherName, p.hospital_number as hospitalNumber, p.created_by as createdBy, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age, INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth FROM patient_person p WHERE p.archived=?1 AND p.facility_id=?2 GROUP BY p.id, p.first_name, p.surname, p.other_name, p.hospital_number, p.date_of_birth", nativeQuery = true)
//    @Query(value = "SELECT p.*, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age, INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth FROM patient_person p WHERE p.archived=?1 AND p.facility_id=?2 GROUP BY p.id, p.first_name, p.surname, p.other_name, p.hospital_number, p.date_of_birth", nativeQuery = true)
//    Page<Person> getAllByArchivedAndFacilityIdOrderByIdDesc(Integer archived, Long facilityId, Pageable pageable);
//
//
//    @Query(value = "SELECT * FROM patient_person WHERE (first_name ilike ?1 OR surname ilike ?1 OR other_name ilike ?1 OR full_name ilike ?1 OR hospital_number ilike ?1)  AND archived=?2 AND facility_id=?3", nativeQuery = true)
//    Page<Person> findAllPersonBySearchParameters(String queryParam, Integer archived, Long facilityId, Pageable pageable);
//
//    @Query(value = "SELECT p.* from patient_person p JOIN (select hospital_number, archived FROM patient_person b Group by hospital_number, archived HAVING count(hospital_number) > 1) b on p.hospital_number = b.hospital_number WHERE (p.first_name ilike ?1 OR p.surname ilike ?1 OR p.other_name ilike ?1 OR full_name ilike ?1 OR p.hospital_number ilike ?1) AND p.facility_id=?2 and p.archived != 2 ORDER BY p.hospital_number", nativeQuery = true)
//    Page<Person> findDuplicatePersonBySearchParameters(String queryParam, Long facilityId, Pageable pageable);
//
//    @Query(value = "SELECT p.* from patient_person p JOIN (select hospital_number, archived FROM patient_person b Group by hospital_number, archived HAVING count(hospital_number) > 1) b on p.hospital_number = b.hospital_number WHERE p.facility_id=?1 and p.archived != 2 ORDER BY p.hospital_number", nativeQuery = true)
//    Page<Person> findDuplicatePerson(Long facilityId, Pageable pageable);
//
//    @Query(value = "SELECT count(*) FROM patient_person p WHERE p.archived = 0", nativeQuery = true)
//    Integer getTotalRecords();
//
//    @Query(value = "SELECT * FROM patient_person pp INNER JOIN patient_visit pv ON pp.uuid=pv.person_uuid WHERE (first_name ilike ?1 OR surname ilike ?1 OR other_name ilike ?1 OR full_name ilike ?1 OR hospital_number ilike ?1) AND pv.archived=?2 AND pp.archived=?2 AND pp.facility_id=?3 AND pv.visit_end_date is null", nativeQuery = true)
//    Page<Person> findCheckedInPersonBySearchParameters(String queryParam, Integer archived, Long facilityId, Pageable pageable);
//
//    @Query(value = "SELECT * FROM patient_person pp INNER JOIN patient_visit pv ON pp.uuid=pv.person_uuid WHERE pv.archived=?1 AND pp.archived=?1 AND pp.facility_id=?2 AND pv.visit_end_date is null", nativeQuery = true)
//    Page<Person> findAllCheckedInPerson(Integer archived, Long facilityId, Pageable pageable);
//
//    @Query(
//            value = "SELECT count(*) FROM biometric b WHERE b.person_uuid = ?1",
//            nativeQuery = true)
//    Integer getBiometricCountByPersonUuid(String uuid);
//
//
//    @Query(value = "SELECT * FROM patient_person pp WHERE uuid NOT IN (SELECT person_uuid FROM pmtct_anc pa where pa.archived = 0) and (pp.first_name ilike ?1 OR pp.surname ilike ?1 OR pp.other_name ilike ?1 OR pp.full_name ilike ?1 OR pp.hospital_number ilike ?1) AND pp.archived=?2 AND pp.facility_id=?3 AND pp.sex ilike '%FEMALE%' AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10 ) ORDER BY pp.id desc", nativeQuery = true)
//    Page<Person> findFemalePersonBySearchParameters(String queryParam, Integer archived, Long facilityId, Pageable pageable);
//
//    //@Query(value = "SELECT * FROM patient_person pp WHERE pp.archived=?1 AND pp.facility_id=?2 AND pp.sex ilike '%FEMALE%' AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10 ) ORDER BY pp.id desc", nativeQuery = true)
//    @Query(value = "SELECT * FROM patient_person pp WHERE uuid NOT IN (SELECT person_uuid FROM pmtct_anc pa where pa.archived = 0) and pp.archived=?1 AND pp.facility_id=?2 AND pp.sex ilike '%FEMALE%' AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10 ) ORDER BY pp.id desc", nativeQuery = true)
//    Page<Person> findFemalePerson(Integer archived, Long facilityId, Pageable pageable);
//
//    @Query(value = "SELECT * FROM patient_person pp WHERE pp.archived=?1 AND pp.facility_id=?2 AND pp.sex ilike 'FEMALE' AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10 ) ORDER BY pp.id desc", nativeQuery = true)
//    Page<Person> findFemalePerson2(Integer archived, Long facilityId, Pageable pageable);
//
//    @Query(value = "SELECT * FROM patient_person pp INNER JOIN pmtct_anc pa ON (pp.uuid=pa.person_uuid and pa.archived=0) WHERE pp.archived=?1 AND pp.facility_id=?2 AND pp.sex ilike 'FEMALE' AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10 ) ORDER BY pa.id desc", nativeQuery = true)
//    Page<Person> getActiveOnANC(Integer archived, Long facilityId, Pageable pageable);
//
//    @Query(value = "SELECT * FROM patient_person pp INNER JOIN pmtct_anc pa ON (pp.uuid=pa.person_uuid and pa.archived=0) WHERE (pp.first_name ilike ?1 OR pp.surname ilike ?1 OR pp.other_name ilike ?1 OR pp.full_name ilike ?1 OR pp.hospital_number ilike ?1) AND pp.archived=?2 AND pp.facility_id=?3 AND pp.sex ilike 'FEMALE' AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10 ) ORDER BY pa.id desc", nativeQuery = true)
//    Page<Person> getActiveOnANCBySearchParameters(String queryParam, Integer archived, Long facilityId, Pageable pageable);
//
//    @Query(value = "SELECT p.* from patient_person p JOIN (select person_uuid FROM biometric b Group by person_uuid HAVING count(person_uuid) >= 6) b on p.uuid = b.person_uuid WHERE p.archived=?1 and p.facility_id =?2 ORDER BY p.id desc", nativeQuery = true)
//    Page<Person> findPersonWithBiometrics(Integer archived, Long facilityId, Pageable pageable);
//
//    @Query(value = "SELECT * FROM patient_person p JOIN (select person_uuid FROM biometric b Group by person_uuid HAVING count(person_uuid) >= 6) b on p.uuid = b.person_uuid  WHERE (p.first_name ilike ?1 OR p.surname ilike ?1 OR p.other_name ilike ?1 OR p.full_name ilike ?1 OR p.hospital_number ilike ?1) AND p.archived=?2 AND p.facility_id=?3 ORDER BY p.id desc", nativeQuery = true)
//    Page<Person> findPersonWithBiometrics2(String queryParam, Integer archived, Long facilityId, Pageable pageable);
//
//    @Query(value = "SELECT p.* from patient_person p JOIN (select person_uuid FROM biometric b Group by person_uuid HAVING count(person_uuid) < 6) b on p.uuid = b.person_uuid WHERE p.archived=?1 and p.facility_id =?2 ORDER BY p.id desc", nativeQuery = true)
//    Page<Person> findPersonWithOutBiometrics(Integer archived, Long facilityId, Pageable pageable);
//
//    @Query(value = "SELECT * FROM patient_person p JOIN (select person_uuid FROM biometric b Group by person_uuid HAVING count(person_uuid) < 6) b on p.uuid = b.person_uuid  WHERE (p.first_name ilike ?1 OR p.surname ilike ?1 OR p.other_name ilike ?1 OR p.full_name ilike ?1 OR p.hospital_number ilike ?1) AND p.archived=?2 AND p.facility_id=?3 ORDER BY p.id desc", nativeQuery = true)
//    Page<Person> findPersonWithOutBiometrics2(String queryParam, Integer archived, Long facilityId, Pageable pageable);
//
//    @Query(value = "SELECT * FROM patient_person WHERE uuid NOT IN (SELECT person_uuid FROM biometric) and archived=?1 and facility_id =?2 ORDER BY id desc", nativeQuery = true)
//    Page<Person> findPersonWithOutBiometrics3(Integer archived, Long facilityId, Pageable pageable);
//
//    @Query(value = "SELECT * FROM patient_person WHERE uuid NOT IN (SELECT person_uuid FROM biometric) and  (p.first_name ilike ?1 OR p.surname ilike ?1 OR p.other_name ilike ?1 OR p.full_name ilike ?1 OR p.hospital_number ilike ?1) and archived=?2 and facility_id =?3 ORDER BY id desc", nativeQuery = true)
//    Page<Person> findPersonWithOutBiometrics4(String queryParam, Integer archived, Long facilityId, Pageable pageable);


    @Override
    Optional<Person> findById(Long aLong);

    Optional<Person> getPersonByHospitalNumberAndFacilityId(String hospitalNumber, Long facility);

    List<Person> getPersonByHospitalNumber(String hospitalNumber);

    Optional<Person> getPersonByUuidAndFacilityIdAndArchived(String uuid, Long facility, Integer archive);


    Optional<Person> getPersonByNinNumberAndFacilityIdAndArchived(String ninNumber, Long facility, Integer archive);

    List<Person> getPersonByNinNumber(String ninNumber);

    Optional<Person> findPersonByNinNumber(String ninNumber);

    List<Person> getAllByArchivedOrderByDateOfRegistrationDesc(int i);


    Page<Person> getAllByArchivedOrderByIdDesc(Integer archived, Pageable pageable);

    //@Query(value = "SELECT p.id as id, p.first_name as firstName, p.surname as surname, p.other_name as otherName, p.hospital_number as hospitalNumber, p.created_by as createdBy, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age, INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth FROM patient_person p WHERE p.archived=?1 AND p.facility_id=?2 GROUP BY p.id, p.first_name, p.surname, p.other_name, p.hospital_number, p.date_of_birth", nativeQuery = true)

    @Query(value = "SELECT p.* FROM patient_person p " +
            "WHERE p.archived = ?1 AND p.facility_id = ?2 " +
            "ORDER BY p.id DESC",
            nativeQuery = true)
    Page<Person> getAllByArchivedAndFacilityIdOrderByIdDesc(Integer archived, Long facilityId, Pageable pageable);
   
    @Query(value = "SELECT p.* FROM patient_person p " +
            "WHERE (p.hospital_number ILIKE ?1 OR " +
            "       p.first_name ILIKE ?1 OR " +
            "       p.surname ILIKE ?1 OR " +
            "       p.other_name ILIKE ?1 OR " +
            "       p.full_name ILIKE ?1) " +
            "AND p.archived = ?2 AND p.facility_id = ?3 " +
            "ORDER BY p.id DESC",
            nativeQuery = true)
    Page<Person> findAllPersonBySearchParameters(String queryParam, Integer archived, Long facilityId, Pageable pageable);



    @Query(value = " SELECT COUNT(p.id) \n" +
            "        FROM patient_person p \n" +
            "        WHERE (\n" +
            "            p.hospital_number ILIKE ?1 OR \n" +
            "            p.first_name ILIKE ?1 OR \n" +
            "            p.surname ILIKE ?1 OR \n" +
            "            p.other_name ILIKE ?1 OR \n" +
            "            p.full_name ILIKE ?1\n" +
            "        ) \n" +
            "        AND p.archived = ?2 \n" +
            "        AND p.facility_id = ?3", nativeQuery = true)
    long countBySearchParameters(String queryParam, Integer archived, Long facilityId);

    @Query(value = "SELECT COUNT(p.id) FROM patient_person p WHERE p.archived = ?1 AND p.facility_id = ?2", nativeQuery = true)
    long countByArchivedAndFacilityId(Integer archived, Long facilityId);


    @Query(value = "SELECT p.* from patient_person p JOIN (select hospital_number, archived FROM patient_person b Group by hospital_number, archived HAVING count(hospital_number) > 1) b on p.hospital_number = b.hospital_number WHERE (p.first_name ilike ?1 OR p.surname ilike ?1 OR p.other_name ilike ?1 OR full_name ilike ?1 OR p.hospital_number ilike ?1) AND p.facility_id=?2 and p.archived != 2 ORDER BY p.hospital_number", nativeQuery = true)
    Page<Person> findDuplicatePersonBySearchParameters(String queryParam, Long facilityId, Pageable pageable);

    @Query(value = "SELECT p.* from patient_person p JOIN (select hospital_number, archived FROM patient_person b Group by hospital_number, archived HAVING count(hospital_number) > 1) b on p.hospital_number = b.hospital_number WHERE p.facility_id=?1 and p.archived != 2 ORDER BY p.hospital_number", nativeQuery = true)
    Page<Person> findDuplicatePerson(Long facilityId, Pageable pageable);

    @Query(value = "SELECT count(*) FROM patient_person p WHERE p.archived = 0", nativeQuery = true)
    Integer getTotalRecords();

    @Query(value = "SELECT * FROM patient_person pp INNER JOIN patient_visit pv ON pp.uuid=pv.person_uuid WHERE (first_name ilike ?1 OR surname ilike ?1 OR other_name ilike ?1 OR full_name ilike ?1 OR hospital_number ilike ?1) AND pv.archived=?2 AND pp.archived=?2 AND pp.facility_id=?3 AND pv.visit_end_date is null", nativeQuery = true)
    Page<Person> findCheckedInPersonBySearchParameters(String queryParam, Integer archived, Long facilityId, Pageable pageable);

    @Query(value = "SELECT DISTINCT pp.* FROM patient_person pp INNER JOIN patient_visit pv ON pp.uuid=pv.person_uuid WHERE pv.archived=?1 AND pp.archived=?1 AND pp.facility_id=?2 AND pv.visit_end_date is null", nativeQuery = true)
    Page<Person> findAllCheckedInPerson(Integer archived, Long facilityId, Pageable pageable);

    @Query(
            value = "SELECT count(*) FROM biometric b WHERE b.person_uuid = ?1",
            nativeQuery = true)
    Integer getBiometricCountByPersonUuid(String uuid);


    @Query(
            value = "SELECT b.person_uuid, CASE WHEN COUNT(*) > 0 THEN true ELSE false END as has_biometrics " +
                    "FROM biometric b " +
                    "WHERE b.person_uuid IN :personUuids " +
                    "GROUP BY b.person_uuid",
            nativeQuery = true)
    List<Object[]> getBiometricStatusForPersons(@Param("personUuids") List<String> personUuids);


    @Query(value = "SELECT * FROM patient_person pp WHERE uuid NOT IN (SELECT person_uuid FROM pmtct_anc pa where pa.archived = 0) and (pp.first_name ilike ?1 OR pp.surname ilike ?1 OR pp.other_name ilike ?1 OR pp.full_name ilike ?1 OR pp.hospital_number ilike ?1) AND pp.archived=?2 AND pp.facility_id=?3 AND pp.sex ilike '%FEMALE%' AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10 ) ORDER BY pp.id desc", nativeQuery = true)
    Page<Person> findFemalePersonBySearchParameters(String queryParam, Integer archived, Long facilityId, Pageable pageable);

    //@Query(value = "SELECT * FROM patient_person pp WHERE pp.archived=?1 AND pp.facility_id=?2 AND pp.sex ilike '%FEMALE%' AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10 ) ORDER BY pp.id desc", nativeQuery = true)
    @Query(value = "SELECT * FROM patient_person pp WHERE uuid NOT IN (SELECT person_uuid FROM pmtct_anc pa where pa.archived = 0) and pp.archived=?1 AND pp.facility_id=?2 AND pp.sex ilike '%FEMALE%' AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10 ) ORDER BY pp.id desc", nativeQuery = true)
    Page<Person> findFemalePerson(Integer archived, Long facilityId, Pageable pageable);

    @Query(value = "SELECT * FROM patient_person pp WHERE pp.archived=?1 AND pp.facility_id=?2 AND pp.sex ilike 'FEMALE' AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10 ) ORDER BY pp.id desc", nativeQuery = true)
    Page<Person> findFemalePerson2(Integer archived, Long facilityId, Pageable pageable);

    @Query(value = "SELECT * FROM patient_person pp INNER JOIN pmtct_anc pa ON (pp.uuid=pa.person_uuid and pa.archived=0) WHERE pp.archived=?1 AND pp.facility_id=?2 AND pp.sex ilike 'FEMALE' AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10 ) ORDER BY pa.id desc", nativeQuery = true)
    Page<Person> getActiveOnANC(Integer archived, Long facilityId, Pageable pageable);

    @Query(value = "SELECT * FROM patient_person pp INNER JOIN pmtct_anc pa ON (pp.uuid=pa.person_uuid and pa.archived=0) WHERE (first_name ilike ?1 OR surname ilike ?1 OR other_name ilike ?1 OR full_name ilike ?1 OR hospital_number ilike ?1) AND pp.archived=?2 AND pp.facility_id=?3 AND pp.sex ilike 'FEMALE' AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10 ) ORDER BY pa.id desc", nativeQuery = true)
    Page<Person> getActiveOnANCBySearchParameters(String queryParam, Integer archived, Long facilityId, Pageable pageable);

    @Query(value = "SELECT p.* from patient_person p JOIN (select person_uuid FROM biometric b Group by person_uuid HAVING count(person_uuid) >= 6) b on p.uuid = b.person_uuid WHERE p.archived=?1 and p.facility_id =?2 ORDER BY p.id desc", nativeQuery = true)
    Page<Person> findPersonWithBiometrics(Integer archived, Long facilityId, Pageable pageable);

    @Query(value = "SELECT * FROM patient_person p JOIN (select person_uuid FROM biometric b Group by person_uuid HAVING count(person_uuid) >= 6) b on p.uuid = b.person_uuid  WHERE (p.first_name ilike ?1 OR p.surname ilike ?1 OR p.other_name ilike ?1 OR p.full_name ilike ?1 OR p.hospital_number ilike ?1) AND p.archived=?2 AND p.facility_id=?3 ORDER BY p.id desc", nativeQuery = true)
    Page<Person> findPersonWithBiometricsUsingSearchParam(String queryParam, Integer archived, Long facilityId, Pageable pageable);

    @Query(value = "SELECT p.* from patient_person p JOIN (select person_uuid FROM biometric b Group by person_uuid HAVING count(person_uuid) < 6) b on p.uuid = b.person_uuid WHERE p.archived=?1 and p.facility_id =?2 ORDER BY p.id desc", nativeQuery = true)
    Page<Person> findPersonWithOutBiometrics(Integer archived, Long facilityId, Pageable pageable);

    @Query(value = "SELECT * FROM patient_person p JOIN (select person_uuid FROM biometric b Group by person_uuid HAVING count(person_uuid) < 6) b on p.uuid = b.person_uuid  WHERE (p.first_name ilike ?1 OR p.surname ilike ?1 OR p.other_name ilike ?1 OR p.full_name ilike ?1 OR p.hospital_number ilike ?1) AND p.archived=?2 AND p.facility_id=?3 ORDER BY p.id desc", nativeQuery = true)
    Page<Person> findPersonWithOutBiometricsUsingSearchParam(String queryParam, Integer archived, Long facilityId, Pageable pageable);

    @Query(value = "SELECT * FROM patient_person WHERE uuid NOT IN (SELECT person_uuid FROM biometric) and archived=?1 and facility_id =?2 ORDER BY id desc", nativeQuery = true)
    Page<Person> findPersonWithOutBiometrics3(Integer archived, Long facilityId, Pageable pageable);

    @Query(value = "SELECT * FROM patient_person WHERE uuid NOT IN (SELECT person_uuid FROM biometric) and  (p.first_name ilike ?1 OR p.surname ilike ?1 OR p.other_name ilike ?1 OR p.full_name ilike ?1 OR p.hospital_number ilike ?1) and archived=?2 and facility_id =?3 ORDER BY id desc", nativeQuery = true)
    Page<Person> findPersonWithOutBiometrics4(String queryParam, Integer archived, Long facilityId, Pageable pageable);

    @Query(value = "SELECT DISTINCT p.* FROM patient_person p\n" +
            "            JOIN (\n" +
            "\t\t\tSELECT person_uuid, MAX(recapture) FROM BIOMETRIC\n" +
            "\t\t\t\tWHERE archived = 0\n" +
            "\t\t\tGROUP BY person_uuid\t\n" +
            "\t\t) b on p.uuid = b.person_uuid\n" +
            "            WHERE \n" +
            "\t\t\tb.max = 0 AND \n" +
            "\t\t\tp.archived=?1 and p.facility_id =?2", nativeQuery = true)
    Page<Person> findPersonWithOutRecapture3(Integer archived, Long facilityId, Pageable pageable);
    @Query(value = "SELECT DISTINCT p.* FROM patient_person p\n" +
            "            JOIN (\n" +
            "\t\t\tSELECT person_uuid, MAX(recapture) FROM BIOMETRIC\n" +
            "\t\t\t\tWHERE archived = 0\n" +
            "\t\t\tGROUP BY person_uuid\t\n" +
            "\t\t) b on p.uuid = b.person_uuid\n" +
            "            WHERE \n" +
            "\t\t\tb.max = 0 \n" +
            "\t\t\tAND (p.first_name ilike ?1 OR p.surname ilike ?1 OR p.other_name ilike ?1 OR p.full_name ilike ?1 OR p.hospital_number ilike ?1)\n" +
            "\t\t\tAND \n" +
            "\t\t\tp.archived=?2 and p.facility_id =?3", nativeQuery = true)
    Page<Person> findPersonWithOutRecapture4(String queryParam, Integer archived, Long facilityId, Pageable pageable);

    List<Person> findAllByFacilityIdAndArchived(Long facilityId, Integer archived);
    Optional<Person> findByUuidAndFacilityIdAndArchived(String uuid, Long facilityId, Integer archived);
    Optional<Person> findByUuidAndFacilityId(String uuid, Long facilityId);
    Optional<Person> findByUuid(String uuid);

    @Query(value ="SELECT * FROM patient_person where facility_id=?1", nativeQuery = true)
    List<Person> findAllByFacilityIdAndArchivedAndLastModifiedDate(Long facilityId, Integer archived, LocalDateTime dateLastSync);

    List<Person> findAllByFacilityId(Long facilityId);

    @Query(value ="SELECT * FROM patient_person WHERE last_modified_date > ?1 AND facility_id=?2", nativeQuery = true)
    public List<Person> getAllDueForServerUpload(LocalDateTime dateLastSync, Long facilityId);

    @Query(value =
            "SELECT * " +
                    "FROM patient_person p " +
                    "JOIN (" +
                    "    SELECT DISTINCT person_uuid, jsonb_build_object('recapture', array_agg(DISTINCT recapture)) AS mobile_extra " +
                    "    FROM biometric b " +
                    "    WHERE archived = ?1 " +
                    " AND facility_id = ?2 " +
                    "    GROUP BY person_uuid " +
                    "    HAVING COUNT(person_uuid) >= 6 " +
                    ") b ON p.uuid = b.person_uuid " +
                    "JOIN LATERAL ( " +
                    "    SELECT 1 " +
                    "    FROM jsonb_array_elements(p.address->'address') AS addr " +
                    "    WHERE addr->>'district' IN (?3) " +
                    ") addr_filter ON true", nativeQuery = true)
    Page<Person> findPersonByLga(Integer archived, Long facilityId, List<String> lgaIds, Pageable pageable);

    @Query(value = "select \n" +
            "  distinct pp.id as id, \n" +
            "  pp.uuid as personUuid, \n" +
            "  pp.deceased as deceased, \n" +
            "  pp.deceased_date_time as deceasedDateTime, \n" +
            "  pp.sex as sex, \n" +
            "  pp.date_of_birth as dateOfBirth, \n" +
            "  pp.date_of_registration as dateOfRegistration, \n" +
            "  pp.archived as archived, \n" +
            "  pp.nin_number as ninNumber, \n" +
            "  pp.emr_id as emrId, \n" +
            "  pp.first_name as firstName, \n" +
            "  pp.surname as surname, \n" +
            "  pp.other_name as otherName, \n" +
            "  pp.hospital_number as hospitalNumber, \n" +
            "  lab_test_name as labTestName,\n" +
            "  group_name as groupName,\n" +
            "  result_reported as resultReported,\n" +
            "  last_vl_date as lastVlDate,\n" +
            "  max_dsd_date as maxDsdDate,\n" +
            "  last_drug_pickup_date as lastDrugPickupDate,\n" +
            "  next_appointment as nextAppointment\n" +
            "from \n" +
            "  patient_person pp \n" +
            "  left join (\n" +
            "    select \n" +
            "      distinct pp.*, \n" +
            "      case_manager_info.* \n" +
            "    from \n" +
            "      patient_person pp \n" +
            "      join (\n" +
            "        select \n" +
            "          distinct cmp.person_uuid, \n" +
            "          cm.id, \n" +
            "          cm.first_name, \n" +
            "          cm.last_name, \n" +
            "          cm.user_id, \n" +
            "          cm.designation \n" +
            "        from \n" +
            "          case_manager cm \n" +
            "          join case_manager_patients cmp on cm.id = cmp.case_manager_id\n" +
            "      ) case_manager_info on pp.uuid = case_manager_info.person_uuid\n" +
            "  ) cm on cm.person_uuid = pp.uuid \n" +
            "  left join case_manager_patients pcm ON pcm.person_uuid = pp.uuid \n" +
            "  left join(\n" +
            "    select \n" +
            "      distinct on (lt.patient_uuid) lt.patient_uuid, \n" +
            "      lt.last_test_date, \n" +
            "      llt.lab_test_name, \n" +
            "      lltg.group_name \n" +
            "    from \n" +
            "      (\n" +
            "        select \n" +
            "          distinct lt.patient_uuid, \n" +
            "          lt.lab_test_id, \n" +
            "          lt.lab_test_group_id, \n" +
            "          mtd.last_test_date \n" +
            "        from \n" +
            "          laboratory_test lt \n" +
            "          join (\n" +
            "            select \n" +
            "              patient_uuid, \n" +
            "              max(date_created) last_test_date \n" +
            "            from \n" +
            "              laboratory_test \n" +
            "            group by \n" +
            "              patient_uuid\n" +
            "          ) mtd on lt.patient_uuid = mtd.patient_uuid \n" +
            "          and lt.date_created = mtd.last_test_date \n" +
            "        where \n" +
            "          lt.date_created is not null\n" +
            "      ) lt \n" +
            "      left join (\n" +
            "        select \n" +
            "          * \n" +
            "        from \n" +
            "          laboratory_labtest \n" +
            "        where \n" +
            "          lab_test_name ilike '%Viral Load%'\n" +
            "      ) llt on llt.id = lt.lab_test_id \n" +
            "      left join laboratory_labtestgroup lltg on lltg.id = llt.labtestgroup_id \n" +
            "      and lt.lab_test_group_id = lltg.id \n" +
            "    order by \n" +
            "      lt.patient_uuid, \n" +
            "      lt.last_test_date desc\n" +
            "  ) labtests on pp.uuid = labtests.patient_uuid \n" +
            "  left join (\n" +
            "    select \n" +
            "      distinct on (lr.patient_uuid) lr.patient_uuid, \n" +
            "      lr.result_reported, \n" +
            "      mvld.last_vl_date \n" +
            "    from \n" +
            "      laboratory_result lr \n" +
            "      join (\n" +
            "        select \n" +
            "          patient_uuid, \n" +
            "          max(date_result_reported) last_vl_date \n" +
            "        from \n" +
            "          laboratory_result \n" +
            "        group by \n" +
            "          patient_uuid\n" +
            "      ) mvld on lr.patient_uuid = mvld.patient_uuid \n" +
            "      and lr.date_result_reported = mvld.last_vl_date \n" +
            "    where \n" +
            "      lr.date_result_reported is not null\n" +
            "  ) patient_latest_vL_results on pp.uuid = patient_latest_vL_results.patient_uuid \n" +
            "  left join (\n" +
            "    select \n" +
            "      distinct on (hap.person_uuid) hap.person_uuid, \n" +
            "      ldpd.last_drug_pickup_date, \n" +
            "      hap.next_appointment \n" +
            "    from \n" +
            "      hiv_art_pharmacy hap \n" +
            "      join (\n" +
            "        select \n" +
            "          person_uuid, \n" +
            "          max(visit_date) last_drug_pickup_date \n" +
            "        from \n" +
            "          hiv_art_pharmacy \n" +
            "        group by \n" +
            "          person_uuid\n" +
            "      ) ldpd on hap.person_uuid = ldpd.person_uuid \n" +
            "      and hap.visit_date = ldpd.last_drug_pickup_date \n" +
            "    where \n" +
            "      hap.visit_date is not null \n" +
            "      and hap.archived = 0\n" +
            "  ) pharmacy_results on pp.uuid = pharmacy_results.person_uuid \n" +
            "  left join (\n" +
            "    select \n" +
            "      dde.person_uuid dsd_person_uuid, \n" +
            "      mdd.max_dsd_date \n" +
            "    from \n" +
            "      dsd_devolvement dde \n" +
            "      join (\n" +
            "        select \n" +
            "          person_uuid, \n" +
            "          max(date_devolved) max_dsd_date \n" +
            "        from \n" +
            "          dsd_devolvement \n" +
            "        group by \n" +
            "          person_uuid\n" +
            "      ) mdd on dde.person_uuid = mdd.person_uuid \n" +
            "      and dde.date_devolved = mdd.max_dsd_date \n" +
            "    where \n" +
            "      dde.date_devolved is not null\n" +
            "  ) dsd_results on pp.uuid = dsd_results.dsd_person_uuid \n" +
            "where \n" +
            "  cm.user_id = ?1 \n" +
            "  and pp.archived = 0\n", nativeQuery = true)
    List<Object[]> findPersonByUser(String userId);

    @Query(value = "SELECT CASE WHEN sex = 'Female' THEN 'Female' WHEN sex = 'Male' THEN 'Male' ELSE 'Others' END AS name, COUNT(*) AS count FROM patient_person GROUP BY sex", nativeQuery = true)
    List<Object[]> countRegistrationsBySex();

    @Query(value = "SELECT EXTRACT(YEAR FROM date_of_registration) AS year, " +
            "SUM(CASE WHEN sex = 'Male' THEN 1 ELSE 0 END) AS male, " +
            "SUM(CASE WHEN sex = 'Female' THEN 1 ELSE 0 END) AS female " +
            "FROM patient_person " +
            "GROUP BY EXTRACT(YEAR FROM date_of_registration)", nativeQuery = true)
    List<Object[]> countRegistrationsByYearAndSex();
    

    @Query(value = "SELECT DISTINCT \n" +
            "                p.id AS id, \n" +
            "                p.created_by AS createby, \n" +
            "                p.date_of_registration AS dateofregistration, \n" +
            "                p.first_name AS firstname, \n" +
            "                p.surname AS surname, \n" +
            "                p.other_name AS othername, \n" +
            "                CONCAT( \n" +
            "                    p.first_name,  \n" +
            "                    CASE WHEN p.other_name IS NULL OR p.other_name = '' THEN '' ELSE ' ' || p.other_name END, \n" +
            "                    ' ',  \n" +
            "                    p.surname \n" +
            "                ) AS fullname, \n" +
            "                p.hospital_number AS hospitalnumber, \n" +
            "                CAST(EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) AS INTEGER) AS age, \n" +
            "                INITCAP(p.sex) AS sex, \n" +
            "                p.date_of_birth AS dateofbirth, \n" +
            "                p.is_date_of_birth_estimated AS isdobestimated, \n" +
            "                p.facility_id AS facilityid, \n" +
            "                p.uuid AS personuuid, \n" +
            "                CAST(CASE WHEN pc.display IS NULL THEN FALSE ELSE TRUE END AS BOOLEAN) AS isenrolled, \n" +
            "                e.target_group_id AS targetgroupid, \n" +
            "                e.id AS enrollmentid, \n" +
            "                e.unique_id AS uniqueid, \n" +
            "                pc.display AS currentstatus, \n" +
            "                ca.commenced AS commenced, \n" +
            "                CAST(CASE WHEN b.biometric_type IS NULL THEN FALSE ELSE TRUE END AS BOOLEAN) AS biometricstatus, \n" +
            "                v.id AS visitid, \n" +
            "                CAST(CASE WHEN ce.type IS NOT NULL THEN TRUE ELSE FALSE END AS BOOLEAN) AS clinicalevaluation, \n" +
            "                CAST(CASE WHEN mh.type IS NOT NULL THEN TRUE ELSE FALSE END AS BOOLEAN) AS mentalhealth, \n" +
            "                CAST(CASE WHEN pa.person_uuid IS NOT NULL THEN TRUE ELSE FALSE END AS BOOLEAN) AS isOnAnc, \n" +
            "                CAST(CASE WHEN pmt.person_uuid IS NOT NULL THEN TRUE ELSE FALSE END AS BOOLEAN) AS isOnPmtct, \n" +
            "                CAST(CASE WHEN prep.person_uuid IS NOT NULL THEN TRUE ELSE FALSE END AS BOOLEAN) AS isOnPrep, \n" +
            "                CAST(CASE WHEN hts.person_uuid IS NOT NULL THEN TRUE ELSE FALSE END AS BOOLEAN) AS isOnHts,\n" +
            "                CAST(CASE WHEN hts_rst.person_uuid IS NOT NULL THEN TRUE ELSE FALSE END AS BOOLEAN) AS isOnHtsRiskStratification,\n" +
            "                pmt.hiv_status AS hivStatus, \n" +
            "                pa.static_hiv_status AS staticHivStatus \n" +
            "            FROM patient_person p \n" +
            "            INNER JOIN patient_encounter pe ON pe.person_uuid = p.uuid \n" +
            "            INNER JOIN patient_visit v ON v.uuid = pe.visit_id \n" +
            "            LEFT JOIN biometric b ON b.person_uuid = p.uuid \n" +
            "            LEFT JOIN hiv_enrollment e ON p.uuid = e.person_uuid \n" +
            "            LEFT JOIN pmtct_anc pa ON p.uuid = pa.person_uuid AND pa.archived = 0 \n" +
            "            LEFT JOIN pmtct_enrollment pmt ON p.uuid = pmt.person_uuid AND pmt.archived = 0 \n" +
            "            LEFT JOIN prep_enrollment prep ON p.uuid = prep.person_uuid AND prep.archived = 0 \n" +
            "            LEFT JOIN hts_client hts ON p.uuid = hts.person_uuid and hts.archived = 0\n" +
            "            LEFT JOIN hts_risk_stratification hts_rst ON p.uuid =hts_rst.person_uuid AND hts_rst.archived = 0\n" +
            "            LEFT JOIN ( \n" +
            "                SELECT TRUE AS commenced, hac.person_uuid \n" +
            "                FROM hiv_art_clinical hac \n" +
            "                WHERE hac.archived = 0 AND hac.is_commencement IS TRUE \n" +
            "                GROUP BY hac.person_uuid \n" +
            "            ) ca ON p.uuid = ca.person_uuid \n" +
            "            LEFT JOIN base_application_codeset pc ON pc.id = e.status_at_registration_id \n" +
            "            LEFT JOIN ( \n" +
            "                SELECT DISTINCT person_uuid, type  \n" +
            "                FROM hiv_observation  \n" +
            "                WHERE type = 'Clinical evaluation'  \n" +
            "                AND archived = 0 \n" +
            "            ) ce ON ce.person_uuid = p.uuid \n" +
            "            LEFT JOIN ( \n" +
            "                SELECT DISTINCT person_uuid, type  \n" +
            "                FROM hiv_observation  \n" +
            "                WHERE type = 'Mental health'  \n" +
            "                AND archived = 0 \n" +
            "            ) mh ON mh.person_uuid = p.uuid \n" +
            "            WHERE p.archived = 0 \n" +
            "            AND pe.service_code = ?1 \n" +
            "            AND pe.status = 'PENDING' \n" +
            "            ORDER BY p.id ASC", nativeQuery = true)
    List<PersonProjection> findAllCheckedInPersonsDetails(String serviceCode);

    @Query(value = "SELECT\n" +
            "  CASE \n" +
            "    WHEN hiv_status_count > 0 THEN TRUE\n" +
            "    WHEN hiv_test_positive THEN TRUE\n" +
            "    ELSE FALSE\n" +
            "  END AS result\n" +
            "FROM (\n" +
            "  SELECT\n" +
            "    (SELECT COUNT(*)\n" +
            "     FROM hiv_status_tracker\n" +
            "     WHERE person_id = (SELECT uuid FROM patient_person WHERE id = CAST(?1 AS BIGINT))\n" +
            "    ) AS hiv_status_count,\n" +
            "    EXISTS(\n" +
            "      SELECT 1\n" +
            "      FROM (\n" +
            "        SELECT\n" +
            "          hts.hiv_test_result,\n" +
            "          ROW_NUMBER() OVER (PARTITION BY hts.person_uuid ORDER BY hts.date_visit DESC) AS rowNum\n" +
            "        FROM hts_client hts\n" +
            "        JOIN patient_person p ON p.uuid = hts.person_uuid\n" +
            "        WHERE p.id = CAST(?1 AS BIGINT)\n" +
            "      ) AS RankedVisits\n" +
            "      WHERE rowNum = 1 AND hiv_test_result ILIKE '%Positive%'\n" +
            "    ) AS hiv_test_positive\n" +
            ") AS combined_checks",
            nativeQuery = true)
    boolean isPatientHivPositive(String personId);
}


