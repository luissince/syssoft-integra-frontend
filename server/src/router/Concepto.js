const express = require('express');
const router = express.Router();
const { currentDate, currentTime } = require('../tools/Tools');
const Conexion = require('../database/Conexion');

const conec = new Conexion()

router.get('/list', async function (req, res) {
    try {
        let lista = await conec.query(`SELECT 
            idConcepto,
            nombre,
            tipoConcepto,
            DATE_FORMAT(fecha,'%d/%m/%Y') as fecha,
            hora 
            FROM concepto
            WHERE 
            ? = 0
            OR
            ? = 1 and nombre like concat(?,'%')
            LIMIT ?,?`, [
            parseInt(req.query.opcion),

            parseInt(req.query.opcion),
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

        let total = await conec.query(`SELECT COUNT(*) AS Total FROM concepto
            WHERE 
            ? = 0
            OR
            ? = 1 and nombre like concat(?,'%')`, [
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

        let result = await conec.execute(connection, 'SELECT idConcepto FROM concepto');
        let idConcepto = "";
        if (result.length != 0) {

            let quitarValor = result.map(function (item) {
                return parseInt(item.idConcepto.replace("CP", ''));
            });

            let valorActual = Math.max(...quitarValor);
            let incremental = valorActual + 1;
            let codigoGenerado = "";
            if (incremental <= 9) {
                codigoGenerado = 'CP000' + incremental;
            } else if (incremental >= 10 && incremental <= 99) {
                codigoGenerado = 'CP00' + incremental;
            } else if (incremental >= 100 && incremental <= 999) {
                codigoGenerado = 'CP0' + incremental;
            } else {
                codigoGenerado = 'CP' + incremental;
            }

            idConcepto = codigoGenerado;
        } else {
            idConcepto = "CP0001";
        }

        await conec.execute(connection, `INSERT INTO concepto(
            idConcepto, 
            nombre, tipoConcepto, fecha, hora) 
            VALUES(?,?,?,?,?)`, [
            idConcepto,
            req.body.nombre, req.body.tipoConcepto, currentDate(), currentTime()
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

        let result = await conec.query('SELECT * FROM concepto WHERE idConcepto  = ?', [
            req.query.idConcepto
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
        await conec.execute(connection, `UPDATE concepto SET 
            nombre=?, tipoConcepto=?
            WHERE idConcepto=?`, [
            req.body.nombre, req.body.tipoConcepto,
            req.body.idConcepto,

        ])

        await conec.commit(connection)
        res.status(200).send('Los datos se actualizarón correctamente.')
    } catch (error) {
        if (connection != null) {
            conec.rollback(connection);
        }
        res.status(500).send("Se produjo un error de servidor, intente nuevamente.");
    }
});

router.get('/listcombo', async function (req, res) {
    try {
        let result = await conec.query('SELECT idConcepto, nombre FROM concepto WHERE tipoConcepto = 2');
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
});

module.exports = router;
