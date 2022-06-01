const express = require('express');
const router = express.Router();
const Proyecto = require('../services/Proyecto');
const proyecto = new Proyecto();

router.get('/list', async function (req, res) {
    const result = await proyecto.list(req)
    if (typeof result === 'object') {
        res.status(200).send(result)
    } else {
        res.status(500).send(result)
    }
});

router.post('/', async function (req, res) {
    const result = await proyecto.add(req);
    if (result === 'insert') {
        res.status(201).send("Se registró correctamente el proyecto.");
    } else {
        res.status(500).send(result);
    }
});

router.put('/', async function (req, res) {
    const result = await proyecto.edit(req);
    if (result === 'update') {
        res.status(201).send("Se actualizó correctamente el proyecto.");
    } else {
        res.status(500).send(result);
    }
});

router.get('/id', async function (req, res) {
    const result = await proyecto.id(req);
    if (typeof result === 'object') {
        res.status(200).send(result)
    } else {
        res.status(500).send(result)
    }
});

router.delete('/', async function (req, res) {
    const result = await proyecto.delete(req);
    if (result === 'delete') {
        res.status(201).send("Se eliminó correctamente la manzana.");
    } else {
        res.status(500).send(result);
    }
});

router.get('/inicio', async function (req, res) {
    const result = await proyecto.inicio(req)
    if (Array.isArray(result)) {
        res.status(200).send(result)
    } else {
        res.status(500).send(result)
    }
});

module.exports = router;