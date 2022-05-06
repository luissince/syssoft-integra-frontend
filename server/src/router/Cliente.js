const express = require('express');
const router = express.Router();
const { currentDate, currentTime } = require('../tools/Tools');
const Conexion = require('../database/Conexion');
const conec = new Conexion()

router.get('/list', async function (req, res) {
    try {
        let lista = await conec.query(`SELECT 
        c.idCliente ,
        td.nombre as tipodocumento,
        c.documento,
        c.informacion,
        c.celular,
        c.telefono,
        c.direccion,
        c.estado
        FROM cliente AS c
        INNER JOIN tipoDocumento AS td ON td.idTipoDocumento = c.idTipoDocumento
        WHERE 
        ? = 0
        OR
        ? = 1 and c.documento like concat(?,'%')
        OR
        ? = 1 and c.informacion like concat(?,'%')
        ORDER BY c.fecha DESC, c.hora DESC
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
        FROM cliente AS c
        INNER JOIN tipoDocumento AS td ON td.idTipoDocumento = c.idTipoDocumento
        WHERE 
        ? = 0
        OR
        ? = 1 and c.documento like concat(?,'%')
        OR
        ? = 1 and c.informacion like concat(?,'%')`, [

            parseInt(req.query.opcion),

            parseInt(req.query.opcion),
            req.query.buscar,

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
            celular,
            telefono,
            fechaNacimiento,
            email, 
            genero, 
            direccion,
            idUbigeo, 
            estadoCivil,
            estado, 
            observacion,
            fecha,
            hora,
            idUsuario)
            VALUES(?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
            idCliente,
            req.body.idTipoDocumento,
            req.body.documento,
            req.body.informacion,
            req.body.celular,
            req.body.telefono,
            req.body.fechaNacimiento,
            req.body.email,
            req.body.genero,
            req.body.direccion,
            req.body.idUbigeo,
            req.body.estadoCivil,
            req.body.estado,
            req.body.observacion,
            currentDate(),
            currentTime(),
            req.body.idUsuario,
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
        cl.idCliente,
        cl.idTipoDocumento,
        cl.documento,
        cl.informacion,
        cl.celular,
        cl.telefono, 
        DATE_FORMAT(cl.fechaNacimiento,'%d/%m/%Y') as fecha,
        cl.email, 
        cl.genero,  
        cl.direccion,
        IFNULL(cl.idUbigeo,0) AS idUbigeo,
        IFNULL(u.ubigeo, '') AS ubigeo,
        IFNULL(u.departamento, '') AS departamento,
        IFNULL(u.provincia, '') AS provincia,
        IFNULL(u.distrito, '') AS distrito,
        cl.estadoCivil,
        cl.estado, 
        cl.observacion
        FROM cliente AS cl 
        LEFT JOIN ubigeo AS u ON u.idUbigeo = cl.idUbigeo
        WHERE 
        cl.idCliente = ?`, [
            req.query.idCliente,
        ]);

        if (result.length > 0) {
            res.status(200).send(result[0]);
        } else {
            console.log(result)
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
        celular=?,
        telefono=?,
        fechaNacimiento=?,
        email=?,
        genero=?, 
        direccion=?, 
        idUbigeo=?,
        estadoCivil=?, 
        estado=?,
        observacion=?,
        idUsuario=?
        WHERE idCliente=?`, [
            req.body.idTipoDocumento,
            req.body.documento,
            req.body.informacion,
            req.body.celular,
            req.body.telefono,
            req.body.fechaNacimiento,
            req.body.email,
            req.body.genero,
            req.body.direccion,
            req.body.idUbigeo,
            req.body.estadoCivil,
            req.body.estado,
            req.body.observacion,
            req.body.idUsuario,
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