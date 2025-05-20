// server/socket/driverLocationStore.js

const driverLocations = new Map();

function updateDriverLocation(driverId, coords) {
  driverLocations.set(driverId, coords);
}

function getAllDriverLocations() {
  return [...driverLocations.entries()].map(([driverId, coords]) => ({
    driverId,
    lat: coords.lat,
    lng: coords.lng
  }));
}

module.exports = {
  updateDriverLocation,
  getAllDriverLocations
};
