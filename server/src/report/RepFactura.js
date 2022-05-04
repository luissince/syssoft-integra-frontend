const path = require('path');
const PDFDocument = require("pdfkit-table");
const getStream = require('get-stream');
const qr = require("qrcode");
const NumberLleters = require('../tools/NumberLleters');
const { formatMoney, numberFormat, calculateTaxBruto, calculateTax } = require('../tools/Tools');

const numberLleters = new NumberLleters();

class RepFactura {

    async repComprobante(req, sedeInfo, data) {
        const cabecera = data.cabecera;
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
                `Fecha: ${cabecera.fecha} \nMoneda: ${cabecera.moneda + " - " + cabecera.codiso} \nForma de Venta: ${cabecera.tipo == 1 ? "CONTADO" : "CRÉDITO"}`,
                medioX,
                topCebecera
            );

            doc.x = doc.options.margins.left;

            let detalle = data.detalle.map((item, index) => {
                return [++index, "ZZ", item.cantidad, item.lote, numberFormat(item.precio, cabecera.codiso), numberFormat((item.precio * item.cantidad), cabecera.codiso)];
            });

            const table = {
                subtitle: "DETALLE",
                headers: ["Ítem", "Unidad de medida", "Cant.", "Descripción", "Valor Unitario", "Precio de Venta"],
                rows: detalle,
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

            doc.x = 0;

            let subTotal = 0;
            let impuestoTotal = 0;
            let total = 0;
            let impuestos = [];

            for (let item of data.detalle) {
                let cantidad = item.cantidad;
                let valor = item.precio;

                let impuesto = item.porcentaje;

                let valorActual = cantidad * valor;
                let valorSubNeto = calculateTaxBruto(impuesto, valorActual);
                let valorImpuesto = calculateTax(impuesto, valorSubNeto);
                let valorNeto = valorSubNeto + valorImpuesto;

                impuestos.push({ "idImpuesto": item.idImpuesto, "nombre": item.impuesto, "valor": valorImpuesto });

                subTotal += valorSubNeto;
                impuestoTotal += valorImpuesto;
                total += valorNeto;
            }

            let arrayImpuestos = [];
            for (let item of impuestos) {
                if (this.duplicateImpuestos(impuestos, item)) {
                    arrayImpuestos.push(item)
                } else {
                    for (let newItem of arrayImpuestos) {
                        if (newItem.idImpuesto === item.idImpuesto) {
                            let currenteObject = newItem;
                            currenteObject.valor += parseFloat(item.valor);
                            break;
                        }
                    }
                }
            }

            doc.fontSize(h3).text(`IMPORTE BRUTO: ${numberFormat(subTotal, cabecera.codiso)}`,
                doc.page.width - doc.options.margins.right - 200,
                doc.y + 5, {
                width: 200,
                align: "right",
            });

            doc.fontSize(h3).text("DESCUENTO: 0.00",
                doc.page.width - doc.options.margins.right - 200,
                doc.y + 5, {
                width: 200,
                align: "right"
            });

            doc.fontSize(h3).text(`SUB IMPORTE: ${numberFormat(subTotal, cabecera.codiso)}`,
                doc.page.width - doc.options.margins.right - 200,
                doc.y + 5, {
                width: 200,
                align: "right"
            });

            for (let item of arrayImpuestos) {
                doc.fontSize(h3).text(`${item.nombre}: ${numberFormat(item.valor, cabecera.codiso)}`,
                    doc.page.width - doc.options.margins.right - 200,
                    doc.y + 5, {
                    width: 200,
                    align: "right"
                });
            }

            doc.fontSize(h3).text(`IMPORTE NETO: ${numberFormat(total, cabecera.codiso)}`,
                doc.page.width - doc.options.margins.right - 200,
                doc.y + 5, {
                width: 200,
                align: "right"
            });

            doc.fontSize(h3).text(`SON: ${numberLleters.getResult(formatMoney(total), cabecera.moneda)}`,
                doc.options.margins.left,
                doc.y + 5);

            let qrResult = await this.qrGenerate(`|
            ${sedeInfo.ruc}|
            ${cabecera.codigoVenta}|
            ${cabecera.serie}|
            ${cabecera.numeracion}|
            ${impuestoTotal}|
            ${total}|
            ${cabecera.fecha}|
            ${cabecera.codigoCliente}|
            ${cabecera.documento}|`);

            doc.image(qrResult, doc.options.margins.left, doc.y, { width: 100, });

            doc.end();
            return getStream.buffer(doc);

        } catch (error) {
            return "Se genero un error al generar el reporte.";
        }
    }

    duplicateImpuestos(array, impuesto) {
        let value = false
        for (let item of array) {
            if (item.idImpuesto === impuesto.idImpuesto) {
                value = true
                break;
            }
        }
        return value
    }

    qrGenerate(data) {
        return new Promise((resolve, reject) => {
            qr.toDataURL(data, (err, src) => {
                if (err) reject("Error occured");

                resolve(src);
            });
        })
    }

    async repFiltroVentas(req, sedeInfo, data=''){
        try{
            const doc = new PDFDocument({
                margins: {
                    top: 40,
                    bottom: 40,
                    left: 40,
                    right: 40
                }
            });

            doc.info["Title"] = `REPORTE DE VENTAS DEL ${req.query.fechaIni} AL ${req.query.fechaIFin}`

            let orgX = doc.x;
            let orgY = doc.y;
            let cabeceraY = orgY + 70;
            let filtroY = cabeceraY + 40;
            let bodY = filtroY + 65;
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
                "REPORTE GENERAL DE VENTAS",
                // (doc.page.width - orgX - orgY) / 2,
                titleX,
                cabeceraY,
                {
                    width: 200,
                    align: "center",
                }
            );

            doc.fontSize(11).text(
                `PERIODO: ${req.query.fechaIni} al ${req.query.fechaIFin}`,
                orgX,
                cabeceraY + 26,
                {
                    width: 300,
                    align: "left",
                }
            );

            doc.rect(
                orgX, // EJE X
                filtroY, // EJE Y
                doc.page.width - doc.options.margins.left - doc.options.margins.right, // ANCHO
                50).stroke(); // ALTO
        
            // left
            doc.fontSize(h3).text(
                `Comprobante(s): TODOS`,
                orgX + 5,
                filtroY + 6
            );
            doc.fontSize(h3).text(
                `Cliente(s): TODOS`,
                orgX + 5,
                filtroY + 20
            );
            doc.fontSize(h3).text(
                `Vendedor(s): TODOS`,
                orgX + 5,
                filtroY + 34
            );
        
            // right
            doc.fontSize(h3).text(
                `Tipo(s): TODOS`,
                medioX + 15,
                filtroY + 6
            );
            doc.fontSize(h3).text(
                `Metodo de pago(s): TODOS`,
                medioX + 15,
                filtroY + 20
            );

            let content = [ ["11-01-2022", "PUBLICO GENERAL", "N001-1", "CONTADO", "EFECTIVO", "COBRADO", "S/ 10.00"] ];
            content.push(["", "CONTADO", "S/ 10.00", "CREDITO", "S/ 10.00", "TOTAL", "S/ 20.00" ]);

            //Tabla
            const table = {
                // title: "Detalle",
                subtitle: "DETALLE",
                headers: ["Fecha", "Cliente", "Comprobante", "Tipo", "Metodo", "Estado", "Importe"],
                rows: content
            };
        
            doc.table(table, {
                x: orgX,
                y: bodY,
                width: doc.page.width - doc.options.margins.left - doc.options.margins.right
            });

            doc.end();

            return getStream.buffer(doc);

        } catch(error){
            return "Se genero un error al generar el reporte.";
        }
    }

}

module.exports = RepFactura;