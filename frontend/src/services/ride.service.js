import api from './api';

const getOpenRides = () => {
    return api.get('rides');
};

const searchRides = (origin, destination) => {
    return api.get(`rides/search?origin=${origin}&destination=${destination}`);
};

const offerRide = (rideData) => {
    return api.post('rides/offer', rideData);
};

const bookRide = (rideId, seats) => {
    return api.post(`bookings/book/${rideId}?seats=${seats}`);
};

const getMyBookings = () => {
    return api.get('bookings/my-bookings');
};

const updateRideStatus = (rideId, status) => {
    return api.put(`rides/${rideId}/status?status=${status}`);
};

const cancelBooking = (bookingId) => {
    return api.post(`bookings/cancel/${bookingId}`);
};

const getRideBookings = (rideId) => {
    return api.get(`bookings/ride/${rideId}`);
};

const getBookingById = (bookingId) => {
    return api.get(`bookings/details/${bookingId}`);
};

const getRide = (rideId) => {
    return api.get(`rides/${rideId}`);
};

const getMyOfferedRides = () => {
    return api.get('rides/my-rides');
};

const RideService = {
    getOpenRides,
    searchRides,
    offerRide,
    getMyOfferedRides,
    bookRide,
    getMyBookings,
    updateRideStatus,
    cancelBooking,
    getRideBookings,
    getRideBookings,
    getBookingById,
    getRide
};

export default RideService;
