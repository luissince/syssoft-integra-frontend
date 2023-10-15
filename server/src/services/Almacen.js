const Conexion = require('../database/Conexion');
const { currentDate, currentTime } = require('../tools/Tools');
const conec = new Conexion();

class Almacen {
    /**
         * Metodo usado en el modulo logistica/almacenes.
         * @param {*} req 
         * @returns object | string
         */
    async list(req) {
        try {
            const lista = await conec.procedure(`CALL Listar_Almacenes(?,?,?,?)`, [
                parseInt(req.query.opcion),
                req.query.buscar,
                // req.query.idProyecto,

                parseInt(req.query.posicionPagina),
                parseInt(req.query.filasPorPagina)
            ]);

            const resultLista = lista.map(function (item, index) {
                return {
                    ...item,
                    id: (index + 1) + parseInt(req.query.posicionPagina)
                }
            })

            const total = await conec.procedure(`CALL Listar_Almacenes_count(?,?)`, [
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

            const result = await conec.execute(connection, 'SELECT idAlmacen FROM almacen');
            let idAlmacen = "AM0001";
            if (result.length != 0) {
                const quitarValor = result.map(item => parseInt(item.idAlmacen.replace("AM", '')));
                const incremental = Math.max(...quitarValor) + 1;
                const formattedIncremental = String(incremental).padStart(4, '0'); // Formatea el número con ceros a la izquierda si es necesario
                idProductidAlmaceno = `AM${formattedIncremental}`;
            } 

            await conec.execute(connection, `INSERT INTO almacen(
                idAlmacen, 
                nombre,
                direccion,
                distrito,
                codigoSunat,
                observacion,
                idUsuario,
                created_at,
                updated_at)
                VALUES(?,?,?,?,?,?,?,?,?)`, [
                idAlmacen,
                req.body.nombreAlmacen,
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
            if (connection != null) {
                await conec.rollback(connection);
            }

            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async id(req) {
        try {
            let lista = await conec.procedure(`select * from almacen where idAlmacen = ?`, [
                req.query.idAlmacen
            ]);
            return { "result": lista };
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
                idUsuario = ?,
                updated_at = CONVERT_TZ(NOW(), 'UTC', 'America/Lima')
                where idAlmacen = ?`, [

                req.body.nombreAlmacen,
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