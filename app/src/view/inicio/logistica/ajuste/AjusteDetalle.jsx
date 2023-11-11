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

class AjusteDetalle extends CustomComponent {

    constructor(props) {
        super(props);
        
        this.state = {
            

            idSucursal: this.props.token.project.idSucursal,
            idUsuario: this.props.token.userToken.idUsuario,
        }

    }


    async componentDidMount() {
   
    }

    componentWillUnmount() {
    
    }


    render() {
        return (
            <ContainerWrapper>

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Ajuste <small className="text-secondary">detalle</small></h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="form-group">
                            <div className="table-responsive">
                                <table width="100%">
                                    <thead>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Tipo de ajuste</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{/*{this.state.comprobante}*/}ajuste</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Fecha y Hora</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{/*{this.state.cliente}*/}12/12/2023 10:02</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Observación</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{/*{this.state.fecha}*/} N/D</th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Estado</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">{/*{this.state.notas}*/}completado</th>
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
                                        <th>Cantidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* {
                                        this.state.detalle.map((item, index) => (
                                            <tr key={index}>
                                                <td>{++index}</td>
                                                <td>{item.producto}</td>
                                                <td>{item.medida}</td>
                                                <td>{item.categoria}</td>
                                                <td className="text-right">{rounded(item.cantidad)}</td>
                                                <td className="text-right">{item.impuesto}</td>
                                                <td className="text-right">{numberFormat(item.precio, this.state.codiso)}</td>
                                                <td className="text-right">{numberFormat(item.cantidad * item.precio, this.state.codiso)}</td>
                                            </tr>
                                        ))
                                    } */}
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
export default connect(mapStateToProps, null)(AjusteDetalle);