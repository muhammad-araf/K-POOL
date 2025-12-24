import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RideService from '../services/ride.service';
import AuthService from '../services/auth.service';
import GeocodeService from '../services/geocode.service';
import { calculateDistance } from '../utils/distance';
import { toast } from 'react-toastify';
import { Navigation, MapPin, ArrowLeft } from 'lucide-react';
import LocationPicker from '../components/LocationPicker';
import { AnimatePresence, motion } from 'framer-motion';

const OfferRide = () => {
    const user = AuthService.getCurrentUser();
    const navigate = useNavigate();

    // Access Control
    if (!user || !user.roles || !(user.roles.includes('ROLE_DRIVER') || user.roles.includes('driver') || user.roles.includes('DRIVER'))) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="p-8 text-center bg-red-50 border border-red-200 rounded-lg text-red-600">
                    <h3 className="text-lg font-bold">Access Denied</h3>
                    <p>Only Drivers can offer rides.</p>
                </div>
            </div>
        );
    }

    const [formData, setFormData] = useState({
        origin: '',
        destination: '',
        departureTime: new Date().toISOString().slice(0, 16), // Default to now
        seatsOffered: 3,
        pricePerSeat: 0,
        startLat: 0,
        startLng: 0,
        endLat: 0,
        endLng: 0
    });

    // UX State
    const [activeField, setActiveField] = useState(null); // 'origin' | 'destination' | null
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [showMapFor, setShowMapFor] = useState(null); // Explicit toggle for map

    const toggleMap = (field) => {
        if (showMapFor === field) {
            setShowMapFor(null);
        } else {
            setShowMapFor(field);
            setActiveField(field); // Also set active field context
        }
    };

    // Autocomplete State
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const [fareDetails, setFareDetails] = useState({
        distance: 0,
        mileage: 12,
        fuelPrice: 280,
        totalFuelCost: 0,
        suggestedFare: 0
    });

    // Auto-detect location
    useEffect(() => {
        handleCurrentLocation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const calculateFare = () => {
        if (formData.startLat && formData.endLat) {
            const dist = calculateDistance(formData.startLat, formData.startLng, formData.endLat, formData.endLng);
            const fuelNeeded = dist / fareDetails.mileage;
            const totalCost = fuelNeeded * fareDetails.fuelPrice;
            const totalPeople = 1 + parseInt(formData.seatsOffered || 3);
            const costPerPerson = totalCost / totalPeople;

            setFareDetails(prev => ({
                ...prev,
                distance: dist.toFixed(2),
                totalFuelCost: totalCost.toFixed(0),
                suggestedFare: Math.ceil(costPerPerson),
                minFare: Math.ceil(costPerPerson * 0.85), // Allow ~15% discount
                maxFare: Math.ceil(costPerPerson * 1.3) // Max leverage is 30%
            }));

            // Auto-set to suggested if 0 or invalid
            if (formData.pricePerSeat === 0) {
                setFormData(prev => ({ ...prev, pricePerSeat: Math.ceil(costPerPerson) }));
            }
        }
    };

    useEffect(() => { calculateFare(); }, [formData.startLat, formData.startLng, formData.endLat, formData.endLng, formData.seatsOffered, fareDetails.mileage, fareDetails.fuelPrice]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Search logic moved to debounced useEffect
    };

    // Debounced Search Effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            const query = activeField === 'origin' ? formData.origin : (activeField === 'destination' ? formData.destination : '');

            if (activeField && query && query.length > 2) {
                setIsSearching(true);
                const results = await GeocodeService.searchSuggestions(query);
                setSuggestions(results);
                setIsSearching(false);
            } else {
                setSuggestions([]);
            }
        }, 800); // 800ms delay

        return () => clearTimeout(timer);
    }, [formData.origin, formData.destination, activeField]);

    const handleSuggestionClick = (suggestion) => {
        // 1. Update form data with selected place
        const lat = parseFloat(suggestion.lat);
        const lon = parseFloat(suggestion.lon);

        if (activeField === 'origin') {
            setFormData(prev => ({
                ...prev,
                origin: suggestion.display_name,
                startLat: lat,
                startLng: lon
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                destination: suggestion.display_name,
                endLat: lat,
                endLng: lon
            }));
        }

        // 2. Clear suggestions
        setSuggestions([]);
    };

    const handleLocationSelect = async (type, latlng) => {
        setIsGeocoding(true);
        if (type === 'origin') {
            setFormData(prev => ({ ...prev, startLat: latlng.lat, startLng: latlng.lng }));
        } else {
            setFormData(prev => ({ ...prev, endLat: latlng.lat, endLng: latlng.lng }));
        }
        // Debounce effect will handle reverse geocode
    };

    // Reverse Geocode Effects - Keep updating when user drags marker
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (formData.startLat && activeField === 'origin' && !suggestions.length) {
                setIsGeocoding(true);
                const address = await GeocodeService.reverseGeocode(formData.startLat, formData.startLng);
                if (address) setFormData(prev => ({ ...prev, origin: address.display_name }));
                setIsGeocoding(false);
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [formData.startLat, formData.startLng]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (formData.endLat && activeField === 'destination' && !suggestions.length) {
                setIsGeocoding(true);
                const address = await GeocodeService.reverseGeocode(formData.endLat, formData.endLng);
                if (address) setFormData(prev => ({ ...prev, destination: address.display_name }));
                setIsGeocoding(false);
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [formData.endLat, formData.endLng]);


    const handleCurrentLocation = () => {
        setIsLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                setFormData(prev => ({ ...prev, startLat: latitude, startLng: longitude }));
                const address = await GeocodeService.reverseGeocode(latitude, longitude);
                if (address) {
                    setFormData(prev => ({ ...prev, origin: address.display_name }));
                }
                setIsLoadingLocation(false);
            }, (error) => {
                console.error(error);
                setIsLoadingLocation(false);
            });
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.pricePerSeat <= 0) {
            toast.error('Please set a valid fare.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Ensure date format is clean
            const payload = {
                ...formData,
                departureTime: formData.departureTime // Should be ISO string already
            };
            await RideService.offerRide(payload);
            toast.success('Ride Offered Successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Offer Ride Error:', error);
            const errorMsg = error.response?.data?.message || error.response?.data || error.message || 'Unknown error';
            toast.error('Failed to offer ride: ' + errorMsg);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* ... (keep header as is, already replaced in previous step) */}
            {/* Modern App Header */}
            <div className="bg-white/80 backdrop-blur-md px-4 py-4 sticky top-0 z-40 flex items-center justify-between border-b border-gray-100/50">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Offer a Ride</h1>
                <div className="w-10"></div>
            </div>

            <div className="max-w-xl mx-auto pt-6 px-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Route Connector Inputs - Indrive Style */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-visible relative z-30">
                        {/* Connecting Line */}
                        <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gray-200 z-0"></div>

                        {/* Origin Input */}
                        <div className={`relative z-10 p-4 transition-colors ${activeField === 'origin' ? 'bg-green-50/30' : ''}`}>
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full ring-4 ring-green-100"></div>
                                </div>
                                <div className="flex-1 relative">
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Pickup</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            name="origin"
                                            value={formData.origin}
                                            onChange={handleChange}
                                            onFocus={() => { setActiveField('origin'); setShowMapFor(null); setSuggestions([]); }}
                                            placeholder="Where from?"
                                            className="w-full text-lg font-medium text-gray-900 placeholder:text-gray-400 bg-transparent outline-none truncate"
                                            autoComplete="off"
                                        />
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => toggleMap('origin')}
                                                className={`p-2 rounded-full transition-colors ${showMapFor === 'origin' ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-100'}`}
                                                title="Choose on Map"
                                            >
                                                <MapPin className="w-5 h-5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCurrentLocation}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                title="Use Current Location"
                                            >
                                                <Navigation className={`w-5 h-5 ${isLoadingLocation ? 'animate-spin' : ''}`} fill={isLoadingLocation ? "currentColor" : "none"} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Suggestions Dropdown */}
                                    {activeField === 'origin' && suggestions.length > 0 && !showMapFor && (
                                        <ul className="bg-white/95 backdrop-blur-sm shadow-sm rounded-xl mt-3 overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-top-2">
                                            {suggestions.map((place, idx) => (
                                                <li
                                                    key={idx}
                                                    onClick={() => handleSuggestionClick(place)}
                                                    className="p-4 hover:bg-gray-50 cursor-pointer border-b last:border-0 border-gray-100 flex items-start gap-4 transition-colors"
                                                >
                                                    <div className="bg-gray-100 p-2 rounded-full">
                                                        <MapPin className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700 leading-snug mt-1">{place.display_name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* Embedded Map for Origin */}
                            <AnimatePresence>
                                {showMapFor === 'origin' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mt-8 mb-4 overflow-hidden rounded-2xl border-4 border-white shadow-2xl"
                                    >
                                        <LocationPicker
                                            initialPosition={formData.startLat ? { lat: formData.startLat, lng: formData.startLng } : null}
                                            selectedAddress={formData.origin}
                                            isLocating={isGeocoding}
                                            onLocationChange={(latlng) => handleLocationSelect('origin', latlng)}
                                            onConfirm={() => setShowMapFor(null)}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="h-[1px] bg-gray-100 mx-14"></div>

                        {/* Destination Input */}
                        <div className={`relative z-10 p-4 transition-colors ${activeField === 'destination' ? 'bg-red-50/30' : ''}`}>
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                    <div className="w-3 h-3 bg-red-500 rounded-sm ring-4 ring-red-100"></div>
                                </div>
                                <div className="flex-1 relative">
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Destination</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            name="destination"
                                            value={formData.destination}
                                            onChange={handleChange}
                                            onFocus={() => { setActiveField('destination'); setShowMapFor(null); setSuggestions([]); }}
                                            placeholder="Where to?"
                                            className="w-full text-lg font-medium text-gray-900 placeholder:text-gray-400 bg-transparent outline-none truncate"
                                            autoComplete="off"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleMap('destination')}
                                            className={`p-2 rounded-full transition-colors ${showMapFor === 'destination' ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-100'}`}
                                            title="Choose on Map"
                                        >
                                            <MapPin className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Suggestions Dropdown */}
                                    {activeField === 'destination' && suggestions.length > 0 && !showMapFor && (
                                        <ul className="bg-white/95 backdrop-blur-sm shadow-sm rounded-xl mt-3 overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-top-2">
                                            {suggestions.map((place, idx) => (
                                                <li
                                                    key={idx}
                                                    onClick={() => handleSuggestionClick(place)}
                                                    className="p-4 hover:bg-gray-50 cursor-pointer border-b last:border-0 border-gray-100 flex items-start gap-4 transition-colors"
                                                >
                                                    <div className="bg-gray-100 p-2 rounded-full">
                                                        <MapPin className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700 leading-snug mt-1">{place.display_name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* Embedded Map for Destination */}
                            <AnimatePresence>
                                {showMapFor === 'destination' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mt-8 mb-4 overflow-hidden rounded-2xl border-4 border-white shadow-2xl"
                                    >
                                        <LocationPicker
                                            initialPosition={
                                                formData.endLat
                                                    ? { lat: formData.endLat, lng: formData.endLng }
                                                    : (formData.startLat ? { lat: formData.startLat, lng: formData.startLng } : null)
                                            }
                                            selectedAddress={formData.destination}
                                            isLocating={isGeocoding}
                                            onLocationChange={(latlng) => handleLocationSelect('destination', latlng)}
                                            onConfirm={() => setShowMapFor(null)}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Trip Details Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg text-gray-800">Trip Details</h3>
                            {fareDetails.distance > 0 && <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-full">{fareDetails.distance} km</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">When?</label>
                                <div className="space-y-3">
                                    {/* Date Selection tabs */}
                                    <div className="flex bg-gray-50 p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const today = new Date().toISOString().split('T')[0];
                                                const currentTime = formData.departureTime ? formData.departureTime.split('T')[1] : '12:00';
                                                setFormData({ ...formData, departureTime: `${today}T${currentTime}` });
                                            }}
                                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${formData.departureTime?.startsWith(new Date().toISOString().split('T')[0])
                                                ? 'bg-white text-black shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            Today
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const tomorrow = new Date();
                                                tomorrow.setDate(tomorrow.getDate() + 1);
                                                const dateStr = tomorrow.toISOString().split('T')[0];
                                                const currentTime = formData.departureTime ? formData.departureTime.split('T')[1] : '12:00';
                                                setFormData({ ...formData, departureTime: `${dateStr}T${currentTime}` });
                                            }}
                                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${(() => {
                                                const tomorrow = new Date();
                                                tomorrow.setDate(tomorrow.getDate() + 1);
                                                return formData.departureTime?.startsWith(tomorrow.toISOString().split('T')[0]);
                                            })()
                                                ? 'bg-white text-black shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            Tomorrow
                                        </button>
                                    </div>

                                    {/* Time Input */}
                                    <div className="relative">
                                        <input
                                            type="time"
                                            value={formData.departureTime ? formData.departureTime.split('T')[1].slice(0, 5) : ''}
                                            onChange={(e) => {
                                                const time = e.target.value;
                                                const date = formData.departureTime ? formData.departureTime.split('T')[0] : new Date().toISOString().split('T')[0];
                                                setFormData({ ...formData, departureTime: `${date}T${time}` });
                                            }}
                                            className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-gray-900 font-bold text-center focus:ring-2 focus:ring-black"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">Review Fare/Seat</label>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newPrice = Math.max(fareDetails.minFare, parseInt(formData.pricePerSeat) - 5);
                                                setFormData({ ...formData, pricePerSeat: newPrice });
                                            }}
                                            disabled={parseInt(formData.pricePerSeat) <= fareDetails.minFare}
                                            className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 font-bold text-xl"
                                        >
                                            -
                                        </button>

                                        <div className="flex-1 relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">Rs.</span>
                                            <input
                                                name="pricePerSeat"
                                                type="number"
                                                value={formData.pricePerSeat}
                                                readOnly
                                                className="w-full text-center bg-gray-50 border-0 rounded-xl py-3 text-xl font-bold text-gray-900 focus:ring-0"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newPrice = Math.min(fareDetails.maxFare, parseInt(formData.pricePerSeat) + 10);
                                                if (newPrice !== parseInt(formData.pricePerSeat)) {
                                                    setFormData({ ...formData, pricePerSeat: newPrice });
                                                } else {
                                                    toast.warning(`Max allowed fare is Rs. ${fareDetails.maxFare}`);
                                                }
                                            }}
                                            disabled={parseInt(formData.pricePerSeat) >= fareDetails.maxFare}
                                            className="w-10 h-10 rounded-full bg-gray-900 text-white hover:bg-black disabled:opacity-50 font-bold text-xl"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">
                                            Range: <span className="font-medium text-gray-700">Rs. {fareDetails.minFare} - {fareDetails.maxFare}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">Passenger Seats</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4].map(num => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, seatsOffered: num })}
                                            className={`flex-1 py-2 rounded-lg font-medium transition-all ${parseInt(formData.seatsOffered) === num ? 'bg-gray-800 text-white shadow-lg' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fixed Bottom Action or Standard Button */}
                    <button
                        type="submit"
                        disabled={!formData.origin || !formData.destination}
                        className="w-full bg-primary-600 text-white rounded-2xl py-4 text-xl font-bold hover:bg-primary-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary-200"
                    >
                        Offer Ride
                    </button>

                </form >
            </div >
        </div >
    );
};

export default OfferRide;
