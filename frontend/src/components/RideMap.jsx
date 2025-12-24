import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon missing in Leaflet React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const RideMap = ({ rides, height = "400px" }) => {
    // Default center (can be adjusted or dynamic)
    const defaultCenter = [31.5204, 74.3587]; // Lahore Coordinates (Example default)

    return (
        <div className="w-full h-full bg-gray-100">
            <MapContainer center={defaultCenter} zoom={12} style={{ height: height, width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                {rides && rides.map((ride, idx) => (
                    // Only show marker if ride has coordinates
                    (ride.startLat && ride.startLng) && (
                        <Marker key={idx} position={[ride.startLat, ride.startLng]}>
                            <Popup>
                                <div className="text-sm">
                                    <div className="font-bold text-gray-900">{ride.origin}</div>
                                    <div className="text-gray-500 text-xs">to</div>
                                    <div className="font-bold text-gray-900">{ride.destination}</div>
                                    <div className="mt-1 font-bold text-green-600">Rs. {ride.pricePerSeat}</div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
};

export default RideMap;
