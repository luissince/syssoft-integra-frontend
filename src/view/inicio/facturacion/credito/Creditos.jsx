import React from 'react';
// import axios from 'axios';
import CryptoJS from 'crypto-js';
import {
    spinnerLoading,
    formatDate,
    numberFormat,
    statePrivilegio,
    keyUpSearch
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import Paginacion from '../../../../components/Paginacion';
import ContainerWrapper from '../../../../components/Container';

class Creditos extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            lista: [],
            restart: true,

            view: statePrivilegio(this.props.token.userToken.menus[2].submenu[2].privilegio[0].estado),
            pay: statePrivilegio(this.props.token.userToken.menus[2].submenu[2].privilegio[1].estado),

            idSucursal: this.props.token.project.idSucursal,

            opcion: 0,
            todos: 0,
            cada: 0,
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messageTable: 'Cargando información...',
        }
        this.refTxtSearch = React.createRef();

        this.abortControllerTable = new AbortController();
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    componentDidMount() {
        this.loadInit();
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
        // try {
        //     await this.setStateAsync({ loading: true, lista: [], messageTable: "Cargando información...", messagePaginacion: "Mostranto 0 de 0 Páginas" });

        //     let result = await axios.get("/api/factura/credito", {
        //         signal: this.abortControllerTable.signal,
        //         params: {
        //             "opcion": opcion,
        //             "buscar": buscar,
        //             "todos": this.state.todos,
        //             "cada": this.state.cada,
        //             "idSucursal": this.state.idSucursal,
        //             "posicionPagina": ((this.state.paginacion - 1) * this.state.filasPorPagina),
        //             "filasPorPagina": this.state.filasPorPagina
        //         }
        //     });
        //     let totalPaginacion = parseInt(Math.ceil((parseFloat(result.data.total) / this.state.filasPorPagina)));
        //     let messagePaginacion = `Mostrando ${result.data.result.length} de ${totalPaginacion} Páginas`;

        //     await this.setStateAsync({
        //         loading: false,
        //         lista: result.data.result,
        //         totalPaginacion: totalPaginacion,
        //         messagePaginacion: messagePaginacion
        //     });
        // } catch (error) {
        //     if (error.message !== "canceled") {
        //         await this.setStateAsync({
        //             loading: false,
        //             lista: [],
        //             totalPaginacion: 0,
        //             messageTable: "Se produjo un error interno, intente nuevamente por favor.",
        //             messagePaginacion: "Mostranto 0 de 0 Páginas",
        //         });
        //     }
        // }
    }

    onEventCronograma = async (item) => {
        const data = {
            "idEmpresa": "EM0001",
            "idVenta": item.idVenta,
            "sucursal": this.props.token.project.nombre,
        }

        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'key-report-inmobiliaria').toString();
        let params = new URLSearchParams({ "params": ciphertext });
        window.open("/api/factura/repcreditoProducto?" + params, "_blank");
    }

    onEventCobros = (item) => {
        this.props.history.push({
            pathname: `${this.props.location.pathname}/proceso`,
            search: "?idVenta=" + item.idVenta
        })
    }

    render() {
        return (
            <ContainerWrapper>
                <div className='row'>
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="form-group">
                            <h5>Lista de Créditos <small className="text-secondary">LISTA</small></h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="form-group">
                            <button className="btn btn-outline-secondary" onClick={() => this.loadInit()}>
                                <i className="bi bi-arrow-clockwise"></i>  Recargar Vista
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row">

                </div>

                <div className="row">
                    <div className="col-xl-6 col-lg-12 col-md-12 col-sm-12 col-12">
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

                    <div className="col-xl-3 col-lg-4 col-md-12 col-sm-12 col-12">
                        <div className="form-group">
                            <select className="form-control"
                                value={this.state.todos}
                                onChange={async (value) => {
                                    await this.setStateAsync({ todos: value.target.value })
                                    this.onEventPaginacion()
                                }}>
                                <option value="0">
                                    Listar Ventas al Crédito
                                </option>
                                <option value="1">
                                    Listar Todas Ventas
                                </option>
                            </select>
                        </div>
                    </div>
                    <div className="col-xl-3 col-lg-4 col-md-12 col-sm-12 col-12">
                        <div className="form-group">
                            <select className="form-control"
                                value={this.state.cada}
                                onChange={async (value) => {
                                    await this.setStateAsync({ cada: value.target.value })
                                    this.onEventPaginacion()
                                }}>
                                <option value="0">
                                    - Seleccione
                                </option>
                                <option value="15">
                                    Listar Ventas de cada 15
                                </option>
                                <option value="30">
                                    Listar Ventas de cada 30
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
                                        <th width="14%">Cliente</th>
                                        <th width="7%">Propiedad</th>
                                        <th width="14%">Comprobante</th>
                                        <th width="14%">Ctas Pendientes / Frecuencia</th>
                                        <th width="9%">Sig. Pago</th>
                                        <th width="9%">Total</th>
                                        <th width="9%">Cobrado</th>
                                        <th width="9%">Por Cobrar</th>
                                        <th width="5%">Cronograma</th>
                                        <th width="5%">Cobros</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.loading ? (
                                            <tr>
                                                <td className="text-center" colSpan="11">
                                                    {spinnerLoading("Cargando información de la tabla...", true)}
                                                </td>
                                            </tr>
                                        ) : this.state.lista.length === 0 ? (
                                            <tr className="text-center">
                                                <td colSpan="11">¡No hay datos registrados!</td>
                                            </tr>
                                        ) : (
                                            this.state.lista.map((item, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td className="text-center">{item.id}</td>
                                                        <td>{item.documento}{<br />}{item.informacion}</td>
                                                        <td>{
                                                            item.detalle.map((detalle, indexd) => (
                                                                <div key={indexd}>
                                                                    <span>{detalle.producto}{<br />}{<small>{detalle.categoria}</small>}</span>
                                                                    <br />
                                                                </div>
                                                            ))
                                                        }</td>
                                                        <td>{item.nombre}{<br />}{item.serie + "-" + item.numeracion}</td>
                                                        <td>{item.credito === 1 ? item.frecuencia : item.numCuota === 1 ? item.numCuota + " Cuota" : item.numCuota + " Cuotas"}</td>
                                                        <td>{item.fechaPago === "" ? "-" : formatDate(item.fechaPago)}</td>
                                                        <td className="text-right">{numberFormat(item.total)}</td>
                                                        <td className="text-right text-success">{numberFormat(item.cobrado)}</td>
                                                        <td className="text-right text-danger">{numberFormat(item.total - item.cobrado)}</td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-outline-info btn-sm"
                                                                onClick={() => this.onEventCronograma(item)}
                                                                disabled={!this.state.view}>
                                                                <i className="fa fa-calendar"></i></button>
                                                        </td>
                                                        <td className="text-center">
                                                            <button className="btn btn-outline-info btn-sm"
                                                                onClick={() => {
                                                                    this.onEventCobros(item)
                                                                }}
                                                                disabled={!this.state.pay}><i className="fa fa-file-text-o"></i></button>
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


                <Paginacion
                    loading={this.state.loading}
                    data={this.state.lista}
                    totalPaginacion={this.state.totalPaginacion}
                    paginacion={this.state.paginacion}
                    fillTable={this.paginacionContext}
                    restart={this.state.restart}
                />

            </ContainerWrapper>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}


export default connect(mapStateToProps, null)(Creditos);