const express = require('express');
const router = express.Router();
const { currentDate, currentTime } = require('../tools/Tools');
const Conexion = require('../database/Conexion');
const conec = new Conexion();


router.get("/list", async function (req, res) {
    
    try {
        // console.log(req.query)
        let lista = await conec.query(`SELECT 
            v.idVenta, c.infoCliente, c.numDocumento, v.idComprobante, DATE_FORMAT(v.fecha,'%d/%m/%Y') as fecha, v.hora, v.tipoVenta, v.estado
            FROM venta AS v INNER JOIN cliente AS c ON v.idCliente = c.idCliente
            WHERE 
            ? = 0
            OR
            ? = 1 and c.infoCliente like concat(?,'%')
            OR
            ? = 1 and c.numDocumento like concat(?,'%')
            LIMIT ?,?`, [
            parseInt(req.query.option),

            parseInt(req.query.option),
            req.query.buscar,

            parseInt(req.query.option),
            req.query.buscar,

            parseInt(req.query.posicionPagina),
            parseInt(req.query.filasPorPagina)
        ])

        let resultLista = lista.map(function (item, index) {
            return {
                ...item,
                id: (index + 1) + parseInt(req.query.posicionPagina)
            }
        });

        let total = await conec.query(`SELECT COUNT(*) AS Total 
            FROM venta AS v INNER JOIN cliente AS c ON v.idCliente = c.idCliente
            WHERE 
            ? = 0
            OR
            ? = 1 and c.infoCliente like concat(?,'%')
            OR
            ? = 1 and c.numDocumento like concat(?,'%')`, [
            parseInt(req.query.option),

            parseInt(req.query.option),
            req.query.buscar, 

            parseInt(req.query.option),
            req.query.buscar
        ]);

        res.status(200).send({ "result": resultLista, "total": total[0].Total })

    } catch (error) {
        console.log(error)
        res.status(500).send("Error interno de conexión, intente nuevamente.")
    }
});


router.post("/add", async function (req, res) {
    let connection = null;
    try {

        // console.log(req.body)

        connection = await conec.beginTransaction();

        let result = await conec.execute(connection, 'SELECT idVenta  FROM venta');
        let idVenta = "";
        if (result.length != 0) {

            let quitarValor = result.map(function (item) {
                return parseInt(item.idVenta.replace("VT", ''));
            });

            let valorActual = Math.max(...quitarValor);
            let incremental = valorActual + 1;
            let codigoGenerado = "";
            if (incremental <= 9) {
                codigoGenerado = 'VT000' + incremental;
            } else if (incremental >= 10 && incremental <= 99) {
                codigoGenerado = 'VT00' + incremental;
            } else if (incremental >= 100 && incremental <= 999) {
                codigoGenerado = 'VT0' + incremental;
            } else {
                codigoGenerado = 'VT' + incremental;
            }

            idVenta = codigoGenerado;
        } else {
            idVenta = "VT0001";
        }

        await conec.execute(connection, `INSERT INTO venta(
            idVenta, idCliente, idUsuario, idBanco, idComprobante, idFormaPago, 
            tipoVenta, inicial, numeroCuotas, fechaCuotaInicial, numeroContrato, codigoOperacion, 
            estado, imagen, extension, fecha, hora)
            VALUES(?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?)
            `, [
            idVenta, req.body.idCliente, req.body.idUsuario, req.body.idBanco, req.body.idComprobante, req.body.idFormaPago, 
            req.body.tipoVenta, req.body.inicial, req.body.numeroCuotas, req.body.fechaCuotaInicial, req.body.numeroContrato, req.body.codigoOperacion, 
            req.body.estado, req.body.imagen, req.body.extension, currentDate(), currentTime()
        ])

        for(let item of req.body.listaLotes) {

            await conec.execute(connection, `INSERT INTO ventaDetalle(
                idVenta, idLote, precio, cantidad, impuesto)
                VALUES(?,?,?,?,?)`, [
                    idVenta, item.id, parseFloat(item.precioContado), 1, 0
            ])
        }

        await conec.commit(connection);
        res.status(200).send('Datos insertados correctamente')
    } catch (error) {
        if (connection != null) {
            conec.rollback(connection);
        }
        res.status(500).send(connection);
    }
});

router.get("/id", async function (req, res) {
    try{

        let result = await conec.query(`SELECT v.idComprobante, c.numDocumento, c.infoCliente, DATE_FORMAT(v.fecha,'%d/%m/%Y') as fecha, v.hora, v.tipoVenta, v.estado, v.inicial, v.numeroCuotas
            FROM venta AS v INNER JOIN cliente AS c ON v.idCliente = c.idCliente
            WHERE idVenta = ?`, [
            req.query.idVenta
        ])

        let detalle = await conec.query(`SELECT l.descripcion AS lote, m.nombre AS manzana, p.nombre AS proyecto, vd.precio, vd.cantidad, vd.impuesto
            FROM ventaDetalle AS vd 
            INNER JOIN lote AS l ON vd.idLote = l.idLote 
            INNER JOIN manzana AS m ON l.idManzana = m.idManzana 
            INNER JOIN proyecto AS p ON m.idProyecto = p.idProyecto
            WHERE idVenta = ? `, [
            req.query.idVenta
        ])

        let detalleLista = detalle.map(function (item, index) {
            return {
                ...item,
                id: (index + 1)
            }
        });

        if(result.length > 0){
            if(detalle.length > 0){
                res.status(200).send({ "result": result[0], "detalle": detalleLista })
            } else{
                res.status(400).send("Datos no encontrados")
            }
            
        } else {
            res.status(400).send("Datos no encontrados")
        }

    } catch (error) {
        console.log(error);
        res.status(500).send("Error interno de conexión, intente nuevamente.")
    }
})

module.exports = router;