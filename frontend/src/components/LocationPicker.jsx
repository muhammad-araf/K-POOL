import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

// Component to handle map center updates and events
const MapController = ({ onCenterChange, onMoveStart, onMoveEnd, initialCenter }) => {
    const map = useMap();
    const isFirstLoad = useRef(true);

    useEffect(() => {
        if (initialCenter && isFirstLoad.current) {
            map.setView(initialCenter, 15);
            isFirstLoad.current = false;
        }
    }, [initialCenter, map]);

    useMapEvents({
        dragstart: () => {
            onMoveStart && onMoveStart();
        },
        moveend: () => {
            const center = map.getCenter();
            onCenterChange({ lat: center.lat, lng: center.lng });
            onMoveEnd && onMoveEnd();
        },
    });

    return null;
};

// Locate Control Component
const LocateControl = ({ onLocate }) => {
    const [loading, setLoading] = useState(false);

    const handleClick = (e) => {
        e.stopPropagation(); // Prevent map click
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                onLocate({ lat: position.coords.latitude, lng: position.coords.longitude });
                setLoading(false);
            }, () => {
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    };

    return (
        <div className="leaflet-bottom leaflet-right">
            <div className="leaflet-control leaflet-bar cursor-pointer pointer-events-auto m-4">
                <button
                    onClick={handleClick}
                    className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 text-gray-700 transition-all active:scale-95 flex items-center justify-center w-12 h-12"
                    title="Locate Me"
                    type="button"
                >
                    <Navigation className={`w-6 h-6 ${loading ? 'animate-spin text-blue-600' : 'text-gray-700'}`} fill={loading ? "currentColor" : "none"} />
                </button>
            </div>
        </div>
    );
};


const LocationPicker = ({ label, onLocationChange, initialPosition }) => {
    // Default: Lahore
    const defaultCenter = [31.5204, 74.3587];
    const center = initialPosition ? [initialPosition.lat, initialPosition.lng] : defaultCenter;
    const [isDragging, setIsDragging] = useState(false);

    // Internal state for smooth flying
    const [mapInstance, setMapInstance] = useState(null);

    const handleLocateMe = (coords) => {
        if (mapInstance) {
            mapInstance.flyTo([coords.lat, coords.lng], 16, {
                duration: 1.5,
                easeLinearity: 0.25
            });
            onLocationChange(coords);
        }
    };

    return (
        <div className="space-y-3">
            {label && <label className="block text-sm font-bold text-gray-700">{label}</label>}
            <div className="h-[450px] w-full rounded-2xl overflow-hidden border-2 border-white shadow-2xl relative z-0 ring-4 ring-gray-50/50">
                <MapContainer
                    center={center}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    whenCreated={setMapInstance}
                    ref={setMapInstance}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    <MapController
                        onCenterChange={onLocationChange}
                        onMoveStart={() => setIsDragging(true)}
                        onMoveEnd={() => setIsDragging(false)}
                        initialCenter={center}
                    />

                    <LocateControl onLocate={handleLocateMe} />
                </MapContainer>

                {/* Fixed Center Pin - Indrive Style Animation */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none pb-8 transition-transform duration-300 ease-out"
                    style={{ transform: `translate(-50%, -50%) ${isDragging ? 'translateY(-10px) scale(1.1)' : 'translateY(0) scale(1)'}` }}
                >
                    <div className="relative flex flex-col items-center">
                        {/* Tooltip Bubble */}
                        <div className={`mb-2 bg-black/80 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg transition-opacity duration-200 ${isDragging ? 'opacity-100' : 'opacity-0'}`}>
                            Release to select
                        </div>

                        <MapPin className="w-12 h-12 text-red-600 drop-shadow-2xl filter" fill="currentColor" />

                        {/* Shadow that shrinks when lifted */}
                        <div className={`absolute top-full left-1/2 -translate-x-1/2 bg-black/20 blur-[2px] rounded-full transition-all duration-300 ${isDragging ? 'w-2 h-1 opacity-50' : 'w-4 h-1.5 opacity-100'}`}></div>
                    </div>
                </div>

                {/* Aesthetic Gradient Overlay */}
                <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>
            </div>
        </div>
    );
};

export default LocationPicker;
