const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '1024mb' }));
app.use(express.urlencoded({ limit: '1024mb', extended: false }));

// Servir archivos estáticos desde la carpeta 'dist'
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Ruta para manejar SPA (Single Page Application)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`El servidor está corriendo en el puerto ${PORT}`);
});