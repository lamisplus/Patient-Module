import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Label,
  Col,
  FormGroup,
  Input,
  Badge,
} from 'reactstrap';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import 'react-toastify/dist/ReactToastify.css';
import 'react-widgets/dist/css/react-widgets.css';
import { FaEye, FaUserPlus } from 'react-icons/fa';
import { usePermissions } from '../hooks/usePermissions';
import { useUserAccount } from '../hooks/useUserAccount';
import SaveIcon from '@material-ui/icons/Save';
import MatButton from '@material-ui/core/Button';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import { Button2, Icon, List } from 'semantic-ui-react';
import { ToastContainer, toast } from 'react-toastify';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import {
  getApiErrorMessage,
  getPimsErrorAlert,
  getPimsResponseAlert,
  PIMS_NOT_CONFIGURED_TITLE,
} from '../utils/apiErrors';

import axios from 'axios';
import { token, url as baseUrl } from '../../../api';

import CircularProgress from '@mui/material/CircularProgress';

import { useHistory } from 'react-router-dom';

import LinearProgress from '@mui/material/LinearProgress';

import _ from 'lodash';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    '& .dropdown-toggle::after, .dropleft .dropdown-toggle::before, .dropright .dropdown-toggle::before, .dropup .dropdown-toggle::after':
      {
        fontFamily: 'FontAwesome',
        border: '0',
        verticalAlign: 'middle',
        marginLeft: '.25em',
        lineHeight: '1',
      },
    '& .dropdown-menu .dropdown-item': {
      fontSize: '14px',
      color: '#014d88',
      padding: '0.3rem 1.5rem',
      fontWeight: 'bold',
    },
    '& .mt-4': {
      marginTop: '28px !important',
    },
    '& .form-control': {
      color: '#992E62',
    },
    '& .form-control:focus': {
      color: '#014d88',
    },
    '& .sharp ': {
      'min-width': '35px',
      padding: '5px',
      height: '35px',
      'min-height': '35px',
    },
  },
  card: {
    margin: theme.spacing(20),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
}));

