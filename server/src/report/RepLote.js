const path = require('path');
const PDFDocument = require("pdfkit-table");
const getStream = require('get-stream');
const {formatMoney } = require('../tools/Tools');

class RepLote {

    async repDetalleLote(infoSede, data) {
        try{
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

            let h1 = 14;
            let h2 = 12;
            let h3 = 10;

            doc.image(path.join(__dirname, "..", "path/to/logo.png"), doc.x, doc.y, { width: 75, });

            let postImgY = doc.y;

            doc.fontSize(h1).text(
                `${infoSede.nombreEmpresa}`,
                orgX + 150,
                orgY,
                {
                    width: 250,
                    align: "center"
                }
            );

            let titX = doc.x;

            doc.fontSize(h3).text(
                `RUC: ${infoSede.ruc}\n${infoSede.direccion}\nCelular: ${infoSede.celular}`,
                doc.x,
                doc.y,
                {
                    width: 250,
                    align: "center",
                }
            );

            doc.fontSize(h2).text(
                "RESUMEN DE LOTE",
                titX,
                postImgY + 10,
                {
                    width: 250,
                    align: "center",
                }
            );

            doc.fontSize(h3).text(
                "COMPROBANTE",
                orgX,
                doc.y
            )

            doc.fontSize(h3).text(
                `Cliente: ${data.cabecera.cliente} ${data.cabecera.documento}\nFecha: ${data.cabecera.fecha} - ${data.cabecera.hora}\nNotas: ...\nForma de venta: ${data.cabecera.tipo === 1 ? "CONTADO" : "CRÉDITO"}\nEstado: ${data.cabecera.estado === 1 ? "COBRADO" : "POR COBRAR"}\nTotal: ${data.cabecera.simbolo} ${data.cabecera.monto}\nArchivos adjuntos: ...`,
                orgX,
                doc.y + 5
            );

            let colY = doc.y + 10;

            doc.fontSize(h3).text(
                "DESCRIPCIÓN",
                orgX,
                colY
            );

            doc.fontSize(h3).text(
                `Manzana: ${data.cabecera.manzana}\nLote: ${data.cabecera.lote}\nDescripción: ...\nCosto: ${data.cabecera.costo}\nPrecio: ${data.cabecera.precio}\nEstado: ${data.cabecera.lotestado}`,
                orgX,
                doc.y + 5
            );

            let afterInfoY = doc.y;

            doc.fontSize(h3).text(
                "MEDIDAS",
                orgX + 170,
                colY
            );

            doc.fontSize(h3).text(
                `Medida Frontal: ${data.cabecera.medidaFrontal}\nCoste Derecho: ${data.cabecera.costadoDerecho}\nCoste Izquierdo: ${data.cabecera.costadoIzquierdo}\nMedida Fondo: ${data.cabecera.medidaFondo}\nArea Lote: ${data.cabecera.areaLote}\nN° Partida: ${data.cabecera.numeroPartida}`,
                orgX + 170,
                doc.y + 5
            );

            doc.fontSize(h3).text(
                "LÍMITE",
                orgX + 340,
                colY
            );

            doc.fontSize(h3).text(
                `Limite, Frontal / Norte / Noroeste: ${data.cabecera.limiteFrontal === '' ? '-' : data.cabecera.limiteFrontal}\nLímite, Derecho / Este / Sureste: ${data.cabecera.limiteDerecho === '' ? '-' : data.cabecera.limiteDerecho}\nLímite, Iquierdo / Sur / Sureste: ${data.cabecera.limiteIzquierdo === '' ? '-' : data.cabecera.limiteIzquierdo}\nLímite, Posterior / Oeste / Noroeste: ${data.cabecera.limitePosterior === '' ? '-' : data.cabecera.limitePosterior}\nUbicación del Lote: ${data.cabecera.ubicacionLote === '' ? '-' : data.cabecera.ubicacionLote}`,
                orgX + 340,
                doc.y + 5
            );

            doc.fontSize(h2).text(
                "DETALLE DE PAGOS ASOCIADOS",
                titX,
                afterInfoY + 10,
                {
                    width: 250,
                    align: "center",
                }
            );

            let content = data.detalle.map((item, index) => {
                return [item.concepto, formatMoney(item.monto) , item.metodo, item.banco, item.fecha]
            })

            const table1 = {
                //title: "CRONOGRAMA DE PAGOS MENSUALES VENTA AL CRÉDITO",
                //subtitle: "",
                headers: ["Concepto", "Monto", "Método", "Banco", "Fecha"],
                rows: content
            };

            doc.table(table1, {
                prepareHeader: () => doc.font("Helvetica-Bold").fontSize(11),
                prepareRow: () => {
                    doc.font("Helvetica").fontSize(10);
                },
                width: doc.page.width - doc.options.margins.left - doc.options.margins.right,
                x: orgX,
                y: doc.y + 10,

            });


            doc.end();

            return getStream.buffer(doc);
        }catch (error) {
            // return error.message;
            return "Se genero un error al generar el reporte.";
        }
    }
}

module.exports = RepLote;