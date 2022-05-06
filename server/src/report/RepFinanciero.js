const path = require('path');
const PDFDocument = require("pdfkit-table");
const getStream = require('get-stream');
const { dateFormat, numberFormat, currentDate } = require('../tools/Tools');

class RepFinanciero {

    async repFiltroCobros(req, sedeInfo, data) {
        try {
            const doc = new PDFDocument({
                margins: {
                    top: 40,
                    bottom: 40,
                    left: 40,
                    right: 40
                }
            });

            doc.info["Title"] = `REPORTE DE COBROS DEL ${req.query.fechaIni} AL ${req.query.fechaFin}`

            let orgX = doc.x;
            let orgY = doc.y;
            let cabeceraY = orgY + 70;
            let filtroY = cabeceraY + 40;
            let bodY = filtroY + 40;
            let titleX = orgX + 150;
            // let footerY = bodY + 65;
            let medioX = (doc.page.width - doc.options.margins.left - doc.options.margins.right) / 2;
            let widthContent = doc.page.width - doc.options.margins.left - doc.options.margins.right;

            let h1 = 13;
            let h2 = 11;
            let h3 = 9;

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
                doc.options.margins.left,
                cabeceraY,
                {
                    width: widthContent,
                    align: "center",
                }
            );

            doc.fontSize(h3).text(
                `PERIODO: ${dateFormat(req.query.fechaIni)} al ${dateFormat(req.query.fechaFin)}`,
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
                20).stroke(); // ALTO

            // left
            doc.fontSize(h3).text(
                `Cliente(s): ${req.query.idCliente === 0 ? 'TODOS' : req.query.cliente}`,
                orgX + 5,
                filtroY + 6
            );

            // right
            doc.fontSize(h3).text(
                `Caja Banco(s): ${req.query.idBanco === 0 ? 'TODOS' : req.query.banco}`,
                medioX + 15,
                filtroY + 6
            );

            let total = 0;

            let content = data.map((item, index) => {

                let metodoPago = item.metodoPago === 1 ? 'Efectivo'
                    : item.metodoPago === 2 ? 'Consignación'
                        : item.metodoPago === 3 ? 'Transferencia'
                            : item.metodoPago === 4 ? 'Cheque'
                                : item.metodoPago === 5 ? 'Tarjeta crédito' : 'Tarjeta débito'

                total += item.monto;

                return [
                    item.fecha + '\n' + item.hora,
                    item.comprobante + '\n' + item.serie + '-' + item.numeracion,
                    item.docCliente + '\n' + item.cliente,
                    item.banco,
                    metodoPago,
                    numberFormat(item.monto, item.codiso)
                ]
            })

            //Tabla
            const table = {
                // title: "Detalle",
                subtitle: "DETALLE",
                headers: ["Fecha", "Comprobante", "Cliente", "Cuenta Bancaria", "Metodo Pago", "Importe"],
                rows: content
            };

            doc.table(table, {
                prepareHeader: () => doc.font("Helvetica-Bold").fontSize(h3),
                prepareRow: () => {
                    doc.font("Helvetica").fontSize(h3);
                },
                padding: 5,
                columnSpacing: 5,
                columnsSize: [80, 102, 80, 90, 90, 90],
                x: orgX,
                y: bodY,
                width: doc.page.width - doc.options.margins.left - doc.options.margins.right
            });

            let ypost = doc.y + 5;
            doc.fontSize(h3);

            let nameContado = "TOTAL DE INGRESOS:";
            let widthNameContado = doc.widthOfString(nameContado);

            let totalContado = numberFormat(total);

            let widthTotalContado = doc.widthOfString(totalContado);

            doc.text(nameContado,
                doc.page.width - doc.options.margins.right - widthNameContado - widthTotalContado - 20,
                ypost, {
                width: widthNameContado + 10,
                align: "right",
            });

            doc.text(totalContado,
                doc.page.width - doc.options.margins.right - widthTotalContado,
                ypost, {
                width: widthTotalContado,
                stroke: "black",
                align: "right",
            });

            doc.end();

            return getStream.buffer(doc);

        } catch (error) {
            return "Se genero un error al generar el reporte.";
        }
    }

    async repFiltroGastos(req, sedeInfo, data) {
        try {

            const doc = new PDFDocument({
                margins: {
                    top: 40,
                    bottom: 40,
                    left: 40,
                    right: 40
                }
            });

            doc.info["Title"] = `REPORTE DE GASTOS DEL ${req.query.fechaIni} AL ${req.query.fechaFin}`

            let orgX = doc.x;
            let orgY = doc.y;
            let cabeceraY = orgY + 70;
            let filtroY = cabeceraY + 40;
            let bodY = filtroY + 40;
            let titleX = orgX + 150;
            // let footerY = bodY + 65;
            let medioX = (doc.page.width - doc.options.margins.left - doc.options.margins.right) / 2;
            let widthContent = doc.page.width - doc.options.margins.left - doc.options.margins.right;

            let h1 = 13;
            let h2 = 11;
            let h3 = 9;

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
                doc.page.margins.left,
                cabeceraY,
                {
                    width: widthContent,
                    align: "center",
                }
            );


            doc.fontSize(h3).text(
                `PERIODO: ${dateFormat(req.query.fechaIni)} al ${dateFormat(req.query.fechaFin)}`,
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
                20).stroke(); // ALTO

            // left
            doc.fontSize(h3).text(
                `Usuario(s): ${req.query.idUsuario === 0 ? 'TODOS' : req.query.usuario}`,
                orgX + 5,
                filtroY + 6
            );

            // right
            doc.fontSize(h3).text(
                `Caja / Banco(s): ${req.query.idBanco === 0 ? 'TODOS' : req.query.banco}`,
                medioX + 15,
                filtroY + 6
            );

            let total = 0;

            let content = data.map((item, index) => {

                let metodoPago = item.metodoPago === 1 ? 'Efectivo'
                    : item.metodoPago === 2 ? 'Consignación'
                        : item.metodoPago === 3 ? 'Transferencia'
                            : item.metodoPago === 4 ? 'Cheque'
                                : item.metodoPago === 5 ? 'Tarjeta crédito' : 'Tarjeta débito'

                total = total + item.monto;

                return [
                    item.fecha,
                    item.comprobante+"\n"+ item.serie+"-"+ item.numeracion,
                    item.usuario,
                    item.banco,
                    metodoPago,
                    numberFormat(item.monto, item.codiso)
                ]
            })

            // content.push(["", "", "", "", "TOTAL", total]);

            //Tabla
            const table = {
                // title: "Detalle",
                subtitle: "DETALLE",
                headers: ["Fecha", "Comprobante", "Usuario", "Cuenta Bancaria", "Metodo Pago",  "Importe"],
                rows: content
            };

            doc.table(table, {
                prepareHeader: () => doc.font("Helvetica-Bold").fontSize(h3),
                prepareRow: () => {
                    doc.font("Helvetica").fontSize(h3);
                },
                padding: 5,
                columnSpacing: 5,
                columnsSize: [80, 102, 80, 90, 90, 90],
                x: orgX,
                y: bodY,
                width: doc.page.width - doc.options.margins.left - doc.options.margins.right
            });

            let ypost = doc.y + 5;
            doc.fontSize(h3);

            let nameContado = "TOTAL DE INGRESOS:";
            let widthNameContado = doc.widthOfString(nameContado);

            let totalContado = numberFormat(total);

            let widthTotalContado = doc.widthOfString(totalContado);

            doc.text(nameContado,
                doc.page.width - doc.options.margins.right - widthNameContado - widthTotalContado - 20,
                ypost, {
                width: widthNameContado + 10,
                align: "right",
            });

            doc.text(totalContado,
                doc.page.width - doc.options.margins.right - widthTotalContado,
                ypost, {
                width: widthTotalContado,
                stroke: "black",
                align: "right",
            });


            doc.end();

            return getStream.buffer(doc);
        } catch (error) {
            console.log(error)
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
                `Saldo: ${numberFormat(cabecera.saldo, cabecera.codiso)}`,
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