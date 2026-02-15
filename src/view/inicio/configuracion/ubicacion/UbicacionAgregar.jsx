import React from 'react';
import {
  isEmpty,
} from '@/helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '@/components/ui/container-wrapper';
import {
  addUbicacion,
} from '@/network/rest/principal.network';
import Title from '@/components/Title';
import PropTypes from 'prop-types';
import Input from '@/components/Input';
import { Switches } from '@/components/Checks';
import Button from '@/components/Button';
import { alertKit } from 'alert-kit';
import CustomComponent from '@/components/CustomComponent';

class UbicacionAgregar extends CustomComponent {
  constructor(props) {
    super(props);

    this.state = {
      descripcion: "",
      estado: true,

      idUsuario: this.props.token.userToken.usuario.idUsuario,
    };

    this.refDescripcion = React.createRef();

    this.abortController = new AbortController();
  }

  async componentDidMount() {

  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  handleInputDescripcion = (event) => {
    this.setState({ descripcion: event.target.value });
  };

  handleSelectEstado = (event) => {
    this.setState({ estado: event.target.checked });
  };

  handleGuardar = async () => {
    if (isEmpty(this.state.descripcion)) {
      alertKit.warning({
        title: "Ubicación",
        message: "Ingrese la ubicación.",
      }, () => {
        this.refDescripcion.current.focus();
      });
      return;
    }

    const accept = await alertKit.question({
      title: "Ubicación",
      message: "¿Estás seguro de continuar?",
      acceptButton: { html: "<i class='fa fa-check'></i> Aceptar" },
      cancelButton: { html: "<i class='fa fa-close'></i> Cancelar" },
    });

    if (accept) {
      const body = {
        descripcion: this.state.descripcion,
        estado: this.state.estado,
        idUsuario: this.state.idUsuario,
      };

      alertKit.loading({
        message: "Procesando información...",
      });

      const { success, message, data } = await addUbicacion(body);

      if (success) {
        alertKit.success({
          title: "Ubicación",
          message: data,
        }, () => {
          this.props.history.goBack();
        });
      }

      if (!success) {
        alertKit.warning({
          title: "Ubicación",
          message: message,
        });
      }
    }
  };

  render() {
    return (
      <ContainerWrapper>
        <Title
          title="Ubicación"
          subTitle="AGREGAR"
          icon={<i className="fa fa-plus"></i>}
          handleGoBack={() => this.props.history.goBack()}
        />

        <div className="flex flex-col gap-4 mb-2">
          <div>
            <Input
              label={
                <>
                  Descripción:<i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              placeholder="Ingrese la ubicación"
              ref={this.refDescripcion}
              value={this.state.descripcion}
              onChange={this.handleInputDescripcion}
            />
          </div>

          <Switches
            id="customSwitchEstado"
            checked={this.state.estado}
            onChange={this.handleSelectEstado}
          >
            {this.state.estado ? 'Activo' : 'Inactivo'}
          </Switches>
        </div>

        <div className="flex gap-3">
          <Button
            className="btn-success"
            onClick={() => this.handleGuardar()}
          >
            <i className="fa fa-save"></i> Guardar
          </Button>
          <Button
            className="btn-outline-danger"
            onClick={() => this.props.history.goBack()}
          >
            <i className="fa fa-close"></i> Cerrar
          </Button>
        </div>
      </ContainerWrapper>
    );
  }
}

UbicacionAgregar.propTypes = {
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

const ConnectedUbicacionAgregar = connect(
  mapStateToProps,
  null,
)(UbicacionAgregar);

export default ConnectedUbicacionAgregar;
