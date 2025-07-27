import React, { Suspense } from 'react';
import {
  rounded,
  convertNullText,
  numberFormat,
  isEmpty,
} from '../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import ContainerWrapper from '../../../../components/Container';
import Paginacion from '../../../../components/Paginacion';
import CustomComponent from '../../../../model/class/custom-component';
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
import { SpinnerTable, SpinnerView } from '../../../../components/Spinner';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableResponsive,
  TableRow,
} from '../../../../components/Table';
// import CustomModalStock from './component/ModalStock';
const CustomModalStock = React.lazy(
  () => import('@/view/inicio/logistica/inventario/component/ModalStock'),
);
import Select from '../../../../components/Select';
import Search from '../../../../components/Search';
import {
  setListaInventarioData,
  setListaInventarioPaginacion,
} from '../../../../redux/predeterminadoSlice';
import Button from '../../../../components/Button';
import pdfVisualizer from 'pdf-visualizer';
import {
  Card,
  CardBody,
  CardHeader,
  CardText,
  CardTitle,
} from '../../../../components/Card';
import {
  AlertCircle,
  AlertTriangle,
  Barcode,
  Box,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  Clock,
  MoreHorizontal,
  PackageOpen,
  PackagePlus,
  Plus,
  RefreshCw,
  SearchIcon,
  TrendingUp,
  TriangleAlert,
} from 'lucide-react';
import Image from '../../../../components/Image';
import { images } from '../../../../helper';
import DropdownActions from '../../../../components/DropdownActions';
import ProgressBar from '../../../../components/ProgressBar';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
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

      lotesVisible: {},

      buscar: '',

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',

      // Atributos del modal stock
      isOpenStock: false,

      // Id principales
      codIso: this.props.moneda.codiso ?? '',
      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refPaginacion = React.createRef();

    this.refSearch = React.createRef();

    this.refModalStock = React.createRef();

    this.abortControllerTable = new AbortController();
  }

  async componentDidMount() {
    await this.loadingData();
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
  }

  async loadingData() {
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

      this.setState(
        {
          almacenes,
          idAlmacen: almacenFilter ? almacenFilter.idAlmacen : '',
          initialLoad: false,
        },
        async () => {
          await this.loadingSummary();
          await this.loadingInit();
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

  loadingInit = async () => {
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
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listInventario(
      params,
      this.abortControllerTable.signal,
    );

    if (response instanceof SuccessReponse) {
      const result = response.data.result;
      const total = response.data.total;
      const totalPaginacion = parseInt(
        Math.ceil(parseFloat(total) / this.state.filasPorPagina),
      );

      this.setState(
        {
          loading: false,
          lista: result,
          totalPaginacion: totalPaginacion,
        },
        () => {
          this.updateReduxState();
        },
      );
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
    this.setState({ idAlmacen: event.target.value }, () => this.loadingInit());
  };

  handleOpenPrinterCodBar = async (idProducto) => {
    await pdfVisualizer.init({
      url: documentsPdfCodbarProducto(),
      title: 'Lista de productos - Código de Barras',
      titlePageNumber: 'Página',
      titleLoading: 'Cargando...',
    });
  };

  toggleLotesVisibility = (index) => {
    this.setState((prevState) => ({
      lotesVisible: {
        ...prevState.lotesVisible,
        [index]: !prevState.lotesVisible?.[index],
      },
    }));
  };

  getLotesEnRiesgo = (lotes) => {
    if (!lotes || lotes.length === 0) return 0;

    return lotes.filter(
      (lote) => lote.diasRestantes <= 30 || lote.estado === 'Crítico',
    ).length;
  };

  getProximoVencimiento = (lotes) => {
    if (!lotes || lotes.length === 0) return 'N/A';

    const lotesOrdenados = [...lotes].sort(
      (a, b) => a.diasRestantes - b.diasRestantes,
    );
    return lotesOrdenados[0].fechaVencimiento;
  };

  determinarEstadoLote = (lote) => {
    if (lote.diasRestantes <= 0) {
      return {
        estado: 'Vencido',
        clase: 'bg-red-600 text-white',
        icono: AlertCircle,
        colorBarra: 'bg-red-600',
      };
    } else if (lote.diasRestantes > 0 && lote.diasRestantes <= 30) {
      return {
        estado: 'Próximo',
        clase: 'bg-orange-500 text-white',
        icono: Clock,
        colorBarra: 'bg-orange-500',
      };
    } else if (lote.diasRestantes <= 90) {
      return {
        estado: 'Vigilar',
        clase: 'bg-yellow-500 text-white',
        icono: AlertTriangle,
        colorBarra: 'bg-yellow-500',
      };
    } else {
      return {
        estado: 'Óptimo',
        clase: 'bg-green-500 text-white',
        icono: CheckCircle,
        colorBarra: 'bg-green-500',
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
    const rango = cantidadMaxima - cantidadMinima;
    if (rango <= 0) return 100;

    const porcentaje = ((cantidad - cantidadMinima) / rango) * 100;
    return Number(rounded(Math.max(0, Math.min(100, porcentaje)), 0));
  };

  render() {
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
            handleSave={this.loadingInit}
          />
        </Suspense>

        {/* Header */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-gray-600 mt-1">
                  Gestión de productos y stock
                </p>
              </div>
              <button
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                onClick={this.loadingInit}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recargar
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Almacén
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={this.state.idAlmacen}
                  onChange={this.handleSelectAlmacen}
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
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar producto
                </label>
                <Search
                  group={true}
                  iconLeft={<i className="bi bi-search"></i>}
                  ref={this.refSearch}
                  onSearch={this.searchText}
                  placeholder="Buscar por código o nombre..."
                  theme="modern"
                />
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
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

            <div className="bg-white rounded-xl shadow-sm border p-6">
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

            <div className="bg-white rounded-xl shadow-sm border p-6">
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

            <div className="bg-white rounded-xl shadow-sm border p-6">
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

            <div className="bg-white rounded-xl shadow-sm border p-6">
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

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Costo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {this.state.loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
                          <p className="text-gray-500">
                            Cargando información...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : isEmpty(this.state.lista) ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <PackageOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <p className="text-lg font-medium">
                            No se encontraron productos con el filtro
                          </p>
                          <p className="text-sm">Intenta cambiar el filtro</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    this.state.lista.map((item, index) => {
                      const estadoInventario =
                        this.determinarEstadoInventario(item);
                      const tieneLotes = item.lotes && item.lotes.length > 0;
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
                                  width={70}
                                />
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.producto}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {item.codigo}
                                  </div>
                                  {tieneLotes && (
                                    <div className="flex items-center mt-1">
                                      <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                        {item.lotes.length} lote(s)
                                      </div>
                                      {this.getLotesEnRiesgo(item.lotes) >
                                        0 && (
                                        <div className="ml-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                          {this.getLotesEnRiesgo(item.lotes)} en
                                          riesgo
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
                              {tieneLotes && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Próx. venc:{' '}
                                  {this.getProximoVencimiento(item.lotes)}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {item.cantidad} {item.medida}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Min: {item.cantidadMinima} | Max:{' '}
                                  {item.cantidadMaxima}
                                </div>
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      item.cantidad < item.cantidadMinima
                                        ? 'bg-red-500'
                                        : item.cantidad > item.cantidadMaxima
                                          ? 'bg-blue-500'
                                          : 'bg-green-500'
                                    }`}
                                    style={{ width: `${porcentaje}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {numberFormat(item.costo, this.state.codIso)}
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
                              <div className="flex items-center space-x-2">
                                <button
                                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                                  onClick={() =>
                                    this.handleOpenModalStock(item)
                                  }
                                >
                                  <Plus className="h-5 w-5" />
                                </button>
                                <button
                                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                                  onClick={() =>
                                    this.handleOpenPrinterCodBar(
                                      item.idProducto,
                                    )
                                  }
                                >
                                  <Barcode className="h-5 w-5" />
                                </button>
                                {tieneLotes && (
                                  <button
                                    onClick={() =>
                                      this.toggleLotesVisibility(index)
                                    }
                                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                                  >
                                    {this.state.lotesVisible[index] ? (
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
                          {tieneLotes && this.state.lotesVisible[index] && (
                            <tr>
                              <td colSpan="6" className="px-6 py-0 bg-gray-50">
                                <div className="rounded-lg p-4 mb-4">
                                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                                    Lotes del producto
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {item.lotes.map((lote, loteIndex) => {
                                      const estadoLote =
                                        this.determinarEstadoLote(lote);
                                      const porcentajeLote =
                                        (lote.cantidad / item.cantidad) * 100;

                                      return (
                                        <div
                                          key={lote.idLote}
                                          className="bg-white rounded-lg p-4 shadow-sm"
                                        >
                                          <div className="flex justify-between items-start mb-2">
                                            <div className="text-sm font-medium text-gray-900">
                                              Lote {loteIndex + 1}
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
                                              <span className="text-gray-500">
                                                Código:{' '}
                                              </span>
                                              <span className="font-medium">
                                                {lote.codigoLote}
                                              </span>
                                            </div>
                                            <div className="text-sm">
                                              <span className="text-gray-500">
                                                Vencimiento:{' '}
                                              </span>
                                              <span className="font-medium">
                                                {lote.fechaVencimiento}
                                              </span>
                                            </div>
                                            <div className="text-sm">
                                              <span className="text-gray-500">
                                                Días restantes:{' '}
                                              </span>
                                              <span
                                                className={`font-medium ${
                                                  lote.diasRestantes <= 30
                                                    ? 'text-red-600'
                                                    : lote.diasRestantes <= 90
                                                      ? 'text-orange-600'
                                                      : 'text-gray-900'
                                                }`}
                                              >
                                                {lote.diasRestantes} días
                                              </span>
                                            </div>
                                            <div className="text-sm">
                                              <span className="text-gray-500">
                                                Cantidad:{' '}
                                              </span>
                                              <span className="font-medium">
                                                {lote.cantidad} {item.medida}
                                              </span>
                                            </div>
                                            <div className="mt-2">
                                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                <span>
                                                  Participación en stock
                                                </span>
                                                <span>
                                                  {rounded(porcentajeLote, 0)}%
                                                </span>
                                              </div>
                                              <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                  className={`h-2 rounded-full ${estadoLote.colorBarra}`}
                                                  style={{
                                                    width: `${porcentajeLote}%`,
                                                  }}
                                                ></div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <Paginacion
              ref={this.refPaginacion}
              loading={this.state.loading}
              data={this.state.lista}
              totalPaginacion={this.state.totalPaginacion}
              paginacion={this.state.paginacion}
              fillTable={this.paginacionContext}
              restart={this.state.restart}
              theme="modern"
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
