import React from 'react';
import axios from 'axios';
import {
    keyNumberPhone,
    keyNumberInteger,
    spinnerLoading,
    convertNullText,
    ModalAlertInfo,
    ModalAlertSuccess,
    ModalAlertWarning,
} from '../../tools/Tools';
import { connect } from 'react-redux';
import reniec from '../../../recursos/images/reniec.png';
import sunat from '../../../recursos/images/sunat.png';

class ClienteProceso extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idCliente: '',
            idTipoDocumento: '',
            tiposDocumentos: [],
            documento: '',
            informacion: '',
            telefono: '',
            celular: '',
            fechaNacimiento: '',
            email: '',
            genero: '',
            direccion: '',
            ubigeo: '',
            estadoCivil: '',
            estado: true,
            observacion: '',
            idUsuario: this.props.token.userToken.idUsuario,

            loading: true,
            messageWarning: '',
            msgLoading: 'Cargando datos...',
        }

        this.refTipoDocumento = React.createRef();
        this.refDocumento = React.createRef();
        this.refInformacion = React.createRef();
        this.refCelular = React.createRef();

        this.refDireccion = React.createRef();

        this.abortControllerTable = new AbortController();
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    async componentDidMount() {
        const url = this.props.location.search;
        const idcliente = new URLSearchParams(url).get("idCliente");
        if (idcliente !== null) {
            this.loadDataId(idcliente)
        } else {
            this.loadData();
        }
    }

    componentWillUnmount() {
        this.abortControllerTable.abort();
    }

    loadData = async () => {
        try {
            const documento = await axios.get("/api/tipodcumento/listcombo", {
                signal: this.abortControllerTable.signal,
            });

            await this.setStateAsync({
                tiposDocumentos: documento.data,

                loading: false
            })
        } catch (error) {
            if (error.message !== "canceled") {
                await this.setStateAsync({
                    msgLoading: "Se produjo un error un interno, intente nuevamente."
                });
            }
        }
    }

    loadDataId = async (id) => {
        try {
            const documento = await axios.get("/api/tipodcumento/listcombo", {
                signal: this.abortControllerTable.signal
            });

            const cliente = await axios.get("/api/cliente/id", {
                signal: this.abortControllerTable.signal,
                params: {
                    idCliente: id
                }
            });

            await this.setStateAsync({
                idTipoDocumento: cliente.data.idTipoDocumento,
                documento: cliente.data.documento,
                informacion: cliente.data.informacion,
                telefono: cliente.data.telefono,
                celular: cliente.data.celular,
                fechaNacimiento: cliente.data.fechaNacimiento,
                email: cliente.data.email,
                genero: cliente.data.genero,
                direccion: cliente.data.direccion,
                ubigeo: cliente.data.ubigeo,
                estadoCivil: cliente.data.estadoCivil,
                estado: cliente.data.estado,
                observacion: cliente.data.observacion,
                idCliente: cliente.data.idCliente,

                tiposDocumentos: documento.data,

                loading: false
            })
        } catch (error) {
            if (error.message !== "canceled") {
                await this.setStateAsync({
                    msgLoading: "Se produjo un error un interno, intente nuevamente."
                });
            }
        }
    }

    async onEventGuardar() {
        if (this.state.idTipoDocumento === "") {
            this.setState({ messageWarning: "Seleccione el tipo de documento." });
            this.refTipoDocumento.current.focus();
            return;
        }

        if (this.state.documento === "") {
            this.setState({ messageWarning: "Ingrese el número de documento." });
            this.refDocumento.current.focus();
            return;
        }

        if (this.state.informacion === "") {
            this.setState({ messageWarning: "Ingrese los apellidos y nombres." })
            this.refInformacion.current.focus();
            return;
        }

        if (this.state.celular === "") {
            this.setState({ messageWarning: "Ingrese el número de celular." });
            this.refCelular.current.focus();
            return;
        }

        try {
            ModalAlertInfo("Cliente", "Procesando información...");
            if (this.state.idCliente !== '') {
                const cliente = await axios.post('/api/cliente/update', {
                    "idTipoDocumento": this.state.idTipoDocumento,
                    "documento": this.state.documento.toString().trim().toUpperCase(),
                    "informacion": this.state.informacion.trim().toUpperCase(),
                    "telefono": this.state.telefono.toString().trim().toUpperCase(),
                    "celular": this.state.celular.toString().trim().toUpperCase(),
                    "fechaNacimiento": this.state.fechaNacimiento,
                    "email": this.state.email.trim().toUpperCase(),
                    "genero": this.state.genero,
                    "direccion": this.state.direccion.trim().toUpperCase(),
                    "ubigeo": this.state.ubigeo.trim().toUpperCase(),
                    "estadoCivil": this.state.estadoCivil,
                    "estado": this.state.estado,
                    "observacion": this.state.observacion.trim().toUpperCase(),
                    "idUsuario": this.state.idUsuario,
                    //idCliente
                    "idCliente": this.state.idCliente
                })
                ModalAlertSuccess("Cliente", cliente.data, () => {
                    this.props.history.goBack();
                });
            } else {
                const cliente = await axios.post('/api/cliente/add', {
                    "idTipoDocumento": this.state.idTipoDocumento,
                    "documento": this.state.documento.toString().trim().toUpperCase(),
                    "informacion": this.state.informacion.trim().toUpperCase(),
                    "telefono": this.state.telefono.toString().trim().toUpperCase(),
                    "celular": this.state.celular.toString().trim().toUpperCase(),
                    "fechaNacimiento": this.state.fechaNacimiento,
                    "email": this.state.email.trim().toUpperCase(),
                    "genero": this.state.genero,
                    "direccion": this.state.direccion.trim().toUpperCase(),
                    "ubigeo": this.state.ubigeo.trim().toUpperCase(),
                    "estadoCivil": this.state.estadoCivil,
                    "estado": this.state.estado,
                    "observacion": this.state.observacion.trim().toUpperCase(),
                    "idUsuario": this.state.idUsuario
                });
                ModalAlertSuccess("Cliente", cliente.data, () => {
                    this.props.history.goBack();
                });
            }
        } catch (error) {
            if (error.response != null) {
                ModalAlertWarning("Proyecto", error.response.data);
            } else {
                ModalAlertWarning("Proyecto", "Se produjo un error un interno, intente nuevamente.");
            }
        }
    }

    async onEventGetApiReniec() {
        if (this.state.documento.length !== 8) {
            this.setState({ messageWarning: "Para iniciar la busqueda en número dni debe tener 8 caracteres." });
            return;
        }
        try {
            await this.setStateAsync({
                loading: true,
                msgLoading: 'Consultando número de DNI...',
            });

            let result = await axios.get("https://dniruc.apisperu.com/api/v1/dni/" + this.state.documento + "?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImFsZXhhbmRlcl9keF8xMEBob3RtYWlsLmNvbSJ9.6TLycBwcRyW1d-f_hhCoWK1yOWG_HJvXo8b-EoS5MhE", {
                timeout: 5000,
            });

            await this.setStateAsync({
                documento: convertNullText(result.data.dni),
                informacion: convertNullText(result.data.apellidoMaterno) + " " + convertNullText(result.data.apellidoPaterno) + " " + convertNullText(result.data.nombres),
                loading: false,
            });
        } catch (error) {

        }
    }

    async onEventGetApiSunat() {
        if (this.state.documento.length !== 11) {
            this.setState({ messageWarning: "Para iniciar la busqueda en número ruc debe tener 11 caracteres." });
            return;
        }
        try {
            await this.setStateAsync({
                loading: true,
                msgLoading: 'Consultando número de RUC...',
            });

            let result = await axios.get("https://dniruc.apisperu.com/api/v1/ruc/" + this.state.documento + "?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImFsZXhhbmRlcl9keF8xMEBob3RtYWlsLmNvbSJ9.6TLycBwcRyW1d-f_hhCoWK1yOWG_HJvXo8b-EoS5MhE", {
                timeout: 5000,
            });
            await this.setStateAsync({
                documento: convertNullText(result.data.ruc),
                informacion: convertNullText(result.data.razonSocial),
                direccion: convertNullText(result.data.direccion),
                loading: false,
            });
        } catch (error) {

        }
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
                    this.state.messageWarning === '' ? null :
                        <div className="alert alert-warning" role="alert">
                            <i className="bi bi-exclamation-diamond-fill"></i> {this.state.messageWarning}
                        </div>
                }

                <div className="row">
                    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                        <div className="form-group">
                            <label>Tipo Documento <i className="fa fa-asterisk text-danger small"></i></label>
                            <select
                                className="form-control"
                                value={this.state.idTipoDocumento}
                                ref={this.refTipoDocumento}
                                onChange={(event) => {
                                    if (event.target.value.trim().length > 0) {
                                        this.setState({
                                            idTipoDocumento: event.target.value,
                                            messageWarning: '',
                                        });
                                    } else {
                                        this.setState({
                                            idTipoDocumento: event.target.value,
                                            messageWarning: 'Seleccione el tipo de documento',
                                        });
                                    }
                                }}>
                                <option value="">-- Seleccione --</option>
                                {
                                    this.state.tiposDocumentos.map((item, index) => (
                                        <option key={index} value={item.idTipoDocumento}>{item.nombre}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                        <div className="form-group">
                            <label>N° de documento <i className="fa fa-asterisk text-danger small"></i></label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    ref={this.refDocumento}
                                    value={this.state.documento}
                                    onChange={(event) => {
                                        if (event.target.value.trim().length > 0) {
                                            this.setState({
                                                documento: event.target.value,
                                                messageWarning: '',
                                            });
                                        } else {
                                            this.setState({
                                                documento: event.target.value,
                                                messageWarning: 'Ingrese el número de documento',
                                            });
                                        }
                                    }}
                                    onKeyPress={keyNumberInteger}
                                    placeholder='00000000' />
                                <div className="input-group-append">
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        title="Reniec"
                                        onClick={() => this.onEventGetApiReniec()}>
                                        <img src={reniec} alt="Reniec" width="12" />
                                    </button>
                                </div>
                                <div className="input-group-append">
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        title="Sunat"
                                        onClick={() => this.onEventGetApiSunat()}>
                                        <img src={sunat} alt="Sunat" width="12" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                        <div className="form-group">
                            <label>Razón Social/Apellidos y Nombres <i className="fa fa-asterisk text-danger small"></i></label>
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.informacion}
                                onChange={(event) => {
                                    if (event.target.value.trim().length > 0) {
                                        this.setState({
                                            informacion: event.target.value,
                                            messageWarning: '',
                                        });
                                    } else {
                                        this.setState({
                                            informacion: event.target.value,
                                            messageWarning: 'Ingrese la razón social o apellidos y nombres',
                                        });
                                    }
                                }}
                                placeholder='Ingrese la razón social o apellidos y nombres' />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                        <div className="form-group">
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
                                onKeyPress={keyNumberPhone}
                                placeholder='Ingrese el número de celular.' />
                        </div>
                    </div>
                    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                        <div className="form-group">
                            <label>N° de Telefono</label>
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.telefono}
                                ref={this.refTelefono}
                                onChange={(event) => this.setState({ telefono: event.target.value, })}
                                onKeyPress={keyNumberPhone}
                                placeholder='Ingrese el número de telefono.' />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-12">
                        <div className="form-group">
                            <label>Fecha de Nacimiento</label>
                            <input
                                type="date"
                                className="form-control"
                                value={this.state.fechaNacimiento}
                                onChange={(event) => this.setState({ fechaNacimiento: event.target.value })}
                            />
                        </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-12">
                        <div className="form-group">
                            <label>E-Mail</label>
                            <input
                                type="email"
                                className="form-control"
                                value={this.state.email}
                                onChange={(event) => this.setState({ email: event.target.value })}
                                placeholder='Ingrese el email' />
                        </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-12">
                        <div className="form-group">
                            <label>Genero</label>
                            <select
                                className="form-control"
                                value={this.state.genero}
                                onChange={(event) => this.setState({ genero: event.target.value })}>
                                <option value="">-- Seleccione --</option>
                                <option value="1">Masculino</option>
                                <option value="2">Femenino</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                        <div className="form-group">
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
                    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                        <div className="form-group">
                            <label>Ubigeo</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    ref={this.refUbigeo}
                                    value={this.state.ubigeo}
                                    onChange={(event) => this.setState({ ubigeo: event.target.value })}
                                    placeholder="Ingrese el ubigeo" />
                                <div className="input-group-append">
                                    <button className="btn btn-outline-secondary" type="button" title="Ubigeo" onClick={() => console.log("ubigeo")}><i className="bi bi-building"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                        <div className="form-group">
                            <label>Estado Civil</label>
                            <select
                                className="form-control"
                                value={this.state.estadoCivil}
                                onChange={(event) => this.setState({ estadoCivil: event.target.value })}>
                                <option value="">-- seleccione --</option>
                                <option value="1">Soltero(a)</option>
                                <option value="2">Casado(a)</option>
                                <option value="3">Viudo(a)</option>
                                <option value="4">Divorciado(a)</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                        <div className="form-group">
                            <label>Estado:</label>
                            <div className="custom-control custom-switch">
                                <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    id="switch1"
                                    checked={this.state.estado}
                                    onChange={(value) => this.setState({ estado: value.target.checked })} />
                                <label className="custom-control-label" htmlFor="switch1">{this.state.estado === true ? "Activo" : "Inactivo"}</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                        <div className="form-group">
                            <label>Observación</label>
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.observacion}
                                onChange={(event) => this.setState({ observacion: event.target.value })}
                                placeholder='Ingrese alguna observación' />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                        <button type="button" className="btn btn-primary mr-2" onClick={() => this.onEventGuardar()}>Guardar</button>
                        <button type="button" className="btn btn-danger" onClick={() => this.props.history.goBack()}>Cancelar</button>
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

export default connect(mapStateToProps, null)(ClienteProceso);