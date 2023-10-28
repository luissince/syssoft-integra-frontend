import React from 'react';
import {
    alertDialog,
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
import { editCliente, getClienteId, getUbigeo, listComboTipoDocumento } from '../../../../network/rest/principal.network';
import { getDni, getRuc } from '../../../../network/rest/apisperu.network';
import { CANCELED } from '../../../../model/types/types';
import CustomComponent from '../../../../model/class/custom-component';

class ClienteEditar extends CustomComponent {
    constructor(props) {
        super(props);
        this.state = {
            tipo: 0,
            idCliente: '',
            // persona natural
            idTipoDocumentoPn: '',
            documentoPn: '',
            informacionPn: '',
            telefonoPn: '',
            celularPn: '',
            fechaNacimiento: currentDate(),
            emailPn: '',
            genero: '',
            direccionPn: '',

            idUbigeoPn: '',
            ubigeoPn: '',

            estadoCivil: '',
            predeterminado: false,
            estadoPn: true,
            observacion: '',

            // persona juridica
            idTipoDocumentoPj: '',
            documentoPj: '',
            informacionPj: '',
            telefonoPj: '',
            celularPj: '',
            emailPj: '',
            direccionPj: '',
            idUbigeoPj: '',
            ubigeoPj: '',
            estadoPj: true,

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
        this.refDocumentoPn = React.createRef();
        this.refInformacionPn = React.createRef();
        this.refCelularPn = React.createRef();
        this.refTelefonoPn = React.createRef();
        this.refGenero = React.createRef();

        this.refDireccionPn = React.createRef();
        this.refUbigeoPn = React.createRef();
        this.refFechaNacimiento = React.createRef();

        // Persona juridica
        this.refTipoDocumentoPj = React.createRef();
        this.refDocumentoPj = React.createRef();
        this.refInformacionPj = React.createRef();
        this.refCelularPj = React.createRef();
        this.refTelefonoPj = React.createRef();

        this.refDireccionPj = React.createRef();
        this.refDireccionPj = React.createRef();
        this.refUbigeoPj = React.createRef();

        this.abortControllerTable = new AbortController();

        this.selectItem = false;
    }

    async componentDidMount() {
        const url = this.props.location.search;
        const idcliente = new URLSearchParams(url).get("idCliente");
        if (isText(idcliente)) {
            this.loadingDataId(idcliente)
        } else {
            this.props.history.goBack()
        }
    }

    componentWillUnmount() {
        this.abortControllerTable.abort();
    }

    loadingDataId = async (id) => {
        const params = {
            "idCliente": id
        }

        const [documentos, cliente] = await Promise.all([
            await this.fetchTipoDocumento(),
            await this.fetchClienteId(params)
        ]);

        if (cliente === null) {
            await this.setStateAsync({
                msgLoading: "Se produjo un error un interno, intente nuevamente."
            });
            return;
        }

        if (cliente.idCliente.startsWith("CN")) {
            this.handleFocusTab("personaNatural-tab", "datosPn")
            await this.setStateAsync({
                tipo: 1,
                idCliente: cliente.idCliente,
                idTipoDocumentoPn: cliente.idTipoDocumento,
                documentoPn: cliente.documento,
                informacionPn: cliente.informacion,
                telefonoPn: cliente.telefono,
                celularPn: cliente.celular,
                fechaNacimiento: cliente.fechaNacimiento,
                emailPn: cliente.email,
                genero: cliente.genero,
                direccionPn: cliente.direccion,

                idUbigeoPn: cliente.idUbigeo === 0 ? '' : cliente.idUbigeo.toString(),
                ubigeoPn: cliente.ubigeo === '' ? '' : cliente.departamento + "-" + cliente.provincia + "-" + cliente.distrito + " (" + cliente.ubigeo + ")",

                estadoCivil: cliente.estadoCivil,
                predeterminado: cliente.predeterminado,
                estadoPn: cliente.estado,
                observacion: cliente.observacion,

                tiposDocumentos: documentos,

                loading: false
            })

            this.selectItem = cliente.idUbigeo === 0 ? false : true;
        } else {
            this.handleFocusTab("personaJuridica-tab", "datosPj")
            await this.setStateAsync({
                tipo: 2,
                idCliente: cliente.idCliente,
                idTipoDocumentoPj: cliente.idTipoDocumento,
                documentoPj: cliente.documento,
                informacionPj: cliente.informacion,
                telefonoPj: cliente.telefono,
                celularPj: cliente.celular,
                emailPj: cliente.email,
                direccionPj: cliente.direccion,

                idUbigeoPj: cliente.idUbigeo === 0 ? '' : cliente.idUbigeo.toString(),
                ubigeoPj: cliente.ubigeo === '' ? '' : cliente.departamento + "-" + cliente.provincia + "-" + cliente.distrito + " (" + cliente.ubigeo + ")",

                estadoPj: cliente.estado,

                tiposDocumentos: documentos,

                loading: false
            })

            this.selectItem = cliente.idUbigeo === 0 ? false : true;
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

    handleSelectTipoDocumentoPn = (event) => {
        const messageWarning = event.target.value.trim().length > 0 ? '' : 'Seleccione el tipo de documento';

        this.setState({
            idTipoDocumentoPn: event.target.value,
            messageWarning: messageWarning
        });
    }

    handleSelectTipoDocumentoPj = (event) => {
        const messageWarning = event.target.value.trim().length > 0 ? '' : 'Seleccione el tipo de documento';

        this.setState({
            idTipoDocumentoPj: event.target.value,
            messageWarning: messageWarning
        });
    }

    handleInputNumeroDocumentoPn = (event) => {
        const messageWarning = event.target.value.trim().length > 0 ? "" : "Ingrese el número de documento";

        this.setState({
            documentoPn: event.target.value,
            messageWarning: messageWarning,
        });
    }

    handleInputNumeroDocumentoPj = (event) => {
        const messageWarning = event.target.value.trim().length > 0 ? "" : "Ingrese el número de documento";

        this.setState({
            documentoPj: event.target.value,
            messageWarning: messageWarning,
        });
    }

    handleInputInformacionPn = (event) => {
        const messageWarning = event.target.value.trim().length > 0 ? '' : "Ingrese la razón social o apellidos y nombres";
        
        this.setState({
            informacionPn: event.target.value,
            messageWarning: messageWarning
        });
    }

    handleInputInformacionPj = (event) => {
        const messageWarning = event.target.value.trim().length > 0 ? '' : "Ingrese la razón social o apellidos y nombres";

        this.setState({
            informacionPj: event.target.value,
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
            celularPn: event.target.value
        });
    }


    handleInputTelefono = (event) => {
        this.setState({ telefonoPn: event.target.value, })
    }


    handleInputEmail = (event) => {
        this.setState({ emailPn: event.target.value })
    }


    handleInputDireccion = (event) => {
        this.setState({ direccionPn: event.target.value })
    }


    handleInputEstado = (value) => {
        this.setState({ estadoPn: value.target.checked })
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
        if (this.state.documentoPn.length !== 8) {
            this.setState({
                messageWarning: "Para iniciar la busqueda en número dni debe tener 8 caracteres."
            });
            return;
        }

        this.setState({
            loading: true,
            msgLoading: 'Consultando número de DNI...',
        });

        const response = await getDni(this.state.documentoPn);

        if (response instanceof SuccessReponse) {
            this.setState({
                documentoPn: convertNullText(response.data.dni),
                informacionPn: convertNullText(response.data.apellidoPaterno) + " " + convertNullText(response.data.apellidoMaterno) + " " + convertNullText(response.data.nombres),
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
        if (this.state.documentoPj.length !== 11) {
            this.setState({
                messageWarning: "Para iniciar la busqueda en número ruc debe tener 11 caracteres."
            });
            return;
        }

        this.setState({
            loading: true,
            msgLoading: 'Consultando número de RUC...',
        });

        const response = await getRuc(this.state.documentoPj);

        if (response instanceof SuccessReponse) {
            this.setState({
                documentoPj: convertNullText(response.data.ruc),
                informacionPj: convertNullText(response.data.razonSocial),
                direccionPj: convertNullText(response.data.direccion),
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

    handleFilterPn = async (event) => {

        const searchWord = this.selectItem ? "" : event.target.value;
        await this.setStateAsync({ idUbigeoPn: '', ubigeoPn: searchWord });
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

    handleFilterPj = async (event) => {

        const searchWord = this.selectItem ? "" : event.target.value;
        await this.setStateAsync({ idUbigeoPj: '', ubigeoPj: searchWord });
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

    handleSelectItemPn = async (value) => {
        await this.setStateAsync({
            ubigeoPn: value.departamento + "-" + value.provincia + "-" + value.distrito + " (" + value.ubigeo + ")",
            filteredData: [],
            idUbigeoPn: value.idUbigeo
        });
        this.selectItem = true;
    }

    handleSelectItemPj = async (value) => {
        await this.setStateAsync({
            ubigeoPj: value.departamento + "-" + value.provincia + "-" + value.distrito + " (" + value.ubigeo + ")",
            filteredData: [],
            idUbigeoPj: value.idUbigeo
        });
        this.selectItem = true;
    }

    handleClearInput = async () => {
        await this.setStateAsync({ filteredData: [], idUbigeo: '', ubigeo: "" });
        this.selectItem = false;
    }

    handleGuardarPNatural =  async () => {
        if (!isText(this.state.idTipoDocumentoPn)) {
            this.setState({ messageWarning: "Seleccione el tipo de documento." });
            this.refTipoDocumentoPn.current.focus();
            return;
        }

        if (!isText(this.state.documentoPn)) {
            this.setState({ messageWarning: "Ingrese el número de documento." });
            this.refDocumentoPn.current.focus();
            return;
        }

        if (!isText(this.state.informacionPn)) {
            this.setState({ messageWarning: "Ingrese los apellidos y nombres." });
            this.refInformacionPn.current.focus();
            return;
        }

        alertDialog("Cliente", "¿Estás seguro de continuar?", async (event) => {
            if (event) {
                alertInfo("Cliente", "Procesando información...");
                
                const data = {
                    "tipo": this.state.tipo,
                    "idCliente": this.state.idCliente,
                    "idTipoDocumento": this.state.idTipoDocumentoPn,
                    "documento": this.state.documentoPn.toString().trim().toUpperCase(),
                    "informacion": this.state.informacionPn.trim().toUpperCase(),
                    "telefono": this.state.telefonoPn.toString().trim().toUpperCase(),
                    "celular": this.state.celularPn.toString().trim().toUpperCase(),
                    "fechaNacimiento": this.state.fechaNacimiento,
                    "email": this.state.emailPn.trim(),
                    "genero": this.state.genero,
                    "direccion": this.state.direccionPn.trim().toUpperCase(),
                    "idUbigeo": this.state.idUbigeoPn,
                    "estadoCivil": this.state.estadoCivil,
                    "predeterminado": this.state.predeterminado,
                    "estado": this.state.estadoPn,
                    "observacion": this.state.observacion.trim().toUpperCase(),
                    "idUsuario": this.state.idUsuario
                }

                const response = await editCliente(data);
                if (response instanceof SuccessReponse) {
                    alertSuccess("Cliente", response.data, () => {
                        this.props.history.goBack();
                    });
                }

                if (response instanceof ErrorResponse) {
                    alertWarning("Cliente", response.getMessage())
                }
            }
        });
    }

    handleGuardarPJuridica = async () => {
        if (this.state.idTipoDocumentoPj === "") {
            this.setState({ messageWarning: "Seleccione el tipo de documento." });
            this.refTipoDocumentoPj.current.focus();
            return;
        }

        if (this.state.documentoPj === "") {
            this.setState({ messageWarning: "Ingrese el número de documento." });
            this.refDocumentoPj.current.focus();
            return;
        }

        if (this.state.informacionPj === "") {
            this.setState({ messageWarning: "Ingrese los apellidos y nombres." });
            this.refInformacionPj.current.focus();
            return;
        }

        if (this.state.celularPj === "") {
            this.setState({ messageWarning: "Ingrese el número de celular." });
            this.refCelularPj.current.focus();
            return;
        }

        alertDialog("Producto", "¿Estás seguro de continuar?", async (event) => {
            if (event) {

                alertInfo("Cliente", "Procesando información...");
                const data = {
                    "tipo": this.state.tipo,
                    "idCliente": this.state.idCliente,
                    "idTipoDocumento": this.state.idTipoDocumentoPj,
                    "documento": this.state.documentoPj.toString().trim().toUpperCase(),
                    "informacion": this.state.informacionPj.trim().toUpperCase(),
                    "telefono": this.state.telefonoPj.toString().trim().toUpperCase(),
                    "celular": this.state.celularPj.toString().trim().toUpperCase(),
                    "email": this.state.emailPj.trim(),
                    "direccion": this.state.direccionPj.trim().toUpperCase(),
                    "idUbigeo": this.state.idUbigeoPj,
                    "estado": this.state.estadoPj,
                    "observacion": this.state.observacion.trim().toUpperCase(),
                    "idUsuario": this.state.idUsuario
                }

                const response = await editCliente(data);
                if (response instanceof SuccessReponse) {
                    alertSuccess("Cliente", response.data, () => {
                        this.props.history.goBack();
                    });
                }

                if (response instanceof ErrorResponse) {
                    alertWarning("Cliente", response.getMessage())
                }
            }
        });
    }

    handleSave = () => {
        
        if (this.state.tipo === 1) {
            this.handleGuardarPNatural();
        } else {
            this.handleGuardarPJuridica();
        }
    }

    render() {
        const { idTipoDocumentoPn, documentoPn, informacionPn, genero, estadoCivil, fechaNacimiento, observacion, celularPn, telefonoPn, emailPn, direccionPn, ubigeoPn, estadoPn, predeterminado } = this.state;

        const { idTipoDocumentoPj, documentoPj, informacionPj, celularPj, telefonoPj, emailPj, direccionPj, ubigeoPj, estadoPj } = this.state;

        return (
            <ContainerWrapper>
                {
                    this.state.loading && spinnerLoading(this.state.msgLoading)
                }

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <section className="content-header">
                            <h5>
                                <span role="button" onClick={() => this.props.history.goBack()}><i className="bi bi-arrow-left-short"></i></span> Registrar Cliente
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
                                    id="personaNatural-tab"
                                    data-bs-toggle="tab"
                                    href="#datosPn"
                                    role="tab"
                                    aria-controls="datosPn"
                                    aria-selected={true}
                                    onClick={() => this.setState({ tipo: 1 })}>
                                    <i className="bi bi-person"></i> Persona Natural
                                </a>
                            </li>
                            {/* Persona Juridica */}
                            <li className="nav-item" role="presentation">
                                <a className="nav-link"
                                    id="personaJuridica-tab"
                                    data-bs-toggle="tab"
                                    href="#datosPj"
                                    role="tab"
                                    aria-controls="datosPj"
                                    aria-selected={false}
                                    onClick={() => this.setState({ tipo: 2 })}>
                                    <i className="bi bi-building"></i> Persona Juridica
                                </a>
                            </li>
                        </ul>

                        <div className="tab-content pt-2" id="myTabContent">
                            {/* Contenedor person natural  */}
                            <div className="tab-pane fade show active" id="datosPn" role="tabpanel" aria-labelledby="personaNatural-tab">

                                {/* Tipo documento y Número de documento */}
                                <div className="row">
                                    <div className="form-group col-md-6">
                                        <label>Tipo Documento <i className="fa fa-asterisk text-danger small"></i></label>
                                        <select
                                            className={`form-control ${idTipoDocumentoPn ? "" : "is-invalid"}`}
                                            value={idTipoDocumentoPn}
                                            ref={this.refTipoDocumentoPn}
                                            onChange={this.handleSelectTipoDocumentoPn}>
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
                                                className={`form-control ${documentoPn ? "" : "is-invalid"}`}
                                                ref={this.refDocumentoPn}
                                                value={documentoPn}
                                                onChange={this.handleInputNumeroDocumentoPn}
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
                                                documentoPn === "" &&
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
                                            className={`form-control ${informacionPn ? "" : "is-invalid"}`}
                                            ref={this.refInformacion}
                                            value={informacionPn}
                                            onChange={this.handleInputInformacionPn}
                                            placeholder='Ingrese la razón social o apellidos y nombres'
                                        />
                                        {
                                            informacionPn === "" &&
                                            <div className="invalid-feedback">
                                                Ingrese un valor.
                                            </div>
                                        }
                                    </div>
                                </div>

                                {/* Genero, Fecha de Nacimiento y Estado civil */}
                                <div className="row">
                                    <div className="form-group col-md-4">
                                        <label>Genero </label>
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
                                            value={celularPn}
                                            ref={this.refCelularPn}
                                            onChange={this.handleInputCelular}
                                            onKeyDown={keyNumberPhone}
                                            placeholder='Ingrese el número de celular.' />
                                    </div>

                                    <div className="form-group col-md-6 col-12">
                                        <label>N° de Telefono</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={telefonoPn}
                                            ref={this.refTelefonoPn}
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
                                            value={emailPn}
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
                                            ref={this.refDireccionPn}
                                            value={direccionPn}
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
                                            refTxtUbigeo={this.refUbigeoPn}
                                            ubigeo={ubigeoPn}
                                            filteredData={this.state.filteredData}
                                            onEventClearInput={this.handleClearInput}
                                            handleFilter={this.handleFilterPn}
                                            onEventSelectItem={this.handleSelectItemPn}
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
                                                checked={estadoPn}
                                                onChange={this.handleInputEstado} />
                                            <label className="custom-control-label" htmlFor="switch1">{estadoPn ? "Activo" : "Inactivo"}</label>
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
                            <div className="tab-pane fade" id="datosPj" role="tabpanel" aria-labelledby="personaJuridica-tab">

                                {/* Tipo documento y Número de documento */}
                                <div className="row">
                                    <div className="form-group col-md-6">
                                        <label>Tipo Documento <i className="fa fa-asterisk text-danger small"></i></label>
                                        <select
                                            className={`form-control ${idTipoDocumentoPj ? "" : "is-invalid"}`}
                                            value={idTipoDocumentoPj}
                                            ref={this.refTipoDocumentoPj}
                                            onChange={this.handleSelectTipoDocumentoPj}>
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
                                                className={`form-control ${documentoPj ? "" : "is-invalid"}`}
                                                ref={this.refDocumentoPj}
                                                value={documentoPj}
                                                onChange={this.handleInputNumeroDocumentoPj}
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
                                                documentoPj === "" &&
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
                                            className={`form-control ${informacionPj ? "" : "is-invalid"}`}
                                            ref={this.refInformacionPj}
                                            value={informacionPj}
                                            onChange={this.handleInputInformacionPj}
                                            placeholder='Ingrese la razón social o apellidos y nombres'
                                        />
                                        {
                                            informacionPj === "" &&
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
                                            value={celularPj}
                                            ref={this.refCelularPj}
                                            onChange={(event) => {
                                                if (event.target.value.trim().length > 0) {
                                                    this.setState({
                                                        celularPj: event.target.value,
                                                        messageWarning: '',
                                                    });
                                                } else {
                                                    this.setState({
                                                        celularPj: event.target.value,
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
                                            value={telefonoPj}
                                            ref={this.refTelefonoPj}
                                            onChange={(event) => this.setState({ telefonoPj: event.target.value, })}
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
                                            value={emailPj}
                                            onChange={(event) => this.setState({ emailPj: event.target.value })}
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
                                            value={direccionPj}
                                            ref={this.refDireccionPj}
                                            onChange={(event) => this.setState({ direccionPj: event.target.value })}
                                            placeholder='Ingrese la dirección' />
                                    </div>
                                </div>

                                {/* Ubigeo */}
                                <div className='row'>
                                    <div className="form-group col-md-12">
                                        <label>Ubigeo</label>
                                        <SearchBar
                                            placeholder="Escribe para iniciar a filtrar..."
                                            refTxtUbigeo={this.refUbigeoPj}
                                            ubigeo={ubigeoPj}
                                            filteredData={this.state.filteredData}
                                            onEventClearInput={this.handleClearInput}
                                            handleFilter={this.handleFilterPj}
                                            onEventSelectItem={this.handleSelectItemPj}
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
                                                id="switch3"
                                                checked={estadoPj}
                                                onChange={(value) => this.setState({ estadoPj: value.target.checked })} />
                                            <label className="custom-control-label" htmlFor="switch3">{this.state.estadoPj ? "Activo" : "Inactivo"}</label>
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

export default connect(mapStateToProps, null)(ClienteEditar);