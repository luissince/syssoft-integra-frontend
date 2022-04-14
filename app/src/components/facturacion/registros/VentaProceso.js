import React from 'react';
import axios from 'axios';
import { keyNumberFloat, keyNumberInteger, validateDate, isNumeric, readDataURL, getExtension, imageSizeData, spinnerLoading } from '../../tools/Tools'
import noImage from '../../../recursos/images/noimage.jpg'

class VentaProceso extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

            //datos
            clientes: [],
            fechaVenta: '',
            tipoVenta: '',
            inicial: '',
            numeroCuotas: '',

            //detalle
            lotes: [],
            precioContado: '',

            //convenio
            idVendedor: '',
            idBanco: '',
            fechaPrimeraCuota: '',
            numeroContato: '1',

            //comprobante
            comprobantes: [
                { "idComprobante": 1, "nombre": "NOTA DE VENTA" },
                { "idComprobante": 2, "nombre": "BOLETA" },
                { "idComprobante": 3, "nombre": "FACTURA" }
            ],
            idComprobante: '',
            idFormaPago: '',
            codigoOperacion: '',
            imagen: noImage,
            extension: '',

            detalleLote: [],
            loading: true,
            messageWarning: '',
            msgLoading: 'Cargando datos...'
        }

        this.refCliente = React.createRef();

        this.refFechaVenta = React.createRef();
        this.refTipoVenta = React.createRef();
        this.refInicial = React.createRef();
        this.refNumeroCuotas = React.createRef();

        this.refLote = React.createRef();
        this.refPrecioContado = React.createRef();

        this.refVendedor = React.createRef();
        this.refBanco = React.createRef();
        this.refFechaPrimeraCuota = React.createRef();

        this.refComprobante = React.createRef();
        this.refFormaPago = React.createRef();
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
    }

    componentWillUnmount() {
        this.abortControllerView.abort();
    }

    loadData = async () => {
        try {

            const cliente = await axios.get("/api/cliente/listcombo", {
                signal: this.abortControllerView.signal,
            });

            const lote = await axios.get("/api/lote/listcombo", {
                signal: this.abortControllerView.signal,
            });


            // const cuentaBancaria = await axios.get("/api/banco/listcombo", {
            //     signal: this.abortControllerView.signal,
            // });

            await this.setStateAsync({
                clientes: cliente.data,
                lotes: lote.data,
                // cuentasBancarias: cuentaBancaria.data,
                loading: false,
            });


        } catch (error) {
            await this.setStateAsync({
                msgLoading: "Se produjo un error interno, intente nuevamente."
            });
        }
    }

    async onSaveProceso() {
        if (this.refCliente.current.value === "") {
            this.setState({ messageWarning: "Seleccione al cliente." })
            this.onFocusTab("datos-tab", "datos");
            this.refCliente.current.focus();
        } else if (!validateDate(this.state.fechaVenta)) {
            this.setState({ messageWarning: "Ingrese la fecha de venta." });
            this.onFocusTab("datos-tab", "datos");
            this.refFechaVenta.current.focus();
        } else if (this.state.tipoVenta === "") {
            this.setState({ messageWarning: "Seleccione el tipo de venta." });
            this.onFocusTab("datos-tab", "datos");
            this.refTipoVenta.current.focus();
        } else if (this.state.tipoVenta === "2" && !isNumeric(this.state.inicial)) {
            this.setState({ messageWarning: "Ingrese la cuota inicial." });
            this.onFocusTab("datos-tab", "datos");
            this.refInicial.current.focus();
        } else if (this.state.tipoVenta === "2" && !isNumeric(this.state.numeroCuotas)) {
            this.setState({ messageWarning: "Ingrese el n° de cuotas." });
            this.onFocusTab("datos-tab", "datos");
            this.refNumeroCuotas.current.focus();
        }

        else if (this.refLote.current.value === "") {
            this.setState({ messageWarning: "Seleccione el lote." });
            this.onFocusTab("detalle-tab", "detalle");
            this.refLote.current.focus();
        } else if (!isNumeric(this.state.precioContado)) {
            this.setState({ messageWarning: "Ingrese el precio de venta a contado." });
            this.onFocusTab("detalle-tab", "detalle");
            this.refPrecioContado.current.focus();
        } else if (this.state.idVendedor === "") {
            this.setState({ messageWarning: "Seleccione al vendedor." });
            this.onFocusTab("convenio-tab", "convenio");
            this.refVendedor.current.focus();
        } else if (this.state.idBanco === "") {
            this.setState({ messageWarning: "Seleccione de pago de la primera cuota." });
            this.onFocusTab("convenio-tab", "convenio");
            this.refBanco.current.focus();
        } else if (!validateDate(this.state.fechaPrimeraCuota)) {
            this.setState({ messageWarning: "Ingrese la fecha de la primera cuota." });
            this.onFocusTab("convenio-tab", "convenio");
            this.refFechaPrimeraCuota.current.focus();
        } else if (this.state.idComprobante === "") {
            this.setState({ messageWarning: "Seleccione un comprobante." });
            this.onFocusTab("comprobante-tab", "comprobante");
            this.refComprobante.current.focus();
        } else if (this.state.idFormaPago === "") {
            this.setState({ messageWarning: "Seleccione la forma de pago." });
            this.onFocusTab("comprobante-tab", "comprobante");
            this.refFormaPago.current.focus();
        } else {
            try {
                let files = this.refFile.current.files;
                if (files.length !== 0) {
                    let read = await readDataURL(files);
                    let base64String = read.replace(/^data:.+;base64,/, '');
                    let ext = getExtension(files[0].name);
                    let result = await this.saveProject(base64String, ext);
                    console.log(result);
                } else {
                    let result = await this.saveProject("", "");
                    console.log(result);
                }
            } catch (error) {
                console.log(error)
            }
        }
    }

    saveProject(image, extension) {
        return axios.post('/api/factura/add', {
            "idVenta": "",
            "idCliente": this.refCliente.current.value,
            "tipoVenta": this.state.tipoVenta,
            "inicial": this.state.tipoVenta === "1" ? 0 : this.state.inicial,
            "numeroCuotas": this.state.tipoVenta === "1" ? 0 : this.state.numeroCuotas,

            "idLote": this.refLote.current.value,
            "precioContado": this.state.precioContado,

            "idVendedor": this.state.idVendedor,
            "idBanco": this.state.idBanco,
            "fechaPrimeraCuota": this.state.fechaPrimeraCuota,
            "numeroContrato": this.state.numeroContato,

            "idComprobante": this.state.idComprobante,
            "idFormaPago": this.state.idFormaPago,
            "codigoOperacion": this.state.codigoOperacion,

            "imagen": image,
            "extension": extension,

            "fecha": this.state.fechaVenta,
            "hora": "",
        });
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
                precioContado = item.precioContado;
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

        this.setState({ detalleLote: newArr, messageWarning: '', precioContado: '' });
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

    onFocusTab(idTab, idContent) {
        if (!document.getElementById(idTab).classList.contains('active')) {
            for (let child of document.getElementById('myTab').childNodes) {
                child.childNodes[0].classList.remove('active')
            }
            for (let child of document.getElementById('myTabContent').childNodes) {
                child.classList.remove('show', 'active')
            }
            document.getElementById(idTab).classList.add('active');
            document.getElementById(idContent).classList.add('show', 'active');
        }
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
                                        <div className="input-group-text"><i className="bi bi-cash-coin"></i></div>
                                    </div>
                                    <input
                                        title="Precio de venta"
                                        type="text"
                                        className="form-control"
                                        placeholder='0.00'
                                        ref={this.refPrecioContado}
                                        value={this.state.precioContado}
                                        onChange={(event) => {
                                            console.log(event.target.value)
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
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text"><i className="bi bi-receipt"></i></div>
                                    </div>
                                    <select
                                        title="Comprobante de venta"
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

                {""}

                <ul className="nav nav-tabs" id="myTab" role="tablist">
                    <li className="nav-item" role="presentation">
                        <a className="nav-link active" id="datos-tab" data-bs-toggle="tab" href="#datos" role="tab" aria-controls="datos" aria-selected="true"><i className="bi bi-info-circle"></i> Datos</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id="detalle-tab" data-bs-toggle="tab" href="#detalle" role="tab" aria-controls="detalle" aria-selected="false"><i className="bi bi-ticket-detailed-fill"></i> Detalle</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id="convenio-tab" data-bs-toggle="tab" href="#convenio" role="tab" aria-controls="convenio" aria-selected="false"><i className="bi bi-file-earmark-person-fill"></i> Convenio</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id="comprobante-tab" data-bs-toggle="tab" href="#comprobante" role="tab" aria-controls="comprobante" aria-selected="false"><i className="bi bi-file-text-fill"></i> Comprobante</a>
                    </li>
                </ul>

                <div className="tab-content pt-2" id="myTabContent">
                    <div className="tab-pane fade show active" id="datos" role="tabpanel" aria-labelledby="datos-tab">
                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                            <div className="form-group">
                                <label>Cliente</label>
                                <select
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
                            <div className="form-group">
                                <label htmlFor="fechaVenta">Fecha Venta</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    id="fechaVenta"
                                    ref={this.refFechaVenta}
                                    value={this.state.fechaVenta}
                                    onChange={(event) => {
                                        if (event.target.value.trim().length > 0) {
                                            this.setState({
                                                fechaVenta: event.target.value,
                                                messageWarning: '',
                                            });
                                        } else {
                                            this.setState({
                                                fechaVenta: event.target.value,
                                                messageWarning: 'Ingrese la fecha de venta',
                                            });
                                        }
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="tipoVenta">Tipo de Venta</label>
                                <select
                                    className="form-control"
                                    id="tipoVenta"
                                    ref={this.refTipoVenta}
                                    value={this.state.tipoVenta}
                                    onChange={(event) => {
                                        if (event.target.value.trim().length > 0) {
                                            this.setState({
                                                tipoVenta: event.target.value,
                                                messageWarning: '',
                                            });
                                        } else {
                                            this.setState({
                                                tipoVenta: event.target.value,
                                                messageWarning: 'Seleccione el tipo de venta.',
                                            });
                                        }
                                    }

                                    }>
                                    <option value="">- Seleccione -</option>
                                    <option value="1">Contado</option>
                                    <option value="2">Credito</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="inicial">Inicial (S/)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="inicial"
                                    ref={this.refInicial}
                                    placeholder='####.##'
                                    value={this.state.inicial}
                                    onChange={(event) => {
                                        if (event.target.value.trim().length > 0) {
                                            this.setState({
                                                inicial: event.target.value,
                                                messageWarning: '',
                                            });
                                        } else {
                                            this.setState({
                                                inicial: event.target.value,
                                                messageWarning: 'Ingrese el monto inicial',
                                            });
                                        }
                                    }}
                                    disabled={this.state.tipoVenta === "1" ? true : false}
                                    onKeyPress={keyNumberFloat} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="cuotas">N° de Cuotas</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="cuotas"
                                    placeholder='0'
                                    ref={this.refNumeroCuotas}
                                    value={this.state.numeroCuotas}
                                    onChange={(event) => {
                                        if (event.target.value.trim().length > 0) {
                                            this.setState({
                                                numeroCuotas: event.target.value,
                                                messageWarning: '',
                                            });
                                        } else {
                                            this.setState({
                                                numeroCuotas: event.target.value,
                                                messageWarning: 'Ingrese el n° de cuotas',
                                            });
                                        }
                                    }}
                                    disabled={this.state.tipoVenta === "1" ? true : false}
                                    onKeyPress={keyNumberInteger} />
                            </div>
                        </div>
                    </div>
                    <div className="tab-pane fade" id="detalle" role="tabpanel" aria-labelledby="detalle-tab">
                        <div className="form-row">
                            <div className="form-group col-md-6">
                                <label>Lote</label>

                            </div>
                            <div className="form-group col-md-6">
                                <label>Precio Venta Contado</label>
                                <div className="d-flex">

                                    <button className="btn btn-outline-secondary ml-1" type="button" title="Agregar" onClick={() => this.addObjectTable()}><i className="bi bi-plus-circle"></i></button>
                                </div>
                            </div>
                        </div>
                        <div className='form-row'>
                            <div className='form-group col-md-12'>
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
                        </div>
                    </div>
                    <div className="tab-pane fade" id="convenio" role="tabpanel" aria-labelledby="convenio-tab">
                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                            <div className="form-group">
                                <label htmlFor="cliente">Vendedor</label>
                                <select
                                    className="form-control"
                                    id="cliente"
                                    ref={this.refVendedor}
                                    value={this.state.idVendedor}
                                    onChange={(event) => {
                                        if (event.target.value.trim().length > 0) {
                                            this.setState({
                                                idVendedor: event.target.value,
                                                messageWarning: '',
                                            });
                                        } else {
                                            this.setState({
                                                idVendedor: event.target.value,
                                                messageWarning: 'Seleccione al vendedor.',
                                            });
                                        }
                                    }}
                                >
                                    <option value="">- Seleccione -</option>
                                    <option value="VD0001">VENDEDOR POR DEFECTO</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="fechaVenta">Deposito en Banco</label>
                                <select
                                    className="form-control"
                                    id="depositoBanco"
                                    value={this.state.idBanco}
                                    ref={this.refBanco}
                                    onChange={(event) => {
                                        if (event.target.value.trim().length > 0) {
                                            this.setState({
                                                idBanco: event.target.value,
                                                messageWarning: '',
                                            });
                                        } else {
                                            this.setState({
                                                idBanco: event.target.value,
                                                messageWarning: 'Seleccione de pago de la primera cuota.',
                                            });
                                        }
                                    }}
                                >
                                    <option value="">-- seleccione --</option>
                                    <option value="BC0001">BANCO SELECCIONADO</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="tipoVenta">Fecha Pago Primera Cuota</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    id="fechaPagoPrimeraCuota"
                                    ref={this.refFechaPrimeraCuota}
                                    value={this.state.fechaPrimeraCuota}
                                    onChange={(event) => {
                                        if (event.target.value.trim().length > 0) {
                                            this.setState({
                                                fechaPrimeraCuota: event.target.value,
                                                messageWarning: '',
                                            });
                                        } else {
                                            this.setState({
                                                fechaPrimeraCuota: event.target.value,
                                                messageWarning: 'Ingrese la fecha de la primera cuota.',
                                            });
                                        }
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="inicial">N° Contrato</label>
                                <input type="number" className="form-control" id="inicial" placeholder='Por Generar..' readOnly />
                            </div>
                        </div>
                    </div>
                    <div className="tab-pane fade" id="comprobante" role="tabpanel" aria-labelledby="comprobante-tab">
                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                            <div className='row'>
                                <div className='col-lg-8 col-md-8 col-sm-12 col-xs-12'>
                                    <div className="form-group">
                                        <label htmlFor="cliente">Comprobante</label>

                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="tipoVenta">Forma de Pago</label>
                                        <select
                                            className="form-control"
                                            id="formaPago"
                                            ref={this.refFormaPago}
                                            value={this.state.idFormaPago}
                                            onChange={(event) => {
                                                if (event.target.value.trim().length > 0) {
                                                    this.setState({
                                                        idFormaPago: event.target.value,
                                                        messageWarning: '',
                                                    });
                                                } else {
                                                    this.setState({
                                                        idFormaPago: event.target.value,
                                                        messageWarning: 'Seleccione la forma de pago.',
                                                    });
                                                }
                                            }}
                                        >
                                            <option value=""> -- seleccione -- </option>
                                            <option value="FP0001">FORMA DE PAGO POR DEFECTO</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="inicial">Código de Operación</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="inicial"
                                            placeholder='ej: 12345 - 09/03-2022'
                                            value={this.state.codigoOperacion}
                                            onChange={(event) => this.setState({ codigoOperacion: event.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="inicial">Voucher Imagen</label>
                                        <input type="file" className="form-control-file" accept="image/png, image/jpeg, image/gif, image/svg" ref={this.refFile}></input>
                                    </div>
                                </div>
                                <div className='col-lg-4 col-md-4 col-sm-12 col-xs-12 bg-light'>
                                    <img src={this.state.imagen} alt="" className="card-img-top" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <button type="button" className="btn btn-primary mr-2" onClick={() => this.onSaveProceso()}>Guardar</button>
                    <button type="button" className="btn btn-secondary" onClick={() => this.props.history.goBack()}>Cancelar</button>
                </div>
            </>
        );
    }
}

export default VentaProceso;