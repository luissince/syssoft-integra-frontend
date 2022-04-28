const express = require('express');
const router = express.Router();
const { currentDate, currentTime } = require('../tools/Tools');
const Conexion = require('../database/Conexion');
const conec = new Conexion()

router.get('/list', async function (req, res) {
    try {

        let lista = await conec.query(`SELECT 
            idComprobante,
            CASE
            WHEN 1 THEN 'Facturación'
            WHEN 2 THEN 'Nota de Crédito'
            WHEN 3 THEN 'Nota de Debito'
            WHEN 4 THEN 'Recibo de Caja'
            WHEN 5 THEN 'Comprobante de Ingreso'
            WHEN 6 THEN 'Comprobante de Egreso'
            ELSE 'Cotización' END AS 'tipo',
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

        await conec.execute(connection, `INSERT INTO comprobante(
        idComprobante,
        tipo,
        nombre,
        serie,
        numeracion,
        impresion,
        estado,
        fecha,
        hora,
        idUsuario) 
        VALUES(?,=,?,?,?,?,?,?,?,?)`, [
            idComprobante,
            req.body.tipo,
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

        let venta = await conec.execute(connection, `SELECT  * FROM venta WHERE idComprobante = ?`, [
            req.body.idComprobante
        ]);

        if (venta.length > 0) {
            await conec.execute(connection, `UPDATE comprobante SET 
            tipo = ?,
            nombre = ?,
            impresion = ?,
            estado = ?,
            fecha = ?,
            hora = ?,
            idUsuario = ?
            WHERE idComprobante = ?`, [
                req.body.tipo,
                req.body.nombre,
                req.body.impresion,
                req.body.estado,
                currentDate(),
                currentTime(),
                req.body.idUsuario,
                req.body.idComprobante
            ]);

            await conec.commit(connection);
            res.status(200).send('Se actualizó correctamente el comprobante. !Hay campos que no se van editar ya que el comprobante esta ligado a un venta¡');
        } else {
            await conec.execute(connection, `UPDATE comprobante SET 
            tipo = ?,
            nombre = ?,
            serie = ?,
            numeracion = ?,
            impresion = ?,
            estado = ?,
            fecha = ?,
            hora = ?,
            idUsuario = ?
            WHERE idComprobante = ?`, [
                req.body.tipo,
                req.body.nombre,
                req.body.serie,
                req.body.numeracion,
                req.body.impresion,
                req.body.estado,
                currentDate(),
                currentTime(),
                req.body.idUsuario,
                req.body.idComprobante
            ]);

            await conec.commit(connection);
            res.status(200).send('Se actualizó correctamente el comprobante.');
        }

    } catch (err) {
        if (connection != null) {
            await conec.rollback(connection);
        }
        res.status(500).send(connection);
    }
});

router.delete('/', async function (req, res) {
    let connection = null;
    try {
        connection = await conec.beginTransaction();

        let venta = await conec.execute(connection, `SELECT * FROM venta WHERE idComprobante = ?`, [
            req.query.idComprobante
        ]);

        if (venta.length > 0) {
            await conec.rollback(connection);
            res.status(400).send('No se puede eliminar el comprobante ya que esta ligada a un venta.')
            return;
        }

        await conec.execute(connection, `DELETE FROM comprobante WHERE idComprobante = ?`, [
            req.query.idComprobante
        ]);

        await conec.commit(connection)
        res.status(200).send('Se eliminó correctamente el comprobante.')
    } catch (error) {
        if (connection != null) {
            await conec.rollback(connection);
        }
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
})

router.get('/listcombo', async function (req, res) {
    try {
        let result = await conec.query('SELECT idComprobante, nombre, estado FROM comprobante');
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
});

module.exports = router;