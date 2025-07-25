import React, { useState, useRef, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import MaterialTable from "material-table";
import Button from "@material-ui/core/Button";
import axios from "axios";
import { url as baseUrl, token } from "../../../api";
import Alert from "@mui/material/Alert";
import swal from "sweetalert";

import PatientRecapture from "./PatientRecapture";
import Recapture from "./Recapture";
import MatButton from "@material-ui/core/Button";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RestoreIcon from "@mui/icons-material/Restore";

import { forwardRef } from "react";

import AddBox from "@material-ui/icons/AddBox";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Remove from "@material-ui/icons/Remove";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";
import BaselineWarning from "./BaselineWarning";

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

const PreviousRecapture = (props) => {
  let createdDate = props.patientObj.createdDate.split("T")[0];
  let currentDate = new Date().toISOString().split("T")[0];
  const [previousCaptureDate, setPreviousCaptureDate] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [recapturedFingered, setRecapturedFingered] = useState([]);
  const [fingerType, setFingerType] = useState([]);
  const [modal, setModal] = useState(false);
  const [modal1, setModal1] = useState(false);
  const [modalNew, setModalNew] = useState(false);

  const [submitStatus, setSubmitStatus] = useState(false);
  const [capturedFingered, setCapturedFingered] = useState([]);

  const toggle = () => {
    setModal(!modal);
    localStorage.removeItem("capturedBiometricsList");
    setCapturedFingered([]);
  };
  const toggle1 = () => setModal1(!modal1);
  const toggleNew = () => {
    setModalNew(!modalNew);
    localStorage.removeItem("capturedBiometricsList");
    setCapturedFingered([]);
  };

  const tableRef = useRef(null);
  const [loading, setLoading] = useState("");

  const [biometrics, setBiometrics] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [baselineVal, setBaselineVal] = useState({});
  const [replaceDate, setReplacement] = useState(null);

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

  const getRecaptureCount = () => {
  
    axios
      .get(`${baseUrl}biometrics/grouped/person/${props.patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        
        let capturedDate = response.data[0].captureDate;
        let replacementDate =
          response.data[response.data.length - 1]?.replaceDate;

        if (replacementDate != null) {
          setReplacement(replacementDate);
        }

        setPreviousCaptureDate(capturedDate);

        setRecapturedFingered(response.data);
        // localStorage.removeItem("capturedBiometricsList");
      });
  };

  useEffect(() => {
    getRecaptureCount();
    userPermission();
  }, []);

  const handleChangePage = (page) => {
    setCurrentPage(page + 1);
  };

  function actionItems(row) {
    //console.log(row);
    axios
      .get(
        `${baseUrl}biometrics?personUuid=${row.personUuid}&recapture=${row.recapture}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        toggle();
        let biometricData = response.data.filter(
          (data) => data.date === row.captureDate
        );
        //console.log("gotten", biometricData);
        setBiometrics(biometricData);
      });
    //.error((err) => console.log(err));
  }

  const submitReplacedBaselinePrints = () => {
    toggle1();
    axios
      .put(
        `${baseUrl}biometrics/person?personUuid=${baselineVal?.personUuid}&captureDate=${baselineVal?.captureDate}&recapture=${baselineVal?.recapture}`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        getRecaptureCount();
      });
  };

  const replaceBaselinePrints = async (row) => {
    
    toggle1();
    setBaselineVal(row);
  };

  const is30DaysPassed = (timestamp) => {
  
    const startDate = new Date(timestamp);
    const currentDate = new Date();
    const timeDifference = currentDate - startDate;

    const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

    if (daysDifference >= 15) {
      return true;
    } else {
      const remainingDays = 15 - daysDifference;
   
      return false;
    }
  };

  return (
    <>
      <h5>
        {" "}
        Patient recapture count : <b>{recapturedFingered.length - 1}</b>
      </h5>
      {is30DaysPassed(previousCaptureDate) === true ? (
        // <Link
        //   to={{
        //     pathname: "/biometrics-recapture",
        //     state: { patientObj: props, permissions: permissions },
        //   }}
        // >
        <MatButton
          className=" float-right mr-1"
          variant="contained"
          floated="left"
          startIcon={<FingerprintIcon />}
          style={{
            backgroundColor: "#014d88",
            color: "#fff",
            height: "35px",
            float: "right",
            //marginBottom: "40px",
          }}
          onClick={toggleNew}
        >
          <span style={{ textTransform: "capitalize" }}>Recapture</span>
        </MatButton>
      ) : (
        // </Link>
        ""
      )}

      <Alert severity="info" style={{ width: "90%" }}>
        <b style={{ textAlign: "center", fontSize: "16px" }}>Instruction: </b>
        1.Maximum of 10 fingers to be captured. 2.Click the recapture button to
        capture patient's fingers.
      </Alert>
      <br />

      <br />
      <br />
      <MaterialTable
        tableRef={tableRef}
        /*onSearchChange={(e) => {
          handleSearchChange(e);
      }}*/
        icons={tableIcons}
        title={`Biometrics List`}
        columns={[
          {
            title: "Captured Date",
            field: "captureDate",
            filtering: false,
            // hidden: enablePPI,
          },
          {
            title: "Number of Fingers Captured",
            field: "count",
            filtering: false,
          },
          { title: "Category", field: "data" },
          { title: "Number", field: "number" },
          { title: "Actions", field: "actions", filtering: false },
        ]}
        isLoading={loading}
        data={
          recapturedFingered &&
          recapturedFingered
            .filter((record) => {
              return record.archived === 0;
            })
            .map((row) => ({
              captureDate: row.captureDate,
              count: row.count === null ? 0 : row.count,
              data: row.recapture >= 1 ? "Recapture" : "Baseline",
              number: row.recapture,
              actions: (
                <>
                  <Button
                    style={{ backgroundColor: "#014d88", color: "#fff" }}
                    onClick={() => actionItems(row)}
                    startIcon={<VisibilityIcon />}
                  >
                    View
                  </Button>{" "}
                  {row.recapture > 0 &&
                  row.replaceDate === null &&
                  replaceDate === null ? (
                    <Button
                      style={{
                        backgroundColor: "rgb(153, 46, 98)",
                        color: "#fff",
                      }}
                      onClick={() => replaceBaselinePrints(row)}
                      startIcon={<RestoreIcon />}
                      //disabled={true}
                    >
                      Replace
                    </Button>
                  ) : (
                    ""
                  )}
                </>
              ),
            }))
        }
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
      <PatientRecapture
        storedBiometrics={biometrics}
        modal={modal}
        toggle={toggle}
      />
      <Recapture
        toggle={toggleNew}
        modal={modalNew}
        patientId={props.patientId}
        age={props.age}
        getRecaptureCount={getRecaptureCount}
        capturedFingered={capturedFingered}
        setCapturedFingered={setCapturedFingered}
      />
      <BaselineWarning
        modal={modal1}
        toggle={toggle1}
        submitReplacedBaselinePrints={submitReplacedBaselinePrints}
      />
    </>
  );
};

export default PreviousRecapture;
