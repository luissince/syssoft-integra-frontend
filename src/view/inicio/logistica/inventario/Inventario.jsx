import React, { Suspense } from 'react';
import {
  rounded,
  formatCurrency,
  isEmpty,
  getNumber,
} from '../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import ContainerWrapper from '../../../../components/Container';
import Paginacion from '../../../../components/Paginacion';
import CustomComponent from '@/components/CustomComponent';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import {
  comboAlmacen,
  documentsPdfCodbarProducto,
  listInventario,
  summaryInventario,
} from '../../../../network/rest/principal.network';
import { CANCELED } from '../../../../model/types/types';
import { connect } from 'react-redux';
import Title from '../../../../components/Title';
import { SpinnerView } from '../../../../components/Spinner';
import Search from '../../../../components/Search';
import {
  setListaInventarioData,
  setListaInventarioPaginacion,
} from '../../../../redux/predeterminadoSlice';
import pdfVisualizer from 'pdf-visualizer';
import {
  AlertTriangle,
  Barcode,
  Box,
  CheckCircle,
  PackageOpen,
  PackagePlus,
  Plus,
  RefreshCw,
} from 'lucide-react';
import Image from '../../../../components/Image';
import { images } from '../../../../helper';
import { cn } from '@/lib/utils';

const CustomModalStock = React.lazy(
  () => import('@/view/inicio/logistica/inventario/component/ModalStock'),
);

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class Inventario extends CustomComponent {
  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      // Atributos de carga
      initialLoad: true,
      initialMessage: 'Cargando datos...',

      // Atributos de busqueda
      idTipoAlmacen: '',
      tiposAlmacenes: [],

      idAlmacen: '',
      almacenes: [],

      // Nuevo filtro de estado
      estadoFiltro: '',

      // Atributos principales de la tabla
      loading: false,
      lista: [],
      restart: false,

      resumen: {
        totalProductos: 0,
        totalStockCritico: 0,
        totalStockExcedente: 0,
        totalStockOptimo: 0,
      },

      buscar: '',

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',

      // Atributos del modal stock
      isOpenStock: false,

      view: 'tabla',

      // Id principales
      codIso: this.props.moneda.codiso ?? '',
      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refPaginacion = React.createRef();

    this.refSearch = React.createRef();

    this.refModalStock = React.createRef();

    this.abortControllerTable = new AbortController();

    // Opciones para el filtro de estado
    this.estadosOptions = [
      { value: '', label: 'Todos los estados' },
      { value: "activo", label: "Stock Activo" },
      { value: 'critico', label: 'Stock Crítico' },
      { value: 'exceso', label: 'Stock Excedente' },
      { value: 'optimo', label: 'Stock Óptimo' },
    ];
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

  async componentDidMount() {
    await this.loadData();
  }

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

  async loadData() {
    if (
      this.props.inventarioLista &&
      this.props.inventarioLista.data &&
      this.props.inventarioLista.paginacion
    ) {
      this.setState(this.props.inventarioLista.data);
      this.refPaginacion.current.upperPageBound =
        this.props.inventarioLista.paginacion.upperPageBound;
      this.refPaginacion.current.lowerPageBound =
        this.props.inventarioLista.paginacion.lowerPageBound;
      this.refPaginacion.current.isPrevBtnActive =
        this.props.inventarioLista.paginacion.isPrevBtnActive;
      this.refPaginacion.current.isNextBtnActive =
        this.props.inventarioLista.paginacion.isNextBtnActive;
      this.refPaginacion.current.pageBound =
        this.props.inventarioLista.paginacion.pageBound;
      this.refPaginacion.current.messagePaginacion =
        this.props.inventarioLista.paginacion.messagePaginacion;

      // this.refSearch.current.initialize(this.props.inventarioLista.data.buscar);
      this.refSearch.current.value = this.props.inventarioLista.data.buscar;
    } else {
      const [almacenes] = await Promise.all([
        this.fetchComboAlmacen({ idSucursal: this.state.idSucursal }),
      ]);

      const almacenFilter = almacenes.find((item) => item.predefinido === 1);

      this.setState({
        almacenes,
        idAlmacen: almacenFilter ? almacenFilter.idAlmacen : '',
        initialLoad: false,
      }, async () => {
        await this.loadingSummary();
        await this.loadInit();
        this.updateReduxState();
      },
      );
    }
  }

  loadingSummary = async () => {
    const response = await summaryInventario(
      this.state.idAlmacen,
      this.abortControllerTable.signal,
    );

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return;
    }

    this.setState({
      resumen: response.data,
    });
  };

  updateReduxState() {
    this.props.setListaInventarioData(this.state);
    this.props.setListaInventarioPaginacion({
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
    this.fillTable(0, '');
    await this.setStateAsync({ opcion: 0 });
  };

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
      default:
        this.fillTable(0);
    }
  };

  searchText = async (text) => {
    if (this.state.loading) return;

    if (text.trim().length === 0) return;

    await this.setStateAsync({ paginacion: 1, restart: false, buscar: text });
    this.fillTable(1, text.trim());
    await this.setStateAsync({ opcion: 1 });
  };

  fillTable = async (opcion, buscar = '') => {
    this.setState({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const params = {
      opcion: opcion,
      buscar: buscar,
      idSucursal: this.state.idSucursal,
      idAlmacen: this.state.idAlmacen,
      estado: this.state.estadoFiltro,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listInventario(
      params,
      this.abortControllerTable.signal,
    );

    if (response instanceof SuccessReponse) {
      const totalPaginacion = parseInt(String(Math.ceil(Number(response.data.total) / this.state.filasPorPagina)));

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

  async fetchComboAlmacen(params) {
    const response = await comboAlmacen(
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

  //------------------------------------------------------------------------------------------
  // Funciones del modal producto
  //------------------------------------------------------------------------------------------

  handleOpenModalStock = async (producto) => {
    this.setState({ isOpenStock: true });
    await this.refModalStock.current.loadDatos(producto);
  };

  handleCloseStock = async () => {
    this.setState({ isOpenStock: false });
  };

  //--------------------------------------------------------------------------------------------
  // Handlers
  //--------------------------------------------------------------------------------------------

  handleSelectAlmacen = (event) => {
    this.setState({ idAlmacen: event.target.value }, () => this.loadInit());
  };

  // Nuevo handler para el filtro de estado
  handleSelectEstado = (event) => {
    this.setState({ estadoFiltro: event.target.value }, () => this.loadInit());
  };

  handleOpenPrinterCodBar = async (idProducto) => {
    await pdfVisualizer.init({
      url: documentsPdfCodbarProducto(),
      title: 'Lista de productos - Código de Barras',
      titlePageNumber: 'Página',
      titleLoading: 'Cargando...',
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Método de renderizado
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

  determinarEstadoInventario = (item) => {
    const { cantidad, cantidadMinima, cantidadMaxima } = item;
    if (cantidad < cantidadMinima || cantidad <= 0) {
      return {
        estado: 'Crítico',
        clase: 'bg-red-600 text-white',
        icono: AlertTriangle,
      };
    } else if (cantidad > cantidadMaxima) {
      return {
        estado: 'Exceso',
        clase: 'bg-blue-600 text-white',
        icono: PackagePlus,
      };
    } else {
      return {
        estado: 'Óptimo',
        clase: 'bg-green-500 text-white',
        icono: CheckCircle,
      };
    }
  };

  calcularPorcentaje = (item) => {
    const { cantidad, cantidadMinima, cantidadMaxima } = item;

    if (cantidad <= 0) return 0;

    const rango = cantidadMaxima - cantidadMinima;
    if (rango <= 0) return 100;

    const porcentaje = ((cantidad - cantidadMinima) / rango) * 100;
    return Number(rounded(Math.max(0, Math.min(100, porcentaje)), 0));
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
            const estadoInventario = this.determinarEstadoInventario(item);
            const porcentaje = this.calcularPorcentaje(item);

            return (
              <div
                key={index}
                className={cn(
                  "text-sm text-gray-900",
                  view === "tabla"
                    ? "grid grid-cols-[1.0fr_3.0fr_1.0fr_1.5fr_1.0fr_1.0fr_1.5fr] py-3 gap-x-3 items-center"
                    : "flex flex-col h-full gap-3 rounded border p-3"
                )}
              >
                <div className={view === "tabla" ? "contents" : "flex-1 flex flex-col gap-3"}>
                  <div>
                    <div className="flex justify-center">
                      <Image
                        default={images.noImage}
                        src={item.imagen}
                        alt={item.producto}
                        overrideClass={cn(
                          view === "tabla" ? "md:w-20 md:h-20" : "w-full h-40",
                          "object-contain",
                          "border border-solid border-[#e2e8f0]",
                          "rounded",
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">
                      {item.codigo}
                    </div>

                    <div className="text-sm font-medium uppercase">
                      {item.producto}
                    </div>
                  </div>

                  <div>
                    {item.categoria}
                  </div>

                  <div>
                    <div className={cn(
                      "text-sm font-medium",
                      getNumber(item.cantidad) <= 0 ? 'text-red-500' : 'text-gray-900'
                    )}>
                      {rounded(item.cantidad)} {item.medida}
                    </div>
                    <div className="text-xs text-gray-500">
                      Min: {item.cantidadMinima} | Max: {item.cantidadMaxima}
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          item.cantidad < item.cantidadMinima || item.cantidad <= 0
                            ? "bg-red-500"
                            : item.cantidad > item.cantidadMaxima
                              ? "bg-blue-500"
                              : "bg-green-500"
                        )}
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    {formatCurrency(item.costo, this.state.codIso)}
                  </div>

                  <div>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full",
                        "text-xs font-medium",
                        "px-2.5 py-0.5",
                        estadoInventario.clase
                      )}
                    >
                      <estadoInventario.icono className="h-3 w-3 mr-1" />
                      {estadoInventario.estado}
                    </span>
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
                    onClick={() => this.handleOpenModalStock(item)}
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
                    <Plus className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => this.handleOpenPrinterCodBar(item.idProducto)}
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
                    <Barcode className="h-5 w-5" />
                  </button>
                </div>
              </div>
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
        />

        <Title
          title="Inventario"
          subTitle="INICIAL"
          handleGoBack={() => this.props.history.goBack()}
        />

        <Suspense>
          <CustomModalStock
            ref={this.refModalStock}
            isOpen={this.state.isOpenStock}
            onClose={this.handleCloseStock}
            handleSave={this.loadInit}
          />
        </Suspense>

        {/* Acciones principales + Toggle vista */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-3">
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
          <div>
            <p className="text-gray-600 mt-1">
              Gestión de productos y stock
            </p>
          </div>
        </div>

        {/* Filtros de fechas, comprobante y estado */}
        <div className="flex flex-col gap-y-4 mb-4">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tipo Traslado */}
            <select
              value={this.state.idAlmacen}
              onChange={this.handleSelectAlmacen}
              className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los almacenes</option>
              {this.state.almacenes.map((item, index) => {
                return (
                  <option key={index} value={item.idAlmacen}>
                    {item.nombre} - {item.tipoAlmacen}
                  </option>
                );
              })}
            </select>

            <select
              value={this.state.estadoFiltro}
              onChange={this.handleSelectEstado}
              className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {this.estadosOptions.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
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
            placeholder="Filtrar por tipo/motivo de traslado..."
            theme="modern"
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div className="bg-white rounded border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Box className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Productos
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {rounded(this.state.resumen.totalProductos, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Stock Crítico
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {rounded(this.state.resumen.totalStockCritico, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Stock Óptimo
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {rounded(this.state.resumen.totalStockOptimo, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PackagePlus className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Stock Excedente
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {rounded(this.state.resumen.totalStockExcedente, 0)}
                </p>
              </div>
            </div>
          </div>
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
              <div className="grid grid-cols-[1.0fr_3.0fr_1.0fr_1.5fr_1.0fr_1.0fr_1.5fr] gap-x-3 py-3">
                <div></div>
                <div>Producto</div>
                <div>Categoría</div>
                <div>Stock</div>
                <div>Costo</div>
                <div className="text-center">Estado</div>
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
      </ContainerWrapper>
    );
  }
}

Inventario.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string.isRequired,
    }).isRequired,
    project: PropTypes.shape({
      idSucursal: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  moneda: PropTypes.object,
  inventarioLista: PropTypes.shape({
    data: PropTypes.object,
    paginacion: PropTypes.object,
  }),
  setListaInventarioData: PropTypes.func,
  setListaInventarioPaginacion: PropTypes.func,
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
    moneda: state.predeterminado.moneda,
    inventarioLista: state.predeterminado.inventarioLista,
  };
};

const mapDispatchToProps = {
  setListaInventarioData,
  setListaInventarioPaginacion,
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */
const ConnectedInventario = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Inventario);

export default ConnectedInventario;