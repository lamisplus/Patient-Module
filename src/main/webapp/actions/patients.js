import axios from "axios";
import { url as baseUrl } from "../api";
import * as ACTION_TYPES from "./types";
import * as CODES from "api/codes";
import { toast } from "react-toastify";

/**
 * @Actions
 * CheckIn CRUD OPERATIONS
 * returns API response from server
 * =================================
 * fetchAll()
 * fetchById()
 * create()
 * update()
 * Delete()
 * fetchPatientVitals()
 * fetchPatientAllergies()
 * fetchPatientLatestVitalSigns()
 * fetchCountries()
 * @method GET => fetchPatientTestOrders()  get all patient's lab order encounter: params {patientId}{formName} || query {null}
 * @method GET => fetchPatientEncounters() get all patient's encounter: params{patientId, onSuccess, onError} || query{null}
 * @method GET => fetchPatientEncounterProgramCodeExclusionList() get all patient's encounter that is not general service: params{patientId, onSuccess, onError} || query{null}
 */
export const fetchAll = (onSuccess, onError) => dispatch => {
  axios
    .get(`${baseUrl}patients?size=200`)
    .then(response => {
    
      if(onSuccess){
        onSuccess();
      }
      dispatch({
        type: ACTION_TYPES.PATIENTS_FETCH_ALL,
        payload: response.data
      });
      onSuccess();
    })

    .catch(error => {
      if(onError){
        onError();
      }
      dispatch({
        type: ACTION_TYPES.PATIENTS_ERROR,
        payload: "Something went wrong, please try again"
      })
      onError();
    }
    
    );
};

export const fetchById = (id, onSuccess, onError) => dispatch => {
  if(id){
  axios
    .get(`${baseUrl}patients/${id}`)
    .then(response => {
      dispatch({
        type: ACTION_TYPES.PATIENTS_FETCH_BY_ID,
        payload: response.data
      });
      onSuccess && onSuccess();
    })
    .catch(error =>
      {
      dispatch({
        type: ACTION_TYPES.PATIENTS_ERROR,
        payload: error
      })
      onError && onError();
    } 
    );
    } 
};


export const create = (data,onSuccess, onError) => dispatch => {
  axios
    .post(`${baseUrl}patients/`, data)
    .then(response => {
      dispatch({
        type: ACTION_TYPES.PATIENTS_CREATE,
        payload: response.data
      });
      onSuccess && onSuccess();
      toast.success("Patient Register Save Successfully!");
    })
    .catch(error => {
      dispatch({
        type: ACTION_TYPES.PATIENTS_ERROR,
        payload: "Something went wrong"
      });
      onError()
      if(error.response.data.apierror.statusCode===400){
        toast.error(error.response.data.apierror.message);
      }else if (error.response.data.apierror.message===null || error.response.data.apierror.message===""){
        //toast.error(error.response.data.apierror.message);
        toast.error("Something went wrong. Please try again...");
      }
    });
};

export const update = (data, id, onSuccess, onError) => dispatch => {

    axios
    .put(`${baseUrl}patients/${id}`, data)
    .then(response => {

      dispatch({
        type: ACTION_TYPES.PATIENTS_UPDATE,
        payload: response.data
      });
      onSuccess()
      toast.success("Patient record was updated successfully!");
    })
    .catch(error => {
      dispatch({
        type: ACTION_TYPES.PATIENTS_ERROR,
        payload:error.response.data
      });
      onError()
      if(error.response.data.apierror.message===null || error.response.data.apierror.message===""){
        toast.error("Something went wrong");
      }else{
        toast.error(error.response.data.apierror.message);
      }

    });


};

export const Delete = (id, onSuccess, onError) => dispatch => {

  axios
  .delete(`${baseUrl}patients/${id}`)
  .then(response => {

    dispatch({
      type: ACTION_TYPES.PATIENT_DELETE,
      payload: id
    });
    if(onSuccess){
        onSuccess();
    }
    toast.success("Patient record was deleted successfully!");
  })
  .catch(error => {
   
      if(onError){
          onError();
      }
    if(error.response.data.apierror.message===null || error.response.data.apierror.message===""){
      toast.error("Something went wrong");
    }else{
      toast.error(error.response.data.apierror.message);
    }
  
  });
};


