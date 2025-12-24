import api from './api';

const getProfile = () => {
    return api.get('/users/profile');
};

const updateProfile = (data) => {
    return api.put('/users/profile', data);
};

const getUserById = (id) => {
    return api.get('/users/' + id);
};

const UserService = {
    getProfile,
    updateProfile,
    getUserById
};

export default UserService;
