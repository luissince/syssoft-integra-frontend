const express = require('express');
const router = express.Router();
const { currentDate, currentTime } = require('../tools/Tools');
const Conexion = require('../database/Conexion');
const conec = new Conexion()

router.get('/list', async function (req, res) {
    try {

        let lista = await conec.query(`SELECT 
        c.idCobro, 
        cl.documento,
        cl.informacion,  
        CASE 
        WHEN cn.idConcepto IS NOT NULL THEN cn.nombre
        ELSE '' END AS detalle,
        m.simbolo,
        b.nombre as banco, 
        c.estado, 
        c.observacion, 
        DATE_FORMAT(c.fecha,'%d/%m/%Y') as fecha, 
        c.hora,
        IFNULL(SUM(cd.precio*cd.cantidad),0) AS monto
        FROM cobro AS c
        INNER JOIN cliente AS cl ON c.idCliente = cl.idCliente
        INNER JOIN banco AS b ON c.idBanco = b.idBanco
        INNER JOIN moneda AS m ON c.idMoneda = m.idMoneda 
        LEFT JOIN cobroDetalle AS cd ON c.idCobro = cd.idCobro
        LEFT JOIN concepto AS cn ON cd.idConcepto = cn.idConcepto 
        WHERE 
        ? = 0
        OR
        ? = 1 AND cl.informacion LIKE CONCAT(?,'%')
        GROUP BY c.idCobro
        LIMIT ?,?`, [
            parseInt(req.query.opcion),

            parseInt(req.query.opcion),
            req.query.buscar,

            parseInt(req.query.posicionPagina),
            parseInt(req.query.filasPorPagina)
        ]);

        let resultLista = lista.map(function (item, index) {
            return {
                ...item,
                id: (index + 1) + parseInt(req.query.posicionPagina)
            }
        });

        let total = await conec.query(`SELECT COUNT(*) AS Total        
        FROM cobro AS c
        INNER JOIN cliente AS cl ON c.idCliente = cl.idCliente
        INNER JOIN banco AS b ON c.idBanco = b.idBanco
        INNER JOIN moneda AS m ON c.idMoneda = m.idMoneda 
        WHERE 
        ? = 0
        OR
        ? = 1 AND cl.informacion LIKE CONCAT(?,'%')`, [
            parseInt(req.query.opcion),

            parseInt(req.query.opcion),
            req.query.buscar
        ]);

        res.status(200).send({ "result": resultLista, "total": total[0].Total })

    } catch (error) {
        console.log(error)
        res.status(500).send("Error interno de conexión, intente nuevamente.")
    }
});

