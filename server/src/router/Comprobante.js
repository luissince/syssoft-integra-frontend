const express = require('express');
const router = express.Router();
const comprobante = require('../services/Comprobante');
const { success, error } = require('../tools/Message');

router.get('/list', async function (req, res) {
    const result = await comprobante.list(req);
    if (typeof result === 'object') {
        success(res, result);
    } else {
        error(res, result);
    }
});

router.post('/add', async function (req, res) {
    const result = await comprobante.add(req);
    if (result === "insert") {
        success(res, "Se inserto correctamente el comprobante.");
    } else {
        error(res, result);
    }
});

router.get('/id', async function (req, res) {
    const result = await comprobante.id(req);
    if (typeof result === 'object') {
        success(res, result);
    } else {
        error(res, result);
    }
});

router.post('/edit', async function (req, res) {
    const result = await comprobante.edit(req)
    if (result === 'update') {
        success(res, "Se actualizó correctamente el comprobante.");
    } else if (result === 'updateend') {
        success(res, "Se actualizó correctamente el comprobante. !Hay campos que no se van editar ya que el comprobante esta ligado a un venta¡");
    } else {
        error(res, result);
    }
});

router.delete('/', async function (req, res) {
    const result = await comprobante.delete(req)
    if (result === 'delete') {
        success(res, "Se eliminó correctamente el comprobante.");
    } else {
        error(res, result);
    }
})

router.get('/listcombo', async function (req, res) {
    const result = await comprobante.listcombo(req)
    if (Array.isArray(result)) {
        success(res, result);
    } else {
        error(res, result);
    }
});

module.exports = router;