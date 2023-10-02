import ContainerWrapper from "../../../../components/Container";
import Paginacion from "../../../../components/Paginacion";
import { keyUpSearch } from "../../../../helper/utils.helper";
import CustomComponent from "../../../../model/class/custom-component";

class Almacenes extends CustomComponent {

    constructor(props) {
        super(props);
    }


    componentDidMount() {

    }

    componentWillUnmount() {

    }


    /**
     * Esta es una función se encarga de navegar a la vista para agregar un almacen
     *
     * @returns {void}
     *
     * @example
     * handleAgregar();
     */
    handleAgregar = () => {
        this.props.history.push({
            pathname: `${this.props.location.pathname}/agregar`,
        })
    }

    /**
     * Esta es una función se encarga de navegar a la vista para editar almacen
     *
     * @param {string} idProducto - Id del almacen
     * @returns {void}
     *
     * @example
     * handleEditar('AL0001');
     */
    handleEditar = (idAlmacen) => {
        this.props.history.push({
            pathname: `${this.props.location.pathname}/editar`,
            search: "?idAlmacen=" + idAlmacen
        })
    }

    /**
     * Esta es una función se encarga de borrar un almacen
     *
     * @param {string} idProducto - Id de producto
     * @returns {void}
     *
     * @example
     * handleEliminar('AL0001');
     */
    handleEliminar = (idAlmacen) => {

    }

    render() {
        return (
            <ContainerWrapper>

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Almacenes <small className="text-secondary">LISTA</small></h5>
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
                                    placeholder="Buscar..."
                                    ref={this.refTxtSearch}
                                    onKeyUp={(event) => keyUpSearch(event, () => { })}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            <button className="btn btn-outline-info"
                                onClick={this.handleAgregar}>
                                <i className="bi bi-file-plus"></i> Nuevo Registro
                            </button>
                            {" "}
                            <button className="btn btn-outline-secondary">
                                <i className="bi bi-arrow-clockwise"></i>
                            </button>
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
                                        <th width="15%">Nombre</th>
                                        <th width="25%">Dirección</th>
                                        <th width="20%">Distrito</th>
                                        <th width="20%">Código Sunat</th>
                                        <th width="5%" className="text-center">Editar</th>
                                        <th width="5%" className="text-center">Eliminar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr >
                                        <td className="text-center"></td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td className="text-center">
                                            <button
                                                className="btn btn-outline-warning btn-sm"
                                                title="Editar"
                                                onClick={() => this.handleEditar("")}
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                        </td>
                                        <td className="text-center">
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                title="Anular"
                                                onClick={() => this.handleEliminar("")}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
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

            </ContainerWrapper>
        );
    }

}

export default Almacenes;