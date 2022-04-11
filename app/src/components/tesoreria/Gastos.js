import React from 'react';
import axios from 'axios';
import loading from '../../recursos/images/loading.gif';
import { showModal, hideModal, clearModal } from '../tools/Tools';

class Gastos extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idGasto: '',
            conceptoGasto: '',
            fecha: '',
            monto: '',
            observacion: '',

            loading: true,
            lista: [],
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messagePaginacion: '',
            messageWarning: ''

        }

        this.refConceptoGasto = React.createRef();
        this.refFecha = React.createRef();
        this.refMonto = React.createRef();
        this.refObservacion = React.createRef();
    }

    async componentDidMount() {
        this.fillTable(0, 1, "");

        clearModal("modalGasto", () => {
            this.setState({
                conceptoGasto: '',
                fecha: '',
                monto: '',
                observacion: '',
                idGasto: '',
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
            const result = await axios.get('/api/gasto/list', {
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
            const result = await axios.get("/api/gasto/id", {
                params: {
                    idGasto: id
                }
            });
            // console.log(result)
            this.setState({
                conceptoGasto: result.data.conceptoGasto,
                fecha: result.data.fecha,
                monto: result.data.monto,
                observacion: result.data.observacion,
                idGasto: result.data.idGasto,
            });

        } catch (error) {
            console.log(error.response)
        }
    }

    async save() {

        if (this.state.conceptoGasto === "") {
            this.setState({ messageWarning: "Seleccione el concepto del gasto" });
            this.refConceptoGasto.current.focus();
        } else if (this.state.fecha === "") {
            this.setState({ messageWarning: "Seleccione la fecha" })
            this.refFecha.current.focus();
        } else if (this.state.monto === "") {
            this.setState({ messageWarning: "Ingrese el monto" })
            this.refMonto.current.focus();
        } else if (this.state.observacion === "") {
            this.setState({ messageWarning: "Ingrese una observación" })
            this.refObservacion.current.focus();
        }
        else {

            try {

                let result = null

                if (this.state.idGasto !== '') {
                    result = await axios.post('/api/gasto/update', {
                        "conceptoGasto": this.state.conceptoGasto,
                        "fecha": this.state.fecha,
                        "monto": this.state.monto.toString().trim().toUpperCase(),
                        "observacion": this.state.observacion.trim().toUpperCase(),
                        "idGasto": this.state.idGasto,
                    })
                    // console.log(result);

                } else {
                    result = await axios.post('/api/gasto/add', {
                        "conceptoGasto": this.state.conceptoGasto,
                        "fecha": this.state.fecha,
                        "monto": this.state.monto.toString().trim().toUpperCase(),
                        "observacion": this.state.observacion.trim().toUpperCase(),
                    });
                    // console.log(result);
                }

                // console.log(this.state)

                this.closeModal()

            } catch (error) {
                console.log(error)
                console.log(error.response)
            }
        }

    }

    openModal(id) {
        if (id === '') {
            showModal('modalGasto')
            this.refConceptoGasto.current.focus();
        }
        else {
            showModal('modalGasto')
            this.loadDataId(id)
        }
    }

    closeModal() {
        hideModal('modalGasto')
        this.setState({
            conceptoGasto: '',
            fecha: '',
            monto: '',
            observacion: '',

            idGasto: '',
            messageWarning: ''

        })
    }

    render() {
        return (
            <>
                {/* Inicio modal */}
                <div className="modal fade" id="modalGasto" data-backdrop="static">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title"><i className="bi bi-currency-exchange"></i>{this.state.idGasto === '' ? " Registrar Gasto" : " Editar Gasto"}</h5>
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
                                        <label>Concepto del Gasto</label>
                                        <div className="input-group">
                                            <select
                                                className="form-control"
                                                value={this.state.conceptoGasto}
                                                ref={this.refConceptoGasto}
                                                onChange={(event) => {
                                                    if (event.target.value.length > 0) {
                                                        this.setState({
                                                            conceptoGasto: event.target.value,
                                                            messageWarning: '',
                                                        });
                                                    } else {
                                                        this.setState({
                                                            conceptoGasto: event.target.value,
                                                            messageWarning: 'Seleccione el concepto del gasto',
                                                        });
                                                    }
                                                }}>
                                                <option value="">-- Seleccione --</option>
                                                <option value="1">PAGO DE OFICINA</option>
                                                <option value="2">PAGO DE LUZ</option>
                                                <option value="3">TRASPORTE</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group col-md-12">
                                        <label>Fecha del Gasto</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={this.state.fecha}
                                            ref={this.refFecha}
                                            onChange={(event) => {
                                                if (event.target.value.length > 0) {
                                                    this.setState({
                                                        fecha: event.target.value,
                                                        messageWarning: '',
                                                    });
                                                } else {
                                                    this.setState({
                                                        fecha: event.target.value,
                                                        messageWarning: 'Seleccione la fecha',
                                                    });
                                                }
                                            }} />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-12">
                                        <label>Monto</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={this.state.monto}
                                            ref={this.refMonto}
                                            onChange={(event) => {
                                                if (event.target.value.length > 0) {
                                                    this.setState({
                                                        monto: event.target.value,
                                                        messageWarning: '',
                                                    });
                                                } else {
                                                    this.setState({
                                                        monto: event.target.value,
                                                        messageWarning: 'Ingrese el monto',
                                                    });
                                                }
                                            }}
                                            placeholder="Ingrese el monto" />
                                    </div>
                                    <div className="form-group col-md-12">
                                        <label>Observación</label>
                                        <textarea
                                            className="form-control"
                                            value={this.state.observacion}
                                            ref={this.refObservacion}
                                            onChange={(event) => {
                                                if (event.target.value.trim().length > 0) {
                                                    this.setState({
                                                        observacion: event.target.value,
                                                        messageWarning: '',
                                                    });
                                                } else {
                                                    this.setState({
                                                        observacion: event.target.value,
                                                        messageWarning: 'Ingrese una observación',
                                                    });
                                                }
                                            }}
                                            placeholder="Ingrese una observación">
                                        </textarea>
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
                            <h5>Gastos <small className="text-secondary">LISTA</small></h5>
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
                            <button className="btn btn-outline-info" onClick={() => this.openModal(this.state.idGasto)}>
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
                                        <th width="15%">Monto</th>
                                        <th width="10%">Fecha</th>
                                        <th width="10%">Observación</th>
                                        <th width="15%">Opción</th>
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
                                                        <td>{item.conceptoGasto}</td>
                                                        <td>{item.monto}</td>
                                                        <td>{item.fecha + ' ' + item.hora}</td>
                                                        <td>{item.observacion}</td>
                                                        <td>
                                                            <button className="btn btn-outline-dark btn-sm" title="Editar" onClick={() => this.openModal(item.idGasto)}><i className="bi bi-pencil"></i></button>
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

export default Gastos
