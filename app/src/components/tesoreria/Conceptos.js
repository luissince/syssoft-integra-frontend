import React from 'react';
import axios from 'axios';
import loading from '../../recursos/images/loading.gif';
import { showModal, hideModal, clearModal } from '../tools/Tools';

class Conceptos extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idConcepto: '',
            nombre: '',
            tipoConcepto: '',

            loading: true,
            lista: [],
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messagePaginacion: '',
            messageWarning: ''
        }

        this.refNombre = React.createRef();
        this.refTipoConcepto = React.createRef();
    }

    async componentDidMount() {
        this.fillTable(0, 1, "");

        clearModal("modalConcepto", () => {
            this.setState({
                nombre: '',
                tipoConcepto: '',
                idCobro: '',
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
            const result = await axios.get('/api/concepto/list', {
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
            const result = await axios.get("/api/concepto/id", {
                params: {
                    idConcepto: id
                }
            });
            // console.log(result)
            this.setState({
                nombre: result.data.nombre,
                tipoConcepto: result.data.tipoConcepto,
                idConcepto: result.data.idConcepto
            });

        } catch (error) {
            console.log(error.response)
        }
    }

    async save() {

        if (this.state.nombre === "") {
            this.setState({ messageWarning: "Ingrese el nombre del concepto" });
            this.refNombre.current.focus();
        } else if (this.state.tipoConcepto === "") {
            this.setState({ messageWarning: "Seleccione el concepto" })
            this.refTipoConcepto.current.focus();
        } else {

            try {

                let result = null

                if (this.state.idConcepto !== '') {
                    result = await axios.post('/api/concepto/update', {

                        "nombre": this.state.nombre.trim().toUpperCase(),
                        "tipoConcepto": this.state.tipoConcepto,
                        "idConcepto": this.state.idConcepto
                    })
                    // console.log(result);

                } else {
                    result = await axios.post('/api/concepto/add', {

                        "nombre": this.state.nombre.trim().toUpperCase(),
                        "tipoConcepto": this.state.tipoConcepto,
                    });
                    // console.log(result);
                }

                this.closeModal()

            } catch (error) {
                console.log(error)
                console.log(error.response)
            }
        }

    }

    openModal(id) {
        if (id === '') {
            showModal('modalConcepto')
            this.refNombre.current.focus();
        }
        else {
            showModal('modalConcepto')
            this.loadDataId(id)
        }
    }

    closeModal() {
        hideModal('modalConcepto')
        this.setState({
            nombre: '',
            tipoConcepto: '',

            idConcepto: '',
            messageWarning: ''
        })
    }

    render() {
        return (
            <>
                {/* Inicio modal */}
                <div className="modal fade" id="modalConcepto" data-backdrop="static">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title"><i className="bi bi-currency-exchange"></i>{this.state.idConcepto === '' ? " Registrar Concepto" : " Editar Concepto"}</h5>
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

                                <div className="form-row">
                                    <div className="form-group col-md-12">
                                        <label>Concepto</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={this.state.nombre}
                                            ref={this.refNombre}
                                            onChange={(event) => {
                                                if (event.target.value.trim().length > 0) {
                                                    this.setState({
                                                        nombre: event.target.value,
                                                        messageWarning: '',
                                                    });
                                                } else {
                                                    this.setState({
                                                        nombre: event.target.value,
                                                        messageWarning: 'Ingrese el nombre del concepto',
                                                    });
                                                }
                                            }}
                                            placeholder="Ingrese el nombre del concepto" />
                                    </div>
                                    <div className="form-group col-md-12">
                                        <label>Tipo de Concepto:</label>
                                        <div className="input-group">
                                            <select
                                                className="form-control"
                                                value={this.state.tipoConcepto}
                                                ref={this.refTipoConcepto}
                                                onChange={(event) => {
                                                    if (event.target.value.trim().length > 0) {
                                                        this.setState({
                                                            tipoConcepto: event.target.value,
                                                            messageWarning: '',
                                                        });
                                                    } else {
                                                        this.setState({
                                                            tipoConcepto: event.target.value,
                                                            messageWarning: 'Seleccione el concepto',
                                                        });
                                                    }
                                                }}>
                                                <option value="">-- Seleccione --</option>
                                                <option value="1">CONCEPTO DE GASTO</option>
                                                <option value="2">CONCEPTO DE COBRO</option>
                                            </select>
                                        </div>
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
                            <h5>Conceptos <small className="text-secondary">LISTA</small></h5>
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
                            <button className="btn btn-outline-info" onClick={() => this.openModal(this.state.idConcepto)}>
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
                                        <th width="10%">Concepto</th>
                                        <th width="15%">Tipo Concepto</th>
                                        <th width="10%">Creacion</th>
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
                                                        alt="Loading..."
                                                        width="34"
                                                        height="34"
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
                                                        <td>{item.nombre}</td>
                                                        <td>{item.tipoConcepto == 1 ? 'CONCEPTO DE GASTO' : 'CONCEPTO DE COBRO'}</td>
                                                        <td>{item.fecha + ' ' + item.hora}</td>
                                                        <td>
                                                            <button className="btn btn-outline-dark btn-sm" title="Editar" onClick={() => this.openModal(item.idConcepto)}><i className="bi bi-pencil"></i></button>
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

export default Conceptos