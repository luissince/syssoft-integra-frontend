import React from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { loginApi } from '../../network/rest/principal.network';
import SuccessReponse from '../../model/class/response';
import ErrorResponse from '../../model/class/error-response';
import CustomComponent from '../../model/class/custom-component';
import Title from './component/Title';
import Form from './component/Form';
import { signIn } from '../../redux/principalSlice';
import PropTypes from 'prop-types';
import { isEmpty } from '../../helper/utils.helper';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
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
    const userToken = window.localStorage.getItem('login');
    if (userToken === null) {
      return
    }

    const projectToken = window.localStorage.getItem('project');
    if (projectToken !== null) {
      this.props.signIn({
        token: JSON.parse(userToken),
        project: JSON.parse(projectToken)
      });
    } else {
      this.props.signIn({
        token: JSON.parse(userToken),
        project: null
      });
    }

  };

  handleSendForm = async (event) => {
    event.preventDefault();

    if (this.state.loading) return;

    if (isEmpty(this.state.usuario)) {
      this.usuarioInput.current.focus();
      await this.setStateAsync({
        message: 'Ingrese su usuario para iniciar sesión.',
      });
      return;
    }

    if (isEmpty(this.state.password)) {
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
      window.localStorage.setItem('login', JSON.stringify(response.data));
      this.props.signIn({
        token: response.data,
        project: null
      });
    }

    if (response instanceof ErrorResponse) {
      await this.setStateAsync({
        loading: false,
        message: response.getMessage(),
      });

      this.usuarioInput.current.focus();
    }
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
              handleSendForm={this.handleSendForm}
            />
          </div>
        </div>
      </div>
    );
  }
}

Login.propTypes = {
  signIn: PropTypes.func,
  token: PropTypes.shape({
    userToken: PropTypes.object
  })
}

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const mapDispatchToProps = { signIn }

const ConnectedLogin = connect(mapStateToProps, mapDispatchToProps)(Login);

export default ConnectedLogin;
