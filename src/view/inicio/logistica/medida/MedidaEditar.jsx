import React from 'react';
import {
  alertInfo,
  alertSuccess,
  alertWarning,
  isText,
  isEmpty,
  alertDialog,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';
import ContainerWrapper from '../../../../components/Container';
import {
  getIdMedida,
  updateMedida,
} from '../../../../network/rest/principal.network';
import CustomComponent from '../../../../model/class/custom-component';
import PropTypes from 'prop-types';
import { SpinnerView } from '../../../../components/Spinner';
import Title from '../../../../components/Title';

class MedidaEditar extends CustomComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      loadingMessage: 'Cargando datos...',

      idMedida: '',
      codigo: '',
      nombre: '',
      descripcion: '',
      estado: false,

      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refNombre = React.createRef();

    this.abortController = new AbortController();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const idMedida = new URLSearchParams(url).get('idMedida');

    if (isText(idMedida)) {
      this.loadingData(idMedida);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  async loadingData(id) {
    const [medida] = await Promise.all([
      this.fetchObtenerMedida(id)
    ]);

    this.setState({
      idMedida: id,
      codigo: medida.codigo,
      nombre: medida.nombre,
      descripcion: medida.descripcion,
      estado: medida.estado,
      loading: false,
    });
  }

  async fetchObtenerMedida(id) {
    const params = {
      idMedida: id,
    };

    const response = await getIdMedida(params, this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return null;
    }
  }

  handleInputCodigo = (event) => {
    this.setState({ codigo: event.target.value });
  };

  handleInputNombre = (event) => {
    this.setState({ nombre: event.target.value });
  };

  handleInputDescripcion = (event) => {
    this.setState({ descripcion: event.target.value });
  };

  handleSelectEstado = (event) => {
    this.setState({ estado: event.target.checked });
  };

  handleEditar = async () => {
    if (isEmpty(this.state.codigo)) {
      alertWarning('Medida', 'Ingrese el codigo de la medida', () => {
        this.refCodigo.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.nombre)) {
      alertWarning('Medida', 'Ingrese el nombre de la medida', () => {
        this.refNombre.current.focus();
      });
      return;
    }

    alertDialog('Medida', '¿Está seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idMedida: this.state.idMedida,
          codigo: this.state.codigo,
          nombre: this.state.nombre,
          descripcion: this.state.descripcion,
          estado: this.state.estado,
          idUsuario: this.state.idUsuario,
        };

        alertInfo('Medida', 'Procesando información...');

        const response = await updateMedida(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Medida', response.data, () => {
            this.props.history.goBack();
          });
        }

        if (response instanceof ErrorResponse) {
          alertWarning('Medida', response.getMessage());
        }
      }
    });
  };

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.loadingMessage}
        />

        <Title
          title='Medida'
          subTitle='Editar'
          icon={() => (
            <i className="fa fa-edit"></i>
          )}
          handleGoBack={() => this.props.history.goBack()}
        />

        <div className="row">
          <div className="col">
            <div className="form-group">
              <label htmlFor="categoria">
                Código: <i className="fa fa-asterisk text-danger small"></i>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ingrese el código"
                ref={this.refCodigo}
                value={this.state.codigo}
                onChange={this.handleInputCodigo}
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="form-group">
              <label htmlFor="categoria">
                Nombre: <i className="fa fa-asterisk text-danger small"></i>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ingrese el nombre"
                ref={this.refNombre}
                value={this.state.nombre}
                onChange={this.handleInputNombre}
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="form-group">
              <label htmlFor="categoria">Descripción:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ingrese el descripción"
                value={this.state.descripcion}
                onChange={this.handleInputDescripcion}
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="form-group">
              <label>Estado:</label>
              <div className="custom-control custom-switch">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="customSwitchEstado"
                  checked={this.state.estado}
                  onChange={this.handleSelectEstado}
                />
                <label
                  className="custom-control-label"
                  htmlFor="customSwitchEstado"
                >
                  {this.state.estado ? 'Activo' : 'Inactivo'}
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="form-group">
              <button
                type="button"
                className="btn btn-warning"
                onClick={() => this.handleEditar()}
              >
                Editar
              </button>{' '}
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => this.props.history.goBack()}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </ContainerWrapper>
    );
  }
}

MedidaEditar.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string
    })
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func
  })
}

const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

const ConnectedMedidaEditar = connect(mapStateToProps, null)(MedidaEditar);

export default ConnectedMedidaEditar;