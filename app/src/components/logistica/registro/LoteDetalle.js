import React from 'react';
import axios from 'axios';
import {
    formatMoney,
    spinnerLoading,
    timeForma24
} from '../../tools/Tools';

class LoteDetalle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lote: {},
            detalle: [],

            loading: true,
            messageWarning: '',
            msgLoading: 'Cargando datos...',
        }

        this.abortControllerTable = new AbortController();
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    async componentDidMount() {
        const url = this.props.location.search;
        const idLote = new URLSearchParams(url).get("idLote");
        if (idLote !== null) {
            this.loadDataId(idLote)
        } else {
            this.props.history.goBack();
        }
    }

    componentWillUnmount() {
        this.abortControllerTable.abort();
    }

    async loadDataId(id) {
        try {
            let result = await axios.get("/api/lote/detalle", {
                signal: this.abortControllerTable.signal,
                params: {
                    "idLote": id
                }
            });

            console.log(result);

            await this.setStateAsync({
                lote: result.data.cabecera,
                detalle: result.data.detalle,

                loading: false,
            });
        } catch (error) {
            if (error.message !== "canceled") {
                this.props.history.goBack();
            }
        }
    }

    render() {
        const { manzana,
            lote,
            costo,
            precio,
            lotestado,
            comprobante,
            serie,
            numeracion,
            documento,
            cliente,
            fecha,
            hora,
            tipo,
            estado,
            simbolo,
            monto
        } = this.state.lote;
        return (
            <>
                {
                    this.state.loading ?
                        <div className="clearfix absolute-all bg-white">
                            {spinnerLoading(this.state.msgLoading)}
                        </div> : null
                }

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
                            Manzana: <strong>{manzana}</strong><br></br>
                            Descripción de Lote: <strong>{lote}</strong> <br></br>
                            Costo Aproximado (S/.): <strong>{formatMoney(costo)} </strong><br></br>
                            Precio de Venta Contado (S/.): <strong>{formatMoney(precio)} </strong><br></br>
                            Estado:<strong> {lotestado} </strong> <br></br> <br></br>

                            --Medidas-- <br></br>
                            Medida Frontal (ML):<strong> </strong> <br></br>
                            Costado Derecho (ML): <strong> </strong>  <br></br>
                            Costado Izquierdo (ML): <strong> </strong> <br></br>
                            Medida Fondo (ML): <strong> </strong> <br></br>
                            Area Lote (ML): <strong> </strong> <br></br>
                            N° Partida: <strong> </strong> <br></br> <br></br>

                            --Límite-- <br></br>
                            Limite, Frontal / Norte / Noroeste: <strong> </strong> <br></br>
                            Límite, Derecho / Este / Sureste: <strong> </strong> <br></br>
                            Límite, Iquierdo / Sur / Sureste: <strong> </strong> <br></br>
                            Límite, Posterior / Oeste / Noroeste:<strong> </strong>  <br></br>
                            Ubicación del Lote: <br></br>
                        </div>
                    </div>
                    <div className="col-7">
                        Comprobante: <strong>{comprobante + " " + serie + "-" + numeracion} </strong> <br></br>
                        Cliente: <strong>{documento + " " + cliente} </strong> <br></br>
                        Fecha: <strong>{fecha + " " + hora} </strong> <br></br>
                        Notas: <strong> </strong> <br></br>
                        Forma de venta: <strong>{tipo === 1 ? "CONTADO" : "CRÉDITO"} </strong> <br></br>
                        Estado: <strong>{estado === 1 ? "COBRADO" : "POR COBRAR"} </strong> <br></br>
                        Total: <strong>{simbolo + " " + formatMoney(monto)} </strong> <br></br>
                        Archivos adjuntos: <strong> </strong> <br></br>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="table-responsive">
                            <table className="table table-light table-striped">
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
                                        this.state.detalle.map((item, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{item.concepto === "" ? "CUOTA" : item.concepto}</td>
                                                    <td>{item.simbolo + " " + formatMoney(item.monto)}</td>
                                                    <td>{item.metodo}</td>
                                                    <td>{item.banco} </td>
                                                    <td>{item.fecha}{<br />}{timeForma24(item.hora)} </td>
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