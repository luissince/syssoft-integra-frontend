import React from 'react';
import axios from 'axios';

class Bancos extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nombre: '',
            tipo: '',
            moneda: '',
            representante: '',
            estado: true
        }
        this.nombreRef = React.createRef();
        this.tipoRef = React.createRef();
        this.monedaRef = React.createRef();
        this.representanteRef = React.createRef();
    }

    onEventGuardar = async () => {
        if (this.state.nombre === '') {
            this.nombreRef.current.focus();
        } else if (this.state.tipo === '') {
            this.tipoRef.current.focus();
        } else if (this.state.moneda === '') {
            this.monedaRef.current.focus();
        } else if (this.state.representante === '') {
            this.representanteRef.current.focus();
        } else {
            try {
                let result = await axios.post("/api/banco", {
                    "idBanco": "",
                    "nombre": this.state.nombre,
                    "tipo": this.state.tipo,
                    "moneda": this.state.moneda,
                    "representante": this.state.representante,
                    "estado": this.state.estado,
                });
                console.log(result);
            } catch (error) {
                console.log(error.response)
            }
        }
    }

    render() {
        return (
            <>
                {/* Inicio modal nuevo cliente*/}
                <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel"><i className="bi bi-bank"></i> Registrar Banco</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className='row py-1'>
                                    <div className='col-lg-4 col-md-4 col-sm-12 col-xs-12'>
                                        <label>Nombre Banco: </label>
                                    </div>
                                    <div className='col-lg-8 col-md-8 col-sm-12 col-xs-12'>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder='Ingrese nombre banco'
                                            ref={this.nombreRef}
                                            value={this.state.nombre}
                                            onChange={(event) => this.setState({ nombre: event.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className='row py-1'>
                                    <div className='col-lg-4 col-md-4 col-sm-12 col-xs-12'>
                                        <label>Tipo de Cuenta: </label>
                                    </div>
                                    <div className='col-lg-8 col-md-8 col-sm-12 col-xs-12'>
                                        <input type="" className="form-control" placeholder='corriente, recaudadora, etc'
                                            ref={this.tipoRef}
                                            value={this.state.tipo}
                                            onChange={(event) => this.setState({ tipo: event.target.value })} />
                                    </div>
                                </div>
                                <div className='row py-1'>
                                    <div className='col-lg-4 col-md-4 col-sm-12 col-xs-12'>
                                        <label>Moneda: </label>
                                    </div>
                                    <div className='col-lg-8 col-md-8 col-sm-12 col-xs-12'>
                                        <input type="" className="form-control" placeholder='Soles, Dolares, etc'
                                            ref={this.monedaRef}
                                            value={this.state.moneda}
                                            onChange={(event) => this.setState({ moneda: event.target.value })} />
                                    </div>
                                </div>
                                <div className='row py-1'>
                                    <div className='col-lg-4 col-md-4 col-sm-12 col-xs-12'>
                                        <label>Representante: </label>
                                    </div>
                                    <div className='col-lg-8 col-md-8 col-sm-12 col-xs-12'>
                                        <input type="" className="form-control" placeholder='inmobiliaria'
                                            ref={this.representanteRef}
                                            value={this.state.representante}
                                            onChange={(event) => this.setState({ representante: event.target.value })} />
                                    </div>
                                </div>
                                <div className='row py-1'>
                                    <div className='col-lg-4 col-md-4 col-sm-12 col-xs-12'>
                                        <label>Estado: </label>
                                    </div>
                                    <div className='col-lg-8 col-md-8 col-sm-12 col-xs-12'>
                                        <div className="form-check form-switch">
                                            <form>
                                                <div className="custom-control custom-switch">
                                                    <input type="checkbox" className="custom-control-input" id="switch1"
                                                        checked={this.state.estado}
                                                        onChange={(event) => this.setState({ estado: event.target.checked })} />
                                                    <label className="custom-control-label" htmlFor="switch1">Active o desactive</label>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={this.onEventGuardar}>Guardar</button>
                                <button type="button" className="btn btn-danger" data-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* fin modal nuevo cliente*/}

                <div className='row pb-3'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <section className="content-header">
                            <h5 className="no-margin"> Bancos <small style={{ color: 'gray' }}> Lista </small> </h5>
                        </section>
                    </div>
                </div>

                <div className='row'>
                    <div className="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <label>Nuevo Banco</label>
                        <div className="form-group">
                            <button type="button" className="btn btn-success" data-toggle="modal" data-target="#exampleModal">
                                <i className="bi bi-plus-lg"></i> Agregar Banco
                            </button>
                        </div>
                    </div>

                    <div className="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <label>Opción.</label>
                        <div className="form-group">
                            <button className="btn btn-secondary">
                                <i className="bi bi-arrow-repeat"></i> Recargar
                            </button>
                        </div>
                    </div>

                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                        <label>Filtrar por banco</label>
                        <div className="form-group">
                            <div className="input-group mb-3">
                                <input type="text" className="form-control" placeholder="Ingrese para buscar" aria-label="Recipient's username" aria-describedby="basic-addon2" />
                                <div className="input-group-append">
                                    <button className="btn btn-outline-secondary" type="button">Button</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="table-responsive">
                            <table className="table table-striped" style={{ borderWidth: '1px', borderStyle: 'inset', borderColor: '#CFA7C9' }}>
                                <thead>
                                    <tr>
                                        <th width="5%" className="text-center">#</th>
                                        <th width="17%">Banco</th>
                                        <th width="15%">Tipo Cuenta</th>
                                        <th width="10%">Moneda</th>
                                        <th width="20%">Número Cuenta</th>
                                        <th width="15%">Representante</th>
                                        <th width="15%" colSpan="2">Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>

                                </tbody>

                            </table>
                        </div>
                        <div className="col-md-12" style={{ textAlign: 'center' }}>
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