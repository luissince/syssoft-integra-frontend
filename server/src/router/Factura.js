const express = require('express');
const router = express.Router();
const { currentDate, currentTime } = require('../tools/Tools');
const Factura = require('../services/Factura')
const Sede = require('../services/Sede');
const RepCuota = require('../report/RepCuota')

const factura = new Factura();
const sede = new Sede();
const repCuota = new RepCuota();

const Conexion = require('../database/Conexion');
const conec = new Conexion();

router.get("/list", async function (req, res) {
    try {

        let lista = await conec.query(`SELECT 
            v.idVenta,
            c.idCliente,
            c.documento, 
            c.informacion,             
            v.idComprobante,  
            co.nombre as comprobante,
            v.serie,
            v.numeracion,
            DATE_FORMAT(v.fecha,'%d/%m/%Y') as fecha, 
            v.hora, 
            v.tipo, 
            v.estado,
            m.idMoneda,
            m.simbolo,
            IFNULL(SUM(vd.precio*vd.cantidad),0) AS total
            FROM venta AS v 
            INNER JOIN cliente AS c ON v.idCliente = c.idCliente
            INNER JOIN comprobante AS co ON v.idComprobante = co.idComprobante
            INNER JOIN moneda AS m ON v.idMoneda = m.idMoneda
            LEFT JOIN ventaDetalle AS vd ON vd.idVenta = v.idVenta
            WHERE 
            ? = 0
            OR
            ? = 1 and c.informacion like concat(?,'%')
            OR
            ? = 1 and c.documento like concat(?,'%')
            GROUP BY v.idVenta
            ORDER BY v.fecha DESC, v.hora DESC
            LIMIT ?,?`, [
            parseInt(req.query.opcion),

            parseInt(req.query.opcion),
            req.query.buscar,

            parseInt(req.query.opcion),
            req.query.buscar,

            parseInt(req.query.posicionPagina),
            parseInt(req.query.filasPorPagina)
        ])

        let resultLista = lista.map(function (item, index) {
            return {
                ...item,
                id: (index + 1) + parseInt(req.query.posicionPagina)
            }
        });

        let total = await conec.query(`SELECT COUNT(*) AS Total 
            FROM venta AS v 
            INNER JOIN cliente AS c ON v.idCliente = c.idCliente
            INNER JOIN comprobante as co ON v.idComprobante = co.idComprobante
            INNER JOIN moneda AS m ON v.idMoneda = m.idMoneda
            WHERE 
            ? = 0
            OR
            ? = 1 and c.informacion like concat(?,'%')
            OR
            ? = 1 and c.documento like concat(?,'%')`, [
            parseInt(req.query.opcion),

            parseInt(req.query.opcion),
            req.query.buscar,

            parseInt(req.query.opcion),
            req.query.buscar
        ]);

        res.status(200).send({ "result": resultLista, "total": total[0].Total })

    } catch (error) {
        console.log(error)
        res.status(500).send("Error interno de conexión, intente nuevamente.")
    }
});

