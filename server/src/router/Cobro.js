const express = require('express');
const router = express.Router();
const {currentDate, currentTime} = require('../tools/Tools');
const Conexion = require('../database/Conexion');

const conec = new Conexion()



module.exports = router;