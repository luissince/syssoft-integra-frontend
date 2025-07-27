import React from 'react';
import PropTypes from 'prop-types';
import CustomComponent from '../../../../model/class/custom-component';
import ContainerWrapper from '../../../../components/Container';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isText,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { CANCELED } from '../../../../model/types/types';
import ErrorResponse from '../../../../model/class/error-response';
import SuccessReponse from '../../../../model/class/response';
import { addMoneda } from '../../../../network/rest/principal.network';
import Title from '../../../../components/Title';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Button from '../../../../components/Button';
import { Switches } from '../../../../components/Checks';
import Input from '../../../../components/Input';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
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

      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refTxtNombre = React.createRef();
    this.refTxtCodIso = React.createRef();
    this.refTxtSimbolo = React.createRef();
    this.refTxtSearch = React.createRef();
    this.refEstado = React.createRef();
  }

  handleGuardar = () => {
    if (!isText(this.state.nombre)) {
      alertWarning('Moneda', 'Ingres el nombre.', () =>
        this.refTxtNombre.current.focus(),
      );
      return;
    }

    if (!isText(this.state.codIso)) {
      alertWarning('Moneda', 'Ingres el código.', () =>
        this.refTxtCodIso.current.focus(),
      );
      return;
    }

    alertDialog('Moneda', '¿Está seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          nombre: this.state.nombre,
          codiso: this.state.codIso,
          simbolo: this.state.simbolo,
          estado: this.state.estado,
          idUsuario: this.state.idUsuario,
        };

        alertInfo('Moneda', 'Procesando información...');

        const response = await addMoneda(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Moneda', response.data);
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertWarning('Moneda', response.getMessage());
        }
      }
    });
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
      idUsuario: PropTypes.string,
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