router.post("/add", async function (req, res) {
    let connection = null;
    try {

        connection = await conec.beginTransaction();

        let countLote = 0;

        for (let item of req.body.detalleVenta) {
            let lote = await conec.execute(connection, `SELECT idLote FROM lote 
            WHERE idLote = ? AND estado = 3`, [
                item.idDetalle
            ]);
            if (lote.length > 0) {
                countLote++;
            }
        }

        if (countLote > 0) {
            conec.rollback(connection);
            res.status(400).send('Hay un lote que se esta tratando de vender, no se puede continuar ya que está asociado a una factura.')
            return;
        }

        let result = await conec.execute(connection, 'SELECT idVenta  FROM venta');
        let idVenta = "";
        if (result.length != 0) {

            let quitarValor = result.map(function (item) {
                return parseInt(item.idVenta.replace("VT", ''));
            });

            let valorActual = Math.max(...quitarValor);
            let incremental = valorActual + 1;
            let codigoGenerado = "";
            if (incremental <= 9) {
                codigoGenerado = 'VT000' + incremental;
            } else if (incremental >= 10 && incremental <= 99) {
                codigoGenerado = 'VT00' + incremental;
            } else if (incremental >= 100 && incremental <= 999) {
                codigoGenerado = 'VT0' + incremental;
            } else {
                codigoGenerado = 'VT' + incremental;
            }

            idVenta = codigoGenerado;
        } else {
            idVenta = "VT0001";
        }

        let comprobante = await conec.execute(connection, `SELECT 
        serie,
        numeracion 
        FROM comprobante 
        WHERE idComprobante  = ?
        `, [
            req.body.idComprobante
        ]);

        let numeracion = 0;

        let ventas = await conec.execute(connection, 'SELECT numeracion  FROM venta WHERE idComprobante = ?', [
            req.body.idComprobante
        ]);

        if (ventas.length > 0) {
            let quitarValor = ventas.map(function (item) {
                return parseInt(item.numeracion);
            });

            let valorActual = Math.max(...quitarValor);
            let incremental = valorActual + 1;
            numeracion = incremental;
        } else {
            numeracion = comprobante[0].numeracion;
        }

        await conec.execute(connection, `INSERT INTO venta(
            idVenta, 
            idCliente, 
            idUsuario, 
            idComprobante, 
            serie,
            numeracion,
            idMoneda,
            tipo, 
            numCuota,
            estado, 
            fecha, 
            hora)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
            `, [
            idVenta,
            req.body.idCliente,
            req.body.idUsuario,
            req.body.idComprobante,
            comprobante[0].serie,
            numeracion,
            req.body.idMoneda,
            req.body.tipo,
            req.body.numCuota,
            req.body.estado,
            currentDate(),
            currentTime()
        ]);

        let montoTotal = 0;

        for (let item of req.body.detalleVenta) {
            await conec.execute(connection, `INSERT INTO ventaDetalle(
                idVenta, 
                idLote, 
                precio, 
                cantidad, 
                idImpuesto)
                VALUES(?,?,?,?,?)`, [
                idVenta,
                item.idDetalle,
                parseFloat(item.precioContado),
                item.cantidad,
                item.idImpuesto,
            ]);

            await conec.execute(connection, `UPDATE lote SET estado = 3 WHERE idLote = ?`, [
                item.idDetalle,
            ]);

            montoTotal += parseFloat(item.precioContado) * item.cantidad;
        }


        if (req.body.selectTipoPago) {
            let cobro = await conec.execute(connection, 'SELECT idCobro FROM cobro');
            let idCobro = "";
            if (cobro.length != 0) {

                let quitarValor = cobro.map(function (item) {
                    return parseInt(item.idCobro.replace("CB", ''));
                });

                let valorActual = Math.max(...quitarValor);
                let incremental = valorActual + 1;
                let codigoGenerado = "";
                if (incremental <= 9) {
                    codigoGenerado = 'CB000' + incremental;
                } else if (incremental >= 10 && incremental <= 99) {
                    codigoGenerado = 'CB00' + incremental;
                } else if (incremental >= 100 && incremental <= 999) {
                    codigoGenerado = 'CB0' + incremental;
                } else {
                    codigoGenerado = 'CB' + incremental;
                }

                idCobro = codigoGenerado;
            } else {
                idCobro = "CB0001";
            }

            await conec.execute(connection, `INSERT INTO cobro(
                idCobro, 
                idCliente, 
                idUsuario, 
                idMoneda, 
                idBanco, 
                idProcedencia,
                metodoPago, 
                estado, 
                observacion, 
                fecha, 
                hora) 
                VALUES(?,?,?,?,?,?,?,?,?,?,?)`, [
                idCobro,
                req.body.idCliente,
                req.body.idUsuario,
                req.body.idMoneda,
                req.body.idBanco,
                idVenta,
                req.body.metodoPago,
                1,
                'INGRESO DEL PAGO TOTAL',
                currentDate(),
                currentTime()
            ]);

            await conec.execute(connection, `INSERT INTO cobroVenta(
                idCobro,
                idVenta,
                precio) 
                VALUES (?,?,?)`, [
                idCobro,
                idVenta,
                montoTotal
            ]);

        } else {
            if (req.body.montoInicialCheck) {
                let cobro = await conec.execute(connection, 'SELECT idCobro FROM cobro');
                let idCobro = "";
                if (cobro.length != 0) {

                    let quitarValor = cobro.map(function (item) {
                        return parseInt(item.idCobro.replace("CB", ''));
                    });

                    let valorActual = Math.max(...quitarValor);
                    let incremental = valorActual + 1;
                    let codigoGenerado = "";
                    if (incremental <= 9) {
                        codigoGenerado = 'CB000' + incremental;
                    } else if (incremental >= 10 && incremental <= 99) {
                        codigoGenerado = 'CB00' + incremental;
                    } else if (incremental >= 100 && incremental <= 999) {
                        codigoGenerado = 'CB0' + incremental;
                    } else {
                        codigoGenerado = 'CB' + incremental;
                    }

                    idCobro = codigoGenerado;
                } else {
                    idCobro = "CB0001";
                }

                await conec.execute(connection, `INSERT INTO cobro(
                    idCobro, 
                    idCliente, 
                    idUsuario, 
                    idMoneda, 
                    idBanco, 
                    idProcedencia,
                    metodoPago, 
                    estado, 
                    observacion, 
                    fecha, 
                    hora) 
                    VALUES(?,?,?,?,?,?,?,?,?,?,?)`, [
                    idCobro,
                    req.body.idCliente,
                    req.body.idUsuario,
                    req.body.idMoneda,
                    req.body.idBanco,
                    idVenta,
                    req.body.metodoPago,
                    1,
                    'INICIAL',
                    currentDate(),
                    currentTime()
                ]);

                await conec.execute(connection, `INSERT INTO cobroVenta(
                    idCobro,
                    idVenta,
                    idPlazo,
                    precio) 
                    VALUES (?,?,?,?)`, [
                    idCobro,
                    idVenta,
                    0,
                    req.body.inicial
                ]);
            }

            let plazo = await conec.execute(connection, 'SELECT idPlazo FROM plazo');
            let idPlazo = "";
            if (plazo.length != 0) {

                let quitarValor = plazo.map(function (item) {
                    return parseInt(item.idPlazo);
                });

                let valorActual = Math.max(...quitarValor);
                let incremental = valorActual + 1;
                idPlazo = incremental;
            } else {
                idPlazo = 1;
            }

            let inicioDate = new Date();

            var ultimoDate = new Date(inicioDate);
            ultimoDate.setMonth(ultimoDate.getMonth() + parseInt(req.body.numCuota));

            let i = 0;
            let cuotaMes = (montoTotal - req.body.inicial) / req.body.numCuota;
            while (inicioDate < ultimoDate) {
                i++;
                inicioDate.setMonth(inicioDate.getMonth() + 1);

                await conec.execute(connection, `INSERT INTO plazo(
                idPlazo,
                idVenta,
                fecha,
                hora,
                monto,
                estado) 
                VALUES(?,?,?,?,?,?)`, [
                    idPlazo,
                    idVenta,
                    inicioDate.getFullYear() + "-" + ((inicioDate.getMonth() + 1) < 10 ? "0" + (inicioDate.getMonth() + 1) : (inicioDate.getMonth() + 1)) + "-" + inicioDate.getDate(),
                    currentTime(),
                    cuotaMes,
                    0
                ]);
                idPlazo++;
            }

        }

        await conec.commit(connection);
        res.status(200).send('Datos insertados correctamente')
    } catch (error) {
        console.log(error)
        if (connection != null) {
            await conec.rollback(connection);
        }
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
});

router.delete("/anular", async function (req, res) {
    let connection = null;
    try {
        connection = await conec.beginTransaction();

        let vanta = await conec.execute(connection, `SELECT idVenta FROM venta 
        WHERE idVenta = ? AND estado = 3`, [
            req.query.idVenta
        ]);
        if (vanta.length !== 0) {
            await conec.rollback(connection);
            res.status(400).send('La venta ya se encuentra anulada.');
        } else {
            let plazos = await conec.execute(connection, `SELECT * FROM
            cobroVenta WHERE idVenta = ?`, [
                req.query.idVenta
            ]);

            let validate = 0;

            for (let item of plazos) {
                if (item.idPlazo !== 0) {
                    validate++;
                }
            }

            if (validate > 0) {
                await conec.rollback(connection);
                res.status(400).send('No se puede eliminar la venta porque tiene cuotas asociadas.');
                return;
            }

            await conec.execute(connection, `UPDATE venta SET estado = 3 
            WHERE idVenta = ?`, [
                req.query.idVenta
            ]);

            console.log(req.query.idVenta)

            let cobro = await conec.execute(connection, `SELECT idCobro FROM cobro WHERE idProcedencia = ?`, [
                req.query.idVenta
            ])

            if (cobro.length > 0) {
                await conec.execute(connection, `DELETE FROM cobro WHERE idCobro = ?`, [
                    cobro[0].idCobro
                ]);

                await conec.execute(connection, `DELETE FROM cobroDetalle WHERE idCobro = ?`, [
                    cobro[0].idCobro
                ]);

                await conec.execute(connection, `DELETE FROM cobroVenta WHERE idCobro = ?`, [
                    cobro[0].idCobro
                ]);
            }

            let lote = await conec.execute(connection, `SELECT vd.idLote FROM
            venta AS v 
            INNER JOIN ventaDetalle AS vd ON v.idVenta = vd.idVenta
            WHERE v.idVenta  = ?`, [
                req.query.idVenta
            ]);

            for (let item of lote) {
                await conec.execute(connection, `UPDATE lote SET estado = 1 
                WHERE idLote = ?`, [
                    item.idLote
                ]);
            }

            await conec.execute(connection, `DELETE FROM plazo WHERE idVenta = ?`, [
                req.query.idVenta
            ]);

            // await conec.rollback(connection);
            await conec.commit(connection);
            res.status(200).send('Se anulo correctamente la venta.');
        }
    } catch (error) {
        console.log(error)
        if (connection != null) {
            await conec.rollback(connection);
        }
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
});

router.get("/id", async function (req, res) {
    try {

        let result = await conec.query(`SELECT
        v.idVenta, 
        com.nombre AS comprobante,
        v.serie,
        v.numeracion,

        c.documento,
        c.informacion,

        DATE_FORMAT(v.fecha,'%d/%m/%Y') as fecha,
        v.hora, 
        v.tipo, 
        v.estado, 
        m.simbolo,
        m.codiso,
        IFNULL(SUM(vd.precio*vd.cantidad),0) AS monto
        FROM venta AS v 
        INNER JOIN cliente AS c ON v.idCliente = c.idCliente
        INNER JOIN comprobante AS com ON v.idComprobante = com.idComprobante
        INNER JOIN moneda AS m ON m.idMoneda = v.idMoneda
        LEFT JOIN ventaDetalle AS vd ON vd.idVenta = v.idVenta 
        WHERE v.idVenta = ?
        GROUP BY v.idVenta`, [
            req.query.idVenta
        ]);

        if (result.length > 0) {
            let detalle = await conec.query(`SELECT 
            l.descripcion AS lote,
            m.nombre AS manzana, 
            p.nombre AS proyecto,
            vd.precio,
            vd.cantidad,
            vd.idImpuesto,
            imp.nombre as impuesto,
            imp.porcentaje
            FROM ventaDetalle AS vd 
            INNER JOIN lote AS l ON vd.idLote = l.idLote 
            INNER JOIN manzana AS m ON l.idManzana = m.idManzana 
            INNER JOIN proyecto AS p ON m.idProyecto = p.idProyecto
            INNER JOIN impuesto AS imp ON vd.idImpuesto  = imp.idImpuesto 
            WHERE idVenta = ? `, [
                req.query.idVenta
            ]);

            res.status(200).send({
                "cabecera": result[0],
                "detalle": detalle
            })
        } else {
            res.status(400).send("Datos no encontrados")
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Error interno de conexión, intente nuevamente.")
    }
});

router.get("/credito", async function (req, res) {
    try {
        let lista = await conec.query(`SELECT 
        v.idVenta, 
        cl.idCliente,
        cl.documento, 
        cl.informacion, 
        cm.nombre, 
        v.serie, 
        v.numeracion, 
        v.numCuota, 
        (SELECT IFNULL(MIN(fecha),'') FROM plazo WHERE estado = 0) AS fechaPago,
        v.fecha, 
        v.hora, 
        v.estado,
        m.idMoneda,
        m.simbolo,
        IFNULL(SUM(vd.precio*vd.cantidad),0) AS total,
        (SELECT IFNULL(SUM(cv.precio),0) FROM cobro AS c LEFT JOIN cobroVenta AS cv ON c.idCobro = cv.idCobro WHERE c.idProcedencia = v.idVenta ) AS cobrado 
        FROM venta AS v 
        INNER JOIN moneda AS m ON m.idMoneda = v.idMoneda
        INNER JOIN comprobante AS cm ON v.idComprobante = cm.idComprobante 
        INNER JOIN cliente AS cl ON v.idCliente = cl.idCliente 
        LEFT JOIN ventaDetalle AS vd ON vd.idVenta = v.idVenta 
        WHERE  
        ? = 0 AND v.estado = 2 
        OR
        ? = 1 and cl.informacion like concat(?,'%') AND v.estado = 2 
        OR
        ? = 1 and cl.documento like concat(?,'%') AND v.estado = 2 
        GROUP BY v.idVenta
        ORDER BY v.fecha DESC, v.hora DESC
        LIMIT ?,?`, [
            parseInt(req.query.opcion),

            parseInt(req.query.opcion),
            req.query.buscar,

            parseInt(req.query.opcion),
            req.query.buscar,

            parseInt(req.query.posicionPagina),
            parseInt(req.query.filasPorPagina)
        ]);

        let resultLista = lista.map(function (item, index) {
            return {
                ...item,
                id: (index + 1) + parseInt(req.query.posicionPagina)
            }
        });

        let total = await conec.query(`SELECT COUNT(*) AS Total 
        FROM venta AS v 
        INNER JOIN moneda AS m ON m.idMoneda = v.idMoneda
        INNER JOIN comprobante AS cm ON v.idComprobante = cm.idComprobante 
        INNER JOIN cliente AS cl ON v.idCliente = cl.idCliente  
        WHERE  
        ? = 0 AND v.estado = 2 
        OR
        ? = 1 and cl.informacion like concat(?,'%') AND v.estado = 2 
        OR
        ? = 1 and cl.documento like concat(?,'%') AND v.estado = 2 `, [
            parseInt(req.query.opcion),

            parseInt(req.query.opcion),
            req.query.buscar,

            parseInt(req.query.opcion),
            req.query.buscar
        ]);

        res.status(200).send({ "result": resultLista, "total": total[0].Total })
    } catch (error) {
        res.status(500).send("Error interno de conexión, intente nuevamente.")
    }
});

router.get("/credito/detalle", async function (req, res) {
    const result = await factura.detalleCredito(req)
    if (typeof result === 'object') {
        res.status(200).send(result)
    } else {
        res.status(500).send(result)
    }
});

router.get("/repcreditolote", async function (req, res) {

    const sedeInfo = await sede.infoSedeReporte(req)

    if (typeof sedeInfo !== 'object') {
        res.status(500).send(sedeInfo)
        return;
    }

    const detalle = await factura.detalleCredito(req)

    if (typeof detalle === 'object') {

        let data = await repCuota.repDetalleCuota(req, sedeInfo, detalle)

        if (typeof data === 'string') {
            res.status(500).send(data)
            console.log(data)
        } else {
            res.contentType("application/pdf");
            res.send(data);
        }
    } else {
        res.status(500).send(detalle)
        cosnsole.log(detalle)
    }


})

module.exports = router;