const getDistance = require('../server/utils/getDistance');

router.post('/calculate-route', async (req, res) => {
  try {
    const distance = await getDistance(
      req.body.origin, 
      req.body.destination
    );
    
    if (distance === null) {
      return res.status(400).json({ error: 'Distance calculation failed' });
    }
    
    res.json({ distance });
    
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});