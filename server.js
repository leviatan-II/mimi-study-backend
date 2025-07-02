const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectMongo = require('./config/dbMongo');
const pool = require('./config/dbPostgres');

dotenv.config();
connectMongo();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('API MIMI backend funcionando'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/session', require('./routes/session'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Servidor corriendo en puerto ${PORT}`));