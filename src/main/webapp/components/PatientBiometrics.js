import React, { useState, useEffect } from "react";
import _ from "lodash";
import axios from "axios";
import MatButton from "@material-ui/core/Button";
import { Icon, List } from "semantic-ui-react";
import FingerprintIcon from "@material-ui/icons/Fingerprint";
import SaveIcon from "@mui/icons-material/Save";
import leftFinger1 from "../images/fingers/left_hand_6.png";
import leftFinger2 from "../images/fingers/left_hand_7.png";
import leftFinger3 from "../images/fingers/left_hand_8.png";
import leftFinger4 from "../images/fingers/left_hand_9.png";
import leftFinger5 from "../images/fingers/left_hand_10.png";
import rightFinger1 from "../images/fingers/right_hand_1.png";
import rightFinger2 from "../images/fingers/right_hand_2.png";
import rightFinger3 from "../images/fingers/right_hand_3.png";
import rightFinger4 from "../images/fingers/right_hand_4.png";
import rightFinger5 from "../images/fingers/right_hand_5.png";
import { token, url as baseUrl } from "../../../api";
import { ToastContainer, toast } from "react-toastify";
import {
  CardTitle,
  Row,
  Label,
  Card,
  CardBody,
  Col,
  FormGroup,
  CardHeader,
  Input,
  Badge,
  CardSubtitle,
} from "reactstrap";

