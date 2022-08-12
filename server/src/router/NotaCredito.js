const express = require('express');
const router = express.Router();
const notaCredito = require('../services/NotaCredito');

router.get('/list', async function (req, res) {
    return notaCredito.list(req, res);
});

router.get('/id', async function (req, res) {
    return notaCredito.id(req, res);
});

router.post('/add', async function (req, res) {
    return notaCredito.add(req, res);
});

module.exports = router;