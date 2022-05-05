const express = require('express');
const router = express.Router();
const { decrypt } = require('../tools/CryptoJS');
const Cobro = require('../services/Cobro');
const Sede = require('../services/Sede');
const RepFinanciero = require('../report/RepFinanciero');

const sede = new Sede();
const cobro = new Cobro();
const repFinanciero = new RepFinanciero();

router.get('/list', async function (req, res) {
    const result = await cobro.list(req)
    if (typeof result === 'object') {
        res.status(200).send(result);
    } else {
        res.status(500).send(result);
    }
});

router.post('/add', async function (req, res) {
    const result = await cobro.add(req)
    if (result === 'insert') {
        res.status(201).send("Se registró correctamente el cobro.");
    } else {
        res.status(500).send(result);
    }
});

router.post('/cobro', async function (req, res) {
    const result = await cobro.cobro(req)
    if (result === 'insert') {
        res.status(201).send("Se registró correctamente el cobro.");
    } else {
        res.status(500).send(result);
    }
});

router.get('/id', async function (req, res) {
    const result = await cobro.id(req)
    if (typeof result === 'object') {
        res.status(200).send(result);
    } else {
        res.status(500).send(result);
    }
});

router.delete('/anular', async function (req, res) {
    const result = await cobro.delete(req)
    if (result === 'delete') {
        res.status(201).send("Se eliminó correctamente el cobro.");
    } else {
        res.status(500).send(result);
    }
});

router.get('/repgeneralcobros', async function (req, res) {
    const decryptedData = decrypt(req.query.params, 'key-report-inmobiliaria');
    req.query.idConcepto = decryptedData.idConcepto;
    req.query.metodoPago = decryptedData.metodoPago;
    req.query.idBanco = decryptedData.idBanco;
    req.query.idUsuario = decryptedData.idUsuario;
    req.query.idSede = decryptedData.idSede;
    req.query.fechaIni = decryptedData.fechaIni;
    req.query.fechaIFin = decryptedData.fechaIFin;

    const sedeInfo = await sede.infoSedeReporte(req);

    if (typeof sedeInfo !== 'object') {
        res.status(500).send(sedeInfo);
        return;
    }

    let data = await repFinanciero.repFiltroCobros(req, sedeInfo);

    if (typeof data === 'string') {
        res.status(500).send(data);
    } else {
        res.setHeader('Content-disposition', 'inline; filename=Reporte de cobros.pdf');
        res.contentType("application/pdf");
        res.send(data);
    }
});

module.exports = router;