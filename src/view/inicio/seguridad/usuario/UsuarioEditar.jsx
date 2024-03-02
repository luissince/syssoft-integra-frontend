import React from 'react';
import {
  keyNumberPhone,
  keyNumberInteger,
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  spinnerLoading,
  isEmpty,
  isText,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../components/Container';
import CustomComponent from '../../../../model/class/custom-component';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import {
  comboPerfil,
  getIdUsuario,
  updateUsuario,
} from '../../../../network/rest/principal.network';
import { CANCELED } from '../../../../model/types/types';

class UsuarioEditar extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

      idUsuario: '',

      nombres: '',
      apellidos: '',
      dni: '',
      genero: '',
      direccion: '',
      telefono: '',
      email: '',

      idPerfil: '',
      perfiles: [],
      representante: '',
      estado: '1',
      usuario: '',
      tipo: false,
      activeLogin: false,
    };

    this.refNombres = React.createRef();
    this.refApellidos = React.createRef();
    this.refDni = React.createRef();
    this.refGenero = React.createRef();
    this.refDireccion = React.createRef();
    this.refTelefono = React.createRef();
    this.refEmail = React.createRef();

    this.refPerfil = React.createRef();
    this.refRepresentante = React.createRef();
    // this.refEstado = React.createRef()
    this.refUsuario = React.createRef();
    this.refClave = React.createRef();
    this.refConfigClave = React.createRef();

    this.abortController = new AbortController();
  }

  componentDidMount() {
    const url = this.props.location.search;
    const idUsuario = new URLSearchParams(url).get('idUsuario');
    if (isText(idUsuario)) {
      this.loadDataId(idUsuario);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  loadDataId = async (id) => {
    const [perfiles, usuario] = await Promise.all([
      this.fetchComboPerfil(),
      this.fetchObtenerUsuario(id),
    ]);

    this.setState({
      perfiles,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      dni: usuario.dni,
      genero: usuario.genero,
      direccion: usuario.direccion,
      telefono: usuario.telefono,
      email: usuario.email,

      idPerfil: usuario.idPerfil,
      representante: usuario.representante,
      estado: usuario.estado,
      activeLogin: usuario.login,
      usuario: usuario.usuario,

      idUsuario: usuario.idUsuario,
      tipo: false,
      loading: false,
    });
  };

  async fetchObtenerUsuario(id) {
    const params = {
      idUsuario: id,
    };
    const response = await getIdUsuario(params, this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchComboPerfil() {
    const response = await comboPerfil(this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  handleGuardar() {
    if (isEmpty(this.state.dni)) {
      alertWarning('Usuario', 'Ingrese el numero de DNI.', () => {
        this.onFocusTab('datos-tab', 'datos');
        this.refDni.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.nombres)) {
      alertWarning('Usuario', 'Ingrese los nombres.', () => {
        this.onFocusTab('datos-tab', 'datos');
        this.refNombres.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.apellidos)) {
      alertWarning('Usuario', 'Ingrese los apellidos.', () => {
        this.onFocusTab('datos-tab', 'datos');
        this.refApellidos.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.genero)) {
      alertWarning('Usuario', 'Seleccione el genero.', () => {
        this.onFocusTab('datos-tab', 'datos');
        this.refGenero.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.direccion)) {
      alertWarning('Usuario', 'Ingrese la dirección.', () => {
        this.onFocusTab('datos-tab', 'datos');
        this.refDireccion.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.activeLogin && this.state.usuario)) {
      alertWarning(
        'Usuario',
        'Ingrese su usuario para el inicio de sesión.',
        () => {
          this.onFocusTab('login-tab', 'login');
          this.refUsuario.current.focus();
        },
      );
      return;
    }

    alertDialog('Usuario', '¿Está seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          //datos
          nombres: this.state.nombres.trim(),
          apellidos: this.state.apellidos.trim(),
          dni: this.state.dni.toString().trim(),
          genero: this.state.genero,
          direccion: this.state.direccion.trim(),
          telefono: this.state.telefono.toString().trim(),
          email: this.state.email.trim(),
          //login
          idPerfil: this.state.idPerfil.trim(),
          representante: this.state.representante,
          estado: this.state.estado,
          activeLogin: this.state.activeLogin,
          usuario: this.state.usuario.trim(),

          //idUsuario
          idUsuario: this.state.idUsuario,
        };

        alertInfo('Usuario', 'Procesando información...');

        const response = await updateUsuario(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Usuario', response.data, () => {
            this.props.history.goBack();
          });
        }

        if (response instanceof ErrorResponse) {
          alertWarning('Usuario', response.getMessage());
        }
      }
    });
  }

  onFocusTab(idTab, idContent) {
    if (!document.getElementById(idTab).classList.contains('active')) {
      for (let child of document.getElementById('myTab').childNodes) {
        child.childNodes[0].classList.remove('active');
      }
      for (let child of document.getElementById('myTabContent').childNodes) {
        child.classList.remove('show', 'active');
      }
      document.getElementById(idTab).classList.add('active');
      document.getElementById(idContent).classList.add('show', 'active');
    }
  }

  render() {
    return (
      <ContainerWrapper>
        {this.state.loading && spinnerLoading(this.state.msgLoading)}

        <div className="row">
          <div className="col">
            <div className="form-group">
              <h5>
                <span role="button" onClick={() => this.props.history.goBack()}>
                  <i className="bi bi-arrow-left-short"></i>
                </span>
                Editar Usuario
              </h5>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <ul className="nav nav-tabs" id="myTab" role="tablist">
              <li className="nav-item" role="presentation">
                <a
                  className="nav-link active"
                  id="datos-tab"
                  data-bs-toggle="tab"
                  href="#datos"
                  role="tab"
                  aria-controls="datos"
                  aria-selected={true}
                >
                  <i className="bi bi-info-circle"></i> Datos
                </a>
              </li>
              <li className="nav-item" role="presentation">
                <a
                  className="nav-link"
                  id="login-tab"
                  data-bs-toggle="tab"
                  href="#login"
                  role="tab"
                  aria-controls="login"
                  aria-selected={false}
                >
                  <i className="bi bi-person-workspace"></i> Login
                </a>
              </li>
            </ul>

            <div className="tab-content pt-2" id="myTabContent">
              <div
                className="tab-pane fade show active"
                id="datos"
                role="tabpanel"
                aria-labelledby="datos-tab"
              >
                <div className="form-group">
                  <label htmlFor="dni">
                    Dni <i className="fa fa-asterisk text-danger small"></i>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="dni"
                    value={this.state.dni}
                    ref={this.refDni}
                    onChange={(event) => {
                      if (event.target.value.trim().length > 0) {
                        this.setState({
                          dni: event.target.value,
                          messageWarning: '',
                        });
                      } else {
                        this.setState({
                          dni: event.target.value,
                          messageWarning: 'Ingrese el numero de DNI',
                        });
                      }
                    }}
                    placeholder="Ingrese el numero de DNI"
                    onKeyPress={keyNumberInteger}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="nombres">
                      Nombre(s){' '}
                      <i className="fa fa-asterisk text-danger small"></i>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="nombres"
                      value={this.state.nombres}
                      ref={this.refNombres}
                      onChange={(event) => {
                        if (event.target.value.trim().length > 0) {
                          this.setState({
                            nombres: event.target.value,
                            messageWarning: '',
                          });
                        } else {
                          this.setState({
                            nombres: event.target.value,
                            messageWarning: 'Ingrese los nombres',
                          });
                        }
                      }}
                      placeholder="Ingrese los nombres"
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="apellidos">
                      Apellidos{' '}
                      <i className="fa fa-asterisk text-danger small"></i>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="apellidos"
                      value={this.state.apellidos}
                      ref={this.refApellidos}
                      onChange={(event) => {
                        if (event.target.value.trim().length > 0) {
                          this.setState({
                            apellidos: event.target.value,
                            messageWarning: '',
                          });
                        } else {
                          this.setState({
                            apellidos: event.target.value,
                            messageWarning: 'Ingrese los apellidos',
                          });
                        }
                      }}
                      placeholder="ingrese apellidos del usuario"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="genero">
                    Genero <i className="fa fa-asterisk text-danger small"></i>
                  </label>
                  <select
                    className="form-control"
                    id="genero"
                    value={this.state.genero}
                    ref={this.refGenero}
                    onChange={(event) => {
                      if (event.target.value.trim().length > 0) {
                        this.setState({
                          genero: event.target.value,
                          messageWarning: '',
                        });
                      } else {
                        this.setState({
                          genero: event.target.value,
                          messageWarning: 'Seleccione el genero.',
                        });
                      }
                    }}
                  >
                    <option value="">-- Seleccione --</option>
                    <option value="1">Masculino</option>
                    <option value="2">Femenino</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="direccion">
                    Dirección{' '}
                    <i className="fa fa-asterisk text-danger small"></i>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="direccion"
                    value={this.state.direccion}
                    ref={this.refDireccion}
                    onChange={(event) => {
                      if (event.target.value.trim().length > 0) {
                        this.setState({
                          direccion: event.target.value,
                          messageWarning: '',
                        });
                      } else {
                        this.setState({
                          direccion: event.target.value,
                          messageWarning: 'Ingrese el N° de dirección',
                        });
                      }
                    }}
                    placeholder="Ingrese la dirección"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="telefono">Telefono o celular</label>
                    <input
                      type="text"
                      className="form-control"
                      id="telefono"
                      value={this.state.telefono}
                      ref={this.refTelefono}
                      onChange={(event) => {
                        if (event.target.value.trim().length > 0) {
                          this.setState({
                            telefono: event.target.value,
                            messageWarning: '',
                          });
                        } else {
                          this.setState({
                            telefono: event.target.value,
                            messageWarning: 'Ingrese el N° de telefono',
                          });
                        }
                      }}
                      onKeyPress={keyNumberPhone}
                      placeholder="Ingrese el N° de telefono"
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label htmlFor="email">Correo Electrónico</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={this.state.email}
                      ref={this.refEmail}
                      onChange={(event) => {
                        if (event.target.value.trim().length > 0) {
                          this.setState({
                            email: event.target.value,
                            messageWarning: '',
                          });
                        } else {
                          this.setState({
                            email: event.target.value,
                            messageWarning: 'Ingrese el email',
                          });
                        }
                      }}
                      placeholder="Ingrese el email"
                    />
                  </div>
                </div>
              </div>

              <div
                className="tab-pane fade"
                id="login"
                role="tabpanel"
                aria-labelledby="login-tab"
              >
                <div className="form-group">
                  <label htmlFor="perfil">Perfil</label>
                  <select
                    className="form-control"
                    ref={this.refPerfil}
                    value={this.state.idPerfil}
                    onChange={(event) =>
                      this.setState({ idPerfil: event.target.value })
                    }
                  >
                    <option value="">- Seleccione -</option>
                    {this.state.perfiles.map((item, index) => (
                      <option key={index} value={item.idPerfil}>
                        {item.descripcion}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="representante">¿Representante?</label>
                    <select
                      className="form-control"
                      id="representante"
                      value={this.state.representante}
                      ref={this.refRepresentante}
                      onChange={(event) => {
                        if (event.target.value.trim().length > 0) {
                          this.setState({
                            representante: event.target.value,
                            messageWarning: '',
                          });
                        } else {
                          this.setState({
                            representante: event.target.value,
                            messageWarning: 'Seleccione si es representante',
                          });
                        }
                      }}
                    >
                      <option value="">-- seleccione --</option>
                      <option value="1">Si</option>
                      <option value="2">No</option>
                    </select>
                  </div>
                  <div className="form-group col-md-6">
                    <label htmlFor="estado">Estado</label>
                    <select
                      className="form-control"
                      id="estado"
                      value={this.state.estado}
                      // ref={this.refEstado}
                      onChange={(event) =>
                        this.setState({ estado: event.target.value })
                      }
                    >
                      <option value="1">Activo</option>
                      <option value="2">Inactivo</option>
                    </select>
                  </div>
                </div>

                {/* Start Login */}
                <div className="form-group">
                  <label>
                    <div className="custom-control custom-switch">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="cbActiveLogin"
                        checked={this.state.activeLogin}
                        onChange={(value) =>
                          this.setState({ activeLogin: value.target.checked })
                        }
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="cbActiveLogin"
                      >
                        Usar login
                      </label>
                    </div>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="usuario"
                    value={this.state.usuario}
                    ref={this.refUsuario}
                    onChange={(event) => {
                      if (event.target.value.trim().length > 0) {
                        this.setState({
                          usuario: event.target.value,
                          messageWarning: '',
                        });
                      } else {
                        this.setState({
                          usuario: event.target.value,
                          messageWarning: 'Ingrese el usuario',
                        });
                      }
                    }}
                    placeholder="Ingrese el usuario"
                    disabled={!this.state.activeLogin}
                  />
                </div>

                {/* End Login */}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="form-group">
              <button
                type="button"
                className="btn btn-warning"
                onClick={() => this.handleGuardar()}
              >
                <i className='fa fa-edit'></i> Actualizar
              </button>
              {" "}
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => this.props.history.goBack()}
              >
                <i className='fa fa-close'></i>  Cerrar
              </button>
            </div>
          </div>
        </div>
      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

export default connect(mapStateToProps, null)(UsuarioEditar);
