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
import { getCobroVentaId, getFacturaId } from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';
import CustomComponent from '../../../../model/class/custom-component';

class VentaDetalle extends CustomComponent {
    constructor(props) {
        super(props);
        this.state = {
            idVenta: '',
            comprobante: '',
            cliente: '',
            fecha: '',
            notas: '',
            formaVenta: '',
            estado: '',
            codiso: '',
            simbolo: '',
            total: '',
            usuario: '',

            detalle: [],
            cobros: [],

            loading: true,
            msgLoading: 'Cargando datos...',
        }

        this.abortControllerView = new AbortController();
    }

    /**
  * Método de cliclo de vida
  */

    async componentDidMount() {
        const url = this.props.location.search;
        const idResult = new URLSearchParams(url).get("idVenta");
        if (idResult !== null) {
            this.loadingData(idResult);
        } else {
            this.props.history.goBack();
        }
    }

    componentWillUnmount() {
        this.abortControllerView.abort();
    }

    /**
    * 
    * Métodos de acción
    */


    async loadingData(id) {
        const [factura, cobros] = await Promise.all([
            await this.fetchFacturaId(id),
            await this.fetchCobroVentaId(id)
        ]);

        if (!factura || !cobros) {
            this.props.history.goBack();
            return;
        }

        const {
            comprobante,
            serie,
            numeracion,
            documento,
            informacion,
            fecha,
            hora,
            tipo,
            estado,
            simbolo,
            codiso,
            usuario,
            monto
        } = factura.cabecera;

        await this.setStateAsync({
            idVenta: id,
            comprobante: comprobante + "  " + serie + "-" + numeracion,
            cliente: documento + " - " + informacion,
            fecha: fecha + " " + formatTime(hora),
            notas: '',
            formaVenta: tipo === 1 ? "Contado" : "Crédito",
            estado: estado,
            simbolo: simbolo,
            codiso: codiso,
            usuario: usuario,
            total: formatMoney(monto),
            detalle: factura.detalle,

            cobros: cobros,

            loading: false
        });
    }

    async fetchFacturaId(id) {
        const params = {
            "idVenta": id
        }

        const response = await getFacturaId(params, this.abortControllerView.signal);

        if (response instanceof SuccessReponse) {
            return response.data;
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            return false;
        }
    }

    async fetchCobroVentaId(id) {
        const params = {
            "idVenta": id
        }

        const response = await getCobroVentaId(params, this.abortControllerView.signal);

        if (response instanceof SuccessReponse) {
            return response.data;
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            return false;
        }
    }

    renderTotal() {
        let subTotal = 0;
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
            total += valorNeto;
        }

        const impuestosGenerado = () => {
            const resultado = this.state.detalle.reduce((acc, item) => {
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
                resultado.map((impuesto, index) => {

                    return (
                        <tr key={index}>
                            <th className="text-right">{impuesto.nombre} :</th>
                            <th className="text-right">{numberFormat(impuesto.valor, this.state.codiso)}</th>
                        </tr>
                    );
                })
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
        )
    }

    async onEventImprimir() {
        const data = {
            "idSede": "SD0001",
            "idVenta": this.state.idVenta,
        }

        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'key-report-inmobiliaria').toString();
        let params = new URLSearchParams({ "params": ciphertext });
        window.open("/api/factura/repcomprobante?" + params, "_blank");
    }

    render() {
        return (
            <ContainerWrapper>
                {
                    this.state.loading ?
                        <div className="clearfix absolute-all bg-white">
                            {spinnerLoading(this.state.msgLoading)}
                        </div> :
                        null
                }

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>
                                <span role="button" onClick={() => this.props.history.goBack()}><i className="bi bi-arrow-left-short"></i></span> Venta
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
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Comprobante</th>
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
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Notas</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{this.state.notas}</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Forma de venta</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{this.state.formaVenta}</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Estado</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                                                {
                                                    this.state.estado === 1 ? <span className="text-success font-weight-bold">Cobrado</span>
                                                        : this.state.estado === 2 ? <span className="text-warning font-weight-bold">Por cobrar</span>
                                                            : this.state.estado === 3 ? <span className="text-danger font-weight-bold">Anulado</span>
                                                                : <span className="text-secondary font-weight-bold">Liberado</span>
                                                }
                                            </th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Usuario</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{this.state.usuario}</th>
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
                        <p className="lead">Detalle</p>
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
                                                <td>{item.producto}{<br />}{<small>{item.categoria}</small>}</td>
                                                <td>{item.medida}</td>
                                                <td className="text-right">{formatMoney(item.cantidad)}</td>
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

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <p className="lead">Cobros</p>
                        <div className="table-responsive">
                            <table className="table table-light table-striped">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Concepto</th>
                                        <th>Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.cobros.length === 0 ?
                                            <tr>
                                                <td colSpan="3" className="text-center">No hay cobro</td>
                                            </tr>
                                            :
                                            this.state.cobros.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{++index}</td>
                                                    <td>{item.concepto}</td>
                                                    <td>{numberFormat(item.monto, item.codiso)}</td>
                                                </tr>
                                            ))
                                    }
                                </tbody>
                            </table>
                        </div>
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

export default connect(mapStateToProps, null)(VentaDetalle);