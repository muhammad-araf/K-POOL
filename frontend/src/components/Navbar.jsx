import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Search, User, LogOut, Menu, X, MapPin } from 'lucide-react';
import AuthService from '../services/auth.service';
import Button from './ui/Button';

const Navbar = () => {
    const user = AuthService.getCurrentUser();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        AuthService.logout();
        navigate('/login');
    };

    if (!user) return null;

    const isActive = (path) => location.pathname === path;

    const NavLink = ({ to, icon: Icon, children }) => (
        <Link
            to={to}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${isActive(to)
                ? 'bg-red-50 text-red-600 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
        >
            <Icon className="w-4 h-4" />
            <span>{children}</span>
        </Link>
    );

    return (
        <nav className="sticky top-0 z-50 w-full glass border-b border-white/20">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2 group">
                        <div className="p-2 bg-red-600 rounded-xl text-white shadow-lg shadow-red-500/30 group-hover:scale-105 transition-transform duration-200">
                            <Car className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-400">
                            SHU-Pool
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2 bg-white/50 p-1.5 rounded-2xl border border-white/20 backdrop-blur-sm">
                        <NavLink to="/find-ride" icon={Search}>Find Ride</NavLink>
                        {user.roles && (user.roles.includes('ROLE_DRIVER') || user.roles.includes('driver') || user.roles.includes('DRIVER')) && (
                            <NavLink to="/offer-ride" icon={MapPin}>Offer Ride</NavLink>
                        )}
                        <NavLink to="/profile" icon={User}>Profile</NavLink>
                    </div>

                    {/* User Profile & Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="text-right">
                            <div className="font-semibold text-gray-900 text-sm">{user.fullName}</div>
                            <div className="text-xs text-red-600 font-medium">
                                {user.roles?.[0]?.replace('ROLE_', '')}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl overflow-hidden"
                    >
                        <div className="p-4 space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                                    {user.fullName?.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-medium">{user.fullName}</div>
                                    <div className="text-xs text-gray-500">{user.roles?.[0]?.replace('ROLE_', '')}</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Link to="/find-ride" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700">
                                    <Search className="w-5 h-5" /> Find Ride
                                </Link>
                                {user.roles && (user.roles.includes('ROLE_DRIVER') || user.roles.includes('driver') || user.roles.includes('DRIVER')) && (
                                    <Link to="/offer-ride" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700">
                                        <MapPin className="w-5 h-5" /> Offer Ride
                                    </Link>
                                )}
                                <Link to="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700">
                                    <User className="w-5 h-5" /> Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600"
                                >
                                    <LogOut className="w-5 h-5" /> Logout
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
