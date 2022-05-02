const path = require('path');
const PDFDocument = require("pdfkit-table");
const getStream = require('get-stream');
const { formatMoney } = require('../tools/Tools');

class RepFactura {

    async repComprobante(req, sedeInfo, data) {
        // const venta = data.venta;
        const cabecera = data.cabecera;
        console.log(data)
        try {

            const doc = new PDFDocument({
                font: 'Helvetica',
                margins: {
                    top: 40,
                    bottom: 40,
                    left: 40,
                    right: 40
                }
            });

            doc.info["Title"] = `${cabecera.comprobante} ${cabecera.serie + "-" + cabecera.numeracion}`

            let orgX = doc.x;
            let orgY = doc.y;

            let medioX = doc.page.width / 2;

            let h1 = 13;
            let h2 = 11;
            let h3 = 9;

            doc.image(path.join(__dirname, "..", "path/to/logo.png"), orgX, orgY, { width: 75, });

            let center = doc.page.width - doc.options.margins.left - doc.options.margins.right - 150 - 150;

            doc.fontSize(h1).text(
                `${sedeInfo.nombreEmpresa}`,
                doc.options.margins.left + 150,
                orgY + 10,
                {
                    width: center,
                    align: "center"
                }
            );

            doc.fontSize(h3).text(
                `${sedeInfo.direccion}\nCelular: ${sedeInfo.celular} / Telefono: ${sedeInfo.telefono}\n${sedeInfo.email}`,
                doc.options.margins.left + 150,
                orgY + 27,
                {
                    width: center,
                    align: "center",
                }
            );


            doc.fontSize(h2).text(
                `RUC: ${sedeInfo.ruc}\n${cabecera.comprobante}\n${cabecera.serie + "-" + cabecera.numeracion}`,
                doc.page.width - 150 - doc.options.margins.right,
                orgY + 20,
                {
                    width: 150,
                    align: "center",
                }
            );

            doc.rect(
                doc.page.width - 150 - doc.options.margins.right,
                orgY,
                150,
                70).stroke();

            // doc.fontSize(8).text(
            //     "Fecha de emisión:",
            //     doc.page.width - 150 - doc.options.margins.right,
            //     doc.y + 10
            // );

            doc.fontSize(h2).fill('#777').text(
                "INFORMACIÓN",
                doc.options.margins.top,
                doc.y + 20
            );

            doc.fill("#000000");

            let topCebecera = doc.y + 5;

            doc.fontSize(h3).text(
                `Tipo de documento: ${cabecera.tipoDoc} \nN° de documento: ${cabecera.documento} \nNombre/Razón Social: ${cabecera.informacion}\nDirección: ${cabecera.direccion}`,
                doc.options.margins.left,
                topCebecera
            );

            doc.fontSize(h3).text(
                `Fecha: ${cabecera.fecha} \nMoneda: ${cabecera.simbolo + " - " + cabecera.codiso} \nForma de Venta: ${cabecera.tipo == 1 ? "CONTADO" : "CRÉDITO"}`,
                medioX,
                topCebecera
            );

            // doc.rect(
            //     doc.options.margins.left,
            //     boxTop,
            //     doc.page.width - doc.options.margins.left - doc.options.margins.right,
            //     boxBottom - boxTop).stroke();

            doc.x = doc.options.margins.left;

            console.log(data)
            let detalle = data.detalle.map((item, index) => {
                return [];
            });

            const table = {
                subtitle: "DETALLE",
                headers: ["Ítem", "Unidad de medida", "Cant.", "Descripción", "Valor Unitario", "Precio de Venta"],
                rows: [
                    ["1", "ZZ", "1", "CONCEPTO DE PAGO: COM.OP OTRA LINEA", "5.00", "5.00"]
                ],
            };

            doc.table(table, {
                prepareHeader: () => doc.font("Helvetica-Bold").fontSize(h3),
                prepareRow: () => {
                    doc.font("Helvetica").fontSize(h3);
                },
                x: doc.x,
                y: doc.y + 20,
                width: doc.page.width - doc.options.margins.left - doc.options.margins.right
            });

            let boxTop = doc.y;
            doc.x = 0;

            // doc.fontSize(8).text(
            //     "Descuentos: \nValor de Venta Operaciones Gravadas: \nValor de Venta Operaciones Gratuitas: \nValor de Venta Operaciones Inafectas: \nValor de Venta Operaciones Exogeneradas: \nI.G.V 18%: \nI.S.C 10%: \nOtros Tributos: \nOtros Cargos: \nImporte Total:",
            //     doc.x + 300,
            //     doc.y
            // );

            // let boxBottom = doc.y;
            // doc.x = 0;

            // let widthRect = doc.x + 300;

            // doc.rect(
            //     widthRect,
            //     boxTop,
            //     doc.page.width - doc.options.margins.left - doc.options.margins.right - widthRect,
            //     boxBottom - boxTop).stroke();

            doc.end();
            return getStream.buffer(doc);

        } catch (error) {
            return "Se genero un error al generar el reporte.";
        }
    }

}

module.exports = RepFactura;