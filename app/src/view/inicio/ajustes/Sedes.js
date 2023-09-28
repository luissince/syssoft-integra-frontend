import React from 'react';
import {
    spinnerLoading,
    statePrivilegio,
    keyUpSearch
} from '../../../helper/utils.helper';
import { connect } from 'react-redux';
import Paginacion from '../../../components/Paginacion';
import ContainerWrapper from '../../../components/Container';
import { images } from '../../../helper';
import { listSede, loadEmpresa } from '../../../network/rest/principal.network';
import SuccessReponse from '../../../model/class/response';
import ErrorResponse from '../../../model/class/error-response';
import { CANCELED } from '../../../model/types/types';

class Sedes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

            empresa: [],

            edit: statePrivilegio(this.props.token.userToken.menus[5].submenu[3].privilegio[0].estado),

            loading: false,
            lista: [],

            opcion: 0,
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messageTable: 'Cargando información...',
            messagePaginacion: 'Mostranto 0 de 0 Páginas'
        }
        this.refRuc = React.createRef();
        this.refRazonSocial = React.createRef();
        this.refNombreEmpresa = React.createRef();
        this.refNombreSede = React.createRef();
        this.refCelular = React.createRef();

        this.refDireccion = React.createRef();
        this.refUbigeo = React.createRef();

        this.refTxtSearch = React.createRef();
        this.refFileImagen = React.createRef();

        this.idCodigo = "";
        this.selectItem = false;
        this.abortControllerTable = new AbortController();
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    async componentDidMount() {
        this.loadInit(true);
    }

    componentWillUnmount() {
        this.abortControllerTable.abort();
    }

    loadInit = async (empresa) => {
        if (this.state.loading) return;

        await this.setStateAsync({ paginacion: 1, restart: true });
        this.fillTable(0, "", empresa);
        await this.setStateAsync({ opcion: 0 });
    }

    async searchText(text) {
        if (this.state.loading) return;

        if (text.trim().length === 0) return;

        await this.setStateAsync({ paginacion: 1, restart: false });
        this.fillTable(1, text.trim(), false);
        await this.setStateAsync({ opcion: 1 });
    }

    paginacionContext = async (listid) => {
        await this.setStateAsync({ paginacion: listid, restart: false });
        this.onEventPaginacion();
    }

    onEventPaginacion = () => {
        switch (this.state.opcion) {
            case 0:
                this.fillTable(0, "", false);
                break;
            case 1:
                this.fillTable(1, this.refTxtSearch.current.value, false);
                break;
            default: this.fillTable(0, "", false);
        }
    }

    fillTable = async (opcion, buscar, isLoadEmpresa) => {

        await this.setStateAsync({
            loading: true,
            lista: [],
            messageTable: "Cargando información...",
            messagePaginacion: "Mostrando 0 de 0 Páginas"
        });


        const listEmpresa = isLoadEmpresa ? [] : this.state.empresa;

        if (isLoadEmpresa) {
            const empresaResponse = await loadEmpresa(this.abortControllerTable.signal);
            if (empresaResponse instanceof SuccessReponse) {
                listEmpresa.push(empresaResponse.data);
            } else if (empresaResponse instanceof ErrorResponse) {
                if (empresaResponse.getType() === CANCELED) return;
            }
        }



        const params = {
            "opcion": opcion,
            "buscar": buscar,
            "posicionPagina": ((this.state.paginacion - 1) * this.state.filasPorPagina),
            "filasPorPagina": this.state.filasPorPagina
        }

        const sedeResponse = await listSede(params, this.abortControllerTable.signal);

        if (sedeResponse instanceof SuccessReponse) {
            const sede = sedeResponse.data;

            let totalPaginacion = parseInt(Math.ceil((parseFloat(sede.total) / this.state.filasPorPagina)));
            let messagePaginacion = `Mostrando ${sede.result.length} de ${totalPaginacion} Páginas`;

            await this.setStateAsync({
                loading: false,
                lista: sede.result,
                empresa: listEmpresa,
                totalPaginacion: totalPaginacion,
                messagePaginacion: messagePaginacion
            });

            this.selectItem = true;
        } else if (sedeResponse instanceof ErrorResponse) {
            if (sedeResponse.getType() === CANCELED) return;

            await this.setStateAsync({
                loading: false,
                lista: [],
                totalPaginacion: 0,
                messageTable: "Se produjo un error interno, intente nuevamente por favor.",
                messagePaginacion: "Mostrando 0 de 0 Páginas",
            });
        }
    }


    onEventEditEmpresa(idEmpresa) {
        this.props.history.push({
            pathname: `${this.props.location.pathname}/empresa`,
            search: "?idEmpresa=" + idEmpresa
        })
    }

    onEventEditSede(idSede) {
        this.props.history.push({
            pathname: `${this.props.location.pathname}/proceso`,
            search: "?idSede=" + idSede
        })
    }

    render() {
        return (
            <ContainerWrapper>
                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Empresa <small className="text-secondary"></small></h5>
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
                                        <th width="10%">N° Documento</th>
                                        <th width="15%">Razón Social</th>
                                        <th width="15%">Nombre Comercial</th>
                                        <th width="15%">Dirección Fiscal</th>
                                        <th width="10%">Logo</th>
                                        <th width="10%">Imagen</th>
                                        <th width="5%" className="text-center">Editar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.loading ? (
                                            <tr>
                                                <td className="text-center" colSpan="8">
                                                    {spinnerLoading()}
                                                </td>
                                            </tr>
                                        ) : this.state.empresa.length === 0 ? (
                                            <tr className="text-center">
                                                <td colSpan="8">¡No hay datos registrados!</td>
                                            </tr>
                                        ) : (
                                            this.state.empresa.map((item, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td className="text-center">{++index}</td>
                                                        <td>{item.documento}</td>
                                                        <td>{item.razonSocial}</td>
                                                        <td>{item.nombreEmpresa}</td>
                                                        <td>{item.direccion}</td>
                                                        <td><img src={item.rutaLogo !== "" ? "/" + item.rutaLogo : images.noImage} alt="Logo" width="100" /></td>
                                                        <td><img src={item.rutaImage !== "" ? "/" + item.rutaImage : images.noImage} alt="Imagen" width="100" /></td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-outline-warning btn-sm"
                                                                title="Editar"
                                                                onClick={() => this.onEventEditEmpresa(item.idEmpresa)}
                                                                disabled={!this.state.edit}>
                                                                <i className="bi bi-pencil"></i>
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
                                    onKeyUp={(event) => keyUpSearch(event, () => this.searchText(event.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            <button className="btn btn-outline-secondary" onClick={() => this.loadInit(true)}>
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
                                        <th width="10%">Sede</th>
                                        <th width="20%">Dirección</th>
                                        <th width="10%">Telefono</th>
                                        <th width="15%">Celular</th>
                                        <th width="5%" className="text-center">Editar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.loading ? (
                                            <tr>
                                                <td className="text-center" colSpan="6">
                                                    {spinnerLoading()}
                                                </td>
                                            </tr>
                                        ) : this.state.lista.length === 0 ? (
                                            <tr className="text-center">
                                                <td colSpan="6">¡No hay datos registrados!</td>
                                            </tr>
                                        ) : (
                                            this.state.lista.map((item, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td className="text-center">{item.id}</td>
                                                        <td>{item.nombreSede}</td>
                                                        <td>{item.direccion}</td>
                                                        <td>{item.telefono}</td>
                                                        <td>{item.celular}</td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-outline-warning btn-sm"
                                                                title="Editar"
                                                                onClick={() => this.onEventEditSede(item.idSede)}
                                                                disabled={!this.state.edit}>
                                                                <i className="bi bi-pencil"></i>
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
        )
    }
}

const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

export default connect(mapStateToProps, null)(Sedes);