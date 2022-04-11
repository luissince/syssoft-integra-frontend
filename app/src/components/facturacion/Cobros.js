import React from 'react';
import axios from 'axios';
import loading from '../../recursos/images/loading.gif';
import { showModal, hideModal, clearModal, isNumeric } from '../tools/Tools';

class Cobros extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idCobro: '',
            cliente: '',
            depositoBanco: '',
            metodoPago: '',
            cuotaMensual: '',
            fecha: '',
            concepto: '',
            monto: '',

            conceptos: [
                { "value": 1, "name": "Mora por retraso de pago" },
                { "value": 2, "name": "Cuota Mensual" }
            ],

            detalleConcepto: [],

            loading: true,
            lista: [],
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messagePaginacion: '',
            messageWarning: ''
        }

        this.refCliente = React.createRef()
        this.refDepositoBanco = React.createRef()
        this.refMetodoPago = React.createRef()
        this.refConcepto = React.createRef()
        this.refMonto = React.createRef()

    }

    async componentDidMount() {
        this.fillTable(0, 1, "");

        clearModal("modalCobro", () => {
            this.setState({
                cliente: '',
                depositoBanco: '',
                metodoPago: '',
                cuotaMensual: '',
                fecha: '',
                concepto: '',
                monto: '',

                idCobro: '',
                messageWarning: ''
            })
        })
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    fillTable = async (option, paginacion, buscar) => {
        // console.log(buscar.trim().toUpperCase())
        try {
            await this.setStateAsync({ loading: true, paginacion: paginacion, lista: [] });
            const result = await axios.get('/api/cobro/list', {
                params: {
                    "option": option,
                    "buscar": buscar.trim().toUpperCase(),
                    "posicionPagina": ((this.state.paginacion - 1) * this.state.filasPorPagina),
                    "filasPorPagina": this.state.filasPorPagina
                }
            });

            let totalPaginacion = parseInt(Math.ceil((parseFloat(result.data.total) / this.state.filasPorPagina)));
            let messagePaginacion = `Mostrando ${result.data.result.length} de ${totalPaginacion} Páginas`;

            this.setState({
                loading: false,
                lista: result.data.result,
                totalPaginacion: totalPaginacion,
                messagePaginacion: messagePaginacion
            });
            // console.log(result);
        } catch (err) {
            console.log(err.response.data.message)
            console.log(err.response.status)
        }
    }

    loadDataId = async (id) => {
        try {
            const result = await axios.get("/api/cobro/id", {
                params: {
                    idCobro: id
                }
            });
            // console.log(result)
            this.setState({
                cliente: result.data.cliente,
                depositoBanco: result.data.depositoBanco,
                metodoPago: result.data.metodoPago,
                cuotaMensual: result.data.cuotaMensual,
                fecha: result.data.fecha,
                concepto: result.data.concepto,
                monto: result.data.monto,

                idCobro: result.data.idCobro
            });

        } catch (error) {
            console.log(error.response)
        }
    }

    async save() {

        if (this.state.cliente === "") {
            this.setState({ messageWarning: "Seleccione el cliente" });
            this.onFocusTab("cuota-tab", "cuota");
            this.refCliente.current.focus();
        } else if (this.state.depositoBanco === "") {
            this.setState({ messageWarning: "Seleccione el banco a depositar" })
            this.onFocusTab("cuota-tab", "cuota");
            this.refDepositoBanco.current.focus();
        } else if (this.state.metodoPago === "") {
            this.setState({ messageWarning: "Seleccione la metodo de pago" })
            this.onFocusTab("cuota-tab", "cuota");
            this.refMetodoPago.current.focus();
        }

        else {

            try {

                let result = null
                if (this.state.idCobro !== '') {
                    result = await axios.post('/api/cobro/update', {
                        //concepto
                        "cliente": this.state.cliente,
                        "depositoBanco": this.state.depositoBanco,
                        "metodoPago": this.state.metodoPago,
                        "cuotaMensual": this.state.cuotaMensual.toString().trim(),
                        "fecha": this.state.fecha,

                        "concepto": '',
                        "monto": '',

                        //id
                        "idCobro": this.state.idCobro
                    })

                } else {
                    result = await axios.post('/api/cobro/add', {
                        //concepto
                        "cliente": this.state.cliente,
                        "depositoBanco": this.state.depositoBanco,
                        "metodoPago": this.state.metodoPago,
                        "cuotaMensual": this.state.cuotaMensual.toString().trim(),
                        "fecha": this.state.fecha,

                        "concepto": '',
                        "monto": ''
                    });
                }

                this.closeModal()

            } catch (error) {
                console.log(error)
                console.log(error.response)
            }
        }

    }

    openModal(id) {
        if (id === '') {
            showModal('modalCobro')
            this.onFocusTab("cuota-tab", "cuota");
            this.refCliente.current.focus();
        }
        else {
            showModal('modalCobro')
            this.onFocusTab("cuota-tab", "cuota");
            this.loadDataId(id)
        }
    }

    closeModal() {
        hideModal('modalCobro')
        this.setState({
            cliente: '',
            depositoBanco: '',
            metodoPago: '',
            cuotaMensual: '',
            fecha: '',
            concepto: '',
            monto: '',

            idCobro: '',
            messageWarning: ''
        })
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

    addConcepto() {
        // console.log('entro')
        // console.log(this.refConcepto.current.value)
        if (this.refConcepto.current.value === '') {
            this.refConcepto.current.focus();
            return;
        }
        if (!isNumeric(this.state.monto)) {
            this.refMonto.current.focus();
            return;
        }

        if (this.state.monto <= 0) {
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

        let newArr = [...this.state.detalleConcepto, obj]
        this.setState({ detalleConcepto: newArr });
    }

    removerConcepto(id) {

        for (let i = 0; i < this.state.detalleConcepto.length; i++) {
            console.log(this.state.detalleConcepto[i].id)
            if (id === this.state.detalleConcepto[i].id) {
                this.state.detalleConcepto.splice(i, 1)
                i--;
                break;
            }
        }

        this.setState({ detalleConcepto: this.state.detalleConcepto })

    }

    render() {
        return (
            <>
                {/* Inicio modal*/}
                <div className="modal fade" id="modalCobro" tabIndex="-1" aria-labelledby="modalCobroLabel" aria-hidden="true">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{this.state.idCobro === '' ? " Registrar Cobro" : " Editar Cobro"}</h5>
                                <button type="button" className="close" data-dismiss="modal" onClick={() => this.closeModal()}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {/* <nav>
                                    <div className="nav nav-tabs" id="myTab" role="tablist">
                                        <a className="nav-link active" id="cuota-tab" data-bs-toggle="tab" href="#cuota" role="tab" aria-controls="cuota" aria-selected="true">
                                            <i className="bi bi-info-circle"></i> Cuota Mensual
                                        </a>
                                        <a className="nav-link" id="concepto-tab" data-bs-toggle="tab" href="#concepto" role="tab" aria-controls="concepto" aria-selected="false">
                                            <i className="bi bi-person-workspace"></i> Añadir Conceptos
                                        </a>
                                    </div>
                                </nav> */}

                                <ul className="nav nav-tabs" id="myTab" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <a className="nav-link active" id="cuota-tab" data-bs-toggle="tab" href="#cuota" role="tab" aria-controls="cuota" aria-selected="true">
                                            <i className="bi bi-info-circle"></i> Cuota
                                        </a>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <a className="nav-link" id="concepto-tab" data-bs-toggle="tab" href="#concepto" role="tab" aria-controls="concepto" aria-selected="false">
                                            <i className="bi bi-person-workspace"></i> Conceptos
                                        </a>
                                    </li>
                                </ul>

                                {
                                    this.state.messageWarning === '' ? null :
                                        <div className="alert alert-warning" role="alert">
                                            <i className="bi bi-exclamation-diamond-fill"></i> {this.state.messageWarning}
                                        </div>
                                }

                                <div className="tab-content mt-2" id="myTabContent">
                                    <div className="tab-pane fade show active" id="cuota" role="tabpanel" aria-labelledby="cuota-tab">

                                        <div className="form-row">
                                            <div className="form-group col-md-12">
                                                <label>Cliente</label>
                                                <div className="input-group">
                                                    <select
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
                                            <div className="form-group col-md-6">
                                                <label>Banco a depositar</label>
                                                <div className="input-group">
                                                    <select
                                                        className="form-control"
                                                        value={this.state.depositoBanco}
                                                        ref={this.refDepositoBanco}
                                                        onChange={(event) => {
                                                            if (event.target.value.length > 0) {
                                                                this.setState({
                                                                    depositoBanco: event.target.value,
                                                                    messageWarning: '',
                                                                });
                                                            } else {
                                                                this.setState({
                                                                    depositoBanco: event.target.value,
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
                                            <div className="form-group col-md-6">
                                                <label>Metodo de Pago</label>
                                                <div className="input-group">
                                                    <select
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
                                                                    messageWarning: 'Seleccione la metodo de pago',
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

                                    </div>
                                    <div className="tab-pane fade" id="concepto" role="tabpanel" aria-labelledby="concepto-tab">

                                        <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <label>Concepto</label>
                                                <div className="input-group">
                                                    <select
                                                        className="form-control"
                                                        // value={this.state.concepto}
                                                        ref={this.refConcepto}
                                                    // onChange={(event) => {
                                                    //     if (event.target.value.length > 0) {
                                                    //         this.setState({
                                                    //             concepto: event.target.value,
                                                    //             messageWarning: '',
                                                    //         });
                                                    //     } else {
                                                    //         this.setState({
                                                    //             concepto: event.target.value,
                                                    //             messageWarning: 'Seleccione el concepto',
                                                    //         });
                                                    //     }
                                                    // }}
                                                    >
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
                                                <label>Monto</label>
                                                <div className="input-group">
                                                    <input
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
                                                    <button className="btn btn-outline-secondary ml-1" type="button" onClick={() => this.addConcepto()}><i className="bi bi-plus-circle"></i> Agregar</button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                                <div className="table-responsive">
                                                    <table className="table table-striped" style={{ borderWidth: '1px', borderStyle: 'inset', borderColor: '#CFA7C9' }}>
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
                                                                        <td>1</td>
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
                                        </div>

                                    </div>
                                </div>

                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => this.save()}>Guardar</button>
                                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => this.closeModal()}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* fin modal*/}

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Cobros <small className="text-secondary">LISTA</small></h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            <div className="input-group mb-2">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-search"></i></div>
                                </div>
                                <input type="search" className="form-control" placeholder="Buscar..." onKeyUp={(event) => console.log(event.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            <button className="btn btn-outline-info" onClick={() => this.openModal(this.state.idCobro)}>
                                <i className="bi bi-file-plus"></i> Nuevo Registro
                            </button>
                            {" "}
                            <button className="btn btn-outline-secondary" onClick={() => this.fillTable(0, 1, "")}>
                                <i className="bi bi-arrow-clockwise"></i>
                            </button>

                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="table-responsive">
                            <table className="table table-striped" style={{ borderWidth: '1px', borderStyle: 'inset', borderColor: '#CFA7C9' }}>
                                <thead>
                                    <tr>
                                        <th width="5%">#</th>
                                        <th width="15%">Cliente</th>
                                        <th width="10%">Cuota</th>
                                        <th width="15%">Comp.</th>
                                        <th width="10%">Tipo</th>
                                        <th width="15%">Fecha</th>
                                        <th width="5%">R.D.</th>
                                        <th width="5%">Vaucher</th>
                                        <th width="15%">Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.loading ? (
                                            <tr>
                                                <td className="text-center" colSpan="9">
                                                    <img
                                                        src={loading}
                                                        id="imgLoad"
                                                        width="34"
                                                        height="34"
                                                        alt="Loader"
                                                    />
                                                    <p>Cargando información...</p>
                                                </td>
                                            </tr>
                                        ) : this.state.lista.length === 0 ? (
                                            <tr className="text-center">
                                                <td colSpan="9">¡No hay datos registrados!</td>
                                            </tr>
                                        ) : (
                                            this.state.lista.map((item, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td>{item.id}</td>
                                                        <td>{item.nombres + ' ' + item.apellidos}</td>
                                                        <td>{item.telefono}</td>
                                                        <td>{item.email}</td>
                                                        <td>{item.perfil}</td>
                                                        <td>{item.empresa}</td>
                                                        <td className="text-center"><div className={`badge ${item.estado === 1 ? "badge-info" : "badge-danger"}`}>{item.estado === 1 ? "ACTIVO" : "INACTIVO"}</div></td>
                                                        <td>
                                                            <button className="btn btn-outline-dark btn-sm" title="Editar" onClick={() => this.openModal(item.idCobro)}><i className="bi bi-pencil"></i></button>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )
                                    }
                                </tbody>

                            </table>
                        </div>
                        <div className="col-md-12" style={{ textAlign: 'center' }}>
                            <nav aria-label="...">
                                <ul className="pagination justify-content-end">
                                    <li className="page-item disabled">
                                        <a className="page-link">Previous</a>
                                    </li>
                                    <li className="page-item"><a className="page-link" href="#">1</a></li>
                                    <li className="page-item active" aria-current="page">
                                        <a className="page-link" href="#">2</a>
                                    </li>
                                    <li className="page-item"><a className="page-link" href="#">3</a></li>
                                    <li className="page-item">
                                        <a className="page-link" href="#">Next</a>
                                    </li>
                                </ul>
                            </nav>
                        </div>

                    </div>
                </div>
            </>
        );
    }
}

export default Cobros;