const express = require('express');
const router = express.Router();
const { currentDate, currentTime } = require('../tools/Tools');
const Conexion = require('../database/Conexion');
const conec = new Conexion()

router.get('/list', async function (req, res) {

    try {

        let lista = await conec.query(`SELECT 
                idComprobante,
                nombre,
                serie,
                numeracion,
                impresion,
                estado, 
                DATE_FORMAT(fecha,'%d/%m/%Y') as fecha,
                hora
                FROM comprobante
                WHERE 
                ? = 0
                OR
                ? = 1 AND nombre LIKE CONCAT(?,'%')
                OR
                ? = 1 AND serie LIKE CONCAT(?,'%')
                OR
                ? = 1 AND numeracion LIKE CONCAT(?,'%')
                LIMIT ?,?`, [
            parseInt(req.query.opcion),

            parseInt(req.query.opcion),
            req.query.buscar,

            parseInt(req.query.opcion),
            req.query.buscar,

            parseInt(req.query.opcion),
            req.query.buscar,

            parseInt(req.query.posicionPagina),
            parseInt(req.query.filasPorPagina)
        ]);


        let resultLista = lista.map(function (item, index) {
            return {
                ...item,
                id: (index + 1) + parseInt(req.query.posicionPagina),
            };
        });

        let total = await conec.query(`SELECT COUNT(*) AS Total FROM comprobante
        WHERE 
                ? = 0
                OR
                ? = 1 AND nombre LIKE CONCAT(?,'%')
                OR
                ? = 1 AND serie LIKE CONCAT(?,'%')
                OR
                ? = 1 AND numeracion LIKE CONCAT(?,'%')`, [
            parseInt(req.query.opcion),

            parseInt(req.query.opcion),
            req.query.buscar,

            parseInt(req.query.opcion),
            req.query.buscar,

            parseInt(req.query.opcion),
            req.query.buscar,
        ]);

        res.status(200).send({ "result": resultLista, "total": total[0].Total });
    } catch (error) {
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
});

router.get('/id', async function (req, res) {
    try {
        let result = await conec.query(`SELECT * FROM comprobante WHERE idComprobante = ?`, [
            req.query.idComprobante
        ]);
        if (result.length > 0) {
            res.status(200).send(result[0]);
        } else {
            res.status(400).send("Datos no encontrados");
        }
    } catch (error) {
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
});

router.post('/add', async function (req, res) {
    let connection = null;
    try {
        connection = await conec.beginTransaction();

        let result = await conec.execute(connection, 'SELECT idComprobante FROM comprobante');
        let idComprobante = "";
        if (result.length != 0) {

            let quitarValor = result.map(function (item) {
                return parseInt(item.idComprobante.replace("CB", ''));
            });

            let valorActual = Math.max(...quitarValor);
            let incremental = valorActual + 1;
            let codigoGenerado = "";
            if (incremental <= 9) {
                codigoGenerado = 'CB000' + incremental;
            } else if (incremental >= 10 && incremental <= 99) {
                codigoGenerado = 'CB00' + incremental;
            } else if (incremental >= 100 && incremental <= 999) {
                codigoGenerado = 'CB0' + incremental;
            } else {
                codigoGenerado = 'CB' + incremental;
            }

            idComprobante = codigoGenerado;
        } else {
            idComprobante = "CB0001";
        }

        await conec.execute(connection, `INSERT INTO comprobante 
        (idComprobante,nombre,serie,numeracion,impresion,estado,fecha,hora,idUsuario) 
        VALUES(?,?,?,?,?,?,?,?,?)`, [
            idComprobante,
            req.body.nombre,
            req.body.serie,
            req.body.numeracion,
            req.body.impresion,
            req.body.estado,
            currentDate(),
            currentTime(),
            req.body.idUsuario,
        ])

        await conec.commit(connection);
        res.status(200).send('Se registró el comprobante.')

    } catch (err) {
        if (connection != null) {
            await conec.rollback(connection);
        }
        res.status(500).send(connection);
    }
});

router.post('/edit', async function (req, res) {
    let connection = null;
    try {
        connection = await conec.beginTransaction();

        await conec.execute(connection, `UPDATE comprobante SET 
        nombre = ?,
        serie = ?,
        numeracion = ?,
        impresion = ?,
        estado = ?
        WHERE idComprobante = ?`, [
            req.body.nombre,
            req.body.serie,
            req.body.numeracion,
            req.body.impresion,
            req.body.estado,
            req.body.idComprobante,
        ])

        await conec.commit(connection);
        res.status(200).send('Se actualizó el comprobante.')

    } catch (err) {
        if (connection != null) {
            await conec.rollback(connection);
        }
        res.status(500).send(connection);
    }
});

router.get('/listcombo', async function (req, res) {
    try {
        let result = await conec.query('SELECT idComprobante, nombre, estado FROM comprobante');
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
});

module.exports = router;