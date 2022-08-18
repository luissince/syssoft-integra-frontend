const express = require('express');
const router = express.Router();
const notaCredito = require('../services/NotaCredito');
const sede = require('../services/Sede');
const RepNotaCredito = require('../report/RepNotaCredito');
const { decrypt } = require('../tools/CryptoJS');
const { sendError } = require('../tools/Message');

const repNotaCredito = new RepNotaCredito();

router.get('/list', async function (req, res) {
    return notaCredito.list(req, res);
});

router.get('/id', async function (req, res) {
    return notaCredito.id(req, res);
});

router.post('/add', async function (req, res) {
    return notaCredito.add(req, res);
});

router.get('/repcomprobante', async function (req, res){
    const decryptedData = decrypt(req.query.params, 'key-report-inmobiliaria');
    req.query.idSede = decryptedData.idSede;
    req.query.idNotaCredito = decryptedData.idNotaCredito;

    const sedeInfo = await sede.infoSedeReporte(req);

    if (typeof sedeInfo !== 'object') {
        return sendError(res, sedeInfo);
    }

    const detalle = await notaCredito.idReport(req);
    if (typeof detalle === 'object') {

        let data = await repNotaCredito.repComprobante(req, sedeInfo, detalle);

        if (typeof data === 'string') {
            return sendError(res, data);
        } else {
            res.setHeader('Content-disposition', `inline; filename=${detalle.cabecera.comprobante + " " + detalle.cabecera.serie + "-" + detalle.cabecera.numeracion}.pdf`);
            res.contentType("application/pdf");
            res.send(data);
        }
    }else{
        return sendError(res, detalle);
    }
});

module.exports = router;