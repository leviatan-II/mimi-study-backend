const express = require('express');
const router = express.Router();
const pool = require('../config/dbPostgres');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Ruta de prueba
router.get('/test', (req, res) => {
  res.json({ message: 'Ruta /api/auth/test funcionando correctamente' });
});

router.get('/user/:id', async (req, res) => {
  const usuarioId = parseInt(req.params.id);
  if (!usuarioId) {
    return res.status(400).json({ success: false, message: 'Falta id de usuario' });
  }
  try {
    const query = 'SELECT nombre FROM usuarios WHERE id = $1';
    const result = await pool.query(query, [usuarioId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    const nombre = result.rows[0].nombre;
    res.json({ success: true, nombre });
  } catch (error) {
    console.error('Error al obtener nombre usuario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Registro de usuario
router.post('/register', async (req, res) => {
  const { nombre, correo, contrasena } = req.body;

  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({
      success: false,
      message: 'Faltan datos obligatorios'
    });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    const query = 'INSERT INTO usuarios (nombre, correo, contrasena) VALUES ($1, $2, $3)';
    await pool.query(query, [nombre, correo, hashedPassword]);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado con éxito'
    });
  } catch (error) {
    console.error('Error al insertar usuario:', error);
    if (error.code === '23505') {
      res.status(409).json({
        success: false,
        message: 'Correo ya registrado'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({
      success: false,
      message: 'Faltan datos'
    });
  }

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Correo no registrado'
      });
    }

    const usuario = result.rows[0];
    const esValida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!esValida) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña incorrecta'
      });
    }

    const token = jwt.sign(
      { id: usuario.id },
      process.env.JWT_SECRET || 'secreto',
      { expiresIn: '2h' }
    );

    // Modificación: incluir id del usuario en la respuesta
    res.status(200).json({
      success: true,
      message: 'Inicio exitoso',
      token,
      nombre: usuario.nombre,
      id: usuario.id  // <-- Aquí agregamos el id
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
