package org.lamisplus.modules.patient.domain.entity;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.Where;
import org.springframework.data.domain.Persistable;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "patient_person")
@Data
@NoArgsConstructor
@Where(clause = "archived = 0")
public class Person extends PatientAuditEntity implements Persistable<Long>  , Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;
    @Column(name = "active", nullable = false)
    private Boolean active = false;
    @Type(type = "jsonb-node")
    @Column(columnDefinition = "jsonb")
    private JsonNode contactPoint;
    @Type(type = "jsonb-node")
    @Column(columnDefinition = "jsonb")
    private JsonNode address;
    @Type(type = "jsonb-node")
    @Column(columnDefinition = "jsonb")
    private JsonNode gender;
    @Type(type = "jsonb-node")
    @Column(columnDefinition = "jsonb")
    private JsonNode identifier;
    @Column(name = "deceased")
    private Boolean deceased;
    @Column(name = "deceased_date_time")
    private LocalDateTime deceasedDateTime;
    @Type(type = "jsonb-node")
    @Column(columnDefinition = "jsonb")
    private JsonNode  maritalStatus;
    @Type(type = "jsonb-node")
    @Column(columnDefinition = "jsonb")
    private JsonNode employmentStatus;
    @Type(type = "jsonb-node")
    @Column(columnDefinition = "jsonb")
    private JsonNode education;
    @Column(name = "sex", nullable = false)
    private  String sex;
    @Type(type = "jsonb-node")
    @Column(columnDefinition = "jsonb")
    private JsonNode organization;
    @Type(type = "jsonb-node")
    @Column(columnDefinition = "jsonb")
    private JsonNode contact;
    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "date_of_registration", nullable = false)
    private LocalDate dateOfRegistration;
    @Basic
    @Column(name = "archived")
    private Integer archived;

    @Column(name = "nin_number")
    private  String ninNumber;

    @Column(name = "emr_id")
    private  String emrId;

    @Column(name = "uuid", nullable = false, unique = true, updatable = false)
    private String uuid;
    @Column(name = "first_name")
    private String firstName;
    @Column(name = "surname")
    private String surname;
    @Column(name = "other_name")
    private String otherName;
    @Column(name = "hospital_number")
    private String hospitalNumber;
    @Column(name = "is_date_of_birth_estimated")
    private Boolean isDateOfBirthEstimated;
    @Column(name = "full_name")
    private String fullName;
    @Column(name = "reason")
    private String reason;

//    @Transient
////    @Type(type = "jsonb-node")
////    @Column(columnDefinition = "jsonb", name =
//    @Type(type = "jsonb-node")
//    @Column(columnDefinition = "jsonb")
//    private JsonNode mobileExtra;

    @Column(name = "latitude")
    private String latitude;
    @Column(name = "longitude")
    private String longitude;
    @Column(name = "source")
    private String source;

//    @Column(updatable = false, insertable = false)
//    private String mobileExtra;

//    @Column(name = "case_manager_id")
//    private Long caseManagerId;



    @Override
    public boolean isNew() {
        return id == null;
    }
}
