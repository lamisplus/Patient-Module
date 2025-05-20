package org.lamisplus.modules.patient.service;

import lombok.RequiredArgsConstructor;
import org.audit4j.core.util.Log;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.patient.domain.dto.EncounterRequestDto;
import org.lamisplus.modules.patient.domain.dto.EncounterResponseDto;
import org.lamisplus.modules.patient.domain.dto.EncounterStatusResponseDto;
import org.lamisplus.modules.patient.domain.entity.Encounter;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.domain.entity.Visit;
import org.lamisplus.modules.patient.repository.EncounterRepository;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.repository.VisitRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class EncounterService {
    private final VisitRepository visitRepository;
    private final EncounterRepository encounterRepository;
    private final PersonRepository personRepository;
    private final SimpMessageSendingOperations messagingTemplate;


    public static final String PATIENT_CHECK_PROGRESS_TOPIC = "/topic/checking-in-out-process";


    private final UserService userService;

    public boolean isPatientHivPositive(String personId){
        return personRepository.isPatientHivPositive(personId);
    }
    public void isPositivePatientPostException(String personId,String serviceCode){
        if (serviceCode.toLowerCase().contains("prep") && isPatientHivPositive(String.valueOf(personId))) {
            String errorMessage = "HIV positive patients are not eligible for PrEP services.";
            throw new IllegalArgumentException(errorMessage);
        }
    }
    public List<EncounterResponseDto> registerEncounter(EncounterRequestDto encounterRequestDto) {
        Long personId = encounterRequestDto.getPersonId();
        String postServiceCode = encounterRequestDto.getServiceCode().toString();
        isPositivePatientPostException(String.valueOf(personId),postServiceCode);
        Long visitId = encounterRequestDto.getVisitId();
        Visit visit = visitRepository.findById(visitId).orElseThrow(() -> new EntityNotFoundException(EncounterService.class, "errorMessage", "No visit found with Id " + visitId));
        List<EncounterResponseDto> encounterRequestDtos = new ArrayList<>();
        Set<String> serviceCodes = encounterRequestDto.getServiceCode();
        serviceCodes
                .stream()
                .forEach(serviceCode -> {
                    Optional<Encounter> existingEncounter =
                            encounterRepository.getEncounterByVisitAndStatusAndServiceCode(visit, encounterRequestDto.getStatus(), serviceCode);
                    if (!existingEncounter.isPresent()) {
                        Encounter encounter = processedAndSaveEncounter(encounterRequestDto, serviceCode);
                        messagingTemplate.convertAndSend(PATIENT_CHECK_PROGRESS_TOPIC, "Client Checked: " + encounterRequestDto.getPersonId() + " into " + serviceCode);
                        encounter.setVisit(visit);
                        encounterRequestDtos.add(convertEntityToResponseDto(encounterRepository.save(encounter)));
                    }
                });
        return encounterRequestDtos;
    }
    private Encounter processedAndSaveEncounter(EncounterRequestDto encounterRequestDto, String s) {
        Encounter encounter = convertDtoToEntity(encounterRequestDto);
        encounter.setUuid(UUID.randomUUID().toString());
        encounter.setServiceCode(s);
        encounter.setArchived(0);
        return encounter;
    }
    public List<EncounterResponseDto> updateEncounter(Long id, EncounterRequestDto encounterRequestDto) {
        Encounter existEncounter = getExistEncounter(id);
        List<EncounterResponseDto> encounterRequestDtos = new ArrayList<>();
        Set<String> serviceCodes = encounterRequestDto.getServiceCode();
        serviceCodes.stream()
                .forEach(serviceCode -> {
                    Encounter encounter = processedAndSaveEncounter(encounterRequestDto, serviceCode);
                    encounter.setId(existEncounter.getId());
                    encounter.setArchived(0);
                    encounterRequestDtos.add(convertEntityToResponseDto(encounterRepository.save(encounter)));
                });
        return encounterRequestDtos;
    }
    public List<EncounterResponseDto> getAllEncounters() {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        Long currentOrganisationUnitId = 0L;
        if (currentUser.isPresent()) {
            User user = (User) currentUser.get();
            currentOrganisationUnitId = user.getCurrentOrganisationUnitId();

        }
        return encounterRepository.findAllByArchivedAndFacilityId(0, currentOrganisationUnitId)
                .stream()
                .map(this::convertEntityToResponseDto)
                .collect(Collectors.toList());
    }
    public List<EncounterResponseDto> getAllEncounterByPerson(Long personId) {
        Person person = personRepository
                .findById(personId)
                .orElseThrow(() -> new EntityNotFoundException(EncounterService.class, "errorMessage", "No Person with given Id " + personId));
        List<Encounter> personEncounters = encounterRepository.getEncounterByPersonAndArchived(person, 0);
        return personEncounters
                .stream()
                .map(this::convertEntityToResponseDto)
                .collect(Collectors.toList());
    }
    public EncounterResponseDto getEncounterById(Long id) {
        return convertEntityToResponseDto(getExistEncounter(id));
    }
    public List<EncounterResponseDto> getEncounterByVisitId(Long visitId) {
        Visit visit = visitRepository.findById (visitId).orElseThrow (() -> new EntityNotFoundException (EncounterService.class, "errorMessage", "No visit was found with given Id " + visitId));
        List<Encounter> visitEncounters = encounterRepository.getEncounterByVisit(visit);
        return  visitEncounters
                .stream ()
                .map (this::convertEntityToResponseDto)
                .collect (Collectors.toList ());
    }
    public void archivedEncounter(Long id) {
        Encounter existEncounter = getExistEncounter(id);
        existEncounter.setArchived(1);
        encounterRepository.save(existEncounter);
    }
    private Encounter getExistEncounter(Long id) {
        return encounterRepository.findById(id).orElseThrow(() -> new EntityNotFoundException(EncounterService.class, "errorMessage", "No encounter found with Id " + id));
    }
    private EncounterResponseDto convertEntityToResponseDto(Encounter encounter) {
        EncounterResponseDto encounterRequestDto = new EncounterResponseDto();
        BeanUtils.copyProperties(encounter, encounterRequestDto);
        encounterRequestDto.setPersonId(encounter.getPerson().getId());
        encounterRequestDto.setVisitId(encounter.getVisit().getId());
        Log.info("encounter date: {}", encounter.getEncounterDate().toLocalDate() );
        encounterRequestDto.setEncounterDate(encounter.getEncounterDate().toLocalDate());
        encounter.setServiceCode(encounter.getServiceCode());
        return encounterRequestDto;
    }
    private Encounter convertDtoToEntity(EncounterRequestDto encounterRequestDto) {
        Person person = personRepository
                .findById(encounterRequestDto.getPersonId())
                .orElseThrow(() -> new EntityNotFoundException(EncounterService.class, "errorMessage", "No patient found with id " + encounterRequestDto.getPersonId()));
        Visit visit = visitRepository
                .findById(encounterRequestDto.getVisitId())
                .orElseThrow(() -> new EntityNotFoundException(EncounterService.class, "errorMessage", "No visit found with id " + encounterRequestDto.getVisitId()));
        Encounter encounter = new Encounter();
        BeanUtils.copyProperties(encounterRequestDto, encounter);
        //Change encounter date to allow RDE - Amos and John
        encounter.setEncounterDate(LocalDateTime.now());
        encounter.setPerson(person);
        encounter.setStatus("PENDING");
        encounter.setVisit(visit);
        return encounter;
    }
    @PutMapping(value = "/encounter/status-update/{id}/{status}")
    public EncounterStatusResponseDto statusUpdate(@PathVariable Long id, @PathVariable String status) {
        Optional<Encounter> encounter = this.encounterRepository.findById(id);
        if ((status.equalsIgnoreCase("PENDING")) ||
                (status.equalsIgnoreCase("COMPLETED"))) {
            encounter.map(encounter1 -> {
                encounter1.setStatus(status);
                this.encounterRepository.save(encounter1);
                return new EncounterStatusResponseDto(Boolean.TRUE, "Update was successful");
            });
        }
        return new EncounterStatusResponseDto(Boolean.FALSE, "Something went wrong try again");
    }
}