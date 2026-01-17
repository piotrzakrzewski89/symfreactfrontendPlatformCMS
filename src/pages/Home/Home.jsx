// src/pages/Home/Home.jsx
import React from "react";
import { useAuth } from '../../auth/useAuth';
import { Box } from '@mui/material';
import BookList from '../../components/BookList';

const Home = () => {
    const { admin } = useAuth();

    return (
        <Box sx={{ p: 5, textAlign: 'center' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <h2>Strona Główna</h2>
            </Box>
            <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <p>Witaj <strong>{admin?.email}</strong></p>
                <p>Twoje role: {admin?.roles?.join(', ')}</p>
            </Box>
        </Box>
    )
};
export default Home;