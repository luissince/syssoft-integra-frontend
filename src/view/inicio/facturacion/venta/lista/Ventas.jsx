import React from 'react';
import {
  formatCurrency,
  formatTime,
  isEmpty,
  formatNumberWithZeros,
  currentDate,
  getStatePrivilegio,
  getPathRoute,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import Paginacion from '../../../../../components/Paginacion';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '@/components/CustomComponent';
import PropTypes from 'prop-types';
import {
  anularVenta,
  comboComprobante,
  listVenta,
} from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import {
  CONTADO,
} from '../../../../../model/types/forma-pago';
import Title from '../../../../../components/Title';
import { SpinnerView } from '../../../../../components/Spinner';
import { VENTA } from '../../../../../model/types/tipo-comprobante';
import ModalElegirInterfaz from './component/ModalElejirInterfaz';
import {
  setListaVentaData,
  setListaVentaPaginacion,
} from '../../../../../redux/predeterminadoSlice';
import Search from '../../../../../components/Search';
import {
  ACTIVAR_VISTA_ANTIGUA,
  ANULAR_VENTA,
  FACTURACION,
  REALIZAR_VENTA,
  VENTAS,
  VISUALIZAR_DETALLE,
} from '../../../../../model/types/menu';
import { alertKit } from 'alert-kit';
import { Capacitor } from '@capacitor/core';
import { cn } from '@/lib/utils';
import { MOTIVO_TRASLADO } from '@/model/types/motivo-traslado';
import { Check, Eye, Trash, Truck } from 'lucide-react';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class Ventas extends CustomComponent {
  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      initialLoad: true,
      initialMessage: 'Cargando datos...',

      fechaInicio: currentDate(),
      fechaFinal: currentDate(),
      idComprobante: '',
      estado: '0',

      comprobantes: [],

      buscar: '',

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',

      loading: false,
      lista: [],
      restart: false,

      // Atributos del modal Elegir Interfaz
      isOpenElegirInterfaz: false,

      // Atributos para privilegios
      create: getStatePrivilegio(
        this.props.token.userToken.menus,
        FACTURACION,
        VENTAS,
        REALIZAR_VENTA,
      ),
      detail: getStatePrivilegio(
        this.props.token.userToken.menus,
        FACTURACION,
        VENTAS,
        VISUALIZAR_DETALLE,
      ),
      remove: getStatePrivilegio(
        this.props.token.userToken.menus,
        FACTURACION,
        VENTAS,
        ANULAR_VENTA,
      ),
      viewAntigua: getStatePrivilegio(
        this.props.token.userToken.menus,
        FACTURACION,
        VENTAS,
        ACTIVAR_VISTA_ANTIGUA,
      ),

      view: 'tabla',

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refPaginacion = React.createRef();

    this.refSearch = React.createRef();

    // Referencia para el modal elegir interfaz
    this.refModalElegirInterfaz = React.createRef();

    this.abortControllerTable = new AbortController();
  }

  /*
  |--------------------------------------------------------------------------
  | Método de cliclo de vida
  |--------------------------------------------------------------------------
  |
  | El ciclo de vida de un componente en React consta de varios métodos que se ejecutan en diferentes momentos durante la vida útil
  | del componente. Estos métodos proporcionan puntos de entrada para realizar acciones específicas en cada etapa del ciclo de vida,
  | como inicializar el estado, montar el componente, actualizar el estado y desmontar el componente. Estos métodos permiten a los
  | desarrolladores controlar y realizar acciones específicas en respuesta a eventos de ciclo de vida, como la creación, actualización
  | o eliminación del componente. Entender y utilizar el ciclo de vida de React es fundamental para implementar correctamente la lógica
  | de la aplicación y optimizar el rendimiento del componente.
  |
  */

  /**
   * @description Método que se ejecuta después de que el componente se haya montado en el DOM.
   */
  async componentDidMount() {
    await this.loadData();
  }

  /**
   * @description Método que se ejecuta antes de que el componente se desmonte del DOM.
   */
  componentWillUnmount() {
    this.abortControllerTable.abort();
  }

  /*
  |--------------------------------------------------------------------------
  | Métodos de acción
  |--------------------------------------------------------------------------
  |
  | Carga los datos iniciales necesarios para inicializar el componente. Este método se utiliza típicamente
  | para obtener datos desde un servicio externo, como una API o una base de datos, y actualizar el estado del
  | componente en consecuencia. El método loadingData puede ser responsable de realizar peticiones asíncronas
  | para obtener los datos iniciales y luego actualizar el estado del componente una vez que los datos han sido
  | recuperados. La función loadingData puede ser invocada en el montaje inicial del componente para asegurarse
  | de que los datos requeridos estén disponibles antes de renderizar el componente en la interfaz de usuario.
  |
  */

  loadData = async () => {
    const ventaLista = this.props.ventaLista;
    if (
      ventaLista &&
      ventaLista.data &&
      ventaLista.paginacion
    ) {
      this.setState(ventaLista.data);
      this.refPaginacion.current.upperPageBound = ventaLista.paginacion.upperPageBound;
      this.refPaginacion.current.lowerPageBound = ventaLista.paginacion.lowerPageBound;
      this.refPaginacion.current.isPrevBtnActive = ventaLista.paginacion.isPrevBtnActive;
      this.refPaginacion.current.isNextBtnActive = ventaLista.paginacion.isNextBtnActive;
      this.refPaginacion.current.pageBound = ventaLista.paginacion.pageBound;
      this.refPaginacion.current.messagePaginacion = ventaLista.paginacion.messagePaginacion;

      this.refSearch.current.initialize(ventaLista.data.buscar);
    } else {
      const [comprobantes] = await Promise.all([this.fetchComprobante(VENTA)]);

      this.setState({
        comprobantes,
        initialLoad: false,
      }, async () => {
        await this.loadInit();
        this.updateReduxState();
      });
    }
  };

  updateReduxState() {
    this.props.setListaVentaData(this.state);
    this.props.setListaVentaPaginacion({
      upperPageBound: this.refPaginacion.current.upperPageBound,
      lowerPageBound: this.refPaginacion.current.lowerPageBound,
      isPrevBtnActive: this.refPaginacion.current.isPrevBtnActive,
      isNextBtnActive: this.refPaginacion.current.isNextBtnActive,
      pageBound: this.refPaginacion.current.pageBound,
      messagePaginacion: this.refPaginacion.current.messagePaginacion,
    });
  }

  async fetchComprobante(tipo) {
    const params = {
      tipo: tipo,
      idSucursal: this.state.idSucursal,
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

  loadInit = async () => {
    if (this.state.loading) return;

    await this.setStateAsync({ paginacion: 1, restart: true });
    this.fillTable(0);
    await this.setStateAsync({ opcion: 0 });
  };

  searchText = async (text) => {
    if (this.state.loading) return;

    if (text.trim().length === 0) return;

    await this.setStateAsync({ paginacion: 1, restart: false, buscar: text });
    this.fillTable(1);
    await this.setStateAsync({ opcion: 1 });
  };

  async searchOpciones() {
    if (this.state.loading) return;

    if (this.state.fechaInicio > this.state.fechaFinal) return;

    await this.setStateAsync({ paginacion: 1, restart: false });
    this.fillTable(2);
    await this.setStateAsync({ opcion: 2 });
  }

  paginacionContext = async (listid) => {
    await this.setStateAsync({ paginacion: listid, restart: false });
    this.onEventPaginacion();
  };

  onEventPaginacion = () => {
    this.fillTable(this.state.opcion);
  };

  fillTable = async (opcion = 0) => {
    this.setState({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const params = {
      opcion,
      buscar: this.state.buscar,
      fechaInicio: this.state.fechaInicio,
      fechaFinal: this.state.fechaFinal,
      idComprobante: this.state.idComprobante,
      estado: this.state.estado,
      idSucursal: this.state.idSucursal,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const { success, data, message, type } = await listVenta(params, this.abortControllerTable.signal);

    if (!success) {
      if (type === CANCELED) return;

      this.setState({
        loading: false,
        lista: [],
        totalPaginacion: 0,
        messageTable: message,
      });
      return;
    }

    const totalPaginacion = parseInt(
      String(Math.ceil(parseFloat(data.total) / this.state.filasPorPagina)),
    );

    this.setState({
      loading: false,
      lista: data.result,
      totalPaginacion: totalPaginacion,
    }, () => {
      this.updateReduxState();
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Método de eventos
  |--------------------------------------------------------------------------
  |
  | El método handle es una convención utilizada para denominar funciones que manejan eventos específicos
  | en los componentes de React. Estas funciones se utilizan comúnmente para realizar tareas o actualizaciones
  | en el estado del componente cuando ocurre un evento determinado, como hacer clic en un botón, cambiar el valor
  | de un campo de entrada, o cualquier otra interacción del usuario. Los métodos handle suelen recibir el evento
  | como parámetro y se encargan de realizar las operaciones necesarias en función de la lógica de la aplicación.
  | Por ejemplo, un método handle para un evento de clic puede actualizar el estado del componente o llamar a
  | otra función específica de la lógica de negocio. La convención de nombres handle suele combinarse con un prefijo
  | que describe el tipo de evento que maneja, como handleInputChange, handleClick, handleSubmission, entre otros. 
  |
  */

  handleChangeView = (value) => {
    this.setState({ view: value }, () => this.updateReduxState());
  };

  handleCrearClasico = () => {
    this.props.history.push(`${this.props.location.pathname}/crear`);
  };

  handleInputFechaInico = (event) => {
    this.setState({ fechaInicio: event.target.value }, () => {
      this.searchOpciones();
    });
  };

  handleInputFechaFinal = (event) => {
    this.setState({ fechaFinal: event.target.value }, () => {
      this.searchOpciones();
    });
  };

  handleSelectComprobante = (event) => {
    this.setState({ idComprobante: event.target.value }, () => {
      this.searchOpciones();
    });
  };

  handleSelectEstado = (event) => {
    this.setState({ estado: event.target.value }, () => {
      this.searchOpciones();
    });
  };

  handleDetalle = (idVenta) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/detalle`,
      search: '?idVenta=' + idVenta,
    });
  };

  handleGuiaRemision = (idVenta) => {
    this.props.history.push({
      pathname: getPathRoute('guia-create'),
      state: {
        idVenta: idVenta,
        idMotivoTraslado: MOTIVO_TRASLADO.VENTA,
      }
    });
  };

  handleAnular = async (idVenta) => {
    if (!this.state.remove) {
      alertKit.warning({
        title: 'Venta',
        message: 'No tiene privilegios para anular ventas',
      });
      return;
    }

    const accept = await alertKit.question({
      title: 'Venta',
      message: '¿Está seguro de que desea anular la venta? Esta operación no se puede deshacer.',
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      const params = {
        idVenta: idVenta,
        idUsuario: this.state.idUsuario,
      };

      alertKit.loading({
        message: 'Procesando información...',
      });

      const response = await anularVenta(params);

      if (response instanceof SuccessReponse) {
        alertKit.success({
          title: 'Venta',
          message: response.data,
        }, () => {
          this.loadInit();
        });
      }

      if (response instanceof ErrorResponse) {
        if (response.getType() === CANCELED) return;

        alertKit.warning({
          title: 'Venta',
          message: response.getMessage(),
        });
      }
    }
  }

  //------------------------------------------------------------------------------------------
  // Procesos Elegir Interfaz
  //------------------------------------------------------------------------------------------

  handleOpenElegirInterfaz = () => {
    if (!this.state.create) {
      alertKit.warning({
        title: 'Venta',
        message: 'No tiene privilegios para crear ventas',
      });
      return;
    }

    if (Capacitor.isNativePlatform()) {
      this.props.history.push(`${this.props.location.pathname}/crear`);
      return;
    }

    if (!this.state.viewAntigua) {
      this.props.history.push(`${this.props.location.pathname}/crear`);
      return;
    }

    this.setState({ isOpenElegirInterfaz: true });
  };

  handleCloseElegirInterfaz = () => {
    this.setState({ isOpenElegirInterfaz: false });
  };

  handleInterfazClasico = () => {
    this.props.history.push(`${this.props.location.pathname}/crear-clasico`);
  };

  handleInterfazModerno = () => {
    this.props.history.push(`${this.props.location.pathname}/crear`);
  };

  /*
  |--------------------------------------------------------------------------
  | Método de renderización
  |--------------------------------------------------------------------------
  |
  | El método render() es esencial en los componentes de React y se encarga de determinar
  | qué debe mostrarse en la interfaz de usuario basado en el estado y las propiedades actuales
  | del componente. Este método devuelve un elemento React que describe lo que debe renderizarse
  | en la interfaz de usuario. La salida del método render() puede incluir otros componentes
  | de React, elementos HTML o una combinación de ambos. Es importante que el método render()
  | sea una función pura, es decir, no debe modificar el estado del componente ni interactuar
  | directamente con el DOM. En su lugar, debe basarse únicamente en los props y el estado
  | actuales del componente para determinar lo que se mostrará.
  |
  */

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
        <div className={cn(
          "text-center py-6",
          view === "tabla" ? "" : "rounded border",
        )}>
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
            const estado = (
              <span className={cn(
                "inline-flex items-center rounded-full",
                "text-xs font-medium",
                "px-2.5 py-0.5",
                item.estado === 1 && "bg-green-100 text-green-800",
                item.estado === 2 && "bg-yellow-100 text-yellow-800",
                item.estado === 3 && "bg-red-100 text-red-800",
                item.estado === 4 && "bg-blue-100 text-blue-800",
              )}>
                {item.estado === 1 && "COBRADO"}
                {item.estado === 2 && "POR COBRAR"}
                {item.estado === 3 && "ANULADO"}
                {item.estado === 4 && "POR LLEVAR"}
              </span>
            );

            const tipo = item.idFormaPago === CONTADO ? 'CONTADO' : 'CREDITO';

            return (
              <div
                key={index}
                className={cn(
                  "text-sm text-gray-900",
                  view === "tabla"
                    ? "grid grid-cols-[0.5fr_1fr_2.0fr_1.5fr_1.3fr_1.0fr_1.0fr_1.8fr] py-3 gap-x-3 items-center"
                    : "flex flex-col h-full gap-3 rounded border p-3"
                )}
              >
                <div className={view === "tabla" ? "contents" : "flex-1 flex flex-col gap-3"}>
                  {
                    view === "tabla" && (
                      <div className=" text-center hidden md:block">
                        {item.id}
                      </div>
                    )
                  }

                  <div>
                    <div>{item.fecha}</div>
                    <div className="text-xs text-gray-500">{formatTime(item.hora)}</div>
                  </div>

                  <div>
                    <div>{item.tipoDocumento} - {item.documento}</div>
                    <div className="text-xs text-gray-500">{item.informacion}</div>
                  </div>

                  <div>
                    <div>{item.comprobante}</div>
                    <div className="font-mono">{item.serie}-{formatNumberWithZeros(item.numeracion)}</div>
                  </div>

                  <div>
                    {tipo}
                  </div>

                  <div className={cn(
                    "text-center",
                    view === "tabla" ? "text-center" : "text-left"
                  )}>
                    {estado}
                  </div>

                  <div className="text-right">
                    {formatCurrency(item.total, item.codiso)}
                  </div>
                </div>

                <div
                  className={cn(
                    "flex gap-2",
                    view === "tabla"
                      ? "flex-col md:flex-row justify-center"
                      : "flex-row justify-end"
                  )}
                >
                  <button
                    onClick={() => this.handleDetalle(item.idVenta)}
                    className={cn(
                      "inline-flex items-center justify-center gap-2",
                      "px-3 py-2",
                      "transition rounded",
                      "bg-gray-100 text-gray-600 text-sm font-medium",
                      "hover:bg-gray-300",
                      "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2",
                      "active:bg-blue-100 active:scale-[0.97]",
                      "disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed",
                    )}
                  >
                    <Eye className="w-5 h-5 text-blue-500" />
                  </button>

                  {
                    item.guiaRemision === 1
                      ? (
                        <button
                          className={cn(
                            "inline-flex items-center justify-center gap-2",
                            "px-3 py-2",
                            "transition rounded",
                            "bg-gray-100 text-gray-600 text-sm font-medium",
                            "hover:bg-gray-300",
                            "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2",
                            "active:bg-blue-100 active:scale-[0.97]",
                            "disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed",
                          )}
                          title="Guía generada"
                          disabled>
                          <Check className="w-5 h-5 text-green-500" />
                        </button>
                      )
                      :
                      (
                        <button
                          onClick={() => this.handleGuiaRemision(item.idVenta)}
                          className={cn(
                            "inline-flex items-center justify-center gap-2",
                            "px-3 py-2",
                            "transition rounded",
                            "bg-gray-100 text-gray-600 text-sm font-medium",
                            "hover:bg-gray-300",
                            "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2",
                            "active:bg-blue-100 active:scale-[0.97]",
                            "disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed",
                          )}
                        >
                          <Truck className="w-5 h-5 text-gray-600" />
                        </button>
                      )
                  }
                  <button
                    onClick={() => this.handleAnular(item.idVenta)}
                    className={cn(
                      "inline-flex items-center justify-center gap-2",
                      "px-3 py-2",
                      "transition rounded",
                      "bg-gray-100 text-gray-600 text-sm font-medium",
                      "hover:bg-gray-300",
                      "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2",
                      "active:bg-blue-100 active:scale-[0.97]",
                      "disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed",
                    )}
                  >
                    <Trash className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>
            );
          })
        }
      </div >
    );
  }

  render() {
    const { view } = this.state;

    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.initialLoad}
          message={this.state.initialMessage}
        />

        {/* Encabezado */}
        <Title
          title="Ventas"
          subTitle="Gestión de ventas"
          handleGoBack={() => this.props.history.goBack()}
        />

        {/* Acciones principales + Toggle vista */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={this.handleOpenElegirInterfaz}
              disabled={!this.state.create}
              className={cn(
                "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2",
                "bg-blue-600 text-white text-sm font-medium rounded",
                "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition",
              )}
              aria-label="Crear nueva venta"
            >
              <i className="bi bi-file-plus"></i>
              Nuevo Registro
            </button>
            <button
              onClick={this.loadInit}
              className={cn(
                "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2",
                "bg-gray-200 text-gray-700 text-sm font-medium rounded",
                "hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition",
              )}
            >
              <i className="bi bi-arrow-clockwise"></i>
              Recargar Vista
            </button>
          </div>

          {/* Toggle vista */}
          <div className="flex bg-gray-100 rounded p-1">
            <button
              onClick={() => this.handleChangeView('tabla')}
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
              onClick={() => this.handleChangeView('cuadricula')}
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
            Puedes ver las ventas echas con diferentes filtros, por ejemplo: fechas de emisión, comprobante y estado.
          </p>
        </div>

        {/* Filtros de fechas, comprobante y estado */}
        <div className="flex flex-col gap-y-4 mb-4">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Fecha de Inicio */}
            <input
              type="date"
              value={this.state.fechaInicio}
              onChange={this.handleInputFechaInico}
              className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Fecha Final */}
            <input
              type="date"
              value={this.state.fechaFinal}
              onChange={this.handleInputFechaFinal}
              className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Comprobante */}
            <select
              value={this.state.idComprobante}
              onChange={this.handleSelectComprobante}
              className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">TODOS</option>
              {this.state.comprobantes.map((item) => (
                <option key={item.idComprobante} value={item.idComprobante}>
                  {item.nombre} - {item.serie}
                </option>
              ))}
            </select>

            {/* Estado */}
            <select
              value={this.state.estado}
              onChange={this.handleSelectEstado}
              className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="0">TODOS</option>
              <option value="1">COBRADO</option>
              <option value="2">POR COBRAR</option>
              <option value="3">ANULADO</option>
            </select>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="w-full">
          <Search
            group={true}
            iconLeft={<i className="bi bi-search text-gray-400"></i>}
            ref={this.refSearch}
            onSearch={this.searchText}
            placeholder="Buscar por código o nombre..."
            theme="modern"
          />
        </div>

        {/* Render condicional: Tabla o Cuadrícula */}
        <div className={cn(
          view === "tabla" ? "rounded border overflow-hidden mt-6" : "space-y-6",
        )}>
          <div className={cn(
            view == "tabla" ? "block" : "hidden",
            "min-w-full"
          )}>
            {/* Header (solo visible en desktop) */}
            <div className={cn(
              "bg-gray-100 font-medium text-xs text-gray-500 uppercase tracking-wider"
            )}>
              <div className="grid grid-cols-[0.5fr_1fr_2.0fr_1.5fr_1.3fr_1.0fr_1.0fr_1.8fr] gap-x-3 py-3">
                <div className="text-center">#</div>
                <div>Fecha y Hora</div>
                <div>Cliente</div>
                <div>Comprobante</div>
                <div>Tipo</div>
                <div className="text-center">Estado</div>
                <div className="text-right">Total</div>
                <div className="text-center"></div>
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
              cn(
                "py-3 bg-white border-gray-200 overflow-auto",
                view === "tabla"
                  ? "md:px-4 border-t"
                  : "md:px-6 border rounded"
              )
            }
          />
        </div>

        {/* Modal Elegir Interfaz (sin cambios) */}
        <ModalElegirInterfaz
          refModal={this.refModalElegirInterfaz}
          isOpen={this.state.isOpenElegirInterfaz}
          handleClose={this.handleCloseElegirInterfaz}
          handleInterfazClasico={this.handleInterfazClasico}
          handleInterfazModerno={this.handleInterfazModerno}
        />
      </ContainerWrapper>
    );
  }
}

Ventas.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string.isRequired,
    }).isRequired,
    project: PropTypes.shape({
      idSucursal: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  ventaLista: PropTypes.shape({
    data: PropTypes.object,
    paginacion: PropTypes.object,
  }),
  setListaVentaData: PropTypes.func,
  setListaVentaPaginacion: PropTypes.func,
  history: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  location: PropTypes.object,
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    ventaLista: state.predeterminado.ventaLista,
  };
};

const mapDispatchToProps = { setListaVentaData, setListaVentaPaginacion };

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */
const ConnectedVentas = connect(mapStateToProps, mapDispatchToProps)(Ventas);

export default ConnectedVentas;
