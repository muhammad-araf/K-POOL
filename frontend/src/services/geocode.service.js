import axios from 'axios';

// OpenStreetMap Nominatim API (Free, rate limited)
const GEOCODE_URL = "https://nominatim.openstreetmap.org";

const searchAddress = async (query) => {
    try {
        const response = await axios.get(GEOCODE_URL + '/search', {
            params: {
                q: query,
                format: 'json',
                limit: 1
            }
        });

        if (response.data && response.data.length > 0) {
            return {
                lat: parseFloat(response.data[0].lat),
                lon: parseFloat(response.data[0].lon),
                display_name: response.data[0].display_name
            };
        }
        return null;
    } catch (error) {
        console.error("Geocoding failed", error);
        return null;
    }
};

const searchSuggestions = async (query) => {
    try {
        const response = await axios.get(GEOCODE_URL + '/search', {
            params: {
                q: query,
                format: 'json',
                addressdetails: 1,
                limit: 5, // Return top 5 results
                countrycodes: 'pk' // Optional: Limit to Pakistan for now? Or keep global. Let's keep global but prefer local.
            }
        });
        return response.data || [];
    } catch (error) {
        console.error("Geocode suggestion failed", error);
        return [];
    }
};

const reverseGeocode = async (lat, lon) => {
    try {
        const response = await axios.get(GEOCODE_URL + '/reverse', {
            params: {
                lat,
                lon,
                format: 'json',
            }
        });

        if (response.data) {
            return {
                display_name: response.data.display_name
            };
        }
        return null;
    } catch (error) {
        console.error("Reverse geocoding failed", error);
        return null;
    }
};

const GeocodeService = {
    searchAddress,
    searchSuggestions,
    reverseGeocode
};

export default GeocodeService;
