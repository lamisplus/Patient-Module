import { MemoryRouter as Router, Switch, Route } from "react-router-dom";
import RegisterPatient from "./main/webapp/components/RegisterPatient";
import ViewPatient from "./main/webapp/components/ViewPatient";

import Dashboard from "./main/webapp/components/ClientDashboard";
import ClientDashboard from "./main/webapp/components/ClientDashboard";
import BiometricsDashboard from "./main/webapp/components/biometrics/";
import BiometricRecapture from "./main/webapp/components/BiometricRecapture";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./main/webapp/css/style.css";

import "react-dual-listbox/lib/react-dual-listbox.css";
import Components from "./main/webapp/components";
export default function App() {
  return (
    <Router>
      <div>
        <ToastContainer />

        <Switch>
          <Route path="/biometrics-recapture">
            <BiometricRecapture />
          </Route>
          <Route path="/patient-biometrics">
            <BiometricsDashboard />
          </Route>
          <Route path="/register-patient">
            <RegisterPatientPage />
          </Route>
          <Route path="/view-patient">
            <ViewPatient />
          </Route>
          <Route path="/patient-dashboard">
            <PatientDashboardPage />
          </Route>
          <Route path="/patient-vitals">
            <Dashboard />
          </Route>
          <Route path="/add-patient-vital">
            <Dashboard />
          </Route>
          <Route path="/">
            <Components />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function PatientDashboardPage() {
  return <ClientDashboard />;
}
function RegisterPatientPage() {
  return <RegisterPatient />;
}

/*
function PatientVitalsPage() {
  return <PatientVitals />
}
function AddPatientVitalsPage() {
  return <AddPatientVitals />
}
*/
