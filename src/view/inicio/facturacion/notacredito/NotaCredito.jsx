import React from 'react';
import axios from 'axios';
import {
    spinnerLoading,
    numberFormat,
    formatTime,
    alertDialog,
    alertInfo,
    alertSuccess,
    alertWarning,
    alertError,
    statePrivilegio,
    keyUpSearch
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import Paginacion from '../../../../components/Paginacion';
import ContainerWrapper from '../../../../components/Container';

class NotaCredito extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            lista: [],
            restart: false,

            add: statePrivilegio(this.props.token.userToken.menus[2].submenu[5].privilegio[0].estado),
            view: statePrivilegio(this.props.token.userToken.menus[2].submenu[5].privilegio[1].estado),
            cancel: statePrivilegio(this.props.token.userToken.menus[2].submenu[5].privilegio[2].estado),

            idSucursal: this.props.token.project.idSucursal,
            idUsuario: this.props.token.userToken.idUsuario,

            opcion: 0,
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
        try {

            await this.setStateAsync({
                loading: true,
                lista: [],
                messageTable: "Cargando información...",
            });

            const result = await axios.get('/api/notacredito/list', {
                signal: this.abortControllerTable.signal,
                params: {
                    "opcion": opcion,
                    "buscar": buscar,
                    "idSucursal": this.state.idSucursal,
                    "posicionPagina": ((this.state.paginacion - 1) * this.state.filasPorPagina),
                    "filasPorPagina": this.state.filasPorPagina
                }
            });

            const totalPaginacion = parseInt(Math.ceil((parseFloat(result.data.total) / this.state.filasPorPagina)));

            await this.setStateAsync({
                loading: false,
                lista: result.data.result,
                totalPaginacion: totalPaginacion,
            });
        } catch (error) {
            if (error.message !== "canceled") {
                await this.setStateAsync({
                    loading: false,
                    lista: [],
                    totalPaginacion: 0,
                    messageTable: "Se produjo un error interno, intente nuevamente por favor.",
                });
            }
        }
    }

    onEventNuevaVenta = () => {
        this.props.history.push(`${this.props.location.pathname}/proceso`);
    }

    onEventAnularNotaCredito(idNotaCredito) {
        alertDialog("Nota de Crédito", "¿Está seguro de que desea eliminar la nota de crédito? Esta operación no se puede deshacer.", async (value) => {
            if (value) {
                try {
                    alertInfo("Nota de Crédito", "Procesando información...");
                    let result = await axios.delete('/api/notacredito/', {
                        params: {
                            "idNotaCredito": idNotaCredito,
                            "idUsuario": this.state.idUsuario
                        }
                    })
                    alertSuccess("Nota de Crédito", result.data, () => {
                        this.onEventPaginacion();
                    })
                } catch (error) {
                    if (error.response) {
                        alertWarning("Nota de Crédito", error.response.data)
                    } else {
                        alertError("Nota de Crédito", "Se genero un error interno, intente nuevamente.")
                    }
                }
            }
        })
    }


    render() {
        return (
            <ContainerWrapper>
                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Nota de Crédito <small className="text-secondary">LISTA</small></h5>
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
                            <button className="btn btn-outline-info" onClick={this.onEventNuevaVenta} disabled={!this.state.add}>
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
                                        <th width="10%">Cliente</th>
                                        <th width="10%">Comprobante</th>
                                        <th width="10%">Fecha</th>
                                        <th width="10%">Total</th>
                                        <th width="10%" className="text-center">Modificado</th>
                                        <th width="10%" className="text-center">Estado</th>
                                        <th width="5%" className="text-center">Detalle</th>
                                        <th width="5%" className="text-center">Eliminar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.loading ? (
                                            <tr>
                                                <td className="text-center" colSpan="9">
                                                    {spinnerLoading("Cargando información de la tabla...", true)}
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
                                                        <td className="text-center">{item.id}</td>
                                                        <td>{item.documento}{<br />}{item.informacion}</td>
                                                        <td>{item.comprobante}{<br />}{item.serie + "-" + item.numeracion}</td>
                                                        <td>{<span>{item.fecha}</span>}{<br></br>}{<span>{formatTime(item.hora)}</span>}</td>
                                                        <td>{numberFormat(item.total, item.codiso)}</td>
                                                        <td>{item.comprobanteModi}{<br />}{item.serieModi + "-" + item.numeracionModi}</td>
                                                        <td className="text-center">
                                                            {
                                                                item.estado === 1
                                                                    ? <span className="text-success">Registrado</span>
                                                                    : <span className="text-danger">Anulado</span>
                                                            }
                                                        </td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-outline-primary btn-sm"
                                                                title="Ver detalle"
                                                                onClick={() => {
                                                                    this.props.history.push({ pathname: `${this.props.location.pathname}/detalle`, search: "?idNotaCredito=" + item.idNotaCredito })
                                                                }}
                                                                disabled={!this.state.view}><i className="fa fa-eye"></i>
                                                            </button>
                                                        </td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-outline-danger btn-sm"
                                                                title="Ver detalle"
                                                                onClick={() => { this.onEventAnularNotaCredito(item.idNotaCredito) }}
                                                                disabled={!this.state.cancel}><i className="fa fa-remove"></i>
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

export default connect(mapStateToProps, null)(NotaCredito);