import React from 'react';
import {
  isEmpty,
  isText,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../components/Container';
import CustomComponent from '@/components/CustomComponent';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { resetUsuario } from '../../../../network/rest/principal.network';
import Title from '../../../../components/Title';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Button from '../../../../components/Button';
import Input from '../../../../components/Input';
import { alertKit } from 'alert-kit';
import { CANCELED } from '@/model/types/types';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
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

  async handleGuardar() {
    if (isEmpty(this.state.resetClave)) {
      alertKit.warning({
        title: 'Usuario',
        message: 'Ingrese la nueva clave.',
      }, () => {
        this.refResetClave.current.focus();
      });
      return;
    }

    const accept = await alertKit.question({
      title: 'Usuario',
      message: '¿Está seguro de continuar?',
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      const data = {
        clave: this.state.resetClave,
        idUsuario: this.state.idUsuario,
      };

      alertKit.loading({
        message: 'Procesando información...',
      });

      const response = await resetUsuario(data);

      if (response instanceof SuccessReponse) {
        alertKit.success({
          title: 'Usuario',
          message: response.data,
        }, () => {
          this.props.history.goBack();
        });
      }

      if (response instanceof ErrorResponse) {
        if (response.getType() === CANCELED) return;

        alertKit.warning({
          title: 'Usuario',
          message: response.getMessage(),
        });
      }
    }
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
