const { currentDate, currentTime } = require('../tools/Tools');
const Conexion = require('../database/Conexion');
const conec = new Conexion();

class Cobro {

    async list(req) {
        try {
            let lista = await conec.query(`SELECT 
            c.idCobro, 
            co.nombre as comprobante,
            c.serie,
            c.numeracion,
            cl.documento,
            cl.informacion,  
            CASE 
            WHEN cn.idConcepto IS NOT NULL THEN cn.nombre
            ELSE CONCAT(cp.nombre,': ',v.serie,'-',v.numeracion) END AS detalle,
            m.simbolo,
            b.nombre as banco,  
            c.observacion, 
            DATE_FORMAT(c.fecha,'%d/%m/%Y') as fecha, 
            c.hora,
            IFNULL(SUM(cd.precio*cd.cantidad),SUM(cv.precio)) AS monto
            FROM cobro AS c
            INNER JOIN cliente AS cl ON c.idCliente = cl.idCliente
            INNER JOIN banco AS b ON c.idBanco = b.idBanco
            INNER JOIN moneda AS m ON c.idMoneda = m.idMoneda 
            INNER JOIN comprobante AS co ON co.idComprobante = c.idComprobante
            LEFT JOIN cobroDetalle AS cd ON c.idCobro = cd.idCobro
            LEFT JOIN concepto AS cn ON cd.idConcepto = cn.idConcepto 
            LEFT JOIN cobroVenta AS cv ON cv.idCobro = c.idCobro 
            LEFT JOIN venta AS v ON cv.idVenta = v.idVenta 
            LEFT JOIN comprobante AS cp ON v.idComprobante = cp.idComprobante
            WHERE 
            ? = 0 AND c.idProyecto = ?
            OR
            ? = 1 AND cl.informacion LIKE CONCAT(?,'%') AND c.idProyecto = ?
            GROUP BY c.idCobro
            ORDER BY c.fecha DESC,c.hora DESC
            LIMIT ?,?`, [
                parseInt(req.query.opcion),
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
            FROM cobro AS c
            INNER JOIN cliente AS cl ON c.idCliente = cl.idCliente
            INNER JOIN banco AS b ON c.idBanco = b.idBanco
            INNER JOIN moneda AS m ON c.idMoneda = m.idMoneda 
            WHERE 
            ? = 0 AND c.idProyecto = ?
            OR
            ? = 1 AND cl.informacion LIKE CONCAT(?,'%') AND c.idProyecto = ?`, [
                parseInt(req.query.opcion),
                req.query.idProyecto,

                parseInt(req.query.opcion),
                req.query.buscar,
                req.query.idProyecto,
            ]);

            return { "result": resultLista, "total": total[0].Total };
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async add(req) {
        let connection = null;
        try {
            connection = await conec.beginTransaction();

            let result = await conec.execute(connection, 'SELECT idCobro FROM cobro');
            let idCobro = "";
            if (result.length != 0) {

                let quitarValor = result.map(function (item) {
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

            let comprobante = await conec.execute(connection, `SELECT 
            serie,
            numeracion 
            FROM comprobante 
            WHERE idComprobante  = ?
            `, [
                req.body.idComprobante
            ]);

            let numeracion = 0;

            let cobros = await conec.execute(connection, 'SELECT numeracion FROM cobro WHERE idComprobante = ?', [
                req.body.idComprobante
            ]);

            if (cobros.length > 0) {
                let quitarValor = cobros.map(function (item) {
                    return parseInt(item.numeracion);
                });

                let valorActual = Math.max(...quitarValor);
                let incremental = valorActual + 1;
                numeracion = incremental;
            } else {
                numeracion = comprobante[0].numeracion;
            }

            await conec.execute(connection, `INSERT INTO cobro(
            idCobro, 
            idCliente, 
            idUsuario, 
            idMoneda, 
            idBanco, 
            idProcedencia,
            idProyecto,
            idComprobante,
            serie,
            numeracion,
            metodoPago, 
            estado, 
            observacion, 
            fecha, 
            hora) 
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
                idCobro,
                req.body.idCliente,
                req.body.idUsuario,
                req.body.idMoneda,
                req.body.idBanco,
                req.body.idProcedencia,
                req.body.idProyecto,
                req.body.idComprobante,
                comprobante[0].serie,
                numeracion,
                req.body.metodoPago,
                req.body.estado,
                req.body.observacion,
                currentDate(),
                currentTime()
            ]);

            let monto = 0;
            for (let item of req.body.cobroDetalle) {
                await conec.execute(connection, `INSERT INTO cobroDetalle(
                idCobro, 
                idConcepto, 
                precio, 
                cantidad, 
                idImpuesto)
                VALUES(?,?,?,?,?)`, [
                    idCobro,
                    item.idConcepto,
                    item.monto,
                    item.cantidad,
                    item.idImpuesto
                ])
                monto += item.cantidad * item.monto;
            }

            await conec.execute(connection, `INSERT INTO bancoDetalle(
            idBanco,
            idProcedencia,
            tipo,
            monto,
            fecha,
            hora,
            idUsuario)
            VALUES(?,?,?,?,?,?,?)`, [
                req.body.idBanco,
                idCobro,
                1,
                monto,
                currentDate(),
                currentTime(),
                req.body.idUsuario,
            ]);

            await conec.commit(connection);
            return 'insert';
        } catch (error) {
            if (connection != null) {
                await conec.rollback(connection);
            }
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async cobro(req) {
        let connection = null;
        try {
            connection = await conec.beginTransaction();

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

            let total = await conec.execute(connection, `SELECT 
            IFNULL(SUM(vd.precio*vd.cantidad),0) AS total 
            FROM venta AS v
            LEFT JOIN ventaDetalle AS vd ON v.idVenta  = vd.idVenta
            WHERE v.idVenta  = ?`, [
                req.body.idVenta,
            ]);

            let cobrado = await conec.execute(connection, `SELECT 
            IFNULL(SUM(cv.precio),0) AS total
            FROM cobro AS c 
            LEFT JOIN cobroVenta AS cv ON c.idCobro = cv.idCobro
            WHERE c.idProcedencia = ?`, [
                req.body.idVenta,
            ]);

            let comprobante = await conec.execute(connection, `SELECT 
            serie,
            numeracion 
            FROM comprobante 
            WHERE idComprobante  = ?
            `, [
                req.body.idComprobante
            ]);

            let numeracion = 0;

            let cobros = await conec.execute(connection, 'SELECT numeracion FROM cobro WHERE idComprobante = ?', [
                req.body.idComprobante
            ]);

            if (cobros.length > 0) {
                let quitarValor = cobros.map(function (item) {
                    return parseInt(item.numeracion);
                });

                let valorActual = Math.max(...quitarValor);
                let incremental = valorActual + 1;
                numeracion = incremental;
            } else {
                numeracion = comprobante[0].numeracion;
            }

            await conec.execute(connection, `INSERT INTO cobro(
            idCobro, 
            idCliente, 
            idUsuario, 
            idMoneda, 
            idBanco, 
            idProcedencia,
            idProyecto,
            idComprobante,
            serie,
            numeracion,
            metodoPago, 
            estado, 
            observacion, 
            fecha, 
            hora) 
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
                idCobro,
                req.body.idCliente,
                req.body.idUsuario,
                req.body.idMoneda,
                req.body.idBanco,
                req.body.idVenta,
                req.body.idProyecto,
                req.body.idComprobante,
                comprobante[0].serie,
                numeracion,
                req.body.metodoPago,
                req.body.estado,
                req.body.observacion,
                currentDate(),
                currentTime()
            ]);

            let montoCobrado = cobrado[0].total + parseFloat(req.body.valorRecibido);
            if (montoCobrado >= total[0].total) {
                await conec.execute(connection, `UPDATE venta SET estado = 1 WHERE idVenta = ?`, [
                    req.body.idVenta,
                ]);
            }

            let monto = 0;

            for (let item of req.body.plazos) {
                if (item.selected) {
                    await conec.execute(connection, `INSERT INTO cobroVenta(
                    idCobro,
                    idVenta,
                    idPlazo,
                    precio) 
                    VALUES (?,?,?,?)`, [
                        idCobro,
                        req.body.idVenta,
                        item.idPlazo,
                        parseFloat(item.monto)
                    ]);

                    await conec.execute(connection, `UPDATE plazo 
                SET estado = 1
                WHERE idPlazo  = ?
                `, [
                        item.idPlazo
                    ]);

                    monto += parseFloat(item.monto)
                }
            }

            await conec.execute(connection, `INSERT INTO bancoDetalle(
            idBanco,
            idProcedencia,
            tipo,
            monto,
            fecha,
            hora,
            idUsuario)
            VALUES(?,?,?,?,?,?,?)`, [
                req.body.idBanco,
                idCobro,
                1,
                monto,
                currentDate(),
                currentTime(),
                req.body.idUsuario,
            ]);

            await conec.commit(connection);
            return "insert";
        } catch (error) {
            if (connection != null) {
                await conec.rollback(connection);
            }
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async id(req) {
        try {
            let result = await conec.query(`SELECT
            c.idCobro,
            co.nombre as comprobante,
            c.serie,
            c.numeracion,
            c.metodoPago,
            c.estado,
            c.observacion,
            DATE_FORMAT(c.fecha,'%d/%m/%Y') as fecha,
            c.hora,
            
            td.nombre AS tipoDoc,  
            cl.documento,
            cl.informacion,
            cl.direccion,
    
            b.nombre as banco,   
                     
            m.nombre as moneda,
            m.codiso,
            m.simbolo,
    
            IFNULL(SUM(cb.precio*cb.cantidad),SUM(cv.precio)) AS monto
    
            FROM cobro AS c
            INNER JOIN cliente AS cl ON c.idCliente = cl.idCliente
            INNER JOIN tipoDocumento AS td ON td.idTipoDocumento = cl.idTipoDocumento 
            INNER JOIN banco AS b ON c.idBanco = b.idBanco
            INNER JOIN moneda AS m ON c.idMoneda = m.idMoneda
            INNER JOIN comprobante AS co ON co.idComprobante = c.idComprobante
            LEFT JOIN cobroDetalle AS cb ON c.idCobro = cb.idCobro
            LEFT JOIN cobroVenta AS cv ON c.idCobro  = cv.idCobro 
            WHERE c.idCobro = ?
            GROUP BY  c.idCobro`, [
                req.query.idCobro
            ]);

            if (result.length > 0) {

                let detalle = await conec.query(`SELECT 
                co.nombre as concepto,
                cd.precio,
                cd.cantidad,
                imp.idImpuesto,
                imp.nombre as impuesto,
                imp.porcentaje
                FROM cobroDetalle AS cd 
                INNER JOIN concepto AS co ON cd.idConcepto = co.idConcepto
                INNER JOIN impuesto AS imp ON cd.idImpuesto  = imp.idImpuesto 
                WHERE cd.idCobro = ?
                `, [
                    req.query.idCobro
                ]);

                let venta = await conec.query(`SELECT  
                cp.nombre AS comprobante,
                v.serie,
                v.numeracion,
                (SELECT IFNULL(SUM(vd.precio*vd.cantidad),0) FROM ventaDetalle AS vd WHERE vd.idVenta = v.idVenta ) AS total,
                (SELECT IFNULL(SUM(cv.precio),0) FROM cobroVenta AS cv WHERE cv.idVenta = v.idVenta ) AS cobrado,
                cv.precio
                FROM cobroVenta AS cv
                INNER JOIN venta AS v ON cv.idVenta = v.idVenta 
                INNER JOIN comprobante AS cp ON v.idComprobante = cp.idComprobante
                WHERE cv.idCobro = ?`, [
                    req.query.idCobro
                ]);

                return {
                    "cabecera": result[0],
                    "detalle": detalle,
                    "venta": venta
                };
            } else {
                return "Datos no encontrados";
            }

        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async delete(req) {
        let connection = null;
        try {
            connection = await conec.beginTransaction();

            let cobro = await conec.execute(connection, `SELECT idProcedencia FROM cobro WHERE idCobro = ?`, [
                req.query.idCobro
            ]);

            if (cobro.length > 0) {
                let venta = await conec.execute(connection, `SELECT idVenta FROM venta WHERE idVenta  = ?`, [
                    cobro[0].idProcedencia
                ]);

                if (venta.length > 0) {
                    let plazos = await conec.execute(connection, `SELECT idPlazo,estado FROM plazo 
                    WHERE idVenta = ? AND estado = 1`, [
                        venta[0].idVenta
                    ]);

                    let arrPlazos = plazos.map(function (item) {
                        return item.idPlazo;
                    });

                    let maxPlazo = Math.max(...arrPlazos);

                    let cobroVenta = await conec.execute(connection, `SELECT idPlazo FROM cobroVenta 
                    WHERE idCobro = ?`, [
                        req.query.idCobro
                    ]);

                    let arrCobroVenta = cobroVenta.map(function (item) {
                        return item.idPlazo;
                    });

                    let maxCobroVenta = Math.max(...arrCobroVenta);

                    if (maxPlazo == maxCobroVenta) {
                        for (let item of cobroVenta) {
                            await conec.execute(connection, `UPDATE plazo SET estado = 0 WHERE idPlazo = ?`, [
                                item.idPlazo
                            ]);
                        }

                        await conec.execute(connection, `UPDATE venta SET estado = 2
                        WHERE idVenta = ?`, [
                            venta[0].idVenta
                        ]);
                    } else {
                        res.status(400).send("No se puede eliminar el cobro ya tiene plazos ligados que son inferiores.");
                        return;
                    }
                }
            }

            await conec.execute(connection, `DELETE FROM cobro WHERE idCobro = ?`, [
                req.query.idCobro
            ]);

            await conec.execute(connection, `DELETE FROM cobroDetalle WHERE idCobro = ?`, [
                req.query.idCobro
            ]);

            await conec.execute(connection, `DELETE FROM cobroVenta WHERE idCobro = ?`, [
                req.query.idCobro
            ]);

            await conec.execute(connection, `DELETE FROM bancoDetalle WHERE idProcedencia  = ?`, [
                req.query.idCobro
            ]);

            await conec.commit(connection);
            return "delete";
        } catch (error) {
            if (connection != null) {
                await conec.rollback(connection);
            }
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async cobroGeneral(req) {
        try {

            let lista = await conec.query(`SELECT 
                c.idCobro,
                c.serie,
                c.numeracion,
                c.metodoPago,
                c.estado,
                c.observacion,
                DATE_FORMAT(c.fecha,'%d/%m/%Y') as fecha,  
                c.hora,
                
                comp.nombre AS comprobante,
                mn.simbolo,
                mn.codiso,
                bn.nombre AS banco,

                cl.informacion AS cliente,
                cl.documento AS docCliente,

                IFNULL(SUM(cd.precio * cd.cantidad),cv.precio) AS monto

                FROM cobro AS c
                INNER JOIN comprobante AS comp ON comp.idComprobante = c.idComprobante
                INNER JOIN moneda AS mn ON mn.idMoneda = c.idMoneda
                INNER JOIN banco AS bn ON bn.idBanco = c.idBanco
                INNER JOIN cliente AS cl ON cl.idCliente = c.idCliente
                LEFT JOIN cobroDetalle AS cd ON cd.idCobro = c.idCobro
                LEFT JOIN cobroVenta AS cv ON cv.idCobro = c.idCobro

                WHERE
                ( ? = 1 AND c.fecha BETWEEN ? AND ? )
                OR
                ( ? = 2 AND c.fecha BETWEEN ? AND ? AND c.idCliente = ? )
                OR
                ( ? = 3 AND c.fecha BETWEEN ? AND ? AND c.idBanco = ? )
                OR
                ( ? = 4 AND c.fecha BETWEEN ? AND ? AND c.idCliente = ? AND c.idBanco = ? )
                GROUP BY c.idCobro`, [
                req.query.opcion,
                req.query.fechaIni,
                req.query.fechaFin,

                req.query.opcion,
                req.query.fechaIni,
                req.query.fechaFin,
                req.query.idCliente,

                req.query.opcion,
                req.query.fechaIni,
                req.query.fechaFin,
                req.query.idBanco,

                req.query.opcion,
                req.query.fechaIni,
                req.query.fechaFin,
                req.query.idCliente,
                req.query.idBanco,
            ])

            return lista

        } catch (error) {
            // console.log(error)
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

}

module.exports = Cobro