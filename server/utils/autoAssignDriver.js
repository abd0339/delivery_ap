// server/utils/autoAssignDriver.js
const getDistance = require('./getDistance');
const predictPrice = require('../ml/predictPrice');
const { getAllDriverLocations } = require('../socket/driverLocationStore');

async function autoAssignDriver({ originAddress, length, weight, orderType }) {
  const availableDrivers = getAllDriverLocations();

  if (availableDrivers.length === 0) return null;

  const type = orderType === 'package' ? 1 : 0;

  let bestDriver = null;
  let shortestDistance = Infinity;

  for (const driver of availableDrivers) {
    try {
      const distance = await getDistance(originAddress, `${driver.lat},${driver.lng}`);

      if (distance === null) continue;

      const price = await predictPrice({
        type,
        length: type ? parseFloat(length) : 0,
        weight: type ? parseFloat(weight) : 0,
        distance
      });

      if (distance < shortestDistance) {
        shortestDistance = distance;
        bestDriver = {
          driverId: driver.driverId,
          distance,
          predictedPrice: price
        };
      }

    } catch (err) {
      console.error(`Auto-assign error for driver ${driver.driverId}:`, err.message);
    }
  }

  return bestDriver;
}

module.exports = autoAssignDriver;
