const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Ruta /api/auth/test funcionando correctamente' });
});

module.exports = router;
