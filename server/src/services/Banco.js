const Conexion = require('../database/Conexion');
const conec = new Conexion();

class Banco {

    async detalleBanco(req) {
        try {

            let cabecera = await conec.query(`SELECT 
                b.idBanco,
                b.nombre, 
                CASE 
                WHEN b.tipoCuenta = 1 THEN 'Banco'
                WHEN b.tipoCuenta = 2 THEN 'Tarjeta'
                ELSE 'Efectivo' END AS 'tipoCuenta',
                m.nombre as moneda,
                m.codiso,
                b.numCuenta,
                b.cci,
                IFNULL(SUM(CASE WHEN bd.tipo = 1 THEN bd.monto ELSE -bd.monto END),0)AS saldo
                FROM banco AS b 
                INNER JOIN moneda AS m ON m.idMoneda = b.idMoneda 
                LEFT JOIN bancoDetalle AS bd ON bd.idBanco = b.idBanco 
                WHERE b.idBanco = ?`, [
                req.query.idBanco
            ])

            let lista = await conec.query(`SELECT 
                DATE_FORMAT(bd.fecha,'%d/%m/%Y') as fecha, 
                bd.hora,
                IFNULL(CASE 
                    WHEN c.idCobro IS NOT NULL 
                    THEN cc.informacion 
                    ELSE IFNULL(cg.informacion,'') END,'') AS proveedor,
                IFNULL(IFNULL(cnc.nombre,CONCAT(cp.nombre,' ',v.serie,'-',v.numeracion)),cng.nombre) AS cuenta,
                bd.tipo,
                SUM(CASE WHEN bd.tipo = 1 THEN bd.monto ELSE 0 END ) AS ingreso,
                SUM(CASE WHEN bd.tipo = 0 THEN bd.monto ELSE 0 END ) AS salida
                FROM bancoDetalle AS bd 
                INNER JOIN banco AS b ON b.idBanco = bd.idBanco
                LEFT JOIN cobro AS c ON c.idCobro = bd.idProcedencia
                LEFT JOIN cliente AS cc ON cc.idCliente = c.idCliente
                LEFT JOIN cobroDetalle AS cd ON c.idCobro = cd.idCobro
                LEFT JOIN concepto AS cnc ON cd.idConcepto = cnc.idConcepto 
                LEFT JOIN cobroVenta AS cv ON cv.idCobro = c.idCobro 
                LEFT JOIN venta AS v ON cv.idVenta = v.idVenta 
                LEFT JOIN comprobante AS cp ON v.idComprobante = cp.idComprobante
                
                LEFT JOIN gasto AS g ON g.idGasto = bd.idProcedencia
                LEFT JOIN cliente AS cg ON cg.idCliente = g.idCliente
                LEFT JOIN gastoDetalle AS gd ON g.idGasto = gd.idGasto
                LEFT JOIN concepto AS cng ON gd.idConcepto = cng.idConcepto 
                
                WHERE b.idBanco = ?

                GROUP BY bd.idBanco,bd.idProcedencia`, [
                req.query.idBanco
            ])

            return { "cabecera": cabecera[0], "lista": lista };

        } catch (error) {
            return 'Error interno de conexión, intente nuevamente.'
        }
    }

}

module.exports = Banco;