const express = require('express');
const router = express.Router();
const { currentDate, currentTime } = require('../tools/Tools');
const Conexion = require('../database/Conexion');
const conec = new Conexion();

router.get("/list", async function (req, res) {
    try {
        let lista = await conec.query(`SELECT 
        m.idManzana,
        m.nombre,
        p.nombre as proyecto,
        DATE_FORMAT(m.fecha,'%d/%m/%Y') as fecha,
        m.hora
        FROM manzana AS m INNER JOIN proyecto AS p
        ON m.idProyecto = p.idProyecto
        WHERE
        ? = 0 AND p.idProyecto = ?
        OR
        ? = 1 AND p.idProyecto = ? AND m.nombre LIKE CONCAT(?,'%')
        LIMIT ?,?`, [
            parseInt(req.query.opcion),
            req.query.idProyecto,

            parseInt(req.query.opcion),
            req.query.idProyecto,
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
        FROM manzana AS m INNER JOIN proyecto AS p
        ON m.idProyecto = p.idProyecto
        WHERE
        ? = 0 AND p.idProyecto = ?
        OR
        ? = 1 AND p.idProyecto = ? AND m.nombre LIKE CONCAT(?,'%')`, [
            parseInt(req.query.opcion),
            req.query.idProyecto,

            parseInt(req.query.opcion),
            req.query.idProyecto,
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

router.post("/", async function (req, res) {
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

        await conec.execute(connection, 'INSERT INTO manzana (idManzana,nombre,idProyecto,fecha,hora) values (?,?,?,?,?)', [
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
            await conec.rollback(connection);
        }
        res.status(500).send(error);
    }
});

router.put("/", async function (req, res) {
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
            await conec.rollback(connection);
        }
        res.status(500).send(error);
    }
});

router.delete('/', async function (req, res) {
    let connection = null;
    try {
        connection = await conec.beginTransaction();

        let lote = await conec.execute(connection, `SELECT * FROM lote WHERE idManzana = ?`, [
            req.query.idManzana
        ]);

        if (lote.length > 0) {
            await conec.rollback(connection);
            res.status(400).send('No se puede eliminar la manzana ya que esta ligada a un lote.')
            return;
        }

        await conec.execute(connection, `DELETE FROM manzana WHERE idManzana  = ?`, [
            req.query.idManzana
        ]);

        await conec.commit(connection)
        res.status(200).send('Se eliminó correctamente la manzana.')
    } catch (error) {
        if (connection != null) {
            await conec.rollback(connection);
        }
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
});

router.get('/listcombo', async function (req, res) {
    try {
        let result = await conec.query('SELECT idManzana ,nombre FROM manzana');
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
});


module.exports = router;