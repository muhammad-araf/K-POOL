import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/auth.service';
import {
    LayoutDashboard,
    Search,
    PlusCircle,
    User,
    LogOut,
    Menu,
    X,
    Car,
    History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useUser } from '../hooks/useUser';

const Sidebar = () => {
    const { data: user } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false); // Mobile toggle

    const handleLogout = () => {
        AuthService.logout();
        navigate('/login');
    };

    const toggleSidebar = () => setIsOpen(!isOpen);

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/find-ride', label: 'Find a Ride', icon: Search },
        { path: '/offer-ride', label: 'Offer a Ride', icon: PlusCircle, role: 'driver' }, // Only show if role matches? logic below
        { path: '/my-rides', label: 'My Rides', icon: Car, role: 'driver' }, // Driver only
        { path: '/profile', label: 'Profile', icon: User },
    ];

    // Filter menu items based on role (simple check)
    const filteredItems = menuItems.filter(item => {
        if (item.role === 'driver') {
            return user?.roles?.some(r => ['ROLE_DRIVER', 'driver', 'DRIVER'].includes(r));
        }
        return true;
    });

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-md text-gray-700 hover:text-primary-600"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 left-0 h-screen bg-white shadow-2xl z-40
                transition-transform duration-300 ease-in-out
                w-64 lg:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="p-8 border-b border-gray-100 flex items-center justify-center">
                        <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                            <div className="bg-primary-600 p-2 rounded-xl">
                                <Car className="text-white w-6 h-6" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
                                K-POOL
                            </span>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                        {user && (
                            <div className="mb-8 px-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
                                {filteredItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsOpen(false)}
                                            className={`
                                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                                ${active
                                                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }
                                            `}
                                        >
                                            <Icon size={20} className={active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'} />
                                            <span className="font-medium">{item.label}</span>
                                            {active && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600" />}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        {!user && (
                            <div className="px-2 space-y-2">
                                <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50">
                                    <span className="font-medium">Login</span>
                                </Link>
                                <Link to="/register" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-primary-600 bg-primary-50 hover:bg-primary-100">
                                    <span className="font-medium">Register</span>
                                </Link>
                            </div>
                        )}
                    </nav>

                    {/* User Profile / Logout */}
                    {user && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50/80 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-3 p-2 rounded-xl hover:bg-white transition-colors cursor-pointer group">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
                                    {user.fullName?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-primary-700 transition-colors">{user.fullName}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all font-medium text-sm group"
                            >
                                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;
