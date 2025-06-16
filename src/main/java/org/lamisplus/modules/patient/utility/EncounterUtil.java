package org.lamisplus.modules.patient.utility;

import org.lamisplus.modules.patient.domain.entity.Encounter;
import org.lamisplus.modules.patient.domain.entity.Visit;
import org.lamisplus.modules.patient.repository.EncounterRepository;
import org.lamisplus.modules.patient.repository.VisitRepository;

import java.time.LocalDateTime;
import java.util.List;

public class EncounterUtil {

    public static void getPendingEncounterByStatus(EncounterRepository encounterRepository, VisitRepository visitRepository) {
        System.out.println("Fetching pending encounters...");
        List<Encounter> pendingEncounters = encounterRepository.findEncounterByStatus("PENDING");
        System.out.println("Number of pending encounters: " + pendingEncounters.size());

        pendingEncounters.forEach(encounter -> {
            System.out.println("Processing encounter with UUID: " + encounter.getUuid());
            idleCheckout(encounter, visitRepository, encounterRepository);
        });
    }

    public static void idleCheckout(Encounter encounter, VisitRepository visitRepository, EncounterRepository encounterRepository) {
        System.out.println("Got into Idle Checkout *******************");
        LocalDateTime encounterDate = encounter.getEncounterDate();
        LocalDateTime expiredDate = encounterDate.plusDays(1);
        System.out.println("Expired Date: " + expiredDate + " Encounter Date: " + encounterDate);

        if (LocalDateTime.now().isAfter(expiredDate)) {
            System.out.println("Checking out encounter: " + encounter.getVisit().getUuid());

            // Update the status of the encounter
            encounter.setStatus("CHECKED-OUT");
            encounter.setLastModifiedDate(LocalDateTime.now());
            encounter.setLastModifiedBy("auto-checkout");
            Visit visit = encounter.getVisit();
            visit.setVisitEndDate(LocalDateTime.now());
            visitRepository.save(visit);
            try {
                encounterRepository.save(encounter);
                System.out.println("Successfully updated encounter with UUID: " + encounter.getUuid());
            } catch (Exception e) {
                System.err.println("Error updating encounter: " + e.getMessage());
            }
        } else {
            System.out.println("Encounter with UUID: " + encounter.getUuid() + " is not expired yet.");
        }
    }
}

