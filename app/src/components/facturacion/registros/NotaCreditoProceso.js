import React from 'react';
import axios from 'axios';
import {
    spinnerLoading,
    numberFormat,
    timeForma24,
    ModalAlertInfo,
    ModalAlertDialog,
    ModalAlertSuccess,
    ModalAlertWarning,
    ModalAlertError,
    statePrivilegio
} from '../../tools/Tools';
import { connect } from 'react-redux';

class NotaCreditoProceso extends React.Component {
    constructor(props) {
        super(props);
        
    }



    render() {
        return (
            <>
                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Ventas <small className="text-secondary">LISTA</small></h5>
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
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                          
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
                                        <th width="10%">Cliente</th>
                                        <th width="10%">Comprobante</th>
                                        <th width="10%">Fecha</th>
                                        <th width="10%">Tipo</th>
                                        <th width="10%">Total</th>
                                        <th width="10%" className="text-center">Estado</th>
                                        <th width="5%" className="text-center">Detalle</th>
                                        {/* <th width="5%" className="text-center">Editar</th> */}
                                        <th width="5%" className="text-center">Anular</th>
                                    </tr>
                                </thead>
                                <tbody>
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
                                  
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

export default connect(mapStateToProps, null)(NotaCreditoProceso);