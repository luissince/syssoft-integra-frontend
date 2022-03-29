const express = require('express');
const router = express.Router();
const tools = require('../tools/Tools');
const Conexion = require('../database/Conexion');

router.get('/list', async function(req, res){
    const conec = new Conexion()
    try{

        let lista = await conec.query(`SELECT * FROM proyecto 
         WHERE 
         ? = 0
         OR
         ? = 1 and nombre like concat(?,'%')
         LIMIT ?,?`, [
            parseInt(req.query.option),

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

        let total = await conec.query(`SELECT COUNT(*) AS Total FROM proyecto
         where  
        ? = 0
        OR
        ? = 1 and nombre like concat(?,'%')`, [
            parseInt(req.query.option),

            parseInt(req.query.option),
            req.query.buscar,
            
        ]);
       
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
        await conec.execute(connection, `INSERT INTO proyecto (
            nombre, sede, numpartidaelectronica, area, estado, 
            ubicacion, pais, region, provincia, distrito, 
            lnorte, leste, lsur, loeste, 
            moneda, tea, preciometro, costoxlote, numcontratocorrelativo, numrecibocorrelativo, inflacionanual, imagen) values (?,?,?,?,?, ?,?,?,?,?, ?,?,?,?, ?,?,?,?,?,?,?,?)`, [
            //datos
            req.body.nombre,
            req.body.sede,
            req.body.numpartidaelectronica,
            req.body.area,
            req.body.estado,
            //ubicacion
            req.body.ubicacion,
            req.body.pais,
            req.body.region,
            req.body.provincia,
            req.body.distrito,
            //limite
            req.body.lnorte,
            req.body.leste,
            req.body.lsur,
            req.body.loeste,
            //ajustes
            req.body.moneda,
            req.body.tea,
            req.body.preciometro,
            req.body.costoxlote,
            req.body.numcontratocorrelativo,
            req.body.numrecibocorrelativo,
            req.body.inflacionanual,
            //imagen
            req.body.imagen
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

router.get('/id', async function(req, res) {
    const conec = new Conexion(); 
    try{
        // console.log(req.body.idsede);
        let result = await conec.query('SELECT * FROM proyecto WHERE idproyecto = ?',[
            req.query.idproyecto,
        ]);

        if(result.length > 0){
            res.status(200).send(result[0]);
        }else{
            res.status(400).send( "Datos no encontrados" );
        } 

    } catch(error){
        console.log(error)
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
    
});

router.post('/update', async function(req, res) {
    const conec = new Conexion();
    let connection = null;
    try{

        connection = await conec.beginTransaction();
        await conec.execute(connection, `UPDATE proyecto SET
            nombre=?, sede=?, numpartidaelectronica=?, area=?, estado=?, 
            ubicacion=?, pais=?, region=?, provincia=?, distrito=?, 
            lnorte=?, leste=?, lsur=?, loeste=?, 
            moneda=?, tea=?, preciometro=?, costoxlote=?, numcontratocorrelativo=?, numrecibocorrelativo=?, inflacionanual=?, imagen=? WHERE idproyecto=?`, [
            //datos
            req.body.nombre,
            req.body.sede,
            req.body.numpartidaelectronica,
            req.body.area,
            req.body.estado,
            //ubicacion
            req.body.ubicacion,
            req.body.pais,
            req.body.region,
            req.body.provincia,
            req.body.distrito,
            //limite
            req.body.lnorte,
            req.body.leste,
            req.body.lsur,
            req.body.loeste,
            //ajustes
            req.body.moneda,
            req.body.tea,
            req.body.preciometro,
            req.body.costoxlote,
            req.body.numcontratocorrelativo,
            req.body.numrecibocorrelativo,
            req.body.inflacionanual,
            //imagen
            req.body.imagen,
            req.body.idproyecto
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

module.exports = router;