const express = require('express');
const router = express.Router();
const tools = require('../tools/Tools');
const Conexion = require('../database/Conexion');
const conec = new Conexion();

router.get('/accesos', async function (req, res) {
    try {
        let menu = await conec.query(`
        SELECT 
        m.idMenu,
        m.nombre,
        pm.estado 
        FROM permisomenu as pm 
        INNER JOIN perfil as p on pm.idPerfil = p.idPerfil
        INNER JOIN menu as m on pm.idMenu = m.idMenu
        WHERE p.idPerfil = ?
        `, [
            req.query.idPerfil,
        ]);

        let submenu = await conec.query(`
        SELECT 
        sm.idMenu,
        sm.idSubMenu,
        sm.nombre,
        psm.estado
        FROM permisosubmenu as psm
        INNER JOIN perfil AS p ON psm.idPerfil = p.idPerfil
        INNER JOIN submenu AS sm on sm.idMenu = psm.idMenu and sm.idSubMenu = psm.idSubMenu
        WHERE psm.idPerfil = ?
        `, [
            req.query.idPerfil,
        ]);

        res.status(200).send({ "menu": menu, "submenu": submenu })
    } catch (error) {
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
});

router.post('/save', async function (req, res) {
    let connection = null;
    try {
        connection = await conec.beginTransaction();

        for (let menu of req.body.menu) {
            await conec.execute(connection, `UPDATE permisomenu 
            SET estado = ? 
            WHERE idPerfil  = ? AND idMenu = ?`, [
                menu.estado,
                req.body.idPerfil,
                menu.idMenu
            ]);
          
            for(let submenu of menu.submenu){
                await conec.execute(connection,`
                    UPDATE permisosubmenu 
                    SET estado = ?
                    WHERE idPerfil = ? AND idMenu = ? AND idSubMenu = ?
                `,[
                    submenu.estado,
                    req.body.idPerfil,
                    menu.idMenu,
                    submenu.idSubMenu
                ]);
            }
        }

        await conec.commit(connection);
        res.status(200).send('Datos insertados correctamente')
    } catch (error) {
        if (connection != null) {
            conec.rollback(connection);
        }
        res.status(500).send(error);
    }
});

module.exports = router;