const express = require('express');
const router = express.Router();
const comprobante = require('../services/Comprobante');

router.get('/list', async function (req, res) {
    return await comprobante.list(req, res);
});

router.post('/add', async function (req, res) {
    return await comprobante.add(req, res);
});

router.get('/id', async function (req, res) {
    return await comprobante.id(req, res);
});

router.post('/edit', async function (req, res) {
    return await comprobante.edit(req, res)
});

router.delete('/', async function (req, res) {
    return await comprobante.delete(req, res)
})

router.get('/listcombo', async function (req, res) {
    return await comprobante.listcombo(req, res)
});

router.get('/combo/tipo-comprobante', async function (req, res) {
    return await comprobante.comboTipoComprobante(req, res)
});


module.exports = router;