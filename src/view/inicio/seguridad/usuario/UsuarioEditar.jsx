import React from 'react';
import {
  keyNumberPhone,
  keyNumberInteger,
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
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
import { SpinnerView } from '../../../../components/Spinner';
import Title from '../../../../components/Title';
import { TabContent, TabHead, TabHeader, TabPane } from '../../../../components/Tab';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Button from '../../../../components/Button';
import Select from '../../../../components/Select';
import Input from '../../../../components/Input';
import { Switches } from '../../../../components/Checks';

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
      activeLogin: usuario.login === 1 ? true : false,
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
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title='Usuario'
          subTitle='EDITAR'
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
                      group={true}
                      label={<>Dni: <i className="fa fa-asterisk text-danger small"></i></>}
                      placeholder="Ingrese el numero de DNI"
                      ref={this.refDni}
                      value={this.state.dni}
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
                      onKeyDown={keyNumberInteger}
                    />
                  </Column>
                </Row>

                <Row>
                  <Column className='col-md-6 col-12' formGroup={true}>
                    <Input
                      group={true}
                      label={<>Nombre(s){' '}<i className="fa fa-asterisk text-danger small"></i></>}
                      placeholder="Ingrese el nombre"
                      ref={this.refNombres}
                      value={this.state.nombres}
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
                    />
                  </Column>

                  <Column className='col-md-6 col-12' formGroup={true}>
                    <Input
                      group={true}
                      label={<>Apellidos{' '}<i className="fa fa-asterisk text-danger small"></i></>}
                      placeholder="ingrese apellidos del usuario"
                      ref={this.refApellidos}
                      value={this.state.apellidos}
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
                    />
                  </Column>
                </Row>

                <Row>
                  <Column formGroup>
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
                    </Select>
                  </Column>
                </Row>

                <Row>
                  <Column formGroup>
                    <Input
                      group={true}
                      label={<>Dirección <i className="fa fa-asterisk text-danger small"></i></>}
                      placeholder="Ingrese la dirección"
                      ref={this.refDireccion}
                      value={this.state.direccion}
                      onChange={(event) => {
                        if (event.target.value.trim().length > 0) {
                          this.setState({
                            direccion: event.target.value,
                            messageWarning: '',
                          });
                        } else {
                          this.setState({
                            direccion: event.target.value,
                            messageWarning: 'Ingrese la dirección',
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
                      label={<>Telefono o celular <i className="fa fa-asterisk text-danger small"></i></>}
                      placeholder="Ingrese el N° de telefono"
                      ref={this.refTelefono}
                      value={this.state.telefono}
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
                      onKeyDown={keyNumberPhone}
                    />
                  </Column>

                  <Column className='col-md-6 col-12' formGroup={true}>
                    <Input
                      group={true}
                      type="email"
                      label={<>Correo Electrónico <i className="fa fa-asterisk text-danger small"></i></>}
                      placeholder="Ingrese el email"
                      ref={this.refEmail}
                      value={this.state.email}
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
                    />
                  </Column>
                </Row>
              </TabPane>

              <TabPane id='login'>
                <Row>
                  <Column formGroup={true}>
                    <Select
                      group={true}
                      id="perfil"
                      label={<>Perfi</>}
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
                      id="representante"
                      label={<>Representante</>}
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
                    </Select>
                  </Column>

                  <Column className='col-md-6 col-12' formGroup={true}>
                    <Select
                      group={true}
                      id="estado"
                      label={<>Estado</>}
                      value={this.state.estado}
                      onChange={(event) =>
                        this.setState({ estado: event.target.value })
                      }
                    >
                      <option value="1">Activo</option>
                      <option value="2">Inactivo</option>
                    </Select>
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

                {/* End Login */}
              </TabPane>
            </TabContent>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-warning"
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

const ConnectedUsuarioEditar = connect(mapStateToProps, null)(UsuarioEditar);

export default ConnectedUsuarioEditar;