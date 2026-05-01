import React, { Suspense } from 'react';
import {
  rounded,
  formatCurrency,
  isEmpty,
  getNumber,
} from '@/helper/utils.helper';
import PropTypes from 'prop-types';
import ContainerWrapper from '@/components/ui/container-wrapper';
import Paginacion from '@/components/Paginacion';
import CustomComponent from '@/components/CustomComponent';
import SuccessReponse from '@/model/class/response';
import ErrorResponse from '@/model/class/error-response';
import {
  comboAlmacen,
  documentsPdfCodbarProducto,
  listInventario,
  summaryInventario,
} from '@/network/rest/principal.network';
import { CANCELED } from '@/constants/requestStatus';
import { connect } from 'react-redux';
import Title from '@/components/Title';
import { SpinnerView } from '@/components/Spinner';
import Search from '@/components/Search';
import {
  setListaInventarioData,
  setListaInventarioPaginacion,
} from '@/redux/predeterminadoSlice';
import pdfVisualizer from 'pdf-visualizer';
import {
  AlertCircle,
  AlertTriangle,
  Barcode,
  Box,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  PackagePlus,
  Plus,
} from 'lucide-react';
import Image from '@/components/Image';
import { images } from '@/helper';
import { cn } from '@/lib/utils';
import { RxEyeNone } from 'react-icons/rx';

