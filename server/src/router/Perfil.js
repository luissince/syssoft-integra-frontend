const express = require('express');
const router = express.Router();
const { token } = require('../services/Jwt');
const perfil = require('../services/Perfil');

router.get('/list', token, async function (req, res) {
    return await perfil.list(req, res);
});

router.post('/add', token, async function (req, res) {
    return await perfil.add(req, res)
});

router.get('/id', token, async function (req, res) {
    return await perfil.id(req, res);
});

router.post('/update', token, async function (req, res) {
    return await perfil.update(req, res);
});

router.delete('/', token, async function (req, res) {
    return await perfil.delete(req, res)
});

router.get('/listcombo', token, async function (req, res) {
    return await perfil.listcombo(req, res)
});

module.exports = router;