router.post('/add', async function (req, res) {
    let connection = null;
    try {
        connection = await conec.beginTransaction();

        let result = await conec.execute(connection, 'SELECT idCobro FROM cobro');
        let idCobro = "";
        if (result.length != 0) {

            let quitarValor = result.map(function (item) {
                return parseInt(item.idCobro.replace("CB", ''));
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

            idCobro = codigoGenerado;
        } else {
            idCobro = "CB0001";
        }

        await conec.execute(connection, `INSERT INTO cobro(
            idCobro, 
            idCliente, 
            idUsuario, 
            idMoneda, 
            idBanco, 
            idProcedencia,
            metodoPago, 
            estado, 
            observacion, 
            fecha, 
            hora) 
            VALUES(?,?,?,?,?,?,?,?,?,?,?)`, [
            idCobro,
            req.body.idCliente,
            req.body.idUsuario,
            req.body.idMoneda,
            req.body.idBanco,
            '',
            req.body.metodoPago,
            req.body.estado,
            req.body.observacion,
            currentDate(),
            currentTime()
        ])

        for (let item of req.body.cobroDetalle) {
            await conec.execute(connection, `INSERT INTO cobroDetalle(
                idCobro, 
                idConcepto, 
                precio, 
                cantidad, 
                idImpuesto)
                VALUES(?,?,?,?,?)`, [
                idCobro,
                item.idConcepto,
                item.monto,
                item.cantidad,
                item.idImpuesto
            ])
        }

        await conec.commit(connection);
        res.status(200).send('Datos insertados correctamente')

    } catch (error) {
        if (connection != null) {
            conec.rollback(connection);
        }
        res.status(500).send("Error de servidor");
        console.log(error)
    }
});

router.post('/cobro', async function (req, res) {
    let connection = null;
    try {
        connection = await conec.beginTransaction();

        let result = await conec.execute(connection, 'SELECT idCobro FROM cobro');
        let idCobro = "";
        if (result.length != 0) {

            let quitarValor = result.map(function (item) {
                return parseInt(item.idCobro.replace("CB", ''));
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

            idCobro = codigoGenerado;
        } else {
            idCobro = "CB0001";
        }

        await conec.execute(connection, `INSERT INTO cobro(
            idCobro, 
            idCliente, 
            idUsuario, 
            idMoneda, 
            idBanco, 
            idProcedencia,
            metodoPago, 
            estado, 
            observacion, 
            fecha, 
            hora) 
            VALUES(?,?,?,?,?,?,?,?,?,?,?)`, [
            idCobro,
            req.body.idCliente,
            req.body.idUsuario,
            req.body.idMoneda,
            req.body.idBanco,
            req.body.idVenta,
            req.body.metodoPago,
            req.body.estado,
            req.body.observacion,
            currentDate(),
            currentTime()
        ])

        await conec.commit(connection);
        res.status(200).send('Datos insertados correctamente')

    } catch (error) {
        if (connection != null) {
            conec.rollback(connection);
        }
        res.status(500).send("Error de servidor");
        console.log(error)
    }
});

router.get('/id', async function (req, res) {
    try {
        let result = await conec.query(`SELECT
        c.idCobro,
        c.metodoPago,
        c.estado,
        c.observacion,
        DATE_FORMAT(c.fecha,'%d/%m/%Y') as fecha,
        c.hora,

        cl.documento,
        cl.informacion,

        b.nombre as banco,

        m.simbolo,

        IFNULL(SUM(cb.precio*cb.cantidad),0) AS monto

        FROM cobro AS c
        INNER JOIN cliente AS cl ON c.idCliente = cl.idCliente
        INNER JOIN banco AS b ON c.idBanco = b.idBanco
        INNER JOIN moneda AS m ON c.idMoneda = m.idMoneda
        LEFT JOIN cobroDetalle AS cb ON c.idCobro = cb.idCobro
        WHERE c.idCobro = ?
        GROUP BY  c.idCobro`, [
            req.query.idCobro
        ]);

        if (result.length > 0) {

            let detalle = await conec.query(`SELECT 
            co.nombre as concepto,
            cd.precio,
            cd.cantidad,
            imp.nombre as impuesto,
            imp.porcentaje
            FROM cobroDetalle AS cd 
            INNER JOIN concepto AS co ON cd.idConcepto = co.idConcepto
            INNER JOIN impuesto AS imp ON cd.idImpuesto  = imp.idImpuesto 
            WHERE cd.idCobro = ?
            `, [
                req.query.idCobro
            ]);

            res.status(200).send({
                "cabecera": result[0],
                "detalle": detalle
            });
        } else {
            res.status(400).send("Datos no encontrados");
        }

    } catch (error) {
        console.log(error)
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }

});

router.post('/update', async function (req, res) {
    let connection = null;
    try {

        connection = await conec.beginTransaction();
        await conec.execute(connection, `UPDATE cobro SET 
        idCliente=?, 
        idUsuario=?, 
        idMoneda=?, 
        idBanco=?, 
        metodoPago=?, 
        estado=?,
        observacion=?, 
        fecha=?,
        hora=?
        WHERE idCobro=?`, [
            req.body.idCliente,
            req.body.idUsuario,
            req.body.idMoneda,
            req.body.idBanco,
            req.body.metodoPago,
            req.body.estado,
            req.body.observacion,
            currentDate(),
            currentTime(),
            req.body.idCobro,
        ])

        await conec.commit(connection)
        res.status(200).send('Los datos se actualizaron correctamente.')
    } catch (error) {
        if (connection != null) {
            conec.rollback(connection);
        }
        res.status(500).send("Se produjo un error de servidor, intente nuevamente.");
    }
})

module.exports = router;