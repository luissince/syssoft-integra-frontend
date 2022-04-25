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
            top: 40,
            bottom: 40,
            left: 40,
            right: 40
        }
    });

    doc.pipe(res);
    let colTop = doc.y;

    doc.image(path.join(__dirname, "..", "path/to/ehil.png"), doc.x, doc.y, { width: 50, });

    doc.fontSize(10).text(
        "APPLE GYM PERÚ",
        doc.options.margins.left,
        doc.y + 10
    );

    doc.fontSize(8).text(
        `CALLE CENTENARIO Nro 156\nLA MOLINA\nLIMA`,
        doc.options.margins.left,
        doc.y + 5
    );

    let postDireccion = doc.y;

    doc.fontSize(12).text(
        "RUC: 20100047218\nBOLETA DE VENTA ELECTRÓNICA\nB0001-895653",
        doc.page.width - 150 - doc.options.margins.right,
        colTop + 10,
        {
            width: 140,
            align: "center",
        }
    );

    doc.rect(
        doc.page.width - 150 - doc.options.margins.right, // EJE X
        colTop, // EJE Y
        140, // ANCHO
        70).stroke(); // ALTO

    doc.fontSize(8).text(
        "Fecha de emisión:",
        doc.page.width - 150 - doc.options.margins.right,
        doc.y + 10
    );

    doc.fontSize(10).text(
        "INFORMACIÓN DEL CLIENTE",
        doc.options.margins.top,
        postDireccion + 10
    )

    doc.rect(
        doc.x, // EJE X
        doc.y, // EJE Y
        doc.page.width - doc.options.margins.left - doc.options.margins.right, // ANCHO
        45).stroke(); // ALTO

    doc.fontSize(8).text(
        "Nombre: \nTipo de documento: \nNúmero de documento: \nDirección: ",
        doc.options.margins.top + 5,
        doc.y + 5
    )

    doc.fontSize(10).text(
        "INFORMACIÓN DEL PRODUCTO",
        doc.options.margins.top,
        doc.y + 15
    )

    doc.rect(
        doc.x, // EJE X
        doc.y, // EJE Y
        doc.page.width - doc.options.margins.left - doc.options.margins.right, // ANCHO
        45).stroke(); // ALTO

    doc.fontSize(8).text(
        "Familia de Producto: \nDescripción del Producto: \nNúmero de Contrato y/o Préstamo: \nMoneda: ",
        doc.options.margins.top + 5,
        doc.y + 5
    )

    const table = {
        title: "Detalle",
        subtitle: "Subtitle",
        headers: ["Código de producto SUNAT", "Unidad de medida", "Cant.", "Descripción", "Valor Unitario", "Precio de Venta"],
        rows: [
            ["84121501", "ZZ", "CONCEPTO DE PAGO: COM.OP OTRA LINEA", "5.00", "5.00"]
        ],
    };

    doc.table(table, {
        x: doc.x,
        y: doc.y + 20,
        width: doc.page.width - doc.options.margins.left - doc.options.margins.right
    });

    doc.fontSize(8).text(
        "Descuentos: \nValor de Venta Operaciones Gravadas: \nValor de Venta Operaciones Gratuitas: ",
        doc.x + 300,
        doc.yn
    )

    /* console.log(doc.x)
    console.log(doc.y)

    doc.pipe(res);

    let colTop = doc.y;

    doc.image(path.join(__dirname, "..", "path/to/ehil.png"), doc.x, colTop, { width: 50, });

    let ypostimage = doc.y;

    doc.fontSize(12).text(
        "APPLE GYM PERÚ",
        doc.options.margins.left + 170,        
        colTop
    );
    

    doc.moveDown();
    doc.fontSize(10).text(
        "AV. LAS CALLES DEL MAR NRO 100 064 1231546546 213154654",
        doc.options.margins.left + 140,
        colTop + 15
    );

    doc.moveDown();
    doc.fontSize(10).text(
        "064 1231546546 213154654",
        doc.options.margins.left + 162,
        colTop + 30
    );

    doc.fontSize(10).text(
        `RUC: 456789123120\nBOLETA\nB0001-895653`,
        doc.page.width - 140 - doc.options.margins.right,
        colTop+10
        , {
            width: 140,
            align: "center",
        });


    // doc.rect(
    //     doc.options.margins.left + 350,
    //     doc.options.margins.top-10,
    //     140,
    //     50).stroke();

        doc.rect(
            doc.page.width - 140 - doc.options.margins.right,
            doc.options.margins.top,
            140,
            50).stroke();

    // doc.rect(xleft3-30, doc.options.margins.top-10, 140, 60).stroke();

    doc.x = doc.options.margins.left;

    doc.moveDown();

    const table = {
        title: "Detalle",
        subtitle: "Subtitle",
        headers: ["#", "CONCEPTO", "CANTIDAD", "PRECIO", "UNITARIO", "DESCUENTO", "IMPORTE"],
        rows: [
            ["1", "PLAN REGULAR - 3 MESES", "1.00", "210.00", "0.00", "210.00"],
            ["2", "INSCRIPCIÓN", "10.00", "10.00", "0.00", "10.00"]
        ],
    };

    console.log(doc.page.width)

    doc.table(table, {
        x: 0,
        y: ypostimage + 20,
        width: doc.page.width - doc.options.margins.left - doc.options.margins.right
    });

    doc.fontSize(12).text(
        "IMPORTE BRUTO: ",
        doc.x,
        doc.y + 10
    );

    doc.fontSize(12).text(
        "DESCUENTO: ",
        doc.options.margins.left + 300,
        doc.y
    );

    doc.fontSize(12).text(
        "IMPORTE NETO: ",
        doc.options.margins.left + 300,
        doc.y
    );

    const table1 = {
        title: "PAGOS ASOCIADOS",
        subtitle: "Subtitle",
        headers: ["#", "TRANSACCIÓN", "CONCEPTO", "FECHA PAGO", "IMPORTE"],
        rows: [
            ["1", "N° 2736 VENTAS", "INGRESO DEL COMPROBANTE B001-4102", "23/04/2022 08:09:47", "220.00"]
        ],
    };

    doc.table(table1, {
        width: doc.page.width
    });

    doc.fontSize(14).text(
        "TERMINOS Y CONDICIONES",
        doc.options.margins.left,
        doc.y
    );

    doc.fontSize(14).text(
        "NO HAY NINGÚN TIPO DE REEMBOLSO POR POLÍTICAS DE LA EMPRESA.",
        doc.options.margins.left,
        doc.y
    ); */

    doc.end();

    console.log(req.params);
    // res.send("ddata")
});

