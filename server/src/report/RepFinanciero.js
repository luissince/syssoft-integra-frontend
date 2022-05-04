const path = require('path');
const PDFDocument = require("pdfkit-table");
const getStream = require('get-stream');
const { formatMoney, currentDate, numberFormat } = require('../tools/Tools');

class RepFinanciero {

    async repFiltroGastos(req, sedeInfo, data = '') {
        try {

            const doc = new PDFDocument({
                margins: {
                    top: 40,
                    bottom: 40,
                    left: 40,
                    right: 40
                }
            });

            let orgX = doc.x;
            let orgY = doc.y;
            let cabeceraY = orgY + 70;
            let filtroY = cabeceraY + 40;
            let bodY = filtroY + 55;
            let titleX = orgX + 150;
            // let footerY = bodY + 65;
            let medioX = (doc.page.width - doc.options.margins.left - doc.options.margins.right) / 2;
            //let tercioX = (doc.page.width - doc.options.margins.left - doc.options.margins.right) / 3;

            let h1 = 14;
            let h2 = 12;
            let h3 = 10;

            doc.image(path.join(__dirname, "..", "path/to/logo.png"), doc.x, doc.y, { width: 75 });

            doc.fontSize(h1).text(
                `${sedeInfo.nombreEmpresa}`,
                titleX,
                orgY,
                {
                    width: 250,
                    align: "center"
                }
            );

            doc.fontSize(h3).text(
                `RUC: ${sedeInfo.ruc}\n${sedeInfo.direccion}\nCelular: ${sedeInfo.celular} / Telefono: ${sedeInfo.telefono}`,
                titleX,
                orgY + 17,
                {
                    width: 250,
                    align: "center",
                }
            );

            doc.fontSize(h2).text(
                "REPORTE DE GASTOS",
                (doc.page.width - orgX - orgY) / 2,
                cabeceraY,
                {
                    width: 200,
                    align: "left",
                }
            );

            doc.fontSize(11).text(
                `PERIODO: ${req.query.fechaIni} al ${req.query.fechaIFin}`,
                orgX,
                cabeceraY + 25,
                {
                    width: 300,
                    align: "left",
                }
            );

            doc.rect(
                orgX, // EJE X
                filtroY, // EJE Y
                doc.page.width - doc.options.margins.left - doc.options.margins.right, // ANCHO
                40).stroke(); // ALTO

            // left
            doc.fontSize(h3).text(
                `Gasto(s): TODOS`,
                orgX + 5,
                filtroY + 6
            );
            doc.fontSize(h3).text(
                `Metodo de Pago(s): TODOS`,
                orgX + 5,
                filtroY + 24
            );

            // right
            doc.fontSize(h3).text(
                `Caja Banco(s): TODOS`,
                medioX + 15,
                filtroY + 6
            );
            doc.fontSize(h3).text(
                `Usuario(s): TODOS`,
                medioX + 15,
                filtroY + 24
            );

            let content = [["11-01-2022", "admin admin", "Caja 1", "Efectivo", "Ninguna", "S/ 10.00"]];
            content.push(["", "", "", "", "TOTAL", "S/ 20.00"]);

            //Tabla
            const table = {
                // title: "Detalle",
                subtitle: "DETALLE",
                headers: ["Fecha", "Usurio", "Cuenta Bancaria", "Metodo Pago", "Observación", "Importe"],
                rows: content
            };

            doc.table(table, {
                x: orgX,
                y: bodY,
                width: doc.page.width - doc.options.margins.left - doc.options.margins.right
            });

            doc.end();

            return getStream.buffer(doc);
        } catch (error) {
            return "Se genero un error al generar el reporte.";
        }
    }

