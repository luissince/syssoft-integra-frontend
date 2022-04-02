const express = require('express');
const router = express.Router();
const tools = require('../tools/Tools');
const Conexion = require('../database/Conexion');

router.get('/list', async function (req, res) {
    const conec = new Conexion()
    try {

        let lista = await conec.query(`SELECT * FROM cliente 
         WHERE 
         ? = 0
         OR
         ? = 1 and numDocumento like concat(?,'%')
         OR
         ? = 1 and cliente like concat(?,'%')
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
         where  
        ? = 0
        OR
        ? = 1 and numDocumento like concat(?,'%')
        OR
        ? = 1 and cliente like concat(?,'%')`, [
            parseInt(req.query.option),

            parseInt(req.query.option),
            req.query.buscar,

            parseInt(req.query.option),
            req.query.buscar,

        ]);

        res.status(200).send({ "result": resultLista, "total": total[0].Total })

    } catch (error) {
        console.log(error)
        res.status(500).send("Error interno de conexión, intente nuevamente.")
    }
});

router.post('/add', async function (req, res) {
    const conec = new Conexion()
    let connection = null;
    try {
        connection = await conec.beginTransaction();
        await conec.execute(connection, `INSERT INTO cliente (
            numDocumento, cliente, genero, telefono, email, fechaNacimiento, 
            pais, region, provincia, distrito, direccion, 
            numDocConyuge, conyuge, generoConyuge, telConyuge, emailConyuge, fechaNacConyuge,
            estadoCivil, tipoMonedaBanco, numCuentaBanco, observacion, 
            numDocBeneficiario, beneficiario, generoBeneficiario, telBeneficiario, fechaNacBeneficiario) 
            values (?,?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?, ?,?,?,?,?,?)`, [
            //representante
            req.body.numDocumento,
            req.body.cliente,
            req.body.genero,
            req.body.telefono,
            req.body.email,
            req.body.fechaNacimiento,
            //ubicacion
            req.body.pais,
            req.body.region,
            req.body.provincia,
            req.body.distrito,
            req.body.direccion,
            //conyuge
            req.body.numDocConyuge,
            req.body.conyuge,
            req.body.generoConyuge,
            req.body.telConyuge,
            req.body.emailConyuge,
            req.body.fechaNacConyuge,
            //otros datos
            req.body.estadoCivil,
            req.body.tipoMonedaBanco,
            req.body.numCuentaBanco,
            req.body.observacion,
            //Beneficiario
            req.body.numDocBeneficiario,
            req.body.beneficiario,
            req.body.generoBeneficiario,
            req.body.telBeneficiario,
            req.body.fechaNacBeneficiario,
        ])

        await conec.commit(connection);
        res.status(200).send('Datos insertados correctamente')

    } catch (err) {
        if (connection != null) {
            conec.rollback(connection);
        }
        res.status(500).send(connection);
    }
});

router.get('/id', async function (req, res) {
    const conec = new Conexion();
    try {
        // console.log(req.body.idCliente);
        let result = await conec.query('SELECT * FROM cliente WHERE idCliente = ?', [
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
    const conec = new Conexion();
    let connection = null;
    try {

        connection = await conec.beginTransaction();
        await conec.execute(connection, `UPDATE cliente SET
            numDocumento=?, cliente=?, genero=?, telefono=?, email=?, fechaNacimiento=?, 
            pais=?, region=?, provincia=?, distrito=?, direccion=?, 
            numDocConyuge=?, conyuge=?, generoConyuge=?, telConyuge=?, emailConyuge=?, fechaNacConyuge=?,
            estadoCivil=?, tipoMonedaBanco=?, numCuentaBanco=?, observacion=?, 
            numDocBeneficiario=?, beneficiario=?, generoBeneficiario=?, telBeneficiario=?, fechaNacBeneficiario=?
            WHERE idCliente=?`, [
            //representante
            req.body.numDocumento,
            req.body.cliente,
            req.body.genero,
            req.body.telefono,
            req.body.email,
            req.body.fechaNacimiento,
            //ubicacion
            req.body.pais,
            req.body.region,
            req.body.provincia,
            req.body.distrito,
            req.body.direccion,
            //conyuge
            req.body.numDocConyuge,
            req.body.conyuge,
            req.body.generoConyuge,
            req.body.telConyuge,
            req.body.emailConyuge,
            req.body.fechaNacConyuge,
            //otros datos
            req.body.estadoCivil,
            req.body.tipoMonedaBanco,
            req.body.numCuentaBanco,
            req.body.observacion,
            //Beneficiario
            req.body.numDocBeneficiario,
            req.body.beneficiario,
            req.body.generoBeneficiario,
            req.body.telBeneficiario,
            req.body.fechaNacBeneficiario,
            //id
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

module.exports = router;