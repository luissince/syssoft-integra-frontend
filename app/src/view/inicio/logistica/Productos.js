import React from 'react';
import axios from 'axios';
import {
    isNumeric,
    keyNumberFloat,
    showModal,
    hideModal,
    viewModal,
    clearModal,
    alertDialog,
    alertInfo,
    alertSuccess,
    alertWarning,
    spinnerLoading,
    statePrivilegio,
    keyUpSearch
} from '../../../helper/utils.helper';
import { connect } from 'react-redux';
import Paginacion from '../../../components/Paginacion';
import ContainerWrapper from '../../../components/Container';

class Productos extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idProducto: '',
            idCategoria: '',
            categorias: [],
            idConcepto: '',
            conceptos: [],
            descripcion: '',
            costo: '',
            precio: '',
            idMedida: '',
            medidas: [],
            estado: '',
            medidaFrontal: '',
            costadoDerecho: '',
            costadoIzquierdo: '',
            medidaFondo: '',
            areaProducto: '',
            numeroPartida: '',
            limiteFrontal: '',
            limiteDerecho: '',
            limiteIzquierdo: '',
            limitePosterior: '',
            ubicacionProducto: '',
            idProyecto: this.props.token.project.idProyecto,
            idUsuario: this.props.token.userToken.idUsuario,

            add: statePrivilegio(this.props.token.userToken.menus[3].submenu[1].privilegio[0].estado),
            view: statePrivilegio(this.props.token.userToken.menus[3].submenu[1].privilegio[1].estado),
            edit: statePrivilegio(this.props.token.userToken.menus[3].submenu[1].privilegio[2].estado),
            remove: statePrivilegio(this.props.token.userToken.menus[3].submenu[1].privilegio[3].estado),

            loadModal: false,
            nameModal: 'Nuevo Producto',
            messageWarning: '',
            msgModal: 'Cargando datos...',

            loading: false,
            lista: [],
            restart: false,

            opcion: 0,
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messageTable: 'Cargando información...',
            messagePaginacion: 'Mostranto 0 de 0 Páginas'
        }
        this.refCategoria = React.createRef();
        this.refConcepto = React.createRef();
        this.refDescripcion = React.createRef();
        this.refCosto = React.createRef();
        this.refPrecio = React.createRef();
        this.refMedida = React.createRef();
        this.refEstado = React.createRef();

        this.refMedidaFrontal = React.createRef();
        this.refCostadoDerecho = React.createRef();
        this.refCostadoIzquiero = React.createRef();
        this.refMedidaFondo = React.createRef();
        this.refAreaProducto = React.createRef();
        this.refNumeroPartida = React.createRef();

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

        viewModal("modalProducto", () => {
            this.abortControllerModal = new AbortController();

            if (this.idCodigo !== "") {
                this.loadDataId(this.idCodigo);
            } else {
                this.loadData();
            }
        });

        clearModal("modalProducto", async () => {
            this.abortControllerModal.abort();
            await this.setStateAsync({
                idProducto: '',
                idCategoria: '',
                categorias: [],
                idConcepto: '',
                conceptos: [],
                descripcion: '',
                costo: '',
                precio: '',
                idMedida: '',
                medidas: [],
                estado: '',
                medidaFrontal: '',
                costadoDerecho: '',
                costadoIzquierdo: '',
                medidaFondo: '',
                areaProducto: '',
                numeroPartida: '',
                limiteFrontal: '',
                limiteDerecho: '',
                limiteIzquierdo: '',
                limitePosterior: '',
                ubicacionProducto: '',

                loadModal: false,
                nameModal: 'Nuevo Comprobante',
                msgModal: 'Cargando datos...',
            });
            this.onFocusTab("info-tab", "info");
            this.idCodigo = "";
        });
    }

    componentWillUnmount() {
        this.abortControllerTable.abort();
    }

    loadInit = async () => {
        if (this.state.loading) return;

        await this.setStateAsync({ paginacion: 1, restart: true });
        this.fillTable(0, "");
        await this.setStateAsync({ opcion: 0 });
    }

    async searchText(text) {
        if (this.state.loading) return;

        if (text.trim().length === 0) return;

        await this.setStateAsync({ paginacion: 1, restart: false });
        this.fillTable(1, text.trim());
        await this.setStateAsync({ opcion: 1 });
    }

    paginacionContext = async (listid) => {
        await this.setStateAsync({ paginacion: listid, restart: false });
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
            default: this.fillTable(0, "");
        }
    }

    fillTable = async (opcion, buscar) => {
        try {
            await this.setStateAsync({ loading: true, lista: [], messageTable: "Cargando información...", messagePaginacion: "Mostranto 0 de 0 Páginas" });

            const result = await axios.get('/api/producto/list', {
                params: {
                    "idProyecto": this.state.idProyecto,
                    "opcion": opcion,
                    "buscar": buscar.trim(),
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
        if (id === "") {
            showModal('modalProducto');
            await this.setStateAsync({ nameModal: "Nuevo Producto", loadModal: true });
        } else {
            showModal('modalProducto');
            this.idCodigo = id;
            await this.setStateAsync({ idProducto: id, nameModal: "Editar Producto", loadModal: true });
        }
    }

    async loadData() {
        try {
            let categoria = await axios.get('/api/categoria/listcombo', {
                signal: this.abortControllerModal.signal,
                params: {
                    "idProyecto": this.state.idProyecto,
                }
            });

            let medida = await axios.get('/api/medida/listcombo', {
                signal: this.abortControllerModal.signal,
            });

            const concepto = await axios.get("/api/concepto/listcombo", {
                signal: this.abortControllerModal.signal,
            });

            await this.setStateAsync({
                categorias: categoria.data,
                medidas: medida.data,
                conceptos: concepto.data,
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

    async loadDataId(id) {
        try {
            let categoria = await axios.get('/api/categoria/listcombo', {
                signal: this.abortControllerModal.signal,
                params: {
                    "idProyecto": this.state.idProyecto,
                }
            });

            const concepto = await axios.get("/api/concepto/listcombo", {
                signal: this.abortControllerModal.signal,
            });

            let medida = await axios.get('/api/medida/listcombo', {
                signal: this.abortControllerModal.signal,
            });

            let result = await axios.get('/api/producto/id', {
                signal: this.abortControllerModal.signal,
                params: {
                    "idProducto": id
                }
            });

            await this.setStateAsync({
                idProducto: result.data.idProducto,
                idCategoria: result.data.idCategoria,
                idConcepto: result.data.idConcepto,
                descripcion: result.data.descripcion,
                costo: result.data.costo.toString(),
                precio: result.data.precio.toString(),
                idMedida: result.data.idMedida,
                estado: result.data.estado,
                medidaFrontal: result.data.medidaFrontal.toString(),
                costadoDerecho: result.data.costadoDerecho,
                costadoIzquierdo: result.data.costadoIzquierdo,
                medidaFondo: result.data.medidaFondo,
                areaProducto: result.data.areaProducto,
                numeroPartida: result.data.numeroPartida,
                limiteFrontal: result.data.limiteFrontal,
                limiteDerecho: result.data.limiteDerecho,
                limiteIzquierdo: result.data.limiteIzquierdo,
                limitePosterior: result.data.limitePosterior,
                ubicacionProducto: result.data.ubicacionProducto,

                categorias: categoria.data,
                medidas: medida.data,
                conceptos: concepto.data,

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
        if (this.state.idCategoria === "") {
            this.onFocusTab("info-tab", "info");
            this.refCategoria.current.focus();
            return;
        }

        if (this.state.idConcepto === "") {
            this.onFocusTab("info-tab", "info");
            this.refConcepto.current.focus();
            return;
        }

        if (this.state.descripcion === "") {
            this.onFocusTab("info-tab", "info");
            this.refDescripcion.current.focus();
            return;
        }

        if (!isNumeric(this.state.costo)) {
            this.onFocusTab("info-tab", "info");
            this.refCosto.current.focus();
            return;
        }

        if (!isNumeric(this.state.precio)) {
            this.onFocusTab("info-tab", "info");
            this.refPrecio.current.focus();
            return;
        }

        if (this.state.idMedida === "") {
            this.onFocusTab("info-tab", "info");
            this.refMedida.current.focus();
            return;
        }

        if (this.state.estado === "") {
            this.onFocusTab("info-tab", "info");
            this.refEstado.current.focus();
            return;
        }

        try {
            alertInfo("Producto", "Procesando información...");
            hideModal("modalProducto");
            if (this.state.idProducto !== '') {
                let result = await axios.put("/api/producto", {
                    "idProducto": this.state.idProducto,
                    "idCategoria": this.state.idCategoria,
                    "idConcepto": this.state.idConcepto,
                    "descripcion": this.state.descripcion.trim().toUpperCase(),
                    "costo": this.state.costo,
                    "precio": this.state.precio,
                    "idMedida": this.state.idMedida,
                    "estado": this.state.estado,
                    "medidaFrontal": isNumeric(this.state.medidaFrontal) ? this.state.medidaFrontal : 0,
                    "costadoDerecho": isNumeric(this.state.costadoDerecho) ? this.state.costadoDerecho : 0,
                    "costadoIzquierdo": isNumeric(this.state.costadoIzquierdo) ? this.state.costadoIzquierdo : 0,
                    "medidaFondo": isNumeric(this.state.medidaFondo) ? this.state.medidaFondo : 0,
                    "areaProducto": isNumeric(this.state.areaProducto) ? this.state.areaProducto : 0,
                    "numeroPartida": isNumeric(this.state.numeroPartida) ? this.state.numeroPartida : 0,
                    "limiteFrontal": this.state.limiteFrontal,
                    "limiteDerecho": this.state.limiteDerecho,
                    "limiteIzquierdo": this.state.limiteIzquierdo,
                    "limitePosterior": this.state.limitePosterior,
                    "ubicacionProducto": this.state.ubicacionProducto,
                    "idUsuario": this.state.idUsuario
                });

                alertSuccess("Producto", result.data, () => {
                    this.onEventPaginacion();
                });
            } else {
                let result = await axios.post("/api/producto", {
                    "idCategoria": this.state.idCategoria,
                    "idConcepto": this.state.idConcepto,
                    "descripcion": this.state.descripcion.trim().toUpperCase(),
                    "costo": this.state.costo,
                    "precio": this.state.precio,
                    "idMedida": this.state.idMedida,
                    "estado": this.state.estado,
                    "medidaFrontal": isNumeric(this.state.medidaFrontal) ? this.state.medidaFrontal : 0,
                    "costadoDerecho": isNumeric(this.state.costadoDerecho) ? this.state.costadoDerecho : 0,
                    "costadoIzquierdo": isNumeric(this.state.costadoIzquierdo) ? this.state.costadoIzquierdo : 0,
                    "medidaFondo": isNumeric(this.state.medidaFondo) ? this.state.medidaFondo : 0,
                    "areaProducto": isNumeric(this.state.areaProducto) ? this.state.areaProducto : 0,
                    "numeroPartida": isNumeric(this.state.numeroPartida) ? this.state.numeroPartida : 0,
                    "limiteFrontal": this.state.limiteFrontal,
                    "limiteDerecho": this.state.limiteDerecho,
                    "limiteIzquierdo": this.state.limiteIzquierdo,
                    "limitePosterior": this.state.limitePosterior,
                    "ubicacionProducto": this.state.ubicacionProducto,
                    "idUsuario": this.state.idUsuario
                });

                alertSuccess("Producto", result.data, () => {
                    this.loadInit();
                });
            }
        } catch (error) {
            alertWarning("Producto", "Se produjo un error un interno, intente nuevamente.");
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

    onEventMostrar(idProducto) {
        this.props.history.push({
            pathname: `${this.props.location.pathname}/detalle`,
            search: "?idProducto=" + idProducto
        })
    }

    onEventDelete(idProducto) {
        alertDialog("Producto", "¿Estás seguro de eliminar el producto?", async (event) => {
            if (event) {
                try {
                    alertInfo("Producto", "Procesando información...")
                    let result = await axios.delete('/api/producto', {
                        params: {
                            "idProducto": idProducto
                        }
                    })
                    alertSuccess("Producto", result.data, () => {
                        this.loadInit();
                    })
                } catch (error) {
                    if (error.response !== undefined) {
                        alertWarning("Producto", error.response.data)
                    } else {
                        alertWarning("Producto", "Se genero un error interno, intente nuevamente.")
                    }
                }
            }
        })
    }

    render() {
        return (
            <ContainerWrapper>
                {/* Inicio modal nuevo cliente*/}
                {/* <div className="modal fade" id="modalProducto" tabIndex="-1" aria-labelledby="modalProductoLabel" aria-hidden={true}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{this.state.nameModal}</h5>
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

                                {
                                    this.state.messageWarning === '' ? null :
                                        <div className="alert alert-warning" role="alert">
                                            <i className="bi bi-exclamation-diamond-fill"></i> {this.state.messageWarning}
                                        </div>
                                }

                                <ul className="nav nav-tabs" id="myTab" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <a className="nav-link active" id="info-tab" data-bs-toggle="tab" href="#info" role="tab" aria-controls="info" aria-selected={true}>
                                            <i className="bi bi-info-circle"></i> Producto
                                        </a>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <a className="nav-link" id="medida-tab" data-bs-toggle="tab" href="#medida" role="tab" aria-controls="medida" aria-selected={false}>
                                            <i className="bi bi-aspect-ratio"></i> Servicio
                                        </a>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <a className="nav-link" id="limite-tab" data-bs-toggle="tab" href="#limite" role="tab" aria-controls="limite" aria-selected={false}>
                                            <i className="bi bi-pip"></i> Combo
                                        </a>
                                    </li>
                                </ul>
                                <div className="tab-content pt-2" id="myTabContent">
                                    <div className="tab-pane fade active show" id="info" role="tabpanel" aria-labelledby="info-tab">
                                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                            <div className="form-group">
                                                <a>
                                                    <i class="fa fa-question-circle-o" aria-hidden="true" ></i> Crea los bienes y mercancías que vendes e indica si deseas tener el control de tu inventario.
                                                </a>
                                            </div>

                                            <div className="form-row">
                                                <div className="form-group col-md-6">
                                                    <label htmlFor="descripción">Nombre <i className="fa fa-asterisk text-danger small"></i></label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="descripcion"
                                                        placeholder='ej. Producto 07'
                                                        ref={this.refDescripcion}
                                                        value={this.state.descripcion}
                                                        onChange={(event) => {
                                                            this.setState({ descripcion: event.target.value })
                                                        }}
                                                    />
                                                </div>
                                                <div className="form-group col-md-6">
                                                    <label htmlFor="medidaSunat">Unidad de Medida(Sunat) <i className="fa fa-asterisk text-danger small"></i></label>
                                                    <select
                                                        className="form-control"
                                                        id="medidaSunat"
                                                        ref={this.refMedida}
                                                        value={this.state.idMedida}
                                                        onChange={(event) => {
                                                            this.setState({ idMedida: event.target.value })
                                                        }}>
                                                        <option value="">- Seleccione -</option>
                                                        {
                                                            this.state.medidas.map((item, index) => (
                                                                <option key={index} value={item.idMedida}>{item.nombre}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <div className="form-group col-md-6">
                                                    <label htmlFor="categoria">Categoria <i className="fa fa-asterisk text-danger small"></i></label>
                                                    <select
                                                        className="form-control"
                                                        id="categoria"
                                                        ref={this.refCategoria}
                                                        value={this.state.idCategoria}
                                                        onChange={(event) => {
                                                            this.setState({ idCategoria: event.target.value })
                                                        }}
                                                    >
                                                        <option value="">- Seleccione -</option>
                                                        {
                                                            this.state.categorias.map((item, index) => (
                                                                <option key={index} value={item.idCategoria}>{item.nombre}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                                <div className="form-group col-md-3">
                                                    <label htmlFor="descripción">Cantidad <i className="fa fa-asterisk text-danger small"></i></label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="descripcion"
                                                        placeholder='ej. 123'
                                                        ref={this.refDescripcion}
                                                        value={this.state.descripcion}
                                                        onChange={(event) => {
                                                            this.setState({ descripcion: event.target.value })
                                                        }}
                                                    />
                                                </div>
                                                <div className="form-group col-md-3">
                                                    <label htmlFor="estado">Estado <i className="fa fa-asterisk text-danger small"></i></label>
                                                    <select
                                                        className="form-control"
                                                        id="estado"
                                                        ref={this.refEstado}
                                                        value={this.state.estado}
                                                        onChange={(event) => {
                                                            this.setState({ estado: event.target.value })
                                                        }}
                                                    >
                                                        <option value="">- Seleccione -</option>
                                                        <option value="1">Disponible</option>
                                                        <option value="2">Reservado</option>
                                                        <option value="3">Vendido</option>
                                                        <option value="4">Inactivo</option>
                                                    </select>
                                                </div>
                                            </div>





                                            <div className="form-row">
                                                <div className="form-group col-md-4">
                                                    <label htmlFor="categoria">Concepto <i className="fa fa-asterisk text-danger small"></i></label>
                                                    <select
                                                        className="form-control"
                                                        id="categoria"
                                                        ref={this.refConcepto}
                                                        value={this.state.idConcepto}
                                                        onChange={(event) => {
                                                            this.setState({ idConcepto: event.target.value })
                                                        }}
                                                    >
                                                        <option value="">- Seleccione -</option>
                                                        {
                                                            this.state.conceptos.map((item, index) => (
                                                                <option key={index} value={item.idConcepto}>{item.nombre}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                                <div className="form-group col-md-4">
                                                    <label htmlFor="cAproximado">Costo Aprox. <i className="fa fa-asterisk text-danger small"></i></label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="cAproximado"
                                                        placeholder='0.00'
                                                        ref={this.refCosto}
                                                        value={this.state.costo}
                                                        onChange={(event) => {
                                                            this.setState({ costo: event.target.value })
                                                        }}
                                                        onKeyPress={keyNumberFloat}
                                                    />
                                                </div>

                                                <div className="form-group col-md-4">
                                                    <label htmlFor="pvContado">Prec. Contado <i className="fa fa-asterisk text-danger small"></i></label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="pvContado"
                                                        placeholder='0.00'
                                                        ref={this.refPrecio}
                                                        value={this.state.precio}
                                                        onChange={(event) => {
                                                            this.setState({ precio: event.target.value })
                                                        }}
                                                        onKeyPress={keyNumberFloat}
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="tab-pane fade" id="medida" role="tabpanel" aria-labelledby="medida-tab">
                                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                            <div className="form-group">
                                                <label htmlFor="mFrontal">Medida Frontal (ML)</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="mFrontal"
                                                    placeholder='0'
                                                    ref={this.refMedidaFrontal}
                                                    value={this.state.medidaFrontal}
                                                    onChange={(event) => {
                                                        this.setState({ medidaFrontal: event.target.value })
                                                    }}
                                                    onKeyPress={keyNumberFloat}
                                                />
                                            </div>

                                            <div className="form-row">
                                                <div className="form-group col-md-6">
                                                    <label htmlFor="coDerecho">Costado Derecho (ML)</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="coDerecho"
                                                        placeholder='0'
                                                        ref={this.refCostadoDerecho}
                                                        value={this.state.costadoDerecho}
                                                        onChange={(event) => {
                                                            this.setState({ costadoDerecho: event.target.value })
                                                        }}
                                                        onKeyPress={keyNumberFloat}
                                                    />
                                                </div>

                                                <div className="form-group col-md-6">
                                                    <label htmlFor="coIzquierdo">Costado Izquierdo (ML)</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="coIzquierdo"
                                                        placeholder='0'
                                                        ref={this.refCostadoIzquiero}
                                                        value={this.state.costadoIzquierdo}
                                                        onChange={(event) => {
                                                            this.setState({ costadoIzquierdo: event.target.value })
                                                        }}
                                                        onKeyPress={keyNumberFloat}
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <div className="form-group col-md-6">
                                                    <label htmlFor="mFondo">Medida Fondo (ML)</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="mFondo"
                                                        placeholder='0'
                                                        ref={this.refMedidaFondo}
                                                        value={this.state.medidaFondo}
                                                        onChange={(event) => {
                                                            this.setState({ medidaFondo: event.target.value })
                                                        }}
                                                        onKeyPress={keyNumberFloat}
                                                    />
                                                </div>

                                                <div className="form-group col-md-6">
                                                    <label htmlFor="aProducto">Area Producto (M2)</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="aProducto"
                                                        placeholder='0'
                                                        ref={this.refAreaProducto}
                                                        value={this.state.areaProducto}
                                                        onChange={(event) => {
                                                            this.setState({ areaProducto: event.target.value })
                                                        }}
                                                        onKeyPress={keyNumberFloat}
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="nPartida">N° Partida</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="nPartida"
                                                    placeholder='0'
                                                    ref={this.refNumeroPartida}
                                                    value={this.state.numeroPartida}
                                                    onChange={(event) => {
                                                        this.setState({ numeroPartida: event.target.value })
                                                    }}
                                                    onKeyPress={keyNumberFloat}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="tab-pane fade" id="limite" role="tabpanel" aria-labelledby="limite-tab">
                                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                            <div className="form-group">
                                                <label htmlFor="lFrontal">Limite, Frontal / Norte / Noreste</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="lFrontal"
                                                    placeholder='Limite'
                                                    value={this.state.limiteFrontal}
                                                    onChange={(event) => {
                                                        this.setState({ limiteFrontal: event.target.value })
                                                    }}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="lDerecho">Limite, Derecho / Este / Sureste</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="lDerecho"
                                                    placeholder='Limite'
                                                    value={this.state.limiteDerecho}
                                                    onChange={(event) => {
                                                        this.setState({ limiteDerecho: event.target.value })
                                                    }}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="lIzquierdo">Limite, Izquierdo / Sur / Suroeste</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="lIzquierdo"
                                                    placeholder='Limite'
                                                    value={this.state.limiteIzquierdo}
                                                    onChange={(event) => {
                                                        this.setState({ limiteIzquierdo: event.target.value })
                                                    }}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="lPosterior">Limite, Posterior / Oeste / Noroeste</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="lPosterior"
                                                    placeholder='Limite'
                                                    value={this.state.limitePosterior}
                                                    onChange={(event) => {
                                                        this.setState({ limitePosterior: event.target.value })
                                                    }}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="ubicacionProducto">Ubicación del Producto</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="ubicacionProducto"
                                                    placeholder='ej. Frente al parque'
                                                    value={this.state.ubicacionProducto}
                                                    onChange={(event) => {
                                                        this.setState({ ubicacionProducto: event.target.value })
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => this.onEventGuardar()}>Aceptar</button>
                                <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div> */}
                <div className="modal fade" id="modalProducto" tabIndex="-1" aria-labelledby="modalProductoLabel" aria-hidden={true}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{this.state.nameModal}</h5>
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

                                {
                                    this.state.messageWarning === '' ? null :
                                        <div className="alert alert-warning" role="alert">
                                            <i className="bi bi-exclamation-diamond-fill"></i> {this.state.messageWarning}
                                        </div>
                                }

                                <ul className="nav nav-tabs" id="myTab" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <a className="nav-link active" id="info-tab" data-bs-toggle="tab" href="#info" role="tab" aria-controls="info" aria-selected={true}>
                                            <i className="bi bi-info-circle"></i> Producto
                                        </a>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <a className="nav-link" id="medida-tab" data-bs-toggle="tab" href="#medida" role="tab" aria-controls="medida" aria-selected={false}>
                                            <i className="bi bi-aspect-ratio"></i> Servicio
                                        </a>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <a className="nav-link" id="limite-tab" data-bs-toggle="tab" href="#limite" role="tab" aria-controls="limite" aria-selected={false}>
                                            <i className="bi bi-pip"></i> Combo
                                        </a>
                                    </li>
                                </ul>
                                <div className="tab-content pt-2" id="myTabContent">
                                    <div className="tab-pane fade active show" id="info" role="tabpanel" aria-labelledby="info-tab">
                                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                            <div className="form-group">
                                                <a>
                                                    <i class="fa fa-question-circle-o" aria-hidden="true" ></i> Crea los bienes y mercancías que vendes e indica si deseas tener el control de tu inventario.
                                                </a>
                                            </div>

                                            <div className="form-row">
                                                <div className="form-group col-md-6">
                                                    <label htmlFor="descripción">Nombre <i className="fa fa-asterisk text-danger small"></i></label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id=""
                                                        placeholder='ej. Producto 07'
                                                    />
                                                </div>
                                                <div className="form-group col-md-6">
                                                    <label htmlFor="medidaSunat">Unidad de Medida <i className="fa fa-asterisk text-danger small"></i></label>
                                                    <select
                                                        className="form-control"
                                                        id="medidaSunat"
                                                        ref={this.refMedida}
                                                        value={this.state.idMedida}
                                                        onChange={(event) => {
                                                            this.setState({ idMedida: event.target.value })
                                                        }}>
                                                        <option value="">- Seleccione -</option>
                                                        {
                                                            this.state.medidas.map((item, index) => (
                                                                <option key={index} value={item.idMedida}>{item.nombre}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <div className="form-group col-md-6">
                                                    <label htmlFor="categoria">Categoria <i className="fa fa-asterisk text-danger small"></i></label>
                                                    <select
                                                        className="form-control"
                                                        id="categoria"
                                                        ref={this.refCategoria}
                                                        value={this.state.idCategoria}
                                                        onChange={(event) => {
                                                            this.setState({ idCategoria: event.target.value })
                                                        }}
                                                    >
                                                        <option value="">- Seleccione -</option>
                                                        {
                                                            this.state.categorias.map((item, index) => (
                                                                <option key={index} value={item.idCategoria}>{item.nombre}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                                <div className="form-group col-md-3">
                                                    <label htmlFor="descripción">Cantidad <i className="fa fa-asterisk text-danger small"></i></label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="descripcion"
                                                        placeholder='ej. 123'
                                                        ref={this.refDescripcion}
                                                        value={this.state.descripcion}
                                                        onChange={(event) => {
                                                            this.setState({ descripcion: event.target.value })
                                                        }}
                                                    />
                                                </div>
                                                <div className="form-group col-md-3">
                                                    <label htmlFor="estado">Estado <i className="fa fa-asterisk text-danger small"></i></label>
                                                    <select
                                                        className="form-control"
                                                        id="estado"
                                                        ref={this.refEstado}
                                                        value={this.state.estado}
                                                        onChange={(event) => {
                                                            this.setState({ estado: event.target.value })
                                                        }}
                                                    >
                                                        <option value="">- Seleccione -</option>
                                                        <option value="1">Disponible</option>
                                                        <option value="2">Reservado</option>
                                                        <option value="3">Vendido</option>
                                                        <option value="4">Inactivo</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <div className="form-group col-md-4">
                                                    <label htmlFor="categoria">Concepto <i className="fa fa-asterisk text-danger small"></i></label>
                                                    <select
                                                        className="form-control"
                                                        id="categoria"
                                                        ref={this.refConcepto}
                                                        value={this.state.idConcepto}
                                                        onChange={(event) => {
                                                            this.setState({ idConcepto: event.target.value })
                                                        }}
                                                    >
                                                        <option value="">- Seleccione -</option>
                                                        {
                                                            this.state.conceptos.map((item, index) => (
                                                                <option key={index} value={item.idConcepto}>{item.nombre}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                                <div className="form-group col-md-4">
                                                    <label htmlFor="cAproximado">Costo Aprox. <i className="fa fa-asterisk text-danger small"></i></label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="cAproximado"
                                                        placeholder='0.00'
                                                        ref={this.refCosto}
                                                        value={this.state.costo}
                                                        onChange={(event) => {
                                                            this.setState({ costo: event.target.value })
                                                        }}
                                                        onKeyPress={keyNumberFloat}
                                                    />
                                                </div>

                                                <div className="form-group col-md-4">
                                                    <label htmlFor="pvContado">Precio Contado <i className="fa fa-asterisk text-danger small"></i></label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="pvContado"
                                                        placeholder='0.00'
                                                        ref={this.refPrecio}
                                                        value={this.state.precio}
                                                        onChange={(event) => {
                                                            this.setState({ precio: event.target.value })
                                                        }}
                                                        onKeyPress={keyNumberFloat}
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="tab-pane fade" id="medida" role="tabpanel" aria-labelledby="medida-tab">
                                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                            <div className="form-group">
                                                <a>
                                                    <i class="fa fa-question-circle-o" aria-hidden="true" ></i> Crea las actividades comerciales o de consultoría que ofreces a tus clientes.
                                                </a>
                                            </div>

                                            <div className="form-row">
                                                <div className="form-group col-md-6">
                                                    <label htmlFor="coDerecho">Nombre</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id=""
                                                        placeholder='ej. servicio 1'
                                                    />
                                                </div>
                                                <div className="form-group col-md-6">
                                                    <label htmlFor="mFrontal">Unidad de medida</label>
                                                    <select
                                                        className="form-control"
                                                        id=""
                                                    >
                                                        <option value="">- Seleccione -</option>
                                                        <option value="1">Disponible</option>
                                                        <option value="2">Reservado</option>
                                                        <option value="3">Vendido</option>
                                                        <option value="4">Inactivo</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <div className="form-group col-md-4">
                                                    <label htmlFor="coDerecho">Precio base</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id=""
                                                        placeholder='S/ 0.00'
                                                    />
                                                </div>
                                                <div className="form-group col-md-4">
                                                    <label htmlFor="mFrontal">Impuesto</label>
                                                    <select
                                                        className="form-control"
                                                        id=""
                                                    >
                                                        <option value="">- Seleccione -</option>
                                                        <option value="1">ninguno (0%)</option>
                                                        <option value="2">IGV - (18.00%)</option>
                                                        <option value="3">Exonerado - (0.00%)</option>
                                                    </select>
                                                </div>
                                                <div className="form-group col-md-4">
                                                    <label htmlFor="mFrontal">Precio Total</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id=""
                                                        placeholder=''
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="tab-pane fade" id="limite" role="tabpanel" aria-labelledby="limite-tab">
                                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                            <div className="form-group">
                                                <a>
                                                    <i class="fa fa-question-circle-o" aria-hidden="true" ></i> Agrupa en un solo ítem un conjunto de productos, servicios o una combinación entre ambos.
                                                </a>
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group col-md-6">
                                                    <label htmlFor="coDerecho">Nombre</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id=""
                                                        placeholder='ej. servicio 1'
                                                    />
                                                </div>
                                                <div className="form-group col-md-6">
                                                    <label htmlFor="mFrontal">Unidad de medida</label>
                                                    <select
                                                        className="form-control"
                                                        id=""
                                                    >
                                                        <option value="">- Seleccione -</option>
                                                        <option value="1">Disponible</option>
                                                        <option value="2">Reservado</option>
                                                        <option value="3">Vendido</option>
                                                        <option value="4">Inactivo</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group col-md-4">
                                                    <label htmlFor="coDerecho">Precio base</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id=""
                                                        placeholder='S/ 0.00'
                                                    />
                                                </div>
                                                <div className="form-group col-md-4">
                                                    <label htmlFor="mFrontal">Impuesto</label>
                                                    <select
                                                        className="form-control"
                                                        id=""
                                                    >
                                                        <option value="">- Seleccione -</option>
                                                        <option value="1">ninguno (0%)</option>
                                                        <option value="2">IGV - (18.00%)</option>
                                                        <option value="3">Exonerado - (0.00%)</option>
                                                    </select>
                                                </div>
                                                <div className="form-group col-md-4">
                                                    <label htmlFor="mFrontal">Precio Total</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id=""
                                                        placeholder=''
                                                    />
                                                </div>
                                            </div>
                                        </div>
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
                {/* fin modal nuevo cliente*/}

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Productos <small className="text-secondary">LISTA</small></h5>
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
                                    onKeyUp={(event) => keyUpSearch(event, () => this.searchText(event.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            <button className="btn btn-outline-info" onClick={() => this.openModal('')} disabled={!this.state.add}>
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
                                        <th width="5%" className="text-center">#</th>
                                        <th width="15%">Descripción</th>
                                        <th width="25%">P. Venta</th>
                                        <th width="20%">M.F(ML)</th>
                                        <th width="20%">M.C.D(ML)</th>
                                        <th width="20%">Area(M2)</th>
                                        <th width="10%">Estado</th>
                                        <th width="5%">Mostar</th>
                                        <th width="5%" className="text-center">Editar</th>
                                        <th width="5%" className="text-center">Eliminar</th>
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
                                                return (
                                                    <tr key={index}>
                                                        <td className="text-center">{item.id}</td>
                                                        <td>{item.descripcion}{<br />}{<small>{item.categoria}</small>}</td>
                                                        <td>{item.precio}</td>
                                                        <td>{item.medidaFondo}</td>
                                                        <td>{item.medidaFrontal}</td>
                                                        <td>{item.areaProducto}</td>
                                                        <td>
                                                            {
                                                                item.estado === 1 ? <span className="badge badge-warning">Disponible</span>
                                                                    : item.estado === 2 ? <span className="badge badge-info">Reservado</span>
                                                                        : item.estado === 3 ? <span className="badge badge-success">Vendido</span>
                                                                            : <span className="badge badge-warnin">Inactivo</span>
                                                            }
                                                        </td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-outline-info btn-sm"
                                                                title="Detalle"
                                                                onClick={() => this.onEventMostrar(item.idProducto)}
                                                                disabled={!this.state.view}>
                                                                <i className="bi bi-eye"></i>
                                                            </button>
                                                        </td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-outline-warning btn-sm"
                                                                title="Editar"
                                                                onClick={() => this.openModal(item.idProducto)}
                                                                disabled={!this.state.edit}>
                                                                <i className="bi bi-pencil"></i>
                                                            </button>
                                                        </td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-outline-danger btn-sm"
                                                                title="Anular"
                                                                onClick={() => this.onEventDelete(item.idProducto)}
                                                                disabled={!this.state.remove}>
                                                                <i className="bi bi-trash"></i>
                                                            </button>
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
                                        restart={this.state.restart}
                                    />
                                </ul>
                            </nav>
                        </div>
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

export default connect(mapStateToProps, null)(Productos);
