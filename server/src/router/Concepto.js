const express = require('express');
const router = express.Router();
const concepto = require('../services/Concepto');
const { success, error } = require('../tools/Message');

router.get('/list', async function (req, res) {
    const result = await concepto.list(req);
    if (typeof result === 'object') {
        success(res, result);
    } else {
        error(res, result);
    }
});

router.post('/add', async function (req, res) {
    const result = await concepto.add(req);
    if (result === 'insert') {
        success(res, result);
    } else {
        error(res, result);
    }
});

router.get('/id', async function (req, res) {
    const result = await concepto.id(req);
    if (result === 'object') {
        success(res, result);
    } else {
        error(res, result);
    }
});

router.post('/update', async function (req, res) {
    const result = await concepto.update(req);
    if (result === 'update') {
        success(res, result);
    } else {
        error(res, result);
    }
});

router.delete('/', async function (req, res) {
    const result = await concepto.delete(req);
    if (result === 'delete') {
        success(res, result);
    } else {
        error(res, result);
    }
});

router.get('/listcombo', async function (req, res) {
    const result = await concepto.listcombo(req);
    if (Array.isArray(result)) {
        success(res, result);
    } else {
        error(res, result);
    }
});

router.get('/listcombogasto', async function (req, res) {
   const result = await concepto.listcombogasto(req);
   if (Array.isArray(result)) {
       success(res, result);
   }else{
       error(res, result);
   }
});

module.exports = router;