router.get('/report/cuotas', async function (req, res) {
    const doc = new PDFDocument({
        margins: {
            top: 40,
            bottom: 40,
            left: 40,
            right: 40
        }
    });

    doc.pipe(res);

    let orgX = doc.x;
    let orgY = doc.y;

    let h1 = 14;
    let h2 = 12;
    let h3 = 10;
    let h4 = 8;

    doc.image(path.join(__dirname, "..", "path/to/ehil.png"), doc.x, doc.y, { width: 50, });

    let postImgY = doc.y;

    doc.fontSize(h1).text(
        "EMPRESA INMOBILIARIA DEMO SAC",
        orgX + 150,
        orgY,
        {
            width: 250,
            align: "center"
        }
    );

    let titX = doc.x;
   
    doc.fontSize(h3).text(
        "RUC: 20151615314\nJR. LIMA 1465 - PUNTA HERMOSA\nTeléfono: 54574355",
        doc.x,
        doc.y,
        {
            width: 250,
            align: "center",
        }
    );

    doc.fontSize(h2).text(
        "RESIDENCIAL VILLA SAN JUAN",
        titX,
        postImgY + 10,
        {
            width: 250,
            align: "center",
        }
    );

    /* doc.fontSize(h2).text(
        "Cliente:",
        doc.x,
        doc.y
    ); */

    doc.fontSize(h2).text(
        "Cliente:\nLote:\nCrédito:\nN° Cuotas:",
        orgX,
        doc.y + 5
    );

    doc.fontSize(h2).text(
        "CRONOGRAMA DE PAGOS MENSUALES VENTA AL CRÉDITO",
        titX,
        doc.y + 5,
        {
            width: 250,
            align: "center",
        }
    ); 

    const table1 = {
        //title: "CRONOGRAMA DE PAGOS MENSUALES VENTA AL CRÉDITO",
        //subtitle: "",
        headers: ["#", "TRANSACCIÓN", "CONCEPTO", "FECHA PAGO", "IMPORTE"],
        rows: [
            ["1", "N° 2736 VENTAS", "INGRESO DEL COMPROBANTE B001-4102", "23/04/2022 08:09:47", "220.00"]
        ],
    };

    doc.table(table1, {
        width: doc.page.width - doc.options.margins.left - doc.options.margins.right,
        x: orgX,
        y: doc.y + 10, 
    });

    doc.end();
});

