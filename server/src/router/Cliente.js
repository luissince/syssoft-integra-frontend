const express = require('express');
const router = express.Router();
const tools = require('../tools/Tools');
const Conexion = require('../database/Conexion');

const conec = new Conexion()

router.get('/list', async function (req, res) {
    try {
        let lista = await conec.query(`SELECT * FROM cliente 
            WHERE 
            ? = 0
            OR
            ? = 1 and documento like concat(?,'%')
            OR
            ? = 1 and informacion like concat(?,'%')
            LIMIT ?,?`, [
            parseInt(req.query.option),

            parseInt(req.query.option),
            req.query.buscar,

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

        let total = await conec.query(`SELECT COUNT(*) AS Total FROM cliente
        WHERE 
        ? = 0
        OR
        ? = 1 and documento like concat(?,'%')
        OR
        ? = 1 and informacion like concat(?,'%')`, [

            parseInt(req.query.option),

            parseInt(req.query.option),
            req.query.buscar,

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

        let result = await conec.execute(connection, 'SELECT idCliente FROM cliente');
        let idCliente = "";
        if (result.length != 0) {

            let quitarValor = result.map(function (item) {
                return parseInt(item.idCliente.replace("CL", ''));
            });

            let valorActual = Math.max(...quitarValor);
            let incremental = valorActual + 1;
            let codigoGenerado = "";
            if (incremental <= 9) {
                codigoGenerado = 'CL000' + incremental;
            } else if (incremental >= 10 && incremental <= 99) {
                codigoGenerado = 'CL00' + incremental;
            } else if (incremental >= 100 && incremental <= 999) {
                codigoGenerado = 'CL0' + incremental;
            } else {
                codigoGenerado = 'CL' + incremental;
            }

            idCliente = codigoGenerado;
        } else {
            idCliente = "CL0001";
        }

        await conec.execute(connection, `INSERT INTO cliente(
            idCliente, 
            idTipoDocumento,
            documento,
            informacion,
            telefono,
            fechaNacimiento,
            email, 
            genero, 
            direccion,
            ubigeo, 
            estadoCivil,
            estado, 
            observacion)
            VALUES(?, ?,?,?,?,?,?,?, ?,?,?,?,?)`, [
            idCliente,
            req.body.idTipoDocumento,
            req.body.documento,
            req.body.informacion,
            req.body.telefono,
            req.body.fechaNacimiento,
            req.body.email,
            req.body.genero,
            req.body.direccion,
            req.body.ubigeo,
            req.body.estadoCivil,
            req.body.estado,
            req.body.observacion
        ])

        await conec.commit(connection);
        res.status(200).send('Datos insertados correctamente')
    } catch (error) {
        if (connection != null) {
            conec.rollback(connection);
        }
        res.status(500).send("Se produjo un error de servidor, intente nuevamente.");
        console.log(error)
    }
});

router.get('/id', async function (req, res) {
    try {

        let result = await conec.query(`SELECT 
        idCliente,
        idTipoDocumento,
        documento,
        informacion,
        telefono, 
        fechaNacimiento,
        email, 
        genero,  
        direccion,
        ubigeo,
        estadoCivil,
        estado, 
        observacion
        FROM cliente WHERE idCliente  = ?`, [
            req.query.idCliente,
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
        await conec.execute(connection, `UPDATE cliente SET
        idTipoDocumento=?, 
        documento=?,
        informacion=?, 
        telefono=?,
        fechaNacimiento=?,
        email=?,
        genero=?, 
        direccion=?, 
        ubigeo=?,
        estadoCivil=?, 
        estado=?,
        observacion=?
        WHERE idCliente=?`, [
            req.body.idTipoDocumento,
            req.body.documento,
            req.body.informacion,
            req.body.telefono,
            req.body.fechaNacimiento,
            req.body.email,
            req.body.genero,
            req.body.direccion,
            req.body.ubigeo,
            req.body.estadoCivil,
            req.body.estado,
            req.body.observacion,
            req.body.idCliente
        ])

        await conec.commit(connection)
        res.status(200).send('Los datos se actualizaron correctamente.')
    } catch (error) {
        if (connection != null) {
            conec.rollback(connection);
        }
        res.status(500).send("Se produjo un error de servidor, intente nuevamente.");
        console.log(error)
    }
});

router.get('/listcombo', async function (req, res) {
    try {
        let result = await conec.query('SELECT idCliente, documento, informacion FROM cliente');
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
});

module.exports = router;