export const fetchPatientAllergies = (id, onSuccess, onError) => dispatch => {
  axios
    .get(`${baseUrl}patients/${id}/encounters/${CODES.PATIENT_ALLERGY_FORM}/`)
    .then(response => {
      if(onSuccess){
        onSuccess();
      }
      dispatch({
        type: ACTION_TYPES.PATIENT_ALLERGIES,
        payload: response.data
      })
    })
    .catch(error => {
      dispatch({
        type: ACTION_TYPES.PATIENTS_ERROR,
        payload: 'Something went wrong, please try again'
      })
      if(onError){
        onError();
      }
    }
    )
   
}


export const fetchPatientLatestVitalSigns = (id, onSuccess, onError) => dispatch => {
  axios
    .get(`${baseUrl}patients/${id}/encounters/${CODES.VITAL_SIGNS_FORM}?limit=1&sortField=id&sortOrder=desc` )
    .then(response => {
      if(onSuccess){
        onSuccess();
      }

      dispatch({
        type: ACTION_TYPES.PATIENT_LATEST_VITAL_SIGNS,
        payload: response.data.length > 0 ? response.data[0] : {}
      })

    })
    .catch(error => {
      dispatch({
        type: ACTION_TYPES.PATIENTS_ERROR,
        payload: 'Something went wrong, please try again'
      })
      if(onError){
        onError();
      }
    }
    )
}


export const fetchPatientVitalSigns = (id, onSuccess, onError) => dispatch => {
  if(id){
   axios
     .get(`${baseUrl}patients/${id}/encounters/${CODES.VITAL_SIGNS_FORM}`)
     .then(response => {
       dispatch({
         type: ACTION_TYPES.PATIENT_VITAL_SIGNS,
         payload: response.data
       })
       onSuccess && onSuccess() ;
     })
     .catch(error => {
       dispatch({
         type: ACTION_TYPES.PATIENTS_ERROR,
         payload: 'Something went wrong, please try again'
       })
       onError && onError();
      }
     )
     }  
 }

 export const fetchPatientTestOrders = (id, onSuccess, onError) => dispatch => {
  if(id){
   axios
     .get(`${baseUrl}patients/${id}/encounters/${CODES.LAB_TEST_ORDER_FORM}`, {limit: 5, sortField: "id", sortOrder: "desc"})
     .then(response => {
       dispatch({
         type: ACTION_TYPES.PATIENT_LAB_ORDERS,
         payload: response.data
       })
       if(onSuccess){
       onSuccess()
       }
     })
     .catch(error => {
       dispatch({
         type: ACTION_TYPES.PATIENTS_ERROR,
         payload: 'Something went wrong, please try again'
       })
       if(onError){
       onError()
       }
      }
     )
     }  
 }
 export const fetchPatientLatestMedicationOrder = (id, onSuccess, onError) => dispatch => {
  if(id){
   axios
     .get(`${baseUrl}patients/${id}/encounters/${CODES.DRUG_PRESCRIPTION_FORM}`, {limit: 5, sortField: "id", sortOrder: "desc"} )
     .then(response => {
      onSuccess && onSuccess() ;
       dispatch({
         type: ACTION_TYPES.PATIENT_LATEST_MEDICATION_LIST,
         payload: response.data
       })
     })
     .catch(error => {
      onError && onError();
       dispatch({
         type: ACTION_TYPES.PATIENTS_ERROR,
         payload: 'Something went wrong, please try again'
       })
       
      }
     )
     }  
 }

 export const fetchByHospitalNumber = (id, onSuccess, onError) => dispatch => {

    if(id) {
        axios
            .get(`${baseUrl}patients/hospitalNumber?hospitalNumber=${id}`)
            .then(response => {
                dispatch({
                    type: ACTION_TYPES.PATIENTS_FETCH_BY_ID,
                    payload: response.data
                });
                if (onSuccess) {
                    onSuccess();
                }
            })
            .catch(error => {
                    dispatch({
                        type: ACTION_TYPES.PATIENTS_ERROR,
                        payload: "Something went wrong, please try again"
                    })
                    if (onError) {
                        onError();
                    }
                }
            );
    }
};
 
