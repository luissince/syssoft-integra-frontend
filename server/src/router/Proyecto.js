const express = require('express');
const router = express.Router();
const proyecto = require('../services/Proyecto');

router.get('/list', async function (req, res) {
    return await proyecto.list(req, res);
});

router.post('/', async function (req, res) {
    return await proyecto.add(req, res);
});

router.put('/', async function (req, res) {
    return await proyecto.edit(req, res);
});

router.get('/id', async function (req, res) {
    return await proyecto.id(req, res);
});

router.delete('/', async function (req, res) {
    return await proyecto.delete(req, res);
});

router.get('/inicio', async function (req, res) {
    return await proyecto.inicio(req, res);
});

module.exports = router;