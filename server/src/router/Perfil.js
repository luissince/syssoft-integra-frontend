const express = require('express');
const router = express.Router();
const { currentDate, currentTime } = require('../tools/Tools');
const Conexion = require('../database/Conexion');

const conec = new Conexion()

router.get('/list', async function (req, res) {
    try {
        let lista = await conec.query(`SELECT 
        p.idPerfil,
        s.nombreSede as empresa,
        p.descripcion,
        DATE_FORMAT(p.fecha,'%d/%m/%Y') as fecha,
        p.hora
        FROM perfil AS p 
        INNER JOIN sede AS s ON s.idSede = p.idSede 
        WHERE 
        ? = 0
        OR
        ? = 1 and p.descripcion like concat(?,'%')
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

        let total = await conec.query(`SELECT COUNT(*) AS Total 
        FROM perfil AS p 
        INNER JOIN sede AS s ON s.idSede = p.idSede 
        WHERE 
        ? = 0
        OR
        ? = 1 and p.descripcion like concat(?,'%')`, [

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

        let result = await conec.execute(connection, 'SELECT idPerfil FROM perfil');
        let idPerfil = "";
        if (result.length != 0) {

            let quitarValor = result.map(function (item) {
                return parseInt(item.idPerfil.replace("PF", ''));
            });

            let valorActual = Math.max(...quitarValor);
            let incremental = valorActual + 1;
            let codigoGenerado = "";
            if (incremental <= 9) {
                codigoGenerado = 'PF000' + incremental;
            } else if (incremental >= 10 && incremental <= 99) {
                codigoGenerado = 'PF00' + incremental;
            } else if (incremental >= 100 && incremental <= 999) {
                codigoGenerado = 'PF0' + incremental;
            } else {
                codigoGenerado = 'PF' + incremental;
            }

            idPerfil = codigoGenerado;
        } else {
            idPerfil = "PF0001";
        }

        await conec.execute(connection, `INSERT INTO perfil(idPerfil, idSede, descripcion, fecha, hora) VALUES(?,?,?,?,?)`, [
            idPerfil,
            req.body.idSede,
            req.body.descripcion,
            currentDate(),
            currentTime()
        ])

        let menus = await conec.execute(connection, `SELECT idMenu,nombre FROM menu`);
        for(let menu of menus) {
            await conec.execute(connection, `INSERT INTO permisomenu(idPerfil ,idMenu ,estado)values(?,?,?)`,[
                idPerfil,
                menu.idMenu,
                0
            ]);

            let submenus = await conec.execute(connection, `SELECT idSubMenu  FROM submenu WHERE idMenu = ?`,[
                menu.idMenu
            ]);

            for(let submenu of submenus) {
                await conec.execute(connection, `INSERT INTO permisosubmenu(idPerfil ,idMenu , idSubMenu ,estado)values(?,?,?,?)`,[
                    idPerfil,
                    menu.idMenu,
                    submenu.idSubMenu,
                    0
                ]);
            }
        }

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

        let result = await conec.query('SELECT * FROM perfil WHERE idPerfil  = ?', [
            req.query.idPerfil,
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

router.get('/listcombo', async function (req, res) {
    try {
        let result = await conec.query('SELECT idPerfil,descripcion FROM perfil');
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
});

router.post('/update', async function (req, res) {
    let connection = null;
    try {

        connection = await conec.beginTransaction();
        await conec.execute(connection, `UPDATE perfil SET idSede=?, descripcion=? WHERE idPerfil=?`, [
            req.body.idSede,
            req.body.descripcion,
            req.body.idPerfil
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