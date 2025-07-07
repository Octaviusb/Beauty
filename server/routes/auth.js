const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { user, pass } = req.body;

  // ¡Esto es solo para desarrollo!
  if (process.env.NODE_ENV !== 'production') {
    if (user === 'admin' && pass === '1234') {
      return res.json({ success: true, token: 'fake-token' });
    }
  }

  res.status(401).json({ success: false });
});

module.exports = router;
