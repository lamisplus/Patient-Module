import React, {useCallback, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {makeStyles, withStyles} from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import ButtonMui from "@material-ui/core/Button";
import 'semantic-ui-css/semantic.min.css';
import { Col} from "reactstrap";
import { Step, Label, Segment, Icon } from "semantic-ui-react";
import PatientCard from './PatientCard'
import { useHistory } from "react-router-dom";
import { Tab } from 'semantic-ui-react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import axios from "axios";
import {token, url as baseUrl} from "../../../api";
import Swal from "sweetalert2";
import {Controller, useForm} from "react-hook-form";
import {Button, Card, CardContent, FormControl, Grid, MenuItem, Paper, TextField, Typography} from "@mui/material";
import {format} from 'date-fns';
import { toast} from "react-toastify";
import MaterialTable from 'material-table';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import MatButton from "@material-ui/core/Button";
import {TiArrowBack} from "react-icons/ti";
import Biometrics from "./Biometrics";
import moment from "moment";
import DualListBox from "react-dual-listbox";
import 'react-dual-listbox/lib/react-dual-listbox.css';
import _ from 'lodash';

import { DesktopDateTimePicker } from '@mui/x-date-pickers/DesktopDateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Stack from '@mui/material/Stack';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        marginBottom: 20,
        flexGrow: 1,
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
    checkinModal:{
        "& .modal-dialog":{
            maxWidth:"1000px"
        },
        "& .ui.label":{
            backgroundColor:"#fff",
            fontSize:'16px',
            color:'#014d88',
            fontWeight:'bold',
            textAlign:'left'
        },
        "& .card-title":{
            color:'#fff',
            fontWeight:'bold'
        },
        "& .form-control":{
            borderRadius:'0.25rem',
            height:'41px'
        },
        "& .card-header:first-child": {
            borderRadius: "calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0"
        },
        "& .dropdown-toggle::after": {
            display: " block !important"
        },
        "& select":{
            "-webkit-appearance": "listbox !important"
        },
        "& p":{
            color:'red'
        },
        "& label":{
            fontSize:'14px',
            color:'#014d88',
            fontWeight:'bold'
        }
    },
    checkInDatePicker:{
        '& .MuiFormControl-root.MuiTextField-root':{
            border:'1px solid #eee'
        }
    }
}));
const appointmentColumns = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
        field: 'firstName',
        headerName: 'First name',
        width: 150,
        editable: true,
    },
    {
        field: 'lastName',
        headerName: 'Last name',
        width: 150,
        editable: true,
    },
    {
        field: 'age',
        headerName: 'Age',
        type: 'number',
        width: 110,
        editable: true,
    },

];

const appointments = [
    // { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },

];


