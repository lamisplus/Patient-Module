package org.lamisplus.modules.patient.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.lamisplus.modules.patient.utility.LocalDateConverter;

import javax.persistence.Convert;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class PersonResponseDto {
    private Long id;
    private Long visitId;
    private Boolean active;
    private String surname;
    private String firstName;
    private String otherName;
    private String sex;
    private Object gender;
    private Boolean deceased;
    private Object maritalStatus;
    private Object employmentStatus;
    private Object education;
    private Object organization;
    private boolean biometricStatus;
    @Convert(converter = LocalDateConverter.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;
    private LocalDateTime deceasedDateTime;
    private Object identifier;
    private Object contact;
    private Object contactPoint;
    private Object address;
    private LocalDate dateOfRegistration;
    private Boolean IsDateOfBirthEstimated;

    private String ninNumber;
    private String emrId;
    private Long facilityId;
    private Integer archived;
    private String uuid;
    private String dynamicHivStatus;
    private String latitude;
    private String longitude;
    private String source;



//    private Long caseManagerId;
}
