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
} from '../../../../helper/utils.helper';
import { addVehiculo } from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import Title from '../../../../components/Title';
import Button from '../../../../components/Button';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import { SpinnerView } from '../../../../components/Spinner';

class VehiculoAgregar extends CustomComponent {

  constructor(props) {
    super(props);
    this.state = {
      idVehiculo: '',
      marca: '',
      numeroPlaca: '',
      preferido: false,
      estado: true,

      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refMarca = React.createRef();
    this.refNumeroPlaca = React.createRef();

    this.abortController = new AbortController();
  }

  handleGuardar = () => {
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
          marca: this.state.marca,
          numeroPlaca: this.state.numeroPlaca,
          estado: this.state.estado,
          preferido: this.state.preferido,
          idUsuario: this.state.idUsuario,
        };

        const response = await addVehiculo(data);
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
        <SpinnerView 
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title='Vehículo'
          subTitle='AGREGAR'
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

        <Row>
          <Column formGroup>
            <Button
              className="btn-success"
              onClick={this.handleGuardar}
            >
              <i className="fa fa-save"></i> Guardar
            </Button>
            {' '}
            <Button
              className="btn-outline-danger"
              onClick={() => this.props.history.goBack()}
            >
              <i className='fa fa-close'></i> Cerrar
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

const ConnectedVehiculoAgregar = connect(mapStateToProps, null)(VehiculoAgregar);

export default ConnectedVehiculoAgregar;