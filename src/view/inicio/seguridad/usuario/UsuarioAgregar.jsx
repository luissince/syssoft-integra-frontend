import React from 'react';
import {
  keyNumberPhone,
  keyNumberInteger,
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isEmpty,
  keyNumberFloat,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../components/Container';
import CustomComponent from '../../../../model/class/custom-component';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import {
  addUsuario,
  comboPerfil,
} from '../../../../network/rest/principal.network';
import { CANCELED } from '../../../../model/types/types';
import { SpinnerView } from '../../../../components/Spinner';
import Title from '../../../../components/Title';
import { TabContent, TabHead, TabHeader, TabPane } from '../../../../components/Tab';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';
import Select from '../../../../components/Select';
import { Switches } from '../../../../components/Checks';

class UsuarioAgregar extends CustomComponent {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

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
      clave: '',
      configClave: '',
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

  async componentDidMount() {
    await this.loadData();
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  loadData = async () => {
    const [perfiles] = await Promise.all([
      this.fetchComboPerfil()
    ]);

    this.setState({
      perfiles,
      tipo: true,
      loading: false,
    });
  };

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

    if (isEmpty(this.state.activeLogin && this.state.clave)) {
      alertWarning(
        'Usuario',
        'Ingrese su clave para el inicio de sesión.',
        () => {
          this.onFocusTab('login-tab', 'login');
          this.refClave.current.focus();
        },
      );
      return;
    }

    if (this.state.activeLogin && isEmpty(this.state.configClave)) {
      alertWarning(
        'Usuario',
        'Ingrese nuevamente su clave para el inicio de sesión.',
        () => {
          this.onFocusTab('login-tab', 'login');
          this.refConfigClave.current.focus();
        },
      );
      return;
    }

    if (this.state.activeLogin && this.state.clave !== this.state.configClave) {
      alertWarning('Usuario', 'Las contraseñas con coinciden.', () => {
        this.onFocusTab('login-tab', 'login');
        this.refClave.current.focus();
      });
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
          clave: this.state.clave.trim(),
        };

        alertInfo('Usuario', 'Procesando información...');

        const response = await addUsuario(data);

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
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title='Usuario'
          subTitle='AGREGAR'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column>
            <TabHeader>
              <TabHead id='datos' isActive={true}>
                <i className="bi bi-info-circle"></i> Datos
              </TabHead>

              <TabHead id='login'>
                <i className="bi bi-person-workspace"></i> Login
              </TabHead>
            </TabHeader>

            <TabContent>
              <TabPane id='datos' isActive={true}>
                <Row>
                  <Column formGroup={true}>
                    <Input
                      label={<>Dni: <i className="fa fa-asterisk text-danger small"></i></>}
                      placeholder="Ingrese el numero de DNI"
                      ref={this.refDni}
                      value={this.state.dni}
                      onChange={(event) => {
                        if (event.target.value.trim().length > 0) {
                          this.setState({
                            dni: event.target.value,
                          });
                        } else {
                          this.setState({
                            dni: event.target.value,
                          });
                        }
                      }}
                      onKeyDown={keyNumberInteger}
                    />
                  </Column>
                </Row>

                <Row>
                  <Column className='col-md-6 col-12' formGroup={true}>
                    <Input
                      group={true}
                      label={<>Nombre(s){' '}<i className="fa fa-asterisk text-danger small"></i></>}
                      placeholder="Ingrese los nombres"
                      id="nombres"
                      value={this.state.nombres}
                      ref={this.refNombres}
                      onChange={(event) => {
                        if (event.target.value.trim().length > 0) {
                          this.setState({
                            nombres: event.target.value,
                          });
                        } else {
                          this.setState({
                            nombres: event.target.value,
                          });
                        }
                      }}
                    />
                  </Column>

                  <Column className='col-md-6 col-12' formGroup={true}>
                    <Input
                      group={true}
                      label={<>Apellidos{' '}<i className="fa fa-asterisk text-danger small"></i></>}
                      id="apellidos"
                      placeholder="ingrese apellidos del usuario"
                      ref={this.refApellidos}
                      value={this.state.apellidos}
                      onChange={(event) => {
                        if (event.target.value.trim().length > 0) {
                          this.setState({
                            apellidos: event.target.value,
                          });
                        } else {
                          this.setState({
                            apellidos: event.target.value,
                          });
                        }
                      }}
                    />
                  </Column>
                </Row>

                <Row>
                  <Column formGroup={true}>
                    <Select
                      group={true}
                      label={<>Genero <i className="fa fa-asterisk text-danger small"></i></>}
                      id="genero"
                      value={this.state.genero}
                      ref={this.refGenero}
                      onChange={(event) => {
                        if (event.target.value.trim().length > 0) {
                          this.setState({
                            genero: event.target.value,
                          });
                        } else {
                          this.setState({
                            genero: event.target.value,
                          });
                        }
                      }}>
                      <option value="">-- Seleccione --</option>
                      <option value="1">Masculino</option>
                      <option value="2">Femenino</option>
                    </Select>
                  </Column>
                </Row>

                <Row>
                  <Column formGroup={true}>
                    <Input
                      group={true}
                      label={<>Dirección <i className="fa fa-asterisk text-danger small"></i></>}
                      id="direccion"
                      placeholder="Ingrese la dirección"
                      ref={this.refDireccion}
                      value={this.state.direccion}
                      onChange={(event) => {
                        if (event.target.value.trim().length > 0) {
                          this.setState({
                            direccion: event.target.value,
                          });
                        } else {
                          this.setState({
                            direccion: event.target.value,
                          });
                        }
                      }}
                    />
                  </Column>
                </Row>

                <Row>
                  <Column className='col-md-6 col-12' formGroup={true}>
                    <Input
                      group={true}
                      label={<>Telefono o celular</>}
                      placeholder="Ingrese el N° de telefono"
                      id="telefono"
                      value={this.state.telefono}
                      ref={this.refTelefono}
                      onChange={(event) => {
                        if (event.target.value.trim().length > 0) {
                          this.setState({
                            telefono: event.target.value,
                          });
                        } else {
                          this.setState({
                            telefono: event.target.value,
                          });
                        }
                      }}
                      onKeyDown={keyNumberPhone}
                    />
                  </Column>

                  <Column className='col-md-6 col-12' formGroup={true}>
                    <Input
                      group={true}
                      label={<>Correo Electrónico <i className="fa fa-asterisk text-danger small"></i></>}
                      type="email"
                      id="email"
                      placeholder="Ingrese el email"
                      ref={this.refEmail}
                      value={this.state.email}
                      onChange={(event) => {
                        if (event.target.value.trim().length > 0) {
                          this.setState({
                            email: event.target.value,
                          });
                        } else {
                          this.setState({
                            email: event.target.value,
                          });
                        }
                      }}
                    />
                  </Column>
                </Row>
              </TabPane>

              <TabPane id='login'>
                <Row>
                  <Column formGroup={true}>
                    <Select
                      group={true}
                      label={<>Perfil</>}
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
                    </Select>
                  </Column>
                </Row>

                <Row>
                  <Column className='col-md-6 col-12' formGroup={true}>
                    <Select
                      group={true}
                      label={<>Representante</>}
                      id="representante"
                      value={this.state.representante}
                      ref={this.refRepresentante}
                      onChange={(event) => {
                        if (event.target.value.trim().length > 0) {
                          this.setState({
                            representante: event.target.value,
                          });
                        } else {
                          this.setState({
                            representante: event.target.value,
                          });
                        }
                      }}>
                      <option value="">-- seleccione --</option>
                      <option value="1">Si</option>
                      <option value="2">No</option>
                    </Select>
                  </Column>

                  <Column className='col-md-6 col-12' formGroup={true}>
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
                  </Column>
                </Row>

                {/* Start Login */}
                <Row>
                  <Column>
                    <Switches
                      id={"cbActiveLogin"}
                      checked={this.state.activeLogin}
                      onChange={(value) =>
                        this.setState({ activeLogin: value.target.checked })
                      }
                    >
                      Activar Inicio de Sesión
                    </Switches>
                  </Column>
                </Row>

                <Row>
                  <Column formGroup={true}>
                    <Input
                      group
                      label="Usuario"
                      id="usuario"
                      value={this.state.usuario}
                      ref={this.refUsuario}
                      onChange={(event) => {
                        if (event.target.value.trim().length > 0) {
                          this.setState({
                            usuario: event.target.value,
                          });
                        } else {
                          this.setState({
                            usuario: event.target.value,
                          });
                        }
                      }}
                      placeholder="Ingrese el usuario"
                      disabled={!this.state.activeLogin}
                    />
                  </Column>
                </Row>

                {this.state.tipo ? (
                  <Row>
                    <Column className='col-md-6 col-12' formGroup={true}>
                      <Input
                        group={true}
                        label={<>Contraseña <i className="fa fa-asterisk text-danger small"></i></>}
                        type="password"
                        id="contraseña"
                        placeholder="********"
                        disabled={!this.state.activeLogin}
                        ref={this.refClave}
                        value={this.state.clave}
                        onChange={(event) => {
                          if (event.target.value.trim().length > 0) {
                            this.setState({
                              clave: event.target.value,
                            });
                          } else {
                            this.setState({
                              clave: event.target.value,
                            });
                          }
                        }}
                        onKeyDown={keyNumberFloat}
                      />
                    </Column>

                    <Column className='col-md-6 col-12' formGroup={true}>
                      <Input
                        group={true}
                        label={<>Confirmar Contraseña <i className="fa fa-asterisk text-danger small"></i></>}
                        type="password"
                        id="contraseña2"
                        value={this.state.configClave}
                        ref={this.refConfigClave}
                        onChange={(event) => {
                          if (event.target.value.trim().length > 0) {
                            this.setState({
                              configClave: event.target.value,
                            });
                          } else {
                            this.setState({
                              configClave: event.target.value,
                            });
                          }
                        }}
                        placeholder="Ingrese contraseña nuevamente"
                        disabled={!this.state.activeLogin}
                      />
                    </Column>
                  </Row>
                ) : null}

                {/* End Login */}
              </TabPane>
            </TabContent>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-success"
              onClick={() => this.handleGuardar()}
            >
              <i className='fa fa-save'></i> Guardar
            </Button>
            {" "}
            <Button
              className="btn-danger"
              onClick={() => this.props.history.goBack()}
            >
              <i className='fa fa-close'></i>  Cerrar
            </Button>
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedUsuarioAgregar = connect(mapStateToProps, null)(UsuarioAgregar);

export default ConnectedUsuarioAgregar;
