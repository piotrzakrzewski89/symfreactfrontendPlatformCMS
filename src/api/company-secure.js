import { axiosCompany } from './axios.js';

const getAdminToken = () => {
    const admin = JSON.parse(localStorage.getItem('admin'));
    if (!admin || !admin.token) throw new Error('Brak zalogowanego użytkownika');

    const newExpiry = Date.now() + 30 * 60 * 1000; // 30 min
    localStorage.setItem('expiresAt', newExpiry.toString());

    return admin.token.access_token;
};

// Security improvements
const validateInput = (data) => {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid input data');
    }
    return data;
};

const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
};

export const getCompanies = async (page = 1, limit = 10, filters = {}) => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...filters
        });

        const response = await axiosCompany.get(`/api/company?${params}`, {
            headers: {
                'Authorization': `Bearer ${getAdminToken()}`
            }
        });
        
        return validateInput(response.data);
    } catch (error) {
        console.error('Error fetching companies:', error);
        throw error;
    }
};

export const createCompany = async (companyData) => {
    try {
        const sanitizedData = validateInput(companyData);
        
        // Sanitize string fields
        if (sanitizedData.email) sanitizedData.email = sanitizeInput(sanitizedData.email);
        if (sanitizedData.name) sanitizedData.name = sanitizeInput(sanitizedData.name);
        if (sanitizedData.shortName) sanitizedData.shortName = sanitizeInput(sanitizedData.shortName);
        
        const response = await axiosCompany.post('/api/company', sanitizedData, {
            headers: {
                'Authorization': `Bearer ${getAdminToken()}`
            }
        });
        
        return validateInput(response.data);
    } catch (error) {
        console.error('Error creating company:', error);
        throw error;
    }
};

export const updateCompany = async (id, companyData) => {
    try {
        const sanitizedData = validateInput(companyData);
        
        // Sanitize string fields
        if (sanitizedData.email) sanitizedData.email = sanitizeInput(sanitizedData.email);
        if (sanitizedData.name) sanitizedData.name = sanitizeInput(sanitizedData.name);
        if (sanitizedData.shortName) sanitizedData.shortName = sanitizeInput(sanitizedData.shortName);
        
        const response = await axiosCompany.put(`/api/company/${id}`, sanitizedData, {
            headers: {
                'Authorization': `Bearer ${getAdminToken()}`
            }
        });
        
        return validateInput(response.data);
    } catch (error) {
        console.error('Error updating company:', error);
        throw error;
    }
};

export const deleteCompany = async (id) => {
    try {
        if (!id || typeof id !== 'string') {
            throw new Error('Invalid company ID');
        }
        
        await axiosCompany.delete(`/api/company/${id}`, {
            headers: {
                'Authorization': `Bearer ${getAdminToken()}`
            }
        });
        
        return { success: true };
    } catch (error) {
        console.error('Error deleting company:', error);
        throw error;
    }
};

export const changeCompanyStatus = async (id, isActive) => {
    try {
        if (!id || typeof id !== 'string') {
            throw new Error('Invalid company ID');
        }
        
        if (typeof isActive !== 'boolean') {
            throw new Error('Invalid status value');
        }
        
        const response = await axiosCompany.patch(`/api/company/${id}/status`, 
            { isActive }, 
            {
                headers: {
                    'Authorization': `Bearer ${getAdminToken()}`
                }
            }
        );
        
        return validateInput(response.data);
    } catch (error) {
        console.error('Error changing company status:', error);
        throw error;
    }
};
