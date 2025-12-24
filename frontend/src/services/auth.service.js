import api from './api';

const register = (data) => {
    return api.post('/auth/signup', data);
};

const login = (email, password) => {
    return api.post('/auth/signin', {
        email,
        password,
    })
        .then((response) => {
            if (response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return response.data;
        });
};

const logout = () => {
    localStorage.removeItem('user');
    window.location.reload();
};

const getCurrentUser = () => {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        return JSON.parse(userStr);
    } catch (error) {
        return null;
    }
};

const AuthService = {
    register,
    login,
    logout,
    getCurrentUser,
};

export default AuthService;
