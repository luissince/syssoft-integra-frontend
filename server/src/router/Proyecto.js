const express = require('express');
const router = express.Router();
const tools = require('../tools/Tools');
const Conexion = require('../database/Conexion');
const conec = new Conexion()

router.get('/list', async function (req, res) {
    try {
        let lista = await conec.query(`SELECT  
        idProyecto,
        nombre,
        numPartidaElectronica,
        area,
        moneda,
        tea
        FROM proyecto 
        WHERE 
        ? = 0
        OR
        ? = 1 AND nombre LIKE concat(?,'%')
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

        let total = await conec.query(`SELECT COUNT(*) AS Total FROM proyecto
        WHERE
        ? = 0
        OR
        ? = 1 AND nombre LIKE concat(?,'%')`, [
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

router.post('/', async function (req, res) {
    let connection = null;
    try {
        connection = await conec.beginTransaction();

        let result = await conec.execute(connection, 'SELECT idProyecto FROM proyecto');
        let idProyecto = "";
        if (result.length != 0) {

            let quitarValor = result.map(function (item) {
                return parseInt(item.idProyecto.replace("PR", ''));
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

            idProyecto = codigoGenerado;
        } else {
            idProyecto = "PR0001";
        }

        await conec.execute(connection, `INSERT INTO proyecto (
            idProyecto,
            nombre, 
            idSede, 
            numPartidaElectronica,
            area,
            estado, 
            ubicacion,
            idUbigeo, 
            lnorte,
            leste, 
            lsur, 
            loeste, 
            moneda,
            tea, 
            preciometro, 
            costoxlote,
            numContratoCorrelativo, 
            numRecibocCorrelativo, 
            inflacionAnual, 
            imagen,
            extension) 
            values (?, ?,?,?,?,?, ?,?, ?,?,?,?, ?,?,?,?,?,?,?,?,?)`, [
            idProyecto,
            //datos
            req.body.nombre,
            req.body.idSede,
            req.body.numPartidaElectronica,
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
            req.body.moneda,
            req.body.tea,
            req.body.preciometro,
            req.body.costoxlote,
            req.body.numContratoCorrelativo,
            req.body.numRecibocCorrelativo,
            req.body.inflacionAnual,
            //imagen
            req.body.imagen,
            req.body.extension,
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

router.put('/', async function (req, res) {
    let connection = null;
    try {
       
        connection = await conec.beginTransaction();
        await conec.execute(connection, `UPDATE proyecto SET
            nombre=?, 
            idSede=?,
            numPartidaElectronica=?,
            area=?,
            estado=?, 
            ubicacion=?,
            idUbigeo=?, 
            lnorte=?, 
            leste=?,
            lsur=?,
            loeste=?, 
            moneda=?,
            tea=?, 
            preciometro=?,
            costoxlote=?, 
            numContratoCorrelativo=?, 
            numRecibocCorrelativo=?,
            inflacionAnual=?, 
            imagen=?,
            extension=? 
            WHERE idProyecto=?`, [
            //datos
            req.body.nombre,
            req.body.idSede,
            req.body.numPartidaElectronica,
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
            req.body.moneda,
            req.body.tea,
            req.body.preciometro,
            req.body.costoxlote,
            req.body.numContratoCorrelativo,
            req.body.numRecibocCorrelativo,
            req.body.inflacionAnual,
            //imagen
            req.body.imagen,
            req.body.extension,
            req.body.idProyecto
        ])

        await conec.commit(connection)
        res.status(200).send('Los datos se actualizarón correctamente.')
    } catch (error) {
        if (connection != null) {
            conec.rollback(connection);
        }
        res.status(500).send("Se produjo un error de servidor, intente nuevamente.");
    }
});

router.get('/id', async function (req, res) {
    try {
        let result = await conec.query(`SELECT 
        p.idProyecto,
        p.nombre,
        p.idSede,
        p.numPartidaElectronica,
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
        p.moneda,
        p.tea,
        p.preciometro,
        p.costoxlote,
        p.numContratoCorrelativo,
        p.numRecibocCorrelativo,
        p.inflacionAnual,
        p.imagen,
        p.extension
        FROM proyecto AS p
        INNER JOIN ubigeo AS u ON u.idUbigeo = p.idUbigeo
        WHERE p.idProyecto = ?`, [
            req.query.idProyecto,
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

router.delete('/', async function (req, res) {
    let connection = null; 
    try {
      
        connection = await conec.beginTransaction();

        await conec.execute(connection,`DELETE FROM proyecto WHERE idProyecto = ?`,[
            req.query.idProyecto
        ]);

        await conec.commit(connection)
        res.status(200).send('Se eliminó correctamente el proyecto.')
    } catch (error) {
        if (connection != null) {
            conec.rollback(connection);
        }
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
});


router.get('/inicio', async function (req, res) {
    try {
        let result = await conec.query(`SELECT idProyecto ,nombre,ubicacion,'' as imagen,extension FROM proyecto`);
        res.status(200).send(result);
    } catch (error) {
        console.log(error)
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
});

module.exports = router;