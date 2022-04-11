const express = require('express');
const router = express.Router();
const {currentDate, currentTime} = require('../tools/Tools');
const Conexion = require('../database/Conexion');

const conec = new Conexion()

router.get('/list', async function (req, res) {
    try {
        // console.log(req.query)
        let lista = await conec.query(`SELECT 
            idGasto, conceptoGasto, DATE_FORMAT(fecha,'%d/%m/%Y') as fecha, hora, monto, observacion 
            FROM gasto
            WHERE 
            ? = 0
            OR
            ? = 1 and conceptoGasto like concat(?,'%')
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

        let total = await conec.query(`SELECT COUNT(*) AS Total FROM gasto
            WHERE 
            ? = 0
            OR
            ? = 1 and conceptoGasto like concat(?,'%')`, [
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
            conceptoGasto, fecha, hora, monto, observacion) 
            VALUES(?,?,?,?,?,?)`, [
            idGasto, 
            req.body.conceptoGasto, req.body.fecha, currentTime(), req.body.monto, req.body.observacion
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

        let result = await conec.query('SELECT * FROM gasto WHERE idGasto  = ?', [
            req.query.idGasto
        ]);

        if (result.length > 0) {
            res.status(200).send(result[0]);
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
        await conec.execute(connection, `UPDATE gasto SET 
            conceptoGasto=?, fecha=?, hora=?, monto=?, observacion=?,
            WHERE idGasto=?`, [ 
            req.body.conceptoGasto, req.body.fecha, currentTime(), req.body.monto, req.body.observacion, 
            req.body.idGasto, 
            
        ])

        await conec.commit(connection)
        res.status(200).send('Los datos se actualizaron correctamente.')
    } catch (error) {
        if (connection != null) {
            conec.rollback(connection);
        }
        res.status(500).send("Se produjo un error de servidor, intente nuevamente.");
    }
});

module.exports = router;