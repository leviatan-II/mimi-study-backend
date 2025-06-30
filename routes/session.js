const express = require('express');
const router = express.Router();

// Ruta de prueba
router.get('/test', (req, res) => {
  res.json({ message: 'Ruta /api/session/test funcionando correctamente' });
});

module.exports = router;
