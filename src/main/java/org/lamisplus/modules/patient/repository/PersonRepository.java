package org.lamisplus.modules.patient.repository;

import org.lamisplus.modules.patient.domain.entity.Person;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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
    @Query(value = "SELECT p.*, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age, INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth FROM patient_person p WHERE p.archived=?1 AND p.facility_id=?2 GROUP BY p.id, p.first_name, p.surname, p.other_name, p.hospital_number, p.date_of_birth", nativeQuery = true)
    Page<Person> getAllByArchivedAndFacilityIdOrderByIdDesc(Integer archived, Long facilityId, Pageable pageable);


    @Query(value =
            "SELECT * FROM patient_person WHERE (first_name ilike ?1 OR surname ilike ?1 OR other_name ilike ?1 OR full_name ilike ?1 OR hospital_number ilike ?1)  AND archived=?2 AND facility_id=?3", nativeQuery = true)
    Page<Person> findAllPersonBySearchParameters(String queryParam, Integer archived, Long facilityId, Pageable pageable);

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
    Page<Person> findPersonWithBiometrics2(String queryParam, Integer archived, Long facilityId, Pageable pageable);

    @Query(value = "SELECT p.* from patient_person p JOIN (select person_uuid FROM biometric b Group by person_uuid HAVING count(person_uuid) < 6) b on p.uuid = b.person_uuid WHERE p.archived=?1 and p.facility_id =?2 ORDER BY p.id desc", nativeQuery = true)
    Page<Person> findPersonWithOutBiometrics(Integer archived, Long facilityId, Pageable pageable);

    @Query(value = "SELECT * FROM patient_person p JOIN (select person_uuid FROM biometric b Group by person_uuid HAVING count(person_uuid) < 6) b on p.uuid = b.person_uuid  WHERE (p.first_name ilike ?1 OR p.surname ilike ?1 OR p.other_name ilike ?1 OR p.full_name ilike ?1 OR p.hospital_number ilike ?1) AND p.archived=?2 AND p.facility_id=?3 ORDER BY p.id desc", nativeQuery = true)
    Page<Person> findPersonWithOutBiometrics2(String queryParam, Integer archived, Long facilityId, Pageable pageable);

    @Query(value = "SELECT * FROM patient_person WHERE uuid NOT IN (SELECT person_uuid FROM biometric) and archived=?1 and facility_id =?2 ORDER BY id desc", nativeQuery = true)
    Page<Person> findPersonWithOutBiometrics3(Integer archived, Long facilityId, Pageable pageable);

    @Query(value = "SELECT * FROM patient_person WHERE uuid NOT IN (SELECT person_uuid FROM biometric) and  (p.first_name ilike ?1 OR p.surname ilike ?1 OR p.other_name ilike ?1 OR p.full_name ilike ?1 OR p.hospital_number ilike ?1) and archived=?2 and facility_id =?3 ORDER BY id desc", nativeQuery = true)
    Page<Person> findPersonWithOutBiometrics4(String queryParam, Integer archived, Long facilityId, Pageable pageable);

    @Query(value = "SELECT DISTINCT p.* FROM patient_person p\n" +
            "LEFT JOIN biometric b on p.uuid = b.person_uuid\n" +
            "WHERE b.recapture = 0 and p.archived=?1 and p.facility_id =?2", nativeQuery = true)
    Page<Person> findPersonWithOutRecapture3(Integer archived, Long facilityId, Pageable pageable);
    @Query(value = "SELECT DISTINCT p.* FROM patient_person p\n" +
            "LEFT JOIN biometric b on p.uuid = b.person_uuid\n" +
            "WHERE b.recapture = 0 and (p.first_name ilike ?1 OR p.surname ilike ?1 OR p.other_name ilike ?1 OR p.full_name ilike ?1 OR p.hospital_number ilike ?1) \n" +
            "and p.archived=?2 and p.facility_id =?3", nativeQuery = true)
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


}


