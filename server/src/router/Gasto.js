const express = require('express');
const router = express.Router();
const {currentDate, currentTime} = require('../tools/Tools');
const Conexion = require('../database/Conexion');

const conec = new Conexion()

router.get('/list', async function (req, res) {
    try {
        // console.log(req.query)
        let lista = await conec.query(`SELECT 
            g.idGasto, 
            u.nombres AS nombreUse, 
            u.apellidos AS apellidoUse, 
            m.simbolo, 
            b.nombre AS nombreBanco, 
            b.tipoCuenta, 
            g.metodoPago, 
            g.estado, 
            g.observacion, 
            DATE_FORMAT(g.fecha,'%d/%m/%Y') AS fecha, 
            g.hora, 
            IFNULL(SUM(gd.precio*gd.cantidad), 0) AS monto
            FROM gasto AS g
            INNER JOIN usuario AS u ON g.idUsuario = u.idUsuario
            INNER JOIN moneda AS m ON g.idMoneda = m.idMoneda
            INNER JOIN banco AS b ON g.idBanco = b.idBanco
            LEFT JOIN gastoDetalle AS gd ON g.idGasto = gd.idGasto
            WHERE 
            ? = 0
            OR
            ? = 1 AND u.nombres LIKE CONCAT(?,'%')
            GROUP BY g.idGasto
            ORDER BY g.fecha DESC, g.hora DESC
            LIMIT ?,?`, [
            parseInt(req.query.option),

            parseInt(req.query.option),
            req.query.buscar,

            parseInt(req.query.posicionPagina),
            parseInt(req.query.filasPorPagina)
        ])

        let resultLista = lista.map(function (item, index) {
            return {
                ...item,
                id: (index + 1) + parseInt(req.query.posicionPagina)
            }
        });

        let total = await conec.query(`SELECT COUNT(*) AS Total 
            FROM gasto AS g
            INNER JOIN usuario AS u ON g.idUsuario = u.idUsuario
            INNER JOIN moneda AS m ON g.idMoneda = m.idMoneda
            INNER JOIN banco AS b ON g.idBanco = b.idBanco
            WHERE 
            ? = 0
            OR
            ? = 1 AND u.nombres LIKE CONCAT(?,'%')`, [
            parseInt(req.query.option),

            parseInt(req.query.option),
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

        console.log(req.body)
        connection = await conec.beginTransaction();

        let result = await conec.execute(connection, 'SELECT idGasto FROM gasto');
        let idGasto = "";
        if (result.length != 0) {

            let quitarValor = result.map(function (item) {
                return parseInt(item.idGasto.replace("GT", ''));
            });

            let valorActual = Math.max(...quitarValor);
            let incremental = valorActual + 1;
            let codigoGenerado = "";
            if (incremental <= 9) {
                codigoGenerado = 'GT000' + incremental;
            } else if (incremental >= 10 && incremental <= 99) {
                codigoGenerado = 'GT00' + incremental;
            } else if (incremental >= 100 && incremental <= 999) {
                codigoGenerado = 'GT0' + incremental;
            } else {
                codigoGenerado = 'GT' + incremental;
            }

            idGasto = codigoGenerado;
        } else {
            idGasto = "GT0001";
        }

        await conec.execute(connection, `INSERT INTO gasto(
            idGasto, 
            idUsuario, idMoneda, idBanco, metodoPago, estado, observacion, fecha, hora) 
            VALUES(?,?,?,?,?,?,?,?,?)`, [
            idGasto, 
            req.body.idUsuario, req.body.idMoneda, req.body.idBanco, req.body.metodoPago, req.body.estado, req.body.observacion, currentDate(), currentTime()
        ])

        for (let item of req.body.gastoDetalle) {
            await conec.execute(connection, `INSERT INTO gastoDetalle(
                idGasto, idConcepto, precio, cantidad, idImpuesto)
                VALUES(?,?,?,?,?)`, [
                idGasto, item.idConcepto, item.monto, item.cantidad, item.idImpuesto
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



router.get('/id', async function (req, res) {
    try {

        let result = await conec.query(`SELECT
        g.idGasto,
        u.nombres AS nombreUse,
        u.apellidos AS apellidoUse,
        m.simbolo,
        b.nombre AS nombreBanco,
        b.tipoCuenta,
        g.metodoPago,
        g.estado,
        g.observacion,
        DATE_FORMAT(g.fecha,'%d/%m/%Y') as fecha,
        g.hora,

        IFNULL(SUM(gd.precio*gd.cantidad), 0) AS monto

        FROM gasto AS g
        INNER JOIN usuario AS u ON g.idUsuario = u.idUsuario
        INNER JOIN moneda AS m ON g.idMoneda = m.idMoneda
        INNER JOIN banco AS b ON g.idBanco = b.idBanco
        LEFT JOIN gastoDetalle AS gd ON g.idGasto = gd.idGasto
        WHERE g.idGasto = ?
        GROUP BY g.idGasto`, [
            req.query.idGasto
        ]);

        if (result.length > 0) {

            let detalle = await conec.query(`SELECT 
            co.nombre as concepto,
            gd.precio,
            gd.cantidad,
            imp.nombre as impuesto,
            imp.porcentaje

            FROM gastoDetalle AS gd 
            INNER JOIN concepto AS co ON gd.idConcepto = co.idConcepto
            INNER JOIN impuesto AS imp ON gd.idImpuesto  = imp.idImpuesto 
            WHERE gd.idGasto = ?
            `, [
                req.query.idGasto
            ]);

            // console.log(detalle)

            res.status(200).send({
                "cabecera": result[0],
                "detalle": detalle
              
            });
        } else {
            res.status(400).send("Datos no encontrados");
        }

    } catch (error) {
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }

})


router.delete('/anular', async function (req, res) {
    let connection = null;
    try {
        connection = await conec.beginTransaction();

        await conec.execute(connection, `DELETE FROM gasto WHERE idGasto = ?`, [
            req.query.idGasto
        ]);

        await conec.execute(connection, `DELETE FROM gastoDetalle WHERE idGasto = ?`, [
            req.query.idGasto
        ]);

        await conec.commit(connection);
        res.status(201).send("Se elimino la transacción correctamente.");
    } catch (error) {
        console.log(error)
        if (connection != null) {
            conec.rollback(connection);
        }
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
});

// router.post('/update', async function (req, res) {
//     let connection = null;
//     try {

//         connection = await conec.beginTransaction();
//         await conec.execute(connection, `UPDATE gasto SET 
//             conceptoGasto=?, fecha=?, hora=?, monto=?, observacion=?,
//             WHERE idGasto=?`, [ 
//             req.body.conceptoGasto, req.body.fecha, currentTime(), req.body.monto, req.body.observacion, 
//             req.body.idGasto, 
            
//         ])

//         await conec.commit(connection)
//         res.status(200).send('Los datos se actualizaron correctamente.')
//     } catch (error) {
//         if (connection != null) {
//             conec.rollback(connection);
//         }
//         res.status(500).send("Se produjo un error de servidor, intente nuevamente.");
//     }
// });



module.exports = router;