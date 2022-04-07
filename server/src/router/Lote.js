const express = require('express');
const router = express.Router();
const tools = require('../tools/Tools');
const Conexion = require('../database/Conexion');
const conec = new Conexion();

router.get('/list', async function (req, res) {
    try {
        let lista = await conec.query(`SELECT 
        *
        FROM lote         
        LIMIT ?,?`, [
            parseInt(req.query.posicionPagina),
            parseInt(req.query.filasPorPagina)
        ])

        let resultLista = lista.map(function (item, index) {
            return {
                ...item,
                id: (index + 1) + parseInt(req.query.posicionPagina)
            }
        });

        let total = await conec.query(`SELECT COUNT(*) AS Total FROM lote`);

        res.status(200).send({ "result": resultLista, "total": total[0].Total })

    } catch (error) {
        console.log(error)
        res.status(500).send("Error interno de conexión, intente nuevamente.")
    }
})

router.post('/add', async function (req, res) {
    let connection = null;
    try {
        connection = await conec.beginTransaction();

        let result = await conec.execute(connection, 'SELECT idLote FROM lote');
        let idLote = "";
        if (result.length != 0) {

            let quitarValor = result.map(function (item) {
                return parseInt(item.idLote.replace("LT", ''));
            });

            let valorActual = Math.max(...quitarValor);
            let incremental = valorActual + 1;
            let codigoGenerado = "";
            if (incremental <= 9) {
                codigoGenerado = 'LT000' + incremental;
            } else if (incremental >= 10 && incremental <= 99) {
                codigoGenerado = 'LT00' + incremental;
            } else if (incremental >= 100 && incremental <= 999) {
                codigoGenerado = 'LT0' + incremental;
            } else {
                codigoGenerado = 'LT' + incremental;
            }

            idLote = codigoGenerado;
        } else {
            idLote = "LT0001";
        }

        await conec.execute(connection, `INSERT INTO lote(
        idLote, 
        idManzana,
        descripcion,
        costo,
        precio,
        estado,
        medidaFrontal,
        costadoDerecho,
        costadoIzquierdo,
        medidaFondo,
        areaLote,
        numeroPartida,
        limiteFrontal,
        limiteDerecho,
        limiteIzquierdo,
        limitePosterior,
        ubicacionLote
        ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)        
        `, [
            idLote,
            req.body.idManzana,
            req.body.descripcion,
            req.body.costo,
            req.body.precio,
            req.body.estado,
            req.body.medidaFrontal,
            req.body.costadoDerecho,
            req.body.costadoIzquierdo,
            req.body.medidaFondo,
            req.body.areaLote,
            req.body.numeroPartida,
            req.body.limiteFrontal,
            req.body.limiteDerecho,
            req.body.limiteIzquierdo,
            req.body.limitePosterior,
            req.body.ubicacionLote,
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

router.get('/id', async function (req, res) {
    try {
        let result = await conec.query('SELECT * FROM lote WHERE idLote = ?', [
            req.query.idLote,
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

module.exports = router;