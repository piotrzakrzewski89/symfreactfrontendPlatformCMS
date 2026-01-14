import { axiosUser, axiosCompany } from './axios.js';

const getAdminToken = () => {
    const admin = JSON.parse(localStorage.getItem('admin'));
    if (!admin || !admin.token) throw new Error('Brak zalogowanego użytkownika');

    const newExpiry = Date.now() + 30 * 60 * 1000; // 30 min
    localStorage.setItem('expiresAt', newExpiry.toString());

    return admin.token.access_token;
};

export const getActiveCompanies = async () => {
    try {
        const res = await axiosCompany.get('/company-list-form', {
            headers: { Authorization: `Bearer ${getAdminToken()}` }
        });
        return res.data;
    } catch (err) {
        throw err;
    }
};

export const createUser = async (user) => {
    try {
        const res = await axiosUser.post('/new', user, {
            headers: { Authorization: `Bearer ${getAdminToken()}` }
        });
        return res.data;
    } catch (err) {
        throw err;
    }
}

export const updateUser = async (id, userData) => {
    try {
        const res = await axiosUser.post(`/edit/${id}`, userData, {
            headers: { Authorization: `Bearer ${getAdminToken()}` }
        });
        return res.data;
    } catch (err) {
        throw err;
    }
};

export const getActiveUsers = async () => {
    try {
        const res = await axiosUser.get('/active', {
            headers: { Authorization: `Bearer ${getAdminToken()}` }
        });
        return res.data;
    } catch (err) {
        throw err;
    }
};

export const getDeletedUsers = async () => {
    try {
        const res = await axiosUser.get('/deleted', {
            headers: { Authorization: `Bearer ${getAdminToken()}` }
        });
        return res.data;
    } catch (err) {
        throw err;
    }
}

export const reviewUser = async (id) => {
    try {
        const res = await axiosUser.get(`/review/${id}`, {
            headers: { Authorization: `Bearer ${getAdminToken()}` }
        });
        return res.data;
    } catch (err) {
        throw err;
    }
};

export const deleteUser = async (id) => {
    try {
        const res = await axiosUser.post(`/delete/${id}`, {}, {
            headers: { Authorization: `Bearer ${getAdminToken()}` }
        });
        return res.data;
    } catch (err) {
        throw err;
    }
}
export const toggleUserActive = async (id) => {
    try {
        const res = await axiosUser.post(`/toggle-active/${id}`, {}, {
            headers: { Authorization: `Bearer ${getAdminToken()}` }
        });
        return res.data;
    } catch (err) {
        throw err;
    }
}
