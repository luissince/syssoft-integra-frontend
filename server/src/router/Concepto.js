const express = require('express');
const router = express.Router();
const { currentDate, currentTime } = require('../tools/Tools');
const Conexion = require('../database/Conexion');
const conec = new Conexion()

router.get('/list', async function (req, res) {
    try {
        let lista = await conec.query(`SELECT 
            idConcepto,
            nombre,
            tipo,
            DATE_FORMAT(fecha,'%d/%m/%Y') as fecha,
            hora 
            FROM concepto
            WHERE 
            ? = 0
            OR
            ? = 1 and nombre like concat(?,'%')
            LIMIT ?,?`, [
            parseInt(req.query.opcion),

            parseInt(req.query.opcion),
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

        let total = await conec.query(`SELECT COUNT(*) AS Total FROM concepto
            WHERE 
            ? = 0
            OR
            ? = 1 and nombre like concat(?,'%')`, [
            parseInt(req.query.opcion),

            parseInt(req.query.opcion),
            req.query.buscar
        ]);

        res.status(200).send({ "result": resultLista, "total": total[0].Total })

    } catch (error) {
        res.status(500).send("Error interno de conexión, intente nuevamente.")
    }
});

router.post('/add', async function (req, res) {
    let connection = null;
    try {
        connection = await conec.beginTransaction();

        let result = await conec.execute(connection, 'SELECT idConcepto FROM concepto');
        let idConcepto = "";
        if (result.length != 0) {

            let quitarValor = result.map(function (item) {
                return parseInt(item.idConcepto.replace("CP", ''));
            });

            let valorActual = Math.max(...quitarValor);
            let incremental = valorActual + 1;
            let codigoGenerado = "";
            if (incremental <= 9) {
                codigoGenerado = 'CP000' + incremental;
            } else if (incremental >= 10 && incremental <= 99) {
                codigoGenerado = 'CP00' + incremental;
            } else if (incremental >= 100 && incremental <= 999) {
                codigoGenerado = 'CP0' + incremental;
            } else {
                codigoGenerado = 'CP' + incremental;
            }

            idConcepto = codigoGenerado;
        } else {
            idConcepto = "CP0001";
        }

        await conec.execute(connection, `INSERT INTO concepto(
            idConcepto, 
            nombre, 
            tipo,
            codigo,
            fecha, 
            hora,
            fupdate,
            hupdate,
            idUsuario) 
            VALUES(?,?,?,?,?,?,?,?,?)`, [
            idConcepto,
            req.body.nombre,
            req.body.tipo,
            req.body.codigo,
            currentDate(),
            currentTime(),
            currentDate(),
            currentTime(),
            req.body.idUsuario
        ])

        await conec.commit(connection);
        res.status(200).send('Datos insertados correctamente')
    } catch (error) {
        console.log(error)
        if (connection != null) {
            await conec.rollback(connection);
        }
        res.status(500).send("Error de servidor");
    }
});

router.get('/id', async function (req, res) {
    try {
        let result = await conec.query('SELECT * FROM concepto WHERE idConcepto  = ?', [
            req.query.idConcepto
        ]);

        if (result.length > 0) {
            res.status(200).send(result[0]);
        } else {
            res.status(400).send("Datos no encontrados");
        }
    } catch (error) {
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
});

router.post('/update', async function (req, res) {
    let connection = null;
    try {
        connection = await conec.beginTransaction();

        await conec.execute(connection, `UPDATE concepto SET 
        nombre=?, 
        tipo=?,
        codigo=?,
        fupdate=?,
        hupdate=?,
        idUsuario=?
        WHERE idConcepto=?`, [
            req.body.nombre,
            req.body.tipo,
            req.body.codigo,
            currentDate(),
            currentTime(),
            req.body.idUsuario,
            req.body.idConcepto,
        ])

        await conec.commit(connection)
        res.status(200).send('Los datos se actualizarón correctamente.')
    } catch (error) {
        if (connection != null) {
            await conec.rollback(connection);
        }
        res.status(500).send("Se produjo un error de servidor, intente nuevamente.");
    }
});

router.delete('/', async function (req, res) {
    let connection = null;
    try {
        connection = await conec.beginTransaction();

        let cobroDetalle = await conec.execute(connection, `SELECT * FROM cobroDetalle WHERE idConcepto = ?`, [
            req.query.idConcepto
        ]);

        if (cobroDetalle.length > 0) {
            await conec.rollback(connection);
            res.status(400).send('No se puede eliminar el concepto ya que esta ligada a un detalle de cobro.')
            return;
        }

        let gastoDetalle = await conec.execute(connection, `SELECT * FROM gastoDetalle WHERE idConcepto = ?`, [
            req.query.idConcepto
        ]);

        if (gastoDetalle.length > 0) {
            await conec.rollback(connection);
            res.status(400).send('No se puede eliminar el concepto ya que esta ligada a un detalle de gasto.')
            return;
        }

        let lote = await conec.execute(connection, `SELECT * FROM lote WHERE idConcepto = ?`, [
            req.query.idConcepto
        ]);

        if (lote.length > 0) {
            await conec.rollback(connection);
            res.status(400).send('No se puede eliminar el concepto ya que esta ligada a un lote.')
            return;
        }

        await conec.execute(connection, `DELETE FROM concepto WHERE idConcepto = ?`, [
            req.query.idConcepto
        ]);

        await conec.commit(connection)
        res.status(200).send('Se eliminó correctamente el concepto..')
    } catch (error) {
        if (connection != null) {
            await conec.rollback(connection);
        }
        res.status(500).send("Se produjo un error de servidor, intente nuevamente.");
    }
});

router.get('/listcombo', async function (req, res) {
    try {
        let result = await conec.query('SELECT idConcepto, nombre FROM concepto WHERE tipo = 2');
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
});

router.get('/listcombogasto', async function (req, res) {
    try {
        let result = await conec.query('SELECT idConcepto, nombre FROM concepto WHERE tipo = 1');
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
});

module.exports = router;
