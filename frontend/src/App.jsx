import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages to isolate crashes
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const FindRide = React.lazy(() => import('./pages/FindRide'));
const OfferRide = React.lazy(() => import('./pages/OfferRide'));
const RideManagement = React.lazy(() => import('./pages/RideManagement'));
const MyRides = React.lazy(() => import('./pages/MyRides')); // New Page
const BookingManagement = React.lazy(() => import('./pages/BookingManagement'));

// Layout Component to handle Sidebar presence
const Layout = ({ children }) => {
    const location = useLocation();
    const isAuthPage = ['/login', '/register', '/forgot-password', '/'].includes(location.pathname);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Show Sidebar only on non-auth pages */}
            {!isAuthPage && <Sidebar />}

            {/* Main Content Area */}
            <main className={`flex-1 transition-all duration-300 relative ${!isAuthPage ? 'lg:ml-64' : ''}`}>
                <div className="container mx-auto p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <div className="min-h-screen bg-gray-50 selection:bg-red-100 selection:text-red-900">
                    <Suspense fallback={
                        <div className="min-h-screen flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                        </div>
                    }>
                        <Layout>
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />

                                {/* Protected Routes */}
                                <Route element={<ProtectedRoute />}>
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/profile" element={<Profile />} />
                                    <Route path="/find-ride" element={<FindRide />} />
                                    <Route path="/offer-ride" element={<OfferRide />} />
                                    <Route path="/ride-management/:rideId" element={<ProtectedRoute><RideManagement /></ProtectedRoute>} />
                                    <Route path="/my-rides" element={<ProtectedRoute><MyRides /></ProtectedRoute>} />
                                    <Route path="/booking-management/:id" element={<ProtectedRoute><BookingManagement /></ProtectedRoute>} />
                                </Route>

                                <Route path="/" element={<Navigate to="/login" replace />} />
                            </Routes>
                        </Layout>
                    </Suspense>
                    <ToastContainer />
                </div>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
