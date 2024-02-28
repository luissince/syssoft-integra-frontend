import React from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { signIn } from '../../redux/actions';
import { loginApi } from '../../network/rest/principal.network';
import SuccessReponse from '../../model/class/response';
import ErrorResponse from '../../model/class/error-response';
import CustomComponent from '../../model/class/custom-component';
import Title from './component/Title';
import Form from './component/Form';

class Login extends CustomComponent {
  constructor(props) {
    super(props);

    this.state = {
      usuario: '',
      password: '',
      message: '',
      lookPassword: false,
      loading: false,
    };

    this.usuarioInput = React.createRef();
    this.passwordInput = React.createRef();
  }

  componentDidMount() {
    if (this.usuarioInput.current !== null) {
      this.usuarioInput.current.focus();
    }
    window.addEventListener('focus', this.onEventFocused);
  }

  componentWillUnmount() {
    window.removeEventListener('focus', this.onEventFocused);
  }

  onEventFocused = () => {
    let userToken = window.localStorage.getItem('login');
    if (userToken !== null) {
      let projectToken = window.localStorage.getItem('project');
      if (projectToken !== null) {
        this.props.restore(JSON.parse(userToken), JSON.parse(projectToken));
      } else {
        this.props.restore(JSON.parse(userToken));
        this.props.history.push('principal');
      }
    }
  };

  onEventForm = async (event) => {
    event.preventDefault();

    if (this.state.loading) return;

    if (this.state.usuario === '') {
      this.usuarioInput.current.focus();
      await this.setStateAsync({
        message: 'Ingrese su usuario para iniciar sesión.',
      });
      return;
    }

    if (this.state.password === '') {
      this.passwordInput.current.focus();
      await this.setStateAsync({
        message: 'Ingrese su contraseña para iniciar sesión.',
      });
      return;
    }

    document.activeElement.blur();

    await this.setStateAsync({ loading: true });

    const data = {
      usuario: this.state.usuario,
      password: this.state.password,
    };

    const response = await loginApi(data);

    if (response instanceof SuccessReponse) {
      const menus = response.data.menu.map((item) => {
        let submenu = [];
        for (let value of response.data.submenu) {
          let privilegio = [];
          if (item.idMenu === value.idMenu) {
            for (let content of response.data.privilegio) {
              if (
                content.idSubMenu === value.idSubMenu &&
                item.idMenu === content.idMenu
              ) {
                privilegio.push({
                  estado: content.estado,
                  idMenu: content.idMenu,
                  idPrivilegio: content.idPrivilegio,
                  idSubMenu: content.idSubMenu,
                  nombre: content.nombre,
                });
              }
            }

            submenu.push({
              estado: value.estado,
              idMenu: value.idMenu,
              idSubMenu: value.idSubMenu,
              nombre: value.nombre,
              ruta: value.ruta,
              privilegio: privilegio,
            });
          }
        }

        return {
          ...item,
          submenu,
        };
      });

      const user = {
        apellidos: response.data.apellidos,
        estado: response.data.estado,
        idUsuario: response.data.idUsuario,
        nombres: response.data.nombres,
        rol: response.data.rol,
        token: response.data.token,
        menus,
      };

      window.localStorage.setItem('login', JSON.stringify(user));
      this.props.restore(JSON.parse(window.localStorage.getItem('login')));
      this.props.history.push('principal');
    }

    if (response instanceof ErrorResponse) {
      await this.setStateAsync({
        loading: false,
        message: response.getMessage(),
      });

      this.usuarioInput.current.focus();
    }
  };

  onEventRecuperar = () => {
    window.open('/api/login/report', '_blank');
  };

  handleChangeUsuario = (event) => {
    if (event.target.value.length > 0) {
      this.setState({
        usuario: event.target.value,
        message: '',
      });
    } else {
      this.setState({
        usuario: event.target.value,
        message: 'Ingrese su usuario para iniciar sesión.',
      });
    }
  };

  handleChangePassword = (event) => {
    if (event.target.value.length > 0) {
      this.setState({
        password: event.target.value,
        message: '',
      });
    } else {
      this.setState({
        password: event.target.value,
        message: 'Ingrese su contraseña para iniciar sesión.',
      });
    }
  };

  handleViewPassword = () => {
    this.setState({
      lookPassword: !this.state.lookPassword,
    });
    this.passwordInput.current.focus();
  };

  render() {
    if (this.props.token.userToken != null) {
      return <Redirect to="/principal" />;
    }

    // const { rutaImage } = this.props.token.empresa;

    return (
      <div
        className="vh-100 px-4 py-5 px-md-5 text-center text-lg-start d-flex align-items-center"
        style={{ backgroundColor: 'hsl(0, 0%, 96%)' }}
      >
        <div className="container">
          <div className="row gx-lg-5 align-items-center">
            <Title />

            <Form
              message={this.state.message}
              usuario={this.state.usuario}
              password={this.state.password}
              loading={this.state.loading}
              usuarioInput={this.usuarioInput}
              handleChangeUsuario={this.handleChangeUsuario}
              passwordInput={this.passwordInput}
              handleChangePassword={this.handleChangePassword}
              lookPassword={this.state.lookPassword}
              handleViewPassword={this.handleViewPassword}
              onEventForm={this.onEventForm}
            />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    restore: (user, project = null) => dispatch(signIn(user, project)),
  };
};

const ConnectedLogin = connect(mapStateToProps, mapDispatchToProps)(Login);

export default ConnectedLogin;
