import React, { useState, useEffect, useRef } from "react";
import { Row, Label, Col, FormGroup, Input, Button, Badge } from "reactstrap";

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
  /*    form: {
        width: "100%", // Fix IE 11 issue.
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
        "& > *": {
            margin: theme.spacing(1),
        },
    },
    input: {
        display: "none",
    },
    error: {
        color: "#f85032",
        fontSize: "12.8px",
    },*/
}));

let checkUrl = "";

function Biometrics(props) {
  localStorage.setItem("patient_id", JSON.stringify(props.patientId));
  const classes = useStyles();
  let history = useHistory();
  const permissions =
    history.location && history.location.state
      ? history.location.state.permissions
      : [];
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
  const [capturedFingeredObj, setCapturedFingeredObj] = useState([]);
  const [recapturedFingered, setRecapturedFingered] = useState([]);
  const [selectedFingers, setSelectedFingers] = useState([]);
  const [imageQuality, setImageQuality] = useState(false);
  const [isNewStatus, setIsNewStatus] = useState(true);

  const calculate_age = (dob) => {
    const today = new Date();
    const dateParts = dob.split("-");
    const birthDate = new Date(dob); // create a date object directlyfrom`dob1`argument
    let age_now = today.getFullYear() - birthDate.getFullYear();
    // const m = today.getMonth() - birthDate.getMonth();
    // if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    //     age_now--;
    // }
    // if (age_now === 0) {
    //     return m + " month(s)";
    // }
    return age_now;
  };

  const getPersonBiometrics = async () => {
    const fingersCodeset = await axios.get(
      `${baseUrl}application-codesets/v2/BIOMETRIC_CAPTURE_FINGERS`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    axios
      .get(`${baseUrl}biometrics/person/${props.patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(async (response) => {
        if (response.data.length > 0) {
          setStoredBiometrics(response.data);

          setPageLoading(true);

          let personCapturedFingers = _.uniq(
            _.map(response.data, "templateType")
          );

          //console.log(personCapturedFingers);
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
     
        console.error(error);

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

  const getRecaptureCount = () => {
    axios
      .get(`${baseUrl}biometrics/grouped/person/${props.patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //console.log(response.data);
        setRecapturedFingered(response.data);
      });
  };

  useEffect(() => {
    clear_storelist();
    getPersonBiometrics();
    TemplateType();
    getRecaptureCount();
    //biometricFingers();
  }, []);

  //Get list of Finger index
  // const TemplateType = () => {
  //   axios
  //     .get(`${baseUrl}application-codesets/v2/BIOMETRIC_CAPTURE_FINGERS`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     })
  //     .then((response) => {
  //       setFingerType(response.data);
  //     })
  //     .catch((error) => {});
  // };
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
  // handle the input changes
  const handleInputChange = (e) => {
    setObjValues({
      ...objValues,
      [e.target.name]: e.target.value,
      age: calculate_age(props.age),
    });
  };
  //form validation
  const validate = () => {
    let temp = { ...errors };
    temp.templateType = objValues.templateType ? "" : "This field is required";
    //temp.device = objValues.device ? "" : "This field is required"
    setErrors({
      ...temp,
    });
    return Object.values(temp).every((x) => x === "");
  };
  //to capture  selected index finger
  // const captureFinger = (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setFingerType([]);
  //   if (validate()) {
  //     setFingerType([]);
  //     window.setTimeout(() => {
  //       setLoading(false);
  //       const removeFingers = fingerType.filter(
  //         (x) => x.display !== objValues.templateType
  //       );
  //       fingerType.splice(removeFingers, 1);
  //       setFingerType([...fingerType]);
  //       arrCaptureObj.push(objValues.templateType);
  //       selectedFingers.archived = arrCaptureObj.length + 1;
  //       selectedFingers.templateType = objValues.templateType;
  //       setCapturedFingeredObj([...capturedFingeredObj, selectedFingers]);
  //       toast.success(objValues.templateType + "captured successful!");
  //     }, 5000);
  //   }
  // };

  const captureFinger = (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);

      axios
        .post(
          `${devices.url}?reader=${
            devices.name
          }&isNew=${isNewStatus}&recapture=${true}`,
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
            if (
              response.data.imageQuality <= 60 &&
              calculate_age(props.age) <= 6
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
            toast.warning(response.data.message.WARNING);
          } else if (response.data.type === "SUCCESS") {
            if (
              response.data.imageQuality <= 60 &&
              calculate_age(props.age) <= 6
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

  //Save Biometric capture
  // const saveBiometrics = (e) => {
  //   e.preventDefault();
  //   setCapturedFingeredObj([]);
  //   if (capturedFingeredObj.length >= 1) {
  //     setSaveCapturedFingeredObj(capturedFingeredObj);
  //   }
  // };

  const saveBiometrics = (e) => {
    e.preventDefault();
    if (capturedFingered.length >= 1) {
      const capturedObj = capturedFingered[capturedFingered.length - 1];

      capturedObj.capturedBiometricsList = _.uniqBy(
        capturedObj.capturedBiometricsList,
        "templateType"
      );

      //console.log("capturedObj", capturedFingered);

      axios
        .post(`${baseUrl}biometrics/templates`, capturedObj, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          console.error("saved", response);
          toast.success("Biometric recaptured successfully", {
            position: toast.POSITION.BOTTOM_CENTER,
          });
          setCapturedFingered([]);
          getPersonBiometrics();
          props.updatePatientBiometricStatus(true);
          //console.log("capturedObj", capturedFingered);
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
       
        let deletedRecord = capturedFingered.filter(
          (data) => data.templateType !== x.templateType
        );
        setCapturedFingered(deletedRecord);
        toast.info(x.templateType + "captured removed successfully!");
        // toast.success(`finger deleted successfully`, {
        //   position: toast.POSITION.BOTTOM_CENTER,
        // });
      })
      .catch((error) => {
        toast.error("Something went wrong", {
          position: toast.POSITION.BOTTOM_CENTER,
        });
        console.error(error);
      });
    // window.setTimeout(() => {
    //   let deletedRecord = capturedFingered.filter(
    //     (data) => data.templateType !== x.templateType
    //   );
    //   setCapturedFingered(deletedRecord);
    //   toast.info(x.templateType + "captured removed successfully!");
    // }, 1000);
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
        {/* temporal update */}
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

              {!imageQuality ? (
                ""
              ) : (
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
                      Reason for capture{" "}
                    </Label>
                    <Input
                      type="textarea"
                      name="reason"
                      id="reason"
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
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
          <Col>
            <br />
            <p>
              {" "}
              Patient Recapture Count : <b>{recapturedFingered.length}</b>
            </p>
            <hr />
          </Col>
        </Row>
        <Row>
          {capturedFingered.length >= 1 ? (
            <>
              <Col md={12} style={{ marginTop: "10px", paddingBottom: "20px" }}>
                <List celled horizontal>
                  {/* {console.log(capturedFingered)} */}
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
                        {getFingerprintsQuality(x.imageQuality)}
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
                        {/* <img
                          src={`data:image/png;base64,${x.image}`}
                          style={{ width: "80px", height: "80px" }}
                          alt=""
                        /> */}
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
                        {x.imageQuality < 75 ? (
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
                {/* {storedBiometrics.length < 10 &&
                storedBiometrics.length !== 0 ? (
                  <MatButton
                    type="button"
                    variant="contained"
                    color="primary"
                    //disabled={capturedFingered.length < 6 ? true : false}
                    onClick={saveBiometrics}
                    // className={classes.button}
                    startIcon={<SaveIcon />}
                  >
                    Save Capture
                  </MatButton>
                ) : ( */}
                <MatButton
                  type="button"
                  variant="contained"
                  color="primary"
                  disabled={capturedFingered.length < 6 ? true : false}
                  onClick={saveBiometrics}
                  // className={classes.button}
                  startIcon={<SaveIcon />}
                >
                  Save Capture
                </MatButton>
                {/* )} */}
              </Col>
              <br />
            </>
          ) : (
            ""
          )}
        </Row>
      </div>
      {/* <div style={{ display: "flex", width: "100%" }}>
        <div
          className=""
          style={{
            padding: "5px",
            flex: "10",
            boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
            minHeight: "400px",
          }}
        >
          {saveCapturedFingered.length > 0 ? (
            <div style={{ display: "flex", width: "100%", flexWrap: "wrap" }}>
              {saveCapturedFingered.map((biometric, index) => (
                <div
                  key={index}
                  style={{ minHeight: "120px", padding: "5px", width: "20%" }}
                >
                  <div className="card " style={{ borderRadius: "6px" }}>
                    <div
                      className="card-header align-items-start"
                      style={{ backgroundColor: "#fff" }}
                    >
                      <div>
                        <h6 className="fs-18 font-w500 mb-3 user-name">
                          <Link
                            to={"#"}
                            style={{
                              color: "#014d88",
                              fontSize: "14px",
                              fontFamily: `"poppins",sans-serif`,
                            }}
                          >
                            {biometric.templateType}
                          </Link>
                        </h6>
                        <div
                          className="fs-9 text-nowrap"
                          style={{
                            fontSize: "10px",
                            color: "#992E62",
                            fontWeight: "bold",
                            fontFamily: `"poppins",sans-serif`,
                          }}
                        >
                          <i
                            className="fa fa-calendar-o me-3"
                            aria-hidden="true"
                          ></i>
                          {moment(biometric.lastModifiedDate).format(
                            "YYYY-MM-DD HH:mm"
                          )}
                        </div>
                      </div>

                      <Dropdown className="dropdown ms-auto">
                        <Dropdown.Toggle
                          as="button"
                          variant=""
                          drop="up"
                          className="btn sharp btn-primary "
                          id="tp-btn"
                          style={{
                            backgroundColor: "#014d88",
                            borderColor: "#014d88",
                            borderRadius: "5px",
                            marginRight: "-18px",
                            marginTop: "-10px",
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            width="18px"
                            height="18px"
                            viewBox="0 0 24 24"
                            version="1.1"
                          >
                            <g
                              stroke="none"
                              strokeWidth="1"
                              fill="none"
                              fillRule="evenodd"
                            >
                              <rect x="0" y="0" width="24" height="24" />
                              <circle fill="#ffffff" cx="12" cy="5" r="2" />
                              <circle fill="#ffffff" cx="12" cy="12" r="2" />
                              <circle fill="#ffffff" cx="12" cy="19" r="2" />
                            </g>
                          </svg>
                        </Dropdown.Toggle>
                        <Dropdown.Menu
                          alignRight={true}
                          className="dropdown-menu-right"
                        >
                          <Dropdown.Item
                            style={{ color: "red" }}
                            onClick={() =>
                              deleteBiometric(
                                biometric.id,
                                biometric.templateType
                              )
                            }
                          >
                            <DeleteIcon /> Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                    <div className="card-body p-0 pb-2">
                      <ul className="list-group list-group-flush">
                        <li
                          className="list-group-item"
                          style={{
                            height: "100px",
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <img
                            src={fingerprintimage}
                            alt=""
                            style={{ height: "80px" }}
                          />
                        </li>

                        <li className="list-group-item">
                          <Badge
                            variant="info badge-xs light"
                            className="card-link float-end"
                          >
                            Version 
                          </Badge>
                          <span className="mb-0 title">
                            Status {biometric.iso}
                          </span>{" "}
                          :
                          <span className="text-black desc-text ms-2">
                            <Badge
                              variant={
                                biometric.iso === true
                                  ? "primary badge-xs"
                                  : "danger badge-xs"
                              }
                            >
                              <i
                                className="fa fa-check-square me-2 scale4"
                                aria-hidden="true"
                              ></i>{" "}
                            </Badge>
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex-grow-8">
                <div className="flex-grow-8">
                  <Alert severity="info">
                    <AlertTitle style={{ height: "400px" }}>
                      <strong>No biometrics captured</strong>
                    </AlertTitle>
                  </Alert>
                </div>
              </div>
            </>
          )}
        </div>
      </div> */}
    </div>
  );
}

export default Biometrics;
