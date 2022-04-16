import React from 'react';
import axios from 'axios';
import { keyNumberFloat, isNumeric, spinnerLoading, currentDate } from '../../tools/Tools'


class ClienteProceso extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idCliente: '',
            //representante
            numDocumento: '',
            infoCliente: '',
            genero: '',
            telefono: '',
            email: '',
            fechaNacimiento: '',
            //ubicacion
            pais: '',
            region: '',
            provincia: '',
            distrito: '',
            direccion: '',
            //conyuge
            numDocConyuge: '',
            infoConyuge: '',
            generoConyuge: '',
            telConyuge: '',
            emailConyuge: '',
            fechaNacConyuge: '',
            //otros datos
            estadoCivil: '',
            tipoMonedaBanco: '',
            numCuentaBanco: '',
            observacion: '',
            //beneficiario
            numDocBeneficiario: '',
            infoBeneficiario: '',
            generoBeneficiario: '',
            telBeneficiario: '',
            fechaNacBeneficiario: '',

            messageWarning: ''

        }

        this.refNumDocumento = React.createRef();
        this.refInfoCliente = React.createRef();
        this.refGenero = React.createRef();
        this.refTelefono = React.createRef();

        this.refPais = React.createRef();
        this.refRegion = React.createRef();
        this.refProvincia = React.createRef();
        this.refDistrito = React.createRef();
        this.refDireccion = React.createRef();

    }

    async componentDidMount() {

        let url = this.props.location.search;
        let idResult = new URLSearchParams(url).get("idCliente");
        this.setState({ idCliente: idResult }, () => {
            if (this.state.idCliente === '') {
                this.onFocusTab("representante-tab", "representante");
                this.refNumDocumento.current.focus();
                console.log('new')
            } else {
                this.loadDataId(this.state.idCliente)
                console.log('edit')
            }
        }
        )

    }

    loadDataId = async (id) => {
        try {
            const result = await axios.get("/api/cliente/id", {
                params: {
                    idCliente: id
                }
            });
            // console.log(result)
            this.setState({
                //representante
                numDocumento: result.data.numDocumento,
                infoCliente: result.data.infoCliente,
                genero: result.data.genero,
                telefono: result.data.telefono,
                email: result.data.email,
                fechaNacimiento: result.data.fechaNacimiento,
                //ubicacion
                pais: result.data.pais,
                region: result.data.region,
                provincia: result.data.provincia,
                distrito: result.data.distrito,
                direccion: result.data.direccion,
                //conyuge
                numDocConyuge: result.data.numDocConyuge,
                infoConyuge: result.data.infoConyuge,
                generoConyuge: result.data.generoConyuge,
                telConyuge: result.data.telConyuge,
                emailConyuge: result.data.emailConyuge,
                fechaNacConyuge: result.data.fechaNacConyuge,
                //otros datos
                estadoCivil: result.data.estadoCivil,
                tipoMonedaBanco: result.data.tipoMonedaBanco,
                numCuentaBanco: result.data.numCuentaBanco,
                observacion: result.data.observacion,
                //beneficiario
                numDocBeneficiario: result.data.numDocBeneficiario,
                infoBeneficiario: result.data.infoBeneficiario,
                generoBeneficiario: result.data.generoBeneficiario,
                telBeneficiario: result.data.telBeneficiario,
                fechaNacBeneficiario: result.data.fechaNacBeneficiario,

                idCliente: result.data.idCliente
            });

        } catch (error) {
            console.log(error.response)
        }
    }

    async onSaveProceso() {

        // console.log(this.state) 

        if (this.state.numDocumento === "") {
            this.setState({ messageWarning: "Ingrese el N° de documento del cliente" });
            this.onFocusTab("representante-tab", "representante");
            this.refNumDocumento.current.focus();
        } else if (this.state.infoCliente === "") {
            this.setState({ messageWarning: "Ingrese los datos del cliente" })
            this.onFocusTab("representante-tab", "representante");
            this.refInfoCliente.current.focus();
        } else if (this.state.genero === "") {
            this.setState({ messageWarning: "Seleccione el genero del cliente" });
            this.onFocusTab("representante-tab", "representante");
            this.refGenero.current.focus();
        } else if (this.state.telefono === "") {
            this.setState({ messageWarning: "Ingrese el N° de telefono del cliente" });
            this.onFocusTab("representante-tab", "representante");
            this.refTelefono.current.focus();
        } else if (this.state.pais === "") {
            this.setState({ messageWarning: "Ingrese el nombre del pais" });
            this.onFocusTab("ubicacion-tab", "ubicacion");
            this.refPais.current.focus();
        } else if (this.state.region === "") {
            this.setState({ messageWarning: "Ingrese el nombre de la region" });
            this.onFocusTab("ubicacion-tab", "ubicacion");
            this.refRegion.current.focus();
        } else if (this.state.provincia === "") {
            this.setState({ messageWarning: "Ingrese el nombre de la provincia" });
            this.onFocusTab("ubicacion-tab", "ubicacion");
            this.refProvincia.current.focus();
        } else if (this.state.distrito === "") {
            this.setState({ messageWarning: "Ingrese el nombre del distrito" });
            this.onFocusTab("ubicacion-tab", "ubicacion");
            this.refDistrito.current.focus();
        } else if (this.state.direccion === "") {
            this.setState({ messageWarning: "Ingrese el nombre de la dirección del cliente" });
            this.onFocusTab("ubicacion-tab", "ubicacion");
            this.refDireccion.current.focus();
        } else {
            try {

                let result = null
                if (this.state.idCliente !== '') {
                    result = await axios.post('/api/cliente/update', {
                        //representante
                        "numDocumento": this.state.numDocumento.toString().trim().toUpperCase(),
                        "infoCliente": this.state.infoCliente.trim().toUpperCase(),
                        "genero": this.state.genero,
                        "telefono": this.state.telefono.toString().trim().toUpperCase(),
                        "email": this.state.email.trim().toUpperCase(),
                        "fechaNacimiento": this.state.fechaNacimiento,
                        //ubicacion
                        "pais": this.state.pais.trim().toUpperCase(),
                        "region": this.state.region.trim().toUpperCase(),
                        "provincia": this.state.provincia.trim().toUpperCase(),
                        "distrito": this.state.distrito.trim().toUpperCase(),
                        "direccion": this.state.direccion.trim().toUpperCase(),
                        //conyuge
                        "numDocConyuge": this.state.numDocConyuge.toString().trim().toUpperCase(),
                        "infoConyuge": this.state.infoConyuge.trim().toUpperCase(),
                        "generoConyuge": this.state.generoConyuge,
                        "telConyuge": this.state.telConyuge.toString().trim().toUpperCase(),
                        "emailConyuge": this.state.emailConyuge.trim().toUpperCase(),
                        "fechaNacConyuge": this.state.fechaNacConyuge,
                        //otros datos
                        "estadoCivil": this.state.estadoCivil,
                        "tipoMonedaBanco": this.state.tipoMonedaBanco.trim().toUpperCase(),
                        "numCuentaBanco": this.state.numCuentaBanco.toString().trim().toUpperCase(),
                        "observacion": this.state.observacion.trim().toUpperCase(),
                        //beneficiario
                        "numDocBeneficiario": this.state.numDocBeneficiario.toString().trim().toUpperCase(),
                        "infoBeneficiario": this.state.infoBeneficiario.trim().toUpperCase(),
                        "generoBeneficiario": this.state.generoBeneficiario,
                        "telBeneficiario": this.state.telBeneficiario.toString().trim().toUpperCase(),
                        "fechaNacBeneficiario": this.state.fechaNacBeneficiario,

                        //idCliente
                        "idCliente": this.state.idCliente
                    })
                    // console.log(result);

                } else {
                    result = await axios.post('/api/cliente/add', {
                        //representante
                        "numDocumento": this.state.numDocumento.toString().trim().toUpperCase(),
                        "infoCliente": this.state.infoCliente.trim().toUpperCase(),
                        "genero": this.state.genero,
                        "telefono": this.state.telefono.toString().trim().toUpperCase(),
                        "email": this.state.email.trim().toUpperCase(),
                        "fechaNacimiento": this.state.fechaNacimiento,
                        //ubicacion
                        "pais": this.state.pais.trim().toUpperCase(),
                        "region": this.state.region.trim().toUpperCase(),
                        "provincia": this.state.provincia.trim().toUpperCase(),
                        "distrito": this.state.distrito.trim().toUpperCase(),
                        "direccion": this.state.direccion.trim().toUpperCase(),
                        //conyuge
                        "numDocConyuge": this.state.numDocConyuge.toString().trim().toUpperCase(),
                        "infoConyuge": this.state.infoConyuge.trim().toUpperCase(),
                        "generoConyuge": this.state.generoConyuge,
                        "telConyuge": this.state.telConyuge.toString().trim().toUpperCase(),
                        "emailConyuge": this.state.emailConyuge.trim().toUpperCase(),
                        "fechaNacConyuge": this.state.fechaNacConyuge,
                        //otros datos
                        "estadoCivil": this.state.estadoCivil,
                        "tipoMonedaBanco": this.state.tipoMonedaBanco.trim().toUpperCase(),
                        "numCuentaBanco": this.state.numCuentaBanco.toString().trim().toUpperCase(),
                        "observacion": this.state.observacion.trim().toUpperCase(),
                        //beneficiario
                        "numDocBeneficiario": this.state.numDocBeneficiario.toString().trim().toUpperCase(),
                        "infoBeneficiario": this.state.infoBeneficiario.trim().toUpperCase(),
                        "generoBeneficiario": this.state.generoBeneficiario,
                        "telBeneficiario": this.state.telBeneficiario.toString().trim().toUpperCase(),
                        "fechaNacBeneficiario": this.state.fechaNacBeneficiario,
                    });
                    // console.log(result);
                }



            } catch (error) {
                console.log(error)
                console.log(error.response)
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
                <div className='row pb-3'>
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

                <ul className="nav nav-tabs" id="myTab" role="tablist">
                    <li className="nav-item" role="presentation">
                        <a className="nav-link active" id="representante-tab" data-bs-toggle="tab" href="#representante" role="tab" aria-controls="representante" aria-selected="true"><i className="bi bi-person-circle"></i> Representante</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id="ubicacion-tab" data-bs-toggle="tab" href="#ubicacion" role="tab" aria-controls="ubicacion" aria-selected="false"><i className="bi bi-geo-alt-fill"></i> Ubicación</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id="conyuge-tab" data-bs-toggle="tab" href="#conyuge" role="tab" aria-controls="conyuge" aria-selected="false"><i className="bi bi-people-fill"></i> Conyuge</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id="otrosDatos-tab" data-bs-toggle="tab" href="#otrosDatos" role="tab" aria-controls="otrosDatos" aria-selected="false"><i className="bi bi-person-badge"></i> Otros Datos</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id="beneficiario-tab" data-bs-toggle="tab" href="#beneficiario" role="tab" aria-controls="beneficiario" aria-selected="false"><i className="bi bi-person-heart"></i> Beneficiario</a>
                    </li>
                </ul>
                <div className="tab-content pt-2" id="myTabContent">
                    <div className="tab-pane fade show active" id="representante" role="tabpanel" aria-labelledby="representante-tab">

                        <div class="card card-default">
                            <div class="card-header">
                                <span class="card-title">Representante</span>
                            </div>
                            <div class="card-body">

                                <div className="row">
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
                                                                messageWarning: 'Ingrese # dni o ruc del cliente',
                                                            });
                                                        }
                                                    }}
                                                    onKeyPress={keyNumberFloat}
                                                    placeholder='00000000' />
                                                <div class="input-group-append">
                                                    <button className="btn btn-outline-secondary" type="button" title="Reniec" onClick={() => console.log()}><i className="bi bi-person-fill"></i></button>
                                                </div>
                                                <div class="input-group-append">

                                                    <button className="btn btn-outline-secondary" type="button" title="Sunat" onClick={() => console.log()}><i className="bi bi-people-fill"></i></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                                        <div className="form-group">
                                            <label>Cliente (Nombre y Apellidos)</label>
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
                                                            messageWarning: 'Ingrese apellidos y nombre',
                                                        });
                                                    }
                                                }}
                                                placeholder='Ingrese apellidos y nombre' />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                                        <div className="form-group">
                                            <label>Genero</label>
                                            <select
                                                className="form-control"
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
                                                            messageWarning: 'seleccione el genero.',
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
                                    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                                        <div className="form-group">
                                            <label>N° de Telefono</label>
                                            <input
                                                type="number"
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
                                                            messageWarning: 'Ingrese N° dni o ruc',
                                                        });
                                                    }
                                                }}
                                                placeholder='ingrese numero de tlefono' />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                                        <div className="form-group">
                                            <label>E-Mail</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={this.state.email}
                                                onChange={(event) => this.setState({ email: event.target.value })}
                                                placeholder='ej: email@server.com' />
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                                        <div className="form-group">
                                            <label>Fecha de Nacimiento</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={this.state.fechaNacimiento}
                                                onChange={(event) => this.setState({ fechaNacimiento: event.target.value })}
                                                placeholder='ej: 04 / 04 / 2024' />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                    <div className="tab-pane fade" id="ubicacion" role="tabpanel" aria-labelledby="ubicacion-tab">
                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                            <form>
                                <div className="form-group">
                                    <label htmlFor="pais">Pais</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="pais"
                                        value={this.state.pais}
                                        ref={this.refPais}
                                        onChange={(event) => {
                                            if (event.target.value.trim().length > 0) {
                                                this.setState({
                                                    pais: event.target.value,
                                                    messageWarning: '',
                                                });
                                            } else {
                                                this.setState({
                                                    pais: event.target.value,
                                                    messageWarning: 'Ingrese N° dni o ruc',
                                                });
                                            }
                                        }}
                                        placeholder='...' />
                                    {/* <select className="form-control" id="pais">
                                        <option>-- Seleccione --</option>
                                        <option>Perú</option>
                                        <option>otro pais</option>
                                    </select> */}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="region">Región</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="region"
                                        value={this.state.region}
                                        ref={this.refRegion}
                                        onChange={(event) => {
                                            if (event.target.value.trim().length > 0) {
                                                this.setState({
                                                    region: event.target.value,
                                                    messageWarning: '',
                                                });
                                            } else {
                                                this.setState({
                                                    region: event.target.value,
                                                    messageWarning: 'Ingrese N° dni o ruc',
                                                });
                                            }
                                        }}
                                        placeholder='...' />
                                    {/* <select className="form-control" id="region">
                                        <option>-- Seleccione --</option>
                                        <option>region1</option>
                                        <option>otra región</option>
                                    </select> */}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="provincia">Provincia</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="provincia"
                                        value={this.state.provincia}
                                        ref={this.refProvincia}
                                        onChange={(event) => {
                                            if (event.target.value.trim().length > 0) {
                                                this.setState({
                                                    provincia: event.target.value,
                                                    messageWarning: '',
                                                });
                                            } else {
                                                this.setState({
                                                    provincia: event.target.value,
                                                    messageWarning: 'Ingrese N° dni o ruc',
                                                });
                                            }
                                        }}
                                        placeholder='...' />
                                    {/* <select className="form-control" id="provincia">
                                        <option>-- Seleccione --</option>
                                        <option>provincia1</option>
                                        <option>otra provincia</option>
                                    </select> */}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="distrito">Distrito</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="distrito"
                                        value={this.state.distrito}
                                        ref={this.refDistrito}
                                        onChange={(event) => {
                                            if (event.target.value.trim().length > 0) {
                                                this.setState({
                                                    distrito: event.target.value,
                                                    messageWarning: '',
                                                });
                                            } else {
                                                this.setState({
                                                    distrito: event.target.value,
                                                    messageWarning: 'Ingrese N° dni o ruc',
                                                });
                                            }
                                        }}
                                        placeholder='...' />
                                    {/* <select className="form-control" id="distrito">
                                        <option>-- Seleccione --</option>
                                        <option>Distrito1</option>
                                        <option>otro distrito</option>
                                    </select> */}
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
                                                    messageWarning: 'Ingrese N° dni o ruc',
                                                });
                                            }
                                        }}
                                        placeholder='ingrese una direccion valida' />
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="tab-pane fade" id="conyuge" role="tabpanel" aria-labelledby="conyuge-tab">
                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                            <div>
                                <div className="form-group">
                                    <label htmlFor="documentoConyuge">DNI/RUC</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="documentoConyuge"
                                        value={this.state.numDocConyuge}
                                        onChange={(event) => this.setState({ numDocConyuge: event.target.value })}
                                        placeholder='ingrese dni o ruc del conyuge' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="nombreConyuge">Conyuge (Nombres y Apellidos)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="nombreConyuge"
                                        value={this.state.infoConyuge}
                                        onChange={(event) => this.setState({ infoConyuge: event.target.value })}
                                        placeholder='ingrese nombres y apellidos del conyuge' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="generoConyuge">Genero</label>
                                    <select
                                        className="form-control"
                                        id="generoConyuge"
                                        value={this.state.generoConyuge}
                                        onChange={(event) => this.setState({ generoConyuge: event.target.value })}>
                                        <option value="">-- Seleccione --</option>
                                        <option value="1">Masculino</option>
                                        <option value="2">Femenino</option>
                                        <option value="3">Otros</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="telefonoConyuge">Telefono</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="telefonoConyuge"
                                        value={this.state.telConyuge}
                                        onChange={(event) => this.setState({ telConyuge: event.target.value })}
                                        placeholder='ingrese telefono o celular del conyuge' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="emailConyuge">E-Mail</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="emailConyuge"
                                        value={this.state.emailConyuge}
                                        onChange={(event) => this.setState({ emailConyuge: event.target.value })}
                                        placeholder='ingrese email del conyuge' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="fechaNacimientoConyuge">Fecha de Nacimiento</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        id="fechaNacimientoConyuge"
                                        value={this.state.fechaNacConyuge}
                                        onChange={(event) => this.setState({ fechaNacConyuge: event.target.value })}
                                        placeholder='ej: 04 / 04 / 2024' />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="tab-pane fade" id="otrosDatos" role="tabpanel" aria-labelledby="otrosDatos-tab">
                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                            <div className='m-2 p-3' style={{ border: '2px solid #FED765', background: '#FCF7D8', color: '#F8A827', borderRadius: '8px' }}>
                                Agregar información adicional. Esta sección es Opcional.
                            </div>
                        </div>
                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                            <div>
                                <div className="form-group">
                                    <label htmlFor="estadoCivil">Estado Civil</label>
                                    <select
                                        className="form-control"
                                        id="estadoCivil"
                                        value={this.state.estadoCivil}
                                        onChange={(event) => this.setState({ estadoCivil: event.target.value })}>
                                        <option value="">-- seleccione --</option>
                                        <option value="1">Soltero(a)</option>
                                        <option value="2">Casado(a)</option>
                                        <option value="3">Viudo(a)</option>
                                        <option value="4">Divorciado(a)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="tipoMonedaBanco">Tipo, Moneda, Banco</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="tipoMonedaBanco"
                                        value={this.state.tipoMonedaBanco}
                                        onChange={(event) => this.setState({ tipoMonedaBanco: event.target.value })}
                                        placeholder='ej: cuenta de ahorros en dolares del banco xxxx' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="numeroCuenta">Numero de Cuenta del Banco</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="numeroCuenta"
                                        value={this.state.numCuentaBanco}
                                        onChange={(event) => this.setState({ numCuentaBanco: event.target.value })}
                                        placeholder='124567894568' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="observacion">Observación</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="observacion"
                                        value={this.state.observacion}
                                        onChange={(event) => this.setState({ observacion: event.target.value })}
                                        placeholder='algún texto adicional' />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="tab-pane fade" id="beneficiario" role="tabpanel" aria-labelledby="beneficiario-tab">
                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                            <div className='m-2 p-3' style={{ border: '2px solid #FED765', background: '#FCF7D8', color: '#F8A827', borderRadius: '8px' }}>
                                Añade un beneficiario a tu cliente. Esta sección es Opcional.
                            </div>
                        </div>
                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                            <div>
                                <div className="form-group">
                                    <label htmlFor="documentoBeneficiario">DNI/RUC</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="documentoBeneficiario"
                                        value={this.state.numDocBeneficiario}
                                        onChange={(event) => this.setState({ numDocBeneficiario: event.target.value })}
                                        placeholder='documento del beneficiario' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="beneficiario">Beneficiario (Nombres y Apellidos)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="beneficiario"
                                        value={this.state.numDocBeneficiario}
                                        onChange={(event) => this.setState({ numDocBeneficiario: event.target.value })}
                                        placeholder='ingrese nombre y apellidos del beneficiario' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="generoBeneficiario">Genero</label>
                                    <select
                                        className="form-control"
                                        id="generoBeneficiario"
                                        value={this.state.generoBeneficiario}
                                        onChange={(event) => this.setState({ generoBeneficiario: event.target.value })}>
                                        <option value="">-- Seleccione --</option>
                                        <option value="1">Masculino</option>
                                        <option value="2">Femenino</option>
                                        <option value="3">Otros</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="telefonoBeneficiario">Numero de Telefono</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="telefonoBeneficiario"
                                        value={this.state.telBeneficiario}
                                        onChange={(event) => this.setState({ telBeneficiario: event.target.value })}
                                        placeholder='ingrese numero de telefono o celular' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="fechaNacimientoBeneficiario">Fecha de Nacimiento</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        id="fechaNacimientoBeneficiario"
                                        value={this.state.fechaNacBeneficiario}
                                        onChange={(event) => this.setState({ fechaNacBeneficiario: event.target.value })} />
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

export default ClienteProceso;