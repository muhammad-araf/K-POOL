import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RideService from '../services/ride.service';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Calendar, User, MapPin, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const MyRides = () => {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRides();
    }, []);

    const loadRides = async () => {
        try {
            const res = await RideService.getMyOfferedRides();
            setRides(res.data);
        } catch (error) {
            console.error("Failed to load rides", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Offered Rides</h1>
                    <p className="text-gray-500">Manage your active and completed rides.</p>
                </div>
                <Link to="/offer-ride">
                    <Button icon={Plus}>Offer New Ride</Button>
                </Link>
            </div>

            {rides.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="text-gray-400 w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Rides Offered Yet</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Start your journey as a driver! Offer a ride to help others commute and save on travel costs.
                    </p>
                    <Link to="/offer-ride">
                        <Button variant="outline">Create Your First Ride</Button>
                    </Link>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {rides.map(ride => (
                        <motion.div key={ride.id} variants={itemVariants}>
                            <Card className="h-full flex flex-col hover:shadow-lg transition-shadow border-l-4 border-l-primary-500">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge variant={ride.status === 'COMPLETED' ? 'success' : ride.status === 'FULL' ? 'warning' : 'primary'}>
                                        {ride.status || 'OPEN'}
                                    </Badge>
                                    <span className="font-bold text-xl text-primary-600">Rs. {ride.pricePerSeat}</span>
                                </div>

                                <div className="space-y-4 mb-6 flex-1">
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-1">Route</p>
                                        <div className="font-medium text-gray-900 line-clamp-1">{ride.origin}</div>
                                        <div className="text-gray-400 text-xs my-1">↓</div>
                                        <div className="font-bold text-lg text-gray-900 line-clamp-1">{ride.destination}</div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-sm text-gray-500 border-t border-gray-100 pt-4 mb-4">
                                    <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                                        <Calendar size={14} className="text-primary-500" />
                                        {new Date(ride.departureTime).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                                        <User size={14} className="text-primary-500" />
                                        {ride.seatsAvailable} seats left
                                    </span>
                                </div>

                                <Link to={`/ride-management/${ride.id}`} className="mt-auto">
                                    <Button variant="outline" className="w-full">Manage Ride</Button>
                                </Link>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default MyRides;
