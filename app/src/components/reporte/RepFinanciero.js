import React from 'react';
import axios from 'axios';
import { spinnerLoading, currentDate } from '../tools/Tools';

class RepFinanciero extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fechaIni: '',
            fechaFin: '',
            isFechaActive: false,

            loading: true,
        }

        this.abortControllerView = new AbortController()
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    componentDidMount() {
        this.loadData()
    }

    componentWillUnmount() {
        this.abortControllerView.abort();
    }

    loadData = async () => {
        try {

            // const comprobante = await axios.get("/api/comprobante/listcombo", {
            //     signal: this.abortControllerView.signal
            // });


            // const cliente = await axios.get("/api/cliente/listcombo", {
            //     signal: this.abortControllerView.signal
            // });

            // const usuario = await axios.get("/api/usuario/listcombo", {
            //     signal: this.abortControllerView.signal
            // });

            await this.setStateAsync({
                // clientes: cliente.data,
                // usuarios: usuario.data,
                // comprobantes: comprobante.data,
                loading: false,
                fechaIni: currentDate(),
                fechaFin: currentDate()
            });

        } catch (error) {
            if (error.message !== "canceled") {
                await this.setStateAsync({
                    msgLoading: "Se produjo un error interno, intente nuevamente."
                });
            }
        }
    }

    render() {
        return (
            <>
                {
                    this.state.loading ?
                        <div className="clearfix absolute-all bg-white">
                            {spinnerLoading(this.state.msgLoading)}
                        </div> :
                        <>
                            <div className="card my-1">
                                <h6 className="card-header">Filtros Generales</h6>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col">
                                            <div className="form-group">
                                                <label>Filtro por fechas</label>
                                                <div className="custom-control custom-switch">
                                                    <input
                                                        type="checkbox"
                                                        className="custom-control-input"
                                                        id="customSwitch1"
                                                        checked={this.state.isFechaActive}
                                                        onChange={(event) => {
                                                            this.setState({ isFechaActive: event.target.checked, fechaIni: currentDate(), fechaFin: currentDate() })
                                                        }}
                                                    >
                                                    </input>
                                                    <label className="custom-control-label" htmlFor="customSwitch1">{this.state.isFechaActive ? 'Activo' : 'Inactivo'}</label>
                                                </div>
                                            </div>

                                        </div>
                                        <div className="col">
                                            <div className="form-group">
                                                <label>Fecha inicial <i className="fa fa-asterisk text-danger small"></i></label>
                                                <div className="input-group">

                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        disabled={!this.state.isFechaActive}
                                                        value={this.state.fechaIni}
                                                        onChange={(event) => this.setState({ fechaIni: event.target.value })} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col">
                                            <div className="form-group">
                                                <label>Fecha final <i className="fa fa-asterisk text-danger small"></i></label>
                                                <div className="input-group">
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        disabled={!this.state.isFechaActive}
                                                        value={this.state.fechaFin}
                                                        onChange={(event) => this.setState({ fechaFin: event.target.value })} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="card my-1">
                                <h6 className="card-header d-flex" data-bs-toggle="collapse" href="#ingresos" role="button" aria-controls="ingresos">Reporte de Ingresos
                                    <div className="col text-right pr-0">
                                        <i className="bi bi-caret-down-fill"></i>
                                    </div>
                                </h6>
                                <div className="card-body collapse" id="ingresos">

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

                            <div className="card my-1">
                                <h6 className="card-header d-flex" data-bs-toggle="collapse" href="#gastos" role="button" aria-controls="gastos">Reporte de Gastos
                                    <div className="col text-right pr-0">
                                        <i className="bi bi-caret-down-fill"></i>
                                    </div>
                                </h6>
                                <div className="card-body collapse" id="gastos">
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

                            {/* <div className="card my-1">
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
                            </div> */}

                        </>
                }
            </>

        )
    }
}

export default RepFinanciero;