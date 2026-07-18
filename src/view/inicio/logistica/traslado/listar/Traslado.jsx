import React from 'react';
import {
  isEmpty,
  formatTime,
  getPathRoute,
} from '../../../../../helper/utils.helper';
import ContainerWrapper from '../../../../../components/Container';
import Paginacion from '../../../../../components/Paginacion';
import { currentDate } from '../../../../../helper/utils.helper';
import CustomComponent from '@/components/CustomComponent';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import PropTypes from 'prop-types';
import {
  cancelTraslado,
  comboSucursal,
  comboTipoTraslado,
  listTraslado,
} from '../../../../../network/rest/principal.network';
import { CANCELED } from '../../../../../model/types/types';
import { connect } from 'react-redux';
import { SpinnerView } from '../../../../../components/Spinner';
import Title from '../../../../../components/Title';
import Search from '../../../../../components/Search';
import {
  setListaTrasladoData,
  setListaTrasladoPaginacion,
} from '../../../../../redux/predeterminadoSlice';
import { alertKit } from 'alert-kit';
import { MOTIVO_TRASLADO } from '@/model/types/motivo-traslado';
import { cn } from '@/lib/utils';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class Traslado extends CustomComponent {
  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      initialLoad: true,
      initialMessage: 'Cargando datos...',

      idTipoTraslado: '',
      fechaInicio: currentDate(),
      fechaFinal: currentDate(),

      tipoTraslado: [],
      sucursales: [],

      loading: false,
      lista: [],
      restart: false,

      buscar: '',

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,

      view: "tabla",
    };

    this.refPaginacion = React.createRef();

    this.refSearch = React.createRef();

    this.abortControllerTable = new AbortController();
  }

  async componentDidMount() {
    await this.loadingData();
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
  }

  loadingData = async () => {
    if (
      this.props.trasladoLista &&
      this.props.trasladoLista.data &&
      this.props.trasladoLista.paginacion
    ) {
      this.setState(this.props.trasladoLista.data);
      this.refPaginacion.current.upperPageBound =
        this.props.trasladoLista.paginacion.upperPageBound;
      this.refPaginacion.current.lowerPageBound =
        this.props.trasladoLista.paginacion.lowerPageBound;
      this.refPaginacion.current.isPrevBtnActive =
        this.props.trasladoLista.paginacion.isPrevBtnActive;
      this.refPaginacion.current.isNextBtnActive =
        this.props.trasladoLista.paginacion.isNextBtnActive;
      this.refPaginacion.current.pageBound =
        this.props.trasladoLista.paginacion.pageBound;
      this.refPaginacion.current.messagePaginacion =
        this.props.trasladoLista.paginacion.messagePaginacion;

      this.refSearch.current.initialize(this.props.trasladoLista.data.buscar);
    } else {
      const [tipoTraslado, sucursales] = await Promise.all([
        this.fetchComboTipoTraslado(),
        this.fetchSucursal(),
      ]);

      this.setState({
        tipoTraslado,
        sucursales,
        initialLoad: false,
      }, async () => {
        await this.loadInit();
        this.updateReduxState();
      });
    }
  };

  updateReduxState() {
    this.props.setListaTrasladoData(this.state);
    this.props.setListaTrasladoPaginacion({
      upperPageBound: this.refPaginacion.current.upperPageBound,
      lowerPageBound: this.refPaginacion.current.lowerPageBound,
      isPrevBtnActive: this.refPaginacion.current.isPrevBtnActive,
      isNextBtnActive: this.refPaginacion.current.isNextBtnActive,
      pageBound: this.refPaginacion.current.pageBound,
      messagePaginacion: this.refPaginacion.current.messagePaginacion,
    });
  }

  loadInit = async () => {
    if (this.state.loading) return;

    await this.setStateAsync({ paginacion: 1, restart: true });
    this.fillTable(0);
    await this.setStateAsync({ opcion: 0 });
  };

  async searchSucursal() {
    if (this.state.loading) return;

    await this.setStateAsync({ paginacion: 1, restart: false });
    this.fillTable(0);
    await this.setStateAsync({ opcion: 0 });
  }

  searchText = async (text) => {
    if (this.state.loading) return;

    if (text.trim().length === 0) return;

    await this.setStateAsync({ paginacion: 1, restart: false, buscar: text });
    this.fillTable(1, text.trim());
    await this.setStateAsync({ opcion: 1 });
  };

  async searchFechas() {
    if (this.state.loading) return;

    if (this.state.fechaInicio > this.state.fechaFinal) return;

    await this.setStateAsync({ paginacion: 1, restart: false });
    this.fillTable(2);
    await this.setStateAsync({ opcion: 2 });
  }

  async searchTipoTraslado() {
    if (this.state.loading) return;

    await this.setStateAsync({ paginacion: 1, restart: false });
    this.fillTable(3);
    await this.setStateAsync({ opcion: 3 });
  }

  paginacionContext = async (listid) => {
    await this.setStateAsync({ paginacion: listid, restart: false });
    this.onEventPaginacion();
  };

  onEventPaginacion = () => {
    switch (this.state.opcion) {
      case 0:
        this.fillTable(0);
        break;
      case 1:
        this.fillTable(1, this.state.buscar);
        break;
      case 2:
        this.fillTable(2);
        break;
      case 3:
        this.fillTable(3);
        break;
      default:
        this.fillTable(0);
    }
  };

  fillTable = async (opcion, buscar = '') => {
    this.setState({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const data = {
      opcion: opcion,
      idSucursal: this.state.idSucursal,
      buscar: buscar.trim(),
      fechaInicio: this.state.fechaInicio,
      fechaFinal: this.state.fechaFinal,
      idTipoTraslado: this.state.idTipoTraslado,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listTraslado(data, this.abortControllerTable.signal);

    if (response instanceof SuccessReponse) {
      const totalPaginacion = parseInt(
        String(Math.ceil(parseFloat(response.data.total) / this.state.filasPorPagina)),
      );

      this.setState({
        loading: false,
        lista: response.data.result,
        totalPaginacion: totalPaginacion,
      }, () => {
        this.updateReduxState();
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
  };

  async fetchComboTipoTraslado() {
    const response = await comboTipoTraslado(this.abortControllerTable.signal);

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

  handleChangeView(value) {
    this.setState({ view: value }, () => this.updateReduxState());
  };

  handleSelectTipoTraslado = (event) => {
    this.setState({ idTipoTraslado: event.target.value }, () => {
      this.searchTipoTraslado();
    });
  };

  handleInputFechaInicio = (event) => {
    this.setState({ fechaInicio: event.target.value }, () => {
      this.searchFechas();
    });
  };

  handleInputFechaFinal = (event) => {
    this.setState({ fechaFinal: event.target.value }, () => {
      this.searchFechas();
    });
  };

  handleSelectSucursal = (event) => {
    this.setState({ idSucursal: event.target.value }, async () => {
      this.searchSucursal();
    });
  };

  handleAgregar = () => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/crear`,
    });
  };

  handleDetalle = (idTraslado) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/detalle`,
      search: '?idTraslado=' + idTraslado,
    });
  };

  handleGuiaRemision = (idTraslado) => {
    this.props.history.push({
      pathname: getPathRoute('guia-create'),
      state: {
        idTraslado: idTraslado,
        idMotivoTraslado: MOTIVO_TRASLADO.TRASLADO_ENTRE_ESTABLECIMIENTO_MISMA_EMPRESA,

      }
    });
  };

  handleCancelar = async (idTraslado) => {
    const accept = await alertKit.question({
      title: 'Traslado',
      message: '¿Estás seguro de anular el traslado?',
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      alertKit.loading({
        message: 'Procesando información...',
      });

      const params = {
        idTraslado: idTraslado,
        idUsuario: this.state.idUsuario,
      };

      const response = await cancelTraslado(params);

      if (response instanceof SuccessReponse) {
        alertKit.success({
          title: 'Traslado',
          message: response.data,
        }, () => {
          this.loadInit();
        });
      }

      if (response instanceof ErrorResponse) {
        if (response.getType() === CANCELED) return;

        alertKit.warning({
          title: 'Traslado',
          message: response.getMessage(),
        });
      }
    }

  };

  renderTable = () => {
    const { loading, lista, view } = this.state;

    if (loading) {
      return (
        <div className="flex flex-col items-center py-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-gray-500">Cargando información...</p>
        </div>
      );
    }

    if (isEmpty(lista)) {
      return (
        <div className="text-center py-3">
          <div className="text-gray-500">
            <i className="bi bi-box text-4xl mb-3 block"></i>
            <p className="text-lg font-medium">No se encontraron ventas</p>
            <p className="text-sm">Intenta cambiar los filtros</p>
          </div>
        </div>
      );
    }

    return (
      <div className={cn(
        view === "tabla"
          ? "divide-y divide-gray-200"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr"
      )}>
        {
          lista.map((item, index) => {
            const estado = item.estado === 1 ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">ACTIVO</span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">ANULADO</span>
            );

            return (
              <React.Fragment key={index}>
                {/* 📱 MOBILE: Tarjeta con labels */}
                <div className={cn(
                  view == "tabla" ? "hidden" : "flex bg-white rounded border flex-col h-full"
                )}>
                  <div className="flex flex-col gap-2 p-4 text-sm">
                    {/* Body */}
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex items-center justify-start gap-3">
                        <p className="font-medium text-gray-600">Fecha:</p>
                        <p>{item.fecha} {formatTime(item.hora)}</p>
                      </div>

                      <div className="flex items-center justify-start gap-3">
                        <p className="font-medium text-gray-600">Tipo:</p>
                        <p>{item.tipo}</p>
                      </div>

                      <div className="flex items-center justify-start gap-3">
                        <p className="font-medium text-gray-600">Motivo:</p>
                        <p>{item.motivo}</p>
                      </div>

                      <div className="flex items-center justify-start gap-3">
                        <p className="font-medium text-gray-600">Origen:</p>
                        <p>{item.almacenOrigen}</p>
                      </div>

                      <div className="flex items-center justify-start gap-3">
                        <p className="font-medium text-gray-600">Destino:</p>
                        <p>{item.almacenDestino}</p>
                      </div>

                      <div className="flex items-center justify-start gap-3">
                        <p className="font-medium text-gray-600">Observación:</p>
                        <p className="col-span-1">{item.observacion}</p>
                      </div>

                      <div className="flex items-center justify-start gap-3">
                        <p className="font-medium text-gray-600">Estado:</p>
                        <p>{estado}</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center flex-col justify-between gap-2 pt-3 border-t border-gray-100">
                      <div>
                        <button
                          onClick={() => this.handleDetalle(item.idTraslado)}
                          className="flex-1 p-2 text-blue-500 hover:text-blue-700"
                        >
                          <i className="bi bi-eye text-lg"></i>
                        </button>
                        <button
                          onClick={() => this.handleGuiaRemision(item.idTraslado)}
                          className="flex-1 p-2 text-gray-500 hover:text-gray-700"
                        >
                          <i className="fa fa-truck text-lg"></i>
                        </button>
                        <button
                          onClick={() => this.handleCancelar(item.idTraslado)}
                          className="flex-1 p-2 text-red-500 hover:text-red-700"
                        >
                          <i className="bi bi-trash text-lg"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 💻 DESKTOP: Fila de tabla */}
                <div className={cn(
                  view == "tabla" ? "grid" : "hidden",
                  "grid-cols-[0.5fr_1fr_1.5fr_1.5fr_1.5fr_1.5fr_0.8fr_0.6fr_0.6fr_0.6fr] gap-x-3 text-sm text-gray-900 items-center"
                )}>
                  <div className="py-3 text-center">{item.id}</div>
                  <div className="py-3">
                    {item.fecha} <br />
                    <span className="text-xs text-gray-500">{formatTime(item.hora)}</span>
                  </div>
                  <div className="py-3">
                    {item.tipo} <br />
                    <span className="text-xs text-gray-500">{item.motivo}</span>
                  </div>
                  <div className="py-3">{item.almacenOrigen}</div>
                  <div className="py-3">{item.almacenDestino}</div>
                  <div className="py-3 truncate">{item.observacion}</div>
                  <div className="py-3 justify-self-center">{estado}</div>
                  <div className="py-3 text-center">
                    <button onClick={() => this.handleDetalle(item.idTraslado)} className="text-blue-500 hover:text-blue-700">
                      <i className="bi bi-eye"></i>
                    </button>
                  </div>
                  <div className="py-3 text-center">
                    <button onClick={() => this.handleGuiaRemision(item.idTraslado)} className="text-gray-500 hover:text-gray-700">
                      <i className="fa fa-truck"></i>
                    </button>
                  </div>
                  <div className="py-3 text-center">
                    <button onClick={() => this.handleCancelar(item.idTraslado)} className="text-red-500 hover:text-red-700">
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        }
      </div>
    );
  }

  render() {
    const { view } = this.state;

    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.initialLoad}
          message={this.state.initialMessage}
        // body={<>
        //   <div className='d-flex flex-column align-items-center'>
        //     <p>No se pudo obtener los datos requeridos, comuníquese con su proveedor del sistema.</p>
        //     <Button
        //       className='btn-danger'>
        //       <i className='fa fa-refresh'></i> Recargar
        //     </Button>
        //   </div>
        // </>}
        />

        {/* Encabezado */}
        <Title
          title="Traslado"
          subTitle="LISTA"
          handleGoBack={() => this.props.history.goBack()}
        />

        {/* Acciones principales + Toggle view */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <button
              className={cn(
                "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2",
                "bg-blue-600 text-white text-sm font-medium rounded",
                "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition",
              )}
              onClick={this.handleAgregar}
              aria-label="Crear nueva venta"
            >
              <i className="bi bi-file-plus"></i>
              Nuevo Registro
            </button>
            <button
              className={cn(
                "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2",
                "bg-gray-200 text-gray-700 text-sm font-medium rounded",
                "hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition",
              )}
              onClick={this.loadInit}
            >
              <i className="bi bi-arrow-clockwise"></i>
              Recargar Vista
            </button>
          </div>

          {/* Toggle view */}
          <div className="flex bg-gray-100 rounded p-1 gap-1">
            <button
              onClick={() => this.handleChangeView("tabla")}
              className={
                cn(
                  "flex-1 sm:flex-none flex items-center justify-center gap-1",
                  "text-sm font-medium",
                  "px-4 py-2",
                  "rounded-md transition ",
                  view === "tabla" ? "bg-white text-blue-600" : "text-gray-600 hover:text-gray-800",
                )
              }
            >
              <i className="bi bi-list-ul"></i>
              <span className="hidden sm:inline">Tabla</span>
            </button>
            <button
              onClick={() => this.handleChangeView("cuadricula")}
              className={
                cn(
                  "flex-1 sm:flex-none flex items-center justify-center gap-1",
                  "text-sm font-medium",
                  "px-4 py-2",
                  "rounded-md transition ",
                  view === "cuadricula" ? "bg-white text-blue-600" : "text-gray-600 hover:text-gray-800",
                )
              }
            >
              <i className="bi bi-grid-3x3"></i>
              <span className="hidden sm:inline">Cuadrícula</span>
            </button>
          </div>
        </div>

        {/* Filtros de fechas, comprobante y estado */}
        <div className="flex flex-col gap-y-4 mb-4">
          <p className="text-gray-600 mt-1">
            Puedes ver todos los traslados con diferentes filtros.
          </p>
        </div>

        {/* Filtros de fechas, comprobante y estado */}
        <div className="flex flex-col gap-y-4 mb-4">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tipo Traslado */}
            <select
              className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={this.state.idTipoTraslado}
              onChange={this.handleSelectTipoTraslado}
            >
              <option value="0">-- Selecciona --</option>
              {
                this.state.tipoTraslado.map((item, index) => (
                  <option key={index} value={item.idTipoTraslado}>
                    {item.nombre}
                  </option>
                ))
              }
            </select>

            {/* Fecha Inicio */}
            <input
              type="date"
              value={this.state.fechaInicio}
              onChange={this.handleInputFechaInicio}
              className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Fecha Final */}
            <input
              type="date"
              value={this.state.fechaFinal}
              onChange={this.handleInputFechaFinal}
              className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="w-full flex gap-4 mb-4">
          <div className="w-full">
            <Search
              group={true}
              iconLeft={<i className="bi bi-search text-gray-400"></i>}
              ref={this.refSearch}
              onSearch={this.searchText}
              placeholder="Filtrar..."
              theme="modern"
            />
          </div>
        </div>

        {/* Render condicional: Tabla o Cuadrícula */}
        <div className={cn(
          view === "tabla" ? "rounded border overflow-hidden" : "space-y-6",
          "bg-white"
        )}>
          <div className={cn(
            view == "tabla" ? "block" : "hidden",
            "min-w-full"
          )}>
            {/* Header (solo visible en desktop) */}
            <div className={cn(
              "bg-gray-100 font-medium text-xs text-gray-500 uppercase tracking-wider"
            )}>
              <div className="grid grid-cols-[0.5fr_1fr_1.5fr_1.5fr_1.5fr_1.5fr_0.8fr_0.6fr_0.6fr_0.6fr] gap-x-3">
                <div className="py-3 text-center">#</div>
                <div className="py-3">Fecha y Hora</div>
                <div className="py-3">Tipo / Motivo</div>
                <div className="py-3">Almacén Origen</div>
                <div className="py-3">Almacén Destino</div>
                <div className="py-3">Observación</div>
                <div className="py-3 text-center">Estado</div>
                <div className="py-3 text-center">Detalle</div>
                <div className="py-3 text-center">Guía</div>
                <div className="py-3 text-center">Anular</div>
              </div>
            </div>
          </div>

          {this.renderTable()}

          {/* ✅ Paginación única */}
          <Paginacion
            ref={this.refPaginacion}
            loading={this.state.loading}
            data={this.state.lista}
            totalPaginacion={this.state.totalPaginacion}
            paginacion={this.state.paginacion}
            fillTable={this.paginacionContext}
            restart={this.state.restart}
            theme="modern"
            className={
              view === "tabla"
                ? "md:px-4 py-3 bg-white border-t border-gray-200 overflow-auto"
                : "md:px-6 py-3 bg-white border rounded border-gray-200 overflow-auto"
            }
          />
        </div>
      </ContainerWrapper>
    );
  }
}

Traslado.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string.isRequired,
    }).isRequired,
    project: PropTypes.shape({
      idSucursal: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  trasladoLista: PropTypes.shape({
    data: PropTypes.object,
    paginacion: PropTypes.object,
  }),
  setListaTrasladoData: PropTypes.func,
  setListaTrasladoPaginacion: PropTypes.func,
  history: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  location: PropTypes.object,
};

/**
 *
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
  return {
    token: state.principal,
    trasladoLista: state.predeterminado.trasladoLista,
  };
};

const mapDispatchToProps = { setListaTrasladoData, setListaTrasladoPaginacion };

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */

const ConnectedTraslado = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Traslado);

export default ConnectedTraslado;
