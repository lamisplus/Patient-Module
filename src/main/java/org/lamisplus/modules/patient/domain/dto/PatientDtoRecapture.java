package org.lamisplus.modules.patient.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientDtoRecapture {

        private String hospitalNumber;
        private String surname;
        private String otherName;
        private String firstName;
        private String uniqueId;
        private String sex;
        private String personUuid;
        private  Boolean biometricStatus;
        private Boolean isEnrolled;
        private Boolean isDobEstimated;
        private Long id;
        private Integer age;
        private Long facilityId;
        private LocalDate dateOfBirth;
        private LocalDate dateOfRegistration;
        private String mobileExtra;
}
