import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Button,
    Modal,
    TextField,
    FormControlLabel,
    Typography,
    Grid,
    Alert,
    CircularProgress,
    Checkbox,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { parseBackendDate } from '../../utils/dateUtils';

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

const CategoriesModal = ({
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
        ? backendError.replace(/Object\(App\\Application\\Dto\\CategoryDto\)\./g, '')
        : null;

    const commonFieldProps = readOnly ? { inputProps: { readOnly: true } } : {};

    return (
        <Modal open={open} onClose={onClose} aria-labelledby="category-modal">
            <Box sx={style} component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Typography variant="h6" mb={3}>
                    {mode === 'create' && 'Utwórz nową kategorię'}
                    {mode === 'review' && 'Podgląd kategorii'}
                    {mode === 'edit' && 'Edytuj kategorię'}
                </Typography>

                {/* Lazy loading szczegółu */}
                {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CircularProgress size={24} /> Wczytywanie danych kategorii...
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
                                    label="Nazwa kategorii *"
                                    {...register('name', { required: 'Nazwa kategorii jest wymagana' })}
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                    {...commonFieldProps}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Opis"
                                    multiline
                                    rows={3}
                                    {...register('description')}
                                    helperText={errors.description?.message}
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
                                    control={<Checkbox {...register('isDefault')} />} 
                                    label="Kategoria domyślna" 
                                    disabled={readOnly}
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
                            {mode === 'create' ? 'Utwórz kategorię' : 'Zapisz zmiany'}
                        </Button>
                    )}
                </Box>
            </Box>
        </Modal>
    );
};

export default CategoriesModal;
