import React from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import {
    validateDate,
    spinnerLoading,
    numberFormat,
    timeForma24,
    currentDate,
    limitarCadena,
    ModalAlertInfo,
    ModalAlertDialog,
    ModalAlertSuccess,
    ModalAlertWarning,
    ModalAlertError,
} from '../tools/Tools';
import sunat from '../../recursos/images/sunat.png';
import reuse from '../../recursos/images/reuse.svg';
import accept from '../../recursos/images/accept.svg';
import unable from '../../recursos/images/unable.svg';
import error from '../../recursos/images/error.svg';
import pdf from '../../recursos/images/pdf.svg';
import xml from '../../recursos/images/xml.png';
import email from '../../recursos/images/email.svg';
import { connect } from 'react-redux';
import FileDownloader from "../reporte/hooks/FileDownloader";
import Paginacion from '../tools/Paginacion';

class CpeElectronicos extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            msgLoading: true,
            msgMessage: "Cargando información...",

            loading: false,
            lista: [],

            idProyecto: this.props.token.project.idProyecto,
            fechaInicio: currentDate(),
            fechaFinal: currentDate(),
            idComprobante: '',
            comprobantes: [],
            idEstado: "0",
            estados: [{ "id": "0", "nombre": "TODOS" }, { "id": "1", "nombre": "DECLARAR", }, { "id": "2", "nombre": "ANULADO", }],

            opcion: 0,
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messageTable: 'Cargando información...',
            messagePaginacion: 'Mostranto 0 de 0 Páginas'
        }
        this.refTxtSearch = React.createRef();
        this.refUseFileXml = React.createRef();

        this.abortControllerView = new AbortController();
        this.abortControllerTable = new AbortController();
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    componentDidMount() {
        this.loadData();
    }

    componentWillUnmount() {
        this.abortControllerView.abort();
        this.abortControllerTable.abort();
    }

    loadData = async () => {
        try {
            const comprobantes = await axios.get("/api/comprobante/listcombo", {
                signal: this.abortControllerView.signal,
                params: {
                    "tipo": "1"
                }
            });

            await this.setStateAsync({
                comprobantes: comprobantes.data,
                msgLoading: false,
            });
            this.loadInit();
        } catch (error) {
            if (error.message !== "canceled") {
                await this.setStateAsync({
                    msgMessage: "Se produjo un error interno, intente nuevamente."
                });
            }
        }
    }

    loadInit = () => {
        this.searchFecha();
    }

    async searchFecha() {
        if (this.state.loading) return;

        if (!validateDate(this.state.fechaInicio)) return;
        if (!validateDate(this.state.fechaFinal)) return;
        if (this.state.idEstado === "") return;

        await this.setStateAsync({ paginacion: 1 });
        this.fillTable(0, "", this.state.fechaInicio, this.state.fechaFinal, this.state.idComprobante, this.state.idEstado);
        await this.setStateAsync({ opcion: 1 });
    }

    async searchText(text) {
        if (this.state.loading) return;

        if (text.trim().length === 0) return;

        await this.setStateAsync({ paginacion: 1 });
        this.fillTable(1, text.trim(), "", "", "", "0");
        await this.setStateAsync({ opcion: 1 });
    }

    async searchComprobante() {
        if (this.state.loading) return;

        if (!validateDate(this.state.fechaInicio)) return;
        if (!validateDate(this.state.fechaFinal)) return;
        if (this.state.idEstado === "") return;

        await this.setStateAsync({ paginacion: 1 });
        this.fillTable(2, "", this.state.fechaInicio, this.state.fechaFinal, this.state.idComprobante, this.state.idEstado);
        await this.setStateAsync({ opcion: 2 });
    }

    async searchEstado() {
        if (this.state.loading) return;

        if (!validateDate(this.state.fechaInicio)) return;
        if (!validateDate(this.state.fechaFinal)) return;
        if (this.state.idEstado === "") return;

        await this.setStateAsync({ paginacion: 1 });
        this.fillTable(3, "", this.state.fechaInicio, this.state.fechaFinal, this.state.idComprobante, this.state.idEstado);
        await this.setStateAsync({ opcion: 3 });
    }

    paginacionContext = async (listid) => {
        await this.setStateAsync({ paginacion: listid });
        this.onEventPaginacion();
    }

    onEventPaginacion = () => {
        switch (this.state.opcion) {
            case 0:
                this.fillTable(0, "", this.state.fechaInicio, this.state.fechaFinal, this.state.idComprobante, this.state.idEstado);
                break;
            case 1:
                this.fillTable(1, this.refTxtSearch.current.value, "", "", "", "0");
                break;
            case 2:
                this.fillTable(2, "", this.state.fechaInicio, this.state.fechaFinal, this.state.idComprobante, this.state.idEstado);
                break
            case 3:
                this.fillTable(3, "", this.state.fechaInicio, this.state.fechaFinal, this.state.idComprobante, this.state.idEstado);
                break;
            default: this.fillTable(0, "", this.state.fechaInicio, this.state.fechaFinal, this.state.idComprobante, this.state.idEstado);
        }
    }

    fillTable = async (opcion, buscar, fechaInicio, fechaFinal, idComprobante, idEstado) => {
        try {
            await this.setStateAsync({
                loading: true,
                lista: [],
                messageTable: "Cargando información...",
                messagePaginacion: "Mostranto 0 de 0 Páginas"
            });

            const result = await axios.get('/api/factura/cpesunat', {
                signal: this.abortControllerTable.signal,
                params: {
                    "opcion": opcion,
                    "buscar": buscar,
                    "fechaInicio": fechaInicio,
                    "fechaFinal": fechaFinal,
                    "idComprobante": idComprobante,
                    "idEstado": idEstado,
                    "idProyecto": this.state.idProyecto,
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

    onEventSendFactura = (idCobro) => {
        ModalAlertDialog("Facturación", "¿Está seguro de enviar el comprobante electrónico?", async (value) => {
            if (value) {
                try {
                    ModalAlertInfo("Facturación", "Firmando xml y enviando a sunat.");

                    // "http://localhost:8090/app/examples/boleta.php"
                    // "http://apisunat.inmobiliariagmyc.com/app/examples/boleta.php"

                    let result = await axios.get(`${process.env.REACT_APP_URL}/app/examples/boleta.php`, {
                        params: {
                            "idCobro": idCobro
                        }
                    });

                    let object = result.data;

                    if (object.state) {
                        if (object.accept) {
                            ModalAlertSuccess("Facturación", "Código " + object.code + " " + object.description, () => {
                                this.onEventPaginacion()
                            });
                        } else {
                            ModalAlertWarning("Facturación", "Código " + object.code + " " + object.description);
                        }
                    } else {
                        ModalAlertWarning("Facturación", "Código " + object.code + " " + object.description);
                    }
                } catch (error) {
                    if (error.response) {
                        ModalAlertWarning("Facturación", error.response.data);
                    } else {
                        ModalAlertError("Facturación", "Se produjo un error interno, intente nuevamente por favor.");
                    }
                }
            }
        });
    }

    onEventSendAnular = (idCobro) => {
        ModalAlertDialog("Facturación", "¿Está seguro de anular el comprobante electrónico?", async (value) => {
            if (value) {
                try {
                    ModalAlertInfo("Facturación", "Firmando xml y enviando a sunat.");

                    // "http://localhost:8090/app/examples/resumen.php"
                    // "http://apisunat.inmobiliariagmyc.com/app/examples/resumen.php"

                    let result = await axios.get(`${process.env.REACT_APP_URL}/app/examples/resumen.php`, {
                        params: {
                            "idCobro": idCobro
                        }
                    });
                    // console.log(result.data);
                    let object = result.data;
                    if (object.state) {
                        if (object.accept) {
                            ModalAlertSuccess("Facturación", "Código " + object.code + " " + object.description, () => {
                                this.onEventPaginacion()
                            });
                        } else {
                            ModalAlertWarning("Facturación", "Código " + object.code + " " + object.description);
                        }
                    } else {
                        ModalAlertWarning("Facturación", "Código " + object.code + " " + object.description);
                    }
                } catch (error) {
                    if (error.response) {
                        ModalAlertWarning("Facturación", error.response.data);
                    } else {
                        ModalAlertError("Facturación", "Se produjo un error interno, intente nuevamente por favor.");
                    }
                }
            }
        });
    }

    onEventImprimir = async (idCobro) => {
        const data = {
            "idSede": "SD0001",
            "idCobro": idCobro,
        }

        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'key-report-inmobiliaria').toString();
        let params = new URLSearchParams({ "params": ciphertext });
        window.open("/api/cobro/repcomprobante?" + params, "_blank");
    }

    async onEventSendEmail(idCobro) {

        try {
            ModalAlertInfo("Email", "Envíando Correo.");

            let result = await axios.get("/api/cobro/email", {
                params: {
                    "idSede": "SD0001",
                    "idCobro": idCobro,
                    "xmlSunat": "0"
                }
            });

            ModalAlertSuccess("Email", result.data);
        } catch (error) {
            if (error.response) {
                ModalAlertWarning("Email", error.response.data);
            } else {
                ModalAlertError("Email", "Se produjo un error interno, intente nuevamente por favor.");
            }
        }
    }

    onEventXmlSunat = async (idCobro) => {
        const data = {
            "idSede": "SD0001",
            "idCobro": idCobro,
            "xmlSunat": "0"
        }

        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'key-report-inmobiliaria').toString();

        this.refUseFileXml.current.download({
            "name": "Xml Sunat",
            "file": "/api/cobro/xmlsunat",
            "params": ciphertext
        });
    }

    render() {
        return (
            <>
                {this.state.msgLoading ?
                    <div className="clearfix absolute-all bg-white">
                        {spinnerLoading(this.state.msgMessage)}
                    </div>
                    :
                    <>
                        <div className='row'>
                            <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                <div className="form-group">
                                    <h5>Comprobante de Pago Electrónico <small className="text-secondary">LISTA</small></h5>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                <div className="form-group">
                                    <span>Resumen de Boletas/Facturas/Nota Crédito/Nota Débito</span>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className='col-lg-2 col-md-2 col-sm-12 col-xs-12'>
                                <div className="form-group">
                                    <img src={sunat} width="24" /> <span>Estados SUNAT:</span>
                                </div>
                            </div>
                            <div className='col-lg-2 col-md-2 col-sm-12 col-xs-12'>
                                <div className="form-group">
                                    <img src={accept} width="24" /> <span>Aceptado</span>
                                </div>
                            </div>
                            <div className='col-lg-2 col-md-2 col-sm-12 col-xs-12'>
                                <div className="form-group">
                                    <img src={unable} width="24" /> <span>Rechazado</span>
                                </div>
                            </div>
                            <div className='col-lg-2 col-md-2 col-sm-12 col-xs-12'>
                                <div className="form-group">
                                    <img src={reuse} width="24" /> <span>Pendiente de Envío</span>
                                </div>
                            </div>
                            <div className='col-lg-2 col-md-2 col-sm-12 col-xs-12'>
                                <div className="form-group">
                                    <img src={error} width="24" /> <span> Comunicación de Baja (Anulado)</span>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className='col-lg-3 col-md-3 col-sm-12 col-xs-12'>
                                <div className="form-group">
                                    <label>Fecha de Inicio:</label>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={this.state.fechaInicio}
                                        onChange={async (event) => {
                                            await this.setStateAsync({ fechaInicio: event.target.value })
                                            this.searchFecha();
                                        }} />
                                </div>
                            </div>
                            <div className='col-lg-3 col-md-3 col-sm-12 col-xs-12'>
                                <div className="form-group">
                                    <label>Fecha de Fin:</label>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={this.state.fechaFinal}
                                        onChange={async (event) => {
                                            await this.setStateAsync({ fechaFinal: event.target.value })
                                            this.searchFecha();
                                        }} />
                                </div>
                            </div>
                            <div className='col-lg-3 col-md-3 col-sm-12 col-xs-12'>
                                <div className="form-group">
                                    <label>Comprobantes:</label>
                                    <select
                                        className="form-control"
                                        value={this.state.idComprobante}
                                        onChange={async (event) => {
                                            await this.setStateAsync({ idComprobante: event.target.value });
                                            this.searchComprobante();
                                        }}>
                                        <option value="">TODOS</option>
                                        {
                                            this.state.comprobantes.map((item, index) => (
                                                <option key={index} value={item.idComprobante}>{item.nombre}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>
                            <div className='col-lg-3 col-md-3 col-sm-12 col-xs-12'>
                                <div className="form-group">
                                    <label>Estados:</label>
                                    <select
                                        className="form-control"
                                        value={this.state.idEstado}
                                        onChange={async (event) => {
                                            await this.setStateAsync({ idEstado: event.target.value })
                                            this.searchEstado();
                                        }}>
                                        {
                                            this.state.estados.map((item, index) => (
                                                <option key={index} value={item.id}>{item.nombre}</option>
                                            ))
                                        }
                                    </select>
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
                                    <button className="btn btn-outline-light" onClick={() => this.loadInit()}>
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
                                                <th width="5%" className="text-center">#</th>
                                                <th width="5%">Opciones</th>
                                                <th width="10%">Fecha</th>
                                                <th width="10%">Comprobante</th>
                                                <th width="10%">Cliente</th>
                                                <th width="10%">Estado</th>
                                                <th width="10%">Total</th>
                                                <th width="10%">Estado Sunat</th>
                                                <th width="10%">Observación SUNAT</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                this.state.loading ? (
                                                    <tr>
                                                        <td className="text-center" colSpan="10">
                                                            {spinnerLoading()}
                                                        </td>
                                                    </tr>
                                                ) : this.state.lista.length === 0 ? (
                                                    <tr className="text-center">
                                                        <td colSpan="10">¡No hay datos registrados!</td>
                                                    </tr>
                                                ) : (
                                                    this.state.lista.map((item, index) => {

                                                        const estadoSunat = item.estado === 3 ?
                                                            <button className="btn btn-light btn-sm" onClick={() => this.onEventSendFactura(item.idCobro)}><img src={error} width="22" /></button>
                                                            : item.xmlSunat === "" ?
                                                                <button className="btn btn-light btn-sm" onClick={() => this.onEventSendFactura(item.idCobro)}><img src={reuse} width="22" /></button>
                                                                : item.xmlSunat === "0" ?
                                                                    <button className="btn btn-light btn-sm" ><img src={accept} width="22" /></button>
                                                                    : <button className="btn btn-light btn-sm" onClick={() => this.onEventSendFactura(item.idCobro)}><img src={unable} width="22" /></button>;

                                                        const descripcion = (item.xmlDescripcion === "" ? "Por Generar Xml" : limitarCadena(item.xmlDescripcion, 90, '...'));

                                                        return (
                                                            <tr key={index}>
                                                                <td className="text-center">{item.id}</td>
                                                                <td>
                                                                    <div className="dropdown">
                                                                        <a className="btn btn-primary dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">
                                                                            <i className="fa fa-th-list"></i>
                                                                        </a>

                                                                        <ul className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                                                                            <li>
                                                                                <button className="dropdown-item" type="button" onClick={() => this.onEventImprimir(item.idCobro)}><img src={pdf} width="22" alt="Pdf" /> Archivo Pdf</button>
                                                                            </li>
                                                                            <li>
                                                                                <button className="dropdown-item" type="button" onClick={() => this.onEventXmlSunat(item.idCobro)}><img src={xml} width="22" alt="Xml" /> Archivo Xml</button>
                                                                            </li>
                                                                            <li>
                                                                                <button className="dropdown-item" type="button" onClick={() => this.onEventSendEmail(item.idCobro)}><img src={email} width="22" alt="Email" /> Enviar Correo</button>
                                                                            </li>
                                                                            <li>
                                                                                <button className="dropdown-item" type="button" onClick={() => this.onEventSendAnular(item.idCobro)}><img src={error} width="22" alt="Error" /> Resumen Diario</button>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </td>
                                                                <td>{<span>{item.fecha}</span>}{<br></br>}{<span>{timeForma24(item.hora)}</span>}</td>
                                                                <td>{item.comprobante}{<br />}{item.serie + "-" + item.numeracion}</td>
                                                                <td>{item.documento}{<br />}{item.informacion}</td>


                                                                <td className="text-center">
                                                                    {
                                                                        item.estado === 3
                                                                            ? <span className="text-danger">ANULADO</span>
                                                                            : <span className="text-success">DECLARAR</span>
                                                                    }
                                                                </td>

                                                                <td>{numberFormat(item.total)}</td>
                                                                <td className="text-center">{estadoSunat}</td>
                                                                <td>{descripcion}</td>
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
                }
                <FileDownloader ref={this.refUseFileXml} />
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

export default connect(mapStateToProps, null)(CpeElectronicos);