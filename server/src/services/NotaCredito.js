const Conexion = require('../database/Conexion');
const { currentDate, currentTime } = require('../tools/Tools');
const { sendSuccess, sendClient, sendSave, sendError } = require('../tools/Message');
const conec = new Conexion();

class NotaCredito {

    async list(req, res) {
        try {
            let lista = await conec.query(`SELECT 
            nc.idNotaCredito,
            co.nombre AS comprobante,
            nc.serie,
            nc.numeracion,
            DATE_FORMAT(nc.fecha,'%d/%m/%Y') as fecha, 
            nc.hora, 
            nc.estado,

            cl.documento,
            cl.informacion,

            coc.nombre AS comprobanteModi,
            c.serie AS serieModi,
            c.numeracion AS numeracionModi,

            m.idMoneda,
            m.codiso,
            IFNULL(SUM(ncd.precio*ncd.cantidad),0) AS total

            FROM 
            notaCredito AS nc 
            INNER JOIN comprobante AS co ON co.idComprobante = nc.idComprobante
            INNER JOIN cliente AS cl ON cl.idCliente = nc.idCliente 
            INNER JOIN moneda AS m ON nc.idMoneda = m.idMoneda
            INNER JOIN cobro AS c ON nc.idCobro = c.idCobro
            INNER JOIN comprobante AS coc ON coc.idComprobante = c.idComprobante 
            LEFT JOIN notaCreditoDetalle AS ncd ON ncd.idNotaCredito = nc.idNotaCredito 

            WHERE 
            ? = 0 AND nc.idProyecto = ?
            OR
            ? = 1 and cl.documento = ? AND nc.idProyecto = ?
            OR
            ? = 1 and cl.informacion like concat(?,'%') AND nc.idProyecto = ?

            OR
            ? = 1 and nc.serie = ? AND nc.idProyecto = ?
            OR
            ? = 1 and nc.numeracion = ? AND nc.idProyecto = ?
            OR
            ? = 1 and concat(nc.serie,'-',nc.numeracion) = ? AND nc.idProyecto = ?

            GROUP BY nc.idNotaCredito
            ORDER BY nc.fecha DESC, nc.hora DESC
            LIMIT ?,?`, [
                parseInt(req.query.opcion),
                req.query.idProyecto,

                parseInt(req.query.opcion),
                req.query.buscar,
                req.query.idProyecto,

                parseInt(req.query.opcion),
                req.query.buscar,
                req.query.idProyecto,

                parseInt(req.query.opcion),
                req.query.buscar,
                req.query.idProyecto,

                parseInt(req.query.opcion),
                req.query.buscar,
                req.query.idProyecto,

                parseInt(req.query.opcion),
                req.query.buscar,
                req.query.idProyecto,

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
            FROM 
            notaCredito AS nc 
            INNER JOIN comprobante AS co ON co.idComprobante = nc.idComprobante
            INNER JOIN cliente AS cl ON cl.idCliente = nc.idCliente
            INNER JOIN moneda AS m ON nc.idMoneda = m.idMoneda
            INNER JOIN cobro AS c ON nc.idCobro = c.idCobro
            INNER JOIN comprobante AS coc ON coc.idComprobante = c.idComprobante 
            WHERE 
            ? = 0 AND nc.idProyecto = ?
            OR
            ? = 1 and cl.documento = ? AND nc.idProyecto = ?
            OR
            ? = 1 and cl.informacion like concat(?,'%') AND nc.idProyecto = ?
            
            OR
            ? = 1 and nc.serie = ? AND nc.idProyecto = ?
            OR
            ? = 1 and nc.numeracion = ? AND nc.idProyecto = ?
            OR
            ? = 1 and concat(nc.serie,'-',nc.numeracion) = ? AND nc.idProyecto = ?`, [
                parseInt(req.query.opcion),
                req.query.idProyecto,

                parseInt(req.query.opcion),
                req.query.buscar,
                req.query.idProyecto,

                parseInt(req.query.opcion),
                req.query.buscar,
                req.query.idProyecto,
                
                parseInt(req.query.opcion),
                req.query.buscar,
                req.query.idProyecto,

                parseInt(req.query.opcion),
                req.query.buscar,
                req.query.idProyecto,

                parseInt(req.query.opcion),
                req.query.buscar,
                req.query.idProyecto,
            ]);

            return sendSuccess(res, { "result": resultLista, "total": total[0].Total });
        } catch (error) {
            return sendError(res, "Se produjo un error de servidor, intente nuevamente.");
        }
    }

    async id(req, res) {
        try {

            let result = await conec.query(`SELECT 
            nc.idNotaCredito,
            mt.nombre AS motivo,
            co.nombre AS comprobante,
            nc.serie,
            nc.numeracion,
            DATE_FORMAT(nc.fecha,'%d/%m/%Y') as fecha, 
            nc.hora, 
            nc.estado,

            td.nombre AS tipoDoc,      
            td.codigo AS codigoCliente,      
            cl.documento,
            cl.informacion,
            cl.direccion,

            coc.nombre AS comprobanteModi,
            c.serie AS serieModi,
            c.numeracion AS numeracionModi,

            CONCAT(us.nombres,' ',us.apellidos) AS usuario,

            m.idMoneda,
            m.codiso,
            IFNULL(SUM(ncd.precio*ncd.cantidad),0) AS total

            FROM 
            notaCredito AS nc 
            INNER JOIN motivo AS mt ON mt.idMotivo = nc.idMotivo 
            INNER JOIN comprobante AS co ON co.idComprobante = nc.idComprobante
            INNER JOIN cliente AS cl ON cl.idCliente = nc.idCliente 
            INNER JOIN tipoDocumento AS td ON td.idTipoDocumento = cl.idTipoDocumento 
            INNER JOIN usuario AS us ON us.idUsuario = nc.idUsuario
            INNER JOIN moneda AS m ON nc.idMoneda = m.idMoneda
            INNER JOIN cobro AS c ON nc.idCobro = c.idCobro
            INNER JOIN comprobante AS coc ON coc.idComprobante = c.idComprobante 
            LEFT JOIN notaCreditoDetalle AS ncd ON ncd.idNotaCredito = nc.idNotaCredito 

            WHERE nc.idNotaCredito = ?`, [
                req.query.idNotaCredito
            ]);

            if (result.length > 0) {

                let detalle = await conec.query(`SELECT 
                CASE 
                WHEN nc.tipo = 0 THEN CONCAT('CUOTA',' ',pl.cuota)
                ELSE co.nombre END AS concepto,
                md.nombre AS unidad,
                nc.cantidad,
                nc.precio,
                nc.idImpuesto,
                imp.nombre AS impuesto,
                imp.porcentaje
                FROM notaCreditoDetalle AS nc 
                LEFT JOIN concepto AS co ON co.idConcepto = nc.idConcepto
                LEFT JOIN plazo AS pl ON pl.idPlazo = nc.idPlazo 
                INNER JOIN medida AS md ON md.idMedida = nc.idMedida
                INNER JOIN impuesto AS imp ON imp.idImpuesto = nc.idImpuesto
                WHERE nc.idNotaCredito = ?`, [
                    req.query.idNotaCredito
                ]);

                return sendSuccess(res, { "cabecera": result[0], "detalle": detalle });
            } else {
                return sendClient(res, "Datos no encontrados");
            }
        } catch (error) {            
            return sendError(res, "Se produjo un error de servidor, intente nuevamente.");
        }
    }

    async idReport(req) {
        try {

            let result = await conec.query(`SELECT 
            nc.idNotaCredito,
            mt.nombre AS motivo,
            co.nombre AS comprobante,
            nc.serie,
            nc.numeracion,
            DATE_FORMAT(nc.fecha,'%d/%m/%Y') AS fecha, 
            nc.hora, 
            nc.estado,

            td.nombre AS tipoDoc,      
            td.codigo AS codigoCliente,      
            cl.documento,
            cl.informacion,
            cl.direccion,
            cl.email,

            coc.nombre AS comprobanteModi,
            c.serie AS serieModi,
            c.numeracion AS numeracionModi,

            CONCAT(us.nombres,' ',us.apellidos) AS usuario,

            m.idMoneda,
            m.nombre AS moneda,
            m.codiso,
            IFNULL(SUM(ncd.precio*ncd.cantidad),0) AS total

            FROM 
            notaCredito AS nc 
            INNER JOIN motivo AS mt ON mt.idMotivo = nc.idMotivo 
            INNER JOIN comprobante AS co ON co.idComprobante = nc.idComprobante
            INNER JOIN cliente AS cl ON cl.idCliente = nc.idCliente 
            INNER JOIN tipoDocumento AS td ON td.idTipoDocumento = cl.idTipoDocumento 
            INNER JOIN usuario AS us ON us.idUsuario = nc.idUsuario
            INNER JOIN moneda AS m ON nc.idMoneda = m.idMoneda
            INNER JOIN cobro AS c ON nc.idCobro = c.idCobro
            INNER JOIN comprobante AS coc ON coc.idComprobante = c.idComprobante 
            LEFT JOIN notaCreditoDetalle AS ncd ON ncd.idNotaCredito = nc.idNotaCredito 

            WHERE nc.idNotaCredito = ?`, [
                req.query.idNotaCredito
            ]);

            if (result.length > 0) {

                let detalle = await conec.query(`SELECT 
                CASE 
                WHEN nc.tipo = 0 THEN CONCAT('CUOTA',' ',pl.cuota)
                ELSE co.nombre END AS concepto,
                md.nombre AS unidad,
                nc.cantidad,
                nc.precio,
                nc.idImpuesto,
                imp.nombre AS impuesto,
                imp.porcentaje
                FROM notaCreditoDetalle AS nc 
                LEFT JOIN concepto AS co ON co.idConcepto = nc.idConcepto
                LEFT JOIN plazo AS pl ON pl.idPlazo = nc.idPlazo 
                INNER JOIN medida AS md ON md.idMedida = nc.idMedida
                INNER JOIN impuesto AS imp ON imp.idImpuesto = nc.idImpuesto
                WHERE nc.idNotaCredito = ?`, [
                    req.query.idNotaCredito
                ]);

                return { "cabecera": result[0], "detalle": detalle };
            } else {
                return "Datos no encontrados";
            }
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async add(req, res) {
        let connection = null;
        try {
            connection = await conec.beginTransaction();

            let anulado = await conec.execute(connection, `SELECT idCobro FROM cobro 
            WHERE idCobro = ? AND estado = 0`, [
                req.body.idCobro,
            ]);

            if (anulado.length > 0) {
                await conec.rollback(connection);
                return sendClient(res, "No se puede asignar una nota de crédito a un comprobante anulado.");
            }

            let validate = await conec.execute(connection, `SELECT c.idCobro 
            FROM cobro AS c INNER JOIN notaCredito AS nc 
            ON c.idCobro = nc.idCobro
            WHERE c.idCobro = ?`, [
                req.body.idCobro,
            ]);

            if (validate.length > 0) {
                await conec.rollback(connection);
                return sendClient(res, "El comprobante ya tiene asociado una nota de crédito.");
            }

            let result = await conec.execute(connection, 'SELECT idNotaCredito FROM notaCredito');
            let idNotaCredito = "";
            if (result.length != 0) {

                let quitarValor = result.map(function (item) {
                    return parseInt(item.idNotaCredito.replace("NC", ''));
                });

                let valorActual = Math.max(...quitarValor);
                let incremental = valorActual + 1;
                let codigoGenerado = "";
                if (incremental <= 9) {
                    codigoGenerado = 'NC000' + incremental;
                } else if (incremental >= 10 && incremental <= 99) {
                    codigoGenerado = 'NC00' + incremental;
                } else if (incremental >= 100 && incremental <= 999) {
                    codigoGenerado = 'NC0' + incremental;
                } else {
                    codigoGenerado = 'NC' + incremental;
                }

                idNotaCredito = codigoGenerado;
            } else {
                idNotaCredito = "NC0001";
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

            let notaCredito = await conec.execute(connection, 'SELECT numeracion FROM notaCredito WHERE idComprobante = ?', [
                req.body.idComprobante
            ]);

            if (notaCredito.length > 0) {
                let quitarValor = notaCredito.map(function (item) {
                    return parseInt(item.numeracion);
                });

                let valorActual = Math.max(...quitarValor);
                let incremental = valorActual + 1;
                numeracion = incremental;
            } else {
                numeracion = comprobante[0].numeracion;
            }

            await conec.execute(connection, `INSERT INTO notaCredito(
                idNotaCredito,
                idCliente,
                idUsuario,
                idMoneda,
                idCobro,
                idProyecto,
                idComprobante,
                idMotivo,
                serie,
                numeracion,
                estado,
                observacion,
                fecha,
                hora) 
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
                idNotaCredito,
                req.body.idCliente,
                req.body.idUsuario,
                req.body.idMoneda,
                req.body.idCobro,
                req.body.idProyecto,
                req.body.idComprobante,
                req.body.idMotivo,
                comprobante[0].serie,
                numeracion,
                1,
                '',
                req.body.fecha,
                currentTime()
            ]);

            for (let item of req.body.detalle) {
                await conec.execute(connection, `INSERT INTO notaCreditoDetalle(
                idNotaCredito,
                tipo,
                idConcepto,
                idPlazo,
                precio,
                cantidad,
                idImpuesto,
                idMedida) 
                VALUES(?,?,?,?,?,?,?,?)`, [
                    idNotaCredito,
                    item.tipo,
                    item.idConcepto,
                    item.idPlazo,
                    item.precio,
                    item.cantidad,
                    item.idImpuesto,
                    item.idMedida
                ]);
            }

            let cobro = await conec.execute(connection, `SELECT idCobro,idProcedencia,serie,numeracion 
                FROM cobro 
                WHERE idCobro = ?`, [
                req.body.idCobro
            ]);

            let venta = await conec.execute(connection, `SELECT idVenta,credito 
                FROM venta 
                WHERE idVenta  = ?`, [
                cobro[0].idProcedencia
            ]);

            let cobroVenta = await conec.execute(connection, `SELECT idPlazo 
                FROM cobroVenta 
                WHERE idCobro = ?`, [
                req.body.idCobro
            ]);

            if (venta.length > 0) {
                if (venta[0].credito === 1) {
                    await conec.execute(connection, `DELETE FROM plazo WHERE idPlazo = ?`, [
                        cobroVenta[0].idPlazo
                    ]);
                } else {
                    let suma = await conec.execute(connection, `SELECT
                    IFNULL(cv.precio,0) AS total 
                    FROM cobro AS c 
                    INNER JOIN cobroVenta cv ON c.idCobro = cv.idCobro 
                    LEFT JOIN notaCredito AS nc ON nc.idCobro = c.idCobro
                    WHERE cv.idPlazo = ? AND c.estado = 1 AND nc.idNotaCredito IS NULL`, [
                        cobroVenta[0].idPlazo
                    ]);

                    let sumaTotal = suma.map(item => item.total).reduce((prev, current) => prev + current, 0)

                    let actual = await conec.execute(connection, `SELECT 
                        IFNULL(precio,0) AS total 
                        FROM cobroVenta 
                        WHERE idCobro = ?`, [
                        req.body.idCobro
                    ]);

                    let plazoSuma = await conec.execute(connection, `SELECT 
                        IFNULL(monto,0) AS total 
                        FROM plazo 
                        WHERE idPlazo = ?`, [
                        cobroVenta[0].idPlazo
                    ]);

                    if (plazoSuma[0].total > sumaTotal - actual[0].total) {
                        await conec.execute(connection, `UPDATE plazo SET estado = 0 
                        WHERE idPlazo = ?`, [
                            cobroVenta[0].idPlazo
                        ]);
                    }
                }

                let total = await conec.execute(connection, `SELECT 
                    IFNULL(SUM(vd.precio*vd.cantidad),0) AS total 
                    FROM venta AS v
                    LEFT JOIN ventaDetalle AS vd ON v.idVenta  = vd.idVenta
                    WHERE v.idVenta  = ?`, [
                    venta[0].idVenta
                ]);

                let cobrado = await conec.execute(connection, `SELECT 
                    IFNULL(SUM(cv.precio),0) AS total
                    FROM cobro AS c 
                    INNER JOIN cobroVenta AS cv ON c.idCobro = cv.idCobro
                    LEFT JOIN notaCredito AS nc ON nc.idCobro = c.idCobro
                    WHERE c.idProcedencia = ? AND c.estado = 1 AND nc.idNotaCredito IS NULL`, [
                    venta[0].idVenta
                ]);

                let actual = await conec.execute(connection, `SELECT 
                    IFNULL(SUM(cv.precio),0) AS total
                    FROM cobro AS c 
                    LEFT JOIN cobroVenta AS cv ON c.idCobro = cv.idCobro
                    WHERE c.idCobro = ?`, [
                    req.body.idCobro
                ]);

                let montoCobrado = cobrado[0].total - actual[0].total;
                if (montoCobrado < total[0].total) {
                    await conec.execute(connection, `UPDATE venta SET estado = 2
                    WHERE idVenta = ?`, [
                        venta[0].idVenta
                    ]);
                }
            }

            await conec.execute(connection, `UPDATE cobro SET observacion = ? WHERE idCobro = ?`, [
                req.query.idCobro,
                `ANULACIÓN CON NOTA DE CRÉDITO`
            ]);

            await conec.execute(connection, `DELETE FROM bancoDetalle WHERE idProcedencia  = ?`, [
                req.body.idCobro
            ]);

            let resultAuditoria = await conec.execute(connection, 'SELECT idAuditoria FROM auditoria');
            let idAuditoria = 0;
            if (resultAuditoria.length != 0) {
                let quitarValor = resultAuditoria.map(function (item) {
                    return parseInt(item.idAuditoria);
                });

                let valorActual = Math.max(...quitarValor);
                let incremental = valorActual + 1;

                idAuditoria = incremental;
            } else {
                idAuditoria = 1;
            }

            await conec.execute(connection, `INSERT INTO auditoria(
                        idAuditoria,
                        idProcedencia,
                        descripcion,
                        fecha,
                        hora,
                        idUsuario) 
                        VALUES(?,?,?,?,?,?)`, [
                idAuditoria,
                cobro[0].idCobro,
                `ANULACIÓN CON NOTA DE CRÉDITO ${cobro[0].serie}-${cobro[0].numeracion}`,
                currentDate(),
                currentTime(),
                req.body.idUsuario,
            ]);

            await conec.commit(connection);

            return sendSave(res, "Se registró correctamente la nota de crédito.");
        } catch (error) {
            if (connection != null) {
                await conec.rollback(connection);
            }
            return sendError(res, "Se produjo un error de servidor, intente nuevamente.");
        }
    }

    async xmlGenerate(req) {
        try {
            let xml = await conec.query(`SELECT 
            co.nombre AS comprobante,
            nc.serie,
            nc.numeracion,
            nc.xmlGenerado 
            FROM notaCredito AS nc
            INNER JOIN comprobante AS co ON co.idComprobante = nc.idComprobante 
            WHERE nc.idNotaCredito = ? AND nc.xmlSunat = ?`, [
                req.query.idNotaCredito,
                req.query.xmlSunat,
            ]);

            if (xml.length > 0) {
                return xml[0];
            } else {
                return "Datos no encontrados";
            }
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

}

module.exports = new NotaCredito();