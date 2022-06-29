const { currentDate, currentTime } = require('../tools/Tools');
const Conexion = require('../database/Conexion');
const conec = new Conexion();

class Concepto {

    async list(req) {
        try {
            let lista = await conec.query(`SELECT 
                idConcepto,
                nombre,
                tipo,
                DATE_FORMAT(fecha,'%d/%m/%Y') as fecha,
                hora 
                FROM concepto
                WHERE 
                ? = 0
                OR
                ? = 1 and nombre like concat(?,'%')
                LIMIT ?,?`, [
                parseInt(req.query.opcion),

                parseInt(req.query.opcion),
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

            let total = await conec.query(`SELECT COUNT(*) AS Total FROM concepto
                WHERE 
                ? = 0
                OR
                ? = 1 and nombre like concat(?,'%')`, [
                parseInt(req.query.opcion),

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

            let result = await conec.execute(connection, 'SELECT idConcepto FROM concepto');
            let idConcepto = "";
            if (result.length != 0) {

                let quitarValor = result.map(function (item) {
                    return parseInt(item.idConcepto.replace("CP", ''));
                });

                let valorActual = Math.max(...quitarValor);
                let incremental = valorActual + 1;
                let codigoGenerado = "";
                if (incremental <= 9) {
                    codigoGenerado = 'CP000' + incremental;
                } else if (incremental >= 10 && incremental <= 99) {
                    codigoGenerado = 'CP00' + incremental;
                } else if (incremental >= 100 && incremental <= 999) {
                    codigoGenerado = 'CP0' + incremental;
                } else {
                    codigoGenerado = 'CP' + incremental;
                }

                idConcepto = codigoGenerado;
            } else {
                idConcepto = "CP0001";
            }

            await conec.execute(connection, `INSERT INTO concepto(
                idConcepto, 
                nombre, 
                tipo,
                codigo,
                fecha, 
                hora,
                fupdate,
                hupdate,
                idUsuario) 
                VALUES(?,?,?,?,?,?,?,?,?)`, [
                idConcepto,
                req.body.nombre,
                req.body.tipo,
                req.body.codigo,
                currentDate(),
                currentTime(),
                currentDate(),
                currentTime(),
                req.body.idUsuario
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
            let result = await conec.query('SELECT * FROM concepto WHERE idConcepto  = ?', [
                req.query.idConcepto
            ]);

            if (result.length > 0) {
                return result[0];
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

            await conec.execute(connection, `UPDATE concepto SET 
            nombre=?, 
            tipo=?,
            codigo=?,
            fupdate=?,
            hupdate=?,
            idUsuario=?
            WHERE idConcepto=?`, [
                req.body.nombre,
                req.body.tipo,
                req.body.codigo,
                currentDate(),
                currentTime(),
                req.body.idUsuario,
                req.body.idConcepto,
            ])

            await conec.commit(connection)
            return "update";
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

            let cobroDetalle = await conec.execute(connection, `SELECT * FROM cobroDetalle WHERE idConcepto = ?`, [
                req.query.idConcepto
            ]);

            if (cobroDetalle.length > 0) {
                await conec.rollback(connection);
                return 'No se puede eliminar el concepto ya que esta ligada a un detalle de cobro.';
            }

            let gastoDetalle = await conec.execute(connection, `SELECT * FROM gastoDetalle WHERE idConcepto = ?`, [
                req.query.idConcepto
            ]);

            if (gastoDetalle.length > 0) {
                await conec.rollback(connection);
                return 'No se puede eliminar el concepto ya que esta ligada a un detalle de gasto.';
            }

            let lote = await conec.execute(connection, `SELECT * FROM lote WHERE idConcepto = ?`, [
                req.query.idConcepto
            ]);

            if (lote.length > 0) {
                await conec.rollback(connection);
                return 'No se puede eliminar el concepto ya que esta ligada a un lote.';
            }

            await conec.execute(connection, `DELETE FROM concepto WHERE idConcepto = ?`, [
                req.query.idConcepto
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

    async listcombo(req) {
        try {
            let result = await conec.query('SELECT idConcepto, nombre FROM concepto WHERE tipo = 2');
            return result;
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async listcombogasto(req){
        try {
            let result = await conec.query('SELECT idConcepto, nombre FROM concepto WHERE tipo = 1');
            return result;
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }
}

module.exports = new Concepto();