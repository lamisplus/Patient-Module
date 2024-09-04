package org.lamisplus.modules.patient.installers;

import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import org.springframework.core.annotation.Order;

@Order(1)
@Installer(name = "schema-installer",
        description = "Installs the required database tables",
        version = 3)
public class PatientInstaller extends AcrossLiquibaseInstaller {
    public PatientInstaller() {
        super("classpath:installers/patient/schema/schema.xml");
    }
}
