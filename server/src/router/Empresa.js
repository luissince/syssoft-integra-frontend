const express = require('express');
const router = express.Router();
const { token } = require('../services/Jwt');
const empresa = require('../services/Empresa');


router.get('/config',async function(req, res) {
    return await empresa.config(req, res);
});

router.post('/save',async function(req, res) {
    return await empresa.save(req, res);
});

module.exports = router;