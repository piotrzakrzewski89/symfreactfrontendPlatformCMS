import { axiosCompany } from './axios.js';

const getAdminToken = () => {
    const admin = JSON.parse(localStorage.getItem('admin'));
    if (!admin || !admin.token) throw new Error('Brak zalogowanego użytkownika');

    const newExpiry = Date.now() + 30 * 60 * 1000; // 30 min
    localStorage.setItem('expiresAt', newExpiry.toString());

    return admin.token.access_token;
};

export const getActiveCompanies = async (sortBy = 'id', sortOrder = 'asc') => {
    try {
        const res = await axiosCompany.get(`/active?sortBy=${sortBy}&sortOrder=${sortOrder}`, {
            headers: { Authorization: `Bearer ${getAdminToken()}` }
        });
        return res.data;
    } catch (err) {
        throw err;
    }
};

export const getDeletedCompanies = async (sortBy = 'id', sortOrder = 'asc') => {
    try {
        const res = await axiosCompany.get(`/deleted?sortBy=${sortBy}&sortOrder=${sortOrder}`, {
            headers: { Authorization: `Bearer ${getAdminToken()}` }
        });
        return res.data;
    } catch (err) {
        throw err;
    }
};

export const createCompany = async (companyData) => {
    try {
        const res = await axiosCompany.post('/new', companyData, {
            headers: { Authorization: `Bearer ${getAdminToken()}` }
        });
        return res.data;
    } catch (err) {
        throw err;
    }
};

export const updateCompany = async (id, companyData) => {
    try {
        const res = await axiosCompany.post(`/edit/${id}`, companyData, {
            headers: { Authorization: `Bearer ${getAdminToken()}` }
        });
        return res.data;
    } catch (err) {
        throw err;
    }
};

// nowa funkcja: usuń firmę
export const deleteCompany = async (id) => {
    try {
        const res = await axiosCompany.post(`/delete/${id}`, {
            headers: { Authorization: `Bearer ${getAdminToken()}` }
        });
        return res.data;
    } catch (err) {
        throw err;
    }
};

// nowa funkcja: włącz/wyłącz aktywność firmy
export const toggleCompanyActive = async (id) => {
    try {
        const res = await axiosCompany.post(`/toggle-active/${id}`, {}, {
            headers: { Authorization: `Bearer ${getAdminToken()}` }
        });
        return res.data;
    } catch (err) {
        throw err;
    }
};

export const reviewCompany = async (id) => {
    try {
        const res = await axiosCompany.get(`/review/${id}`, {
            headers: { Authorization: `Bearer ${getAdminToken()}` }
        });
        return res.data;
    } catch (err) {
        throw err;
    }
}
