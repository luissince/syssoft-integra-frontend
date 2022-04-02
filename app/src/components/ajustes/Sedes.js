import React from 'react';
import axios from 'axios';
import loading from '../../recursos/images/loading.gif'
import { showModal, hideModal } from '../tools/Tools'

class Sedes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idSede: '',
            txtNombreEmpresa: '',
            txtNombreSede: '',
            txtTelefono: '',
            txtCelular: '',
            txtEmail: '',
            txtWeb: '',
            txtDireccion: '',
            txtPais: '',
            txtRegion: '',
            txtProvincia: '',
            txtDistrito: '',
            loading: true,
            lista: [],
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messagePaginacion: ''

        }

        this.refTxtNombreEmpresa = React.createRef();
        this.refTxtNombreSede = React.createRef();
        this.refTxtTelefono = React.createRef();
        this.refTxtCelular = React.createRef();
        this.refTxtEmail = React.createRef();
        this.refTxtDireccion = React.createRef();
        this.refTxtPais = React.createRef();
        this.refTxtRegion = React.createRef();
        this.refTxtProvincia = React.createRef();
        this.refTxtDistrito = React.createRef();

        // this.refTxtMoneda = React.createRef();
        // this.refTxtNumCuenta = React.createRef();
        // this.refTxtCci = React.createRef();
        // this.refTxtRepresentante = React.createRef();
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
            const result = await axios.get('/api/sede/list', {
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
            console.log(err.response)
            console.log(err)
        }
    }

    loadDataId = async (id) => {
        try {
            const result = await axios.get("/api/sede/id", {
                params: {
                    idSede: id
                }
            });
            // console.log(result)
            this.setState({
                txtNombreEmpresa: result.data.nombreEmpresa,
                txtNombreSede: result.data.nombreSede,
                txtTelefono: result.data.telefono,
                txtCelular: result.data.celular,
                txtEmail: result.data.email,
                txtWeb: result.data.web,
                txtDireccion: result.data.direccion,
                txtPais: result.data.pais,
                txtRegion: result.data.region,
                txtProvincia: result.data.provincia,
                txtDistrito: result.data.distrito,
                idSede: result.data.idSede
            });

        } catch (error) {
            console.log(error.response)
        }
    }

    async save() {
        if (this.state.txtNombreEmpresa === "") {
            this.refTxtNombreEmpresa.current.focus();
        } else if (this.state.txtNombreSede === "") {
            this.refTxtNombreSede.current.focus();
        } else if (this.state.txtTelefono === "") {
            this.refTxtTelefono.current.focus();
        } else if (this.state.txtCelular === "") {
            this.refTxtCelular.current.focus();
        } else if (this.state.txtEmail === "") {
            this.refTxtEmail.current.focus();
        } else if (this.state.txtDireccion === "") {
            this.refTxtDireccion.current.focus();
        }
        else {
            try {

                let result = null
                if (this.state.idSede !== '') {
                    result = await axios.post('/api/sede/update', {
                        "nombreEmpresa": this.state.txtNombreEmpresa.trim().toUpperCase(),
                        "nombreSede": this.state.txtNombreSede.trim().toUpperCase(),
                        "telefono": this.state.txtTelefono.trim().toUpperCase(),
                        "celular": this.state.txtCelular.trim().toUpperCase(),
                        "email": this.state.txtEmail.trim().toUpperCase(),
                        "web": this.state.txtWeb.trim().toUpperCase(),
                        "direccion": this.state.txtDireccion.trim().toUpperCase(),
                        "pais": this.state.txtPais.trim().toUpperCase(),
                        "region": this.state.txtRegion.trim().toUpperCase(),
                        "provincia": this.state.txtProvincia.trim().toUpperCase(),
                        "distrito": this.state.txtDistrito.trim().toUpperCase(),
                        "idSede": this.state.idSede
                    })
                    // console.log(result);

                } else {
                    result = await axios.post('/api/sede/add', {
                        "nombreEmpresa": this.state.txtNombreEmpresa.trim().toUpperCase(),
                        "nombreSede": this.state.txtNombreSede.trim().toUpperCase(),
                        "telefono": this.state.txtTelefono.trim().toUpperCase(),
                        "celular": this.state.txtCelular.trim().toUpperCase(),
                        "email": this.state.txtEmail.trim().toUpperCase(),
                        "web": this.state.txtWeb.trim().toUpperCase(),
                        "direccion": this.state.txtDireccion.trim().toUpperCase(),
                        "pais": this.state.txtPais.trim().toUpperCase(),
                        "region": this.state.txtRegion.trim().toUpperCase(),
                        "provincia": this.state.txtProvincia.trim().toUpperCase(),
                        "distrito": this.state.txtDistrito.trim().toUpperCase(),
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
            showModal('modalSede')
            this.refTxtNombre.current.focus();
            // console.log('nuevo')
        }
        else {
            this.setState({ idSede: id });
            showModal('modalSede')
            this.loadDataId(id)
            // console.log('editar')
        }
    }

    closeModal() {
        hideModal('modalSede')
        this.setState({
            txtNombreEmpresa: '',
            txtNombreSede: '',
            txtTelefono: '',
            txtCelular: '',
            txtEmail: '',
            txtWeb: '',
            txtDireccion: '',
            txtPais: '',
            txtRegion: '',
            txtProvincia: '',
            txtDistrito: '',

            idSede: '',
        })
    }

    render() {
        return (
            <>

                {/* Inicio modal */}
                <div className="modal fade" id="modalSede" data-backdrop="static">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title"><i className="bi bi-currency-exchange"></i>{this.state.idSede === '' ? " Registrar Sede" : " Editar Sede"}</h5>
                                <button type="button" className="close" data-dismiss="modal" onClick={() => this.closeModal()}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">

                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label>Nombre de Empresa:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtNombreEmpresa}
                                            value={this.state.txtNombreEmpresa}
                                            onChange={(event) => this.setState({ txtNombreEmpresa: event.target.value })}
                                            placeholder="Dijite ..." />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label>Nombre de Sede:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtNombreSede}
                                            value={this.state.txtNombreSede}
                                            onChange={(event) => this.setState({ txtNombreSede: event.target.value })}
                                            placeholder="Dijite ..." />

                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-4">
                                        <label>Telefono:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtTelefono}
                                            value={this.state.txtTelefono}
                                            onChange={(event) => this.setState({ txtTelefono: event.target.value })}
                                            placeholder="Dijite ..." />
                                    </div>
                                    <div className="form-group col-md-4">
                                        <label>celular:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtCelular}
                                            value={this.state.txtCelular}
                                            onChange={(event) => this.setState({ txtCelular: event.target.value })}
                                            placeholder="Dijite ..." />
                                    </div>
                                    <div className="form-group col-md-4">
                                        <label>Email:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtEmail}
                                            value={this.state.txtEmail}
                                            onChange={(event) => this.setState({ txtEmail: event.target.value })}
                                            placeholder="Dijite ..." />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label>WebSite:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxWebSite}
                                            value={this.state.txtWeb}
                                            onChange={(event) => this.setState({ txtWeb: event.target.value })}
                                            placeholder="Dijite ..." />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label>Dirección:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtDireccion}
                                            value={this.state.txtDireccion}
                                            onChange={(event) => this.setState({ txtDireccion: event.target.value })}
                                            placeholder="Dijite ..." />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-3">
                                        <label>Pais:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtPais}
                                            value={this.state.txtPais}
                                            onChange={(event) => this.setState({ txtPais: event.target.value })}
                                            placeholder="Dijite ..." />
                                    </div>
                                    <div className="form-group col-md-3">
                                        <label>Región:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtRegion}
                                            value={this.state.txtRegion}
                                            onChange={(event) => this.setState({ txtRegion: event.target.value })}
                                            placeholder="Dijite ..." />
                                    </div>
                                    <div className="form-group col-md-3">
                                        <label>Provincia:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtProvincia}
                                            value={this.state.txtProvincia}
                                            onChange={(event) => this.setState({ txtProvincia: event.target.value })}
                                            placeholder="Dijite ..." />
                                    </div>
                                    <div className="form-group col-md-3">
                                        <label>Distrito:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            ref={this.refTxtDistrito}
                                            value={this.state.txtDistrito}
                                            onChange={(event) => this.setState({ txtDistrito: event.target.value })}
                                            placeholder="Dijite ..." />
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
                            <h5>Sedes <small className="text-secondary">LISTA</small></h5>
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
                            {/* <button className="btn btn-outline-info" onClick={() => this.openModal(this.state.idSede)}>
                                <i className="bi bi-file-plus"></i> Nuevo Registro
                            </button>
                            {" "} */}
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
                                        <th width="10%">Sede</th>
                                        <th width="15%">Empresa</th>
                                        <th width="10%">Dirección</th>
                                        <th width="20%">Telefono</th>
                                        <th width="15%">Celular</th>
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
                                                        <td>{item.nombreSede}</td>
                                                        <td>{item.nombreEmpresa}</td>
                                                        <td>{item.direccion}</td>
                                                        <td>{item.telefono}</td>
                                                        <td>{item.celular}</td>
                                                        <td>
                                                            <button className="btn btn-outline-dark btn-sm" title="Editar" onClick={() => this.openModal(item.idSede)}><i className="bi bi-pencil"></i></button>
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
        )
    }

}

export default Sedes