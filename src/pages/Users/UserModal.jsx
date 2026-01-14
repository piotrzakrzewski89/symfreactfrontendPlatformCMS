import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Button,
    Modal,
    TextField,
    Checkbox,
    FormControlLabel,
    Typography,
    Grid,
    Alert,
    CircularProgress,
    Select,
    FormControl,
    InputLabel,
    MenuItem
} from '@mui/material';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { parseBackendDate } from '../../utils/dateUtils';
import { getActiveCompanies } from '../../api/user';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
};

const UserModal = ({
    open,
    onClose,
    onCreate,
    onSave,
    mode = 'review',
    initialData = {},
    loading = false
}) => {
    const [backendError, setBackendError] = useState(null);
    const readOnly = mode === 'review';
    const [companies, setCompanies] = useState([]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({ defaultValues: initialData });

    const prevInitialData = useRef();

    useEffect(() => {
        if (JSON.stringify(prevInitialData.current) !== JSON.stringify(initialData)) {
            reset(initialData);
            prevInitialData.current = initialData;
        }
    }, [initialData, reset]);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const data = await getActiveCompanies();
                setCompanies(data);
            } catch (err) {
                console.error('Błąd przy pobieraniu firm:', err);
            }
        };
        fetchCompanies();
    }, []);

    const onSubmit = async (data) => {
        if (readOnly) return;
        try {
            setBackendError(null);
            if (mode === 'create') {
                await onCreate?.(data);
            } else if (mode === 'edit') {
                await onSave?.(data);
            }
            reset({});
            onClose();
        } catch (error) {
            console.error(error);
            if (error?.errors) setBackendError(error.errors);
            else if (typeof error === 'string') setBackendError(error);
            else setBackendError('Nieznany błąd serwera');
        }
    };

    const cleanBackendError = backendError
        ? backendError.replace(/Object\(App\\Application\\Dto\\UserDto\)\./g, '')
        : null;

    const commonFieldProps = readOnly ? { inputProps: { readOnly: true } } : {};

    return (
        <Modal open={open} onClose={onClose} aria-labelledby="user-modal">
            <Box sx={style} component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Typography variant="h6" mb={3}>
                    {mode === 'create' && 'Utwórz nowego pracownika'}
                    {mode === 'review' && 'Podgląd pracownika'}
                    {mode === 'edit' && 'Edytuj pracownika'}
                </Typography>

                {/* Lazy loading szczegółu */}
                {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CircularProgress size={24} /> Wczytywanie danych pracownika...
                    </Box>
                ) : (
                    <>
                        <Grid container spacing={3} direction="column" justifyContent="center">
                            {readOnly && (
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Uuid"
                                        {...register('uuid')}
                                        helperText={errors.uuid?.message}
                                        {...commonFieldProps}
                                    />
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email *"
                                    {...register('email', { required: 'Email jest wymagany' })}
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    {...commonFieldProps}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    {!readOnly && (
                                        <>
                                            <InputLabel id="company-label">Firma *</InputLabel>
                                            <Select
                                                labelId="company-label"
                                                {...register("companyUuid", { required: "Firma jest wymagana" })}
                                                defaultValue={initialData?.companyUuid || ""}
                                            >
                                                <MenuItem value="">-- Wybierz firmę --</MenuItem>
                                                {companies.map((c) => (
                                                    <MenuItem key={c.uuid} value={c.uuid}>
                                                        {c.longName} ({c.uuid})
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </>
                                    )}

                                    {readOnly && (
                                        <TextField
                                            fullWidth
                                            label="Firma *"
                                            value={
                                                (() => {
                                                    const selectedCompany = companies.find(
                                                        (c) => c.uuid === initialData?.companyUuid
                                                    );
                                                    return selectedCompany
                                                        ? `${selectedCompany.longName} (${selectedCompany.uuid})`
                                                        : "—";
                                                })()
                                            }
                                            {...commonFieldProps}
                                        />
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Imię *"
                                    {...register('firstName', { required: 'Imię jest wymagane' })}
                                    error={!!errors.firstName}
                                    helperText={errors.firstName?.message}
                                    {...commonFieldProps}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Nazwisko *"
                                    {...register('lastName', { required: 'Nazwisko jest wymagane' })}
                                    error={!!errors.lastName}
                                    helperText={errors.lastName?.message}
                                    {...commonFieldProps}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Nr kadrowy *"
                                    {...register('employeeNumber', { required: 'Nr kadrowy jest wymagany' })}
                                    error={!!errors.employeeNumber}
                                    helperText={errors.employeeNumber?.message}
                                    {...commonFieldProps}
                                />
                            </Grid>

                            {mode === 'review' && (
                                <>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Data utworzenia"
                                            value={parseBackendDate(initialData?.createdAt ?? null)}
                                            {...commonFieldProps}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Data edycji"
                                            value={parseBackendDate(initialData?.updatedAt ?? null)}
                                            {...commonFieldProps}
                                        />
                                    </Grid>
                                </>
                            )}

                            <Grid item xs={12}>
                                <FormControlLabel 
                                    control={<Checkbox {...register('isActive')} checked={initialData?.isActive || false} />} 
                                    label="Pracownik aktywny" 
                                />
                            </Grid>
                        </Grid>

                        {backendError && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                <ul style={{ margin: 0, paddingLeft: 16 }}>
                                    {(cleanBackendError || '').split('\n').map((l, i) => (
                                        <li key={i}>{l}</li>
                                    ))}
                                </ul>
                            </Alert>
                        )}
                    </>
                )}

                {/* stopka modala */}
                <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                    <Button onClick={onClose}>Anuluj</Button>
                    {!readOnly && !loading && (
                        <Button type="submit" variant="contained" color="primary">
                            {mode === 'create' ? 'Utwórz pracownika' : 'Zapisz zmiany'}
                        </Button>
                    )}
                </Box>
            </Box>
        </Modal>
    );
};

export default UserModal;