export const fetchPatientEncounterProgramCodeExclusionList = (id, onSuccess, onError) => dispatch => {
  if(id){
    const exclusionList = [CODES.GENERAL_SERVICE];
   axios
     .get(`${baseUrl}patients/${id}/encounters/programCodeExclusionList?programCodeExclusionList=${exclusionList}` )
     .then(response => {
       dispatch({
         type: ACTION_TYPES.PATIENT_EXCLUSIVE_ENCOUNTER_LIST,
         payload: response.data
       })
       onSuccess && onSuccess() ;
     })
     .catch(error => {
       dispatch({
         type: ACTION_TYPES.PATIENTS_ERROR,
         payload: 'Something went wrong, please try again'
       })
       onError && onError() ;
      }
     )
     }  
 }

export const fetchCountries = () => dispatch => {
  axios(`${baseUrl}countries`)
    .then(response => {
      dispatch({
        type: ACTION_TYPES.FETCH_COUNTRIES,
        payload: response.data
      })
    })
    .catch(error => {
      dispatch({
        type: ACTION_TYPES.PATIENTS_ERROR,
        payload: 'Something went wrong, please try again'
    })
  })
 }

 export const fetchPatientEncounterByFormCode = (id, formCode, onSuccess, onError) => dispatch => {
   axios
     .get(`${baseUrl}patients/${id}/encounters/${formCode}`)
     .then(response => {
      dispatch({
        type: ACTION_TYPES.PATIENT_ENCOUNTER_LIST,
        payload: response.data
      })
      if(onSuccess){
      onSuccess()
      }
    })
    .catch(error => {
      dispatch({
        type: ACTION_TYPES.PATIENTS_ERROR,
        payload: 'Something went wrong, please try again'
      })
      if(onError){
      onError()
      }
     }
    )
 }

 
export const fetchCheckedInPatients = (onSuccess, onError) => dispatch => {
  axios
    .get(`${baseUrl}visits/`)
    .then(response => {
      if(onSuccess){
        onSuccess();
      }
      dispatch({
        type: ACTION_TYPES.CHECKEDIN_PATIENT_FETCH_ALL,
        payload: response.data
      });
    })
    .catch(error => {
      if(onError){
        onError();
      }
      dispatch({
        type: ACTION_TYPES.PATIENTS_ERROR,
        payload: "Something went wrong, please try again"
      })
    }
    );
};

export const fetchPatientConsultationHistory = (id, onSuccess, onError) => dispatch => {
  if(id){
   axios
     .get(`${baseUrl}patients/${id}/encounters/${CODES.CONSULTATION_FORM}`)
     .then(response => {
       dispatch({
         type: ACTION_TYPES.PATIENT_CONSULTATION_HISTORY,
         payload: response.data
       })
       onSuccess && onSuccess() ;
     })
     .catch(error => {
       dispatch({
         type: ACTION_TYPES.PATIENTS_ERROR,
         payload: 'Something went wrong, please try again'
       })
       onError && onError();
      }
     )
     }  
 }


export const fetchPatientAppointments = (id, onSuccess, onError) => dispatch => {
    axios
        .get(`${baseUrl}patients/${id}/encounters/${CODES.APPOINTMENT_FORM}/`)
        .then(response => {
            if(onSuccess){
                onSuccess();
            }
            dispatch({
                type: ACTION_TYPES.PATIENT_APPOINTMENTS,
                payload: response.data
            })
        })
        .catch(error => {
                dispatch({
                    type: ACTION_TYPES.PATIENTS_ERROR,
                    payload: 'Something went wrong, please try again'
                })
                if(onError){
                    onError();
                }
            }
        )

}

export const fetchPatientRadiologyTestOrder = (id, onSuccess, onError) => dispatch => {
    if(id){
        axios
            .get(`${baseUrl}patients/${id}/encounters/${CODES.RADIOLOGY_TEST_ORDER}`, {limit: 5, sortField: "id", sortOrder: "desc"})
            .then(response => {
                dispatch({
                    type: ACTION_TYPES.PATIENT_RADIOLOGY_ORDERS,
                    payload: response.data
                })
                if(onSuccess){
                    onSuccess()
                }
            })
            .catch(error => {
                    dispatch({
                        type: ACTION_TYPES.PATIENTS_ERROR,
                        payload: 'Something went wrong, please try again'
                    })
                    if(onError){
                        onError()
                    }
                }
            )
    }
}