const RecallPatient = props => {
  const classes = useStyles();
  let history = useHistory();

  const [biometricDevices, setbiometricDevices] = useState([]);
  const [objValues, setObjValues] = useState({
    biometricType: 'FINGERPRINT',
    patientId: '',
    templateType: '',
    device: 'SECUGEN',
    index: '',
    age: '',
  });
  const [fingerType, setFingerType] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const { hasPermission, hasAnyPermission } = usePermissions();
  const { facilities } = useUserAccount();
  const [tryAgain, setTryAgain] = useState(false);
  const [successPims, setSuccessPims] = useState(false);
  const [errors, setErrors] = useState({});

  const [fingerIndex, setFingerIndex] = useState('');

  const [isNewStatus, setIsNewStatus] = useState(true);
  const [checkedVal, setCheckedVal] = useState(false);
  const [statusAlert, setStatusAlert] = useState(null);

  const getPersonBiometrics = async () => {
    const fingersCodeset = await axios.get(
      `${baseUrl}application-codesets/v2/BIOMETRIC_CAPTURE_FINGERS`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    let biometricItems = _.map(fingersCodeset.data, item => {
      return _.extend({}, item, {
        captured: false,
      });
    });

    setFingerType(biometricItems);
  };

  useEffect(() => {
    getPersonBiometrics();
    TemplateType();
  }, []);

  useEffect(() => {
    if (!props.modal) {
      setStatusAlert(null);
    }
  }, [props.modal]);

  const TemplateType = () => {
    axios
      .get(`${baseUrl}modules/check?moduleName=biometric`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        if (response.data === true) {
          axios
            .get(`${baseUrl}biometrics/devices?active=true`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then(response => {
              //console.log(response.data.find((x) => x.active === true));
              setDevices(response.data.find(x => x.active === true));
              setbiometricDevices(response.data);
            })
            .catch(error => {
              console.error(error);
            });
        }
      })
      .catch(error => {
        //console.log(error);
      });
  };

  const handleInputChange = e => {
    if (e.target.value === 'Left Index Finger') {
      setFingerIndex(3);
    } else if (e.target.value === 'Left Little Finger') {
      setFingerIndex(0);
    } else if (e.target.value === 'Left Middle Finger') {
      setFingerIndex(2);
    } else if (e.target.value === 'Left Ring Finger') {
      setFingerIndex(1);
    } else if (e.target.value === 'Left Thumb') {
      setFingerIndex(4);
    } else if (e.target.value === 'Right Index Finger') {
      setFingerIndex(6);
    } else if (e.target.value === 'Right Little Finger') {
      setFingerIndex(9);
    } else if (e.target.value === 'Right Middle Finger') {
      setFingerIndex(7);
    } else if (e.target.value === 'Right Ring Finger') {
      setFingerIndex(8);
    } else if (e.target.value === 'Right Thumb') {
      setFingerIndex(5);
    }

    setObjValues({
      ...objValues,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    let temp = { ...errors };
    //temp.templateType = objValues.templateType ? "" : "This field is required";
    setErrors({
      ...temp,
    });
    return Object.values(temp).every(x => x === '');
  };

  const getPatient = patientId => {
    axios
      .get(`${baseUrl}patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        props.setPatientDetails(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const facilityId =
    facilities && facilities.length > 0
      ? facilities[0].organisationUnitId
      : null;

  const noFacilityAlert = {
    severity: 'error',
    title: PIMS_NOT_CONFIGURED_TITLE,
    message:
      'No facility is linked to your user account, so PIMS verification cannot be carried out. Please contact your administrator.',
  };

  const readyForPims = () => {
    if (!facilityId) {
      setStatusAlert(noFacilityAlert);
      return false;
    }
    if (!objValues.templateType) {
      setStatusAlert({
        severity: 'warning',
        title: 'Select a finger first',
        message:
          'PIMS needs to know which finger is being scanned. Please choose a finger from the list before scanning.',
      });
      return false;
    }
    return true;
  };

  const verifyWithPims = capturedFinger => {
    setSuccessPims(true);
    props.setPimsEnrollment([]);
    const pimsData = {
      facilityId: facilityId,
      finger: capturedFinger.template,
      index: fingerIndex,
    };
    axios
      .post(`${baseUrl}pims/verify/${facilityId}`, pimsData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setSuccessPims(false);
        if (response.data && response.data.code === 5) {
          props.setPimsEnrollment(response.data.enrollments || []);
          toast.info(`PIMS MESSAGE: ${response.data.message}`, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 10000,
          });
          return;
        }
        const alert = getPimsResponseAlert(response.data);
        setStatusAlert(alert);
        toast.warning(alert.message, {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 10000,
        });
      })
      .catch(error => {
        setSuccessPims(false);
        const alert = getPimsErrorAlert(error);
        setStatusAlert(alert);
        toast.error(alert.message, {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 10000,
        });
        console.error(error);
      });
  };

  const captureFinger = e => {
    e.preventDefault();
    if (validate()) {
      setStatusAlert(null);
      if (!devices || !devices.url) {
        setStatusAlert({
          severity: 'error',
          title: 'No fingerprint scanner available',
          message:
            'No active fingerprint scanner is configured on this workstation. Please connect a scanner or contact your administrator.',
        });
        return;
      }
      if (checkedVal && !readyForPims()) {
        return;
      }
      setLoading(true);
      props.setPatientDetails(null);
      axios
        .post(
          `${devices.url}?reader=${
            devices.name
          }&isNew=${'false'}&recapture=${'false'}&identify=true&identificationType=${
            !checkedVal ? 'LOCAL' : 'PIMS'
          }&personUuid=${props.personUuid ? props.personUuid : ''}`,
          objValues,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then(response => {
          setLoading(false);

          if (response.data.type === 'ERROR') {
            setLoading(false);
            setTryAgain(true);
            toast.error(response.data.message.ERROR);
            setStatusAlert({
              severity: 'error',
              title: 'Fingerprint scan failed',
              message: response.data.message.ERROR,
            });
            setIsNewStatus(false);
          } else if (response.data.type === 'WARNING') {
            const templateType = response.data.templateType;
            toast.warning(response.data.message.WARNING);
            setStatusAlert({
              severity: 'warning',
              title: 'Fingerprint scan warning',
              message: response.data.message.WARNING,
            });
          } else if (response.data.type === 'SUCCESS') {
            let capturedFinger = response.data;

            if (checkedVal === true) {
              verifyWithPims(capturedFinger);
            } else {
              const identification = capturedFinger.clientIdentificationDTO;
              if (!identification) {
                setStatusAlert({
                  severity: 'warning',
                  title: 'No client record returned',
                  message:
                    'The fingerprint was scanned but the server did not return any client record. Please rescan or try another finger.',
                });
              } else if (
                identification.messageType === 'SUCCESS_NO_MATCH_FOUND'
              ) {
                toast.info(identification.message, {
                  position: toast.POSITION.TOP_CENTER,
                  autoClose: 10000,
                });
                setStatusAlert({
                  severity: 'info',
                  title: 'No matching client found',
                  message: identification.message,
                });
              } else {
                getPatient(identification.id);

                toast.success(identification.message, {
                  position: toast.POSITION.TOP_CENTER,
                  autoClose: 10000,
                });
              }
            }
          } else {
            setLoading(false);
            setTryAgain(true);
            toast.error('Something went wrong capturing biometrics...', {
              position: toast.POSITION.TOP_CENTER,
            });
            setStatusAlert({
              severity: 'error',
              title: 'Fingerprint scan failed',
              message:
                'Something went wrong capturing biometrics. Please rescan the finger and try again.',
            });
          }
        })
        .catch(error => {
          setLoading(false);
          const message = getApiErrorMessage(
            error,
            'Unable to scan the fingerprint. Please confirm the scanner is connected and try again.'
          );
          setStatusAlert({
            severity: 'error',
            title: 'Fingerprint scan failed',
            message: message,
          });
          toast.error(message, { position: toast.POSITION.TOP_CENTER });
          console.error(error);
        });
    }
  };

  const handleChange = e => {
    const checked = e.target.checked;
    setCheckedVal(checked);
    setStatusAlert(checked && !facilityId ? noFacilityAlert : null);
  };

  return (
    <>
      <Modal
        isOpen={props.modal}
        toggle={props.toggle}
        style={{ display: 'flex', maxWidth: '100%', maxHeight: '100%' }}
        fullscreen="true"
      >
        <ModalHeader toggle={props.toggle}>
          Recall patient using biometrics
        </ModalHeader>
        {/* <ModalBody></ModalBody> */}
        <ModalFooter>
          <div className={classes.root}>
            <div>
              <div
                style={{
                  flex: '10',
                  padding: '5px',
                  marginLeft: '5px',
                  border: '1px solid rgba(99, 99, 99, 0.2)',
                  boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px',
                }}
              >
                <Row>
                  <ToastContainer />

                  <Col md={12}>
                    <Alert severity="info">
                      <b style={{ textAlign: 'center', fontSize: '16px' }}>
                        Place the client's finger on the scanner and click the
                        scan finger button!
                      </b>
                    </Alert>
                    <br />
                  </Col>
                  {statusAlert ? (
                    <Col md={12}>
                      <Alert
                        severity={statusAlert.severity}
                        onClose={() => setStatusAlert(null)}
                      >
                        <AlertTitle>{statusAlert.title}</AlertTitle>
                        {statusAlert.message}
                      </Alert>
                      <br />
                    </Col>
                  ) : (
                    ''
                  )}
                  {/* <Col md={1}>
                    <FormGroup>
                      <Label
                        style={{
                          color: "#014d88",
                          fontWeight: "bold",
                          fontSize: "14px",
                        }}
                      >
                        Facility*
                      </Label>
                      <select
                        className="form-control"
                        name="organisationUnitId"
                        id="organisationUnitId"
                        value={objValues.organisationUnitId}
                        onChange={handleInputChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                        hidden
                      >
                        {facilities.map((value) => (
                          <option
                            key={value.id}
                            value={value.organisationUnitId}
                          >
                            {value.organisationUnitName}
                          </option>
                        ))}
                      </select>
                    </FormGroup>
                  </Col> */}
                  <Col md={3}>
                    <FormGroup>
                      <Label
                        for="device"
                        style={{
                          color: '#014d88',
                          fontWeight: 'bold',
                          fontSize: '14px',
                        }}
                      >
                        {' '}
                        Device{' '}
                      </Label>
                      <Input
                        type="select"
                        name="device"
                        id="device"
                        //onChange={checkDevice}
                        value={objValues.device}
                        required
                        disabled
                        style={{
                          border: '1px solid #014D88',
                          borderRadius: '0.2rem',
                        }}
                      >
                        {biometricDevices.map(
                          ({ id, name, active, url, type }) => (
                            <option key={id} value={url}>
                              {type}
                            </option>
                          )
                        )}
                      </Input>

                      {errors.device !== '' ? (
                        <span className={classes.error}>{errors.device}</span>
                      ) : (
                        ''
                      )}
                    </FormGroup>
                  </Col>

                  <Col md={3}>
                    <FormGroup>
                      <Label
                        for="device"
                        style={{
                          color: '#014d88',
                          fontWeight: 'bold',
                          fontSize: '14px',
                        }}
                      >
                        Select Finger
                      </Label>
                      <Input
                        type="select"
                        name="templateType"
                        id="templateType"
                        onChange={handleInputChange}
                        value={objValues.templateType}
                        required
                        style={{
                          border: '1px solid #014D88',
                          borderRadius: '0.2rem',
                        }}
                      >
                        <option value="">Select Finger </option>

                        {fingerType &&
                          _.filter(fingerType, ['captured', false]).map(
                            value => (
                              <option key={value.id} value={value.display}>
                                {value.display}
                              </option>
                            )
                          )}
                      </Input>
                      {errors.templateType !== '' ? (
                        <span className={classes.error}>
                          {errors.templateType}
                        </span>
                      ) : (
                        ''
                      )}
                    </FormGroup>
                  </Col>

                  <Col md={3}>
                    <Label
                      check
                      style={{
                        color: '#014d88',
                        fontWeight: 'bold',
                        fontSize: '18px',
                      }}
                    >
                      PIMS
                    </Label>
                    <br />
                    <Input
                      type="checkbox"
                      checked={checkedVal}
                      onChange={handleChange}
                      style={{
                        border: '1px solid #014D88',
                        borderRadius: '0.2rem',
                      }}
                    />
                  </Col>

                  <Col md={3}>
                    {!loading ? (
                      <>
                        <MatButton
                          type="button"
                          variant="contained"
                          color="primary"
                          onClick={captureFinger}
                          className={'mt-4'}
                          style={{ backgroundColor: '#992E62' }}
                          startIcon={<FingerprintIcon />}
                          disabled={loading}
                        >
                          Scan Finger
                        </MatButton>
                      </>
                    ) : (
                      <>
                        <MatButton
                          type="button"
                          variant="contained"
                          color="primary"
                          className={'mt-4'}
                          style={{ backgroundColor: '#992E62' }}
                          startIcon={<CircularProgress />}
                          disabled={loading}
                        >
                          Validating...
                        </MatButton>
                      </>
                    )}
                  </Col>
                  <br />
                  <Col md={12}>
                    {checkedVal && loading ? (
                      <>
                        <b>Scanning finger...</b>
                        <LinearProgress />
                      </>
                    ) : (
                      ''
                    )}
                  </Col>
                  <Col md={12}>
                    {successPims ? (
                      <>
                        <b>Awaiting finger validation from pims server...</b>
                        <LinearProgress />
                      </>
                    ) : (
                      ''
                    )}
                  </Col>
                </Row>
              </div>
              <br />
              <Row>
                <Col md={12}>
                  <Table striped bordered hover>
                    <tbody>
                      {props.patientDetails !== null &&
                      (props.pimsEnrollment || []).length === 0 ? (
                        <tr>
                          <td>
                            <b>Registration Date: </b>
                            {props.patientDetails.dateOfRegistration}
                          </td>
                          <td>
                            <b>Hospital No: </b>
                            {
                              props.patientDetails?.identifier?.identifier[0]
                                ?.value
                            }
                          </td>
                          <td>{props.patientDetails.firstName}</td>
                          <td>{props.patientDetails.surname}</td>
                          <td>{props.patientDetails.sex}</td>

                          <td>
                            Biometrics gg{' '}
                            {props.patientDetails.biometricStatus === true ? (
                              <Badge color="success"> Captured</Badge>
                            ) : (
                              <Badge color="danger">Not Captured</Badge>
                            )}
                          </td>
                          <td>
                            <Button
                              variant="contained"
                              color="primary"
                              className=" float-right mr-1"
                              startIcon={<FaEye size="25" />}
                              style={{ backgroundColor: '#014d88' }}
                              onClick={() =>
                                history.push('/patient-dashboard', {
                                  patientObj: props.patientDetails,
                                })
                              }
                            >
                              <span
                                style={{
                                  textTransform: 'capitalize',
                                  fontWeight: 'bolder',
                                }}
                              >
                                Patient Records
                              </span>
                            </Button>
                          </td>
                        </tr>
                      ) : (
                        props.pimsEnrollment &&
                        props.pimsEnrollment.map(pims => (
                          <tr key={pims.patientIdentifier}>
                            <td>
                              <b>Art Start Date: </b>
                              {pims.artStartDate}
                            </td>
                            <td>
                              <b>Patient ID: </b>
                              {pims.patientIdentifier}
                            </td>
                            <td>
                              <b>Facility Id: </b>
                              {pims.facilityId}
                            </td>
                            <td>
                              <b>Facility Name: </b>
                              {pims.facilityName}
                            </td>
                            <td>
                              <b>DOB: </b>
                              {pims.dateOfBirth}
                            </td>
                            <td>
                              <b>Sex: </b>
                              {pims.sex}
                            </td>
                            <td>
                              <b>State: </b>
                              {pims.stateName}
                            </td>
                            <td>
                              <b>LGA: </b>
                              {pims.lgaName}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </div>
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default RecallPatient;
