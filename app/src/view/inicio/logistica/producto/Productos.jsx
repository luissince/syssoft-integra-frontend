import React from 'react';
import {
    alertDialog,
    alertInfo,
    alertSuccess,
    alertWarning,
    spinnerLoading,
    statePrivilegio,
    keyUpSearch,
    rounded
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import Paginacion from '../../../../components/Paginacion';
import ContainerWrapper from '../../../../components/Container';
import CustomComponent from '../../../../model/class/custom-component';
import { deleteProducto, listProducto } from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';

class Productos extends CustomComponent {
    constructor(props) {
        super(props);
        this.state = {
            idSucursal: this.props.token.project.idSucursal,

            add: statePrivilegio(this.props.token.userToken.menus[3].submenu[1].privilegio[0].estado),
            view: statePrivilegio(this.props.token.userToken.menus[3].submenu[1].privilegio[1].estado),
            edit: statePrivilegio(this.props.token.userToken.menus[3].submenu[1].privilegio[2].estado),
            remove: statePrivilegio(this.props.token.userToken.menus[3].submenu[1].privilegio[3].estado),

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

        this.refTxtSearch = React.createRef();

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
            messagePaginacion: "Mostranto 0 de 0 Páginas"
        });

        const params = {
            "idProyecto": this.state.idProyecto,
            "opcion": opcion,
            "buscar": buscar.trim(),
            "posicionPagina": ((this.state.paginacion - 1) * this.state.filasPorPagina),
            "filasPorPagina": this.state.filasPorPagina
        }


        const response = await listProducto(params, this.abortControllerTable.signal);

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

    handleAgregar = async () => {
        this.props.history.push({
            pathname: `${this.props.location.pathname}/agregar`
        })
    }

    handleEditar(idProducto) {
        this.props.history.push({
            pathname: `${this.props.location.pathname}/editar`,
            search: "?idProducto=" + idProducto
        })
    }

    handleMostrar = (idProducto) => {
        this.props.history.push({
            pathname: `${this.props.location.pathname}/detalle`,
            search: "?idProducto=" + idProducto
        })
    }


    handleEliminar = (idProducto) => {
        alertDialog("Producto", "¿Estás seguro de eliminar el producto?", async (event) => {
            if (event) {
                alertInfo("Producto", "Procesando información...")
                const params = {
                    "idProducto": idProducto
                }
                const response = await deleteProducto(params);
                if (response instanceof SuccessReponse) {
                    alertSuccess("Producto", response.data, () => {
                        this.loadInit();
                    })
                }

                if (response instanceof ErrorResponse) {
                    alertWarning("Producto", response.getMessage())
                }
            }
        })
    }


    render() {

        const { loading, lista } = this.state;

        return (
            <ContainerWrapper>

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
                            <button className="btn btn-outline-info" onClick={this.handleAgregar} disabled={!this.state.add}>
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
                                        <th width="15%">Tipo</th>
                                        <th width="30%">Nombre</th>
                                        <th width="20%">Precio</th>
                                        <th width="20%">Medida</th>
                                        <th width="20%">Categoría</th>
                                        <th width="10%">Estado</th>
                                        <th width="5%" className="text-center">Editar</th>
                                        <th width="5%" className="text-center">Eliminar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        loading ? (
                                            <tr>
                                                <td className="text-center" colSpan="9">
                                                    {spinnerLoading("Cargando información de la tabla...", true)}
                                                </td>
                                            </tr>
                                        ) : lista.length === 0 ? (
                                            <tr className="text-center">
                                                <td colSpan="9">¡No hay datos registrados!</td>
                                            </tr>
                                        ) : (
                                            lista.map((item, index) => {
                                                const tipo = function () {
                                                    if (item.tipo === 1) {
                                                        return <span>Producto <i className='bi bi-basket'></i></span>;
                                                    }

                                                    if (item.tipo === 2) {
                                                        return <span>Servicio <i className='bi bi-person-workspace'></i></span>;
                                                    }

                                                    return <span>Combo <i className='bi bi-fill'></i></span>;
                                                }

                                                const estado = function () {
                                                    if (item.estado) {
                                                        return <span className="badge badge-success">Activo</span>;
                                                    }

                                                    return <span className="badge badge-danger">Inactivo</span>;
                                                }

                                                return (
                                                    <tr key={index}>
                                                        <td className="text-center">{item.id}</td>
                                                        <td>{tipo()}</td>
                                                        <td>{item.nombre}</td>
                                                        <td className='text-right'>{rounded(item.precio)}</td>
                                                        <td>{item.medida}</td>
                                                        <td>{item.categoria}</td>
                                                        <td>{estado()}</td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-outline-warning btn-sm"
                                                                title="Editar"
                                                                onClick={() => this.handleEditar(item.idProducto)}
                                                                disabled={!this.state.edit}>
                                                                <i className="bi bi-pencil"></i>
                                                            </button>
                                                        </td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-outline-danger btn-sm"
                                                                title="Anular"
                                                                onClick={() => this.handleEliminar(item.idProducto)}
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
