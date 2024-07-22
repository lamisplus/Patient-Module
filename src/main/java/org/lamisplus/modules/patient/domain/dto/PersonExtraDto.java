package org.lamisplus.modules.patient.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PersonExtraDto {
    private Number id;
    private String personUuid;
    private Boolean deceased;
    private LocalDateTime deceasedDateTime;
    private String sex;
    private LocalDate dateOfBirth;
    private LocalDate dateOfRegistration;
    private Integer archived;
    private String ninNumber;
    private String emrId;
    private String firstName;
    private String surname;
    private String otherName;
    private String hospitalNumber;
    private String labTestName;
    private String groupName;
    private String resultReported;
    private LocalDateTime lastVlDate;
    private LocalDate maxDsdDate;
    private LocalDate lastDrugPickupDate;
    private LocalDate nextAppointment;

}
