import React from 'react';
import axios from 'axios';
import { showModal, hideModal, clearModal, isNumeric } from '../../tools/Tools';


class CobroProceso extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idCobro: '',
            conceptos: [
                { "value": 1, "name": "Mora por retraso de pago" },
                { "value": 2, "name": "Cuota Mensual" },
                { "value": 3, "name": "Tarifa de agua mensual" }
            ],
            monto: '',
            cliente: '',
            cuentaBancaria: '',
            metodoPago: '',
            observacion: '',
            detalleConcepto: [],

            messageWarning: ''
        }

        this.refConcepto = React.createRef()
        this.refMonto = React.createRef()

        this.refCliente = React.createRef()
        this.refCuentaBancaria = React.createRef()
        this.refMetodoPago = React.createRef()
        this.refObservacion = React.createRef()
    }

    async componentDidMount() { }

    async save() {

        if (this.state.cliente === "") {
            this.setState({ messageWarning: "Seleccione el cliente" });
            this.refCliente.current.focus();
        } else if (this.state.cuentaBancaria === "") {
            this.setState({ messageWarning: "Seleccione el banco a depositar" })
            this.refCuentaBancaria.current.focus();
        } else if (this.state.metodoPago === "") {
            this.setState({ messageWarning: "Seleccione el metodo de pago" })
            this.refMetodoPago.current.focus();
        } else if (this.state.detalleConcepto.length <= 0) {
            this.setState({ messageWarning: "Agregar datos a la tabla" })
            this.refConcepto.current.focus()
        } else {

            try {
                let result = null

                result = await axios.post('/api/cobro/add', {
                    //concepto
                    "cliente": this.state.cliente,
                    "usuario": 'US0001',
                    'moneda': 'MN001',
                    "cuentaBancaria": this.state.cuentaBancaria,
                    "metodoPago": this.state.metodoPago,
                    "estado": 1,
                    "observacion": this.state.observacion.trim().toUpperCase(),
                    "cobroDetalle": this.state.detalleConcepto
                });
                // console.log(this.state.detalleConcepto)
                // console.log(result.data)

                this.clearObjetos()

            } catch (error) {
                console.log(error)
                console.log(error.response)
            }
        }

    }

    addConcepto() {

        // console.log(this.refConcepto.current.value)
        if (this.refConcepto.current.value === '') {
            this.setState({ messageWarning: "Seleccione un concepto" })
            this.refConcepto.current.focus();
            return;
        }
        if (!isNumeric(this.state.monto)) {
            this.setState({ messageWarning: "Ingrese un monto númerico" })
            this.refMonto.current.focus();
            return;
        }

        if (this.state.monto <= 0) {
            this.setState({ messageWarning: "Ingrese un monto mayor a 0" })
            this.refMonto.current.focus();
            return;
        }

        let nombre = "";
        for (let item of this.state.conceptos) {
            if (this.refConcepto.current.value == item.value) {
                nombre = item.name;
                break;
            }
        }
        // console.log(nombre)
        let obj = {
            "id": this.refConcepto.current.value,
            "concepto": nombre,
            "monto": this.state.monto
        }

        if (this.validarDuplicado(obj.id)) {
            this.setState({ messageWarning: 'No puede haber conceptos duplicados' })
            return;
        }

        let newArr = [...this.state.detalleConcepto, obj]
        this.setState({ detalleConcepto: newArr, messageWarning: '' });

    }

    validarDuplicado(id) {
        let value = false
        for (let item of this.state.detalleConcepto) {
            if (item.id == id) {
                value = true
                break;
            }
        }

        return value
    }

    removerConcepto(id) {

        for (let i = 0; i < this.state.detalleConcepto.length; i++) {
            // console.log(this.state.detalleConcepto[i].id)
            if (id === this.state.detalleConcepto[i].id) {
                this.state.detalleConcepto.splice(i, 1)
                i--;
                break;
            }
        }

        this.setState({ detalleConcepto: this.state.detalleConcepto })

    }

    clearObjetos(){
        this.setState({
            
            monto: '',
            cliente: '',
            cuentaBancaria: '',
            metodoPago: '',
            observacion: '',
            detalleConcepto: [],

            messageWarning: ''
        })
    }

    render() {
        return (
            <>
                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>
                                <span role="button" onClick={() => this.props.history.goBack()}><i className="bi bi-arrow-left-short"></i></span> Cobro
                                <small className="text-secondary"> proceso</small>
                            </h5>
                        </div>
                    </div>
                </div>

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
                                        ref={this.refConcepto}>
                                        <option value="">-- seleccione --</option>
                                        {
                                            this.state.conceptos.map((item, index) => (
                                                <option key={index} value={item.value}>{item.name}</option>
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
                                        type="number"
                                        className="form-control"
                                        value={this.state.monto}
                                        ref={this.refMonto}
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
                                        placeholder="Ingrese el monto" />
                                    <button className="btn btn-outline-secondary ml-1" type="button" title="Agregar" onClick={() => this.addConcepto()}><i className="bi bi-plus-circle"></i></button>
                                </div>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-striped" style={{ borderWidth: '1px', borderStyle: 'outset', borderColor: '#CFA7C9' }}>
                                <thead>
                                    <tr>
                                        <th width="10%">#</th>
                                        <th width="50%">Concepto</th>
                                        <th width="20%">Monto</th>
                                        <th width="20%">Quitar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.detalleConcepto.map((item, index) => (
                                            <tr key={index}>
                                                <td>{++index}</td>
                                                <td>{item.concepto}</td>
                                                <td>{item.monto}</td>
                                                <td>
                                                    <button className="btn btn-outline-dark btn-sm" title="Eliminar" onClick={() => this.removerConcepto(item.id)}><i className="bi bi-trash"></i></button>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>

                            </table>
                        </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-12">
                        <div className="form-row">
                            <div className="form-group col-md-12">
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text"><i className="bi bi-person-fill"></i></div>
                                    </div>
                                    <select
                                        title="Clientes"
                                        className="form-control"
                                        value={this.state.cliente}
                                        ref={this.refCliente}
                                        onChange={(event) => {
                                            if (event.target.value.length > 0) {
                                                this.setState({
                                                    cliente: event.target.value,
                                                    messageWarning: '',
                                                });
                                            } else {
                                                this.setState({
                                                    cliente: event.target.value,
                                                    messageWarning: 'Seleccione el cliente',
                                                });
                                            }
                                        }}>
                                        <option value="">-- seleccione --</option>
                                        <option value="1">cliente 1 - 12345678</option>
                                        <option value="2">cliente 2 - 12345678</option>
                                        <option value="3">cliente 3 - 12345678</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group col-md-12">
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text"><i className="bi bi-bank"></i></div>
                                    </div>
                                    <select
                                        title="Caja o banco a depositar"
                                        className="form-control"
                                        value={this.state.cuentaBancaria}
                                        ref={this.refCuentaBancaria}
                                        onChange={(event) => {
                                            if (event.target.value.length > 0) {
                                                this.setState({
                                                    cuentaBancaria: event.target.value,
                                                    messageWarning: '',
                                                });
                                            } else {
                                                this.setState({
                                                    cuentaBancaria: event.target.value,
                                                    messageWarning: 'Seleccione el banco a depositar',
                                                });
                                            }
                                        }}>
                                        <option value="">-- seleccione --</option>
                                        <option value="1">BBVA - Cuenta de ahorros</option>
                                        <option value="2">BCP - Cuenta de ahorros</option>
                                        <option value="3">Pichincha - Cuenta de ahorros</option>
                                    </select>

                                </div>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group col-md-12">
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text"><i className="bi bi-credit-card-2-back"></i></div>
                                    </div>
                                    <select
                                        title="Metodo de pago"
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
                                                    messageWarning: 'Seleccione el metodo de pago',
                                                });
                                            }
                                        }}>
                                        <option value="">-- seleccione --</option>
                                        <option value="1">Efectivo</option>
                                        <option value="2">Consignación</option>
                                        <option value="3">Transferencia</option>
                                        <option value="4">Cheque</option>
                                        <option value="5">Tarjeta crédito</option>
                                        <option value="6">Tarjeta débito</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group col-md-12">
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text"><i className="bi bi-chat-dots-fill"></i></div>
                                    </div>
                                    <textarea
                                        title="Observaciones..."
                                        className="form-control"
                                        style={{ fontSize: '13px' }}
                                        value={this.state.observacion}
                                        ref={this.refObservacion}
                                        onChange={(event) => this.setState({ observacion: event.target.value, })}
                                        placeholder="Ingrese alguna observación">
                                    </textarea>
                                    {/* <input
                                        title="Observaciones..."
                                        type="text"
                                        className="form-control"
                                        value={this.state.observacion}
                                        ref={this.refObservacion}
                                        onChange={ (event) => this.setState({ observacion: event.target.value,}) }
                                        placeholder="Ingrese alguna observación" /> */}
                                </div>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group col-md-12">
                                <button type="button" className="btn btn-primary" onClick={() => this.save()}>Guardar</button>
                                {" "}
                                <button type="button" className="btn btn-secondary" onClick={() => this.props.history.goBack()}>Cerrar</button>
                            </div>
                        </div>
                        {
                            this.state.messageWarning === '' ? null :
                                <div className="alert alert-warning" role="alert">
                                    <i className="bi bi-exclamation-diamond-fill"></i> {this.state.messageWarning}
                                </div>
                        }

                    </div>
                </div>

            </>
        )
    }
}

export default CobroProceso