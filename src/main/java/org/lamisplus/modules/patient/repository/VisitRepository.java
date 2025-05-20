package org.lamisplus.modules.patient.repository;

import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.domain.entity.Visit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VisitRepository extends JpaRepository<Visit, Long> {
    List<Visit> findAllByArchivedAndFacilityId(Integer archived, Long facilityId);

    List<Visit> getAllByVisitStartDateNotNullAndVisitEndDateIsNull();

    Optional<Visit> findVisitByPersonAndVisitStartDateNotNullAndVisitEndDateIsNull(Person person);

    Optional<Visit> findVisitByPersonAndVisitStartDateNotNullAndVisitEndDateIsNullAndServiceCode (Person person, String serviceCode);

   /// Visit findByPersonAndStatus(Person person);

    List<Visit> findAllByIdAndVisitStartDateNotNullAndVisitEndDateIsNull(Long id);

    Page<Visit> findAllByArchivedAndVisitStartDateNotNullAndVisitEndDateIsNull(Integer archived, Pageable pageable);

   // List<Visit> findAllByArchivedOrderByVisitStartDateDesc(Integer archived);

    @Query(value ="SELECT * FROM patient_person", nativeQuery = true)
    List<Visit> findAllByFacilityIdAndArchived(Long facilityId, Integer archived);

    //@Query(value ="SELECT * FROM patient_person WHERE last_modified_date > ?1 AND facility_id=?2 And archived=?3", nativeQuery = true)

    @Query(value ="SELECT * FROM patient_visit WHERE last_modified_date > ?1 AND facility_id=?2", nativeQuery = true)
    List<Visit> getAllForServerUpload(LocalDateTime dateLastSync, Long facilityId);

    List<Visit> findAllByFacilityId(Long facilityId);

    List<Visit> findAllByFacilityIdAndArchived(Long facilityId, int archived);

    Optional<Visit> findByUuidAndFacilityId(String uuid, Long facilityId);

    @Query(value ="SELECT * FROM patient_visit WHERE last_modified_date > ?1 AND facility_id=?2", nativeQuery = true)
    List<Visit> getAllDueForServerUpload(LocalDateTime dateLastSync, Long facilityId);

    @Query(value ="SELECT * from patient_visit \n" +
            "WHERE person_uuid = ?1\n" +
            "AND visit_start_date IS NOT NULL\n" +
            "AND archived = 0\n" +
            "ORDER By last_modified_date DESC\n" +
            "LIMIT 1", nativeQuery = true)
    Optional<Visit> getRecentPatientVisit(String uuid);


    @Query(value =
            "WITH LatestVisits AS (" +
                    "   SELECT v.person_uuid, v.id, " +
                    "   ROW_NUMBER() OVER(PARTITION BY v.person_uuid ORDER BY v.last_modified_date DESC) AS row_num " +
                    "   FROM patient_visit v " +
                    "   WHERE v.person_uuid IN :personUuids " +
                    "   AND v.visit_start_date IS NOT NULL " +
                    "   AND v.archived = 0 " +
                    ")" +
                    "SELECT person_uuid, id FROM LatestVisits WHERE row_num = 1",
            nativeQuery = true)
    List<Object[]> findLatestVisitsForPersons(@Param("personUuids") List<String> personUuids);


    @Query(value =
            "WITH LatestVisits AS (" +
                    "   SELECT pv.person_uuid, pv.id, " +
                    "   ROW_NUMBER() OVER(PARTITION BY pv.person_uuid ORDER BY pv.last_modified_date DESC) AS row_num " +
                    "   FROM patient_visit pv " +
                    "   WHERE pv.person_uuid IN :personUuids " +
                    "   AND pv.visit_start_date IS NOT NULL " +
                    "   AND pv.archived = 0 " +
                    ")" +
                    "SELECT person_uuid, id FROM LatestVisits WHERE row_num = 1",
            nativeQuery = true)
    List<Object[]> getBatchLatestVisits(@Param("personUuids") List<String> personUuids);

    @Query(value =
            "WITH LatestVisits AS (" +
                    "   SELECT pv.person_uuid, pv.id, " +
                    "   ROW_NUMBER() OVER(PARTITION BY pv.person_uuid ORDER BY pv.last_modified_date DESC) AS row_num " +
                    "   FROM patient_visit pv " +
                    "   WHERE pv.person_uuid IN :personUuids " +
                    "   AND pv.visit_start_date IS NOT NULL " +
                    "   AND pv.archived = 0 " +
                    ")" +
                    "SELECT person_uuid, id FROM LatestVisits WHERE row_num = 1",
            nativeQuery = true)
    List<Object[]> getLatestVisitsForPersons(@Param("personUuids") List<String> personUuids);

    Optional<Visit> findByVisitStartDateAndPerson(LocalDateTime visitStartDate, Person person);

    Optional<Visit> findByUuid(String uuid);
}
