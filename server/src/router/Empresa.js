const express = require('express');
const router = express.Router();
const { token } = require('../services/Jwt');
const empresa = require('../services/Empresa');

router.get('/load',async function (req, res) {
    return await empresa.load(req, res);
});

router.get('/id',async function (req, res) {
    return await empresa.id(req, res);
})

router.post('/update', async function (req, res){
    return await empresa.update(req, res);
});

router.get('/config',async function(req, res) {
    return await empresa.config(req, res);
});

router.post('/save',async function(req, res) {
    return await empresa.save(req, res);
});

module.exports = router;