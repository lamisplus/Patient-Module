import React, {useEffect, useState} from 'react';
import {Tab} from "semantic-ui-react";
import PatientList from "../Home/PatientList";
import {ToastContainer} from "react-toastify";
import {makeStyles} from "@material-ui/core/styles";
import DuplicateHospitalNumbers from "./DuplicateHospitalNumbers";
import axios from "axios";
import {token, url as baseUrl} from "../../../../api";
import {Link} from "react-router-dom";
import Button from "@material-ui/core/Button";
import {FaUserPlus} from "react-icons/fa";

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
    const [permissions, setPermissions] = useState([]);
    useEffect(() => {
        userPermission();
    }, []);
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
    const panes = [
        { menuItem: 'Duplicate Hospital Numbers', render: () =>
                <Tab.Pane>
                    <DuplicateHospitalNumbers permissions={permissions}/>
                </Tab.Pane>
        }
    ];
    return (
        <div className={classes.root}>
            <ToastContainer autoClose={3000} hideProgressBar />
            {permissions.includes('view_patient') || permissions.includes("all_permission") ? (
                <Tab panes={panes} />
            ):""
            }

        </div>
    );
}

export default Index;