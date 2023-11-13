import React from 'react';
import {
    spinnerLoading,
    alertDialog,
    alertInfo,
    alertSuccess,
    alertWarning
} from '../../../../helper/utils.helper';
import ContainerWrapper from "../../../../components/Container";
import Paginacion from "../../../../components/Paginacion";
import {
    keyUpSearch,
    currentDate,
    validateDate
} from "../../../../helper/utils.helper";
import CustomComponent from "../../../../model/class/custom-component";
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { deleteAlmacen, listAlmacen } from '../../../../network/rest/principal.network';
import { CANCELED } from '../../../../model/types/types';
import { connect } from 'react-redux';

class Inventario extends CustomComponent {

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            lista: [],
            restart: false,

            paginacion: 0,
            totalPaginacion: 0,

            idSucursal: this.props.token.project.idSucursal,
            idUsuario: this.props.token.userToken.idUsuario,
        }

    }


    async componentDidMount() {
        this.loadInit();
    }

    componentWillUnmount() {

    }

    loadInit = async () => {
        // if (this.state.loading) return;

        // await this.setStateAsync({ paginacion: 1, restart: true });
        // this.fillTable(0, "");
        // await this.setStateAsync({ opcion: 0 });
    }

    paginacionContext = async (listid) => {
        // await this.setStateAsync({ paginacion: listid, restart: false });
        // this.onEventPaginacion();
    }

    async searchText(text) {
        // if (this.state.loading) return;

        // if (text.trim().length === 0) return;

        // await this.setStateAsync({ paginacion: 1, restart: false });
        // this.fillTable(1, text.trim());
        // await this.setStateAsync({ opcion: 1 });
    }

    handleAgregar = () => {
        // console.log(this.props.location)
        // this.props.history.push({
        //     pathname: `${this.props.location.pathname}`,
        // })
    }

    async onEventImportarExcel() {
        // if (this.state.fechaFin < this.state.fechaIni) {
        //     this.setState({ messageWarning: "La Fecha inicial no puede ser mayor a la fecha final." })
        //     this.refFechaIni.current.focus();
        //     return;
        // }

        // const data = {
        //     "idEmpresa": "EM0001",
        //     "fechaIni": this.state.fechaIni,
        //     "fechaFin": this.state.fechaFin,
        //     "idCliente": this.state.idCliente,
        //     "cliente": this.state.cliente
        // }

        // let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'key-report-inmobiliaria').toString();

        // this.refUseFile.current.download({
        //     "name": "Reporte Cliente Aportaciones",
        //     "file": "/api/cliente/excelcliente",
        //     "filename": "aportaciones.xlsx",
        //     "params": ciphertext
        // });
    }

    async onEventGenerarExcel() {
        // if (this.state.fechaFin < this.state.fechaIni) {
        //     this.setState({ messageWarning: "La Fecha inicial no puede ser mayor a la fecha final." })
        //     this.refFechaIni.current.focus();
        //     return;
        // }

        // const data = {
        //     "idEmpresa": "EM0001",
        //     "fechaIni": this.state.fechaIni,
        //     "fechaFin": this.state.fechaFin,
        //     "idCliente": this.state.idCliente,
        //     "cliente": this.state.cliente
        // }

        // let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'key-report-inmobiliaria').toString();

        // this.refUseFile.current.download({
        //     "name": "Reporte Cliente Aportaciones",
        //     "file": "/api/cliente/excelcliente",
        //     "filename": "aportaciones.xlsx",
        //     "params": ciphertext
        // });
    }

    render() {
        return (
            <ContainerWrapper>

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Inventario <small className="text-secondary">INICIAL</small></h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-3 col-sm-12">
                        <div className="form-group">
                            <div className="input-group mb-2">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-search"></i></div>
                                </div>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ingrese metodo de ajuste..."
                                    ref={this.refTxtSearch}
                                    onKeyUp={(event) => keyUpSearch(event, () => this.searchText(event.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-12">
                        <div className="form-group">
                            <button className="btn btn-outline-info"
                                onClick={this.handleAgregar}>
                                <i className="bi bi-file-plus"></i> Registrar inventario
                            </button>
                            {" "}
                            <button className="btn btn-outline-secondary" onClick={() => this.loadInit()}>
                                <i className="bi bi-arrow-clockwise"></i>
                            </button>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-12 d-flex justify-content-end">
                        <div className="form-group">
                            <button className="btn btn-outline-success btn-sm" onClick={() => this.onEventGenerarExcel()}>
                                <i className="bi bi-file-earmark-excel-fill"></i> Generar Excel
                            </button>
                            {" "}
                            <button className="btn btn-outline-success btn-sm" onClick={() => this.onEventImportarExcel()}>
                                <i className="bi bi-file-earmark-excel-fill"></i> Importar Excel
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 col-sm-12">
                        <label>Total de productos en lista: </label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 col-sm-12 text-success">
                        <label>Total de productos ingresados: </label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 col-sm-12 text-danger">
                        <label>Total de productos con errores: </label>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered rounded">
                                <thead>
                                    <tr>
                                        <th width="5%" className="text-center">#</th>
                                        <th width="15%">Clave</th>
                                        <th width="30%">Producto</th>
                                        <th width="10%">Stock Mín.</th>
                                        <th width="10%">Stock Máx.</th>
                                        <th width="10%">Cantidad</th>
                                        <th width="10%">Costo</th>
                                        <th width="10%">Precio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* {
                                        this.state.loading ? (
                                            <tr>
                                                <td className="text-center" colSpan="7">
                                                    {spinnerLoading("Cargando información de la tabla...", true)}
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
                                                        <td className="text-center">{item.id}</td>
                                                        <td>{item.nombre}</td>
                                                        <td>{item.direccion}</td>
                                                        <td>{item.distrito}</td>
                                                        <td>{item.codigoSunat}</td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-outline-warning btn-sm"
                                                                title="Editar"
                                                                onClick={() => this.handleDetalle(item.idAlmacen)}
                                                            >
                                                                <i className="bi bi-pencil"></i>
                                                            </button>
                                                        </td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-outline-danger btn-sm"
                                                                title="Anular"
                                                                onClick={() => this.handleReporte(item.idAlmacen)}
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )
                                    } */}
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
                                    {/* <Paginacion
                                        loading={this.state.loading}
                                        totalPaginacion={this.state.totalPaginacion}
                                        paginacion={this.state.paginacion}
                                        fillTable={this.paginacionContext}
                                        restart={this.state.restart}
                                    /> */}
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>

            </ContainerWrapper>
        );
    }
}

/**
 * 
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

/**
 * 
 * Método encargado de conectar con redux y exportar la clase
 */
export default connect(mapStateToProps, null)(Inventario);