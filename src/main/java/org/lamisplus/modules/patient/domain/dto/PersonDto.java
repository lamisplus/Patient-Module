package org.lamisplus.modules.patient.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.lamisplus.modules.patient.utility.LocalDateConverter;

import javax.annotation.Nullable;
import javax.persistence.Convert;
import javax.validation.constraints.Null;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@Builder
public class PersonDto implements Serializable {
    private final Long id;
    private final Boolean active;
    private final String surname;
    private final String firstName;
    private final String otherName;
    @Convert(converter = LocalDateConverter.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private final LocalDate dateOfBirth;
    private final Boolean deceased;
    private final LocalDateTime deceasedDateTime;
    private final Long maritalStatusId;
    @Nullable
    private final String ninNumber;
    @Nullable
    private final String emrId;
    @Nullable
    private final Long genderId;
    private final Long sexId;
    private final Long employmentStatusId;
    private final Long educationId;
    private final Long organizationId;
    private final List<ContactPointDto> contactPoint;
    private final List<AddressDto> address;
    private final List<IdentifierDto> identifier;
    private final List<ContactDto> contact;
    private final LocalDate dateOfRegistration;
    private Boolean isDateOfBirthEstimated;
    private final long facilityId;
    private final String uuid;
    private final String latitude;
    private final String longitude;
    private final String source;
//    private Long caseManagerId;
}

