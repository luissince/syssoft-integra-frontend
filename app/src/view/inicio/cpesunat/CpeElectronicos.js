import React from 'react';
import CryptoJS from 'crypto-js';
import {
    validateDate,
    spinnerLoading,
    numberFormat,
    timeForma24,
    currentDate,
    limitarCadena,
    showModal,
    hideModal,
    viewModal,
    clearModal,
    alertInfo,
    alertDialog,
    alertSuccess,
    alertWarning,
    statePrivilegio,
    keyUpSearch
} from '../../../helper/utils.helper';

import { apiComprobanteListcombo } from '../../../network/api';
import { connect } from 'react-redux';
import FileDownloader from "../../../components/FileDownloader";
import Paginacion from '../../../components/Paginacion';
import ContainerWrapper from '../../../components/Container';
import { images } from '../../../helper';
import { sendBoleta, sendNotaCredito, sendResumen, sendResumenNotaCredito } from '../../../network/rest/cpesunat.network';
import SuccessReponse from '../../../model/class/response';
import ErrorResponse from '../../../model/class/error-response';
import { listCpeSunat, sendEmailBoleta, sendEmailNotaCredito } from '../../../network/rest/principal.network';
import { CANCELED } from '../../../model/types/types';

class CpeElectronicos extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            msgLoading: true,
            msgMessage: "Cargando información...",

            loading: false,
            lista: [],
            restart: false,

            viewPdf: statePrivilegio(this.props.token.userToken.menus[7].submenu[0].privilegio[0].estado),
            viewXml: statePrivilegio(this.props.token.userToken.menus[7].submenu[0].privilegio[1].estado),
            viewEmail: statePrivilegio(this.props.token.userToken.menus[7].submenu[0].privilegio[2].estado),
            ViewResumenDiario: statePrivilegio(this.props.token.userToken.menus[7].submenu[0].privilegio[3].estado),
            viewDeclarar: statePrivilegio(this.props.token.userToken.menus[7].submenu[0].privilegio[4].estado),

            loadModal: false,
            nameModal: 'Nuevo Manzana',
            msgModal: 'Cargando datos...',
            fechaInicioModal: currentDate(),
            fechaFinalModal: currentDate(),
            idComprobanteModal: '',

            idProyecto: this.props.token.project.idProyecto,
            fechaInicio: currentDate(),
            fechaFinal: currentDate(),
            idComprobante: '',
            comprobantes: [],
            idEstado: "0",
            estados: [{ "id": "0", "nombre": "TODOS" }, { "id": "1", "nombre": "DECLARAR", }, { "id": "2", "nombre": "DAR DE BAJA", }],

            opcion: 0,
            paginacion: 0,
            fill: 'any',
            totalPaginacion: 0,
            filasPorPagina: 10,
            messageTable: 'Cargando información...',
            messagePaginacion: 'Mostranto 0 de 0 Páginas',
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

        viewModal("modalExcel", () => {

        });

        clearModal("modalExcel", async () => {

        });
    }

    componentWillUnmount() {
        this.abortControllerView.abort();
        this.abortControllerTable.abort();
    }

    loadData = async () => {
        try {
            const facturas = await apiComprobanteListcombo(this.abortControllerView.signal, {
                "tipo": "1"
            });

            const notaCredito = await apiComprobanteListcombo(this.abortControllerView.signal, {
                "tipo": "3"
            });

            await this.setStateAsync({
                comprobantes: [...facturas.data, ...notaCredito.data],
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

    loadInit = async () => {
        this.searchInit();
    }

    async searchInit() {
        if (this.state.loading) return;

        if (!validateDate(this.state.fechaInicio)) return;
        if (!validateDate(this.state.fechaFinal)) return;
        if (this.state.idEstado === "") return;

        await this.setStateAsync({ paginacion: 1, restart: true });
        this.fillTable(0, "", this.state.fechaInicio, this.state.fechaFinal, this.state.idComprobante, this.state.idEstado);
        await this.setStateAsync({ opcion: 1 });
    }

    async searchFecha() {
        if (this.state.loading) return;

        if (!validateDate(this.state.fechaInicio)) return;
        if (!validateDate(this.state.fechaFinal)) return;
        if (this.state.idEstado === "") return;

        await this.setStateAsync({ paginacion: 1, restart: false });
        this.fillTable(0, "", this.state.fechaInicio, this.state.fechaFinal, this.state.idComprobante, this.state.idEstado);
        await this.setStateAsync({ opcion: 1 });
    }

    async searchText(text) {
        if (this.state.loading) return;

        if (text.trim().length === 0) return;

        await this.setStateAsync({ paginacion: 1, restart: false });
        this.fillTable(1, text.trim(), "", "", "", "0");
        await this.setStateAsync({ opcion: 1 });
    }

    async searchComprobante() {
        if (this.state.loading) return;

        if (!validateDate(this.state.fechaInicio)) return;
        if (!validateDate(this.state.fechaFinal)) return;
        if (this.state.idEstado === "") return;

        await this.setStateAsync({ paginacion: 1, restart: false });
        this.fillTable(2, "", this.state.fechaInicio, this.state.fechaFinal, this.state.idComprobante, this.state.idEstado);
        await this.setStateAsync({ opcion: 2 });
    }

    async searchEstado() {
        if (this.state.loading) return;

        if (!validateDate(this.state.fechaInicio)) return;
        if (!validateDate(this.state.fechaFinal)) return;
        if (this.state.idEstado === "") return;

        await this.setStateAsync({ paginacion: 1, restart: false });
        this.fillTable(3, "", this.state.fechaInicio, this.state.fechaFinal, this.state.idComprobante, this.state.idEstado);
        await this.setStateAsync({ opcion: 3 });
    }

    paginacionContext = async (listid) => {
        await this.setStateAsync({ paginacion: listid, restart: false });
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

        await this.setStateAsync({
            loading: true,
            lista: [],
            messageTable: "Cargando información...",
            messagePaginacion: "Mostranto 0 de 0 Páginas"
        });

        const params = {
            "opcion": opcion,
            "buscar": buscar,
            "fechaInicio": fechaInicio,
            "fechaFinal": fechaFinal,
            "idComprobante": idComprobante,
            "idEstado": idEstado,
            "idProyecto": this.state.idProyecto,
            "fill": this.state.fill,
            "posicionPagina": ((this.state.paginacion - 1) * this.state.filasPorPagina),
            "filasPorPagina": this.state.filasPorPagina
        }
        const response = await listCpeSunat(params, this.abortControllerTable.signal);

        if (response instanceof SuccessReponse) {
            let totalPaginacion = parseInt(Math.ceil((parseFloat(response.data.total) / this.state.filasPorPagina)));
            let messagePaginacion = `Mostrando ${response.data.result.length} de ${totalPaginacion} Páginas`;

            await this.setStateAsync({
                loading: false,
                lista: response.data.result,
                totalPaginacion: totalPaginacion,
                messagePaginacion: messagePaginacion
            });
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            await this.setStateAsync({
                loading: false,
                lista: [],
                totalPaginacion: 0,
                messageTable: "Se produjo un error interno, intente nuevamente por favor.",
                messagePaginacion: "Mostranto 0 de 0 Páginas",
            });
        }
    }

    async openModal() {
        showModal('modalExcel');
    }

    onEventSendFactura = (idCpeSunat, tipo) => {
        if (tipo === "f") {
            alertDialog("Facturación", "¿Está seguro de enviar el comprobante electrónico?", async (value) => {
                if (value) {
                    // "http://localhost:8090/app/examples/boleta.php"
                    // "http://apisunat.inmobiliariagmyc.com/app/examples/boleta.php"
                    const response = await sendBoleta(idCpeSunat);

                    if (response instanceof SuccessReponse) {
                        const object = response.data;

                        if (object.state) {
                            if (object.accept) {
                                alertSuccess("Facturación", "Código " + object.code + " " + object.description, () => {
                                    this.onEventPaginacion()
                                });
                            } else {
                                alertWarning("Facturación", "Código " + object.code + " " + object.description);
                            }
                        } else {
                            alertWarning("Facturación", "Código " + object.code + " " + object.description);
                        }
                    }

                    if (response instanceof ErrorResponse) {
                        alertWarning("Facturación", response.getMessage());
                    }
                }
            });
        } else {
            alertDialog("Facturación", "¿Está seguro de enviar el comprobante electrónico?", async (value) => {
                if (value) {
                    // "http://localhost:8090/app/examples/boleta.php"
                    // "http://apisunat.inmobiliariagmyc.com/app/examples/boleta.php"
                    const response = await sendNotaCredito(idCpeSunat);

                    if (response instanceof SuccessReponse) {
                        const object = response.data;

                        if (object.state) {
                            if (object.accept) {
                                alertSuccess("Facturación", "Código " + object.code + " " + object.description, () => {
                                    this.onEventPaginacion()
                                });
                            } else {
                                alertWarning("Facturación", "Código " + object.code + " " + object.description);
                            }
                        } else {
                            alertWarning("Facturación", "Código " + object.code + " " + object.description);
                        }
                    }

                    if (response instanceof ErrorResponse) {
                        alertWarning("Facturación", response.getMessage());
                    }
                }
            });
        }
    }

    onEventImprimir = async (idCpeSunat, tipo) => {
        if (tipo === "f") {
            const data = {
                "idSede": "SD0001",
                "idCobro": idCpeSunat,
            }

            let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'key-report-inmobiliaria').toString();
            let params = new URLSearchParams({ "params": ciphertext });
            window.open("/api/cobro/repcomprobante?" + params, "_blank");
        } else {
            const data = {
                "idSede": "SD0001",
                "idNotaCredito": idCpeSunat
            }

            let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'key-report-inmobiliaria').toString();
            let params = new URLSearchParams({ "params": ciphertext });
            window.open("/api/notacredito/repcomprobante?" + params, "_blank");
        }
    }

    onEventXmlSunat = async (idCpeSunat, tipo) => {
        if (tipo === "f") {
            const data = {
                "idSede": "SD0001",
                "idCobro": idCpeSunat,
            }

            let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'key-report-inmobiliaria').toString();

            this.refUseFileXml.current.download({
                "name": "Xml Sunat",
                "file": "/api/cobro/xmlsunat",
                "params": ciphertext
            });
        } else {
            const data = {
                "idSede": "SD0001",
                "idNotaCredito": idCpeSunat,
            }

            let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'key-report-inmobiliaria').toString();

            this.refUseFileXml.current.download({
                "name": "Xml Sunat",
                "file": "/api/notacredito/xmlsunat",
                "params": ciphertext
            });
        }
    }

    onEventSendEmail(idCpeSunat, tipo) {
        if (tipo === "f") {
            alertDialog("Email", "¿Está seguro de envíar el email?", async (value) => {
                if (value) {
                    alertInfo("Email", "Envíando Correo.");

                    const params = {
                        "idSede": "SD0001",
                        "idCobro": idCpeSunat,
                    }
                    const response = await sendEmailBoleta(params);

                    if (response instanceof SuccessReponse) {
                        alertSuccess("Email", response.data);
                    }

                    if (response instanceof ErrorResponse) {
                        alertWarning("Email", response.getMessage());
                    }
                }
            });
        } else {
            alertDialog("Email", "¿Está seguro de envíar el email?", async (value) => {
                if (value) {

                    alertInfo("Email", "Envíando Correo.");

                    const params = {
                        "idSede": "SD0001",
                        "idNotaCredito": idCpeSunat,
                    }
                    const response = await sendEmailNotaCredito(params);

                    if (response instanceof SuccessReponse) {
                        alertSuccess("Email", response.data);
                    }

                    if (response instanceof ErrorResponse) {
                        alertWarning("Email", response.getMessage());
                    }
                }
            });
        }
    }

    onEventSendAnular = (idCpeSunat, tipo) => {
        if (tipo === "f") {
            alertDialog("Facturación", "¿Está seguro de anular el comprobante electrónico?", async (value) => {
                if (value) {
                    alertInfo("Facturación", "Firmando xml y enviando a sunat.");

                    const response = await sendResumen(idCpeSunat);

                    if (response instanceof SuccessReponse) {
                        const object = response.data;
                        if (object.state) {
                            if (object.accept) {
                                alertSuccess("Facturación", "Código " + object.code + " " + object.description, () => {
                                    this.onEventPaginacion()
                                });
                            } else {
                                alertWarning("Facturación", "Código " + object.code + " " + object.description);
                            }
                        } else {
                            alertWarning("Facturación", "Código " + object.code + " " + object.description);
                        }
                    }

                    if (response instanceof ErrorResponse) {
                        alertWarning("Facturación", response.getMessage());
                    }
                }
            });
        } else {
            alertDialog("Facturación", "¿Está seguro de anular el comprobante electrónico?", async (value) => {
                if (value) {

                    alertInfo("Facturación", "Firmando xml y enviando a sunat.");

                    const response = await sendResumenNotaCredito(idCpeSunat);

                    if (response instanceof SuccessReponse) {
                        const object = response.data;
                        if (object.state) {
                            if (object.accept) {
                                alertSuccess("Facturación", "Código " + object.code + " " + object.description, () => {
                                    this.onEventPaginacion()
                                });
                            } else {
                                alertWarning("Facturación", "Código " + object.code + " " + object.description);
                            }
                        } else {
                            alertWarning("Facturación", "Código " + object.code + " " + object.description);
                        }
                    }

                    if (response instanceof ErrorResponse) {
                        alertWarning("Facturación", response.getMessage());
                    }
                }
            });
        }
    }

    onEventGenerarExcel = async () => {
        if (!validateDate(this.state.fechaInicioModal)) return;
        if (!validateDate(this.state.fechaFinalModal)) return;

        const data = {
            "idSede": "SD0001",
            "fechaIni": this.state.fechaInicioModal,
            "fechaFin": this.state.fechaFinalModal,
            "idComprobante": this.state.idComprobanteModal
        }

        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'key-report-inmobiliaria').toString();

        this.refUseFileXml.current.download({
            "name": `CPE Electrónicos SUNAT ${this.state.fechaInicioModal} AL ${this.state.fechaFinalModal}`,
            "file": "/api/cobro/excelcpesunat",
            "filename": `CPE Electrónicos SUNAT ${this.state.fechaInicioModal} AL ${this.state.fechaFinalModal}.xlsx`,
            "params": ciphertext
        });

        hideModal("modalExcel");
    }

    render() {
        return (
            <ContainerWrapper>
                {
                    this.state.msgLoading ?
                        <div className="clearfix absolute-all bg-white">
                            {spinnerLoading(this.state.msgMessage)}
                        </div>
                        :
                        null
                }

                {/* Inicio modal nuevo cliente*/}
                <div className="modal fade" id="modalExcel" tabIndex="-1" aria-labelledby="modalExcelLabel" aria-hidden={true}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Generar Excel</h5>
                                <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden={true}>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">

                                {this.state.loadModal ?
                                    <div className="clearfix absolute-all bg-white">
                                        {spinnerLoading(this.state.msgModal)}
                                    </div>
                                    : null
                                }

                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="manzana">Fecha Inicio <i className="fa fa-calendar text-danger small"></i></label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            placeholder='00/00/0000'
                                            value={this.state.fechaInicioModal}
                                            onChange={(event) => this.setState({ fechaInicioModal: event.target.value })}
                                        />
                                    </div>

                                    <div className="form-group col-md-6">
                                        <label htmlFor="manzana">Fecha Final <i className="fa fa-calendar text-danger small"></i></label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            placeholder='00/00/0000'
                                            value={this.state.fechaFinalModal}
                                            onChange={(event) => this.setState({ fechaFinalModal: event.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-12">
                                        <label htmlFor="manzana">Fecha Inicio <i className="fa fa-file-text text-danger small"></i></label>
                                        <select
                                            className="form-control"
                                            value={this.state.idComprobanteModal}
                                            onChange={(event) => this.setState({ idComprobanteModal: event.target.value })}>
                                            <option value="">TODOS</option>
                                            {
                                                this.state.comprobantes.map((item, index) => (
                                                    <option key={index} value={item.idComprobante}>{item.nombre + " (" + item.serie + ")"}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-success" onClick={() => this.onEventGenerarExcel()}>Generar</button>
                                <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* fin modal nuevo cliente*/}

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
                            <img src={images.sunat} alt='Estado Sunat' width="24" /> <span>Estados SUNAT:</span>
                        </div>
                    </div>
                    <div className='col-lg-2 col-md-2 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <img src={images.accept} alt='Aceptado' width="24" /> <span>Aceptado</span>
                        </div>
                    </div>
                    <div className='col-lg-2 col-md-2 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <img src={images.unable} alt='Rechazo' width="24" /> <span>Rechazado</span>
                        </div>
                    </div>
                    <div className='col-lg-2 col-md-2 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <img src={images.reuse} alt='Pendiende de envío' width="24" /> <span>Pendiente de Envío</span>
                        </div>
                    </div>
                    <div className='col-lg-2 col-md-2 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <img src={images.error} alt='Comunicación de baja' width="24" /> <span> Comunicación de Baja (Anulado)</span>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="form-group">
                            <button className="btn btn-outline-light" onClick={() => this.loadInit()}>
                                <i className="bi bi-arrow-clockwise"></i> Recargar Vista
                            </button>
                            {" "}
                            <button className="btn btn-outline-success" onClick={() => this.openModal()}>
                                <i className="bi bi-file-earmark-excel-fill"></i> Generar Excel
                            </button>
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
                                        <option key={index} value={item.idComprobante}>{item.nombre + " (" + item.serie + ")"}</option>
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
                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                        <div className="form-group">
                            <label>Buscar:</label>
                            <div className="input-group mb-2">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-search"></i></div>
                                </div>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ingrese los datos requeridos..."
                                    ref={this.refTxtSearch}
                                    onKeyUp={(event) => keyUpSearch(event, () => this.searchText(event.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                        <div className="form-group">
                            <label>Listar:</label>
                            <select className="form-control" value={this.state.fill}
                                onChange={async (value) => {
                                    await this.setStateAsync({ fill: value.target.value })
                                    this.loadInit();
                                }}>
                                <option value="any">
                                    Por proyecto
                                </option>
                                <option value="all">
                                    Todos
                                </option>
                            </select>
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

                                                const estadoSunat = item.estado === 0 ?
                                                    <button className="btn btn-light btn-sm" onClick={() => this.onEventSendFactura(item.idCpeSunat, item.tipo)} disabled={!this.state.viewDeclarar}><img src={images.error} alt='Error' width="22" /></button>
                                                    : item.xmlSunat === "" ?
                                                        <button className="btn btn-light btn-sm" onClick={() => this.onEventSendFactura(item.idCpeSunat, item.tipo)} disabled={!this.state.viewDeclarar}><img src={images.reuse} alt='Reutilizar' width="22" /></button>
                                                        : item.xmlSunat === "0" ?
                                                            <button className="btn btn-light btn-sm" disabled={!this.state.viewDeclarar}><img src={images.accept} alt='Aceptar' width="22" /></button>
                                                            : <button className="btn btn-light btn-sm" onClick={() => this.onEventSendFactura(item.idCpeSunat, item.tipo)} disabled={!this.state.viewDeclarar}><img src={images.unable} alt='Incapaz' width="22" /></button>;

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
                                                                        <button className="dropdown-item" type="button" onClick={() => this.onEventImprimir(item.idCpeSunat, item.tipo)} disabled={!this.state.viewPdf}><img src={images.pdf} width="22" alt="Pdf" /> Archivo Pdf</button>
                                                                    </li>
                                                                    <li>
                                                                        <button className="dropdown-item" type="button" onClick={() => this.onEventXmlSunat(item.idCpeSunat, item.tipo)} disabled={!this.state.viewXml}><img src={images.xml} width="22" alt="Xml" /> Archivo Xml</button>
                                                                    </li>
                                                                    <li>
                                                                        <button className="dropdown-item" type="button" onClick={() => this.onEventSendEmail(item.idCpeSunat, item.tipo)} disabled={!this.state.viewEmail}><img src={images.email} width="22" alt="Email" /> Enviar Correo</button>
                                                                    </li>
                                                                    <li>
                                                                        <button className="dropdown-item" type="button" onClick={() => this.onEventSendAnular(item.idCpeSunat, item.tipo)} disabled={!this.state.ViewResumenDiario}><img src={images.error} width="22" alt="Error" /> Resumen Diario</button>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </td>
                                                        <td>{<span>{item.fecha}</span>}{<br></br>}{<span>{timeForma24(item.hora)}</span>}</td>
                                                        <td>{item.comprobante}{<br />}{item.serie + "-" + item.numeracion}</td>
                                                        <td>{item.documento}{<br />}{item.informacion}</td>


                                                        <td className="text-center">
                                                            {
                                                                item.estado === 0
                                                                    ? <span className="text-danger">DAR DE BAJA</span>
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
                                        restart={this.state.restart}
                                    />
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
                <FileDownloader ref={this.refUseFileXml} />
            </ContainerWrapper>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

export default connect(mapStateToProps, null)(CpeElectronicos);