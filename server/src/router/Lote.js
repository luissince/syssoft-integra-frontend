const express = require('express');
const router = express.Router();
const Conexion = require('../database/Conexion');
const Lote = require('../services/Lote');
const conec = new Conexion();
const lote = new Lote();

router.get('/list', async function (req, res) {
    const result = await lote.listar(req)
    if(typeof result === 'object'){
        res.status(200).send(result)
    }else{
        res.status(500).send(result)
    }
})

router.post('/', async function (req, res) {
    const result = await lote.add(req)
    if( result === "insert"){
        res.status(200).send("Datos registrados correctamente")
    }else{
        console.log(result)
        res.status(500).send(result)
    }
});

router.get('/id', async function (req, res) {
    const result = await lote.dataId(req)
    if( typeof result === "object"){
        res.status(200).send(result)
    }else{
        res.status(500).send(result)
    }
});

router.put('/', async function (req, res) {
    const result = await lote.update(req)
    if( result === "update"){
        res.status(200).send("Datos actualizados correctamente")
    }else{
        console.log(result)
        res.status(500).send(result)
    }
});

router.get('/detalle', async function (req, res) {
    const result = await lote.detalle(req)
    if(typeof result === 'object'){
        res.status(200).send(result)
    }else{
        res.status(500).send(result)
    }

});

router.get('/listcombo', async function (req, res) {
    const result = await lote.listarCombo(req)
    if(Array.isArray(result)){
        res.status(200).send(result)
    }else{
        res.status(500).send(result)
    }
});

router.get('/lotecliente', async function (req, res) {
    const result = await lote.listarComboLoteCliente(req)
    if(Array.isArray(result)){
        res.status(200).send(result)
    }else{
        res.status(500).send(result)
    }
})

module.exports = router;