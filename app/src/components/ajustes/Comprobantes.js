import React from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import loading from "../../recursos/images/loading.gif";
import { keyNumberInteger, timeForma24, showModal, hideModal, clearModal } from '../tools/Tools';
import Paginacion from '../tools/Paginacion';

class Comprobantes extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            idComprobante: '',
            nombre: '',
            serie: '',
            numeracion: '',
            impresion: '',
            estado: true,
            idUsuario: 0,

            loading: false,
            lista: [],

            opcion: 0,
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 5,
            messagePaginacion: 'Mostranto 0 de 0 Páginas'
        }
        this.refNombre = React.createRef();
        this.refSerie = React.createRef();
        this.refNumeracion = React.createRef();
    }


    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    async componentDidMount() {
        this.loadInitComprobantes();

        clearModal("modalComprobante", async () => {
            await this.setStateAsync({
                idComprobante: '',
                nombre: '',
                serie: '',
                numeracion: '',
                impresion: '',
                estado: true,
                idUsuario: '',
            });
        });

    }

    loadInitComprobantes = async () => {
        if (!this.state.loading) {
            await this.setStateAsync({ paginacion: 1 });
            this.fillTableComprobante();
            await this.setStateAsync({ opcion: 0 });
        }
    }

    paginacionContext = async (listid) => {
        await this.setStateAsync({ paginacion: listid });
        this.fillTableComprobante();
    }

    fillTableComprobante = async () => {
        try {
            await this.setStateAsync({ loading: true, lista: [], messagePaginacion: "Mostranto 0 de 0 Páginas" });

            const result = await axios.get('/api/comprobante/list', {
                params: {
                    "posicionPagina": ((this.state.paginacion - 1) * this.state.filasPorPagina),
                    "filasPorPagina": this.state.filasPorPagina
                }
            });

            let totalPaginacion = parseInt(Math.ceil((parseFloat(result.data.total) / this.state.filasPorPagina)));
            let messagePaginacion = `Mostrando ${result.data.result.length} de ${totalPaginacion} Páginas`;
            this.setState({
                loading: false,
                lista: result.data.result,
                totalPaginacion: totalPaginacion,
                messagePaginacion: messagePaginacion
            });
        } catch (err) {
            this.setState({
                loading: false,
                lista: [],
                totalPaginacion: 0,
                messagePaginacion: "Mostranto 0 de 0 Páginas",
            });
        }
    }

    onEventPaginacion = async (listid) => {
        switch (this.state.opcion) {

        }
    }

    openModal = (id) => {
        if (id === '') {
            showModal('modalComprobante')
        } else {
            showModal('modalComprobante')
            this.loadDataId(id);
        }
    }

    loadDataId = async (id) => {
        try {
            const result = await axios.get("/api/comprobante/id", {
                params: {
                    idComprobante: id
                }
            });

            this.setState({
                idComprobante: result.data.idComprobante,
                nombre: result.data.nombre,
                serie: result.data.serie,
                numeracion: result.data.numeracion,
                impresion: result.data.impresion,
                estado: result.data.estado === 1 ? true : false
            });

        } catch (error) {
            console.log(error.response)
        }
    }


    async onEventGuardar() {
        if (this.state.nombre === "") {
            this.refNombre.current.focus()
        } else if (this.state.serie === "") {
            this.refSerie.current.focus()
        } else if (this.state.numeracion === "") {
            this.refNumeracion.current.focus()
        } else {
            if (this.state.idComprobante !== "") {
                try {
                    const result = await axios.post('/api/comprobante/edit', {
                        "idComprobante": this.state.idComprobante,
                        "nombre": this.state.nombre.trim().toUpperCase(),
                        "serie": this.state.serie.trim().toUpperCase(),
                        "numeracion": this.state.numeracion,
                        "impresion": this.state.impresion.trim(),
                        "estado": this.state.estado,
                        "idUsuario": this.state.idUsuario
                    });
                    console.log(result);
                } catch (err) {
                    console.log(err.response)
                }
            } else {
                try {
                    const result = await axios.post('/api/comprobante/add', {
                        "nombre": this.state.nombre.trim().toUpperCase(),
                        "serie": this.state.serie.trim().toUpperCase(),
                        "numeracion": this.state.numeracion,
                        "impresion": this.state.impresion.trim(),
                        "estado": this.state.estado,
                        "idUsuario": this.state.idUsuario
                    });
                    console.log(result);
                } catch (err) {
                    console.log(err.response)
                }
            }

        }
    }

    render() {
        return (
            <>
                {/* inicio modal */}
                <div className="modal fade" id="modalComprobante" data-bs-keyboard="false" data-bs-backdrop="static">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Nuevo Comprobante</h5>
                                <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
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
                                        value={this.state.impresion}
                                        onChange={(event) => this.setState({ impresion: event.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <div className="custom-control custom-switch">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            id="switch1"
                                            checked={this.state.estado}
                                            onChange={(value) => this.setState({ estado: value.target.checked })} />
                                        <label className="custom-control-label" htmlFor="switch1">Activo o Inactivo</label>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => this.onEventGuardar()}>Guardar</button>
                                <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* fin modal */}

                <div className="row">
                    <div className="col-md-12">
                        <div className="form-group">
                            <h5>Comprobantes <small className="text-secondary">LISTA</small></h5>
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
                            <button className="btn btn-outline-info" onClick={() => this.openModal('')}>
                                <i className="bi bi-file-plus"></i> Nuevo Registro
                            </button>
                            {" "}
                            <button className="btn btn-outline-secondary" onClick={() => this.loadInitComprobantes()}>
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
                                        <th width="5%" scope="col">#</th>
                                        <th width="20%" scope="col">Nombre</th>
                                        <th width="15%" scope="col">Serie</th>
                                        <th width="15%" scope="col">Numeración</th>
                                        <th width="15%" scope="col">Creación</th>
                                        <th width="10%" scope="col">Estado</th>
                                        <th width="5%" scope="col">Edición</th>
                                        <th width="5%" scope="col">Anular</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.loading ? (
                                            <tr>
                                                <td className="text-center" colSpan="8">
                                                    <img
                                                        src={loading}
                                                        width="34"
                                                        height="34"
                                                        alt="Loading..."
                                                    />
                                                    <p>Cargando información...</p>
                                                </td>
                                            </tr>
                                        ) : this.state.lista.length === 0 ? (
                                            <tr>
                                                <td className="text-center" colSpan="8">¡No hay comprobantes registrados!</td>
                                            </tr>
                                        ) :
                                            this.state.lista.map((item, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td>{item.id}</td>
                                                        <td>{item.nombre}</td>
                                                        <td>{item.serie}</td>
                                                        <td>{item.numeracion}</td>
                                                        <td>{<span>{item.fecha}</span>}{<br></br>}{<span>{timeForma24(item.hora)}</span>}</td>
                                                        <td className="text-center"><div className={`badge ${item.estado === 1 ? "badge-info" : "badge-danger"}`}>{item.estado === 1 ? "ACTIVO" : "INACTIVO"}</div></td>
                                                        <td><button className="btn btn-outline-dark btn-sm" onClick={() => this.openModal(item.idComprobante)}><i className="bi bi-pencil"></i> Editar</button></td>
                                                        <td><button className="btn btn-outline-danger btn-sm"><i className="bi bi-trash"></i> Anular</button></td>
                                                    </tr>
                                                )
                                            })
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-sm-12 col-md-5">
                        <div className="dataTables_info mt-2" role="status" aria-live="polite">{this.state.messagePaginacion}</div>
                    </div>
                    <div className="col-sm-12 col-md-7">
                        <div className="dataTables_paginate paging_simple_numbers">
                            <nav aria-label="Page navigation example">
                                <ul className="pagination justify-content-end">
                                    <Paginacion
                                        totalPaginacion={this.state.totalPaginacion}
                                        paginacion={this.state.paginacion}
                                        fillTable={this.paginacionContext}
                                    />
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


export default connect(mapStateToProps, null)(Comprobantes);