import React from 'react';
import ContainerWrapper from '../../../../components/Container';
import CustomComponent from '../../../../model/class/custom-component';
import { alertDialog } from '../../../../helper/utils.helper';

class Compras extends CustomComponent {


    constructor(props) {
        super(props)

        this.state = {

        }
    }

    handleCrear = () => {
        this.props.history.push({
            pathname: `${this.props.location.pathname}/crear`
        })
    }

    handleEditar = (idCompra) => {
        this.props.history.push({
            pathname: `${this.props.location.pathname}/editar`,
            search: "?idCompra=" + idCompra
        })
    }

    handleDetalle = (idCompra) => {
        this.props.history.push({
            pathname: `${this.props.location.pathname}/detalle`,
            search: "?idCompra=" + idCompra
        })
    }

    handleEliminar = () => {
        alertDialog("Compra", "¿Estás seguro de eliminar la compra?", async (event) => {
            if (event) {

            }
        });
    }

    handleAnular = () => {
        alertDialog("Compra", "¿Estás seguro de anular la compra?", async (event) => {
            if (event) {

            }
        });
    }

    render() {
        return (
            <ContainerWrapper>

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-12'>
                        <div className="form-group">
                            <h5> Compras <small className='text-secondary'> Lista </small> </h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            <div className="input-group mb-2">
                                <div className="input-group-prepend">
                                    <div className="input-group-text">
                                        <i className="bi bi-search"></i>
                                    </div>
                                </div>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            <button
                                className="btn btn-outline-info"
                                onClick={this.handleCrear}
                            >
                                <i className="bi bi-file-plus"></i> Crear compra
                            </button>{" "}

                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => { }}
                            >
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
                                        <th width="5%" className="text-center"> #</th>
                                        <th width="10%">Fecha</th>
                                        <th width="15%">Proveedor</th>
                                        <th width="5%" className="text-center">
                                            Mostrar
                                        </th>
                                        <th width="5%" className="text-center">
                                            Anular
                                        </th>
                                        <th width="5%" className="text-center">
                                            Eliminar
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr >
                                        <td className="text-center">1</td>
                                        <td>ss</td>
                                        <td>ss</td>
                                        <td className="text-center">
                                            <button
                                                className="btn btn-outline-info btn-sm"
                                                title="Detalle"
                                                onClick={() => this.handleDetalle("")}
                                            >
                                                <i className="fa fa-eye"></i>
                                            </button>
                                        </td>

                                        <td className="text-center">
                                            <button
                                                className="btn btn-outline-warning btn-sm"
                                                title="Editar"
                                                onClick={() => this.handleAnular("")}
                                            >
                                               <i className="bi bi-slash-circle"></i>
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

            </ContainerWrapper>
        );
    }
}

export default Compras;