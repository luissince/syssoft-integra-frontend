const express = require('express');
const router = express.Router();
const Almacen = require('../services/Almacen');
const { decrypt } = require('../tools/CryptoJS');
// const { generateExcelCliente, generateExcelDeudas, generarSociosPorFecha } = require('../excel/FileClientes')
// const empresa = require('../services/Empresa');

// const RepCliente = require('../report/RepCliente');

const almacen = new Almacen();
/**
 * Api usado en los modulos
 * [logística: almacenes]
 */
router.get('/listalmacenes', async function (req, res) {
    const result = await almacen.listalmacenes(req)
    if (typeof result === 'object') {
        res.status(200).send(result);
    } else {
        res.status(500).send(result);
    }
});

router.post('/addalmacenes', async function (req, res) {
    const result = await almacen.addalmacenes(req)
    if (result === 'insert') {
        res.status(200).send("Se registró correctamente el almacén.");
    } else {
        res.status(400).send(result);
    }
});

router.get('/listalmacenesbyid', async function (req, res) {
    const result = await almacen.listalmacenesbyid(req)
    if (typeof result === 'object') {
        res.status(200).send(result);
    } else {
        res.status(500).send(result);
    }
});

router.post('/updatealmacenes', async function (req, res) {
    const result = await almacen.updatealmacenes(req)
    if (result === 'updated') {
        res.status(200).send("Se actualizó correctamente el almacén.");
    } else {
        res.status(400).send(result);
    }
});

router.delete('/deletealmacen', async function (req, res) {
    const result = await almacen.deletealmacen(req)
    if (result === 'deleted') {
        res.status(200).send("Se eliminó correctamente el almacén.");
    } else {
        res.status(400).send(result);
    }
});

module.exports = router;