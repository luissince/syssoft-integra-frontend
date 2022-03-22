const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const tools = require('../tools/Tools');
const Conexion = require('../database/Conexion');


router.get('/', async function (req, res) {
    const conec = new Conexion();
    try {

        let lista = await conec.query(`SELECT 
                idComprobante,
                nombre,
                serie,
                numeracion,
                impresion,
                estado, 
                DATE_FORMAT(fechaRegistro,'%d/%m/%Y') as fechaRegistro,
                horaRegistro
                FROM comprobante LIMIT ?,?`, [
            parseInt(req.query.posicionPagina),
            parseInt(req.query.filasPorPagina)
        ]);


        let resultLista = lista.map(function (item, index) {
            return {
                ...item,
                id: (index + 1) + parseInt(req.query.posicionPagina),
            };
        });

        let total = await conec.query('SELECT COUNT(*) AS Total FROM comprobante');

        res.status(200).send({ "result": resultLista, "total": total[0].Total });
    } catch (error) {
        console.log(error)
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
    // var pool = mysql.createPool({
    //     host: 'localhost',
    //     user: 'root',
    //     password: '',
    //     database: 'inmobiliaria'
    // });

    // const promise = new Promise(function (resolve, reject) {
    //     pool.getConnection(function (err, connection) {
    //         if (err) {
    //             return reject(err.sqlMessage);

    //         };
    //         connection.query(`SELECT 
    //         idComprobante,
    //         nombre,
    //         serie,
    //         numeracion,
    //         impresion,
    //         estado, 
    //         DATE_FORMAT(fechaRegistro,'%d/%m/%Y') as fechaRegistro,
    //         horaRegistro
    //         FROM comprobante LIMIT ?,?`, [
    //             parseInt(req.query.posicionPagina),
    //             parseInt(req.query.filasPorPagina)
    //         ], function (err, result) {
    //             if (err) return reject(err.sqlMessage);

    //             let lista = [];
    //             let count = 0;
    //             for (let value of result) {
    //                 count++;
    //                 lista.push({
    //                     "id": count + parseInt(req.query.posicionPagina),
    //                     "nombre": value.nombre,
    //                     "serie": value.serie,
    //                     "numeracion": value.numeracion,
    //                     "impresion": value.impresion,
    //                     "estado": value.estado,
    //                     "fechaRegistro": value.fechaRegistro,
    //                     "horaRegistro": value.horaRegistro
    //                 });
    //             }

    //             connection.query(`SELECT COUNT(*) AS Total
    //             FROM comprobante`, function (err, result) {
    //                 if (err) return reject(err.sqlMessage);

    //                 connection.release();
    //                 return resolve({ "result": lista, "total": result[0].Total });
    //             });
    //         });
    //     });
    // });

    // try {
    //     let result = await promise;
    //     res.status(200).send(result);
    // } catch (error) {
    //     res.status(500).send({ "message": error });
    // }
});

router.post('/', async function (req, res) {
    var pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'inmobiliaria'
    });

    const promise = new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                return reject(err.sqlMessage);
            }

            connection.beginTransaction(function (err) {
                if (err) {
                    return reject(err.sqlMessage);
                }
            });

            connection.query("SELECT * FROM comprobante", function (err, result) {
                if (err) return reject(err.sqlMessage);

                let idComprobante = "";
                if (result.length != 0) {

                    let quitarValor = result.map(function (item) {
                        return parseInt(item.idComprobante.replace("CB", ''));
                    });

                    let valorActual = Math.max(...quitarValor);
                    let incremental = valorActual + 1;
                    let codigoGenerado = "";
                    if (incremental <= 9) {
                        codigoGenerado = 'CB000' + incremental;
                    } else if (incremental >= 10 && incremental <= 99) {
                        codigoGenerado = 'CB00' + incremental;
                    } else if (incremental >= 100 && incremental <= 999) {
                        codigoGenerado = 'CB0' + incremental;
                    } else {
                        codigoGenerado = 'CB' + incremental;
                    }

                    idComprobante = codigoGenerado;
                } else {
                    idComprobante = "CB0001";
                }

                connection.query("INSERT INTO comprobante (idComprobante,nombre,serie,numeracion,impresion,estado,fechaRegistro,horaRegistro,idUsuario) VALUES(?,?,?,?,?,?,?,?,?)", [
                    idComprobante,
                    req.body.nombre,
                    req.body.serie,
                    req.body.numeracion,
                    req.body.impresion,
                    req.body.estado,
                    tools.currentDate(),
                    tools.currentTime(),
                    req.body.idUsuario,
                ], function (err, results) {
                    if (err) {
                        return connection.rollback(function () {
                            reject(err.sqlMessage);
                        });
                    }

                    connection.commit(function (err) {
                        if (err) {
                            return connection.rollback(function () {
                                reject(err.sqlMessage);
                            });
                        }

                        connection.release();
                        return resolve("bien!!");
                    });
                });
            });
        });
    });

    try {
        let result = await promise;
        res.status(201).send({ "message": result });
    } catch (error) {
        console.error(error)
        res.status(500).send({ "message": error });
    }
});


module.exports = router;