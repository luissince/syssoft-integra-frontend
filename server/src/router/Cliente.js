const express = require('express');
const router = express.Router();
const tools = require('../tools/Tools');
const Conexion = require('../database/Conexion');

router.post('add', async function (req, res) {
    let connection = null;
    try {
        connection = await conec.beginTransaction();

        let result = await conec.execute(connection, 'SELECT idCliente FROM cliente');
        let idCliente = "";
        if (result.length != 0) {

            let quitarValor = result.map(function (item) {
                return parseInt(item.idCliente.replace("CL", ''));
            });

            let valorActual = Math.max(...quitarValor);
            let incremental = valorActual + 1;
            let codigoGenerado = "";
            if (incremental <= 9) {
                codigoGenerado = 'CL000' + incremental;
            } else if (incremental >= 10 && incremental <= 99) {
                codigoGenerado = 'CL00' + incremental;
            } else if (incremental >= 100 && incremental <= 999) {
                codigoGenerado = 'CL0' + incremental;
            } else {
                codigoGenerado = 'CL' + incremental;
            }

            idCliente = codigoGenerado;
        } else {
            idCliente = "CL0001";
        }

        await conec.execute(connection, `INSERT INTO cliente(
            idCliente,
            numeroDocumento
        )
        VALUES(?,?)
        `, [
            idCliente,
            req.body.idCliente,
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