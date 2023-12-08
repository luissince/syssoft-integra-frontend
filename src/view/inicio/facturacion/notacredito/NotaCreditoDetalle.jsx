import React from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import {
    rounded,
    numberFormat,
    calculateTaxBruto,
    calculateTax,
    formatTime,
    spinnerLoading,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../components/Container';

class NotaCreditoDetalle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idNotaCredito: '',
            comprobante: '',
            cliente: '',
            fecha: '',
            estado: '',
            simbolo: '',
            codiso: '',
            usuario: '',
            motivo: '',
            comprobanteModi: '',
            total: 0,

            loading: true,
            msgLoading: 'Cargando datos...',
        }

        this.abortControllerView = new AbortController();
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    async componentDidMount() {
        const url = this.props.location.search;
        const idResult = new URLSearchParams(url).get("idNotaCredito");
        if (idResult !== null) {
            this.loadDataId(idResult);
        } else {
            this.props.history.goBack();
        }
    }

    componentWillUnmount() {
        this.abortControllerView.abort();
    }

    async loadDataId(id) {
        try {
            const result = await axios.get("/api/notacredito/id", {
                signal: this.abortControllerView.signal,
                params: {
                    idNotaCredito: id
                }
            });

            let cabecera = result.data.cabecera;

            await this.setStateAsync({
                idNotaCredito: id,
                comprobante: cabecera.comprobante + "  " + cabecera.serie + "-" + cabecera.numeracion,
                cliente: cabecera.documento + " - " + cabecera.informacion,
                fecha: cabecera.fecha + " " + formatTime(cabecera.hora),
                estado: cabecera.estado,
                codiso: cabecera.codiso,
                usuario: cabecera.usuario,
                motivo: cabecera.motivo,
                comprobanteModi: cabecera.comprobanteModi + " " + cabecera.serieModi + "-" + cabecera.numeracionModi,
                total: rounded(cabecera.total),
                detalle: result.data.detalle,

                loading: false
            });

        } catch (error) {
            if (error.message !== "canceled") {
                this.props.history.goBack();
            }
        }
    }

    renderTotal() {
        let subTotal = 0;
        let impuestoTotal = 0;
        let total = 0;

        for (let item of this.state.detalle) {
            let cantidad = item.cantidad;
            let valor = item.precio;

            let impuesto = item.porcentaje;

            let valorActual = cantidad * valor;
            let valorSubNeto = calculateTaxBruto(impuesto, valorActual);
            let valorImpuesto = calculateTax(impuesto, valorSubNeto);
            let valorNeto = valorSubNeto + valorImpuesto;

            subTotal += valorSubNeto;
            impuestoTotal += valorImpuesto;
            total += valorNeto;
        }

        return (
            <>
                <tr>
                    <th className="text-right">Sub Total:</th>
                    <th className="text-right">{numberFormat(subTotal, this.state.codiso)}</th>
                </tr>
                <tr>
                    <th className="text-right">Impuesto:</th>
                    <th className="text-right">{numberFormat(impuestoTotal, this.state.codiso)}</th>
                </tr>
                <tr className="border-bottom">
                </tr>
                <tr>
                    <th className="text-right h5">Total:</th>
                    <th className="text-right h5">{numberFormat(total, this.state.codiso)}</th>
                </tr>
            </>
        )
    }

    async onEventImprimir() {
        const data = {
            "idEmpresa": "EM0001",
            "idNotaCredito": this.state.idNotaCredito
        }

        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'key-report-inmobiliaria').toString();
        let params = new URLSearchParams({ "params": ciphertext });
        window.open("/api/notacredito/repcomprobante?" + params, "_blank");
    }

    render() {
        return (
            <ContainerWrapper>
                {
                    this.state.loading && spinnerLoading(this.state.msgLoading)
                }

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>
                                <span role="button" onClick={() => this.props.history.goBack()}><i className="bi bi-arrow-left-short"></i></span> Nota de Crédito
                                <small className="text-secondary"> detalle</small>
                            </h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="form-group">
                            <button type="button" className="btn btn-light" onClick={() => this.onEventImprimir()}><i className="fa fa-print"></i> Imprimir</button>
                            {" "}
                            {/* <button type="button" className="btn btn-light"><i className="fa fa-edit"></i> Editar</button> */}
                            {" "}
                            {/* <button type="button" className="btn btn-light"><i className="fa fa-remove"></i> Eliminar</button> */}
                            {" "}
                            <button type="button" className="btn btn-light"><i className="fa fa-file-archive-o"></i> Adjuntar</button>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="form-group">
                            <div className="table-responsive">
                                <table width="100%">
                                    <thead>
                                        <tr>
                                            <th className="table-secondary
                                                         w-25 p-1 font-weight-normal ">Comprobante</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{this.state.comprobante}</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Cliente</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{this.state.cliente}</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Fecha</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{this.state.fecha}</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Estado</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{this.state.estado === 1 ? <span className="text-success font-weight-bold">Registrado</span> : <span className="text-danger font-weight-bold">Anulado</span>}</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Usuario</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{this.state.usuario}</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Motivo</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{this.state.motivo}</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Comprobante Modificado</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{this.state.comprobanteModi}</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Total</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{numberFormat(this.state.total, this.state.codiso)}</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Archivos adjuntos</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{ }</th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="form-group">
                            <div className="table-responsive">
                                <table className="table table-light table-striped">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Concepto</th>
                                            <th>Unidad</th>
                                            <th>Cantidad</th>
                                            <th>Impuesto</th>
                                            <th>Precio</th>
                                            <th>Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.detalle.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{++index}</td>
                                                    <td>{item.concepto}</td>
                                                    <td>{item.unidad}</td>
                                                    <td className="text-right">{rounded(item.cantidad)}</td>
                                                    <td className="text-right">{item.impuesto}</td>
                                                    <td className="text-right">{numberFormat(item.precio, this.state.codiso)}</td>
                                                    <td className="text-right">{numberFormat(item.cantidad * item.precio, this.state.codiso)}</td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-8 col-md-8 col-sm-12 col-xs-12">
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                        <table width="100%">
                            <thead>
                                {this.renderTotal()}
                            </thead>
                        </table>
                    </div>
                </div>
            </ContainerWrapper>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

export default connect(mapStateToProps, null)(NotaCreditoDetalle);