let newDate = new Date()
function PatientDashboard(props) {
    const userDetail = props.location && props.location.state ? props.location.state.user : null;
    const [loading, setLoading] = useState('');
    let history = useHistory();
    const classes = useStyles();
    const [checkInDate,setCheckInDate]=useState(new Date());
    const [checkOutDate,setCheckOutDate]=useState(new Date());
    const [today, setToday] = useState(new Date().toISOString().substr(0, 10).replace('T', ' '));
    const patientObj = history.location && history.location.state ? history.location.state.patientObj : {};
    const permissions = history.location && history.location.state ? history.location.state.permissions : [];
    const { handleSubmit, control } = useForm();
    const [modal, setModal] = useState(false);
    const [allServices, setAllServices] = useState(null);
    const [checkinStatus, setCheckinStatus]= useState(false)
    const [modalCheckOut, setModalCheckOut] = useState(false);
    const [services, setServices]= useState([]);
    const [selectedServices, setSelectedServices]= useState({"selected":[]});
    const [patientVisits, setPatientVisits]= useState([]);
    const [patientBiometricStatus, setPatientBiometricStatus]= useState(patientObj.biometricStatus);
    const [biometricsModuleInstalled,setBiometricsModuleInstalled]=useState(false);

    const [checkOutObj, setCheckOutObj] = useState({
        personId: "",
        visitStartDate:format(new Date(newDate), 'yyyy-MM-dd hh:mm')
    })
    const [checkInObj, setCheckInObj] = useState({
        serviceIds:"",
        visitDto: {
            personId: patientObj.id,
            checkInDate: format(new Date(newDate), 'yyyy-MM-dd hh:mm')
        }
    })

    const updatePatientBiometricStatus = (bioStatus) =>{
        setPatientBiometricStatus(bioStatus);
    }
    const loadServices = useCallback(async () => {
        try {
            const response = await axios.get(`${baseUrl}patient/post-service`, { headers: {"Authorization" : `Bearer ${token}`} });
            //setServices(response.data);
            setAllServices(response.data);
            setServices(
                Object.entries(response.data).map(([key, value]) => ({
                    label: value.moduleServiceName,
                    value: value.moduleServiceCode,
                }))
            );
/*            setSelectedServices(
                _.uniq(_.map(userDetail.applicationUserOrganisationUnits, 'organisationUnitName'))
            )*/
        } catch (e) {
            await Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'An error occurred fetching services!',
            });
        }
    }, []);
    const loadPatientVisits = useCallback(async () => {
        try {
            const response = await axios.get(`${baseUrl}patient/visit/visit-by-patient/${patientObj.id}`, { headers: {"Authorization" : `Bearer ${token}`} });
            setPatientVisits(response.data);
            response.data.map((visits)=> {
                if(visits.checkOutDate===null){
                    setCheckinStatus(true)
                }
            })


        } catch (e) {
            await Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'An error occurred fetching services!',
            });
        }
    }, []);

    const checkForBiometricsModule =()=>{
        axios
            .get(`${baseUrl}modules/check?moduleName=biometric`,
                { headers: {"Authorization" : `Bearer ${token}`} }
            )
            .then((response) => {
                if(response.data===true){
                    setBiometricsModuleInstalled(true);
                }
            })
            .catch((error) => {
                //console.log(error);
            });

    }
    const loadUserDetails = () =>{
        axios.get(`${baseUrl}account`).then((response)=>{

        }).catch((error)=>{

        })
    }

    useEffect(() => {
        loadUserDetails();
        loadServices();
        loadPatientVisits();
        checkForBiometricsModule();
    }, [loadServices, loadPatientVisits]);

    let visitTypesRows = null;
    if (services && services.length > 0) {
        visitTypesRows = services.map((service, index) => (
            <MenuItem key={service.moduleServiceCode} value={service.moduleServiceCode}>{service.moduleServiceName}</MenuItem>
        ));
    }

    const onChangeDate = (date) => {
        console.log(date.target.value)
        const newDate = moment(new Date(date.target.value)).format("yyyy-MM-dd hh:mm");
        setCheckInDate(newDate);
        console.log(newDate);
    };


    const columns = [
        {
            field: 'checkInDate',
            headerName: 'Checked In Date',
            width: 200,
            editable: false,
        },
        {
            field: 'checkOutDate',
            headerName: 'Check Out Date',
            width: 200,
            editable: false,
        },
        {
            field: 'service',
            headerName: 'Service',
            width: 200,
            editable: false,
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 200,
            editable: false,
        }
    ];

    const panes = [
        { menuItem: 'Visits', render: () =>
                <Tab.Pane>

                    <MaterialTable
                        title=""
                        columns={[
                            {
                                title: "Check-In Date",
                                field: "checkInDate", filtering: false,
                                headerStyle: {
                                    backgroundColor: "#039be5",
                                    border:'2px solid #fff',
                                    paddingRight:'30px'
                                }
                            },
                            { title: "Check-Out Date", field: "checkOutDate", filtering: false  },
                            { title: "Service", field: "service", filtering: false  },
                            { title: "Status", field: "status", filtering: false },
                        ]}
                        isLoading={loading}
                        data={patientVisits.map((row) => ({
                            checkInDate: moment(row.checkInDate).format("YYYY-MM-DD h:mm a"),
                            checkOutDate: row.checkOutDate?moment(row.checkOutDate).format("YYYY-MM-DD h:mm a"):"Visit Ongoing",
                            service:row.service,
                            status:(<h6 style={{color:row.status ==='COMPLETED' ? 'green' : 'red'}}>{row.status}</h6>),

                        }))}

                        options={{
                            headerStyle: {
                                backgroundColor: "#014d88",
                                color: "#fff",
                                fontSize:'16px',
                                padding:'10px',
                                fontWeight:'bold'
                            },
                            rowStyle: {
                                color: 'rgba(0,0,0,.87)',
                                fontFamily:`'poppins', sans-serif`
                            },
                            searchFieldStyle: {
                                width : '200%',
                                margingLeft: '250px',
                            },
                            filtering: false,
                            exportButton: false,
                            searchFieldAlignment: 'left',
                            pageSizeOptions:[10,20,100],
                            pageSize:10,
                            debounceInterval: 400
                        }}
                    />
                </Tab.Pane>
        },

/*        { menuItem: permissions.includes('view_patient_appointment') || permissions.includes("all_permission") ? 'Appointments' : "", render: () =>
                permissions.includes('view_patient_appointment') || permissions.includes("all_permission") ?
                    <Tab.Pane>
                        <div style={{ height: 400, width: '100%' }}>
                            <DataGrid
                                rows={appointments}
                                columns={appointmentColumns}
                                pageSize={5}
                                rowsPerPageOptions={[5]}
                                checkboxSelection
                                disableSelectionOnClick
                            />
                        </div>
                    </Tab.Pane>
                    :""
        },*/

                { menuItem: permissions.includes('view_patient_appointment') && biometricsModuleInstalled || permissions.includes("all_permission")  && biometricsModuleInstalled? 'Biometrics' : "", render: () =>
                        permissions.includes('view_patient_appointment') || permissions.includes("all_permission") ?
                            <Tab.Pane>
                                <div style={{ minHeight: 400, width: '100%' }}>
                                    <Biometrics patientId={patientObj.id} updatePatientBiometricStatus={updatePatientBiometricStatus}/>
                                </div>
                            </Tab.Pane>
                            :""
                }



    ];

    const handleCheckIn = () => {
        setModal(true);
    };
    const handleCheckOut = () => {
        setModalCheckOut(true);
    };

    const onCancelCheckIn = () => {
        setModal(false);
    };
    const onCancelCheckOut = () => {
        setModalCheckOut(false);
    };
    const onDelete = () => {

    };
