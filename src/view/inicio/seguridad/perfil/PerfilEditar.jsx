import React from 'react';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../components/Container';
import CustomComponent from '../../../../model/class/custom-component';
import {
  alertWarning,
  isEmpty,
  isText,
} from '../../../../helper/utils.helper';
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
import { alertKit, AlertType } from 'alert-kit';

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

  handleEditar = () => {
    if (isEmpty(this.state.descripcion)) {
      alertWarning('Perfil', 'Ingrese la descripción del perfil', () => {
        this.refDescripcion.current.focus();
      });
      return;
    }

    alertKit.show({
      type: AlertType.question,
      headerTitle: "SysSoft Integra",
      title: "Perfil",
      message: '¿Estás seguro de continuar?',
      backdropBlur: false,
      isMoveable: true,
      showCloseButton: false,
      closeOnEsc: false,
      closeOnClickOutside: false,
      buttons: [
        {
          html: "<i class='fa fa-check'></i> Aceptar",
          primary: true,
          class: ['btn', 'btn-primary'],
          onClick: async () => {
            const data = {
              descripcion: this.state.descripcion.trim(),
              idEmpresa: 'EM0001',
              idUsuario: this.state.idUsuario,
              idPerfil: this.state.idPerfil,
            };

            alertKit.show({
              type: AlertType.loading,
              message: 'Procesando información...',
              backdropBlur: false,
              showCloseButton: false,
              closeOnEsc: false,
              closeOnClickOutside: false,
              autoClose: false,
              buttons: [],
            });

            const response = await updatePerfil(data);

            if (response instanceof SuccessReponse) {
              alertKit.show({
                type: AlertType.success,
                headerTitle: "SysSoft Integra",
                title: "Perfil",
                backdropBlur: false,
                message: response.data,
                buttons: [
                  {
                    html: "<i class='fa fa-check'></i> Aceptar",
                    primary: true,
                    class: ['btn', 'btn-outline-primary'],
                    onClick: () => this.props.history.goBack(),
                  },
                ],
              });
            }

            if (response instanceof ErrorResponse) {
              if (response.getType() === CANCELED) return;

              alertKit.show({
                type: AlertType.warning,
                title: "SysSoft Integra",
                subTitle: "Perfil",
                backdropBlur: false,
                message: response.getMessage(),
                buttons: [
                  {
                    html: "<i class='fa fa-check'></i> Aceptar",
                    primary: true,
                    class: ['btn', 'btn-outline-primary'],
                  },
                ],
              });

            }
          },        
        },
        {
          html: "<i class='fa fa-close'></i> Eliminar",
          class: ['btn', 'btn-outline-danger']
        },
      ],
    });

    // alertDialog('Perfil', '¿Estás seguro de continuar?', async (accept) => {
    //   if (accept) {
    //     alertInfo('Perfil', 'Procesando información...');

    //     const data = {
    //       descripcion: this.state.descripcion.trim(),
    //       idEmpresa: 'EM0001',
    //       idUsuario: this.state.idUsuario,
    //       idPerfil: this.state.idPerfil,
    //     };

    //     const response = await updatePerfil(data);

    //     if (response instanceof SuccessReponse) {
    //       alertSuccess('Perfil', response.data, () => {
    //         this.props.history.goBack();
    //       });
    //     }

    //     if (response instanceof ErrorResponse) {
    //       if (response.getType() === CANCELED) return;

    //       alertWarning('Perfil', response.getMessage());
    //     }
    //   }
    // });
  };

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title='Perfil'
          subTitle='EDITAR'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup>
            <Input
              label={<>Descripción: <i className="fa fa-asterisk text-danger small"></i></>}
              placeholder="Ingrese la descripción."
              refInput={this.refDescripcion}
              value={this.state.descripcion}
              onChange={this.handleInputDescripcion}
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-md-12" formGroup>
            <Button
              className="btn-warning"
              onClick={this.handleEditar}
            >
              <i className="fa fa-edit"></i> Guardar
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