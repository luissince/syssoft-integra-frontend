const Conexion = require('../database/Conexion');
const conec = new Conexion();

class Factura {

    async detalleCredito(req){
       
        try {

            let venta = await conec.query(`
            SELECT 
            v.idVenta, 
            cl.idCliente,
            cl.documento, 
            cl.informacion, 
            cl.celular,
            cl.telefono,
            cl.email,
            cl.direccion,        
            cm.nombre, 
            v.serie, 
            v.numeracion, 
            v.numCuota, 
            (SELECT IFNULL(MIN(fecha),'') FROM plazo WHERE estado = 0) AS fechaPago,
            DATE_FORMAT(v.fecha,'%d/%m/%Y') as fecha, 
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
            v.idVenta = ?
            GROUP BY v.idVenta
            `, [
                req.query.idVenta
            ]);
    
            let plazos = await conec.query(`SELECT 
            idPlazo,        
            DATE_FORMAT(fecha,'%d/%m/%Y') as fecha,
            monto,
            estado
            FROM plazo WHERE idVenta = ?
            `, [
                req.query.idVenta
            ]);

            let lotes = await conec.query(`SELECT
                l.descripcion AS lote,
                l.precio, 
                l.areaLote, 
                m.nombre AS manzana
                FROM venta AS v 
                INNER JOIN ventaDetalle AS vd ON v.idVenta = vd.idVenta
                INNER JOIN lote AS l ON vd.idLote = l.idLote
                INNER JOIN manzana AS m ON l.idManzana = m.idManzana
                WHERE v.idVenta = ?`, [
                req.query.idVenta
            ])

            let inicial = await conec.query(`SELECT 
                IFNULL( cv.precio, 0) AS inicial 
                FROM venta AS v 
                LEFT JOIN cobroVenta AS cv ON cv.idVenta = v.idVenta AND cv.idPlazo = 0
                WHERE v.idVenta = ?
                `, [req.query.idVenta])

            return { "venta": venta[0], "plazos": plazos, "lotes":lotes, "inicial": inicial[0].inicial}

        } catch (error) {
            // res.status(500).send("Error interno de conexión, intente nuevamente.")
            return "Error interno de conexión, intente nuevamente."
        }
    }
}

module.exports = Factura