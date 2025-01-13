package org.lamisplus.modules.patient.domain.entity;


import lombok.*;
import org.springframework.data.domain.Persistable;

import javax.persistence.*;
import javax.validation.constraints.PastOrPresent;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "patient_visit")
@NoArgsConstructor
@Setter
@Getter
@AllArgsConstructor
@EqualsAndHashCode
@Builder
public class Visit extends PatientAuditEntity implements Persistable<Long>, Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "person_uuid", nullable = false, referencedColumnName = "uuid")
    private Person person;
    @Column(name = "visit_start_date", nullable = false)
    private LocalDateTime visitStartDate;
    @Column(name = "visit_end_date")
    private LocalDateTime visitEndDate;
    @Column(name = "uuid", nullable = false, unique = true, updatable = false)
    private String uuid = UUID.randomUUID().toString();
    private Integer archived = 0;
    @Column(name = "service_code")
    private String serviceCode;

    @Override
    public boolean isNew() {
        return id == null;
    }
}
