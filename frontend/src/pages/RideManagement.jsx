import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RideService from '../services/ride.service';
import { toast } from 'react-toastify';
import { ArrowLeft, User, MapPin, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';

const RideManagement = () => {
    const { rideId } = useParams();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [ride, setRide] = useState(null); // Initially null, will try to fetch or derive
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [rideId]);

    const loadData = async () => {
        try {
            // Fetch bookings
            const resBookings = await RideService.getRideBookings(rideId);
            setBookings(resBookings.data);

            // Fetch Ride Details directly
            const resRide = await RideService.getRide(rideId);
            setRide(resRide.data); // Backend returns the object directly now
        } catch (error) {
            console.error(error);
            toast.error("Failed to load ride details.");
            // navigate('/dashboard'); // Keep on page to see error
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!window.confirm(`Are you sure you want to mark this ride as ${newStatus}?`)) return;
        try {
            await RideService.updateRideStatus(rideId, newStatus);
            toast.success(`Ride marked as ${newStatus}`);
            loadData(); // Refresh to update UI
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!ride) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-700">Ride Not Found</h2>
                <p className="text-gray-500 mb-6">The ride you are looking for does not exist or has been deleted.</p>
                <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Ride</h1>
                    <p className="text-gray-500">Trip to {ride.destination}</p>
                </div>
            </div>

            {/* Ride Status Card */}
            <Card className="bg-white border-l-4 border-l-primary-500">
                <div className="flex justify-between items-start">
                    <div>
                        <Badge variant={ride.status === 'COMPLETED' ? 'success' : ride.status === 'IN_PROGRESS' ? 'warning' : 'primary'}>
                            {ride.status}
                        </Badge>
                        <h2 className="text-xl font-bold mt-2 flex items-center gap-2">
                            {ride.origin} <span className="text-gray-400">→</span> {ride.destination}
                        </h2>
                        <div className="flex items-center gap-4 mt-2 text-gray-600 text-sm">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(ride.departureTime).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="flex items-center gap-1"><User className="w-4 h-4" /> {ride.seatsAvailable} seats left</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        {ride.status === 'OPEN' && (
                            <Button size="sm" onClick={() => handleStatusChange('IN_PROGRESS')}>Start Ride</Button>
                        )}
                        {ride.status === 'IN_PROGRESS' && (
                            <Button size="sm" variant="success" onClick={() => handleStatusChange('COMPLETED')}>Complete Ride</Button>
                        )}
                        {ride.status !== 'COMPLETED' && (
                            <Button size="sm" variant="danger" onClick={() => handleStatusChange('CANCELLED')}>Cancel Ride</Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Passengers List */}
            <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    Passengers <Badge variant="secondary">{bookings.filter(b => b.status === 'CONFIRMED').length}</Badge>
                </h3>

                {bookings.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed text-gray-500">
                        No bookings yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map(booking => (
                            <Card key={booking.id} className="flex justify-between items-center group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        {booking.passenger?.fullName?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{booking.passenger?.fullName}</p>
                                        <p className="text-xs text-gray-500">Booked {booking.seatsBooked} seat(s)</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge variant={booking.status === 'CANCELLED' ? 'danger' : 'success'}>
                                        {booking.status}
                                    </Badge>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RideManagement;
