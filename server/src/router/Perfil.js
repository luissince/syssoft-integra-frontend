const express = require('express');
const router = express.Router();
const Perfil = require('../services/Perfil');

const perfil = new Perfil();

router.get('/list', async function (req, res) {
    const result = await perfil.list(req)
    if (typeof result === 'object') {
        res.status(200).send(result);
    } else {
        res.status(500).send(result);
    }
});

router.post('/add', async function (req, res) {
    const result = await perfil.add(req)
    if (result === 'insert') {
        res.status(201).send("Se registró correctamente el perfil.");
    } else {
        res.status(500).send(result);
    }
});

router.get('/id', async function (req, res) {
    const result = await perfil.id(req)
    if (typeof result === 'object') {
        res.status(200).send(result);
    } else {
        res.status(500).send(result);
    }
});

router.post('/update', async function (req, res) {
    const result = await perfil.update(req)
    if (result === 'update') {
        res.status(201).send("Se actualizó correctamente el perfil.");
    } else {
        res.status(500).send(result);
    }
});

router.delete('/', async function (req, res) {
    const result = await perfil.delete(req)
    if (result === 'delete') {
        res.status(201).send("Se eliminó correctamente el perfil.");
    } else {
        res.status(500).send(result);
    }
});

router.get('/listcombo', async function (req, res) {
    const result = await perfil.listcombo(req)
    if (Array.isArray(result)) {
        res.status(200).send(result);
    } else {
        res.status(500).send(result);
    }
});


module.exports = router;