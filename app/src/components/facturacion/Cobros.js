import React from 'react';
import axios from 'axios';
import loading from '../../recursos/images/loading.gif';
import { showModal, hideModal, clearModal } from '../tools/Tools';

class Cobros extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idCobro: '',

            loading: true,
            lista: [],
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messagePaginacion: '',

            messageWarning: ''
        }
    }

    async componentDidMount() {
        // this.fillTable(0, 1, "");

        clearModal("modalCobro", () => {
            this.setState({


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


                idCobro: result.data.idCobro
            });

        } catch (error) {
            console.log(error.response)
        }
    }

    async onSaveProceso() {



        if (this.state.nombres === "") {
            this.setState({ messageWarning: "Ingrese los nombres" });
            this.onFocusTab("datos-tab", "datos");
            this.refNombres.current.focus();
        } else if (this.state.apellidos === "") {
            this.setState({ messageWarning: "Ingrese los apellidos" })
            this.onFocusTab("datos-tab", "datos");
            this.refApellidos.current.focus();
        } else if (this.state.dni === "") {
            this.setState({ messageWarning: "Ingrese el numero de DNI" })
            this.onFocusTab("datos-tab", "datos");
            this.refDni.current.focus();
        } else if (this.state.genero === "") {
            this.setState({ messageWarning: "Seleccione el genero" });
            this.onFocusTab("datos-tab", "datos");
            this.refGenero.current.focus();
        } else if (this.state.direccion === "") {
            this.setState({ messageWarning: "Ingrese la dirección" });
            this.onFocusTab("datos-tab", "datos");
            this.refDireccion.current.focus();
        } else if (this.state.telefono === "") {
            this.setState({ messageWarning: "Ingrese el N° de telefono" });
            this.onFocusTab("datos-tab", "datos");
            this.refTelefono.current.focus();
        } else if (this.state.email === "") {
            this.setState({ messageWarning: "Ingrese el email" });
            this.onFocusTab("datos-tab", "datos");
            this.refEmail.current.focus();
        }

        else if (this.state.empresa === "") {
            this.setState({ messageWarning: "Ingrese el nombre de la empresa" });
            this.onFocusTab("login-tab", "login");
            this.refempresa.current.focus();
        } else if (this.state.perfil === "") {
            this.setState({ messageWarning: "Ingrese el nombre del perfil" });
            this.onFocusTab("login-tab", "login");
            this.refPerfil.current.focus();
        } else if (this.state.representante === "") {
            this.setState({ messageWarning: "Seleccione si es representante" });
            this.onFocusTab("login-tab", "login");
            this.refRepresentante.current.focus();
        }

        //    else if (this.state.estado === "") {
        //         this.setState({ messageWarning: "Seleccione el estado" });
        //         this.onFocusTab("login-tab", "login");
        //         this.refEstado.current.focus();
        //     }  

        else if (this.state.usuario === "") {
            this.setState({ messageWarning: "Ingrese el usuario" });
            this.onFocusTab("login-tab", "login");
            this.refUsuario.current.focus();
        } else if (this.state.clave === "") {
            this.setState({ messageWarning: "Ingrese la contraseña" });
            this.onFocusTab("login-tab", "login");
            this.refClave.current.focus();
        } else if (this.state.configClave === "") {
            this.setState({ messageWarning: "Ingrese contraseña nuevamente" });
            this.onFocusTab("login-tab", "login");
            this.refConfigClave.current.focus();
        }

        else {

            try {

                if (this.state.clave === this.state.configClave) {
                    let result = null
                    if (this.state.idUsuario !== '') {
                        result = await axios.post('/api/usuario/update', {
                            //datos
                            "nombres": this.state.nombres.trim().toUpperCase(),
                            "apellidos": this.state.apellidos.trim().toUpperCase(),
                            "dni": this.state.dni.toString().trim().toUpperCase(),
                            "genero": this.state.genero,
                            "direccion": this.state.direccion.trim().toUpperCase(),
                            "telefono": this.state.telefono.toString().trim().toUpperCase(),
                            "email": this.state.email.trim().toUpperCase(),
                            //login
                            "empresa": this.state.empresa.trim().toUpperCase(),
                            "perfil": this.state.perfil.trim().toUpperCase(),
                            "representante": this.state.representante,
                            "estado": this.state.estado,
                            "usuario": this.state.usuario.trim().toUpperCase(),
                            "clave": this.state.clave.trim().toUpperCase(),
                            // "configClave": this.state.configClave.trim().toUpperCase(),

                            //idUsuario
                            "idUsuario": this.state.idUsuario
                        })
                        // console.log(result);

                    } else {
                        result = await axios.post('/api/usuario/add', {
                            //datos
                            "nombres": this.state.nombres.trim().toUpperCase(),
                            "apellidos": this.state.apellidos.trim().toUpperCase(),
                            "dni": this.state.dni.toString().trim().toUpperCase(),
                            "genero": this.state.genero,
                            "direccion": this.state.direccion.trim().toUpperCase(),
                            "telefono": this.state.telefono.toString().trim().toUpperCase(),
                            "email": this.state.email.trim().toUpperCase(),
                            //login
                            "empresa": this.state.empresa.trim().toUpperCase(),
                            "perfil": this.state.perfil.trim().toUpperCase(),
                            "representante": this.state.representante,
                            "estado": this.state.estado,
                            "usuario": this.state.usuario.trim().toUpperCase(),
                            "clave": this.state.clave.trim().toUpperCase(),
                            // "configClave": this.state.configClave.trim().toUpperCase(),
                        });
                        // console.log(result);
                    }
                } else {
                    this.setState({ messageWarning: "Las contraseñas no coinciden" });
                    this.onFocusTab("login-tab", "login");
                    this.refConfigClave.current.focus();
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
            // this.ref.current.focus();
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
                                            <div className="form-group col-md-6">
                                                <label>Cliente</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={this.state.cliente}
                                                    ref={this.refCliente}
                                                    onChange={(event) => {
                                                        if (event.target.value.trim().length > 0) {
                                                            this.setState({
                                                                cliente: event.target.value,
                                                                messageWarning: '',
                                                            });
                                                        } else {
                                                            this.setState({
                                                                cliente: event.target.value,
                                                                messageWarning: 'Ingrese el cliente',
                                                            });
                                                        }
                                                    }}
                                                    placeholder="Ingrese el cliente" />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>DNI/RUC</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={this.state.dni}
                                                    ref={this.refDni}
                                                    onChange={(event) => {
                                                        if (event.target.value.trim().length > 0) {
                                                            this.setState({
                                                                dni: event.target.value,
                                                                messageWarning: '',
                                                            });
                                                        } else {
                                                            this.setState({
                                                                dni: event.target.value,
                                                                messageWarning: 'Ingrese el número de DNI',
                                                            });
                                                        }
                                                    }}
                                                    placeholder="Ingrese el número de DNI" />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <label>Banco a depositar</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={this.state.banco}
                                                    ref={this.refBanco}
                                                    onChange={(event) => {
                                                        if (event.target.value.trim().length > 0) {
                                                            this.setState({
                                                                banco: event.target.value,
                                                                messageWarning: '',
                                                            });
                                                        } else {
                                                            this.setState({
                                                                banco: event.target.value,
                                                                messageWarning: 'Ingrese el banco',
                                                            });
                                                        }
                                                    }}
                                                    placeholder="Ingrese el banco" />
                                            </div>
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
                                        </div>
                                        
                                        <div className="form-row">
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
                                            <div className="form-group col-md-6">
                                                <label>Forma de Pago</label>
                                                <div className="input-group">
                                                    <select
                                                        className="form-control"
                                                        value={this.state.formaPago}
                                                        ref={this.refFormaPago}
                                                        onChange={(event) => {
                                                            if (event.target.value.trim().length > 0) {
                                                                this.setState({
                                                                    formaPago: event.target.value,
                                                                    messageWarning: '',
                                                                });
                                                            } else {
                                                                this.setState({
                                                                    formaPago: event.target.value,
                                                                    messageWarning: 'Seleccione la forma de pago',
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
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <label>Cuota Mensual</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={this.state.cuotamensual}
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
                                            <div className="form-group col-md-6">
                                                <label>Forma de Pago</label>
                                                <div className="input-group">
                                                    <select
                                                        className="form-control"
                                                        value={this.state.formaPago}
                                                        ref={this.refFormaPago}
                                                        onChange={(event) => {
                                                            if (event.target.value.trim().length > 0) {
                                                                this.setState({
                                                                    formaPago: event.target.value,
                                                                    messageWarning: '',
                                                                });
                                                            } else {
                                                                this.setState({
                                                                    formaPago: event.target.value,
                                                                    messageWarning: 'Seleccione la forma de pago',
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
                                        </div>

                                    </div>
                                    <div className="tab-pane fade" id="concepto" role="tabpanel" aria-labelledby="concepto-tab">
                                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                            <div>
                                                dfsdf
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='row py-1'>
                                    <div className='col-lg-4 col-md-4 col-sm-12 col-xs-12'>
                                        <label>Nombre(s): </label>
                                    </div>
                                    <div className='col-lg-8 col-md-8 col-sm-12 col-xs-12'>
                                        <input type="" className="form-control" placeholder='Ingrese nombres' />
                                    </div>
                                </div>
                                <div className='row py-1'>
                                    <div className='col-lg-4 col-md-4 col-sm-12 col-xs-12'>
                                        <label>Apellidos: </label>
                                    </div>
                                    <div className='col-lg-8 col-md-8 col-sm-12 col-xs-12'>
                                        <input type="" className="form-control" placeholder='Ingrese apellidos' />
                                    </div>
                                </div>
                                <div className='row py-1'>
                                    <div className='col-lg-4 col-md-4 col-sm-12 col-xs-12'>
                                        <label>DNI/RUC: </label>
                                    </div>
                                    <div className='col-lg-8 col-md-8 col-sm-12 col-xs-12'>
                                        <input type="number" className="form-control" placeholder='Ingrese documento' />
                                    </div>
                                </div>
                                <div className='row py-1'>
                                    <div className='col-lg-4 col-md-4 col-sm-12 col-xs-12'>
                                        <label>Telf./Celular: </label>
                                    </div>
                                    <div className='col-lg-8 col-md-8 col-sm-12 col-xs-12'>
                                        <input type="number" className="form-control" placeholder='Ingrese Telefono' />
                                    </div>
                                </div>
                                <div className='row py-1'>
                                    <div className='col-lg-4 col-md-4 col-sm-12 col-xs-12'>
                                        <label>Observacion: </label>
                                    </div>
                                    <div className='col-lg-8 col-md-8 col-sm-12 col-xs-12'>
                                        <input type="" className="form-control" placeholder='' />
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