import React from 'react';
import {
  spinnerLoading,
  numberFormat,
  formatTime,
  currentDate,
  limitarCadena,
  alertWarning,
  keyUpSearch,
  isEmpty,
  formatNumberWithZeros,
  alertDialog,
  alertSuccess,
  alertError,
  alertInfo,
  isText,
} from '../../../../helper/utils.helper';

import { connect } from 'react-redux';
import FileDownloader from '../../../../components/FileDownloader';
import Paginacion from '../../../../components/Paginacion';
import ContainerWrapper from '../../../../components/Container';
import { images } from '../../../../helper';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import {
  comboComprobante,
  comboSucursal,
  facturarCpeSunat,
  listCpeSunat,
  obtenerFacturacionPdfVenta,
} from '../../../../network/rest/principal.network';
import { CANCELED } from '../../../../model/types/types';
import CustomComponent from '../../../../model/class/custom-component';
import { VENTA, GUIA_DE_REMISION, NOTA_DE_CREDITO } from '../../../../model/types/tipo-comprobante';
import { pdfA4GuiaRemision, pdfTicketGuiaRemision } from '../../../../helper/lista-pdf.helper';
import { senGuiaRemision, sendComunicacionDeBaja, sendResumenDiario } from '../../../../network/rest/cpesunat.network';

class CpeElectronicos extends CustomComponent {

