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

class GastoProceso extends React.Component {
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
                                <span role="button"><i className="bi bi-arrow-left-short"></i></span> Gastos
                                <small className="text-secondary"> proceso</small>
                            </h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12">
                        
                        <div className="form-row">
                            <div className="form-group col-md-6">
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text"><i className="bi bi-cart4"></i></div>
                                    </div>
                                    <select
                                        title="Lista de conceptos"
                                        className="form-control"
                                        >
                                        <option value="">-- seleccione --</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group col-md-6">
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text"><i className="bi bi-cash-coin"></i></div>
                                    </div>
                                    <input
                                        title="Monto a cobrar"
                                        type="text"
                                        className="form-control"
                                        placeholder="Ingrese el monto"
                                        onKeyPress={keyNumberFloat}
                                    />
                                    <button className="btn btn-outline-secondary ml-1" type="button" title="Agregar"><i className="bi bi-plus-circle"></i></button>
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered rounded">
                                    <thead>
                                        <tr>
                                            <th width="5%">#</th>
                                            <th width="30%">Concepto</th>
                                            <th width="10%">Cantidad</th>
                                            <th width="20%">Impuesto</th>
                                            <th width="10%">Valor</th>
                                            <th width="10%">Total</th>
                                            <th width="5%">Quitar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <button type="button" className="btn btn-primary">
                                    <i className="fa fa-save"></i> Guardar
                                </button>
                                {" "}
                                <button type="button" className="btn btn-outline-info">
                                    <i className="fa fa-trash"></i> Limpiar
                                </button>
                                {" "}
                                <button type="button" className="btn btn-outline-secondary">
                                    <i className="fa fa-close"></i> Cerrar
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-12">

                        <div className="form-group">
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-person-fill"></i></div>
                                </div>
                                <select
                                    title="Lista de clientes"
                                    className="form-control"
                                    >
                                    <option value="">-- Cliente --</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-bank"></i></div>
                                </div>
                                <select
                                    title="Lista de caja o banco a depositar"
                                    className="form-control">
                                    <option value="">-- Cuenta bancaria --</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-credit-card-2-back"></i></div>
                                </div>
                                <select
                                    title="Lista metodo de pago"
                                    className="form-control"
                                    >
                                    <option value="">-- Metodo de pago --</option>
                                    <option value="1">Efectivo</option>
                                    <option value="2">Consignación</option>
                                    <option value="3">Transferencia</option>
                                    <option value="4">Cheque</option>
                                    <option value="5">Tarjeta crédito</option>
                                    <option value="6">Tarjeta débito</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-cash"></i></div>
                                </div>
                                <select
                                    title="Lista metodo de pago"
                                    className="form-control"
                                >    
                                <option value="">-- Moneda --</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-chat-dots-fill"></i></div>
                                </div>
                                <textarea
                                    title="Observaciones..."
                                    className="form-control"
                                    style={{ fontSize: '13px' }}
                                    placeholder="Ingrese alguna observación">
                                </textarea>
                            </div>
                        </div>

                        <div className="form-group">
                            <table width="100%">
                                <tbody>
                                    
                                </tbody>
                            </table>
                        </div>
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

export default connect(mapStateToProps, null)(GastoProceso);