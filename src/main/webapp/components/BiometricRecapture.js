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
import { TiArrowBack } from "react-icons/ti";
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

const BiometricRecapture = (props) => {
  const classes = useStyles();
  let history = useHistory();
 
  const permissions =
    history.location && history.location.state
      ? history.location.state.permissions
      : [];
  let currentPatientId = history?.location?.state?.patientObj?.patientId;
  let currentAge = history?.location?.state?.patientObj?.age;
  const [biometricDevices, setbiometricDevices] = useState([]);
  const [objValues, setObjValues] = useState({
    biometricType: "FINGERPRINT",
    patientId: props.patientId,
    templateType: "",
    device: "SECUGEN",
    reason: "",
    age: "",
    capturedBiometricsList: [],
    deduplication: {
      patientId: "",
      deduplicationDate: null,
      matchCount: 0,
      unMatchCount: 0,
      baselineFingerCount: 0,
      recaptureFingerCount: 0,
      perfectMatchCount: 0,
      imperfectMatchCount: 0,
      details: null,
    },
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
  const [responseImage, setResponseImage] = useState("");
  const [capturedFingered, setCapturedFingered] = useState([]);
  const [capturedFingeredObj, setCapturedFingeredObj] = useState([]);
  const [recapturedFingered, setRecapturedFingered] = useState([]);
  // const [selectedFingers, setSelectedFingers] = useState([]);
  const [imageQuality, setImageQuality] = useState(false);
  const [isNewStatus, setIsNewStatus] = useState(false);

  const calculate_age = (dob) => {

    const today = new Date();
    const dateParts = dob.split("-");
    const birthDate = new Date(dob);
    let age_now = today.getFullYear() - birthDate.getFullYear();

    return age_now;
  };

  const getPersonBiometrics = async () => {
    const fingersCodeset = await axios.get(
      `${baseUrl}application-codesets/v2/BIOMETRIC_CAPTURE_FINGERS`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    axios
      .get(`${baseUrl}biometrics/person/${currentPatientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(async (response) => {
        if (response.data.length > 0) {
          setStoredBiometrics(response.data);

          setPageLoading(true);

          let personCapturedFingers = _.uniq(
            _.map(response.data, "templateType")
          );

     
          //setSelectedFingers(personCapturedFingers);

          let biometricItems = _.map(fingersCodeset.data, (item) => {
            return _.extend({}, item, {
              captured: false,
            });
          });

          setFingerType(biometricItems);
        } else {
          let biometricItems = _.map(fingersCodeset.data, (item) => {
            return _.extend({}, item, { captured: false });
            //return item.captured = personCapturedFingers.includes(item.display)
          });
          setFingerType(biometricItems);
        }
      })
      .catch(async (error) => {
   

        let biometricItems = _.map(fingersCodeset.data, (item) => {
          return _.extend({}, item, { captured: false });
        });
        setFingerType(biometricItems);
        setPageLoading(true);
      });
  };

  const clear_storelist = () => {
    axios
      .post(
        `${baseUrl}biometrics/store-list/${currentPatientId}`,
        currentPatientId,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
       
      })
      .catch((error) => {
       
      });
  };

  const getRecaptureCount = () => {
    axios
      .get(`${baseUrl}biometrics/grouped/person/${currentPatientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
      
        setRecapturedFingered(response.data);
      });
  };

  useEffect(() => {
    clear_storelist();
    getPersonBiometrics();
    TemplateType();
    getRecaptureCount();
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
      age: calculate_age(currentAge),
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
    if (localStorage.getItem("capturedBiometricsList") !== null) {
      const capturedBiometricsListObj = JSON.parse(
        localStorage.getItem("capturedBiometricsList")
      );

      objValues.capturedBiometricsList = capturedBiometricsListObj;
      localStorage.removeItem("capturedBiometricsList");
    } else {
      objValues.capturedBiometricsList = [];
      localStorage.removeItem("capturedBiometricsList");
    }

    if (localStorage.getItem("deduplicates") !== null) {
      const deduplicatesObj = JSON.parse(localStorage.getItem("deduplicates"));

      objValues.deduplication = deduplicatesObj;
      setObjValues({ ...objValues, deduplication: deduplicatesObj });

      localStorage.removeItem("deduplicates");
    } else {
      let deduplicationObj = {
        patientId: "",
        deduplicationDate: null,
        matchCount: 0,
        unMatchCount: 0,
        baselineFingerCount: 0,
        recaptureFingerCount: 0,
        perfectMatchCount: 0,
        imperfectMatchCount: 0,
        details: null,
      };
      objValues.deduplication = deduplicationObj;
      setObjValues({ ...objValues, deduplication: deduplicationObj });
    }

    if (validate()) {
      setLoading(true);

      axios
        .post(
          `${devices.url}?reader=${
            devices.name
          }&isNew=${isNewStatus}&recapture=${true}&identify=${false}`,
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

            toast.error(response.data.message.ERROR);
            setIsNewStatus(false);
            // if (response.data.deviceName.contains("Futronic")) {
            //   localStorage.setItem(
            //     "capturedBiometricsList",
            //     JSON.stringify(response.data.capturedBiometricsList)
            //   );

            //   localStorage.setItem(
            //     "deduplicates",
            //     JSON.stringify(response.data.deduplication)
            //   );
            // }
          } else if (response.data.type === "WARNING") {
            //Imperfect Match
            if (response.data.match === true) {
              toast.info(response.data.message.RECAPTURE_MESSAGE, {
                autoClose: 10000,
              });
            } else if (response.data.match === false) {
              toast.error(response.data.message.RECAPTURE_MESSAGE, {
                autoClose: 10000,
              });
            }

            if (
              response.data.imageQuality <= 60 &&
              calculate_age(currentAge) <= 6
            ) {
              toast.info(
                "Image quality captured is poor, Kindly give a reason for capture above.",
                { position: toast.POSITION.BOTTOM_CENTER, autoClose: 20000 }
              );
              setImageQuality(true);
            }

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
            //toast.info(response.data.message.match);
          } else if (
            response.data.type === "SUCCESS" ||
            response.data.match === false
          ) {
            if (
              response.data.imageQuality <= 60 &&
              calculate_age(currentAge) <= 6
            ) {
              toast.info(
                "Image quality captured is poor, Kindly give a reason for capture above.",
                { position: toast.POSITION.BOTTOM_CENTER, autoClose: 20000 }
              );
              setImageQuality(true);
            }

            localStorage.setItem(
              "capturedBiometricsList",
              JSON.stringify(response.data.capturedBiometricsList)
            );

            localStorage.setItem(
              "deduplicates",
              JSON.stringify(response.data.deduplication)
            );

            const templateType = response.data.templateType;
            setTryAgain(false);
            setSuccess(true);

            if (response.data.match === true) {
              toast.success(response.data.message.RECAPTURE_MESSAGE, {
                autoClose: 10000,
              });
            }

            if (response.data.match === false) {
              toast.error(response.data.message.RECAPTURE_MESSAGE, {
                autoClose: 10000,
              });
            }

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
            //toast.success(response.data.message.match);
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

      if (capturedObj.deviceName.includes("Futronic")) {
        let fingersObj = [];
        capturedFingered.forEach((obj) => {
          fingersObj.push(obj.capturedBiometricsList[0]);
        });

        if (fingersObj.length > 0) {
          axios
            .post(`${baseUrl}biometrics/templates`, capturedObj, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
          
              toast.success("Biometric saved successfully", {
                position: toast.POSITION.BOTTOM_CENTER,
              });
              setCapturedFingered([]);
              getPersonBiometrics();
              //props.updatePatientBiometricStatus(true);
              getRecaptureCount();
              //props.toggle();
            })
            .catch((error) => {
              toast.error("Something went wrong saving biometrics recapture", {
                position: toast.POSITION.BOTTOM_CENTER,
              });
              console.error(error + "1");
            });
        }
      } else {
        axios
          .post(`${baseUrl}biometrics/templates`, capturedObj, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
           
            toast.success("Biometric recaptured successfully", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            setCapturedFingered([]);
            getPersonBiometrics();

            getRecaptureCount();
            //props.toggle();
          })
          .catch((error) => {
            toast.error("Something went wrong saving biometrics recapture", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            console.error(error + "2");
          });
      }
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
    <>
      <div className={classes.root}>
        <div>
          {permissions.includes("capture_patient_biometrics") ||
          permissions.includes("all_permission") ? (
            <div
              style={{
                flex: "10",
                padding: "5px",
                marginLeft: "5px",
                border: "1px solid rgba(99, 99, 99, 0.2)",
                boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
              }}
            >
              {/* <Row>
                    <Col>
                      <br />
                      <p>
                        {" "}
                        Patient captured count :{" "}
                        <b>{recapturedFingered.length}</b>
                      </p>
                      <br />
                    </Col>
                  </Row> */}
              <Row>
                <p>
                  {" "}
                  Patient recapture count :{" "}
                  <b>{recapturedFingered.length - 1}</b>
                  <Link to={"/"}>
                    <MatButton
                      className=" float-right mr-1"
                      variant="contained"
                      floated="left"
                      startIcon={<TiArrowBack />}
                      style={{
                        backgroundColor: "rgb(153, 46, 98)",
                        color: "#fff",
                        height: "35px",
                      }}
                    >
                      <span style={{ textTransform: "capitalize" }}>Back</span>
                    </MatButton>
                  </Link>
                </p>
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
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
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
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                    >
                      <option value="">Select Finger </option>

                      {fingerType &&
                        _.filter(fingerType, ["captured", false]).map(
                          (value) => (
                            <option key={value.id} value={value.display}>
                              {value.display}
                            </option>
                          )
                        )}
                    </Input>
                    {errors.templateType !== "" ? (
                      <span className={classes.error}>
                        {errors.templateType}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </Col>

                {capturedFingered.length >= 6 &&
                capturedFingered.length < 10 ? (
                  <Col md={4}>
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
                        Reason for recapturing less than 10 fingers{" "}
                      </Label>
                      <Input
                        type="textarea"
                        name="reason"
                        id="reason"
                        onChange={handleInputChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      />
                    </FormGroup>
                  </Col>
                ) : (
                  ""
                )}

                <Col md={2}>
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
                        Capture Finger
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
                        Capturing...
                      </MatButton>
                    </>
                  )}
                </Col>
                <br />
                <Col md={12}>
                  {loading ? (
                    <>
                      <b>Capturing finger...</b>
                      <LinearProgress />
                    </>
                  ) : (
                    ""
                  )}
                </Col>
              </Row>
            </div>
          ) : (
            ""
          )}

          <Row>
            {capturedFingered.length >= 1 ? (
              <>
                <Col
                  md={12}
                  style={{ marginTop: "10px", paddingBottom: "20px" }}
                >
                  <List celled horizontal>
                    {capturedFingered.map((x) => (
                      <List.Item
                        style={{
                          width: "200px",
                          height: "200px",
                          border: "1px dotted #014d88",
                          margin: "5px",
                        }}
                      >
                        <List.Header
                          style={{
                            paddingLeft: "0px",
                            height: "0.5rem",

                            alignItems: "right",
                          }}
                        >
                          {getFingerprintsQuality(x.mainImageQuality)}
                          <span
                            onClick={() => {
                              deleteTempBiometrics(x);
                            }}
                          >
                            <Icon
                              name="cancel"
                              color="red"
                              style={{ float: "right" }}
                            />{" "}
                          </span>
                        </List.Header>
                        <List.Content
                          style={{
                            width: "200px",
                            height: "150px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {" "}
                          <FingerprintIcon
                            style={{ color: "#992E62", fontSize: 150 }}
                          />
                        </List.Content>
                        <List.Content
                          style={{
                            width: "200px",
                            height: "30px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "16px",
                            color: "#014d88",
                            fontWeight: "bold",
                            fontFamily: '"poppins", sans-serif',
                          }}
                        >
                          {x.templateType}
                        </List.Content>
                        <List.Content>
                          <br />
                          {x.mainImageQuality < 75 ? (
                            <MatButton
                              type="button"
                              variant="contained"
                              color="secondary"
                              onClick={() => {
                                deleteTempBiometrics(x);
                              }}
                              startIcon={<RestartAltIcon />}
                            >
                              Reset recapture
                            </MatButton>
                          ) : (
                            " "
                          )}
                        </List.Content>
                      </List.Item>
                    ))}
                  </List>
                </Col>
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <Col md={12}>
                  <br />

                  <MatButton
                    type="button"
                    variant="contained"
                    color="primary"
                    disabled={capturedFingered.length < 6 ? true : false}
                    onClick={saveBiometrics}
                    startIcon={<SaveIcon />}
                  >
                    Save Capture
                  </MatButton>
                </Col>
                <br />
              </>
            ) : (
              ""
            )}
          </Row>
        </div>
      </div>
    </>
  );
};

export default BiometricRecapture;
