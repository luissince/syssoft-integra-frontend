import React from 'react';
import {
  isText,
  isEmpty,
} from '@/helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '@/components/ui/container-wrapper';
import {
  getIdUbicacion,
  updateUbicacion,
} from '@/network/rest/principal.network';

import Title from '@/components/Title';
import { SpinnerView } from '@/components/Spinner';
import PropTypes from 'prop-types';
import Button from '@/components/Button';
import { Switches } from '@/components/Checks';
import Input from '@/components/Input';
import { alertKit } from 'alert-kit';
import CustomComponent from '@/components/CustomComponent';

class UbicacionEditar extends CustomComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      loadingMessage: "Cargando datos...",

      idUbicacion: "",
      descripcion: "",
      estado: false,

      idUsuario: this.props.token.userToken.usuario.idUsuario,
    };

    this.refDescripcion = React.createRef();

    this.abortController = new AbortController();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const idUbicacion = new URLSearchParams(url).get("idUbicacion");

    if (isText(idUbicacion)) {
      this.loadingData(idUbicacion);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  async loadingData(id) {
    const { success, message, data } = await getIdUbicacion(id, this.abortController.signal);

    if (!success) {
      alertKit.warning({
        title: "Ubicación",
        message: message,
      }, () => {
        this.props.history.goBack();
      });
    }

    this.setState({
      idUbicacion: data.idUbicacion,
      descripcion: data.descripcion,
      estado: data.estado === 1 ? true : false,

      loading: false,
    });
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
        idUbicacion: this.state.idUbicacion,
        descripcion: this.state.descripcion,
        estado: this.state.estado,
        idUsuario: this.state.idUsuario,
      };

      alertKit.loading({
        message: "Procesando información...",
      });

      const { success, message, data } = await updateUbicacion(body);

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
        <SpinnerView
          loading={this.state.loading}
          message={this.state.loadingMessage}
        />

        <Title
          title="Ubicación"
          subTitle="EDITAR"
          icon={<i className="fa fa-edit"></i>}
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
            className="btn-warning"
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
      </ContainerWrapper>
    );
  }
}

UbicacionEditar.propTypes = {
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

const ConnectedUbicacionEditar = connect(
  mapStateToProps,
  null,
)(UbicacionEditar);

export default ConnectedUbicacionEditar;
