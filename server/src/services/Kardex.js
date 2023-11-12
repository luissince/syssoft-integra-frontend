const { sendSuccess, sendError } = require('../tools/Message');
const Conexion = require('../database/Conexion');
const conec = new Conexion();

class Kardex {

    async list(req, res) {
        try {
            const kardex = await conec.query(`
            SELECT 
            p.idProducto,
            tk.nombre as tipo,
            DATE_FORMAT(k.fecha,'%d/%m/%Y') as fecha,
            k.hora,
            k.detalle,
            k.cantidad,
            k.costo,
            al.nombre as almacen,
            u.apellidos,
            u.nombres
            from kardex as k 
            INNER JOIN producto as p ON k.idProducto = p.idProducto
            INNER JOIN tipoKardex as tk ON k.idTipoKardex = tk.IdTipoKardex
            INNER JOIN almacen as al ON k.idAlmacen = al.idAlmacen
            INNER JOIN usuario AS u ON k.idUsuario = u.idUsuario
            WHERE k.idProducto = ?
            ORDER BY k.fecha ASC, k.hora ASC
            `, [
                req.query.idProducto,
            ]);

            return kardex;
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }


}

module.exports = Kardex;