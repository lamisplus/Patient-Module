package org.lamisplus.modules.patient.domain.entity;

import lombok.*;
import org.springframework.data.domain.Persistable;

import javax.persistence.*;
import javax.validation.constraints.PastOrPresent;
import java.time.LocalDate;

@Entity
@Table(name = "patient_encounter")
@NoArgsConstructor
@Setter
@Getter
@AllArgsConstructor
@EqualsAndHashCode
@Builder
public class Encounter extends PatientAuditEntity implements Persistable<Long> {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @PastOrPresent
    @Column(name = "encounter_date", nullable = false)
    private LocalDate encounterDate;

    @ManyToOne(optional = false)
    @JoinColumn(name = "person_id", nullable = false)
    private Person person;

    @Column(name = "uuid", updatable = false, nullable = false)
    private String uuid;

    @ManyToOne(optional = false)
    @JoinColumn(name = "visit_id", nullable = false)
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
