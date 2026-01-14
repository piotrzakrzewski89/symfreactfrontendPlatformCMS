import { axiosUser, axiosCompany } from './axios.js';

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

export const getUsers = async (page = 1, limit = 10, filters = {}) => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...filters
        });

        const response = await axiosUser.get(`/api/user?${params}`, {
            headers: {
                'Authorization': `Bearer ${getAdminToken()}`
            }
        });
        
        return validateInput(response.data);
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const createUser = async (userData) => {
    try {
        const sanitizedData = validateInput(userData);
        
        // Sanitize string fields
        if (sanitizedData.email) sanitizedData.email = sanitizeInput(sanitizedData.email);
        if (sanitizedData.firstName) sanitizedData.firstName = sanitizeInput(sanitizedData.firstName);
        if (sanitizedData.lastName) sanitizedData.lastName = sanitizeInput(sanitizedData.lastName);
        
        const response = await axiosUser.post('/api/user', sanitizedData, {
            headers: {
                'Authorization': `Bearer ${getAdminToken()}`
            }
        });
        
        return validateInput(response.data);
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export const updateUser = async (id, userData) => {
    try {
        const sanitizedData = validateInput(userData);
        
        // Sanitize string fields
        if (sanitizedData.email) sanitizedData.email = sanitizeInput(sanitizedData.email);
        if (sanitizedData.firstName) sanitizedData.firstName = sanitizeInput(sanitizedData.firstName);
        if (sanitizedData.lastName) sanitizedData.lastName = sanitizeInput(sanitizedData.lastName);
        
        const response = await axiosUser.put(`/api/user/${id}`, sanitizedData, {
            headers: {
                'Authorization': `Bearer ${getAdminToken()}`
            }
        });
        
        return validateInput(response.data);
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

export const deleteUser = async (id) => {
    try {
        if (!id || typeof id !== 'string') {
            throw new Error('Invalid user ID');
        }
        
        await axiosUser.delete(`/api/user/${id}`, {
            headers: {
                'Authorization': `Bearer ${getAdminToken()}`
            }
        });
        
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

export const changeUserStatus = async (id, isActive) => {
    try {
        if (!id || typeof id !== 'string') {
            throw new Error('Invalid user ID');
        }
        
        if (typeof isActive !== 'boolean') {
            throw new Error('Invalid status value');
        }
        
        const response = await axiosUser.patch(`/api/user/${id}/status`, 
            { isActive }, 
            {
                headers: {
                    'Authorization': `Bearer ${getAdminToken()}`
                }
            }
        );
        
        return validateInput(response.data);
    } catch (error) {
        console.error('Error changing user status:', error);
        throw error;
    }
};
