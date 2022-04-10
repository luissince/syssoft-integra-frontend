const express = require('express');
const router = express.Router();
const tools = require('../tools/Tools');
const Conexion = require('../database/Conexion');
const conec = new Conexion()

router.get('/list', async function (req, res) {

    try {

        let lista = await conec.query(`SELECT * FROM sede 
         WHERE 
         ? = 0
         OR
         ? = 1 and nombreSede like concat(?,'%')
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

        let total = await conec.query(`SELECT COUNT(*) AS Total FROM sede
        where  
        ? = 0
        OR
        ? = 1 and nombreSede like concat(?,'%')`, [
            parseInt(req.query.opcion),

            parseInt(req.query.opcion),
            req.query.buscar,

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

        let result = await conec.execute(connection, 'SELECT idBanco FROM sede');
        let idSede = "";
        if (result.length != 0) {

            let quitarValor = result.map(function (item) {
                return parseInt(item.idSede.replace("SD", ''));
            });

            let valorActual = Math.max(...quitarValor);
            let incremental = valorActual + 1;
            let codigoGenerado = "";
            if (incremental <= 9) {
                codigoGenerado = 'SD000' + incremental;
            } else if (incremental >= 10 && incremental <= 99) {
                codigoGenerado = 'SD00' + incremental;
            } else if (incremental >= 100 && incremental <= 999) {
                codigoGenerado = 'SD0' + incremental;
            } else {
                codigoGenerado = 'SD' + incremental;
            }

            idSede = codigoGenerado;
        } else {
            idSede = "SD0001";
        }

        await conec.execute(connection, 'INSERT INTO sede (idSede ,nombreEmpresa, nombreSede, telefono, celular, email, web, direccion, pais, region, provincia, distrito) values (?,?,?,?,?,?,?,?,?,?,?,?)', [
            idSede,
            req.body.nombreEmpresa,
            req.body.nombreSede,
            req.body.telefono,
            req.body.celular,
            req.body.email,
            req.body.web,
            req.body.direccion,
            req.body.pais,
            req.body.region,
            req.body.provincia,
            req.body.distrito,
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
    try {
        let result = await conec.query('SELECT * FROM sede WHERE idSede  = ?', [
            req.query.idSede,
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

router.get('/listcombo', async function (req, res) {
    try {
        let result = await conec.query('SELECT idSede,nombreSede FROM sede');
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    } 
});

router.post('/update', async function (req, res) {

    let connection = null;
    try {

        connection = await conec.beginTransaction();
        await conec.execute(connection, 'UPDATE sede SET nombreEmpresa=?, nombreSede=?, telefono=?, celular=?, email=?, web=?, direccion=?, pais=?, region=?, provincia=?, distrito=? where idSede =?', [
            req.body.nombreEmpresa,
            req.body.nombreSede,
            req.body.telefono,
            req.body.celular,
            req.body.email,
            req.body.web,
            req.body.direccion,
            req.body.pais,
            req.body.region,
            req.body.provincia,
            req.body.distrito,
            req.body.idSede
        ])

        await conec.commit(connection)
        res.status(200).send('Datos actulizados correctamente')
        // console.log(req.body)

    } catch (error) {
        if (connection != null) {
            conec.rollback(connection);
        }
        res.status(500).send(error);
        // console.log(error)
    }
})

module.exports = router;
