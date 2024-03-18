import React from 'react';
import CustomComponent from '../../../../model/class/custom-component';
import ContainerWrapper from '../../../../components/Container';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isText,
  spinnerLoading,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { CANCELED } from '../../../../model/types/types';
import ErrorResponse from '../../../../model/class/error-response';
import SuccessReponse from '../../../../model/class/response';
import {
  editMoneda,
  getIdMoneda,
} from '../../../../network/rest/principal.network';
import Title from '../../../../components/Title';

class MonedaEditar extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      idMoneda: '',
      nombre: '',
      codIso: '',
      simbolo: '',
      estado: true,

      loading: true,
      msgLoading: 'Cargando datos...',

      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refTxtNombre = React.createRef();
    this.refTxtCodIso = React.createRef();
    this.refTxtSimbolo = React.createRef();
    this.refTxtSearch = React.createRef();
    this.refEstado = React.createRef();

    this.abortController = new AbortController();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const idMoneda = new URLSearchParams(url).get('idMoneda');

    if (isText(idMoneda)) {
      this.loadingData(idMoneda);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  async loadingData(idMoneda) {
    const [moneda] = await Promise.all([
      this.fetchGetIdMoneda(idMoneda)
    ]);

    this.setState({
      nombre: moneda.nombre,
      codIso: moneda.codiso,
      simbolo: moneda.simbolo,
      estado: moneda.estado,
      idMoneda: moneda.idMoneda,
      loading: false,
    });
  }

  async fetchGetIdMoneda(idMoneda) {
    const params = {
      idMoneda: idMoneda,
    };

    const result = await getIdMoneda(params, this.abortController.signal);

    if (result instanceof SuccessReponse) {
      return result.data;
    }

    if (result instanceof ErrorResponse) {
      if (result.getType() === CANCELED) return;

      return [];
    }
  }

  handleEditar = () => {
    if (!isText(this.state.nombre)) {
      alertWarning('Moneda', 'Ingres el nombre.', () =>
        this.refTxtNombre.current.focus(),
      );
      return;
    }

    if (!isText(this.state.codIso)) {
      alertWarning('Moneda', 'Ingres el código.', () =>
        this.refTxtCodIso.current.focus(),
      );
      return;
    }

    alertDialog('Moneda', '¿Está seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          nombre: this.state.nombre,
          codiso: this.state.codIso,
          simbolo: this.state.simbolo,
          estado: this.state.estado,
          idUsuario: this.state.idUsuario,
          idMoneda: this.state.idMoneda,
        };

        alertInfo('Moneda', 'Procesando información...');

        const response = await editMoneda(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Moneda', response.data, () => {
            this.props.history.goBack();
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertWarning('Moneda', response.getMessage());
        }
      }
    });
  };

  render() {
    return (
      <ContainerWrapper>
        {this.state.loading && spinnerLoading(this.state.msgLoading)}

        <Title
          title='Moneda'
          subTitle='Editar'
          handleGoBack={() => this.props.history.goBack()}
        />

        <div className="row">
          <div className="form-group col-md-6">
            <label>
              Moneda: <i className="fa fa-asterisk text-danger small"></i>
            </label>
            <input
              type="text"
              className="form-control"
              ref={this.refTxtNombre}
              value={this.state.nombre}
              onChange={(event) =>
                this.setState({ nombre: event.target.value })
              }
              placeholder="Soles, dolares, etc"
            />
          </div>
          <div className="form-group col-md-6">
            <label>
              Código ISO: <i className="fa fa-asterisk text-danger small"></i>
            </label>
            <input
              type="text"
              className="form-control"
              ref={this.refTxtCodIso}
              value={this.state.codIso}
              onChange={(event) =>
                this.setState({ codIso: event.target.value })
              }
              placeholder="PEN, USD, etc"
            />
          </div>
        </div>

        <div className="row">
          <div className="form-group col-md-6">
            <label>Simbolo:</label>
            <input
              type="text"
              className="form-control"
              ref={this.refTxtSimbolo}
              value={this.state.simbolo}
              onChange={(event) =>
                this.setState({ simbolo: event.target.value })
              }
              placeholder="S/, $, etc"
            />
          </div>

          <div className="form-group col-md-6">
            <label>Estado:</label>
            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input"
                id="switch1"
                ref={this.refEstado}
                checked={this.state.estado}
                onChange={(value) =>
                  this.setState({ estado: value.target.checked })
                }
              />
              <label className="custom-control-label" htmlFor="switch1">
                Activo o Inactivo
              </label>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.handleEditar}
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

const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

const ConnectedMonedaEditar = connect(mapStateToProps, null)(MonedaEditar);

export default ConnectedMonedaEditar;