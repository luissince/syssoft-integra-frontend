import React from 'react';
import axios from 'axios';
import loading from '../../recursos/images/loading.gif';
import { showModal, hideModal, viewModal, clearModal } from '../tools/Tools';

class Manzanas extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            idManzana: '',
            nombre: '',
            idProyecto: 'PR0001',

            loading: true,
            lista: [],
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messagePaginacion: ''
        };

        this.refNombre = React.createRef();
        console.log("ingreso")
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    async componentDidMount() {
        this.fillTableManzana(1);

        viewModal("modalManzana", () => {
            this.refNombre.current.focus();
        });

        clearModal("modalManzana", () => {
            this.closeModal();
        });
    }

    fillTableManzana = async (paginacion) => {
        try {
            await this.setStateAsync({ loading: true, paginacion: paginacion, lista: [] });
            const result = await axios.get('/api/manzana/list', {
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
            console.log(err.response.data.message)
            console.log(err.response.status)
        }
    }

    openModalManzana(id) {
        if (id === undefined) {
            showModal('modalManzana');
        } else {
            showModal('modalManzana');
            this.loadDataId(id);
        }
    }

    async loadDataId(id) {
        try {
            let result = await axios.get('/api/manzana/id', {
                params: {
                    "idManzana": id
                }
            });
            this.setStateAsync({
                idManzana: result.data.idManzana,
                nombre: result.data.nombre
            });
            console.log(result)
        } catch (error) {
            console.log(error)
        }
    }

    async saveManzana() {
        if (this.state.nombre === "") {
            this.refNombre.current.focus();
        } else {
            try {

                if (this.state.idManzana === "") {
                    let result = await axios.post("/api/manzana/add", {
                        "nombre": this.state.nombre,
                        "idProyecto": this.state.idProyecto
                    });
                    hideModal("modalManzana");
                    console.log(result)
                } else {
                    let result = await axios.post("/api/manzana/edit", {
                        "idManzana": this.state.idManzana,
                        "nombre": this.state.nombre,
                        "idProyecto": this.state.idProyecto
                    });
                    hideModal("modalManzana");
                    console.log(result)
                }
            } catch (error) {
                console.log(error.response)
            }
        }
    }

    async closeModal() {
        hideModal("modalManzana");
        await this.setStateAsync({
            idManzana: '',
            nombre: '',
        });
    }

    render() {

        return (
            <>
                {/* Inicio modal nuevo cliente*/}
                <div className="modal fade" id="modalManzana" tabIndex="-1" aria-labelledby="modalManzanaLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title"><i className="bi bi-house-door"></i> Registrar Manzana</h5>
                                <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className='row py-1'>
                                    <div className='col-lg-4 col-md-4 col-sm-12 col-xs-12'>
                                        <label>Nombre Manzana: </label>
                                    </div>
                                    <div className='col-lg-8 col-md-8 col-sm-12 col-xs-12'>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder='Ingrese el nombre de la manzana'
                                            ref={this.refNombre}
                                            value={this.state.nombre}
                                            onChange={(event) => this.setState({ nombre: event.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => this.saveManzana()}>Aceptar</button>
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* fin modal nuevo cliente*/}

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Manzanas <small className="text-secondary">LISTA</small></h5>
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
                                <input type="search" className="form-control" placeholder="Buscar..." />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            <button className="btn btn-outline-info" onClick={() => this.openModalManzana()}>
                                <i className="bi bi-file-plus"></i> Nuevo Registro
                            </button>
                            {" "}
                            <button className="btn btn-outline-secondary" >
                                <i className="bi bi-arrow-clockwise"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="table-responsive">
                            <table className="table table-striped" style={{ borderWidth: '1px', borderStyle: 'inset', borderColor: '#CFA7C9' }}>
                                <thead>
                                    <tr>
                                        <th width="5%">#</th>
                                        <th width="15%">Manzana</th>
                                        <th width="25%">Nombre de Proyecto</th>
                                        <th width="5%">Editar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.loading ? (
                                            <tr>
                                                <td className="text-center" colSpan="4">
                                                    <img
                                                        src={loading}
                                                        alt="Loading..."
                                                        width="34"
                                                        height="34"
                                                    />
                                                    <p>Cargando información...</p>
                                                </td>
                                            </tr>
                                        ) : this.state.lista.length === 0 ? (
                                            <tr className="text-center">
                                                <td colSpan="4">¡No hay datos registrados!</td>
                                            </tr>
                                        ) : (
                                            this.state.lista.map((item, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td>{item.id}</td>
                                                        <td>{item.nombre}</td>
                                                        <td>{item.idProyecto}</td>
                                                        <td>
                                                            <button className="btn btn-outline-dark btn-sm" title="Editar" onClick={() => this.openModalManzana(item.idManzana)}><i className="bi bi-pencil"></i></button>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )
                                    }
                                </tbody>
                            </table>
                        </div>
                        <div className="col-md-12 " style={{ textAlign: 'center' }}>
                            <nav aria-label="...">
                                <ul className="pagination justify-content-end">
                                    <li className="page-item disabled">
                                        <a className="page-link">Previous</a>
                                    </li>
                                    <li className="page-item"><a className="page-link" href="#">1</a></li>
                                    <li className="page-item active" aria-current="page"><a className="page-link" href="#">2</a></li>
                                    <li className="page-item"><a className="page-link" href="#">3</a></li>
                                    <li className="page-item">
                                        <a className="page-link" href="#">Next</a>
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

export default Manzanas;