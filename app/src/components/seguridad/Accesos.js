import React from 'react';
// import { Redirect } from 'react-router-dom';
// import { connect } from 'react-redux';
// import { signOut } from '../../redux/actions';
import axios from 'axios';
import NavTree from '../../recursos/js/tree.js';
import loading from '../../recursos/images/loading.gif';
import { showModal, hideModal, clearModal } from '../tools/Tools';

class Accesos extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }

    componentDidMount() {
        NavTree.createBySelector("#nav-tree", {
            searchable: true,
            showEmptyGroups: true,
    
            groupOpenIconClass: "fas",
            groupOpenIcon: "fa-chevron-down",
    
            groupCloseIconClass: "fas",
            groupCloseIcon: "fa-chevron-right",
    
            linkIconClass: "fas",
            linkIcon: "fa-link",
    
            searchPlaceholderText: "Search",
          });
    }

    render() {
        return (
            <>
                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Accesos <small className="text-secondary">LISTA</small></h5>
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
                            <button className="btn btn-outline-info" onClick={() => this.openModal(this.state.idUsuario)}>
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
    <div className="col-4 mx-auto">
      <ul id="nav-tree">
        <li data-icon="fas fa-cloud" id="li0" data-value="li0">
          <span><a href="#">1</a></span>
          <span><i className="fas fa-plane"></i></span>
          <a href="#">extra list</a>
          <span><a href="#">1</a></span>
          <span><i className="fas fa-plane text-danger"></i></span>
        </li>
        <li id="li1" data-value="li1">
          <a href="#">
            Link 1
          </a>
        </li>
        <li id="li2" data-value="li2">
          <span><i className="fas fa-chevron-left"></i></span>
          <a>
            Collapse 1
          </a>
          <span>t</span>
          <ul>
            <li id="li4" data-value="li4">
              <a>
                Collapse 2
              </a>
              <ul>
                <li id="li6" data-value="li6">
                  <a href="#">
                    Link 2
                  </a>
                </li>
                <li id="li7" data-value="li7">
                  <a href="#">
                    Link 3
                  </a>
                </li>
                <li id="li8" data-value="li8">
                  <a>
                    Collapse 3
                  </a>
                  <ul>
                    <li id="li9" data-value="li9">
                      <a href="#">
                        Link 4
                      </a>
                    </li>
                    <li id="li10" data-value="li10">
                      <a href="#">
                        Link 5
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
            <li id="li5" data-value="li5">
              <a href="#">
                Link 6
              </a>
            </li>
          </ul>
        </li>

        <li id="li20" data-value="li20">
          <a>
            Collapse 10
          </a>
          <ul>
            <li id="li40" data-value="li40">
              <a>
                Collapse 20
              </a>
              <ul>
                <li id="li60" data-value="li60">
                  <a href="#">
                    Link 20
                  </a>
                </li>
                <li id="li70" data-value="li70">
                  <a href="#">
                    Link 30
                  </a>
                </li>
                <li id="li80" data-value="li80">
                  <a>
                    Collapse 30
                  </a>
                  <ul>
                    <li id="li90" data-value="li90">
                      <a href="#">
                        Link 40
                      </a>
                    </li>
                    <li id="li100" data-value="li100">
                      <a href="#">
                        Link 50
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
            <li id="li50" data-value="li50">
              <a href="#">
                Link 60
              </a>
            </li>
          </ul>
        </li>

        <li id="li3" data-value="li3">
          <a href="#">
            Link 7
          </a>
        </li>
      </ul>
</div>
</div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="table-responsive">
                            <table className="table table-striped" style={{ borderWidth: '1px', borderStyle: 'inset', borderColor: '#CFA7C9' }}>
                                <thead>
                                    <tr>
                                        <th width="5%">#</th>
                                        <th width="15%">Nombre y Apellidos</th>
                                        <th width="10%">Telefono</th>
                                        <th width="15%">Email</th>
                                        <th width="10%">Perfil</th>
                                        <th width="15%">Empresa</th>
                                        <th width="5%">Estado</th>
                                        <th width="15%">Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* {
                                        this.state.loading ? (
                                            <tr>
                                                <td className="text-center" colSpan="8">
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
                                                <td colSpan="8">¡No hay datos registrados!</td>
                                            </tr>
                                        ) : (
                                            this.state.lista.map((item, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td>{item.id}</td>
                                                        <td>{item.nombres + ' ' + item.apellidos}</td>
                                                        <td>{item.telefono}</td>
                                                        <td>{item.email}</td>
                                                        <td>{item.perfil}</td>
                                                        <td>{item.empresa}</td>
                                                        <td className="text-center"><div className={`badge ${item.estado === 1 ? "badge-info" : "badge-danger"}`}>{item.estado === 1 ? "ACTIVO" : "INACTIVO"}</div></td>             
                                                        <td>
                                                            <button className="btn btn-outline-dark btn-sm" title="Editar" onClick={() => this.openModal(item.idUsuario)}><i className="bi bi-pencil"></i></button>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )
                                    } */}
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
        )
    }
}

export default Accesos