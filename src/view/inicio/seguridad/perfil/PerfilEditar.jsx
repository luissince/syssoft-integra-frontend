import React from 'react';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../components/Container';
import CustomComponent from '../../../../model/class/custom-component';
import { isEmpty, isText } from '../../../../helper/utils.helper';
import {
  getIdPerfil,
  updatePerfil,
} from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';
import Title from '../../../../components/Title';
import { SpinnerView } from '../../../../components/Spinner';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Button from '../../../../components/Button';
import Input from '../../../../components/Input';
import { alertKit } from 'alert-kit';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class PerfilEditar extends CustomComponent {
  
  constructor(props) {
    super(props);
    this.state = {
      idPerfil: '',
      descripcion: '',

      loading: true,
      msgLoading: 'Cargando datos...',

      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refDescripcion = React.createRef();

    this.abortController = new AbortController();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const idPerfil = new URLSearchParams(url).get('idPerfil');

    if (isText(idPerfil)) {
      this.loadingData(idPerfil);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    alertKit.close();
    this.abortController.abort();
  }

  async loadingData(id) {
    const params = {
      idPerfil: id,
    };

    const result = await getIdPerfil(params, this.abortController.signal);

    if (result instanceof ErrorResponse) {
      if (result.getType() === CANCELED) return;

      this.props.history.goBack();
      return;
    }

    const perfil = result.data;

    this.setState({
      descripcion: perfil.descripcion,
      idPerfil: perfil.idPerfil,
      loading: false,
    });
  }

  handleInputDescripcion = (event) => {
    this.setState({ descripcion: event.target.value });
  };

  handleEditar = async () => {
    if (isEmpty(this.state.descripcion)) {
      alertKit.warning(
        {
          title: 'Perfil',
          message: '!Ingrese la descripción del perfil!',
        },
        () => {
          this.refDescripcion.current.focus();
        },
      );
      return;
    }

    const accept = await alertKit.question({
      title: 'Perfil',
      message: '¿Estás seguro de continuar?',
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      const data = {
        descripcion: this.state.descripcion.trim(),
        idEmpresa: 'EM0001',
        idUsuario: this.state.idUsuario,
        idPerfil: this.state.idPerfil,
      };

      alertKit.loading({
        message: 'Procesando información...',
      });

      const response = await updatePerfil(data);

      if (response instanceof SuccessReponse) {
        alertKit.success(
          {
            title: 'Perfil',
            message: response.data,
          },
          () => {
            this.props.history.goBack();
          },
        );
      }

      if (response instanceof ErrorResponse) {
        if (response.getType() === CANCELED) return;

        alertKit.warning({
          subTitle: 'Perfil',
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
          message={this.state.msgLoading}
        />

        <Title
          title="Perfil"
          subTitle="EDITAR"
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup>
            <Input
              label={
                <>
                  Descripción:{' '}
                  <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              placeholder="Ingrese la descripción."
              ref={this.refDescripcion}
              value={this.state.descripcion}
              onChange={this.handleInputDescripcion}
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-md-12" formGroup>
            <Button className="btn-warning" onClick={this.handleEditar}>
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

const ConnectedPerfilEditar = connect(mapStateToProps, null)(PerfilEditar);

export default ConnectedPerfilEditar;
