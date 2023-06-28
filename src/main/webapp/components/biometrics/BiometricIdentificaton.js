import React, { useState}   from 'react';
import {
 Spinner
} from 'reactstrap';
import MatButton from '@material-ui/core/Button';
import {Modal, Button} from 'react-bootstrap';
import axios from "axios";
//import EditIcon from "@material-ui/icons/EditIcon";
import {makeStyles} from "@material-ui/core/styles";
import {toast} from "react-toastify";
import SaveIcon from "@material-ui/icons/Save";
import CancelIcon from "@material-ui/icons/Cancel";
import { token as token, url as baseUrl } from "./../../../api";

const useStyles = makeStyles(theme => ({
    button: {
        margin: theme.spacing(1)
    },
    error: {
        color: "#f85032",
        fontSize: "12.8px",
    },
}))

const BiometricIdentificaton= (props) => {
    const classes = useStyles()
    const [loading, setLoading] = useState(false)
    const datasample = props.datasample ? props.datasample : {};
    const [errors, setErrors] = useState({});
    const [details, setDetails] =  useState({ active: "", name:"", url:"", })

    //Function to cancel the process
    const closeModal = ()=>{
        //resetForm()
        props.togglestatus()
    }

    return (
        <div >

            <Modal show={props.modalstatus} toggle={props.togglestatus} className={props.className} size="md">
                <Modal.Header toggle={props.togglestatus}>
                    <Modal.Title>Client identification with biometric</Modal.Title>
                    <Button
                        variant=""
                        className="btn-close"
                        onClick={props.togglestatus}
                    ></Button>
                </Modal.Header>
                <Modal.Body>
                    <p>Please click the identify button and then place your finger on the scanner</p>
                    <div>
                        <MatButton
                            type="button"
                            variant="contained"
                            color="primary"
                            className=" float-right mr-1"
                            // onClick={biometricIdentification}
                        >
                            <span style={{ textTransform: "capitalize", fontWeight:'bolder' }}>Identify</span>
                        </MatButton>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}


export default AddBiometricDevice;
