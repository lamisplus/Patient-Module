import React, { useEffect, useState } from "react";
import axios from "axios";
import { token, url as baseUrl } from "../../../../api";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { useLocation } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@material-ui/core";
import { Col, Row } from "reactstrap";
import { Label } from "semantic-ui-react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';

const styles = (theme) => ({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  icon: {
    verticalAlign: "bottom",
    height: 20,
    width: 20,
  },
  details: {
    alignItems: "center",
  },
  column: {
    flexBasis: "20.33%",
  },
  helper: {
    borderLeft: `2px solid ${theme.palette.divider}`,
    padding: `${theme.spacing(1)}px ${theme.spacing(1) * 2}px`,
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
});
function Index(props) {
  const { classes } = props;
  const location = useLocation();

  const patientData = location.state;

  const patientObj =
    Object.keys(props.patientObj).length > 0 ? props.patientObj : patientData;

  const permissions = props.permissions ? props.permissions : [];
  const [modal, setModal] = useState(false);
  const [patientBiometricStatus, setPatientBiometricStatus] = useState(
    props.patientBiometricStatus
  );
  const toggleModal = () => setModal(!modal);

  const [biometricStatus, setBiometricStatus] = useState(false);
  const [biometricCount, setBiometricCount] = useState([]);
  const [devices, setDevices] = useState([]);
  useEffect(() => {
    setPatientBiometricStatus(props.patientBiometricStatus);
    TemplateType();
    BiometricCount();
  }, [props.patientBiometricStatus]);
  //Get list of KP
  const TemplateType = () => {
    axios
      .get(`${baseUrl}modules/check?moduleName=biometric`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setBiometricStatus(response.data);
        if (response.data === true) {
          axios
            .get(`${baseUrl}biometrics/devices`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
              setDevices(response.data);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  const BiometricCount = () => {
    axios
      .get(`${baseUrl}biometrics/person/${patientObj.uuid}/biometric-count`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log(response.data)
          setBiometricCount(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };


  const getHospitalNumber = (identifier) => {
    const hospitalNumber = identifier?.identifier?.find(
      (obj) => obj.type == "HospitalNumber"
    );
    return hospitalNumber ? hospitalNumber.value : "";
  };

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);

    let ageYears = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      ageYears <= 0 &&
      monthDifference < 0 &&
      today.getDate() < birthDate.getDate()
    ) {
      ageYears--;
    }

    if (ageYears === 0) {
      return monthDifference === 0
        ? "Less than a month"
        : `${monthDifference} month(s)`;
    }

    return ageYears === 1 ? "1 year" : `${ageYears} years`;
  };

  const getPhone = (contactPoint) => {
    const phoneContact = contactPoint?.contactPoint?.find(
      (obj) => obj.type == "phone"
    );
    return phoneContact ? phoneContact.value : "";
  };

  const getAddress = (address) => {
    const city =
      address && address.address && address.address.length > 0
        ? `${address.address[0].line[0]}, ${address.address[0].city}`
        : null;
    return city;
  };

  const handleBiometricCapture = (id) => {
    let patientObjID = id;
    setModal(!modal);
  };
  return (
    <div className={classes.root}>
      <Accordion defaultExpanded>
        <AccordionSummary>
          <Row>
            <Col md={11}>
              <Row className={"mt-1"}>
                <Col md={12} className={classes.root2}>
                  <b style={{ fontSize: "25px", color: "rgb(153, 46, 98)" }}>
                    {patientObj.surname + ", " + patientObj.firstName}
                  </b>
                </Col>
                <Col
                  md={4}
                  className={classes.root2}
                  style={{ marginTop: "10px" }}
                >
                  <span style={{ color: "#000" }}>
                    {" "}
                    Hospital Number :{" "}
                    <b style={{ color: "#0B72AA" }}>
                      {getHospitalNumber(patientObj.identifier)}
                    </b>
                  </span>
                </Col>

                <Col
                  md={4}
                  className={classes.root2}
                  style={{ marginTop: "10px" }}
                >
                  <span style={{ color: "#000" }}>
                    Date Of Birth :{" "}
                    <b style={{ color: "#0B72AA" }}>{patientObj.dateOfBirth}</b>
                  </span>
                </Col>
                <Col
                  md={4}
                  className={classes.root2}
                  style={{ marginTop: "10px" }}
                >
                  <span style={{ color: "#000" }}>
                    {" "}
                    Age :{" "}
                    <b style={{ color: "#0B72AA" }}>
                      {calculateAge(patientObj.dateOfBirth)}
                    </b>
                  </span>
                </Col>
                <Col md={4} style={{ marginTop: "10px" }}>
                  <span style={{ color: "#000" }}>
                    {" "}
                    Sex :{" "}
                    <b
                      style={{
                        color: "#0B72AA",
                        fontFamily: `'poppins', sans-serif`,
                        fontWeight: "bolder",
                      }}
                    >
                      {patientObj.sex}
                    </b>
                  </span>
                </Col>
                <Col
                  md={4}
                  className={classes.root2}
                  style={{ marginTop: "10px" }}
                >
                  <span style={{ color: "#000" }}>
                    {" "}
                    Phone Number :{" "}
                    <b style={{ color: "#0B72AA" }}>
                      {getPhone(patientObj?.contactPoint)}
                    </b>
                  </span>
                </Col>
                <Col
                  md={4}
                  className={classes.root2}
                  style={{ marginTop: "10px" }}
                >
                  <span style={{ color: "#000" }}>
                    {" "}
                    Address :{" "}
                    <b style={{ color: "#0B72AA" }}>
                      {getAddress(patientObj.address)}{" "}
                    </b>
                  </span>
                </Col>
              </Row>
            </Col>
          </Row>
        </AccordionSummary>
        <AccordionDetails className={classes.details}>
          <div>
          {biometricStatus === true ? (
            <>
              <div>
                <Typography variant="caption">
                  <Label
                    style={{ height: "30px", fontSize: "14px" }}
                    color={patientBiometricStatus === true ? "green" : "red"}
                    size={"large"}
                  >
                    Biometrics{" "}
                    {patientBiometricStatus === true
                      ? "Captured"
                      : "Not Captured"}
                  </Label>
                </Typography>
              </div>
            </>
          ) : (
            <>
              <div>
                <Typography variant="caption">
                  <Label
                    color={"red"}
                    style={{ height: "30px", fontSize: "14px" }}
                  >
                    Biometrics Module Not Install
                  </Label>
                </Typography>
              </div>
            </>
          )}
          </div>
          <div>
          <Paper
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              listStyle: 'none',
              p: 0.5,
              m: 0,
            }}
            component="ul"
          >


      {biometricCount.map((item, index) => (
        <Chip
          key={index}
          label={'R' + item.recapture +' - '+ item.count}
          sx={{
            fontSize: '16px',
            padding: '5px',
            backgroundColor: item.count < 6 ? 'maroon' : '',
            color: item.count < 6 ? 'white' : ''

          }}
        />
      ))}

          </Paper>
        </div>
      </AccordionDetails>
    </Accordion>
      {/*
            <CaptureBiometric  modalstatus={modal} togglestatus={toggleModal} patientId={patientObj.id} biometricDevices={devices} setPatientBiometricStatus={setPatientBiometricStatus} />
*/}
    </div>
  );
}

Index.propTypes = {
  classes: PropTypes.object.isRequired,
};

function numberToWord(number) {
  const units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  if (number === 0) return 'zero';
  if (number < 0) return 'minus ' + numberToWord(-number);

  let words = '';

  if (number >= 1000) {
      words += numberToWord(Math.floor(number / 1000)) + ' thousand ';
      number %= 1000;
  }

  if (number >= 100) {
      words += units[Math.floor(number / 100)] + ' hundred ';
      number %= 100;
  }

  if (number >= 20) {
      words += tens[Math.floor(number / 10)] + ' ';
      number %= 10;
  }

  if (number >= 10) {
      words += teens[number - 10];
      number = 0;
  }

  if (number > 0) {
      words += units[number];
  }

  return words.trim();
}

export default withStyles(styles)(Index);
