import React from 'react';
import axios from 'axios';
import {
    formatMoney,
    keyNumberFloat,
    isNumeric,
    spinnerLoading,
    ModalAlertInfo,
    ModalAlertSuccess,
    ModalAlertWarning,
} from '../../tools/Tools';
import { connect } from 'react-redux';

class GastoDetalle extends React.Component {
    constructor(props) {
        super(props);
       
    }

    render() {
        return (
            <>
                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>
                                <span role="button"><i className="bi bi-arrow-left-short"></i></span> Gasto
                                <small className="text-secondary"> detalle</small>
                            </h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="form-group">
                            <button type="button" className="btn btn-light"><i className="fa fa-print"></i> Imprimir</button>
                            {" "}
                            <button type="button" className="btn btn-light"><i className="fa fa-edit"></i> Editar</button>
                            {" "}
                            <button type="button" className="btn btn-light"><i className="fa fa-remove"></i> Eliminar</button>
                            {" "}
                            <button type="button" className="btn btn-light"><i className="fa fa-file-archive-o"></i> Adjuntar</button>
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
                                            <th className="table-secondary w-25 p-1 font-weight-normal "><span>Recibo de caja</span></th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal"></th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Estado</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal"></th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Cliente</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal"> </th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Fecha</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal"> </th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Cuenta bancaria</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal"> </th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Notas</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal"> </th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Método de pago</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal"> </th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Total</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal"> </th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">Archivos adjuntos</th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal"> </th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="form-group">
                            <div className="table-responsive">
                                <table className="table table-light table-striped">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Concepto</th>
                                            <th>Cantidad</th>
                                            <th>Impuesto</th>
                                            <th>Valor</th>
                                            <th>Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-8 col-md-8 col-sm-12 col-xs-12"></div>
                    <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                        <table width="100%">
                            <thead>
                                
                            </thead>
                        </table>
                    </div>
                </div>
            </>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

export default connect(mapStateToProps, null)(GastoDetalle);