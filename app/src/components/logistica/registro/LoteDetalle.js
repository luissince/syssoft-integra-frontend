import React from 'react';
import axios from 'axios';

class LoteDetalle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            detalle: [],
            fecha: '',
            manzana: '',
            serie: '',
            lote: '',
            cliente: '',
            costo: '',
            precio: '',
            estado: '',
            vestado: ''
        }
    }

    /*SE EJECUTA CUANDO EL COMPONENTE SE MONTO O SE TERMINA DE CARGAR LA GUI*/
    async componentDidMount() {
        try{
            let result = await axios.get("/api/lote/detalle",{
                params: {
                    idLote:"LT0001"
                }
            });

            console.log(result.data)

            const { estado } = result.data.cabecera;
            console.log(estado)
            //console.log(result.data.abilities)
            //console.log(result.data.moves)

            // this.setState({
            //     order: result.data.order,
            //     weight: result.data.weight,
            //     abilities: result.data.abilities,
            //     id: result.data.id,
            //     name: result.data.name, 
            //     is_default: result.data.is_default,
            //     height: result.data.height
            // });

            this.setState({
                detalle: result.data.detalle,
                manzana: result.data.cabecera.manzana,
                fecha: result.data.cabecera.fecha,
                serie: result.data.cabecera.serie,
                lote: result.data.cabecera.lote,
                cliente: result.data.cabecera.cliente,
                costo: result.data.cabecera.costo,
                precio: result.data.cabecera.precio,
                estado: result.data.cabecera.estado,
                vestado: result.data.cabecera.vestado
            });
        }catch(error){
            console.log(error)
        }
    }

    componentWillUnmount() {
    }

    render() {
        console.log("render")
        return (
            <>
                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>
                                <span role="button" onClick={() => this.props.history.goBack()}><i className="bi bi-arrow-left-short"></i></span> Lotes
                                <small className="text-secondary">Lista</small>
                            </h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="form-group">
                            <button type="button" className="btn btn-light" onClick={() => { }}><i className="fa fa-print"></i> Imprimir</button>
                            {" "}
                            <button type="button" className="btn btn-light"><i className="fa fa-file-archive-o"></i> Adjuntar</button>
                        </div>
                    </div>
                </div>

                <div className="row ">
                    <div className="col-5">
                        <div className="form-group">
                            --Descripcion-- <br></br>
                            Manzana: { this.state.manzana }<br></br>
                            Descripción de Lote: { this.state.lote } <br></br>
                            Costo Aproximado (S/.): { this.state.costo } <br></br>
                            Precio de Venta Contado (S/.): { this.state.precio } <br></br>
                            Estado: { this.state.estado }  <br></br> <br></br>

                            --Medidas-- <br></br>
                            Medida Frontal (ML):<br></br>
                            Costado Derecho (ML):  <br></br>
                            Costado Izquierdo (ML): <br></br>
                            Medida Fondo (ML): <br></br>
                            Area Lote (ML): <br></br>
                            N° Partida: <br></br> <br></br>

                            --Límite-- <br></br>
                            Limite, Frontal / Norte / Noroeste: <br></br>
                            Límite, Derecho / Este / Sureste: <br></br>
                            Límite, Iquierdo / Sur / Sureste: <br></br>
                            Límite, Posterior / Oeste / Noroeste: <br></br>
                            Ubicación del Lote: <br></br>
                        </div>
                    </div>
                    <div className="col-7">
                        Comprobante: { this.state.serie } <br></br>
                        Cliente: { this.state.cliente } <br></br>
                        Fecha: { this.state.fecha } <br></br>
                        Notas: <br></br>
                        Forma de venta: <br></br>
                        Estado: { this.state.vestado } <br></br>
                        Total: <br></br>
                        Archivos adjuntos: <br></br>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered rounded">
                                <thead>
                                    <tr>
                                        <th width="20%">Concepto</th>
                                        <th width="20%">Monto</th>
                                        <th width="20%">Método</th>
                                        <th width="20%">Banco</th>
                                        <th width="20%">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.detalle.map((item, index) =>{
                                            return(
                                                <tr key={index}>
                                                    <td>{ item.concepto }</td>
                                                    <td>{ item.monto }</td>
                                                    <td>{ item.metodo }</td>
                                                    <td>{ item.banco } </td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}


export default LoteDetalle;