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
  editVehiculo,
  getIdVehiculo,
} from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';
import Title from '../../../../components/Title';

class VehiculoEditar extends CustomComponent {

  constructor(props) {
    super(props);
    this.state = {
      idVehiculo: '',
      marca: '',
      numeroPlaca: '',
      preferido: false,
      estado: true,

      loading: true,
      msgLoading: 'Cargando datos...',

      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refMarca = React.createRef();
    this.refNumeroPlaca = React.createRef();

    this.abortController = new AbortController();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const idVehiculo = new URLSearchParams(url).get('idVehiculo');

    if (isText(idVehiculo)) {
      this.loadingData(idVehiculo);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  loadingData = async (id) => {
    const [impuesto] = await Promise.all([await this.fetchGetIdVehiculo(id)]);

    this.setState({
      idVehiculo: impuesto.idVehiculo,
      marca: impuesto.marca,
      numeroPlaca: impuesto.numeroPlaca,
      preferido: impuesto.preferido,
      estado: impuesto.estado,
      loading: false,
    });
  };

  async fetchGetIdVehiculo(id) {
    const params = {
      idVehiculo: id,
    };
    const response = await getIdVehiculo(params, this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  handleEditar = () => {
    if (isEmpty(this.state.marca)) {
      alertWarning('Vehículo', 'Ingrese la marca del vehículo.', () =>
        this.refMarca.current.focus(),
      );
      return;
    }

    if (isEmpty(this.state.numeroPlaca)) {
      alertWarning('Vehículo', 'Ingrese el número de placa.', () =>
        this.refNumeroPlaca.current.focus(),
      );
      return;
    }

    alertDialog('Vehículo', '¿Estás seguro de continuar?', async (accept) => {
      if (accept) {
        alertInfo('Vehículo', 'Procesando información...');

        const data = {
          idVehiculo: this.state.idVehiculo,
          marca: this.state.marca,
          numeroPlaca: this.state.numeroPlaca,
          estado: this.state.estado,
          preferido: this.state.preferido,
          idUsuario: this.state.idUsuario,
        };

        const response = await editVehiculo(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Vehículo', response.data, () => {
            this.props.history.goBack();
          });
        }

        if (response instanceof ErrorResponse) {
          alertWarning('Vehículo', response.getMessage());
        }
      }
    });
  };

  render() {
    return (
      <ContainerWrapper>
        {this.state.loading && spinnerLoading(this.state.msgLoading)}
        
        <Title
          title='Vehículo'
          subTitle='Editar'
          handleGoBack={() => this.props.history.goBack()}
        />

        <div className="row">
          <div className="col-md-6 col-12">
            <div className="form-group">
              <label htmlFor="marca" className="col-form-label">
                Marca: <i className="fa fa-asterisk text-danger small"></i>
              </label>
              <input
                type="text"
                placeholder="Digite..."
                className="form-control"
                id="marca"
                ref={this.refMarca}
                value={this.state.marca}
                onChange={(event) =>
                  this.setState({ marca: event.target.value })
                }
              />
            </div>
          </div>

          <div className="col-md-6 col-12">
            <div className="form-group">
              <label htmlFor="numeroPlaca" className="col-form-label">
                Número de Placa: <i className="fa fa-asterisk text-danger small"></i>
              </label>
              <input
                type="text"
                placeholder="Digite..."
                className="form-control"
                id="numeroPlaca"
                ref={this.refNumeroPlaca}
                value={this.state.numeroPlaca}
                onChange={(event) =>
                  this.setState({ numeroPlaca: event.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="form-group col-md-6">
            <label htmlFor="nombre" className="col-form-label">
              Estado:
            </label>
            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input"
                id="switch1"
                checked={this.state.estado}
                onChange={(value) =>
                  this.setState({ estado: value.target.checked })
                }
              />
              <label className="custom-control-label" htmlFor="switch1">
                {this.state.estado ? 'Activo' : 'Inactivo'}
              </label>
            </div>
          </div>

          <div className="form-group col-md-6">
            <label htmlFor="nombre" className="col-form-label">
              Preferido:
            </label>
            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input"
                id="switch2"
                checked={this.state.preferido}
                onChange={(value) =>
                  this.setState({ preferido: value.target.checked })
                }
              />
              <label className="custom-control-label" htmlFor="switch2">
                {this.state.preferido ? 'Si' : 'No'}
              </label>
            </div>
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

export default connect(mapStateToProps, null)(VehiculoEditar);
