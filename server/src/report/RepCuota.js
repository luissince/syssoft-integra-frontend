const path = require('path');
const PDFDocument = require("pdfkit-table");
const getStream = require('get-stream');
const { numberFormat, isFile } = require('../tools/Tools');

class RepCuota {

    async repDetalleCuota(req, sedeInfo, data) {
        const venta = data.venta;
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

            doc.info["Title"] = "Cronograma de Pagos.pdf"

            let orgX = doc.x;
            let orgY = doc.y;
            let cabeceraY = orgY + 70;
            let titleX = orgX + 150;
            let medioX = doc.page.width / 2;

            let h1 = 13;
            let h2 = 11;
            let h3 = 9;

            if (isFile(path.join(__dirname, "..", "path/company/" + sedeInfo.rutaLogo))) {
                doc.image(path.join(__dirname, "..", "path/company/" + sedeInfo.rutaLogo), orgX, orgY, { width: 75 });
            } else {
                doc.image(path.join(__dirname, "..", "path/to/noimage.jpg"), orgX, orgY, { width: 75 });
            }

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

            doc.fontSize(h2);

            const title = "CRONOGRAMA DE CUOTAS";
            let widthtext = Math.round(doc.widthOfString(title));

            doc.text(
                title,
                (doc.page.width - widthtext) / 2,
                cabeceraY,
                {
                    width: widthtext
                }
            );

            doc.opacity(0.7)
            doc.fontSize(h3).text(
                `${req.query.proyecto}`,
                orgX,
                doc.y + 10,
                {
                    width: 250,
                    align: "left",
                }
            );
            // reset 
            doc.fill('#000').stroke('#000');
            doc.lineGap(4);
            doc.opacity(1)

            let filtroY = doc.y;

            doc.fontSize(h3).text(
                `Cliente: ${venta.informacion}\nMonto Total: ${numberFormat(venta.total)}\nMonto Cobrado: ${numberFormat(venta.cobrado)}\nMonto Restante: ${numberFormat(venta.total - venta.cobrado)}`,
                orgX,
                filtroY + 10
            );


            doc.fontSize(h3).text(
                `Dni/Ruc: ${venta.documento}\nMonto Inicial:  ${numberFormat(data.inicial)}\nN° Cuotas: ${venta.credito === 1 ? "Variable" : venta.numCuota}\nComprobante: ${venta.nombre} ${venta.serie} - ${venta.numeracion}`,
                medioX,
                filtroY + 10
            );

            doc.lineGap(0);

            let lotes = data.lotes.map((item, index) => {
                return [++index, item.lote, numberFormat(item.precio), item.areaLote, item.manzana]
            })

            const lotesTabla = {
                // title: "CRONOGRAMA DE PAGOS MENSUALES VENTA AL CRÉDITO",
                subtitle: `LISTA DE LOTES ASOCIADOS A LA VENTA`,
                headers: ["N°", "LOTE", "PRECIO", "AREA m2", "MANZANA"],
                rows: lotes
            };

            doc.table(lotesTabla, {
                prepareHeader: () => doc.font("Helvetica-Bold").fontSize(h3),
                prepareRow: () => {
                    doc.font("Helvetica").fontSize(h3);
                },
                padding: 5,
                columnSpacing: 5,
                columnsSize: [60, 162, 110, 100, 100], //532
                width: (doc.page.width - doc.options.margins.left - doc.options.margins.right),
                x: orgX,
                y: doc.y + 15,

            });

            let credito = venta.total - data.inicial
            let arrayIni = [0, '', '', '', numberFormat(credito), ''];

            let content = data.plazos.map((item, index) => {
                credito = credito - item.monto
                return [
                    ++index,
                    "CUOTA " + item.cuota,
                    item.fecha,
                    item.estado === 1 ? 'COBRADO' : item.vencido === 1 ? 'VENCIDO' : item.vencido === 2 ? 'POR VENCER' : 'POR COBRAR',
                    numberFormat(credito),
                    item.estado === 1 ? 0 : numberFormat(item.monto - item.cobros)]
            })

            content.unshift(arrayIni)

            const table1 = {
                subtitle: "CRONOGRAMA DE PAGOS MENSUALES - VENTA AL CRÉDITO",
                headers: ["#", "CUOTA", "FECHA DE PAGO", "ESTADO", "MONTO RESTANTE", "CUOTA RESTANTE"],
                rows: content
            };

            doc.table(table1, {
                prepareHeader: () => doc.font("Helvetica-Bold").fontSize(h3),
                prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                    if (indexColumn === 3) {
                        if (row[3] === "COBRADO") {
                            doc.font("Helvetica").fontSize(h3).fillColor("green");
                        } else if (row[3] === "VENCIDO") {
                            doc.font("Helvetica").fontSize(h3).fillColor("red");
                        } else if (row[3] === "POR VENCER") {
                            doc.font("Helvetica").fontSize(h3).fillColor("orange");
                        }
                        else {
                            doc.font("Helvetica").fontSize(h3).fillColor("black");
                        }
                    } else {
                        doc.font("Helvetica").fontSize(h3).fillColor("black");
                    }
                },
                padding: 5,
                columnSpacing: 5,
                columnsSize: [60, 102, 100, 90, 90, 90], //532
                width: doc.page.width - doc.options.margins.left - doc.options.margins.right,
                x: orgX,
                y: doc.y + 10,
            });

            doc.end();
            return getStream.buffer(doc);
        } catch (error) {
            console.log(error);
            return "Se genero un error al generar el reporte.";
        }
    }

}

module.exports = RepCuota;