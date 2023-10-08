const Conexion = require('../database/Conexion');
const { currentDate, currentTime } = require('../tools/Tools');
const conec = new Conexion();

class Almacen {
    /**
         * Metodo usado en el modulo logistica/almacenes.
         * @param {*} req 
         * @returns object | string
         */
    async listalmacenes(req) {
        try {
            let lista = await conec.procedure(`CALL Listar_Almacenes(?,?,?,?)`, [
                parseInt(req.query.opcion),
                req.query.buscar,
                // req.query.idProyecto,

                parseInt(req.query.posicionPagina),
                parseInt(req.query.filasPorPagina)
            ]);

            let resultLista = lista.map(function (item, index) {
                return {
                    ...item,
                    id: (index + 1) + parseInt(req.query.posicionPagina) 
                }
            })

            const total = await conec.procedure(`CALL Listar_Almacenes_count(?,?)`, [
                parseInt(req.query.opcion),
                req.query.buscar
            ]);
            
            return { "result": resultLista , "total": total[0].Total };
        } catch (error) {
            console.error(error);
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async addalmacenes(req) {
        let connection = null;
        try {
            connection = await conec.beginTransaction();

            const result = await conec.execute(connection, 'SELECT idAlmacen FROM almacen');
            let idAlmacen = "";
            if (result.length != 0) {
                const quitarValor = result.map(function (item) {
                    return parseInt(item.idAlmacen.replace("ALM", ''));
                });

                const incremental = Math.max(...quitarValor) + 1;
                let codigoGenerado = "";
                if (incremental <= 9) {
                    codigoGenerado = 'ALM000' + incremental;
                } else if (incremental >= 10 && incremental <= 99) {
                    codigoGenerado = 'ALM00' + incremental;
                } else if (incremental >= 100 && incremental <= 999) {
                    codigoGenerado = 'ALM0' + incremental;
                } else {
                    codigoGenerado = 'ALM' + incremental;
                }

                idAlmacen = codigoGenerado;
            } else {
                idAlmacen = "ALM0001";
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
                VALUES(?,?,?,?,?,?,?,CONVERT_TZ(NOW(), 'UTC', 'America/Lima'),CONVERT_TZ(NOW(), 'UTC', 'America/Lima'))`, [
                idAlmacen,
                req.body.nombreAlmacen,
                req.body.direccion,
                req.body.distrito,
                req.body.codigoSunat,
                req.body.observacion,
                req.body.idUsuario
            ])

            await conec.commit(connection);
            return "insert";

        } catch (error) {
            if (connection != null) {
                await conec.rollback(connection);
            }
            return error
        }
    }

    async listalmacenesbyid(req) {
        try {
            let lista = await conec.procedure(`select * from almacen where idAlmacen = ?`, [
                req.query.idAlmacen
            ]);
            return { "result": lista};
        } catch (error) {
            console.error(error);
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async updatealmacenes(req) {
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
            return error
        }
    }

    async deletealmacen(req) {
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
            return error
        }
    }
}

module.exports = Almacen;