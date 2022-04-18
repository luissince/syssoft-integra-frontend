import React from 'react';
import axios from 'axios';
import { keyNumberFloat, isNumeric, spinnerLoading } from '../../tools/Tools'


class ClienteProceso extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idCliente: '',

            tipoDocumento: '',
            numDocumento: '',
            infoCliente: '',
            telefono: '',
            fechaNacimiento: '',
            email: '',
            genero: '',
            direccion: '',
            ubigeo: '',
            estadoCivil: '',
            estado: true,
            observacion: '',

            loading: true,
            messageWarning: '',
            msgLoading: 'Cargando datos...',

        }

        this.refTipoDocumento = React.createRef();
        this.refNumDocumento = React.createRef();
        this.refInfoCliente = React.createRef();
        this.refTelefono = React.createRef();

        this.refDireccion = React.createRef();

    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    async componentDidMount() {

        let url = this.props.location.search;
        let idResult = new URLSearchParams(url).get("idCliente");

        await this.setStateAsync({
            idCliente: idResult
        })

        if (this.state.idCliente === '') {
            await this.setStateAsync({loading: false})
            this.refTipoDocumento.current.focus();
            
        } else {
            await this.setStateAsync({loading: true})
            this.loadDataId(this.state.idCliente)
            
        }

    }

    loadDataId = async (id) => {
        try {

            const result = await axios.get("/api/cliente/id", {
                params: {
                    idCliente: id
                }
            });

            await this.setStateAsync({
                tipoDocumento: result.data.tipoDocumento,
                numDocumento: result.data.numDocumento,
                infoCliente: result.data.infoCliente,
                telefono: result.data.telefono,
                fechaNacimiento: result.data.fechaNacimiento,
                email: result.data.email,
                genero: result.data.genero,
                direccion: result.data.direccion,
                ubigeo: result.data.ubigeo,
                estadoCivil: result.data.estadoCivil,
                estado: result.data.estado,
                observacion: result.data.observacion,
                idCliente: result.data.idCliente,
                loading: false
                
            })


        } catch (error) {
            await this.setStateAsync({
                msgLoading: "Se produjo un error interno, intente nuevamente."
              });
            console.log(error)
        }
    }

    async onSaveProceso() {
        // console.log(this.state)

        if (this.state.tipoDocumento === "") {
            this.setState({ messageWarning: "seleccione el tipo de documento" });
            this.refTipoDocumento.current.focus();
        } else if (this.state.numDocumento === "") {
            this.setState({ messageWarning: "Ingrese el número de documento" });
            this.refNumDocumento.current.focus();
        } else if (this.state.infoCliente === "") {
            this.setState({ messageWarning: "Ingrese los apellidos y nombres" })
            this.refInfoCliente.current.focus();
        } else if (this.state.telefono === "") {
            this.setState({ messageWarning: "Ingrese el número de celular o telefono" });
            this.refTelefono.current.focus();
        } else if (this.state.direccion === "") {
            this.setState({ messageWarning: "Ingrese la dirección" });
            this.refDireccion.current.focus();
        } else {

            try {

                let result = null
                if (this.state.idCliente !== '') {
                    result = await axios.post('/api/cliente/update', {
                        "tipoDocumento": this.refTipoDocumento.current.value,
                        "numDocumento": this.state.numDocumento.toString().trim().toUpperCase(),
                        "infoCliente": this.state.infoCliente.trim().toUpperCase(),
                        "telefono": this.state.telefono.toString().trim().toUpperCase(),
                        "fechaNacimiento": this.state.fechaNacimiento,
                        "email": this.state.email.trim().toUpperCase(),
                        "genero": this.state.genero,
                        "direccion": this.state.direccion.trim().toUpperCase(),
                        "ubigeo": this.state.ubigeo.trim().toUpperCase(),
                        "estadoCivil": this.state.estadoCivil,
                        "estado": this.state.estado,
                        "observacion": this.state.observacion.trim().toUpperCase(),

                        //idCliente
                        "idCliente": this.state.idCliente
                    })

                } else {
                    result = await axios.post('/api/cliente/add', {
                        "tipoDocumento": this.refTipoDocumento.current.value,
                        "numDocumento": this.state.numDocumento.toString().trim().toUpperCase(),
                        "infoCliente": this.state.infoCliente.trim().toUpperCase(),
                        "telefono": this.state.telefono.toString().trim().toUpperCase(),
                        "fechaNacimiento": this.state.fechaNacimiento,
                        "email": this.state.email.trim().toUpperCase(),
                        "genero": this.state.genero,
                        "direccion": this.state.direccion.trim().toUpperCase(),
                        "ubigeo": this.state.ubigeo.trim().toUpperCase(),
                        "estadoCivil": this.state.estadoCivil,
                        "estado": this.state.estado,
                        "observacion": this.state.observacion.trim().toUpperCase()
                    });
                }
                // console.log(result);
            } catch (error) {
                console.log(error)
                console.log(error.response)
            }
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

                <div className='row pb-2'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <section className="content-header">
                            <h5>
                                <span role="button" onClick={() => this.props.history.goBack()}><i className="bi bi-arrow-left-short"></i></span> {this.state.idCliente === '' ? 'Registrar Cliente' : 'Editar Cliente'}
                            </h5>
                        </section>
                    </div>
                </div>

                <div className="row pb-3">
                    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                        <button type="button" className="btn btn-primary mr-2" onClick={() => this.onSaveProceso()}>Guardar</button>
                        <button type="button" className="btn btn-danger" onClick={() => this.props.history.goBack()}>Cancelar</button>
                    </div>
                </div>

                {
                    this.state.messageWarning === '' ? null :
                        <div className="alert alert-warning" role="alert">
                            <i className="bi bi-exclamation-diamond-fill"></i> {this.state.messageWarning}
                        </div>
                }

                <div className="card card-default">
                    {/* <div className="card-header"><span className="card-title">Representante</span></div> */}
                    <div className="card-body">

                        <div className="row">
                            <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                                <div className="form-group">
                                    <label>Tipo Documento</label>
                                    <select
                                        className="form-control"
                                        value={this.state.tipoDocumento}
                                        ref={this.refTipoDocumento}
                                        onChange={(event) => {
                                            if (event.target.value.trim().length > 0) {
                                                this.setState({
                                                    tipoDocumento: event.target.value,
                                                    messageWarning: '',
                                                });
                                            } else {
                                                this.setState({
                                                    tipoDocumento: event.target.value,
                                                    messageWarning: 'seleccione el tipo de documento',
                                                });
                                            }
                                        }}>
                                        <option value="">-- Seleccione --</option>
                                        <option value="1">SIN DOCUMENTO</option>
                                        <option value="2">DNI</option>
                                        <option value="3">RUC</option>
                                        <option value="4">CARNET DE EXTRANJERIA</option>
                                        <option value="5">PASAPORTE</option>
                                        <option value="6">PART. DE NACIMIENTO-IDENTIDAD</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                                <div className="form-group">
                                    <label>N° de documento</label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refNumDocumento}
                                            value={this.state.numDocumento}
                                            onChange={(event) => {
                                                if (event.target.value.trim().length > 0) {
                                                    this.setState({
                                                        numDocumento: event.target.value,
                                                        messageWarning: '',
                                                    });
                                                } else {
                                                    this.setState({
                                                        numDocumento: event.target.value,
                                                        messageWarning: 'Ingrese el número de documento',
                                                    });
                                                }
                                            }}
                                            onKeyPress={keyNumberFloat}
                                            placeholder='00000000' />
                                        <div className="input-group-append">
                                            <button className="btn btn-outline-secondary" type="button" title="Reniec" onClick={() => console.log("Reniec")}><i className="bi bi-person-fill"></i></button>
                                        </div>
                                        <div className="input-group-append">
                                            <button className="btn btn-outline-secondary" type="button" title="Sunat" onClick={() => console.log("Sunat")}><i className="bi bi-people-fill"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                                <div className="form-group">
                                    <label>Apellidos y nombres</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        ref={this.refInfoCliente}
                                        value={this.state.infoCliente}
                                        onChange={(event) => {
                                            if (event.target.value.trim().length > 0) {
                                                this.setState({
                                                    infoCliente: event.target.value,
                                                    messageWarning: '',
                                                });
                                            } else {
                                                this.setState({
                                                    infoCliente: event.target.value,
                                                    messageWarning: 'Ingrese los apellidos y nombres',
                                                });
                                            }
                                        }}
                                        placeholder='Ingrese los apellidos y nombres' />
                                </div>
                            </div>
                            <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                                <div className="form-group">
                                    <label>N° de Celular/Telefono</label>
                                    <input
                                        type="text"
                                        className="form-control"
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
                                                    messageWarning: 'Ingrese el número de celular o telefono',
                                                });
                                            }
                                        }}
                                        onKeyPress={keyNumberFloat}
                                        placeholder='Ingrese el número de celular o telefono' />
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
                                        onChange={(event) => {
                                            if (event.target.value.trim().length > 0) {
                                                this.setState({
                                                    genero: event.target.value,
                                                    messageWarning: '',
                                                });
                                            } else {
                                                this.setState({
                                                    genero: event.target.value,
                                                    messageWarning: 'Seleccione el genero',
                                                });
                                            }
                                        }}>
                                        <option value="">-- Seleccione --</option>
                                        <option value="1">Masculino</option>
                                        <option value="2">Femenino</option>
                                        <option value="3">Otros</option>
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
                                        onChange={(event) => {
                                            if (event.target.value.trim().length > 0) {
                                                this.setState({
                                                    direccion: event.target.value,
                                                    messageWarning: '',
                                                });
                                            } else {
                                                this.setState({
                                                    direccion: event.target.value,
                                                    messageWarning: 'Ingrese la dirección',
                                                });
                                            }
                                        }}
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
                                        <label className="custom-control-label" htmlFor="switch1">{this.state.estado == true ? "Activo" : "Inactivo"}</label>
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

                    </div>
                </div>
            </>
        );
    }
}

export default ClienteProceso;