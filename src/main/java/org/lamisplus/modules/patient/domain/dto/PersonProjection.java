package org.lamisplus.modules.patient.domain.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface PersonProjection {
    Long getId();
    String getCreateBy();
    LocalDate getDateOfRegistration();
    String getFirstName();
    String getSurname();
    String getOtherName();
    String getFullname();
    String getHospitalNumber();
    Integer getAge();
    String getSex();
    LocalDate getDateOfBirth();
    Boolean getIsDobEstimated();
    Long getFacilityId();
    String getPersonUuid();
    Boolean getIsEnrolled();
    Long getTargetGroupId();
    Long getEnrollmentId();
    String getUniqueId();
    String getCurrentStatus();
    Boolean getCommenced();
    Boolean getBiometricStatus();
    Long getVisitId();
    LocalDateTime getCheckInDate();
    Boolean getClinicalEvaluation();
    Boolean getMentalHealth();
    Boolean getIsOnAnc();
    Boolean getIsOnPmtct();
    Boolean getIsOnPrep();
    Boolean getIsOnHts();
    Boolean getIsOnHtsRiskStratification();
    String getHivStatus();
    String getStaticHivStatus();

    // New fields added
    String getPhoneNumber();
    String getAddress();
}