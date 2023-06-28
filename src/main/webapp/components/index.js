import React, {useEffect, useState} from 'react';
import {ToastContainer} from "react-toastify";
import {Card, CardBody, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {Link} from "react-router-dom";
import Button from "@material-ui/core/Button";
import MatButton from "@material-ui/core/Button";
import {FaUserPlus} from "react-icons/fa";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import MaterialTable from "material-table";
import {makeStyles} from "@material-ui/core/styles";
import axios from "axios";
import {token, url as baseUrl} from "../../../api";
import {Tab} from "semantic-ui-react";
import Biometrics from "./Biometrics";
import PatientList from "./Home/PatientList";
import BiometricsCapture from "./Home/Biometrics";
import BiometricsList from "./Home/BiometricsList";
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import CheckedInPatients from "./Home/CheckedInPatients";
import MigrationDQA from "./MigrationDQA";

const useStyles = makeStyles(theme => ({
    card: {
        margin: theme.spacing(20),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(3)
    },
    submit: {
        margin: theme.spacing(3, 0, 2)
    },
    cardBottom: {
        marginBottom: 20
    },
    Select: {
        height: 45,
        width: 350
    },
    button: {
        margin: theme.spacing(1)
    },

    root: {
        '& > *': {
            margin: theme.spacing(1)
        },
        '& a':{
            textDecoration:'none !important'
        }
    },
    input: {
        display: 'none'
    },
    error: {
        color: "#f85032",
        fontSize: "11px",
    },
    success: {
        color: "#4BB543 ",
        fontSize: "11px",
    },
}));
function Index(props) {
    const classes = useStyles();
    const [patients, setPatients] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState('');
    const [modal, setModal] = useState(false);
    const [patient, setPatient] = useState(false);
    const [enablePPI, setEnablePPI] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const toggle = (id) => {
        const patient = patients.find(obj => obj.id == id);
        setPatient(patient);
        setModal(!modal);
    }

    const handleSave = () => {
        console.log("success");
    };

    useEffect(() => {
        userPermission();
    }, []);

    const handleModalClose = () => {
        console.log('Opening modal working ...')
        setShowModal(false);
    }

    const identify = () => {
        console.log('Started identification ...')
    }
    //Get list of Finger index
    const userPermission =()=>{
        axios
            .get(`${baseUrl}account`,
                { headers: {"Authorization" : `Bearer ${token}`} }
            )
            .then((response) => {
                setPermissions(response.data.permissions);

            })
            .catch((error) => {
            });

    }

    const biometricIdentification =() => {
        console.log('Opening modal working ...')
        setShowModal(!showModal);
    }

    const enablePPIColumns = () =>{
        setEnablePPI(!enablePPI)
    }
    const panes = [
        { menuItem: 'Clients', render: () =>
                <Tab.Pane>
                    <PatientList permissions={permissions}/>
                </Tab.Pane>
        },
        { menuItem: 'Checked-In', render: () =>
                <Tab.Pane>
                    <CheckedInPatients permissions={permissions}/>
                </Tab.Pane>
        },
       { menuItem: 'Patient Biometrics', render: () =>
                <Tab.Pane>
                    <BiometricsCapture permissions={permissions}/>
                </Tab.Pane>
        },
//        { menuItem: 'Missing Biometrics', render: () =>
//                <Tab.Pane>
//                    <BiometricsList permissions={permissions}/>
//                </Tab.Pane>
//        },
        { menuItem: 'Migration DQA', render: () =>
                <Tab.Pane>
                    <MigrationDQA permissions={permissions}/>
                </Tab.Pane>
        },
    ];

    return (
        <div className={classes.root}>
            <ToastContainer autoClose={3000} hideProgressBar />
            {permissions.length > 0 &&
                <Card>
                    <CardBody>
                        <div className="row mb-12 col-md-12">
                            <div className="mb-6 col-md-6" >
                                <Breadcrumbs aria-label="breadcrumb">
                                    <Typography style={{color:'#992E62'}}>Patient</Typography>
                                    <Typography style={{color:'#014d88'}}>Home</Typography>
                                </Breadcrumbs>

                            </div>
                            <div className="row mb-6 col-md-6">
                                <div className="mb-6 col-md-6">
                                    {permissions.includes('view_patient') || permissions.includes("all_permission") ? (
                                        <MatButton
                                            type="button"
                                            variant="contained"
                                            color="secondary"
                                            className=" float-right mr-1"
                                            onClick={biometricIdentification}
                                        >
                                            <span style={{ textTransform: "capitalize", fontWeight:'bolder' }}>Biometric Identification</span>
                                        </MatButton>
                                    ):""
                                    }
                                </div>
                                <div className="mb-6 col-md-6">
                                    {permissions.includes('view_patient') || permissions.includes("all_permission") ? (
                                        <Link to={"register-patient"}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                className=" float-right mr-1"
                                                startIcon={<FaUserPlus size="25"/>}
                                                style={{backgroundColor:'#014d88'}}
                                            >
                                                <span style={{ textTransform: "capitalize", fontWeight:'bolder' }}>New Client</span>
                                            </Button>
                                        </Link>
                                    ):""
                                    }
                                </div>
                            </div>
                        </div>

                        <Tab panes={panes} />
                    </CardBody>
                </Card>
            }
            <Modal show={showModal} >

                <Modal.Header>
                    <Modal.Title>Client Identification</Modal.Title>
                    <Button
                        variant=""
                        className="btn-close"
                        onClick={() => setModal(false)}
                    >

                    </Button>
                </Modal.Header>
                <Modal.Body>
                    <p>Please click the identify button <br/>
                        and then place your finger on the scanner</p>
                    <br/>
                    <MatButton
                        type="button"
                        variant="contained"
                        color="primary"
                        className="ms-2"
                        onClick={() => identify()}
                    >
                        Identify
                    </MatButton>

                </Modal.Body>

            </Modal>
        </div>

    );
}

export default Index;