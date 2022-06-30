const { sendSuccess, sendError } = require('../tools/Message');
const fs = require("fs");
const path = require("path");
const Conexion = require('../database/Conexion');
const conec = new Conexion();

class Empresa {

    async config(req, res) {
        try {

            let result = await conec.query(`SELECT 
            idEmpresa,
            documento,
            razonSocial,
            nombreEmpresa
            FROM empresa LIMIT 1`, []);

            sendSuccess(res, result);
        } catch (error) {
            sendError(res, error);
        }
    }

    async save(req, res) {
        let connection = null;
        try {
            connection = await conec.beginTransaction();

            let result = await conec.execute(connection, 'SELECT idEmpresa FROM empresa');
            let idEmpresa = "";
            if (result.length != 0) {

                let quitarValor = result.map(function (item) {
                    return parseInt(item.idEmpresa.replace("EM", ''));
                });

                let valorActual = Math.max(...quitarValor);
                let incremental = valorActual + 1;
                let codigoGenerado = "";
                if (incremental <= 9) {
                    codigoGenerado = 'EM000' + incremental;
                } else if (incremental >= 10 && incremental <= 99) {
                    codigoGenerado = 'EM00' + incremental;
                } else if (incremental >= 100 && incremental <= 999) {
                    codigoGenerado = 'EM0' + incremental;
                } else {
                    codigoGenerado = 'EM' + incremental;
                }

                idEmpresa = codigoGenerado;
            } else {
                idEmpresa = "EM0001";
            }

            await conec.execute(connection, `INSERT INTO empresa(
                idEmpresa ,
                documento,
                razonSocial,
                nombreEmpresa,
                telefono,
                celular,
                email,
                web,
                direccion,
                logo,
                image,
                extlogo,
                extimage
             ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
                idEmpresa,
                req.body.documento,
                req.body.razonSocial,
                req.body.nombreEmpresa,
                req.body.telefono,
                req.body.celular,
                req.body.email,
                req.body.web,
                req.body.direccion,
                req.body.logo,
                req.body.image,
                req.body.extlogo,
                req.body.extimage,
            ]);

            let file = path.join(__dirname, '../', 'path/to');

            if (req.body.logo !== "") {
                fs.writeFile(path.join(file, `logo.${req.body.extlogo}`), req.body.logo, 'base64',function(){});
            }

            if (req.body.image !== "") {
                fs.writeFile(path.join(file, `image.${req.body.extimage}`), req.body.image, 'base64',function(){});
            }

            await conec.commit(connection);
            sendSuccess(res, "Se registro correctamente la empresa.");
        } catch (error) {
            console.log(error);
            if (connection != null) {
                await conec.rollback(connection);
            }
            sendError(res, error);
        }
    }

}

module.exports = new Empresa();