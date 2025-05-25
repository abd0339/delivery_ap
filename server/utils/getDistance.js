const axios = require('axios');

const getDistance = async (origin, destination) => {
  try {
    // Validate input parameters
    if (!origin || !destination) {
      throw new Error('Both origin and destination are required');
    }
    // Auto-convert "Lat:...,Lng:..." format to "lat,lng"
    const normalizeLatLng = (value) => {
      const match = typeof value === 'string' && value.match(/Lat:(-?\d+(\.\d+)?),Lng:(-?\d+(\.\d+)?)/);
      return match ? `${match[1]},${match[3]}` : value;
    };
    const normalizedOrigin = normalizeLatLng(origin);
    const normalizedDestination = normalizeLatLng(destination);

    // Encode parameters for URL
    const encodedOrigin = encodeURIComponent(origin);
    const encodedDest = encodeURIComponent(destination);

    // Construct API URL with environment variable
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric
      &origins=${encodedOrigin}
      &destinations=${encodedDest}
      &key=${process.env.GOOGLE_MAPS_API_KEY}`.replace(/\s/g, '');

    const response = await axios.get(url);
    const { data } = response;

    // Handle API errors
    if (data.status !== 'OK') {
      throw new Error(`Google API Error: ${data.error_message || data.status}`);
    }

    // Check valid response structure
    if (
      !data.rows ||
      !data.rows[0] ||
      !data.rows[0].elements ||
      !data.rows[0].elements[0] ||
      !data.rows[0].elements[0].distance
    ) {
      throw new Error('Invalid response structure from Google API');
    }

    // Convert meters to kilometers
    return data.rows[0].elements[0].distance.value / 1000;

  } catch (err) {
    console.error(`Distance Calculation Error: ${err.message}`);
    // Return null instead of 0 for better error distinction
    return null;
  }
  console.log(`🛰️ Distance API From "${origin}" → "${destination}"`);
};

module.exports = getDistance;