import React from 'react';
import '../../resource/css/loader.css';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  validToken,
} from '../../network/rest/principal.network';

import { CANCELED } from '../../model/types/types';
import ErrorResponse from '../../model/class/error-response';
import { config, restoreToken } from '../../redux/principalSlice';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class Loader extends React.Component {

  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);

    this.abortController = new AbortController();
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

  async componentDidMount() {
    const valid = await validToken(this.abortController.signal);

    if (valid instanceof ErrorResponse) {
      if (valid.type === CANCELED) return;
      this.restoreSession();
      return;
    }

    // la variable session trae datos que rempleza al window.localStorage.getItem('login')
    const login = JSON.parse(window.localStorage.getItem('login'));
    const project = JSON.parse(window.localStorage.getItem('project'));

    this.props.restoreToken({
      token: login,
      project: project
    });
  }

  componentWillUnmount() {
    this.abortController.abort();
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

  restoreSession() {
    window.localStorage.removeItem('login');
    window.localStorage.removeItem('project');

    this.props.restoreToken({
      token: null,
      project: null
    });
  }

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
    return (
      <div className="loader-content text-center">
        <div className="loader-inner">
          <div className="lds-roller mb-3">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>

          <h4 className="text-uppercase font-weight-bold">Cargando...</h4>
          <p className="font-italic text-muted">
            Se está estableciendo conexión con el servidor...
          </p>
        </div>
      </div>
    );
  }
}

Loader.propTypes = {
  restoreToken: PropTypes.func,
  config: PropTypes.func,
}

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const mapDispatchToProps = { config, restoreToken };

const ConnectedLoader = connect(mapStateToProps, mapDispatchToProps)(Loader);

export default ConnectedLoader;