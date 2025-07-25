import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import MatButton from "@material-ui/core/Button";
import Button from "@material-ui/core/Button";
import { Form, FormGroup, Label, Spinner } from "reactstrap";
import { Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCheckSquare,
  faCoffee,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import * as moment from "moment";
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
import { useForm } from "react-hook-form";
import { token, url as baseUrl } from "../../../api";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import _ from "lodash";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import { FaUserPlus } from "react-icons/fa";

library.add(faCheckSquare, faCoffee, faEdit, faTrash);

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
  cardBottom: {},
  Select: {
    height: 45,
    width: 300,
  },
  button: {
    margin: theme.spacing(1),
  },
  root: {
    marginBottom: 20,
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
  demo: {
    backgroundColor: theme.palette.background.default,
  },
  inline: {
    display: "inline",
  },
}));

const schema = yup.object().shape({
  dateOfRegistration: yup.date().required(),
  hospitalNumber: yup.string().required(),
  firstName: yup.string().required(),
  middleName: yup.string().nullable(),
  lastName: yup.string().required(),
  sex: yup.number().required(),
  employmentStatus: yup.number().required(),
  //highestQualification: yup.number().nullable(),
  maritalStatus: yup.number().required(),
  dob: yup.date().required(),
  dateOfBirth: yup.string().required(),
  age: yup.number(),
  ninNumber: yup.string().nullable(),
  pnumber: yup.string().required(),
  altPhonenumber: yup.string().nullable(),
  email: yup.string().nullable(),
  address: yup.string().nullable(),
  landmark: yup.string().nullable(),
  countryId: yup.number().required(),
  stateId: yup.number().required(),
  district: yup.number().nullable(),
});

const isValidEmail = (email) =>
  // eslint-disable-next-line no-useless-escape
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email
  );

