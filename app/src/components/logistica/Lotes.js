import React from 'react';
import axios from 'axios';
import loading from '../../recursos/images/loading.gif';
import { showModal, hideModal, viewModal, clearModal, keyNumberFloat, isNumeric } from '../tools/Tools';

class Lotes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idLote: '',
            idManzana: '',
            descripcion: '',
            costo: '',
            precio: '',
            estado: '',
            medidaFrontal: '',
            costadoDerecho: '',
            costadoIzquierdo: '',
            medidaFondo: '',
            areaLote: '',
            numeroPartida: '',
            limiteFrontal: '',
            limiteDerecho: '',
            limiteIzquierdo: '',
            limitePosterior: '',
            ubicacionLote: '',

            loading: true,
            lista: [],
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messagePaginacion: ''
        }

        this.refManzana = React.createRef();
        this.refDescripcion = React.createRef();
        this.refCosto = React.createRef();
        this.refPrecio = React.createRef();
        this.refEstado = React.createRef();

        this.refMedidaFrontal = React.createRef();
        this.refCostadoDerecho = React.createRef();
        this.refCostadoIzquiero = React.createRef();
        this.refMedidaFondo = React.createRef();
        this.refAreaLote = React.createRef();
        this.refNumeroPartida = React.createRef();
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    async componentDidMount() {
        this.fillTableLote(1);
    }

    fillTableLote = async (paginacion) => {
        try {
            await this.setStateAsync({ loading: true, paginacion: paginacion, lista: [] });
            const result = await axios.get('/api/lote/list', {
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

    openModalLote(id) {
        if (id === undefined) {
            showModal('modalLote');
        } else {
            showModal('modalLote');
            this.loadDataId(id);
        }
    }

    async loadDataId(id) {
        try {
            let result = await axios.get('/api/lote/id', {
                params: {
                    "idLote": id
                }
            });
            this.setStateAsync({
                idLote: result.data.idLote,
                idManzana: result.data.idManzana,
                descripcion: result.data.descripcion,
                costo: result.data.costo,
                precio: result.data.precio,
                estado: result.data.estado,
                medidaFrontal: result.data.medidaFrontal,
                costadoDerecho: result.data.costadoDerecho,
                costadoIzquierdo: result.data.costadoIzquierdo,
                medidaFondo: result.data.medidaFondo,
                areaLote: result.data.areaLote,
                numeroPartida: result.data.numeroPartida,
                limiteFrontal: result.data.limiteFrontal,
                limiteDerecho: result.data.limiteDerecho,
                limiteIzquierdo: result.data.limiteIzquierdo,
                limitePosterior: result.data.limitePosterior,
                ubicacionLote: result.data.ubicacionLote,
            });
            console.log(result)
        } catch (error) {
            console.log(error)
        }
    }

    async saveLote() {
        if (this.state.idManzana === "") {
            this.refManzana.current.focus();
        } else if (this.state.descripcion === "") {
            this.refDescripcion.current.focus();
        } else if (!isNumeric(this.state.costo)) {
            this.refCosto.current.focus();
        } else if (!isNumeric(this.state.precio)) {
            this.refPrecio.current.focus();
        } else if (this.state.estado === "") {
            this.refEstado.current.focus();
        }
        else {
            console.log(this.state)
            try {
                let result = await axios.post("/api/lote/add", {
                    "idLote": this.state.idLote,
                    "idManzana": this.state.idManzana,
                    "descripcion": this.state.descripcion,
                    "costo": this.state.costo,
                    "precio": this.state.precio,
                    "estado": this.state.estado,
                    "medidaFrontal": this.state.medidaFrontal,
                    "costadoDerecho": this.state.costadoDerecho,
                    "costadoIzquierdo": this.state.costadoIzquierdo,
                    "medidaFondo": this.state.medidaFondo,
                    "areaLote": this.state.areaLote,
                    "numeroPartida": this.state.numeroPartida,
                    "limiteFrontal": this.state.limiteFrontal,
                    "limiteDerecho": this.state.limiteDerecho,
                    "limiteIzquierdo": this.state.limiteIzquierdo,
                    "limitePosterior": this.state.limitePosterior,
                    "ubicacionLote": this.state.ubicacionLote,
                });
                console.log(result)
            } catch (error) {
                console.log(error.response)
            }
        }
    }

    render() {
        return (
            <>
                {/* Inicio modal nuevo cliente*/}
                <div className="modal fade" id="modalLote" tabIndex="-1" aria-labelledby="modalLoteLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="modalLoteLabel"><i className="bi bi-house-fill"></i> Registrar Lote</h5>
                                <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className='row py-1'>
                                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                        <nav>
                                            <div className="nav nav-tabs" id="nav-tab" role="tablist">
                                                <a className="nav-link active" id="nav-info-tab" data-bs-toggle="tab" href="#nav-info" role="tab" aria-controls="nav-info" aria-selected="true"><i className="bi bi-info-circle"></i> Descripcion</a>
                                                <a className="nav-link" id="nav-medida-tab" data-bs-toggle="tab" href="#nav-medida" role="tab" aria-controls="nav-medida" aria-selected="false"><i className="bi bi-aspect-ratio"></i> Medidas</a>
                                                <a className="nav-link" id="nav-limite-tab" data-bs-toggle="tab" href="#nav-limite" role="tab" aria-controls="nav-limite" aria-selected="false"><i className="bi bi-pip"></i> Limite</a>
                                            </div>
                                        </nav>
                                        <div className="tab-content" id="nav-tabContent">
                                            <div className="tab-pane fade show active" id="nav-info" role="tabpanel" aria-labelledby="nav-info-tab">
                                                <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                                    <div className="form-group">
                                                        <label htmlFor="manzana">Manzana</label>
                                                        <select
                                                            className="form-control"
                                                            id="manzana"
                                                            ref={this.refManzana}
                                                            value={this.state.idManzana}
                                                            onChange={(event) => {
                                                                this.setState({ idManzana: event.target.value })
                                                            }}
                                                        >
                                                            <option value="">- Seleccione -</option>
                                                            <option value="MZ0001">MANZANA POR DEFECTO</option>
                                                        </select>
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="descripción">Descripción del Lote</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="descripcion"
                                                            placeholder='ej. Lote 07'
                                                            ref={this.refDescripcion}
                                                            value={this.state.descripcion}
                                                            onChange={(event) => {
                                                                this.setState({ descripcion: event.target.value })
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="cAproximado">Costo Aproximado (S/)</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="cAproximado"
                                                            placeholder='0.00'
                                                            ref={this.refCosto}
                                                            value={this.state.costo}
                                                            onChange={(event) => {
                                                                this.setState({ costo: event.target.value })
                                                            }}
                                                            onKeyPress={keyNumberFloat}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="pvContado">Precio Venta Contado (S/)</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="pvContado"
                                                            placeholder='0.00'
                                                            ref={this.refPrecio}
                                                            value={this.state.precio}
                                                            onChange={(event) => {
                                                                this.setState({ precio: event.target.value })
                                                            }}
                                                            onKeyPress={keyNumberFloat}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="estado">Estado</label>
                                                        <select
                                                            className="form-control"
                                                            id="estado"
                                                            ref={this.refEstado}
                                                            value={this.state.estado}
                                                            onChange={(event) => {
                                                                this.setState({ estado: event.target.value })
                                                            }}
                                                        >
                                                            <option value="">- Seleccione -</option>
                                                            <option value="1">Disponible</option>
                                                            <option value="2">Reservado</option>
                                                            <option value="3">Vendido</option>
                                                            <option value="4">Inactivo</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="tab-pane fade" id="nav-medida" role="tabpanel" aria-labelledby="nav-medida-tab">
                                                <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                                    <div className="form-group">
                                                        <label htmlFor="mFrontal">Medida Frontal (ML)</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="mFrontal"
                                                            placeholder='0'
                                                            ref={this.refMedidaFrontal}
                                                            value={this.state.medidaFrontal}
                                                            onChange={(event) => {
                                                                this.setState({ medidaFrontal: event.target.value })
                                                            }}
                                                            onKeyPress={keyNumberFloat}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="coDerecho">Costado Derecho (ML)</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="coDerecho"
                                                            placeholder='0'
                                                            ref={this.refCostadoDerecho}
                                                            value={this.state.costadoDerecho}
                                                            onChange={(event) => {
                                                                this.setState({ costadoDerecho: event.target.value })
                                                            }}
                                                            onKeyPress={keyNumberFloat}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="coIzquierdo">Costado Izquierdo (ML)</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="coIzquierdo"
                                                            placeholder='0'
                                                            ref={this.refCostadoIzquiero}
                                                            value={this.state.costadoIzquierdo}
                                                            onChange={(event) => {
                                                                this.setState({ costadoIzquierdo: event.target.value })
                                                            }}
                                                            onKeyPress={keyNumberFloat}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="mFondo">Medida Fondo (ML)</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="mFondo"
                                                            placeholder='0'
                                                            ref={this.refMedidaFondo}
                                                            value={this.state.medidaFondo}
                                                            onChange={(event) => {
                                                                this.setState({ medidaFondo: event.target.value })
                                                            }}
                                                            onKeyPress={keyNumberFloat}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="aLote">Area Lote (M2)</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="aLote"
                                                            placeholder='0'
                                                            ref={this.refAreaLote}
                                                            value={this.state.areaLote}
                                                            onChange={(event) => {
                                                                this.setState({ areaLote: event.target.value })
                                                            }}
                                                            onKeyPress={keyNumberFloat}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="nPartida">N° Partida</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="nPartida"
                                                            placeholder='0'
                                                            ref={this.refNumeroPartida}
                                                            value={this.state.numeroPartida}
                                                            onChange={(event) => {
                                                                this.setState({ numeroPartida: event.target.value })
                                                            }}
                                                            onKeyPress={keyNumberFloat}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="tab-pane fade" id="nav-limite" role="tabpanel" aria-labelledby="nav-limite-tab">
                                                <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                                    <div className="form-group">
                                                        <label htmlFor="lFrontal">Limite, Frontal / Norte / Noreste</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="lFrontal"
                                                            placeholder='Limite'
                                                            value={this.state.limiteFrontal}
                                                            onChange={(event) => {
                                                                this.setState({ limiteFrontal: event.target.value })
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="lDerecho">Limite, Derecho / Este / Sureste</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="lDerecho"
                                                            placeholder='Limite'
                                                            value={this.state.limiteDerecho}
                                                            onChange={(event) => {
                                                                this.setState({ limiteDerecho: event.target.value })
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="lIzquierdo">Limite, Izquierdo / Sur / Suroeste</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="lIzquierdo"
                                                            placeholder='Limite'
                                                            value={this.state.limiteIzquierdo}
                                                            onChange={(event) => {
                                                                this.setState({ limiteIzquierdo: event.target.value })
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="lPosterior">Limite, Posterior / Oeste / Noroeste</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="lPosterior"
                                                            placeholder='Limite'
                                                            value={this.state.limitePosterior}
                                                            onChange={(event) => {
                                                                this.setState({ limitePosterior: event.target.value })
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="ubicacionLote">Ubicación del Lote</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="ubicacionLote"
                                                            placeholder='ej. Frente al parque'
                                                            value={this.state.ubicacionLote}
                                                            onChange={(event) => {
                                                                this.setState({ ubicacionLote: event.target.value })
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => this.saveLote()}>Aceptar</button>
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* fin modal nuevo cliente*/}

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Lotes de Terreno <small className="text-secondary">LISTA</small></h5>
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
                            <button className="btn btn-outline-info" onClick={() => this.openModalLote()}>
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
                                        <th width="15%">Descripción</th>
                                        <th width="25%">P. Venta</th>
                                        <th width="20%">M.F(ML)</th>
                                        <th width="20%">M.C.D(ML)</th>
                                        <th width="20%">Area(M2)</th>
                                        <th width="10%">Estado</th>
                                        <th width="5%">Editar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.loading ? (
                                            <tr>
                                                <td className="text-center" colSpan="8">
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
                                                <td colSpan="8">¡No hay datos registrados!</td>
                                            </tr>
                                        ) : (
                                            this.state.lista.map((item, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td>{item.id}</td>
                                                        <td>{item.descripcion}</td>
                                                        <td>{item.precio}</td>
                                                        <td>{item.medidaFondo}</td>
                                                        <td>{item.medidaFrontal}</td>
                                                        <td>{item.areaLote}</td>
                                                        <td>{item.estado}</td>
                                                        <td>
                                                            <button className="btn btn-outline-dark btn-sm" title="Editar" onClick={() => this.openModalLote(item.idLote)}><i className="bi bi-pencil"></i></button>
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

export default Lotes;