import React from 'react';
import {
    alertDialog,
    alertInfo,
    alertSuccess,
    alertWarning,
    isEmpty} from '../../../../helper/utils.helper';
import ContainerWrapper from "../../../../components/Container";
import CustomComponent from "../../../../model/class/custom-component";
import { connect } from 'react-redux';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { addAlmacen, getUbigeo } from '../../../../network/rest/principal.network';
import { CANCELED } from '../../../../model/types/types';
import SearchInput from '../../../../components/SearchInput';

class AlmaceneEditar extends CustomComponent {

    constructor(props) {
        super(props);
        this.state = {
            nombre: '',
            direccion: '',
            idUbigeo: '',
            codigoSunat: '',
            observacion: '',

            filter: false,
            ubigeo: '',
            filteredData: [],

            idSucursal: this.props.token.project.idSucursal,
            idUsuario: this.props.token.userToken.idUsuario,
        }

        this.refNombre = React.createRef();
        this.refDireccion = React.createRef();
        this.refIdUbigeo = React.createRef();

        this.selectItem = false;
    }

    //------------------------------------------------------------------------------------------
    // Filtrar ubigeo
    //------------------------------------------------------------------------------------------

    handleClearInputaUbigeo = async () => {
        await this.setStateAsync({ filteredData: [], idUbigeo: '', ubigeo: "" });
        this.selectItem = false;
    }

    handleFilterUbigeo = async (event) => {
        const searchWord = this.selectItem ? "" : event.target.value;
        await this.setStateAsync({ idUbigeo: '', ubigeo: searchWord });
        this.selectItem = false;
        if (searchWord.length === 0) {
            await this.setStateAsync({ filteredData: [] });
            return;
        }

        if (this.state.filter) return;

        const params = {
            filtrar: searchWord,
        }

        const response = await getUbigeo(params);

        if (response instanceof SuccessReponse) {
            await this.setStateAsync({ filter: false, filteredData: response.data });
        }

        if (response instanceof ErrorResponse) {
            await this.setStateAsync({ filter: false, filteredData: [] });
        }
    }

    handleSelectItemUbigeo = async (value) => {
        await this.setStateAsync({
            ubigeo: value.departamento + "-" + value.provincia + "-" + value.distrito + " (" + value.ubigeo + ")",
            filteredData: [],
            idUbigeo: value.idUbigeo
        });
        this.selectItem = true;
    }


    handleSave() {
        if (isEmpty(this.state.nombre)) {
            alertWarning("Almacén", "Ingrese un nombre para el almacén", () => this.refNombre.current.focus())
            return;
        }

        if (isEmpty(this.state.direccion)) {
            alertWarning("Almacén", "Ingrese una dirección para el almacén.", () => this.refDireccion.current.focus())
            return;
        }

        if(isEmpty(this.state.idUbigeo)){
            alertWarning("Almacén", "Ingrese el ubigeo.", () => this.refIdUbigeo.current.focus())
            return;
        }

        alertDialog("Almacén", "¿Esta seguro de continuar?", async (accept) => {
            if (accept) {
                alertInfo("Almacen", "Procesando información...");

                const data = {
                    nombre: this.state.nombre.trim(),
                    direccion: this.state.direccion.trim(),
                    idUbigeo: this.state.idUbigeo,
                    codigoSunat: this.state.codigoSunat.toString().trim(),
                    observacion: this.state.observacion,
                    idSucursal: this.state.idSucursal,
                    idUsuario: this.state.idUsuario,
                }

                const response = await addAlmacen(data);

                if (response instanceof SuccessReponse) {
                    alertSuccess("Almacen", response.data, () => {
                        this.props.history.goBack();
                    });
                }

                if (response instanceof ErrorResponse) {
                    if (response.getType() === CANCELED) return;

                    alertWarning("Almacen", response.getMessage(), () => {
                        this.refNombre.current.focus();
                    });
                }
            }
        })
    }

    render() {
        return (
            <ContainerWrapper>
                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-12'>
                        <div className="form-group">
                            <h5>
                                <span role="button" onClick={() => this.props.history.goBack()}><i className="bi bi-arrow-left-short"></i></span> Almacén
                                <small className="text-secondary"> Agregar</small>
                            </h5>
                        </div>
                    </div>
                </div>

                <div className="dropdown-divider"></div>

                <div className="form-group pb-2">
                    <label>
                        Crea los puntos de almacenamiento y distribución de tus productos
                    </label>
                </div>

                <div className="row">
                    <div className="form-group col-md-6">
                        <div className="form-row">
                            <div className="form-group col-md-12">
                                <label>Nombre del Almacén: <i className="fa fa-asterisk text-danger small"></i></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    ref={this.refNombre}
                                    value={this.state.nombre}
                                    onChange={(event) => {
                                        this.setState({
                                            nombre: event.target.value,
                                        });
                                    }}
                                    placeholder="Ingrese el nombre del almacen" />
                            </div>

                            <div className="form-group col-md-12">
                                <label>Dirección: <i className="fa fa-asterisk text-danger small"></i></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    ref={this.refDireccion}
                                    value={this.state.direccion}
                                    onChange={(event) => {
                                        this.setState({
                                            direccion: event.target.value,
                                        });
                                    }}
                                    placeholder="Ingrese una dirección" />
                            </div>

                            <div className="form-group col-md-12">
                                <label>Ubigeo: <i className="fa fa-asterisk text-danger small"></i></label>
                                <SearchInput
                                    placeholder="Filtrar productos..."
                                    refValue={this.refIdUbigeo}
                                    value={this.state.ubigeo}
                                    data={this.state.filteredData}
                                    handleClearInput={this.handleClearInputaUbigeo}
                                    handleFilter={this.handleFilterUbigeo}
                                    handleSelectItem={this.handleSelectItemUbigeo}
                                    renderItem={(value) => (
                                        <>
                                            {
                                                value.departamento +
                                                "-" +
                                                value.provincia +
                                                "-" +
                                                value.distrito +
                                                " (" +
                                                value.ubigeo +
                                                ")"
                                            }
                                        </>
                                    )}
                                />
                            </div>

                            <div className="form-group col-md-12">
                                <label>Código SUNAT:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={this.state.codigoSunat}
                                    onChange={(event) => {
                                        this.setState({
                                            codigoSunat: event.target.value,
                                        });
                                    }}
                                    placeholder="" />
                            </div>
                            <div className="form-group col-md-12">
                                <label>Los campos marcados con <i className="fa fa-asterisk text-danger small"></i> son obligatorios</label>
                            </div>
                        </div>

                    </div>

                    <div className="form-group col-md-6">
                        <div className="form-row h-100">
                            <div className="form-group col-md-12">
                                <label>Observaciones: </label>
                                <textarea className="form-control "
                                    id="exampleFormControlTextarea1"
                                    rows="13"
                                    value={this.state.observacion}
                                    onChange={(event) => this.setState({
                                        observacion: event.target.value
                                    })}
                                ></textarea>
                            </div>

                            <div className="form-group col-md-12">
                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <button type="button"
                                            className="btn btn-primary btn-block"
                                            onClick={() => this.handleSave()}>
                                            Guardar
                                        </button>
                                    </div>
                                    <div className="form-group col-md-6">
                                        <button type="button"
                                            className="btn btn-secondary btn-block ml-2"
                                            onClick={() => this.props.history.goBack()}>
                                            Cerrar
                                        </button>
                                    </div>
                                </div>
                            </div>
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

export default connect(mapStateToProps, null)(AlmaceneEditar);