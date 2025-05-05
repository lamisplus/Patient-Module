package org.lamisplus.modules.patient.service;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.joda.time.DateTime;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.RecordExistException;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.patient.domain.dto.*;
import org.lamisplus.modules.patient.domain.entity.Encounter;
import org.lamisplus.modules.patient.domain.entity.PatientCheckPostService;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.domain.entity.Visit;
import org.lamisplus.modules.patient.repository.EncounterRepository;
import org.lamisplus.modules.patient.repository.PatientCheckPostServiceRepository;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.repository.VisitRepository;
import org.lamisplus.modules.patient.utility.LocalDateConverter;
import org.springframework.beans.BeanUtils;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import javax.persistence.Convert;
import javax.transaction.Transactional;
//import javax.validation.constraints.PastOrPresent;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VisitService {

    public static final String PATIENT_CHECK_PROGRESS_TOPIC = "/topic/checking-in-out-process";

    private final SimpMessageSendingOperations messagingTemplate;
    private final PersonRepository personRepository;
    private final VisitRepository visitRepository;

    private final EncounterRepository encounterRepository;

    private final PatientCheckPostServiceRepository patientCheckPostServiceRepository;

    private final UserService userService;

    public Visit createVisit(VisitRequest visitDto, String serviceCode) {
        String checkInDate = visitDto.getCheckInDate();

        Person person = personRepository
                .findById(visitDto.getPersonId())
                .orElseThrow(() -> new EntityNotFoundException(VisitService.class, "errorMessage", "No patient found with id " + visitDto.getPersonId()));

        Optional<Visit> currentVisit = visitRepository.findVisitByPersonAndVisitStartDateNotNullAndVisitEndDateIsNullAndServiceCode(person, serviceCode);
        if (currentVisit.isPresent())
            throw new RecordExistException(VisitService.class, "errorMessage", "Visit Already exist for this patient " + person.getId());

        Visit visit = convertDtoToEntityVisit(visitDto, serviceCode);
        visit.setUuid(UUID.randomUUID().toString());
        visit.setArchived(0);
        if (checkInDate != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            LocalDateTime visitStartDateTime = LocalDateTime.parse(checkInDate, formatter);
            visit.setVisitStartDate(visitStartDateTime);
        } else {
            LocalDateTime now = LocalDateTime.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            String formatDateTime = now.format(formatter);
            LocalDateTime visitStartDateTime = LocalDateTime.parse(formatDateTime, formatter);
            visit.setVisitStartDate(visitStartDateTime);
        }
        return visitRepository.save(visit);
    }

