const express = require('express');
const router = express.Router();
const { currentDate, currentTime } = require('../tools/Tools');
const Conexion = require('../database/Conexion');
const conec = new Conexion();


router.get("/list", async function (req, res) {
    res.send("factura");
});


router.post("/add", async function (req, res) {
    let connection = null;
    try {
        connection = await conec.beginTransaction();

        let result = await conec.execute(connection, 'SELECT idVenta  FROM venta');
        let idVenta = "";
        if (result.length != 0) {

            let quitarValor = result.map(function (item) {
                return parseInt(item.idVenta.replace("VT", ''));
            });

            let valorActual = Math.max(...quitarValor);
            let incremental = valorActual + 1;
            let codigoGenerado = "";
            if (incremental <= 9) {
                codigoGenerado = 'VT000' + incremental;
            } else if (incremental >= 10 && incremental <= 99) {
                codigoGenerado = 'VT00' + incremental;
            } else if (incremental >= 100 && incremental <= 999) {
                codigoGenerado = 'VT0' + incremental;
            } else {
                codigoGenerado = 'VT' + incremental;
            }

            idVenta = codigoGenerado;
        } else {
            idVenta = "VT0001";
        }

        await conec.execute(connection, `INSERT INTO venta(
        idVenta,
        idCliente,
        tipoVenta,
        inicial,
        numeroCuotas,
        idLote,
        precioContado,
        idVendedor,
        idBanco,
        fechaPrimeraCuota,
        horaPrimeraCuota,
        numeroContrato,
        idComprobante,
        idFormaPago,
        codigoOperacion,
        imagen,
        extension,
        fecha,
        hora)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `, [
            idVenta,
            req.body.idCliente,
            req.body.tipoVenta,
            req.body.inicial,
            req.body.numeroCuotas,
            req.body.idLote,
            req.body.precioContado,
            req.body.idVendedor,
            req.body.idBanco,
            req.body.fechaPrimeraCuota,
            currentTime(),
            req.body.numeroContrato,
            req.body.idComprobante,
            req.body.idFormaPago,
            req.body.codigoOperacion,
            req.body.imagen,
            req.body.extension,
            currentDate(),
            currentTime(),
        ])

        await conec.commit(connection);
        res.status(200).send('Datos insertados correctamente')
    } catch (error) {
        if (connection != null) {
            conec.rollback(connection);
        }
        res.status(500).send(connection);
    }
});

module.exports = router;