import React from 'react';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isEmpty,
  spinnerLoading,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../components/Container';
import { cdrStatus, consultarComprobante } from '../../../../network/rest/cpesunat.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { loadEmpresa } from '../../../../network/rest/principal.network';


class CpeElectronicos extends React.Component {
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
      descarga: '',
      file: '',
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

        const data = {
          rucSol: this.state.ruc,
          userSol: this.state.usuario,
          passSol: this.state.clave,
          tipo: this.state.tipo,
          serie: this.state.serie.toUpperCase(),
          correlativo: this.state.correlativo,
        };

        alertInfo("Consulta","Precesanso...")

        const response = await consultarComprobante(data);

        if (response instanceof SuccessReponse) {
          const result = response.data;

          if (result.state === true) {
            if (result.accepted === true) {
              alertSuccess(
                'Consultar Comprobante',
                'Resultado: Código ' + result.code + ' ' + result.message,
              );
              // if (cdr != "") {
              //     // $("#lblRutaDescarga").append('<a onclick="descargarCdr(\'' + result.file + '\')"" style="cursor:pointer">' + result.file + '</a>');
              // }
            } else {
              alertWarning(
                'Consultar Comprobante',
                'Resultado: Código ' + result.code + ' ' + result.message,
              );
            }
          } else {
            alertWarning(
              'Consultar Comprobante',
              'Resultado: Código ' + result.code + ' ' + result.message,
            );
          }
        }

