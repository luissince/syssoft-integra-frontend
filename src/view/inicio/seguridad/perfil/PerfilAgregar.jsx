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
import { addPerfil } from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';

class PerfilAgregar extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      descripcion: '',

      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refDescripcion = React.createRef();
  }

  handleInputDescripcion = (event) => {
    this.setState({ descripcion: event.target.value });
  };

  handleGuardar = () => {
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
        };

        const response = await addPerfil(data);

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
        <div className="row">
          <div className="col">
            <div className="form-group">
              <h5>
                <span role="button" onClick={() => this.props.history.goBack()}>
                  <i className="bi bi-arrow-left-short"></i>
                </span>{' '}
                Agregar Perfil
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
          <div className="col">
            <div className="form-group">
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.handleGuardar}
              >
                <i className="fa fa-save"></i> Guardar
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


const ConnectedPerfilAgregar = connect(mapStateToProps, null)(PerfilAgregar);

export default ConnectedPerfilAgregar;
