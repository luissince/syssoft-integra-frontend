import React from 'react';
import axios from 'axios';
import loading from '../../recursos/images/loading.gif';
import { showModal, hideModal, clearModal } from '../tools/Tools';

class Cobros extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idCobro: '',
            cliente: '',
            depositoBanco: '',
            metodoPago: '',
            cuotaMensual: '',
            fechaPago: '',
            concepto: '',
            monto: '',

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
        this.refCuotaMensual = React.createRef()
        this.refFechaPago = React.createRef()
        this.refConcepto = React.createRef()
        this.refMonto = React.createRef()

    }

    async componentDidMount() {
        // this.fillTable(0, 1, "");

        clearModal("modalCobro", () => {
            this.setState({
                cliente: '',
                depositoBanco: '',
                metodoPago: '',
                cuotaMensual: '',
                fechaPago: '',
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
                fechaPago: result.data.fechaPago,
                // concepto: '',
                // monto: '',

                idCobro: result.data.idCobro
            });

        } catch (error) {
            console.log(error.response)
        }
    }

    async save() {

        if (this.state.cliente === "") {
            this.setState({ messageWarning: "Seleccione el cliente" });
            this.onFocusTab("concepto-tab", "concepto");
            this.refCliente.current.focus();
        } else if (this.state.depositoBanco === "") {
            this.setState({ messageWarning: "Seleccione el banco a depositar" })
            this.onFocusTab("concepto-tab", "concepto");
            this.refDepositoBanco.current.focus();
        } else if (this.state.metodoPago === "") {
            this.setState({ messageWarning: "Seleccione la metodo de pago" })
            this.onFocusTab("concepto-tab", "concepto");
            this.refMetodoPago.current.focus();
        } else if (this.state.cuotaMensual === "") {
            this.setState({ messageWarning: "Ingrese el monto de la cuota" });
            this.onFocusTab("concepto-tab", "concepto");
            this.refCuotaMensual.current.focus();
        } else if (this.state.fechaPago === "") {
            this.setState({ messageWarning: "Seleccione la fecha" });
            this.onFocusTab("concepto-tab", "concepto");
            this.refFechaPago.current.focus();
        }

        //    else if (this.state.estado === "") {
        //         this.setState({ messageWarning: "Seleccione el estado" });
        //         this.onFocusTab("login-tab", "login");
        //         this.refEstado.current.focus();
        //     }  

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
                        "fechaPago": this.state.fechaPago,

                        //id
                        "idCobro": this.state.idCobro
                    })
                    // console.log(result);

                } else {
                    result = await axios.post('/api/cobro/add', {
                        //concepto
                        "cliente": this.state.cliente,
                        "depositoBanco": this.state.depositoBanco,
                        "metodoPago": this.state.metodoPago,
                        "cuotaMensual": this.state.cuotaMensual.toString().trim(),
                        "fechaPago": this.state.fechaPago
                    });
                    // console.log(result);
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
            fechaPago: '',
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

    render() {
        return (
            <>
                {/* Inicio modal*/}
                <div className="modal fade" id="modalCobro" tabIndex="-1" aria-labelledby="modalCobroLabel" aria-hidden="true">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title"><i className="bi bi-currency-exchange"></i>{this.state.idCobro === '' ? " Registrar Cobro" : " Editar Cobro"}</h5>
                                <button type="button" className="close" data-dismiss="modal" onClick={() => this.closeModal()}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <nav>
                                    <div className="nav nav-tabs" id="myTab" role="tablist">
                                        <a className="nav-link active" id="cuota-tab" data-bs-toggle="tab" href="#cuota" role="tab" aria-controls="cuota" aria-selected="true">
                                            <i className="bi bi-info-circle"></i> Cuota Mensual
                                        </a>
                                        <a className="nav-link" id="concepto-tab" data-bs-toggle="tab" href="#concepto" role="tab" aria-controls="concepto" aria-selected="false">
                                            <i className="bi bi-person-workspace"></i> Añadir Conceptos
                                        </a>
                                    </div>
                                </nav>
                                <br />
                                <div className="tab-content" id="myTabContent">
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

                                        {/* <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <label>Comprobante</label>
                                                <div className="input-group">
                                                    <select
                                                        className="form-control"
                                                        value={this.state.comprobante}
                                                        ref={this.refComprobante}
                                                        onChange={(event) => {
                                                            if (event.target.value.trim().length > 0) {
                                                                this.setState({
                                                                    comprobante: event.target.value,
                                                                    messageWarning: '',
                                                                });
                                                            } else {
                                                                this.setState({
                                                                    comprobante: event.target.value,
                                                                    messageWarning: 'Seleccione el comprobante',
                                                                });
                                                            }
                                                        }}>
                                                        <option value="">-- seleccione --</option>
                                                        <option value="1">Recibo</option>
                                                        <option value="2">Boleta</option>
                                                        <option value="3">Factura</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>N° de Comprobante</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={this.state.numComprobante}
                                                    ref={this.refNumComprobante}
                                                    onChange={(event) => {
                                                        if (event.target.value.trim().length > 0) {
                                                            this.setState({
                                                                numComprobante: event.target.value,
                                                                messageWarning: '',
                                                            });
                                                        } else {
                                                            this.setState({
                                                                numComprobante: event.target.value,
                                                                messageWarning: 'Ingrese el número del comprobante',
                                                            });
                                                        }
                                                    }}
                                                    placeholder="Ingrese el número del comprobante" />
                                            </div>
                                        </div> */}

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

                                        <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <label>Cuota Mensual</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={this.state.cuotaMensual}
                                                    ref={this.refCuotaMensual}
                                                    onChange={(event) => {
                                                        if (event.target.value.trim().length > 0) {
                                                            this.setState({
                                                                cuotaMensual: event.target.value,
                                                                messageWarning: '',
                                                            });
                                                        } else {
                                                            this.setState({
                                                                cuotaMensual: event.target.value,
                                                                messageWarning: 'Ingrese el monto de la cuota',
                                                            });
                                                        }
                                                    }}
                                                    placeholder="Ingrese el monto de la cuota" />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Fecha de Pago</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={this.state.fechaPago}
                                                    ref={this.refFechaPago}
                                                    onChange={(event) => {
                                                        if (event.target.value.length > 0) {
                                                            this.setState({
                                                                fechaPago: event.target.value,
                                                                messageWarning: '',
                                                            });
                                                        } else {
                                                            this.setState({
                                                                fechaPago: event.target.value,
                                                                messageWarning: 'Seleccione la fecha',
                                                            });
                                                        }
                                                    }} />
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
                                                        value={this.state.concepto}
                                                        ref={this.refConcepto}
                                                        onChange={(event) => {
                                                            if (event.target.value.trim().length > 0) {
                                                                this.setState({
                                                                    concepto: event.target.value,
                                                                    messageWarning: '',
                                                                });
                                                            } else {
                                                                this.setState({
                                                                    concepto: event.target.value,
                                                                    messageWarning: 'Seleccione el concepto',
                                                                });
                                                            }
                                                        }}>
                                                        <option value="">-- seleccione --</option>
                                                        <option value="1">Mora por retraso de pago</option>
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
                                                    <button className="btn btn-outline-secondary ml-1" type="button"><i className="bi bi-plus-circle"></i> Agregar</button>
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

                                                        </tbody>

                                                    </table>
                                                </div>


                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Cerrar</button>
                                <button type="button" className="btn btn-primary">Aceptar</button>
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
                                    {/* {
                                        this.state.loading ? (
                                            <tr>
                                                <td className="text-center" colSpan="8">
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
                                                <td colSpan="8">¡No hay datos registrados!</td>
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
                                                            <button className="btn btn-outline-dark btn-sm" title="Editar" onClick={() => this.openModal(item.idUsuario)}><i className="bi bi-pencil"></i></button>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )
                                    } */}
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