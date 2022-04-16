const express = require('express');
const router = express.Router();
const tools = require('../tools/Tools');
const Conexion = require('../database/Conexion');
const conec = new Conexion();

router.get('/list', async function (req, res) {

    try {
        let lista = await conec.query(`SELECT 
        b.idBanco, 
        b.nombre, 
        b.tipoCuenta,
        m.nombre as moneda,
        b.numCuenta,
        b.cci, 
        representante 
        FROM banco AS b INNER JOIN moneda AS m
        ON m.idMoneda = b.idMoneda 
        WHERE 
        ? = 0
        OR
        ? = 1 and b.nombre like concat(?,'%')
        OR
        ? = 1 and b.representante like concat(?,'%')
        LIMIT ?,?`, [
            parseInt(req.query.opcion),

            parseInt(req.query.opcion),
            req.query.buscar,

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

        let total = await conec.query(`SELECT COUNT(*) AS Total 
        FROM banco AS b INNER JOIN moneda AS m
        ON m.idMoneda = b.idMoneda 
        WHERE 
        ? = 0
        OR
        ? = 1 and b.nombre like concat(?,'%')
        OR
        ? = 1 and b.representante like concat(?,'%')`, [
            parseInt(req.query.opcion),

            parseInt(req.query.opcion),
            req.query.buscar,

            parseInt(req.query.opcion),
            req.query.buscar,
        ]);

        res.status(200).send({ "result": resultLista, "total": total[0].Total })

    } catch (error) {
        res.status(500).send("Error interno de conexión, intente nuevamente.")
    }
});

router.post('/add', async function (req, res) {
    let connection = null;
    try {
        connection = await conec.beginTransaction();

        let result = await conec.execute(connection, 'SELECT idBanco FROM banco');
        let idBanco = "";
        if (result.length != 0) {

            let quitarValor = result.map(function (item) {
                return parseInt(item.idBanco.replace("BC", ''));
            });

            let valorActual = Math.max(...quitarValor);
            let incremental = valorActual + 1;
            let codigoGenerado = "";
            if (incremental <= 9) {
                codigoGenerado = 'BC000' + incremental;
            } else if (incremental >= 10 && incremental <= 99) {
                codigoGenerado = 'BC00' + incremental;
            } else if (incremental >= 100 && incremental <= 999) {
                codigoGenerado = 'BC0' + incremental;
            } else {
                codigoGenerado = 'BC' + incremental;
            }

            idBanco = codigoGenerado;
        } else {
            idBanco = "BC0001";
        }

        await conec.execute(connection, 'INSERT INTO banco (idBanco ,nombre, tipoCuenta, idMoneda, numCuenta, cci, representante) values (?,?,?,?,?,?,?)', [
            idBanco,
            req.body.nombre,
            req.body.tipoCuenta,
            req.body.idMoneda,
            req.body.numCuenta,
            req.body.cci,
            req.body.representante
        ])

        await conec.commit(connection);
        res.status(200).send('Datos insertados correctamente')

    } catch (err) {
        if (connection != null) {
            conec.rollback(connection);
        }
        res.status(500).send(error);
    }
});

router.post('/update', async function (req, res) {

    let connection = null;

    try {

        connection = await conec.beginTransaction();
        await conec.execute(connection, 'UPDATE banco SET nombre=?, tipoCuenta=?, idMoneda=?, numCuenta=?, cci=?, representante=? where idBanco=?', [
            req.body.nombre,
            req.body.tipoCuenta,
            req.body.idMoneda,
            req.body.numCuenta,
            req.body.cci,
            req.body.representante,
            req.body.idBanco
        ])

        await conec.commit(connection)
        res.status(200).send('Datos actulizados correctamente')
        // console.log(req.body)

    } catch (error) {
        if (connection != null) {
            conec.rollback(connection);
        }
        res.status(500).send(error);
        // console.log(error)
    }
})

router.get('/id', async function (req, res) {

    try {
        let result = await conec.query('SELECT * FROM banco WHERE idBanco = ?', [
            req.query.idBanco,
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

router.get('/listcombo', async function (req, res) {
    try {
        let result = await conec.query('SELECT idBanco, nombre, tipoCuenta FROM banco');
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
});


module.exports = router;