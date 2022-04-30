const path = require('path');
const PDFDocument = require("pdfkit-table");
const getStream = require('get-stream');
// const {formatMoney } = require('../tools/Tools');

class RepCuota {

    async repDetalleCuota(req, sedeInfo, data) {

        const venta = data.venta

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
            let cabeceraY = orgY + 80;
            let titleX = orgX + 150;
            let medioX = (doc.page.width - doc.options.margins.left - doc.options.margins.right) / 2;

            let h1 = 14;
            let h2 = 12;
            let h3 = 10;

            doc.image(path.join(__dirname, "..", "path/to/logo.png"), orgX, orgY, { width: 75, });

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

            doc.fontSize(11).text(
                `${req.query.proyecto}`,
                orgX,
                cabeceraY,
                {
                    width: 250,
                    align: "left",
                }
            );

            doc.rect(
                orgX, // EJE X
                cabeceraY + 20, // EJE Y
                doc.page.width - doc.options.margins.left - doc.options.margins.right, // ANCHO
                57).fillAndStroke('#F2F4F4', '#F2F4F4'); // ALTO

            // reset 
            doc.fill('#000').stroke('#000');

            doc.fontSize(11).text(
                `Cliente: ${venta.informacion}\nMonto Total: ${venta.simbolo} ${venta.total}\nMonto Cobrado: ${venta.simbolo} ${venta.cobrado}\nMonto Restante: ${venta.simbolo} ${venta.total - venta.cobrado}`,
                orgX + 5,
                cabeceraY + 25
            );

            doc.fontSize(11).text(
                `DNI/RUC: ${venta.documento}\nMonto Inicial: ${venta.simbolo} ${data.inicial}\nN° Cuotas: ${venta.numCuota}\nComprobante: ${venta.serie} - ${venta.numeracion}`,
                medioX + 5,
                cabeceraY + 25
            );

            let lotes = data.lotes.map((item, index) => {
                return [++index, item.lote, item.precio, item.areaLote, item.manzana]
            })

            const lotesTabla = {
                // title: "CRONOGRAMA DE PAGOS MENSUALES VENTA AL CRÉDITO",
                subtitle: `LISTA DE LOTES ASOCIADOS A LA VENTA`,
                headers: ["N°", "LOTE", "PRECIO", "AREA m2" ,"MANZANA"],
                rows: lotes
            }; 

            doc.table(lotesTabla, {
                prepareHeader: () => doc.font("Helvetica-Bold").fontSize(h3),
                prepareRow: () => {
                    doc.font("Helvetica").fontSize(9);
                },
                width: (doc.page.width - doc.options.margins.left - doc.options.margins.right),
                x: orgX,
                y: cabeceraY + 90,
                
            });

            doc.fontSize(11).text(
                "CRONOGRAMA DE PAGOS MENSUALES VENTA AL CRÉDITO",
                titleX,
                doc.y + 5,
                {
                    width: 250,
                    align: "center",
                }
            );

            let credito = venta.total - data.inicial
            let arrayIni = [0,'','',credito,''];

            let content = data.plazos.map((item, index) => {
                credito = credito - item.monto
                return [++index, item.fecha, item.estado === 1 ? 'COBRADO':'POR COBRAR', credito, venta.simbolo+' '+item.monto]
            })

            content.unshift(arrayIni)

            const table1 = {
                // title: "CRONOGRAMA DE PAGOS MENSUALES VENTA AL CRÉDITO",
                // subtitle: ` ${venta.simbolo} ${venta.total - venta.cobrado}`,
                headers: ["#", "FECHA DE PAGO", "ESTADO" ,"MONTO RESTANTE", "CUOTA MENSUAL"],
                rows: content
            };

            doc.table(table1, {
                prepareHeader: () => doc.font("Helvetica-Bold").fontSize(11),
                prepareRow: () => {
                    doc.font("Helvetica").fontSize(h3);
                },
                width: doc.page.width - doc.options.margins.left - doc.options.margins.right,
                x: orgX,
                y: doc.y + 10,
            });

            doc.end();
            return getStream.buffer(doc);

        } catch (error) {
            return "Se genero un error al generar el reporte.";
        }
    }

}

module.exports = RepCuota;