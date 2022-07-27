import React from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import {
    spinnerLoading,
    dateFormat,
    numberFormat,
    statePrivilegio
} from '../tools/Tools';
import { connect } from 'react-redux';
import Paginacion from '../tools/Paginacion';

class Socios extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
           
        }
        this.refTxtSearch = React.createRef();

        this.abortControllerTable = new AbortController();
    }

    render() {
        return (
            <>
                <div className='row'>
                    <div className='col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12'>
                        <div className="form-group">
                            <h5>Lista de Créditos <small className="text-secondary">LISTA</small></h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-xl-2 col-lg-2 col-md-12 col-sm-12 col-12">
                        <div className="form-group">
                            <div className="input-group">
                                <button className="btn btn-outline-secondary">
                                    <i className="bi bi-arrow-clockwise"></i>  Recargar Vista
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-xl-3 col-lg-4 col-md-12 col-sm-12 col-12">
                        <div className="form-group">
                            <select className="form-control">
                                <option value="0">
                                    Listar Ventas al Crédito
                                </option>
                                <option value="1">
                                    Listar Todas Ventas
                                </option>
                            </select>
                        </div>
                    </div>
                    <div className="col-xl-3 col-lg-4 col-md-12 col-sm-12 col-12">
                        <div className="form-group">
                            <select className="form-control">
                                <option value="0">
                                    - Seleccione
                                </option>
                                <option value="15">
                                    Listar Ventas de cada 15
                                </option>
                                <option value="30">
                                    Listar Ventas de cada 30
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-xl-6 col-lg-12 col-md-12 col-sm-12 col-12">
                        <div className="form-group">
                            <div className="input-group mb-2">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-search"></i></div>
                                </div>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar..."/>
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
                                        <th width="15%">Cliente</th>
                                        <th width="15%">Comprobante</th>
                                        <th width="15%">Cuotas Pendientes / Frecuencia</th>
                                        <th width="10%">Sig. Pago</th>
                                        <th width="10%">Total</th>
                                        <th width="10%">Cobrado</th>
                                        <th width="10%">Por Cobrar</th>
                                        <th width="5%">Cronograma</th>
                                        <th width="5%">Cobros</th>
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
                        <div className="dataTables_info mt-2" role="status" aria-live="polite"></div>
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


export default connect(mapStateToProps, null)(Socios);