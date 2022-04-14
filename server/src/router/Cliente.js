const express = require('express');
const router = express.Router();
const tools = require('../tools/Tools');
const Conexion = require('../database/Conexion');

const conec = new Conexion()

router.get('/list', async function (req, res) {
    try {
        let lista = await conec.query(`SELECT * FROM cliente 
            WHERE 
            ? = 0
            OR
            ? = 1 and numDocumento like concat(?,'%')
            OR
            ? = 1 and infoCliente like concat(?,'%')
            LIMIT ?,?`, [
            parseInt(req.query.option),

            parseInt(req.query.option),
            req.query.buscar,

            parseInt(req.query.option),
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

        let total = await conec.query(`SELECT COUNT(*) AS Total FROM cliente
            WHERE 
            ? = 0
            OR
            ? = 1 and numDocumento like concat(?,'%')
            OR
            ? = 1 and infoCliente like concat(?,'%')`, [
            
            parseInt(req.query.option),

            parseInt(req.query.option),
            req.query.buscar,

            parseInt(req.query.option),
            req.query.buscar
        ]);

        res.status(200).send({ "result": resultLista, "total": total[0].Total })

    } catch (error) {
        console.log(error)
        res.status(500).send("Error interno de conexión, intente nuevamente.")
    }
});

router.post('/add', async function (req, res) {
    let connection = null;
    try {
        connection = await conec.beginTransaction();

        let result = await conec.execute(connection, 'SELECT idCliente FROM cliente');
        let idCliente = "";
        if (result.length != 0) {

            let quitarValor = result.map(function (item) {
                return parseInt(item.idCliente.replace("CL", ''));
            });

            let valorActual = Math.max(...quitarValor);
            let incremental = valorActual + 1;
            let codigoGenerado = "";
            if (incremental <= 9) {
                codigoGenerado = 'CL000' + incremental;
            } else if (incremental >= 10 && incremental <= 99) {
                codigoGenerado = 'CL00' + incremental;
            } else if (incremental >= 100 && incremental <= 999) {
                codigoGenerado = 'CL0' + incremental;
            } else {
                codigoGenerado = 'CL' + incremental;
            }

            idCliente = codigoGenerado;
        } else {
            idCliente = "CL0001";
        }

        await conec.execute(connection, `INSERT INTO cliente(
            idCliente, 
            numDocumento, infoCliente, genero, telefono, email, fechaNacimiento, 
            pais, region, provincia, distrito, direccion, 
            numDocConyuge, infoConyuge, generoConyuge, telConyuge, emailConyuge, fechaNacConyuge,
            estadoCivil, tipoMonedaBanco, numCuentaBanco, observacion,
            numDocBeneficiario, infoBeneficiario, generoBeneficiario, telBeneficiario, fechaNacBeneficiario)
            VALUES(?, ?,?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?, ?,?,?,?,?)`, [
            idCliente, 
            req.body.numDocumento, req.body.infoCliente, req.body.genero, req.body.telefono, req.body.email, req.body.fechaNacimiento, 
            req.body.pais, req.body.region, req.body.provincia, req.body.distrito, req.body.direccion, 
            req.body.numDocConyuge, req.body.infoConyuge, req.body.generoConyuge, req.body.telConyuge, req.body.emailConyuge, req.body.fechaNacConyuge, 
            req.body.estadoCivil, req.body.tipoMonedaBanco, req.body.numCuentaBanco, req.body.observacion, 
            req.body.numDocBeneficiario, req.body.infoBeneficiario, req.body.generoBeneficiario, req.body.telBeneficiario, req.body.fechaNacBeneficiario
        ])

        // await conec.execute(connection, `INSERT INTO cliente(
        //     idCliente, 
        //     numDocumento, infoCliente, genero, telefono, email, fechaNacimiento, 
        //     pais, region, provincia, distrito, direccion)
        //     VALUES(?, ?,?,?,?,?,?, ?,?,?,?,?)`, [
        //     idCliente, 
        //     req.body.numDocumento, req.body.infoCliente, req.body.genero, req.body.telefono, req.body.email, req.body.fechaNacimiento,
        //     req.body.pais, req.body.region, req.body.provincia, req.body.distrito, req.body.direccion, 
        // ])

        await conec.commit(connection);
        res.status(200).send('Datos insertados correctamente')
    } catch (error) {
        if (connection != null) {
            conec.rollback(connection);
        }
        res.status(500).send("Error de servidor");
        console.log(error)
    }
});

router.get('/id', async function (req, res) {
    try {

        let result = await conec.query('SELECT * FROM cliente WHERE idCliente  = ?', [
            req.query.idCliente,
        ]);

        if (result.length > 0) {
            res.status(200).send(result[0]);
        } else {
            res.status(400).send("Datos no encontrados");
        }

    } catch (error) {
        console.log(error)
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }

});

router.post('/update', async function (req, res) {
    let connection = null;
    try {

        connection = await conec.beginTransaction();
        await conec.execute(connection, `UPDATE cliente SET
            numDocumento=?, infoCliente=?, genero=?, telefono=?, email=?, fechaNacimiento=?, 
            pais=?, region=?, provincia=?, distrito=?, direccion=?, 
            numDocConyuge=?, infoConyuge=?, generoConyuge=?, telConyuge=?, emailConyuge=?, fechaNacConyuge=?,
            estadoCivil=?, tipoMonedaBanco=?, numCuentaBanco=?, observacion=?,
            numDocBeneficiario=?, infoBeneficiario=?, generoBeneficiario=?, telBeneficiario=?, fechaNacBeneficiario=?
            WHERE idCliente=?`, [
            req.body.numDocumento, req.body.infoCliente, req.body.genero, req.body.telefono, req.body.email, req.body.fechaNacimiento, 
            req.body.pais, req.body.region, req.body.provincia, req.body.distrito, req.body.direccion, 
            req.body.numDocConyuge, req.body.infoConyuge, req.body.generoConyuge, req.body.telConyuge, req.body.emailConyuge, req.body.fechaNacConyuge, 
            req.body.estadoCivil, req.body.tipoMonedaBanco, req.body.numCuentaBanco, req.body.observacion, 
            req.body.numDocBeneficiario, req.body.infoBeneficiario, req.body.generoBeneficiario, req.body.telBeneficiario, req.body.fechaNacBeneficiario, 
            req.body.idCliente
        ])

        await conec.commit(connection)
        res.status(200).send('Los datos se actualizaron correctamente.')
    } catch (error) {
        if (connection != null) {
            conec.rollback(connection);
        }
        res.status(500).send("Se produjo un error de servidor, intente nuevamente.");
    }
});

router.get('/listcombo', async function (req, res) {
    try {
        let result = await conec.query('SELECT idCliente, numDocumento, infoCliente FROM cliente');
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
});

module.exports = router;