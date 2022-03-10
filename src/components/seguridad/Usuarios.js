import React from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { signOut } from '../../redux/actions';

class Usuarios extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        return (
            <>
                {/* Inicio modal nuevo cliente*/}
                <div className="modal fade" id="modalUsuarios" tabIndex="-1" aria-labelledby="modalUsuariosLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="modalUsuariosLabel"><i className="bi bi-person-plus-fill"></i> Registrar Usuario</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <nav>
                                    <div className="nav nav-tabs" id="nav-tab" role="tablist">
                                        <a className="nav-link active" id="nav-datos-tab" data-toggle="tab" href="#nav-datos" role="tab" aria-controls="nav-datos" aria-selected="true"><i className="bi bi-info-circle"></i> Datos</a>
                                        <a className="nav-link" id="nav-login-tab" data-toggle="tab" href="#nav-login" role="tab" aria-controls="n
                                        " aria-selected="false"><i className="bi bi-person-workspace"></i> Login</a>
                                    </div>
                                </nav>
                                <div className="tab-content" id="nav-tabContent">
                                    <div className="tab-pane fade show active" id="nav-datos" role="tabpanel" aria-labelledby="nav-datos-tab">
                                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                            <form>
                                                <div className="form-group">
                                                    <label htmlFor="nombre">Nombre(s)</label>
                                                    <input type="" className="form-control" id="nombre" placeholder='ingrese nombres del usuario' />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="apellidos">Apellidos</label>
                                                    <input type="" className="form-control" id="apellidos" placeholder='ingrese apellidos del usuario' />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="dni">Dni</label>
                                                    <input type="" className="form-control" id="dni" placeholder='ingrese dni del usuario' />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="genero">Genero</label>
                                                    <select className="form-control" id="genero">
                                                        <option>-- seleccione --</option>
                                                        <option>Masculino</option>
                                                        <option>Femenino</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="direccion">Direccion</label>
                                                    <input type="" className="form-control" id="direccion" placeholder='ingrese dirección del usuario' />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="telefono">Telefono</label>
                                                    <input type="" className="form-control" id="telefono" placeholder='Ingrese telefo no del usuario' />
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                    <div className="tab-pane fade" id="nav-login" role="tabpanel" aria-labelledby="nav-login-tab">
                                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                            <form>                                                
                                                <div className="form-group">
                                                    <label htmlFor="empresa">Empresa</label>
                                                    <select className="form-control" id="empresa">
                                                        <option>-- seleccione --</option>
                                                        <option>Empresa 1</option>
                                                        <option>Empresa 2</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="perfil">Perfil</label>
                                                    <select className="form-control" id="perfil">
                                                        <option>-- seleccione --</option>
                                                        <option>Perfil 1</option>
                                                        <option>Perfil 2</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="representante">¿Representante?</label>
                                                    <select className="form-control" id="representante">
                                                        <option>-- seleccione --</option>
                                                        <option>Representante 1</option>
                                                        <option>Representante 2</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="email">Correo Electrónico</label>
                                                    <input type="email" className="form-control" id="email" placeholder='ingrese dirección de correo electronico' />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="contraseña">Contraseña</label>
                                                    <input type="" className="form-control" id="contraseña" placeholder='Ingrese contraseña' />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="contraseña2">Confirmar Contraseña</label>
                                                    <input type="" className="form-control" id="contraseña2" placeholder='Ingrese contraseña nuevamente' />
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Cerrar</button>
                                <button type="button" className="btn btn-primary">Aceptar</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* fin modal nuevo cliente*/}

                <div className='row pb-3'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <section className="content-header">
                            <h5 className="no-margin"> Usuarios <small style={{ color: 'gray' }}> Lista </small> </h5>
                        </section>
                    </div>
                </div>

                <div className='row'>
                    <div className="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <label>Nuevo usuario</label>
                        <div className="form-group">
                            <button type="button" className="btn btn-success" data-toggle="modal" data-target="#modalUsuarios">
                                <i className="bi bi-plus-lg"></i> Agregar Usuario
                            </button>
                        </div>
                    </div>

                    <div className="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <label>Opción.</label>
                        <div className="form-group">
                            <button className="btn btn-light">
                                <i className="bi bi-arrow-repeat"></i> Recargar
                            </button>
                        </div>
                    </div>

                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                        <label>Filtrar por nombre y apellido o perfil.</label>
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
                                        <th width="15%">Nombre y Apellidos</th>
                                        <th width="10%">Telefono</th>
                                        <th width="15%">Email</th>
                                        <th width="10%">Perfil</th>
                                        <th width="15%">Empresa</th>
                                        <th width="5%">Estado</th>
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

export default Usuarios;