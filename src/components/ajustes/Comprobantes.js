import React from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { keyNumberInteger, timeForma24 } from '../tools/Tools';

function PaginacionElement(props) {
    const pageNumbers = [];
    for (let i = 1; i <= props.totalPaginacion; i++) {
        pageNumbers.push(i);
    }

    const renderPageNumbers = pageNumbers.map((number, index) => {
        if (number === 1 && props.paginacion === 1) {
            return (
                <li key={index} className="page-item active" aria-current="page">
                    <span className="page-link">{number}</span>
                </li>
            );
        } else if ((number < props.upperPageBound + 1) && number > props.lowerPageBound) {
            return (
                <li key={index} className={`page-item ${number === props.paginacion ? "active" : ""}`}>
                    {
                        number === props.paginacion
                            ? <span id={number} className="page-link">{number}</span>
                            : <button id={number} className="page-link" onClick={props.handleClick}>{number}</button>
                    }
                </li>
            );
        }
    });

    let pageIncrementBtn = null;
    if (pageNumbers.length > props.upperPageBound) {
        pageIncrementBtn = <li className="page-item"><button className="page-link"> &hellip; </button></li>;
    }

    let pageDecrementBtn = null;
    if (props.lowerPageBound >= 1) {
        pageDecrementBtn = <li className="page-item"><button> &hellip; </button></li>;
    }

    let renderPrevBtn = null;
    if (props.isPrevBtnActive === 'disabled') {
        renderPrevBtn = <li className="page-item disabled"><button className="page-link"> Ante. </button></li>;
    } else {
        renderPrevBtn = <li className="page-item"><button className="page-link"> Ante.  </button></li>;
    }

    let renderNextBtn = null;
    if (props.isNextBtnActive === 'disabled') {
        renderNextBtn = <li className="page-item disabled"><button className="page-link"> Sigui. </button></li>;
    } else {
        renderNextBtn = <li className="page-item"><button className="page-link"> Sigui. </button></li>;
    }

    return (
        <>
            {renderPrevBtn}
            {pageDecrementBtn}
            {renderPageNumbers}
            {pageIncrementBtn}
            {renderNextBtn}
        </>
    );
}

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
            idUsuario: '',
            lista: [],
            upperPageBound: 3,
            lowerPageBound: 0,
            isPrevBtnActive: 'disabled',
            isNextBtnActive: '',
            pageBound: 3,
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 5,
            mostrarPaginacion: null,
            messagePaginacion: 'Mostranto 0 de 0 Páginas'
        }
        this.refNombre = React.createRef();
        this.refSerie = React.createRef();
        this.refNumeracion = React.createRef();
    }

    handleClick = async (event) => {
        console.log(event.target.id)
        let listid = parseInt(event.target.id);
        this.fillTableComprobante(listid);
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    async componentDidMount() {
        this.fillTableComprobante(1);
    }

    fillTableComprobante = async (paginacion) => {
        try {
            await this.setStateAsync({ paginacion: paginacion });

            const result = await axios.get('/api/comprobante', {
                params: {
                    "posicionPagina": ((this.state.paginacion - 1) * this.state.filasPorPagina),
                    "filasPorPagina": this.state.filasPorPagina
                }
            });

            let totalPaginacion = parseInt(Math.ceil((parseFloat(result.data.total) / this.state.filasPorPagina)));
            let messagePaginacion = `Mostrando ${result.data.result.length} de ${totalPaginacion} Páginas`;

            this.setState({
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
                    "nombre": this.state.nombre.trim(),
                    "serie": this.state.serie.trim(),
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
                                    <div className="custom-control custom-switch">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            id="switch1"
                                            checked={this.state.estado}
                                            onChange={(value) => this.setState({ estado: value.target.checked })} />
                                        <label className="custom-control-label" htmlFor="switch1">Activo o Inactivo</label>
                                    </div>
                                    {/* <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="estado"
                                            checked={this.state.estado}
                                            onChange={(value) => this.setState({ estado: value.target.checked })} />
                                        <label className="form-check-label" htmlFor="estado">
                                            {this.state.estado ? "ACTIVO" : "INACTIVO"}
                                        </label>
                                    </div> */}
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
                                        <th width={50} scope="col">#</th>
                                        <th width={140} scope="col">Nombre</th>
                                        <th width={100} scope="col">Serie</th>
                                        <th width={100} scope="col">Numeración</th>
                                        <th width={100} scope="col">Creación</th>
                                        <th width={100} scope="col">Estado</th>
                                        <th width={120} scope="col">Edición</th>
                                        <th width={120} scope="col">Anular</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.lista.length === 0 ? (
                                            <tr>
                                                <td colSpan="8">¡No hay comprobantes registrados!</td>
                                            </tr>
                                        ) :
                                            this.state.lista.map(function (item, index) {
                                                return (
                                                    <tr key={index}>
                                                        <td>{item.id}</td>
                                                        <td>{item.nombre}</td>
                                                        <td>{item.serie}</td>
                                                        <td>{item.numeracion}</td>
                                                        <td>{<span>{item.fechaRegistro}</span>}{<br></br>}{<span>{timeForma24(item.horaRegistro)}</span>}</td>
                                                        <td className="text-center"><div className={`badge ${item.estado === 1 ? "badge-info" : "badge-danger"}`}>{item.estado === 1 ? "ACTIVO" : "INACTIVO"}</div></td>
                                                        <td><button className="btn btn-outline-dark btn-sm"><i className="bi bi-pencil"></i> Editar</button></td>
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
                                    <PaginacionElement
                                        totalPaginacion={this.state.totalPaginacion}
                                        paginacion={this.state.paginacion}
                                        upperPageBound={this.state.upperPageBound}
                                        lowerPageBound={this.state.lowerPageBound}
                                        isPrevBtnActive={this.state.isPrevBtnActive}
                                        isNextBtnActive={this.state.isNextBtnActive}
                                        pageBound={this.state.pageBound}

                                        handleClick={this.handleClick}
                                    />
                                    {/* <li className="page-item disabled">
                                        <button className="page-link"><i className="bi bi-arrow-left"></i></button>
                                    </li>
                                    <li className="page-item"><button className="page-link" >1</button></li>
                                    <li className="page-item active" aria-current="page">
                                        <span className="page-link">2</span>
                                    </li>
                                    <li className="page-item"><button className="page-link">3</button></li>
                                    <li className="page-item">
                                        <button className="page-link"><i className="bi bi-arrow-right"></i></button>
                                    </li> */}
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