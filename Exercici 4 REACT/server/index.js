// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ====== CONFIGURACIÓN BÁSICA ======
const PORT = process.env.PORT || 5000;

// Middleware para parsear JSON
app.use(express.json());

// (Opcional pero recomendado) CORS si tienes front separado
app.use(cors());

// ====== CONEXIÓN A MONGODB ======
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch((err) => {
        console.error('❌ Error conectando a MongoDB:', err.message);
        process.exit(1);
    });

// ====== RUTAS ======
const authRoutes = require('./app/routes/auth');
const userRoutes = require('./app/routes/user');
const apiRoutes = require('./app/routes/api');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.send('API funcionando 🚀');
});

// ====== ARRANCAR SERVIDOR ======
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
