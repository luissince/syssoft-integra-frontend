const express = require('express');
const router = express.Router();
const { currentDate } = require('../tools/Tools');
const { decrypt } = require('../tools/CryptoJS');

const Banco = require('../services/Banco');
const Sede = require('../services/Sede');
const RepFinanciero = require('../report/RepFinanciero');

const banco = new Banco();
const sede = new Sede();
const repFinanciero = new RepFinanciero();

const Conexion = require('../database/Conexion');
const conec = new Conexion();

router.get('/list', async function (req, res) {
    try {
        let lista = await conec.query(`SELECT 
        b.idBanco, 
        b.nombre, 
        CASE 
        WHEN b.tipoCuenta = 1 THEN 'Banco'
        WHEN b.tipoCuenta = 2 THEN 'Tarjeta'
        ELSE 'Efectivo' END AS 'tipoCuenta',
        m.nombre as moneda,
        m.codiso,
        b.numCuenta,
        b.cci,
        IFNULL(SUM(CASE WHEN bd.tipo = 1 THEN bd.monto ELSE -bd.monto END),0)AS saldo
        FROM banco AS b 
        INNER JOIN moneda AS m ON m.idMoneda = b.idMoneda 
        LEFT JOIN bancoDetalle AS bd ON bd.idBanco = b.idBanco 
        WHERE 
        ? = 0
        OR
        ? = 1 and b.nombre like concat(?,'%')
        GROUP BY b.idBanco
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

        let total = await conec.query(`SELECT COUNT(*) AS Total 
        FROM banco AS b INNER JOIN moneda AS m
        ON m.idMoneda = b.idMoneda 
        WHERE 
        ? = 0
        OR
        ? = 1 and b.nombre like concat(?,'%')`, [
            parseInt(req.query.opcion),

            parseInt(req.query.opcion),
            req.query.buscar
        ]);

        res.status(200).send({ "result": resultLista, "total": total[0].Total });
    } catch (error) {
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
});

router.post('/', async function (req, res) {
    const result = await banco.add(req)
    if (result === 'insert') {
        res.status(201).send("Se registró correctamente el banco.");
    } else {
        res.status(500).send(result);
    }
});

router.put('/', async function (req, res) {
    const result = await banco.update(req)
    if (result === 'update') {
        res.status(201).send("Se actualizó correctamente el banco.");
    } else {
        res.status(500).send(result);
    }
});

router.get('/id', async function (req, res) {
    const result = await banco.id(req)
    if (typeof result === 'object') {
        res.status(200).send(result);
    } else {
        res.status(500).send(result);
    }
});

router.delete('/', async function (req, res) {
    const result = await banco.delete(req)
    if (result === 'delete') {
        res.status(201).send("Se eliminó correctamente el banco.");
    } else {
        res.status(500).send(result);
    }
});

router.get('/listcombo', async function (req, res) {
    const result = await banco.listcombo(req)
    if (Array.isArray(result)) {
        res.status(200).send(result);
    } else {
        res.status(500).send(result);
    }
});

router.get('/detalle', async function (req, res) {
    const result = await banco.detalleBanco(req)
    if (typeof result === 'object') {
        res.status(200).send(result)
    } else {
        res.status(500).send(result)
    }
});

router.get('/repdetallebanco', async function (req, res) {
    const decryptedData = decrypt(req.query.params, 'key-report-inmobiliaria');

    req.query.idBanco = decryptedData.idBanco;
    req.query.idSede = decryptedData.idSede;

    const sedeInfo = await sede.infoSedeReporte(req)

    if (typeof sedeInfo !== 'object') {
        res.status(500).send(sedeInfo)
        return;
    }

    const detalle = await banco.detalleBanco(req)

    if (typeof detalle === 'object') {

        let data = await repFinanciero.repDetalleBanco(sedeInfo, detalle);

        if (typeof data === 'string') {
            res.status(500).send(data);
        } else {
            res.setHeader('Content-disposition', `inline; filename=REPORTE DE CAJA BANCO AL ${currentDate()}.pdf`);
            res.contentType("application/pdf");
            res.send(data);
        }

    } else {
        res.status(500).send(detalle);
    }
});


module.exports = router;