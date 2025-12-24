import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Search, MapPin, Calendar, Clock, User, Armchair, ChevronRight } from 'lucide-react';
import RideService from '../services/ride.service';
import RideMap from '../components/RideMap'; // Assuming this component exists or will be updated
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';

const FindRide = () => {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState({ origin: '', destination: '' });

    useEffect(() => {
        loadRides();
    }, []);

    const loadRides = async () => {
        try {
            const response = await RideService.getOpenRides();
            setRides(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await RideService.searchRides(search.origin, search.destination);
            setRides(response.data);
        } catch (error) {
            toast.error('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (rideId) => {
        if (!window.confirm("Confirm booking for this ride?")) return;
        try {
            await RideService.bookRide(rideId, 1);
            toast.success('Booking Confirmed!');
            loadRides();
        } catch (error) {
            toast.error(error.response?.data || 'Booking Failed');
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-dark-900 mb-2">Find a Ride</h1>
                <p className="text-dark-500">Search for available rides and book your seat instantly.</p>
            </div>

            {/* Search Bar */}
            <Card className="p-6 md:p-8 bg-white/80 border border-primary-100 shadow-xl shadow-primary-500/5">
                <form onSubmit={handleSearch} className="grid md:grid-cols-7 gap-4 items-end">
                    <div className="md:col-span-3">
                        <Input
                            placeholder="From (Origin)"
                            icon={MapPin}
                            value={search.origin}
                            onChange={(e) => setSearch({ ...search, origin: e.target.value })}
                            containerClassName="w-full"
                        />
                    </div>
                    <div className="md:col-span-3">
                        <Input
                            placeholder="To (Destination)"
                            icon={MapPin}
                            value={search.destination}
                            onChange={(e) => setSearch({ ...search, destination: e.target.value })}
                            containerClassName="w-full"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <Button type="submit" className="w-full h-[46px]" icon={Search}>
                            Search
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Map View */}
            {rides.length > 0 && (
                <div className="rounded-3xl overflow-hidden shadow-lg border border-white/20">
                    <RideMap rides={rides} height="350px" />
                </div>
            )}

            {/* Results */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-dark-900 flex items-center gap-2">
                    Available Rides <Badge variant="primary" className="rounded-full px-2">{rides.length}</Badge>
                </h3>
                
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
                        ))}
                    </div>
                ) : rides.length === 0 ? (
                    <div className="text-center py-16 bg-white/50 rounded-3xl border border-dashed border-dark-200">
                        <div className="w-16 h-16 bg-dark-50 rounded-full flex items-center justify-center mx-auto mb-4 grayscale opacity-50 text-4xl">🚖</div>
                        <h3 className="text-lg font-medium text-dark-900">No rides found</h3>
                        <p className="text-dark-500">Try adjusting your search criteria.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {rides.map((ride, index) => (
                                <motion.div
                                    key={ride.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card hover className="p-0 overflow-hidden border-dark-100">
                                        <div className="flex flex-col md:flex-row">
                                            {/* Ride Details */}
                                            <div className="p-6 flex-grow space-y-4 relative">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Badge className="bg-green-100 text-green-700">Open</Badge>
                                                    <span className="text-xs text-dark-400 font-mono">ID: #{ride.id.substring(0,6)}</span>
                                                </div>

                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-primary-500" />
                                                        <span className="text-lg font-bold text-dark-900">{ride.origin}</span>
                                                    </div>
                                                    <div className="ml-1 border-l-2 border-dashed border-dark-200 h-6" />
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-dark-900" />
                                                        <span className="text-lg font-bold text-dark-900">{ride.destination}</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-dark-50">
                                                    <div className="flex items-center gap-2 text-dark-600">
                                                        <Calendar className="w-4 h-4 text-primary-500" />
                                                        <div className="text-sm">
                                                            <div className="font-medium text-dark-900">Date</div>
                                                            <div>{new Date(ride.departureTime).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-dark-600">
                                                        <Clock className="w-4 h-4 text-primary-500" />
                                                        <div className="text-sm">
                                                            <div className="font-medium text-dark-900">Time</div>
                                                            <div>{new Date(ride.departureTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-dark-600">
                                                        <User className="w-4 h-4 text-primary-500" />
                                                        <div className="text-sm">
                                                            <div className="font-medium text-dark-900">Driver</div>
                                                            <div className="truncate max-w-[100px]">{ride.driver?.fullName.split(' ')[0]}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-dark-600">
                                                        <Armchair className="w-4 h-4 text-primary-500" />
                                                        <div className="text-sm">
                                                            <div className="font-medium text-dark-900">Seats</div>
                                                            <div>{ride.seatsAvailable} left</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Price & Action */}
                                            <div className="bg-dark-50 p-6 md:w-48 flex flex-col justify-center items-center md:border-l border-dark-100 space-y-3">
                                                <div className="text-center">
                                                    <div className="text-xs text-dark-500 uppercase font-bold tracking-wider">Price</div>
                                                    <div className="text-3xl font-bold text-primary-600">Rs. {ride.pricePerSeat}</div>
                                                </div>
                                                <Button 
                                                    className="w-full"
                                                    onClick={() => handleBook(ride.id)}
                                                >
                                                    Book Now
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindRide;
