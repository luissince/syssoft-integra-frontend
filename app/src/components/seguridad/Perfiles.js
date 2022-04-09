import React from 'react';
// import { Redirect } from 'react-router-dom';
// import { connect } from 'react-redux';
// import { signOut } from '../../redux/actions';
import axios from 'axios';
import loading from '../../recursos/images/loading.gif';
import { showModal, hideModal, clearModal } from '../tools/Tools';

class Perfiles extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idPerfil: '',
            descripcion: '',
            empresa: '',

            loading: true,
            lista: [],
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messagePaginacion: '',

            messageWarning: ''
        }

        this.refDescripcion = React.createRef();
        this.refEmpresa = React.createRef();
    }

    async componentDidMount() {
        this.fillTable(0, 1, "");

        clearModal("modalPerfil", () => {
            this.setState({
                empresa: '',
                descripcion: '',
                idPerfil: '',
                messageWarning: ''
            })
        })
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    fillTable = async (option, paginacion, buscar) => {
        // console.log(buscar.trim().toUpperCase())
        try {
            await this.setStateAsync({ loading: true, paginacion: paginacion, lista: [] });
            const result = await axios.get('/api/perfil/list', {
                params: {
                    "option": option,
                    "buscar": buscar.trim().toUpperCase(),
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
            // console.log(result);
        } catch (err) {
            console.log(err.response.data.message)
            console.log(err.response.status)
        }
    }

    loadDataId = async (id) => {
        try {
            const result = await axios.get("/api/perfil/id", {
                params: {
                    idPerfil: id
                }
            });
            // console.log(result)
            this.setState({
                descripcion: result.data.descripcion,
                empresa: result.data.empresa,
                idPerfil: result.data.idPerfil
            });

        } catch (error) {
            console.log(error.response)
        }
    }

    async save() {
        if (this.state.empresa === "") {
            this.setState({ messageWarning: "Ingrese el nombre de la empresa" });
            this.refEmpresa.current.focus();
        } else if (this.state.descripcion === "") {
            this.setState({ messageWarning: "Ingrese una descripción de perfil" });
            this.refDescripcion.current.focus();
        } else {
            try {

                let result = null
                if (this.state.idPerfil !== '') {
                    result = await axios.post('/api/perfil/update', {
                        "descripcion": this.state.descripcion.trim().toUpperCase(),
                        "empresa": this.state.empresa.trim().toUpperCase(),
                        "idPerfil": this.state.idPerfil
                    })
                    // console.log(result);

                } else {
                    result = await axios.post('/api/perfil/add', {
                        "descripcion": this.state.descripcion.trim().toUpperCase(),
                        "empresa": this.state.empresa.trim().toUpperCase(),
                    });
                    // console.log(result);
                }

                // console.log(result);
                this.closeModal()

            } catch (error) {
                console.log(error)
                console.log(error.response)
            }
        }
    }

    openModal(id) {
        if (id === '') {
            showModal('modalPerfil')
            this.refEmpresa.current.focus();
        }
        else {
            showModal('modalPerfil')
            this.loadDataId(id)
        }
    }

    closeModal() {
        hideModal('modalPerfil')
        this.setState({
            empresa: '',
            descripcion: '',
            idPerfil: '',
            messageWarning: ''
        })
    }

    render() {
        return (
            <>
                {/* Inicio modal */}
                <div className="modal fade" id="modalPerfil" tabIndex="-1" aria-labelledby="modalPerfilLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title"><i className="bi bi-currency-exchange"></i>{this.state.idPerfil === '' ? " Registrar Perfil" : " Editar Perfil"}</h5>
                                <button type="button" className="close" data-dismiss="modal" onClick={() => this.closeModal()}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {
                                    this.state.messageWarning === '' ? null :
                                        <div className="alert alert-warning" role="alert">
                                            <i className="bi bi-exclamation-diamond-fill"></i> {this.state.messageWarning}
                                        </div>
                                }
                                <div className='row py-1'>
                                    <div className='col-lg-4 col-md-4 col-sm-12 col-xs-12'>
                                        <label>Empresa: </label>
                                    </div>
                                    <div className='col-lg-8 col-md-8 col-sm-12 col-xs-12'>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={this.state.empresa}
                                            ref={this.refEmpresa}
                                            onChange={(event) => this.setState({ empresa: event.target.value })}
                                            placeholder='Ingrese la empresa' />
                                        {/* <select className="form-control" id="empresas">
                                            <option>-- seleccione --</option>
                                            <option>seleccion primera</option>
                                            <option>seleccion segunda</option>
                                        </select> */}
                                    </div>
                                </div>
                                <div className='row py-1'>
                                    <div className='col-lg-4 col-md-4 col-sm-12 col-xs-12'>
                                        <label>Descripción: </label>
                                    </div>
                                    <div className='col-lg-8 col-md-8 col-sm-12 col-xs-12'>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={this.state.descripcion}
                                            ref={this.refDescripcion}
                                            onChange={(event) => this.setState({ descripcion: event.target.value })}
                                            placeholder='Ingrese la descripción' />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => this.save()}>Aceptar</button>
                                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => this.closeModal()}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* fin modal */}

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Perfiles <small className="text-secondary">LISTA</small></h5>
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
                                <input type="search" className="form-control" placeholder="Buscar..." onKeyUp={(event) => console.log(event.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            <button className="btn btn-outline-info" onClick={() => this.openModal(this.state.idPerfil)}>
                                <i className="bi bi-file-plus"></i> Nuevo Registro
                            </button>
                            {" "}
                            <button className="btn btn-outline-secondary" onClick={() => this.fillTable(0, 1, "")}>
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
                                        <th width="30%">Descripción</th>
                                        <th width="30%">Empresa</th>
                                        <th width="20%">Creación</th>
                                        <th width="15%">Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.loading ? (
                                            <tr>
                                                <td className="text-center" colSpan="5">
                                                    <img
                                                        src={loading}
                                                        id="imgLoad"
                                                        width="34"
                                                        height="34"
                                                        alt="Loader"
                                                    />
                                                    <p>Cargando información...</p>
                                                </td>
                                            </tr>
                                        ) : this.state.lista.length === 0 ? (
                                            <tr className="text-center">
                                                <td colSpan="5">¡No hay datos registrados!</td>
                                            </tr>
                                        ) : (
                                            this.state.lista.map((item, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td>{item.id}</td>
                                                        <td>{item.descripcion}</td>
                                                        <td>{item.empresa}</td>
                                                        <td><small>{item.fechaRegistro}</small></td>
                                                        <td>
                                                            <button className="btn btn-outline-dark btn-sm" title="Editar" onClick={() => this.openModal(item.idPerfil)}><i className="bi bi-pencil"></i></button>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )
                                    }
                                </tbody>

                            </table>
                        </div>
                        <div className="col-md-12" style={{ textAlign: 'center' }}>
                            <nav aria-label="...">
                                <ul className="pagination justify-content-end">
                                    <li className="page-item disabled">
                                        <a className="page-link">Previous</a>
                                    </li>
                                    <li className="page-item"><a className="page-link" href="#">1</a></li>
                                    <li className="page-item active" aria-current="page">
                                        <a className="page-link" href="#">2</a>
                                    </li>
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

export default Perfiles;