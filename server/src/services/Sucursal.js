const {
    currentDate,
    currentTime,
    isDirectory,
    removeFile,
    writeFile,
    mkdir,
    chmod,
} = require('../tools/Tools');
const path = require("path");
const { sendSuccess, sendSave, sendClient, sendError } = require('../tools/Message');
const Conexion = require('../database/Conexion');
const conec = new Conexion();

class Sucursal {

    async list(req, res) {
        try {
            const lista = await conec.query(`SELECT  
            p.idSucursal,
            p.nombre,
            p.ubicacion,
            p.area,
            p.idMoneda,
            p.preciometro,
            m.simbolo,
            p.estado
            FROM sucursal AS p INNER JOIN moneda AS m
            ON m.idMoneda = p.idMoneda 
            WHERE 
            ? = 0
            OR
            ? = 1 AND p.nombre LIKE concat(?,'%')
            LIMIT ?,?`, [
                parseInt(req.query.opcion),

                parseInt(req.query.opcion),
                req.query.buscar,

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
            FROM sucursal AS p INNER JOIN moneda AS m
            ON m.idMoneda = p.idMoneda 
            WHERE 
            ? = 0
            OR
            ? = 1 AND p.nombre LIKE concat(?,'%')`, [
                parseInt(req.query.opcion),

                parseInt(req.query.opcion),
                req.query.buscar,

            ]);

            return sendSuccess(res,{ "result": resultLista, "total": total[0].Total });
        } catch (error) {
            return sendError(res, "Se produjo un error de servidor, intente nuevamente.");
        }
    }

    async add(req, res) {
        let connection = null;
        try {
            connection = await conec.beginTransaction();

            let result = await conec.execute(connection, 'SELECT idSucursal FROM sucursal');
            let idSucursal = "";
            if (result.length != 0) {

                let quitarValor = result.map(function (item) {
                    return parseInt(item.idSucursal.replace("PR", ''));
                });

                let valorActual = Math.max(...quitarValor);
                let incremental = valorActual + 1;
                let codigoGenerado = "";
                if (incremental <= 9) {
                    codigoGenerado = 'PR000' + incremental;
                } else if (incremental >= 10 && incremental <= 99) {
                    codigoGenerado = 'PR00' + incremental;
                } else if (incremental >= 100 && incremental <= 999) {
                    codigoGenerado = 'PR0' + incremental;
                } else {
                    codigoGenerado = 'PR' + incremental;
                }

                idSucursal = codigoGenerado;
            } else {
                idSucursal = "PR0001";
            }

            let file = path.join(__dirname, '../', 'path/proyect');

            if (!isDirectory(file)) {
                mkdir(file);
                chmod(file);
            }

            let fileImage = "";
            if (req.body.imagen !== "") {
                let nameImage = `${Date.now() + idSucursal}.${req.body.extension}`;

                writeFile(path.join(file, nameImage), req.body.imagen);
                fileImage = nameImage;
            }

            await conec.execute(connection, `INSERT INTO sucursal (
                idSucursal,
                nombre, 
                idEmpresa, 
                area,
                estado, 
                ubicacion,
                idUbigeo, 
                lnorte,
                leste, 
                lsur, 
                loeste, 
                idMoneda,
                tea, 
                preciometro, 
                numContratoCorrelativo, 
                numRecibocCorrelativo, 
                imagen,
                extension,
                ruta,
                fecha,
                hora,
                fupdate,
                hupdate,
                idUsuario) 
                values (?, ?,?,?,?, ?,?, ?,?,?,?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
                idSucursal,
                //datos
                req.body.nombre,
                req.body.idEmpresa,
                req.body.area,
                req.body.estado,
                //ubicacion
                req.body.ubicacion,
                req.body.idUbigeo,
                //limite
                req.body.lnorte,
                req.body.leste,
                req.body.lsur,
                req.body.loeste,
                //ajustes
                req.body.idMoneda,
                req.body.tea,
                req.body.preciometro,
                req.body.numContratoCorrelativo,
                req.body.numRecibocCorrelativo,
                //imagen
                req.body.imagen,
                req.body.extension,
                '',
                currentDate(),
                currentTime(),
                currentDate(),
                currentTime(),
                req.body.idUsuario,
            ])

            await conec.commit(connection);
            return sendSave(res, "Se registró correctamente el sucursal.");
        } catch (err) {
            if (connection != null) {
                await conec.rollback(connection);
            }
            return sendError(res, "Se produjo un error de servidor, intente nuevamente.");
        }
    }

    async id(req, res) {
        try {
            let result = await conec.query(`SELECT 
            p.idSucursal,
            p.nombre,
            p.idEmpresa,
            p.area,
            p.estado,
            p.ubicacion,

            p.idUbigeo,
            u.ubigeo,
            u.departamento,
            u.provincia,
            u.distrito,

            p.lnorte,
            p.leste,
            p.lsur,
            p.loeste,
            p.idMoneda,
            p.tea,
            p.preciometro,
            p.numContratoCorrelativo,
            p.numRecibocCorrelativo,
            p.ruta
            FROM sucursal AS p
            INNER JOIN ubigeo AS u ON u.idUbigeo = p.idUbigeo
            WHERE p.idSucursal = ?`, [
                req.query.idSucursal,
            ]);

            if (result.length > 0) {
                return sendSuccess(res, result[0]);
            } else {
                return sendClient(res, "Datos no encontrados");
            }
        } catch (error) {
            return sendError(res, "Se produjo un error de servidor, intente nuevamente.");
        }
    }

    async edit(req, res) {
        let connection = null;
        try {
            connection = await conec.beginTransaction();

            let file = path.join(__dirname, '../', 'path/proyect');

            if (!isDirectory(file)) {
                mkdir(file);
                chmod(file);
            }

            let sucursal = await conec.execute(connection, `SELECT
            imagen,
            extension,
            ruta
            FROM sucursal
            WHERE idSucursal = ?`, [
                req.body.idSucursal
            ]);

            let fileImage = "";
            let extImage = "";
            let rutaImage = "";
            if (req.body.imagen !== "") {
                removeFile(path.join(file, sucursal[0].ruta));

                let nameImage = `${Date.now() + req.body.idSucursal}.${req.body.extension}`;
                writeFile(path.join(file, nameImage), req.body.imagen);
                fileImage = req.body.imagen;
                extImage = req.body.extension;
                rutaImage = nameImage;
            } else {
                fileImage = sucursal[0].imagen;
                extImage = sucursal[0].extension;
                rutaImage = sucursal[0].ruta;
            }

            await conec.execute(connection, `UPDATE sucursal SET
                nombre=?, 
                idEmpresa=?,
                area=?,
                estado=?, 
                ubicacion=?,
                idUbigeo=?, 
                lnorte=?, 
                leste=?,
                lsur=?,
                loeste=?, 
                idMoneda=?,
                tea=?, 
                preciometro=?,
                numContratoCorrelativo=?, 
                numRecibocCorrelativo=?,
                imagen=?,
                extension=?,
                ruta=?,
                fupdate=?,
                hupdate=?,
                idUsuario=?
                WHERE idSucursal=?`, [
                //datos
                req.body.nombre,
                req.body.idEmpresa,
                req.body.area,
                req.body.estado,
                //ubicacion
                req.body.ubicacion,
                req.body.idUbigeo,
                //limite
                req.body.lnorte,
                req.body.leste,
                req.body.lsur,
                req.body.loeste,
                //ajustes
                req.body.idMoneda,
                req.body.tea,
                req.body.preciometro,
                req.body.numContratoCorrelativo,
                req.body.numRecibocCorrelativo,
                //imagen
                fileImage,
                extImage,
                rutaImage,
                currentDate(),
                currentTime(),
                req.body.idUsuario,
                req.body.idSucursal
            ]);

            await conec.commit(connection)
            return sendSave(res, 'Se actualizó correctamente el sucursal.');
        } catch (error) {
            if (connection != null) {
                await conec.rollback(connection);
            }
            return sendError(res, "Se produjo un error de servidor, intente nuevamente.");
        }
    }

    async delete(req, res) {
        let connection = null;
        try {
            connection = await conec.beginTransaction();

            let sucursal = await conec.execute(connection, `SELECT ruta FROM sucursal WHERE idSucursal = ?`, [
                req.query.idSucursal
            ]);

            if (sucursal.length == 0) {
                await conec.rollback(connection);
                return sendClient(res, "El sucursal a eliminar no existe, recargue su pantalla.");
            }

            let categoria = await conec.execute(connection, `SELECT * FROM categoria WHERE idSucursal = ?`, [
                req.query.idSucursal
            ]);

            if (categoria.length > 0) {
                await conec.rollback(connection);
                return sendClient(res, 'No se puede eliminar el sucursal ya que esta ligada a una categoria.');
            }

            let cobro = await conec.execute(connection, `SELECT idCobro FROM cobro WHERE idSucursal = ?`, [
                req.query.idSucursal
            ]);

            if (cobro.length > 0) {
                await conec.rollback(connection);
                return sendClient(res, 'No se puede eliminar el sucursal ya que esta ligada a unos cobros.');
            }

            let gasto = await conec.execute(connection, `SELECT idGasto FROM gasto WHERE idSucursal = ?`, [
                req.query.idSucursal
            ]);

            if (gasto.length > 0) {
                await conec.rollback(connection);
                return sendClient(res, 'No se puede eliminar el sucursal ya que esta ligada a unos gastos.');
            }

            let venta = await conec.execute(connection, `SELECT idVenta  FROM venta WHERE idSucursal = ?`, [
                req.query.idSucursal
            ]);

            if (venta.length > 0) {
                await conec.rollback(connection);
                return sendClient(res, 'No se puede eliminar el sucursal ya que esta ligada a unas ventas.');
            }

            let file = path.join(__dirname, '../', 'path/proyect');
            removeFile(path.join(file, sucursal[0].ruta));

            await conec.execute(connection, `DELETE FROM sucursal WHERE idSucursal = ?`, [
                req.query.idSucursal
            ]);

            await conec.commit(connection);
            return sendSave(res, "Se eliminó correctamente el sucursal.");
        } catch (error) {
            if (connection != null) {
                await conec.rollback(connection);
            }
            return sendError(res, "Se produjo un error de servidor, intente nuevamente.");
        }
    }

    async inicio(req, res) {
        try {           
            const sucursales = await conec.query(`SELECT 
            p.idSucursal,
            p.nombre,
            p.ubicacion,
            p.area,
            m.codiso,
            m.nombre as moneda,
            m.simbolo,
            p.ruta,
            p.estado
            FROM sucursal AS p
            INNER JOIN moneda AS m ON m.idMoneda = p.idMoneda
            `);

            return sendSuccess(res, sucursales);
        } catch (error) {
            console.log(error)
            return sendError(res, "Se produjo un error de servidor, intente nuevamente.");
        }
    }

    async combo(req, res){
        try{
            const sucursales = await conec.query(`SELECT idSucursal,nombre FROM sucursal`)
            return sendSuccess(res, sucursales);
        }catch(error){
            return sendError(res, "Se produjo un error de servidor, intente nuevamente.");
        }
    }

}

module.exports = new Sucursal();