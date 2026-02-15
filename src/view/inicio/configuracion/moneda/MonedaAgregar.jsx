import React from 'react';
import PropTypes from 'prop-types';
import CustomComponent from '@/components/CustomComponent';
import ContainerWrapper from '../../../../components/Container';
import {
  isText,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { CANCELED } from '@/constants/requestStatus';
import ErrorResponse from '../../../../model/class/error-response';
import SuccessReponse from '../../../../model/class/response';
import { addMoneda } from '../../../../network/rest/principal.network';
import Title from '../../../../components/Title';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Button from '../../../../components/Button';
import { Switches } from '../../../../components/Checks';
import Input from '../../../../components/Input';
import { alertKit } from 'alert-kit';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class MonedaAgregar extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      idMoneda: '',
      nombre: '',
      codIso: '',
      simbolo: '',
      estado: true,

      idUsuario: this.props.token.userToken.usuario.idUsuario,
    };

    this.refTxtNombre = React.createRef();
    this.refTxtCodIso = React.createRef();
    this.refTxtSimbolo = React.createRef();
    this.refTxtSearch = React.createRef();
    this.refEstado = React.createRef();
  }

  handleGuardar = async () => {
    if (!isText(this.state.nombre)) {
      alertKit.warning({
        title: "Moneda",
        message: "Ingres el nombre.",
        onClose: () => {
          this.refTxtNombre.current.focus();
        }
      })
      return;
    }

    if (!isText(this.state.codIso)) {
      alertKit.warning({
        title: "Moneda",
        message: "Ingres el código.",
        onClose: () => {
          this.refTxtCodIso.current.focus();
        }
      })
      return;
    }

    const accept = await alertKit.question({
      title: "Guía de Remisión",
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
        nombre: this.state.nombre,
        codiso: this.state.codIso,
        simbolo: this.state.simbolo,
        estado: this.state.estado,
        idUsuario: this.state.idUsuario,
      };
      alertKit.loading({
        message: "Procesando información..."
      })

      const response = await addMoneda(data);

      if (response instanceof SuccessReponse) {
        alertKit.success({
          title: "Moneda",
          message: response.data,
          onClose: () => {
            this.props.history.goBack();
          }
        })
      }

      if (response instanceof ErrorResponse) {
        if (response.getType() === CANCELED) return;

        alertKit.warning({
          title: "Moneda",
          message: response.getMessage(),
        })
      }
    }
  };

  render() {
    return (
      <ContainerWrapper>
        <Title
          title="Moneda"
          subTitle="AGREGAR"
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column className="form-group col-md-6" formGroup={true}>
            <Input
              group={true}
              label={
                <>
                  Nombre: <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              ref={this.refTxtNombre}
              value={this.state.nombre}
              onChange={(event) =>
                this.setState({ nombre: event.target.value })
              }
              placeholder="Soles, dolares, etc"
            />
          </Column>

          <Column className="form-group col-md-6" formGroup={true}>
            <Input
              group={true}
              label={
                <>
                  Código ISO:{' '}
                  <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              ref={this.refTxtCodIso}
              value={this.state.codIso}
              onChange={(event) =>
                this.setState({ codIso: event.target.value })
              }
              placeholder="PEN, USD, etc"
            />
          </Column>
        </Row>

        <Row>
          <Column className="form-group col-md-6" formGroup={true}>
            <Input
              group={true}
              label={'Simbolo'}
              ref={this.refTxtSimbolo}
              value={this.state.simbolo}
              onChange={(event) =>
                this.setState({ simbolo: event.target.value })
              }
              placeholder="S/, $, etc"
            />
          </Column>

          <Column className="form-group col-md-6" formGroup={true}>
            <Switches
              label={'Estado:'}
              id={'cbEstado'}
              checked={this.state.estado}
              onChange={(value) =>
                this.setState({ estado: value.target.checked })
              }
            >
              {this.state.estado ? 'Activo' : 'Inactivo'}
            </Switches>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Button className="btn-success" onClick={this.handleGuardar}>
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

MonedaAgregar.propTypes = {
  history: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      usuario: PropTypes.shape({
        idUsuario: PropTypes.string,
      }),
    }),
  }),
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedMonedaAgregar = connect(mapStateToProps, null)(MonedaAgregar);

export default ConnectedMonedaAgregar;
