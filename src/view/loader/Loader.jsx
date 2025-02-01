import React from 'react';
import '../../resource/css/loader.css';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  validTokenApi,
} from '../../network/rest/principal.network';

import { CANCELED } from '../../model/types/types';
import ErrorResponse from '../../model/class/error-response';
import { config, restoreToken } from '../../redux/principalSlice';

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
    const valid = await validTokenApi(this.abortController.signal);

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

  restoreSession() {
    window.localStorage.removeItem('login');
    window.localStorage.removeItem('project');

    this.props.restoreToken({
      token: null,
      project: null
    });
  }

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