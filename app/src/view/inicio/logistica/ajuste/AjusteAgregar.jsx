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
import { keyUpSearch } from "../../../../helper/utils.helper";
import CustomComponent from "../../../../model/class/custom-component";
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { deleteAlmacen, listAlmacen } from '../../../../network/rest/principal.network';
import { CANCELED } from '../../../../model/types/types';
import { connect } from 'react-redux';

class AjusteAgregar extends CustomComponent {

    constructor(props) {
        super(props);

        this.state = {


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

    async searchText(text) {
        // if (this.state.loading) return;

        // if (text.trim().length === 0) return;

        // await this.setStateAsync({ paginacion: 1, restart: false });
        // this.fillTable(1, text.trim());
        // await this.setStateAsync({ opcion: 1 });
    }

    handleSave() {
        // if (this.state.nombreAlmacen === "") {
        //     this.setState({ messageWarning: "ingrese un nombre para el almacén." });
        //     this.refNombreAlmacen.current.focus();
        //     return;
        // }

        // if (this.state.direccion === "") {
        //     this.setState({ messageWarning: "ingrese una dirección para el almacén." });
        //     this.refDireccion.current.focus();
        //     return;
        // }

        // if (this.state.distrito === "") {
        //     this.setState({ messageWarning: "ingrese un distrito para el almacén." });
        //     this.refDistrito.current.focus();
        //     return;
        // }

        // if (this.state.codigoSunat === "") {
        //     this.setState({ messageWarning: "ingrese un codigoSunat para el almacén." });
        //     this.refCodigoSunat.current.focus();
        //     return;
        // }

        // alertInfo("Almacen", "Procesando información...");


        // this.handleAdd();
    }

    render() {
        return (
            <ContainerWrapper>

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>
                                <span role="button" onClick={() => this.props.history.goBack()}><i className="bi bi-arrow-left-short"></i></span> Ajuste de inventario
                                <small className="text-secondary"> AGREGAR</small>
                            </h5>
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
                                    placeholder="Ingrese nombre producto..."
                                    ref={this.refTxtSearch}
                                    onKeyUp={(event) => keyUpSearch(event, () => this.searchText(event.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className='form-group'>
                            <div className="input-group">
                                <select
                                    className="form-control"
                                    ref=""
                                    value=""
                                    onChange=""
                                >
                                    <option value="0">-- Seleccione Metodo Ajuste --</option>
                                    <option value="1">metodo 01</option>
                                    <option value="2">metodo 02</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className='form-group'>
                            <div className="input-group">
                                <select
                                    className="form-control"
                                    ref=""
                                    value=""
                                    onChange=""
                                >
                                    <option value="0">-- Seleccione Almacen --</option>
                                    <option value="1">almacen 01</option>
                                    <option value="2">almacen 02</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-4 mt-2">
                        <div className="form-check form-check-inline h6 pr-5">
                            <input className="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio1" value="option1" />
                            <label className="form-check-label" for="inlineRadio1"><i className="bi bi-plus-circle-fill text-success"></i> Incremento</label>
                        </div>
                        <div class="form-check form-check-inline h6">
                            <input className="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio2" value="option2" />
                            <label className="form-check-label" for="inlineRadio2"><i className="bi bi-dash-circle-fill text-danger"></i> Decremento</label>
                        </div>
                    </div>
                    <div className="col-md-8">
                        <input
                            type="text"
                            className="form-control"
                            ref=""
                            value=""
                            placeholder="Ingrese una observación" />
                    </div>
                </div>

                <div className="row mt-3">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered rounded">
                                <thead>
                                    <tr>
                                        <th width="15%">Quitar</th>
                                        <th width="30%">Clave/Nombre</th>
                                        <th width="15%">Nueva Existencia</th>
                                        <th width="15%">Existencia Actual</th>
                                        <th width="15%">Diferencia</th>
                                        <th width="15%">Medida</th>
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
                    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                        <button type="button" className="btn btn-primary mr-2" onClick={() => this.handleSave()}>Guardar</button>
                        <button type="button" className="btn btn-danger" onClick={() => this.props.history.goBack()}>Cancelar</button>
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
export default connect(mapStateToProps, null)(AjusteAgregar);