import React from 'react';
import axios from 'axios';
import { spinnerLoading, timeForma24, showModal, clearModal, viewModal } from '../tools/Tools'


class Ventas extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

            datosVenta: [],
            detalleVenta: [],

            lista: [],
            loading: false,
            opcion: 0,
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messagePaginacion: 'Mostranto 0 de 0 Páginas',
            loadModal: false,
            msgModal: 'Cargando datos...',
            importeTotal: 0.0
        }

        this.idVenta = ''
        this.abortControllerTable = new AbortController();
  
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    componentDidMount() {
        this.fillTable(0, 1, "");

        viewModal("modalDetalleVenta", () => {
            this.abortControllerModal = new AbortController();
            this.loadDataId(this.idVenta);
        });

        clearModal("modalDetalleVenta", async () => {
            this.abortControllerModal.abort();
            await this.setStateAsync({
                datosVenta: [],
                detalleVenta: [],
                loadModal: false,
                msgModal: 'Cargando datos...',
                importeTotal: 0.0
            });
            this.idVenta = ''
        });
    }

    componentWillUnmount() {
        this.abortControllerTable.abort();
    }

    fillTable = async (option, paginacion, buscar) => {

        try {
            await this.setStateAsync({ loading: true, paginacion: paginacion, lista: [] });
            const result = await axios.get('/api/factura/list', {
                signal: this.abortControllerTable.signal,
                params: {
                    "option": option,
                    "buscar": buscar.trim().toUpperCase(),
                    "posicionPagina": ((this.state.paginacion - 1) * this.state.filasPorPagina),
                    "filasPorPagina": this.state.filasPorPagina
                }
            });

            let totalPaginacion = parseInt(Math.ceil((parseFloat(result.data.total) / this.state.filasPorPagina)));
            let messagePaginacion = `Mostrando ${result.data.result.length} de ${totalPaginacion} Páginas`;

            this.setState({
                loading: false,
                lista: result.data.result,
                totalPaginacion: totalPaginacion,
                messagePaginacion: messagePaginacion
            });
            // console.log(result);
        } catch (err) {
            console.log(err.response.data.message)
            console.log(err.response.status)
        }
    }

    onEventNuevaVenta = () => {
        this.props.history.push(`${this.props.location.pathname}/proceso`)
    }

    async openModal(id) {
        if (id === '') {
            return;
        } else {
            this.idVenta = id;
            showModal('modalDetalleVenta')
            await this.setStateAsync({ loadModal: true });
        }
    }

    loadDataId = async (id) => {
        
        try {

            const venta = await axios.get("/api/factura/id", {
                signal: this.abortControllerModal.signal,
                params: {
                    idVenta: id
                }
            });

            await this.setStateAsync({
                datosVenta: venta.data.result,
                detalleVenta: venta.data.detalle,
                loadModal: false,
            });

            let total = 0
            for(let i of this.state.detalleVenta){
                total = total + (parseFloat(i.precio)*parseFloat(i.cantidad))
            }

            await this.setStateAsync({importeTotal: total})
            

        } catch (error) {
            console.log(error)
            await this.setStateAsync({
                msgModal: "Se produjo un error interno, intente nuevamente."
            });
        }
    }

    render() {
        return (

            <>
                {/* Inicio modal */}
                <div className="modal fade" id="modalDetalleVenta" data-bs-keyboard="false" data-bs-backdrop="static">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Detalle de venta</h5>
                                <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {this.state.loadModal ?
                                    <div className="clearfix absolute-all bg-white">
                                        {spinnerLoading(this.state.msgModal)}
                                    </div>
                                    : null
                                }

                                <div className="row">
                                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                                        <div className="table-responsive">
                                            <table className="table border-0">
                                                <thead>
                                                    <tr>
                                                        <th className="text-left border-0 p-1">Comprobante:</th>
                                                        <th className="text-left border-0 p-1">{this.state.datosVenta.idComprobante}</th>
                                                    </tr>
                                                    <tr>
                                                        <th className="text-left border-0 p-1">Cliente:</th>
                                                        <th className="text-left border-0 p-1">{this.state.datosVenta.numDocumento + " - " + this.state.datosVenta.infoCliente}</th>
                                                    </tr>
                                                    <tr>
                                                        <th className="text-left border-0 p-1">Fecha - hora:</th>
                                                        <th className="text-left border-0 p-1">{this.state.datosVenta.fecha + " - " + this.state.datosVenta.hora}</th>
                                                    </tr>
                                                    <tr>
                                                        <th className="text-left border-0 p-1">Tipo y estado de venta:</th>
                                                        <th className="text-left border-0 p-1">
                                                            <div className={`badge ${this.state.datosVenta.tipoVenta === 1 ? "badge-info": "badge-warning"}`}>
                                                                {this.state.datosVenta.tipoVenta === 1 ? 'CONTADO': 'CREDITO'}
                                                            </div>
                                                            <span> - </span>
                                                            <div className={`badge ${this.state.datosVenta.estado === 1 ? "badge-info" : this.state.datosVenta.estado === 2 ? "badge-warning": "badge-danger"}`}>
                                                                { this.state.datosVenta.estado === 1 ? "COMPLETADO": this.state.datosVenta.estado === 2 ? "PROCESO" : "ANULADO"}
                                                            </div>
                                                        </th>
                                                    </tr>
                                                    <tr>
                                                        <th className="text-left border-0 p-1">Monto Inicial:</th>
                                                        <th className="text-left border-0 p-1">S/ {this.state.datosVenta.inicial}</th>
                                                    </tr>
                                                    <tr>
                                                        <th className="text-left border-0 p-1">Número de cuotas(letras):</th>
                                                        <th className="text-left border-0 p-1">{this.state.datosVenta.numeroCuotas}</th>
                                                    </tr>
                                                    <tr>
                                                        <th className="text-left border-0 p-1">Total:</th>
                                                        <th className="text-left border-0 p-1">S/ {this.state.importeTotal}</th>
                                                    </tr>
                                                </thead>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                                        <div className="table-responsive">
                                            <table className="table table-striped" style={{ borderWidth: '1px', borderStyle: 'inset', borderColor: '#CFA7C9' }}>
                                                <thead>
                                                    <tr>
                                                        <th width="5%">#</th>
                                                        <th width="20%">Lote</th>
                                                        <th width="15%">Manzana</th>
                                                        <th width="20%">Proyecto</th>
                                                        <th width="10%">Precio</th>
                                                        <th width="10%">Impuesto</th>
                                                        <th width="10%">Cantidad</th>
                                                        <th width="10%">Importe</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        this.state.loadModal ? (
                                                            <tr>
                                                                <td className="text-center" colSpan="8">
                                                                    {spinnerLoading()}
                                                                </td>
                                                            </tr>
                                                        ) : this.state.detalleVenta.length === 0 ? (
                                                            <tr className="text-center">
                                                                <td colSpan="8">¡No hay datos registrados!</td>
                                                            </tr>
                                                        ) : (

                                                            this.state.detalleVenta.map((item, index) => {

                                                                return (
                                                                    <tr key={index}>
                                                                        <td>{item.id}</td>
                                                                        <td>{item.lote}</td>
                                                                        <td>{item.manzana}</td>
                                                                        <td>{item.proyecto}</td>
                                                                        <td>{item.precio}</td>
                                                                        <td>{item.impuesto}</td>
                                                                        <td>{item.cantidad}</td>
                                                                        <td>{parseFloat(item.precio)*parseFloat(item.cantidad)}</td>
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


                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* fin modal */}

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Ventas <small className="text-secondary">LISTA</small></h5>
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
                                <input type="search" className="form-control" placeholder="Buscar..." onKeyUp={(event) => console.log(event.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">

                            <button className="btn btn-outline-info" onClick={this.onEventNuevaVenta}>
                                <i className="bi bi-file-plus"></i> Nuevo Registro
                            </button>
                            {" "}
                            <button className="btn btn-outline-secondary" onClick={() => this.fillTable(0, 1, "")}>
                                <i className="bi bi-arrow-clockwise"></i>
                            </button>

                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="table-responsive">
                            <table className="table table-striped" style={{ borderWidth: '1px', borderStyle: 'inset', borderColor: '#CFA7C9' }}>
                                <thead>
                                    <tr>
                                        <th width="5%">#</th>
                                        <th width="20%">Cliente</th>
                                        <th width="10%">DNI/RUC</th>
                                        <th width="10%">Comprobante</th>
                                        <th width="10%">Fecha</th>
                                        <th width="10%">Tipo</th>
                                        <th width="10%">Total</th>
                                        <th width="10%">Estado</th>
                                        <th width="5%">Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.loading ? (
                                            <tr>
                                                <td className="text-center" colSpan="9">
                                                    {spinnerLoading()}
                                                </td>
                                            </tr>
                                        ) : this.state.lista.length === 0 ? (
                                            <tr className="text-center">
                                                <td colSpan="9">¡No hay datos registrados!</td>
                                            </tr>
                                        ) : (
                                            this.state.lista.map((item, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td>{item.id}</td>
                                                        <td>{item.infoCliente}</td>
                                                        <td>{item.numDocumento}</td>
                                                        <td>{item.idComprobante}</td>
                                                        <td>{<span>{item.fecha}</span>}{<br></br>}{<span>{timeForma24(item.hora)}</span>}</td>
                                                        <td className="text-center"><div className={`badge ${item.tipoVenta === 1 ? "badge-info" : "badge-warning"}`}>{item.tipoVenta === 1 ? "CONTADO" : "CREDITO"}</div></td>
                                                        <td>200.00</td>
                                                        <td className="text-center">
                                                            <div className={`badge ${item.estado === 1 ? "badge-info" : item.estado === 2 ? "badge-warning" : 'badge-danger'}`}>
                                                                {item.estado === 1 ? "COMPLETADO" : item.estado === 2 ? "PROCESO" : "ANULADO"}
                                                            </div>
                                                        </td>
                                                        <td className="text-center">
                                                            <button className="btn btn-outline-primary btn-sm" title="Ver detalle" onClick={() => this.openModal(item.idVenta)}><i className="bi bi-eye"></i></button>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )
                                    }
                                </tbody>

                            </table>
                        </div>
                        {/* <div className="col-md-12" style={{ textAlign: 'center' }}>
                            <nav aria-label="...">
                                <ul className="pagination justify-content-end">
                                    <li className="page-item disabled">
                                        <a className="page-link">Previous</a>
                                    </li>
                                    <li className="page-item"><a className="page-link" href="#">1</a></li>
                                    <li className="page-item active" aria-current="page">
                                        <a className="page-link" href="#">2</a>
                                    </li>
                                    <li className="page-item"><a className="page-link" href="#">3</a></li>
                                    <li className="page-item">
                                        <a className="page-link" href="#">Next</a>
                                    </li>
                                </ul>
                            </nav>
                        </div> */}

                    </div>
                </div>
            </>
        );
    }
}

export default Ventas;