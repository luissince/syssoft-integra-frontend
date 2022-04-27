const Conexion = require('../database/Conexion');
const conec = new Conexion();

class Lote {

    async listar(req) {
        try {
            let lista = await conec.query(`SELECT 
            l.idLote,
            l.descripcion,
            l.precio,
            l.estado,
            l.medidaFrontal,
            l.costadoDerecho,
            l.costadoIzquierdo,
            l.medidaFondo,
            l.areaLote
            FROM lote AS l INNER JOIN manzana AS m 
            ON l.idManzana = m.idManzana 
            WHERE
            ? = 0 AND m.idProyecto = ?
            OR
            ? = 1 AND m.idProyecto = ? AND l.descripcion LIKE CONCAT(?,'%')    
            LIMIT ?,?`, [
                parseInt(req.query.opcion),
                req.query.idProyecto,

                parseInt(req.query.opcion),
                req.query.idProyecto,
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
            FROM lote AS l INNER JOIN manzana AS m 
            ON l.idManzana = m.idManzana 
            WHERE
            ? = 0 AND m.idProyecto = ?
            OR
            ? = 1 AND m.idProyecto = ? AND l.descripcion LIKE CONCAT(?,'%')`, [
                parseInt(req.query.opcion),
                req.query.idProyecto,

                parseInt(req.query.opcion),
                req.query.idProyecto,
                req.query.buscar,
            ]);
            return { "result": resultLista, "total": total[0].Total }
        } catch (error) {
            return 'Error interno de conexión, intente nuevamente.'
        }
    }

    async add(req) {
        let connection = null;
        try {
            connection = await conec.beginTransaction();

            let result = await conec.execute(connection, 'SELECT idLote FROM lote');
            let idLote = "";
            if (result.length != 0) {

                let quitarValor = result.map(function (item) {
                    return parseInt(item.idLote.replace("LT", ''));
                });

                let valorActual = Math.max(...quitarValor);
                let incremental = valorActual + 1;
                let codigoGenerado = "";
                if (incremental <= 9) {
                    codigoGenerado = 'LT000' + incremental;
                } else if (incremental >= 10 && incremental <= 99) {
                    codigoGenerado = 'LT00' + incremental;
                } else if (incremental >= 100 && incremental <= 999) {
                    codigoGenerado = 'LT0' + incremental;
                } else {
                    codigoGenerado = 'LT' + incremental;
                }

                idLote = codigoGenerado;
            } else {
                idLote = "LT0001";
            }

            await conec.execute(connection, `INSERT INTO lote(
                idLote, 
                idManzana,
                descripcion,
                costo,
                precio,
                estado,
                medidaFrontal,
                costadoDerecho,
                costadoIzquierdo,
                medidaFondo,
                areaLote,
                numeroPartida,
                limiteFrontal,
                limiteDerecho,
                limiteIzquierdo,
                limitePosterior,
                ubicacionLote
                ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)        
                `, [
                idLote,
                req.body.idManzana,
                req.body.descripcion,
                req.body.costo,
                req.body.precio,
                req.body.estado,
                req.body.medidaFrontal,
                req.body.costadoDerecho,
                req.body.costadoIzquierdo,
                req.body.medidaFondo,
                req.body.areaLote,
                req.body.numeroPartida,
                req.body.limiteFrontal,
                req.body.limiteDerecho,
                req.body.limiteIzquierdo,
                req.body.limitePosterior,
                req.body.ubicacionLote,
            ])

            await conec.commit(connection);
            return "insert";

        } catch (error) {
            if (connection != null) {
                await conec.rollback(connection);
            }
            return "Error interno de conexión, intente nuevamente."

        }
    }

    async dataId(req) {
        try {
            let result = await conec.query('SELECT * FROM lote WHERE idLote = ?', [
                req.query.idLote,
            ]);

            if (result.length > 0) {
                return result[0]
            } else {
                return "Datos no encontrados"
            }

        } catch (error) {
            return "Error interno de conexión, intente nuevamente."
        }
    }

    async update(req) {
        let connection = null;
        try {
            connection = await conec.beginTransaction();

            if (req.body.estado === 3) {
                await conec.execute(connection, `UPDATE lote SET        
                    idManzana = ?,
                    descripcion = ?,
                    medidaFrontal =?,
                    costadoDerecho = ?,
                    costadoIzquierdo = ?,
                    medidaFondo = ?,
                    areaLote = ?,
                    numeroPartida = ?,
                    limiteFrontal = ?,
                    limiteDerecho = ?,
                    limiteIzquierdo = ?,
                    limitePosterior = ?,
                    ubicacionLote = ?
                    WHERE idLote = ?
                    `, [
                    req.body.idManzana,
                    req.body.descripcion,
                    req.body.medidaFrontal,
                    req.body.costadoDerecho,
                    req.body.costadoIzquierdo,
                    req.body.medidaFondo,
                    req.body.areaLote,
                    req.body.numeroPartida,
                    req.body.limiteFrontal,
                    req.body.limiteDerecho,
                    req.body.limiteIzquierdo,
                    req.body.limitePosterior,
                    req.body.ubicacionLote,
                    req.body.idLote,
                ])

                await conec.commit(connection);
                // res.status(200).send('Datos actualizados correctamente');
                return "update";
            } else {
                await conec.execute(connection, `UPDATE lote SET        
                    idManzana = ?,
                    descripcion = ?,
                    costo = ?,
                    precio = ?,
                    estado = ?,
                    medidaFrontal =?,
                    costadoDerecho = ?,
                    costadoIzquierdo = ?,
                    medidaFondo = ?,
                    areaLote = ?,
                    numeroPartida = ?,
                    limiteFrontal = ?,
                    limiteDerecho = ?,
                    limiteIzquierdo = ?,
                    limitePosterior = ?,
                    ubicacionLote = ?
                    WHERE idLote = ?
                    `, [
                    req.body.idManzana,
                    req.body.descripcion,
                    req.body.costo,
                    req.body.precio,
                    req.body.estado,
                    req.body.medidaFrontal,
                    req.body.costadoDerecho,
                    req.body.costadoIzquierdo,
                    req.body.medidaFondo,
                    req.body.areaLote,
                    req.body.numeroPartida,
                    req.body.limiteFrontal,
                    req.body.limiteDerecho,
                    req.body.limiteIzquierdo,
                    req.body.limitePosterior,
                    req.body.ubicacionLote,
                    req.body.idLote,
                ])

                await conec.commit(connection);
                // res.status(200).send('Datos actualizados correctamente');
                return "update";
            }
        } catch (error) {
            if (connection != null) {
                await conec.rollback(connection);
            }
            // res.status(500).send(error);
            return "Error interno de conexión, intente nuevamente."
        }
    }

    async detalle(req) {
        try {
            let cabecera = await conec.query(`SELECT 
            l.idLote,
            m.nombre as manzana,
            l.descripcion as lote,
            l.costo,
            l.precio,
            CASE 
            WHEN l.estado = 1 THEN 'Disponible' 
            WHEN l.estado = 2 THEN 'Reservado' 
            WHEN l.estado = 3 THEN 'Vendido' 
            ELSE 'Inactivo' END AS lotestado,
    
            c.nombre as comprobante,
            cl.informacion as cliente,
    
            v.idVenta,
            v.serie,
            v.numeracion,
            DATE_FORMAT(v.fecha,'%d/%m/%Y') as fecha, 
            v.hora,
            v.tipo,
            v.estado,
            mo.simbolo,
    
            cl.documento,
            cl.informacion,
            IFNULL(SUM(vdv.precio*vdv.cantidad),0) AS monto
    
            FROM lote AS l
            INNER JOIN manzana AS m  ON l.idManzana = m.idManzana
            INNER JOIN ventaDetalle AS vd ON l.idLote = vd.idLote
            INNER JOIN venta AS v ON v.idVenta = vd.idVenta
            INNER JOIN moneda AS mo ON v.idMoneda = mo.idMoneda
            INNER JOIN comprobante AS c ON c.idComprobante = v.idComprobante
            INNER JOIN cliente AS cl ON cl.idCliente = v.idCliente
            LEFT JOIN ventaDetalle AS vdv ON vdv.idVenta = v.idVenta
            WHERE l.idLote = ?
            GROUP BY v.idVenta`, [
                req.query.idLote,
            ]);

            if (cabecera.length > 0) {
                let detalle = await conec.query(`SELECT 
                c.idCobro,
                m.simbolo,
                c.observacion AS concepto,
                SUM(cv.precio) AS monto,
                CASE 
                WHEN c.metodoPago = 1 THEN 'Efectivo'
                WHEN c.metodoPago = 2 THEN 'Consignación'
                WHEN c.metodoPago = 3 THEN 'Transferencia'
                WHEN c.metodoPago = 4 THEN 'Cheque'
                WHEN c.metodoPago = 5 THEN 'Tarjeta crédito'
                ELSE 'Tarjeta débito' END AS metodo,
                b.nombre AS  banco,
                DATE_FORMAT(c.fecha,'%d/%m/%Y') as fecha, 
                c.hora
                FROM cobro AS c
                INNER JOIN moneda AS m ON c.idMoneda = m.idMoneda
                INNER JOIN banco AS b ON b.idBanco = c.idBanco
                INNER JOIN cobroVenta AS cv ON cv.idCobro = c.idCobro
                WHERE 
                c.idProcedencia <> '' AND c.idProcedencia = ? 
                GROUP by c.idCobro`, [
                    cabecera[0].idVenta
                ]);

                let concepto = await conec.query(`SELECT 
                c.idCobro,
                m.simbolo,
                co.nombre AS concepto,
                SUM(cd.precio*cd.cantidad)
                AS monto,
                CASE 
                WHEN c.metodoPago = 1 THEN 'Efectivo'
                WHEN c.metodoPago = 2 THEN 'Consignación'
                WHEN c.metodoPago = 3 THEN 'Transferencia'
                WHEN c.metodoPago = 4 THEN 'Cheque'
                WHEN c.metodoPago = 5 THEN 'Tarjeta crédito'
                ELSE 'Tarjeta débito' END AS metodo,
                b.nombre AS  banco,
                DATE_FORMAT(c.fecha,'%d/%m/%Y') as fecha, 
                c.hora
                FROM cobro AS c
                INNER JOIN moneda AS m ON c.idMoneda = m.idMoneda
                INNER JOIN banco AS b ON b.idBanco = c.idBanco
                INNER JOIN cobroDetalle AS cd ON cd.idCobro = c.idCobro 
                INNER JOIN concepto AS co ON co.idConcepto = cd.idConcepto
                WHERE c.idProcedencia <> '' AND c.idProcedencia = ?
                GROUP BY cd.idConcepto`, [
                    req.query.idLote
                ])

                return {
                    "cabecera": cabecera[0],
                    "detalle": [...detalle, ...concepto]
                }
            } else {
                return "No se pudo cargar la información requerida."
            }
        } catch (error) {
            console.log(error)
            return "Error interno de conexión, intente nuevamente."
        }
    }

    async listarCombo(req) {
        try {
            let result = await conec.query(`SELECT 
            l.idLote, 
            l.descripcion AS nombreLote, 
            l.precio,
            m.nombre AS nombreManzana 
            FROM lote AS l INNER JOIN manzana AS m 
            ON l.idManzana = m.idManzana
            WHERE m.idProyecto = ? AND l.estado = 1`, [
                req.query.idProyecto
            ]);
            return result

        } catch (error) {
            return "Error interno de conexión, intente nuevamente."
        }
    }

    async listarComboLoteCliente(req) {
        try {
            let result = await conec.query(`SELECT 
                l.idLote, l.descripcion AS lote, m.nombre AS manzana
                FROM venta AS v
                INNER JOIN cliente AS c ON v.idCliente = c.idCliente
                INNER JOIN ventaDetalle AS vd ON v.idVenta = vd.idVenta
                INNER JOIN lote AS l ON l.idLote = vd.idLote
                INNER JOIN manzana AS m ON m.idManzana = l.idManzana
                WHERE c.idCliente = ?`, [
                req.query.idCliente
            ]);
            return result
        } catch (error) {
            return "Error interno de conexión, intente nuevamente."
        }
    }

}
module.exports = Lote