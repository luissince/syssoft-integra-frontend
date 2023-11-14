import React from 'react';
import ContainerWrapper from '../../../../components/Container';
import CustomComponent from '../../../../model/class/custom-component';
import {
    keyUpSearch,
    currentDate,
    validateDate
} from "../../../../helper/utils.helper";
import { connect } from 'react-redux';

class GuiaRemisionDetalle extends CustomComponent {

    async onEventImprimir() {
        // const data = {
        //     "idEmpresa": "EM0001",
        //     "idVenta": this.state.idVenta,
        // }

        // let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'key-report-inmobiliaria').toString();
        // let params = new URLSearchParams({ "params": ciphertext });
        // window.open("/api/factura/repcomprobante?" + params, "_blank");
    }

    render() {
        return (
            <ContainerWrapper>

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>
                                <span role="button" onClick={() => this.props.history.goBack()}><i className="bi bi-arrow-left-short"></i></span> Guía Remisión
                                <small className='text-secondary'> Detalle </small>
                            </h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="form-group">
                            <button type="button" className="btn btn-light" onClick={() => this.onEventImprimir()}><i className="fa fa-print"></i> Imprimir</button>
                            {" "}
                            {/* <button type="button" className="btn btn-light"><i className="fa fa-edit"></i> Editar</button> */}
                            {" "}
                            {/* <button type="button" className="btn btn-light"><i className="fa fa-remove"></i> Eliminar</button> */}
                            {" "}
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                        <div className="form-group">
                            <div className="table-responsive">
                                <table width="100%">
                                    <thead>
                                        <tr>
                                            <th className="table-secondary w-35 p-1 font-weight-normal ">Fecha</th>
                                            <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{/*{this.state.comprobante}*/}13/11/2023 11:23:00.00</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-35 p-1 font-weight-normal ">Cliente</th>
                                            <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{/*{this.state.cliente}*/}Algún proveedor aqui</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-35 p-1 font-weight-normal ">Telefono y Celular</th>
                                            <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{/*{this.state.fecha}*/} (01) 123 1234</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-35 p-1 font-weight-normal ">Correo Electrónico</th>
                                            <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{/*{this.state.notas}*/}+51 123 456 789</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-35 p-1 font-weight-normal ">Dirección</th>
                                            <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{/*{this.state.notas}*/}correo@correo.com</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-35 p-1 font-weight-normal ">Motivo Traslado</th>
                                            <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{/*{this.state.notas}*/}alguna dirección aqui</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-35 p-1 font-weight-normal ">Modalidad Traslado</th>
                                            <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{/*{this.state.notas}*/}Almacen 01</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-35 p-1 font-weight-normal ">Peso (KGM o TNE)</th>
                                            <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{/*{this.state.notas}*/}Almacen 01</th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                        <div className="form-group">
                            <div className="table-responsive">
                                <table width="100%">
                                    <thead>
                                        <tr>
                                            <th className="table-secondary w-35 p-1 font-weight-normal ">Conductor</th>
                                            <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{/*{this.state.comprobante}*/}F001-000123</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-35 p-1 font-weight-normal ">Número de Licencia</th>
                                            <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{/*{this.state.comprobante}*/}Factura</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-35 p-1 font-weight-normal ">Número de Placa</th>
                                            <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{/*{this.state.cliente}*/}01 - Pagada</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-35 p-1 font-weight-normal ">Dirección de Partida</th>
                                            <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{/*{this.state.fecha}*/} N/D</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-35 p-1 font-weight-normal ">Dirección de Llegada</th>
                                            <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{/*{this.state.notas}*/} N/D</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-35 p-1 font-weight-normal ">Comprobante Asociado</th>
                                            <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{/*{this.state.notas}*/}S/. 2000.00</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-35 p-1 font-weight-normal ">Serie y Numeración</th>
                                            <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{/*{this.state.notas}*/}S/. 2000.00</th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <p className="lead">Detalle</p>
                        <div className="table-responsive">
                            <table className="table table-light table-striped">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Descripción</th>
                                        <th>Código</th>
                                        <th>Und/Medida</th>
                                        <th>Cantidad</th>
                                        <th>Peso(Kg)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>Pollo desmenuzado</td>
                                        <td>COD0001</td>
                                        <td>KG</td>
                                        <td>40</td>
                                        <td>50</td>
                                    </tr>
                                </tbody>
                            </table>
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
export default connect(mapStateToProps, null)(GuiaRemisionDetalle);