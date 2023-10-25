import React from 'react';
import {
    currentDate,
    keyNumberPhone,
    keyNumberInteger,
    spinnerLoading,
    convertNullText,
    alertInfo,
    alertSuccess,
    alertWarning,
    isText,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import SearchBar from "../../../../components/SearchBar";
import ContainerWrapper from '../../../../components/Container';
import { images } from '../../../../helper';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { addCliente, getClienteId, getUbigeo, listComboTipoDocumento } from '../../../../network/rest/principal.network';
import { getDni, getRuc } from '../../../../network/rest/apisperu.network';
import { CANCELED } from '../../../../model/types/types';
import CustomComponent from '../../../../model/class/custom-component';

class ClienteAgregar extends CustomComponent {
    constructor(props) {
        super(props);
        this.state = {
            tipo: 1,
            // persona natural
            idTipoDocumentoPn: '',
            documento: '',
            informacion: '',
            telefono: '',
            celular: '',
            fechaNacimiento: currentDate(),
            email: '',
            genero: '',
            direccion: '',

            idUbigeo: '',
            ubigeo: '',

            estadoCivil: '',
            predeterminado: false,
            estado: true,
            observacion: '',

            // persona juridica
            idTipoDocumentoPj: '',

            // otros datos
            idUsuario: this.props.token.userToken.idUsuario,

            tiposDocumentos: [],

            filter: false,
            filteredData: [],

            loading: true,
            messageWarning: '',
            msgLoading: 'Cargando datos...',
        }

        // Persona natural
        this.refTipoDocumentoPn = React.createRef();
        this.refDocumento = React.createRef();
        this.refInformacion = React.createRef();
        this.refCelular = React.createRef();
        this.refGenero = React.createRef();

        this.refDireccion = React.createRef();
        this.refUbigeo = React.createRef();
        this.refFechaNacimiento = React.createRef();

        // Persona juridica
        this.refTipoDocumentoPj = React.createRef();

        this.abortControllerTable = new AbortController();

        this.selectItem = false;
    }

    async componentDidMount() {
        this.loadingData();
    }

    componentWillUnmount() {
        this.abortControllerTable.abort();
    }

    loadingData = async () => {
        const documentos = await this.fetchTipoDocumento();

        if (documentos.length !== 0) {
            await this.setStateAsync({
                tiposDocumentos: documentos,
                loading: false
            })
        } else {
            await this.setStateAsync({
                msgLoading: "Se produjo un error un interno, intente nuevamente."
            });
        }
    }

    async fetchTipoDocumento() {
        const response = await listComboTipoDocumento(this.abortControllerTable.signal);

        if (response instanceof SuccessReponse) {
            return response.data;
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            return [];
        }
    }

    async fetchClienteId(params) {
        const response = await getClienteId(params, this.abortControllerTable.signal);

        if (response instanceof SuccessReponse) {
            return response.data;
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            return null;
        }
    }

    handleSelectTipoDocumento = (event) => {
        const messageWarning = event.target.value.trim().length > 0 ? '' : 'Seleccione el tipo de documento';

        this.setState({
            idTipoDocumentoPn: event.target.value,
            messageWarning: messageWarning
        });
    }

    handleInputNumeroDocumento = (event) => {
        const messageWarning = event.target.value.trim().length > 0 ? "" : "Ingrese el número de documento";

        this.setState({
            documento: event.target.value,
            messageWarning: messageWarning,
        });
    }

    handleInputInformacion = (event) => {
        const messageWarning = event.target.value.trim().length > 0 ? '' : "Ingrese la razón social o apellidos y nombres";

        this.setState({
            informacion: event.target.value,
            messageWarning: messageWarning
        });
    }

    handleSelectGenero = (event) => {
        this.setState({ genero: event.target.value })
    }

    handleSelectEstadoCvil = (event) => {
        this.setState({ estadoCivil: event.target.value })
    }


    handleInputFechaNacimiento = (event) => {
        this.setState({ fechaNacimiento: event.target.value })
    }


    handleInputObservacion = (event) => {
        this.setState({ observacion: event.target.value })
    }


    handleInputCelular = (event) => {
        this.setState({
            celular: event.target.value
        });
    }


    handleInputTelefono = (event) => {
        this.setState({ telefono: event.target.value, })
    }


    handleInputEmail = (event) => {
        this.setState({ email: event.target.value })
    }


    handleInputDireccion = (event) => {
        this.setState({ direccion: event.target.value })
    }


    handleInputEstado = (value) => {
        this.setState({ estado: value.target.checked })
    }


    handleInputPredeterminado = (value) => {
        this.setState({ predeterminado: value.target.checked })
    }

    handleFocusTab(idTab, idContent) {
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

    handleGetApiReniec = async () => {
        if (this.state.documento.length !== 8) {
            this.setState({
                messageWarning: "Para iniciar la busqueda en número dni debe tener 8 caracteres."
            });
            return;
        }

        this.setState({
            loading: true,
            msgLoading: 'Consultando número de DNI...',
        });

        const response = await getDni(this.state.documento);

        if (response instanceof SuccessReponse) {
            this.setState({
                documento: convertNullText(response.data.dni),
                informacion: convertNullText(response.data.apellidoPaterno) + " " + convertNullText(response.data.apellidoMaterno) + " " + convertNullText(response.data.nombres),
                loading: false,
            });
        }

        if (response instanceof ErrorResponse) {
            alertWarning("Cliente", response.getMessage(), () => {
                this.setState({
                    loading: false,
                });
            })
        }
    }

    handleGetApiSunat = async () => {
        if (this.state.documento.length !== 11) {
            this.setState({
                messageWarning: "Para iniciar la busqueda en número ruc debe tener 11 caracteres."
            });
            return;
        }

        this.setState({
            loading: true,
            msgLoading: 'Consultando número de RUC...',
        });

        const response = await getRuc(this.state.documento);

        if (response instanceof SuccessReponse) {
            this.setState({
                documento: convertNullText(response.data.ruc),
                informacion: convertNullText(response.data.razonSocial),
                direccion: convertNullText(response.data.direccion),
                loading: false,
            });
        }

        if (response instanceof ErrorResponse) {
            alertWarning("Cliente", response.getMessage(), () => {
                this.setState({
                    loading: false,
                });
            })
        }
    }

    handleFilter = async (event) => {
        const searchWord = this.selectItem ? "" : event.target.value;
        await this.setStateAsync({ idUbigeo: '', ubigeo: searchWord });
        this.selectItem = false;
        if (searchWord.length === 0) {
            await this.setStateAsync({ filteredData: [] });
            return;
        }

        if (this.state.filter) return;

        await this.setStateAsync({ filter: true });

        const params = {
            filtrar: searchWord,
        }

        const response = await getUbigeo(params);

        if (response instanceof SuccessReponse) {
            await this.setStateAsync({ filter: false, filteredData: response.data });
        }

        if (response instanceof ErrorResponse) {
            await this.setStateAsync({ filter: false, filteredData: [] });
        }
    }

    handleSelectItem = async (value) => {
        await this.setStateAsync({
            ubigeo: value.departamento + "-" + value.provincia + "-" + value.distrito + " (" + value.ubigeo + ")",
            filteredData: [],
            idUbigeo: value.idUbigeo
        });
        this.selectItem = true;
    }

    handleClearInput = async () => {
        await this.setStateAsync({ filteredData: [], idUbigeo: '', ubigeo: "" });
        this.selectItem = false;
    }

    handleGuardarPNatural = async () => {
        if (!isText(this.state.idTipoDocumentoPn)) {
            this.setState({ messageWarning: "Seleccione el tipo de documento." });
            this.handleFocusTab("datos-tab", "datos");
            this.refTipoDocumentoPn.current.focus();
            return;
        }

        if (!isText(this.state.documento)) {
            this.setState({ messageWarning: "Ingrese el número de documento." });
            this.handleFocusTab("datos-tab", "datos");
            this.refDocumento.current.focus();
            return;
        }

        if (!isText(this.state.informacion)) {
            this.setState({ messageWarning: "Ingrese los apellidos y nombres." });
            this.handleFocusTab("datos-tab", "datos");
            this.refInformacion.current.focus();
            return;
        }

        alertInfo("Cliente", "Procesando información...");

        const data = {
            "idTipoDocumento": this.state.idTipoDocumentoPn,
            "documento": this.state.documento.toString().trim().toUpperCase(),
            "informacion": this.state.informacion.trim().toUpperCase(),
            "telefono": this.state.telefono.toString().trim().toUpperCase(),
            "celular": this.state.celular.toString().trim().toUpperCase(),
            "fechaNacimiento": this.state.fechaNacimiento,
            "email": this.state.email.trim(),
            "genero": this.state.genero,
            "direccion": this.state.direccion.trim().toUpperCase(),
            "idUbigeo": this.state.idUbigeo,
            "estadoCivil": this.state.estadoCivil,
            "predeterminado": this.state.predeterminado,
            "estado": this.state.estado,
            "observacion": this.state.observacion.trim().toUpperCase(),
            "idUsuario": this.state.idUsuario
        }

        const response = await addCliente(data);

        if (response instanceof SuccessReponse) {
            alertSuccess("Cliente", response.data, () => {
                this.props.history.goBack();
            });
        }

        if (response instanceof ErrorResponse) {
            alertWarning("Cliente", response.getMessage())
        }
    }

    handleGuardarPJuridica = async () => {
        if (this.state.idTipoDocumentoPj === "") {
            this.setState({ messageWarning: "Seleccione el tipo de documento." });
            this.handleFocusTab("datos-tab", "datos");
            this.refTipoDocumentoPj.current.focus();
            return;
        }

        if (this.state.documento === "") {
            this.setState({ messageWarning: "Ingrese el número de documento." });
            this.handleFocusTab("datos-tab", "datos");
            this.refDocumento.current.focus();
            return;
        }

        if (this.state.informacion === "") {
            this.setState({ messageWarning: "Ingrese los apellidos y nombres." });
            this.handleFocusTab("datos-tab", "datos");
            this.refInformacion.current.focus();
            return;
        }

        if (this.state.celular === "") {
            this.setState({ messageWarning: "Ingrese el número de celular." });
            this.handleFocusTab("contacto-tab", "contacto");
            this.refCelular.current.focus();
            return;
        }

        alertInfo("Cliente", "Procesando información...");

        const data = {
            "idTipoDocumento": this.state.idTipoDocumentoPj,
            "documento": this.state.documento.toString().trim().toUpperCase(),
            "informacion": this.state.informacion.trim().toUpperCase(),
            "telefono": this.state.telefono.toString().trim().toUpperCase(),
            "celular": this.state.celular.toString().trim().toUpperCase(),
            "email": this.state.email.trim(),
            "direccion": this.state.direccion.trim().toUpperCase(),
            "idUbigeo": this.state.idUbigeo,
            "estado": this.state.estado,
            "observacion": this.state.observacion.trim().toUpperCase(),
            "idUsuario": this.state.idUsuario
        }

        const response = await addCliente(data);

        if (response instanceof SuccessReponse) {
            alertSuccess("Cliente", response.data, () => {
                this.props.history.goBack();
            });
        }

        if (response instanceof ErrorResponse) {
            alertWarning("Cliente", response.getMessage())
        }

    }

    handleGuardar = () => {
        if (this.state.tipo === 1) {
            this.handleGuardarPNatural();
        } else {
            this.handleGuardarPJuridica();
        }
    }

    render() {

        const { idTipoDocumentoPn, documento, informacion, genero, estadoCivil, fechaNacimiento, observacion, celular, telefono, email, direccion, ubigeo, estado, predeterminado } = this.state;

        const { idTipoDocumentoPj } = this.state;

        return (
            <ContainerWrapper>
                {
                    this.state.loading && spinnerLoading(this.state.msgLoading)
                }

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <section className="content-header">
                            <h5>
                                <span role="button" onClick={() => this.props.history.goBack()}><i className="bi bi-arrow-left-short"></i></span> {this.state.idCliente === '' ? 'Registrar Cliente' : 'Editar Cliente'}
                            </h5>
                        </section>
                    </div>
                </div>

                {
                    this.state.messageWarning !== '' &&
                    <div className="alert alert-warning" role="alert">
                        <i className="bi bi-exclamation-diamond-fill"></i> {this.state.messageWarning}
                    </div>
                }

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                            {/* Persona Natural */}
                            <li className="nav-item" role="presentation">
                                <a className="nav-link active"
                                    id="datos-tab"
                                    data-bs-toggle="tab"
                                    href="#datos"
                                    role="tab"
                                    aria-controls="datos"
                                    aria-selected={true}
                                    onClick={() => this.setState({ tipo: 1 })}>
                                    <i className="bi bi-person"></i> Persona Natural
                                </a>
                            </li>
                            {/* Persona Juridica */}
                            <li className="nav-item" role="presentation">
                                <a className="nav-link"
                                    id="contacto-tab"
                                    data-bs-toggle="tab"
                                    href="#contacto"
                                    role="tab"
                                    aria-controls="contacto"
                                    aria-selected={false}
                                    onClick={() => this.setState({ tipo: 2 })}>
                                    <i className="bi bi-building"></i> Persona Juridica
                                </a>
                            </li>
                        </ul>

                        <div className="tab-content pt-2" id="myTabContent">
                            {/* Contenedor person natural  */}
                            <div className="tab-pane fade show active" id="datos" role="tabpanel" aria-labelledby="datos-tab">

                                {/* Tipo documento y Número de documento */}
                                <div className="row">
                                    <div className="form-group col-md-6">
                                        <label>Tipo Documento <i className="fa fa-asterisk text-danger small"></i></label>
                                        <select
                                            className={`form-control ${idTipoDocumentoPn ? "" : "is-invalid"}`}
                                            value={idTipoDocumentoPn}
                                            ref={this.refTipoDocumentoPn}
                                            onChange={this.handleSelectTipoDocumento}>
                                            <option value="">-- Seleccione --</option>
                                            {
                                                this.state.tiposDocumentos.filter(item => item.idTipoDocumento !== 'TD0003').map((item, index) => (
                                                    <option key={index} value={item.idTipoDocumento}>{item.nombre}</option>
                                                ))
                                            }
                                        </select>
                                        {
                                            idTipoDocumentoPn === "" &&
                                            <div className="invalid-feedback">
                                                Seleccione un valor.
                                            </div>
                                        }
                                    </div>

                                    <div className="form-group col-md-6">
                                        <label>N° de documento <i className="fa fa-asterisk text-danger small"></i></label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className={`form-control ${documento ? "" : "is-invalid"}`}
                                                ref={this.refDocumento}
                                                value={documento}
                                                onChange={this.handleInputNumeroDocumento}
                                                onKeyDown={keyNumberInteger}
                                                placeholder='00000000' />
                                            <div className="input-group-append">
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    type="button"
                                                    title="Reniec"
                                                    onClick={this.handleGetApiReniec}>
                                                    <img src={images.reniec} alt="Reniec" width="12" />
                                                </button>
                                            </div>
                                            {
                                                documento === "" &&
                                                <div className="invalid-feedback">
                                                    Ingrese un valor.
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Apelldiso y Npmbres */}
                                <div className='row'>
                                    <div className="form-group col-md-12">
                                        <label>Apellidos y Nombres <i className="fa fa-asterisk text-danger small"></i></label>
                                        <input
                                            type="text"
                                            className={`form-control ${informacion ? "" : "is-invalid"}`}
                                            ref={this.refInformacion}
                                            value={informacion}
                                            onChange={this.handleInputInformacion}
                                            placeholder='Ingrese la razón social o apellidos y nombres'
                                        />
                                        {
                                            informacion === "" &&
                                            <div className="invalid-feedback">
                                                Ingrese un valor.
                                            </div>
                                        }
                                    </div>
                                </div>

                                {/* Genero, Fecha de Nacimiento y Estado civil */}
                                <div className="row">
                                    <div className="form-group col-md-4">
                                        <label>Genero <i className="fa fa-asterisk text-danger small"></i></label>
                                        <select
                                            className="form-control"
                                            ref={this.refGenero}
                                            value={genero}
                                            onChange={this.handleSelectGenero}>
                                            <option value="">-- Seleccione --</option>
                                            <option value="1">Masculino</option>
                                            <option value="2">Femenino</option>
                                        </select>
                                    </div>

                                    <div className="form-group col-md-4">
                                        <label>Estado Civil</label>
                                        <select
                                            className="form-control"
                                            value={estadoCivil}
                                            onChange={this.handleSelectEstadoCvil}>
                                            <option value="">-- seleccione --</option>
                                            <option value="1">Soltero(a)</option>
                                            <option value="2">Casado(a)</option>
                                            <option value="3">Viudo(a)</option>
                                            <option value="4">Divorciado(a)</option>
                                        </select>
                                    </div>

                                    <div className="form-group col-md-4">
                                        <label>Fecha de Nacimiento</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            ref={this.refFechaNacimiento}
                                            value={fechaNacimiento}
                                            onChange={this.handleInputFechaNacimiento}
                                        />
                                    </div>
                                </div>

                                {/* Observación */}
                                <div className='row'>
                                    <div className="form-group col-md-12">
                                        <label>Observación</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={observacion}
                                            onChange={this.handleInputObservacion}
                                            placeholder='Ingrese alguna observación' />
                                    </div>
                                </div>

                                {/* Número de celular y Teléfono */}
                                <div className='row'>
                                    <div className="form-group col-md-6 col-12">
                                        <label>N° de Celular </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={celular}
                                            ref={this.refCelular}
                                            onChange={this.handleInputCelular}
                                            onKeyDown={keyNumberPhone}
                                            placeholder='Ingrese el número de celular.' />
                                    </div>

                                    <div className="form-group col-md-6 col-12">
                                        <label>N° de Telefono</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={telefono}
                                            ref={this.refTelefono}
                                            onChange={this.handleInputTelefono}
                                            onKeyDown={keyNumberPhone}
                                            placeholder='Ingrese el número de telefono.' />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className='row'>
                                    <div className="form-group col-md-12">
                                        <label>E-Mail</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={email}
                                            onChange={this.handleInputEmail}
                                            placeholder='Ingrese el email' />
                                    </div>
                                </div>

                                {/* Dirección */}
                                <div className='row'>
                                    <div className="form-group col-md-12">
                                        <label>Dirección</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refDireccion}
                                            value={direccion}
                                            onChange={this.handleInputDireccion}
                                            placeholder='Ingrese la dirección' />
                                    </div>
                                </div>

                                {/* Ubigeo */}
                                <div className='row'>
                                    <div className="form-group col-md-12">
                                        <label>Ubigeo</label>
                                        <SearchBar
                                            placeholder="Escribe para iniciar a filtrar..."
                                            refTxtUbigeo={this.refUbigeo}
                                            ubigeo={ubigeo}
                                            filteredData={this.state.filteredData}
                                            onEventClearInput={this.handleClearInput}
                                            handleFilter={this.handleFilter}
                                            onEventSelectItem={this.handleSelectItem}
                                        />
                                    </div>
                                </div>

                                {/* Estado y Predeterminado */}
                                <div className="row">
                                    <div className="form-group col-md-6">
                                        <label>Estado:</label>
                                        <div className="custom-control custom-switch">
                                            <input
                                                type="checkbox"
                                                className="custom-control-input"
                                                id="switch1"
                                                checked={estado}
                                                onChange={this.handleInputEstado} />
                                            <label className="custom-control-label" htmlFor="switch1">{estado ? "Activo" : "Inactivo"}</label>
                                        </div>
                                    </div>

                                    <div className="form-group col-md-6">
                                        <label>Predeterminado:</label>
                                        <div className="custom-control custom-switch">
                                            <input
                                                type="checkbox"
                                                className="custom-control-input"
                                                id="switch2"
                                                checked={predeterminado}
                                                onChange={this.handleInputPredeterminado} />
                                            <label className="custom-control-label" htmlFor="switch2">{predeterminado ? "Si" : "No"}</label>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Contenedor persona juridica */}
                            <div className="tab-pane fade" id="contacto" role="tabpanel" aria-labelledby="contacto-tab">

                                {/* Tipo documento y Número de documento */}
                                <div className="row">
                                    <div className="form-group col-md-6">
                                        <label>Tipo Documento <i className="fa fa-asterisk text-danger small"></i></label>
                                        <select
                                            className={`form-control ${idTipoDocumentoPj ? "" : "is-invalid"}`}
                                            value={idTipoDocumentoPj}
                                            ref={this.refTipoDocumentoPj}
                                            onChange={this.handleSelectTipoDocumento}>
                                            <option value="">-- Seleccione --</option>
                                            {
                                                this.state.tiposDocumentos.filter(item => item.idTipoDocumento === 'TD0003').map((item, index) => (
                                                    <option key={index} value={item.idTipoDocumento}>{item.nombre}</option>
                                                ))
                                            }
                                        </select>
                                        {
                                            idTipoDocumentoPj === "" &&
                                            <div className="invalid-feedback">
                                                Seleccione un valor.
                                            </div>
                                        }
                                    </div>

                                    <div className="form-group col-md-6">
                                        <label>N° de documento <i className="fa fa-asterisk text-danger small"></i></label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className={`form-control ${documento ? "" : "is-invalid"}`}
                                                ref={this.refDocumento}
                                                value={documento}
                                                onChange={this.handleInputNumeroDocumento}
                                                onKeyDown={keyNumberInteger}
                                                placeholder='00000000' />
                                            <div className="input-group-append">
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    type="button"
                                                    title="Sunat"
                                                    onClick={this.handleGetApiSunat}>
                                                    <img src={images.sunat} alt="Sunat" width="12" />
                                                </button>
                                            </div>
                                            {
                                                documento === "" &&
                                                <div className="invalid-feedback">
                                                    Ingrese un valor.
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Razón Social */}
                                <div className='row'>
                                    <div className="form-group col-md-12">
                                        <label>Razón Social <i className="fa fa-asterisk text-danger small"></i></label>
                                        <input
                                            type="text"
                                            className={`form-control ${informacion ? "" : "is-invalid"}`}
                                            ref={this.refInformacion}
                                            value={informacion}
                                            onChange={this.handleInputInformacion}
                                            placeholder='Ingrese la razón social o apellidos y nombres'
                                        />
                                        {
                                            informacion === "" &&
                                            <div className="invalid-feedback">
                                                Ingrese un valor.
                                            </div>
                                        }
                                    </div>
                                </div>

                                {/* Número de celular y Teléfono */}
                                <div className='row'>
                                    <div className="form-group col-md-6 col-12">
                                        <label>N° de Celular <i className="fa fa-asterisk text-danger small"></i></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={this.state.celular}
                                            ref={this.refCelular}
                                            onChange={(event) => {
                                                if (event.target.value.trim().length > 0) {
                                                    this.setState({
                                                        celular: event.target.value,
                                                        messageWarning: '',
                                                    });
                                                } else {
                                                    this.setState({
                                                        celular: event.target.value,
                                                        messageWarning: 'Ingrese el número de celular.',
                                                    });
                                                }
                                            }}
                                            onKeyDown={keyNumberPhone}
                                            placeholder='Ingrese el número de celular.' />
                                    </div>

                                    <div className="form-group col-md-6 col-12">
                                        <label>N° de Telefono</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={this.state.telefono}
                                            ref={this.refTelefono}
                                            onChange={(event) => this.setState({ telefono: event.target.value, })}
                                            onKeyDown={keyNumberPhone}
                                            placeholder='Ingrese el número de telefono.' />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className='row'>
                                    <div className="form-group col-md-12">
                                        <label>E-Mail</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={this.state.email}
                                            onChange={(event) => this.setState({ email: event.target.value })}
                                            placeholder='Ingrese el email' />
                                    </div>
                                </div>

                                {/* Dirección */}
                                <div className='row'>
                                    <div className="form-group col-md-12">
                                        <label>Dirección</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={this.state.direccion}
                                            ref={this.refDireccion}
                                            onChange={(event) => this.setState({ direccion: event.target.value })}
                                            placeholder='Ingrese la dirección' />
                                    </div>
                                </div>

                                {/* Ubigeo */}
                                <div className='row'>
                                    <div className="form-group col-md-12">
                                        <label>Ubigeo</label>
                                        <SearchBar
                                            placeholder="Escribe para iniciar a filtrar..."
                                            refTxtUbigeo={this.refUbigeo}
                                            ubigeo={this.state.ubigeo}
                                            filteredData={this.state.filteredData}
                                            onEventClearInput={this.handleClearInput}
                                            handleFilter={this.handleFilter}
                                            onEventSelectItem={this.handleSelectItem}
                                        />
                                    </div>
                                </div>

                                {/* Estado y Predeterminado */}
                                <div className="row">
                                    <div className="form-group col-md-6 col-12">
                                        <label>Estado:</label>
                                        <div className="custom-control custom-switch">
                                            <input
                                                type="checkbox"
                                                className="custom-control-input"
                                                id="switch1"
                                                checked={this.state.estado}
                                                onChange={(value) => this.setState({ estado: value.target.checked })} />
                                            <label className="custom-control-label" htmlFor="switch1">{this.state.estado ? "Activo" : "Inactivo"}</label>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="row">
                    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                        <button type="button" className="btn btn-primary mr-2" onClick={() => this.handleSave()}>Guardar</button>
                        <button type="button" className="btn btn-danger" onClick={() => this.props.history.goBack()}>Cancelar</button>
                    </div>
                </div>

            </ContainerWrapper>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

export default connect(mapStateToProps, null)(ClienteAgregar);