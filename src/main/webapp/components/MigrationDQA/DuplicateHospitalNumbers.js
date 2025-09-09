import React, {forwardRef, useCallback, useEffect, useRef, useState} from 'react';
import axios from "axios";
import {token, url as baseUrl} from "../../../../api";
import MaterialTable from "material-table";
import Swal from "sweetalert2";

import {FaEye} from "react-icons/fa";
import {MdDeleteForever, MdModeEdit, MdPerson} from "react-icons/md";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import AddBox from "@material-ui/icons/AddBox";
import Check from "@material-ui/icons/Check";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Edit from "@material-ui/icons/Edit";
import SaveAlt from "@material-ui/icons/SaveAlt";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import Search from "@material-ui/icons/Search";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import Remove from "@material-ui/icons/Remove";
import ViewColumn from "@material-ui/icons/ViewColumn";
import {makeStyles} from "@material-ui/core/styles";
import {ToastContainer} from "react-toastify";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import Button from "@material-ui/core/Button";
import SplitActionButton from "../SplitActionButton";

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};


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

function DuplicateHospitalNumbers(props) {
    const tableRef = useRef(null);
    const classes = useStyles();
    const [patients, setPatients] = useState([]);
    const [permissions, setPermissions] = useState(props.permissions);
    const [loading, setLoading] = useState('');
    const [modal, setModal] = useState(false);
    const [patient, setPatient] = useState(false);
    const [enablePPI, setEnablePPI] = useState(true);
    const [searchParams,setSearchParams] = useState('*');
    const [totalPages,setTotalPages] = useState(0);
    const [totalRecords,setTotalRecords] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage,setCurrentPage] = useState(1);
    const toggle = (id) => {
        const patient = patients.find(obj => obj.id == id);
        setPatient(patient);
        setModal(!modal);
    }

    const handleDelete = (id) => {
        axios
            .delete(`${baseUrl}patient/delete/${id}`,
                { headers: {"Authorization" : `Bearer ${token}`} }
            )
            .then((response) => {
                Swal.fire({
                      icon: 'success',
                      text: 'DQA Deleted Successfully',
                      timer: 1500
                 });
            })
            .catch((error) => {
                 Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'An error occurred while deleting!!!',
                });
            });
    }

    function actionItems(row){
        return  [
            {
                name:'View',
                type:'link',
                icon:<FaEye  size="22"/>,
                to:{
                    pathname: "/register-patient",
                    state: { patientId : row.id, permissions:permissions  }
                }
            },
            ...(permissions.includes('edit_patient') || permissions.includes("all_permission") ? [{
                name:'Edit',
                type:'link',
                icon:<MdModeEdit size="20" color='rgb(4, 196, 217)' />,
                to:{
                    pathname: "/register-patient",
                    state: { patientId : row.id, permissions:permissions  }
                }
            }] : []),
            ...(permissions.includes('delete_patient') || permissions.includes("all_permission") ? [{
                name:'Delete',
                type:'link',
                icon:<MdDeleteForever size="20" color='rgb(4, 196, 217)'  />,
                deleteAction: () => {handleDelete(row.id)},
                to:{
                    pathname: "/#",
                    state: { patientObj: row, permissions:permissions  }
                }
            }] : [])
        ]
    }
    const handleRemoteData = query =>
        new Promise((resolve, reject) => {
            axios.get(`${baseUrl}patient/get-duplicate-hospital_numbers?pageSize=${query.pageSize}&pageNo=${query.page}&searchParam=${query.search}`, { headers: {"Authorization" : `Bearer ${token}`} })
                .then(response => response)
                .then(result => {
                  if (result.data === "") {
                    resolve({
                      data: [],
                      page: 0,
                      totalCount: 0,
                    });
                  } else {
                      resolve({
                        data: result.data.records.map((row) => ({
                            name: [row.firstName, row.otherName, row.surname].filter(Boolean).join(", "),
                            id: getHospitalNumber(row.identifier),
                            sex: row.sex,
                            dateOfBirth: row.dateOfBirth,
                            status:row.archived == 1?'Archived':"Active",
                            age: (row.dateOfBirth === 0 ||
                                row.dateOfBirth === undefined ||
                                row.dateOfBirth === null ||
                                row.dateOfBirth === "" )
                                ? 0
                                : calculate_age(row.dateOfBirth),
                            actions:
                                <div>
                                    {permissions.includes('view_patient') || permissions.includes("all_permission") ? (
                                        <SplitActionButton actions={actionItems(row)} />
                                    ):""
                                    }
                                </div>
                        })),
                        page: query.page,
                        totalCount: result.data.totalRecords
                    });
                  }
                });
        })


    const onDelete = async (id) => {
        try {
            if (id) {
                const response = await axios.delete(`${baseUrl}patient/${id}`, { headers: {"Authorization" : `Bearer ${token}`} });
                window.location.reload();
            }
        } catch (e) {

        }
    }

    const onCancelDelete = () => {
        setModal(false);
    }

    const calculate_age = dob => {

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
        return age_now + " year(s)";
    };

    const getHospitalNumber = (identifier) => {
        const hospitalNumber = identifier.identifier.find(obj => obj.type == 'HospitalNumber');
        return hospitalNumber ? hospitalNumber.value : '';
    };

    const getAddress = (address) => {
        const city = address && address.address && address.address.length > 0 ? address.address[0].city : null;
        return city;
    };

    const getGender = (gender) => {
        return gender.display;
    };



    const enablePPIColumns = () =>{
        setEnablePPI(!enablePPI)
    }
    const PPISelect = () => <div>
        {permissions.includes('view_patient') || permissions.includes("all_permission") ? (
            <FormGroup className=" float-right mr-1">
                <FormControlLabel  control={
                    <Checkbox
                        onChange={enablePPIColumns}
                        checked={!enablePPI}
                        style={{color:'#014d88',fontWeight:'bold'}}
                    />
                } label="Show PII" style={{color:'#014d88',fontWeight:'bolder'}} />
            </FormGroup>
        ):<h5 style={{color:'#3d4465',fontWeight:'bold'}}>Patients</h5>
        }
    </div>;


    const handleChangePage = (page) => {
        setCurrentPage(page + 1);
    };
    const localization = {
        pagination: {
            labelDisplayedRows: `Page: ${currentPage}`
        }
    }

    return (
        <div className={classes.root}>
            <ToastContainer autoClose={3000} hideProgressBar />
            <MaterialTable
                tableRef={tableRef}
                /*onSearchChange={(e) => {
                    handleSearchChange(e);
                }}*/
                icons={tableIcons}
                title={<PPISelect/>}
                columns={[
                    {
                        title: "Name",
                        field: "name",
                        filtering: false,
                        hidden:enablePPI
                    },
                    { title: "Hosp. Number", field: "id" , filtering: false},
                    { title: "Sex", field: "sex", filtering: false },
                    { title: "Date Of Birth", field: "dateOfBirth", filtering: false },
                    { title: "Age", field: "age", filtering: false },
                    /*{ title: "Address", field: "address", filtering: false },*/
                    { title: "Status", field: "status", filtering: false },
                    {title: "Actions", field: "actions", filtering: false },
                ]}
                isLoading={loading}
                data={handleRemoteData}

                options={{
                    rowStyle: rowData => {
                        if(rowData.status === 'Archived') {
                            return {
                                backgroundColor: '#ceeef5',
                                border:'2px solid #fff'
                            };
                        }

                        return {border:'2px solid #eee'};
                    },
                    headerStyle: {
                        backgroundColor: "#014d88",
                        color: "#fff",
                        fontSize:'16px',
                        padding:'10px',
                        fontWeight:'bolder'
                    },
                    searchFieldStyle: {
                        width : '50%'
                    },
                    filtering: false,
                    exportButton: false,
                    searchFieldAlignment: 'left',
                    pageSizeOptions:[10,20,100],
                    pageSize:10,
                    debounceInterval: 400,

                }}
                onChangePage={handleChangePage}
                //localization={localization}

            />
            <Modal isOpen={modal} toggle={onCancelDelete}>
                <ModalHeader toggle={onCancelDelete}>Delete Patient</ModalHeader>
                <ModalBody>
                    Are you sure to delete this record? { patient ? patient.surname +  ', ' + patient.firstname +  ' ' + patient.otherName : '' }
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" type="button" onClick={(e) => onDelete(patient.id)}>Yes</Button>{' '}
                    <Button color="secondary" type="button" onClick={(e) => onCancelDelete()}>No</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}

export default DuplicateHospitalNumbers;