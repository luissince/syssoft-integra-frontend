import React from 'react';
import {
    spinnerLoading,
    isEmpty,
    formatTime,
    rounded,
    formatDecimal
} from '../../../../helper/utils.helper';
import ContainerWrapper from "../../../../components/Container";
import CustomComponent from "../../../../model/class/custom-component";
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { listKardex, listarProductosFilter } from '../../../../network/rest/principal.network';
import { connect } from 'react-redux';
import SearchInput from '../../../../components/SearchInput';

class Kardex extends CustomComponent {

    constructor(props) {
        super(props);

        this.state = {
            producto: null,
            cantidad: 0,
            costo: 0,
            filtrar: '',
            productos: [],
            loadingProducto: false,

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

        this.refProducto = React.createRef();

        this.selectItemProducto = false;
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    async fetchListarKardex(params) {
        const response = await listKardex(params);

        if (response instanceof SuccessReponse) {
            return response.data;
        }

        if (response instanceof ErrorResponse) {
            return [];
        }
    }

    async fetchFiltrarProducto(params) {
        const response = await listarProductosFilter(params);

        if (response instanceof SuccessReponse) {
            return response.data;
        }

        if (response instanceof ErrorResponse) {
            return [];
        }
    }

    //------------------------------------------------------------------------------------------
    // Filtrar producto
    //------------------------------------------------------------------------------------------

    handleClearInputProducto = async () => {
        await this.setStateAsync({ productos: [], filtrar: "", producto: null });
        this.selectItemProducto = false;
    }

    handleFilterProducto = async (event) => {
        const searchWord = this.selectItemProducto ? "" : event.target.value;
        await this.setStateAsync({ producto: null, filtrar: searchWord });

        this.selectItemProducto = false;
        if (searchWord.length === 0) {
            await this.setStateAsync({ productos: [] });
            return;
        }

        if (this.state.loadingProducto) return;

        await this.setStateAsync({ loadingProducto: true });

        const params = {
            filtrar: searchWord,
        }

        const productos = await this.fetchFiltrarProducto(params);

        await this.setStateAsync({ loadingProducto: false, productos });
    }

    handleSelectItemProducto = async (value) => {
        await this.setStateAsync({
            producto: value,
            filtrar: value.nombreProducto,
            productos: [],
        });
        this.selectItemProducto = true;

        const params = {
            idProducto: value.idProducto,
        }

        this.setState({
            loading: true,
            lista: [],
            messageTable: "Cargando información...",
        })

        const kardex = await this.fetchListarKardex(params);

        const cantidad = kardex.reduce((accumlate, item) => {
            accumlate += item.tipo === "INGRESO" ? parseFloat(item.cantidad) : -parseFloat(item.cantidad);
            return accumlate;
        }, 0);

        const costo = kardex.reduce((accumlate, item) => {
            accumlate += item.tipo === "INGRESO" ? parseFloat(item.costo * item.cantidad) : -parseFloat(item.costo * item.cantidad);
            return accumlate;
        }, 0);

        this.setState({
            lista: kardex,
            cantidad: cantidad,
            costo: costo,
            loading: false,
        });
    }

    bodyTable() {
        const { loading, lista, messageTable } = this.state;

        if (loading) {
            return (
                <tr>
                    <td className="text-center" colSpan="12">
                        {spinnerLoading(messageTable, true)}
                    </td>
                </tr>
            );
        }

        if (isEmpty(lista)) {
            return (
                <tr className="text-center">
                    <td colSpan="12">¡No hay datos para mostrar!</td>
                </tr>
            );
        }

        let cantidad = 0;
        let costo = 0;

        return lista.map((item, index) => {

            cantidad = cantidad + (item.tipo === "INGRESO" ? parseFloat(item.cantidad) : -parseFloat(item.cantidad));
            costo = costo + (item.tipo === "INGRESO" ? parseFloat(item.costo * item.cantidad) : -parseFloat(item.costo * item.cantidad));

            return (
                <tr key={index}>
                    <td>{++index}</td>
                    <td>
                        {item.fecha}
                        <br />
                        {formatTime(item.hora)}
                    </td>
                    <td>{item.detalle}</td>

                    <td className='bg-success text-white'>{item.tipo === "INGRESO" ? "+" + rounded(item.cantidad) : ""}</td>
                    <td className='bg-danger text-white'>{item.tipo === "SALIDA" ? "-" + rounded(item.cantidad) : ""}</td>
                    <td className='font-weight-bold'>{rounded(cantidad)}</td>
                    <td>{"S/ " + rounded(item.costo)}</td>

                    <td>{item.tipo === "INGRESO" ? "+" + rounded(item.costo * item.cantidad) : ""}</td>
                    <td>{item.tipo === "SALIDA" ? "-" + rounded(item.costo * item.cantidad) : ""}</td>
                    <td>{"S/ " + rounded(costo)}</td>

                    <td>{item.almacen}</td>
                    <td>{item.apellidos}{<br />}{item.nombres}</td>
                </tr>
            )
        })
    }

    render() {

        const { producto, cantidad, costo } = this.state;

        return (
            <ContainerWrapper>

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Kardex <small className="text-secondary">LISTA</small></h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <SearchInput
                            placeholder="Filtrar productos..."
                            refValue={this.refProducto}
                            value={this.state.filtrar}
                            data={this.state.productos}
                            handleClearInput={this.handleClearInputProducto}
                            handleFilter={this.handleFilterProducto}
                            handleSelectItem={this.handleSelectItemProducto}
                            renderItem={(value) => (
                                <>
                                    {value.nombreProducto} / <small>{value.categoria}</small>
                                </>
                            )}
                        />
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col">
                        <h5>Información del Producto</h5>
                        <p><strong>Nombre del Producto:</strong> {producto && producto.nombreProducto}</p>
                        <p><strong>Cantidad Actual:</strong>  {cantidad} {producto && producto.medida}</p>
                        <p><strong>Valor del Producto:</strong> S/ {formatDecimal(costo)}</p>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <div className="table-responsive">
                            <table className="table table-bordered rounded">
                                <thead>
                                    <tr>
                                        <th scope="col" rowSpan={2} colSpan={1} width="5%" className="text-center">#</th>
                                        <th scope="col" rowSpan={2} colSpan={1} width="10%">Fecha</th>
                                        <th scope="col" rowSpan={2} colSpan={1} width="30%">Detalle</th>
                                        <th scope="col" rowSpan={1} colSpan={3} width="25%">Unidades</th>
                                        <th scope="col" rowSpan={2} colSpan={1} width="15%">Cambios <br /> Costo</th>
                                        <th scope="col" rowSpan={1} colSpan={3} width="25%" className="text-center">Valores</th>
                                        <th scope="col" rowSpan={2} colSpan={1} width="10%" className="text-center">Almacen</th>
                                        <th scope="col" rowSpan={2} colSpan={1} width="10%" className="text-center">Usuario</th>
                                    </tr>
                                    <tr>
                                        <th>Ingreso</th>
                                        <th>Salida</th>
                                        <th>Existencia</th>

                                        <th>Debe</th>
                                        <th>Haber</th>
                                        <th>Saldo</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {this.bodyTable()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/*
                                    <Paginacion
                                        loading={this.state.loading}
                                        totalPaginacion={this.state.totalPaginacion}
                                        paginacion={this.state.paginacion}
                                        fillTable={() => { }}
                                        restart={this.state.restart}
                                    />
                            */}

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
export default connect(mapStateToProps, null)(Kardex);