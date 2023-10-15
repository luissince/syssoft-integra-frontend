import React from 'react';
import CryptoJS from 'crypto-js';
import {
    formatMoney,
    numberFormat,
    calculateTaxBruto,
    calculateTax,
    formatTime,
    spinnerLoading,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../components/Container';
import { getCobroId } from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
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

            cobroVenta: [],
            cobroDetalle: [],

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
            const {
                cabecera,
                cobroVenta,
                cobroDetalle             
            } = response.data;
            const { comprobante, serie, numeracion, estado, documento, informacion, fecha, hora, banco, observacion, metodoPago, monto, simbolo, codiso, usuario, idNotaCredito } = cabecera;

            const metodoPago_ = function(){
                if(metodoPago === 1){
                    return "Efectivo";
                } 

                if(metodoPago === 2){
                    return "Consignación";
                } 

                if(metodoPago === 3){
                    return "Transferencia";
                } 

                if(metodoPago === 4){
                    return  "Cheque";
                } 

                if(metodoPago === 5){
                    return "Tarjeta crédito";
                } 

                return "Tarjeta débito";
            }

            await this.setStateAsync({
                idCobro: id,
                comprobante: `${comprobante} ${serie}-${numeracion}`,
                estado: estado.toString(),
                cliente: `${documento} - ${informacion}`,
                fecha: `${fecha} ${formatTime(hora)}`,
                cuentaBancaria: banco,
                notas: observacion,
                metodoPago: metodoPago_(),
                total: monto,
                simbolo,
                codiso,            
                usuario,
                idNotaCredito,
                cobroVenta: cobroVenta,
                cobroDetalle: cobroDetalle,
                loading: false
            });
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            console.log(response.getMessage())

            this.props.history.goBack();
        }
    }

    onEventImprimir() {
        const data = {
            "idEmpresa": "EM0001",
            "idCobro": this.state.idCobro,
        }

        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'key-report-inmobiliaria').toString();
        let params = new URLSearchParams({ "params": ciphertext });
        window.open("/api/cobro/repcomprobante?" + params, "_blank");
    }

    onEventMatricial() {
        const data = {
            "idEmpresa": "EM0001",
            "idCobro": this.state.idCobro,
        }

        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'key-report-inmobiliaria').toString();
        let params = new URLSearchParams({ "params": ciphertext });
        window.open("/api/cobro/repcomprobantematricial?" + params, "_blank");
    }

    renderTotal() {
        if (this.state.cobroDetalle.length !== 0) {
            let subTotal = 0;
            let total = 0;

            for (let item of this.state.cobroDetalle) {
                let cantidad = item.cantidad;
                let valor = item.precio;

                let impuesto = item.porcentaje;

                let valorActual = cantidad * valor;
                let valorSubNeto = calculateTaxBruto(impuesto, valorActual);
                let valorImpuesto = calculateTax(impuesto, valorSubNeto);
                let valorNeto = valorSubNeto + valorImpuesto;

                subTotal += valorSubNeto;
                total += valorNeto;
            }

            const impuestosGenerado = () => {
                const resultado = this.state.cobroDetalle.reduce((acc, item) => {
                    const total = item.cantidad * item.precio;
                    const subTotal = calculateTaxBruto(item.porcentaje, total);
                    const impuestoTotal = calculateTax(item.porcentaje, subTotal);

                    const existingImpuesto = acc.find(imp => imp.idImpuesto === item.idImpuesto);

                    if (existingImpuesto) {
                        existingImpuesto.valor += impuestoTotal;
                    } else {
                        acc.push({
                            idImpuesto: item.idImpuesto,
                            nombre: item.impuesto,
                            valor: impuestoTotal,
                        });
                    }


                    return acc;
                }, []);

                return (
                    resultado.map((item, index) => (
                        <tr key={index}>
                            <th className="text-right">{item.nombre} :</th>
                            <th className="text-right">{numberFormat(item.valor, this.state.codiso)}</th>
                        </tr>
                    ))
                );
            }

            return (
                <>
                    <tr>
                        <th className="text-right">SUB TOTAL :</th>
                        <th className="text-right">{numberFormat(subTotal, this.state.codiso)}</th>
                    </tr>
                    {impuestosGenerado()}
                    <tr className="border-bottom">
                    </tr>
                    <tr>
                        <th className="text-right h5">TOTAL :</th>
                        <th className="text-right h5">{numberFormat(total, this.state.codiso)}</th>
                    </tr>
                </>
            );
        } else {

            const total = this.state.cobroVenta.reduce((acumulador, item) => {
                return acumulador + (item.precio * item.cantidad);
            }, 0);

            return (
                <tr>
                    <th className="text-right h5">Total:</th>
                    <th className="text-right h5">{numberFormat(total, this.state.codiso)}</th>
                </tr>
            );
        }
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
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{this.state.estado && this.state.idNotaCredito == null ? <span className="text-success">COBRADO</span> : this.state.idNotaCredito != null ? <span className="text-warning">MODIFICADO</span> : <span className="text-danger">ANULADO</span>}</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Archivos adjuntos</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{ }</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Total</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{numberFormat(this.state.total, this.state.codiso)}</th>
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
                                            this.state.cobroVenta.length !== 0 ?
                                                <tr>
                                                    <th>#</th>
                                                    <th>Concepto</th>
                                                    <th>Cantidad</th>
                                                    <th>Valor</th>
                                                    <th>Monto</th>
                                                </tr>
                                                :
                                                <tr>
                                                    <th>#</th>
                                                    <th>Concepto</th>
                                                    <th>Cantidad</th>
                                                    <th>Medida</th>
                                                    <th>Impuesto</th>
                                                    <th>Precio</th>
                                                    <th>Total</th>
                                                </tr>
                                        }
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.cobroVenta.length !== 0 ?
                                                this.state.cobroVenta.map((item, index) => {

                                                    return (
                                                        <tr key={index}>
                                                            <td>{++index}</td>
                                                            <td>{item.nombre}</td>
                                                            <td>{formatMoney(item.cantidad)}</td>
                                                            <td>{numberFormat(item.precio, this.state.codiso)}</td>
                                                            <td>{numberFormat(item.cantidad * item.precio, this.state.codiso)}</td>
                                                        </tr>
                                                    );
                                                })
                                                :
                                                this.state.cobroDetalle.map((item, index) => {

                                                    return (
                                                        <tr key={index}>
                                                            <td>{++index}</td>
                                                            <td>{item.nombre}</td>
                                                            <td>{formatMoney(item.cantidad)}</td>
                                                            <td>{item.medida}</td>
                                                            <td>{item.impuesto}</td>
                                                            <td>{numberFormat(item.precio, this.state.codiso)}</td>
                                                            <td>{numberFormat(item.cantidad * item.precio, this.state.codiso)}</td>
                                                        </tr>
                                                    );
                                                })
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