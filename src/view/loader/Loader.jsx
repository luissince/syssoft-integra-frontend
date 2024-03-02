import React from 'react';
import '../../recursos/css/loader.css';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { config, monedaNacional, restoreToken } from '../../redux/actions';
import {
  empresaConfig,
  nacionalMoneda,
  preferidosProducto,
  validToken,
} from '../../network/rest/principal.network';

import { CANCELED } from '../../model/types/types';
import ErrorResponse from '../../model/class/error-response';
import SuccessReponse from '../../model/class/response';

class Loader extends React.Component {
  constructor(props) {
    super(props);

    this.abortController = new AbortController();
  }

  async componentDidMount() {
    const [empresa, token, moneda] = await Promise.all([
      this.fetchObtenerEmpresa(),
      this.fetchValidarToken(),
      this.fetchMonedaNacional(),
    ]);

    if (!Array.isArray(empresa)) {
      if (moneda) this.props.monedaNacional(moneda);

      if (token) {
        const userToken = window.localStorage.getItem('login');
        const login = JSON.parse(userToken);
        const project = JSON.parse(window.localStorage.getItem('project'));

        const user = {
          ...login,
          project: project,
        };

        this.props.restore(user, empresa);
      } else {
        this.clearLocalStorage();
        this.props.restore(null, empresa);
      }
    } else {
      if (empresa[0] === 400) {
        this.props.config();
      } else {
        this.clearLocalStorage();
        this.props.restore(null, null);
      }
    }
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  async fetchObtenerEmpresa() {
    const response = await empresaConfig();

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.type === CANCELED) return;

      return [response.status];
    }
  }

  async fetchValidarToken() {
    const response = await validToken();

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

  async fetchProductoPreferidos() {
    const response = await preferidosProducto();

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
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
  monedaNacional: PropTypes.func,
  restore: PropTypes.func,
  config: PropTypes.func
}

const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    config: () => dispatch(config()),
    monedaNacional: (moneda) => dispatch(monedaNacional(moneda)),
    restore: (user, empresa) => dispatch(restoreToken(user, empresa)),
  };
};

const ConnectedLoader = connect(mapStateToProps, mapDispatchToProps)(Loader);

export default ConnectedLoader;
