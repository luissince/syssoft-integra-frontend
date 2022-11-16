const xl = require('excel4node');
const { formatMoney, dateFormat } = require('../tools/Tools');

async function generateLoteDeuda(req, sedeInfo, data) {
    try {
        const wb = new xl.Workbook();

        let ws = wb.addWorksheet('Hoja 1');

        const styleTitle = wb.createStyle({
            alignment: {
                horizontal: 'center'
            },
            font: {
                color: '#000000',
                size: 12,
            },
        });

        const styleHeader = wb.createStyle({
            alignment: {
                horizontal: 'left'
            },
            font: {
                color: '#000000',
                size: 12,
            }
        });

        const styleTableHeader = wb.createStyle({
            alignment: {
                horizontal: 'left'
            },
            font: {
                bold: true,
                color: '#000000',
                size: 12,
            },

        });

        const styleBody = wb.createStyle({
            alignment: {
                horizontal: 'left'
            },
            font: {
                color: '#000000',
                size: 12,
            }
        });

        const styleBodyInteger = wb.createStyle({
            alignment: {
                horizontal: 'left'
            },
            font: {
                color: '#000000',
                size: 12,
            }
        });

        const styleBodyFloat = wb.createStyle({
            alignment: {
                horizontal: 'left'
            },
            font: {
                color: '#000000',
                size: 12,
            },
            numberFormat: '#,##0.00; (#,##0.00); 0',
        });

        ws.column(1).setWidth(10);
        ws.column(2).setWidth(20);
        ws.column(3).setWidth(25);
        ws.column(4).setWidth(25);
        ws.column(5).setWidth(20);
        ws.column(6).setWidth(15);
        ws.column(7).setWidth(15);
        ws.column(8).setWidth(18);

        ws.cell(1, 1, 1, 8, true).string(`${sedeInfo.nombreEmpresa}`).style(styleTitle);
        ws.cell(2, 1, 2, 8, true).string(`RUC: ${sedeInfo.ruc}`).style(styleTitle);
        ws.cell(3, 1, 3, 8, true).string(`${sedeInfo.direccion}`).style(styleTitle);
        ws.cell(4, 1, 4, 8, true).string(`Celular: ${sedeInfo.celular} / Telefono: ${sedeInfo.telefono}`).style(styleTitle);

        ws.cell(6, 1, 6, 8, true).string(`REPORTE GENERAL DE VENTAS`).style(styleTitle);
        ws.cell(7, 1, 7, 8, true).string(`${req.query.porProyecto == "0" ? "PROYECTO: " + req.query.nombreProyecto : "TODOS LOS PROYECTOS"}`).style(styleTitle);

        const header = ["N°", "Cliente", "Propiedad", "Comprobante", "Ctas Pendiente", "Total", "Cobrado", "Por Cobrar"];

        header.map((item, index) => ws.cell(9, 1 + index).string(item).style(styleTableHeader));

        let rowY = 9;
        data.map((item, index) => {
            rowY = rowY + 1;

            ws.cell(rowY, 1).number(1 + index).style(styleBodyInteger)
            ws.cell(rowY, 2).string(item.documento + "\n" + item.informacion).style(styleBody)
            ws.cell(rowY, 3).string(item.lote + "\n " + item.manzana).style(styleBody)
            ws.cell(rowY, 4).string(item.comprobante + "\n" + item.serie + "-" + item.numeracion).style(styleBody)
            ws.cell(rowY, 5).string(item.credito === 1 ? item.frecuencia : item.numCuota === 1 ? item.numCuota + " Cuota" : item.numCuota + " Cuotas").style(styleBody)
            ws.cell(rowY, 6).number(parseFloat(formatMoney(item.total))).style(styleBodyFloat)
            ws.cell(rowY, 7).number(parseFloat(formatMoney(item.cobrado))).style(styleBodyFloat)
            ws.cell(rowY, 8).number(parseFloat(formatMoney(item.total - item.cobrado))).style(styleBodyFloat)
        });

        return wb.writeToBuffer();
    } catch (error) {
        return "Error en generar el excel.";
    }
}

module.exports = { generateLoteDeuda }