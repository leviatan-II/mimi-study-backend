const express = require('express');
const path = require('path');
const pool = require('./config/dbPostgres');
const app = express();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// Middleware para leer formularios HTML
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views(prueba)', 'form.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views(prueba)', 'login.html'));
});


app.post('/registrar', async (req, res) => {
  const { nombre, correo, contrasena } = req.body;

  if (!nombre || !correo || !contrasena) {
    return res.status(400).send('Faltan datos obligatorios');
  }

  try {
    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    const query = 'INSERT INTO usuarios (nombre, correo, contrasena) VALUES ($1, $2, $3)';
    await pool.query(query, [nombre, correo, hashedPassword]);

    res.status(201).send('Usuario registrado con éxito');
  } catch (error) {
    console.error('Error al insertar usuario:', error);
    if (error.code === '23505') {
      res.status(409).send('Correo ya registrado');
    } else {
      res.status(500).send('Error interno del servidor');
    }
  }
});

app.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).send('Faltan datos obligatorios');
  }

  try {
    // Buscar usuario por correo
    const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);

    if (result.rows.length === 0) {
      return res.status(401).send('Correo o contraseña incorrectos');
    }

    const user = result.rows[0];

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!isMatch) {
      return res.status(401).send('Correo o contraseña incorrectos');
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, correo: user.correo },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).send('Error interno del servidor');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
