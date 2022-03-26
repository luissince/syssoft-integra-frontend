const express = require('express');
const router = express.Router();
const tools = require('../tools/Tools');
const Conexion = require('../database/Conexion');

router.get('/list', async function(req, res){
    const conec = new Conexion()
    try{
        let lista = await conec.query(`SELECT idbanco, nombre, tipocuenta, moneda, numcuenta, cci, representante FROM banco 
         WHERE 
         ? = 0
         OR
         ? = 1 and nombre like concat(?,'%')
         OR
         ? = 1 and representante like concat(?,'%')
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
                id: (index+1) + parseInt(req.query.posicionPagina)
            }
        });

        let total = await conec.query(`SELECT COUNT(*) AS Total FROM banco`);

        res.status(200).send({"result": resultLista, "total": total[0].Total })

    }catch(error){
        console.log(error)
        res.status(500).send("Error interno de conexión, intente nuevamente.")
    }
});

router.post('/add', async function (req, res){
    const conec =  new Conexion()
    let connection = null;
    try{
        connection = await conec.beginTransaction();
        await conec.execute(connection, 'INSERT INTO banco (nombre, tipocuenta, moneda, numcuenta, cci, representante) values (?,?,?,?,?,?)', [
            req.body.nombre,
            req.body.tipocuenta,
            req.body.moneda,
            req.body.numcuenta,
            req.body.cci,
            req.body.representante
        ])

        await conec.commit(connection);
        res.status(200).send('Datos insertados correctamente')
        
    } catch (err) {
        if(connection != null){
            conec.rollback(connection);
        }
        res.status(500).send(connection);
    }
});

router.post('/update', async function(req, res) {
    const conec = new Conexion();
    let connection = null;

    try{

        connection = await conec.beginTransaction();
        await conec.execute(connection, 'UPDATE banco SET nombre=?, tipocuenta=?, moneda=?, numcuenta=?, cci=?, representante=? where idbanco=?', [
            req.body.nombre,
            req.body.tipocuenta,
            req.body.moneda,
            req.body.numcuenta,
            req.body.cci,
            req.body.representante,
            req.body.idbanco
        ])

        await conec.commit(connection)
        res.status(200).send('Datos actulizados correctamente')
        // console.log(req.body)

    }catch (error) {
        if (connection != null) {
            conec.rollback(connection);
        }
        res.status(500).send(error);
        // console.log(error)
    }
})

router.get('/id', async function(req, res) {
    const conec = new Conexion(); 
    try{
        let result = await conec.query('SELECT * FROM banco WHERE idbanco = ?',[
            req.query.idbanco,
        ]);

        if(result.length > 0){
            res.status(200).send(result[0]);
        }else{
            res.status(400).send( "Datos no encontrados" );
        } 

    } catch(error){
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
    
});

module.exports = router;