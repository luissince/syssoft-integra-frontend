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
  spinnerLoading,
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

class ComporbanteAgregar extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
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
      anulacion: "0",

      tipoComprobante: [],

      loading: true,
      msgLoading: 'Cargando datos...',

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
      alertWarning('Comprobante', 'El número de campo no puede ser menor que 0.', () => this.refNumeroCampo.current.focus());
      return;
    }

    alertDialog('Comprobante', '¿Estás seguro de continuar?',
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
            anulacion: this.state.anulacion,
            idUsuario: this.state.idUsuario,
          };
          console.log(data)
          const response = await addComprobante(data, this.abortController.signal);

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
        {this.state.loading && spinnerLoading(this.state.msgLoading)}

        <Title
          title='Comprobante'
          subTitle='Agregar'
          handleGoBack={() => this.props.history.goBack()}
        />

        <div className="row">
          <div className="col">
            <div className="form-group">
              <label htmlFor="estado">
                Tipo de Comprobante: <i className="fa fa-asterisk text-danger small"></i>
              </label>
              <select
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
              </select>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="form-group">
              <label htmlFor="nombre" className="col-form-label">
                Nombre <i className="fa fa-asterisk text-danger small"></i>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ingresar el nombre del comprobante"
                id="nombre"
                ref={this.refNombre}
                value={this.state.nombre}
                onChange={(event) =>
                  this.setState({ nombre: event.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="form-group col-md-6">
            <label htmlFor="serie">
              Serie <i className="fa fa-asterisk text-danger small"></i>
            </label>
            <input
              type="text"
              className="form-control"
              id="serie"
              placeholder={'B001, F001'}
              ref={this.refSerie}
              value={this.state.serie}
              onChange={(event) => this.setState({ serie: event.target.value })}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="numeracion">
              Numeración <i className="fa fa-asterisk text-danger small"></i>
            </label>
            <input
              type="text"
              className="form-control"
              id="numeracion"
              placeholder={'1, 2, 3'}
              ref={this.refNumeracion}
              value={this.state.numeracion}
              onChange={(event) =>
                this.setState({ numeracion: event.target.value })
              }
              onKeyDown={keyNumberInteger}
            />
          </div>
        </div>

        <div className="row">
          <div className="form-group col-md-6">
            <label htmlFor="numeracion">Caracteres a Usar</label>
            <input
              ref={this.refNumeroCampo}
              type="text"
              className="form-control"
              id="numeracion"
              placeholder={'0, 8, 11'}
              value={this.state.numeroCampo}
              onChange={(event) =>
                this.setState({ numeroCampo: event.target.value })
              }
              onKeyDown={keyNumberInteger}
            />
          </div>
        </div>

        <div className="row">
          <div className="form-group col-md-6">
            <label htmlFor="nombre" className="col-form-label">
              Estado:
            </label>
            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input"
                id="cbEstado"
                checked={this.state.estado}
                onChange={(value) =>
                  this.setState({ estado: value.target.checked })
                }
              />
              <label className="custom-control-label" htmlFor="cbEstado">
                {this.state.estado ? 'Activo' : 'Inactivo'}
              </label>
            </div>
          </div>

          <div className="form-group col-md-6">
            <label htmlFor="nombre" className="col-form-label">
              Preferido:
            </label>
            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input"
                id="cbPreferido"
                checked={this.state.preferida}
                onChange={(value) =>
                  this.setState({ preferida: value.target.checked })
                }
              />
              <label className="custom-control-label" htmlFor="cbPreferido">
                {this.state.preferida ? "Si" : "No"}
              </label>
            </div>
          </div>
        </div>

        <div className="dropdown-divider"></div>

        <h6>Opciones de Facturación</h6>

        <div className="row">
          <div className="form-group col-md-6">
            <label htmlFor="nombre" className="col-form-label">
              El comporbante va ser enviado a Sunat:
            </label>
            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input"
                id="cbFacturado"
                checked={this.state.facturado}
                onChange={(value) =>
                  this.setState({ facturado: value.target.checked })
                }
              />
              <label className="custom-control-label" htmlFor="cbFacturado">
                {this.state.facturado ? "Si" : "No"}
              </label>
            </div>
          </div>

          <div className="form-group col-md-6">
            <label htmlFor="nombre" className="col-form-label">
              Formas de anulación:
            </label>
            <div className="row">
              <div className="col">
                <div className="form-check form-check-inline pr-5">
                  <input
                    className="form-check-input checked"
                    type="radio"
                    name="inlineRadioOptions"
                    id={"1"}
                    value={"1"}
                    checked={this.state.anulacion === "1"}
                    onChange={(event) => {
                      this.setState({
                        anulacion: event.target.value
                      })
                    }}
                  />
                  <label className="form-check-label" htmlFor={"1"}>
                    {' '}
                    Comunicación de baja
                  </label>
                </div>
              </div>

              <div className='col'>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="inlineRadioOptions"
                    id={"2"}
                    value={"2"}
                    checked={this.state.anulacion === "2"}
                    onChange={(event) => {
                      this.setState({
                        anulacion: event.target.value
                      })
                    }}
                  />
                  <label className="form-check-label" htmlFor={"2"}>
                    {' '}
                    Resumen diario
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="form-group col-md-6">
            <label htmlFor="impresion" className="col-form-label">
              Nombre de Impresión:
            </label>
            <input
              type="text"
              className="form-control"
              id="impresion"
              placeholder='Ejm: Boleta Electrónica, Factura Electrónica...'
              value={this.state.impresion}
              onChange={(event) =>
                this.setState({ impresion: event.target.value })
              }
            />
          </div>

          <div className="form-group col-md-6">
            <label htmlFor="codigo" className="col-form-label">
              Código:
            </label>
            <input
              type="text"
              className="form-control"
              id="codigo"
              placeholder='01, 06'
              value={this.state.codigo}
              onChange={(event) =>
                this.setState({ codigo: event.target.value })
              }
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.handleGuardar}
              >
                <i className='fa fa-save'></i>  Guardar
              </button>{' '}
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => this.props.history.goBack()}
              >
                <i className='fa fa-close'></i>  Cerrar
              </button>
            </div>
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

export default connect(mapStateToProps, null)(ComporbanteAgregar);
