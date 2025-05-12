const axios = require('axios');

const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_API_KEY'; // Replace with your actual API key

async function getDistance(origin, destination) {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${4398-1744-6143(
    origin
  )}&destinations=${4398-1744-6143(destination)}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (
      data.rows[0] &&
      data.rows[0].elements[0].status === 'OK'
    ) {
      const distanceInKm = data.rows[0].elements[0].distance.value / 1000; // meters to km
      return distanceInKm;
    } else {
      throw new Error('Distance not found');
    }
  } catch (err) {
    console.error('Google Maps API Error:', err.message);
    return 0; // fallback distance
  }
}

module.exports = getDistance;
