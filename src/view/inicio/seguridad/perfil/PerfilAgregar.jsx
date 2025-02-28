import React from 'react';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../components/Container';
import CustomComponent from '../../../../model/class/custom-component';
import {
  alertWarning,
  isEmpty,
} from '../../../../helper/utils.helper';
import { addPerfil } from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';
import Title from '../../../../components/Title';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';
import { alertKit, AlertType } from 'alert-kit';

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

            const response = await addPerfil(data);

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
                    onClick: () =>  this.props.history.goBack(),                  
                  },
                ],
              });
            }

            if (response instanceof ErrorResponse) {
              if (response.getType() === CANCELED) return;

              alertKit.show({
                type: AlertType.warning,
                headerTitle: "SysSoft Integra",
                title: "Perfil",
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
  };

  render() {
    return (
      <ContainerWrapper>
        <Title
          title='Perfil'
          subTitle='AGREGAR'
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
              className="btn-primary"
              onClick={this.handleGuardar}
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


const ConnectedPerfilAgregar = connect(mapStateToProps, null)(PerfilAgregar);

export default ConnectedPerfilAgregar;
