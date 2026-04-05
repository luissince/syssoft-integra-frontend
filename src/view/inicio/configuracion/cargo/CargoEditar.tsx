import React from 'react';
import {
  isText,
  isEmpty,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '@/constants/requestStatus';
import ContainerWrapper from '../../../../components/ui/container-wrapper';
import CustomComponent from '@/components/CustomComponent';
import Title from '../../../../components/Title';
import { SpinnerView } from '../../../../components/Spinner';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Button from '../../../../components/Button';
import { Switches } from '../../../../components/Checks';
import Input from '../../../../components/Input';
import { alertKit } from 'alert-kit';
import { getIdCargo, updateCargo } from '@/network/rest/api-client';

interface Props {
  token: {
    userToken: {
      usuario: {
        idUsuario: string;
      };
    };
  },
  history: {
    goBack: () => void;
  },
  location: {
    search: string;
  };
}

interface State {
  loading: boolean;
  loadingMessage: string;

  idCargo: string;
  nombre: string;
  descripcion: string;
  estado: boolean;

  idUsuario: string;
}

class CargosEditar extends CustomComponent<Props, State> {

  private refNombre: React.RefObject<HTMLInputElement>;
  private refDescripcion: React.RefObject<HTMLInputElement>;
  private abortController: AbortController;

  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      loadingMessage: "Cargando datos...",

      idCargo: "",
      nombre: "",
      descripcion: "",
      estado: false,

      idUsuario: this.props.token.userToken.usuario.idUsuario,
    };

    this.refNombre = React.createRef();
    this.refDescripcion = React.createRef();

    this.abortController = new AbortController();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const idCargo = new URLSearchParams(url).get("idCargo");

    if (isText(idCargo)) {
      this.loadingData(idCargo);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  async loadingData(id) {
    const cargo = await this.fetchObtenerCargo(id);

    this.setState({

      idCargo: cargo.idCargo,
      nombre: cargo.nombre,
      descripcion: cargo.descripcion,
      estado: cargo.estado === 1 ? true : false,

      loading: false,
    });
  }

  async fetchObtenerCargo(id) {
    const response = await getIdCargo(id, this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return null;
    }
  }

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
    if (isEmpty(this.state.nombre)) {
      alertKit.warning({
        title: "Cargo",
        message: "Ingrese el nombre del cargo.",
      }, () => {
        this.refNombre.current.focus();
      });
      return;
    }

    const accept = await alertKit.question({
      title: "Cargo",
      message: "¿Está seguro de continuar?",
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      const data = {
        idCargo: this.state.idCargo,
        nombre: this.state.nombre,
        descripcion: this.state.descripcion,
        estado: this.state.estado,
        idUsuario: this.state.idUsuario,
      };

      alertKit.loading({
        message: "Procesando información...",
      });

      const response = await updateCargo(data);

      if (response instanceof SuccessReponse) {
        alertKit.success({
          title: "Cargo",
          message: response.data,
        }, () => {
          this.props.history.goBack();
        });
      }

      if (response instanceof ErrorResponse) {
        alertKit.warning({
          title: "Cargo",
          message: response.getMessage(),
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
          title="Cargo"
          subTitle="EDITAR"
          icon={<i className="fa fa-edit"></i>}
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Input
              label={
                <>
                  Nombre:<i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              placeholder="Ingrese el nombre"
              ref={this.refNombre}
              value={this.state.nombre}
              onChange={this.handleInputNombre}
            />
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Input
              label={
                <>
                  Descripción:<i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              placeholder="Ingrese la descripción"
              ref={this.refDescripcion}
              value={this.state.descripcion}
              onChange={this.handleInputDescripcion}
            />
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Switches
              id="customSwitchEstado"
              checked={this.state.estado}
              onChange={this.handleSelectEstado}
            >
              {this.state.estado ? 'Activo' : 'Inactivo'}
            </Switches>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
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

const ConnectedCargosEditar = connect(
  mapStateToProps,
  null,
)(CargosEditar);

export default ConnectedCargosEditar;