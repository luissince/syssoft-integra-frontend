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
  comboTipoComprobante,
  editComprobante,
  getIdComprobante,
} from '../../../../network/rest/principal.network';
import Title from '../../../../components/Title';
import Column from '../../../../components/Column';
import Row from '../../../../components/Row';
import { SpinnerView } from '../../../../components/Spinner';

class ComporbanteEditar extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      idComprobante: '',
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
    const url = this.props.location.search;
    const idComprobante = new URLSearchParams(url).get('idComprobante');

    if (isText(idComprobante)) {
      this.loadingData(idComprobante);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  async loadingData(idComprobante) {
    const [tipoComprobante, comprobante] = await Promise.all([
      this.fetchComboTipoComporbante(),
      this.fetchGetIdComprobante(idComprobante),
    ]);

    this.setState({
      tipoComprobante,
      idComprobante: comprobante.idComprobante,
      idTipoComprobante: comprobante.idTipoComprobante,
      nombre: comprobante.nombre,
      serie: comprobante.serie,
      numeracion: comprobante.numeracion,
      codigo: comprobante.codigo,
      impresion: comprobante.impresion,
      estado: comprobante.estado === 1 ? true : false,
      preferida: comprobante.preferida === 1 ? true : false,
      numeroCampo: comprobante.numeroCampo,
      facturado: comprobante.facturado === 1 ? true : false,
      anulacion: comprobante.anulacion.toString(),
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

  async fetchGetIdComprobante(idComprobante) {
    const params = {
      idComprobante: idComprobante,
    };

    const result = await getIdComprobante(params, this.abortController.signal);

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

    alertDialog('Comprobante', '¿Estás seguro de continuar?', async (accept) => {
      if (accept) {
        alertInfo('Comprobante', 'Procesando información...');

        const data = {
          idTipoComprobante: this.state.idTipoComprobante,
          nombre: this.state.nombre.trim().toUpperCase(),
          serie: this.state.serie.trim().toUpperCase(),
          numeracion: this.state.numeracion,
          codigo: this.state.codigo,
          impresion: this.state.impresion.trim(),
          estado: this.state.estado,
          preferida: this.state.preferida,
          numeroCampo:
            this.state.numeroCampo === '' ? 0 : this.state.numeroCampo,
          facturado: this.state.facturado,
          anulacion: this.state.anulacion,
          idSucursal: this.state.idSucursal,
          idUsuario: this.state.idUsuario,

          idComprobante: this.state.idComprobante,
        };

        const response = await editComprobante(data, this.abortController.signal);

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
          title='Comprobante'
          subTitle='Editar'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column>
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
          </Column>
        </Row>

        <Row>
          <Column>
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
          </Column>
        </Row>

        <Row>
          <Column className={"col-md-6"}>
            <div className="form-group">
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
          </Column>


          <Column className={"col-md-6"}>
            <div className="form-group">
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
          </Column>
        </Row>

        <Row>
          <Column className={"col-md-6"}>
            <div className="form-group">
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
          </Column>
        </Row>

        <Row>
          <Column className={"col-md-6"}>
            <div className="form-group">
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
          </Column>

          <Column className={"col-md-6"}>
            <div className="form-group">
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
          </Column>
        </Row>

        <div className="dropdown-divider"></div>

        <h6>Opciones de Facturación</h6>

        <Row>
          <Column className={"col-md-6"}>
            <div className="form-group">
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
          </Column>

          <Column className={"col-md-6"}>
            <div className="form-group">
              <label htmlFor="nombre" className="col-form-label">
                Formas de anulación:
              </label>
              <Row>
                <Column>
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
                </Column>

                <Column>
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
                </Column>
              </Row>
            </div>
          </Column>
        </Row>

        <Row>
          <Column className={"col-md-6"}>
            <div className="form-group">
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
          </Column>

          <Column className={"col-md-6"}>
            <div className="form-group">
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
          </Column>
        </Row>

        <Row>
          <Column>
            <div className="form-group">
              <button
                type="button"
                className="btn btn-warning"
                onClick={this.handleGuardar}
              >
                <i className='fa fa-edit'></i>  Guardar
              </button>{' '}
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => this.props.history.goBack()}
              >
                <i className='fa fa-close'></i>  Cerrar
              </button>
            </div>
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

const ConnectedComporbanteEditar = connect(mapStateToProps, null)(ComporbanteEditar);

export default ConnectedComporbanteEditar;