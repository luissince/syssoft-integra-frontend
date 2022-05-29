const xl = require('excel4node');
const { formatMoney, dateFormat } = require('../tools/Tools');

async function generateExcelCliente(req, sedeInfo, data) {
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

        ws.column(1).setWidth(10);
        ws.column(2).setWidth(20);
        ws.column(3).setWidth(30);
        ws.column(3).setWidth(20);

        ws.cell(1, 1, 1, 4, true).string(`${sedeInfo.nombreEmpresa}`).style(styleTitle);
        ws.cell(2, 1, 2, 4, true).string(`RUC: ${sedeInfo.ruc}`).style(styleTitle);
        ws.cell(3, 1, 3, 4, true).string(`${sedeInfo.direccion}`).style(styleTitle);
        ws.cell(4, 1, 4, 4, true).string(`Celular: ${sedeInfo.celular} / Telefono: ${sedeInfo.telefono}`).style(styleTitle);

        ws.cell(6, 1, 6, 4, true).string(`REPORTE DE CLIENTES`).style(styleTitle);
        ws.cell(7, 1, 7, 4, true).string(`PERIODO: ${dateFormat(req.query.fechaIni)} al ${dateFormat(req.query.fechaFin)}`).style(styleTitle);

        ws.cell(9, 1).string(`CLIENTE:`).style(styleHeader);
        ws.cell(9, 2).string(`${req.query.idCliente === "" ? "TODOS" : req.query.cliente}`).style(styleHeader);

        const header = ["N°", "N° de Documento", "Información", "Monto"];
        header.map((item, index) => ws.cell(11, 1 + index).string(item).style(styleTableHeader));

        let array = [];
        for (let item of data) {
            if (array.filter(f => f.idCliente === item.idCliente).length === 0) {
                array.push({
                    "idCliente": item.idCliente,
                    "documento": item.documento,
                    "informacion": item.informacion,
                    "ingresos": item.ingresos,
                    "ventas": item.ventas,
                });
            } else {
                for (let newItem of array) {
                    if (newItem.idCliente === item.idCliente) {
                        let currenteObject = newItem;
                        currenteObject.ingresos += parseFloat(item.ingresos);
                        currenteObject.ventas += parseFloat(item.ventas);
                        break;
                    }
                }
            }
        }

        let rowY = 11;
        let startPos = rowY + 1;
        let endPos = 0;
        array.map((item, index) => {
            rowY = rowY + 1;

            ws.cell(rowY, 1).number(1 + index).style(styleBodyInteger)
            ws.cell(rowY, 2).number(parseInt(item.documento)).style(styleBody)
            ws.cell(rowY, 3).string(item.informacion).style(styleBody)
            ws.cell(rowY, 4).number(parseFloat(formatMoney(item.ingresos + item.ventas))).style(styleBodyFloat)
        });

        endPos = rowY;

        rowY = rowY + 1;
        ws.cell(rowY, 3).string("TOTAL:").style(styleBody)
        if (array.length > 0) ws.cell(rowY, 4).formula(`SUM(D${startPos}:D${endPos})`).style(styleBodyFloat)

        return wb.writeToBuffer();
    } catch (error) {
        return "Error en generar el excel.";
    }
}

async function generateExcelDeudas(req, sedeInfo, data) {
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

        ws.column(1).setWidth(10);
        ws.column(2).setWidth(20);
        ws.column(3).setWidth(25);
        ws.column(4).setWidth(20);
        ws.column(5).setWidth(20);
        ws.column(6).setWidth(20);
        ws.column(7).setWidth(20);
        ws.column(8).setWidth(20);

        ws.cell(1, 1, 1, 8, true).string(`${sedeInfo.nombreEmpresa}`).style(styleTitle);
        ws.cell(2, 1, 2, 8, true).string(`RUC: ${sedeInfo.ruc}`).style(styleTitle);
        ws.cell(3, 1, 3, 8, true).string(`${sedeInfo.direccion}`).style(styleTitle);
        ws.cell(4, 1, 4, 8, true).string(`Celular: ${sedeInfo.celular} / Telefono: ${sedeInfo.telefono}`).style(styleTitle);

        ws.cell(6, 1, 6, 8, true).string(`LISTA DE DEUDAS POR CLIENTE`).style(styleTitle);

        const header = ["N°", "N° de Documento", "Información", "Cuotas Retrasadas", "Cuotas Pendientes", "Fecha de Cobro", "Monto Retrasado", "Cuota Actual"];
        header.map((item, index) => ws.cell(8, 1 + index).string(item).style(styleTableHeader));

        let rowY = 8;
        data.map((item, index) => {
            rowY = rowY + 1;

            ws.cell(rowY, 1).number(1 + index).style(styleBodyInteger)
            ws.cell(rowY, 2).number(parseInt(item.documento)).style(styleBodyInteger)
            ws.cell(rowY, 3).string(item.informacion).style(styleBody)

            ws.cell(rowY, 4).number(item.cuotasRetrasadas).style(styleBodyFloat)
            ws.cell(rowY, 5).number(item.cuotasPendientes).style(styleBodyFloat)
            ws.cell(rowY, 6).string(item.fechaPago).style(styleBody)

            ws.cell(rowY, 7).number(parseFloat(formatMoney(item.montoPendiente))).style(styleBodyFloat)
            ws.cell(rowY, 8).number(parseFloat(formatMoney(item.montoActual))).style(styleBodyFloat)
        });
        rowY = rowY + 1;


        return wb.writeToBuffer();
    } catch (error) {
        return "Error en generar el excel.";
    }
}

module.exports = { generateExcelCliente, generateExcelDeudas }