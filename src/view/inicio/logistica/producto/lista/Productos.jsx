import {
  isEmpty,
  convertNullText,
  formatCurrency,
} from '@/helper/utils.helper';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Paginacion from '@/components/Paginacion';
import ContainerWrapper from '@/components/ui/container-wrapper';
import CustomComponent from '@/components/CustomComponent';
import {
  deleteProducto,
  listProducto,
} from '@/network/rest/principal.network';
import SuccessReponse from '@/model/class/response';
import ErrorResponse from '@/model/class/error-response';
import { CANCELED } from '@/constants/requestStatus';
import { images } from '@/helper';
import Title from '@/components/Title';
import Image from '@/components/Image';
import Search from '@/components/Search';
import {
  setListaProductoData,
  setListaProductoPaginacion,
} from '@/redux/predeterminadoSlice';
import React from 'react';
import { alertKit } from 'alert-kit';
import { FaStar } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { COMBO, PRODUCTO, SERVICIO } from '@/model/types/tipo-producto';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class Productos extends CustomComponent {

  /**
   * Inicializa un nuevo componente.
   * @param {Object} props - Las propiedades pasadas al componente.
   */
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      lista: [],
      restart: false,

      buscar: "",

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: "Cargando información...",

      codiso: convertNullText(this.props.moneda.codiso),

      vista: "tabla",

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.usuario.idUsuario,
    };

    this.refPaginacion = React.createRef();
    this.refSearch = React.createRef();

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

  async componentDidMount() {
    await this.loadingData();
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

  async loadingData() {
    const productoLista = this.props.productoLista;
    if (productoLista && productoLista.data && productoLista.paginacion) {
      this.setState(productoLista.data);
      this.refPaginacion.current.upperPageBound =
        productoLista.paginacion.upperPageBound;
      this.refPaginacion.current.lowerPageBound =
        productoLista.paginacion.lowerPageBound;
      this.refPaginacion.current.isPrevBtnActive =
        productoLista.paginacion.isPrevBtnActive;
      this.refPaginacion.current.isNextBtnActive =
        productoLista.paginacion.isNextBtnActive;
      this.refPaginacion.current.pageBound =
        productoLista.paginacion.pageBound;
      this.refPaginacion.current.messagePaginacion =
        productoLista.paginacion.messagePaginacion;

      this.refSearch.current.initialize(productoLista.data.buscar);
    } else {
      await this.loadingInit();
      this.updateReduxState();
    }
  }

  updateReduxState() {
    this.props.setListaProductoData(this.state);
    this.props.setListaProductoPaginacion({
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
    this.fillTable(0);
    await this.setStateAsync({ opcion: 0 });
  };

  searchText = async (text) => {
    if (this.state.loading) return;

    if (text.trim().length === 0) return;

    await this.setStateAsync({ paginacion: 1, restart: false, buscar: text });
    this.fillTable(1, text.trim());
    await this.setStateAsync({ opcion: 1 });
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

  fillTable = async (opcion, buscar = "") => {
    this.setState({
      loading: true,
      lista: [],
      messageTable: "Cargando información...",
    });

    const params = {
      opcion: opcion,
      buscar: buscar.trim(),
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listProducto(
      params,
      this.abortControllerTable.signal,
    );

    if (response instanceof SuccessReponse) {
      const totalPaginacion = parseInt(
        String(Math.ceil(Number(response.data.total) / this.state.filasPorPagina)),
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
        messageTable:
          'Se produjo un error interno, intente nuevamente por favor.',
      });
    }
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
    this.setState({ vista: value }, () => this.updateReduxState());
  };

  handleAgregar = async () => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/agregar`,
    });
  };

  handleEditar(idProducto) {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/editar`,
      search: '?idProducto=' + idProducto,
    });
  }

  handleMostrar = (idProducto) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/detalle`,
      search: '?idProducto=' + idProducto,
    });
  };

  handleEliminar = async (idProducto) => {
    const accept = await alertKit.question({
      title: 'Producto',
      message: '¿Estás seguro de eliminar el producto?',
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      alertKit.loading({ message: 'Procesando información...' });

      const params = {
        idProducto: idProducto,
        idUsuario: this.state.idUsuario,
      };

      const response = await deleteProducto(params);

      if (response instanceof ErrorResponse) {
        alertKit.warning({
          title: 'Producto',
          message: response.getMessage(),
        });
        return;
      }

      response instanceof SuccessReponse;

      alertKit.success({
        title: 'Producto',
        message: response.getData(),
      }, () => {
        this.loadingInit();
      });
    }
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

  renderTable() {
    if (this.state.loading) {
      return (
        <tr>
          <td colSpan={11} className="px-6 py-12 text-center">
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
          <td colSpan={11} className="px-6 py-12 text-center">
            <div className="text-gray-500">
              <i className="bi bi-box text-4xl mb-3 block"></i>
              <p className="text-lg font-medium">No se encontraron ventas</p>
              <p className="text-sm">Intenta cambiar los filtros</p>
            </div>
          </td>
        </tr>
      );
    }

    return (
      this.state.lista.map((item) => {
        const tipo = item.idTipoProducto === PRODUCTO ? "PRODUCTO" : item.idTipoProducto === SERVICIO ? "SERVICIO" : item.idTipoProducto === COMBO ? "COMBO" : "ACTIVO FIJO";

        const estadoClass = item.estado === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

        return (
          <tr key={item.idProducto} className="hover:bg-gray-50 transition-colors">
            <td className="px-2 py-4 text-sm text-gray-900 text-center">
              {item.id}
            </td>
            <td className="px-2 py-4 text-sm text-gray-900">
              {tipo}
              <div className="text-sm text-gray-500">{item.venta}</div>
            </td>
            <td className="px-2 py-4">
              <div className="w-full flex justify-center">
                <Image
                  default={images.noImage}
                  src={item.imagen}
                  alt={item.nombre}
                  overrideClass="w-20 h-20 object-contain border border-solid border-[#e2e8f0] rounded"
                />
              </div>
            </td>
            <td className="px-2 py-4">
              <div className="text-sm text-gray-500">
                {item.codigo}
              </div>
              <div className="text-sm font-medium text-gray-900">
                {item.nombre}
              </div>
              {
                item.preferido === 1 && (
                  <div className="mt-1 inline-flex items-center text-yellow-500">
                    <i className="fa fa-star text-base mr-1"></i>
                    <span className="text-base">Preferido</span>
                  </div>
                )
              }
            </td>
            <td className="px-2 py-4 text-sm font-medium text-gray-900 text-right">
              {formatCurrency(item.precio, this.state.codiso)}
            </td>
            <td className="px-2 py-4 text-sm text-gray-900">
              {item.medida}
            </td>
            <td className="px-2 py-4 text-sm text-gray-900">
              {item.categoria}
            </td>
            <td className="px-2 py-4 text-center">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${estadoClass}`}
              >
                {item.estado === 1 ? 'Activo' : 'Inactivo'}
              </span>
            </td>
            <td className="px-2 py-4 text-center">
              <button
                className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-md transition focus:outline-none focus:ring-2 focus:ring-yellow-300"
                title="Editar"
                onClick={() => this.handleEditar(item.idProducto)}
              >
                <i className="bi bi-pencil text-base"></i>
              </button>
            </td>
            <td className="px-2 py-4 text-center">
              <button
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition focus:outline-none focus:ring-2 focus:ring-red-300"
                title="Eliminar"
                onClick={() => this.handleEliminar(item.idProducto)}
              >
                <i className="bi bi-trash text-base"></i>
              </button>
            </td>
          </tr>
        );
      })
    )
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
          this.state.lista.map((item) => {
            const tipo = item.idTipoProducto === PRODUCTO ? "PRODUCTO" : item.idTipoProducto === SERVICIO ? "SERVICIO" : item.idTipoProducto === COMBO ? "COMBO" : "ACTIVO FIJO";

            const estadoClass = item.estado === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

            return (
              <div
                key={item.idProducto}
                className="bg-white rounded border transition group overflow-hidden relative"
              >
                <div className=" bg-white flex items-center justify-center p-2">
                  <Image
                    default={images.noImage}
                    src={item.imagen}
                    alt={item.nombre}
                    overrideClass="w-full h-40 object-contain"
                  />
                </div>

                <div className="absolute right-0 top-0">
                  {item.preferido === 1 && (
                    <FaStar className="w-6 h-6 text-yellow-500 m-2" />
                  )}
                </div>

                <div className="py-2 px-3">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-semibold text-gray-900 line-clamp-2 leading-tight">
                      {item.nombre}
                    </h5>
                  </div>

                  <div className="text-sm text-gray-500 mb-1">
                    <span className="font-medium">Código:</span> {item.codigo}
                  </div>

                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Tipo:</span> {tipo}
                  </div>

                  <div className="text-lg font-bold text-gray-900 mb-2">
                    {formatCurrency(item.precio, this.state.codiso)}
                  </div>

                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Medida:</span> {item.medida}
                  </div>

                  <div className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">Categoría:</span> {item.categoria}
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${estadoClass}`}
                    >
                      {item.estado === 1 ? 'Activo' : 'Inactivo'}
                    </span>

                    <div className="flex gap-1">
                      <button
                        className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-md transition focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        title="Editar"
                        onClick={() => this.handleEditar(item.idProducto)}
                      >
                        <i className="bi bi-pencil text-lg"></i>
                      </button>
                      <button
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition focus:outline-none focus:ring-2 focus:ring-red-300"
                        title="Eliminar"
                        onClick={() => this.handleEliminar(item.idProducto)}
                      >
                        <i className="bi bi-trash text-lg"></i>
                      </button>
                    </div>
                  </div>
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
        {/* Encabezado */}
        <Title
          title="Productos"
          subTitle="Gestión de productos"
          handleGoBack={() => this.props.history.goBack()}
        />

        {/* Acciones principales + Toggle vista */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
              onClick={this.handleAgregar}
            >
              <i className="bi bi-file-plus"></i>
              Nuevo Registro
            </button>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition"
              onClick={this.loadingInit}
            >
              <i className="bi bi-arrow-clockwise"></i>
              Recargar Vista
            </button>
          </div>

          {/* Toggle vista */}
          <div className="flex bg-gray-100 rounded p-1">
            <button
              onClick={() => this.handleChangeView("tabla")}
              className={cn(
                "flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition flex items-center justify-center gap-1",
                vista === "tabla" ? "bg-white text-blue-600" : "text-gray-600 hover:text-gray-800"
              )}
            >
              <i className="bi bi-list-ul"></i>
              <span className="hidden sm:inline">Tabla</span>
            </button>
            <button
              onClick={() => this.handleChangeView("cuadricula")}
              className={cn(
                "flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition flex items-center justify-center gap-1",
                vista === "cuadricula" ? "bg-white text-blue-600" : "text-gray-600 hover:text-gray-800"
              )}
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
              Puedes ver los productos con diferentes filtros
            </p>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="w-full mb-4">
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
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">#</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Tipo</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Imagen</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">Nombre</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Precio</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Medida</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Categoría</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">Estado</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">Editar</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">Eliminar</th>
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
      </ContainerWrapper>
    );
  }

}

Productos.propTypes = {
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
  productoLista: PropTypes.shape({
    data: PropTypes.object,
    paginacion: PropTypes.object,
  }),
  setListaProductoData: PropTypes.func,
  setListaProductoPaginacion: PropTypes.func,
  history: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  location: PropTypes.object,
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    moneda: state.predeterminado.moneda,
    productoLista: state.predeterminado.productoLista,
  };
};

const mapDispatchToProps = { setListaProductoData, setListaProductoPaginacion };

const ConnectedProductos = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Productos);

export default ConnectedProductos;