    async repFiltroCobros(req, sedeInfo, data = '') {
        try {

            const doc = new PDFDocument({
                margins: {
                    top: 40,
                    bottom: 40,
                    left: 40,
                    right: 40
                }
            });

            let orgX = doc.x;
            let orgY = doc.y;
            let cabeceraY = orgY + 70;
            let filtroY = cabeceraY + 40;
            let bodY = filtroY + 55;
            let titleX = orgX + 150;
            let medioX = (doc.page.width - doc.options.margins.left - doc.options.margins.right) / 2;

            let h1 = 14;
            let h2 = 12;
            let h3 = 10;

            doc.image(path.join(__dirname, "..", "path/to/logo.png"), doc.x, doc.y, { width: 75 });

            doc.fontSize(h1).text(
                `${sedeInfo.nombreEmpresa}`,
                titleX,
                orgY,
                {
                    width: 250,
                    align: "center"
                }
            );

            doc.fontSize(h3).text(
                `RUC: ${sedeInfo.ruc}\n${sedeInfo.direccion}\nCelular: ${sedeInfo.celular} / Telefono: ${sedeInfo.telefono}`,
                titleX,
                orgY + 17,
                {
                    width: 250,
                    align: "center",
                }
            );

            doc.fontSize(h2).text(
                "REPORTE DE COBROS",
                (doc.page.width - orgX - orgY) / 2,
                cabeceraY,
                {
                    width: 200,
                    align: "left",
                }
            );

            doc.fontSize(11).text(
                `PERIODO: ${req.query.fechaIni} al ${req.query.fechaIFin}`,
                orgX,
                cabeceraY + 25,
                {
                    width: 300,
                    align: "left",
                }
            );

            doc.rect(
                orgX, // EJE X
                filtroY, // EJE Y
                doc.page.width - doc.options.margins.left - doc.options.margins.right, // ANCHO
                40).stroke(); // ALTO

            // left
            doc.fontSize(h3).text(
                `Cobros(s): TODOS`,
                orgX + 5,
                filtroY + 6
            );
            doc.fontSize(h3).text(
                `Metodo de Pago(s): TODOS`,
                orgX + 5,
                filtroY + 24
            );

            // right
            doc.fontSize(h3).text(
                `Caja Banco(s): TODOS`,
                medioX + 15,
                filtroY + 6
            );
            doc.fontSize(h3).text(
                `Usuario(s): TODOS`,
                medioX + 15,
                filtroY + 24
            );

            let content = [["11-01-2022", "publico general", "Caja 1", "Efectivo", "Ninguna", "S/ 10.00"]];
            content.push(["", "", "", "", "TOTAL", "S/ 20.00"]);

            //Tabla
            const table = {
                // title: "Detalle",
                subtitle: "DETALLE",
                headers: ["Fecha", "Cliente", "Cuenta Bancaria", "Metodo Pago", "Observación", "Importe"],
                rows: content
            };

            doc.table(table, {
                x: orgX,
                y: bodY,
                width: doc.page.width - doc.options.margins.left - doc.options.margins.right
            });

            doc.end();

            return getStream.buffer(doc);

        } catch (error) {
            return "Se genero un error al generar el reporte.";
        }
    }

    async repDetalleBanco(sedeInfo, data) {
    
        try {
            const cabecera = data.cabecera;

            const doc = new PDFDocument({
                margins: {
                    top: 40,
                    bottom: 40,
                    left: 40,
                    right: 40
                }
            });

            doc.info["Title"] = `REPORTE DE CAJA BANCO AL ${currentDate()}`

            let orgX = doc.x;
            let orgY = doc.y;
            let cabeceraY = orgY + 70;
            let filtroY = cabeceraY + 30;
            let bodY = filtroY + 55;
            let titleX = orgX + 150;
            let medioX = (doc.page.width - doc.options.margins.left - doc.options.margins.right) / 2;

            let h1 = 14;
            let h2 = 12;
            let h3 = 10;

            doc.image(path.join(__dirname, "..", "path/to/logo.png"), doc.x, doc.y, { width: 75 });

            doc.fontSize(h1).text(
                `${sedeInfo.nombreEmpresa}`,
                titleX,
                orgY,
                {
                    width: 250,
                    align: "center"
                }
            );

            doc.fontSize(h3).text(
                `RUC: ${sedeInfo.ruc}\n${sedeInfo.direccion}\nCelular: ${sedeInfo.celular} / Telefono: ${sedeInfo.telefono}`,
                titleX,
                orgY + 17,
                {
                    width: 250,
                    align: "center",
                }
            );

            doc.fontSize(h2).text(
                `REPORTE DE CAJA BANCO`,
                (doc.page.width - orgX - orgY) / 3,
                cabeceraY,
                {
                    width: 250,
                    align: "center",
                }
            );


            doc.rect(
                orgX, // EJE X
                filtroY, // EJE Y
                doc.page.width - doc.options.margins.left - doc.options.margins.right, // ANCHO
                40).stroke(); // ALTO

            // left
            doc.fontSize(h3).text(
                `Caja / Banco: ${cabecera.nombre}`,
                orgX + 5,
                filtroY + 6
            );
            doc.fontSize(h3).text(
                `Moneda: ${cabecera.moneda}`,
                orgX + 5,
                filtroY + 24
            );

            // right
            doc.fontSize(h3).text(
                `Tipo de cuenta: ${cabecera.tipoCuenta}`,
                medioX + 15,
                filtroY + 6
            );
            doc.fontSize(h3).text(
                `Saldo: ${numberFormat(cabecera.saldo, cabecera.codiso )}`,
                medioX + 15,
                filtroY + 24
            );

            let content = data.lista.map((item, index) => {

                let salida = item.salida <= 0 ? '' : `- ${item.salida}`;
                let ingreso = item.ingreso <= 0 ? '' : `+ ${item.ingreso}`;

                return [item.fecha, item.proveedor, item.cuenta, salida, ingreso]
            })
            
            // content.push(["", "", "", "TOTAL", "S/ 20.00"]);

            //Tabla
            const table = {
                // title: "Detalle",
                subtitle: "DETALLE DE OPERACIONES",
                headers: ["Fecha", "Proveedor", "Concepto", "Salidas", "Entradas"],
                rows: content
            };

            doc.table(table, {
                x: orgX,
                y: bodY,
                width: doc.page.width - doc.options.margins.left - doc.options.margins.right
            });

            doc.end();

            return getStream.buffer(doc);
        } catch (error) {
            console.log(error);
            return "Se genero un error al generar el reporte.";
        }
    }

}

module.exports = RepFinanciero;