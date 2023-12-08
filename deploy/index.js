const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
/**
 * Carga de variable de entorno
 */
require('dotenv').config();

/**
 * CORS para peticiones externas
 * setHeader('Access-Control-Allow-Origin', '*')
 * setHeader('Access-Control-Allow-Headers', 'X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method')
 * setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
 */
app.use(cors());

/**
 * 
 */
app.set('port', process.env.PORT || 3000);

app.use(express.json({ limit: '1024mb' }));
app.use(express.urlencoded({ limit: '1024mb', extended: false }));

/**
 * Cargar la app estatica compilada
 */
app.use(express.static(path.join(__dirname, "..", "build")));

/**
 * 
 */
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});


app.listen(app.get("port"),()=>{
    console.log(`El servidor está corriendo en el puerto ${app.get("port")}`);
});