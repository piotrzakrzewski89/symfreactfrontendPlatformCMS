import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { loginApi } from '../api/auth';

const LoginForm = () => {
    const { login, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyShortName, setCompanyShortName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const data = await loginApi({ email, password, companyShortName });
            login({ 
                email: data.user_email, 
                company: data.company_uuid, 
                token: data.token,
                roles: data.roles,
                user_uuid: data.user_uuid
            });
            
            // Przekierowanie w zależności od roli
            if (data.roles.includes('ROLE_ADMIN_CMS')) {
                navigate('/'); // Admin -> CMS
            } else {
                navigate('/user'); // Zwykły użytkownik -> frontend
            }
        } catch (err) {
            setError('Nieprawidłowe dane logowania');
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '400px' }}>
            <h2 className="mb-4">Logowanie</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">

                    <label htmlFor="company" className="form-label">Skrócona nazwa firmy</label>
                    <input
                        id="company"
                        type="text"
                        className="form-control"
                        placeholder=""
                        value={companyShortName}
                        onChange={(e) => setCompanyShortName(e.target.value)}
                        required
                    />

                    <label htmlFor="email" className="form-label">Adres e-mail</label>
                    <input
                        id="email"
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Hasło</label>
                    <input
                        id="password"
                        type="password"
                        className="form-control"
                        placeholder="Hasło"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary w-100">Zaloguj</button>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
            </form>
        </div>
    );
};

export default LoginForm;