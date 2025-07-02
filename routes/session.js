const express = require('express');
const router = express.Router();
const pool = require('../config/dbPostgres');

// Ruta para guardar el tiempo usado del temporizador
router.post('/save-time', async (req, res) => {
  const { usuario_id, tiempo_usado } = req.body;

  if (!usuario_id || !tiempo_usado) {
    return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
  }

  try {
    const query = 'INSERT INTO temporizador_tiempos (usuario_id, tiempo_usado) VALUES ($1, $2)';
    await pool.query(query, [usuario_id, tiempo_usado]);
    res.status(201).json({ success: true, message: 'Tiempo guardado correctamente' });
  } catch (error) {
    console.error('Error al guardar tiempo:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Nueva ruta para obtener el tiempo total usado por un usuario
router.get('/total-time/:usuario_id', async (req, res) => {
  const usuario_id = parseInt(req.params.usuario_id);
  if (!usuario_id) {
    return res.status(400).json({ success: false, message: 'Falta usuario_id' });
  }

  try {
    const query = 'SELECT COALESCE(SUM(tiempo_usado), 0) AS total FROM temporizador_tiempos WHERE usuario_id = $1';
    const result = await pool.query(query, [usuario_id]);
    const total = result.rows[0].total;
    res.json({ success: true, total });
  } catch (error) {
    console.error('Error al obtener tiempo total:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

module.exports = router;
