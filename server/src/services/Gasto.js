const { currentDate, currentTime } = require('../tools/Tools');
const Conexion = require('../database/Conexion');
const conec = new Conexion();

class Gasto {

    async gastoGeneral(req) {

        try {

            let lista = await conec.query(`SELECT 
                g.idGasto,
                g.observacion,
                mn.simbolo,
                mn.codiso,
                bn.nombre AS banco,
                g.metodoPago,
                CONCAT(us.nombres,', ',us.apellidos) AS usuario,
                DATE_FORMAT(g.fecha,'%d/%m/%Y') as fecha,  
                g.hora,
                SUM(gd.precio * gd.cantidad) AS monto
                FROM gasto AS g
                INNER JOIN moneda AS mn ON mn.idMoneda = g.idMoneda
                INNER JOIN banco AS bn ON bn.idBanco = g.idBanco
                INNER JOIN usuario AS us ON us.idUsuario = g.idUsuario
                INNER JOIN gastoDetalle AS gd ON gd.idGasto = g.idGasto
                INNER JOIN concepto AS co ON co.idConcepto = gd.idConcepto
                WHERE
                    ( ? = 1 AND g.fecha BETWEEN ? AND ? )
                    OR
                    ( ? = 2 AND g.fecha BETWEEN ? AND ? AND g.idUsuario = ? )
                    OR
                    ( ? = 3 AND g.fecha BETWEEN ? AND ? AND g.idBanco = ? )
                    OR
                    ( ? = 4 AND g.fecha BETWEEN ? AND ? AND g.idUsuario = ? AND g.idBanco = ? )
                GROUP BY g.idGasto`, [
                req.query.opcion,
                req.query.fechaIni,
                req.query.fechaFin,

                req.query.opcion,
                req.query.fechaIni,
                req.query.fechaFin,
                req.query.idUsuario,

                req.query.opcion,
                req.query.fechaIni,
                req.query.fechaFin,
                req.query.idBanco,

                req.query.opcion,
                req.query.fechaIni,
                req.query.fechaFin,
                req.query.idUsuario,
                req.query.idBanco,

            ])


            // return { "cabecera": cabecera[0], "lista": lista };
            return lista;

        } catch (error) {
            console.log(error)
            return 'Error interno de conexión, intente nuevamente.'
        }

    }

}

module.exports = Gasto;