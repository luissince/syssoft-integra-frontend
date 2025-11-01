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
 * @extends CustomComponent
 */
class Login extends CustomComponent {
  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      message: '',
      lookPassword: false,
      loading: false,
    };

    this.usernameRef = React.createRef();
    this.passwordRef = React.createRef();
  }

  /*
  |--------------------------------------------------------------------------
  | Método de cliclo de vida
  |--------------------------------------------------------------------------
  |
  | El ciclo de vida de un componente en React consta de varios métodos que se ejecutan en diferentes momentos durante la vida útil
  | del componente. Estos métodos proporcionan puntos de entrada para realizar acciones específicas en cada etapa del ciclo de vida,
  | como inicializar el estado, montar el componente, actualizar el estado y desmontar el componente. Estos métodos permiten a los
  | desarrolladores controlar y realizar acciones específicas en respuesta a eventos de ciclo de vida, como la creación, actualización
  | o eliminación del componente. Entender y utilizar el ciclo de vida de React es fundamental para implementar correctamente la lógica
  | de la aplicación y optimizar el rendimiento del componente.
  |
  */

  componentDidMount() {
    if (this.usernameRef.current !== null) {
      this.usernameRef.current.focus();
    }
    window.addEventListener('focus', this.eventFocused);
  }

  componentWillUnmount() {
    window.removeEventListener('focus', this.eventFocused);
  }

  /*
  |--------------------------------------------------------------------------
  | Métodos de acción
  |--------------------------------------------------------------------------
  |
  | Carga los datos iniciales necesarios para inicializar el componente. Este método se utiliza típicamente
  | para obtener datos desde un servicio externo, como una API o una base de datos, y actualizar el estado del
  | componente en consecuencia. El método loadingData puede ser responsable de realizar peticiones asíncronas
  | para obtener los datos iniciales y luego actualizar el estado del componente una vez que los datos han sido
  | recuperados. La función loadingData puede ser invocada en el montaje inicial del componente para asegurarse
  | de que los datos requeridos estén disponibles antes de renderizar el componente en la interfaz de usuario.
  |
  */

  eventFocused = () => {
    const userToken = window.localStorage.getItem('login');
    if (userToken === null) {
      return;
    }

    const projectToken = window.localStorage.getItem('project');
    if (projectToken !== null) {
      this.props.signIn({
        token: JSON.parse(userToken),
        project: JSON.parse(projectToken),
      });
    } else {
      this.props.signIn({
        token: JSON.parse(userToken),
        project: null,
      });
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Método de eventos
  |--------------------------------------------------------------------------
  |
  | El método handle es una convención utilizada para denominar funciones que manejan eventos específicos
  | en los componentes de React. Estas funciones se utilizan comúnmente para realizar tareas o actualizaciones
  | en el estado del componente cuando ocurre un evento determinado, como hacer clic en un botón, cambiar el valor
  | de un campo de entrada, o cualquier otra interacción del usuario. Los métodos handle suelen recibir el evento
  | como parámetro y se encargan de realizar las operaciones necesarias en función de la lógica de la aplicación.
  | Por ejemplo, un método handle para un evento de clic puede actualizar el estado del componente o llamar a
  | otra función específica de la lógica de negocio. La convención de nombres handle suele combinarse con un prefijo
  | que describe el tipo de evento que maneja, como handleInputChange, handleClick, handleSubmission, entre otros. 
  |
  */

  handleSendForm = async (event) => {
    event.preventDefault();

    if (this.state.loading) return;

    if (isEmpty(this.state.username)) {
      this.usernameRef.current.focus();
      this.setState({
        message: 'Ingrese su usuario para iniciar sesión.',
      });
      return;
    }

    if (isEmpty(this.state.password)) {
      this.passwordRef.current.focus();
      this.setState({
        message: 'Ingrese su contraseña para iniciar sesión.',
      });
      return;
    }

    document.activeElement.blur();

    this.setState({ loading: true });

    const data = {
      username: this.state.username,
      password: this.state.password,
    };

    const response = await loginApi(data);

    if (response instanceof ErrorResponse) {
      this.setState({
        loading: false,
        message: response.getMessage(),
      });

      this.usernameRef.current.focus();
      return;
    }

    response instanceof SuccessReponse;

    window.localStorage.setItem('login', JSON.stringify(response.data));

    this.props.signIn({
      token: response.data,
      project: null,
    });
  };

  handleChangeUsername = (event) => {
    if (event.target.value.length > 0) {
      this.setState({
        username: event.target.value,
        message: '',
      });
    } else {
      this.setState({
        username: event.target.value,
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
    }, () => {
      const input = this.passwordRef.current;
      if (input) {
        input.focus();
        const length = input.value.length;
        input.setSelectionRange(length, length);
      }
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Método de renderización
  |--------------------------------------------------------------------------
  |
  | El método render() es esencial en los componentes de React y se encarga de determinar
  | qué debe mostrarse en la interfaz de usuario basado en el estado y las propiedades actuales
  | del componente. Este método devuelve un elemento React que describe lo que debe renderizarse
  | en la interfaz de usuario. La salida del método render() puede incluir otros componentes
  | de React, elementos HTML o una combinación de ambos. Es importante que el método render()
  | sea una función pura, es decir, no debe modificar el estado del componente ni interactuar
  | directamente con el DOM. En su lugar, debe basarse únicamente en los props y el estado
  | actuales del componente para determinar lo que se mostrará.
  |
  */

  render() {
    if (this.props.token.userToken != null) {
      return <Redirect to="/principal" />;
    }

    return (
      <div
        className="h-full bg-accent"
      >
        <div className="container h-full">
          <div className="h-full flex justify-center items-center py-4">
            <Title />
           
            <Form
              loading={this.state.loading}
              message={this.state.message}
              username={this.state.username}
              usernameRef={this.usernameRef}
              handleChangeUsername={this.handleChangeUsername}
              password={this.state.password}
              passwordRef={this.passwordRef}
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
    userToken: PropTypes.object,
  }),
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const mapDispatchToProps = { signIn };

const ConnectedLogin = connect(mapStateToProps, mapDispatchToProps)(Login);

export default ConnectedLogin;
