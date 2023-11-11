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

class Ajuste extends CustomComponent {

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            lista: [],
            restart: false,

            fechaInicio: currentDate(),
            fechaFinal: currentDate(),

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

    async searchFecha() {
        if (this.state.loading) return;

        if (!validateDate(this.state.fechaInicio)) return;
        if (!validateDate(this.state.fechaFinal)) return;

        // await this.setStateAsync({ paginacion: 1, restart: true });
        // this.fillTable(1, "", this.state.fechaInicio, this.state.fechaFinal, this.state.idConcepto);
        // await this.setStateAsync({ opcion: 1 });
    }

    handleAgregar = () => {
        console.log(this.props.location)
        this.props.history.push({
            pathname: `${this.props.location.pathname}/agregar`,
        })
    }

    handleDetalle = (idAlmacen) => {
        // this.props.history.push({
        //     pathname: `${this.props.location.pathname}/editar`,
        //     search: "?idAlmacen=" + idAlmacen
        // })
    }

    handleReporte = (idAlmacen) => {
        // alertDialog("Eliminar almacen", "¿Está seguro de que desea eliminar el almacen? Esta operación no se puede deshacer.", async (value) => {
        //     if (value) {
        //         alertInfo("Almacén", "Procesando información...")

        //         const params = {
        //             id: idAlmacen
        //         }

        //         const response = await deleteAlmacen(params);

        //         if(response instanceof SuccessReponse){
        //             alertSuccess("Almacen", response.data, () => {
        //                 this.loadInit();
        //             })
        //         }

        //         if(response instanceof ErrorResponse){
        //             alertWarning("Almacen", response.getMessage())
        //         }
        //     }
        // })
    }

    render() {
        return (
            <ContainerWrapper>

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Ajustes <small className="text-secondary">REALIZADOS</small></h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-3">
                        <div className='form-group'>
                            <label>Filtrar:</label>
                            <div className="input-group">
                                <select
                                    className="form-control"
                                    ref=""
                                    value=""
                                    onChange=""
                                >
                                    <option value="0">-- Selecciona --</option>
                                    <option value="1">codigo 01</option>
                                    <option value="2">código 02</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className='col-xl-3 col-lg-3 col-md-12 col-sm-12 col-12'>
                        <div className="form-group">
                            <label>Fecha Inicio:</label>
                            <input
                                className="form-control"
                                type="date"
                                value={this.state.fechaInicio}
                                onChange={async (event) => {
                                    await this.setStateAsync({ fechaInicio: event.target.value })
                                    this.searchFecha();
                                }} />
                        </div>
                    </div>
                    <div className='col-xl-3 col-lg-3 col-md-12 col-sm-12 col-12'>
                        <div className="form-group">
                            <label>Fecha Final:</label>
                            <input
                                className="form-control"
                                type="date"
                                value={this.state.fechaFinal}
                                onChange={async (event) => {
                                    await this.setStateAsync({ fechaFinal: event.target.value })
                                    this.searchFecha();
                                }} />
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-12">
                        <label>Otras opciones: </label>
                        <div className="form-group">
                            <button className="btn btn-outline-info"
                                onClick={this.handleAgregar}>
                                <i className="bi bi-file-plus"></i> Realizar ajuste
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
                                        <th width="20%">Tipo de Movimiento</th>
                                        <th width="15%">Fecha y Hora</th>
                                        <th width="20%">Observación</th>
                                        <th width="20%">Información</th>
                                        <th width="10%">Estado</th>
                                        <th width="5%" className="text-center">Detalle</th>
                                        <th width="5%" className="text-center">Reporte</th>
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
export default connect(mapStateToProps, null)(Ajuste);