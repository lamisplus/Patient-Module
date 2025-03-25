package org.lamisplus.modules.patient.domain.dto;

import java.time.LocalDate;

public interface PersonProjection {
    Long getId();
    String getCreateBy();
    LocalDate getDateOfRegistration();
    String getFirstName();
    String getSurname();
    String getOtherName();
    String getfullname();
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
    Boolean getClinicalEvaluation();
    Boolean getMentalHealth();
    Boolean getIsOnAnc();
    Boolean getIsOnPmtct();
    Boolean getIsOnPrep();
    Boolean getIsOnHts();
    Boolean getIsOnHtsRiskStratification();
    String getHivStatus();
    String getStaticHivStatus();
}