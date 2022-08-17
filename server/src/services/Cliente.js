const { currentDate, currentTime } = require('../tools/Tools');
const Conexion = require('../database/Conexion');
const conec = new Conexion();

class Cliente {

    async list(req) {
        try {
            let lista = await conec.query(`SELECT 
            c.idCliente ,
            v.idProyecto,
            td.nombre as tipodocumento,
            c.documento,
            c.informacion,
            c.celular,
            c.telefono,
            c.direccion,
            c.estado
            FROM cliente AS c
            INNER JOIN tipoDocumento AS td ON td.idTipoDocumento = c.idTipoDocumento
            INNER JOIN venta AS v ON v.idCliente = c.idCliente
            WHERE 
            ? = 0 AND (v.idProyecto = ? AND ? = 'any' OR ? = 'all')
            OR
            ? = 1 and c.documento like concat(?,'%') AND (v.idProyecto = ? AND ? = 'any' OR ? = 'all')
            OR
            ? = 1 and c.informacion like concat(?,'%') AND (v.idProyecto = ? AND ? = 'any' OR ? = 'all')
            ORDER BY c.fecha ASC, c.hora ASC
            LIMIT ?,?`, [
                parseInt(req.query.opcion),
                req.query.idProyecto,
                req.query.fill,
                req.query.fill,

                parseInt(req.query.opcion),
                req.query.buscar,
                req.query.idProyecto,
                req.query.fill,
                req.query.fill,

                parseInt(req.query.opcion),
                req.query.buscar,
                req.query.idProyecto,
                req.query.fill,
                req.query.fill,

                parseInt(req.query.posicionPagina),
                parseInt(req.query.filasPorPagina)
            ])

            let newLista = []

            for (let value of lista) {
                let detalle = await conec.query(`select 
                    l.descripcion,
                    m.nombre as manzana
                    from venta as v
                    inner join ventaDetalle as vd on vd.idVenta = v.idVenta
                    inner join lote as l on l.idLote = vd.idLote
                    inner join manzana as m on m.idManzana = l.idManzana
                    where v.idCliente = ? and v.idProyecto = ?`, [
                    value.idCliente,
                    value.idProyecto
                ]);

                newLista.push({
                    ...value,
                    detalle
                });
            }


            let resultLista = newLista.map(function (item, index) {
                return {
                    ...item,
                    id: (index + 1) + parseInt(req.query.posicionPagina)
                }
            });

            let total = await conec.query(`SELECT COUNT(*) AS Total 
            FROM cliente AS c
            INNER JOIN tipoDocumento AS td ON td.idTipoDocumento = c.idTipoDocumento
            INNER JOIN venta AS v ON v.idCliente = c.idCliente
            WHERE 
            ? = 0 AND (v.idProyecto = ? AND ? = 'any' OR ? = 'all')
            OR
            ? = 1 and c.documento like concat(?,'%') AND (v.idProyecto = ? AND ? = 'any' OR ? = 'all')
            OR
            ? = 1 and c.informacion like concat(?,'%') AND (v.idProyecto = ? AND ? = 'any' OR ? = 'all')`, [

                parseInt(req.query.opcion),
                req.query.idProyecto,
                req.query.fill,
                req.query.fill,

                parseInt(req.query.opcion),
                req.query.buscar,
                req.query.idProyecto,
                req.query.fill,
                req.query.fill,

                parseInt(req.query.opcion),
                req.query.buscar,
                req.query.idProyecto,
                req.query.fill,
                req.query.fill,
            ]);

            return { "result": resultLista, "total": total[0].Total };
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async listsocios(req) {
        try {
            let lista = await conec.query(`SELECT 
            c.idCliente ,
            td.nombre as tipodocumento,
            c.documento,
            c.informacion,
            c.celular,
            c.telefono,
            c.direccion,
            c.estado
            FROM cliente AS c
            INNER JOIN tipoDocumento AS td ON td.idTipoDocumento = c.idTipoDocumento
            INNER JOIN venta AS v ON c.idCliente = v.idCliente AND v.estado = 1
            INNER JOIN cobro AS cb On cb.idCliente = c.idCliente
            WHERE 
            ? = 0 and  cb.fecha BETWEEN ? AND ? AND cb.idProyecto = ?
            OR
            ? = 1 and c.documento like concat(?,'%')
            OR
            ? = 1 and c.informacion like concat(?,'%')
            ORDER BY c.fecha ASC, c.hora ASC
            LIMIT ?,?`, [
                parseInt(req.query.opcion),
                req.query.fechaInicio,
                req.query.fechaFin,
                parseInt(req.query.idProyecto),

                parseInt(req.query.opcion),
                req.query.buscar,

                parseInt(req.query.opcion),
                req.query.buscar,

                parseInt(req.query.posicionPagina),
                parseInt(req.query.filasPorPagina)
            ])

            let newLista = []

            for (let value of lista) {
                let detalle = await conec.query(`select 
                    l.descripcion,
                    m.nombre as manzana
                    from venta as v
                    inner join ventaDetalle as vd on vd.idVenta = v.idVenta
                    inner join lote as l on l.idLote = vd.idLote
                    inner join manzana as m on m.idManzana = l.idManzana
                    where v.idCliente = ?`, [
                    value.idCliente
                ]);

                newLista.push({
                    ...value,
                    detalle
                });
            }


            let resultLista = newLista.map(function (item, index) {
                return {
                    ...item,
                    id: (index + 1) + parseInt(req.query.posicionPagina)
                }
            });

            let total = await conec.query(`SELECT COUNT(*) AS Total 
            FROM cliente AS c
            INNER JOIN tipoDocumento AS td ON td.idTipoDocumento = c.idTipoDocumento
            INNER JOIN venta AS v ON c.idCliente = v.idCliente AND v.estado = 1
            WHERE 
            ? = 0
            OR
            ? = 1 and c.documento like concat(?,'%')
            OR
            ? = 1 and c.informacion like concat(?,'%')`, [

                parseInt(req.query.opcion),

                parseInt(req.query.opcion),
                req.query.buscar,

                parseInt(req.query.opcion),
                req.query.buscar
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

            let validate = await conec.execute(connection, `SELECT * FROM cliente WHERE documento = ?`, [
                req.body.documento,
            ]);

            if (validate.length > 0) {
                await conec.rollback(connection);
                return `El número de documento a ingresar ya se encuentre registrado con los datos de ${validate[0].informacion}`;
            }

            let result = await conec.execute(connection, 'SELECT idCliente FROM cliente');
            let idCliente = "";
            if (result.length != 0) {

                let quitarValor = result.map(function (item) {
                    return parseInt(item.idCliente.replace("CL", ''));
                });

                let valorActual = Math.max(...quitarValor);
                let incremental = valorActual + 1;
                let codigoGenerado = "";
                if (incremental <= 9) {
                    codigoGenerado = 'CL000' + incremental;
                } else if (incremental >= 10 && incremental <= 99) {
                    codigoGenerado = 'CL00' + incremental;
                } else if (incremental >= 100 && incremental <= 999) {
                    codigoGenerado = 'CL0' + incremental;
                } else {
                    codigoGenerado = 'CL' + incremental;
                }

                idCliente = codigoGenerado;
            } else {
                idCliente = "CL0001";
            }

            await conec.execute(connection, `INSERT INTO cliente(
            idCliente, 
            idTipoDocumento,
            documento,
            informacion,
            celular,
            telefono,
            fechaNacimiento,
            email, 
            genero, 
            direccion,
            idUbigeo, 
            estadoCivil,
            estado, 
            observacion,
            fecha,
            hora,
            fupdate,
            hupdate,
            idUsuario)
            VALUES(?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
                idCliente,
                req.body.idTipoDocumento,
                req.body.documento,
                req.body.informacion,
                req.body.celular,
                req.body.telefono,
                req.body.fechaNacimiento,
                req.body.email,
                req.body.genero,
                req.body.direccion,
                req.body.idUbigeo,
                req.body.estadoCivil,
                req.body.estado,
                req.body.observacion,
                currentDate(),
                currentTime(),
                currentDate(),
                currentTime(),
                req.body.idUsuario,
            ])

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
            cl.idCliente,
            cl.idTipoDocumento,
            cl.documento,
            cl.informacion,
            cl.celular,
            cl.telefono, 
            DATE_FORMAT(cl.fechaNacimiento,'%Y-%m-%d') as fechaNacimiento,
            cl.email, 
            cl.genero,  
            cl.direccion,
            IFNULL(cl.idUbigeo,0) AS idUbigeo,
            IFNULL(u.ubigeo, '') AS ubigeo,
            IFNULL(u.departamento, '') AS departamento,
            IFNULL(u.provincia, '') AS provincia,
            IFNULL(u.distrito, '') AS distrito,
            cl.estadoCivil,
            cl.estado, 
            cl.observacion
            FROM cliente AS cl 
            LEFT JOIN ubigeo AS u ON u.idUbigeo = cl.idUbigeo
            WHERE 
            cl.idCliente = ?`, [
                req.query.idCliente,
            ]);

            if (result.length > 0) {
                return result[0];
            } else {
                return "Datos no encontrados";
            }
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async update(req) {
        let connection = null;
        try {
            connection = await conec.beginTransaction();

            let validate = await conec.execute(connection, `SELECT * FROM cliente WHERE idCliente = ? AND documento <> ?`, [
                req.body.idCliente,
                req.body.documento,
            ]);

            if (validate.length > 0) {
                await conec.rollback(connection);
                return `El número de documento a ingresar ya se encuentre registrado con los datos de ${validate[0].informacion}`;
            }

            await conec.execute(connection, `UPDATE cliente SET
                idTipoDocumento=?, 
                documento=?,
                informacion=?, 
                celular=?,
                telefono=?,
                fechaNacimiento=?,
                email=?,
                genero=?, 
                direccion=?, 
                idUbigeo=?,
                estadoCivil=?, 
                estado=?,
                observacion=?,
                fupdate=?,
                hupdate=?,
                idUsuario=?
                WHERE idCliente=?`, [
                req.body.idTipoDocumento,
                req.body.documento,
                req.body.informacion,
                req.body.celular,
                req.body.telefono,
                req.body.fechaNacimiento,
                req.body.email,
                req.body.genero,
                req.body.direccion,
                req.body.idUbigeo,
                req.body.estadoCivil,
                req.body.estado,
                req.body.observacion,
                currentDate(),
                currentTime(),
                req.body.idUsuario,
                req.body.idCliente
            ]);

            global.io.emit('message', `Cliente actualizado :D`);

            await conec.commit(connection)
            return "update";
        } catch (error) {
            if (connection != null) {
                await conec.rollback(connection);
            }
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async delete(req) {
        let connection = null;
        try {
            connection = await conec.beginTransaction();

            let cobro = await conec.execute(connection, `SELECT * FROM cobro WHERE idCliente = ?`, [
                req.query.idCliente
            ]);

            if (cobro.length > 0) {
                await conec.rollback(connection);
                return 'No se puede eliminar el cliente ya que esta ligada a un cobro.';
            }

            let gasto = await conec.execute(connection, `SELECT * FROM gasto WHERE idCliente = ?`, [
                req.query.idCliente
            ]);

            if (gasto.length > 0) {
                await conec.rollback(connection);
                return 'No se puede eliminar el cliente ya que esta ligada a un gasto.';
            }

            let venta = await conec.execute(connection, `SELECT * FROM venta WHERE idCliente = ?`, [
                req.query.idCliente
            ]);

            if (venta.length > 0) {
                await conec.rollback(connection);
                return 'No se puede eliminar el cliente ya que esta ligada a una venta.';
            }

            await conec.execute(connection, `DELETE FROM cliente WHERE idCliente  = ?`, [
                req.query.idCliente
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

    async listcombo(req) {
        try {
            let result = await conec.query('SELECT idCliente, documento, informacion FROM cliente');
            return result;
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async listsearch(req) {
        try {
            let result = await conec.query(`
            SELECT 
            idCliente, 
            documento, 
            informacion 
            FROM cliente
            WHERE 
            documento LIKE CONCAT('%',?,'%')
            OR 
            informacion LIKE CONCAT('%',?,'%')`, [
                req.query.filtrar,
                req.query.filtrar,
            ]);
            return result;
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async listadeudas(req) {
        try {

            if (req.query.frecuencia !== '' && req.query.frecuencia !== 0) {
                let lista = await conec.query(`SELECT 
                v.idVenta, 
                cl.documento, 
                cl.informacion, 
                v.numCuota, 
                (SELECT IFNULL(COUNT(*), 0) FROM plazo AS p WHERE p.estado = 0 AND p.fecha < CURRENT_DATE() AND p.idVenta = v.idVenta) AS cuotasRetrasadas,
                (SELECT IFNULL(COUNT(*), 0) FROM plazo AS p WHERE p.estado = 0 AND p.idVenta = v.idVenta) AS cuotasPendientes,
                CASE 
                WHEN v.credito = 1 THEN DATE_FORMAT(DATE_ADD(v.fecha,interval v.frecuencia day),'%d/%m/%Y')
                ELSE (SELECT IFNULL(DATE_FORMAT(MIN(p.fecha),'%d/%m/%Y'),'') FROM plazo AS p WHERE p.estado = 0 AND p.idVenta = v.idVenta) END AS fechaPago,
                m.simbolo,
                m.codiso,
                (SELECT IFNULL(SUM(p.monto),0) FROM plazo AS p WHERE p.estado = 0 AND p.fecha < CURRENT_DATE() AND p.idVenta = v.idVenta) AS montoPendiente,
                (SELECT IFNULL(MIN(p.monto),0) FROM plazo AS p WHERE p.estado = 0 AND p.idVenta = v.idVenta) AS montoActual,
                v.frecuencia
                FROM venta AS v 
                INNER JOIN moneda AS m ON m.idMoneda = v.idMoneda
                INNER JOIN comprobante AS cm ON v.idComprobante = cm.idComprobante 
                INNER JOIN cliente AS cl ON v.idCliente = cl.idCliente 
                LEFT JOIN ventaDetalle AS vd ON vd.idVenta = v.idVenta 
                WHERE v.estado = 2
                and v.frecuencia = ?
                GROUP BY v.idVenta
                ORDER BY v.fecha ASC, v.hora ASC`, [
                    req.query.frecuencia
                ]);

                return lista;
            } else {
                let lista = await conec.query(`SELECT 
                v.idVenta, 
                cl.documento, 
                cl.informacion, 
                v.numCuota, 
                (SELECT IFNULL(COUNT(*), 0) FROM plazo AS p WHERE p.estado = 0 AND p.fecha < CURRENT_DATE() AND p.idVenta = v.idVenta) AS cuotasRetrasadas,
                (SELECT IFNULL(COUNT(*), 0) FROM plazo AS p WHERE p.estado = 0 AND p.idVenta = v.idVenta) AS cuotasPendientes,
                CASE 
                WHEN v.credito = 1 THEN DATE_FORMAT(DATE_ADD(v.fecha,interval v.frecuencia day),'%d/%m/%Y')
                ELSE (SELECT IFNULL(DATE_FORMAT(MIN(p.fecha),'%d/%m/%Y'),'') FROM plazo AS p WHERE p.estado = 0 AND p.idVenta = v.idVenta) END AS fechaPago,
                m.simbolo,
                m.codiso,
                (SELECT IFNULL(SUM(p.monto),0) FROM plazo AS p WHERE p.estado = 0 AND p.fecha < CURRENT_DATE() AND p.idVenta = v.idVenta) AS montoPendiente,
                (SELECT IFNULL(MIN(p.monto),0) FROM plazo AS p WHERE p.estado = 0 AND p.idVenta = v.idVenta) AS montoActual,
                v.frecuencia
                FROM venta AS v 
                INNER JOIN moneda AS m ON m.idMoneda = v.idMoneda
                INNER JOIN comprobante AS cm ON v.idComprobante = cm.idComprobante 
                INNER JOIN cliente AS cl ON v.idCliente = cl.idCliente 
                LEFT JOIN ventaDetalle AS vd ON vd.idVenta = v.idVenta 
                WHERE v.estado = 2
                GROUP BY v.idVenta
                ORDER BY v.fecha ASC, v.hora ASC`);

                return lista;
            }
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async listapagos(req) {
        try {

            if (req.query.idCliente !== "") {
                let lista = await conec.query(`SELECT 
                c.idCobro, 
                co.nombre as comprobante,
                c.serie,
                c.numeracion,
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
                LEFT JOIN notaCredito AS nc ON nc.idCobro = c.idCobro
                WHERE c.idCliente = ? AND c.estado = 1 AND nc.idNotaCredito IS NULL
                AND (c.fecha BETWEEN ? AND ?)
                GROUP BY c.idCobro
                ORDER BY c.fecha DESC,c.hora DESC`, [
                    req.query.idCliente,
                    req.query.fechaIni,
                    req.query.fechaFin
                ]);

                return lista;
            } else {
                let lista = await conec.query(`SELECT
                c.idCliente,
                c.documento,
                c.informacion,
                (SELECT IFNULL(SUM(cd.precio*cd.cantidad),0) FROM cobroDetalle AS cd WHERE cd.idCobro = co.idCobro) AS ingresos,
                (SELECT IFNULL(SUM(cv.precio),0) FROM cobroVenta AS cv WHERE cv.idCobro = co.idCobro) AS ventas
                FROM cobro AS co
                INNER JOIN cliente AS c ON c.idCliente = co.idCliente
                LEFT JOIN notaCredito AS nc ON nc.idCobro = co.idCobro
                WHERE 
                co.fecha BETWEEN ? AND ? AND co.estado = 1 AND nc.idNotaCredito IS NULL`, [
                    req.query.fechaIni,
                    req.query.fechaFin
                ]);

                return lista;
            }
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async listventasasociadas(req) {
        try {

            let cliente = await conec.query(`select
            tp.nombre as tipoDocumento,
            c.documento,
            c.informacion,
            c.celular,
            c.telefono,
            c.email,
            c.direccion
            from 
            cliente as c 
            inner join tipoDocumento as tp on tp.idTipoDocumento = c.idTipoDocumento
            where c.idCliente = ?`, [
                req.query.idCliente,
            ]);

            if (cliente.length > 0) {

                let ventas = await conec.query(`select 
                v.idVenta,
                co.nombre as comprobante,
                v.serie,
                v.numeracion,
                DATE_FORMAT(v.fecha,'%d/%m/%Y') as fecha, 
                v.hora,
                sum(vd.cantidad * vd.precio) as total
                from venta as v
                inner join ventaDetalle as vd on vd.idVenta = v.idVenta
                inner join comprobante as co on co.idComprobante = v.idComprobante
                where v.idCliente = ?
                group by v.idVenta
                order by v.fecha desc, v.hora desc`, [
                    req.query.idCliente,
                ]);

                let newVentas = [];

                for (let venta of ventas) {

                    let detalle = await conec.query(`select 
                    l.descripcion,
                    m.nombre as manzana,
                    p.nombre as proyecto,
                    im.porcentaje,
                    im.nombre as impuesto,
                    vd.cantidad,
                    vd.precio
                    from ventaDetalle as vd
                    inner join impuesto as im on im.idImpuesto = vd.idImpuesto
                    inner join lote as l on l.idLote = vd.idLote
                    inner join manzana as m on m.idManzana = l.idManzana
                    inner join proyecto as p on p.idProyecto = m.idProyecto
                    where vd.idVenta = ?`, [
                        venta.idVenta
                    ]);

                    newVentas.push({
                        ...venta,
                        "detalle": detalle
                    });
                }

                return { "cliente": cliente[0], "venta": newVentas };
            } else {
                return "Datos no encontrados";
            }
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

}


module.exports = Cliente;