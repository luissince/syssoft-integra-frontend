import React from 'react';
import axios from 'axios';
import {
    formatMoney,
    keyNumberInteger,
    keyNumberFloat,
    isNumeric,
    spinnerLoading,
    ModalAlertInfo,
    ModalAlertSuccess,
    ModalAlertWarning,
} from '../../tools/Tools';
import { connect } from 'react-redux';

class VentaProceso extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            idCliente: '',
            idComprobante: '',
            idUsuario: this.props.token.userToken.idUsuario,
            tipo: '',
            numCuota: '',
            estado: 1,
            idMoneda: '',
            monedas: [],

            lotes: [],
            precioContado: '',

            detalleVenta: [],
            comprobantes: [],
            clientes: [],

            impuestos: [],

            idProyecto: this.props.token.project.idProyecto,

            loading: true,
            messageWarning: '',
            msgLoading: 'Cargando datos...',
        }

        this.refLote = React.createRef();
        this.refPrecioContado = React.createRef();
        this.refComprobante = React.createRef();
        this.refCliente = React.createRef();
        this.refTipo = React.createRef();
        this.refMoneda = React.createRef();
        this.refCuotas = React.createRef();

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

            const comprobante = await axios.get("/api/comprobante/listcombo", {
                signal: this.abortControllerView.signal,
            });

            const cliente = await axios.get("/api/cliente/listcombo", {
                signal: this.abortControllerView.signal,
            });

            const lote = await axios.get("/api/lote/listcombo", {
                signal: this.abortControllerView.signal,
                params: {
                    "idProyecto": this.state.idProyecto
                }
            });

            const moneda = await axios.get("/api/moneda/listcombo", {
                signal: this.abortControllerView.signal,
            });

            const impuesto = await axios.get("/api/impuesto/listcombo", {
                signal: this.abortControllerView.signal,
            });

            await this.setStateAsync({
                comprobantes: comprobante.data,
                clientes: cliente.data,
                lotes: lote.data,
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

    addObjectTable() {
        if (this.refLote.current.value === '') {
            this.setState({ messageWarning: "Seleccione un lote" })
            this.refLote.current.focus();
            return;
        }
        if (!isNumeric(this.state.precioContado)) {
            this.setState({ messageWarning: "Ingrese el precio de venta total" })
            this.refPrecioContado.current.focus();
            return;
        }
        if (this.state.precioContado <= 0) {
            this.setState({ messageWarning: "Ingrese un precio mayor a 0" })
            this.refPrecioContado.current.focus();
            return;
        }

        let nombreLote = "";
        let nombreManzana = "";
        let precioContado = 0;
        for (let item of this.state.lotes) {
            if (this.refLote.current.value === item.idLote) {
                nombreLote = item.nombreLote;
                nombreManzana = item.nombreManzana;
                precioContado = item.precio;
                break;
            }
        }

        if (!this.validarDuplicado(this.refLote.current.value)) {
            let detalle = {
                "idDetalle": this.refLote.current.value,
                "nombreLote": nombreLote,
                "nombreManzana": nombreManzana,
                "cantidad": 1,
                "idImpuesto": "",
                "impuestos": this.state.impuestos,
                "precioContado": precioContado
            }

            this.state.detalleVenta.push(detalle)
        } else {
            for (let item of this.state.detalleVenta) {
                if (item.idDetalle === this.refLote.current.value) {
                    let currenteObject = item;
                    currenteObject.cantidad = parseFloat(currenteObject.cantidad) + 1;
                    break;
                }
            }
        }

        let newArr = [...this.state.detalleVenta]

        this.setState({ detalleVenta: newArr, messageWarning: '', precioContado: '' });
        this.refLote.current.value = '';
    }

    validarDuplicado(id) {
        let value = false
        for (let item of this.state.detalleVenta) {
            if (item.idDetalle === id) {
                value = true
                break;
            }
        }
        return value
    }

    removeObjectTable(id) {
        for (let i = 0; i < this.state.detalleVenta.length; i++) {
            if (id === this.state.detalleVenta[i].idDetalle) {
                this.state.detalleVenta.splice(i, 1)
                i--;
                break;
            }
        }
        this.setState({ detalleVenta: this.state.detalleVenta })
    }

    async changeLote(event) {
        let precio = 0
        for (let i of this.state.lotes) {
            if (event.target.value === i.idLote) {
                precio = i.precio
                break
            }
        }
        await this.setStateAsync({
            precioContado: precio.toString()
        });

        this.refPrecioContado.current.focus();
    }

    async onEventLimpiar() {
        await this.setStateAsync({
            idCliente: '',
            idComprobante: '',
            tipo: '',
            numCuota: '',
            estado: 1,
            idMoneda: '',
            monedas: [],

            lotes: [],
            precioContado: '',

            impuestos: [],

            detalleVenta: [],
            comprobantes: [],
            clientes: [],

            loading: true,
        });

        this.loadData();
    }

    renderTotal() {

        let subTotal = 0;
        let impuestoTotal = 0;
        let total = 0;

        for (let item of this.state.detalleVenta) {
            console.log(item)
            let cantidad = item.cantidad;
            let valor = parseFloat(item.precioContado);
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
        if (this.state.detalleVenta.length <= 0) {
            this.setState({ messageWarning: "Agregar datos a la tabla." })
            this.refLote.current.focus()
        } else if (this.state.idComprobante === '') {
            this.setState({ messageWarning: "Seleccione el comprobante." })
            this.refComprobante.current.focus();
        } else if (this.state.idCliente === "") {
            this.setState({ messageWarning: "Seleccione el cliente." });
            this.refCliente.current.focus();
        } else if (this.state.tipo === "") {
            this.setState({ messageWarning: "Seleccione el tipo de venta." });
            this.refTipo.current.focus();
        }
        else if (this.state.tipo === "2" && this.state.numCuota === "") {
            this.setState({ messageWarning: "Ingrese el n° de cuotas." });
            this.refCuotas.current.focus();
        }
        else {
            try {
                ModalAlertInfo("Venta", "Procesando información...");
                let result = await axios.post('/api/factura/add', {
                    "idCliente": this.state.idCliente,
                    "idUsuario": this.state.idUsuario,
                    "idComprobante": this.state.idComprobante,
                    "idMoneda": this.state.idMoneda,
                    "tipo": this.state.tipo,
                    "numCuota": this.state.numCuota === "" ? 0 : this.state.numCuota,
                    "estado": 1,
                    "detalleVenta": this.state.detalleVenta,
                });

                ModalAlertSuccess("Venta", result.data, () => {
                    this.onEventLimpiar()
                });
            }
            catch (error) {
                if (error.response !== undefined) {
                    ModalAlertWarning("Venta", error.response.data)
                } else {
                    ModalAlertWarning("Venta", "Se genero un error interno, intente nuevamente.")
                }

            }
        }
    }

    handleSelect = async (event, idDetalle) => {
        let updatedList = [...this.state.detalleVenta];
        for (let item of updatedList) {
            if (item.idDetalle === idDetalle) {
                item.idImpuesto = event.target.value;
                break;
            }
        }

        await this.setStateAsync({ detalleVenta: updatedList })
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

                <div className='row pb-3'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <section className="content-header">
                            <h5>
                                <span role="button" onClick={() => this.props.history.goBack()}><i className="bi bi-arrow-left-short"></i></span> Registrar Venta
                                <small className="text-secondary"> nueva</small>
                            </h5>
                        </section>
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
                                        title="Lista de lotes"
                                        className="form-control"
                                        ref={this.refLote}
                                        onChange={(event) => this.changeLote(event)}>
                                        <option value="">-- seleccione --</option>
                                        {
                                            this.state.lotes.map((item, index) => (
                                                <option key={index} value={item.idLote}>{`${item.nombreLote} / ${item.nombreManzana} - ${item.precio}`}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>
                            <div className="form-group col-md-6">
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text"><i className="bi bi-tag-fill"></i></div>
                                    </div>
                                    <input
                                        title="Precio de venta"
                                        type="text"
                                        className="form-control"
                                        placeholder='0.00'
                                        ref={this.refPrecioContado}
                                        value={this.state.precioContado}
                                        onChange={(event) => {

                                            if (event.target.value.trim().length > 0) {
                                                this.setState({
                                                    precioContado: event.target.value,
                                                    messageWarning: '',
                                                });
                                            } else {
                                                this.setState({
                                                    precioContado: event.target.value,
                                                    messageWarning: 'Ingrese el precio de venta.',
                                                });
                                            }
                                        }}
                                        onKeyPress={keyNumberFloat} />

                                    <button className="btn btn-outline-secondary ml-1" type="button" title="Agregar" onClick={() => this.addObjectTable()}><i className="bi bi-plus-circle"></i></button>
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered rounded">
                                    <thead>
                                        <tr>
                                            <th width="10%">#</th>
                                            <th width="30%">Descripción</th>
                                            <th width="10%">Cantidad </th>
                                            <th width="20%">Impuesto</th>
                                            <th width="10%">Precio </th>
                                            <th width="10%">Importe </th>
                                            <th width="5%">Quitar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.detalleVenta.length === 0 ? (
                                                <tr className="text-center">
                                                    <td colSpan="7"> Agregar datos a la tabla </td>
                                                </tr>
                                            ) : (
                                                this.state.detalleVenta.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{++index}</td>
                                                        <td>{`${item.nombreLote} / ${item.nombreManzana}`}</td>
                                                        <td>{item.cantidad}</td>
                                                        <td>
                                                            <select className="form-control"
                                                                value={item.idImpuesto}
                                                                onChange={(event) => this.handleSelect(event, item.idDetalle)}>
                                                                <option value="">- Seleccione -</option>
                                                                {
                                                                    item.impuestos.map((imp, iimp) => (
                                                                        <option key={iimp} value={imp.idImpuesto}
                                                                        >{imp.nombre}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                        </td>
                                                        <td>{item.precioContado}</td>
                                                        <td>{item.precioContado * item.cantidad}</td>
                                                        <td>
                                                            <button className="btn btn-outline-danger btn-sm" title="Eliminar" onClick={() => this.removeObjectTable(item.id)}><i className="bi bi-trash"></i></button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-12">

                        <div className="form-group">
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-receipt"></i></div>
                                </div>
                                <select
                                    title="Comprobantes de venta"
                                    className="form-control"
                                    ref={this.refComprobante}
                                    value={this.state.idComprobante}
                                    onChange={(event) => this.setState({ idComprobante: event.target.value })}>
                                    <option value="">-- Comprobantes --</option>
                                    {
                                        this.state.comprobantes.map((item, index) => (
                                            <option key={index} value={item.idComprobante}>{item.nombre}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-person-fill"></i></div>
                                </div>
                                <select
                                    title="Lista de clientes"
                                    className="form-control"
                                    ref={this.refCliente}
                                    value={this.state.idCliente}
                                    onChange={(event) => this.setState({ idCliente: event.target.value })}>
                                    <option value="">-- Clientes --</option>
                                    {
                                        this.state.clientes.map((item, index) => (
                                            <option key={index} value={item.idCliente}>{item.informacion}</option>
                                        ))
                                    }
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
                                    }}>
                                    <option value="">-- Moneda --</option>
                                    {
                                        this.state.monedas.map((item, index) => (
                                            <option key={index} value={item.idMoneda}>{item.nombre}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-front"></i></div>
                                </div>
                                <select
                                    title="Comprobantes de venta"
                                    className="form-control"
                                    ref={this.refTipo}
                                    value={this.state.tipo}
                                    onChange={(event) => this.setState({ tipo: event.target.value })}>
                                    <option value="">-- Tipo de Venta --</option>
                                    <option value="1">Contado</option>
                                    <option value="2">Crédito</option>
                                </select>
                            </div>
                        </div>

                        {
                            this.state.tipo === "2" ?
                                <div className="form-group">
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text"><i className="bi bi-calendar-event"></i></div>
                                        </div>
                                        <input
                                            placeholder="N° de Cuotas"
                                            type="text"
                                            className="form-control"
                                            ref={this.refCuotas}
                                            value={this.state.numCuota}
                                            onChange={(event) => this.setState({ numCuota: event.target.value })}
                                            onKeyPress={keyNumberInteger}
                                        />
                                    </div>
                                </div>
                                : null
                        }

                        <div className="form-group">
                            <table width="100%">
                                <tbody>
                                    {this.renderTotal()}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>

                <div className="row">
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                        <div className="form-row">
                            <div className="form-group col-md-12">
                                <button type="button" className="btn btn-success" onClick={() => this.onEventGuardar()}>
                                    <i className="fa fa-save"></i> Guardar
                                </button>
                                {" "}
                                <button type="button" className="btn btn-outline-info" onClick={() => this.onEventLimpiar()}>
                                    <i className="fa fa-trash"></i> Limpiar
                                </button>
                                {" "}
                                <button type="button" className="btn btn-outline-secondary" onClick={() => this.props.history.goBack()}>
                                    <i className="fa fa-close"></i> Cerrar
                                </button>

                            </div>
                        </div>
                    </div>
                </div>

            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

export default connect(mapStateToProps, null)(VentaProceso);