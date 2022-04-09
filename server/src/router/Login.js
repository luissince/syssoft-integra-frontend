const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const tools = require('../tools/Tools');
const Conexion = require('../database/Conexion');
const conec = new Conexion();

router.get('/report/:version/:number', async function (req, res) {
    console.log(req.params);
    res.send("ddata")
});

router.get('/', async function (req, res) {
    const user = {
        id: req.query.id,
        email: req.query.email,
        password: req.query.password,
    }


    try {
        const token = await new Promise((resolve, reject) => {
            jwt.sign(user, 'secretkey', { expiresIn: '30s' }, (error, token) => {
                if (error) {
                    reject("error");
                } else {
                    resolve(token);
                }
            });
        });

        user.token = token;

        res.status(200).send(user)
    } catch (error) {
        // console.log(error)
        res.status(500).send("Error interno de conexión, intente nuevamente.")
    }
});

router.post("/list", verifyToken, async (req, res) => {
    try {
        let result = await new Promise((resolve, reject) => {
            jwt.verify(req.token, 'secretkey', (error, authorization) => {
                if (error) {
                    reject("expired");
                } else {
                    resolve(authorization);
                }
            });
        });

        res.status(200).send({ "data": { "ok": "data list" }, "authorization": result });

    } catch (error) {
        if (error == "expired") {
            res.status(403).send("Sesión expirada")
        } else {
            res.status(500).send("Error del servidor, intente nuevamente.")
        }
    }
});

function verifyToken(req, res, next) {
    const bearerToken = req.headers['authorization'];

    if (typeof bearerToken !== 'undefined') {
        const token = bearerToken.split(" ")[1];
        req.token = token;
        next();
    } else {
        res.sendStatus(403);
    }
}

module.exports = router;