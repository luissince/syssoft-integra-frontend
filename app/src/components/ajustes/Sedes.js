import React from 'react';
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

class Sedes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idSede: '',
            txtNombreEmpresa: '',
            txtNombreSede: '',
            txtTelefono: '',
            txtCelular: '',
            txtEmail: '',
            txtWeb: '',
            txtDireccion: '',
            txtPais: '',
            txtRegion: '',
            txtProvincia: '',
            txtDistrito: '',

            loadModal: false,
            nameModal: 'Nuevo Comprobante',
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

        this.refTxtNombreEmpresa = React.createRef();
        this.refTxtNombreSede = React.createRef();
        this.refTxtTelefono = React.createRef();
        this.refTxtCelular = React.createRef();
        this.refTxtEmail = React.createRef();
        this.refTxtDireccion = React.createRef();
        this.refTxtPais = React.createRef();
        this.refTxtRegion = React.createRef();
        this.refTxtProvincia = React.createRef();
        this.refTxtDistrito = React.createRef();

        this.refTxtSearch = React.createRef();

        // this.refTxtMoneda = React.createRef();
        // this.refTxtNumCuenta = React.createRef();
        // this.refTxtCci = React.createRef();
        // this.refTxtRepresentante = React.createRef();
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

        viewModal("modalSede", () => {
            this.abortControllerModal = new AbortController();

            if (this.idCodigo !== "") this.loadDataId(this.idCodigo);
        });

        clearModal("modalSede", async () => {
            this.abortControllerModal.abort();
            await this.setStateAsync({
                txtNombreEmpresa: '',
                txtNombreSede: '',
                txtTelefono: '',
                txtCelular: '',
                txtEmail: '',
                txtWeb: '',
                txtDireccion: '',
                txtPais: '',
                txtRegion: '',
                txtProvincia: '',
                txtDistrito: '',
                idSede: '',

                loadModal: false,
                nameModal: 'Nuevo Comprobante',
                msgModal: 'Cargando datos...',
            });
            this.idCodigo = "";
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
            default: this.fillTable(0, "");
        }
    }

    fillTable = async (opcion, buscar) => {
        try {
            await this.setStateAsync({ loading: true, lista: [], messageTable: "Cargando información...", messagePaginacion: "Mostranto 0 de 0 Páginas" });

            const result = await axios.get('/api/sede/list', {
                signal: this.abortControllerTable.signal,
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
            showModal('modalSede')
            await this.setStateAsync({ nameModal: "Nueva Sede" });
        }
        else {
            showModal('modalSede')
            this.idCodigo = id;
            await this.setStateAsync({ idComprobante: id, nameModal: "Editar Sede", loadModal: true });
        }
    }

    loadDataId = async (id) => {
        try {
            const result = await axios.get("/api/sede/id", {
                signal: this.abortControllerModal.signal,
                params: {
                    idSede: id
                }
            });

            await this.setStateAsync({
                txtNombreEmpresa: result.data.nombreEmpresa,
                txtNombreSede: result.data.nombreSede,
                txtTelefono: result.data.telefono,
                txtCelular: result.data.celular,
                txtEmail: result.data.email,
                txtWeb: result.data.web,
                txtDireccion: result.data.direccion,
                txtPais: result.data.pais,
                txtRegion: result.data.region,
                txtProvincia: result.data.provincia,
                txtDistrito: result.data.distrito,
                idSede: result.data.idSede,

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
        if (this.state.txtNombreEmpresa === "") {
            this.refTxtNombreEmpresa.current.focus();
        } else if (this.state.txtNombreSede === "") {
            this.refTxtNombreSede.current.focus();
        } else if (this.state.txtTelefono === "") {
            this.refTxtTelefono.current.focus();
        } else if (this.state.txtCelular === "") {
            this.refTxtCelular.current.focus();
        } else if (this.state.txtEmail === "") {
            this.refTxtEmail.current.focus();
        } else if (this.state.txtDireccion === "") {
            this.refTxtDireccion.current.focus();
        }
        else {
            try {

                ModalAlertInfo("Sede", "Procesando información...");
                hideModal("modalSede");
                if (this.state.idSede !== '') {
                    let result = await axios.post('/api/sede/update', {
                        "nombreEmpresa": this.state.txtNombreEmpresa.trim().toUpperCase(),
                        "nombreSede": this.state.txtNombreSede.trim().toUpperCase(),
                        "telefono": this.state.txtTelefono.trim().toUpperCase(),
                        "celular": this.state.txtCelular.trim().toUpperCase(),
                        "email": this.state.txtEmail.trim().toUpperCase(),
                        "web": this.state.txtWeb.trim().toUpperCase(),
                        "direccion": this.state.txtDireccion.trim().toUpperCase(),
                        "pais": this.state.txtPais.trim().toUpperCase(),
                        "region": this.state.txtRegion.trim().toUpperCase(),
                        "provincia": this.state.txtProvincia.trim().toUpperCase(),
                        "distrito": this.state.txtDistrito.trim().toUpperCase(),
                        "idSede": this.state.idSede
                    })

                    ModalAlertSuccess("Sede", result.data, () => {
                        this.onEventPaginacion();
                    });
                } else {
                    let result = await axios.post('/api/sede/add', {
                        "nombreEmpresa": this.state.txtNombreEmpresa.trim().toUpperCase(),
                        "nombreSede": this.state.txtNombreSede.trim().toUpperCase(),
                        "telefono": this.state.txtTelefono.trim().toUpperCase(),
                        "celular": this.state.txtCelular.trim().toUpperCase(),
                        "email": this.state.txtEmail.trim().toUpperCase(),
                        "web": this.state.txtWeb.trim().toUpperCase(),
                        "direccion": this.state.txtDireccion.trim().toUpperCase(),
                        "pais": this.state.txtPais.trim().toUpperCase(),
                        "region": this.state.txtRegion.trim().toUpperCase(),
                        "provincia": this.state.txtProvincia.trim().toUpperCase(),
                        "distrito": this.state.txtDistrito.trim().toUpperCase(),
                    });

                    ModalAlertSuccess("Sede", result.data, () => {
                        this.loadInit();
                    });
                }
            } catch (error) {
                ModalAlertWarning("Sede", "Se produjo un error un interno, intente nuevamente.");
            }
        }
    }


    render() {
        return (
            <>
                {/* Inicio modal */}
                <div className="modal fade" id="modalSede" data-bs-keyboard="false" data-bs-backdrop="static">
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
                                    : null}

                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label>Nombre de Empresa:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtNombreEmpresa}
                                            value={this.state.txtNombreEmpresa}
                                            onChange={(event) => this.setState({ txtNombreEmpresa: event.target.value })}
                                            placeholder="Dijite ..." />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label>Nombre de Sede:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtNombreSede}
                                            value={this.state.txtNombreSede}
                                            onChange={(event) => this.setState({ txtNombreSede: event.target.value })}
                                            placeholder="Dijite ..." />

                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-4">
                                        <label>Telefono:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtTelefono}
                                            value={this.state.txtTelefono}
                                            onChange={(event) => this.setState({ txtTelefono: event.target.value })}
                                            placeholder="Dijite ..." />
                                    </div>
                                    <div className="form-group col-md-4">
                                        <label>celular:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtCelular}
                                            value={this.state.txtCelular}
                                            onChange={(event) => this.setState({ txtCelular: event.target.value })}
                                            placeholder="Dijite ..." />
                                    </div>
                                    <div className="form-group col-md-4">
                                        <label>Email:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtEmail}
                                            value={this.state.txtEmail}
                                            onChange={(event) => this.setState({ txtEmail: event.target.value })}
                                            placeholder="Dijite ..." />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label>WebSite:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxWebSite}
                                            value={this.state.txtWeb}
                                            onChange={(event) => this.setState({ txtWeb: event.target.value })}
                                            placeholder="Dijite ..." />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label>Dirección:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtDireccion}
                                            value={this.state.txtDireccion}
                                            onChange={(event) => this.setState({ txtDireccion: event.target.value })}
                                            placeholder="Dijite ..." />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-3">
                                        <label>Pais:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtPais}
                                            value={this.state.txtPais}
                                            onChange={(event) => this.setState({ txtPais: event.target.value })}
                                            placeholder="Dijite ..." />
                                    </div>
                                    <div className="form-group col-md-3">
                                        <label>Región:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtRegion}
                                            value={this.state.txtRegion}
                                            onChange={(event) => this.setState({ txtRegion: event.target.value })}
                                            placeholder="Dijite ..." />
                                    </div>
                                    <div className="form-group col-md-3">
                                        <label>Provincia:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtProvincia}
                                            value={this.state.txtProvincia}
                                            onChange={(event) => this.setState({ txtProvincia: event.target.value })}
                                            placeholder="Dijite ..." />
                                    </div>
                                    <div className="form-group col-md-3">
                                        <label>Distrito:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtDistrito}
                                            value={this.state.txtDistrito}
                                            onChange={(event) => this.setState({ txtDistrito: event.target.value })}
                                            placeholder="Dijite ..." />
                                    </div>
                                </div>

                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => this.onEventGuardar()}>Guardar</button>
                                <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* fin modal */}

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Sedes <small className="text-secondary">LISTA</small></h5>
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
                                    type="search"
                                    className="form-control"
                                    placeholder="Buscar..."
                                    ref={this.refTxtSearch}
                                    onKeyUp={(event) => this.searchText(event.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            {/* <button className="btn btn-outline-info" onClick={() => this.openModal(this.state.idSede)}>
                                <i className="bi bi-file-plus"></i> Nuevo Registro
                            </button>
                            {" "} */}
                            <button className="btn btn-outline-secondary" onClick={() => this.fillTable(0, 1, "")}>
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
                                        <th width="10%">Sede</th>
                                        <th width="15%">Empresa</th>
                                        <th width="10%">Dirección</th>
                                        <th width="20%">Telefono</th>
                                        <th width="15%">Celular</th>
                                        <th width="15%">Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.loading ? (
                                            <tr>
                                                <td className="text-center" colSpan="7">
                                                    {spinnerLoading()}
                                                </td>
                                            </tr>
                                        ) : this.state.lista.length === 0 ? (
                                            <tr className="text-center">
                                                <td colSpan="7">¡No hay datos registrados!</td>
                                            </tr>
                                        ) : (
                                            this.state.lista.map((item, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td>{item.id}</td>
                                                        <td>{item.nombreSede}</td>
                                                        <td>{item.nombreEmpresa}</td>
                                                        <td>{item.direccion}</td>
                                                        <td>{item.telefono}</td>
                                                        <td>{item.celular}</td>
                                                        <td>
                                                            <button className="btn btn-outline-dark btn-sm" title="Editar" onClick={() => this.openModal(item.idSede)}><i className="bi bi-pencil"></i></button>
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
        )
    }

}

export default Sedes