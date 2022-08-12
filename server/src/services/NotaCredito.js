const Conexion = require('../database/Conexion');
const { currentDate, currentTime } = require('../tools/Tools');
const { sendSuccess, sendClient, sendSave, sendError } = require('../tools/Message');
const conec = new Conexion();

class NotaCredito {

    async list(req, res) {

    }

    async id(req, res) {

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
                return sendClient(res, "El comprobante ya tiene asociado una nota de crédito");
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

            let cobro = await conec.execute(connection, `SELECT idCobro,idProcedencia,serie,numeracion FROM cobro WHERE idCobro = ?`, [
                req.body.idCobro
            ]);

            let venta = await conec.execute(connection, `SELECT idVenta,credito FROM venta WHERE idVenta  = ?`, [
                cobro[0].idProcedencia
            ]);

            let cobroVenta = await conec.execute(connection, `SELECT idPlazo FROM cobroVenta WHERE idCobro = ?`, [
                req.body.idCobro
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

            await conec.commit(connection);

            return sendSave(res, "Se registró correctamente la nota de crédito.");
        } catch (error) {
            console.error(error);
            if (connection != null) {
                await conec.rollback(connection);
            }
            return sendError(res, "Se produjo un error de servidor, intente nuevamente.");
        }
    }

}

module.exports = new NotaCredito();