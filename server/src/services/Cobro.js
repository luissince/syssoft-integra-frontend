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
            ELSE CASE WHEN cv.idPlazo = 0 THEN 'CUOTA INICIAL' ELSE CONCAT('CUOTA',' ',pl.cuota) END END AS detalle,
            IFNULL(CONCAT(cp.nombre,' ',v.serie,'-',v.numeracion),'') AS comprobanteRef,
            m.simbolo,
            m.codiso,
            b.nombre as banco,  
            c.observacion, 
            DATE_FORMAT(c.fecha,'%d/%m/%Y') as fecha, 
            c.hora,
            c.estado,
            IFNULL(SUM(cd.precio*cd.cantidad),SUM(cv.precio)) AS monto
            FROM cobro AS c
            INNER JOIN cliente AS cl ON c.idCliente = cl.idCliente
            INNER JOIN banco AS b ON c.idBanco = b.idBanco
            INNER JOIN moneda AS m ON c.idMoneda = m.idMoneda 
            INNER JOIN comprobante AS co ON co.idComprobante = c.idComprobante
            LEFT JOIN cobroDetalle AS cd ON c.idCobro = cd.idCobro
            LEFT JOIN concepto AS cn ON cd.idConcepto = cn.idConcepto 
            LEFT JOIN cobroVenta AS cv ON cv.idCobro = c.idCobro 
            LEFT JOIN plazo AS pl ON pl.idPlazo = cv.idPlazo
            LEFT JOIN venta AS v ON cv.idVenta = v.idVenta 
            LEFT JOIN comprobante AS cp ON v.idComprobante = cp.idComprobante
            WHERE 
            ? = 0 AND c.idProyecto = ?
            OR
            ? = 1 AND cl.informacion LIKE CONCAT(?,'%') AND c.idProyecto = ?
            OR
            ? = 1 AND c.serie = ? AND c.idProyecto = ?
            OR
            ? = 1 AND c.numeracion = ? AND c.idProyecto = ?
            OR
            ? = 1 AND CONCAT(c.serie,'-',c.numeracion) = ? AND c.idProyecto = ?

            GROUP BY c.idCobro
            ORDER BY c.fecha DESC,c.hora DESC
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
            ? = 1 AND cl.informacion LIKE CONCAT(?,'%') AND c.idProyecto = ?
            OR
            ? = 1 AND c.serie = ? AND c.idProyecto = ?
            OR
            ? = 1 AND c.numeracion = ? AND c.idProyecto = ?
            OR
            ? = 1 AND CONCAT(c.serie,'-',c.numeracion) = ? AND c.idProyecto = ?`, [
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
                idImpuesto,
                idMedida)
                VALUES(?,?,?,?,?,?)`, [
                    idCobro,
                    item.idConcepto,
                    item.monto,
                    item.cantidad,
                    item.idImpuesto,
                    item.idMedida,
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
                idCobro,
                `REGSITRO DEL COBRO ${comprobante[0].serie}-${numeracion}`,
                currentDate(),
                currentTime(),
                req.body.idUsuario
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

    async plazo(req) {
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

            let montoCobrado = cobrado[0].total + parseFloat(req.body.plazosSumados);
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
                    precio,
                    idImpuesto,
                    idMedida) 
                    VALUES (?,?,?,?,?,?)`, [
                        idCobro,
                        req.body.idVenta,
                        item.idPlazo,
                        parseFloat(item.monto),
                        req.body.idImpuesto,
                        req.body.idMedida,
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
                idCobro,
                `REGISTRO DEL COBRO ${comprobante[0].serie}-${numeracion}`,
                currentDate(),
                currentTime(),
                req.body.idUsuario
            ]);

            global.io.emit('message', `Cobro registrado :D`);

            await conec.commit(connection);
            return "insert";
        } catch (error) {
            if (connection != null) {
                await conec.rollback(connection);
            }
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async cuota(req) {
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

            let montoCobrado = cobrado[0].total + parseFloat(req.body.montoCuota);
            if (montoCobrado >= total[0].total) {
                await conec.execute(connection, `UPDATE venta SET estado = 1 WHERE idVenta = ?`, [
                    req.body.idVenta,
                ]);
            }

            let plazo = await conec.execute(connection, 'SELECT idPlazo FROM plazo');
            let idPlazo = 0;
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

            await conec.execute(connection, `INSERT INTO cobroVenta(
                idCobro,
                idVenta,
                idPlazo,
                precio,
                idImpuesto,
                idMedida) 
                VALUES (?,?,?,?,?,?)`, [
                idCobro,
                req.body.idVenta,
                idPlazo,
                parseFloat(req.body.montoCuota),
                req.body.idImpuesto,
                req.body.idMedida,
            ]);

            let cuota = await conec.execute(connection, `SELECT (IFNULL(MAX(cuota),0)+ 1) AS cuota 
            FROM  plazo 
            WHERE idVenta = ?`, [
                req.body.idVenta
            ]);

            await conec.execute(connection, `INSERT INTO plazo(
                idPlazo,
                idVenta,
                cuota,
                fecha,
                hora,
                monto,
                estado) 
                VALUES(?,?,?,?,?,?,?)`, [
                idPlazo,
                req.body.idVenta,
                cuota[0].cuota,
                currentDate(),
                currentTime(),
                parseFloat(req.body.montoCuota),
                1
            ]);

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
                parseFloat(req.body.montoCuota),
                currentDate(),
                currentTime(),
                req.body.idUsuario,
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
                idCobro,
                `REGISTRO DEL COBRO ${comprobante[0].serie}-${numeracion}`,
                currentDate(),
                currentTime(),
                req.body.idUsuario
            ]);

            global.io.emit('message', `Cobro registrado :D`);

            await conec.commit(connection);
            return "insert";
        } catch (error) {
            if (connection != null) {
                await conec.rollback(connection);
            }
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async adelanto(req) {
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

            let total = await conec.execute(connection, `SELECT * FROM plazo WHERE idPlazo = ?`, [
                req.body.idPlazo
            ]);

            let cobrado = await conec.execute(connection, `SELECT 
            IFNULL(SUM(cv.precio),0) AS total
            FROM cobro AS c 
            LEFT JOIN cobroVenta AS cv ON c.idCobro = cv.idCobro
            WHERE cv.idPlazo  = ?`, [
                req.body.idPlazo
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

            let montoCobrado = cobrado[0].total + parseFloat(req.body.montoCuota);
            if (montoCobrado >= total[0].monto) {

                await conec.execute(connection, `UPDATE plazo SET estado = 1 WHERE idPlazo = ?`, [
                    req.body.idPlazo,
                ]);
            }

            let monto = parseFloat(req.body.montoCuota);

            await conec.execute(connection, `INSERT INTO cobroVenta(
            idCobro,
            idVenta,
            idPlazo,
            precio,
            idImpuesto,
            idMedida) 
            VALUES (?,?,?,?,?,?)`, [
                idCobro,
                req.body.idVenta,
                req.body.idPlazo,
                parseFloat(req.body.montoCuota),
                req.body.idImpuesto,
                req.body.idMedida,
            ]);

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
                idCobro,
                `REGISTRO DEL COBRO ${comprobante[0].serie}-${numeracion}`,
                currentDate(),
                currentTime(),
                req.body.idUsuario
            ]);

            global.io.emit('message', `Cobro registrado :D`);

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

            CASE WHEN vn.idVenta IS NOT NULL 
            THEN CONCAT(cov.nombre,' ',vn.serie,'-',vn.numeracion)
            ELSE '' END AS compRelacion,
            
            td.nombre AS tipoDoc,  
            cl.documento,
            cl.informacion,
            cl.direccion,
            cl.email,
    
            b.nombre as banco,   
                     
            m.nombre as moneda,
            m.codiso,
            m.simbolo,

            CONCAT(us.nombres,' ',us.apellidos) AS usuario,            
    
            IFNULL(SUM(cb.precio*cb.cantidad),SUM(cv.precio)) AS monto
    
            FROM cobro AS c
            INNER JOIN cliente AS cl ON c.idCliente = cl.idCliente
            INNER JOIN usuario AS us ON us.idUsuario = c.idUsuario
            INNER JOIN tipoDocumento AS td ON td.idTipoDocumento = cl.idTipoDocumento 
            INNER JOIN banco AS b ON c.idBanco = b.idBanco
            INNER JOIN moneda AS m ON c.idMoneda = m.idMoneda
            INNER JOIN comprobante AS co ON co.idComprobante = c.idComprobante
            LEFT JOIN cobroDetalle AS cb ON c.idCobro = cb.idCobro
            LEFT JOIN cobroVenta AS cv ON c.idCobro  = cv.idCobro 
            
            LEFT JOIN venta AS vn ON vn.idVenta = c.idProcedencia
            LEFT JOIN comprobante AS cov ON vn.idComprobante = cov.idComprobante
            WHERE c.idCobro = ?
            GROUP BY  c.idCobro`, [
                req.query.idCobro
            ]);

            if (result.length > 0) {

                let detalle = await conec.query(`SELECT 
                co.nombre as concepto,
                cd.precio,
                cd.cantidad,

                md.codigo as medida,

                imp.idImpuesto,
                imp.nombre as impuesto,
                imp.porcentaje

                FROM cobroDetalle AS cd 
                INNER JOIN concepto AS co ON cd.idConcepto = co.idConcepto
                INNER JOIN impuesto AS imp ON cd.idImpuesto  = imp.idImpuesto
                INNER JOIN medida AS md ON md.idMedida = cd.idMedida 
                WHERE cd.idCobro = ?
                `, [
                    req.query.idCobro
                ]);


                let venta = await conec.query(`SELECT  
                v.idVenta,
                cp.nombre AS comprobante,
                v.serie,
                v.numeracion,
                1 AS cantidad,

                md.codigo as medida,

                imp.idImpuesto,
                imp.nombre as impuesto,
                imp.porcentaje,

                CASE 
                WHEN cv.idPlazo = 0 THEN 'CUOTA INICIAL'
                ELSE CONCAT('CUOTA',' ',pl.cuota) END AS concepto,
                DATE_FORMAT(pl.fecha,'%d/%m/%Y') as fecha,                

                (SELECT IFNULL(SUM(vd.precio*vd.cantidad),0) FROM ventaDetalle AS vd WHERE vd.idVenta = v.idVenta ) AS total,
                (SELECT IFNULL(SUM(cv.precio),0) FROM cobroVenta AS cv WHERE cv.idVenta = v.idVenta ) AS cobrado,
                cv.precio
                FROM cobroVenta AS cv
                LEFT JOIN plazo AS pl ON pl.idPlazo = cv.idPlazo 
                INNER JOIN impuesto AS imp ON cv.idImpuesto  = imp.idImpuesto
                INNER JOIN medida AS md ON cv.idMedida = md.idMedida 
                INNER JOIN venta AS v ON cv.idVenta = v.idVenta 
                INNER JOIN comprobante AS cp ON v.idComprobante = cp.idComprobante
                WHERE cv.idCobro = ?`, [
                    req.query.idCobro
                ]);


                let lote = await conec.query(`SELECT 
                    l.descripcion as lote,
                    m.nombre as manzana 
                    FROM ventaDetalle AS vd
                    INNER JOIN lote AS l on l.idLote = vd.idLote
                    INNER JOIN manzana as m ON m.idManzana = l.idManzana
                    WHERE vd.idVenta = ?`, [
                    venta[0].idVenta
                ]);
                // console.log(lote[0])                

                return {
                    "cabecera": result[0],
                    "detalle": detalle,
                    "venta": venta,
                    "lote": lote
                };
            } else {
                return "Datos no encontrados";
            }

        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async idPlazo(req) {
        try {
            let loteManzana = await conec.query(`SELECT l.descripcion, m.nombre AS manzana
            FROM ventaDetalle AS v 
            INNER JOIN lote AS l ON l.idLote = v.idLote
            INNER JOIN manzana AS m ON m.idManzana = l.idManzana
            WHERE v.idVenta = ?`, [
                req.query.idVenta
            ]);

            let venta = await conec.query(`SELECT
            c.informacion,
            m.simbolo,
            m.nombre as moneda
            FROM venta AS v 
            INNER JOIN moneda AS m ON m.idMoneda  = v.idMoneda 
            INNER JOIN cliente AS c ON c.idCliente = v.idCliente
            WHERE v.idVenta = ?`, [
                req.query.idVenta
            ]);

            let plazo = await conec.query(`SELECT 
            p.idPlazo,
            cuota,
            DATE_FORMAT(p.fecha,'%d/%m/%Y') as fecha
            FROM
            plazo as p 
            WHERE p.idPlazo = ?`, [
                req.query.idPlazo
            ]);

            let monto = await conec.query(`SELECT
            monto 
            FROM plazo 
            WHERE idPlazo = ?`, [
                req.query.idPlazo
            ]);


            if (loteManzana.length > 0 && venta.length > 0 && plazo.length > 0 && monto.length > 0) {
                return {
                    ...loteManzana[0],
                    ...venta[0],
                    ...plazo[0],
                    ...monto[0],
                };
            } else {
                return "No hay datos para mostrar";
            }
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async delete(req) {
        let connection = null;
        try {
            connection = await conec.beginTransaction();

            let facturado = await conec.execute(connection, `SELECT c.idCobro FROM cobro as c inner join comprobante as cm
            on c.idComprobante = cm.idComprobante
            where cm.tipo = 1 and c.idCobro = ?`, [
                req.query.idCobro
            ]);

            if (facturado.length > 0) {

                let fecha = await conec.execute(connection, `SELECT fecha FROM cobro WHERE 
                idCobro = ? AND fecha BETWEEN DATE_ADD(CURRENT_DATE, INTERVAL -4 DAY) AND CURRENT_DATE`, [
                    req.query.idCobro
                ]);

                if (fecha.length === 0) {
                    await conec.rollback(connection);
                    return "Los comprobantes facturados tienen un límite de 4 días para ser anulados.";
                }

                /**
                 * 
                 */

                let cobro = await conec.execute(connection, `SELECT idCobro,idProcedencia,serie,numeracion FROM cobro WHERE idCobro = ?`, [
                    req.query.idCobro
                ]);

                let venta = await conec.execute(connection, `SELECT idVenta,credito FROM venta WHERE idVenta  = ?`, [
                    cobro[0].idProcedencia
                ]);

                let cobroVenta = await conec.execute(connection, `SELECT idPlazo FROM cobroVenta 
                            WHERE idCobro = ?`, [
                    req.query.idCobro
                ]);

                if (venta.length > 0) {
                    if (venta[0].credito === 1) {
                        await conec.execute(connection, `DELETE FROM plazo WHERE idPlazo = ?`, [
                            cobroVenta[0].idPlazo
                        ]);
                    } else {
                        let plazosCobros = await conec.execute(connection, `SELECT * FROM cobroVenta WHERE idPlazo = ?`, [
                            cobroVenta[0].idPlazo
                        ]);

                        if (plazosCobros.length <= 1) {
                            await conec.execute(connection, `UPDATE plazo SET estado = 0 WHERE idPlazo = ?`, [
                                cobroVenta[0].idPlazo
                            ]);
                        }
                    }
                }

                await conec.execute(connection, `UPDATE venta SET estado = 2
                WHERE idVenta = ?`, [
                    venta[0].idVenta
                ]);

                /**
                 * 
                 */

                await conec.execute(connection, `UPDATE cobro SET estado = 0,observacion = ? WHERE idCobro = ?`, [
                    req.query.idCobro,
                    `ANULACIÓN DEL COMPROBANTE`
                ]);

                await conec.execute(connection, `DELETE FROM bancoDetalle WHERE idProcedencia  = ?`, [
                    req.query.idCobro
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
                    `ANULACIÓN DEL INGRESO ${cobro[0].serie}-${cobro[0].numeracion}`,
                    currentDate(),
                    currentTime(),
                    req.query.idUsuario
                ]);

            } else {
                let cobro = await conec.execute(connection, `SELECT idProcedencia,serie,numeracion FROM cobro WHERE idCobro = ?`, [
                    req.query.idCobro
                ]);

                if (cobro.length > 0) {
                    let venta = await conec.execute(connection, `SELECT idVenta,credito FROM venta WHERE idVenta  = ?`, [
                        cobro[0].idProcedencia
                    ]);

                    if (venta.length > 0) {
                        let plazos = await conec.execute(connection, `SELECT idPlazo,estado FROM plazo 
                        WHERE idVenta = ? AND estado = 1`, [
                            venta[0].idVenta
                        ]);

                        if (plazos.length > 0) {
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

                            if (maxPlazo <= maxCobroVenta) {
                                if (venta[0].credito === 1) {
                                    await conec.execute(connection, `DELETE FROM plazo WHERE idPlazo = ?`, [
                                        maxCobroVenta
                                    ]);
                                } else {
                                    let plazosCobros = await conec.execute(connection, `SELECT * FROM cobroVenta WHERE idPlazo = ?`, [
                                        maxCobroVenta
                                    ]);

                                    if (plazosCobros.length <= 1) {
                                        await conec.execute(connection, `UPDATE plazo SET estado = 0 WHERE idPlazo = ?`, [
                                            maxCobroVenta
                                        ]);
                                    }
                                }

                                await conec.execute(connection, `UPDATE venta SET estado = 2
                                WHERE idVenta = ?`, [
                                    venta[0].idVenta
                                ]);
                            } else {
                                await conec.rollback(connection);
                                return "No se puede eliminar el cobro, hay plazos(cobros) ligados que son inferiores.";
                            }
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
                    '',
                    `ANULACIÓN DEL INGRESO ${cobro[0].serie}-${cobro[0].numeracion}`,
                    currentDate(),
                    currentTime(),
                    req.query.idUsuario
                ]);

            }

            await conec.commit(connection);
            return "delete";
        } catch (error) {
            console.error(error)
            if (connection != null) {
                await conec.rollback(connection);
            }
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async cobroGeneral(req) {
        try {

            if (req.query.isDetallado) {
                let cobros = await conec.query(`SELECT 
                c.idCobro, 
                co.nombre as comprobante,
                c.serie,
                c.numeracion,
                cl.documento,
                cl.informacion,  
                CASE 
                WHEN cn.idConcepto IS NOT NULL THEN cn.nombre
                ELSE CASE WHEN cv.idPlazo = 0 THEN 'CUOTA INICIAL' ELSE CONCAT('CUOTA',' ',pl.cuota) END END AS detalle,
                IFNULL(CONCAT(cp.nombre,' ',v.serie,'-',v.numeracion),'') AS comprobanteRef,
                m.simbolo,
                m.codiso,
                b.nombre as banco,  
                c.observacion, 
                DATE_FORMAT(c.fecha,'%d/%m/%Y') as fecha, 
                c.hora,
                c.estado,
                IFNULL(SUM(cd.precio*cd.cantidad),SUM(cv.precio)) AS monto
                FROM cobro AS c
                INNER JOIN cliente AS cl ON c.idCliente = cl.idCliente
                INNER JOIN banco AS b ON c.idBanco = b.idBanco
                INNER JOIN moneda AS m ON c.idMoneda = m.idMoneda 
                INNER JOIN comprobante AS co ON co.idComprobante = c.idComprobante
                LEFT JOIN cobroDetalle AS cd ON c.idCobro = cd.idCobro
                LEFT JOIN concepto AS cn ON cd.idConcepto = cn.idConcepto 
                LEFT JOIN cobroVenta AS cv ON cv.idCobro = c.idCobro 
                LEFT JOIN plazo AS pl ON pl.idPlazo = cv.idPlazo
                LEFT JOIN venta AS v ON cv.idVenta = v.idVenta 
                LEFT JOIN comprobante AS cp ON v.idComprobante = cp.idComprobante
                WHERE c.fecha BETWEEN ? AND ?
                GROUP BY c.idCobro
                ORDER BY c.fecha DESC,c.hora DESC
                `, [
                    req.query.fechaIni,
                    req.query.fechaFin,
                ]);

                return { "cobros": cobros };
                // return { "conceptos": conceptos, "bancos": bancos };
            } else {
                let cobros = await conec.query(`SELECT
                    IFNULL(co.idConcepto,'CV01') AS idConcepto,
                    IFNULL(co.nombre,'POR VENTA') AS concepto,
                    'INGRESO' AS tipo,
                    b.idBanco,
                    b.nombre,
                    CASE 
                    WHEN b.tipoCuenta = 1 THEN 'Banco'
                    WHEN b.tipoCuenta = 2 THEN 'Tarjeta'
                    ELSE 'Efectivo' END AS 'tipoCuenta',
                    IFNULL(SUM(cd.precio*cd.cantidad),SUM(cv.precio)) AS monto
                    FROM cobro as c
                    LEFT JOIN banco AS b ON c.idBanco = b.idBanco
                    LEFT JOIN cobroDetalle AS cd ON c.idCobro = cd.idCobro
                    LEFT JOIN concepto AS co ON co.idConcepto = cd.idConcepto
                    LEFT JOIN cobroVenta AS cv ON cv.idCobro = c.idCobro
                    WHERE c.fecha BETWEEN ? AND ? AND c.estado = 1
                    GROUP BY c.idCobro`,
                    [
                        req.query.fechaIni,
                        req.query.fechaFin,
                    ]);

                let gastos = await conec.query(`
                    SELECT
                    co.idConcepto,
                    co.nombre AS concepto,
                    'EGRESO' AS tipo,
                    b.idBanco,
                    b.nombre,
                    CASE 
                    WHEN b.tipoCuenta = 1 THEN 'Banco'
                    WHEN b.tipoCuenta = 2 THEN 'Tarjeta'
                    ELSE 'Efectivo' END AS 'tipoCuenta',
                    SUM(gd.precio*gd.cantidad) AS monto
                    FROM gasto as g
                    LEFT JOIN banco AS b ON g.idBanco = b.idBanco
                    LEFT JOIN gastoDetalle AS gd ON g.idGasto = gd.idGasto
                    LEFT JOIN concepto AS co ON co.idConcepto = gd.idConcepto
                    WHERE g.fecha BETWEEN ? AND ?
                    GROUP BY g.idGasto`,
                    [
                        req.query.fechaIni,
                        req.query.fechaFin,
                    ]);

                let lista = [...cobros, ...gastos];
                let conceptos = [];

                for (let item of lista) {
                    if (conceptos.filter(f => f.idConcepto === item.idConcepto).length === 0) {
                        conceptos.push({
                            "idConcepto": item.idConcepto,
                            "concepto": item.concepto,
                            "tipo": item.tipo,
                            "idBanco": item.idBanco,
                            "nombre": item.nombre,
                            "tipoCuenta": item.tipoCuenta,
                            "cantidad": 1,
                            "monto": item.monto
                        })
                    } else {
                        for (let newItem of conceptos) {
                            if (newItem.idConcepto === item.idConcepto) {
                                let currenteObject = newItem;
                                currenteObject.cantidad += 1;
                                currenteObject.monto += parseFloat(item.monto);
                                break;
                            }
                        }
                    }
                }

                let bancos = [];

                for (let item of lista) {
                    if (bancos.filter(f => f.idBanco === item.idBanco).length === 0) {
                        bancos.push({
                            "idConcepto": item.idConcepto,
                            "concepto": item.concepto,
                            "tipo": item.tipo,
                            "idBanco": item.idBanco,
                            "nombre": item.nombre,
                            "tipoCuenta": item.tipoCuenta,
                            "monto": item.tipo === "INGRESO" ? item.monto : -item.monto
                        })
                    } else {
                        for (let newItem of bancos) {
                            if (newItem.idBanco === item.idBanco) {
                                let currenteObject = newItem;
                                currenteObject.monto += item.tipo === "INGRESO" ? parseFloat(item.monto) : -parseFloat(item.monto);
                                break;
                            }
                        }
                    }
                }

                return { "conceptos": conceptos, "bancos": bancos };
            }
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async xmlGenerate(req) {
        try {
            let xml = await conec.query(`SELECT 
            co.nombre AS comprobante,
            c.serie,
            c.numeracion,
            c.xmlGenerado 
            FROM cobro AS c 
            INNER JOIN comprobante AS co ON co.idComprobante = c.idComprobante 
            WHERE c.idCobro  = ? AND c.xmlSunat = ?`, [
                req.query.idCobro,
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

    async notificaciones(req) {
        try {
            const result = await conec.query(`SELECT 
            c.serie,
            co.nombre,
            CASE c.estado
            WHEN 3 THEN 'DAR DE BAJA'
            ELSE 'POR DECLARAR' END AS 'estado',
            COUNT(c.serie) AS 'cantidad'
            FROM cobro AS c 
            INNER JOIN comprobante AS co 
            ON co.idComprobante = c.idComprobante
            WHERE 
            co.tipo = 1 AND IFNULL(c.xmlSunat,'') <> '0' AND IFNULL(c.xmlSunat,'') <> '1032'
            OR
            co.tipo = 1 AND IFNULL(c.xmlSunat,'') = '0' AND c.estado = 3
            GROUP BY c.serie,co.nombre`);
            return result;
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async searchComprobante(req) {
        try {
            let result = await conec.query(`SELECT
            c.idCobro,
            c.serie,
            c.numeracion,
            c.metodoPago,
            c.estado,
            c.observacion,
            DATE_FORMAT(c.fecha,'%d/%m/%Y') as fecha,
            c.hora,
            
            td.nombre AS tipoDoc,  
            cl.idCliente,
            cl.documento,
            cl.informacion,
            cl.direccion,
            cl.email,
                      
            m.idMoneda,
            m.codiso

            FROM cobro AS c
            INNER JOIN cliente AS cl ON c.idCliente = cl.idCliente
            INNER JOIN tipoDocumento AS td ON td.idTipoDocumento = cl.idTipoDocumento 
            INNER JOIN moneda AS m ON c.idMoneda = m.idMoneda
            INNER JOIN comprobante AS co ON co.idComprobante = c.idComprobante

            WHERE CONCAT(c.serie,'-',c.numeracion) = ? AND co.tipo = 1 AND co.estado = 1
            GROUP BY c.idCobro`, [
                req.query.search
            ]);

            if (result.length > 0) {

                let detalle = await conec.query(`SELECT 
                1 AS tipo,
                0 AS idPlazo, 

                co.idConcepto,
                co.nombre as concepto,

                md.idMedida,
                md.codigo as medida,

                imp.idImpuesto,
                imp.nombre as impuesto,
                imp.porcentaje,

                cd.cantidad,
                cd.precio

                FROM cobroDetalle AS cd 
                INNER JOIN concepto AS co ON cd.idConcepto = co.idConcepto
                INNER JOIN impuesto AS imp ON cd.idImpuesto  = imp.idImpuesto
                INNER JOIN medida AS md ON md.idMedida = cd.idMedida 
                WHERE cd.idCobro = ?
                `, [
                    result[0].idCobro
                ]);


                let venta = await conec.query(`SELECT  
                0 AS tipo,
                '' AS idConcepto,

                v.idVenta,
                cv.idPlazo, 
                CASE 
                WHEN cv.idPlazo = 0 THEN 'CUOTA INICIAL'
                ELSE CONCAT('CUOTA',' ',pl.cuota) END AS concepto,

                md.idMedida,
                md.codigo as medida,

                imp.idImpuesto,
                imp.nombre as impuesto,
                imp.porcentaje,

                1 AS cantidad,
                cv.precio
               
                FROM cobroVenta AS cv
                LEFT JOIN plazo AS pl ON pl.idPlazo = cv.idPlazo 
                INNER JOIN impuesto AS imp ON cv.idImpuesto  = imp.idImpuesto
                INNER JOIN medida AS md ON cv.idMedida = md.idMedida 
                INNER JOIN venta AS v ON cv.idVenta = v.idVenta 
                WHERE cv.idCobro = ?`, [
                    result[0].idCobro
                ]);


                return {
                    "cabecera": result[0],
                    "detalle": detalle,
                    "venta": venta,
                };
            } else {
                return "Comprobante no encontrado.";
            }

        } catch (error) {
            console.error(error);
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

}

module.exports = Cobro