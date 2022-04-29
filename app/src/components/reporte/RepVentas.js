import React from 'react';
import axios from 'axios';
import { spinnerLoading } from '../tools/Tools';

class RepVentas extends React.Component {
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
                    <h6 className="card-header">Reporte de Ventas <small className="text-secondary">RESIDENCIAL VILLA SAN JUAN</small></h6>
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
                                            <option value="">-- Cliente --</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <button className="btn btn-outline-success btn-sm">Reporte de Ventas</button>
                            </div>
                            <div className="col">
                                <button className="btn btn-outline-primary btn-sm">Detalle de Ventas</button>
                            </div>
                            <div className="col">
                                <button className="btn btn-outline-secondary btn-sm">Ventas anuladas</button>
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
                                            <option value="">Seleccione vendedor</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <button className="btn btn-outline-success btn-sm">Ventas x Vendedor</button>
                            </div>
                            <div className="col">
                                <button className="btn btn-outline-primary btn-sm">Cuotas x Cobrar</button>
                            </div>
                            <div className="col">
                                <button className="btn btn-outline-primary btn-sm">Total Créditos por Cobrar</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h6 className="card-header">Reporte de Ventas por Cliente</h6>
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
                                            <option value="">Buscar cliente</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <button className="btn btn-outline-success btn-sm">Ventas x Cliente</button>
                            </div>
                            <div className="col">
                                <button className="btn btn-outline-primary btn-sm">Recibos x Cliente</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h6 className="card-header">Reporte de Vouchers</h6>
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
                                            <option value="">Buscar Cliente con Venta al Crédito Exitosa</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <button className="btn btn-outline-success btn-sm">Vouchers x Venta</button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

export default RepVentas