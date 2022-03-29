const express = require('express');
const router = express.Router();
const tools = require('../tools/Tools');
const Conexion = require('../database/Conexion');

router.get('/list', async function(req, res){
    const conec = new Conexion()
    try{

        let lista = await conec.query(`SELECT * FROM sede 
         WHERE 
         ? = 0
         OR
         ? = 1 and nombresede like concat(?,'%')
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

        let total = await conec.query(`SELECT COUNT(*) AS Total FROM sede
         where  
        ? = 0
        OR
        ? = 1 and nombresede like concat(?,'%')`, [
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
        await conec.execute(connection, 'INSERT INTO sede (nombrempresa, nombresede, telefono, celular, email, web, direccion, pais, region, provincia, distrito) values (?,?,?,?,?,?,?,?,?,?,?)', [
            req.body.nombrempresa,
            req.body.nombresede	,
            req.body.telefono,
            req.body.celular,
            req.body.email,
            req.body.web,
            req.body.direccion,
            req.body.pais,
            req.body.region,
            req.body.provincia,
            req.body.distrito,
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
        let result = await conec.query('SELECT * FROM sede WHERE idsede = ?',[
            req.query.idsede,
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
        await conec.execute(connection, 'UPDATE sede SET nombrempresa=?, nombresede=?, telefono=?, celular=?, email=?, web=?, direccion=?, pais=?, region=?, provincia=?, distrito=? where idsede=?', [
            req.body.nombrempresa,
            req.body.nombresede	,
            req.body.telefono,
            req.body.celular,
            req.body.email,
            req.body.web,
            req.body.direccion,
            req.body.pais,
            req.body.region,
            req.body.provincia,
            req.body.distrito,
            req.body.idsede
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
