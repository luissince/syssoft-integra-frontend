const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { currentDate, currentTime } = require('../tools/Tools');
const Conexion = require('../database/Conexion');

const conec = new Conexion()

router.get('/list', async function (req, res) {
    try {

        let lista = await conec.query(`SELECT 
        u.idUsuario,
        u.dni,
        u.nombres,
        u.apellidos,
        u.representante,
        p.descripcion AS perfil,
        u.estado
        FROM usuario AS u INNER JOIN perfil AS p
        ON u.idPerfil  = p.idPerfil
        WHERE 
        ? = 0
        OR
        ? = 1 and u.nombres like concat(?,'%')
        OR
        ? = 1 and u.apellidos like concat(?,'%')
        OR
        ? = 1 and u.dni like concat(?,'%')
        LIMIT ?,?`, [
            parseInt(req.query.opcion),

            parseInt(req.query.opcion),
            req.query.buscar,

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
        FROM usuario AS u INNER JOIN perfil AS p
        ON u.idPerfil  = p.idPerfil
        WHERE 
        ? = 0
        OR
        ? = 1 and u.nombres like concat(?,'%')
        OR
        ? = 1 and u.apellidos like concat(?,'%')
        OR
        ? = 1 and u.dni like concat(?,'%')`, [
            parseInt(req.query.opcion),

            parseInt(req.query.opcion),
            req.query.buscar,

            parseInt(req.query.opcion),
            req.query.buscar,

            parseInt(req.query.opcion),
            req.query.buscar,
        ]);

        res.status(200).send({ "result": resultLista, "total": total[0].Total });
    } catch (error) {
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

        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(req.body.clave, salt);

        let usuario = await conec.execute(connection, `SELECT * FROM usuario
        WHERE usuario = ?`, [
            req.body.usuario,
        ]);

        if (usuario.length > 0) {
            await conec.rollback(connection);
            res.status(400).send("Hay un usuario con el mismo valor.");
            return;
        }

        await conec.execute(connection, `INSERT INTO usuario(
            idUsuario, 
            nombres, 
            apellidos, 
            dni, 
            genero, 
            direccion, 
            telefono, 
            email,
            empresa, 
            idPerfil, 
            representante, 
            estado, 
            usuario, 
            clave,
            fecha,
            hora) 
            VALUES(?, ?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?)`, [
            idUsuario,
            req.body.nombres,
            req.body.apellidos,
            req.body.dni,
            req.body.genero,
            req.body.direccion,
            req.body.telefono,
            req.body.email,
            req.body.empresa,
            req.body.idPerfil,
            req.body.representante,
            req.body.estado,
            req.body.usuario,
            hash,
            currentDate(),
            currentTime(),
        ])

        await conec.commit(connection);
        res.status(200).send('Datos insertados correctamente')
    } catch (error) {
        if (connection != null) {
            await conec.rollback(connection);
        }
        res.status(500).send("Error de servidor");
    }
});

router.post('/update', async function (req, res) {
    let connection = null;
    try {

        connection = await conec.beginTransaction();

        let usuario = await conec.execute(connection, `SELECT * FROM usuario
        WHERE usuario = ? AND idUsuario <> ?`, [
            req.body.usuario,
            req.body.idUsuario
        ]);

        if (usuario.length > 0) {
            await conec.rollback(connection);
            res.status(400).send("Hay un usuario con el mismo valor.");
            return;
        }

        await conec.execute(connection, `UPDATE usuario SET 
            nombres=?, 
            apellidos=?, 
            dni=?, 
            genero=?, 
            direccion=?, 
            telefono=?, 
            email=?, 
            empresa=?, 
            idPerfil=?, 
            representante=?, 
            estado=?, 
            usuario=?,
            fecha=?,
            hora=?,
            WHERE idUsuario=?`, [
            req.body.nombres,
            req.body.apellidos,
            req.body.dni,
            req.body.genero,
            req.body.direccion,
            req.body.telefono,
            req.body.email,
            req.body.empresa,
            req.body.idPerfil,
            req.body.representante,
            req.body.estado,
            req.body.usuario,
            currentDate(),
            currentTime(),
            req.body.idUsuario
        ])

        await conec.commit(connection)
        res.status(200).send('Los datos se actualizaron correctamente.')
    } catch (error) {
        if (connection != null) {
            await conec.rollback(connection);
        }
        res.status(500).send("Se produjo un error de servidor, intente nuevamente.");
    }
});

router.post('/reset', async function (req, res) {
    let connection = null;
    try {
        connection = await conec.beginTransaction();

        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(req.body.clave, salt);

        await conec.execute(connection, `UPDATE usuario SET
        clave = ?
        WHERE idUsuario=?`, [
            hash,
            req.body.idUsuario
        ]);

        await conec.commit(connection)
        res.status(200).send('Se actualizó la contraseña correctamente.')
    } catch (error) {
        if (connection != null) {
            await conec.rollback(connection);
        }
        res.status(500).send("Se produjo un error de servidor, intente nuevamente.");
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
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
});


module.exports = router;