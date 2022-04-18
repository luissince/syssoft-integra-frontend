import React from 'react';
import axios from 'axios';
import { keyNumberFloat, keyNumberInteger, validateDate, isNumeric, readDataURL, getExtension, imageSizeData, spinnerLoading, showModal, clearModal, hideModal, currentDate } from '../../tools/Tools'
import noImage from '../../../recursos/images/noimage.jpg'

class VentaProceso extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

            lotes: [],
            precioContado: '',

            detalleLote: [],
            comprobantes: [],
            clientes: [],
            isContado: true,
            inicial: '',
            numeroCuotas: '',
            cuentasBancarias: [],
            imagen: noImage,
            extension: '',

            importeTotal: 0.00,
            letraMensual: 0.00,
            loading: true,
            messageWarning: '',
            msgLoading: 'Cargando datos...',

            classBtnContado: 'btn-primary',
            classBtnLetra: 'btn-secondary',
            classBoxContado: 'd-block',
            classBoxLetra: 'd-none'

        }

        this.refLote = React.createRef();
        this.refPrecioContado = React.createRef();
        this.refComprobante = React.createRef();
        this.refCliente = React.createRef();
        this.refInicial = React.createRef();
        this.refNumeroCuotas = React.createRef();
        this.refBanco = React.createRef();
        this.refFile = React.createRef();

        this.abortControllerView = new AbortController();
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    async componentDidMount() {
        this.refFile.current.addEventListener("change", (event) => {
            if (event.target.files.length !== 0) {
                this.setState({ imagen: URL.createObjectURL(event.target.files[0]) });
            } else {
                this.setState({ imagen: noImage });
                this.refFile.current.value = "";
            }
        });

        this.loadData()

        clearModal("modalVentaProceso", async () => {
            await this.setStateAsync({
                classBtnContado: 'btn-primary',
                classBtnLetra: 'btn-secondary',
                classBoxContado: 'd-block',
                classBoxLetra: 'd-none',
                inicial: '',
                numeroCuotas: '',
                letraMensual: 0.00,
                isContado: true
            });
            this.refBanco.current.value = ''

        });
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
            });

            const cuentaBancaria = await axios.get("/api/banco/listcombo", {
                signal: this.abortControllerView.signal,
            });

            await this.setStateAsync({
                comprobantes : comprobante.data,
                clientes: cliente.data,
                lotes: lote.data,
                cuentasBancarias: cuentaBancaria.data,
                loading: false,
            });


        } catch (error) {
            await this.setStateAsync({
                msgLoading: "Se produjo un error interno, intente nuevamente."
            });
        }
    }

    async onSaveProceso() {

        if (this.state.isContado) {
            if (this.refBanco.current.value === '') {
                this.refBanco.current.focus();
            } else {
                await this.save()
                await this.closeModal()
            }
        } else {
            if (!isNumeric(this.state.inicial) && this.state.inicial === '') {
                this.refInicial.current.focus()
            } else if (!isNumeric(this.state.numeroCuotas) && this.state.numeroCuotas === '') {
                this.refNumeroCuotas.current.focus()
            } else if (this.refBanco.current.value === '') {
                this.refBanco.current.focus();
            } else {
                await this.save()
                await this.closeModal()
            }
        }
    }

    async cargarImg() {
        let files = this.refFile.current.files;
        if (files.length !== 0) {
            let read = await readDataURL(files);
            let base64String = read.replace(/^data:.+;base64,/, '');
            let ext = getExtension(files[0].name);
            await this.setStateAsync({ image: base64String, extension: ext })
        } else {
            await this.setStateAsync({ image: "", extension: "" })
        }
    }

    async save() {
        try {
            // console.log(this.state.detalleLote)
            await this.cargarImg()

            return axios.post('/api/factura/add', {
                "idCliente": this.refCliente.current.value,
                "idUsuario": 'US0001',
                "idBanco": this.refBanco.current.value,
                "idComprobante": this.refComprobante.current.value,
                "idFormaPago": '',
                "tipoVenta": this.state.isContado ? 1 : 2,
                "inicial": this.state.isContado ? 0 : parseFloat(this.state.inicial),
                "numeroCuotas": this.state.isContado ? 0 : parseInt(this.state.numeroCuotas),
                "fechaCuotaInicial": this.state.isContado ? 0 : 1,
                "numeroContrato": 0,
                "codigoOperacion": '',
                "estado": this.state.isContado ? 1 : 2,
                "imagen": this.state.imagen,
                "extension": this.state.extension,
                "listaLotes": this.state.detalleLote,
            });
        }
        catch (error) {
            console.log(error)
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
            if (this.refLote.current.value == item.idLote) {
                nombreLote = item.nombreLote;
                nombreManzana = item.nombreManzana;
                precioContado = item.precio;
                break;
            }
        }

        let obj = {
            "id": this.refLote.current.value,
            "nombreLote": nombreLote,
            "nombreManzana": nombreManzana,
            "precioContado": precioContado
        }

        if (this.validarDuplicado(obj.id)) {
            this.setState({ messageWarning: 'No puede haber datos duplicados' })
            return;
        }

        let newArr = [...this.state.detalleLote, obj]
        let importeTotal = 0
        for (let item of newArr) {
            importeTotal = parseFloat(importeTotal) + parseFloat(item.precioContado)
        }

        this.setState({ detalleLote: newArr, messageWarning: '', precioContado: '', importeTotal: importeTotal });
        this.refLote.current.value = ''

    }

    validarDuplicado(id) {
        let value = false
        for (let item of this.state.detalleLote) {
            if (item.id == id) {
                value = true
                break;
            }
        }
        return value
    }

    removeObjectTable(id) {
        for (let i = 0; i < this.state.detalleLote.length; i++) {
            if (id === this.state.detalleLote[i].id) {
                this.state.detalleLote.splice(i, 1)
                i--;
                break;
            }
        }
        this.setState({ detalleLote: this.state.detalleLote })
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
        })
    }

    async openModal() {
        if (this.state.detalleLote.length <= 0) {
            this.setState({ messageWarning: "Agregar datos a la tabla" })
            this.refLote.current.focus()
        } else if (this.refComprobante.current.value === '') {
            this.setState({ messageWarning: "Seleccione el comprobante" })
            this.refComprobante.current.focus();
        } else if (this.refCliente.current.value === "") {
            this.setState({ messageWarning: "Seleccione el cliente" });
            this.refCliente.current.focus();
        } else {
            showModal('modalVentaProceso')
        }

    }

    async selectedContado() {

        await this.setStateAsync({
            classBtnContado: 'btn-primary', 
            classBtnLetra: 'btn-secondary', 
            classBoxContado: 'd-block', 
            classBoxLetra: 'd-none', 
            isContado: true,
            inicial: '',
            numeroCuotas: '',
            letraMensual: 0.00,
        })

    }

    async selectedLetra() {
        await this.setStateAsync({
            classBtnContado: 'btn-secondary', 
            classBtnLetra: 'btn-primary', 
            classBoxContado: 'd-none', 
            classBoxLetra: 'd-flex', 
            isContado: false,
        })
    }

    calcularLetraMensual() {
        if (this.state.inicial === '') {
            return;
        }
        if (this.state.numeroCuotas === '') {
            return;
        }

        let saldo = this.state.importeTotal - this.state.inicial
        let letra = saldo / this.state.numeroCuotas

        this.setState({ letraMensual: letra })
    }

    async closeModal() {
        hideModal('modalVentaProceso')
        await this.setStateAsync({
            detalleLote: [],
            precioContado: '',
            inicial: '',
            numeroCuotas: '',
            letraMensual: 0.00,
            importeTotal: 0.00,
            classBtnContado: 'btn-primary',
            classBtnLetra: 'btn-secondary',
            classBoxContado: 'd-block',
            classBoxLetra: 'd-none',
            isContado: true,
        })

        this.refLote.current.value = ''
        this.refComprobante.current.value = ''
        this.refCliente.current.value = ''
        this.refBanco.current.value = ''
    }

    render() {
        return (
            <>

                {/* Inicio modal */}
                <div className="modal fade" id="modalVentaProceso" data-bs-keyboard="false" data-bs-backdrop="static">
                    <div className="modal-dialog modal-md">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Comletar venta</h5>
                                <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">

                                <div className="row">
                                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                                        <div className="text-center">
                                            <h3>TOTAL A PAGAR: <span>S/ {this.state.importeTotal}</span></h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-4 col-sm-4">
                                        <hr />
                                    </div>
                                    <div className="col-md-4 col-sm-4 d-flex align-items-center justify-content-center">
                                        <h6 className="mb-0">Tipos de pagos</h6>
                                    </div>
                                    <div className="col-md-4 col-sm-4">
                                        <hr />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 col-sm-6">
                                        <button className={`btn ${this.state.classBtnContado} btn-block`} type="button" title="Pago al contado" onClick={() => this.selectedContado()}>
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <i className="bi bi-cash-coin fa-2x"></i>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <label>Contado</label>
                                            </div>
                                        </button>
                                    </div>
                                    <div className="col-md-6 col-sm-6">
                                        <button className={`btn ${this.state.classBtnLetra} btn-block`} type="button" title="Pago al credito" onClick={() => this.selectedLetra()}>
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <i className="bi bi-boxes fa-2x"></i>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <label>Crédito</label>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <br />

                                <div className={`row ${this.state.classBoxContado}`}>
                                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                                        <div className="justify-content-center">
                                            <div className="text-center">
                                                {/* Eligio pago al contado. */}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`row ${this.state.classBoxLetra}`}>
                                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">

                                        <div className="form-group">
                                            <div className="input-group">
                                                <div className="input-group-prepend">
                                                    <div className="input-group-text"><i className="bi bi-tag-fill"></i></div>
                                                </div>
                                                <input
                                                    title="Monto inicial"
                                                    type="text"
                                                    className="form-control"
                                                    placeholder='Monto inicial'
                                                    ref={this.refInicial}
                                                    value={this.state.inicial}
                                                    onChange={(event) => this.setState({ inicial: event.target.value }, () => {
                                                        this.calcularLetraMensual()
                                                    })}
                                                    onKeyPress={keyNumberFloat} />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <div className="input-group">
                                                <div className="input-group-prepend">
                                                    <div className="input-group-text"><i className="bi bi-hourglass-split"></i></div>
                                                </div>
                                                <input
                                                    title="Número de letras"
                                                    type="text"
                                                    className="form-control"
                                                    placeholder='Número de letras'
                                                    ref={this.refNumeroCuotas}
                                                    value={this.state.numeroCuotas}
                                                    onChange={(event) => this.setState({ numeroCuotas: event.target.value }, () => {
                                                        this.calcularLetraMensual()
                                                    })}
                                                    onKeyPress={keyNumberFloat} />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <div className="input-group">
                                                <div className="input-group-prepend">
                                                    <div className="input-group-text"><i className="bi bi-coin"></i></div>
                                                </div>
                                                <input
                                                    title="Letra mensual"
                                                    type="text"
                                                    className="form-control"
                                                    placeholder='0.00'
                                                    disabled={true}
                                                    value={this.state.letraMensual}
                                                    onChange={(event) => this.setState({ letraMensual: event.target.value })}
                                                    onKeyPress={keyNumberFloat} />
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                                        <div className="form-row">
                                            <div className="form-group col-md-12">
                                                <div className="input-group">
                                                    <div className="input-group-prepend">
                                                        <div className="input-group-text"><i className="bi bi-bank"></i></div>
                                                    </div>
                                                    <select
                                                        title="Lista de caja o banco a depositar"
                                                        className="form-control"
                                                        ref={this.refBanco}>
                                                        <option value="">-- seleccione --</option>
                                                        {
                                                            this.state.cuentasBancarias.map((item, index) => (
                                                                <option key={index} value={item.idBanco}>{item.nombre + " - " + item.tipoCuenta}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => this.onSaveProceso()}>Completar venta</button>
                                <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* fin modal */}

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
                        <div className="table-responsive">
                            <table className="table table-striped" style={{ borderWidth: '1px', borderStyle: 'outset', borderColor: '#CFA7C9' }}>
                                <thead>
                                    <tr>
                                        <th width="10%">#</th>
                                        <th width="50%">Descripción (Lote - Manzana) </th>
                                        <th width="30%">Precio </th>
                                        <th width="10%">Quitar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.detalleLote.length === 0 ? (
                                            <tr className="text-center">
                                                <td colSpan="4"> Agregar datos a la tabla </td>
                                            </tr>
                                        ) : (
                                            this.state.detalleLote.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{++index}</td>
                                                    <td>{`${item.nombreLote} / ${item.nombreManzana}`}</td>
                                                    <td>{item.precioContado}</td>
                                                    <td>
                                                        <button className="btn btn-outline-dark btn-sm" title="Eliminar" onClick={() => this.removeObjectTable(item.id)}><i className="bi bi-trash"></i></button>
                                                    </td>
                                                </tr>
                                            ))
                                        )
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-12">

                        <div className="form-row">
                            <div className="form-group col-md-12">
                                <button className="btn btn-success btn-block" onClick={() => this.openModal()}>
                                    <div className="row justify-content-center align-items-center p-2">
                                        <div className="col-md-6 col-sm-6 col-6 text-left">
                                            <span className="text-white h6">COBRAR (F1)</span>
                                        </div>
                                        <div className="col-md-6 col-sm-6 col-6 text-right">
                                            <span className="text-white h5">S/ {this.state.importeTotal}</span>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group col-md-12">
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text"><i className="bi bi-receipt"></i></div>
                                    </div>
                                    <select
                                        title="Comprobantes de venta"
                                        className="form-control"
                                        ref={this.refComprobante}>
                                        <option value="">-- seleccione --</option>
                                        {
                                            this.state.comprobantes.map((item, index) => (
                                                <option key={index} value={item.idComprobante}>{item.nombre}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group col-md-12">
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text"><i className="bi bi-person-fill"></i></div>
                                    </div>
                                    <select
                                        title="Lista de clientes"
                                        className="form-control"
                                        ref={this.refCliente}>
                                        <option value="">-- seleccione --</option>
                                        {
                                            this.state.clientes.map((item, index) => (
                                                <option key={index} value={item.idCliente}>{item.infoCliente + " - " + item.numDocumento}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group col-md-12">
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
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                        <div className="form-row">
                            <div className='col-lg-8 col-md-8 col-sm-12 col-xs-12'>
                                <div className="form-group">
                                    <label>Voucher Imagen</label>
                                    <input type="file" className="form-control-file" accept="image/png, image/jpeg, image/gif, image/svg" ref={this.refFile}></input>
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-12 col-xs-12 bg-light'>
                                <img src={this.state.imagen} alt="" className="card-img-top" />
                            </div>
                        </div>
                    </div>
                </div>

            </>
        );
    }
}

export default VentaProceso;