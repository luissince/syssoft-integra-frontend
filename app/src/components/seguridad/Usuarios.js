import React from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import {
    showModal,
    hideModal,
    viewModal,
    clearModal,
    ModalAlertInfo,
    ModalAlertSuccess,
    ModalAlertWarning,
    spinnerLoading
} from '../tools/Tools';
import Paginacion from '../tools/Paginacion';

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
            idPerfil: '',
            perfiles: [],
            representante: '',
            estado: '1',
            usuario: '',
            clave: '',
            configClave: '',

            resetClave: '',

            loadModal: false,
            nameModal: 'Nuevo Usuario',
            messageWarning: '',
            msgModal: 'Cargando datos...',

            loading: false,
            lista: [],

            opcion: 0,
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messageTable: 'Cargando información...',
            messagePaginacion: 'Mostranto 0 de 0 Páginas'
        }

        this.refNombres = React.createRef();
        this.refApellidos = React.createRef();
        this.refDni = React.createRef();
        this.refGenero = React.createRef();
        this.refDireccion = React.createRef();
        this.refTelefono = React.createRef();
        this.refEmail = React.createRef();

        this.refempresa = React.createRef();
        this.refPerfil = React.createRef();
        this.refRepresentante = React.createRef();
        // this.refEstado = React.createRef()
        this.refUsuario = React.createRef();
        this.refClave = React.createRef();
        this.refConfigClave = React.createRef();

        this.refResetClave = React.createRef();

        this.refTxtSearch = React.createRef();

        this.idCodigo = "";
        this.abortControllerTable = new AbortController();
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    async componentDidMount() {
        this.loadInit();

        viewModal("modalUsuario", () => {
            this.abortControllerModal = new AbortController();

            if (this.idCodigo !== "") {
                this.loadDataId(this.idCodigo);
            } else {
                this.loadData();
            }
        });

        clearModal("modalUsuario", async () => {
            this.abortControllerModal.abort();
            await this.setStateAsync({
                idUsuario: '',
                nombres: '',
                apellidos: '',
                dni: '',
                genero: '',
                direccion: '',
                telefono: '',
                email: '',

                empresa: '',
                idPerfil: '',
                perfiles: [],
                representante: '',
                estado: '1',
                usuario: '',
                clave: '',
                configClave: '',

                loadModal: false,
                nameModal: 'Resetear Contraseña',
                messageWarning: '',
                msgModal: 'Cargando datos...',
            });

            this.onFocusTab("datos-tab", "datos");
            this.idCodigo = "";
        });

        clearModal("modalClave", async () => {
            await this.setStateAsync({
                idUsuario: '',
                resetClave: ''
            });
        });
    }

    componentWillUnmount() {
        this.abortControllerTable.abort();
    }

    loadInit = async () => {
        if (this.state.loading) return;

        await this.setStateAsync({ paginacion: 1 });
        this.fillTable(0, "");
        await this.setStateAsync({ opcion: 0 });
    }

    async searchText(text) {
        if (this.state.loading) return;

        if (text.trim().length === 0) return;

        await this.setStateAsync({ paginacion: 1 });
        this.fillTable(1, text.trim());
        await this.setStateAsync({ opcion: 1 });
    }

    paginacionContext = async (listid) => {
        await this.setStateAsync({ paginacion: listid });
        this.onEventPaginacion();
    }

    onEventPaginacion = () => {
        switch (this.state.opcion) {
            case 0:
                this.fillTable(0, "");
                break;
            case 1:
                this.fillTable(1, this.refTxtSearch.current.value);
                break;
        }
    }

    fillTable = async (opcion, buscar) => {
        try {
            await this.setStateAsync({ loading: true, lista: [], messageTable: "Cargando información...", messagePaginacion: "Mostranto 0 de 0 Páginas" });

            const result = await axios.get('/api/usuario/list', {
                params: {
                    "opcion": opcion,
                    "buscar": buscar,
                    "posicionPagina": ((this.state.paginacion - 1) * this.state.filasPorPagina),
                    "filasPorPagina": this.state.filasPorPagina
                }
            });

            let totalPaginacion = parseInt(Math.ceil((parseFloat(result.data.total) / this.state.filasPorPagina)));
            let messagePaginacion = `Mostrando ${result.data.result.length} de ${totalPaginacion} Páginas`;

            await this.setStateAsync({
                loading: false,
                lista: result.data.result,
                totalPaginacion: totalPaginacion,
                messagePaginacion: messagePaginacion
            });
        } catch (error) {
            if (error.message !== "canceled") {
                await this.setStateAsync({
                    loading: false,
                    lista: [],
                    totalPaginacion: 0,
                    messageTable: "Se produjo un error interno, intente nuevamente por favor.",
                    messagePaginacion: "Mostranto 0 de 0 Páginas",
                });
            }
        }
    }

    async openModal(id) {
        if (id === '') {
            showModal('modalUsuario')
            await this.setStateAsync({ nameModal: "Nuevo Usuario", loadModal: true });
        } else {
            showModal('modalUsuario')
            this.idCodigo = id;
            await this.setStateAsync({ idUsuario: id, nameModal: "Editar Usuario", loadModal: true });
        }
    }

    async openReset(id) {
        showModal('modalClave');
        await this.setStateAsync({ idUsuario: id });
    }

    loadData = async () => {
        try {
            const perfil = await axios.get("/api/perfil/listcombo", {
                signal: this.abortControllerModal.signal,
            });

            await this.setStateAsync({
                perfiles: perfil.data,
                loadModal: false,
            });

        } catch (error) {
            await this.setStateAsync({
                msgLoading: "Se produjo un error interno, intente nuevamente."
            });
        }
    }

    loadDataId = async (id) => {
        try {
            const perfil = await axios.get("/api/perfil/listcombo", {
                signal: this.abortControllerModal.signal,
            });

            const result = await axios.get("/api/usuario/id", {
                signal: this.abortControllerModal.signal,
                params: {
                    idUsuario: id
                }
            });

            await this.setStateAsync({
                nombres: result.data.nombres,
                apellidos: result.data.apellidos,
                dni: result.data.dni,
                genero: result.data.genero,
                direccion: result.data.direccion,
                telefono: result.data.telefono,
                email: result.data.email,

                empresa: result.data.empresa,
                perfiles: perfil.data,
                idPerfil: result.data.idPerfil,
                representante: result.data.representante,
                estado: result.data.estado,
                usuario: result.data.usuario,
                clave: result.data.clave,
                configClave: result.data.clave,

                idUsuario: result.data.idUsuario,
                loadModal: false
            });

        } catch (error) {
            if (error.message !== "canceled") {
                await this.setStateAsync({
                    msgModal: "Se produjo un error interno, intente nuevamente"
                });
            }
        }
    }

    async onEventGuardar() {
        if (this.state.dni === "") {
            this.setState({ messageWarning: "Ingrese el numero de DNI" })
            this.onFocusTab("datos-tab", "datos");
            this.refDni.current.focus();
        } else if (this.state.nombres === "") {
            this.setState({ messageWarning: "Ingrese los nombres" });
            this.onFocusTab("datos-tab", "datos");
            this.refNombres.current.focus();
        } else if (this.state.apellidos === "") {
            this.setState({ messageWarning: "Ingrese los apellidos" })
            this.onFocusTab("datos-tab", "datos");
            this.refApellidos.current.focus();
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
        } else if (this.state.empresa === "") {
            this.setState({ messageWarning: "Ingrese el nombre de la empresa" });
            this.onFocusTab("login-tab", "login");
            this.refempresa.current.focus();
        } else if (this.state.idPerfil === "") {
            this.setState({ messageWarning: "Ingrese el nombre del perfil" });
            this.onFocusTab("login-tab", "login");
            this.refPerfil.current.focus();
        } else if (this.state.representante === "") {
            this.setState({ messageWarning: "Seleccione si es representante" });
            this.onFocusTab("login-tab", "login");
            this.refRepresentante.current.focus();
        } else if (this.state.usuario === "") {
            this.setState({ messageWarning: "Ingrese el usuario" });
            this.onFocusTab("login-tab", "login");
            this.refUsuario.current.focus();
        } else if (this.state.clave === "" && this.state.idUsuario === "") {
            this.setState({ messageWarning: "Ingrese la contraseña" });
            this.onFocusTab("login-tab", "login");
            this.refClave.current.focus();
        } else if (this.state.configClave === "" && this.state.idUsuario === "") {
            this.setState({ messageWarning: "Ingrese contraseña nuevamente" });
            this.onFocusTab("login-tab", "login");
            this.refConfigClave.current.focus();
        } else {
            try {
                ModalAlertInfo("Usuario", "Procesando información...");
                hideModal("modalUsuario");

                if (this.state.idUsuario !== '') {
                    let result = await axios.post('/api/usuario/update', {
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
                        "idPerfil": this.state.idPerfil.trim().toUpperCase(),
                        "representante": this.state.representante,
                        "estado": this.state.estado,
                        "usuario": this.state.usuario.trim().toUpperCase(),
                        "clave": this.state.clave.trim().toUpperCase(),

                        //idUsuario
                        "idUsuario": this.state.idUsuario
                    })
                    ModalAlertSuccess("Usuario", result.data, () => {
                        this.onEventPaginacion();
                    });

                } else {
                    if (this.state.clave !== this.state.configClave) {
                        this.setState({ messageWarning: "Las contraseñas no coinciden" });
                        this.onFocusTab("login-tab", "login");
                        this.refConfigClave.current.focus();
                    } else {
                        let result = await axios.post('/api/usuario/add', {
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
                            "idPerfil": this.state.idPerfil.trim().toUpperCase(),
                            "representante": this.state.representante,
                            "estado": this.state.estado,
                            "usuario": this.state.usuario.trim().toUpperCase(),
                            "clave": this.state.clave.trim().toUpperCase(),
                        });

                        ModalAlertSuccess("Usuario", result.data, () => {
                            this.loadInit();
                        });
                    }
                }
            } catch (error) {
                if (error.response !== undefined) {
                    ModalAlertWarning("Usuario", error.response.data);
                } else {
                    ModalAlertWarning("Usuario", "Se produjo un error un interno, intente nuevamente.");
                }

            }
        }
    }

    async onEventReset() {
        if (this.state.resetClave === "") {
            this.refResetClave.current.focus();
        } else {
            try {
                ModalAlertInfo("Usuario", "Procesando información...");
                hideModal("modalClave");
                let result = await axios.post("/api/usuario/reset", {
                    "clave": this.state.resetClave,
                    "idUsuario": this.state.idUsuario
                });

                ModalAlertSuccess("Usuario", result.data);
            } catch (error) {
                ModalAlertWarning("Usuario", "Se produjo un error un interno, intente nuevamente.");
            }
        }
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
                {/* Inicio usuario*/}
                <div className="modal fade" id="modalUsuario" tabIndex="-1" aria-labelledby="modalUsuarioLabel" aria-hidden="true">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{this.state.nameModal}</h5>
                                <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {this.state.loadModal ?
                                    <div className="clearfix absolute-all bg-white">
                                        {spinnerLoading(this.state.msgModal)}
                                    </div>
                                    : null
                                }

                                {
                                    this.state.messageWarning === '' ? null :
                                        <div className="alert alert-warning" role="alert">
                                            <i className="bi bi-exclamation-diamond-fill"></i> {this.state.messageWarning}
                                        </div>
                                }

                                <ul className="nav nav-tabs" id="myTab" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <a className="nav-link active" id="datos-tab" data-bs-toggle="tab" href="#datos" role="tab" aria-controls="datos" aria-selected="true">
                                            <i className="bi bi-info-circle"></i> Datos
                                        </a>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <a className="nav-link" id="login-tab" data-bs-toggle="tab" href="#login" role="tab" aria-controls="login" aria-selected="false">
                                            <i className="bi bi-person-workspace"></i> Login
                                        </a>
                                    </li>
                                </ul>
                                <div className="tab-content pt-2" id="myTabContent">
                                    <div className="tab-pane fade show active" id="datos" role="tabpanel" aria-labelledby="datos-tab">

                                        <div className="form-group">
                                            <label htmlFor="dni">Dni <i className="fa fa-asterisk text-danger small"></i></label>
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

                                        <div className="form-row">
                                            <div className="form-group col-md-6">
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

                                            <div className="form-group col-md-6">
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

                                        <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <label htmlFor="telefono">Telefono o celular</label>
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
                                            <div className="form-group col-md-6">
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
                                    <div className="tab-pane fade" id="login" role="tabpanel" aria-labelledby="login-tab">

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
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="perfil">Perfil</label>
                                            <select
                                                className="form-control"
                                                ref={this.refPerfil}
                                                value={this.state.idPerfil}
                                                onChange={(event) => this.setState({ idPerfil: event.target.value })}
                                            >
                                                <option value="">- Seleccione -</option>
                                                {
                                                    this.state.perfiles.map((item, index) => (
                                                        <option key={index} value={item.idPerfil}>{item.descripcion}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group col-md-6">
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
                                            <div className="form-group col-md-6">
                                                <label htmlFor="estado">Estado</label>
                                                <select
                                                    className="form-control"
                                                    id="estado"
                                                    value={this.state.estado}
                                                    // ref={this.refEstado}
                                                    onChange={(event) => this.setState({ estado: event.target.value })}>
                                                    <option value="1">Activo</option>
                                                    <option value="2">Inactivo</option>
                                                </select>
                                            </div>
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

                                        {
                                            this.state.idUsuario === "" ?
                                                <div className="form-row">
                                                    <div className="form-group col-md-6">
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
                                                    <div className="form-group col-md-6">
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
                                                </div>
                                                : null
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => this.onEventGuardar()}>Aceptar</button>
                                <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* fin usuario*/}

                {/* Inicio resetear */}
                <div className="modal fade" id="modalClave" data-bs-keyboard="false" data-bs-backdrop="static">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{this.state.nameModal}</h5>
                                <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className='row py-1'>
                                    <div className='col-lg-4 col-md-4 col-sm-12 col-xs-12'>
                                        <label>Nueva Clave: </label>
                                    </div>
                                    <div className='col-lg-8 col-md-8 col-sm-12 col-xs-12'>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refResetClave}
                                            value={this.state.resetClave}
                                            onChange={(event) => this.setState({ resetClave: event.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => this.onEventReset()}>Aceptar</button>
                                <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* fin resetear */}

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
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar..."
                                    ref={this.refTxtSearch}
                                    onKeyUp={(event) => this.searchText(event.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            <button className="btn btn-outline-info" onClick={() => this.openModal('')}>
                                <i className="bi bi-file-plus"></i> Nuevo Registro
                            </button>
                            {" "}
                            <button className="btn btn-outline-secondary" onClick={() => this.loadInit()}>
                                <i className="bi bi-arrow-clockwise"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered rounded">
                                <thead>
                                    <tr>
                                        <th width="5%">#</th>
                                        <th width="15%">Nombre y Apellidos</th>
                                        <th width="10%">Telefono</th>
                                        <th width="15%">Email</th>
                                        <th width="10%">Perfil</th>
                                        <th width="15%">Representante</th>
                                        <th width="5%">Estado</th>
                                        <th width="5%">Editar</th>
                                        <th width="5%">Resetear</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.loading ? (
                                            <tr>
                                                <td className="text-center" colSpan="9">
                                                    {spinnerLoading()}
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
                                                        <td>{item.nombres}{<br />}{item.apellidos}</td>
                                                        <td>{item.telefono}</td>
                                                        <td>{item.email}</td>
                                                        <td>{item.perfil}</td>
                                                        <td>{item.representante == 1 ? "SI" : "NO"}</td>
                                                        <td className="text-center"><div className={`badge ${item.estado === 1 ? "badge-info" : "badge-danger"}`}>{item.estado === 1 ? "ACTIVO" : "INACTIVO"}</div></td>
                                                        <td>
                                                            <button className="btn btn-outline-warning btn-sm" title="Editar" onClick={() => this.openModal(item.idUsuario)}><i className="bi bi-pencil"></i></button>
                                                        </td>
                                                        <td>
                                                            <button className="btn btn-outline-info btn-sm" title="Resetear" onClick={() => this.openReset(item.idUsuario)}><i className="bi bi-key"></i></button>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )
                                    }

                                </tbody>

                            </table>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-sm-12 col-md-5">
                        <div className="dataTables_info mt-2" role="status" aria-live="polite">{this.state.messagePaginacion}</div>
                    </div>
                    <div className="col-sm-12 col-md-7">
                        <div className="dataTables_paginate paging_simple_numbers">
                            <nav aria-label="Page navigation example">
                                <ul className="pagination justify-content-end">
                                    <Paginacion
                                        loading={this.state.loading}
                                        totalPaginacion={this.state.totalPaginacion}
                                        paginacion={this.state.paginacion}
                                        fillTable={this.paginacionContext}
                                    />
                                </ul>
                            </nav>
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


export default connect(mapStateToProps, null)(Usuarios);