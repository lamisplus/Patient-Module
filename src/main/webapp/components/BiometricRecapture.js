import React, { useState, useEffect, useCallback } from "react";
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
import { List } from "semantic-ui-react";
import { ToastContainer, toast } from "react-toastify";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import axios from "axios";
import { token, url as baseUrl } from "../../../api";
import CircularProgress from "@mui/material/CircularProgress";
import { Link, useHistory } from "react-router-dom";
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
    "& .sharp": {
      minWidth: "35px",
      padding: "5px",
      height: "35px",
      minHeight: "35px",
    },
  },
  error: {
    color: "#f85032",
    fontSize: "12.8px",
  },
}));

const BiometricRecapture = (props) => {
  const classes = useStyles();
  const history = useHistory();

  const permissions = history?.location?.state?.permissions || [];
  const currentPatientId = history?.location?.state?.patientObj?.patientId;
  const currentAge = history?.location?.state?.patientObj?.age;

  // State management
  const [biometricDevices, setBiometricDevices] = useState([]);
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
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [showCapture, setShowCapture] = useState(false);
  const [tryAgain, setTryAgain] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [storedBiometrics, setStoredBiometrics] = useState([]);
  const [capturedFingered, setCapturedFingered] = useState([]);
  const [recapturedFingered, setRecapturedFingered] = useState([]);
  const [imageQuality, setImageQuality] = useState(false);
  const [isNewStatus, setIsNewStatus] = useState(false);

  // Constants
  const MIN_FINGERS_REQUIRED = 6;
  const MAX_FINGERS = 10;
  const QUALITY_THRESHOLD = 60;
  const AGE_THRESHOLD = 6;

  // Calculate age from date of birth
  const calculateAge = useCallback((dob) => {
    if (!dob) return 0;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }, []);

  // Load finger codeset
  const loadFingerCodeset = useCallback(async () => {
    try {
      const response = await axios.get(
        `${baseUrl}application-codesets/v2/BIOMETRIC_CAPTURE_FINGERS`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error) {
      console.error("Error loading finger codeset:", error);
      return [];
    }
  }, []);

  // Get person biometrics
  const getPersonBiometrics = useCallback(async () => {
    try {
      const fingersCodeset = await loadFingerCodeset();

      const response = await axios.get(
        `${baseUrl}biometrics/person/${currentPatientId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data?.length > 0) {
        setStoredBiometrics(response.data);
        setPageLoading(true);

        const personCapturedFingers = _.uniq(
          _.map(response.data, "templateType"),
        );

        const biometricItems = _.map(fingersCodeset, (item) => ({
          ...item,
          captured: personCapturedFingers.includes(item.display),
        }));

        setFingerType(biometricItems);
      } else {
        const biometricItems = _.map(fingersCodeset, (item) => ({
          ...item,
          captured: false,
        }));
        setFingerType(biometricItems);
      }
    } catch (error) {
      console.error("Error getting person biometrics:", error);
      const fingersCodeset = await loadFingerCodeset();
      const biometricItems = _.map(fingersCodeset, (item) => ({
        ...item,
        captured: false,
      }));
      setFingerType(biometricItems);
      setPageLoading(true);
    }
  }, [currentPatientId, loadFingerCodeset]);

  // Clear store list
  const clearStoreList = useCallback(async () => {
    try {
      await axios.post(
        `${baseUrl}biometrics/store-list/${currentPatientId}`,
        currentPatientId,
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error) {
      console.error("Error clearing store list:", error);
    }
  }, [currentPatientId]);

  // Get recapture count
  const getRecaptureCount = useCallback(async () => {
    try {
      const response = await axios.get(
        `${baseUrl}biometrics/grouped/person/${currentPatientId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setRecapturedFingered(response.data || []);
    } catch (error) {
      console.error("Error getting recapture count:", error);
      setRecapturedFingered([]);
    }
  }, [currentPatientId]);

  // Load biometric devices
  const loadBiometricDevices = useCallback(async () => {
    try {
      const response = await axios.get(
        `${baseUrl}modules/check?moduleName=biometric`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data === true) {
        const devicesResponse = await axios.get(
          `${baseUrl}biometrics/devices?active=true`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const activeDevices = devicesResponse.data || [];
        setBiometricDevices(activeDevices);
        const activeDevice = activeDevices.find((x) => x.active === true);
        if (activeDevice) {
          setDevices(activeDevice);
        }
      }
    } catch (error) {
      console.error("Error loading biometric devices:", error);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    const init = async () => {
      await clearStoreList();
      await getPersonBiometrics();
      await loadBiometricDevices();
      await getRecaptureCount();
    };
    init();
  }, [
    clearStoreList,
    getPersonBiometrics,
    loadBiometricDevices,
    getRecaptureCount,
  ]);

  // Handle input changes
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setObjValues((prev) => ({
        ...prev,
        [name]: value,
        age: currentAge ? calculateAge(currentAge) : prev.age,
      }));
    },
    [currentAge, calculateAge],
  );

  // Validate form
  const validate = useCallback(() => {
    const temp = { ...errors };
    temp.templateType = objValues.templateType ? "" : "This field is required";
    setErrors(temp);
    return Object.values(temp).every((x) => x === "");
  }, [objValues.templateType, errors]);

  // Process captured biometrics
  const processCapturedBiometrics = useCallback((responseData) => {
    const templateType = responseData.templateType;
    const biometricsEnrollments = {
      ...responseData,
      capturedBiometricsList: _.uniqBy(
        responseData.capturedBiometricsList || [],
        "templateType",
      ),
    };

    setCapturedFingered((prev) => [...prev, biometricsEnrollments]);

    setFingerType((prev) => {
      const updated = [...prev];
      const found = _.find(updated, { display: templateType });
      if (found) {
        found.captured = true;
      }
      return updated;
    });

    setObjValues((prev) => ({ ...prev, templateType: "" }));
    setIsNewStatus(false);
  }, []);

  // Capture finger
  const captureFinger = useCallback(
    async (e) => {
      e.preventDefault();

      // Get captured biometrics from localStorage
      let capturedBiometricsList = [];
      const storedList = localStorage.getItem("capturedBiometricsList");
      if (storedList) {
        capturedBiometricsList = JSON.parse(storedList);
        localStorage.removeItem("capturedBiometricsList");
      }

      // Get deduplication data from localStorage
      let deduplication = {
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

      const storedDedup = localStorage.getItem("deduplicates");
      if (storedDedup) {
        deduplication = JSON.parse(storedDedup);
        localStorage.removeItem("deduplicates");
      }

      setObjValues((prev) => ({
        ...prev,
        capturedBiometricsList,
        deduplication,
      }));

      if (!validate()) return;

      setLoading(true);

      try {
        const response = await axios.post(
          `${devices.url}?reader=${devices.name}&isNew=${isNewStatus}&recapture=true&identify=false`,
          { ...objValues, capturedBiometricsList, deduplication },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setLoading(false);

        const responseData = response.data;

        if (responseData.type === "ERROR") {
          setTryAgain(true);
          toast.error(
            responseData.message?.ERROR || "Error capturing biometrics",
          );
          setIsNewStatus(false);
          return;
        }

        if (responseData.type === "WARNING") {
          // Handle imperfect match
          if (responseData.match === true) {
            toast.info(responseData.message?.RECAPTURE_MESSAGE, {
              autoClose: 10000,
            });
          } else if (responseData.match === false) {
            toast.error(responseData.message?.RECAPTURE_MESSAGE, {
              autoClose: 10000,
            });
          }

          // Check image quality for young patients
          if (
            responseData.imageQuality <= QUALITY_THRESHOLD &&
            calculateAge(currentAge) <= AGE_THRESHOLD
          ) {
            toast.info(
              "Image quality captured is poor. Please provide a reason for capture.",
              { position: toast.POSITION.BOTTOM_CENTER, autoClose: 20000 },
            );
            setImageQuality(true);
          }

          setTryAgain(false);
          setSuccess(true);
          processCapturedBiometrics(responseData);
          return;
        }

        if (responseData.type === "SUCCESS") {
          // Save to localStorage for Futronic devices
          localStorage.setItem(
            "capturedBiometricsList",
            JSON.stringify(responseData.capturedBiometricsList || []),
          );
          localStorage.setItem(
            "deduplicates",
            JSON.stringify(responseData.deduplication || {}),
          );

          // Check image quality for young patients
          if (
            responseData.imageQuality <= QUALITY_THRESHOLD &&
            calculateAge(currentAge) <= AGE_THRESHOLD
          ) {
            toast.info(
              "Image quality captured is poor. Please provide a reason for capture.",
              { position: toast.POSITION.BOTTOM_CENTER, autoClose: 20000 },
            );
            setImageQuality(true);
          }

          setTryAgain(false);
          setSuccess(true);

          if (responseData.match === true) {
            toast.success(responseData.message?.RECAPTURE_MESSAGE, {
              autoClose: 10000,
            });
          } else if (responseData.match === false) {
            toast.error(responseData.message?.RECAPTURE_MESSAGE, {
              autoClose: 10000,
            });
          }

          processCapturedBiometrics(responseData);
          return;
        }

        // Handle other cases
        setLoading(false);
        setTryAgain(true);
        toast.error("Something went wrong capturing biometrics...", {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      } catch (error) {
        setLoading(false);
        console.error("Error capturing finger:", error);
        toast.error("Failed to capture biometrics. Please try again.", {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      }
    },
    [
      devices,
      isNewStatus,
      objValues,
      validate,
      currentAge,
      calculateAge,
      processCapturedBiometrics,
    ],
  );

  // Save biometrics
  const saveBiometrics = useCallback(
    async (e) => {
      e.preventDefault();

      if (capturedFingered.length < MIN_FINGERS_REQUIRED) {
        toast.error(
          `You need to capture at least ${MIN_FINGERS_REQUIRED} fingers`,
          {
            position: toast.POSITION.BOTTOM_CENTER,
          },
        );
        return;
      }

      const capturedObj = capturedFingered[capturedFingered.length - 1];
      capturedObj.capturedBiometricsList = _.uniqBy(
        capturedObj.capturedBiometricsList || [],
        "templateType",
      );

      try {
        // Handle Futronic device special case
        if (capturedObj.deviceName?.includes("Futronic")) {
          const fingersObj = capturedFingered.map(
            (obj) => obj.capturedBiometricsList[0],
          );
          if (fingersObj.length === 0) {
            toast.error("No valid fingers to save", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            return;
          }
        }

        await axios.post(`${baseUrl}biometrics/templates`, capturedObj, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success("Biometric recaptured successfully", {
          position: toast.POSITION.BOTTOM_CENTER,
        });

        setCapturedFingered([]);
        await getPersonBiometrics();
        await getRecaptureCount();
      } catch (error) {
        console.error("Error saving biometrics:", error);
        toast.error("Something went wrong saving biometrics recapture", {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      }
    },
    [capturedFingered, getPersonBiometrics, getRecaptureCount],
  );

  // Delete temporary biometrics
  const deleteTempBiometrics = useCallback(async (x) => {
    try {
      await axios.delete(
        `${baseUrl}biometrics?personId=${x.patientId}&templateType=${x.templateType}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setFingerType((prev) => {
        const updated = [...prev];
        const found = _.find(updated, { display: x.templateType });
        if (found) {
          found.captured = false;
        }
        return updated;
      });

      setCapturedFingered((prev) =>
        prev.filter((data) => data.templateType !== x.templateType),
      );

      toast.info(`${x.templateType} captured removed successfully!`);
    } catch (error) {
      console.error("Error deleting biometrics:", error);
      toast.error("Something went wrong", {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    }
  }, []);

  // Get fingerprint quality badge
  const getFingerprintQuality = useCallback((imageQuality) => {
    if (imageQuality > 75) {
      return (
        <Badge color="success" style={{ fontSize: "12px" }}>
          {imageQuality + "%"}
        </Badge>
      );
    } else if (imageQuality > 60 && imageQuality <= 75) {
      return (
        <Badge color="warning" style={{ fontSize: "12px" }}>
          {imageQuality + "%"}
        </Badge>
      );
    } else {
      return (
        <Badge color="danger" style={{ fontSize: "12px" }}>
          {imageQuality + "%"}
        </Badge>
      );
    }
  }, []);

  // Check if user has permission
  const hasPermission =
    permissions.includes("capture_patient_biometrics") ||
    permissions.includes("all_permission");

  // Get available fingers
  const availableFingers = _.filter(fingerType, ["captured", false]);

  return (
    <div className={classes.root}>
      {hasPermission ? (
        <div
          style={{
            flex: 10,
            padding: "5px",
            marginLeft: "5px",
            border: "1px solid rgba(99, 99, 99, 0.2)",
            boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
          }}
        >
          <Row>
            <p>
              Patient recapture count:{" "}
              <b>{Math.max(0, recapturedFingered.length - 1)}</b>
              <Link to="/">
                <MatButton
                  className="float-right mr-1"
                  variant="contained"
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

            {/* Device Selection */}
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
                  Device
                </Label>
                <Input
                  type="select"
                  name="device"
                  id="device"
                  value={objValues.device}
                  disabled
                  style={{
                    border: "1px solid #014D88",
                    borderRadius: "0.2rem",
                  }}
                >
                  {biometricDevices.map(({ id, url, type }) => (
                    <option key={id} value={url}>
                      {type}
                    </option>
                  ))}
                </Input>
                {errors.device && (
                  <span className={classes.error}>{errors.device}</span>
                )}
              </FormGroup>
            </Col>

            {/* Finger Selection */}
            <Col md={3}>
              <FormGroup>
                <Label
                  for="templateType"
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
                  style={{
                    border: "1px solid #014D88",
                    borderRadius: "0.2rem",
                  }}
                >
                  <option value="">Select Finger</option>
                  {availableFingers.map((value) => (
                    <option key={value.id} value={value.display}>
                      {value.display}
                    </option>
                  ))}
                </Input>
                {errors.templateType && (
                  <span className={classes.error}>{errors.templateType}</span>
                )}
              </FormGroup>
            </Col>

            {/* Reason for recapture */}
            {capturedFingered.length >= MIN_FINGERS_REQUIRED &&
              capturedFingered.length < MAX_FINGERS && (
                <Col md={4}>
                  <FormGroup>
                    <Label
                      for="reason"
                      style={{
                        color: "#014d88",
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    >
                      Reason for recapturing less than {MAX_FINGERS} fingers
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
              )}

            {/* Capture Button */}
            <Col md={2}>
              {!loading ? (
                <MatButton
                  type="button"
                  variant="contained"
                  color="primary"
                  onClick={captureFinger}
                  className="mt-4"
                  style={{ backgroundColor: "#992E62" }}
                  startIcon={<FingerprintIcon />}
                  disabled={loading || availableFingers.length === 0}
                >
                  Capture Finger
                </MatButton>
              ) : (
                <MatButton
                  type="button"
                  variant="contained"
                  color="primary"
                  className="mt-4"
                  style={{ backgroundColor: "#992E62" }}
                  startIcon={<CircularProgress size={20} />}
                >
                  Capturing...
                </MatButton>
              )}
            </Col>

            {/* Loading Progress */}
            <Col md={12}>
              {loading && (
                <>
                  <b>Capturing finger...</b>
                  <LinearProgress />
                </>
              )}
            </Col>
          </Row>
        </div>
      ) : null}

      {/* Captured Fingers Display */}
      <Row>
        {capturedFingered.length >= 1 && (
          <>
            <Col md={12} style={{ marginTop: "10px", paddingBottom: "20px" }}>
              <List celled horizontal>
                {capturedFingered.map((x, index) => (
                  <List.Item
                    key={x.templateType || index}
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
                      {getFingerprintQuality(x.mainImageQuality)}
                      <span onClick={() => deleteTempBiometrics(x)}>
                        <span
                          name="cancel"
                          style={{ float: "right", cursor: "pointer" }}
                        >
                          ×
                        </span>
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
                      {x.mainImageQuality < 75 && (
                        <MatButton
                          type="button"
                          variant="contained"
                          color="secondary"
                          onClick={() => deleteTempBiometrics(x)}
                          startIcon={<RestartAltIcon />}
                        >
                          Reset recapture
                        </MatButton>
                      )}
                    </List.Content>
                  </List.Item>
                ))}
              </List>
            </Col>

            {/* Save Button */}
            <Col md={12}>
              <br />
              <MatButton
                type="button"
                variant="contained"
                color="primary"
                disabled={capturedFingered.length < MIN_FINGERS_REQUIRED}
                onClick={saveBiometrics}
                startIcon={<SaveIcon />}
              >
                Save Capture ({capturedFingered.length}/{MIN_FINGERS_REQUIRED}+)
              </MatButton>
            </Col>
          </>
        )}
      </Row>
    </div>
  );
};

export default BiometricRecapture;
