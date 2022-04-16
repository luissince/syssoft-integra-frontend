const express = require('express');
const router = express.Router();
const { currentDate, currentTime } = require('../tools/Tools');
const Conexion = require('../database/Conexion');
const conec = new Conexion();

router.get("/list", async function (req, res) {
    try {
        let lista = await conec.query(`SELECT 
        idManzana,
        nombre,
        idProyecto,
        DATE_FORMAT(fecha,'%d/%m/%Y') as fecha,
        hora
        FROM manzana
        WHERE
        ? = 0
        OR
        ? = 1 AND nombre LIKE CONCAT(?,'%')
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

        let total = await conec.query(`SELECT COUNT(*) AS Total FROM manzana
        WHERE
        ? = 0
        OR
        ? = 1 AND nombre LIKE CONCAT(?,'%')`, [
            parseInt(req.query.opcion),

            parseInt(req.query.opcion),
            req.query.buscar,
        ]);

        res.status(200).send({ "result": resultLista, "total": total[0].Total })

    } catch (error) {
        res.status(500).send("Error interno de conexión, intente nuevamente.")
    }
});


router.get('/id', async function (req, res) {
    try {
        let result = await conec.query('SELECT * FROM manzana WHERE idManzana = ?', [
            req.query.idManzana,
        ]);

        if (result.length > 0) {
            res.status(200).send(result[0]);
        } else {
            res.status(400).send("Datos no encontrados");
        }

    } catch (error) {
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }

})

router.post("/add", async function (req, res) {
    let connection = null;
    try {
        connection = await conec.beginTransaction();

        let result = await conec.execute(connection, 'SELECT idManzana FROM manzana');
        let idManzana = "";
        if (result.length != 0) {

            let quitarValor = result.map(function (item) {
                return parseInt(item.idManzana.replace("MZ", ''));
            });

            let valorActual = Math.max(...quitarValor);
            let incremental = valorActual + 1;
            let codigoGenerado = "";
            if (incremental <= 9) {
                codigoGenerado = 'MZ000' + incremental;
            } else if (incremental >= 10 && incremental <= 99) {
                codigoGenerado = 'MZ00' + incremental;
            } else if (incremental >= 100 && incremental <= 999) {
                codigoGenerado = 'MZ0' + incremental;
            } else {
                codigoGenerado = 'MZ' + incremental;
            }

            idManzana = codigoGenerado;
        } else {
            idManzana = "MZ0001";
        }

        await conec.execute(connection, 'INSERT INTO manzana (idManzana ,nombre,idProyecto,fecha,hora) values (?,?,?,?,?)', [
            idManzana,
            req.body.nombre,
            req.body.idProyecto,
            currentDate(),
            currentTime()
        ])

        await conec.commit(connection);
        res.status(200).send('Datos insertados correctamente')
    } catch (error) {
        if (connection != null) {
            conec.rollback(connection);
        }
        res.status(500).send(error);
    }
});

router.post("/edit", async function (req, res) {
    let connection = null;
    try {
        connection = await conec.beginTransaction();

        await conec.execute(connection, `UPDATE manzana SET
        nombre = ?,
        idProyecto = ?
        WHERE idManzana  = ?`, [
            req.body.nombre,
            req.body.idProyecto,
            req.body.idManzana
        ])

        await conec.commit(connection);
        res.status(200).send('Datos actualizados correctamente')
    } catch (error) {
        if (connection != null) {
            conec.rollback(connection);
        }
        res.status(500).send(error);
    }
});


module.exports = router;