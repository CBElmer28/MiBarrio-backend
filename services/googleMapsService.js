const axios = require('axios');
require('dotenv').config();

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const getCoordinatesFromAddress = async (address) => {
    if (!address) return null;

    try {
        const url = 'https://maps.googleapis.com/maps/api/geocode/json';
        const response = await axios.get(url, {
            params: {
                address: address,
                key: GOOGLE_API_KEY
            }
        });

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const location = response.data.results[0].geometry.location;
            return {
                latitude: location.lat,
                longitude: location.lng
            };
        }
        return null;
    } catch (error) {
        console.error('Error en servicio Google Maps:', error.message);
        return null;
    }
};

module.exports = { getCoordinatesFromAddress };