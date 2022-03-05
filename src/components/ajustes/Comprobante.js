import React from 'react';
import { connect } from 'react-redux';
import { keyNumberInteger } from '../tools/Tools';
const axios = require('axios').default;

class Comprobante extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            idComprobante: '',
            nombre: '',
            serie: '',
            numeracion: 0,
            impresion: '',
            estado: true,
            idUsuario: '',
        }
        this.refNombre = React.createRef();
        this.refSerie = React.createRef();
        this.refNumeracion = React.createRef();

        console.log("Comprobante constructor");
        console.log(props);
    }

    async componentDidMount() {
        console.log("Comprobante componentDidMount");


        // try {
        //     const result = await axios.get('/api/comprobante', {
        //         params: {
        //             name: 'Sherlock',
        //             apellido: 'Jackson'
        //         }
        //     });
        //     console.log(result);
        // } catch (err) {
        //     console.log(err)
        // }


    }

    onEventGuardar = async () => {
        if (this.state.nombre === "") {
            this.refNombre.current.focus()
        } else if (this.state.serie === "") {
            this.refSerie.current.focus()
        } else if (this.state.numeracion === "") {
            this.refNumeracion.current.focus()
        } else {
            try {
                const result = await axios.post('/api/comprobante', {
                    nombre: this.state.nombre.trim(),
                    serie: this.state.serie.trim(),
                    numeracion: this.state.numeracion,
                    impresion: this.state.impresion.trim(),
                    estado: this.state.estado,
                    idUsuario: this.state.idUsuario,
                });
                console.log(result);
            } catch (err) {
                console.log(err.response)
            }
        }
    }

    render() {
        return (
            <>
                <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Nuevo Comprobante</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="nombre" className="col-form-label">Nombre:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="nombre"
                                        ref={this.refNombre}
                                        value={this.state.nombre}
                                        onChange={(event) => this.setState({ nombre: event.target.value })} />
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="serie">Serie:</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="serie"
                                            ref={this.refSerie}
                                            value={this.state.serie}
                                            onChange={(event) => this.setState({ serie: event.target.value })} />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label htmlFor="numeracion">Numeración:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="numeracion"
                                            ref={this.refNumeracion}
                                            value={this.state.numeracion}
                                            onChange={(event) => this.setState({ numeracion: event.target.value })}
                                            onKeyPress={keyNumberInteger} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="impresion" className="col-form-label">Nombre de Impresión:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="impresion"
                                        alue={this.state.impresion}
                                        onChange={(event) => this.setState({ impresion: event.target.value })} />
                                </div>

                                <div className="form-group">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="estado"
                                            checked={this.state.estado}
                                            onChange={(value) => this.setState({ estado: value.target.checked })} />
                                        <label className="form-check-label" htmlFor="estado">
                                            Habilitado
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={this.onEventGuardar}>Guardar</button>
                                <button type="button" className="btn btn-danger" data-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <div className="form-group">
                            <h5>Comprobantes de pago <small>LISTA</small></h5>
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
                                <input type="text" className="form-control" placeholder="Buscar..." />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            <button className="btn btn-outline-info" data-toggle="modal" data-target="#exampleModal">
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
                    <div className="col-md-12 col-sm-12">
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered rounded">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Nombre</th>
                                        <th scope="col">Serie</th>
                                        <th scope="col">Numeración</th>
                                        <th scope="col">Creación</th>
                                        <th scope="col">Estado</th>
                                        <th scope="col">Edición</th>
                                        <th scope="col">Anular</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>Mark</td>
                                        <td>Otto</td>
                                        <td>@mdo</td>
                                        <td>@mdo</td>
                                        <td>@mdo</td>
                                        <td>@mdo</td>
                                        <td>@mdo</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-sm-12 col-md-5">
                        <div className="dataTables_info mt-2" role="status" aria-live="polite">Showing 51 to 57 of 57 entries</div>
                    </div>
                    <div className="col-sm-12 col-md-7">
                        <div className="dataTables_paginate paging_simple_numbers">
                            <nav aria-label="Page navigation example">
                                <ul className="pagination justify-content-end">
                                    <li className="page-item disabled">
                                        <button className="page-link"><i className="bi bi-arrow-left"></i></button>
                                    </li>
                                    <li className="page-item"><button className="page-link" >1</button></li>
                                    <li className="page-item active" aria-current="page">
                                        <span className="page-link">2</span>
                                    </li>
                                    <li className="page-item"><button className="page-link">3</button></li>
                                    <li className="page-item">
                                        <button className="page-link"><i className="bi bi-arrow-right"></i></button>
                                    </li>
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


export default connect(mapStateToProps, null)(Comprobante);