/*    const handleInputChangeService = (e) => {
        setSelectedServices({ ...selectedServices, [e.target.name]: e.target.value });
    };*/
    //console.lo(selectedServices)

    const onSubmit = async (data) => {
        try {
            const today = new Date();
            const visitDetails = await axios.get(`${baseUrl}patient/visit/visit-detail/${patientObj.id}`, { headers: {"Authorization" : `Bearer ${token}`} });
            const visitDetail = visitDetails.data;
            const pendingVisit = visitDetail.find(obj => obj.status == "PENDING");
            let visit = null;
            if (!pendingVisit) {
                const visitResponse = await axios.post(`${baseUrl}patient/visit`, {
                    "personId": patientObj.id,
                    "visitStartDate": today
                }, { headers: {"Authorization" : `Bearer ${token}`} });
                visit = visitResponse.data;
            } else {
                visit = pendingVisit;
            }
            await axios.post(`${baseUrl}patient/encounter`, {
                "encounterDate": today,
                "personId": patientObj.id,
                "serviceCode": data.VisitType,
                "status": "PENDING",
                "visitId": visit.id
            }, { headers: {"Authorization" : `Bearer ${token}`} });
            setModal(false);
            await Swal.fire({
                icon: 'success',
                text: 'CheckedIn successfully',
                timer: 1500
            });
        } catch (e) {
            await Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'An error occurred while checking in Patient!',
            });
        }
    };
    const onError = async () => {
        await Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'An error occurred while checking in Patient!',
        });
    };

    let checkInServicesID = [];
    /**** Submit Button For CheckIN  */
    const handleSubmitCheckIn = (e) => {
        e.preventDefault();
        //Check if selected service object is empty before creating visit and posting.
        let m = moment(checkInDate, "yyyy-MM-DD hh:mm").format('yyyy-MM-DD H:mm');
        if(selectedServices.selected.length > 0 && moment(m).isValid()){
            selectedServices.selected.length > 0 && selectedServices.selected.map((service)=> {
                checkInServicesID.push(_.find(allServices,{moduleServiceCode:service}).id)
            });

            checkInObj.serviceIds= checkInServicesID
            //Ensure date time is in 24hr format
            checkInObj.visitDto.checkInDate = moment(checkInDate, "yyyy-MM-DD hh:mm").format('yyyy-MM-DD HH:mm');
            axios.post(`${baseUrl}patient/visit/checkin`, checkInObj,
                { headers: {"Authorization" : `Bearer ${token}`}},

            )
                .then(response => {
                    toast.success("Patient Check-In successful");
                    setCheckinStatus(true)
                    onCancelCheckIn()
                    loadPatientVisits()
                })
                .catch(error => {
                    console.log(error)
                    toast.error("Something went wrong");
                    onCancelCheckIn()
                });
        }else{
            toast.error("Kindly check the form for a valid date and selected services");
        }

    }

    /**** Submit Button Processing  */
    const handleSubmitCheckOut = (e) => {
        e.preventDefault();
        const getVisitID= patientVisits.find((visits)=> visits.status==='PENDING')

        axios.put(`${baseUrl}patient/visit/checkout/${getVisitID.id}`,getVisitID.id,
            { headers: {"Authorization" : `Bearer ${token}`}},

        )
            .then(response => {
                toast.success("Record save successful");
                setCheckinStatus(false)
                onCancelCheckOut()
                loadPatientVisits()
            })
            .catch(error => {
                console.log(error)
                toast.error("Something went wrong");
                onCancelCheckOut()
            });
    }
    const onServiceSelect = (selectedValues) => {
        setSelectedServices({"selected":selectedValues});
    };

    return (
        <div className={classes.root}>
            <Card>
                <CardContent>

                    <PatientCard patientObj={patientObj} permissions={permissions} patientBiometricStatus={patientBiometricStatus}/>
                    <Card style={{marginTop:'10px',boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px'}}>
                        <CardContent>
                            <div className="row">
                                <div className="mb-3 col-md-3">
                                    &nbsp;
                                </div>
                                <div className="mb-3 col-md-3">
                                    &nbsp;
                                </div>
                                <div className="mb-3 col-md-3">
                                    &nbsp;
                                </div>
                                <div className="mb-3 col-md-3">

                                    <Link to={"/"} >
                                        <MatButton
                                            className=" float-right mr-1"
                                            variant="contained"
                                            floated="left"
                                            startIcon={<TiArrowBack  />}
                                            style={{backgroundColor:"rgb(153, 46, 98)", color:'#fff', height:'35px'}}
                                        >
                                            <span style={{ textTransform: "capitalize" }}>Back</span>
                                        </MatButton>
                                    </Link>

                                    {permissions.includes('patient_check_in') || permissions.includes("all_permission") ? (
                                            <>
                                                {checkinStatus===false ? (
                                                        <Button
                                                            variant="contained"
                                                            style={{ backgroundColor: "rgb(4, 196, 217)", fontSize:'14PX', fontWeight:'bold', height:'35px' }}
                                                            onClick={handleCheckIn}
                                                            className=" float-right mr-1"
                                                        >
                                                            <span style={{ textTransform: "capitalize" }}>CheckIn</span>
                                                        </Button>
                                                    )
                                                    :
                                                    ""
                                                }
                                            </>
                                        )
                                        :""
                                    }
                                    {checkinStatus===true ? (
                                            <Button
                                                variant="contained"
                                                style={{ backgroundColor: "green", fontSize:'14PX', fontWeight:'bold', height:'35px' }}
                                                onClick={handleCheckOut}
                                                className=" float-right mr-1"
                                            >
                                                <span style={{ textTransform: "capitalize" }}>Check Out</span>
                                            </Button>
                                        )
                                        :
                                        ""
                                    }

                                </div>
                            </div>
                            <Tab panes={panes} />
                        </CardContent>
                    </Card>


                </CardContent>
            </Card>
            <Modal  size="lg" style={{maxWidth: '900px'}} isOpen={modal} toggle={onCancelCheckIn}  className={classes.checkinModal}>
                    <ModalHeader toggle={onCancelCheckIn}><h5 style={{fontWeight:"bold",fontSize:'30px',color:'#992E62'}}>Select Check-In Service</h5></ModalHeader>
                    <ModalBody>
                        <form onSubmit={handleSubmitCheckIn}>
                            <Paper
                                style={{
                                    display: "grid",
                                    gridRowGap: "20px",
                                    padding: "20px",
                                    margin: "10px 10px",
                                }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <FormGroup style={{width:'100%'}} className={classes.checkInDatePicker}>
                                            <LocalizationProvider dateAdapter={AdapterDateFns} >
                                                <Label for="post-services" style={{color:'#014d88',fontWeight:'bolder',fontSize:'18px'}}>Check-In Date *</Label>
                                                <DesktopDateTimePicker
                                                    renderInput={(params) =>
                                                        <TextField
                                                            {...params}

                                                            sx={{
                                                                /*label:{ color:'#014d88',fontWeight:'bolder',fontSize:'18px' }*/
                                                                input:{fontSize:'14px'},
                                                            }}
                                                            fullWidth
                                                        />
                                                    }
                                                    value={checkInDate}
                                                    onChange={(newValue) => {
                                                        setCheckInDate(newValue);
                                                    }}
                                                    maxDate={new Date()}
                                                    maxTime={new Date()}
                                                    style={{width:'100%'}}
                                                />
                                            </LocalizationProvider>
                                        </FormGroup>
                                    </Grid>
                                    {/*                                <Grid item xs={8}>

                                    <FormControl >
                                        <Label for="dateOfRegistration">Select service </Label>
                                        <Autocomplete
                                            multiple
                                            id="checkboxes-tags-demo"
                                            options={services}
                                            //disableCloseOnSelect
                                            getOptionLabel={(option) => option.moduleServiceName}
                                            onChange={(e, i) => {
                                                console.log(i)
                                                setSelectedServices({ ...selectedServices, checkInServices: i });
                                            }}
                                            renderOption={(props, option, { selected }) => (
                                                <li {...props}>
                                                    <Checkbox
                                                        icon={icon}
                                                        checkedIcon={checkedIcon}
                                                        style={{ marginRight: 8 }}
                                                        checked={selected}
                                                    />
                                                    {option.moduleServiceName}
                                                </li>
                                            )}
                                            style={{ width: 400 }}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Services" />
                                            )}
                                        />

                                    </FormControl>
                                </Grid>*/}
                                    <Grid item xs={12}>
                                        <FormGroup>
                                            <Label for="post-services" style={{color:'#014d88',fontWeight:'bolder',fontSize:'18px'}}><h5 style={{fontWeight:"bold",fontSize:'30px',color:'#992E62'}}>Check-In Service *</h5></Label>
                                            <DualListBox
                                                options={services}
                                                onChange={onServiceSelect}
                                                selected={selectedServices.selected}
                                            />
                                        </FormGroup>
                                    </Grid>
                                </Grid>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Button type={"submit"} variant="contained" color={"primary"}>Submit</Button>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </form>
                    </ModalBody>
            </Modal>
            {/* Modal for CheckOut Patient */}
            <Modal isOpen={modalCheckOut} toggle={onCancelCheckOut} className={classes.checkinModal} style={{maxWidth: '900px',height:"800px"}}>
                <ModalHeader toggle={onCancelCheckOut}><h5 style={{fontWeight:"bold",fontSize:'30px',color:'#014d88'}}>Check Out </h5></ModalHeader>
                <ModalBody>
                    <form >
                        <Paper
                            style={{
                                display: "grid",
                                gridRowGap: "20px",
                                padding: "20px",
                                margin: "10px 10px",
                            }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <h5 style={{color:'#992E62',fontSize:"20px", fontWeight:'bold'}}>Are you sure you want to check-out patient?</h5>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormGroup style={{width:'100%'}} className={classes.checkInDatePicker}>
                                        <LocalizationProvider dateAdapter={AdapterDateFns} >
                                            <Label for="post-services" style={{color:'#014d88',fontWeight:'bolder',fontSize:'16px'}}>Check-Out Date *</Label>
                                            <DesktopDateTimePicker
                                                renderInput={(params) =>
                                                    <TextField
                                                        {...params}

                                                        sx={{
                                                            /*label:{ color:'#014d88',fontWeight:'bolder',fontSize:'18px' }*/
                                                            input:{fontSize:'14px'},
                                                        }}
                                                        fullWidth
                                                    />
                                                }
                                                value={checkOutDate}
                                                onChange={(newValue) => {
                                                    setCheckOutDate(newValue);
                                                }}
                                                maxDate={new Date()}
                                                maxTime={new Date()}
                                                style={{width:'100%'}}
                                            />
                                        </LocalizationProvider>
                                    </FormGroup>
                                </Grid>

                            </Grid>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Button type={"submit"} onClick={handleSubmitCheckOut} variant="contained" color={"primary"}>Yes</Button>
                                    <Button  onClick={onCancelCheckOut} variant="contained" style={{backgroundColor:'#992E62',color:"#fff",marginLeft:"10px"}}>Cancel</Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    </form>
                </ModalBody>
            </Modal>
            {/* End of Checkout Modal */}
        </div>
    );
}

export default PatientDashboard;
