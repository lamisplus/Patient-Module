import React, { useState, useEffect, useRef } from "react";
import {
  Button,
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
} from "reactstrap";
import { makeStyles } from "@material-ui/core/styles";

import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import SaveIcon from "@material-ui/icons/Save";
import MatButton from "@material-ui/core/Button";
import FingerprintIcon from "@material-ui/icons/Fingerprint";
import { Button2, Icon, List } from "semantic-ui-react";
import { ToastContainer, toast } from "react-toastify";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import axios from "axios";
import { token, url as baseUrl } from "../../../api";

import CircularProgress from "@mui/material/CircularProgress";

import { Link, useHistory } from "react-router-dom";
import moment from "moment";
import { Dropdown } from "react-bootstrap";
import { Alert, AlertTitle } from "@material-ui/lab";
import fingerprintimage from "../images/fingerprintimage.png";
import DeleteIcon from "@material-ui/icons/Delete";

import LinearProgress from "@mui/material/LinearProgress";

import _ from "lodash";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    "& .dropdown-toggle::after, .dropleft .dropdown-toggle::before, .dropright .dropdown-toggle::before, .dropup .dropdown-toggle::after":
      {
        fontFamily: "FontAwesome",
        border: "0",
        verticalAlign: "middle",
        marginLeft: ".25em",
        lineHeight: "1",
      },
    "& .dropdown-menu .dropdown-item": {
      fontSize: "14px",
      color: "#014d88",
      padding: "0.3rem 1.5rem",
      fontWeight: "bold",
    },
    "& .mt-4": {
      marginTop: "28px !important",
    },
    "& .form-control": {
      color: "#992E62",
    },
    "& .form-control:focus": {
      color: "#014d88",
    },
    "& .sharp ": {
      "min-width": "35px",
      padding: "5px",
      height: "35px",
      "min-height": "35px",
    },
  },
  card: {
    margin: theme.spacing(20),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
}));

