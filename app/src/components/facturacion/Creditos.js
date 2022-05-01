import React from 'react';
import axios from 'axios';
import {
    isNumeric,
    spinnerLoading,
    dateFormat,
    formatMoney
} from '../tools/Tools';
import { connect } from 'react-redux';
import Paginacion from '../tools/Paginacion';

class Creditos extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            lista: [],

            opcion: 0,
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messageTable: 'Cargando información...',
            messagePaginacion: 'Mostranto 0 de 0 Páginas'
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

            let result = await axios.get("/api/factura/credito", {
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

    onEventCronograma = async (item) => {
        console.log(item)
        // window.open("/api/login/report/cuotas", "_blank");

        try {
            let result = await axios.get("/api/login/report/cuotas/", {
                responseType: "blob",
                params: {

                },
            });

            const file = new Blob([result.data], { type: "application/pdf" });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, "_blank");

        } catch (error) {
            console.log(error)
        }
    }

    onEventCobros = (item) => {
        this.props.history.push({
            pathname: `${this.props.location.pathname}/proceso`,
            search: "?idVenta=" + item.idVenta
        })
    }

    render() {
        return (
            <>
                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Lista de Créditos <small className="text-secondary">LISTA</small></h5>
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
                                        <th width="10%">Cliente</th>
                                        <th width="10%">Comprobante</th>
                                        <th width="10%">N° Cuotas</th>
                                        <th width="10%">Sig. Pago</th>
                                        <th width="10%">Total</th>
                                        <th width="10%">Cobrado</th>
                                        <th width="10%">Por Cobrar</th>
                                        <th width="5%">Cronograma</th>
                                        <th width="5%">Cobros</th>
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
                                                        <td>{item.documento}{<br />}{item.informacion}</td>
                                                        <td>{item.nombre}{<br />}{item.serie + "-" + item.numeracion}</td>
                                                        <td>{item.numCuota === 1 ? item.numCuota + " Cuota" : item.numCuota + " Cuotas"}</td>
                                                        <td>{item.fechaPago === "" ? "-" : dateFormat(item.fechaPago)}</td>
                                                        <td className="text-right">{item.simbolo + " " + formatMoney(item.total)}</td>
                                                        <td className="text-right text-success">{item.simbolo + " " + formatMoney(item.cobrado)}</td>
                                                        <td className="text-right text-danger">{item.simbolo + " " + formatMoney(item.total - item.cobrado)}</td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-outline-info btn-sm"
                                                                onClick={() => this.onEventCronograma(item)}>
                                                                <i className="fa fa-calendar"></i></button>
                                                        </td>
                                                        <td className="text-center">
                                                            <button className="btn btn-outline-info btn-sm"
                                                                onClick={() => {
                                                                    this.onEventCobros(item)
                                                                }}><i className="fa fa-file-text-o"></i></button>
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
        );
    }
}

const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}


export default connect(mapStateToProps, null)(Creditos);