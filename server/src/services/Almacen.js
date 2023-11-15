const Conexion = require('../database/Conexion');
const { currentDate, currentTime, generateAlphanumericCode } = require('../tools/Tools');
const conec = new Conexion();

class Almacen {
  
    async list(req) {
        try {
            const lista = await conec.query(`SELECT 
            idAlmacen,
            nombre,
            direccion,
            distrito,
            codigoSunat
            FROM almacen
            WHERE
            ? = 0 AND idSucursal = ?
            OR
            ? = 1 AND nombre LIKE CONCAT(?,'%') AND idSucursal = ?
            ORDER BY fecha ASC, hora ASC
            LIMIT ?,?;`, [
                parseInt(req.query.opcion),
                req.query.idSucursal,

                parseInt(req.query.opcion),
                req.query.buscar,
                req.query.idSucursal,

                parseInt(req.query.posicionPagina),
                parseInt(req.query.filasPorPagina)
            ]);

            const resultLista = lista.map(function (item, index) {
                return {
                    ...item,
                    id: (index + 1) + parseInt(req.query.posicionPagina)
                }
            })

            const total = await conec.query(`SELECT COUNT(*) AS Total
            FROM almacen
            WHERE
            ? = 0 AND idSucursal = ?
            OR
            ? = 1 AND nombre LIKE CONCAT(?,'%') AND idSucursal = ?
            `, [
                parseInt(req.query.opcion),
                req.query.idSucursal,

                parseInt(req.query.opcion),
                req.query.buscar,
                req.query.idSucursal,
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

            const result = await conec.execute(connection, 'SELECT idAlmacen FROM almacen');
            const idAlmacen = generateAlphanumericCode("AM0001", result, 'idAlmacen');
            console.log(req.body.idSucursal)
            await conec.execute(connection, `INSERT INTO almacen(
                idAlmacen, 
                idSucursal,
                nombre,
                direccion,
                distrito,
                codigoSunat,
                observacion,                
                idUsuario,
                fecha,
                hora)
                VALUES(?,?,?,?,?,?,?,?,?,?)`, [
                idAlmacen,
                req.body.idSucursal,
                req.body.nombre,
                req.body.direccion,
                req.body.distrito,
                req.body.codigoSunat,
                req.body.observacion,                
                req.body.idUsuario,
                currentDate(),
                currentTime()
            ])

            await conec.commit(connection);
            return "insert";
        } catch (error) {
            console.log(error)
            if (connection != null) {
                await conec.rollback(connection);
            }

            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async id(req) {
        try {            
            const result = await conec.query(`select * from almacen where idAlmacen = ?`, [
                req.query.idAlmacen
            ]);           
            return result[0];
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async update(req) {
        let connection = null;
        try {
            connection = await conec.beginTransaction();

            await conec.execute(connection, `UPDATE almacen                  
                set nombre = ?,
                direccion = ?,
                distrito = ?,
                codigoSunat = ?,
                observacion = ?,
                idUsuario = ?
                where idAlmacen = ?`, [
                req.body.nombre,
                req.body.direccion,
                req.body.distrito,
                req.body.codigoSunat,
                req.body.observacion,
                req.body.idUsuario,
                req.body.idAlmacen
            ])

            await conec.commit(connection);
            return "updated";
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

            await conec.execute(connection, `DELETE FROM almacen
                where idAlmacen = ?`, [
                req.body.id
            ])

            await conec.commit(connection);

            return "deleted";
        } catch (error) {
            if (connection != null) {
                await conec.rollback(connection);
            }

            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async combo(req) {
        try {
            const lista = await conec.query(`SELECT idAlmacen, nombre FROM almacen`);        
            return lista;
        } catch (error) {
            console.error(error);
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }
}

module.exports = Almacen;