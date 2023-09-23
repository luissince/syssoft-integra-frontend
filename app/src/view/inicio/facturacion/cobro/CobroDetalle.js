import React from 'react';
import CryptoJS from 'crypto-js';
import {
    formatMoney,
    numberFormat,
    calculateTaxBruto,
    calculateTax,
    timeForma24,
    spinnerLoading,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../components/Container';
import { getCobroId } from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error';
import { CANCELED } from '../../../../model/types/types';

class CobroDetalle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idCobro: '',
            comprobante: '',
            cliente: '',
            fecha: '',
            cuentaBancaria: '',
            notas: '',
            metodoPago: '',
            idNotaCredito: null,
            estado: '',
            usuario: '',
            total: '',
            codiso: '',
            simbolo: '',
            lote: '',

            cobro: true,
            detalle: [],

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
        const idResult = new URLSearchParams(url).get("idCobro");
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

        const params = {
            idCobro: id
        }

        const response = await getCobroId(params, this.abortControllerView.signal);

        if (response instanceof SuccessReponse) {
            const { cabecera, lote, detalle, venta } = response.data;
            const { comprobante, serie, numeracion, estado, documento, informacion, fecha, hora, banco, observacion, metodoPago, monto, simbolo, codiso, usuario, idNotaCredito } = cabecera;

            await this.setStateAsync({
                idCobro: id,
                comprobante: `${comprobante} ${serie}-${numeracion}`,
                estado: estado.toString(),
                cliente: `${documento} - ${informacion}`,
                fecha: `${fecha} ${timeForma24(hora)}`,
                cuentaBancaria: banco,
                notas: observacion,
                metodoPago: metodoPago === 1 ? "Efectivo"
                    : metodoPago === 2 ? "Consignación"
                        : metodoPago === 3 ? "Transferencia"
                            : metodoPago === 4 ? "Cheque"
                                : metodoPago === 5 ? "Tarjeta crédito"
                                    : "Tarjeta débito",
                total: monto,
                simbolo,
                codiso,
                lote: lote.length === 0 ? "" : `${lote[0].lote} - ${lote[0].manzana}`,
                usuario,
                idNotaCredito,
                cobro: detalle.length !== 0,
                detalle: detalle.length !== 0 ? detalle : venta,
                loading: false
            });
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            console.log(response.getMessage())

            this.props.history.goBack();
        }
    }


    renderTotal() {
        let subTotal = 0;
        let impuestoTotal = 0;
        let total = 0;

        if (this.state.cobro) {
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
        } else {
            for (let item of this.state.detalle) {
                total += item.precio;
            }
        }

        return (
            <>
                {
                    this.state.cobro ?
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
                        </> :
                        <>
                            <tr>
                                <th className="text-right h5">Total:</th>
                                <th className="text-right h5">{numberFormat(total, this.state.codiso)}</th>
                            </tr>
                        </>
                }
            </>
        )
    }

    onEventImprimir() {
        const data = {
            "idSede": "SD0001",
            "idCobro": this.state.idCobro,
        }

        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'key-report-inmobiliaria').toString();
        let params = new URLSearchParams({ "params": ciphertext });
        window.open("/api/cobro/repcomprobante?" + params, "_blank");
    }

    onEventMatricial() {
        const data = {
            "idSede": "SD0001",
            "idCobro": this.state.idCobro,
        }

        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'key-report-inmobiliaria').toString();
        let params = new URLSearchParams({ "params": ciphertext });
        window.open("/api/cobro/repcomprobantematricial?" + params, "_blank");
    }

    render() {
        return (
            <ContainerWrapper>
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
                                <span role="button" onClick={() => this.props.history.goBack()}><i className="bi bi-arrow-left-short"></i></span> Cobro
                                <small className="text-secondary"> detalle</small>
                            </h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="form-group">
                            <button type="button" className="btn btn-light" onClick={() => this.onEventImprimir()}><i className="fa fa-print"></i> Imprimir A4</button>
                            {" "}
                            <button type="button" className="btn btn-light" onClick={() => this.onEventMatricial()}><i className="fa fa-print"></i> Imprimir Matricial</button>
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
                                            <th className="table-secondary w-25 p-1 font-weight-normal "><span>Recibo de caja</span></th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{this.state.comprobante}</th>
                                        </tr>
                                        {/* <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Estado</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal"></th>
                                        </tr> */}
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Cliente</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{this.state.cliente}</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Fecha</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{this.state.fecha}</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Cuenta bancaria</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{this.state.cuentaBancaria}</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Notas</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{this.state.notas}</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Método de pago</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{this.state.metodoPago}</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Usuario</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{this.state.usuario}</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Estado</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{this.state.estado == 1 && this.state.idNotaCredito == null ? <span className="text-success">COBRADO</span> : this.state.idNotaCredito != null ? <span className="text-warning">MODIFICADO</span> : <span className="text-danger">ANULADO</span>}</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Archivos adjuntos</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{ }</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Total</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{numberFormat(this.state.total, this.state.codiso)}</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Lote - Manzana</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{this.state.lote}</th>
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
                                        {
                                            this.state.cobro ?
                                                <tr>
                                                    <th>#</th>
                                                    <th>Concepto</th>
                                                    <th>Cantidad</th>
                                                    <th>Impuesto</th>
                                                    <th>Valor</th>
                                                    <th>Monto</th>
                                                </tr>
                                                :
                                                <tr>
                                                    <th>#</th>
                                                    <th>Concepto</th>
                                                    <th>Cantidad</th>
                                                    <th>Valor</th>
                                                    <th>Monto</th>
                                                </tr>
                                        }

                                    </thead>
                                    <tbody>
                                        {
                                            this.state.cobro ?
                                                this.state.detalle.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{++index}</td>
                                                        <td>{item.concepto}</td>
                                                        <td className="text-right">{formatMoney(item.cantidad)}</td>
                                                        <td className="text-right">{item.impuesto}</td>
                                                        <td className="text-right">{numberFormat(item.precio, this.state.codiso)}</td>
                                                        <td className="text-right">{numberFormat(item.cantidad * item.precio, this.state.codiso)}</td>
                                                    </tr>
                                                ))
                                                :
                                                this.state.detalle.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{++index}</td>
                                                        <td>{item.concepto}<br /><small>{item.comprobante + " " + item.serie + "-" + item.numeracion}</small></td>
                                                        <td className="text-right">{1}</td>
                                                        <td className="text-right">{numberFormat(item.precio, this.state.codiso)}</td>
                                                        <td className="text-right">{numberFormat(item.precio, this.state.codiso)}</td>
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

export default connect(mapStateToProps, null)(CobroDetalle);