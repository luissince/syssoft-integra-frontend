import React from 'react';
import axios from 'axios';
import { spinnerLoading } from '../tools/Tools';

class RepFinanciero extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        return (
            <>
                <div className="card">
                    <h6 className="card-header">Filtros Generales</h6>
                    <div className="card-body">
                        <div className="custom-control custom-switch">
                            <input type="checkbox" className="custom-control-input" id="customSwitch1"></input>
                            <label className="custom-control-label" htmlFor="customSwitch1">Filtro por fechas</label>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h6 className="card-header">Reporte de Ingresos <small className="text-secondary">RESIDENCIAL VILLA SAN JUAN</small></h6>
                    <div className="card-body">
                        <div className="row">
                            <div className="col">
                                <div className="form-group">
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text"><i className="bi bi-person-fill"></i></div>
                                        </div>
                                        <select
                                            title="Lista de clientes"
                                            className="form-control"
                                        >
                                            <option value="">Seleccione forma de pago</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <button className="btn btn-outline-success btn-sm">Reporte de Ingresos</button>
                            </div>
                            <div className="col">
                                <button className="btn btn-outline-primary btn-sm">Recibos emitidos</button>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <div className="form-group">
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text"><i className="bi bi-person-fill"></i></div>
                                        </div>
                                        <select
                                            title="Lista de clientes"
                                            className="form-control"
                                        >
                                            <option value="">Seleccione tipo de cuota</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <button className="btn btn-outline-success btn-sm">Reporte Cobro Cuotas</button>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <div className="form-group">
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text"><i className="bi bi-person-fill"></i></div>
                                        </div>

                                        <select
                                            title="Lista de clientes"
                                            className="form-control"
                                        >
                                            <option value="">Seleccione banco</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <button className="btn btn-outline-success btn-sm">Depósito por Banco</button>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="card">
                    <h6 className="card-header">Reporte de Gastos <small className="text-secondary">RESIDENCIAL VILLA SAN JUAN</small></h6>
                    <div className="card-body">
                        <div className="form-group">
                            <div className="row">
                                <div className="col">
                                    <button className="btn btn-outline-secondary btn-sm">Reporte de Gastos</button>
                                </div>
                                <div className="col">
                                    <button className="btn btn-outline-success btn-sm">Estado Ingresos y Gastos</button>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <div className="form-group">
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text"><i className="bi bi-person-fill"></i></div>
                                        </div>

                                        <select
                                            title="Lista de clientes"
                                            className="form-control"
                                        >
                                            <option value="">Seleccione concepto</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <button className="btn btn-outline-success btn-sm">Depósito por Banco</button>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <div className="form-group">
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text"><i className="bi bi-person-fill"></i></div>
                                        </div>

                                        <select
                                            title="Lista de clientes"
                                            className="form-control"
                                        >
                                            <option value="">Seleccione sede</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <button className="btn btn-outline-success btn-sm">Gastos por Sede</button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

export default RepFinanciero;