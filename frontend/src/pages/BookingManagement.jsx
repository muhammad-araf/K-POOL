import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RideService from '../services/ride.service';
import { toast } from 'react-toastify';
import { ArrowLeft, Calendar, Clock, MapPin, User, Phone, CheckCircle, XCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';

const BookingManagement = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const res = await RideService.getBookingById(id);
            setBooking(res.data);
        } catch (error) {
            console.error("Booking Load Error:", error);
            const msg = error.response?.data?.message || error.response?.data || error.message;
            toast.error(`Failed to load booking: ${msg}`);
            // navigate('/dashboard'); // Disable redirect to see the error
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) return;
        try {
            await RideService.cancelBooking(id);
            toast.success("Booking Cancelled Successfully");
            loadData();
        } catch (error) {
            toast.error("Failed to cancel booking");
        }
    };

    if (isLoading) return <div className="p-10 text-center">Loading...</div>;
    if (!booking) return null;

    const { ride, passenger } = booking;

    return (
        <div className="max-w-3xl mx-auto p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
                    <p className="text-gray-500">ID: #{booking.id.slice(-6)}</p>
                </div>
            </div>

            {/* Ticket Card */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
                {/* Status Banner */}
                <div className={`p-4 text-center font-bold text-white uppercase tracking-wider ${booking.status === 'CANCELLED' ? 'bg-red-500' : 'bg-green-500'
                    }`}>
                    {booking.status} TICKET
                </div>

                <div className="p-8 grid md:grid-cols-2 gap-8 items-start relative">
                    {/* Perforated Line Effect for Desktop */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 border-l-2 border-dashed border-gray-200"></div>
                    <div className="hidden md:block absolute left-1/2 top-[-10px] -ml-[10px] w-5 h-5 bg-gray-50 rounded-full"></div>
                    <div className="hidden md:block absolute left-1/2 bottom-[-10px] -ml-[10px] w-5 h-5 bg-gray-50 rounded-full"></div>

                    {/* Left Side: Ride Info */}
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm text-gray-400 font-bold uppercase mb-1">Route</p>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 w-3 h-3 bg-green-500 rounded-full ring-4 ring-green-100"></div>
                                    <div>
                                        <p className="font-bold text-lg leading-tight">{ride.origin}</p>
                                    </div>
                                </div>
                                <div className="ml-1.5 border-l-2 border-gray-100 h-6"></div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 w-3 h-3 bg-red-500 rounded-sm ring-4 ring-red-100"></div>
                                    <div>
                                        <p className="font-bold text-lg leading-tight">{ride.destination}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-400 font-bold uppercase mb-1">Date</p>
                                <div className="flex items-center gap-2 font-medium">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    {new Date(ride.departureTime).toLocaleDateString()}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-bold uppercase mb-1">Time</p>
                                <div className="flex items-center gap-2 font-medium">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    {new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-400 font-bold uppercase mb-1">Vehicle</p>
                            <p className="font-medium text-gray-900">{ride.driver?.vehicleModel} <span className="text-gray-400">•</span> {ride.driver?.vehicleNumber}</p>
                        </div>
                    </div>

                    {/* Right Side: Passenger & Driver Info */}
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm text-gray-400 font-bold uppercase mb-1">Passenger</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                    {passenger.fullName.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold">{passenger.fullName}</p>
                                    <p className="text-sm text-gray-500">{booking.seatsBooked} Seat(s)</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl">
                            <p className="text-sm text-gray-400 font-bold uppercase mb-2">Driver</p>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                                    {ride.driver?.fullName.charAt(0)}
                                </div>
                                <span className="font-medium">{ride.driver?.fullName}</span>
                            </div>
                            {/* In real app, add Call/Chat buttons here */}
                        </div>

                        {booking.status !== 'CANCELLED' && ride.status === 'OPEN' && (
                            <Button
                                variant="outline"
                                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                onClick={handleCancel}
                            >
                                Cancel Booking
                            </Button>
                        )}
                        {booking.status === 'CANCELLED' && (
                            <div className="text-center text-red-500 font-bold p-2 bg-red-50 rounded-lg">
                                Booking Cancelled
                            </div>
                        )}
                        {ride.status === 'COMPLETED' && booking.status !== 'CANCELLED' && (
                            <div className="text-center text-green-600 font-bold p-2 bg-green-50 rounded-lg">
                                Ride Completed
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingManagement;
