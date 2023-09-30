const { sendSuccess, sendError } = require('../tools/Message');
const Conexion = require('../database/Conexion');
const conec = new Conexion();

class Dashboard {

    async totales(req, res) {
        try {

            let totalCategorias = await conec.query(`SELECT
                IFNULL(COUNT(*), 0) AS total
                FROM categoria AS m
                INNER JOIN proyecto as p ON m.idProyecto=p.idProyecto
                WHERE p.idProyecto=?`, [
                req.query.idProyecto,
            ])

            let totalProductos = await conec.query(`SELECT
                IFNULL(COUNT(*), 0) AS total
                FROM producto AS l
                INNER JOIN categoria AS m ON l.idCategoria=m.idCategoria
                INNER JOIN proyecto as p ON m.idProyecto=p.idProyecto
                WHERE p.idProyecto=?`, [
                req.query.idProyecto,
            ])

            let totalClientes = await conec.query(`SELECT IFNULL(COUNT(*), 0) AS total FROM cliente`)

            let totalVentas = await conec.query(`SELECT 
                IFNULL(SUM(vd.precio*vd.cantidad),0) AS total
                FROM venta AS v 
                LEFT JOIN ventaDetalle AS vd ON vd.idVenta = v.idVenta
                WHERE 
                MONTH(v.fecha)=MONTH(CURRENT_DATE()) AND YEAR(v.fecha)=YEAR(CURRENT_DATE())
                AND v.idProyecto = ? 
                AND v.estado <> 3`, [
                req.query.idProyecto,
            ])

            return sendSuccess(res, { "totalCategorias": totalCategorias[0].total, "totalProductos": totalProductos[0].total, "totalClientes": totalClientes[0].total, "totalVentas": totalVentas[0].total });
        } catch (error) {
            return sendError(res, "Se produjo un error de servidor, intente nuevamente.");
        }
    }

}

module.exports = new Dashboard();