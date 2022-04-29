import React from 'react';
import axios from 'axios';
import {
    formatMoney,
    keyNumberFloat,
    isNumeric,
    spinnerLoading,
    ModalAlertInfo,
    ModalAlertSuccess,
    ModalAlertWarning,
} from '../../tools/Tools';
import { connect } from 'react-redux';

class GastoProceso extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idConcepto: '',
            conceptos: [],
            idBanco: '',
            cuentasBancarias: [],
            idMoneda: '',
            monedas: [],
            impuestos: [],

            monto: '',
            metodoPago: '',
            observacion: '',
            idUsuario: this.props.token.userToken.idUsuario,

            detalleConcepto: [],

            loading: true,
            messageWarning: '',
            msgLoading: 'Cargando datos...'
        }

        this.refConcepto = React.createRef()
        this.refMonto = React.createRef()

        this.refCuentaBancaria = React.createRef()
        this.refMoneda = React.createRef()

        this.refMetodoPago = React.createRef()

        this.abortControllerView = new AbortController();

    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    async componentDidMount() {
        this.loadData()
    }

    componentWillUnmount() {
        this.abortControllerView.abort();
    }

    loadData = async () => {
        try {
            const concepto = await axios.get("/api/concepto/listcombogasto", {
                signal: this.abortControllerView.signal,
            });

            const cliente = await axios.get("/api/cliente/listcombo", {
                signal: this.abortControllerView.signal,
            });

            const cuentaBancaria = await axios.get("/api/banco/listcombo", {
                signal: this.abortControllerView.signal,
            });

            const moneda = await axios.get("/api/moneda/listcombo", {
                signal: this.abortControllerView.signal,
            });

            const impuesto = await axios.get("/api/impuesto/listcombo", {
                signal: this.abortControllerView.signal,
            });

            await this.setStateAsync({
                conceptos: concepto.data,
                clientes: cliente.data,
                cuentasBancarias: cuentaBancaria.data,
                monedas: moneda.data,
                impuestos: impuesto.data,
                loading: false,
            });
        } catch (error) {
            if (error.message !== "canceled") {
                await this.setStateAsync({
                    msgLoading: "Se produjo un error interno, intente nuevamente."
                });
            }
        }
    }

    async addConcepto() {
        if (this.state.idConcepto === '') {
            await this.setStateAsync({ messageWarning: "Seleccione un concepto" })
            this.refConcepto.current.focus();
            return;
        }

        if (!isNumeric(this.state.monto)) {
            await this.setStateAsync({ messageWarning: "Ingrese un monto númerico" })
            this.refMonto.current.focus();
            return;
        }

        if (this.state.monto <= 0) {
            await this.setStateAsync({ messageWarning: "Ingrese un monto mayor a 0" })
            this.refMonto.current.focus();
            return;
        }

        let nombre = "";
        for (let item of this.state.conceptos) {
            if (this.state.idConcepto === item.idConcepto) {
                nombre = item.nombre;
                break;
            }
        }

        if (!this.validarDuplicado(this.state.idConcepto)) {
            let detalle = {
                "idConcepto": this.state.idConcepto,
                "concepto": nombre,
                "cantidad": 1,
                "idImpuesto": "",
                "impuestos": this.state.impuestos,
                "monto": this.state.monto
            }

            this.state.detalleConcepto.push(detalle)
        } else {
            for (let item of this.state.detalleConcepto) {
                if (item.idConcepto === this.state.idConcepto) {
                    let currenteObject = item;
                    currenteObject.cantidad = parseFloat(currenteObject.cantidad) + 1;
                    break;
                }
            }
        }

        let newArr = [...this.state.detalleConcepto];

        await this.setStateAsync({
            detalleConcepto: newArr,
            idConcepto: '',
            messageWarning: ''
        });
        this.refConcepto.current.focus();
    }

    validarDuplicado(id) {
        let value = false
        for (let item of this.state.detalleConcepto) {
            if (item.idConcepto === id) {
                value = true
                break;
            }
        }
        return value
    }

    handleSelect = async (event, idConcepto) => {
        let updatedList = [...this.state.detalleConcepto];
        for (let item of updatedList) {
            if (item.idConcepto === idConcepto) {
                item.idImpuesto = event.target.value;
                break;
            }
        }

        await this.setStateAsync({ detalleConcepto: updatedList })
    }

    async removerConcepto(id) {
        for (let i = 0; i < this.state.detalleConcepto.length; i++) {
            if (id === this.state.detalleConcepto[i].id) {
                this.state.detalleConcepto.splice(i, 1)
                i--;
                break;
            }
        }

        await this.setStateAsync({
            detalleConcepto: this.state.detalleConcepto
        })
    }

    renderTotal() {

        let subTotal = 0;
        let impuestoTotal = 0;
        let total = 0;

        for (let item of this.state.detalleConcepto) {
            let cantidad = item.cantidad;
            let valor = parseFloat(item.monto);
            let filter = item.impuestos.filter(imp =>
                imp.idImpuesto === item.idImpuesto
            )
            let impuesto = filter.length > 0 ? filter[0].porcentaje : 0;

            subTotal += cantidad * valor;
            impuestoTotal += (cantidad * valor) * (impuesto / 100);
            total += (cantidad * valor) + ((cantidad * valor) * (impuesto / 100));
        }

        return (
            <>
                <tr>
                    <td className="text-left">Sub Total:</td>
                    <td className="text-right">{formatMoney(subTotal)}</td>
                </tr>
                <tr>
                    <td className="text-left">Impuesto:</td>
                    <td className="text-right">{formatMoney(impuestoTotal)}</td>
                </tr>
                <tr className="border-bottom">
                </tr>
                <tr>
                    <td className="text-left h4">Total:</td>
                    <td className="text-right h4">{formatMoney(total)}</td>
                </tr>
            </>
        )
    }

    async onEventGuardar() {

        if (this.state.idBanco === "") {
            this.setState({ messageWarning: "Seleccione el banco a desembolsar." })
            this.refCuentaBancaria.current.focus();
        } else if (this.state.metodoPago === "") {
            this.setState({ messageWarning: "Seleccione el metodo de pago." })
            this.refMetodoPago.current.focus();
        } else if (this.state.idMoneda === '') {
            this.setState({ messageWarning: "Seleccione un moneda." })
            this.refMoneda.current.focus();
        } else if (this.state.detalleConcepto.length <= 0) {
            this.setState({ messageWarning: "Agregar datos a la tabla." })
            this.refConcepto.current.focus()
        } else {
            try {
                ModalAlertInfo("Gasto", "Procesando información...");

                let result = await axios.post('/api/gasto/add', {

                    "idUsuario": this.state.idUsuario,
                    'idMoneda': this.state.idMoneda,
                    "idBanco": this.state.idBanco,
                    "metodoPago": this.state.metodoPago,
                    "estado": 1,
                    "observacion": this.state.observacion.trim().toUpperCase(),
                    "gastoDetalle": this.state.detalleConcepto
                });

                ModalAlertSuccess("Gasto", result.data, () => {
                    this.onEventLimpiar()
                });

            } catch (error) {
                if (error.response !== undefined) {
                    ModalAlertWarning("Gasto", error.response.data)
                } else {
                    ModalAlertWarning("Gasto", "Se genero un error interno, intente nuevamente.")
                }
            }
        }
    }

    async onEventLimpiar() {
        await this.setStateAsync({
            idMoneda: '',
            monedas: [],
            idConcepto: '',
            conceptos: [],
            idBanco: '',
            cuentasBancarias: [],
            metodoPago: '',
            observacion: '',
            detalleConcepto: [],

            monto: '',

            impuestos: [],

            loading: true,
        });

        this.loadData();
    }

    render() {
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
                                <span role="button" onClick={() => this.props.history.goBack()}><i className="bi bi-arrow-left-short"></i></span> Gastos
                                <small className="text-secondary"> proceso</small>
                            </h5>
                        </div>
                    </div>
                </div>

                {
                    this.state.messageWarning === '' ? null :
                        <div className="alert alert-warning" role="alert">
                            <i className="bi bi-exclamation-diamond-fill"></i> {this.state.messageWarning}
                        </div>
                }

                <div className="row">
                    <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12">

                        <div className="form-row">
                            <div className="form-group col-md-6">
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text"><i className="bi bi-cart4"></i></div>
                                    </div>
                                    <select
                                        title="Lista de conceptos"
                                        className="form-control"
                                        ref={this.refConcepto}
                                        value={this.state.idConcepto}
                                        onChange={(event) => {
                                            this.setState({
                                                idConcepto: event.target.value,
                                                monto: "1"
                                            });
                                            this.refMonto.current.focus()
                                        }}
                                    >
                                        <option value="">-- Gasto --</option>
                                        {
                                            this.state.conceptos.map((item, index) => (
                                                <option key={index} value={item.idConcepto}>{item.nombre}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>

                            <div className="form-group col-md-6">
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text"><i className="bi bi-cash-coin"></i></div>
                                    </div>
                                    <input
                                        title="Monto a cobrar"
                                        type="text"
                                        className="form-control"
                                        ref={this.refMonto}
                                        value={this.state.monto}
                                        onChange={(event) => {
                                            if (event.target.value.trim().length > 0) {
                                                this.setState({
                                                    monto: event.target.value,
                                                    messageWarning: '',
                                                });
                                            } else {
                                                this.setState({
                                                    monto: event.target.value,
                                                    messageWarning: 'Ingrese el monto',
                                                });
                                            }
                                        }}
                                        placeholder="Ingrese el monto"
                                        onKeyPress={keyNumberFloat}
                                    />
                                    <button className="btn btn-outline-secondary ml-1" type="button" title="Agregar"><i className="bi bi-plus-circle" onClick={() => this.addConcepto()}></i></button>
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered rounded">
                                    <thead>
                                        <tr>
                                            <th width="5%">#</th>
                                            <th width="30%">Concepto</th>
                                            <th width="10%">Cantidad</th>
                                            <th width="20%">Impuesto</th>
                                            <th width="10%">Valor</th>
                                            <th width="10%">Total</th>
                                            <th width="5%">Quitar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.detalleConcepto.length === 0 ? (
                                                <tr className="text-center">
                                                    <td colSpan="7"> Agregar datos a la tabla </td>
                                                </tr>
                                            ) : (
                                                this.state.detalleConcepto.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{++index}</td>
                                                        <td>{item.concepto}</td>
                                                        <td>{formatMoney(item.cantidad)}</td>
                                                        <td>
                                                            <select className="form-control"
                                                                value={item.idImpuesto}
                                                                onChange={(event) => this.handleSelect(event, item.idConcepto)}>
                                                                <option value="">- Seleccione -</option>
                                                                {
                                                                    item.impuestos.map((imp, iimp) => (
                                                                        <option key={iimp} value={imp.idImpuesto}
                                                                        >{imp.nombre}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                        </td>
                                                        <td>{formatMoney(item.monto)}</td>
                                                        <td>{formatMoney(item.cantidad * item.monto)}</td>
                                                        <td>
                                                            <button className="btn btn-outline-danger btn-sm" title="Eliminar" onClick={() => this.removerConcepto(item.id)}><i className="bi bi-trash"></i></button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <button type="button" className="btn btn-primary" onClick={() => this.onEventGuardar()}>
                                    <i className="fa fa-save"></i> Guardar
                                </button>
                                {" "}
                                <button type="button" className="btn btn-outline-info">
                                    <i className="fa fa-trash"></i> Limpiar
                                </button>
                                {" "}
                                <button type="button" className="btn btn-outline-secondary" onClick={() => this.props.history.goBack()}>
                                    <i className="fa fa-close"></i> Cerrar
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-12">

                        <div className="form-group">
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-bank"></i></div>
                                </div>
                                <select
                                    title="Lista de caja o banco a desembolsar"
                                    className="form-control"
                                    ref={this.refCuentaBancaria}
                                    value={this.state.idBanco}
                                    onChange={(event) => {
                                        if (event.target.value.trim().length > 0) {
                                            this.setState({
                                                idBanco: event.target.value,
                                                messageWarning: '',
                                            });
                                        } else {
                                            this.setState({
                                                idBanco: event.target.value,
                                                messageWarning: 'Seleccione el banco a desembolsar.',
                                            });
                                        }
                                    }}

                                >
                                    <option value="">-- Cuenta bancaria --</option>
                                    {
                                        this.state.cuentasBancarias.map((item, index) => (
                                            <option key={index} value={item.idBanco}>{item.nombre + " - " + item.tipoCuenta}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-credit-card-2-back"></i></div>
                                </div>
                                <select
                                    title="Lista metodo de pago"
                                    className="form-control"
                                    value={this.state.metodoPago}
                                    ref={this.refMetodoPago}
                                    onChange={(event) => {
                                        if (event.target.value.length > 0) {
                                            this.setState({
                                                metodoPago: event.target.value,
                                                messageWarning: '',
                                            });
                                        } else {
                                            this.setState({
                                                metodoPago: event.target.value,
                                                messageWarning: 'Seleccione el metodo de pago.',
                                            });
                                        }
                                    }}
                                >
                                    <option value="">-- Metodo de pago --</option>
                                    <option value="1">Efectivo</option>
                                    <option value="2">Consignación</option>
                                    <option value="3">Transferencia</option>
                                    <option value="4">Cheque</option>
                                    <option value="5">Tarjeta crédito</option>
                                    <option value="6">Tarjeta débito</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-cash"></i></div>
                                </div>
                                <select
                                    title="Lista metodo de pago"
                                    className="form-control"
                                    ref={this.refMoneda}
                                    value={this.state.idMoneda}
                                    onChange={(event) => {
                                        if (event.target.value.length > 0) {
                                            this.setState({
                                                idMoneda: event.target.value,
                                                messageWarning: '',
                                            });
                                        } else {
                                            this.setState({
                                                idMoneda: event.target.value,
                                                messageWarning: "Seleccione un moneda.",
                                            });
                                        }
                                    }}
                                >
                                    <option value="">-- Moneda --</option>
                                    {
                                        this.state.monedas.map((item, index) => (
                                            <option key={index} value={item.idMoneda}>{item.nombre + ' - ' + item.simbolo}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-chat-dots-fill"></i></div>
                                </div>
                                <textarea
                                    title="Observaciones..."
                                    className="form-control"
                                    style={{ fontSize: '13px' }}
                                    vvalue={this.state.observacion}
                                    onChange={(event) => this.setState({ observacion: event.target.value, })}
                                    placeholder="Ingrese alguna observación">
                                </textarea>
                            </div>
                        </div>

                        <div className="form-group">
                            <table width="100%">
                                <tbody>
                                    {this.renderTotal()}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

export default connect(mapStateToProps, null)(GastoProceso);