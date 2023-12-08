import React from 'react';
import {
    spinnerLoading,
    alertDialog,
    alertInfo,
    alertSuccess,
    alertWarning,
    statePrivilegio,
    keyUpSearch,
    isEmpty
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import Paginacion from '../../../../components/Paginacion';
import ContainerWrapper from '../../../../components/Container';
import { deleteMoneda, listMoneda } from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';
import CustomComponent from '../../../../model/class/custom-component';

class Monedas extends CustomComponent {

    constructor(props) {
        super(props);
        this.state = {
            add: statePrivilegio(this.props.token.userToken.menus[5].submenu[1].privilegio[0].estado),
            edit: statePrivilegio(this.props.token.userToken.menus[5].submenu[1].privilegio[1].estado),
            remove: statePrivilegio(this.props.token.userToken.menus[5].submenu[1].privilegio[2].estado),

            loading: false,
            lista: [],
            restart: false,

            opcion: 0,
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messageTable: 'Cargando información...',

            idUsuario: this.props.token.userToken.idUsuario,
        }

        this.refTxtNombre = React.createRef();
        this.refTxtCodIso = React.createRef();
        this.refTxtSimbolo = React.createRef();
        this.refTxtSearch = React.createRef();
        this.refEstado = React.createRef();

        this.idCodigo = "";
        this.abortControllerTable = new AbortController();
    }

    async componentDidMount() {
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
        await this.setStateAsync({
            loading: true,
            lista: [],
            messageTable: "Cargando información...",
        });

        const params = {
            "opcion": opcion,
            "buscar": buscar.trim().toUpperCase(),
            "posicionPagina": ((this.state.paginacion - 1) * this.state.filasPorPagina),
            "filasPorPagina": this.state.filasPorPagina
        }

        const response = await listMoneda(params, this.abortControllerTable.signal)

        if (response instanceof SuccessReponse) {
            const totalPaginacion = parseInt(Math.ceil((parseFloat(response.data.total) / this.state.filasPorPagina)));

            await this.setStateAsync({
                loading: false,
                lista: response.data.result,
                totalPaginacion: totalPaginacion,
            });
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            await this.setStateAsync({
                loading: false,
                lista: [],
                totalPaginacion: 0,
                messageTable: response.getMessage(),
            });
        }
    }

    handleAgregar = () => {
        this.props.history.push({
            pathname: `${this.props.location.pathname}/agregar`
        })
    }

    handleEditar = (idMoneda) => {
        this.props.history.push({
            pathname: `${this.props.location.pathname}/editar`,
            search: "?idMoneda=" + idMoneda
        })
    }

    handleBorrar(idMoneda) {
        alertDialog("Moneda", "¿Estás seguro de eliminar la moneda?", async (event) => {
            if (event) {
                const params = {
                    "idMoneda": idMoneda
                }

                alertInfo("Moneda", "Procesando información...");

                const response = await deleteMoneda(params);

                if (response instanceof SuccessReponse) {
                    alertSuccess("Moneda", response.data);
                }

                if (response instanceof ErrorResponse) {
                    if (response.getType() === CANCELED) return;

                    alertWarning("Moneda", response.getType())
                }
            }
        })
    }

    generarBody() {
        if (this.state.loading) {
            return (
                <tr>
                    <td className="text-center" colSpan="8">
                        {spinnerLoading("Cargando información de la tabla...", true)}
                    </td>
                </tr>
            );
        }


        if (isEmpty(this.state.lista)) {
            return (
                <tr>
                    <td className="text-center" colSpan="8">¡No hay datos registrados!</td>
                </tr>
            );
        }

        return this.state.lista.map((item, index) => {
            const flag = item.nacional === 1 ? <i className='fa fa-flag text-success' style={{ fontSize: "25px" }}></i> : <i></i>

            const nmEstado = item.estado === 1 ? "ACTIVO" : "INACTIVO";
            const bgEstado = `badge ${item.estado === 1 ? "badge-info" : "badge-danger"}`;

            return (
                <tr key={index}>
                    <td className="text-center">{item.id}</td>
                    <td>{item.nombre}</td>
                    <td>{item.codiso}</td>
                    <td>{item.simbolo}</td>
                    <td className='text-center'>{flag}</td>
                    <td>
                        <span className={bgEstado}>{nmEstado}</span>
                    </td>
                    <td className="text-center">
                        <button
                            className="btn btn-outline-warning btn-sm"
                            title="Editar"
                            onClick={() => this.handleEditar(item.idMoneda)}
                            disabled={!this.state.edit}>
                            <i className="bi bi-pencil"></i></button>
                    </td>
                    <td className="text-center">
                        <button
                            className="btn btn-outline-danger btn-sm"
                            title="Eliminar"
                            onClick={() => this.handleBorrar(item.idMoneda)}
                            disabled={!this.state.remove}>
                            <i className="bi bi-trash"></i></button>
                    </td>
                </tr>
            )
        });
    }

    render() {
        return (
            <ContainerWrapper>
                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Monedas <small className="text-secondary">LISTA</small></h5>
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
                            <button className="btn btn-outline-info" onClick={this.handleAgregar} disabled={!this.state.add}>
                                <i className="bi bi-file-plus"></i> Nuevo Registro
                            </button>
                            {" "}
                            <button className="btn btn-outline-secondary" onClick={this.loadInit}>
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
                                        <th width="25%">Moneda</th>
                                        <th width="15%">Codigo ISO</th>
                                        <th width="10%">Símbolo</th>
                                        <th width="10%">Nacional</th>
                                        <th width="10%">Estado</th>
                                        <th width="5%" className="text-center">Editar</th>
                                        <th width="5%" className="text-center">Eliminar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.generarBody()}
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

export default connect(mapStateToProps, null)(Monedas);