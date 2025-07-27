import React from 'react';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isEmpty,
  isText,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../components/Container';
import CustomComponent from '../../../../model/class/custom-component';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { resetUsuario } from '../../../../network/rest/principal.network';
import Title from '../../../../components/Title';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Button from '../../../../components/Button';
import Input from '../../../../components/Input';

class UsuarioResetear extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      resetClave: '',
    };

    this.refResetClave = React.createRef();
  }

  componentDidMount() {
    const url = this.props.location.search;
    const idUsuario = new URLSearchParams(url).get('idUsuario');
    if (isText(idUsuario)) {
      this.loadDataId(idUsuario);
    } else {
      this.props.history.goBack();
    }
  }

  loadDataId = async (id) => {
    this.setState({
      idUsuario: id,
    });
  };

  handleGuardar() {
    if (isEmpty(this.state.resetClave)) {
      alertWarning('Usuario', 'Ingrese la nueva clave.', () => {
        this.refResetClave.current.focus();
      });
      return;
    }

    alertDialog('Usuario', '¿Está seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          clave: this.state.resetClave,
          idUsuario: this.state.idUsuario,
        };

        alertInfo('Usuario', 'Procesando información...');

        const response = await resetUsuario(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Usuario', response.data, () => {
            this.props.history.goBack();
          });
        }

        if (response instanceof ErrorResponse) {
          alertWarning('Usuario', response.getMessage());
        }
      }
    });
  }

  render() {
    return (
      <ContainerWrapper>
        <Title
          title="Usuario"
          subTitle="CAMBIAR CONTRASEÑA"
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Input
              group={true}
              label={'>Nueva Clave:'}
              placeholder="Nueva clave."
              ref={this.refResetClave}
              value={this.state.resetClave}
              onChange={(event) =>
                this.setState({ resetClave: event.target.value })
              }
            />
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-primary"
              onClick={() => this.handleGuardar()}
            >
              Aceptar
            </Button>{' '}
            <Button
              className="btn-danger"
              onClick={() => this.props.history.goBack()}
            >
              Cerrar
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

const ConnectedUsuarioResetear = connect(
  mapStateToProps,
  null,
)(UsuarioResetear);

export default ConnectedUsuarioResetear;