        if (response instanceof ErrorResponse) {
          alertWarning('Consultar Comprobante', response.getMessage());
        }
      }
    });
  }

  async onEventConsultarCdr() {
    if (this.state.ruc === '') {
      await this.setStateAsync({
        messageWarning: 'Ingrese el número ruc de la empresa.',
      });
      return;
    }


    if (this.state.usuario === '') {
      await this.setStateAsync({
        messageWarning: 'El campo usuario es requerido.',
      });
      return;
    }

    if (this.state.clave === '') {
      await this.setStateAsync({
        messageWarning: 'El campo contraseña es requerido.',
      });
      return;
    }

    if (this.state.tipo === '') {
      await this.setStateAsync({
        messageWarning: 'Seleccione tipo de documento.',
      });
      return;
    }

    if (this.state.serie === '') {
      await this.setStateAsync({
        messageWarning: 'Ingrese una serie correcta.',
      });
      return;
    }

    if (this.state.correlativo === '') {
      await this.setStateAsync({ messageWarning: 'Ingrese un correlativo.' });
      return;
    }

    alertDialog('Consulta', '¿Está seguro de continuar?', async (value) => {
      if (value) {
        const data = {
          rucSol: this.state.ruc,
          userSol: this.state.usuario,
          passSol: this.state.clave,
          ruc: this.state.ruc,
          tipo: this.state.tipo,
          serie: this.state.serie.toUpperCase(),
          numero: this.state.correlativo,
          cdr: 'cdr',
        };

        const response = await cdrStatus(data);

        if (response instanceof SuccessReponse) {
          const result = response.data;

          if (result.state === true) {
            if (result.accepted === true) {
              alertSuccess(
                'Consultar Comprobante',
                'Resultado: Código ' + result.code + ' ' + result.message,
              );
              // if (cdr != "") {
              //     // $("#lblRutaDescarga").append('<a onclick="descargarCdr(\'' + result.file + '\')"" style="cursor:pointer">' + result.file + '</a>');
              // }
            } else {
              alertWarning(
                'Consultar Comprobante',
                'Resultado: Código ' + result.code + ' ' + result.message,
              );
            }
          } else {
            alertWarning(
              'Consultar Comprobante',
              'Resultado: Código ' + result.code + ' ' + result.message,
            );
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
      descarga: '',
      file: '',
    });

    this.refTipo.current.focus();
  }

  onEventDownload() {
    // let ruta_completa = `${process.env.REACT_APP_URL}/app/files/${this.state.file}`;
    // window.open(ruta_completa, 'Download');
  }

  render() {
    return (
      <ContainerWrapper>
        {this.state.msgLoading && spinnerLoading(this.state.msgMessage)}

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="form-group">
              <h5>
                Consultar Comprobantes{' '}
                <small className="text-secondary">LISTA</small>
              </h5>
            </div>
          </div>
        </div>

        {this.state.messageWarning === '' ? null : (
          <div className="alert alert-warning" role="alert">
            <i className="bi bi-exclamation-diamond-fill"></i>{' '}
            {this.state.messageWarning}
          </div>
        )}

        <div className="row">
          <div className="col-md-6 col-sm-12">
            <div className="form-group">
              <h6>Credenciales </h6>
            </div>
          </div>

          <div className="col-md-6 col-sm-12">
            <div className="form-group">
              <h6>Datos del Comprobante </h6>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 col-sm-12">
            <label>Ruc: </label>
            <div className="form-group">
              <input
                className="form-control"
                type="text"
                placeholder="Ingrese su RUC"
                ref={this.refRuc}
                value={this.state.ruc}
                onChange={(value) => this.setState({ ruc: value.target.value })}
              />
            </div>
          </div>
          <div className="col-md-6 col-sm-12">
            <label>Tipo: </label>
            <div className="form-group">
              <select
                ref={this.refTipo}
                className="form-control"
                value={this.state.tipo}
                onChange={(value) =>
                  this.setState({ tipo: value.target.value })
                }
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
              </select>
            </div>
          </div>

        </div>

        <div className="row">
          <div className="col-md-6 col-sm-12">
            <label>usuario: </label>
            <div className="form-group">
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
            </div>
          </div>
          <div className="col-md-6 col-sm-12">
            <label>Serie: </label>
            <div className="form-group">
              <input
                ref={this.refSerie}
                className="form-control"
                type="text"
                placeholder="F001 / B001 / etc"
                maxLength="4"
                value={this.state.serie}
                onChange={(value) =>
                  this.setState({ serie: value.target.value })
                }
              />
            </div>
          </div>

        </div>

        <div className="row">
          <div className="col-md-6 col-sm-12">
            <label>Contraseña: </label>
            <div className="form-group">
              <input
                className="form-control"
                type="password"
                placeholder="Ingrese Contraseña"
                autoComplete="off"
                ref={this.refClave}
                value={this.state.clave}
                onChange={(value) =>
                  this.setState({ clave: value.target.value })
                }
              />
            </div>
          </div>
          <div className="col-md-6 col-sm-12">
            <label>Correlativo: </label>
            <div className="form-group">
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
            </div>
          </div>
          
        </div>

        <div className="row">
          <div className="col-md-6 col-sm-12">
            <div className="form-group">
              <button
                className="btn btn-success"
                onClick={() => this.onEventConsultarEstado()}
              >
                Consultar Estado{' '}
              </button>{' '}
              <button
                className="btn btn-primary"
                onClick={() => this.onEventConsultarCdr()}
              >
                Consultar CDR{' '}
              </button>{' '}
              <button
                className="btn btn-danger"
                onClick={() => this.onEventLimpiar()}
              >
                Limpiar{' '}
              </button>
            </div>
          </div>
          <div className="col-md-6 col-sm-12"></div>
        </div>

        <div className="row">
          <div className="col-sm-12">
            <div className="form-group">
              <h6>Resultado</h6>
            </div>
          </div>
          <div className="col-sm-12">
            <label>Codigo: </label>
            <label>{this.state.codigo}</label>
          </div>
          <div className="col-sm-12">
            <label>Respuesta: </label>
            <label>{this.state.respuesta}</label>
          </div>
          <div className="col-sm-12">
            <label>Ruta de descarga: </label>{' '}
            <span>
              {this.state.descarga !== '' ? (
                <button
                  className="btn btn-link"
                  onClick={() => {
                    this.onEventDownload();
                  }}
                  type="button"
                >
                  {' '}
                  {this.state.file}
                </button>
              ) : null}
            </span>
          </div>
        </div>
      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

export default connect(mapStateToProps, null)(CpeElectronicos);
