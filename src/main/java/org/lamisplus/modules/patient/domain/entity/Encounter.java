package org.lamisplus.modules.patient.domain.entity;

import lombok.*;
import org.springframework.data.domain.Persistable;

import javax.persistence.*;
import javax.validation.constraints.PastOrPresent;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_encounter")
@NoArgsConstructor
@Setter
@Getter
@AllArgsConstructor
@EqualsAndHashCode
@Builder
public class Encounter extends PatientAuditEntity implements Persistable<Long>, Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;


    @Column(name = "encounter_date", nullable = false)
    private LocalDateTime encounterDate;

    @ManyToOne(optional = false)
    @JoinColumn(name = "person_uuid", nullable = false, referencedColumnName = "uuid")
    private Person person;

    @Column(name = "uuid", nullable = false, unique = true, updatable = false)
    private String uuid;

    @ManyToOne(optional = false)
    @JoinColumn(name = "visit_id", nullable = false, referencedColumnName = "uuid")
    private Visit visit;

    @Column(name = "service_code", nullable = false)
    private String serviceCode;

    @Column(name = "status", nullable = false)
    private String status;

    private Integer archived;

    @Override
    public boolean isNew() {
        return id == null;
    }
}
