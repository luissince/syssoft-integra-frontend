import React from 'react';
import ContainerWrapper from '../../../../components/Container';
import CustomComponent from '../../../../model/class/custom-component';
import {
    keyUpSearch,
    currentDate,
    validateDate
} from "../../../../helper/utils.helper";
import { connect } from 'react-redux';

class CompraCrear extends CustomComponent {

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

    async searchProveedor(text) {
        // if (this.state.loading) return;

        // if (text.trim().length === 0) return;

        // await this.setStateAsync({ paginacion: 1, restart: false });
        // this.fillTable(1, text.trim());
        // await this.setStateAsync({ opcion: 1 });
    }

    async searchProduct(text) {
        // if (this.state.loading) return;

        // if (text.trim().length === 0) return;

        // await this.setStateAsync({ paginacion: 1, restart: false });
        // this.fillTable(1, text.trim());
        // await this.setStateAsync({ opcion: 1 });
    }

    async searchFecha() {
        if (this.state.loading) return;

        if (!validateDate(this.state.fechaInicio)) return;
        if (!validateDate(this.state.fechaFinal)) return;

        // await this.setStateAsync({ paginacion: 1, restart: true });
        // this.fillTable(1, "", this.state.fechaInicio, this.state.fechaFinal, this.state.idConcepto);
        // await this.setStateAsync({ opcion: 1 });
    }

    handleEliminar = (idAlmacen) => {
        // this.props.history.push({
        //     pathname: `${this.props.location.pathname}/editar`,
        //     search: "?idAlmacen=" + idAlmacen
        // })
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
                            <h5><span role="button" onClick={() => this.props.history.goBack()}><i className="bi bi-arrow-left-short"></i></span> Compra
                                <small className='text-secondary'> Crear </small>
                            </h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            <label>Proveedor:</label>
                            <div className="input-group mb-2">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-search"></i></div>
                                </div>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ingrese proveedor..."
                                    ref={this.refTxtSearch}
                                    onKeyUp={(event) => keyUpSearch(event, () => this.searchProveedor(event.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className='form-group'>
                            <label>Comprobante:</label>
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
                    <div className="col-md-3">
                        <div className='form-group'>
                            <label>Almacen:</label>
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
                    <div className="col-md-5 col-sm-12">
                        <div className="form-group">
                            <label>Producto:</label>
                            <div className="input-group mb-2">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-search"></i></div>
                                </div>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ingrese producto..."
                                    ref={this.refTxtSearch}
                                    onKeyUp={(event) => keyUpSearch(event, () => this.searchProduct(event.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                    <div className='col-xl-2 col-lg-2 col-md-12 col-sm-12 col-12'>
                        <div className="form-group">
                            <label>Fecha:</label>
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
                    <div className="col-md-2">
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
                    <div className="col-md-3">
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
                                        <th width="10%">Cantidad</th>
                                        <th width="50%">Clave/Descripción</th>
                                        <th width="10%">CostoUnitario</th>
                                        <th width="10%">Impuesto</th>
                                        <th width="10%">Importe</th>
                                        <th width="5%" className="text-center">Eliminar</th>
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
                    <div className="col-lg-9 col-md-9 col-sm-12 col-xs-12">
                        <div className="row">
                            <div className="col-lg-4">
                                <div className="input-group">
                                    <select className="form-control" ref="" value="" onChange="">
                                        <option value="0">-- Seleccione Moneda --</option>
                                        <option value="1">Soles</option>
                                        <option value="2">Dolares</option>
                                        <option value="3">Euros</option>
                                        <option value="4">Yenes</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-8">
                                <div className="form-check form-check-inline mt-2">
                                    <input className="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio1" value="option1" />
                                    <label className="form-check-label" for="inlineRadio1"> Actualizar costo Inventario</label>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-4">
                            <div className="col-lg-6">
                                <div class="form-group">
                                    <label for="notas">Visibles en el documento impreso</label>
                                    <textarea class="form-control" id="notas" rows="2"></textarea>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div class="form-group">
                                    <label for="observaciones">No visibles en el documento impreso</label>
                                    <textarea class="form-control" id="observaciones" rows="2"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <div className="form-group">
                            <div className="table-responsive">
                                <table width="100%">
                                    <thead>
                                        <tr>
                                            <th className="table-secondary w-35 p-1 font-weight-normal ">Importe Bruto</th>
                                            <th className="table-light border-top border-bottom border-right w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{/*{this.state.comprobante}*/}S/. 0.00</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-35 p-1 font-weight-normal ">Descuento</th>
                                            <th className="table-light border-bottom border-right w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{/*{this.state.cliente}*/}S/. 0.00</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-35 p-1 font-weight-normal ">Sub Importe</th>
                                            <th className="table-light border-bottom border-right w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{/*{this.state.fecha}*/}S/. 0.00</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-35 p-1 font-weight-normal ">Impuesto</th>
                                            <th className="table-light border-bottom border-right w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{/*{this.state.notas}*/}S/. 0.00</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-35 p-1 font-weight-bold ">IMPORTE NETO</th>
                                            <th className="table-light border-bottom border-right w-65 pl-2 pr-2 pt-1 pb-1 font-weight-bold">{/*{this.state.notas}*/}S/. 0.00</th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
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
export default connect(mapStateToProps, null)(CompraCrear);