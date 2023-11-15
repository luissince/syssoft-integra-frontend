import React from 'react';
import {
    spinnerLoading,
    isEmpty,
    rounded,
    formatDecimal
} from '../../../../helper/utils.helper';
import ContainerWrapper from "../../../../components/Container";
import Paginacion from "../../../../components/Paginacion";
import {
    keyUpSearch} from "../../../../helper/utils.helper";
import CustomComponent from "../../../../model/class/custom-component";
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { listInventario } from '../../../../network/rest/principal.network';
import { CANCELED } from '../../../../model/types/types';
import { connect } from 'react-redux';

class Inventario extends CustomComponent {

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            lista: [],
            restart: false,

            opcion: 0,
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messageTable: 'Cargando información...',

            idSucursal: this.props.token.project.idSucursal,
            idUsuario: this.props.token.userToken.idUsuario,
        }

        this.abortControllerTable = new AbortController();
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
        this.fillTable(0, "");
        await this.setStateAsync({ opcion: 0 });
    }

    paginacionContext = async (listid) => {
        await this.setStateAsync({ paginacion: listid, restart: false });
        this.onEventPaginacion();
    }

    async searchText(text) {
        if (this.state.loading) return;

        if (text.trim().length === 0) return;

        await this.setStateAsync({ paginacion: 1, restart: false });
        this.fillTable(1, text.trim());
        await this.setStateAsync({ opcion: 1 });
    }

    fillTable = async (opcion, buscar) => {
        await this.setStateAsync({
            loading: true,
            lista: [],
            messageTable: "Cargando información...",
        });

        const params = {
            "opcion": opcion,
            "buscar": buscar,
            "idSucursal": this.state.idSucursal,
            "posicionPagina": ((this.state.paginacion - 1) * this.state.filasPorPagina),
            "filasPorPagina": this.state.filasPorPagina
        }

        const response = await listInventario(params, this.abortControllerTable.signal);

        if (response instanceof SuccessReponse) {
            const result = response.data.result;
            const total = response.data.total
            const totalPaginacion = parseInt(Math.ceil((parseFloat(total) / this.state.filasPorPagina)));

            await this.setStateAsync({
                loading: false,
                lista: result,
                totalPaginacion: totalPaginacion,
            });
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            await this.setStateAsync({
                loading: false,
                lista: [],
                totalPaginacion: 0,
                messageTable: response.getMessage(),
            });
        }
    }

    generarBody() {
        if (this.state.loading) {
            return (
                <tr>
                    <td className="text-center" colSpan="7">
                        {spinnerLoading("Cargando información de la tabla...", true)}
                    </td>
                </tr>
            );
        }

        if (isEmpty(this.state.lista)) {
            return (
                <tr className="text-center">
                    <td colSpan="7">¡No hay datos registrados!</td>
                </tr>
            );
        }

        return this.state.lista.map((item, index) => {
            return (
                <tr key={index}>
                    <td className="text-center">{item.id}</td>
                    <td>{item.codigo}<br /><b>{item.producto}</b></td>
                    <td>{item.almacen}</td>
                    <td>{item.cantidadMinima} {item.medida}</td>
                    <td>{item.cantidadMaxima} {item.medida}</td>
                    <td>{rounded(item.cantidad)} {item.medida}</td>
                    <td>{formatDecimal(item.costo)}</td>
                </tr>
            )
        })
    }

    render() {
        return (
            <ContainerWrapper>
                
                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Inventario <small className="text-secondary">INICIAL</small></h5>
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
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ingrese metodo de ajuste..."
                                    ref={this.refTxtSearch}
                                    onKeyUp={(event) => keyUpSearch(event, () => this.searchText(event.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3 col-sm-12">
                        <div className="form-group">                            
                            <button className="btn btn-outline-secondary" onClick={() => this.loadInit()}>
                                <i className="bi bi-arrow-clockwise"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-4 col-sm-12">
                        <label>Total de productos: </label>
                    </div>
                    <div className="col-md-4 col-sm-12">
                        <label>Total de servicios: </label>
                    </div>
                    <div className="col-md-4 col-sm-12">
                        <label>Total de combos: </label>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-4 col-sm-12 text-success">
                        <label>Total de servicios: </label>
                    </div>
                    <div className="col-md-4 col-sm-12 text-success">
                        <label>Total de servicios: </label>
                    </div>
                    <div className="col-md-4 col-sm-12 text-success">
                        <label>Total de servicios: </label>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered rounded">
                                <thead>
                                    <tr>
                                        <th width="5%" className="text-center">#</th>
                                        <th width="35%">Producto</th>
                                        <th width="15%">Almacen</th>
                                        <th width="10%">Stock Mín.</th>
                                        <th width="10%">Stock Máx.</th>
                                        <th width="15%">Cantidad Actual</th>
                                        <th width="10%">Costo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.generarBody()}
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
export default connect(mapStateToProps, null)(Inventario);