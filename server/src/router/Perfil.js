const express = require('express');
const router = express.Router();
const perfil = require('../services/Perfil');
const { success, error } = require('../tools/Message');

router.get('/list', async function (req, res) {
    const result = await perfil.list(req)
    if (typeof result === 'object') {
        success(res, result);
    } else {
        error(res, result);
    }
});

router.post('/add', async function (req, res) {
    const result = await perfil.add(req)
    if (result === 'insert') {
        success(res, "Se registró correctamente el perfil.");
    } else {
        error(res, result);
    }
});

router.get('/id', async function (req, res) {
    const result = await perfil.id(req)
    if (typeof result === 'object') {
        success(res, result);
    } else {
        error(res, result);
    }
});

router.post('/update', async function (req, res) {
    const result = await perfil.update(req)
    if (result === 'update') {
        success(res, "Se actualizó correctamente el perfil.");
    } else {
        error(res, result);
    }
});

router.delete('/', async function (req, res) {
    const result = await perfil.delete(req)
    if (result === 'delete') {
        success(res, "Se eliminó correctamente el perfil.");
    } else {
        error(res, result);
    }
});

router.get('/listcombo', async function (req, res) {
    const result = await perfil.listcombo(req)
    if (Array.isArray(result)) {
        success(res, result);
    } else {
        error(res, result);
    }
});


module.exports = router;