  constructor(props) {
    super(props);
    this.state = {
      initialLoad: true,
      initialMessage: 'Cargando datos...',

      loading: false,
      lista: [],
      restart: false,

      // viewPdf: statePrivilegio(
      //   this.props.token.userToken.menus[7].submenu[0].privilegio[0].estado,
      // ),
      // viewXml: statePrivilegio(
      //   this.props.token.userToken.menus[7].submenu[0].privilegio[1].estado,
      // ),
      // viewEmail: statePrivilegio(
      //   this.props.token.userToken.menus[7].submenu[0].privilegio[2].estado,
      // ),
      // ViewResumenDiario: statePrivilegio(
      //   this.props.token.userToken.menus[7].submenu[0].privilegio[3].estado,
      // ),
      // viewDeclarar: statePrivilegio(
      //   this.props.token.userToken.menus[7].submenu[0].privilegio[4].estado,
      // ),

      fechaInicio: currentDate(),
      fetchaFinal: currentDate(),
      idComprobante: '',
      idSucursal: '',
      comprobantes: [],
      sucursales: [],

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',

      // idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refTxtSearch = React.createRef();

    this.abortControllerTable = new AbortController();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const comprobante = new URLSearchParams(url).get('comprobante');
    if (isText(comprobante)) {
      this.refTxtSearch.current.value = comprobante
    }

    await this.loadingData();
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
  }

  loadingData = async () => {
    const [
      facturado,
      notaCredito,
      guiaRemision,
      sucursales
    ] = await Promise.all([
      this.fetchComprobante(VENTA),
      this.fetchComprobante(NOTA_DE_CREDITO),
      this.fetchComprobante(GUIA_DE_REMISION),
      this.fetchSucursal(),
    ]);

    const comprobantes = [...facturado, ...notaCredito, ...guiaRemision];

    const sucursal = sucursales.find(item => item.idSucursal === this.props.token.project.idSucursal)

    this.setState({
      idSucursal: sucursal.idSucursal,
      comprobantes: comprobantes,
      sucursales: sucursales,
      initialLoad: false,
    }, () => {
      this.loadInit()
    })
  }

  async fetchComprobante(tipo) {
    const params = {
      tipo: tipo,
    };

    const response = await comboComprobante(
      params,
      this.abortControllerTable.signal,
    );

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchSucursal() {
    const response = await comboSucursal(this.abortControllerTable.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  loadInit = async () => {
    if (this.state.loading) return;

    await this.setStateAsync({ paginacion: 1, restart: true });
    this.fillTable(0, '');
    await this.setStateAsync({ opcion: 0 });
  }

  async searchText(text) {
    if (this.state.loading) return;

    if (text.trim().length === 0) return;

    await this.setStateAsync({ paginacion: 1, restart: false });
    this.fillTable(1, text.trim());
    await this.setStateAsync({ opcion: 1 });
  }

  paginacionContext = async (listid) => {
    await this.setStateAsync({ paginacion: listid, restart: false });
    this.onEventPaginacion();
  }

  onEventPaginacion = () => {
    switch (this.state.opcion) {
      case 0:
        this.fillTable(0, '');
        break;
      case 1:
        this.fillTable(1, this.refTxtSearch.current.value);
        break;
      default:
        this.fillTable(0, '');
    }
  }

  fillTable = async (opcion, buscar) => {
    this.setState({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const params = {
      opcion: opcion,
      buscar: buscar,
      idSucursal: this.state.idSucursal,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listCpeSunat(params, this.abortControllerTable.signal);

    if (response instanceof SuccessReponse) {
      const totalPaginacion = parseInt(
        Math.ceil(parseFloat(response.data.total) / this.state.filasPorPagina),
      );

      this.setState({
        loading: false,
        lista: response.data.result,
        totalPaginacion: totalPaginacion,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.setState({
        loading: false,
        lista: [],
        totalPaginacion: 0,
        messageTable: response.getMessage(),
      });
    }
  }

  handleInputFechaInicio = (event) => {
    const { value } = event.target;
    if (value !== this.state.fechaInicio) {
      this.setState({ fechaInicio: event.target.value })
    }
  }

  handleInputFechaFinal = (event) => {
    const { value } = event.target;
    if (value !== this.state.fetchaFinal) {
      this.setState({ fetchaFinal: event.target.value })
    }
  }

  handleSelectComprobante = (event) => {
    this.setState({ idComprobante: event.target.value })
  }

  handleSelectSucursal = (event) => {
    this.setState({ idSucursal: event.target.value })
  }

  handleSendFactura = (idVenta) => {
    alertDialog("Cpe Sunat", "¿Está seguro de enviar el comprobante electrónico?", async (accept) => {
      if (accept) {
        alertInfo("Cpe Sunat", "Firmando xml y enviando a sunat.")

        const response = await facturarCpeSunat(idVenta);

        if (response instanceof SuccessReponse) {
          const { state, accept, code, description } = response.data;

          if (state) {
            if (accept) {
              alertSuccess("Cpe Sunat", "Código " + code + " " + description, () => {
                this.onEventPaginacion()
              });
            } else {
              alertWarning("Cpe Sunat", "Código " + code + " " + description);
            }
          } else {
            alertWarning("Cpe Sunat", "Código " + code + " " + description);
          }
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertError("Cpe Sunat", response.getMessage())
        }
      }
    });
  }

  handleSendResumenDiario = (idVenta, comprobante) => {
    alertDialog("Cpe Sunat", `¿Está seguro de anular el comprobante electrónico ${comprobante}, se va hacer un resumen diario?`, async (accept) => {
      if (accept) {

        alertInfo("Cpe Sunat", "Firmando xml y enviando a sunat.")

        const response = await sendResumenDiario(idVenta);

        if (response instanceof SuccessReponse) {
          const { state, accept, code, description } = response.data;

          if (state) {
            if (accept) {
              alertSuccess("Cpe Sunat", "Código " + code + " " + description, () => {
                this.onEventPaginacion()
              });
            } else {
              alertWarning("Cpe Sunat", "Código " + code + " " + description);
            }
          } else {
            alertWarning("Cpe Sunat", "Código " + code + " " + description);
          }
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertError("Cpe Sunat", response.getMessage())
        }

      }
    });
  }

  handleSendComunicacionDeBaja = (idVenta, comprobante) => {
    alertDialog("Cpe Sunat", `¿Está seguro de anular el comprobante electrónico ${comprobante}, se va hacer una comunicación de baja?`, async (accept) => {
      if (accept) {

        alertInfo("Cpe Sunat", "Firmando xml y enviando a sunat.")

        const response = await sendComunicacionDeBaja(idVenta);

        if (response instanceof SuccessReponse) {
          const { state, accept, code, description } = response.data;

          if (state) {
            if (accept) {
              alertSuccess("Cpe Sunat", "Código " + code + " " + description, () => {
                this.onEventPaginacion()
              });
            } else {
              alertWarning("Cpe Sunat", "Código " + code + " " + description);
            }
          } else {
            alertWarning("Cpe Sunat", "Código " + code + " " + description);
          }
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertError("Cpe Sunat", response.getMessage())
        }

      }
    });
  }

  handleSendGuiaRemision = (idGuiaRemision) => {
    alertDialog("Cpe Sunat", "¿Está seguro de enviar el comprobante electrónico?", async (accept) => {
      if (accept) {

        alertInfo("Cpe Sunat", "Firmando xml y enviando a sunat.")

        const response = await senGuiaRemision(idGuiaRemision);

        if (response instanceof SuccessReponse) {
          const { state, accept, code, description } = response.data;

          if (state) {
            if (accept) {
              alertSuccess("Cpe Sunat", "Código " + code + " " + description, () => {
                this.onEventPaginacion()
              });
            } else {
              alertWarning("Cpe Sunat", "Código " + code + " " + description);
            }
          } else {
            alertWarning("Cpe Sunat", "Código " + code + " " + description);
          }
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertError("Cpe Sunat", response.getMessage())
        }

      }
    });
  }

  handleOpenPdfA4 = (idComprobante, tipo) => {
    if (tipo === "fac") {
      window.open(obtenerFacturacionPdfVenta(idComprobante, "a4"), '_blank');
    } else {
      window.open(pdfA4GuiaRemision(idComprobante), '_blank');
    }
  }

  handleOpenPdfTicket = (idComprobante, tipo) => {
    if (tipo === "fac") {
      window.open(obtenerFacturacionPdfVenta(idComprobante, "ticket"), '_blank');
    } else {
      window.open(pdfTicketGuiaRemision(idComprobante), '_blank');
    }

  }

  handleDownloadXml = () => {
    alertWarning("Cpe Sunet", "Opción en matenimiento")
  }

  handleSendEmail = () => {
    alertWarning("Cpe Sunet", "Opción en matenimiento")
  }

  opcionButtonOpcion(image, title, width, alt, onClick) {
    return (
      <li>
        <button
          className="dropdown-item"
          type="button"
          onClick={onClick}>
          <img
            src={image}
            width={width}
            alt={alt}
          />{" "}
          {title}
        </button>
      </li>
    );
  }

  opcionButtonEnvio(image, alt, onClick) {
    return (
      <button
        className="btn btn-light btn-sm"
        onClick={onClick}
      >
        <img src={image} alt={alt} width="22" />
      </button>
    );
  }

  renderEstado(item) {
    if (item.tipo === "fac") {
      if (item.estado === 0) {
        return this.opcionButtonEnvio(images.error, 'Error', () => {
          this.handleSendFactura(item.idComprobante);
        });
      }

      if (isEmpty(item.xmlSunat)) {
        return this.opcionButtonEnvio(images.reuse, 'Reutilizar', () => {
          this.handleSendFactura(item.idComprobante);
        });
      }

      if (item.xmlSunat === '0') {
        return this.opcionButtonEnvio(images.accept, 'Aceptar');
      }

      return this.opcionButtonEnvio(images.unable, 'Incapaz', () => {
        this.handleSendFactura(item.idComprobante);
      });
    } else {
      if (item.estado === 0) {
        return this.opcionButtonEnvio(images.error, 'Error', () => {
          this.handleSendGuiaRemision(item.idComprobante);
        });
      }

      if (isEmpty(item.xmlSunat)) {
        return this.opcionButtonEnvio(images.reuse, 'Reutilizar', () => {
          this.handleSendGuiaRemision(item.idComprobante);
        });
      }

      if (item.xmlSunat === '0') {
        return this.opcionButtonEnvio(images.accept, 'Aceptar');
      }

      return this.opcionButtonEnvio(images.unable, 'Incapaz', () => {
        this.handleSendGuiaRemision(item.idComprobante);
      });
    }

  }

  generateBody() {
    const { loading, lista } = this.state;

    if (loading) {
      return (
        <tr>
          <td className="text-center" colSpan="9">
            {spinnerLoading('Cargando información de la tabla...', true)}
          </td>
        </tr>
      );
    }

    if (isEmpty(lista)) {
      return (
        <tr>
          <td className="text-center" colSpan="9">¡No hay datos registrados!</td>
        </tr>
      );
    }

    return lista.map((item, index) => {
      const descripcion = item.xmlDescripcion === '' ? 'Por Generar Xml' : limitarCadena(item.xmlDescripcion, 90, '...');

      return (
        <tr key={index}>
          <td className={`text-center`}>{item.id}</td>
          <td>
            <div className="dropdown">
              <a
                className="btn btn-primary dropdown-toggle"
                href="#"
                role="button"
                id="dropdownMenuLink"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fa fa-th-list"></i>
              </a>

              <ul className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                {this.opcionButtonOpcion(images.pdf, 'Archivo Pdf A4', 22, 'Pdf A4', () => this.handleOpenPdfA4(item.idComprobante, item.tipo))}
                {this.opcionButtonOpcion(images.invoice, 'Archivo Pdf 80mm', 22, 'Pdf Ticket', () => this.handleOpenPdfTicket(item.idComprobante, item.tipo))}
                {this.opcionButtonOpcion(images.xml, 'Archivo Xml', 22, 'Xml', () => this.handleDownloadXml(item.idComprobante))}
                {this.opcionButtonOpcion(images.email, 'Enviar Correo', 22, 'Email', () => this.handleSendEmail(item.idComprobante))}
                {item.tipo === "fac" && item.anulacion !== 0 && this.opcionButtonOpcion(images.error, item.anulacion === 1 ? 'Comunicación de Baja' : 'Resumen Diario', 22, 'Error', () => {
                  if (item.anulacion === 1) {
                    this.handleSendComunicacionDeBaja(item.idComprobante, item.serie + '-' + formatNumberWithZeros(item.numeracion))
                  } else {
                    this.handleSendResumenDiario(item.idComprobante, item.serie + '-' + formatNumberWithZeros(item.numeracion))
                  }
                })}
              </ul>
            </div>
          </td>
          <td>
            <span>{item.fecha}<br />{formatTime(item.hora)}</span>
          </td>
          <td>
            {item.comprobante}<br />{item.serie + '-' + formatNumberWithZeros(item.numeracion)}
          </td>
          <td>
            {`${item.tipoDocumento} - ${item.documento}`}<br />{item.informacion}
          </td>
          <td className="text-center">
            {item.estado === 0
              ? <span className="text-danger">DAR DE BAJA</span>
              : <span className="text-success">DECLARAR</span>
            }
          </td>
          <td className='text-right'>
            {numberFormat(item.total, item.codiso)}
          </td>
          <td className="text-center">
            {this.renderEstado(item)}
          </td>
          <td>{descripcion}</td>
        </tr>
      );
    });
  }

  render() {
    return (
      <ContainerWrapper>
        {this.state.initialLoad && spinnerLoading(this.state.initialMessage)}

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="form-group">
              <h5>
                Comprobante de Pago Electrónico{' '}
                <small className="text-secondary">LISTA</small>
              </h5>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="form-group">
              <span>Resumen de Boletas/Facturas/Nota Crédito/Nota Débito</span>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-2 col-md-2 col-sm-12 col-xs-12">
            <div className="form-group">
              <img src={images.sunat} alt="Estado Sunat" width="24" />{' '}
              <span>Estados SUNAT:</span>
            </div>
          </div>
          <div className="col-lg-2 col-md-2 col-sm-12 col-xs-12">
            <div className="form-group">
              <img src={images.accept} alt="Aceptado" width="24" />{' '}
              <span>Aceptado</span>
            </div>
          </div>
          <div className="col-lg-2 col-md-2 col-sm-12 col-xs-12">
            <div className="form-group">
              <img src={images.unable} alt="Rechazo" width="24" />{' '}
              <span>Rechazado</span>
            </div>
          </div>
          <div className="col-lg-2 col-md-2 col-sm-12 col-xs-12">
            <div className="form-group">
              <img src={images.reuse} alt="Pendiende de envío" width="24" />{' '}
              <span>Pendiente de Envío</span>
            </div>
          </div>
          <div className="col-lg-2 col-md-2 col-sm-12 col-xs-12">
            <div className="form-group">
              <img src={images.error} alt="Comunicación de baja" width="24" />{' '}
              <span> Comunicación de Baja (Anulado)</span>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="form-group">
              <button
                className="btn btn-outline-light"
                onClick={this.loadInit}
              >
                <i className="bi bi-arrow-clockwise"></i> Recargar Vista
              </button>{' '}
              <button
                className="btn btn-outline-success"
              >
                <i className="bi bi-file-earmark-excel-fill"></i> Generar Excel
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-3 col-md-3 col-sm-12 col-xs-12">
            <div className="form-group">
              <label>Fecha de Inicio:</label>
              <input
                className="form-control"
                type="date"
                value={this.state.fechaInicio}
                onChange={this.handleInputFechaInicio}
              />
            </div>
          </div>
          <div className="col-lg-3 col-md-3 col-sm-12 col-xs-12">
            <div className="form-group">
              <label>Fecha de Fin:</label>
              <input
                className="form-control"
                type="date"
                value={this.state.fetchaFinal}
                onChange={this.handleInputFechaFinal}
              />
            </div>
          </div>
          <div className="col-lg-3 col-md-3 col-sm-12 col-xs-12">
            <div className="form-group">
              <label>Comprobantes:</label>
              <select
                className="form-control"
                value={this.state.idComprobante}
                onChange={this.handleSelectComprobante}
              >
                <option value="">TODOS</option>
                {
                  this.state.comprobantes.map((item, index) => (
                    <option key={index} value={item.idComprobante}>{item.nombre}</option>
                  ))
                }
              </select>
            </div>
          </div>
          <div className="col-lg-3 col-md-3 col-sm-12 col-xs-12">
            <div className="form-group">
              <label>Estados:</label>
              <select
                className="form-control"
              >
                <option value={'0'}>TODOS</option>
                <option value={'1'}>POR DECLARAR</option>
                <option value={'2'}>POR ANULAR</option>
              </select>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <div className="form-group">
              <label>Buscar:</label>
              <div className="input-group mb-2">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="bi bi-search"></i>
                  </div>
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ingrese los datos requeridos..."
                  ref={this.refTxtSearch}
                  onKeyUp={(event) => keyUpSearch(event, () => this.searchText(event.target.value))}
                />
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
            <div className="form-group">
              <label>Sucursal:</label>
              <select
                className="form-control"
                value={this.state.idSucursal}
                onChange={this.handleSelectSucursal}
              >
                {
                  this.state.sucursales.map((item, index) => (
                    <option key={index} value={item.idSucursal}>{item.nombre}</option>
                  ))
                }
              </select>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="table-responsive">
              <table className="table table-striped table-bordered rounded">
                <thead>
                  <tr>
                    <th width="5%" className="text-center">
                      #
                    </th>
                    <th width="5%">Opciones</th>
                    <th width="10%">Fecha</th>
                    <th width="10%">Comprobante</th>
                    <th width="15%">Cliente</th>
                    <th width="10%">Estado</th>
                    <th width="10%">Total</th>
                    <th width="10%">Estado Sunat</th>
                    <th width="10%">Observación SUNAT</th>
                  </tr>
                </thead>
                <tbody>{this.generateBody()}</tbody>
              </table>
            </div>
          </div>
        </div>

        <Paginacion
          loading={this.state.loading}
          data={this.state.lista}
          totalPaginacion={this.state.totalPaginacion}
          paginacion={this.state.paginacion}
          fillTable={this.paginacionContext}
          restart={this.state.restart}
        />

        <FileDownloader ref={this.refUseFileXml} />
      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

const ConnectedCpeElectronicos = connect(mapStateToProps, null)(CpeElectronicos);

export default ConnectedCpeElectronicos;