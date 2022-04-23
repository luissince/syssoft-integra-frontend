const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { createToken, verifyToken, token } = require('../services/Jwt');
const Conexion = require('../database/Conexion');
const conec = new Conexion();
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

router.get('/report/:version/:number', async function (req, res) {
    // Create a document
    const doc = new PDFDocument();
    doc.pipe(res);

    let lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam in suscipit purus.  Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vivamus nec hendrerit felis. Morbi aliquam facilisis risus eu lacinia. Sed eu leo in turpis fringilla hendrerit. Ut nec accumsan nisl.';

    doc.fontSize(8);
    doc.text(`This text is left aligned. ${lorem}`, {
        width: 410,
        align: 'left'
    }
    );

    let ypost = doc.y;

    doc.moveDown();
    doc.text(`This text is centered. ${lorem}`, {
        width: 410,
        align: 'center'
    }
    );

    doc.moveDown();
    doc.text(`This text is right aligned. ${lorem}`, {
        width: 410,
        align: 'right'
    }
    );

    doc.moveDown();
    doc.text(`This text is justified. ${lorem}`, {
        width: 410,
        align: 'justify'
    }
    );

    // draw bounding rectangle
    doc.rect(doc.x, ypost, 410, doc.y - ypost).stroke();

    let col1LeftPos = 50;
    let colTop = doc.y;
    let colWidth = 100;
    let col2LeftPos = colWidth + col1LeftPos + 40;

    doc.fontSize(16)
        .text('test col 1 test col 1 test col 1 test col 1 ', col1LeftPos, colTop, { width: colWidth })
        .text('test col 2 test col 2 test col 2 test col 2 ', col2LeftPos, colTop, { width: colWidth })

    // Pipe its output somewhere, like to a file or HTTP response
    // See below for browser usage
    // doc.pipe(fs.createWriteStream('output.pdf'));

    // Embed a font, set the font size, and render some text
    // doc
    //     .font('Courier')
    //     .fontSize(20)
    //     .text('Courier');
    // console.log(doc.y)
    // doc
    //     .font('Courier-Bold')
    //     .fontSize(20)
    //     .text('Courier-Bold', 10, doc.y);
    // console.log(doc.y)
    // doc
    //     .font('Courier-Oblique')
    //     .fontSize(20)
    //     .text('Courier-Oblique');
    // doc
    //     .font('Courier-BoldOblique')
    //     .fontSize(20)
    //     .text('Courier-BoldOblique');
    // doc
    //     .font('Helvetica')
    //     .fontSize(20)
    //     .text('Helvetica');



    // // Add an image, constrain it to a given size, and center it vertically and horizontally
    // doc.image(path.join(__dirname, "..", "path/to/ehil.png"), 0, doc.y, { width: 100, });
    // doc.image(path.join(__dirname, "..", "path/to/ehil.png"), 200, doc.y, { width: 100, });
    // doc.image(path.join(__dirname, "..", "path/to/ehil.png"), 200, doc.y, { width: 100, });
    // doc.image(path.join(__dirname, "..", "path/to/ehil.png"), 200, doc.y, { width: 100, });

    // let ypost = doc.y;

    // doc
    //     .font('Helvetica')
    //     .fontSize(20)
    //     .text('Helvetica');

    // doc.rect(doc.x, ypost, doc.page.width, doc.y).stroke();

    // doc
    //     .font('Helvetica')
    //     .fontSize(20)
    //     .text('Helvetica');


    // // Add another page
    // doc
    //     .addPage()
    //     .fontSize(25)
    //     .text('Here is some vector graphics...', 100, 100);

    // // Draw a triangle
    // doc
    //     .save()
    //     .moveTo(100, 150)
    //     .lineTo(100, 250)
    //     .lineTo(200, 250)
    //     .fill('#FF3300');

    // // Apply some transforms and render an SVG path with the 'even-odd' fill rule
    // doc
    //     .scale(0.6)
    //     .translate(470, -380)
    //     .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
    //     .fill('red', 'even-odd')
    //     .restore();

    // // Add some text with annotations
    // doc
    //     .addPage()
    //     .fillColor('blue')
    //     .text('Here is a link!', 100, 100)
    //     .underline(100, 100, 160, 27, { color: '#0000FF' })
    //     .link(100, 100, 160, 27, 'http://google.com/');

    // Finalize PDF file

    doc.end();

    // var data =fs.readFileSync('./public/modules/datacollectors/output.pdf');

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