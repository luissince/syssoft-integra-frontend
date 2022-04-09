const express = require('express');
const router = express.Router();
const tools = require('../tools/Tools');
const Conexion = require('../database/Conexion');

const conec = new Conexion()

router.get('/list', async function (req, res) {
    try {
        let lista = await conec.query(`SELECT * FROM usuario
            WHERE 
            ? = 0
            OR
            ? = 1 and nombres like concat(?,'%')
            OR
            ? = 1 and apellidos like concat(?,'%')
            OR
            ? = 1 and dni like concat(?,'%')
            LIMIT ?,?`, [
            parseInt(req.query.option),

            parseInt(req.query.option),
            req.query.buscar,
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

        let total = await conec.query(`SELECT COUNT(*) AS Total FROM usuario
            WHERE 
            ? = 0
            OR
            ? = 1 and nombres like concat(?,'%')
            OR
            ? = 1 and apellidos like concat(?,'%')
            OR
            ? = 1 and dni like concat(?,'%')`, [
            
            parseInt(req.query.option),

            parseInt(req.query.option),
            req.query.buscar,
            parseInt(req.query.option),
            req.query.buscar,
            parseInt(req.query.option),
            req.query.buscar,
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

        let result = await conec.execute(connection, 'SELECT idUsuario FROM usuario');
        let idUsuario = "";
        if (result.length != 0) {

            let quitarValor = result.map(function (item) {
                return parseInt(item.idUsuario.replace("US", ''));
            });

            let valorActual = Math.max(...quitarValor);
            let incremental = valorActual + 1;
            let codigoGenerado = "";
            if (incremental <= 9) {
                codigoGenerado = 'US000' + incremental;
            } else if (incremental >= 10 && incremental <= 99) {
                codigoGenerado = 'US00' + incremental;
            } else if (incremental >= 100 && incremental <= 999) {
                codigoGenerado = 'US0' + incremental;
            } else {
                codigoGenerado = 'US' + incremental;
            }

            idUsuario = codigoGenerado;
        } else {
            idUsuario = "US0001";
        }

        await conec.execute(connection, `INSERT INTO usuario(
            idUsuario, 
            nombres, apellidos, dni, genero, direccion, telefono, email,
            empresa, perfil, representante, estado, usuario, clave) 
            VALUES(?, ?,?,?,?,?,?,?, ?,?,?,?,?,?)`, [
            idUsuario, 
            req.body.nombres, req.body.apellidos, req.body.dni, req.body.genero, req.body.direccion, req.body.telefono, req.body.email, 
            req.body.empresa, req.body.perfil, req.body.representante, req.body.estado, req.body.usuario, req.body.clave
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

        let result = await conec.query('SELECT * FROM usuario WHERE idUsuario  = ?', [
            req.query.idUsuario
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
        await conec.execute(connection, `UPDATE usuario SET 
            nombres=?, apellidos=?, dni=?, genero=?, direccion=?, telefono=?, email=?, 
            empresa=?, perfil=?, representante=?, estado=?, usuario=?, clave=?
            WHERE idUsuario=?`, [ 
            req.body.nombres, req.body.apellidos, req.body.dni, req.body.genero, req.body.direccion, req.body.telefono, req.body.email, 
            req.body.empresa, req.body.perfil, req.body.representante, req.body.estado, req.body.usuario, req.body.clave, 
            req.body.idUsuario, 
            
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