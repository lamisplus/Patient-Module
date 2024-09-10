package org.lamisplus.modules.patient.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.domain.dto.PageDTO;
import org.lamisplus.modules.patient.domain.dto.*;
import org.lamisplus.modules.patient.domain.entity.PatientCheckPostService;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PatientCheckPostServiceRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.lamisplus.modules.patient.service.ValidationService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/patient")
public class PatientController {

    private final PersonService personService;

    private final ValidationService validationService;
    private final PatientCheckPostServiceRepository patientCheckPostServiceRepository;

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PersonResponseDto> createPatient(@RequestBody PersonDto patient) {
        return ResponseEntity.ok(personService.createPerson(patient));
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PersonMetaDataDto> getAllPatients(
            @RequestParam(defaultValue = "*") String searchParam,
            @RequestParam(defaultValue = "0") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        PersonMetaDataDto personMetaDataDto = personService.findPersonBySearchParam(searchParam, pageNo, pageSize);
        return new ResponseEntity<>(personMetaDataDto, new HttpHeaders(), HttpStatus.OK);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<PersonResponseDto> getPatient(@PathVariable("id") Long id) {
        return ResponseEntity.ok(personService.getPersonById(id));
    }

    @PutMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PersonResponseDto> updatePatient(@PathVariable("id") Long id, @RequestBody PersonDto patient) {
        return ResponseEntity.ok(personService.updatePerson(id, patient));
    }

    @DeleteMapping(value = "/{id}/{reason}",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> deletePerson(@PathVariable("id") Long id, @PathVariable("reason") String reason) {
        personService.deletePersonById(id, reason);
        return ResponseEntity.accepted().build();
    }

    @DeleteMapping(value = "delete/{id}",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> deletePerson2(@PathVariable("id") Long id) {
        personService.deletePersonById2(id);
        return ResponseEntity.accepted().build();
    }

    @GetMapping(value = "/post-service")
    public ResponseEntity<List<PatientCheckPostService>> getPatientService() {
        return ResponseEntity.ok(patientCheckPostServiceRepository.findAll());
    }

    @GetMapping(value = "/checked-in-by-service/{serviceCode}")
    public ResponseEntity<List<PersonResponseDto>> getCheckedInPatientByService(@PathVariable("serviceCode") String serviceCode) {
        return ResponseEntity.ok(personService.getCheckedInPersonsByServiceCodeAndVisitId(serviceCode));
    }

    @PostMapping("/exist/hospital-number")
    public ResponseEntity<Boolean> hospitalNumberExists(@RequestBody String hospitalNumber) throws InterruptedException, ExecutionException {
        CompletableFuture<Boolean> hospitalNumberExist = validationService.hospitalNumberExist(hospitalNumber);
        return ResponseEntity.ok(hospitalNumberExist.get());
    }


    @PostMapping("/exist/nin-number/{nin}")
    public boolean isNinNumberExisting(@PathVariable("nin") String nin) {
        return personService.isNINExisting(nin);
    }

    @GetMapping(value = "get-person-by-nin/{nin}")
    public ResponseEntity<PersonResponseDto> getPatientByNin(@PathVariable("nin") String nin) {
        return ResponseEntity.ok(personService.getPersonByNin(nin));
    }


//    @GetMapping(value = "/get-all-patient-pageable", produces = MediaType.APPLICATION_JSON_VALUE)
//    public ResponseEntity<List<PersonResponseDto>> getAllPatientPageable(
//            @RequestParam(defaultValue = "0") Integer pageNo,
//            @RequestParam(defaultValue = "10") Integer pageSize) {
//        List<PersonResponseDto> list = personService.getAllPersonPageable(pageNo, pageSize);
//        return new ResponseEntity<> (list, new HttpHeaders(), HttpStatus.OK);
//    }

//    @GetMapping(value = "/get-all-patient-pageable", produces = MediaType.APPLICATION_JSON_VALUE)
//    public ResponseEntity<PersonMetaDataDto> getAllPatientPageable(
//            @RequestParam(defaultValue = "0") Integer pageNo,
//            @RequestParam(defaultValue = "10") Integer pageSize) {
//        List<PersonResponseDto> list = personService.getAllPersonPageable(pageNo, pageSize);
//
//        int recordSize = personService.getTotalRecords();
//        double totalPage = (double) recordSize/pageSize;
//        int totalPage2 = (int) Math.ceil(totalPage);
//        System.out.println("I was called recordSize using getTotalRecords "+recordSize );
//        PersonMetaDataDto personMetaDataDto = new PersonMetaDataDto();
//        personMetaDataDto.setTotalRecords(recordSize);
//        personMetaDataDto.setPageSize(pageSize);
//        personMetaDataDto.setTotalPages(totalPage2);
//        personMetaDataDto.setCurrentPage(pageNo);
//        personMetaDataDto.setRecords(list);
//
//        return new ResponseEntity<> (personMetaDataDto, new HttpHeaders(), HttpStatus.OK);
//    }

    @GetMapping(value = "/get-all-patient-pageable", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PersonMetaDataDto> getAllPatientsPageable(
            @RequestParam(defaultValue = "*") String searchParam,
            @RequestParam(defaultValue = "0") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        PersonMetaDataDto personMetaDataDto = personService.findPersonBySearchParam(searchParam, pageNo, pageSize);
        return new ResponseEntity<>(personMetaDataDto, new HttpHeaders(), HttpStatus.OK);

    }

    @GetMapping(value = "/checked-in")
    public ResponseEntity<PersonMetaDataDto> listOfCheckedinPersons(
            @RequestParam(defaultValue = "*") String searchParam,
            @RequestParam(defaultValue = "0") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        PersonMetaDataDto personMetaDataDto = personService.getAllActiveVisit(searchParam, pageNo, pageSize);
        return new ResponseEntity<>(personMetaDataDto, new HttpHeaders(), HttpStatus.OK);
    }

    @GetMapping(value = "/get-duplicate-hospital_numbers")
    public ResponseEntity<PersonMetaDataDto> getDuplicateHospitalNumbers(
            @RequestParam(defaultValue = "*") String searchParam,
            @RequestParam(defaultValue = "0") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        PersonMetaDataDto personMetaDataDto = personService.getDuplicateHospitalNumbers(searchParam, pageNo, pageSize);
        return new ResponseEntity<>(personMetaDataDto, new HttpHeaders(), HttpStatus.OK);
    }

    @GetMapping(value = "/get-patient-by-search-param", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PersonMetaDataDto> getPatientsBySearchParam(
            @RequestParam(defaultValue = "*") String searchParam,
            @RequestParam(defaultValue = "0") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        PersonMetaDataDto personMetaDataDto = personService.findPersonBySearchParam(searchParam, pageNo, pageSize);
        return new ResponseEntity<>(personMetaDataDto, new HttpHeaders(), HttpStatus.OK);
    }

    @GetMapping(value = "/getall-patients-without-biometric")
    public ResponseEntity<PersonMetaDataDto> getAllPatientWithoutBiomentic(
            @RequestParam(defaultValue = "*") String searchParam,
            @RequestParam(defaultValue = "0") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize) {

        PersonMetaDataDto personMetaDataDto = personService.getAllPatientWithIncompleteBiomentic(searchParam, pageNo, pageSize);
        return new ResponseEntity<>(personMetaDataDto, new HttpHeaders(), HttpStatus.OK);
    }

    @GetMapping(value = "/getall-patients-with-biometric")
    public ResponseEntity<PersonMetaDataDto> getAllPatientWithBiomentic(
            @RequestParam(defaultValue = "*") String searchParam,
            @RequestParam(defaultValue = "0") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize) {

        PersonMetaDataDto personMetaDataDto = personService.getAllPatientWithBiomentic(searchParam, pageNo, pageSize);
        return new ResponseEntity<>(personMetaDataDto, new HttpHeaders(), HttpStatus.OK);
    }

    @GetMapping(value = "/getall-patients-with-no-biometric")
    public ResponseEntity<PersonMetaDataDto> getAllPatientWithNoBiomentic(
            @RequestParam(defaultValue = "*") String searchParam,
            @RequestParam(defaultValue = "0") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize) {

        PersonMetaDataDto personMetaDataDto = personService.getAllPatientWithoutBiomentic(searchParam, pageNo, pageSize);
        return new ResponseEntity<>(personMetaDataDto, new HttpHeaders(), HttpStatus.OK);
    }

    @GetMapping(value = "/getall-patients-with-no-recapture")
    public ResponseEntity<PersonMetaDataDto> getAllPatientWithNoRecapture(
            @RequestParam(defaultValue = "*") String searchParam,
            @RequestParam(defaultValue = "0") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize) {

        PersonMetaDataDto personMetaDataDto = personService.getAllPatientWithoutRecapture(searchParam, pageNo, pageSize);
        return new ResponseEntity<>(personMetaDataDto, new HttpHeaders(), HttpStatus.OK);
    }

    @PostMapping(value = "/getall-clients-by-lga")
    public ResponseEntity<List<PatientDtoRecapture>> getPatientsByLgaRecaptures (@RequestBody List<String> lgaIds) {
        List<PatientDtoRecapture> patientDtoRecapture = personService.getPatientsByLgaBiometricRecapture(lgaIds);
        return new ResponseEntity<>(patientDtoRecapture, new HttpHeaders(), HttpStatus.OK);
    }

    @PostMapping(value = "/getall-patients-by-lga")
    public ResponseEntity<PersonMetaDataDto> getAllPatientsByLga(
            @RequestBody List<String> lgaIds,
            @RequestParam(defaultValue = "0") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize) {

        PersonMetaDataDto personMetaDataDto = personService.getAllPatientByLga(lgaIds, pageNo, pageSize);
        return new ResponseEntity<>(personMetaDataDto, new HttpHeaders(), HttpStatus.OK);
    }

    @GetMapping(value = "/getall-patients-by-user")
    public ResponseEntity<List<PersonExtraDto>> getAllPatientsByUser(
            @RequestParam String userId) {
        List<PersonExtraDto> result;
        result = personService.getAllPatientByUser(userId);
        return new ResponseEntity<>(result, new HttpHeaders(), HttpStatus.OK);
    }



    @GetMapping(value = "/count-by-sex")
    public ResponseEntity<List<Map<String, Object>>> getCountRegistrationsBySex() {
        List<Map<String, Object>> result = personService.countRegistrationsBySex();
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
    @GetMapping(value = "/count-by-year-and-sex")
    public ResponseEntity<List<Map<String, Object>>> getCountRegistrationsByYearAndSex() {
        List<Map<String, Object>> result = personService.countRegistrationsByYearAndSex();
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

}
