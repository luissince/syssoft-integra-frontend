const express = require('express');
// const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const cors = require('cors');

//cors para peticiones fuera del servidor
/**
 setHeader('Access-Control-Allow-Origin', '*')
 setHeader('Access-Control-Allow-Headers', 'X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method')
 setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
*/
app.use(cors());

app.set('port', process.env.PORT || 5000);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));

app.use(express.static(path.join(__dirname, "..", "app/build")));
// app.get("/", function (req, res) {
//     res.send("server running inmobiliaria...");
// })

//api rest
// app.use('/api/usuario', require('./router/Usuario'));
// app.use('/api/facultad', require('./router/Facultad'));
app.use('/api/comprobante', require('./src/router/Comprobante'));
app.use('/api/moneda', require('./src/router/Moneda'));
app.use('/api/banco', require('./src/router/Banco'));
app.use('/api/sede', require('./src/router/Sede'));

app.use('/api/proyecto', require('./src/router/Proyecto'));
app.use('/api/manzana', require('./src/router/Manzana'));
app.use('/api/lote', require('./src/router/Lote'));

app.use('/api/cliente', require('./src/router/Cliente'));
app.use('/api/factura', require('./src/router/Factura'));

app.use('/api/perfil', require('./src/router/Perfil'));
app.use('/api/usuario', require('./src/router/Usuario'))


app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, "..", "app/build", "index.html"));
});

app.listen(app.get("port"), () => {
    console.log(`El servidor está corriendo en el puerto ${app.get("port")}`);
});