const ViewPatient = (props) => {
  const {
    register,
    watch,
    setValue,
    getValues,
    clearErrors,
    setError,
    handleSubmit,
    formState,
  } = useForm({
    resolver: yupResolver(schema),
  });
  const [disValue, setDisValue] = useState("");
  const { errors, isSubmitting } = formState;
  const watchPnumber = watch("pnumber", false);
  const watchAltPhonenumber = watch("altPhonenumber", false);
  const watchContactPhoneNumber = watch("contactPhoneNumber", false);
  const watchShowAge = watch("age", false);
  const [today, setToday] = useState(
    new Date().toISOString().substr(0, 10).replace("T", " ")
  );
  const [minDOB, setMinDOB] = useState(
    new Date("1/1/1930").toISOString().substr(0, 10).replace("T", " ")
  );
  const [maxDOB, setMaxDOB] = useState(
    new Date().toISOString().substr(0, 10).replace("T", " ")
  );
  const [contacts, setContacts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [ageDisabled, setAgeDisabled] = useState(true);
  const [showRelative, setShowRelative] = useState(false);
  const [editRelative, setEditRelative] = useState(null);
  const [genders, setGenders] = useState([]);
  const [sexOptions, setSexOptions] = useState([]);
  const [maritalStatusOptions, setMaritalStatusOptions] = useState([]);
  const [educationOptions, setEducationOptions] = useState([]);
  const [occupationOptions, setOccupationOptions] = useState([]);
  const [relationshipOptions, setRelationshipOptions] = useState([]);
  const [topLevelUnitCountryOptions, settopLevelUnitCountryOptions] = useState(
    []
  );
  const [stateUnitOptions, setStateUnitOptions] = useState([]);
  const [districtUnitOptions, setDistrictUnitOptions] = useState([]);
  const [checkHospitalNumberError, setCheckHospitalNumberError] =
    useState(false);
  const [checkNINError, setCheckNINError] = useState(false);
  const userDetail =
    props.location && props.location.state ? props.location.state.user : null;
  const [patientFacilityId, setPatientFacilityId] = useState(null);
  const classes = useStyles();
  const history = useHistory();
  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen(!open);
  const location = useLocation();
  const locationState = location.state;
  let patientId = null;
  patientId = locationState ? locationState.patientId : null;
  const [patientData, setPatientData] = useState({});

  const getNames = (relationship) => {
    const surname = relationship.surname;
    const firstName = relationship.firstName;
    const otherName = relationship.otherName ? relationship.otherName : "";
    return surname + ", " + firstName + " " + otherName;
  };
  const getRelationship = (relationshipId) => {
    const relationship = relationshipOptions.find(
      (obj) => obj.id == relationshipId
    );
    return relationship ? relationship.display : "";
  };
  const getPhoneContactPoint = (contactPoint) => {
    if (contactPoint.value === null) {
    } else {
      return contactPoint ? phoneNumberFormatCheck(contactPoint).value : "";
    }
  };
  const getAddress = (address) => {
    return address && address.line && address.line.length > 0
      ? address.line[0]
      : "";
  };
  const phoneNumberFormatCheck = (phone) => {
    //console.log(phone);
    if (
      phone != undefined &&
      typeof phone?.value !== null &&
      typeof phone?.value !== "undefined" &&
      phone?.value?.charAt(0) === "0"
    ) {
      phone.value = phone.value.replace("0", "234");
    }
    return phone;
  };
  const calculate_age = (dob) => {
    const today = new Date();
    const dateParts = dob.split("-");
    const birthDate = new Date(dob); // create a date object directlyfrom`dob1`argument
    let age_now = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (age_now <= 0 && m < 0 && today.getDate() < birthDate.getDate()) {
      age_now--;
    }
    // if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    //     age_now--;
    // }
    if (age_now === 0) {
      return m;
    }
    return age_now;
  };
  const getPatient = useCallback(async () => {
    if (patientId) {
      const response = await axios.get(`${baseUrl}patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sexCodeset = await axios.get(
        `${baseUrl}application-codesets/v2/SEX`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const patient = response.data;
      //console.log(patient);
      setPatientData(patient);
      const contacts = patient.contact ? patient.contact : [];
      setContacts(contacts.contact);
      const identifiers = patient.identifier;
      const address = patient.address;
      const contactPoint = patient?.contactPoint;
      const hospitalNumber = identifiers.identifier.find(
        (obj) => obj.type == "HospitalNumber"
      );
      const phone = phoneNumberFormatCheck(
        contactPoint?.contactPoint?.find((obj) => obj.type == "phone")
      );
      const email = contactPoint?.contactPoint?.find(
        (obj) => obj.type == "email"
      );
      const altphone = phoneNumberFormatCheck(
        contactPoint?.contactPoint?.find((obj) => obj.type == "altphone")
      );
      const country =
        address && address.address && address.address.length > 0
          ? address.address[0]
          : null;
      const gender = patient.gender;

      //console.log(_.upperFirst(_.lowerCase(patient.sex)))
      const sex = _.find(sexCodeset.data, {
        display: _.upperFirst(_.lowerCase(patient.sex)),
      }).id;
      const employmentStatus = patient.employmentStatus;
      const education = patient.education;
      const maritalStatus = patient.maritalStatus;
      setPatientFacilityId(patient.facilityId);
      setValue("dateOfRegistration", patient.dateOfRegistration);
      setValue("facilityId", patient.facilityId);
      setValue("ninNumber", patient.ninNumber);
      setValue("firstName", patient.firstName);
      setValue("middleName", patient.otherName);
      setValue("lastName", patient.surname);
      setValue("hospitalNumber", hospitalNumber ? hospitalNumber.value : "");
      setValue("maritalStatus", maritalStatus ? maritalStatus.id : "");
      setValue("employmentStatus", employmentStatus ? employmentStatus.id : "");

      //setValue('gender', gender.id);
      setValue("sex", sex);
      setValue("highestQualification", education ? education.id : "");
      setValue("dob", format(new Date(patient.dateOfBirth), "yyyy-MM-dd"));
      setValue("age", calculate_age(patient.dateOfBirth));
      if (country) {
        setValue("countryId", country.countryId);
        const stateOptions = country.countryId
          ? await loadOrganisationUnitsByParentId(country.countryId)
          : "";
        setStateUnitOptions(stateOptions);
        setValue("stateId", country.stateId);
        const districtOptions = country.stateId
          ? await loadOrganisationUnitsByParentId(country.stateId)
          : "";
        setDistrictUnitOptions(districtOptions);
        setValue("district", country.district);
        setValue("address", country.city);
        setValue("landmark", country.line[0]);
      }
      setValue("pnumber", phone ? phone.value : "+234");
      setValue("email", email ? email.value : null);
      setValue("altPhonenumber", altphone ? altphone.value : "+234");
    }
  }, []);
  const handleAddRelative = () => {
    setShowRelative(true);
  };
  const checkHospitalNumber = async (e) => {
    setCheckHospitalNumberError(false);
    await axios
      .post(`${baseUrl}patient/exist/hospital-number`, e, {
        responseType: "text",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "text/plain",
        },
      })
      .then((response) => {
        if (response.data) {
          setCheckHospitalNumberError(true);
        } else {
          setCheckHospitalNumberError(false);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const checkNIN = async (e) => {
    setCheckNINError(false);
    if (e.target.value.length > 0) {
      await axios
        .post(
          `${baseUrl}patient/exist/nin-number/${e.target.value}`,
          e.target.value,
          {
            responseType: "text",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "text/plain",
            },
          }
        )
        .then((response) => {
          if (response.data) {
            setCheckNINError(true);
          } else {
            setCheckNINError(false);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };
  const handleSaveRelationship = (e) => {
    const relationshipType = getValues("relationshipType");
    const cfirstName = getValues("cfirstName");
    const cmiddleName = getValues("cmiddleName");
    const clastName = getValues("clastName");
    const contactPhoneNumber = getValues("contactPhoneNumber");
    const contactEmail = getValues("contactEmail");
    const contactAddress = getValues("contactAddress");
    if (!relationshipType) {
      setError(
        "relationshipType",
        { type: "custom", message: "Relationship is required" },
        { shouldFocus: true }
      );
      return;
    }
    if (!cfirstName) {
      setError(
        "cfirstName",
        { type: "custom", message: "FirstName is required" },
        { shouldFocus: true }
      );
      return;
    }
    if (!clastName) {
      setError(
        "clastName",
        { type: "custom", message: "LastName is required" },
        { shouldFocus: true }
      );
      return;
    }

    const contact = {
      address: {
        line: [contactAddress],
      },
      contactPoint: {
        type: "phone",
        value: contactPhoneNumber,
      },
      firstName: cfirstName,
      fullName: cfirstName + " " + cmiddleName + " " + clastName,
      relationshipId: relationshipType,
      surname: clastName,
      otherName: cmiddleName,
    };

    if (editRelative != null) {
      contacts.splice(editRelative, 1);
      setContacts(contacts.concat(contact));
    } else {
      if (contacts === undefined) {
        setContacts([].concat(contact));
      } else {
        setContacts(contacts.concat(contact));
      }
    }
    setShowRelative(false);
  };
  const handleCancelSaveRelationship = () => {
    setShowRelative(false);
  };
  const handleEmailValidation = (email) => {
    console.error("ValidateEmail was called with", email);

    const isValid = isValidEmail(email);
    if (!isValid) {
      errors.email.message = "Please enter a valid email";
    }
    const validityChanged =
      (errors.email && isValid) || (!errors.email && !isValid);
    if (validityChanged) {
      console.error("Fire tracker with", isValid ? "Valid" : "Invalid");
    }

    return isValid;
  };

  const onSubmit = async (data) => {
    if (
      _.find(errors, function (error) {
        return error;
      })
    ) {
      toast.error("Failed to save form kindly check the form for errors", {
        position: toast.POSITION.TOP_RIGHT,
      });
    } else {
      try {
        const patientForm = {
          active: true,
          address: [
            {
              city: data.address,
              countryId: data.countryId,
              district: data.district,
              line: [data.landmark],
              organisationUnitId: 0,
              postalCode: "",
              stateId: data.stateId,
            },
          ],
          contact: contacts,
          contactPoint: [],
          dateOfBirth: new Date(data.dob),
          deceased: false,
          deceasedDateTime: null,
          firstName: data.firstName,
          sexId: data.sex,
          /*genderId:data.sex,*/
          identifier: [
            {
              assignerId: 1,
              type: "HospitalNumber",
              value: data.hospitalNumber,
            },
          ],
          ninNumber: data.ninNumber,
          otherName: data.middleName,
          maritalStatusId: data.maritalStatus,
          surname: data.lastName,
          educationId: data.highestQualification,
          employmentStatusId:
            data.employmentStatus != null ? data.employmentStatus : null,
          dateOfRegistration: data.dateOfRegistration,
          isDateOfBirthEstimated: data.dateOfBirth == "Actual" ? false : true,
        };
        const phone = {
          type: "phone",
          value: data.pnumber,
        };
        if (data.email) {
          const email = {
            type: "email",
            value: data.email,
          };
          patientForm.contactPoint.push(email);
        }
        if (data.altPhonenumber) {
          const altPhonenumber = {
            type: "altphone",
            value: data.altPhonenumber,
          };
          patientForm.contactPoint.push(altPhonenumber);
        }
        patientForm.contactPoint.push(phone);
        if (patientId) {
          patientForm.id = null;
          patientForm.facilityId = patientFacilityId;
          const response = await axios.put(
            `${baseUrl}patient/${patientId}`,
            patientForm,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          const response = await axios.post(`${baseUrl}patient`, patientForm, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        toast.success("Patient Register successful");
        history.push("/");
      } catch (e) {
        console.error(e);
        toast.error("An error occured while registering a patient !", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    }
  };
  const onError = (errors) => {
    console.error(errors);
  };
  const handleEditRelative = (relative, index) => {
    setValue("relationshipType", relative.relationshipId);
    setValue("cfirstName", relative.firstName);
    setValue("cmiddleName", relative.otherName);
    setValue("clastName", relative.surname);
    setValue(
      "contactPhoneNumber",
      relative.contactPoint
        ? phoneNumberFormatCheck(relative.contactPoint).value
        : ""
    );
    setValue(
      "contactAddress",
      relative.address &&
        relative.address.line &&
        relative.address.line.length > 0
        ? relative.address.line[0]
        : ""
    );
    setShowRelative(true);
    setEditRelative(index);
  };
  const handleDeleteRelative = (index) => {
    setTimeout(() => {
      contacts.splice(index, 1);
      setContacts(contacts);
      setShowRelative(true);
      setShowRelative(false);
    }, 500);
  };

  const loadSexes = useCallback(async () => {
    try {
      const response = await axios.get(
        `${baseUrl}application-codesets/v2/SEX`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await setSexOptions(response.data);
    } catch (e) {
      toast.error("An error occured while fetching sex codesets !", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  }, []);
  const loadMaritalStatus = useCallback(async () => {
    try {
      const response = await axios.get(
        `${baseUrl}application-codesets/v2/MARITAL_STATUS`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMaritalStatusOptions(response.data);
    } catch (e) {
      toast.error("An error occured while fetching marital codesets !", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  }, []);
  const loadEducation = useCallback(async () => {
    try {
      const response = await axios.get(
        `${baseUrl}application-codesets/v2/EDUCATION`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEducationOptions(response.data);
    } catch (e) {
      toast.error("An error occured while fetching education codesets !", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  }, []);
  const loadOccupation = useCallback(async () => {
    try {
      const response = await axios.get(
        `${baseUrl}application-codesets/v2/OCCUPATION`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOccupationOptions(response.data);
    } catch (e) {
      toast.error("An error occured while fetching occupation codesets !", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  }, []);
  const loadRelationships = useCallback(async () => {
    try {
      const response = await axios.get(
        `${baseUrl}application-codesets/v2/RELATIONSHIP`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRelationshipOptions(response.data);
    } catch (e) {
      toast.error("An error occured while fetching relationship codesets !", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  }, []);
  const loadTopLevelCountry = useCallback(async () => {
    const response = await axios.get(
      `${baseUrl}organisation-units/parent-organisation-units/0`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    settopLevelUnitCountryOptions(response.data);
  }, []);
  const loadOrganisationUnitsByParentId = async (parentId) => {
    const response = await axios.get(
      `${baseUrl}organisation-units/parent-organisation-units/${parentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  };
  const onCountryChange = async (e) => {
    if (e.target.value) {
      const stateOptions = await loadOrganisationUnitsByParentId(
        e.target.value
      );
      setStateUnitOptions(stateOptions);
    } else {
      setStateUnitOptions([]);
    }
  };
  const onStateChange = async (e) => {
    if (e.target.value) {
      const districtOptions = await loadOrganisationUnitsByParentId(
        e.target.value
      );
      setDistrictUnitOptions(districtOptions);
    } else {
      setDistrictUnitOptions([]);
    }
  };

  const handleDobChange = (e) => {
    if (e.target.value) {
      const today = new Date();
      const birthDate = new Date(e.target.value);
      let age_now = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age_now--;
      }
      setValue("age", age_now);
    } else {
      setValue("age", null);
    }
  };

  const handleDateOfBirthChange = (e) => {
    if (e.target.value == "Actual") {
      setAgeDisabled(true);
    } else if (e.target.value == "Estimated") {
      setAgeDisabled(false);
    }
  };

  const handleAgeChange = (e) => {
    if (!ageDisabled && e.target.value) {
      setValue("age", e.target.value);
      const currentDate = new Date();
      currentDate.setDate(15);
      currentDate.setMonth(5);
      const estDob = moment(currentDate.toISOString());
      const dob = estDob.add(e.target.value * -1, "years");
      setValue("dob", format(new Date(dob.toDate()), "yyyy-MM-dd"));
      if (calculate_age(format(new Date(dob.toDate()), "yyyy-MM-dd")) >= 60) {
        toggle();
      }
    }
  };

  useEffect(() => {
    loadSexes();
    loadMaritalStatus();
    loadEducation();
    loadOccupation();
    loadRelationships();
    loadTopLevelCountry();
    getPatient();
    districtValue();
  }, [
    loadSexes,
    loadMaritalStatus,
    loadEducation,
    loadOccupation,
    loadRelationships,
    loadTopLevelCountry,
    getPatient,
  ]);

  let genderRows = null;
  let sexRows = null;
  let maritalStatusRows = null;
  let educationRows = null;
  let occupationRows = null;
  let relationshipRows = null;
  let topLevelUnitCountryRows = null;
  let stateRows = null;
  let districtRows = null;
  if (sexOptions && sexOptions.length > 0) {
    sexRows = sexOptions.map((sex, index) => (
      <option key={sex.id} value={sex.id}>
        {sex.display}
      </option>
    ));
  }
  if (maritalStatusOptions && maritalStatusOptions.length > 0) {
    maritalStatusRows = maritalStatusOptions.map(
      (maritalStatusOption, index) => (
        <option
          key={maritalStatusOption.id}
          value={maritalStatusOption.id}
          defaultValue={maritalStatusOption.display}
        >
          {maritalStatusOption.display}
        </option>
      )
    );
  }
  if (educationOptions && educationOptions.length > 0) {
    educationRows = educationOptions.map((educationOption, index) => (
      <option key={educationOption.id} value={educationOption.id}>
        {educationOption.display}
      </option>
    ));
  }
  if (occupationOptions && occupationOptions.length > 0) {
    occupationRows = occupationOptions.map((occupationOption, index) => (
      <option key={occupationOption.id} value={occupationOption.id}>
        {occupationOption.display}
      </option>
    ));
  }
  if (relationshipOptions && relationshipOptions.length > 0) {
    relationshipRows = relationshipOptions.map((relationshipOption, index) => (
      <option key={relationshipOption.id} value={relationshipOption.id}>
        {relationshipOption.display}
      </option>
    ));
  }
  if (topLevelUnitCountryOptions && topLevelUnitCountryOptions.length > 0) {
    topLevelUnitCountryRows = topLevelUnitCountryOptions.map(
      (topLevelUnitCountryOption, index) => (
        <option
          key={topLevelUnitCountryOption.id}
          value={topLevelUnitCountryOption.id}
        >
          {topLevelUnitCountryOption.name}
        </option>
      )
    );
  }
  if (stateUnitOptions && stateUnitOptions.length > 0) {
    stateRows = stateUnitOptions.map((stateUnitOption, index) => (
      <option key={stateUnitOption.id} value={stateUnitOption.id}>
        {stateUnitOption.name}
      </option>
    ));
  }
  if (districtUnitOptions && districtUnitOptions.length > 0) {
    districtRows = districtUnitOptions.map((districtUnitOption, index) => (
      <option key={districtUnitOption.id} value={districtUnitOption.id}>
        {districtUnitOption.name}
      </option>
    ));
  }

  const districtValue = () => {
    let value = "";
    if (
      Object.keys(patientData).length !== 0 &&
      patientData.address.address[0].district !== null
    ) {
      districtUnitOptions.map((districtUnitOption, index) => {
        if (districtUnitOption.id === patientData.address.address[0].district) {
          value = districtUnitOption.name;
          setDisValue(value);
        }
      });
    }
    return value;
  };

  const handleCancel = () => {
    history.push("/");
  };

  const checkPhoneNumber = (e, inputName) => {
    setValue(inputName, e);
  };

  const alphabetOnly = (e, inputName) => {
    const result = e.target.value.replace(/[^a-z]/gi, "");
    setValue(inputName, result);
  };

  return (
    <>
      <ToastContainer autoClose={3000} hideProgressBar />
      <Card className={classes.root}>
        <CardContent>
          <div className="row mb-12 col-md-12" style={{ paddingBottom: "5px" }}>
            <div className="mb-6 col-md-6">
              <Breadcrumbs aria-label="breadcrumb">
                <Typography style={{ color: "#992E62" }}>Patient</Typography>
                <Typography style={{ color: "#014d88" }}>
                  Registration
                </Typography>
              </Breadcrumbs>
            </div>
            <div className="mb-6 col-md-6">
              <Link
                to={{
                  pathname: "/",
                  state: "users",
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  className=" float-right ms-1"
                  style={{ backgroundColor: "#014d88", fontWeight: "bolder" }}
                  startIcon={<TiArrowBack />}
                >
                  <span style={{ textTransform: "capitalize" }}>Back </span>
                </Button>
              </Link>
            </div>
          </div>
          <div className="col-xl-12 col-lg-12">
            <Form onSubmit={handleSubmit(onSubmit, onError)}>
              <div className="card">
                <div
                  className="card-header"
                  style={{
                    backgroundColor: "#014d88",
                    color: "#fff",
                    fontWeight: "bolder",
                  }}
                >
                  <h5
                    className="card-title"
                    style={{ color: "#fff", fontWeight: "bolder" }}
                  >
                    {userDetail === null
                      ? "Basic Information"
                      : "Edit User Information"}
                  </h5>
                </div>

                <div className="card-body">
                  <div className="basic-form">
                    <div className="row">
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label for="dateOfRegistration">
                            Date of Registration*{" "}
                          </Label>
                          <input
                            className="form-control"
                            type="date"
                            name="dateOfRegistration"
                            id="dateOfRegistration"
                            max={today}
                            {...register("dateOfRegistration")}
                            onChange={(e) => {
                              if (
                                new Date(e.target.value) instanceof Date &&
                                e.target.value != ""
                              ) {
                                setMaxDOB(
                                  new Date(e.target.value)
                                    .toISOString()
                                    .substr(0, 10)
                                    .replace("T", " ")
                                );
                              } else {
                                setMaxDOB(
                                  new Date()
                                    .toISOString()
                                    .substr(0, 10)
                                    .replace("T", " ")
                                );
                              }
                            }}
                            style={{ border: "1px solid #014d88" }}
                            readOnly
                          />
                          {errors.dateOfRegistration && (
                            <p>Enter the registration date</p>
                          )}
                        </FormGroup>
                      </div>

                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label for="patientId">Hospital Number* </Label>
                          <input
                            className="form-control"
                            type="text"
                            name="hospitalNumber"
                            id="hospitalNumber"
                            autoComplete="off"
                            onInput={(e) => {
                              e.target.value = e.target.value.replace(
                                /\s/g,
                                ""
                              );
                           
                              checkHospitalNumber(e.target.value);
                            }}
                            onChange={checkHospitalNumber}
                            {...register("hospitalNumber", {
                              onChange: (e) => {
                                checkHospitalNumber(
                                  e.target.value.replace(/\s/g, "")
                                );
                              },
                            })}
                            style={{ border: "1px solid #014d88" }}
                            readOnly
                          />
                          {checkHospitalNumberError && (
                            <p>Hospital number has been registered before</p>
                          )}
                          {!checkHospitalNumberError &&
                            errors.hospitalNumber && (
                              <p>Enter the hospital number</p>
                            )}
                        </FormGroup>
                      </div>
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label for="ninNumber">
                            National Identification Number (NIN)
                          </Label>
                          <input
                            className="form-control"
                            name="ninNumber"
                            type="number"
                            {...register("ninNumber")}
                            id="ninNumber"
                            autoComplete="off"
                            onChange={(e) => {
                             
                              clearErrors("ninNumber");
                              e.target.value = e.target.value.replace(
                                /\D/g,
                                ""
                              );
                              checkNIN(e);
                              if (e.target.value.length > e.target.maxLength) {
                                e.target.value = e.target.value.slice(
                                  0,
                                  e.target.maxLength
                                );
                                clearErrors("ninNumber");
                              } else if (
                                e.target.value.length > 0 &&
                                e.target.value.length < e.target.maxLength
                              ) {
                                setError("ninNumber");
                              } else if (
                                e.target.value.length <= 0 ||
                                e.target.value.length == e.target.maxLength
                              ) {
                                clearErrors("ninNumber");
                              }
                            }}
                            minLength={11}
                            maxLength={11}
                            style={{ border: "1px solid #014d88" }}
                            readOnly
                          />
                          {checkNINError && (
                            <p>NIN has been registered before</p>
                          )}
                          {!checkNINError && errors.ninNumber && (
                            <p>Enter a valid NIN Number</p>
                          )}
                        </FormGroup>
                      </div>
                      {/*                                            <div className="form-group mb-3 col-md-3">
                                                <FormGroup>
                                                    <Label for="emrId">EMR ID *</Label>
                                                    <input
                                                        className="form-control"
                                                        disabled={true}
                                                        type="text"
                                                        name="emrId"
                                                        id="emrId"
                                                        style={{border: "1px solid #014d88"}}
                                                    />
                                                </FormGroup>
                                            </div>*/}
                    </div>

                    <div className="row">
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label for="firstName">First Names *</Label>
                          <input
                            className="form-control"
                            type="text"
                            name="firstName"
                            id="firstName"
                            {...register("firstName", {
                              onChange: (e) => {
                                alphabetOnly(e, "firstName");
                              },
                            })}
                            style={{ border: "1px solid #014d88" }}
                            readOnly
                          />
                          {errors.firstName && <p>First Name is required</p>}
                        </FormGroup>
                      </div>

                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>Middle Name</Label>
                          <input
                            className="form-control"
                            type="text"
                            name="middleName"
                            id="middleName"
                            {...register("middleName", {
                              onChange: (e) => {
                                alphabetOnly(e, "middleName");
                              },
                            })}
                            style={{ border: "1px solid #014d88" }}
                            readOnly
                          />
                          {errors.middleName && (
                            <p>{errors.middleName.message}</p>
                          )}
                        </FormGroup>
                      </div>

                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>Last Name *</Label>
                          <input
                            className="form-control"
                            type="text"
                            name="lastName"
                            id="lastName"
                            {...register("lastName", {
                              onChange: (e) => {
                                alphabetOnly(e, "lastName");
                              },
                            })}
                            style={{ border: "1px solid #014d88" }}
                            readOnly
                          />
                          {errors.lastName && <p>Last Name is required</p>}
                        </FormGroup>
                      </div>
                    </div>

                    <div className="row">
                      <div className="form-group  col-md-4">
                        <FormGroup>
                          <Label>Sex *</Label>
                          <input
                            className="form-control"
                            type="text"
                            name="sex"
                            id="sex"
                            value={
                              patientData.sex !== null ? patientData.sex : " "
                            }
                            style={{ border: "1px solid #014d88" }}
                            readOnly
                          />
                          {errors.sex && <p>Select Sex</p>}
                        </FormGroup>
                      </div>
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
                                {...register("dateOfBirth")}
                                onChange={(e) => handleDateOfBirthChange(e)}
                                style={{ border: "1px solid #014d88" }}
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
                                {...register("dateOfBirth")}
                                onChange={(e) => handleDateOfBirthChange(e)}
                                style={{ border: "1px solid #014d88" }}
                              />{" "}
                              Estimated
                            </label>
                          </div>
                        </FormGroup>
                      </div>

                      <div className="form-group mb-3 col-md-2">
                        <FormGroup>
                          <Label>Date</Label>
                          <input
                            className="form-control"
                            type="date"
                            name="dob"
                            id="dob"
                            min={minDOB}
                            max={maxDOB}
                            {...register("dob")}
                            onChange={(e) => {
                              clearErrors("dob");
                              if (new Date(e.target.value) instanceof Date) {
                          
                                handleDobChange(e);
                                clearErrors("dob");
                              } else {
                                setError("dob");
                              }
                            }}
                            style={{ border: "1px solid #014d88" }}
                            readOnly
                          />
                          {errors.dob && (
                            <p>Enter a valid date of birth (dd/mm/yyyy)</p>
                          )}
                        </FormGroup>
                      </div>

                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>Age</Label>
                          <input
                            className="form-control"
                            type="number"
                            name="age"
                            id="age"
                            {...register("age")}
                            disabled={ageDisabled}
                            onChange={(e) => handleAgeChange(e)}
                            style={{ border: "1px solid #014d88" }}
                            readOnly
                          />
                        </FormGroup>
                      </div>
                    </div>

                    <div className={"row"}>
                      {/*                                            {watchShowAge >=0 &&
                                            <>*/}
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>Marital Status *</Label>
                          <input
                            className="form-control"
                            type="text"
                            name="maritalStatus"
                            id="maritalStatus"
                            value={
                              Object.keys(patientData).length !== 0 &&
                              patientData.maritalStatus !== null
                                ? patientData.maritalStatus.display
                                : ""
                            }
                            style={{ border: "1px solid #014d88" }}
                            readOnly
                          />
                          {errors.maritalStatus && <p>Select Marital Status</p>}
                        </FormGroup>
                      </div>

                      <div className="form-group  col-md-4">
                        <FormGroup>
                          <Label>Employment Status *</Label>
                          <input
                            className="form-control"
                            type="text"
                            name="employmentStatus"
                            id="employmentStatus"
                            value={
                              Object.keys(patientData).length !== 0 &&
                              patientData.employmentStatus !== null
                                ? patientData.employmentStatus.display
                                : " "
                            }
                            style={{ border: "1px solid #014d88" }}
                            readOnly
                          />
                          {errors.employmentStatus && (
                            <p>Select Employment Status</p>
                          )}
                        </FormGroup>
                      </div>
                      {/*
                                            </>
                                            }
*/}

                      <div className="form-group  col-md-4">
                        <FormGroup>
                          <Label>Education Level</Label>
                          <input
                            className="form-control"
                            type="text"
                            name="highestQualification"
                            id="highestQualification"
                            value={
                              Object.keys(patientData).length !== 0 &&
                              patientData.education !== null
                                ? patientData.education.display
                                : ""
                            }
                            style={{ border: "1px solid #014d88" }}
                            readOnly
                          />
                          {errors.highestQualification && (
                            <p>Select the Education Level</p>
                          )}
                        </FormGroup>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div
                  className="card-header"
                  style={{
                    backgroundColor: "#014d88",
                    color: "#fff",
                    fontWeight: "bolder",
                  }}
                >
                  <h5 className="card-title">Contact Details</h5>
                </div>

                <div className="card-body">
                  <div className={"row"}>
                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>Phone Number *</Label>
                        <PhoneInput
                          containerStyle={{
                            width: "100%",
                            border: "1px solid #014d88",
                          }}
                          inputStyle={{ width: "100%", borderRadius: "0px" }}
                          country={"ng"}
                          masks={{ ng: "...-...-....", at: "(....) ...-...." }}
                          placeholder="(234)7099999999"
                          value={getValues("pnumber")}
                          onChange={(e) => {
                            checkPhoneNumber(e, "pnumber");
                          }}
                          isValid={(value, country) => {
                            if (value === country.countryCode) {
                              return true;
                            } else {
                              if (value.length < 13) {
                                errors.pnumber = true;
                                return false;
                              } else {
                                errors.pnumber = false;
                                return true;
                              }
                            }
                          }}
                          disabled={true}
                        />

                        {/*                                                <input
                                                    className="form-control"
                                                    type="tel"
                                                    name="pnumber"
                                                    id="pnumber"
                                                    {...register("pnumber",{
                                                        onChange:(e)=>{checkPhoneNumber(e,'pnumber')}
                                                    })}
                                                    placeholder="(234)7099999999"
                                                    style={{border: "1px solid #014d88"}}
                                                />*/}
                        {/*errors.pnumber && <p>Phone number is required</p>*/}
                      </FormGroup>
                    </div>

                    <div className="form-group col-md-4">
                      <FormGroup>
                        <Label>Alt. Phone Number</Label>
                        <PhoneInput
                          containerStyle={{
                            width: "100%",
                            border: "1px solid #014d88",
                          }}
                          inputStyle={{ width: "100%", borderRadius: "0px" }}
                          country={"ng"}
                          masks={{ ng: "...-...-....", at: "(....) ...-...." }}
                          placeholder="(234)7099999999"
                          value={getValues("altPhonenumber")}
                          onChange={(e) => {
                            checkPhoneNumber(e, "altPhonenumber");
                          }}
                          isValid={(value, country) => {
                            if (value === country.countryCode) {
                              return true;
                            } else {
                              if (value.length < 13) {
                                errors.altPhonenumber = true;
                                return "Enter a valid phone number";
                              } else {
                                errors.altPhonenumber = false;
                                return true;
                              }
                            }
                          }}
                          disabled={true}
                        />
                        {/*                                                <input
                                                    className="form-control"
                                                    type="tel"
                                                    name="altPhoneNumber"
                                                    id="altPhoneNumber"
                                                    {...register("altPhonenumber",{
                                                        onChange:(e)=>{checkPhoneNumber(e,'altPhonenumber')}
                                                    })}
                                                    placeholder="(234)7099999999"
                                                    style={{border: "1px solid #014d88"}}
                                                />*/}
                        {errors.altPhonenumber && (
                          <p>{errors.altPhonenumber.message}</p>
                        )}
                      </FormGroup>
                    </div>

                    <div className="form-group col-md-4">
                      <FormGroup>
                        <Label>Email</Label>
                        <input
                          className="form-control"
                          type="email"
                          name="email"
                          id="email"
                          {...register("email", {
                            required: true,
                            validate: handleEmailValidation,
                          })}
                          style={{ border: "1px solid #014d88" }}
                          readOnly
                        />
                        {errors.email && <p>{errors.email.message}</p>}
                      </FormGroup>
                    </div>
                  </div>

                  <div className="row">
                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>Country *</Label>
                        {/* <input
                                                    className="form-control"
                                                    type="text"
                                                    name="country"
                                                    id="country"
                                                    value={Object.keys(patientData).length !== 0 &&  patientData.address.address[0]?.countryId === 1 ? "Nigeria" : ""}
                                                    style={{border: "1px solid #014d88"}}
                                                    readOnly
                                                />*/}
                        <select
                          className="form-control"
                          type="text"
                          name="country"
                          id="country"
                          readOnly
                          style={{ border: "1px solid #014d88" }}
                          {...register("countryId")}
                          onChange={(e) => onCountryChange(e)}
                        >
                          {/*<option value={""}>Select Country</option>*/}
                          {topLevelUnitCountryRows}
                        </select>
                      </FormGroup>
                    </div>

                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>State *</Label>
                        {/*<input
                                                    className="form-control"
                                                    type="text"
                                                    name="stateId"
                                                    id="stateId"
                                                    value={Object.keys(patientData).length !== 0 && patientData.address.address[0].city !== null ? patientData.address.address[0].city : ""}
                                                    style={{border: "1px solid #014d88"}}
                                                    readOnly
                                                />*/}
                        <select
                          className="form-control"
                          type="text"
                          name="stateId"
                          id="stateId"
                          readOnly
                          style={{ border: "1px solid #014d88" }}
                          {...register("stateId")}
                          onChange={(e) => onStateChange(e)}
                        >
                          <option value={""}>Select State</option>
                          {stateRows}
                        </select>
                      </FormGroup>
                    </div>

                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>Province/District/LGA *</Label>
                        {/*  <input
                                                        className="form-control"
                                                        type="text"
                                                        name="district"
                                                        id="district"
                                                        value={disValue !== "" ? disValue : ""}
                                                        style={{border: "1px solid #014d88"}}
                                                        readOnly
                                                    />*/}
                        <select
                          className="form-control"
                          type="text"
                          name="district"
                          id="district"
                          readOnly
                          style={{ border: "1px solid #014d88" }}
                          {...register("district")}
                        >
                          <option value={""}>
                            Select Province/District/LGA
                          </option>
                          {districtRows}
                        </select>
                        {errors.district && <p>Select Province/District/LGA</p>}
                      </FormGroup>
                    </div>
                  </div>

                  <div className={"row"}>
                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>Street Address</Label>
                        <input
                          className="form-control"
                          type="text"
                          name="address"
                          id="address"
                          style={{ border: "1px solid #014d88" }}
                          {...register("address")}
                          readOnly
                        />
                        {errors.address && <p>{errors.address.message}</p>}
                      </FormGroup>
                    </div>

                    <div className="form-group  col-md-6">
                      <FormGroup>
                        <Label>Landmark</Label>
                        <input
                          className="form-control"
                          type="text"
                          name="landmark"
                          id="landmark"
                          style={{ border: "1px solid #014d88" }}
                          {...register("landmark")}
                          readOnly
                        />
                        {errors.landmark && <p>{errors.landmark.message}</p>}
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div
                  className="card-header"
                  style={{
                    backgroundColor: "#014d88",
                    color: "#fff",
                    fontWeight: "bolder",
                  }}
                >
                  <h5 className="card-title">Relationship / Next Of Kin</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    {contacts && contacts.length > 0 && (
                      <div className="col-xl-12 col-lg-12">
                        <table style={{ width: "100%" }}>
                          <thead>
                            <tr>
                              <th>Relationship Type</th>
                              <th>Name</th>
                              <th>Phone</th>
                              <th>Address</th>
                            </tr>
                          </thead>
                          <tbody>
                            {contacts.map((item, index) => {
                              return (
                                <tr key={item.index}>
                                  <td>
                                    {getRelationship(item.relationshipId)}
                                  </td>
                                  <td>{getNames(item)}</td>
                                  <td>
                                    {getPhoneContactPoint(item.contactPoint)}
                                  </td>
                                  <td>{getAddress(item.address)}</td>
                                  {/*<td>
                                                                        <button type="button"
                                                                                className="btn btn-default btn-light btn-sm editRow"
                                                                                onClick={(e) => handleEditRelative(item, index)}>
                                                                            <FontAwesomeIcon icon="edit" />
                                                                        </button>
                                                                        &nbsp;&nbsp;
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-danger btn-sm removeRow"
                                                                            onClick={(e) => handleDeleteRelative(index)}>
                                                                            <FontAwesomeIcon icon="trash" />
                                                                        </button>
                                                                    </td>*/}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <div className="col-xl-12 col-lg-12">
                      {showRelative && (
                        <div className="card">
                          <div className="card-body">
                            <div className="row">
                              <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                  <Label for="relationshipType">
                                    Relationship Type *
                                  </Label>
                                  <select
                                    className="form-control"
                                    name="relationshipType"
                                    id="relationshipType"
                                    style={{ border: "1px solid #014d88" }}
                                    {...register("relationshipType")}
                                  >
                                    <option value={""}></option>
                                    {relationshipRows}
                                  </select>
                                  {errors.relationshipType && (
                                    <p>{errors.relationshipType.message}</p>
                                  )}
                                </FormGroup>
                              </div>

                              <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                  <Label for="cfirstName">First Name *</Label>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="cfirstName"
                                    id="cfirstName"
                                    style={{ border: "1px solid #014d88" }}
                                    {...register("cfirstName", {
                                      onChange: (e) => {
                                        alphabetOnly(e, "cfirstName");
                                      },
                                    })}
                                  />
                                  {errors.cfirstName && (
                                    <p>{errors.cfirstName.message}</p>
                                  )}
                                </FormGroup>
                              </div>

                              <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                  <Label>Middle Name</Label>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="cmiddleName"
                                    id="cmiddleName"
                                    style={{ border: "1px solid #014d88" }}
                                    {...register("cmiddleName", {
                                      onChange: (e) => {
                                        alphabetOnly(e, "cmiddleName");
                                      },
                                    })}
                                  />
                                  {errors.cmiddleName && (
                                    <p>{errors.cmiddleName.message}</p>
                                  )}
                                </FormGroup>
                              </div>

                              <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                  <Label>Last Name </Label>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="clastName"
                                    id="clastName"
                                    style={{ border: "1px solid #014d88" }}
                                    {...register("clastName", {
                                      onChange: (e) => {
                                        alphabetOnly(e, "clastName");
                                      },
                                    })}
                                  />
                                  {errors.clastName && (
                                    <p>{errors.clastName.message}</p>
                                  )}
                                </FormGroup>
                              </div>
                            </div>

                            <div className="row">
                              <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                  <Label for="contactPhoneNumber">
                                    Phone Number
                                  </Label>
                                  <PhoneInput
                                    containerStyle={{
                                      width: "100%",
                                      border: "1px solid #014d88",
                                    }}
                                    inputStyle={{
                                      width: "100%",
                                      borderRadius: "0px",
                                    }}
                                    country={"ng"}
                                    onlyCountries={["ng"]}
                                    masks={{
                                      ng: "...-...-....",
                                      at: "(....) ...-....",
                                    }}
                                    placeholder="(234)7099999999"
                                    value={getValues("contactPhoneNumber")}
                                    onChange={(e) => {
                                      checkPhoneNumber(e, "contactPhoneNumber");
                                    }}
                                    isValid={(value, country) => {
                                      if (value === country.countryCode) {
                                        return true;
                                      } else {
                                        if (value.length < 13) {
                                          errors.contactPhoneNumber = true;
                                          return "Enter a valid phone number";
                                        } else {
                                          errors.contactPhoneNumber = false;
                                          return true;
                                        }
                                      }
                                    }}
                                  />
                                  {/*                                                                        <input
                                                                            className="form-control"
                                                                            type="text"
                                                                            name="contactPhoneNumber"
                                                                            id="contactPhoneNumber"
                                                                            style={{border: "1px solid #014d88"}}
                                                                            {...register("contactPhoneNumber",{
                                                                                onChange:(e)=>{checkPhoneNumber(e,'contactPhoneNumber')}
                                                                            })}
                                                                        />*/}
                                  //
                                  {errors.contactPhoneNumber && (
                                    <p>{errors.contactPhoneNumber.message}</p>
                                  )}
                                </FormGroup>
                              </div>

                              <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                  <Label for="contactEmail">Email</Label>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="contactEmail"
                                    id="contactEmail"
                                    style={{ border: "1px solid #014d88" }}
                                    {...register("contactEmail", {
                                      onChange: (e) => {
                                        checkPhoneNumber(e, "contactEmail");
                                      },
                                    })}
                                  />
                                  {errors.contactEmail && (
                                    <p>{errors.contactEmail.message}</p>
                                  )}
                                </FormGroup>
                              </div>

                              <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                  <Label for="contactAddress">Address</Label>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="contactAddress"
                                    id="contactAddress"
                                    style={{ border: "1px solid #014d88" }}
                                    {...register("contactAddress")}
                                  />
                                  {errors.contactAddress && (
                                    <p>{errors.contactAddress.message}</p>
                                  )}
                                </FormGroup>
                              </div>
                            </div>

                            {/*  <div className="row">
                                                                <div className="">
                                                                    <MatButton
                                                                        type="button"
                                                                        variant="contained"
                                                                        color="primary"
                                                                        className={classes.button}
                                                                        onClick={handleSaveRelationship}
                                                                        style={{backgroundColor:'#014d88',color:'#fff'}}
                                                                    >
                                                                        Add
                                                                    </MatButton>
                                                                    <MatButton
                                                                        type="button"
                                                                        variant="contained"
                                                                        color="secondary"
                                                                        className={classes.button}
                                                                        onClick={handleCancelSaveRelationship}
                                                                        style={{backgroundColor:'#992E62',color:'#fff'}}
                                                                    >
                                                                        Cancel
                                                                    </MatButton>
                                                                </div>
                                                            </div> */}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/*
                                    <div className="row">
                                        <MatButton
                                            type="button"
                                            variant="contained"
                                            color="primary"
                                            className={classes.button}
                                            startIcon={<AddIcon />}
                                            onClick={handleAddRelative}
                                            style={{backgroundColor:'#014d88',fontWeight:"bolder"}}
                                        >
                                            Add a Relative/Next Of Kin
                                        </MatButton>
                                    </div>
                                    */}
                </div>
              </div>

              {saving ? <Spinner /> : ""}

              <br />
              {/*!checkHospitalNumberError &&
                                <>
                                    {userDetail ===null ? (
                                            <MatButton
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                className={classes.button}
                                                startIcon={<SaveIcon />}
                                                style={{backgroundColor:'#014d88',color:'#fff'}}
                                            >
                                                {!saving ? (
                                                    <span style={{ textTransform: "capitalize" }}>Save</span>
                                                ) : (
                                                    <span style={{ textTransform: "capitalize" }}>Saving...</span>
                                                )}
                                            </MatButton>
                                        )
                                        :
                                        (
                                            <MatButton
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                className={classes.button}
                                                startIcon={<SaveIcon />}
                                                style={{backgroundColor:'#014d88',color:'#fff'}}
                                            >
                                                {!saving ? (
                                                    <span style={{ textTransform: "capitalize" }}>Save</span>
                                                ) : (
                                                    <span style={{ textTransform: "capitalize" }}>Saving...</span>
                                                )}
                                            </MatButton>
                                        )
                                    }
                                </>

                            }

                            <MatButton
                                variant="contained"
                                className={classes.button}
                                startIcon={<CancelIcon />}
                                onClick={handleCancel}
                                style={{backgroundColor:'#992E62',color:'#fff'}}
                            >
                                <span style={{ textTransform: "capitalize" }}>Cancel</span>
                            </MatButton> */}
            </Form>
          </div>
        </CardContent>
      </Card>
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
          <h4>Are you Sure of the Age entered?</h4>
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

export default ViewPatient;
