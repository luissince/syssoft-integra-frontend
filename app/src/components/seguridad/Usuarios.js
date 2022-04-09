import React from 'react';
// import { Redirect } from 'react-router-dom';
// import { connect } from 'react-redux';
// import { signOut } from '../../redux/actions';
import axios from 'axios';
import loading from '../../recursos/images/loading.gif';
import { showModal, hideModal, clearModal } from '../tools/Tools';

class Usuarios extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idUsuario: '',

            nombres: '',
            apellidos: '',
            dni: '',
            genero: '',
            direccion: '',
            telefono: '',
            email: '',

            empresa: '',
            perfil: '',
            representante: '',
            estado: '1',
            usuario: '',
            clave: '',
            configClave: '',

            loading: true,
            lista: [],
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messagePaginacion: '',

            messageWarning: ''
        }

        this.refNombres = React.createRef()
        this.refApellidos = React.createRef()
        this.refDni = React.createRef()
        this.refGenero = React.createRef()
        this.refDireccion = React.createRef()
        this.refTelefono = React.createRef()
        this.refEmail = React.createRef()

        this.refempresa = React.createRef()
        this.refPerfil = React.createRef()
        this.refRepresentante = React.createRef()
        // this.refEstado = React.createRef()
        this.refUsuario = React.create
        this.refClave = React.createRef()
        this.refConfigClave = React.createRef()
    }

    async componentDidMount() {
        this.fillTable(0, 1, "");

        clearModal("modalUsuario", () => {
            this.setState({
                nombres: '',
                apellidos: '',
                dni: '',
                genero: '',
                direccion: '',
                telefono: '',
                email: '',

                empresa: '',
                perfil: '',
                representante: '',
                estado: '1',
                usuario: '',
                clave: '',
                configClave: '',

                idUsuario: '',
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
            const result = await axios.get('/api/usuario/list', {
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
            const result = await axios.get("/api/usuario/id", {
                params: {
                    idUsuario: id
                }
            });
            // console.log(result)
            this.setState({
                nombres: result.data.nombres,
                apellidos: result.data.apellidos,
                dni: result.data.dni,
                genero: result.data.genero,
                direccion: result.data.direccion,
                telefono: result.data.telefono,
                email: result.data.email,

                empresa: result.data.empresa,
                perfil: result.data.perfil,
                representante: result.data.representante,
                estado: result.data.estado,
                usuario: result.data.usuario,
                clave: result.data.clave,
                configClave: result.data.clave,

                idUsuario: result.data.idUsuario
            });

        } catch (error) {
            console.log(error.response)
        }
    }

    async onSaveProceso() {

        // console.log(this.state) 

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
        }  else if (this.state.email === "") {
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
                            "estado" : this.state.estado,
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
                            "estado" : this.state.estado,
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
            showModal('modalUsuario')
            this.onFocusTab("datos-tab", "datos");
            this.refNombres.current.focus();
        }
        else {
            showModal('modalUsuario')
            this.onFocusTab("datos-tab", "datos");
            this.loadDataId(id)
        }
    }

    closeModal() {
        hideModal('modalUsuario')
        this.setState({
            nombres: '',
            apellidos: '',
            dni: '',
            genero: '',
            direccion: '',
            telefono: '',
            email: '',

            empresa: '',
            perfil: '',
            representante: '',
            estado: '1',
            usuario: '',
            clave: '',
            configClave: '',

            idUsuario: '',
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
                <div className="modal fade" id="modalUsuario" tabIndex="-1" aria-labelledby="modalUsuarioLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title"><i className="bi bi-currency-exchange"></i>{this.state.idUsuario === '' ? " Registrar Usuario" : " Editar Usuario"}</h5>
                                <button type="button" className="close" data-dismiss="modal" onClick={() => this.closeModal()}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <nav>
                                    <div className="nav nav-tabs" id="myTab" role="tablist">
                                        <a className="nav-link active" id="datos-tab" data-bs-toggle="tab" href="#datos" role="tab" aria-controls="datos" aria-selected="true">
                                            <i className="bi bi-info-circle"></i> Datos
                                        </a>
                                        <a className="nav-link" id="login-tab" data-bs-toggle="tab" href="#login" role="tab" aria-controls="login" aria-selected="false">
                                            <i className="bi bi-person-workspace"></i> Login
                                        </a>
                                    </div>
                                </nav>
                                <div className="tab-content" id="myTabContent">
                                    <div className="tab-pane fade show active" id="datos" role="tabpanel" aria-labelledby="datos-tab">
                                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                            <div>
                                                <div className="form-group">
                                                    <label htmlFor="nombres">Nombre(s)</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="nombres"
                                                        value={this.state.nombres}
                                                        ref={this.refNombres}
                                                        onChange={(event) => {
                                                            if (event.target.value.trim().length > 0) {
                                                                this.setState({
                                                                    nombres: event.target.value,
                                                                    messageWarning: '',
                                                                });
                                                            } else {
                                                                this.setState({
                                                                    nombres: event.target.value,
                                                                    messageWarning: 'Ingrese los nombres',
                                                                });
                                                            }
                                                        }}
                                                        placeholder='Ingrese los nombres' />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="apellidos">Apellidos</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="apellidos"
                                                        value={this.state.apellidos}
                                                        ref={this.refApellidos}
                                                        onChange={(event) => {
                                                            if (event.target.value.trim().length > 0) {
                                                                this.setState({
                                                                    apellidos: event.target.value,
                                                                    messageWarning: '',
                                                                });
                                                            } else {
                                                                this.setState({
                                                                    apellidos: event.target.value,
                                                                    messageWarning: 'Ingrese los apellidos',
                                                                });
                                                            }
                                                        }}
                                                        placeholder='ingrese apellidos del usuario' />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="dni">Dni</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        id="dni"
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
                                                                    messageWarning: 'Ingrese el numero de DNI',
                                                                });
                                                            }
                                                        }}
                                                        placeholder='Ingrese el numero de DNI' />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="genero">Genero</label>
                                                    <select
                                                        className="form-control"
                                                        id="genero"
                                                        value={this.state.genero}
                                                        ref={this.refGenero}
                                                        onChange={(event) => {
                                                            if (event.target.value.trim().length > 0) {
                                                                this.setState({
                                                                    genero: event.target.value,
                                                                    messageWarning: '',
                                                                });
                                                            } else {
                                                                this.setState({
                                                                    genero: event.target.value,
                                                                    messageWarning: 'Seleccione el genero.',
                                                                });
                                                            }
                                                        }}>
                                                        <option value="">-- Seleccione --</option>
                                                        <option value="1">Masculino</option>
                                                        <option value="2">Femenino</option>
                                                        <option value="3">Otros</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="direccion">Dirección</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="direccion"
                                                        value={this.state.direccion}
                                                        ref={this.refDireccion}
                                                        onChange={(event) => {
                                                            if (event.target.value.trim().length > 0) {
                                                                this.setState({
                                                                    direccion: event.target.value,
                                                                    messageWarning: '',
                                                                });
                                                            } else {
                                                                this.setState({
                                                                    direccion: event.target.value,
                                                                    messageWarning: 'Ingrese el N° de dirección',
                                                                });
                                                            }
                                                        }}
                                                        placeholder='Ingrese la dirección' />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="telefono">Telefono</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        id="telefono"
                                                        value={this.state.telefono}
                                                        ref={this.refTelefono}
                                                        onChange={(event) => {
                                                            if (event.target.value.trim().length > 0) {
                                                                this.setState({
                                                                    telefono: event.target.value,
                                                                    messageWarning: '',
                                                                });
                                                            } else {
                                                                this.setState({
                                                                    telefono: event.target.value,
                                                                    messageWarning: 'Ingrese el N° de telefono',
                                                                });
                                                            }
                                                        }}
                                                        placeholder='Ingrese el N° de telefono' />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="email">Correo Electrónico</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        id="email"
                                                        value={this.state.email}
                                                        ref={this.refEmail}
                                                        onChange={(event) => {
                                                            if (event.target.value.trim().length > 0) {
                                                                this.setState({
                                                                    email: event.target.value,
                                                                    messageWarning: '',
                                                                });
                                                            } else {
                                                                this.setState({
                                                                    email: event.target.value,
                                                                    messageWarning: 'Ingrese el email',
                                                                });
                                                            }
                                                        }}
                                                        placeholder='Ingrese el email' />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tab-pane fade" id="login" role="tabpanel" aria-labelledby="login-tab">
                                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                            <form>
                                                <div className="form-group">
                                                    <label htmlFor="empresa">Empresa</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="empresa"
                                                        value={this.state.empresa}
                                                        ref={this.refempresa}
                                                        onChange={(event) => {
                                                            if (event.target.value.trim().length > 0) {
                                                                this.setState({
                                                                    empresa: event.target.value,
                                                                    messageWarning: '',
                                                                });
                                                            } else {
                                                                this.setState({
                                                                    empresa: event.target.value,
                                                                    messageWarning: 'Ingrese el nombre de la empresa',
                                                                });
                                                            }
                                                        }}
                                                        placeholder='Ingrese el nombre de la empresa' />
                                                    {/* <select className="form-control" id="empresa">
                                                        <option>-- seleccione --</option>
                                                        <option>Empresa 1</option>
                                                        <option>Empresa 2</option>
                                                    </select> */}
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="perfil">Perfil</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="perfil"
                                                        value={this.state.perfil}
                                                        ref={this.refPerfil}
                                                        onChange={(event) => {
                                                            if (event.target.value.trim().length > 0) {
                                                                this.setState({
                                                                    perfil: event.target.value,
                                                                    messageWarning: '',
                                                                });
                                                            } else {
                                                                this.setState({
                                                                    perfil: event.target.value,
                                                                    messageWarning: 'Ingrese el nombre del perfil',
                                                                });
                                                            }
                                                        }}
                                                        placeholder='Ingrese el nombre del perfil' />
                                                    {/* <select className="form-control" id="perfil">
                                                        <option>-- seleccione --</option>
                                                        <option>Perfil 1</option>
                                                        <option>Perfil 2</option>
                                                    </select> */}
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="representante">¿Representante?</label>
                                                    <select
                                                        className="form-control"
                                                        id="representante"
                                                        value={this.state.representante}
                                                        ref={this.refRepresentante}
                                                        onChange={(event) => {
                                                            if (event.target.value.trim().length > 0) {
                                                                this.setState({
                                                                    representante: event.target.value,
                                                                    messageWarning: '',
                                                                });
                                                            } else {
                                                                this.setState({
                                                                    representante: event.target.value,
                                                                    messageWarning: 'Seleccione si es representante',
                                                                });
                                                            }
                                                        }}>
                                                        <option value="">-- seleccione --</option>
                                                        <option value="1">Si</option>
                                                        <option value="2">No</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="estado">Estado</label>
                                                    <select
                                                        className="form-control"
                                                        id="estado"
                                                        value={this.state.estado}
                                                        // ref={this.refEstado}
                                                        onChange={(event) =>  this.setState({estado: event.target.value })}>
                                                        <option value="1">Activo</option>
                                                        <option value="2">Inactivo</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="usuario">usuario</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="usuario"
                                                        value={this.state.usuario}
                                                        ref={this.refUsuario}
                                                        onChange={(event) => {
                                                            if (event.target.value.trim().length > 0) {
                                                                this.setState({
                                                                    usuario: event.target.value,
                                                                    messageWarning: '',
                                                                });
                                                            } else {
                                                                this.setState({
                                                                    usuario: event.target.value,
                                                                    messageWarning: 'Ingrese el usuario',
                                                                });
                                                            }
                                                        }}
                                                        placeholder='Ingrese el usuario' />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="contraseña">Contraseña</label>
                                                    <input
                                                        type="password"
                                                        className="form-control"
                                                        id="contraseña"
                                                        value={this.state.clave}
                                                        ref={this.refClave}
                                                        onChange={(event) => {
                                                            if (event.target.value.trim().length > 0) {
                                                                this.setState({
                                                                    clave: event.target.value,
                                                                    messageWarning: '',
                                                                });
                                                            } else {
                                                                this.setState({
                                                                    clave: event.target.value,
                                                                    messageWarning: 'Ingrese la contraseña',
                                                                });
                                                            }
                                                        }}
                                                        placeholder='Ingrese la contraseña' />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="contraseña2">Confirmar Contraseña</label>
                                                    <input
                                                        type="password"
                                                        className="form-control"
                                                        id="contraseña2"
                                                        value={this.state.configClave}
                                                        ref={this.refConfigClave}
                                                        onChange={(event) => {
                                                            if (event.target.value.trim().length > 0) {
                                                                this.setState({
                                                                    configClave: event.target.value,
                                                                    messageWarning: '',
                                                                });
                                                            } else {
                                                                this.setState({
                                                                    configClave: event.target.value,
                                                                    messageWarning: 'Ingrese contraseña nuevamente',
                                                                });
                                                            }
                                                        }}
                                                        placeholder='Ingrese contraseña nuevamente' />
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => this.onSaveProceso()}>Aceptar</button>
                                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => this.closeModal()}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* fin modal*/}

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Usuarios <small className="text-secondary">LISTA</small></h5>
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
                            <button className="btn btn-outline-info" onClick={() => this.openModal(this.state.idUsuario)}>
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
                                        <th width="15%">Nombre y Apellidos</th>
                                        <th width="10%">Telefono</th>
                                        <th width="15%">Email</th>
                                        <th width="10%">Perfil</th>
                                        <th width="15%">Empresa</th>
                                        <th width="5%">Estado</th>
                                        <th width="15%">Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
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

export default Usuarios;