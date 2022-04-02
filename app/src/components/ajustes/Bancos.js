import React from 'react';
import axios from 'axios';
import loading from '../../recursos/images/loading.gif';
import { showModal, hideModal } from '../tools/Tools';

class Bancos extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idBanco: '',
            txtNombre: '',
            CbxTipoCuenta: 'CUENTA CORRIENTE',
            txtMoneda: '',
            txtNumCuenta: '',
            txtCci: '',
            txtRepresentante: '',
            loading: true,
            lista: [],
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messagePaginacion: ''

        }

        this.refTxtNombre = React.createRef();
        this.refCbxTipoCuenta = React.createRef();
        this.refTxtMoneda = React.createRef();
        this.refTxtNumCuenta = React.createRef();
        this.refTxtCci = React.createRef();
        this.refTxtRepresentante = React.createRef();
    }

    async componentDidMount() {
        this.fillTable(0, 1, "");
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
            const result = await axios.get('/api/banco/list', {
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
            const result = await axios.get("/api/banco/id", {
                params: {
                    idBanco: id
                }
            });
            // console.log(result)
            this.setState({
                txtNombre: result.data.nombre,
                CbxTipoCuenta: result.data.tipocuenta,
                txtMoneda: result.data.moneda,
                txtNumCuenta: result.data.numcuenta,
                txtCci: result.data.cci,
                txtRepresentante: result.data.representante,
                idBanco: result.data.idBanco
            });

        } catch (error) {
            console.log(error.response)
        }
    }

    async save() {
        if (this.state.txtNombre === "") {
            this.refTxtNombre.current.focus();
        } else if (this.state.txtMoneda === "") {
            this.refTxtMoneda.current.focus();
        } else if (this.state.txtNumCuenta === "") {
            this.refTxtNumCuenta.current.focus();
        } else if (this.state.txtRepresentante === "") {
            this.refTxtRepresentante.current.focus();
        } else {
            try {

                let result = null
                if (this.state.idBanco !== '') {
                    result = await axios.post('/api/banco/update', {
                        "nombre": this.state.txtNombre.trim().toUpperCase(),
                        "tipocuenta": this.state.CbxTipoCuenta,
                        "moneda": this.state.txtMoneda.trim().toUpperCase(),
                        "numcuenta": this.state.txtNumCuenta.trim().toUpperCase(),
                        "cci": this.state.txtCci.trim().toUpperCase(),
                        "representante": this.state.txtRepresentante.trim().toUpperCase(),
                        "idBanco": this.state.idBanco
                    })
                    // console.log(result);

                } else {
                    result = await axios.post('/api/banco/add', {
                        "nombre": this.state.txtNombre.trim().toUpperCase(),
                        "tipocuenta": this.state.CbxTipoCuenta,
                        "moneda": this.state.txtMoneda.trim().toUpperCase(),
                        "numcuenta": this.state.txtNumCuenta.trim().toUpperCase(),
                        "cci": this.state.txtCci.trim().toUpperCase(),
                        "representante": this.state.txtRepresentante.trim().toUpperCase(),
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
            showModal('modalBanco')
            this.refTxtNombre.current.focus();
        }
        else {
            showModal('modalBanco')
            this.loadDataId(id)
        }
    }

    closeModal() {
        hideModal('modalBanco')
        this.setState({
            txtNombre: '',
            CbxTipoCuenta: 'CUENTA CORRIENTE',
            txtMoneda: '',
            txtNumCuenta: '',
            txtCci: '',
            txtRepresentante: '',
            idBanco: '',
        })
    }

    render() {
        return (
            <>
                {/* Inicio modal */}
                <div className="modal fade" id="modalBanco" data-backdrop="static">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title"><i className="bi bi-currency-exchange"></i>{this.state.idBanco === '' ? " Registrar Banco" : " Editar Banco"}</h5>
                                <button type="button" className="close" data-dismiss="modal" onClick={() => this.closeModal()}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">

                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label>Nombre Banco:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtNombre}
                                            value={this.state.txtNombre}
                                            onChange={(event) => this.setState({ txtNombre: event.target.value })}
                                            placeholder="BCP, BBVA, etc" />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label>Tipo de Cuenta:</label>
                                        <div className="input-group">
                                            <select
                                                className="form-control"
                                                ref={this.refCbxTipoCuenta}
                                                value={this.state.CbxTipoCuenta}
                                                onChange={(event) => this.setState({ CbxTipoCuenta: event.target.value })} >
                                                <option value="CUENTA CORRIENTE">Cuenta Corriente</option>
                                                <option value="CUENTA RECAUDADORA">Cuenta Recaudadora</option>
                                                <option value="CUENTA DE AHORROS">Cuenta de Ahorros</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label>Moneda:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtMoneda}
                                            value={this.state.txtMoneda}
                                            onChange={(event) => this.setState({ txtMoneda: event.target.value })}
                                            placeholder="Soles, Dolares, etc" />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label>Número de cuenta:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtNumCuenta}
                                            value={this.state.txtNumCuenta}
                                            onChange={(event) => this.setState({ txtNumCuenta: event.target.value })}
                                            placeholder="##############" />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label>CCI:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtCci}
                                            value={this.state.txtCci}
                                            onChange={(event) => this.setState({ txtCci: event.target.value })}
                                            placeholder="####################" />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label>Representante:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtRepresentante}
                                            value={this.state.txtRepresentante}
                                            onChange={(event) => this.setState({ txtRepresentante: event.target.value })}
                                            placeholder="Datos del representante" />
                                    </div>
                                </div>

                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => this.save()}>Guardar</button>
                                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => this.closeModal()}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* fin modal */}


                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Bancos <small className="text-secondary">LISTA</small></h5>
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
                            <button className="btn btn-outline-info" onClick={() => this.openModal(this.state.idBanco)}>
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
                                        <th width="10%">Banco</th>
                                        <th width="15%">Tipo Cuenta</th>
                                        <th width="10%">Moneda</th>
                                        <th width="20%">Número Cuenta</th>
                                        <th width="15%">Representante</th>
                                        <th width="15%">Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.loading ? (
                                            <tr>
                                                <td className="text-center" colSpan="7">
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
                                                <td colSpan="7">¡No hay datos registrados!</td>
                                            </tr>
                                        ) : (
                                            this.state.lista.map((item, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td>{item.id}</td>
                                                        <td>{item.nombre}</td>
                                                        <td>{item.tipocuenta}</td>
                                                        <td>{item.moneda}</td>
                                                        <td>{item.numcuenta}</td>
                                                        <td>{item.representante}</td>
                                                        <td>
                                                            <button className="btn btn-outline-dark btn-sm" title="Editar" onClick={() => this.openModal(item.idBanco)}><i className="bi bi-pencil"></i></button>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )
                                    }
                                </tbody>

                            </table>
                        </div>
                        <div className="col-md-12 text-center">
                            <nav aria-label="...">
                                <ul className="pagination justify-content-end">
                                    <li className="page-item disabled">
                                        <button className="page-link">Previous</button>
                                    </li>
                                    <li className="page-item"><button className="page-link">1</button></li>
                                    <li className="page-item active" aria-current="page">
                                        <button className="page-link" href="#">2</button>
                                    </li>
                                    <li className="page-item"><button className="page-link" >3</button></li>
                                    <li className="page-item">
                                        <button className="page-link">Next</button>
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

export default Bancos;