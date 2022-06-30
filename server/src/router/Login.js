const express = require('express');
const router = express.Router();
const { token } = require('../services/Jwt');
const login = require('../services/Login');

router.get('/createsession', async function (req, res) {
    return await login.createsession(req, res);
});

router.get('/validtoken', token, async function (req, res) {
    return await login.validtoken(req, res);
});

module.exports = router;