import React from 'react';
import '../../recursos/css/loader.css';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  empresaConfig,
  nacionalMoneda,
  validTokenApi,
} from '../../network/rest/principal.network';

import { CANCELED } from '../../model/types/types';
import ErrorResponse from '../../model/class/error-response';
import SuccessReponse from '../../model/class/response';
import { config, restoreToken } from '../../redux/principalSlice';
import { setEmpresa, setMonedaNacional } from '../../redux/predeterminadoSlice';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class Loader extends React.Component {
  constructor(props) {
    super(props);

    this.abortController = new AbortController();
  }

  async componentDidMount() {
    const [empresa, moneda, session] = await Promise.all([
      this.fetchObtenerEmpresa(),
      this.fetchMonedaNacional(),
      this.fetchValidarToken(),
    ]);

    if (empresa === null) {
      this.handleSignOut()
    }

    this.props.setMonedaNacional(moneda);
    this.props.setEmpresa(empresa)

    if (session) {
      const login = JSON.parse(window.localStorage.getItem('login'));
      const project = JSON.parse(window.localStorage.getItem('project'));

      this.props.restoreToken({
        token: login,
        project: project
      });
    } else {
      this.clearLocalStorage();
      this.props.restoreToken({
        token: null,
        project: null
      });
    }
    // this.props.config();
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  async fetchValidarToken() {
    const response = await validTokenApi();

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.type === CANCELED) return;

      return null;
    }
  }

  async fetchMonedaNacional() {
    const response = await nacionalMoneda(this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.type === CANCELED) return;

      return null;
    }
  }

  async fetchObtenerEmpresa() {
    const response = await empresaConfig();

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.type === CANCELED) return;

      return null;
    }
  }



  clearLocalStorage() {
    window.localStorage.removeItem('login');
    window.localStorage.removeItem('project');
  }

  render() {
    return (
      <div className="loader text-center">
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
  setMonedaNacional: PropTypes.func,
  setEmpresa: PropTypes.func
}

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const mapDispatchToProps = { config, restoreToken, setMonedaNacional, setEmpresa };

const ConnectedLoader = connect(mapStateToProps, mapDispatchToProps)(Loader);

export default ConnectedLoader;