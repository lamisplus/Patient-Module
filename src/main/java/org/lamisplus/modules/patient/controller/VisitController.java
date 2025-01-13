package org.lamisplus.modules.patient.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.patient.domain.dto.*;
import org.lamisplus.modules.patient.domain.entity.Visit;
import org.lamisplus.modules.patient.service.VisitService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/patient/visit")
public class VisitController {
    private final VisitService visitService;

    public static final String PATIENT_CHECK_PROGRESS_TOPIC = "/topic/checking-in-out-process";
    private final SimpMessageSendingOperations messagingTemplate;

    @PostMapping
    public ResponseEntity<Visit> createVisit(@RequestBody VisitRequest visitDto) {
        return ResponseEntity.ok (visitService.createVisit (visitDto, null));
    }

    @GetMapping
    public ResponseEntity<List<VisitDto>> getAllVisit() {
        return ResponseEntity.ok (visitService.getAllVisit ());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VisitDto> getVisit(@PathVariable("id") Long id) {
        return ResponseEntity.ok (visitService.getVisitById (id));
    }

    @GetMapping("/visit-by-patient/{personId}")
    public ResponseEntity<List<VisitDetailDto>> getPersonVisitDetail(@PathVariable("personId") Long personId) {
        return ResponseEntity.ok (visitService.getVisitWithEncounterDetails (personId));
    }

    @PutMapping("/checkout/{visitId}")
    public ResponseEntity<String> checkoutVisitByVisitId(@PathVariable("visitId") Long visitId) {
        visitService.checkOutVisitById (visitId);
        return ResponseEntity.accepted ().build ();
    }

    @PostMapping("/checkin")
    public ResponseEntity <VisitDto> checkInVisitByPersonId(@RequestBody CheckInDto checkInDto) {
        return ResponseEntity.ok (visitService.checkInPerson (checkInDto));
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<VisitDto> updateVisit(@PathVariable("id") Long id, @RequestBody VisitDto visitDto) {
        return ResponseEntity.ok (visitService.updateVisit (id, visitDto));
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<String> deleteVisit(@PathVariable("id") Long id) {
        visitService.archivedVisit (id);
        return ResponseEntity.accepted ().build ();
    }


    @SendTo(PATIENT_CHECK_PROGRESS_TOPIC)
    public String broadcastMessage(@Payload String message) {
        return message;
    }
}