const Pims = (props) => {
  const classes = useStyles();
  let history = useHistory();

  const [biometricDevices, setbiometricDevices] = useState([]);
  const [objValues, setObjValues] = useState({
    biometricType: "FINGERPRINT",
    patientId: props.patientId,
    templateType: "",
    device: "SECUGEN",
    reason: "",
    age: "",
  });
  const [fingerType, setFingerType] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = React.useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [showCapture, setshowCapture] = React.useState(false);
  const [tryAgain, setTryAgain] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [errors, setErrors] = useState({});
  const [storedBiometrics, setStoredBiometrics] = useState([]);
  // const [responseImage, setResponseImage] = useState("")
  const [capturedFingered, setCapturedFingered] = useState([]);

  const [imageQuality, setImageQuality] = useState(false);
  const [isNewStatus, setIsNewStatus] = useState(true);

  const getPersonBiometrics = async () => {
    const fingersCodeset = await axios.get(
      `${baseUrl}application-codesets/v2/BIOMETRIC_CAPTURE_FINGERS`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    let biometricItems = _.map(fingersCodeset.data, (item) => {
      return _.extend({}, item, {
        captured: false,
      });
    });

    setFingerType(biometricItems);
  };

  const clear_storelist = () => {
    axios
      .post(
        `${baseUrl}biometrics/store-list/${props.patientId}`,
        props.patientId,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        //console.log("cleared store");
      })
      .catch((error) => {
        //console.log("cleared store error");
        console.error(error);
      });
  };

  useEffect(() => {
    // clear_storelist();
    getPersonBiometrics();
    TemplateType();
  }, []);

  const TemplateType = () => {
    axios
      .get(`${baseUrl}modules/check?moduleName=biometric`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.data === true) {
          axios
            .get(`${baseUrl}biometrics/devices?active=true`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
              //console.log(response.data.find((x) => x.active === true));
              setDevices(response.data.find((x) => x.active === true));
              setbiometricDevices(response.data);
            })
            .catch((error) => {
              console.error(error);
            });
        }
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  const handleInputChange = (e) => {
    setObjValues({
      ...objValues,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    let temp = { ...errors };
    temp.templateType = objValues.templateType ? "" : "This field is required";
    setErrors({
      ...temp,
    });
    return Object.values(temp).every((x) => x === "");
  };

  const captureFinger = (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);

    

      axios
        .post(
          `${devices.url}?reader=${devices.name}&isNew=${isNewStatus}`,
          objValues,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          setLoading(false);

          if (response.data.type === "ERROR") {
            setLoading(false);
            setTryAgain(true);
            window.setTimeout(() => {
              setTryAgain(false);
            }, 5000);
            toast.error(response.data.message.ERROR);
            setIsNewStatus(false);
          } else if (response.data.type === "WARNING") {
            const templateType = response.data.templateType;

            setTryAgain(false);
            setSuccess(true);

            let biometricsEnrollments = response.data;
            biometricsEnrollments.capturedBiometricsList = _.uniqBy(
              biometricsEnrollments.capturedBiometricsList,
              "templateType"
            );

            setCapturedFingered([...capturedFingered, biometricsEnrollments]);

            _.find(fingerType, { display: templateType }).captured = true;

            setFingerType([...fingerType]);

            setObjValues({ ...objValues, templateType: "" });
            setIsNewStatus(false);
            toast.warning(response.data.message.WARNING);
          } else if (response.data.type === "SUCCESS") {
            const templateType = response.data.templateType;
            setTryAgain(false);
            setSuccess(true);

            let biometricsEnrollments = response.data;
            biometricsEnrollments.capturedBiometricsList = _.uniqBy(
              biometricsEnrollments.capturedBiometricsList,
              "templateType"
            );

            setCapturedFingered([...capturedFingered, biometricsEnrollments]);

            _.find(fingerType, { display: templateType }).captured = true;
            setFingerType([...fingerType]);

            setObjValues({ ...objValues, templateType: "" });
            setIsNewStatus(false);
          } else {
            setLoading(false);
            setTryAgain(true);
            toast.error("Something went wrong capturing biometrics...", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
          }
        })
        .catch((error) => {
          setLoading(false);
        });
    }
  };

  const saveBiometrics = (e) => {
    e.preventDefault();
    if (capturedFingered.length >= 1) {
      const capturedObj = capturedFingered[capturedFingered.length - 1];

      capturedObj.capturedBiometricsList = _.uniqBy(
        capturedObj.capturedBiometricsList,
        "templateType"
      );

      axios
        .post(`${baseUrl}biometrics/templates`, capturedObj, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          //console.log("saved", response);
          toast.success("Biometric recaptured successfully", {
            position: toast.POSITION.BOTTOM_CENTER,
          });
          setCapturedFingered([]);
          getPersonBiometrics();
          // props.updatePatientBiometricStatus(true);
          props.getRecaptureCount();
          props.toggle();
        })
        .catch((error) => {
          toast.error("Something went wrong saving biometrics", {
            position: toast.POSITION.BOTTOM_CENTER,
          });
          console.error(error.message);
        });
    } else {
      toast.error("You can't save less than 2 finger", {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    }
  };

  const deleteTempBiometrics = (x) => {
    axios
      .delete(
        `${baseUrl}biometrics?personId=${x.patientId}&templateType=${x.templateType}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((resp) => {
        _.find(fingerType, { display: x.templateType }).captured = false;
        setFingerType([...fingerType]);
        let deletedRecord = capturedFingered.filter(
          (data) => data.templateType !== x.templateType
        );

        setCapturedFingered(deletedRecord);
        toast.info(x.templateType + " captured removed successfully!");
      })
      .catch((error) => {
        toast.error("Something went wrong", {
          position: toast.POSITION.BOTTOM_CENTER,
        });
        console.error(error);
      });
  };

  const getFingerprintsQuality = (imageQuality) => {
    if (imageQuality > 60 && imageQuality <= 75) {
      return (
        <Badge color="warning" style={{ fontSize: "12px" }}>
          {imageQuality + "%"}
        </Badge>
      );
    } else if (imageQuality > 75) {
      return (
        <Badge color="success" style={{ fontSize: "12px" }}>
          {imageQuality + "%"}
        </Badge>
      );
    } else {
      return (
        <Badge color="error" style={{ fontSize: "12px" }}>
          {imageQuality + "%"}
        </Badge>
      );
    }
  };
  return (
    <div className={classes.root}>
      <div>
        <div
          style={{
            flex: "10",
            padding: "5px",
            marginLeft: "5px",
            border: "1px solid rgba(99, 99, 99, 0.2)",
            boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
          }}
        >
          <Row>
            <ToastContainer />
            <Col md={3}>
              <FormGroup>
                <Label
                  for="device"
                  style={{
                    color: "#014d88",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  {" "}
                  Device{" "}
                </Label>
                <Input
                  type="select"
                  name="device"
                  id="device"
                  //onChange={checkDevice}
                  value={objValues.device}
                  required
                  disabled
                >
                  {biometricDevices.map(({ id, name, active, url, type }) => (
                    <option key={id} value={url}>
                      {type}
                    </option>
                  ))}
                </Input>

                {errors.device !== "" ? (
                  <span className={classes.error}>{errors.device}</span>
                ) : (
                  ""
                )}
              </FormGroup>
            </Col>

            <Col md={3}>
              <FormGroup>
                <Label
                  for="device"
                  style={{
                    color: "#014d88",
                    fontWeight: "bold",
                    fontSize: "14px",
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
                >
                  <option value="">Select Finger </option>

                  {fingerType &&
                    _.filter(fingerType, ["captured", false]).map((value) => (
                      <option key={value.id} value={value.display}>
                        {value.display}
                      </option>
                    ))}
                </Input>
                {errors.templateType !== "" ? (
                  <span className={classes.error}>{errors.templateType}</span>
                ) : (
                  ""
                )}
              </FormGroup>
            </Col>

            <Col md={3}>
              {!loading ? (
                <>
                  <MatButton
                    type="button"
                    variant="contained"
                    color="primary"
                    onClick={captureFinger}
                    className={"mt-4"}
                    style={{ backgroundColor: "#992E62" }}
                    startIcon={<FingerprintIcon />}
                    disabled={loading}
                  >
                    validate Finger
                  </MatButton>
                </>
              ) : (
                <>
                  <MatButton
                    type="button"
                    variant="contained"
                    color="primary"
                    className={"mt-4"}
                    style={{ backgroundColor: "#992E62" }}
                    startIcon={<CircularProgress />}
                  >
                    Validating...
                  </MatButton>
                </>
              )}
            </Col>
            <br />
            <Col md={12}>
              {loading ? (
                <>
                  <b>Validating finger...</b>
                  <LinearProgress />
                </>
              ) : (
                ""
              )}
            </Col>
          </Row>
        </div>

        <Row></Row>
      </div>
    </div>
  );
};

export default Pims;
