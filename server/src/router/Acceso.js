const express = require('express');
const router = express.Router();
const acceso = require('../services/Acceso');
const { success, error } = require('../tools/Message');

router.get('/accesos', async function (req, res) {
    const result = await acceso.accesos(req);
    if (typeof result === 'object') {
        success(res, result);
    } else {
        error(res, result);
    }
});

router.post('/save', async function (req, res) {
    const result = await acceso.save(req);
    if (result == "insert") {
        success(res, "Datos insertados correctamente.");
    } else {
        error(res, result);
    }
});

router.post('/updatedata', async function (req, res) {
    const result = await acceso.updatedata(req);
    if (result == "update") {
        success(res, "Modulos actualizados correctamente.");
    } else {
        error(res, result);
    }
});

module.exports = router;