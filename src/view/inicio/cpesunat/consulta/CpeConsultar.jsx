import React from 'react';
import PropTypes from 'prop-types';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  guId,
  isEmpty,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../components/Container';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import {
  cdrCpeSunat,
  consultarCpeSunat,
  loadEmpresa,
} from '../../../../network/rest/principal.network';
import { downloadFileAsync } from '../../../../redux/downloadSlice';
import { SpinnerView } from '../../../../components/Spinner';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Title from '../../../../components/Title';
import Button from '../../../../components/Button';
import Select from '../../../../components/Select';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class CpeElectronicos extends React.Component {
  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      msgLoading: true,
      msgMessage: 'Cargando información...',

      messageWarning: '',

      ruc: '',
      usuario: '',
      clave: '',
      tipo: '',
      serie: '',
      correlativo: '',

      codigo: '',
      respuesta: '',
    };

    this.refRuc = React.createRef();
    this.refUsuario = React.createRef();
    this.refClave = React.createRef();

    this.refTipo = React.createRef();
    this.refSerie = React.createRef();
    this.refCorrelativo = React.createRef();
  }

  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve);
    });
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = async () => {
    const respsonse = await loadEmpresa();

    if (respsonse instanceof SuccessReponse) {
      await this.setStateAsync({
        ruc: respsonse.data.documento,
        usuario: respsonse.data.usuarioSolSunat,
        clave: respsonse.data.claveSolSunat,

        msgLoading: false,
      });

      this.refTipo.current.focus();
    }
  };

  async onEventConsultarEstado() {
    if (isEmpty(this.state.ruc)) {
      alertWarning('Empressa', 'Ingrese el número ruc de la empresa.', () => {
        this.refRuc.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.usuario)) {
      alertWarning('Empressa', 'El campo usuario es requerido.', () => {
        this.refUsuario.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.clave)) {
      alertWarning('Empressa', 'El campo contraseña es requerido.', () => {
        this.refClave.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.tipo)) {
      alertWarning('Empressa', 'Seleccione tipo de documento.', () => {
        this.refTipo.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.serie)) {
      alertWarning('Empressa', 'Ingrese una serie correcta.', () => {
        this.refSerie.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.correlativo)) {
      alertWarning('Empressa', 'Ingrese un correlativo.', () => {
        this.refCorrelativo.current.focus();
      });
      return;
    }

    alertDialog('Consulta', '¿Está seguro de continuar?', async (value) => {
      if (value) {
        alertInfo('Consulta', 'Precesanso...');

        const response = await consultarCpeSunat(
          this.state.ruc,
          this.state.usuario,
          this.state.clave,
          this.state.tipo,
          this.state.serie.toUpperCase(),
          this.state.correlativo,
        );

        if (response instanceof SuccessReponse) {
          const result = response.data;

          if (result.state === true) {
            if (result.accepted === true) {
              alertSuccess(
                'Consultar Comprobante',
                'Resultado: Código ' + result.code + ' ' + result.message,
              );
              this.setState({ codigo: result.code, respuesta: result.message });
            } else {
              alertWarning(
                'Consultar Comprobante',
                'Resultado: Código ' + result.code + ' ' + result.message,
              );
              this.setState({ codigo: result.code, respuesta: result.message });
            }
          } else {
            alertWarning(
              'Consultar Comprobante',
              'Resultado: Código ' + result.code + ' ' + result.message,
            );
            this.setState({ codigo: result.code, respuesta: result.message });
          }
        }

        if (response instanceof ErrorResponse) {
          alertWarning('Consultar Comprobante', response.getMessage());
        }
      }
    });
  }

  async onEventConsultarCdr() {
    if (isEmpty(this.state.ruc)) {
      alertWarning('Empressa', 'Ingrese el número ruc de la empresa.', () => {
        this.refRuc.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.usuario)) {
      alertWarning('Empressa', 'El campo usuario es requerido.', () => {
        this.refUsuario.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.clave)) {
      alertWarning('Empressa', 'El campo contraseña es requerido.', () => {
        this.refClave.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.tipo)) {
      alertWarning('Empressa', 'Seleccione tipo de documento.', () => {
        this.refTipo.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.serie)) {
      alertWarning('Empressa', 'Ingrese una serie correcta.', () => {
        this.refSerie.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.correlativo)) {
      alertWarning('Empressa', 'Ingrese un correlativo.', () => {
        this.refCorrelativo.current.focus();
      });
      return;
    }

    alertDialog('Consulta', '¿Está seguro de continuar?', async (value) => {
      if (value) {
        alertInfo('Consulta', 'Precesanso...');

        const response = await cdrCpeSunat(
          this.state.ruc,
          this.state.usuario,
          this.state.clave,
          this.state.tipo,
          this.state.serie.toUpperCase(),
          this.state.correlativo,
        );

        if (response instanceof SuccessReponse) {
          const result = response.data;

          if (result.state === true) {
            if (result.accepted === true) {
              alertSuccess(
                'Consultar Comprobante',
                'Resultado: Código ' + result.code + ' ' + result.message,
              );

              const id = guId();
              this.props.downloadFileAsync({
                id,
                url: '',
                name: result.fileName + '.xml',
                isFile: true,
                content: result.xml,
              });
              this.setState({ codigo: result.code, respuesta: result.message });
            } else {
              alertWarning(
                'Consultar Comprobante',
                'Resultado: Código ' + result.code + ' ' + result.message,
              );
              this.setState({ codigo: result.code, respuesta: result.message });
            }
          } else {
            alertWarning(
              'Consultar Comprobante',
              'Resultado: Código ' + result.code + ' ' + result.message,
            );
            this.setState({ codigo: result.code, respuesta: result.message });
          }
        }

        if (response instanceof ErrorResponse) {
          alertWarning('Consultar Comprobante', response.getMessage());
        }
      }
    });
  }

  async onEventLimpiar() {
    await this.setStateAsync({
      tipo: '',
      serie: '',
      correlativo: '',

      codigo: '',
      respuesta: '',
    });

    this.refTipo.current.focus();
  }

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.msgLoading}
          message={this.state.msgMessage}
        />

        <Title
          title="Consultar Comprobantes"
          subTitle="FORMULARIO"
          handleGoBack={() => this.props.history.goBack()}
        />

        {this.state.messageWarning === '' ? null : (
          <div className="alert alert-warning" role="alert">
            <i className="bi bi-exclamation-diamond-fill"></i>{' '}
            {this.state.messageWarning}
          </div>
        )}

        <Row>
          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <h6>Credenciales </h6>
          </Column>

          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <h6>Datos del Comprobante </h6>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <label>Ruc: </label>
            <input
              className="form-control"
              type="text"
              placeholder="Ingrese su RUC"
              ref={this.refRuc}
              value={this.state.ruc}
              onChange={(value) => this.setState({ ruc: value.target.value })}
            />
          </Column>

          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <label>Tipo: </label>
            <Select
              ref={this.refTipo}
              value={this.state.tipo}
              onChange={(value) => this.setState({ tipo: value.target.value })}
            >
              <option value=""> -- Seleccione -- </option>
              <option value="01">01 - Factura</option>
              <option value="03">03 - Boleta De Venta</option>
              <option value="07">07 - Nota de Crédito</option>
              <option value="08">08 - Nota de Débito</option>
              <option value="R1">R1 - Recibo por Honorarios</option>
              <option value="R7">
                R7 - Nota Crédito Recibo por Honorarios{' '}
              </option>
              <option value="04">04 - Liquidación de Compra</option>
              <option value="23">
                23 - Póliza de Adjudicación Electrónica
              </option>
            </Select>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <label>usuario: </label>
            <input
              className="form-control"
              type="text"
              placeholder="Ingrese su Usuario"
              ref={this.refUsuario}
              value={this.state.usuario}
              onChange={(value) =>
                this.setState({ usuario: value.target.value })
              }
            />
          </Column>

          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <label>Serie: </label>
            <input
              ref={this.refSerie}
              className="form-control"
              type="text"
              placeholder="F001 / B001 / etc"
              maxLength="4"
              value={this.state.serie}
              onChange={(value) => this.setState({ serie: value.target.value })}
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <label>Contraseña: </label>
            <input
              className="form-control"
              type="password"
              placeholder="Ingrese Contraseña"
              autoComplete="off"
              ref={this.refClave}
              value={this.state.clave}
              onChange={(value) => this.setState({ clave: value.target.value })}
            />
          </Column>

          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <label>Correlativo: </label>
            <input
              ref={this.refCorrelativo}
              className="form-control"
              type="number"
              placeholder="ingrese correlativo (1,2,3...)"
              value={this.state.correlativo}
              onChange={(value) =>
                this.setState({ correlativo: value.target.value })
              }
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <Button
              className="btn-success"
              onClick={() => this.onEventConsultarEstado()}
            >
              Consultar Estado
            </Button>{' '}
            <Button
              className="btn-primary"
              onClick={() => this.onEventConsultarCdr()}
            >
              Consultar CDR
            </Button>{' '}
            <Button
              className="btn-danger"
              onClick={() => this.onEventLimpiar()}
            >
              Limpiar
            </Button>
          </Column>
          <div className="col-md-6 col-sm-12"></div>
        </Row>

        <Row>
          <Column className="col-sm-12">
            <div className="form-group">
              <h6>Resultado</h6>
            </div>
          </Column>
          <Column className="col-sm-12">
            <label>Codigo: {this.state.codigo}</label>
          </Column>
          <Column className="col-sm-12">
            <label>Respuesta: {this.state.respuesta}</label>
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

CpeElectronicos.propTypes = {
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  downloadFileAsync: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const mapDispatchToProps = { downloadFileAsync };

const ConnectedCpeElectronicos = connect(
  mapStateToProps,
  mapDispatchToProps,
)(CpeElectronicos);

export default ConnectedCpeElectronicos;
