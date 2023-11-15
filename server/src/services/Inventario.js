const Conexion = require('../database/Conexion');
const conec = new Conexion();

class Inventario {

    async list(req) {
        try {           
            const lista = await conec.query(`SELECT 
            p.codigo,
            p.nombre AS producto,
            p.descripcion,
            p.costo,
            m.nombre AS medida,
            a.nombre AS almacen,
            a.direccion,
            i.cantidad,
            i.cantidadMaxima,
            i.cantidadMinima
            FROM inventario AS i
            INNER JOIN producto AS p ON p.idProducto = i.idProducto
            INNER JOIN medida AS m ON m.idMedida = p.idMedida
            INNER JOIN almacen AS a ON a.idAlmacen = i.idAlmacen
            WHERE
            ? = 0 AND a.idSucursal = ?
            OR
            ? = 1 AND p.codigo = ? AND a.idSucursal = ?
            OR
            ? = 1 AND p.nombre = ? AND a.idSucursal = ?

            ORDER BY i.cantidad ASC
            LIMIT ?,?`, [
                parseInt(req.query.opcion),
                req.query.idSucursal,

                parseInt(req.query.opcion),
                req.query.buscar,
                req.query.idSucursal,

                parseInt(req.query.opcion),
                req.query.buscar,
                req.query.idSucursal,

                parseInt(req.query.posicionPagina),
                parseInt(req.query.filasPorPagina)
            ])

            const resultLista = lista.map(function (item, index) {
                return {
                    ...item,
                    id: (index + 1) + parseInt(req.query.posicionPagina)
                }
            });

            const total = await conec.query(`SELECT COUNT(*) AS Total
            FROM inventario AS i
            INNER JOIN producto AS p ON p.idProducto = i.idProducto
            INNER JOIN medida AS m ON m.idMedida = p.idMedida
            INNER JOIN almacen AS a ON a.idAlmacen = i.idAlmacen
            WHERE
            ? = 0 AND a.idSucursal = ?
            OR
            ? = 1 AND p.codigo = ? AND a.idSucursal = ?
            OR
            ? = 1 AND p.nombre = ? AND a.idSucursal = ?`, [
                parseInt(req.query.opcion),
                req.query.idSucursal,

                parseInt(req.query.opcion),
                req.query.buscar,
                req.query.idSucursal,

                parseInt(req.query.opcion),
                req.query.buscar,
                req.query.idSucursal,

            ]);
            return { "result": resultLista, "total": total[0].Total }
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

}

module.exports = Inventario;