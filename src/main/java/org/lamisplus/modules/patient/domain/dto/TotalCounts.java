package org.lamisplus.modules.patient.domain.dto;

public interface TotalCounts {


    Integer getPatientCount();
    Integer getPatientWithBiometricCount();
    Integer getPatientWithNoBiometricCount();
    Integer getFemalePatient();
    Integer getMalePatient();
}
