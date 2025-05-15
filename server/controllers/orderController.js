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

router.post('/send-whatsapp-link', async (req, res) => {
  const { phoneNumber, originAddress } = req.body;
  const encodedOrigin = encodeURIComponent(originAddress);
  const whatsappLink = `https://wa.me/${phoneNumber}?text=Please%20share%20your%20delivery%20location:%20https://maps.google.com/?q=${encodedOrigin}`;
  
  // Implement your WhatsApp API logic here
  res.json({ success: true, link: whatsappLink });
});