//    public Visit createVisit(VisitRequest visitDto) {
//        String checkInDate = visitDto.getCheckInDate();
//        System.out.println("Here are the dtos " + visitDto.getServiceCode());
////        visitDto.getServiceCode().forEach(s -> System.out.println("Here are the dtos1"));
//        Person person = personRepository
//                .findById(visitDto.getPersonId())
//                .orElseThrow(() -> new EntityNotFoundException(VisitService.class, "errorMessage", "No patient found with id " + visitDto.getPersonId()));
//
//        Optional<Visit> currentVisit = visitRepository.findVisitByPersonAndVisitStartDateNotNullAndVisitEndDateIsNullAndServiceCode(person, visitDto.getServiceCode().toString());
//        if (currentVisit.isPresent())
//            throw new RecordExistException(VisitService.class, "errorMessage", "Visit Already exist for this patient " + person.getId());
//        Visit visit = convertDtoToEntityVisit(visitDto);
//        visit.setUuid(UUID.randomUUID().toString());
//        visit.setArchived(0);
//        if (checkInDate != null) {
//            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
//            LocalDateTime visitStartDateTime = LocalDateTime.parse(checkInDate, formatter);
//            visit.setVisitStartDate(visitStartDateTime);
//        } else {
//            LocalDateTime now = LocalDateTime.now();
//            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
//            String formatDateTime = now.format(formatter);
//            LocalDateTime visitStartDateTime = LocalDateTime.parse(formatDateTime, formatter);
//            visit.setVisitStartDate(visitStartDateTime);
//        }
//        return visitRepository.save(visit);
//    }

    public VisitDto updateVisit(Long id, VisitDto visitDto) {
        Visit existVisit = getExistVisit(id);
        Visit visit = convertDtoToEntity(visitDto);
        visit.setId(existVisit.getId());
        visit.setArchived(0);
        return convertEntityToDto(visitRepository.save(visit));

    }

    public void checkOutVisitById(Long visitId) {
        Visit visit = getExistVisit(visitId);
        List<Encounter> encounters = encounterRepository.getEncounterByVisit(visit);
        encounters.forEach(this::checkoutFromAllService);
        visit.setVisitEndDate(LocalDateTime.now());
        visitRepository.save(visit);
        messagingTemplate.convertAndSend(PATIENT_CHECK_PROGRESS_TOPIC, "Client checked out of service");

    }


    public List<Encounter> getPendingEncounterByStatus() {
        log.info("Fetching pending encounters...");
        List<Encounter> pendingEncounters = encounterRepository.findEncounterByStatus("PENDING");
        log.info("Number of pending encounters: " + pendingEncounters.size());

        pendingEncounters.forEach(encounter -> {
            log.info("Processing encounter with UUID: " + encounter.getUuid());
            idleCheckout(encounter);
        });

        return pendingEncounters;
    }

    @Transactional
    public void idleCheckout(Encounter encounter) {
        System.out.println("Got into Idle Checkout *******************");
        LocalDateTime encounterDate = encounter.getEncounterDate();
        LocalDateTime expiredDate = encounterDate.plusDays(1);
        System.out.println("Expired Date: " + expiredDate + " Encounter Date: " + encounterDate);

        if (LocalDateTime.now().isBefore(expiredDate)) {
            log.info("Checking out encounter: " + encounter.getVisit().getUuid());

            // Update the status of the encounter
            encounter.setStatus("CHECKED-OUT");
            encounter.setLastModifiedDate(LocalDateTime.now());
            encounter.setLastModifiedBy("auto-checkout");

            try {
                encounterRepository.save(encounter);
                log.info("Successfully updated encounter with UUID: " + encounter.getUuid());
            } catch (Exception e) {
                log.error("Error updating encounter: ", e);
            }
        } else {
            log.info("Encounter with UUID: " + encounter.getUuid() + " is not expired yet.");
        }
    }


    private void checkoutFromAllService(Encounter encounter) {
        if (encounter.getStatus().equals("PENDING")) {
            encounter.setStatus("COMPLETED");
        }
        encounterRepository.save(encounter);
    }

    public VisitDto getVisitById(Long id) {
        return convertEntityToDto(getExistVisit(id));
    }

    public List<VisitDto> getAllVisit() {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        Long currentOrganisationUnitId = 0L;
        if (currentUser.isPresent()) {
            User user = (User) currentUser.get();
            currentOrganisationUnitId = user.getCurrentOrganisationUnitId();

        }
        return visitRepository
                .findAllByArchivedAndFacilityId(0, currentOrganisationUnitId)
                .stream()
                .map(this::convertEntityToDto)
                .collect(Collectors.toList());
    }

    public void archivedVisit(Long id) {
        Visit existVisit = getExistVisit(id);
        existVisit.setArchived(1);
        visitRepository.save(existVisit);
    }

    public boolean isPatientHivPositive(String personId){
        return personRepository.isPatientHivPositive(personId);
    }

    public VisitDto checkInPerson(CheckInDto checkInDto) {
        Visit visit = null;
        Visit visit1 = null;
        Long personId = checkInDto.getVisitDto().getPersonId();
        // Fetch the person details
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> {
                    String errorMessage = "No patient found with id " + personId;
                    messagingTemplate.convertAndSend(PATIENT_CHECK_PROGRESS_TOPIC, errorMessage);
                    return new EntityNotFoundException(VisitService.class, "errorMessage", errorMessage);
                });
        // Process each service ID
        for (Long serviceId : checkInDto.getServiceIds()) {
            Optional<PatientCheckPostService> patientCheckPostService = patientCheckPostServiceRepository.findById(serviceId);

            if (patientCheckPostService.isPresent()) {
                PatientCheckPostService patientCheckPostService1 = patientCheckPostService.get();
                if (patientCheckPostService1.getModuleServiceCode().toLowerCase().contains("prep") && isPatientHivPositive(String.valueOf(personId))) {
                    String errorMessage = "HIV positive patients are not eligible for PrEP services.";
                    throw new IllegalArgumentException(errorMessage);
                }
                visit1 = createVisit(checkInDto.getVisitDto(), patientCheckPostService1.getModuleServiceCode());
                visit = getExistVisit(visit1.getId());
                // Create encounter
                createEncounter(person, visit, patientCheckPostService1.getModuleServiceCode());
                messagingTemplate.convertAndSend(PATIENT_CHECK_PROGRESS_TOPIC,
                        "Client Checked: " + person.getHospitalNumber() + " into " + patientCheckPostService1.getModuleServiceName());
            } else {
                // Notify about missing service
                messagingTemplate.convertAndSend(PATIENT_CHECK_PROGRESS_TOPIC,
                        "Service ID not found: " + serviceId + " for personId: " + personId);
            }
        }
        return convertEntityToDto(visit);
    }

    private void createEncounter(Person person, Visit visit, String serviceCode) {
        Encounter encounter = new Encounter();
        encounter.setPerson(person);
        encounter.setArchived(0);
        encounter.setVisit(visit);
        encounter.setEncounterDate(visit.getVisitStartDate());
        encounter.setUuid(UUID.randomUUID().toString());
        encounter.setStatus("PENDING");
        encounter.setServiceCode(serviceCode);
        encounter.setFacilityId(visit.getFacilityId());
        encounterRepository.save(encounter);
    }

    private Encounter getEncounter(Person person, Visit visit) {
        return Encounter.builder()
                .person(person)
                .archived(0)
                .visit(visit)
                .encounterDate(visit.getVisitStartDate())
                .uuid(UUID.randomUUID().toString())
                .status("PENDING")
                .build();
    }

    public List<VisitDetailDto> getVisitWithEncounterDetails(Long personId) {
        Optional<Person> person = personRepository.findById(personId);
        return person.map(value -> encounterRepository.getEncounterByPersonAndArchived(value, 0)
                .stream()
                .map(encounter -> getVisitDetailDto(personId, encounter)).collect(Collectors.toList())).orElseGet(ArrayList::new);

    }

    private VisitDetailDto getVisitDetailDto(Long personId, Encounter encounter) {
        List<Encounter> encounters = this.encounterRepository.getEncounterByVisit(encounter.getVisit());
        List<EncounterResponseDto> encounterResponseList = new ArrayList<>();
        encounters.forEach(encounter1 -> {
            EncounterResponseDto encounterResponseDto = new EncounterResponseDto();
            encounterResponseDto.setFacilityId(encounter1.getFacilityId());
            encounterResponseDto.setId(encounter1.getId());
            encounterResponseDto.setEncounterDate(encounter1.getEncounterDate().toLocalDate());
            encounterResponseDto.setPersonId(encounter1.getPerson().getId());
            encounterResponseDto.setUuid(encounter1.getUuid());
            encounterResponseDto.setVisitId(encounter1.getVisit().getId());
            encounterResponseDto.setServiceCode(encounter1.getServiceCode());
            encounterResponseDto.setStatus(encounter1.getStatus());
            encounterResponseList.add(encounterResponseDto);

        });
        return VisitDetailDto.builder()
                .status(encounter.getStatus())
                .id(encounter.getVisit().getId())
                .personId(personId)
                .checkInDate(encounter.getVisit().getVisitStartDate())
                .checkOutDate(encounter.getVisit().getVisitEndDate())
                .encounterId(encounter.getId())
                .service(encounter.getServiceCode())
                .encounters(encounterResponseList)
                .build();
    }

    private Visit getExistVisit(Long id) {
        return visitRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException(VisitService.class, "errorMessage", "No visit was found with given Id " + id));
    }


    private Visit convertDtoToEntity(VisitDto visitDto) {
        Person person = personRepository
                .findById(visitDto.getPersonId())
                .orElseThrow(() -> new EntityNotFoundException(VisitService.class, "errorMessage", "No patient found with id " + visitDto.getPersonId()));
        Visit visit = new Visit();
        BeanUtils.copyProperties(visitDto, visit);
        visit.setVisitStartDate(LocalDateTime.now());
        log.info("facilityId {}", person.getFacilityId());
        visit.setFacilityId(person.getFacilityId());
        visit.setPerson(person);
        return visit;
    }

    private Visit convertDtoToEntityVisit(VisitRequest visitDto, String serviceCode) {
        Person person = personRepository
                .findById(visitDto.getPersonId())
                .orElseThrow(() -> new EntityNotFoundException(VisitService.class, "errorMessage", "No patient found with id " + visitDto.getPersonId()));
        Visit visit = new Visit();
        visit.setVisitStartDate(LocalDateTime.now());
        log.info("facilityId {}", person.getFacilityId());
        visit.setFacilityId(person.getFacilityId());
        visit.setPerson(person);
        visit.setServiceCode(serviceCode);
        return visit;
    }

    private VisitDto convertEntityToDto(Visit visit) {
        VisitDto visitDto = new VisitDto();
        visitDto.setPersonId(visit.getPerson().getId());
        visitDto.setFacilityId(visit.getFacilityId());
        visitDto.setId(visit.getId());
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        String checkInDate = visit.getVisitStartDate().format(formatter);
        visitDto.setCheckInDate(checkInDate);
//        visitDto.setServiceCode(Collections.singleton("serviceCoderher"));

//        Set<String> serviceCodes = new HashSet<>();
//        serviceCodes.add(visit.getServiceCode());
////        visitDto.setServiceCode(serviceCodes);

        if (visit.getVisitEndDate() != null) {
            String checkOutDate = visit.getVisitEndDate().format(formatter);
            visitDto.setCheckOutDate(checkOutDate);
        }

        List<Encounter> encounters = this.encounterRepository.getEncounterByVisit(visit);
        List<EncounterResponseDto> encounterResponseList = new ArrayList<>();
        encounters.forEach(encounter -> {
            EncounterResponseDto encounterResponseDto = new EncounterResponseDto();
            encounterResponseDto.setFacilityId(encounter.getFacilityId());
            encounterResponseDto.setId(encounter.getId());
            encounterResponseDto.setEncounterDate(encounter.getEncounterDate().toLocalDate());
            encounterResponseDto.setPersonId(encounter.getPerson().getId());
            encounterResponseDto.setUuid(encounter.getUuid());
            encounterResponseDto.setVisitId(encounter.getVisit().getId());
            encounterResponseDto.setServiceCode(encounter.getServiceCode());
            encounterResponseDto.setStatus(encounter.getStatus());
            encounterResponseList.add(encounterResponseDto);
        });
        visitDto.setEncounters(encounterResponseList);
        return visitDto;
    }

    public Optional<Visit> findByVisitStartDateAndPerson(LocalDateTime visitStartDate, Person person){
        return visitRepository.findByVisitStartDateAndPerson(visitStartDate, person);
    }

    public Visit saveVisit(Visit visit){
        return visitRepository.save(visit);
    }

    public Optional<Visit> findByUuid(String uuid){
        return visitRepository.findByUuid(uuid);
    }


}
