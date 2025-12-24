import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Calendar, Clock, MapPin, User, XCircle, ChevronRight, TrendingUp, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthService from '../services/auth.service';
import RideService from '../services/ride.service';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const Dashboard = () => {
    const user = AuthService.getCurrentUser();
    const [bookings, setBookings] = useState([]);
    const [offeredRides, setOfferedRides] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const resBookings = await RideService.getMyBookings();
            setBookings(resBookings.data);

            if (user.roles?.includes('ROLE_DRIVER')) {
                const resOffered = await RideService.getMyOfferedRides();
                setOfferedRides(resOffered.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelBooking = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        try {
            await RideService.cancelBooking(id);
            toast.success("Booking Cancelled");
            loadData();
        } catch (e) { toast.error("Failed to cancel"); }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-7xl mx-auto"
        >
            {/* Welcome Hero */}
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-primary-600 text-white p-8 md:p-12">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-primary-500 blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-primary-800 blur-3xl opacity-50" />

                <div className="relative z-10">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">
                        Hello, {user.fullName.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-primary-100 text-lg md:text-xl max-w-2xl mb-8">
                        Ready for your next journey? Find a ride or offer one to your peers today.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <Link to="/find-ride">
                            <Button variant="secondary" size="lg" className="bg-white text-primary-600 hover:bg-gray-50 shadow-xl shadow-black/10 border-0">
                                Find a Ride
                            </Button>
                        </Link>
                        {user.roles?.includes('ROLE_DRIVER') && (
                            <Link to="/offer-ride">
                                <Button variant="outline" size="lg" className="border-primary-400 text-white hover:bg-primary-500/20">
                                    Offer a Ride
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-dark-900">{bookings.length}</div>
                        <div className="text-xs text-dark-500 font-medium uppercase tracking-wider">Total Bookings</div>
                    </div>
                </Card>
                <Card className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-green-100 text-green-600">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-dark-900">Verified</div>
                        <div className="text-xs text-dark-500 font-medium uppercase tracking-wider">Account Status</div>
                    </div>
                </Card>
                {/* Add more placeholder stats specifically relevant to roles if data allows */}
            </motion.div>

            {/* Active Bookings */}
            <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-dark-900">My Bookings</h2>
                    <Link to="/find-ride" className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                        View all <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
                        ))}
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-dark-200">
                        <div className="w-16 h-16 bg-dark-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">🎫</div>
                        <h3 className="text-lg font-medium text-dark-900">No bookings yet</h3>
                        <p className="text-dark-500 mb-6">You haven't booked any rides yet.</p>
                        <Link to="/find-ride">
                            <Button>Find a Ride</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bookings.map(booking => (
                            <Card key={booking.id} hover className="group border-dark-100">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge variant={booking.status === 'CANCELLED' ? 'danger' : 'success'}>
                                        {booking.status || 'CONFIRMED'}
                                    </Badge>
                                    <span className="text-2xl">🚗</span>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 text-dark-900 font-bold text-lg">
                                            <span>{booking.ride?.origin}</span>
                                            <span className="text-dark-400">→</span>
                                            <span>{booking.ride?.destination}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4 border-t border-dark-50">
                                        <div className="flex items-center gap-2 text-dark-600 text-sm">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(booking.ride?.departureTime).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2 text-dark-600 text-sm">
                                            <Clock className="w-4 h-4" />
                                            {new Date(booking.ride?.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="flex items-center gap-2 text-dark-600 text-sm">
                                            <User className="w-4 h-4" />
                                            {booking.ride?.driver?.fullName}
                                        </div>
                                    </div>

                                    {booking.status !== 'CANCELLED' && (
                                        <div className="flex gap-2 mt-2">
                                            <Link to={`/booking-management/${booking.id}`} className="flex-1">
                                                <Button size="sm" variant="outline" className="w-full">View Ticket</Button>
                                            </Link>
                                        </div>
                                    )}
                                    {booking.status === 'CANCELLED' && (
                                        <Link to={`/booking-management/${booking.id}`} className="block mt-2">
                                            <Button size="sm" variant="ghost" className="w-full">View Details</Button>
                                        </Link>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Driver Section */}
            {user.roles?.includes('ROLE_DRIVER') && (
                <motion.div variants={itemVariants} className="pt-8 border-t border-dark-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-dark-900">My Offered Rides</h2>
                        <Link to="/offer-ride">
                            <Button size="sm">Create New</Button>
                        </Link>
                    </div>

                    {offeredRides.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500 mb-2">You haven't offered any rides yet.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {offeredRides.map(ride => (
                                <Card key={ride.id} className="border-l-4 border-l-primary-500">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant={ride.status === 'COMPLETED' ? 'success' : 'primary'}>{ride.status || 'OPEN'}</Badge>
                                        <span className="font-bold text-lg">Rs. {ride.pricePerSeat}</span>
                                    </div>

                                    <h4 className="font-bold text-lg mb-1">{ride.destination}</h4>
                                    <p className="text-sm text-gray-500 mb-4">From: {ride.origin}</p>

                                    <div className="flex justify-between items-center text-sm text-gray-600 border-t pt-3 mb-4">
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(ride.departureTime).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1"><User size={14} /> {ride.seatsAvailable} seats left</span>
                                    </div>

                                    <Link to={`/ride-management/${ride.id}`}>
                                        <Button size="sm" variant="outline" className="w-full">Manage Ride</Button>
                                    </Link>
                                </Card>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
};

export default Dashboard;
