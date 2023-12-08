import React from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import {
    spinnerLoading,
    alertInfo,
    alertSuccess,
    alertWarning,
    alertDialog,
    statePrivilegio,
    currentDate,
    validateDate,
    keyUpSearch
} from '../../../../helper/utils.helper';
import Paginacion from '../../../../components/Paginacion';
import ContainerWrapper from '../../../../components/Container';

class Socios extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            lista: [],
            restart: false,

            idConcepto: '',
            conceptos: [],

            fechaInicio: currentDate(),
            fechaFinal: currentDate(),

            idSucursal: this.props.token.project.idSucursal,

            view: statePrivilegio(this.props.token.userToken.menus[2].submenu[4].privilegio[0].estado),

            opcion: 0,
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messageTable: 'Cargando información...',
        }
        this.refTxtSearch = React.createRef();
        this.refConcepto = React.createRef();

        this.idCodigo = "";
        this.abortControllerTable = new AbortController();

        this.abortControllerView = new AbortController();
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    async componentDidMount() {
        this.loadInit();
    }

    componentWillUnmount() {
        this.abortControllerTable.abort();
    }

    loadInit = async () => {
        if (this.state.loading) return;

        await this.setStateAsync({ paginacion: 1, restart: true });
        this.fillTable(0, "", "", "", "");
        await this.setStateAsync({ opcion: 0 });
    }

    async searchFecha() {
        if (this.state.loading) return;

        if (!validateDate(this.state.fechaInicio)) return;
        if (!validateDate(this.state.fechaFinal)) return;

        await this.setStateAsync({ paginacion: 1, restart: true });
        this.fillTable(1, "", this.state.fechaInicio, this.state.fechaFinal, this.state.idConcepto);
        await this.setStateAsync({ opcion: 1 });
    }

    async searchText(text) {
        if (this.state.loading) return;

        if (text.trim().length === 0) return;

        await this.setStateAsync({ paginacion: 1, restart: true });
        this.fillTable(2, text.trim(), "", "", "", "");
        await this.setStateAsync({ opcion: 2 });
    }

    paginacionContext = async (listid) => {
        await this.setStateAsync({ paginacion: listid, restart: false });
        this.onEventPaginacion();
    }

    onEventPaginacion = () => {
        switch (this.state.opcion) {
            case 0:
                this.fillTable(0, "", "", "", "");
                break;
            case 1:
                this.fillTable(1, "", this.state.fechaInicio, this.state.fechaFinal, this.state.idConcepto);
                break;
            case 2:
                this.fillTable(2, this.refTxtSearch.current.value, "", "", "");
                break;
            default: this.fillTable(0, "", "", "", "");
        }
    }

    fillTable = async (opcion, buscar, fechaInicio, fechaFinal, idConcepto) => {
        try {
            await this.setStateAsync({
                loading: true,
                lista: [],
                messageTable: "Cargando información...",
            });

            const result = await axios.get('/api/cliente/listsocios', {
                signal: this.abortControllerTable.signal,
                params: {
                    "opcion": opcion,
                    "buscar": buscar,
                    "fechaInicio": fechaInicio,
                    "fechaFinal": fechaFinal,
                    "idConcepto": idConcepto,
                    "idSucursal": this.state.idSucursal,
                    "posicionPagina": ((this.state.paginacion - 1) * this.state.filasPorPagina),
                    "filasPorPagina": this.state.filasPorPagina
                }
            });

            const totalPaginacion = parseInt(Math.ceil((parseFloat(result.data.total) / this.state.filasPorPagina)));

            await this.setStateAsync({
                loading: false,
                lista: result.data.result,
                totalPaginacion: totalPaginacion,
            });
        } catch (error) {
            if (error.message !== "canceled") {
                await this.setStateAsync({
                    loading: false,
                    lista: [],
                    totalPaginacion: 0,
                    messageTable: "Se produjo un error interno, intente nuevamente por favor.",
                });
            }
        }
    }

    onEventAdd() {
        this.props.history.push({
            pathname: `${this.props.location.pathname}/proceso`
        })
    }

    onEventDetail(idCliente) {
        this.props.history.push({
            pathname: `${this.props.location.pathname}/detalle`,
            search: "?idCliente=" + idCliente
        })
    }

    onEventEdit(idCliente) {
        this.props.history.push({
            pathname: `${this.props.location.pathname}/proceso`,
            search: "?idCliente=" + idCliente
        })
    }

    onEventDelete(idCliente) {
        alertDialog("Eliminar cliente", "¿Está seguro de que desea eliminar el contacto? Esta operación no se puede deshacer.", async (value) => {
            if (value) {
                try {
                    alertInfo("Cliente", "Procesando información...")
                    let result = await axios.delete('/api/cliente', {
                        params: {
                            "idCliente": idCliente
                        }
                    })
                    alertSuccess("Cliente", result.data, () => {
                        this.loadInit();
                    })
                } catch (error) {
                    if (error.response !== undefined) {
                        alertWarning("Cliente", error.response.data)
                    } else {
                        alertWarning("Cliente", "Se genero un error interno, intente nuevamente.")
                    }
                }
            }
        })
    }

    render() {
        return (
            <ContainerWrapper>
                <div className='row'>
                    <div className='col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12'>
                        <div className="form-group">
                            <h5>Socios <small className="text-secondary">LISTA</small></h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                        <div className="form-group">
                            <button className="btn btn-outline-light" onClick={() => this.loadInit()}>
                                <i className="bi bi-arrow-clockwise"></i> Recargar Vista
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className='col-xl-3 col-lg-3 col-md-12 col-sm-12 col-12'>
                        <div className="form-group">
                            <label>Fecha Inicio:</label>
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
                    <div className='col-xl-3 col-lg-3 col-md-12 col-sm-12 col-12'>
                        <div className="form-group">
                            <label>Fecha Final:</label>
                            <input
                                className="form-control"
                                type="date"
                                value={this.state.fechaFinal}
                                onChange={async (event) => {
                                    await this.setStateAsync({ fechaFinal: event.target.value })
                                    this.searchFecha();
                                }} />
                        </div>
                    </div>
                    <div className="col-xl-3 col-lg-6 col-md-12 col-sm-12 col-12">
                        <div className="form-group">
                            <label>Concepto:</label>
                            <select
                                title="Lista de conceptos"
                                className="form-control"
                                ref={this.refConcepto}
                                value={this.state.idConcepto}
                                onChange={(event) => {
                                    this.setState({
                                        idConcepto: event.target.value
                                    })
                                }}
                            >
                                <option value="">- seleccione el Concepto -</option>
                                {
                                    this.state.conceptos.map((item, index) => (
                                        <option key={index} value={item.idConcepto}>{item.nombre}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                        <div className="form-group">
                            <label>Busqueda socio / asociado:</label>
                            <div className="input-group mb-2">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-search"></i></div>
                                </div>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar..."
                                    ref={this.refTxtSearch}
                                    onKeyUp={(event) => keyUpSearch(event, () => this.searchText(event.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered rounded">
                                <thead>
                                    <tr>
                                        <th width="5%" className="text-center">#</th>
                                        <th width="10%">DNI / RUC</th>
                                        <th width="20%">Cliente</th>
                                        <th width="15%">Cel. / Tel.</th>
                                        <th width="15%">Dirección</th>
                                        <th width="15%">Comprobante</th>
                                        <th width="20%">Propiedad</th>
                                        <th width="5%" className="text-center">Detalle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.loading ? (

                                            <tr>
                                                <td className="text-center" colSpan="10">
                                                    {spinnerLoading("Cargando información de la tabla...", true)}
                                                </td>
                                            </tr>
                                        ) : this.state.lista.length === 0 ? (
                                            <tr className="text-center">
                                                <td colSpan="10">¡No hay datos registrados!</td>
                                            </tr>
                                        ) : (
                                            this.state.lista.map((item, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td className="text-center">{item.id}</td>
                                                        <td>{item.tipodocumento}{<br />}{item.documento}</td>
                                                        <td>{item.informacion}</td>
                                                        <td>{item.celular}{<br />}{item.telefono}</td>
                                                        <td>{item.direccion}</td>
                                                        <td>{item.comprobante} {<br />}{item.serie + "-" + item.numeracion}</td>
                                                        <td>{
                                                            item.detalle.map((detalle, indexd) => (
                                                                <div key={indexd}>
                                                                    <span>{detalle.descripcion}{<br />}{<small>{detalle.categoria}</small>}</span>
                                                                    <br />
                                                                    {indexd == item.detalle.length - 1 ? null : <hr />}
                                                                </div>
                                                            ))
                                                        }</td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-outline-info btn-sm"
                                                                title="Editar"
                                                                disabled={!this.state.view}>
                                                                <i className="bi bi-eye"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>


                <Paginacion
                    loading={this.state.loading}
                    data={this.state.lista}
                    totalPaginacion={this.state.totalPaginacion}
                    paginacion={this.state.paginacion}
                    fillTable={this.paginacionContext}
                    restart={this.state.restart}
                />

            </ContainerWrapper>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}


export default connect(mapStateToProps, null)(Socios);