import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ContainerWrapper from '@/components/ui/container-wrapper';
import { SpinnerView } from '@/components/Spinner';
import Title from '@/components/Title';
import CustomComponent from '@/components/CustomComponent';
import { downloadFileAsync } from '@/redux/downloadSlice';
import {
  ChartNoAxesCombined,
  HandCoins,
  Package,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  TriangleAlert,
} from 'lucide-react';
import ErrorResponse from '@/model/class/error-response';
import { alertKit } from 'alert-kit';
import {
  comboAlmacen,
  comboSucursal,
  dashboardProducto,
} from '@/network/rest/principal.network';
import {
  isEmpty,
  formatCurrency,
  rounded,
} from '@/helper/utils.helper';
import { images } from '@/helper';
import Image from '@/components/Image';
import { CANCELED } from '@/constants/requestStatus';
import { cn } from '@/lib/utils';
import DatePickerPopover from '@/components/DatePickerPopover';
import { format } from 'date-fns';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class RepProductos extends CustomComponent {
  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      msgLoading: 'Cargando información...',

      codIso: this.props.moneda.codiso ?? '',

      fechaInicial: new Date(),
      fechaFinal: new Date(),

      idSucursal: this.props.token.project.idSucursal,
      sucursales: [],

      idAlmacen: '',
      almacenes: [],

      productosVendidos: [],
      productosMasVendidos: [],
      estadoInventario: {
        bajo_inventario: 0,
        exceso_inventario: 0,
        inventario_normal: 0,
        total_productos: 0,
      },
      rendimientoCategoria: [],
      productosConBajoInventario: [],
      productosSinVentaConInventario: [],

      // Estados para paginación
      currentPageProductos: 1,
      itemsPerPageProductos: 5,
      currentPageMasVendidos: 1,
      itemsPerPageMasVendidos: 5,
      currentPageBajoInventario: 1,
      itemsPerPageBajoInventario: 5,
      currentPageSinVentas: 1,
      itemsPerPageSinVentas: 5,
      currentPageRendimientoCategoria: 1,
      itemsPerPageRendimientoCategoria: 3,

      idUsuario: this.props.token.userToken.usuario.idUsuario,
    };

    this.abortControllerView = new AbortController();
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
    await this.loadingInit();
  }

  componentWillUnmount() {
    this.abortControllerView.abort();
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

  loadingInit = async () => {
    const sucursalResponse = await comboSucursal(
      this.abortControllerView.signal,
    );

    if (sucursalResponse instanceof ErrorResponse) {
      if (sucursalResponse.getType() === CANCELED) return;

      alertKit.warning({
        title: 'Reporte Productos',
        message: sucursalResponse.getMessage(),
      }, () => {
        this.props.history.goBack();
      });
      return;
    }

    const almacenResponse = await comboAlmacen({
      idSucursal: this.state.idSucursal,
    });

    if (almacenResponse instanceof ErrorResponse) {
      if (almacenResponse.getType() === CANCELED) return;

      alertKit.warning({
        title: 'Reporte Productos',
        message: almacenResponse.getMessage(),
      }, () => {
        this.props.history.goBack();
      });
      return;
    }

    const almacenFilter = almacenResponse.data.find(
      (item) => item.predefinido === 1,
    );

    await this.setStateAsync({
      sucursales: sucursalResponse.data,
      almacenes: almacenResponse.data,
      idAlmacen: almacenFilter ? almacenFilter.idAlmacen : '',
    });

    await this.loadingData();
  }

  async loadingData() {
    this.setState({
      loading: true,
      msgLoading: 'Cargando información...',
    });

    const body = {
      fechaInicio: format(this.state.fechaInicial, "yyyy-MM-dd"),
      fechaFinal: format(this.state.fechaFinal, "yyyy-MM-dd"),
      idSucursal: this.state.idSucursal,
      idAlmacen: this.state.idAlmacen,
    };

    const response = await dashboardProducto(
      body,
      this.abortControllerView.signal,
    );

    if (response instanceof ErrorResponse) {
      alertKit.warning({
        title: 'Reporte Productos',
        message: response.getMessage(),
      }, () => {
        this.props.history.goBack();
      });
      return;
    }

    console.log(response.data["productosVendidos"].data);

    this.setState({
      productosVendidos: response.data["productosVendidos"].data,
      productosMasVendidos: response.data["productosMasVendidos"].data,
      estadoInventario: response.data["estadoInventario"].data,
      rendimientoCategoria: response.data["rendimientoCategoria"].data,
      productosConBajoInventario: response.data["productosConBajoInventario"].data,
      productosSinVentaConInventario: response.data["productosSinVentaConInventario"].data,
      loading: false,
      // Resetear páginas cuando se cargan nuevos datos
      currentPageProductos: 1,
      currentPageMasVendidos: 1,
      currentPageBajoInventario: 1,
      currentPageSinVentas: 1,
    });
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

  // Métodos para manejar las acciones
  handleChangeFechaInicial = (selectedDate) => {
    this.setState({ fechaInicial: selectedDate }, () => this.loadingData());
  };

  handleChangeFechaFinal = (selectedDate) => {
    this.setState({ fechaFinal: selectedDate }, () => this.loadingData());
  };

  handleSelectIdSistema = (e) => {
    this.setState({ idSucursal: e.target.value }, () =>
      this.loadingInit(),
    );
  };

  handleSelectIdAlmacen = (e) => {
    this.setState({ idAlmacen: e.target.value }, () =>
      this.loadingData(),
    );
  }

  // Métodos para manejar paginación
  handlePageChangeProductos = (page) => {
    this.setState({ currentPageProductos: page });
  };

  handlePageChangeMasVendidos = (page) => {
    this.setState({ currentPageMasVendidos: page });
  };

  handlePageChangeBajoInventario = (page) => {
    this.setState({ currentPageBajoInventario: page });
  };

  handlePageChangeSinVentas = (page) => {
    this.setState({ currentPageSinVentas: page });
  };

  handlePageChangeRendimientoCategoria = (page) => {
    this.setState({ currentPageRendimientoCategoria: page });
  };

  // Método para obtener datos paginados
  getPaginatedData = (data, currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Método para calcular el número total de páginas
  getTotalPages = (data, itemsPerPage) => {
    return Math.ceil(data.length / itemsPerPage);
  };

  // Componente de paginación
  renderPagination = (currentPage, totalPages, onPageChange, prefix = '') => {
    if (totalPages <= 1) return null;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <p className="text-sm text-gray-700">
              Página <span className="font-medium">{currentPage}</span> de{' '}
              <span className="font-medium">{totalPages}</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={cn(
                "relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md",
                currentPage === 1 ?
                  "text-gray-300 cursor-not-allowed" :
                  "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {startPage > 1 && (
              <>
                <button
                  onClick={() => onPageChange(1)}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  1
                </button>
                {startPage > 2 && <span className="text-gray-500">...</span>}
              </>
            )}

            {Array.from(
              { length: endPage - startPage + 1 },
              (_, i) => startPage + i,
            ).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={cn(
                  "relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  page === currentPage ?
                    "z-10 bg-blue-600 border-blue-600 text-white" :
                    "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                )}
              >
                {page}
              </button>
            ))}

            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && (
                  <span className="text-gray-500">...</span>
                )}
                <button
                  onClick={() => onPageChange(totalPages)}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={cn(
                "relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md",
                currentPage === totalPages ?
                  "text-gray-300 cursor-not-allowed" :
                  "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
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

  renderProductosVendidos = () => {
    const {
      codIso,
      productosVendidos,
      currentPageProductos,
      itemsPerPageProductos,
    } = this.state;

    // Datos paginados
    const paginatedProductosVendidos = this.getPaginatedData(
      productosVendidos,
      currentPageProductos,
      itemsPerPageProductos,
    );

    // Total de páginas
    const totalPagesProductos = this.getTotalPages(
      productosVendidos,
      itemsPerPageProductos,
    );

    return (
      <div className="lg:col-span-2 mb-4">
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Productos Vendidos
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Detalles de ventas, costos y ganancias (
                  {productosVendidos.length} productos)
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Mostrar:</label>
                <select
                  value={itemsPerPageProductos}
                  onChange={(e) =>
                    this.setState({
                      itemsPerPageProductos: parseInt(e.target.value),
                      currentPageProductos: 1,
                    })
                  }
                  className="px-2 py-1 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendidos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sumatoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ganancia
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isEmpty(paginatedProductosVendidos) && (
                  <tr>
                    <td colSpan={8} className="text-center">
                      <div className="d-flex flex-column align-items-center py-4">
                        <img
                          className="mb-1"
                          src={images.basket}
                          alt="Canasta"
                        />
                        <div className="w-50">
                          <span className="text-base">
                            No hay productos vendidos
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                {paginatedProductosVendidos.map((producto, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center w-20 h-20 rounded border border-solid border-[#e2e8f0]">
                        <Image
                          default={images.noImage}
                          src={producto.imagen}
                          alt={producto.nombre}
                          overrideClass="w-full h-full object-contain"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {producto.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {producto.codigo}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {producto.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {rounded(producto.cantidad_vendida, 0)}
                      </div>
                      <div className="text-xs text-gray-500">
                        última: {producto.ultima_venta}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(producto.precio_promedio, codIso)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(producto.costo, codIso)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(
                        producto.cantidad_vendida *
                        producto.precio_promedio,
                        codIso,
                      )}{' '}
                      -{' '}
                      {formatCurrency(
                        producto.cantidad_vendida * producto.costo,
                        codIso,
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency(producto.ganancia_total, codIso)}
                      </div>
                      <div className="text-xs text-gray-500">
                        ({rounded(producto.margen_ganancia, 0)}%)
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación para productos vendidos */}
          {
            this.renderPagination(
              currentPageProductos,
              totalPagesProductos,
              this.handlePageChangeProductos,
            )
          }
        </div>
      </div>
    );
  }

  renderProductosMasVendidos = () => {
    const {
      codIso,
      productosMasVendidos,
      currentPageMasVendidos,
      itemsPerPageMasVendidos,
    } = this.state;

    // Datos paginados
    const paginatedMasVendidos = this.getPaginatedData(
      productosMasVendidos,
      currentPageMasVendidos,
      itemsPerPageMasVendidos,
    );

    // Total de páginas
    const totalPagesMasVendidos = this.getTotalPages(
      productosMasVendidos,
      itemsPerPageMasVendidos,
    );

    return (
      <div className="bg-white rounded p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Productos Más Vendidos
          </h3>
          <span className="text-sm text-gray-500">
            ({productosMasVendidos.length})
          </span>
        </div>
        <div className="space-y-4">
          {isEmpty(paginatedMasVendidos) && (
            <div className="flex items-center justify-center">
              <div className="text-gray-500 text-sm">
                No hay productos más vendidos
              </div>
            </div>
          )}
          {paginatedMasVendidos.map((producto, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                  {(currentPageMasVendidos - 1) *
                    itemsPerPageMasVendidos +
                    index +
                    1}
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    {producto.nombre}
                  </div>
                  <div className="text-xs text-gray-500">
                    {rounded(producto.cantidad_vendida, 0)} vendidos
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-green-600">
                  {formatCurrency(producto.ingresos_totales, codIso)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Paginación para productos más vendidos */}
        {productosMasVendidos.length > itemsPerPageMasVendidos && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {(currentPageMasVendidos - 1) * itemsPerPageMasVendidos +
                  1}
                -
                {Math.min(
                  currentPageMasVendidos * itemsPerPageMasVendidos,
                  productosMasVendidos.length,
                )}{' '}
                de {productosMasVendidos.length}
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() =>
                    this.handlePageChangeMasVendidos(
                      currentPageMasVendidos - 1,
                    )
                  }
                  disabled={currentPageMasVendidos === 1}
                  className={cn(
                    "px-2 py-1 text-xs rounded",
                    currentPageMasVendidos === 1 ?
                      "text-gray-300 cursor-not-allowed" :
                      "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 py-1 text-xs text-gray-600">
                  {currentPageMasVendidos}/{totalPagesMasVendidos}
                </span>
                <button
                  onClick={() =>
                    this.handlePageChangeMasVendidos(
                      currentPageMasVendidos + 1,
                    )
                  }
                  disabled={
                    currentPageMasVendidos === totalPagesMasVendidos
                  }
                  className={cn(
                    "px-2 py-1 text-xs rounded",
                    currentPageMasVendidos === totalPagesMasVendidos ?
                      "text-gray-300 cursor-not-allowed" :
                      "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  renderEstadoInventario = () => {
    const {
      estadoInventario,
    } = this.state;

    return (
      <div className="bg-white rounded p-6 border border-gray-200 relative">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Estado de Inventario
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-green-50 rounded border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {estadoInventario.inventario_normal}
            </div>
            <div className="text-sm text-green-800">Normal</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded border border-red-200">
            <div className="text-2xl font-bold text-red-600">
              {estadoInventario.bajo_inventario}
            </div>
            <div className="text-sm text-red-800">Bajo</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {estadoInventario.exceso_inventario}
            </div>
            <div className="text-sm text-blue-800">Exceso</div>
          </div>
        </div>
        <div className="mt-3 text-center">
          <div className="text-sm text-gray-600">
            Total: {estadoInventario.total_productos} productos
          </div>
        </div>
      </div>
    )
  }

  renderRendimientoCategoria = () => {
    const {
      codIso,
      rendimientoCategoria,
      currentPageRendimientoCategoria,
      itemsPerPageRendimientoCategoria,
    } = this.state;

    // Datos paginados
    const paginatedRendimientoCategoria = this.getPaginatedData(
      rendimientoCategoria,
      currentPageRendimientoCategoria,
      itemsPerPageRendimientoCategoria,
    );

    // Total de páginas
    const totalPagesRendimientoCategoria = this.getTotalPages(
      rendimientoCategoria,
      itemsPerPageRendimientoCategoria,
    );

    return (
      <div className="bg-white rounded p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Rendimiento por Categoría
        </h3>
        <div className="space-y-3">
          {isEmpty(paginatedRendimientoCategoria) && (
            <div className="flex items-center justify-center">
              <div className="text-gray-500 text-sm">
                No hay productos con ventas
              </div>
            </div>
          )}
          {paginatedRendimientoCategoria.map((categoria, index) => {
            const categoryProducts = rendimientoCategoria.filter(
              (p) => p.idCategoria === categoria.idCategoria,
            );
            const totalRevenue = categoryProducts.reduce(
              (sum, p) => sum + p.ingresos_totales,
              0,
            );
            const totalItems = categoryProducts.reduce(
              (sum, p) => sum + p.unidades_vendidas,
              0,
            );
            return (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {categoria.categoria}
                  </span>
                  <span className="text-xs text-gray-500">
                    {totalItems} items
                  </span>
                </div>
                <div className="text-sm font-bold text-green-600">
                  {formatCurrency(totalRevenue, codIso)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Paginación para rendimiento por categoría */}
        {rendimientoCategoria.length >
          itemsPerPageRendimientoCategoria && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {(currentPageRendimientoCategoria - 1) *
                    itemsPerPageRendimientoCategoria +
                    1}
                  -
                  {Math.min(
                    currentPageRendimientoCategoria *
                    itemsPerPageRendimientoCategoria,
                    rendimientoCategoria.length,
                  )}{' '}
                  de {rendimientoCategoria.length}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() =>
                      this.handlePageChangeRendimientoCategoria(
                        currentPageRendimientoCategoria - 1,
                      )
                    }
                    disabled={currentPageRendimientoCategoria === 1}
                    className={cn(
                      "px-2 py-1 text-xs rounded",
                      currentPageRendimientoCategoria === 1 ?
                        "text-gray-300 cursor-not-allowed" :
                        "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 py-1 text-xs text-gray-600">
                    {currentPageRendimientoCategoria}/
                    {totalPagesRendimientoCategoria}
                  </span>
                  <button
                    onClick={() =>
                      this.handlePageChangeRendimientoCategoria(
                        currentPageRendimientoCategoria + 1,
                      )
                    }
                    disabled={
                      currentPageRendimientoCategoria ===
                      totalPagesRendimientoCategoria
                    }
                    className={cn(
                      "px-2 py-1 text-xs rounded",
                      currentPageRendimientoCategoria === totalPagesRendimientoCategoria ?
                        "text-gray-300 cursor-not-allowed" :
                        "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    );
  }

  renderProductosConBajoInventario = () => {
    const {
      productosConBajoInventario,
      currentPageBajoInventario,
      itemsPerPageBajoInventario,
    } = this.state;

    // Datos paginados
    const paginatedBajoInventario = this.getPaginatedData(
      productosConBajoInventario,
      currentPageBajoInventario,
      itemsPerPageBajoInventario,
    );

    // Total de páginas
    const totalPagesBajoInventario = this.getTotalPages(
      productosConBajoInventario,
      itemsPerPageBajoInventario,
    );

    return (
      <div>
        <div className="flex justify-between items-center mb-3">
          <h5 className="font-semibold text-red-700 flex items-center">
            <TriangleAlert className="w-5 h-5 mr-2" />
            Productos con Bajo Inventario
          </h5>
          <span className="text-sm text-gray-500">
            ({productosConBajoInventario.length})
          </span>
        </div>
        <div className="space-y-3">
          {isEmpty(paginatedBajoInventario) && (
            <div className="flex items-center justify-center p-4">
              <div className="text-gray-500 text-sm">
                No hay productos con bajo inventario
              </div>
            </div>
          )}
          {paginatedBajoInventario.map((producto, index) => (
            <div
              key={index}
              className="flex items-center p-3 bg-red-50 rounded border border-red-200 gap-x-4"
            >
              <div className="max-w-20 aspect-square relative flex items-center justify-center overflow-hidden border border-gray-200 bg-white">
                <Image
                  default={images.noImage}
                  src={producto.imagen}
                  alt={producto.nombre}
                  overrideClass="max-w-full max-h-full w-auto h-auto object-contain block"
                />
              </div>
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-red-800">
                    {producto.nombre}
                  </div>
                  <div className="text-xs text-red-600">
                    Actual: {producto.inventario_actual}, Mínimo:{' '}
                    {producto.cantidadMinima}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-red-700">
                    Reordenar
                  </div>
                  <div className="text-xs text-red-600">
                    {producto.unidades_para_reordenar}{' '}
                    {producto.medida}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Paginación para bajo inventario */}
        {productosConBajoInventario.length >
          itemsPerPageBajoInventario && (
            <div className="mt-4 pt-4 border-t border-red-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {(currentPageBajoInventario - 1) *
                    itemsPerPageBajoInventario +
                    1}
                  -
                  {Math.min(
                    currentPageBajoInventario *
                    itemsPerPageBajoInventario,
                    productosConBajoInventario.length,
                  )}{' '}
                  de {productosConBajoInventario.length}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() =>
                      this.handlePageChangeBajoInventario(
                        currentPageBajoInventario - 1,
                      )
                    }
                    disabled={currentPageBajoInventario === 1}
                    className={cn(
                      "px-2 py-1 text-xs rounded",
                      currentPageBajoInventario === 1 ?
                        "text-gray-300 cursor-not-allowed" :
                        "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 py-1 text-xs text-gray-600">
                    {currentPageBajoInventario}/
                    {totalPagesBajoInventario}
                  </span>
                  <button
                    onClick={() =>
                      this.handlePageChangeBajoInventario(
                        currentPageBajoInventario + 1,
                      )
                    }
                    disabled={
                      currentPageBajoInventario ===
                      totalPagesBajoInventario
                    }
                    className={cn(
                      "px-2 py-1 text-xs rounded",
                      currentPageBajoInventario === totalPagesBajoInventario ?
                        "text-gray-300 cursor-not-allowed" :
                        "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    );
  }

  renderProductosSinVentas = () => {
    const {
      productosSinVentaConInventario,
      currentPageSinVentas,
      itemsPerPageSinVentas,
    } = this.state;

    // Datos paginados
    const paginatedSinVentas = this.getPaginatedData(
      productosSinVentaConInventario,
      currentPageSinVentas,
      itemsPerPageSinVentas,
    );

    // Total de páginas
    const totalPagesSinVentas = this.getTotalPages(
      productosSinVentaConInventario,
      itemsPerPageSinVentas,
    );

    return (
      <div>
        <div className="flex justify-between items-center mb-3">
          <h5 className="font-semibold text-orange-700 flex items-center">
            <TriangleAlert className="w-5 h-5 mr-2" />
            Productos sin Ventas
          </h5>
          <span className="text-sm text-gray-500">
            ({productosSinVentaConInventario.length})
          </span>
        </div>
        <div className="space-y-3">
          {isEmpty(paginatedSinVentas) && (
            <div className="flex items-center justify-center p-4">
              <div className="text-gray-500 text-sm">
                No hay productos sin ventas
              </div>
            </div>
          )}
          {paginatedSinVentas.map((producto, index) => (
            <div
              key={index}
              className="flex items-center p-3 bg-red-50 rounded border border-red-200 gap-x-4"
            >
              <div className="max-w-20 aspect-square relative flex items-center justify-center overflow-hidden border border-gray-200 bg-white">
                <Image
                  default={images.noImage}
                  src={producto.imagen}
                  alt={producto.nombre}
                  overrideClass="max-w-full max-h-full w-auto h-auto object-contain block"
                />
              </div>
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-orange-800">
                    {producto.nombre}
                  </div>
                  <div className="text-xs text-orange-600">
                    Inventario: {producto.inventario_actual} unidades
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-orange-700">
                    Promoción
                  </div>
                  <div className="text-xs text-orange-600">
                    considerar descuento
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Paginación para sin ventas */}
        {productosSinVentaConInventario.length >
          itemsPerPageSinVentas && (
            <div className="mt-4 pt-4 border-t border-orange-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {(currentPageSinVentas - 1) * itemsPerPageSinVentas + 1}
                  -
                  {Math.min(
                    currentPageSinVentas * itemsPerPageSinVentas,
                    productosSinVentaConInventario.length,
                  )}{' '}
                  de {productosSinVentaConInventario.length}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() =>
                      this.handlePageChangeSinVentas(
                        currentPageSinVentas - 1,
                      )
                    }
                    disabled={currentPageSinVentas === 1}
                    className={cn(
                      "px-2 py-1 text-xs rounded",
                      currentPageSinVentas === 1 ?
                        "text-gray-300 cursor-not-allowed" :
                        "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 py-1 text-xs text-gray-600">
                    {currentPageSinVentas}/{totalPagesSinVentas}
                  </span>
                  <button
                    onClick={() =>
                      this.handlePageChangeSinVentas(
                        currentPageSinVentas + 1,
                      )
                    }
                    disabled={
                      currentPageSinVentas === totalPagesSinVentas
                    }
                    className={cn(
                      "px-2 py-1 text-xs rounded",
                      currentPageSinVentas === totalPagesSinVentas ?
                        "text-gray-300 cursor-not-allowed" :
                        "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    );
  }

  render() {
    const {
      fechaInicial,
      fechaFinal,
      idSucursal,
      idAlmacen,
      codIso,
      sucursales,
      almacenes,
    } = this.state;

    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title="Reporte Productos"
          subTitle="DASHBOARD"
          handleGoBack={() => this.props.history.goBack()}
        />

        {/* Acciones principales + Toggle vista */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <button
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2",
                "bg-gray-200 text-gray-700 text-sm font-medium rounded",
                "hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition",
              )}
              onClick={this.loadingInit}
            >
              <i className="bi bi-arrow-clockwise"></i>
              Recargar Vista
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-y-4">
          <div>
            <p className="text-gray-600 mt-1">
              Análisis de productos vendidos, ganancias y estado de inventario
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <DatePickerPopover value={fechaInicial} onChange={this.handleChangeFechaInicial} />

            <DatePickerPopover value={fechaFinal} onChange={this.handleChangeFechaFinal} />

            <select
              value={idSucursal}
              onChange={this.handleSelectIdSistema}
              className="px-4 py-2 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">TODOS</option>
              {sucursales.map((item, index) => (
                <option key={index} value={item.idSucursal}>
                  {index + 1 + '.- ' + item.nombre}
                </option>
              ))}
            </select>

            <select
              value={idAlmacen}
              onChange={this.handleSelectIdAlmacen}
              className="px-4 py-2 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">TODOS</option>
              {almacenes.map((item, index) => (
                <option key={index} value={item.idAlmacen}>
                  {index + 1 + '.- ' + item.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-7xl mx-auto py-4">
          {/* Main Products Table */}
          {this.renderProductosVendidos()}

          {/* Detail Products Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Selling Products */}
            {this.renderProductosMasVendidos()}

            {/* Inventory Status */}
            {this.renderEstadoInventario()}

            {/* Category Performance */}
            {this.renderRendimientoCategoria()}
          </div>

          {/* Inventory Management Section */}
          <div className="mt-8 bg-white rounded border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Gestión de Inventario
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Productos que requieren atención por niveles de stock
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Low Inventory Products */}
                {this.renderProductosConBajoInventario()}

                {/* No Sales Products */}
                {this.renderProductosSinVentas()}
              </div>
            </div>
          </div>
        </div>
      </ContainerWrapper>
    );
  }
}

RepProductos.propTypes = {
  token: PropTypes.shape({
    project: PropTypes.shape({
      idSucursal: PropTypes.string,
      nombre: PropTypes.string,
    }),
    userToken: PropTypes.shape({
      usuario: PropTypes.shape({
        idUsuario: PropTypes.string,
      }),
    }),
  }),
  history: PropTypes.object,
  downloadFileAsync: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    moneda: state.predeterminado.moneda,
  };
};

const mapDispatchToProps = { downloadFileAsync };

const ConnectedRepProductos = connect(
  mapStateToProps,
  mapDispatchToProps,
)(RepProductos);

export default ConnectedRepProductos;
