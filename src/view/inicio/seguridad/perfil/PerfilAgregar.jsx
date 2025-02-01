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
import Title from '../../../../components/Title';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';

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
