import React from 'react';
import axios from 'axios';
import loading from '../../recursos/images/loading.gif';
import { showModal, hideModal } from '../tools/Tools';

class Monedas extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idMoneda: '',
            txtNombre: '',
            txtCodIso: '',
            txtSimbolo: '',
            ckEstado: true,

            loading: true,
            lista: [],
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messagePaginacion: ''

        }

        this.refTxtNombre = React.createRef()
        this.refTxtCodIso = React.createRef()
        this.refTxtSimbolo = React.createRef()
        this.refCkEstado = React.createRef()

        this.refTxtSearch = React.createRef()
    }

    async componentDidMount() {
        this.fillTableMoneda(0, 1, "");
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    fillTableMoneda = async (option, paginacion, buscar) => {
        try {
            await this.setStateAsync({ loading: true, paginacion: paginacion, lista: [] });
            const result = await axios.get('/api/moneda/list', {
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

    loadDataMoneda = async (id) => {
        try {
            const result = await axios.get("/api/moneda/id", {
                params: {
                    idMoneda: id
                }
            });

            // console.log(result)

            this.setState({
                txtNombre: result.data.nombre,
                txtCodIso: result.data.codiso,
                txtSimbolo: result.data.simbolo,
                ckEstado: result.data.estado,
                idMoneda: result.data.idMoneda
            });

        } catch (error) {
            console.log(error.response)
        }
    }

    async saveMoneda() {
        if (this.state.txtNombre === "") {
            this.refTxtNombre.current.focus();
        } else if (this.state.txtCodIso === "") {
            this.refTxtCodIso.current.focus();
        } else if (this.state.txtSimbolo === "") {
            this.refTxtSimbolo.current.focus();
        } else {
            try {

                let result = null

                if (this.state.idMoneda !== '') {
                    result = await axios.post('/api/moneda/update', {
                        "nombre": this.state.txtNombre.trim().toUpperCase(),
                        "codiso": this.state.txtCodIso.trim().toUpperCase(),
                        "simbolo": this.state.txtSimbolo.trim().toUpperCase(),
                        "estado": this.state.ckEstado,
                        "idMoneda": this.state.idMoneda
                    })
                    // console.log('actualizar');

                } else {
                    result = await axios.post('/api/moneda/add', {
                        "nombre": this.state.txtNombre.trim().toUpperCase(),
                        "codiso": this.state.txtCodIso.trim().toUpperCase(),
                        "simbolo": this.state.txtSimbolo.trim().toUpperCase(),
                        "estado": this.state.ckEstado,
                    });
                    // console.log('nuevo');
                }

                // console.log(result);
                this.closeModal()

            } catch (error) {
                console.log(error)
                console.log(error.response)
            }
        }
    }

    openModalMoneda(id) {
        if (id === '') {
            showModal('modalMoneda')
            this.refTxtNombre.current.focus();
            // console.log('nuevo')
        }
        else {
            this.setState({ idMoneda: id });
            showModal('modalMoneda')
            this.loadDataMoneda(id)
            // console.log('editar')
        }
    }

    closeModal() {
        hideModal('modalMoneda')
        this.setState({
            txtNombre: '',
            txtCodIso: '',
            txtSimbolo: '',
            ckEstado: true,
            idMoneda: '',
        })
    }

    searchText(text) {
        this.fillTableMoneda(0, 1, text);
    }

    render() {
        return (
            <>
                {/* Inicio modal nuevo cliente*/}
                <div className="modal fade" id="modalMoneda" data-backdrop="static">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title"><i className="bi bi-currency-exchange"></i>{this.state.idMoneda === '' ? " Registrar Moneda" : " Editar Moneda"}</h5>
                                <button type="button" className="close" data-dismiss="modal" onClick={() => this.closeModal()}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">

                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label>Moneda:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtNombre}
                                            value={this.state.txtNombre}
                                            onChange={(event) => this.setState({ txtNombre: event.target.value })}
                                            placeholder="Soles, dolares, etc" />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label>Código ISO:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtCodIso}
                                            value={this.state.txtCodIso}
                                            onChange={(event) => this.setState({ txtCodIso: event.target.value })}
                                            placeholder="PEN, USD, etc" />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label>Simbolo:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtSimbolo}
                                            value={this.state.txtSimbolo}
                                            onChange={(event) => this.setState({ txtSimbolo: event.target.value })}
                                            placeholder="S/, $, etc" />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label>Estado:</label>
                                        <div className="custom-control custom-switch">
                                            <input
                                                type="checkbox"
                                                className="custom-control-input"
                                                id="switch1"
                                                checked={this.state.ckEstado}
                                                onChange={(value) => this.setState({ ckEstado: value.target.checked })} />
                                            <label className="custom-control-label" htmlFor="switch1">Activo o Inactivo</label>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => this.saveMoneda()}>Guardar</button>
                                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => this.closeModal()}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* fin modal nuevo cliente*/}

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Monedas <small className="text-secondary">LISTA</small></h5>
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
                                <input type="search" className="form-control" placeholder="Buscar..." ref={this.refTxtSearch} onKeyUp={(event) => this.searchText(event.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            <button className="btn btn-outline-info" onClick={() => this.openModalMoneda(this.state.idMoneda)}>
                                <i className="bi bi-file-plus"></i> Nuevo Registro
                            </button>
                            {" "}
                            <button className="btn btn-outline-secondary" onClick={() => this.fillTableMoneda(0, 1, "")}>
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
                                        {/* <th width="17%">Empresa</th> */}
                                        <th width="15%">Moneda</th>
                                        <th width="15%">Codigo ISO</th>
                                        <th width="15%">Símbolo</th>
                                        <th width="15%">Estado</th>
                                        <th width="15%" colSpan="2">Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.loading ? (
                                            <tr>
                                                <td className="text-center" colSpan="6">
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
                                                <td colSpan="6">¡No hay datos registrados!</td>
                                            </tr>
                                        ) : (
                                            this.state.lista.map((item, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td>{item.id}</td>
                                                        <td>{item.nombre}</td>
                                                        <td>{item.codiso}</td>
                                                        <td>{item.simbolo}</td>
                                                        <td><div className={`badge ${item.estado === 1 ? "badge-info" : "badge-danger"}`}>{item.estado === 1 ? "ACTIVO" : "INACTIVO"}</div></td>
                                                        <td>
                                                            <button className="btn btn-outline-dark btn-sm" title="Editar" onClick={() => this.openModalMoneda(item.idMoneda)}><i className="bi bi-pencil"></i></button>
                                                            {" "}
                                                            <button className="btn btn-outline-danger btn-sm" title="Eliminar"><i className="bi bi-trash"></i></button>
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

export default Monedas;