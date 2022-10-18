const Conexion = require('../database/Conexion');
const { currentDate, currentTime } = require('../tools/Tools');
const conec = new Conexion();

class Lote {

    async list(req) {
        try {
            let lista = await conec.query(`SELECT 
                l.idLote,
                l.descripcion,
                m.nombre as manzana,
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
                OR
                ? = 1 AND m.idProyecto = ? AND m.nombre LIKE CONCAT(?,'%')    
                LIMIT ?,?`, [
                parseInt(req.query.opcion),
                req.query.idProyecto,

                parseInt(req.query.opcion),
                req.query.idProyecto,
                req.query.buscar,

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
                ? = 1 AND m.idProyecto = ? AND l.descripcion LIKE CONCAT(?,'%')
                OR
                ? = 1 AND m.idProyecto = ? AND m.nombre LIKE CONCAT(?,'%')`, [
                parseInt(req.query.opcion),
                req.query.idProyecto,

                parseInt(req.query.opcion),
                req.query.idProyecto,
                req.query.buscar,

                parseInt(req.query.opcion),
                req.query.idProyecto,
                req.query.buscar,
            ]);
            return { "result": resultLista, "total": total[0].Total }
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async add(req) {
        let connection = null;
        try {
            connection = await conec.beginTransaction();

            if (req.body.estado === '3') {
                await conec.rollback(connection);
                return "No se puede usar el estado vendido al insertar un lote, cambie los datos e intente nuevamente.";
            }

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
                idConcepto,
                descripcion,
                costo,
                precio,
                idMedida,
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
                ubicacionLote,
                fecha,
                hora,
                fupdate,
                hupdate,
                idUsuario
                ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)        
                `, [
                idLote,
                req.body.idManzana,
                req.body.idConcepto,
                req.body.descripcion,
                req.body.costo,
                req.body.precio,
                req.body.idMedida,
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

    async socio(req) {
        let connection = null;
        try {
            connection = await conec.beginTransaction();

            await conec.execute(connection, `INSERT INTO asociado(
            idVenta ,
            idCliente,
            estado,
            fecha,
            hora,
            idUsuario
            ) 
            VALUES(?,?,?,?,?,?)`, [
                req.body.idVenta,
                req.body.idCliente,
                1,
                currentDate(),
                currentTime(),
                req.body.idUsuario
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
            let result = await conec.query('SELECT * FROM lote WHERE idLote = ?', [
                req.query.idLote,
            ]);

            if (result.length > 0) {
                return result[0]
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

            let lote = await conec.execute(connection, `SELECT estado FROM lote
            WHERE idLote = ? `, [
                req.body.idLote
            ]);

            if (lote.length === 0) {
                await conec.rollback(connection);
                return "noid";
            }

            if (lote[0].estado === 3) {
                await conec.execute(connection, `UPDATE lote SET        
                    descripcion = ?,
                    idMedida = ?,
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
                    ubicacionLote = ?,
                    fupdate = ?,
                    hupdate = ?,
                    idUsuario = ?
                    WHERE idLote = ?
                    `, [
                    req.body.descripcion,
                    req.body.idMedida,
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
                    currentDate(),
                    currentTime(),
                    req.body.idUsuario,
                    req.body.idLote
                ]);

                await conec.commit(connection);
                return "update";
            } else {
                await conec.execute(connection, `UPDATE lote SET        
                    idManzana = ?,
                    idConcepto = ?,
                    descripcion = ?,
                    costo = ?,
                    precio = ?,
                    idMedida = ?,
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
                    ubicacionLote = ?,
                    fupdate = ?,
                    hupdate = ?,
                    idUsuario = ?
                    WHERE idLote = ?
                    `, [
                    req.body.idManzana,
                    req.body.idConcepto,
                    req.body.descripcion,
                    req.body.costo,
                    req.body.precio,
                    req.body.idMedida,
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
                    currentDate(),
                    currentTime(),
                    req.body.idUsuario,
                    req.body.idLote,
                ])

                await conec.commit(connection);
                return "update";
            }
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

            let lote = await conec.execute(connection, `SELECT * FROM ventaDetalle WHERE idLote  = ?`, [
                req.query.idLote
            ]);

            if (lote.length > 0) {
                await conec.rollback(connection);
                return "No se puede eliminar el lote ya que esta ligado a una venta.";
            }

            await conec.execute(connection, `DELETE FROM lote WHERE idLote  = ?`, [
                req.query.idLote
            ]);

            await conec.commit(connection)
            return "delete";
        } catch (error) {
            if (connection != null) {
                await conec.rollback(connection);
            }
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async deleteSocio(req) {
        let connection = null;
        try {
            connection = await conec.beginTransaction();

            await conec.execute(connection, `UPDATE asociado SET estado = 0 WHERE idVenta  = ? AND idCliente = ?`, [
                req.query.idVenta,
                req.query.idCliente,
            ]);

            await conec.commit(connection)
            return "delete";
        } catch (error) {
            if (connection != null) {
                await conec.rollback(connection);
            }
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async detalleLote(req) {
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

            l.medidaFrontal,
            l.costadoDerecho,
            l.costadoIzquierdo,
            l.medidaFondo,
            l.areaLote,
            l.numeroPartida,

            l.limiteFrontal,
            l.limiteDerecho,
            l.limiteIzquierdo,
            l.limitePosterior,
            l.ubicacionLote
    
            FROM lote AS l
            INNER JOIN manzana AS m  ON l.idManzana = m.idManzana
            WHERE l.idLote = ?`, [
                req.query.idLote,
            ]);

            let venta = await conec.query(`SELECT idVenta FROM ventaDetalle WHERE idLote = ?`, [
                req.query.idLote,
            ])

            if (venta.length > 0) {

                let socios = await conec.query(`SELECT 
                c.idCliente ,
                c.documento,
                c.informacion,
                a.estado
                FROM asociado AS a
                INNER JOIN cliente AS c ON a.idCliente = c.idCliente
                WHERE a.idVenta = ?`, [
                    venta[0].idVenta
                ]);

                let detalle = await conec.query(`SELECT 
                c.idCobro,
                co.nombre as comprobante,
                c.serie,
                c.numeracion,
                cl.documento,
                cl.informacion,
                CASE 
                WHEN cn.idConcepto IS NOT NULL THEN cn.nombre
                ELSE CASE WHEN cv.idPlazo = 0 THEN 'CUOTA INICIAL' ELSE 'CUOTA' END END AS detalle,
                IFNULL(CONCAT(cp.nombre,' ',v.serie,'-',v.numeracion),'') AS comprobanteRef,
                m.simbolo,
                m.codiso,
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
                LEFT JOIN notaCredito AS nc ON c.idCobro = nc.idCobro AND nc.estado = 1

                WHERE 
                c.idProcedencia = ? AND c.estado = 1 AND nc.idNotaCredito IS NULL
                OR 
                c.idProcedencia = ? AND c.estado = 1 AND nc.idNotaCredito IS NULL
                GROUP BY c.idCobro`, [
                    venta[0].idVenta,
                    req.query.idLote,
                ]);

                return {
                    "lote": cabecera[0],
                    "venta": venta[0],
                    "socios": socios,
                    "detalle": detalle
                }
            } else {
                return "No hay información para mostrar.";
            }
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
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
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async listarFilter(req) {
        try {
            let result = await conec.query(`SELECT 
            l.idLote, 
            l.descripcion AS nombreLote, 
            l.precio,
            m.nombre AS nombreManzana 
            FROM lote AS l INNER JOIN manzana AS m 
            ON l.idManzana = m.idManzana
            WHERE 
            m.idProyecto = ? AND l.estado = 1 AND l.descripcion LIKE CONCAT(?,'%')
            OR
            m.idProyecto = ? AND l.estado = 1 AND m.nombre LIKE CONCAT(?,'%')`, [
                req.query.idProyecto,
                req.query.filtrar,

                req.query.idProyecto,
                req.query.filtrar,
            ]);
            return result

        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async listarComboLoteCliente(req) {
        try {
            let result = await conec.query(`SELECT 
                l.idLote, 
                l.descripcion AS lote, 
                m.nombre AS manzana
                FROM venta AS v
                INNER JOIN asociado AS a ON a.idVenta = v.idVenta
                INNER JOIN cliente AS c ON a.idCliente = c.idCliente
                INNER JOIN ventaDetalle AS vd ON v.idVenta = vd.idVenta
                INNER JOIN lote AS l ON l.idLote = vd.idLote
                INNER JOIN manzana AS m ON m.idManzana = l.idManzana
                WHERE c.idCliente = ? AND v.estado <> 3`, [
                req.query.idCliente
            ]);
            return result;
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async listaEstadoLote(req) {
        try {

            const proyecto = await conec.query(`SELECT 
            nombre,
            ubicacion,
            area 
            FROM proyecto WHERE idProyecto = ?`, [
                req.query.idProyecto,
            ]);

            const lista = await conec.query(`SELECT 
                l.idLote,
                l.descripcion AS lote,
                m.nombre AS manzana,
                l.costo,
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
                (? <> 0 AND l.estado = ? AND m.idProyecto = ?)`, [
                req.query.estadoLote,
                req.query.idProyecto,

                req.query.estadoLote,
                req.query.estadoLote,
                req.query.idProyecto,
            ])

            return { "proyecto": proyecto[0], "lista": lista };
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async cambiar(req) {
        let connection = null;
        try {
            connection = await conec.beginTransaction();

            await conec.execute(connection, `UPDATE ventaDetalle 
            SET idLote = ?
            WHERE idLote = ?`, [
                req.body.idLoteDestino,
                req.body.idLoteOrigen
            ]);

            await conec.execute(connection, `UPDATE cobro 
            SET idProcedencia = ?
            WHERE idProcedencia = ?`, [
                req.body.idLoteDestino,
                req.body.idLoteOrigen
            ]);

            await conec.execute(connection, `UPDATE lote
            SET estado = 1
            WHERE idLote = ?`, [
                req.body.idLoteOrigen
            ]);

            await conec.execute(connection, `UPDATE lote
            SET estado = 3
            WHERE idLote = ?`, [
                req.body.idLoteDestino
            ]);

            await conec.commit(connection);
            return "update";
        } catch (error) {
            console.log(error)
            if (connection != null) {
                await conec.rollback(connection);
            }
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

}

module.exports = Lote;