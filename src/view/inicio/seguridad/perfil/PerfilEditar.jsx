import React from 'react';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../components/Container';
import CustomComponent from '../../../../model/class/custom-component';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isEmpty,
  isText,
  spinnerLoading,
} from '../../../../helper/utils.helper';
import {
  updateBanco,
  getIdPerfil,
  updatePerfil,
} from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';

class BancoEditar extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      idPerfil: '',
      descripcion: '',

      loading: true,
      msgLoading: 'Cargando datos...',

      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refDescripcion = React.createRef();

    this.abortController = new AbortController();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const idPerfil = new URLSearchParams(url).get('idPerfil');

    if (isText(idPerfil)) {
      this.loadingData(idPerfil);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  async loadingData(id) {
    const [perfil] = await Promise.all([await this.fetchObtenerPerfil(id)]);

    this.setState({
      descripcion: perfil.descripcion,
      idPerfil: perfil.idPerfil,
      loading: false,
    });
  }

  async fetchObtenerPerfil(id) {
    const params = {
      idPerfil: id,
    };

    const result = await getIdPerfil(params, this.abortController.signal);

    if (result instanceof SuccessReponse) {
      return result.data;
    }

    if (result instanceof ErrorResponse) {
      if (result.getType() === CANCELED) return;

      return [];
    }
  }

  handleInputDescripcion = (event) => {
    this.setState({ descripcion: event.target.value });
  };

  handleEditar = () => {
    if (isEmpty(this.state.descripcion)) {
      alertWarning('Perfil', 'Ingrese la descripción del perfil', () => {
        this.refDescripcion.current.focus();
      });
      return;
    }

    alertDialog('Perfil', '¿Estás seguro de continuar?', async (accept) => {
      if (accept) {
        alertInfo('Perfil', 'Procesando información...');

        const data = {
          descripcion: this.state.descripcion.trim(),
          idEmpresa: 'EM0001',
          idUsuario: this.state.idUsuario,
          idPerfil: this.state.idPerfil,
        };

        const response = await updatePerfil(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Perfil', response.data, () => {
            this.props.history.goBack();
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertWarning('Perfil', response.getMessage());
        }
      }
    });
  };

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
                </span>{' '}
                Editar Perfil
              </h5>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="form-group col">
            <label>
              Descripción: <i className="fa fa-asterisk text-danger small"></i>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Ingrese la descripción."
              ref={this.refDescripcion}
              value={this.state.descripcion}
              onChange={this.handleInputDescripcion}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <button
                type="button"
                className="btn btn-warning"
                onClick={this.handleEditar}
              >
                <i className="fa fa-edit"></i> Guardar
              </button>{' '}
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => this.props.history.goBack()}
              >
                <i className="fa fa-close"></i> Cerrar
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

export default connect(mapStateToProps, null)(BancoEditar);
