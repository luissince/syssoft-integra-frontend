import React from 'react';
// import { Redirect } from 'react-router-dom';
// import { connect } from 'react-redux';
// import { signOut } from '../../redux/actions';
// import axios from 'axios';
import NavTree from '../../recursos/js/tree.js';
// import loading from '../../recursos/images/loading.gif';
// import { showModal, hideModal, clearModal } from '../tools/Tools';

class Accesos extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  componentDidMount() {
    NavTree.createBySelector("#nav-tree", {
      searchable: false,
      showEmptyGroups: true,

      groupOpenIconClass: "fas",
      groupOpenIcon: "fa-folder-open",

      groupCloseIconClass: "fas",
      groupCloseIcon: "fa-folder",

      linkIconClass: "fas",
      linkIcon: "fa-th",

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

        <div className='row'>
          <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
            <label>Empresa: </label>
            <div className='form-group'>
              <input
                type="text"
                className="form-control"
                placeholder='Ingrese la empresa' />
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
            <label>Perfil: </label>
            <div className='form-group'>
              <input
                type="text"
                className="form-control"
                placeholder='Ingrese el perfil' />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-12 col-lg-12 col-md-12 col-sm-4 col-12">
            <ul id="nav-tree">
              <li data-value="li1">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" value="" id="idDashboard" />
                  <label className="form-check-label" htmlFor="idDashboard">
                    Dashboard
                  </label>
                </div>
              </li>

              <li id="li2" data-value="li2">
                <button type="button" className="btn">
                  Seguridad
                </button>
                <ul>
                  <li id="li3" data-value="li3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="" id="idPerfiles" />
                      <label className="form-check-label" htmlFor="idPerfiles">
                        Perfiles
                      </label>
                    </div>
                  </li>
                  <li id="li4" data-value="li4">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="" id="idUsuarios" />
                      <label className="form-check-label" htmlFor="idUsuarios">
                        Usuarios
                      </label>
                    </div>
                  </li>
                  <li id="li5" data-value="li5">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="" id="idAccesos" />
                      <label className="form-check-label" htmlFor="idAccesos">
                        Accessos
                      </label>
                    </div>
                  </li>
                </ul>
              </li>

              <li id="li6" data-value="li6">
                <button type="button" className="btn">
                  Facturación
                </button>
                <ul>
                  <li id="li7" data-value="li7">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="" id="idClientes" />
                      <label className="form-check-label" htmlFor="idClientes">
                        Clientes
                      </label>
                    </div>
                  </li>
                  <li id="li8" data-value="li8">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="" id="idVentas" />
                      <label className="form-check-label" htmlFor="idVentas">
                        Ventas
                      </label>
                    </div>
                  </li>
                  <li id="li9" data-value="li9">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="" id="idCreditos" />
                      <label className="form-check-label" htmlFor="idCreditos">
                        Créditos
                      </label>
                    </div>
                  </li>
                  <li id="li10" data-value="li10">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="" id="idCobros" />
                      <label className="form-check-label" htmlFor="idCobros">
                        Cobros
                      </label>
                    </div>
                  </li>
                </ul>
              </li>

              <li id="li11" data-value="li11">
                <button type="button" className="btn">
                  Logistica
                </button>
                <ul>
                  <li id="li12" data-value="li12">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="" id="idManzanas" />
                      <label className="form-check-label" htmlFor="idManzanas">
                        Manzanas
                      </label>
                    </div>
                  </li>
                  <li id="li13" data-value="li13">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="" id="idLotes" />
                      <label className="form-check-label" htmlFor="idLotes">
                        Lotes
                      </label>
                    </div>
                  </li>
                </ul>
              </li>

              <li id="li14" data-value="li14">
                <button type="button" className="btn">
                  Logistica
                </button>
                <ul>
                  <li id="li15" data-value="li15">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="" id="idConceptos" />
                      <label className="form-check-label" htmlFor="idConceptos">
                        Conceptos
                      </label>
                    </div>
                  </li>
                  <li id="li16" data-value="li16">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="" id="idGastos" />
                      <label className="form-check-label" htmlFor="idGastos">
                        Gastos
                      </label>
                    </div>
                  </li>
                </ul>
              </li>

              <li id="li7" data-value="li17">
                <button type="button" className="btn">
                  Ajustes
                </button>
                <ul>
                  <li id="li18" data-value="li18">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="" id="idComprobantes" />
                      <label className="form-check-label" htmlFor="idComprobantes">
                        Comprobantes
                      </label>
                    </div>
                  </li>
                  <li id="li19" data-value="li19">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="" id="idMonedas" />
                      <label className="form-check-label" htmlFor="idMonedas">
                        Monedas
                      </label>
                    </div>
                  </li>
                  <li id="li20" data-value="li20">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="" id="idBancos" />
                      <label className="form-check-label" htmlFor="idBancos">
                        Bancos
                      </label>
                    </div>
                  </li>
                  <li id="li21" data-value="li21">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="" id="idSedes" />
                      <label className="form-check-label" htmlFor="idSedes">
                        Sedes
                      </label>
                    </div>
                  </li>
                  <li id="li22" data-value="li22">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="" id="idProyectos" />
                      <label className="form-check-label" htmlFor="idProyectos">
                        Proyectos
                      </label>
                    </div>
                  </li>
                </ul>
              </li>

              <li id="li23" data-value="li23">
                <button type="button" className="btn">
                  Logistica
                </button>
                <ul>
                  <li id="li24" data-value="li24">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="" id="idRVentas" />
                      <label className="form-check-label" htmlFor="idRVentas">
                        R. Ventas
                      </label>
                    </div>
                  </li>
                  <li id="li25" data-value="li25">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="" id="idRFinanciero" />
                      <label className="form-check-label" htmlFor="idRFinanciero">
                        R. Financiero
                      </label>
                    </div>
                  </li>
                  <li id="li26" data-value="li26">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="" id="idRLotes" />
                      <label className="form-check-label" htmlFor="idRLotes">
                        R. Lotes
                      </label>
                    </div>
                  </li>
                  <li id="li27" data-value="li27">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="" id="idRClientes" />
                      <label className="form-check-label" htmlFor="idRClientes">
                        R. Clientes
                      </label>
                    </div>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>


      </>
    )
  }
}

export default Accesos