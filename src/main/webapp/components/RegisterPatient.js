import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Button from "@material-ui/core/Button";
import { FormGroup, Label, Spinner, Input, Form } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCheckSquare,
  faCoffee,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import { makeStyles } from "@material-ui/core/styles";
import { Card, CardContent } from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
import AddIcon from "@material-ui/icons/Add";
import CancelIcon from "@material-ui/icons/Cancel";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import { Link, useHistory, useLocation } from "react-router-dom";
import { TiArrowBack } from "react-icons/ti";
import { token, url as baseUrl } from "../../../api";
import "react-phone-input-2/lib/style.css";
import "./patient.css";
import { Modal } from "react-bootstrap";
import useCodesets from "./hook/useCodesets";

library.add(faCheckSquare, faCoffee, faEdit, faTrash);

const useStyles = makeStyles((theme) => ({
  card: {
    margin: theme.spacing(20),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%",
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
    width: 300,
  },
  button: {
    margin: theme.spacing(1),
  },
  root: {
    flexGrow: 1,
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
      display: "block !important",
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
  demo: {
    backgroundColor: theme.palette.background.default,
  },
  inline: {
    display: "inline",
  },
  error: {
    color: "#f85032",
    fontSize: "12.8px",
  },
  success: {
    color: "#4BB543",
    fontSize: "11px",
  },
}));

const CODESET_KEYS = [
  "SEX",
  "MARITAL_STATUS",
  "EDUCATION",
  "OCCUPATION",
  "RELATIONSHIP",
];

const RegisterPatient = (props) => {
  const { getOptions } = useCodesets(CODESET_KEYS);

  // Initial state for basic info
  const initialBasicInfo = {
    active: true,
    streetAddress: "",
    address: [],
    contact: [],
    contactPoint: [],
    dateOfBirth: "",
    deceased: false,
    deceasedDateTime: null,
    firstName: "",
    lastName: "",
    middleName: "",
    genderId: "",
    identifier: "",
    otherName: "",
    maritalStatusId: "",
    educationId: "",
    employmentStatusId: "",
    dateOfRegistration: "",
    isDateOfBirthEstimated: null,
    age: "",
    phoneNumber: "",
    altPhonenumber: "",
    dob: "",
    countryId: 1,
    stateId: "",
    district: "",
    sexId: "",
    ninNumber: "",
    hospitalNumber: "",
    email: "",
    landmark: "",
  };

  const [basicInfo, setBasicInfo] = useState(initialBasicInfo);
  const [relatives, setRelatives] = useState({
    address: "",
    phone: "",
    firstName: "",
    email: "",
    relationshipId: "",
    lastName: "",
    middleName: "",
  });

  const [allContacts, setAllContacts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [ageDisabled, setAgeDisabled] = useState(true);
  const [showRelative, setShowRelative] = useState(false);
  const [patientFacilityId, setPatientFacilityId] = useState(null);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [errors, setErrors] = useState({});
  const [hospitalNumStatus, setHospitalNumStatus] = useState(false);
  const [open, setOpen] = useState(false);

  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();

  const locationState = location.state;
  const patientId = locationState ? locationState.patientId : null;
  const userDetail = props.location?.state?.user || null;

  const toggle = () => setOpen(!open);

  // Date validation function
  const validateDateOfRegistration = (registrationDate, birthDate) => {
    if (!registrationDate || !birthDate) return true;
    const regDate = moment(registrationDate);
    const dob = moment(birthDate);
    return regDate.isSameOrAfter(dob);
  };

  // Load states by parent ID
  const loadOrganisationUnitsByParentId = async (parentId) => {
    try {
      const response = await axios.get(
        `${baseUrl}organisation-units/parent-organisation-units/${parentId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error) {
      console.error("Error loading organisation units:", error);
      return [];
    }
  };

  // Load states for a specific state ID
  const loadState = async (stateId) => {
    if (!stateId) return;
    try {
      const response = await axios.get(
        `${baseUrl}organisation-units/parent-organisation-units/${stateId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setProvinces(response.data.sort());
    } catch (error) {
      console.error("Error loading state:", error);
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return "";
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
    return age < 0 ? "" : age;
  };

  // Format phone number
  const formatPhoneNumber = (phone) => {
    if (!phone || typeof phone?.value !== "string") return phone;
    if (phone.value.charAt(0) === "0") {
      phone.value = phone.value.replace("0", "234");
    }
    return phone;
  };

  // Get patient data
  const getPatient = useCallback(async () => {
    if (!patientId || getOptions("SEX").length === 0) return;

    try {
      const response = await axios.get(`${baseUrl}patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const patient = response.data;

      setAllContacts(patient?.contact || []);
      setPatientFacilityId(patient.facilityId);

      const identifiers = patient.identifier;
      const address = patient.address;
      const contactPoint = patient?.contactPoint;

      const hospitalNumber = identifiers?.identifier?.find(
        (obj) => obj.type === "HospitalNumber",
      );

      const sexOptions = getOptions("SEX");
      const sex = sexOptions.find(
        (option) => option.display.toLowerCase() === patient.sex?.toLowerCase(),
      )?.id;

      const phone = formatPhoneNumber(
        contactPoint?.contactPoint?.find((obj) => obj.type === "phone"),
      );

      const email = contactPoint?.contactPoint?.find(
        (obj) => obj.type === "email",
      );

      const altphone = formatPhoneNumber(
        contactPoint?.contactPoint?.find((obj) => obj.type === "altphone"),
      );

      const country = address?.address?.[0] || null;

      if (country?.stateId) {
        await loadState(country.stateId);
      }

      const basicInfoData = {
        ...initialBasicInfo,
        hospitalNumber: hospitalNumber?.value || "",
        firstName: patient.firstName || "",
        lastName: patient.surname || "",
        otherName: patient.otherName || "",
        maritalStatusId: patient.maritalStatus?.id || "",
        educationId: patient.education?.id || "",
        employmentStatusId: patient.employmentStatus?.id || "",
        dateOfRegistration: patient.dateOfRegistration || "",
        isDateOfBirthEstimated: patient.dateOfBirth !== "Actual",
        age: calculateAge(patient.dateOfBirth),
        phoneNumber: phone?.value || "",
        altPhonenumber: altphone?.value || "",
        dob: patient.dateOfBirth || "",
        countryId: 1,
        stateId: country?.stateId || "",
        district: country?.district ? parseInt(country.district) : "",
        landmark: country?.line?.[0] || "",
        sexId: sex || "",
        email: email?.value || "",
        streetAddress: country?.city || "",
      };

      setBasicInfo(basicInfoData);
      setHospitalNumStatus(true); // Enable save for edit mode
    } catch (error) {
      console.error("Error fetching patient:", error);
      toast.error("Failed to load patient data");
    }
  }, [patientId, getOptions]);

  // Load countries
  const loadCountries = useCallback(async () => {
    try {
      const response = await axios.get(
        `${baseUrl}organisation-units/parent-organisation-units/0`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setCountries(response.data.sort());
    } catch (error) {
      console.error("Error loading countries:", error);
    }
  }, []);

  // Load states for country (default: Nigeria - ID 1)
  const loadStates = useCallback(async () => {
    try {
      const response = await axios.get(
        `${baseUrl}organisation-units/parent-organisation-units/1`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setStates(response.data.sort());
    } catch (error) {
      console.error("Error loading states:", error);
    }
  }, []);

  // Handler: Country change
  const handleCountryChange = async (e) => {
    const countryId = e.target.value;
    setBasicInfo((prev) => ({ ...prev, countryId }));

    if (countryId) {
      try {
        const response = await axios.get(
          `${baseUrl}organisation-units/parent-organisation-units/${countryId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setStates(response.data.sort());
        setBasicInfo((prev) => ({ ...prev, stateId: "", district: "" }));
        setProvinces([]);
      } catch (error) {
        console.error("Error loading states:", error);
      }
    }
  };

  // Handler: State change
  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    setBasicInfo((prev) => ({ ...prev, stateId, district: "" }));

    if (stateId) {
      try {
        const response = await axios.get(
          `${baseUrl}organisation-units/parent-organisation-units/${stateId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setProvinces(response.data.sort());
      } catch (error) {
        console.error("Error loading provinces:", error);
      }
    }
  };

  // Handler: Date of Birth change
  const handleDobChange = (e) => {
    const dob = e.target.value;
    const age = calculateAge(dob);

    setBasicInfo((prev) => ({
      ...prev,
      dob,
      age: age.toString(),
    }));

    // Check age validation
    if (age >= 60) {
      toggle();
    }
  };

  // Handler: Date of Birth type change (Actual/Estimated)
  const handleDateOfBirthTypeChange = (e) => {
    setAgeDisabled(e.target.value !== "Estimated");
    setBasicInfo((prev) => ({
      ...prev,
      dateOfBirth: e.target.value,
      isDateOfBirthEstimated: e.target.value === "Estimated",
    }));
  };

  // Handler: Age change
  const handleAgeChange = (e) => {
    const ageNumber = e.target.value.replace(/\D/g, "");
    if (!ageDisabled && ageNumber) {
      const currentDate = new Date();
      currentDate.setDate(15);
      currentDate.setMonth(5);
      const estDob = moment(currentDate);
      const dobNew = estDob.add(-parseInt(ageNumber), "years");
      setBasicInfo((prev) => ({
        ...prev,
        age: ageNumber,
        dob: moment(dobNew).format("YYYY-MM-DD"),
      }));

      if (parseInt(ageNumber) >= 60) {
        toggle();
      }
    } else {
      setBasicInfo((prev) => ({ ...prev, age: ageNumber }));
    }
  };

  // Handler: Input changes with validation
  const handleInputChangeBasic = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Alphabet only for name fields
    if (["firstName", "lastName", "middleName"].includes(name)) {
      processedValue = value.replace(/[^a-z]/gi, "");
    }

    // Numbers only for NIN
    if (name === "ninNumber") {
      processedValue = value.replace(/\D/g, "").slice(0, 11);
    }

    // Handle hospital number uniqueness
    if (name === "hospitalNumber" && value) {
      checkHospitalNumberUniqueness(value);
    }

    // Handle date of registration - validate against DOB
    if (name === "dateOfRegistration") {
      setBasicInfo((prev) => ({ ...prev, [name]: value }));

      // Validate date of registration against date of birth
      if (basicInfo.dob && !validateDateOfRegistration(value, basicInfo.dob)) {
        toast.error(
          "Date of Registration cannot be earlier than Date of Birth",
        );
        setErrors((prev) => ({
          ...prev,
          dateOfRegistration:
            "Date of Registration must be same or later than Date of Birth",
        }));
        return;
      } else {
        setErrors((prev) => ({ ...prev, dateOfRegistration: "" }));
      }
      return;
    }

    setBasicInfo((prev) => ({ ...prev, [name]: processedValue }));
  };

  // Check hospital number uniqueness
  const checkHospitalNumberUniqueness = async (hospitalNumber) => {
    try {
      const response = await axios.post(
        `${baseUrl}patient/exist/hospital-number`,
        hospitalNumber,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "text/plain",
          },
        },
      );

      if (response.data !== true) {
        setHospitalNumStatus(true);
        setErrors((prev) => ({ ...prev, hospitalNumber: "" }));
      } else {
        toast.error("Hospital Number already exists");
        setHospitalNumStatus(false);
        setErrors((prev) => ({
          ...prev,
          hospitalNumber: "Hospital Number already exists",
        }));
      }
    } catch (error) {
      console.error("Error checking hospital number:", error);
    }
  };

  // Handler: Phone number change
  const handlePhoneChange = (e, fieldName) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 11);
    setBasicInfo((prev) => ({ ...prev, [fieldName]: value }));
  };

  // Validate relatives
  const validateRelatives = () => {
    const temp = { ...errors };
    temp.firstName = relatives.firstName ? "" : "First Name is required";
    temp.relationshipId = relatives.relationshipId
      ? ""
      : "Relationship Type is required";
    setErrors(temp);
    return Object.values(temp).every((x) => x === "");
  };

  // Handler: Save relationship
  const handleSaveRelationship = () => {
    if (!validateRelatives()) return;

    const contact = {
      address: {
        line: [relatives.address],
      },
      contactPoint: {
        type: "phone",
        value: relatives.phone,
      },
      firstName: relatives.firstName,
      fullName: [relatives.firstName, relatives.middleName, relatives.lastName]
        .filter(Boolean)
        .join(" "),
      relationshipId: relatives.relationshipId,
      surname: relatives.lastName,
      otherName: relatives.middleName,
    };

    setAllContacts((prev) => [...prev, contact]);
    setRelatives({
      address: "",
      phone: "",
      firstName: "",
      email: "",
      relationshipId: "",
      lastName: "",
      middleName: "",
    });
  };

  // Handler: Delete relative
  const handleDeleteRelative = (index) => {
    setAllContacts((prev) => prev.filter((_, i) => i !== index));
  };

  // Handler: Relative input change
  const handleInputChangeRelatives = (e) => {
    const { name, value } = e.target;
    setRelatives((prev) => ({ ...prev, [name]: value }));
  };

  // Validate form
  const validate = () => {
    const temp = {};

    const requiredFields = {
      firstName: "First Name is required",
      lastName: "Last Name is required",
      sexId: "Gender is required",
      dob: "Date of Birth is required",
      dateOfRegistration: "Date of Registration is required",
      educationId: "Education is required",
      streetAddress: "Address is required",
      countryId: "Country is required",
      stateId: "State is required",
      district: "Province/LGA is required",
      employmentStatusId: "Employment Status is required",
      hospitalNumber: "Hospital Number is required",
    };

    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!basicInfo[field]) {
        temp[field] = message;
      }
    });

    // Validate date of registration against DOB
    if (basicInfo.dateOfRegistration && basicInfo.dob) {
      if (
        !validateDateOfRegistration(basicInfo.dateOfRegistration, basicInfo.dob)
      ) {
        temp.dateOfRegistration =
          "Date of Registration must be same or later than Date of Birth";
      }
    }

    // Validate hospital number uniqueness
    if (!hospitalNumStatus && basicInfo.hospitalNumber) {
      temp.hospitalNumber = "Hospital Number already exists";
    }

    setErrors(temp);
    return Object.values(temp).every((x) => x === "");
  };

  // Handler: Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation for date of registration
    if (
      !validateDateOfRegistration(basicInfo.dateOfRegistration, basicInfo.dob)
    ) {
      toast.error("Date of Registration cannot be earlier than Date of Birth");
      setErrors((prev) => ({
        ...prev,
        dateOfRegistration:
          "Date of Registration must be same or later than Date of Birth",
      }));
      return;
    }

    if (!validate()) {
      toast.error("Please fix all validation errors");
      return;
    }

    setSaving(true);

    try {
      const patientForm = {
        active: true,
        address: [
          {
            city: basicInfo.streetAddress,
            countryId: basicInfo.countryId,
            district: basicInfo.district,
            line: [basicInfo.landmark],
            organisationUnitId: 0,
            postalCode: "",
            stateId: basicInfo.stateId,
          },
        ],
        contact: allContacts,
        contactPoint: [],
        dateOfBirth: basicInfo.dob,
        deceased: false,
        deceasedDateTime: null,
        firstName: basicInfo.firstName,
        genderId: basicInfo.sexId,
        sexId: basicInfo.sexId,
        identifier: [
          {
            assignerId: 1,
            type: "HospitalNumber",
            value: basicInfo.hospitalNumber,
          },
        ],
        otherName: basicInfo.middleName,
        maritalStatusId: basicInfo.maritalStatusId,
        surname: basicInfo.lastName,
        educationId: basicInfo.educationId,
        employmentStatusId: basicInfo.employmentStatusId,
        dateOfRegistration: basicInfo.dateOfRegistration,
        isDateOfBirthEstimated: basicInfo.dateOfBirth === "Estimated",
        ninNumber: basicInfo.ninNumber,
      };

      // Add contact points
      if (basicInfo.email) {
        patientForm.contactPoint.push({
          type: "email",
          value: basicInfo.email,
        });
      }
      if (basicInfo.altPhonenumber) {
        patientForm.contactPoint.push({
          type: "altphone",
          value: basicInfo.altPhonenumber,
        });
      }
      patientForm.contactPoint.push({
        type: "phone",
        value: basicInfo.phoneNumber,
      });

      if (patientId) {
        patientForm.id = null;
        patientForm.facilityId = patientFacilityId;
        await axios.put(`${baseUrl}patient/${patientId}`, patientForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Patient updated successfully");
      } else {
        await axios.post(`${baseUrl}patient`, patientForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Patient registered successfully");
      }

      history.push("/");
    } catch (error) {
      console.error("Error saving patient:", error);
      const errorMessage =
        error.response?.data?.apierror?.message ||
        "Something went wrong. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Handler: Cancel
  const handleCancel = () => {
    history.push("/");
  };

  // Get relationship display name
  const getRelationshipDisplay = (relationshipId) => {
    const relationship = getOptions("RELATIONSHIP").find(
      (obj) => obj.id == relationshipId,
    );
    return relationship ? relationship.display : "";
  };

  // Load initial data
  useEffect(() => {
    loadCountries();
    loadStates();
    getPatient();
  }, [loadCountries, loadStates, getPatient]);

  // Validate date of registration whenever DOB changes
  useEffect(() => {
    if (basicInfo.dateOfRegistration && basicInfo.dob) {
      if (
        !validateDateOfRegistration(basicInfo.dateOfRegistration, basicInfo.dob)
      ) {
        setErrors((prev) => ({
          ...prev,
          dateOfRegistration:
            "Date of Registration must be same or later than Date of Birth",
        }));
      } else {
        setErrors((prev) => ({ ...prev, dateOfRegistration: "" }));
      }
    }
  }, [basicInfo.dob, basicInfo.dateOfRegistration]);

  // Get today's date for max date attribute
  const todayDate = moment().format("YYYY-MM-DD");

  return (
    <>
      <ToastContainer autoClose={3000} hideProgressBar />
      <div
        className="row page-titles mx-0"
        style={{ marginTop: "0px", marginBottom: "-10px" }}
      >
        <ol className="breadcrumb">
          <li className="breadcrumb-item active">
            <h4>
              <Link to="/">Patient /</Link> Patient Registration
            </h4>
          </li>
        </ol>
      </div>

      <Link to={{ pathname: "/", state: "users" }}>
        <Button
          variant="contained"
          color="primary"
          className="float-end mr-10 pr-10"
          style={{
            backgroundColor: "#014d88",
            fontWeight: "bolder",
            marginRight: "-40px",
          }}
          startIcon={<TiArrowBack />}
        >
          <span style={{ textTransform: "capitalize", color: "#fff" }}>
            Back
          </span>
        </Button>
      </Link>
      <br />
      <br />

      <Card className={classes.root}>
        <CardContent>
          <div className="col-xl-12 col-lg-12">
            <Form>
              {/* Basic Information Section */}
              <div className="card">
                <div
                  className="card-header"
                  style={{
                    backgroundColor: "#014d88",
                    color: "#fff",
                    fontWeight: "bolder",
                    borderRadius: "0.2rem",
                  }}
                >
                  <h5 className="card-title" style={{ color: "#fff" }}>
                    {userDetail === null
                      ? "Basic Information"
                      : "Edit User Information"}
                  </h5>
                </div>
                <div className="card-body">
                  <div className="basic-form">
                    <div className="row">
                      {/* Date of Registration */}
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label for="dateOfRegistration">
                            Date of Registration{" "}
                            <span style={{ color: "red" }}> *</span>
                          </Label>
                          <Input
                            className="form-control"
                            type="date"
                            name="dateOfRegistration"
                            id="dateOfRegistration"
                            min="1983-12-31"
                            max={todayDate}
                            value={basicInfo.dateOfRegistration}
                            onChange={handleInputChangeBasic}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                            }}
                          />
                          {errors.dateOfRegistration && (
                            <span className={classes.error}>
                              {errors.dateOfRegistration}
                            </span>
                          )}
                        </FormGroup>
                      </div>

                      {/* Hospital Number */}
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label for="hospitalNumber">
                            Hospital Number{" "}
                            <span style={{ color: "red" }}> *</span>
                          </Label>
                          <input
                            className="form-control"
                            type="text"
                            name="hospitalNumber"
                            id="hospitalNumber"
                            value={basicInfo.hospitalNumber}
                            onChange={handleInputChangeBasic}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                            }}
                          />
                          {errors.hospitalNumber && (
                            <span className={classes.error}>
                              {errors.hospitalNumber}
                            </span>
                          )}
                        </FormGroup>
                      </div>

                      {/* NIN Number */}
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label for="ninNumber">
                            National Identity Number (NIN)
                          </Label>
                          <input
                            className="form-control"
                            type="text"
                            name="ninNumber"
                            value={basicInfo.ninNumber}
                            id="ninNumber"
                            onChange={handleInputChangeBasic}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                            }}
                          />
                        </FormGroup>
                      </div>
                    </div>

                    <div className="row">
                      {/* First Name */}
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label for="firstName">
                            First Names <span style={{ color: "red" }}> *</span>
                          </Label>
                          <Input
                            className="form-control"
                            type="text"
                            name="firstName"
                            id="firstName"
                            value={basicInfo.firstName}
                            onChange={handleInputChangeBasic}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                            }}
                          />
                          {errors.firstName && (
                            <span className={classes.error}>
                              {errors.firstName}
                            </span>
                          )}
                        </FormGroup>
                      </div>

                      {/* Middle Name */}
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label for="middleName">Middle Name</Label>
                          <Input
                            className="form-control"
                            type="text"
                            name="middleName"
                            id="middleName"
                            value={basicInfo.middleName}
                            onChange={handleInputChangeBasic}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                            }}
                          />
                        </FormGroup>
                      </div>

                      {/* Last Name */}
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label for="lastName">
                            Last Name <span style={{ color: "red" }}> *</span>
                          </Label>
                          <input
                            className="form-control"
                            type="text"
                            name="lastName"
                            id="lastName"
                            value={basicInfo.lastName}
                            onChange={handleInputChangeBasic}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                            }}
                          />
                          {errors.lastName && (
                            <span className={classes.error}>
                              {errors.lastName}
                            </span>
                          )}
                        </FormGroup>
                      </div>
                    </div>

                    <div className="row">
                      {/* Sex */}
                      <div className="form-group col-md-4">
                        <FormGroup>
                          <Label for="sexId">
                            Sex <span style={{ color: "red" }}> *</span>
                          </Label>
                          <select
                            className="form-control"
                            name="sexId"
                            id="sexId"
                            onChange={handleInputChangeBasic}
                            value={basicInfo.sexId}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                            }}
                          >
                            <option value="">Select</option>
                            {getOptions("SEX").map((gender) => (
                              <option key={gender.id} value={gender.id}>
                                {gender.display}
                              </option>
                            ))}
                          </select>
                          {errors.sexId && (
                            <span className={classes.error}>
                              {errors.sexId}
                            </span>
                          )}
                        </FormGroup>
                      </div>

                      {/* Date of Birth Type */}
                      <div className="form-group mb-2 col-md-2">
                        <FormGroup>
                          <Label>Date Of Birth</Label>
                          <div className="radio">
                            <label>
                              <input
                                type="radio"
                                value="Actual"
                                name="dateOfBirth"
                                defaultChecked
                                onChange={handleDateOfBirthTypeChange}
                                style={{
                                  border: "1px solid #014D88",
                                  borderRadius: "0.2rem",
                                }}
                              />{" "}
                              Actual
                            </label>
                          </div>
                          <div className="radio">
                            <label>
                              <input
                                type="radio"
                                value="Estimated"
                                name="dateOfBirth"
                                onChange={handleDateOfBirthTypeChange}
                                style={{
                                  border: "1px solid #014D88",
                                  borderRadius: "0.2rem",
                                }}
                              />{" "}
                              Estimated
                            </label>
                          </div>
                        </FormGroup>
                      </div>

                      {/* Date of Birth */}
                      <div className="form-group mb-3 col-md-3">
                        <FormGroup>
                          <Label for="dob">Date</Label>
                          <input
                            className="form-control"
                            type="date"
                            name="dob"
                            min="1940-01-01"
                            id="dob"
                            max={basicInfo.dateOfRegistration || todayDate}
                            value={basicInfo.dob}
                            onChange={handleDobChange}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                            }}
                          />
                          {errors.dob && (
                            <span className={classes.error}>{errors.dob}</span>
                          )}
                        </FormGroup>
                      </div>

                      {/* Age */}
                      <div className="form-group mb-3 col-md-3">
                        <FormGroup>
                          <Label for="age">Age</Label>
                          <input
                            type="text"
                            name="age"
                            className="form-control"
                            id="age"
                            min="1"
                            value={basicInfo.age}
                            disabled={ageDisabled}
                            onChange={handleAgeChange}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                            }}
                          />
                        </FormGroup>
                        {basicInfo.age >= 80 && (
                          <span className={classes.error}>
                            Are you sure of the age?
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="row">
                      {/* Marital Status */}
                      <div className="form-group mb-3 col-md-3">
                        <FormGroup>
                          <Label for="maritalStatusId">Marital Status</Label>
                          <select
                            className="form-control"
                            name="maritalStatusId"
                            id="maritalStatusId"
                            onChange={handleInputChangeBasic}
                            value={basicInfo.maritalStatusId}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                            }}
                          >
                            <option value="">Select</option>
                            {getOptions("MARITAL_STATUS").map((status) => (
                              <option key={status.id} value={status.id}>
                                {status.display}
                              </option>
                            ))}
                          </select>
                        </FormGroup>
                      </div>

                      {/* Employment Status */}
                      <div className="form-group col-md-4">
                        <FormGroup>
                          <Label for="employmentStatusId">
                            Employment Status{" "}
                            <span style={{ color: "red" }}> *</span>
                          </Label>
                          <select
                            className="form-control"
                            name="employmentStatusId"
                            id="employmentStatusId"
                            onChange={handleInputChangeBasic}
                            value={basicInfo.employmentStatusId}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                            }}
                          >
                            <option value="">Select</option>
                            {getOptions("OCCUPATION").map((occupation) => (
                              <option key={occupation.id} value={occupation.id}>
                                {occupation.display}
                              </option>
                            ))}
                          </select>
                          {errors.employmentStatusId && (
                            <span className={classes.error}>
                              {errors.employmentStatusId}
                            </span>
                          )}
                        </FormGroup>
                      </div>

                      {/* Education Level */}
                      <div className="form-group col-md-4">
                        <FormGroup>
                          <Label for="educationId">
                            Education Level{" "}
                            <span style={{ color: "red" }}> *</span>
                          </Label>
                          <select
                            className="form-control"
                            name="educationId"
                            id="educationId"
                            onChange={handleInputChangeBasic}
                            value={basicInfo.educationId}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                            }}
                          >
                            <option value="">Select</option>
                            {getOptions("EDUCATION").map((education) => (
                              <option key={education.id} value={education.id}>
                                {education.display}
                              </option>
                            ))}
                          </select>
                          {errors.educationId && (
                            <span className={classes.error}>
                              {errors.educationId}
                            </span>
                          )}
                        </FormGroup>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Details Section */}
              <div className="card">
                <div
                  className="card-header"
                  style={{
                    backgroundColor: "#014d88",
                    color: "#fff",
                    fontWeight: "bolder",
                    borderRadius: "0.2rem",
                  }}
                >
                  <h5 className="card-title" style={{ color: "#fff" }}>
                    Contact Details
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    {/* Phone Number */}
                    <div className="form-group col-md-4">
                      <FormGroup>
                        <Label for="phoneNumber">
                          Phone Number <span style={{ color: "red" }}> *</span>
                        </Label>
                        <Input
                          type="text"
                          name="phoneNumber"
                          id="phoneNumber"
                          onChange={(e) => handlePhoneChange(e, "phoneNumber")}
                          value={basicInfo.phoneNumber}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          required
                        />
                        {errors.phoneNumber && (
                          <span className={classes.error}>
                            {errors.phoneNumber}
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* Alt Phone Number */}
                    <div className="form-group col-md-4">
                      <FormGroup>
                        <Label for="altPhonenumber">Alt. Phone Number</Label>
                        <Input
                          type="text"
                          name="altPhonenumber"
                          id="altPhonenumber"
                          onChange={(e) =>
                            handlePhoneChange(e, "altPhonenumber")
                          }
                          value={basicInfo.altPhonenumber}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          required
                        />
                      </FormGroup>
                    </div>

                    {/* Email */}
                    <div className="form-group col-md-4">
                      <FormGroup>
                        <Label for="email">Email</Label>
                        <input
                          className="form-control"
                          type="email"
                          name="email"
                          id="email"
                          onChange={handleInputChangeBasic}
                          value={basicInfo.email}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                        />
                      </FormGroup>
                    </div>
                  </div>

                  <div className="row">
                    {/* Country */}
                    <div className="form-group col-md-4">
                      <FormGroup>
                        <Label for="countryId">
                          Country <span style={{ color: "red" }}> *</span>
                        </Label>
                        <select
                          className="form-control"
                          name="countryId"
                          id="countryId"
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          value={basicInfo.countryId}
                          onChange={handleCountryChange}
                        >
                          <option value="">Select</option>
                          {countries.map((value) => (
                            <option key={value.id} value={value.id}>
                              {value.name}
                            </option>
                          ))}
                        </select>
                        {errors.countryId && (
                          <span className={classes.error}>
                            {errors.countryId}
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* State */}
                    <div className="form-group col-md-4">
                      <FormGroup>
                        <Label for="stateId">
                          State <span style={{ color: "red" }}> *</span>
                        </Label>
                        <select
                          className="form-control"
                          name="stateId"
                          id="stateId"
                          value={basicInfo.stateId}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          onChange={handleStateChange}
                        >
                          <option value="">Select</option>
                          {states.map((value) => (
                            <option key={value.id} value={value.id}>
                              {value.name}
                            </option>
                          ))}
                        </select>
                        {errors.stateId && (
                          <span className={classes.error}>
                            {errors.stateId}
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* Province/District */}
                    <div className="form-group col-md-4">
                      <FormGroup>
                        <Label for="district">
                          Province/District/LGA{" "}
                          <span style={{ color: "red" }}> *</span>
                        </Label>
                        <select
                          className="form-control"
                          name="district"
                          id="district"
                          value={basicInfo.district}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          onChange={handleInputChangeBasic}
                        >
                          <option value="">Select</option>
                          {provinces.map((value) => (
                            <option key={value.id} value={value.id}>
                              {value.name}
                            </option>
                          ))}
                        </select>
                        {errors.district && (
                          <span className={classes.error}>
                            {errors.district}
                          </span>
                        )}
                      </FormGroup>
                    </div>
                  </div>

                  <div className="row">
                    {/* Street Address */}
                    <div className="form-group col-md-4">
                      <FormGroup>
                        <Label for="streetAddress">
                          Street Address{" "}
                          <span style={{ color: "red" }}> *</span>
                        </Label>
                        <input
                          className="form-control"
                          type="text"
                          name="streetAddress"
                          id="streetAddress"
                          value={basicInfo.streetAddress}
                          onChange={handleInputChangeBasic}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                        />
                        {errors.streetAddress && (
                          <span className={classes.error}>
                            {errors.streetAddress}
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* Landmark */}
                    <div className="form-group col-md-4">
                      <FormGroup>
                        <Label for="landmark">Landmark</Label>
                        <input
                          className="form-control"
                          type="text"
                          name="landmark"
                          id="landmark"
                          value={basicInfo.landmark}
                          onChange={handleInputChangeBasic}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                        />
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>

              {/* Relationship Section */}
              <div className="card">
                <div
                  className="card-header"
                  style={{
                    backgroundColor: "#014d88",
                    color: "#fff",
                    fontWeight: "bolder",
                    borderRadius: "0.2rem",
                  }}
                >
                  <h5 className="card-title" style={{ color: "#fff" }}>
                    Relationship / Next Of Kin
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    {allContacts.length > 0 && (
                      <div className="col-xl-12 col-lg-12">
                        <table style={{ width: "100%" }} className="mb-3">
                          <thead>
                            <tr>
                              <th>Relationship Type</th>
                              <th>Name</th>
                              <th>Phone</th>
                              <th>Address</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allContacts.map((item, index) => (
                              <tr key={index} className="mb-3">
                                <td>
                                  {getRelationshipDisplay(item.relationshipId)}
                                </td>
                                <td>
                                  {[
                                    item.firstName,
                                    item.otherName,
                                    item.surname,
                                  ]
                                    .filter(Boolean)
                                    .join(" ")}
                                </td>
                                <td>{item.contactPoint?.value}</td>
                                <td>{item.address?.line?.[0]}</td>
                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm removeRow"
                                    onClick={() => handleDeleteRelative(index)}
                                  >
                                    <FontAwesomeIcon icon="trash" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {showRelative && (
                      <div className="col-xl-12 col-lg-12">
                        <div className="card">
                          <div className="card-body">
                            <div className="row">
                              {/* Relationship Type */}
                              <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                  <Label for="relationshipId">
                                    Relationship Type{" "}
                                    <span style={{ color: "red" }}> *</span>
                                  </Label>
                                  <select
                                    className="form-control"
                                    name="relationshipId"
                                    id="relationshipId"
                                    value={relatives.relationshipId}
                                    style={{
                                      border: "1px solid #014D88",
                                      borderRadius: "0.2rem",
                                    }}
                                    onChange={handleInputChangeRelatives}
                                  >
                                    <option value="">Select</option>
                                    {getOptions("RELATIONSHIP").map(
                                      (relationship) => (
                                        <option
                                          key={relationship.id}
                                          value={relationship.id}
                                        >
                                          {relationship.display}
                                        </option>
                                      ),
                                    )}
                                  </select>
                                  {errors.relationshipId && (
                                    <span className={classes.error}>
                                      {errors.relationshipId}
                                    </span>
                                  )}
                                </FormGroup>
                              </div>

                              {/* First Name */}
                              <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                  <Label for="relFirstName">
                                    First Name{" "}
                                    <span style={{ color: "red" }}> *</span>
                                  </Label>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="firstName"
                                    value={relatives.firstName}
                                    id="relFirstName"
                                    style={{
                                      border: "1px solid #014D88",
                                      borderRadius: "0.2rem",
                                    }}
                                    onChange={handleInputChangeRelatives}
                                  />
                                  {errors.relFirstName && (
                                    <span className={classes.error}>
                                      {errors.relFirstName}
                                    </span>
                                  )}
                                </FormGroup>
                              </div>

                              {/* Middle Name */}
                              <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                  <Label for="relMiddleName">Middle Name</Label>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="middleName"
                                    id="relMiddleName"
                                    value={relatives.middleName}
                                    style={{
                                      border: "1px solid #014D88",
                                      borderRadius: "0.2rem",
                                    }}
                                    onChange={handleInputChangeRelatives}
                                  />
                                </FormGroup>
                              </div>

                              {/* Last Name */}
                              <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                  <Label for="relLastName">Last Name</Label>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="lastName"
                                    id="relLastName"
                                    value={relatives.lastName}
                                    style={{
                                      border: "1px solid #014D88",
                                      borderRadius: "0.2rem",
                                    }}
                                    onChange={handleInputChangeRelatives}
                                  />
                                </FormGroup>
                              </div>
                            </div>

                            <div className="row">
                              {/* Phone */}
                              <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                  <Label for="relPhone">Phone Number</Label>
                                  <Input
                                    type="text"
                                    name="phone"
                                    id="relPhone"
                                    onChange={(e) => {
                                      const value = e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 11);
                                      setRelatives((prev) => ({
                                        ...prev,
                                        phone: value,
                                      }));
                                    }}
                                    value={relatives.phone}
                                    style={{
                                      border: "1px solid #014D88",
                                      borderRadius: "0.2rem",
                                    }}
                                  />
                                </FormGroup>
                              </div>

                              {/* Email */}
                              <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                  <Label for="relEmail">Email</Label>
                                  <input
                                    className="form-control"
                                    type="email"
                                    name="email"
                                    id="relEmail"
                                    value={relatives.email}
                                    style={{
                                      border: "1px solid #014D88",
                                      borderRadius: "0.2rem",
                                    }}
                                    onChange={handleInputChangeRelatives}
                                  />
                                </FormGroup>
                              </div>

                              {/* Address */}
                              <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                  <Label for="relAddress">Address</Label>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="address"
                                    id="relAddress"
                                    value={relatives.address}
                                    style={{
                                      border: "1px solid #014D88",
                                      borderRadius: "0.2rem",
                                    }}
                                    onChange={handleInputChangeRelatives}
                                  />
                                </FormGroup>
                              </div>
                            </div>

                            <div className="row">
                              <div className="col-1">
                                <Button
                                  type="button"
                                  variant="contained"
                                  color="primary"
                                  className={classes.button}
                                  onClick={handleSaveRelationship}
                                >
                                  Add
                                </Button>
                              </div>
                              <div className="col-1">
                                <Button
                                  type="button"
                                  variant="contained"
                                  color="secondary"
                                  className={classes.button}
                                  onClick={() => setShowRelative(false)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    startIcon={<AddIcon />}
                    onClick={() => setShowRelative(true)}
                    style={{ backgroundColor: "#014d88", fontWeight: "bolder" }}
                  >
                    Add a Relative/Next Of Kin
                  </Button>
                </div>
              </div>

              {saving && <Spinner />}
              <br />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.button}
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={saving || !hospitalNumStatus}
                style={{ backgroundColor: "#014d88", fontWeight: "bolder" }}
                id="save-patient"
              >
                <span style={{ textTransform: "capitalize" }}>
                  {saving ? "Saving..." : "Save"}
                </span>
              </Button>

              <Button
                variant="contained"
                className={classes.button}
                startIcon={<CancelIcon />}
                style={{ backgroundColor: "#992E62" }}
                onClick={handleCancel}
              >
                <span style={{ textTransform: "capitalize", color: "#fff" }}>
                  Cancel
                </span>
              </Button>
            </Form>
          </div>
        </CardContent>
      </Card>

      {/* Age Confirmation Modal */}
      <Modal
        show={open}
        toggle={toggle}
        className="fade"
        size="sm"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        backdrop="static"
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            Notification!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Are you sure of the age entered?</h4>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={toggle}
            style={{ backgroundColor: "#014d88", color: "#fff" }}
          >
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RegisterPatient;
