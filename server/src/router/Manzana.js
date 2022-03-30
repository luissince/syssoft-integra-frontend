const express = require('express');
const router = express.Router();
const tools = require('../tools/Tools');
const Conexion = require('../database/Conexion');

router.get("/lista", function (req, res) {

});

router.post("/add", function (req, res) {
    res.send("add");
});

router.post("/edit", function (req, res) {
    res.send("edit");
});

module.exports = router;