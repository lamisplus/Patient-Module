package org.lamisplus.modules.patient.domain.dto;

import com.fasterxml.jackson.databind.JsonNode;
import org.lamisplus.modules.patient.domain.entity.Person;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
public interface PersonDtoProjection extends Serializable {
    String getHospitalNumber();
    String getFirstName();
    String getSurname();
    String getOtherName();
    String getGender();
    String getUniqueId();

    String getBiometricStatus();
    String getEnrollmentStatus();
    String getPersonUuid();
    String getCreateBy();
    Boolean getIsEnrolled();
    Boolean getCommenced();
    Boolean getIsDobEstimated();
    Integer getAge();
    Long getId();
    Long getFacility();
    Long getTargetGroupId();
    Long getEnrollmentId();
    LocalDate getDateOfBirth();
    LocalDate getDateOfRegistration();

    String getMobileExtra();

}
