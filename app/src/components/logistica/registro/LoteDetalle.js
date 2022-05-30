import React from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import {
    showModal,
    hideModal,
    viewModal,
    clearModal,
    numberFormat,
    spinnerLoading,
    timeForma24,
    ModalAlertDialog,
    ModalAlertInfo,
    ModalAlertSuccess,
    ModalAlertWarning,
} from '../../tools/Tools';
import { connect } from 'react-redux';

class LoteDetalle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idLote: '',
            idVenta: '',
            lote: {},
            socios: [],
            detalle: [],

            idUsuario: this.props.token.userToken.idUsuario,

            loading: true,
            messageWarning: '',
            msgLoading: 'Cargando datos...',

            idCliente: '',
            clientes: [],

            loadModal: false,
            nameModal: 'Nuevo Socio',
            msgModal: 'Cargando datos...',
        }

        this.abortControllerTable = new AbortController();

        this.refCliente = React.createRef();
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    async componentDidMount() {
        const url = this.props.location.search;
        const idLote = new URLSearchParams(url).get("idLote");
        if (idLote !== null) {
            this.loadDataId(idLote)
        } else {
            this.props.history.goBack();
        }

        viewModal("modalSocio", () => {
            this.abortControllerModal = new AbortController();
            this.loadData();
        });

        clearModal("modalSocio", async () => {
            this.abortControllerModal.abort();
            await this.setStateAsync({
                idCliente: '',
                clientes: [],
                loadModal: false,
                nameModal: 'Nuevo Socio',
                msgModal: 'Cargando datos...',
            });
        });
    }

    componentWillUnmount() {
        this.abortControllerTable.abort();
    }

    async loadData() {
        try {
            let cliente = await axios.get("/api/cliente/listcombo", {
                signal: this.abortControllerModal.signal,
            });

            let newLista = [];

            for (let cli of cliente.data) {
                for (let soc of this.state.socios) {
                    if (cli.idCliente !== soc.idCliente) {
                        newLista.push({ ...cli });
                        break;
                    }
                }
            }

            await this.setStateAsync({
                clientes: newLista,
                loadModal: false
            })
        } catch (error) {
            if (error.message !== "canceled") {
                await this.setStateAsync({
                    msgModal: "Se produjo un error interno, intente nuevamente."
                });
            }
        }
    }

    async loadDataId(id) {
        try {
            await this.setStateAsync({ loading: true });

            let result = await axios.get("/api/lote/detalle", {
                signal: this.abortControllerTable.signal,
                params: {
                    "idLote": id
                }
            });

            // console.log( result.data)

            await this.setStateAsync({
                lote: result.data.lote,
                socios: result.data.socios,
                detalle: result.data.detalle,
                idLote: id,
                idVenta: result.data.venta.idVenta,
                loading: false,
            });
        } catch (error) {
            if (error.message !== "canceled") {
                this.props.history.goBack();
            }
        }
    }

    async openModalSocio() {
        showModal('modalSocio')
        await this.setStateAsync({ loadModal: true });
    }

    async onEventGuardar() {
        if (this.state.idCliente === "") {
            this.refCliente.current.focus();
            return;
        }

        ModalAlertDialog("Lote", "¿Está de registrar el asociado?", async (value) => {
            if (value) {
                try {
                    ModalAlertInfo("Lote", "Procesando información...");
                    hideModal("modalSocio");

                    let result = await axios.post("/api/lote/socio", {
                        "idLote": this.state.idLote,
                        "idVenta": this.state.idVenta,
                        "idCliente": this.state.idCliente,
                        "idUsuario": this.state.idUsuario
                    });

                    ModalAlertSuccess("Lote", result.data, () => {
                        this.loadDataId(this.state.idLote);
                    });

                } catch (error) {
                    ModalAlertWarning("Lote",
                        "Se produjo un error un interno, intente nuevamente.");

                }
            }
        })
    }

    async onEventAnular(idCliente) {
        ModalAlertDialog("Lote", "¿Está seguro de anular al socio, la operación no es reversible?", async (value) => {
            if (value) {
                try {
                    ModalAlertInfo("Lote", "Procesando información...");
                    hideModal("modalSocio");

                    let result = await axios.delete("/api/lote/socio", {
                        params: {
                            "idVenta": this.state.idVenta,
                            "idCliente": idCliente
                        }
                    });

                    ModalAlertSuccess("Lote", result.data, () => {
                        this.loadDataId(this.state.idLote);
                    });
                } catch (error) {
                    ModalAlertWarning("Lote",
                        "Se produjo un error un interno, intente nuevamente.");
                }
            }
        })
    }

    async onEventImprimir() {
        const data = {
            "idLote": this.state.idLote,
            "idSede": "SD0001"
        }

        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'key-report-inmobiliaria').toString();
        let params = new URLSearchParams({ "params": ciphertext });
        window.open("/api/lote/replotedetalle?" + params, "_blank");

        //Despliegue 
        // window.open("/api/lote/replotedetalle?idLote=" + this.state.idLote + "&idSede=SD0001", "_blank");

        //Desarrollo
        // try {

        //     let result = await axios.get("/api/lote/replotedetalle", {
        //         responseType: "blob",
        //         params: {
        //             "idLote": this.state.idLote,
        //             "idSede": 'SD0001'
        //         }
        //     });

        //     const file = new Blob([result.data], { type: "application/pdf" });
        //     const fileURL = URL.createObjectURL(file);
        //     window.open(fileURL, "_blank");

        // } catch (error) {
        //     console.log(error)
        // }
    }

    render() {
        const { manzana, lote, lotestado } = this.state.lote;
        return (
            <>
                {/* Inicio modal */}
                <div className="modal fade" id="modalSocio" data-bs-keyboard="false" data-bs-backdrop="static">
                    <div className="modal-dialog">
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
                                    <div className="form-group col-md-12">
                                        <label>Seleccione un Socio</label>
                                        <select className="form-control"
                                            ref={this.refCliente}
                                            value={this.state.idCliente}
                                            onChange={(event) => this.setState({ idCliente: event.target.value })}>
                                            <option value="">- Seleccione -</option>
                                            {this.state.clientes.map((item, index) => (
                                                <option key={index} value={item.idCliente}>{item.informacion}</option>
                                            ))}
                                        </select>
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
                {/* fin modal */}

                {
                    this.state.loading ?
                        <div className="clearfix absolute-all bg-white">
                            {spinnerLoading(this.state.msgLoading)}
                        </div> :
                        <>
                            <div className='row'>
                                <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                    <div className="form-group">
                                        <h5>
                                            <span role="button" onClick={() => this.props.history.goBack()}><i className="bi bi-arrow-left-short"></i></span> Lote
                                            <small className="text-secondary"> Detalle</small>
                                        </h5>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <div className="form-group">
                                        <button type="button" className="btn btn-light" onClick={() => this.onEventImprimir()}><i className="fa fa-print"></i> Imprimir</button>
                                        {" "}
                                        <button type="button" className="btn btn-light"><i className="fa fa-file-archive-o"></i> Adjuntar</button>
                                    </div>
                                </div>
                            </div>

                            {/* <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <p className="lead">Descripcion</p>
                                    <div className="table-responsive">
                                        <table className="table table-borderless">
                                            <thead>
                                                <tr>
                                                    <th className="w-20 font-weight-normal p-0">Comprobante:</th>
                                                    <th className="w-80 font-weight-bold p-0">{comprobante + " " + serie + "-" + numeracion}</th>
                                                </tr>
                                                <tr>
                                                    <th className="w-20 font-weight-normal p-0">Cliente:</th>
                                                    <th className="w-80 font-weight-bold p-0">{documento + " " + cliente}</th>
                                                </tr>
                                                <tr>
                                                    <th className="w-20 font-weight-normal p-0">Fecha:</th>
                                                    <th className="w-80 font-weight-bold p-0">{fecha + " " + hora}</th>
                                                </tr>
                                                <tr>
                                                    <th className="w-20 font-weight-normal p-0">Notas:</th>
                                                    <th className="w-80 font-weight-bold p-0">{ }</th>
                                                </tr>
                                                <tr>
                                                    <th className="w-20 font-weight-normal p-0">Forma de venta:</th>
                                                    <th className="w-80 font-weight-bold p-0"> {tipo === 1 ? "CONTADO" : "CRÉDITO"}</th>
                                                </tr>
                                                <tr>
                                                    <th className="w-20 font-weight-normal p-0">Estado:</th>
                                                    <th className="w-80 font-weight-bold p-0"> {estado === 1 ? "COBRADO" : "POR COBRAR"}</th>
                                                </tr>
                                                <tr>
                                                    <th className="w-20 font-weight-normal p-0">Total:</th>
                                                    <th className="w-80 font-weight-bold p-0"> {simbolo + " " + formatMoney(monto)}</th>
                                                </tr>
                                                <tr>
                                                    <th className="w-20 font-weight-normal p-0">Archivos adjuntos:</th>
                                                    <th className="w-80 font-weight-bold p-0"> { }</th>
                                                </tr>
                                            </thead>
                                        </table>
                                    </div>
                                </div>
                            </div> */}


                            <div className="row">
                                <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                    <p className="lead">Descripcion</p>
                                    <div className="table-responsive">
                                        <table className="table table-borderless">
                                            <thead>
                                                <tr>
                                                    <th className="w-35 font-weight-normal p-0">Manzana:</th>
                                                    <th className="w-65 font-weight-bold p-0">{manzana}</th>
                                                </tr>
                                                <tr>
                                                    <th className="w-35 font-weight-normal p-0">Lote:</th>
                                                    <th className="w-65 font-weight-bold p-0">{lote}</th>
                                                </tr>
                                                <tr>
                                                    <th className="w-35 font-weight-normal p-0">Estado:</th>
                                                    <th className="w-65 font-weight-bold p-0"> {lotestado}</th>
                                                </tr>
                                            </thead>
                                        </table>
                                    </div>
                                </div>

                                <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                    <p className="lead">Medidas</p>
                                    <div className="table-responsive">
                                        <table className="table table-borderless">
                                            <thead>
                                                <tr>
                                                    <th className="w-35 font-weight-normal p-0">Medida Frontal (ML)</th>
                                                    <th className="w-65 font-weight-bold p-0">{ }</th>
                                                </tr>
                                                <tr>
                                                    <th className="w-35 font-weight-normal p-0">Costado Derecho (ML)</th>
                                                    <th className="w-65 font-weight-bold p-0">{ }</th>
                                                </tr>
                                                <tr>
                                                    <th className="w-35 font-weight-normal p-0">Costado Izquierdo (ML)</th>
                                                    <th className="w-65 font-weight-bold p-0">{ }</th>
                                                </tr>
                                                <tr>
                                                    <th className="w-35 font-weight-normal p-0"> Medida Fondo (ML)</th>
                                                    <th className="w-65 font-weight-bold p-0">{ }</th>
                                                </tr>
                                                <tr>
                                                    <th className="w-35 font-weight-normal p-0"> Area Lote (ML)</th>
                                                    <th className="w-65 font-weight-bold p-0"> { }</th>
                                                </tr>
                                                <tr>
                                                    <th className="w-35 font-weight-normal p-0"> N° Partida</th>
                                                    <th className="w-65 font-weight-bold p-0"> { }</th>
                                                </tr>
                                            </thead>
                                        </table>
                                    </div>
                                </div>

                                <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                    <p className="lead">Límites</p>
                                    <div className="table-responsive">
                                        <table className="table table-borderless">
                                            <thead>
                                                <tr>
                                                    <th className="w-35 font-weight-normal p-0">Limite, Frontal / Norte / Noroeste</th>
                                                    <th className="w-65 font-weight-bold p-0">{ }</th>
                                                </tr>
                                                <tr>
                                                    <th className="w-35 font-weight-normal p-0">Límite, Derecho / Este / Sureste</th>
                                                    <th className="w-65 font-weight-bold p-0">{ }</th>
                                                </tr>
                                                <tr>
                                                    <th className="w-35 font-weight-normal p-0">Límite, Iquierdo / Sur / Sureste</th>
                                                    <th className="w-65 font-weight-bold p-0">{ }</th>
                                                </tr>
                                                <tr>
                                                    <th className="w-35 font-weight-normal p-0">Límite, Posterior / Oeste / Noroeste</th>
                                                    <th className="w-65 font-weight-bold p-0">{ }</th>
                                                </tr>
                                                <tr>
                                                    <th className="w-35 font-weight-normal p-0">Ubicación del Lote</th>
                                                    <th className="w-65 font-weight-bold p-0"> { }</th>
                                                </tr>
                                            </thead>
                                        </table>
                                    </div>
                                </div>
                            </div>


                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <p className="lead">Socios <button className="btn btn-success btn-sm" onClick={() => this.openModalSocio()}><i className="fa fa-plus"></i></button></p>
                                    <div className="table-responsive">
                                        <table className="table table-light table-striped">
                                            <thead>
                                                <tr>
                                                    <th width="5%" className="text-center">#</th>
                                                    <th width="25%">N° Documento</th>
                                                    <th width="45%">Información</th>
                                                    <th width="20%">Estado</th>
                                                    <th width="5%" className="text-center">Anular</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    this.state.socios.map((item, index) => (
                                                        <tr key={index}>
                                                            <td className="text-center">{++index}</td>
                                                            <td>{item.documento}</td>
                                                            <td>{item.informacion}</td>
                                                            <td className={`${item.estado === 1 ? "text-success" : "text-danger"}`}>{item.estado === 1 ? "ACTIVO" : "ANULADO"}</td>
                                                            <td className="text-center"><button className="btn btn-danger btn-sm" onClick={() => this.onEventAnular(item.idCliente)}><i className="fa fa-ban"></i></button></td>
                                                        </tr>
                                                    ))
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <p className="lead">Cobros Asociados</p>
                                    <div className="table-responsive">
                                        <table className="table table-light table-striped">
                                            <thead>
                                                <tr>
                                                    <th width="5%" className="text-center">#</th>
                                                    <th width="15%">Socio</th>
                                                    <th width="20%">Concepto</th>
                                                    <th width="10%">Fecha</th>
                                                    <th width="20%">Comprobante</th>
                                                    <th width="15%">Banco</th>
                                                    <th width="15%">Monto</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    this.state.detalle.length === 0 ?
                                                        <tr><td colSpan="5" className="text-center">No hay cobros asociados.</td></tr>
                                                        :
                                                        this.state.detalle.map((item, index) => {
                                                            return (
                                                                <tr key={index}>
                                                                    <td className="text-center">{++index}</td>
                                                                    <td>{item.informacion}</td>
                                                                    <td>{item.detalle}{<br />}<small>{item.comprobanteRef}</small></td>
                                                                    <td>{item.fecha}{<br />}{timeForma24(item.hora)} </td>
                                                                    <td>{item.comprobante}{<br />}{item.serie + "-" + item.numeracion}</td>
                                                                    <td>{item.banco} </td>
                                                                    <td>{numberFormat(item.monto, item.codiso)}</td>
                                                                </tr>
                                                            )
                                                        })
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </>
                }
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

export default connect(mapStateToProps, null)(LoteDetalle);