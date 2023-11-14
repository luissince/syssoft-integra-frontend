import React from 'react';
import ContainerWrapper from '../../../../components/Container';
import CustomComponent from '../../../../model/class/custom-component';
import {
    keyUpSearch,
    currentDate,
    validateDate
} from "../../../../helper/utils.helper";
import { connect } from 'react-redux';

class GuiaRemisionEditar extends CustomComponent {

    constructor(props) {
        super(props);

        this.state = {


            idSucursal: this.props.token.project.idSucursal,
            idUsuario: this.props.token.userToken.idUsuario,

            fechaInicio: currentDate(),
            fechaFinal: currentDate(),
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

    async searchFecha() {
        if (this.state.loading) return;

        if (!validateDate(this.state.fechaInicio)) return;
        if (!validateDate(this.state.fechaFinal)) return;

        // await this.setStateAsync({ paginacion: 1, restart: true });
        // this.fillTable(1, "", this.state.fechaInicio, this.state.fechaFinal, this.state.idConcepto);
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
                                <span role="button" onClick={() => this.props.history.goBack()}><i className="bi bi-arrow-left-short"></i></span> Guía Remisión
                                <small className='text-secondary'> Editar </small>
                            </h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            <label>Cliente: <i className="fa fa-asterisk text-danger small"></i></label>
                            <div className="input-group mb-2">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-search"></i></div>
                                </div>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ingrese el cliente..."
                                    ref={this.refTxtSearch}
                                    onKeyUp={(event) => keyUpSearch(event, () => this.searchProveedor(event.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            <label>Documento Guia de Remisión: <i className="fa fa-asterisk text-danger small"></i></label>

                            <div className="input-group">
                                <select
                                    className="form-control"
                                    ref=""
                                    value=""
                                    onChange=""
                                >
                                    <option value="0">-- Seleccione comprobante --</option>
                                    <option value="1">comprobante 01</option>
                                    <option value="2">comprobante 02</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dropdown-divider"></div>

                <div className="row">
                    <div className="col-md-3 mt-2">
                        <label>Modalidad de traslado: </label>
                        <div>
                            <div className="form-check form-check-inline pr-5">
                                <input className="form-check-input checked" type="radio" name="inlineRadioOptions" id="inlineRadio1" value="option1" />
                                <label className="form-check-label" for="inlineRadio1"> Público</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input className="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio2" value="option2" />
                                <label className="form-check-label" for="inlineRadio2"> Privado</label>
                            </div>
                        </div>

                    </div>
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            <label>Motivo del traslado: <i className="fa fa-asterisk text-danger small"></i></label>

                            <div className="input-group">
                                <select
                                    className="form-control"
                                    ref=""
                                    value=""
                                    onChange=""
                                >
                                    <option value="0">-- Seleccione comprobante --</option>
                                    <option value="1">motivo 01</option>
                                    <option value="2">motivo 02</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className='col-xl-3 col-lg-3 col-md-12 col-sm-12 col-12'>
                        <div className="form-group">
                            <label>Fecha traslado: <i className="fa fa-asterisk text-danger small"></i></label>
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
                </div>

                <div className="row">
                    <div className="col-md-3 col-sm-12">
                        <div className="form-group">
                            <label>Tipo Peso de Carga: <i className="fa fa-asterisk text-danger small" /></label>

                            <div className="input-group">
                                <select
                                    className="form-control"
                                    ref=""
                                    value=""
                                    onChange=""
                                >
                                    <option value="0">-- Seleccione --</option>
                                    <option value="1">tipo 01</option>
                                    <option value="2">tipo 02</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className='form-group'>
                            <label>Peso de la Carga:</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ingrese Peso"
                                    ref=""
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dropdown-divider"></div>

                <div className="row">
                    <div className="col-md-4 col-sm-12">
                        <div className="form-group">
                            <label>Selecciona un vehiculo: <i className="fa fa-asterisk text-danger small"></i></label>
                            <div className="input-group">
                                <select className="form-control" ref="" value="" onChange="">
                                    <option value="0">-- Seleccione comprobante --</option>
                                    <option value="1">comprobante 01</option>
                                    <option value="2">comprobante 02</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 col-sm-12">
                        <div className="form-group">
                            <label>Selecciona un Conductor (DNI): <i className="fa fa-asterisk text-danger small"></i></label>
                            <div className="input-group">
                                <select className="form-control" ref="" value="" onChange="">
                                    <option value="0">-- Seleccione comprobante --</option>
                                    <option value="1">comprobante 01</option>
                                    <option value="2">comprobante 02</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 col-sm-12">
                        <div className="form-group">
                            <label>Selecciona una Empresa (RUC): <i className="fa fa-asterisk text-danger small"></i></label>
                            <div className="input-group">
                                <select className="form-control" ref="" value="" onChange="">
                                    <option value="0">-- Seleccione transporte público --</option>
                                    <option value="1">comprobante 01</option>
                                    <option value="2">comprobante 02</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dropdown-divider"></div>

                <div className="row">
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            <label>Dirección Partida: <i className="fa fa-asterisk text-danger small"></i></label>
                            <div className="input-group mb-2">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-search"></i></div>
                                </div>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ingrese Dirección de partida..."
                                    ref={this.refTxtSearch}
                                    onKeyUp={(event) => keyUpSearch(event, () => this.searchProveedor(event.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            <label>Dirección Llegada: <i className="fa fa-asterisk text-danger small"></i></label>
                            <div className="input-group mb-2">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-search"></i></div>
                                </div>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ingrese Dirección de llegada..."
                                    ref={this.refTxtSearch}
                                    onKeyUp={(event) => keyUpSearch(event, () => this.searchProveedor(event.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dropdown-divider"></div>

                <div className="row">
                    <div className="col-md-4 col-sm-12">
                        <div className="form-group">
                            <label>Tipo de Comprobante: <i className="fa fa-asterisk text-danger small"></i></label>
                            <div className="input-group">
                                <select className="form-control" ref="" value="" onChange="">
                                    <option value="0">-- Seleccione comprobante --</option>
                                    <option value="1">comprobante 01</option>
                                    <option value="2">comprobante 02</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className='form-group'>
                            <label>Serie:</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="B001/F001"
                                    ref={this.refTxtSearch}
                                    onKeyUp={(event) => keyUpSearch(event, () => this.searchProduct(event.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className='form-group'>
                            <label>Numeración:</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="0000000"
                                    ref={this.refTxtSearch}
                                    onKeyUp={(event) => keyUpSearch(event, () => this.searchProduct(event.target.value))}
                                />
                            </div>
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
                                        <th width="10%">Código</th>
                                        <th width="50%">Descripción</th>
                                        <th width="10%">Und/Medida</th>
                                        <th width="10%">Cantidad</th>
                                        <th width="10%">Peso (KG)</th>
                                        <th width="5%" className="text-center">Quitar</th>
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
                                                return ( */}
                                    <tr  /*  key={index}*/>
                                        <td className="text-center">1</td>
                                        <td>10 UND</td>
                                        <td>PROD0001/Pollo desmenuzado</td>
                                        <td>S/. 25</td>
                                        <td>S/. 1.8</td>
                                        <td className="text-center">S/. 2000</td>
                                        <td className="text-center">
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                title="Anular"
                                                onClick={() => this.handleEliminar("")}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    {/* )
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
export default connect(mapStateToProps, null)(GuiaRemisionEditar);