import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { token, url as baseUrl } from '../../../api';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@material-ui/core/Typography';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@material-ui/core';
import { Col, Row } from 'reactstrap';
import { Label } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  icon: {
    verticalAlign: 'bottom',
    height: 20,
    width: 20,
  },
  details: {
    alignItems: 'center',
  },
  column: {
    flexBasis: '20.33%',
  },
  helper: {
    borderLeft: `2px solid ${theme.palette.divider}`,
    padding: `${theme.spacing(1)}px ${theme.spacing(1) * 2}px`,
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
});

function PatientsCard(props) {
  const { classes } = props;
  const patientObj = props.patientObj ? props.patientObj : {};
  const permissions = props.permissions ? props.permissions : [];
  const [modal, setModal] = useState(false); //Modal to collect sample
  const [patientBiometricStatus, setPatientBiometricStatus] = useState(true);
  const toggleModal = () => setModal(!modal);

  const [biometricStatus, setBiometricStatus] = useState(true);
  const [devices, setDevices] = useState([]);
  useEffect(() => {
    //setPatientBiometricStatus(props.patientBiometricStatus)
    TemplateType();
  }, []);
  //Get list of KP
  const TemplateType = () => {
    axios
      .get(`${baseUrl}modules/check?moduleName=biometric`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setBiometricStatus(response.data);
        if (response.data === true) {
          axios
            .get(`${baseUrl}biometrics/devices`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then(response => {
              setDevices(response.data);
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
  const getHospitalNumber = identifier => {
    const hospitalNumber = identifier.identifier.find(
      obj => obj.type == 'HospitalNumber'
    );
    return hospitalNumber ? hospitalNumber.value : '';
  };

  const calculate_age = dob => {
    const today = new Date();
    const dateParts = dob.split('-');
    const birthDate = new Date(dob);
    let age_now = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (age_now <= 0 && m < 0 && today.getDate() < birthDate.getDate()) {
      age_now--;
    }

    if (age_now === 0) {
      return m + ' month(s)';
    }
    return age_now + ' year(s)';
  };

  const getPhone = contactPoint => {
    console.error('contact', contactPoint);
    const phoneContact = contactPoint?.contactPoint?.find(
      obj => obj.type == 'phone'
    );
    return phoneContact ? phoneContact.value : '';
  };

  const getAddress = address => {
    const city =
      address && address.address && address.address.length > 0
        ? `${address.address[0].line[0]}, ${address.address[0].city}`
        : null;
    return city;
  };

  const handleBiometricCapture = id => {
    let patientObjID = id;
    setModal(!modal);
  };

  return (
    <div className={classes.root}>
      <Accordion defaultExpanded>
        <AccordionSummary>
          <Row>
            <Col md={11}>
              <Row className={'mt-1'}>
                <Col md={12} className={classes.root2}>
                  <b style={{ fontSize: '25px', color: 'rgb(153, 46, 98)' }}>
                    {patientObj.surname + ', ' + patientObj.firstName}
                  </b>
                </Col>
                <Col
                  md={4}
                  className={classes.root2}
                  style={{ marginTop: '10px' }}
                >
                  <span style={{ color: '#000' }}>
                    {' '}
                    Hospital Numbers :{' '}
                    <b style={{ color: '#0B72AA' }}>
                      {getHospitalNumber(patientObj.identifier)}
                    </b>
                  </span>
                </Col>

                <Col
                  md={4}
                  className={classes.root2}
                  style={{ marginTop: '10px' }}
                >
                  <span style={{ color: '#000' }}>
                    Date Of Birth :{' '}
                    <b style={{ color: '#0B72AA' }}>{patientObj.dateOfBirth}</b>
                  </span>
                </Col>
                <Col
                  md={4}
                  className={classes.root2}
                  style={{ marginTop: '10px' }}
                >
                  <span style={{ color: '#000' }}>
                    {' '}
                    Age :{' '}
                    <b style={{ color: '#0B72AA' }}>
                      {calculate_age(patientObj.dateOfBirth)}
                    </b>
                  </span>
                </Col>
                <Col md={4} style={{ marginTop: '10px' }}>
                  <span style={{ color: '#000' }}>
                    {' '}
                    Sex :{' '}
                    <b
                      style={{
                        color: '#0B72AA',
                        fontFamily: `'poppins', sans-serif`,
                        fontWeight: 'bolder',
                      }}
                    >
                      {patientObj.sex}
                    </b>
                  </span>
                </Col>
                <Col
                  md={4}
                  className={classes.root2}
                  style={{ marginTop: '10px' }}
                >
                  <span style={{ color: '#000' }}>
                    {' '}
                    Phone Number :{' '}
                    <b style={{ color: '#0B72AA' }}>
                      {getPhone(patientObj?.contactPoint)}
                    </b>
                  </span>
                </Col>
                <Col
                  md={4}
                  className={classes.root2}
                  style={{ marginTop: '10px' }}
                >
                  <span style={{ color: '#000' }}>
                    {' '}
                    Address :{' '}
                    <b style={{ color: '#0B72AA' }}>
                      {getAddress(patientObj.address)}{' '}
                    </b>
                  </span>
                </Col>
              </Row>
            </Col>
          </Row>
        </AccordionSummary>
        <AccordionDetails className={classes.details}>
          {biometricStatus === true ? (
            <>
              <div>
                <Typography variant="caption">
                  <Label
                    style={{ height: '30px', fontSize: '14px' }}
                    color={patientBiometricStatus === true ? 'green' : 'red'}
                    size={'large'}
                  >
                    {`Biometrics: `}
                    {patientBiometricStatus === true
                      ? 'Captured'
                      : 'Not Captured'}
                  </Label>
                </Typography>
              </div>
            </>
          ) : (
            <>
              <div>
                <Typography variant="caption">
                  <Label
                    color={'red'}
                    style={{ height: '30px', fontSize: '14px' }}
                  >
                    Biometrics Module Not Install
                  </Label>
                </Typography>
              </div>
            </>
          )}
        </AccordionDetails>
      </Accordion>
      {/*
            <CaptureBiometric  modalstatus={modal} togglestatus={toggleModal} patientId={patientObj.id} biometricDevices={devices} setPatientBiometricStatus={setPatientBiometricStatus} />
*/}
    </div>
  );
}

PatientsCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PatientsCard);
