//List of patients without biometrics
import React, { forwardRef, useCallback, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import MaterialTable from "material-table";
import SplitActionButton from "../SplitActionButton";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import Button from "@material-ui/core/Button";
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
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import { token, url as baseUrl } from "../../../../api";
import { FaEye } from "react-icons/fa";
import {
  MdDeleteForever,
  MdModeEdit,
  MdPerson,
  MdFingerprint,
} from "react-icons/md";

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

const useStyles = makeStyles((theme) => ({
  card: {
    margin: theme.spacing(20),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
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
    "& a": {
      textDecoration: "none !important",
    },
  },
  input: {
    display: "none",
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

function BiometricsList(props) {
  const classes = useStyles();
  const [patients, setPatients] = useState([]);
  const [permissions, setPermissions] = useState(props.permissions);
  const [loading, setLoading] = useState("");
  const [patient, setPatient] = useState(false);
  const [enablePPI, setEnablePPI] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  //Get list of Finger index
  const userPermission = () => {
    axios
      .get(`${baseUrl}account`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setPermissions(response.data.permissions);
      })
      .catch((error) => {});
  };
  const loadPatients = useCallback(async () => {
    try {
      await axios
        .get(`${baseUrl}patient/getall-patients-without-biometric`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          if (response.data) {
            setPatients(response.data);
          }
        });
    } catch (e) {
      console.error(e);
    }
  }, []);

  function actionItems(row) {
    return [
      {
        ...(permissions.includes("view_patient") ||
          (permissions.includes("all_permission") && {
            name: "Capture",
            type: "link",
            icon: <MdFingerprint size="22" />,
            to: {
              pathname: "/patient-dashboard",
              state: { patientObj: row, permissions: permissions },
            },
          })),
      },
    ];
  }

  const handleRemoteData = (query) =>
    new Promise((resolve, reject) => {
      axios
        .get(
          `${baseUrl}patient/getall-patients-without-biometric?pageSize=${query.pageSize}&pageNo=${query.page}&searchParam=${query.search}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => response)
        .then((result) => {
          resolve({
            data: result.data.records.map((row) => ({
              name: [row.firstName, row.otherName, row.surname]
                .filter(Boolean)
                .join(", "),
              id: getHospitalNumber(row.identifier),
              sex:
                row.sex.toLowerCase().charAt(0).toUpperCase() +
                row.sex.slice(1).toLowerCase(),
              dateOfBirth: row.dateOfBirth,
              age:
                row.dateOfBirth === 0 ||
                row.dateOfBirth === undefined ||
                row.dateOfBirth === null ||
                row.dateOfBirth === ""
                  ? 0
                  : calculateAge(row.dateOfBirth),
              actions: (
                <div>
                  {permissions.includes("view_patient") ||
                  permissions.includes("all_permission") ? (
                    <SplitActionButton actions={actionItems(row)} />
                  ) : (
                    ""
                  )}
                </div>
              ),
            })),
            page: query.page,
            totalCount: result.data.totalRecords,
          });
        });
    });
  useEffect(() => {
    userPermission();
    loadPatients();
  }, []);

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

  const getHospitalNumber = (identifier) => {
    const hospitalNumber = identifier.identifier.find(
      (obj) => obj.type == "HospitalNumber"
    );
    return hospitalNumber ? hospitalNumber.value : "";
  };

  const enablePPIColumns = () => {
    setEnablePPI(!enablePPI);
  };
  const PPISelect = () => (
    <div>
      {permissions.includes("view_patient") ||
      permissions.includes("all_permission") ? (
        <FormGroup className=" float-right mr-1">
          <FormControlLabel
            control={
              <Checkbox
                onChange={enablePPIColumns}
                checked={!enablePPI}
                style={{ color: "#014d88", fontWeight: "bold" }}
              />
            }
            label="Show PII"
            style={{ color: "#014d88", fontWeight: "bolder" }}
          />
        </FormGroup>
      ) : (
        <h5 style={{ color: "#3d4465", fontWeight: "bold" }}>Patients</h5>
      )}
    </div>
  );
  const handleChangePage = (page) => {
    setCurrentPage(page + 1);
  };
  const localization = {
    pagination: {
      labelDisplayedRows: `Page: ${currentPage}`,
    },
  };
  return (
    <div>
      {/*<ToastContainer autoClose={3000} hideProgressBar />*/}
      <h3>Patients without biometrics</h3>
      <MaterialTable
        icons={tableIcons}
        title={<PPISelect />}
        columns={[
          {
            title: "Name",
            field: "name",
            filtering: false,
            hidden: enablePPI,
          },
          { title: "Hosp. Number", field: "id", filtering: false },
          { title: "Sex", field: "sex", filtering: false },
          { title: "Date Of Birth", field: "dateOfBirth", filtering: false },
          { title: "Age", field: "age", filtering: false },
          { title: "Actions", field: "actions", filtering: false },
        ]}
        isLoading={loading}
        data={handleRemoteData}
        options={{
          headerStyle: {
            backgroundColor: "#014d88",
            color: "#fff",
            fontSize: "16px",
            padding: "10px",
            fontWeight: "bolder",
          },
          searchFieldStyle: {
            width: "50%",
          },
          filtering: false,
          exportButton: false,
          searchFieldAlignment: "left",
          pageSizeOptions: [10, 20, 100],
          pageSize: 10,
          debounceInterval: 400,
        }}
        onChangePage={handleChangePage}
        //localization={localization}
      />
    </div>
  );
}

export default BiometricsList;
