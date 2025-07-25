import React, {useState} from "react";
import {Button, Card, CardContent, FormControl, Grid, Paper, TextField, Typography} from "@mui/material";
import {Controller, useForm} from "react-hook-form";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {DatePicker} from "@mui/x-date-pickers";
import axios from "axios";
import Swal from "sweetalert2";
import {token, url as baseUrl} from "../../../api";


const AddPatientVitals = () => {
    const { handleSubmit, control } = useForm();
    const onSubmit = async (data) => {
       
        try {
            const InData = {
                "bodyWeight": data.Weight,
                "diastolic": data.Diastolic,
                "encounterDate": data.DateOfVitalSigns,
                "height": data.Height,
                "personId": 1,
                "systolic": data.Systolic
            }
            await axios.post(`${baseUrl}patient/vital-sign`, InData, { headers: {"Authorization" : `Bearer ${token}`} });
            await Swal.fire({
                icon: 'success',
                text: 'Add Patient Vital successfully',
                timer: 1500
            });
        } catch (e) {
            await Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'An error occurred while saving patient vitals!',
            });
        }
    };
    const onError = () => {

    };

    return (
        <Card>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit, onError)}>
                    <Paper
                        style={{
                            display: "grid",
                            gridRowGap: "20px",
                            padding: "20px",
                            margin: "10px 10px",
                        }}>
                        <Typography variant="h6">Take Patient Vitals</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <Controller
                                            name="DateOfVitalSigns"
                                            control={control}
                                            defaultValue={null}
                                            render={({ field: { onChange, value }, fieldState: { error}}) => (
                                                <DatePicker
                                                    renderInput={(props) => <TextField {...props} />}
                                                    label="Date Of Vital Signs"
                                                    selected={value}
                                                    value={value}
                                                    onChange={onChange}
                                                    error={!!error}
                                                    helperText={error ? error.message : null}
                                                />
                                            )}
                                        />
                                    </LocalizationProvider>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <Controller
                                        name="Pulse"
                                        control={control}
                                        defaultValue=""
                                        render={({ field: { onChange, value }, fieldState: { error }}) => (
                                            <TextField
                                                label="Pulse(bpm)"
                                                id="Pulse"
                                                variant="outlined"
                                                value={value}
                                                onChange={onChange}
                                                error={!!error}
                                                helperText={error ? error.message : null}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <Controller
                                        name="RespiratoryRate"
                                        control={control}
                                        defaultValue=""
                                        render={({ field: { onChange, value }, fieldState: { error }}) => (
                                            <TextField
                                                label="Respiratory Rate (bpm)"
                                                id="RespiratoryRate"
                                                variant="outlined"
                                                value={value}
                                                onChange={onChange}
                                                error={!!error}
                                                helperText={error ? error.message : null}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <Controller
                                        name="Temperature"
                                        control={control}
                                        defaultValue=""
                                        render={({ field: { onChange, value }, fieldState: { error }}) => (
                                            <TextField
                                                label="Temperature (C)"
                                                id="Temperature"
                                                variant="outlined"
                                                value={value}
                                                onChange={onChange}
                                                error={!!error}
                                                helperText={error ? error.message : null}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <FormControl fullWidth>
                                            <Controller
                                                name="Systolic"
                                                control={control}
                                                defaultValue=""
                                                render={({ field: { onChange, value }, fieldState: { error }}) => (
                                                    <TextField
                                                        label="Systolic (mmHg)"
                                                        id="Systolic"
                                                        variant="outlined"
                                                        value={value}
                                                        onChange={onChange}
                                                        error={!!error}
                                                        helperText={error ? error.message : null}
                                                    />
                                                )}
                                            />
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <FormControl fullWidth>
                                            <Controller
                                                name="Diastolic"
                                                control={control}
                                                defaultValue=""
                                                render={({ field: { onChange, value }, fieldState: { error }}) => (
                                                    <TextField
                                                        label="Diastolic (mmHg)"
                                                        id="Diastolic"
                                                        variant="outlined"
                                                        value={value}
                                                        onChange={onChange}
                                                        error={!!error}
                                                        helperText={error ? error.message : null}
                                                    />
                                                )}
                                            />
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <Controller
                                        name="Weight"
                                        control={control}
                                        defaultValue=""
                                        render={({ field: { onChange, value }, fieldState: { error }}) => (
                                            <TextField
                                                label="Weight (Kg)"
                                                id="Weight"
                                                variant="outlined"
                                                value={value}
                                                onChange={onChange}
                                                error={!!error}
                                                helperText={error ? error.message : null}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </Grid>

                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <Controller
                                        name="Height"
                                        control={control}
                                        defaultValue=""
                                        render={({ field: { onChange, value }, fieldState: { error }}) => (
                                            <TextField
                                                label="Height (cm)"
                                                id="Height"
                                                variant="outlined"
                                                value={value}
                                                onChange={onChange}
                                                error={!!error}
                                                helperText={error ? error.message : null}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Button type={"button"} variant="contained" color={"error"}>Cancel</Button>
                                &nbsp;&nbsp;
                                <Button type={"submit"} variant="contained" color={"primary"}>Submit</Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </form>
            </CardContent>
        </Card>
    );
};

export default AddPatientVitals;
