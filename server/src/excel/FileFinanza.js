const xl = require('excel4node');
const { formatMoney, dateFormat } = require('../tools/Tools');

async function generateExcel(req, sedeInfo, data) {
    console.log(data);
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
                horizontal: 'center'
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

        if (req.query.isDetallado) {
            ws.column(1).setWidth(5);
            ws.column(2).setWidth(20);
            ws.column(3).setWidth(15);
            ws.column(4).setWidth(15);
            ws.column(5).setWidth(35);
            ws.column(6).setWidth(25);
            ws.column(7).setWidth(15);
            ws.column(8).setWidth(20);
            ws.column(9).setWidth(15);
            ws.column(10).setWidth(15);

            ws.cell(1, 1, 1, 10, true).string(`${sedeInfo.nombreEmpresa}`).style(styleTitle);
            ws.cell(2, 1, 2, 10, true).string(`RUC: ${sedeInfo.ruc}`).style(styleTitle);
            ws.cell(3, 1, 3, 10, true).string(`${sedeInfo.direccion}`).style(styleTitle);
            ws.cell(4, 1, 4, 10, true).string(`Celular: ${sedeInfo.celular} / Telefono: ${sedeInfo.telefono}`).style(styleTitle);

            ws.cell(6, 1, 6, 10, true).string(`REPORTE DE COBROS Y GASTOS`).style(styleTitle);
            ws.cell(7, 1, 7, 10, true).string(`PERIODO: ${dateFormat(req.query.fechaIni)} al ${dateFormat(req.query.fechaFin)}`).style(styleTitle);

            const headerCon = ["#", "Comprobante", "Correlativo", "Documento", "Cliente", "Detalle", "Banco", "Fecha", "Usuario", "Monto"];
            headerCon.map((item, index) => ws.cell(9, 1 + index).string(item).style(styleTableHeader));

            let sumaMonto = 0;
            let rowY = 9;

            data.cobros.map((item, index) => {
                sumaMonto += item.monto;
                rowY = rowY + 1;
                let correlativo = item.serie + "-" + item.numeracion
                let fechaHora = item.fecha + " " + item.hora

                ws.cell(rowY, 1).number(1 + index).style(styleBodyInteger)
                ws.cell(rowY, 2).string(item.comprobante).style(styleBody)
                ws.cell(rowY, 3).string(correlativo).style(styleBody)
                ws.cell(rowY, 4).string(item.documento).style(styleBody)
                ws.cell(rowY, 5).string(item.informacion).style(styleBody)
                ws.cell(rowY, 6).string(item.detalle).style(styleBody)
                ws.cell(rowY, 7).string(item.banco).style(styleBody)
                ws.cell(rowY, 8).string(fechaHora).style(styleBody)
                ws.cell(rowY, 9).string(item.nombres).style(styleBody)
                ws.cell(rowY, 10).number(parseFloat(formatMoney(item.monto))).style(styleBodyFloat)
            });

            rowY = rowY + 1;

            ws.cell(rowY, 9).string("TOTAL:").style(styleBody)
            ws.cell(rowY, 10).number(parseFloat(formatMoney(sumaMonto))).style(styleBodyFloat)

        } else {
            ws.column(1).setWidth(10);
            ws.column(2).setWidth(20);
            ws.column(3).setWidth(15);
            ws.column(4).setWidth(15);
            ws.column(5).setWidth(15);
            ws.column(6).setWidth(15);

            ws.cell(1, 1, 1, 6, true).string(`${sedeInfo.nombreEmpresa}`).style(styleTitle);
            ws.cell(2, 1, 2, 6, true).string(`RUC: ${sedeInfo.ruc}`).style(styleTitle);
            ws.cell(3, 1, 3, 6, true).string(`${sedeInfo.direccion}`).style(styleTitle);
            ws.cell(4, 1, 4, 6, true).string(`Celular: ${sedeInfo.celular} / Telefono: ${sedeInfo.telefono}`).style(styleTitle);

            ws.cell(6, 1, 6, 6, true).string(`REPORTE DE COBROS Y GASTOS`).style(styleTitle);
            ws.cell(7, 1, 7, 6, true).string(`PERIODO: ${dateFormat(req.query.fechaIni)} al ${dateFormat(req.query.fechaFin)}`).style(styleTitle);

            ws.cell(9, 1, 9, 2, true).string(`RESUMEN DE CONCEPTOS`).style(styleHeader);

            const headerCon = ["#", "Concepto", "Cantidad", "Ingreso", "salida", "Total"];
            headerCon.map((item, index) => ws.cell(10, 1 + index).string(item).style(styleTableHeader));

            let sumaIngreso = 0;
            let sumaEgreso = 0;
            let rowY = 10;
            data.conceptos.map((item, index) => {
                rowY = rowY + 1;

                sumaIngreso += item.tipo === "INGRESO" ? item.monto : 0;
                sumaEgreso += item.tipo === "EGRESO" ? item.monto : 0;

                ws.cell(rowY, 1).number(1 + index).style(styleBodyInteger)
                ws.cell(rowY, 2).string(item.concepto).style(styleBody)
                ws.cell(rowY, 3).number(item.cantidad).style(styleBodyInteger)

                ws.cell(rowY, 4).number(parseFloat(item.tipo === "INGRESO" ? formatMoney(item.monto) : 0)).style(styleBodyFloat)
                ws.cell(rowY, 5).number(parseFloat(item.tipo === "EGRESO" ? formatMoney(item.monto) : 0)).style(styleBodyFloat)
            });

            rowY = rowY + 1;

            ws.cell(rowY, 3).string("TOTAL:").style(styleBody)
            ws.cell(rowY, 4).number(parseFloat(formatMoney(sumaIngreso))).style(styleBodyFloat)
            ws.cell(rowY, 5).number(parseFloat(formatMoney(sumaEgreso))).style(styleBodyFloat)
            ws.cell(rowY, 6).formula(`${'D' + rowY} + ${'E' + rowY}`).style(styleBodyFloat)

            rowY = rowY + 2;
            ws.cell(rowY, 1, rowY, 2, true).string(`RESUMEN BANCARIO`).style(styleHeader);

            rowY = rowY + 1;

            const headerBan = ["#", "Banco", "Tipo de Cuenta", "Monto"];
            headerBan.map((item, index) => ws.cell(rowY, 1 + index).string(item).style(styleTableHeader));

            let startPos = rowY + 1;
            let endPos = 0;
            data.bancos.map((item, index) => {
                rowY = rowY + 1;

                ws.cell(rowY, 1).number(1 + index).style(styleBodyInteger)
                ws.cell(rowY, 2).string(item.nombre).style(styleBody)
                ws.cell(rowY, 3).string(item.tipoCuenta).style(styleBody)
                ws.cell(rowY, 4).number(parseFloat(formatMoney(item.monto))).style(styleBodyFloat)
            });

            endPos = rowY;

            rowY = rowY + 1;

            ws.cell(rowY, 3).string("TOTAL:").style(styleBody)
            if (data.bancos.length > 0) ws.cell(rowY, 4).formula(`SUM(D${startPos}:D${endPos})`).style(styleBodyFloat)

        }
        return wb.writeToBuffer();
    } catch (error) {
        return "Error en generar el excel.";
    }
}

module.exports = { generateExcel }