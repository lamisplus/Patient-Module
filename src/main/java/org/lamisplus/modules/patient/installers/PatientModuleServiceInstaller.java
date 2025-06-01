package org.lamisplus.modules.patient.installers;

import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import org.springframework.core.annotation.Order;

@Order(5)
@Installer(name = "patient-module-service-installer",
        description = "insert the required patient service",
        version = 5)
public class PatientModuleServiceInstaller extends AcrossLiquibaseInstaller {
    public PatientModuleServiceInstaller() {
        super ("classpath:installers/patient/schema/insert-service.xml");
    }
}
