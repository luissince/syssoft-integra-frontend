const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { createToken, verifyToken, token } = require('../services/Jwt');
const Conexion = require('../database/Conexion');
const conec = new Conexion();
const fs = require('fs');
const path = require('path');
const PDFDocument = require("pdfkit-table");

router.get('/report/:version/:number', async function (req, res) {
    // Create a document
    const doc = new PDFDocument({
        margins: {
            top: 72,
            bottom: 72,
            left: 72,
            right: 72
        }
    });

    doc.pipe(res);


    // Embed a font, set the font size, and render some text
    doc
        .font('Courier')
        .fontSize(20)
        .text('Courier');

    doc
        .font('Courier-Bold')
        .fontSize(20)
        .text('Courier-Bold', doc.options.margins.left, doc.y);

    doc
        .font('Courier-Oblique')
        .fontSize(20)
        .text('Courier-Oblique', doc.options.margins.left, doc.y + 20);
    doc
        .font('Courier-BoldOblique')
        .fontSize(20)
        .text('Courier-BoldOblique');
    doc
        .font('Helvetica')
        .fontSize(20)
        .text('Helvetica');



    // // Add an image, constrain it to a given size, and center it vertically and horizontally
    doc.image(path.join(__dirname, "..", "path/to/ehil.png"), doc.options.margins.left, doc.y, { width: 100, });
    doc.image(path.join(__dirname, "..", "path/to/ehil.png"), 200, doc.y, { width: 100, });
    // doc.image(path.join(__dirname, "..", "path/to/ehil.png"), 200, doc.y, { width: 100, });
    // doc.image(path.join(__dirname, "..", "path/to/ehil.png"), 200, doc.y, { width: 100, });

    let ypost = doc.y;

    doc
        .font('Helvetica', 0, ypost)
        .fontSize(20)
        .text('Helvetica');

    // requires 
    const table = {
        title: "Title",
        subtitle: "Subtitle",
        headers: ["Country", "Conversion rate", "Trend"],
        rows: [
            ["Switzerland", "12%", "+1.12%"],
            ["France", "67%", "-0.98%"],
            ["England", "33%", "+4.44%"],
        ],
    };
    doc.table(table, {
        // A4 595.28 x 841.89 (portrait) (about width sizes)
        width: doc.page.width,
        //columnsSize: [ 200, 100, 100 ],
    });


    let colTop = doc.y;

    doc.fontSize(16).text(
        "test col 1 test col 1 test col 1 test col 1",
        doc.options.margins.left,
        colTop,
        {
            width: 200
        });

    doc.fontSize(16).text(
        "test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2",
        doc.options.margins.left + 200,
        colTop,
        {
            width: 200
        });

    doc.fontSize(16).text(
        "test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2",
        doc.options.margins.left,
        doc.y);

    doc.fontSize(16).text(
        "test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2",
        doc.options.margins.left,
        doc.y);

    doc.fontSize(16).text(
        "test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2",
        doc.options.margins.left,
        doc.y);

    doc.fontSize(16).text(
        "test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2",
        doc.options.margins.left,
        doc.y);

    doc.fontSize(16).text(
        "test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2",
        doc.options.margins.left,
        doc.y);

    doc.fontSize(16).text(
        "test col 3 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2 test col 2",
        doc.options.margins.left,
        doc.y);


    doc.end();

    console.log(req.params);
    // res.send("ddata")
});



router.get('/createsession', async function (req, res) {
    try {

        let validate = await conec.query(`SELECT idUsuario ,clave FROM usuario 
        WHERE usuario = ?`, [
            req.query.usuario,
        ]);

        if (validate.length > 0) {

            let hash = bcrypt.compareSync(req.query.password, validate[0].clave);

            if (hash) {

                let usuario = await conec.query(`SELECT 
                idUsuario, 
                nombres,
                apellidos,
                idPerfil,
                estado
                FROM usuario
                WHERE idUsuario = ?`, [
                    validate[0].idUsuario
                ]);

                if (usuario[0].estado === 0) {
                    res.status(400).send("Su cuenta se encuentra inactiva.")
                    return;
                }

                let user = {
                    idUsuario: usuario[0].idUsuario,
                    nombres: usuario[0].nombres,
                    apellidos: usuario[0].apellidos,
                    estado: usuario[0].estado
                }

                let menu = await conec.query(`
                SELECT 
                m.idMenu,
                m.nombre,
                m.ruta,
                pm.estado,
                m.icon 
                FROM permisomenu as pm 
                INNER JOIN perfil as p on pm.idPerfil = p.idPerfil
                INNER JOIN menu as m on pm.idMenu = m.idMenu
                WHERE p.idPerfil = ?
                `, [
                    usuario[0].idPerfil,
                ]);

                let submenu = await conec.query(`
                SELECT 
                sm.idMenu,
                sm.idSubMenu,
                sm.nombre,
                sm.ruta,
                psm.estado
                FROM permisosubmenu as psm
                INNER JOIN perfil AS p ON psm.idPerfil = p.idPerfil
                INNER JOIN submenu AS sm on sm.idMenu = psm.idMenu and sm.idSubMenu = psm.idSubMenu
                WHERE psm.idPerfil = ?
                `, [
                    usuario[0].idPerfil,
                ]);

                const token = await createToken(user, 'userkeylogin');

                res.status(200).send({ ...user, token, menu, submenu })
            } else {
                res.status(400).send("Datos incorrectos, intente nuevamente.")
            }
        } else {
            res.status(400).send("Datos incorrectos, intente nuevamente.")
        }
    } catch (error) {
        res.status(500).send("Error interno de conexión, intente nuevamente.")
    }
});

router.get('/closesession', async function (req, res) {
    try {

    } catch (error) {

    }
});

router.get('/validtoken', token, async function (req, res) {
    try {

        await verifyToken(req.token, 'userkeylogin');

        res.status(200).send("Ok");
    } catch (error) {
        if (error == "expired") {
            res.status(403).send("Sesión expirada")
        } else {
            res.status(500).send("Error del servidor, intente nuevamente.")
        }
    }
});

// router.post("/list", verifyToken, async (req, res) => {
//     try {
//         let result = await new Promise((resolve, reject) => {
//             jwt.verify(req.token, 'secretkey', (error, authorization) => {
//                 if (error) {
//                     reject("expired");
//                 } else {
//                     resolve(authorization);
//                 }
//             });
//         });

//         res.status(200).send({ "data": { "ok": "data list" }, "authorization": result });

//     } catch (error) {
//         if (error == "expired") {
//             res.status(403).send("Sesión expirada")
//         } else {
//             res.status(500).send("Error del servidor, intente nuevamente.")
//         }
//     }
// });


module.exports = router;