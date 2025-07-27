import React from 'react';
import CustomComponent from '../../../../model/class/custom-component';
import ContainerWrapper from '../../../../components/Container';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isNumeric,
  isText,
  keyNumberInteger,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { CANCELED } from '../../../../model/types/types';
import ErrorResponse from '../../../../model/class/error-response';
import SuccessReponse from '../../../../model/class/response';
import {
  addComprobante,
  comboTipoComprobante,
} from '../../../../network/rest/principal.network';
import Title from '../../../../components/Title';
import { SpinnerView } from '../../../../components/Spinner';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Button from '../../../../components/Button';
import Select from '../../../../components/Select';
import Input from '../../../../components/Input';
import { Switches } from '../../../../components/Checks';
import RadioButton from '../../../../components/RadioButton';

class ComporbanteAgregar extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

      idTipoComprobante: '',
      nombre: '',
      serie: '',
      numeracion: '',
      codigo: '',
      impresion: '',
      estado: true,
      preferida: false,
      numeroCampo: '',
      facturado: false,
      creditoFiscal: false,
      anulacion: '0',

      tipoComprobante: [],

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refTipo = React.createRef();
    this.refNombre = React.createRef();
    this.refSerie = React.createRef();
    this.refNumeracion = React.createRef();
    this.refNumeroCampo = React.createRef();

    this.abortController = new AbortController();
  }

  async componentDidMount() {
    this.loadingData();
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  async loadingData() {
    const [tipoComprobante] = await Promise.all([
      this.fetchComboTipoComporbante(),
    ]);

    this.setState({
      tipoComprobante,
      loading: false,
    });
  }

  async fetchComboTipoComporbante() {
    const result = await comboTipoComprobante(this.abortController.signal);

    if (result instanceof SuccessReponse) {
      return result.data;
    }

    if (result instanceof ErrorResponse) {
      if (result.getType() === CANCELED) return;

      return [];
    }
  }

  handleGuardar = () => {
    if (!isText(this.state.idTipoComprobante)) {
      alertWarning('Comprobante', 'Seleccione el tipo de comprobante.', () =>
        this.refTipo.current.focus(),
      );
      return;
    }

    if (!isText(this.state.nombre)) {
      alertWarning('Comprobante', 'Ingrese el nombre de comprobante.', () =>
        this.refNombre.current.focus(),
      );
      return;
    }

    if (!isText(this.state.serie)) {
      alertWarning('Comprobante', 'Ingrese la serie del comprobante.', () =>
        this.refSerie.current.focus(),
      );
      return;
    }

    if (!isNumeric(this.state.numeracion)) {
      alertWarning('Comprobante', 'Ingrese la numeración.', () =>
        this.refNumeracion.current.focus(),
      );
      return;
    }

    if (this.state.numeroCampo < 0 || this.state.numeroCampo > 128) {
      alertWarning(
        'Comprobante',
        'El número de campo no puede ser menor que 0.',
        () => this.refNumeroCampo.current.focus(),
      );
      return;
    }

    alertDialog(
      'Comprobante',
      '¿Estás seguro de continuar?',
      async (accept) => {
        if (accept) {
          alertInfo('Comprobante', 'Procesando información...');

          const data = {
            idTipoComprobante: this.state.idTipoComprobante,
            nombre: this.state.nombre.trim().toUpperCase(),
            serie: this.state.serie.trim().toUpperCase(),
            numeracion: this.state.numeracion,
            impresion: this.state.impresion.trim(),
            codigo: this.state.codigo,
            estado: this.state.estado,
            preferida: this.state.preferida,
            numeroCampo:
              this.state.numeroCampo === '' ? 0 : this.state.numeroCampo,
            facturado: this.state.facturado,
            creditoFiscal: this.state.creditoFiscal,
            anulacion: this.state.anulacion,
            idSucursal: this.state.idSucursal,
            idUsuario: this.state.idUsuario,
          };

          const response = await addComprobante(
            data,
            this.abortController.signal,
          );

          if (response instanceof SuccessReponse) {
            alertSuccess('Comprobante', response.data, () => {
              this.props.history.goBack();
            });
          }

          if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            alertWarning('Comprobante', response.getMessage());
          }
        }
      },
    );
  };

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title="Comprobante"
          subTitle="AGREGAR"
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Select
              group={true}
              label={
                <>
                  Tipo de Comprobante:{' '}
                  <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              className="form-control"
              id="estado"
              ref={this.refTipo}
              value={this.state.idTipoComprobante}
              onChange={(event) => {
                this.setState({ idTipoComprobante: event.target.value });
              }}
            >
              <option value="">- Seleccione -</option>
              {this.state.tipoComprobante.map((item, index) => (
                <option key={index} value={item.idTipoComprobante}>
                  {item.nombre}
                </option>
              ))}
            </Select>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Input
              label={
                <>
                  Nombre: <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              placeholder="Ingresar el nombre del comprobante"
              ref={this.refNombre}
              value={this.state.nombre}
              onChange={(event) =>
                this.setState({ nombre: event.target.value })
              }
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6" formGroup={true}>
            <Input
              label={
                <>
                  Serie: <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              placeholder={'B001, F001'}
              ref={this.refSerie}
              value={this.state.serie}
              onChange={(event) => this.setState({ serie: event.target.value })}
            />
          </Column>

          <Column className="col-md-6" formGroup={true}>
            <Input
              label={
                <>
                  Numeración:
                  <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              placeholder={'1, 2, 3'}
              ref={this.refNumeracion}
              value={this.state.numeracion}
              onChange={(event) =>
                this.setState({ numeracion: event.target.value })
              }
              onKeyDown={keyNumberInteger}
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6" formGroup={true}>
            <Input
              label={<>Caracteres a Usar:</>}
              placeholder={'0, 8, 11'}
              ref={this.refNumeroCampo}
              value={this.state.numeroCampo}
              onChange={(event) =>
                this.setState({ numeroCampo: event.target.value })
              }
              onKeyDown={keyNumberInteger}
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6" formGroup={true}>
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

          <Column className="col-md-6" formGroup={true}>
            <Switches
              label={'Preferido:'}
              id={'cbPreferido'}
              checked={this.state.preferida}
              onChange={(value) =>
                this.setState({ preferida: value.target.checked })
              }
            >
              {this.state.preferida ? 'Si' : 'No'}
            </Switches>
          </Column>
        </Row>

        <div className="dropdown-divider"></div>

        <h6>Opciones de Facturación</h6>

        <Row>
          <Column className="col-md-6" formGroup={true}>
            <Switches
              label={'El comprobante será declarado ante la SUNAT:'}
              id={'cbFacturado'}
              checked={this.state.facturado}
              onChange={(value) =>
                this.setState({ facturado: value.target.checked })
              }
            >
              {this.state.facturado ? 'Si' : 'No'}
            </Switches>
          </Column>

          <Column className="col-md-6" formGroup={true}>
            <Switches
              label={
                'El comprobante será utilizado para el calculo de Crédito Fiscal.'
              }
              id={'cbCreditoFiscal'}
              checked={this.state.creditoFiscal}
              onChange={(value) =>
                this.setState({ creditoFiscal: value.target.checked })
              }
            >
              {this.state.creditoFiscal ? 'Si' : 'No'}
            </Switches>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6" formGroup={true}>
            <label htmlFor="nombre" className="col-form-label">
              Formas de anulación:
            </label>

            <Row>
              <Column>
                <RadioButton
                  className="form-check-inline"
                  name="inlineRadioOptions"
                  id={'1'}
                  value={'1'}
                  checked={this.state.anulacion === '1'}
                  onChange={(event) => {
                    this.setState({
                      anulacion: event.target.value,
                    });
                  }}
                >
                  Comunicación de baja
                </RadioButton>
              </Column>

              <Column>
                <RadioButton
                  className="form-check-inline"
                  name="inlineRadioOptions"
                  id={'2'}
                  value={'2'}
                  checked={this.state.anulacion === '2'}
                  onChange={(event) => {
                    this.setState({
                      anulacion: event.target.value,
                    });
                  }}
                >
                  Resumen diario
                </RadioButton>
              </Column>
            </Row>
          </Column>
        </Row>

        <Row>
          <Column className={'col-md-6'} formGroup={true}>
            <Input
              label={<> Nombre de Impresión:</>}
              placeholder="Ejm: Boleta Electrónica, Factura Electrónica..."
              value={this.state.impresion}
              onChange={(event) =>
                this.setState({ impresion: event.target.value })
              }
            />
          </Column>

          <Column className={'col-md-6'} formGroup={true}>
            <Input
              label={<> Código:</>}
              placeholder="01, 06"
              value={this.state.codigo}
              onChange={(event) =>
                this.setState({ codigo: event.target.value })
              }
            />
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

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedComporbanteAgregar = connect(
  mapStateToProps,
  null,
)(ComporbanteAgregar);

export default ConnectedComporbanteAgregar;
