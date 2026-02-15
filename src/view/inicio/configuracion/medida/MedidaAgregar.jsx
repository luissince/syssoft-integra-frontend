import React from 'react';
import {
  isEmpty,
} from '@/helper/utils.helper';
import { connect } from 'react-redux';
import SuccessReponse from '@/model/class/response';
import ErrorResponse from '@/model/class/error-response';
import ContainerWrapper from '@/components/ui/container-wrapper';
import { addMedida } from '@/network/rest/principal.network';
import PropTypes from 'prop-types';
import Title from '@/components/Title';
import Button from '@/components/Button';
import { alertKit } from 'alert-kit';

class MedidaAgregar extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      codigo: '',
      nombre: '',
      descripcion: '',
      estado: false,

      idUsuario: this.props.token.userToken.usuario.idUsuario,
    };

    this.refCodigo = React.createRef();
    this.refNombre = React.createRef();
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

  handleGuardar = async () => {
    if (isEmpty(this.state.codigo)) {
      alertKit.warning({
        title: "Medida",
        message: "Ingrese el codigo de la medida",
        onClose: () => {
          this.refCodigo.current.focus();
        },
      })
      return;
    }

    if (isEmpty(this.state.nombre)) {
      alertKit.warning({
        title: "Medida",
        message: "Ingrese el nombre de la medida",
        onClose: () => {
          this.refNombre.current.focus();
        },
      })
      return;
    }

    const accept = await alertKit.question({
      title: "Medida",
      message: "¿Estás seguro de continuar?",
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      const data = {
        codigo: this.state.codigo,
        nombre: this.state.nombre,
        descripcion: this.state.descripcion,
        estado: this.state.estado,
        idUsuario: this.state.idUsuario,
      };

      alertKit.loading({
        message: "Procesando información...",
      });

      const response = await addMedida(data);

      if (response instanceof SuccessReponse) {
        alertKit.success({
          title: "Medida",
          message: "Medida agregada correctamente",
        });
        this.props.history.goBack();
      }

      if (response instanceof ErrorResponse) {


        alertKit.warning({
          title: "Medida",
          message: response.getMessage(),
        });
      }
    }
  };

  render() {
    return (
      <ContainerWrapper>
        <Title
          title="Medida"
          subTitle="AGREGAR"
          icon={<i className="fa fa-plus"></i>}
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
          <div className="col-md-12">
            <div className="form-group">
              <Button
                className="btn-success"
                onClick={() => this.handleGuardar()}
              >
                <i className="fa fa-save"></i> Guardar
              </Button>{' '}
              <Button
                className="btn-outline-danger"
                onClick={() => this.props.history.goBack()}
              >
                <i className="fa fa-close"></i> Cerrar
              </Button>
            </div>
          </div>
        </div>
      </ContainerWrapper>
    );
  }
}

MedidaAgregar.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      usuario: PropTypes.shape({
        idUsuario: PropTypes.string,
      }),
    }),
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func,
  }),
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedMedidaAgregar = connect(mapStateToProps, null)(MedidaAgregar);

export default ConnectedMedidaAgregar;