router.get('/report/lote', async function (req, res){
    const doc = new PDFDocument({
        margins: {
            top: 40,
            bottom: 40,
            left: 40,
            right: 40
        }
    });

    doc.pipe(res);

    let orgX = doc.x;
    let orgY = doc.y;

    let h1 = 14;
    let h2 = 12;
    let h3 = 10;
    let h4 = 8;

    doc.image(path.join(__dirname, "..", "path/to/ehil.png"), doc.x, doc.y, { width: 50, });

    let postImgY = doc.y;

    doc.fontSize(h1).text(
        "EMPRESA INMOBILIARIA DEMO SAC",
        orgX + 150,
        orgY,
        {
            width: 250,
            align: "center"
        }
    );

    let titX = doc.x;
   
    doc.fontSize(h3).text(
        "RUC: 20151615314\nJR. LIMA 1465 - PUNTA HERMOSA\nTeléfono: 54574355",
        doc.x,
        doc.y,
        {
            width: 250,
            align: "center",
        }
    );

    doc.fontSize(h2).text(
        "LOTES DETALLE",
        titX,
        postImgY + 10,
        {
            width: 250,
            align: "center",
        }
    );

    doc.fontSize(h2).text(
        "COMPROBANTE",
        orgX,
        doc.y
    )

    doc.fontSize(h3).text(
        "Cliente:\nFecha:\nNotas:\nForma de venta:\nEstado:\nTotal:\nArchivos adjuntos:",
        orgX,
        doc.y + 5
    );

    let colY = doc.y + 10;

    doc.fontSize(h2).text(
        "DESCRIPCIÓN",
        orgX,
        colY
    );

    doc.fontSize(h3).text(
        "Manzana:\nLote:\nDescripción:\nCosto:\nPrecio:\nEstado:",
        orgX,
        doc.y + 5
    );

    let afterInfoY = doc.y;

    doc.fontSize(h2).text(
        "MEDIDAS",
        orgX + 170,
        colY
    );

    doc.fontSize(h3).text(
        "Medida Frontal:\nCoste Derecho:\nCoste Izquierdo:\nMedida Fondo:\nArea Lote:\nN° Partida:",
        orgX + 170,
        doc.y + 5
    );

    doc.fontSize(h2).text(
        "LÍMITE",
        orgX + 340,
        colY
    );

    doc.fontSize(h3).text(
        "Limite, Frontal / Norte / Noroeste:\nLímite, Derecho / Este / Sureste:\nLímite, Iquierdo / Sur / Sureste:\nLímite, Posterior / Oeste / Noroeste:\nUbicación del Lote:\n",
        orgX + 340,
        doc.y + 5
    );

    doc.fontSize(h2).text(
        "CRONOGRAMA DE PAGOS MENSUALES VENTA AL CRÉDITO",
        titX,
        afterInfoY + 10,
        {
            width: 250,
            align: "center",
        }
    ); 

    const table1 = {
        //title: "CRONOGRAMA DE PAGOS MENSUALES VENTA AL CRÉDITO",
        //subtitle: "",
        headers: ["Concepto", "Monto", "Método", "Banco", "Fecha"],
        rows: [
            ["1", "N° 2736 VENTAS", "INGRESO DEL COMPROBANTE B001-4102", "23/04/2022 08:09:47", "220.00"]
        ],
    };

    doc.table(table1, {
        width: doc.page.width - doc.options.margins.left - doc.options.margins.right,
        x: orgX,
        y: doc.y + 10, 
    });


    doc.end();
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