const PatientBiometrics = (props) => {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [biometricDevices, setbiometricDevices] = useState([]);
  const [isNewStatus, setIsNewStatus] = useState(true);
  const [tryAgain, setTryAgain] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [imageQuality, setImageQuality] = useState(false);
  const [objValues, setObjValues] = useState({
    biometricType: "FINGERPRINT",
    patientId: props.patientId,
    templateType: "",
    device: "",
    reason: "",
    age: "",
  });
  const [leftFinger1Value, setLeftFinger1Value] = useState({});
  const [leftFinger2Value, setLeftFinger2Value] = useState({});
  const [leftFinger3Value, setLeftFinger3Value] = useState({});
  const [leftFinger4Value, setLeftFinger4Value] = useState({});
  const [leftFinger5Value, setLeftFinger5Value] = useState({});

  useEffect(() => {
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

  const calculate_age = (dob) => {
    const today = new Date();
    const dateParts = dob.split("-");
    const birthDate = new Date(dob); // create a date object directlyfrom`dob1`argument
    let age_now = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age_now--;
    }
    if (age_now === 0) {
      return m + " month(s)";
    }
    return age_now;
  };

  const getFingerprintsQuality = (imageQuality) => {
    if (imageQuality > 60 && imageQuality <= 75) {
      return (
        <Badge color="warning" style={{ fontSize: "14px" }}>
          {imageQuality + "%"}
        </Badge>
      );
    } else if (imageQuality > 75) {
      return (
        <Badge color="success" style={{ fontSize: "14px" }}>
          {imageQuality + "%"}
        </Badge>
      );
    } else {
      return (
        <Badge color="error" style={{ fontSize: "14px" }}>
          {imageQuality + "%"}
        </Badge>
      );
    }
  };

  const captureFinger = (e, templateType) => {
    e.preventDefault();

    let objValues = {
      biometricType: "FINGERPRINT",
      patientId: "000101",
      templateType: templateType,
      device: "",
      reason: "",
      age: "",
    };

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

          // window.setTimeout(() => {
          //   setTryAgain(false);
          // }, 5000);

          toast.error(response.data.message.ERROR);
          setIsNewStatus(false);
        } else if (response.data.type === "SUCCESS") {
          const templateType = response.data.templateType;
         
          if (templateType === "Left Thumb") {
            setLeftFinger1Value(response.data);
          } else if (templateType === "Left Index Finger") {
            setLeftFinger2Value(response.data);
          } else if (templateType === "Left Middle Finger") {
            setLeftFinger3Value(response.data);
          } else if (templateType === "Left Ring Finger") {
            setLeftFinger4Value(response.data);
          } else if (templateType === "Left Little Finger") {
            setLeftFinger5Value(response.data);
          }
          setTryAgain(false);
          setSuccess(true);

          // window.setTimeout(() => {
          //   setSuccess(false);
          //   setLoading(false);
          // }, 5000);

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
  };

  return (
    <>
      <Card>
        <CardHeader>
          Biometrics Capture & Recapture{" "}
          <p
            style={{
              color: "#014d88",
              fontSize: "14px",
            }}
          >
            <b>Device: </b> {devices.type}
          </p>
          <MatButton
            className=" float-right mr-1"
            variant="contained"
            startIcon={<SaveIcon />}
            style={{
              backgroundColor: "#014d88",
              color: "#fff",
              height: "35px",
              float: "right",
              //marginBottom: "40px",
            }}
            onClick={""}
          >
            <span style={{ textTransform: "capitalize" }}>
              Save Captured Finger Prints
            </span>
          </MatButton>
        </CardHeader>
        <CardBody>
          <Row>
            <Col>
              <Card>
                <CardBody>
                  {
                    _.isEmpty(leftFinger1Value) ? (
                      ""
                    ) : (
                      <CardTitle>
                        {getFingerprintsQuality(leftFinger1Value.imageQuality)}{" "}
                        <span
                          onClick={() => {
                            "";
                            // deleteTempBiometrics(x);
                          }}
                        >
                          <Icon
                            name="cancel"
                            color="red"
                            style={{ float: "right" }}
                          />{" "}
                        </span>
                      </CardTitle>
                    )
                    // <CardSubtitle></CardSubtitle>
                  }
                  <center>
                    {_.isEmpty(leftFinger1Value) ? (
                      <img src={leftFinger1} width={150} height={180} />
                    ) : (
                      <img
                        src={`data:image/bmp;base64,${leftFinger1Value.image}`}
                        width={150}
                        height={180}
                      />
                    )}
                  </center>
                  <center>
                    <MatButton
                      type="button"
                      variant="contained"
                      color="primary"
                      onClick={(event) => captureFinger(event, "Left Thumb")}
                      className={"mt-4"}
                      style={{ backgroundColor: "#992E62" }}
                      startIcon={<FingerprintIcon />}
                    >
                      Capture Finger
                    </MatButton>
                  </center>
                </CardBody>
              </Card>
            </Col>
            <Col>
              <Card>
                <CardBody>
                  {_.isEmpty(leftFinger2Value) ? (
                    ""
                  ) : (
                    <CardTitle>
                      {getFingerprintsQuality(80)}{" "}
                      <span
                        onClick={() => {
                          "";
                          // deleteTempBiometrics(x);
                        }}
                      >
                        <Icon
                          name="cancel"
                          color="red"
                          style={{ float: "right" }}
                        />{" "}
                      </span>
                    </CardTitle>
                  )}
                  <center>
                    {_.isEmpty(leftFinger2Value) ? (
                      <img src={leftFinger2} width={150} height={180} />
                    ) : (
                      <img
                        src={`data:image/bmp;base64,${leftFinger2Value.image}`}
                        width={150}
                        height={180}
                      />
                    )}
                  </center>
                  <center>
                    <MatButton
                      type="button"
                      variant="contained"
                      color="primary"
                      onClick={(event) =>
                        captureFinger(event, "Left Index Finger")
                      }
                      className={"mt-4"}
                      style={{ backgroundColor: "#992E62" }}
                      startIcon={<FingerprintIcon />}
                    >
                      Capture Finger
                    </MatButton>
                  </center>
                </CardBody>
              </Card>
            </Col>
            <Col>
              <Card>
                <CardBody>
                  {_.isEmpty(leftFinger3Value) ? (
                    ""
                  ) : (
                    <CardTitle>
                      {getFingerprintsQuality(80)}{" "}
                      <span
                        onClick={() => {
                          "";
                          // deleteTempBiometrics(x);
                        }}
                      >
                        <Icon
                          name="cancel"
                          color="red"
                          style={{ float: "right" }}
                        />{" "}
                      </span>
                    </CardTitle>
                  )}
                  <center>
                    {_.isEmpty(leftFinger3Value) ? (
                      <img src={leftFinger3} width={150} height={180} />
                    ) : (
                      <img
                        src={`data:image/bmp;base64,${leftFinger3Value.image}`}
                        width={150}
                        height={180}
                      />
                    )}
                  </center>
                  <center>
                    <MatButton
                      type="button"
                      variant="contained"
                      color="primary"
                      onClick={(event) =>
                        captureFinger(event, "Left Middle Finger")
                      }
                      className={"mt-4"}
                      style={{ backgroundColor: "#992E62" }}
                      startIcon={<FingerprintIcon />}
                    >
                      Capture Finger
                    </MatButton>
                  </center>
                </CardBody>
              </Card>
            </Col>
            <Col>
              <Card>
                <CardBody>
                  {_.isEmpty(leftFinger4Value) ? (
                    ""
                  ) : (
                    <CardTitle>
                      {getFingerprintsQuality(80)}{" "}
                      <span
                        onClick={() => {
                          "";
                          // deleteTempBiometrics(x);
                        }}
                      >
                        <Icon
                          name="cancel"
                          color="red"
                          style={{ float: "right" }}
                        />{" "}
                      </span>
                    </CardTitle>
                  )}
                  <center>
                    {_.isEmpty(leftFinger4Value) ? (
                      <img src={leftFinger4} width={150} height={180} />
                    ) : (
                      <img
                        src={`data:image/bmp;base64,${leftFinger4Value.image}`}
                        width={150}
                        height={180}
                      />
                    )}
                  </center>
                  <center>
                    <MatButton
                      type="button"
                      variant="contained"
                      color="primary"
                      onClick={(event) =>
                        captureFinger(event, "Left Ring Finger")
                      }
                      className={"mt-4"}
                      style={{ backgroundColor: "#992E62" }}
                      startIcon={<FingerprintIcon />}
                    >
                      Capture Finger
                    </MatButton>
                  </center>
                </CardBody>
              </Card>
            </Col>
            <Col>
              <Card>
                <CardBody>
                  {_.isEmpty(leftFinger5Value) ? (
                    ""
                  ) : (
                    <CardTitle>
                      {getFingerprintsQuality(80)}{" "}
                      <span
                        onClick={() => {
                          "";
                          // deleteTempBiometrics(x);
                        }}
                      >
                        <Icon
                          name="cancel"
                          color="red"
                          style={{ float: "right" }}
                        />{" "}
                      </span>
                    </CardTitle>
                  )}
                  <center>
                    {_.isEmpty(leftFinger5Value) ? (
                      <img src={leftFinger5} width={150} height={180} />
                    ) : (
                      <img
                        src={`data:image/bmp;base64,${leftFinger5Value.image}`}
                        width={150}
                        height={180}
                      />
                    )}
                  </center>
                  <center>
                    <MatButton
                      type="button"
                      variant="contained"
                      color="primary"
                      onClick={(event) =>
                        captureFinger(event, "Left Little Finger")
                      }
                      className={"mt-4"}
                      style={{ backgroundColor: "#992E62" }}
                      startIcon={<FingerprintIcon />}
                    >
                      Capture Finger
                    </MatButton>
                  </center>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <br />
          <Row></Row>
        </CardBody>
      </Card>
    </>
  );
};

export default PatientBiometrics;