const CustomModalStock = React.lazy(
  () => import('@/components/view/producto/ModalStock'),
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
      initialMessage: "Cargando datos...",

      // Atributos de busqueda
      idTipoAlmacen: "",
      tiposAlmacenes: [],

      idAlmacen: "",
      almacenes: [],

      // Nuevo filtro de estado
      estadoFiltro: "",

      // Atributos principales de la tabla
      loading: false,
      lista: [],
      restart: false,

      resumen: {
        totalProductos: 0,
        totalStockCritico: 0,
        totalStockExcedente: 0,
        totalStockOptimo: 0,
        totalLotesPorVencer: 0,
      },

      inventarioDetallesVisible: {},

      buscar: "",

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: "Cargando información...",

      // Atributos del modal stock
      isOpenStock: false,

      vista: "tabla",

      // Id principales
      codIso: this.props.moneda.codiso ?? '',
      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.usuario.idUsuario,
    };

    this.refPaginacion = React.createRef();

    this.refSearch = React.createRef();

    this.refModalStock = React.createRef();

    this.abortControllerTable = new AbortController();

    // Opciones para el filtro de estado
    this.estadosOptions = [
      { value: "", label: "Todos los estados" },
      { value: "critico", label: "Stock Crítico" },
      { value: "optimo", label: "Stock Óptimo" },
      { value: "exceso", label: "Stock Excedente" },
      { value: "vencer", label: "Lotes por Vencer" },
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
    const inventarioLista = this.props.inventarioLista;

    if (inventarioLista && inventarioLista.data && inventarioLista.paginacion) {
      this.setState(inventarioLista.data);
      this.refPaginacion.current.upperPageBound = inventarioLista.paginacion.upperPageBound;
      this.refPaginacion.current.lowerPageBound = inventarioLista.paginacion.lowerPageBound;
      this.refPaginacion.current.isPrevBtnActive = inventarioLista.paginacion.isPrevBtnActive;
      this.refPaginacion.current.isNextBtnActive = inventarioLista.paginacion.isNextBtnActive;
      this.refPaginacion.current.pageBound = inventarioLista.paginacion.pageBound;
      this.refPaginacion.current.paginationMessage = inventarioLista.paginacion.paginationMessage;

      // this.refSearch.current.initialize(inventarioLista.data.buscar);
      this.refSearch.current.value = inventarioLista.data.buscar;
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
        await this.loadSummary();
        await this.loadInit();
      });
    }
  }

  loadSummary = async () => {
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
    }, () => {
      this.updateReduxState()
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
      paginationMessage: this.refPaginacion.current.paginationMessage,
    });
  }

  loadInit = async () => {
    if (this.state.loading) return;

    await this.setStateAsync({ paginacion: 1, restart: true });
    this.fillTable(0);
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

    await this.setStateAsync({ paginacion: 1, restart: true, buscar: text });
    this.fillTable(1, text.trim());
    await this.setStateAsync({ opcion: 1 });
  };

  fillTable = async (opcion, buscar = "") => {
    this.setState({
      loading: true,
      lista: [],
      messageTable: "Cargando información...",
    });

    const params = {
      opcion: opcion,
      buscar: buscar,
      idAlmacen: this.state.idAlmacen,
      estado: this.state.estadoFiltro,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const { success, data, message, type } = await listInventario(params, this.abortControllerTable.signal);

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

    const totalPaginacion = parseInt(String(Math.ceil(Number(data.total) / this.state.filasPorPagina)));

    this.setState({
      loading: false,
      lista: data.result,
      totalPaginacion: totalPaginacion,
    }, () => {
      this.updateReduxState();
    });
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

  handleCambiarVista = (value) => {
    this.setState({ vista: value }, () => this.updateReduxState());
  };

  handleRecargar = async () => {
    await this.loadSummary();
    await this.loadInit();
  }

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
    this.setState({ idAlmacen: event.target.value }, async () => {
      await this.loadSummary();
      await this.loadInit();
    });
  };

  // Nuevo handler para el filtro de estado
  handleSelectEstado = (event) => {
    this.setState({ estadoFiltro: event.target.value }, async () => {
      await this.loadSummary();
      await this.loadInit();
    });
  };

  handleOpenPrinterCodBar = async (idProducto) => {
    await pdfVisualizer.init({
      url: documentsPdfCodbarProducto(),
      title: "Lista de productos - Código de Barras",
      titlePageNumber: 'Página',
      titleLoading: 'Cargando...',
    });
  };

  toggleLotesVisibility = (index) => {
    this.setState((prevState) => ({
      inventarioDetallesVisible: {
        ...prevState.inventarioDetallesVisible,
        [index]: !prevState.inventarioDetallesVisible?.[index],
      },
    }));
  };

  getLotesEnRiesgo = (inventarioDetalles) => {
    if (!inventarioDetalles || inventarioDetalles.length === 0) return 0;

    return inventarioDetalles.filter(
      (inventarioDetalle) => inventarioDetalle.diasRestantes <= 30 || inventarioDetalle.estado === 'Crítico',
    ).length;
  };

  getProximoVencimiento = (inventarioDetalles) => {
    if (!inventarioDetalles || inventarioDetalles.length === 0) return 'N/A';

    const inventarioDetallesOrdenados = [...inventarioDetalles].sort(
      (a, b) => a.diasRestantes - b.diasRestantes,
    );
    return inventarioDetallesOrdenados[0].fechaVencimiento;
  };

  determinarEstadoLote = (inventarioDetalle) => {
    if (isEmpty(inventarioDetalle.fechaVencimiento)) {
      return {
        estado: "",
        clase: "",
        icono: RxEyeNone,
        colorBarra: '',
      };
    }

    if (inventarioDetalle.diasRestantes <= 0) {
      return {
        estado: "Vencido",
        clase: "bg-red-600 text-white",
        icono: AlertCircle,
        colorBarra: "bg-red-600",
      };
    } else if (inventarioDetalle.diasRestantes > 0 && inventarioDetalle.diasRestantes <= 30) {
      return {
        estado: "Próximo",
        clase: "bg-orange-500 text-white",
        icono: Clock,
        colorBarra: "bg-orange-500",
      };
    } else if (inventarioDetalle.diasRestantes <= 90) {
      return {
        estado: "Vigilar",
        clase: "bg-yellow-500 text-white",
        icono: AlertTriangle,
        colorBarra: "bg-yellow-500",
      };
    } else {
      return {
        estado: "Óptimo",
        clase: "bg-green-500 text-white",
        icono: CheckCircle,
        colorBarra: "bg-green-500",
      };
    }
  };

  //------------------------------------------------------------------------------------------
  // Render
  //------------------------------------------------------------------------------------------

  determinarEstadoInventario = (item) => {
    const { cantidad, cantidadMinima, cantidadMaxima } = item;
    if (cantidad < cantidadMinima) {
      return {
        estado: "Crítico",
        clase: "bg-red-600 text-white",
        icono: AlertTriangle,
      };
    } else if (cantidad > cantidadMaxima) {
      return {
        estado: "Exceso",
        clase: "bg-blue-600 text-white",
        icono: PackagePlus,
      };
    } else {
      return {
        estado: "Óptimo",
        clase: "bg-green-500 text-white",
        icono: CheckCircle,
      };
    }
  };

  calcularPorcentaje = (item) => {
    const { cantidad, cantidadMinima, cantidadMaxima } = item;
    const rango = cantidadMaxima - cantidadMinima;
    if (rango <= 0) return 100;

    const porcentaje = ((cantidad - cantidadMinima) / rango) * 100;
    return Number(rounded(Math.max(0, Math.min(100, porcentaje)), 0));
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

  renderTable() {
    if (this.state.loading) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-12 text-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-gray-500">Cargando información...</p>
            </div>
          </td>
        </tr>
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-12 text-center">
            <div className="text-gray-500">
              <i className="bi bi-box text-4xl mb-3 block"></i>
              <p className="text-lg font-medium">No se encontraron ventas</p>
              <p className="text-sm">Intenta cambiar los filtros</p>
            </div>
          </td>
        </tr>
      );
    }

    return this.state.lista.map((item, index) => {
      const estadoInventario = this.determinarEstadoInventario(item);
      const tieneInventarioDetalles = item.inventarioDetalles && item.inventarioDetalles.length > 0;
      const porcentaje = this.calcularPorcentaje(item);

      return (
        <React.Fragment key={`producto-${item.idInventario}`}>
          <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center">
                <Image
                  default={images.noImage}
                  src={item.imagen}
                  alt={item.producto}
                  overrideClass="w-20 h-20 object-contain border border-solid border-[#e2e8f0] rounded"
                />
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {item.producto}
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.codigo}
                  </div>
                  {tieneInventarioDetalles && (
                    <div className="flex items-center mt-1">
                      <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {item.inventarioDetalles.length} lote(s)
                      </div>
                      {this.getLotesEnRiesgo(item.inventarioDetalles) > 0 && (
                        <div className="ml-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                          {this.getLotesEnRiesgo(item.inventarioDetalles)} en riesgo
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="text-sm text-gray-900">
                {item.categoria}
              </div>
              {tieneInventarioDetalles && (
                <div className="text-xs text-gray-500 mt-1">
                  Próx. venc: {this.getProximoVencimiento(item.inventarioDetalles)}
                </div>
              )}
            </td>
            <td className="px-6 py-4">
              <div>
                <div className={`text-sm font-medium ${getNumber(item.cantidad) <= 0 ? 'text-red-500' : 'text-gray-900'} `}>
                  {rounded(item.cantidad)} {item.medida}
                </div>
                <div className="text-xs text-gray-500">
                  Min: {item.cantidadMinima} | Max: {item.cantidadMaxima}
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      item.cantidad < item.cantidadMinima ? "bg-red-500" :
                        item.cantidad > item.cantidadMaxima ? "bg-blue-500" : "bg-green-500"
                    )}
                    style={{ width: `${porcentaje}%` }}
                  ></div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="text-sm font-medium text-gray-900">
                {formatCurrency(item.costo, this.state.codIso)}
              </div>
            </td>
            <td className="px-6 py-4">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoInventario.clase}`}
              >
                <estadoInventario.icono className="h-3 w-3 mr-1" />
                {estadoInventario.estado}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex justify-center space-x-2">
                <button
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                  onClick={() => this.handleOpenModalStock(item)}
                >
                  <Plus className="h-5 w-5" />
                </button>
                <button
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                  onClick={() => this.handleOpenPrinterCodBar(item.idProducto)}
                >
                  <Barcode className="h-5 w-5" />
                </button>
                {tieneInventarioDetalles && (
                  <button
                    onClick={() => this.toggleLotesVisibility(index)}
                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    {this.state.inventarioDetallesVisible[index] ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                )}
              </div>
            </td>
          </tr>

          {/* Lotes rows */}
          {
            tieneInventarioDetalles && this.state.inventarioDetallesVisible[index] && (
              <tr>
                <td colSpan={6} className="px-0 py-0 bg-gray-50">
                  <div className="rounded p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Detalles del producto
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {
                        item.inventarioDetalles.map((inventarioDetalle, inventarioDetalleIndex) => {
                          const estadoLote = this.determinarEstadoLote(inventarioDetalle);
                          const porcentajeLote = (inventarioDetalle.cantidad / item.cantidad) * 100;

                          return (
                            <div
                              key={inventarioDetalle.idKardex}
                              className="bg-white rounded p-4 border"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="text-sm font-medium text-gray-900">
                                  {inventarioDetalleIndex + 1}
                                </div>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${estadoLote.clase}`}
                                >
                                  <estadoLote.icono className="h-3 w-3 mr-1" />
                                  {estadoLote.estado}
                                </span>
                              </div>
                              <div className="space-y-2">
                                <div className="text-sm">
                                  <span className="text-gray-500">Código: </span>
                                  <span className="font-medium">{inventarioDetalle.lote || "N/A"}</span>
                                </div>
                                <div className="text-sm">
                                  <span className="text-gray-500">Vencimiento: </span>
                                  <span className="font-medium">{inventarioDetalle.fechaVencimiento || "N/A"}</span>
                                </div>
                                <div className="text-sm">
                                  <span className="text-gray-500">Días restantes: </span>
                                  <span
                                    className={cn(
                                      "font-medium",
                                      inventarioDetalle.diasRestantes <= 30 ? "text-red-600" :
                                        inventarioDetalle.diasRestantes <= 90 ? "text-orange-600" : "text-gray-900"
                                    )}
                                  >
                                    {inventarioDetalle.diasRestantes} días
                                  </span>
                                </div>
                                <div className="text-sm">
                                  <span className="text-gray-500">Cantidad: </span>
                                  <span className="font-medium">{inventarioDetalle.cantidad} {item.medida}</span>
                                </div>
                                <div className="text-sm">
                                  <span className="text-gray-500">Ubicación: </span>
                                  <span className="font-medium">{inventarioDetalle.ubicacion || "N/A"}</span>
                                </div>
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Participación en stock</span>
                                    <span>{rounded(porcentajeLote, 0)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${estadoLote.colorBarra}`}
                                      style={{ width: `${porcentajeLote}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>
                </td>
              </tr>
            )
          }
        </React.Fragment>
      );
    });
  }

  renderCuadricula() {
    if (this.state.loading) {
      return (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-gray-500">Cargando información...</p>
        </div>
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <div className="text-center py-16 rounded border text-gray-500">
          <i className="bi bi-box text-4xl mb-3 block text-gray-400"></i>
          <p className="text-lg font-medium">No se encontraron ventas</p>
          <p className="text-sm">Intenta cambiar los filtros</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {
          this.state.lista.map((item, index) => {
            const estadoInventario = this.determinarEstadoInventario(item);
            const tieneLotes = item.inventarioDetalles && item.inventarioDetalles.length > 0;
            const porcentaje = this.calcularPorcentaje(item);

            return (
              <div
                key={`producto-grid-${item.idInventario}`}
                className="bg-white rounded border hover:shadow-md transition group overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${estadoInventario.clase}`}
                    >
                      <estadoInventario.icono className="h-3 w-3 mr-1" />
                      {estadoInventario.estado}
                    </span>
                  </div>

                  <Image
                    default={images.noImage}
                    src={item.imagen}
                    alt={item.producto}
                    overrideClass="mb-3 w-full h-40 object-contain"
                  />

                  <h5 className="font-semibold text-gray-900 line-clamp-2 leading-tight text-base mb-1">
                    {item.producto}
                  </h5>

                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Código:</span> {item.codigo}
                  </div>

                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Categoría:</span> {item.categoria}
                  </div>

                  <div className="text-sm text-gray-900 mb-1">
                    <div className="flex gap-2">
                      <span className="font-medium">Stock:</span>
                      <span className={`${getNumber(item.cantidad) <= 0 ? 'text-red-500' : 'text-gray-900'} `}>
                        {rounded(item.cantidad)} <small>{item.medida}</small>
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-900 mb-1">
                    <div className="text-sm text-gray-500">
                      Min: {item.cantidadMinima} | Max: {item.cantidadMaxima}
                    </div>

                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          item.cantidad < item.cantidadMinima ? "bg-red-500" :
                            item.cantidad > item.cantidadMaxima ? "bg-blue-500" :
                              "bg-green-500",
                        )}
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-base font-bold text-gray-900 mb-3">
                    {formatCurrency(item.costo, this.state.codIso)}
                  </div>

                  {tieneLotes && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1 mb-1">
                        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          {item.inventarioDetalles.length} lote(s)
                        </div>
                        {this.getLotesEnRiesgo(item.inventarioDetalles) > 0 && (
                          <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                            {this.getLotesEnRiesgo(item.inventarioDetalles)} en riesgo
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Próx. venc:</span> {this.getProximoVencimiento(item.inventarioDetalles)}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                    <button
                      className="flex-1 p-2 text-indigo-600 hover:bg-indigo-50 rounded-md text-sm font-medium transition"
                      onClick={() => this.handleOpenModalStock(item)}
                      title="Agregar stock"
                    >
                      <Plus className="h-4 w-4 inline mr-1" /> Stock
                    </button>

                    <button
                      className="flex-1 p-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm font-medium transition"
                      onClick={() => this.handleOpenPrinterCodBar(item.idProducto)}
                      title="Código de barras"
                    >
                      <Barcode className="h-4 w-4 inline mr-1" /> Código
                    </button>

                    {tieneLotes && (
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm font-medium transition"
                        onClick={() => this.toggleLotesVisibility(index)}
                        title="Ver lotes"
                      >
                        {this.state.inventarioDetallesVisible[index] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Lotes expandidos */}
                  {tieneLotes && this.state.inventarioDetallesVisible[index] && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h6 className="text-xs font-medium text-gray-900 mb-2">Lotes</h6>
                      <div className="space-y-3">
                        {item.inventarioDetalles.map((inventarioDetalle, inventarioDetalleIndex) => {
                          const estadoLote = this.determinarEstadoLote(inventarioDetalle);
                          const porcentajeLote = (inventarioDetalle.cantidad / item.cantidad) * 100;

                          return (
                            <div key={inventarioDetalle.idKardex} className="text-xs bg-gray-50 p-2 rounded">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium">Lote {inventarioDetalleIndex + 1}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${estadoLote.clase}`}>
                                  {estadoLote.estado}
                                </span>
                              </div>
                              <div>Cód: {inventarioDetalle.lote}</div>
                              <div>Venc: {inventarioDetalle.fechaVencimiento}</div>
                              <div>Ubic.: {inventarioDetalle.ubicacion}</div>
                              <div
                                className={cn(
                                  inventarioDetalle.diasRestantes <= 30 ? "text-red-600" :
                                    inventarioDetalle.diasRestantes <= 90 ? "text-orange-600" : ""
                                )}>
                                {inventarioDetalle.diasRestantes} días restantes
                              </div>
                              <div className="mt-1">
                                <div className="w-full bg-gray-200 rounded h-1.5">
                                  <div
                                    className={`h-1.5 rounded ${estadoLote.colorBarra}`}
                                    style={{ width: `${porcentajeLote}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        }
      </div>
    );
  }

  render() {
    const { vista } = this.state;

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
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2",
                "bg-gray-200 text-gray-700 text-sm font-medium rounded",
                "hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition",
              )}
              onClick={this.handleRecargar}
            >
              <i className="bi bi-arrow-clockwise" />
              Recargar Vista
            </button>
          </div>

          {/* Toggle vista */}
          <div className="flex bg-gray-100 rounded p-1 gap-1">
            <button
              onClick={() => this.handleCambiarVista("tabla")}
              className={
                cn(
                  "flex-1 sm:flex-none flex items-center justify-center gap-1",
                  "text-sm font-medium",
                  "px-4 py-2",
                  "rounded-md transition ",
                  vista === "tabla" ? "bg-white text-blue-600" : "text-gray-600 hover:text-gray-800",
                )
              }
            >
              <i className="bi bi-list-ul"></i>
              <span className="hidden sm:inline">Tabla</span>
            </button>
            <button
              onClick={() => this.handleCambiarVista("cuadricula")}
              className={
                cn(
                  "flex-1 sm:flex-none flex items-center justify-center gap-1",
                  "text-sm font-medium",
                  "px-4 py-2",
                  "rounded-md transition ",
                  vista === "cuadricula" ? "bg-white text-blue-600" : "text-gray-600 hover:text-gray-800",
                )
              }
            >
              <i className="bi bi-grid-3x3"></i>
              <span className="hidden sm:inline">Cuadrícula</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-y-4 mb-4">
          <div>
            <p className="text-gray-600 mt-1">
              Puedes ver todos los productos con diferentes filtros, por ejemplo: almacen, stock y filtro.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-700">
                Almacén
              </p>
              <select
                className="w-full text-sm px-3 py-2 h-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={this.state.idAlmacen}
                onChange={this.handleSelectAlmacen}
              >
                <option value="">Seleccione un almacén</option>
                {
                  this.state.almacenes.map((item, index) => {
                    return (
                      <option key={index} value={item.idAlmacen}>
                        {item.nombre} - {item.tipoAlmacen}
                      </option>
                    );
                  })
                }
              </select>
            </div>

            {/* Nuevo filtro de estado */}
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-700">
                Estado del Stock
              </p>
              <select
                className="w-full text-sm px-3 py-2 h-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={this.state.estadoFiltro}
                onChange={this.handleSelectEstado}
              >
                {
                  this.estadosOptions.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="md:col-span-2 flex flex-col gap-2">
              <p className="text-sm text-gray-700">
                Buscar producto
              </p>
              <Search
                group={true}
                iconLeft={<i className="bi bi-search" />}
                ref={this.refSearch}
                onSearch={this.searchText}
                placeholder="Buscar por código o nombre..."
                theme="modern"
              />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-3">
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
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Lotes por Vencer
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {rounded(this.state.resumen.totalLotesPorVencer, 0)}
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
          <div
            className={
              vista === "tabla"
                ? "bg-white rounded border overflow-hidden"
                : "space-y-6"
            }
          >
            {/* 📊 Vista Tabla  */}
            {
              vista === "tabla" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">Producto</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Categoría</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Stock</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Costo</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Estado</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%] text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {this.renderTable()}
                    </tbody>
                  </table>
                </div>
              )
            }

            {/* 🟦 Vista Cuadrícula */}
            {
              vista === "cuadricula" && (
                <>{this.renderCuadricula()}</>
              )
            }

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
                vista === "tabla"
                  ? "md:px-4 py-3 bg-white border-t border-gray-200 overflow-auto"
                  : "md:px-6 py-3 bg-white border rounded border-gray-200 overflow-auto"
              }
            />
          </div>
        </div>
      </ContainerWrapper>
    );
  }
}

Inventario.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      usuario: PropTypes.shape({
        idUsuario: PropTypes.string.isRequired,
      }),
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