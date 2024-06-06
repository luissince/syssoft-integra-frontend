import React from 'react';
import CustomComponent from '../../../../model/class/custom-component';
import ContainerWrapper from '../../../../components/Container';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isText,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { CANCELED } from '../../../../model/types/types';
import ErrorResponse from '../../../../model/class/error-response';
import SuccessReponse from '../../../../model/class/response';
import { addMoneda } from '../../../../network/rest/principal.network';
import Title from '../../../../components/Title';

class MonedaAgregar extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      idMoneda: '',
      nombre: '',
      codIso: '',
      simbolo: '',
      estado: true,

      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refTxtNombre = React.createRef();
    this.refTxtCodIso = React.createRef();
    this.refTxtSimbolo = React.createRef();
    this.refTxtSearch = React.createRef();
    this.refEstado = React.createRef();
  }

  handleGuardar = () => {
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
        };

        alertInfo('Moneda', 'Procesando información...');

        const response = await addMoneda(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Moneda', response.data);
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

        <Title
          title='Moneda'
          subTitle='Agregar'
          handleGoBack={() => this.props.history.goBack()}
        />

        <div className="row">
          <div className="form-group col-md-6">
            <label>
              Nombre: <i className="fa fa-asterisk text-danger small"></i>
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
                {this.state.estado ? 'Activo' : 'Inactivo'}
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
                onClick={this.handleGuardar}
              >
                Guardar
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
    token: state.principal,
  };
};

const ConnectedMonedaAgregar = connect(mapStateToProps, null)(MonedaAgregar);

export default ConnectedMonedaAgregar;