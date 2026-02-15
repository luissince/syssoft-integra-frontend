import React from 'react';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../components/Container';
import CustomComponent from '@/components/CustomComponent';
import {
  isEmpty,
  isText,
} from '../../../../helper/utils.helper';
import {
  editVehiculo,
  getIdVehiculo,
} from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '@/constants/requestStatus';
import Title from '../../../../components/Title';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Button from '../../../../components/Button';
import { SpinnerView } from '../../../../components/Spinner';
import { alertKit } from 'alert-kit';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
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

      idUsuario: this.props.token.userToken.usuario.idUsuario,
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
    const [impuesto] = await Promise.all([this.fetchGetIdVehiculo(id)]);

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

  handleGuardar = async () => {
    if (isEmpty(this.state.marca)) {
      alertKit.warning({
        title: "Vehículo",
        message: "Ingrese la marca del vehículo.",
        onClose: () => this.refMarca.current.focus(),
      })
      return;
    }

    if (isEmpty(this.state.numeroPlaca)) {
      alertKit.warning({
        title: "Vehículo",
        message: "Ingrese el número de placa.",
        onClose: () => this.refNumeroPlaca.current.focus(),
      })
      return;
    }

    const accept = await alertKit.question({
      title: "Vehículo",
      message: "¿Estás seguro de continuar?",
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {

      alertKit.loading({
        message: "Procesando información...",
      })

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
        alertKit.success({
          title: "Vehículo",
          message: response.data,
          onClose: () => this.props.history.goBack(),
        })
      }

      if (response instanceof ErrorResponse) {

        alertKit.warning({
          title: "Vehículo",
          message: response.getMessage(),
        })
      }
    }
  };

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title="Vehículo"
          subTitle="EDITAR"
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
                Número de Placa:{' '}
                <i className="fa fa-asterisk text-danger small"></i>
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

        <Row>
          <Column formGroup>
            <Button className="btn-warning" onClick={this.handleGuardar}>
              <i className="fa fa-save"></i> Guardar
            </Button>{' '}
            <Button
              className="btn-outline-danger"
              onClick={() => this.props.history.goBack()}
            >
              <i className="fa fa-close"></i> Cerrar
            </Button>
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedVehiculoEditar = connect(mapStateToProps, null)(VehiculoEditar);

export default ConnectedVehiculoEditar;
