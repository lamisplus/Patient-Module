import React, { useCallback, useEffect, useMemo, useState,memo } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { token, url as baseUrl } from "../../../../api";
import { makeStyles } from "@material-ui/core/styles";
import PatientCard from "../PatientCard";
import ClientDashboard from "./index";
import PersonDemographics from "../PersonDemographics";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import CheckIn from "./CheckIn";
import { Tab } from "semantic-ui-react";
import MaterialTable from "material-table";
import Biometrics from "../Biometrics";
import moment from "moment";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
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
  checkinModal: {
    "& .modal-dialog": {
      maxWidth: "1000px",
    },
    "& .ui.label": {
      backgroundColor: "#fff",
      fontSize: "16px",
      color: "#014d88",
      fontWeight: "bold",
      textAlign: "left",
    },
    "& .card-title": {
      color: "#fff",
      fontWeight: "bold",
    },
    "& .form-control": {
      borderRadius: "0.25rem",
      height: "41px",
    },
    "& .card-header:first-child": {
      borderRadius: "calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0",
    },
    "& .dropdown-toggle::after": {
      display: " block !important",
    },
    "& select": {
      "-webkit-appearance": "listbox !important",
    },
    "& p": {
      color: "red",
    },
    "& label": {
      fontSize: "14px",
      color: "#014d88",
      fontWeight: "bold",
    },
  },
  checkInDatePicker: {
    "& .MuiFormControl-root.MuiTextField-root": {
      border: "1px solid #eee",
    },
  },
}));
function Index(props) {
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const classes = useStyles();

  // Memoize static values
  const patientObj = useMemo(
    () => history.location?.state?.patientObj || {},
    [history.location?.state?.patientObj]
  );

  const permissions = useMemo(
    () => history.location?.state?.permissions || [],
    [history.location?.state?.permissions]
  );

  const [patientBiometricStatus, setPatientBiometricStatus] = useState(false);
  const [biometricsModuleInstalled, setBiometricsModuleInstalled] =
    useState(false);
  const [patientVisits, setPatientVisits] = useState([]);
  const [checkinStatus, setCheckinStatus] = useState(false);

  // Add the missing biometrics functions
  const checkBiometricStatus = useCallback((id) => {
    axios
      .get(`${baseUrl}biometrics/person/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.data.length > 0) {
          setPatientBiometricStatus(true);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const checkForBiometricsModule = useCallback(() => {
    return axios
      .get(`${baseUrl}modules/check?moduleName=biometric`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.data === true) {
          setBiometricsModuleInstalled(true);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  // Memoize table columns to prevent unnecessary re-renders
  const columns = useMemo(
    () => [
      {
        title: "Check-In Date",
        field: "checkInDate",
        filtering: false,
        headerStyle: {
          backgroundColor: "#039be5",
          border: "2px solid #fff",
          paddingRight: "30px",
        },
      },
      {
        title: "Check-Out Date",
        field: "checkOutDate",
        filtering: false,
      },
      { title: "Service", field: "service", filtering: false },
      { title: "Status", field: "status", filtering: false },
      { title: "Action", field: "action", filtering: false },
    ],
    []
  );

  // Memoize table options
  const tableOptions = useMemo(
    () => ({
      headerStyle: {
        backgroundColor: "#014d88",
        color: "#fff",
        fontSize: "16px",
        padding: "10px",
        fontWeight: "bold",
      },
      rowStyle: {
        color: "rgba(0,0,0,.87)",
        fontFamily: "'poppins', sans-serif",
      },
      searchFieldStyle: {
        width: "200%",
        marginLeft: "250px",
      },
      filtering: false,
      exportButton: false,
      searchFieldAlignment: "left",
      pageSizeOptions: [10, 20, 100],
      pageSize: 10,
      debounceInterval: 400,
    }),
    []
  );

  const loadPatientVisits = useCallback(async () => {
    const abortController = new AbortController();
    setLoading(true);

    try {
      const response = await axios.get(
        `${baseUrl}patient/visit/visit-by-patient/${patientObj.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortController.signal,
        }
      );

      setPatientVisits(response.data);
      const hasOngoingVisit = response.data.some(
        (visit) => visit.checkOutDate === null
      );
      setCheckinStatus(hasOngoingVisit);
    } catch (error) {
      if (!axios.isCancel(error)) {
        await Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "An error occurred fetching services!",
        });
      }
    } finally {
      setLoading(false);
    }

    return () => abortController.abort();
  }, [patientObj.id]);

  const handleCheckOut = useCallback(
    async (visitId) => {
      try {
        await axios.put(
          `${baseUrl}patient/visit/checkout/${visitId}`,
          visitId,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        toast.success("Record save successful");
        setCheckinStatus(false);
        loadPatientVisits();
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
      }
    },
    [loadPatientVisits]
  );

  // Memoize table data transformation
  const tableData = useMemo(
    () =>
      patientVisits.map((row) => ({
        checkInDate: moment(row.checkInDate).format("YYYY-MM-DD h:mm a"),
        checkOutDate: row.checkOutDate
          ? moment(row.checkOutDate).format("YYYY-MM-DD h:mm a")
          : "Visit Ongoing",
        service: row.service,
        status: (
          <h6 style={{ color: row.status === "COMPLETED" ? "green" : "red" }}>
            {row.status}
          </h6>
        ),
        action: (
          <Button
            variant="contained"
            style={{
              backgroundColor: row.status === "COMPLETED" || row.status === "CHECKED-OUT"  ? "#ccc" : "green",
              fontSize: "14px",
              fontWeight: "bold",
              height: "35px",
            }}
            onClick={() => handleCheckOut(row.id)}
            className=" mr-1"
            disabled={row.status === "COMPLETED" || row.status === "CHECKED-OUT"}
          >
           <span style={{
             textTransform: "capitalize",
             cursor: "pointer",
           }}>
              {row.status === "COMPLETED" || row.status === "CHECKED-OUT" ? "Checked Out" : "Check Out"}
            </span>
          </Button>
        ),
      })),
    [patientVisits, handleCheckOut]
  );

  // Combine all initialization API calls
  const initializeData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPatientVisits(),
        checkForBiometricsModule(),
        checkBiometricStatus(patientObj.id),
      ]);
    } finally {
      setLoading(false);
    }
  }, [
    loadPatientVisits,
    checkForBiometricsModule,
    checkBiometricStatus,
    patientObj.id,
  ]);

  // Move panes definition before the loading check
  const panes = useMemo(
    () => [
      {
        menuItem: "Visits",
        render: () => (
          <Tab.Pane>
            <MaterialTable
              title=""
              columns={columns}
              data={tableData}
              options={tableOptions}
              isLoading={loading}
            />
          </Tab.Pane>
        ),
      },
      {
        menuItem:
          (permissions.includes("view_patient_appointment") &&
            biometricsModuleInstalled) ||
          (permissions.includes("all_permission") && biometricsModuleInstalled)
            ? "Biometrics"
            : "",
        render: () =>
          permissions.includes("view_patient_appointment") ||
          permissions.includes("all_permission") ? (
            <Tab.Pane>
              <div style={{ minHeight: 400, width: "100%" }}>
                <Biometrics
                  age={patientObj.dateOfBirth}
                  patientId={patientObj.id}
                  updatePatientBiometricStatus={setPatientBiometricStatus}
                />
              </div>
            </Tab.Pane>
          ) : null,
      },
    ],
    [
      columns,
      tableData,
      tableOptions,
      loading,
      permissions,
      biometricsModuleInstalled,
      patientObj,
    ]
  );

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Render loading state after all hooks are called
  if (loading) {
    return (
      <div className={classes.root}>
        <Card>
          <CardContent>
            <div className="text-center">
              <CircularProgress />
              {/* <Typography>Loading patient data...</Typography> */}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <div className="mb-6 col-md-6" style={{ padding: "10px 0" }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Typography style={{ color: "#992E62" }}>Patient</Typography>
          <Typography style={{ color: "#014d88" }}>Dashboard</Typography>
        </Breadcrumbs>
      </div>
      <Card>
        <CardContent>
          <PersonDemographics
            patientObj={patientObj}
            permissions={permissions}
            patientBiometricStatus={patientBiometricStatus}
          />
          <Card style={{ marginTop: "5px" }}>
            <CardContent>
              <CheckIn props={props} />
              <Tab panes={panes} />
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

export default memo(Index);