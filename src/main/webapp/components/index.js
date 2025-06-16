import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { FaUserPlus, FaFingerprint } from 'react-icons/fa';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import { token, url as baseUrl } from '../../../api';
import { Tab } from 'semantic-ui-react';
import RecallPatient from './RecallPatient';
import PatientBiometrics from './PatientBiometrics';
import Pims from './Pims';
import PatientList from './Home/PatientList';
import BiometricsCapture from './Home/Biometrics';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import CheckedInPatients from './Home/CheckedInPatients';
import MigrationDQA from './MigrationDQA';

const useStyles = makeStyles(theme => ({
  card: {
    margin: theme.spacing(20),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  cardBottom: {
    marginBottom: 20,
  },
  Select: {
    height: 45,
    width: 350,
  },
  button: {
    margin: theme.spacing(1),
  },

  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
    '& a': {
      textDecoration: 'none !important',
    },
  },
  input: {
    display: 'none',
  },
  error: {
    color: '#f85032',
    fontSize: '11px',
  },
  success: {
    color: '#4BB543 ',
    fontSize: '11px',
  },
}));
function Index(props) {
  const classes = useStyles();
  const [patients, setPatients] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState('');
  const [modal, setModal] = useState(false);
  const [patient, setPatient] = useState(false);
  const [patientDetails, setPatientDetails] = useState(null);
  const [pimsEnrollment, setPimsEnrollment] = useState([]);
  const [enablePPI, setEnablePPI] = useState(true);
  const [modalRecall, setModalRecall] = useState(false);
  const toggleRecall = () => {
    setPatientDetails(null);
    setPimsEnrollment([]);
    setModalRecall(!modalRecall);
  };

  const toggle = id => {
    const patient = patients.find(obj => obj.id == id);
    setPatient(patient);
    setModal(!modal);
  };
  useEffect(() => {
    userPermission();
  }, []);
  //Get list of Finger index
  const userPermission = () => {
    axios
      .get(`${baseUrl}account`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setPermissions(response.data.permissions);
      })
      .catch(error => {});
  };
  const enablePPIColumns = () => {
    setEnablePPI(!enablePPI);
  };
  const [defaultActiveIndex, setDefaultActiveIndex] = useState(1);

  const panes = [
    {
      menuItem: 'Clients',
      render: () => (
        <Tab.Pane>
          <PatientList permissions={permissions} />
        </Tab.Pane>
      ),
    },
    {
      menuItem: 'Checked-In',
      render: () => (
        <Tab.Pane>
          <CheckedInPatients
            defaultActiveIndex={defaultActiveIndex}
            setDefaultActiveIndex={setDefaultActiveIndex}
            permissions={permissions}
          />
        </Tab.Pane>
      ),
    },
    {
      menuItem: 'Patient Biometrics',
      render: () => (
        <Tab.Pane>
          <BiometricsCapture permissions={permissions} />
        </Tab.Pane>
      ),
    },
    // {
    //   menuItem: "PIMS",
    //   render: () => (
    //     <Tab.Pane>
    //       <Pims permissions={permissions} />
    //     </Tab.Pane>
    //   ),
    // },
    {
      menuItem: 'Migration DQA',
      render: () => (
        <Tab.Pane>
          <MigrationDQA permissions={permissions} />
        </Tab.Pane>
      ),
    },
  ];

  return (
    <>
      <div className={classes.root}>
        <ToastContainer autoClose={3000} hideProgressBar />
        {permissions.length > 0 && (
          <Card>
            <CardBody>
              <div className="row mb-12 col-md-12">
                <div className="mb-6 col-md-6">
                  <Breadcrumbs aria-label="breadcrumb">
                    <Typography style={{ color: '#992E62' }}>
                      Patient
                    </Typography>
                    <Typography style={{ color: '#014d88' }}>Home</Typography>
                  </Breadcrumbs>
                </div>
                <div className="mb-6 col-md-6">
                  {permissions.includes('view_patient') ||
                  permissions.includes('all_permission') ? (
                    <Link to={'register-patient'}>
                      <Button
                        variant="contained"
                        color="primary"
                        className=" float-right mr-1"
                        startIcon={<FaUserPlus size="25" />}
                        style={{ backgroundColor: '#014d88' }}
                        id="new-patient"
                      >
                        <span
                          style={{
                            textTransform: 'capitalize',
                            fontWeight: 'bolder',
                          }}
                        >
                          New Client
                        </span>
                      </Button>
                    </Link>
                  ) : (
                    ''
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    className=" float-right mr-1"
                    startIcon={<FaFingerprint size="25" />}
                    style={{ backgroundColor: '#014d88' }}
                    onClick={toggleRecall}
                  >
                    <span
                      style={{
                        textTransform: 'capitalize',
                        fontWeight: 'bolder',
                      }}
                    >
                      Patient Recall
                    </span>
                  </Button>
                </div>
              </div>

              <Tab activeIndex={defaultActiveIndex} panes={panes} />
            </CardBody>
          </Card>
        )}
      </div>
      <RecallPatient
        modal={modalRecall}
        toggle={toggleRecall}
        patientDetails={patientDetails}
        setPatientDetails={setPatientDetails}
        pimsEnrollment={pimsEnrollment}
        setPimsEnrollment={setPimsEnrollment}
      />
    </>
  );
}

export default Index;
