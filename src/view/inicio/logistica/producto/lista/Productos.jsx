import {
  isEmpty,
  convertNullText,
  formatCurrency,
} from '../../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Paginacion from '../../../../../components/Paginacion';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '@/components/CustomComponent';
import {
  deleteProducto,
  listProducto,
} from '../../../../../network/rest/principal.network';
import { CANCELED } from '../../../../../model/types/types';
import { images } from '../../../../../helper';
import Title from '../../../../../components/Title';
import Image from '../../../../../components/Image';
import Search from '../../../../../components/Search';
import {
  setListaProductoData,
  setListaProductoPaginacion,
} from '../../../../../redux/predeterminadoSlice';
import React from 'react';
import { alertKit } from 'alert-kit';
import { Pencil, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { productTypeOptions, productTypeMap } from '@/model/types/tipo-producto';

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

      idTipoProducto: "",
      estado: "",
      preferido: "",
      publicarTienda: "",
      buscar: '',

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',

      codiso: convertNullText(this.props.moneda.codiso),

      view: 'tabla',

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
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
  | componente en consecuencia. El método loadData puede ser responsable de realizar peticiones asíncronas
  | para obtener los datos iniciales y luego actualizar el estado del componente una vez que los datos han sido
  | recuperados. La función loadData puede ser invocada en el montaje inicial del componente para asegurarse
  | de que los datos requeridos estén disponibles antes de renderizar el componente en la interfaz de usuario.
  |
  */

  async loadData() {
    const productoLista = this.props.productoLista;
    if (
      productoLista &&
      productoLista.data &&
      productoLista.paginacion
    ) {
      this.setState(productoLista.data);
      this.refPaginacion.current.upperPageBound = productoLista.paginacion.upperPageBound;
      this.refPaginacion.current.lowerPageBound = productoLista.paginacion.lowerPageBound;
      this.refPaginacion.current.isPrevBtnActive = productoLista.paginacion.isPrevBtnActive;
      this.refPaginacion.current.isNextBtnActive = productoLista.paginacion.isNextBtnActive;
      this.refPaginacion.current.pageBound = productoLista.paginacion.pageBound;
      this.refPaginacion.current.messagePaginacion = productoLista.paginacion.messagePaginacion;

      this.refSearch.current.initialize(productoLista.data.buscar);
    } else {
      await this.loadInit();
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
    this.fillTable(1, text.trim());
    await this.setStateAsync({ opcion: 1 });
  };

  async searchOpciones() {
    if (this.state.loading) return;

    await this.setStateAsync({ paginacion: 1, restart: false });
    this.fillTable(2);
    await this.setStateAsync({ opcion: 2 });
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
      default:
        this.fillTable(0);
    }
  };

  fillTable = async (opcion, buscar = '') => {
    await this.setStateAsync({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const params = {
      opcion: opcion,
      idTipoProducto: this.state.idTipoProducto,
      estado: this.state.estado,
      preferido: this.state.preferido,
      publicarTienda: this.state.publicarTienda,
      buscar: buscar.trim(),
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const { success, data, message, type } = await listProducto(
      params,
      this.abortControllerTable.signal,
    );

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
      String(Math.ceil(Number(data.total) / this.state.filasPorPagina)),
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

  handleSelectTipoProducto = (event) => {
    this.setState({ idTipoProducto: event.target.value }, () => {
      this.searchOpciones();
    });
  };

  handleSelectEstado = (event) => {
    this.setState({ estado: event.target.value }, () => {
      this.searchOpciones();
    });
  };

  handleSelectPreferido = (event) => {
    this.setState({ preferido: event.target.value }, () => {
      this.searchOpciones();
    });
  };

  handleSelectPublicarTienda = (event) => {
    this.setState({ publicarTienda: event.target.value }, () => {
      this.searchOpciones();
    });
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

      const { success, data, message } = await deleteProducto(params);

      if (!success) {
        alertKit.warning({
          title: 'Producto',
          message: message,
        });
        return;
      }

      alertKit.success({
        title: 'Producto',
        message: data,
      }, () => {
        this.loadInit();
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
            const tipoProducto = productTypeMap.get(item.idTipoProducto);
            const Icon = tipoProducto.icon;

            const estado = (
              <span
                className={cn(
                  "inline-flex items-center rounded-full",
                  "text-xs font-medium px-2.5 py-0.5",
                  item.estado === 1
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                )}
              >
                {item.estado === 1 ? "ACTIVO" : "INACTIVO"}
              </span>
            );

            return (
              <div
                key={index}
                className={cn(
                  "text-sm text-gray-900",
                  view === "tabla"
                    ? "grid grid-cols-[0.5fr_1fr_1fr_2fr_1.3fr_1.1fr_1.1fr_0.7fr_1.4fr] py-3 gap-x-3 items-center"
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
                    <div className="flex items-center gap-2 px-2 py-1 rounded text-xs font-medium bg-green-300">
                      <Icon size={19} />
                      {tipoProducto.label}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-center">
                      <Image
                        default={images.noImage}
                        src={item.imagen}
                        alt={item.nombre}
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
                      {item.nombre}
                    </div>

                    {item.preferido === 1 && (
                      <div className="mt-1 inline-flex items-center text-yellow-500">
                        <i className="fa fa-star text-base mr-1"></i>
                        <span>Preferido</span>
                      </div>
                    )}
                  </div>

                  <div>
                    {formatCurrency(item.precio, this.state.codiso)}
                  </div>

                  <div>
                    {item.medida}
                  </div>

                  <div>
                    {item.categoria}
                  </div>

                  <div className={cn(
                    "text-center",
                    view === "tabla" ? "text-center" : "text-left"
                  )}>
                    {estado}
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
                    onClick={() => this.handleEditar(item.idProducto)}
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
                    <Pencil className="w-5 h-5 text-yellow-600" />
                  </button>

                  <button
                    onClick={() => this.handleEliminar(item.idProducto)}
                    className={cn(
                      "inline-flex items-center justify-center gap-2",
                      "px-3 py-2",
                      "transition rounded",
                      "bg-gray-100 text-gray-600 text-sm font-medium",
                      "hover:bg-gray-300",
                      "focus:outline focus:ring-2 focus:ring-gray-400",
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
      </div>
    );
  }

  render() {
    const { view } = this.state;

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
              onClick={this.handleAgregar}
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
              Puedes ver los productos con diferentes filtros
            </p>
          </div>
        </div>

        {/* Filtros de fechas, comprobante y estado */}
        <div className="flex flex-col gap-y-4 mb-4">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Comprobante */}
            <select
              value={this.state.idTipoProducto}
              onChange={this.handleSelectTipoProducto}
              className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">- TIPO PRODUCTO -</option>
              {productTypeOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            {/* Estado */}
            <select
              value={this.state.estado}
              onChange={this.handleSelectEstado}
              className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">- ESTADO -</option>
              <option value="1">ACTIVO</option>
              <option value="0">INACTIVO</option>
            </select>

            {/* Estado */}
            <select
              value={this.state.preferido}
              onChange={this.handleSelectPreferido}
              className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">- PREFERIDOS -</option>
              <option value="1">SI</option>
              <option value="0">NO</option>
            </select>

            {/* Estado */}
            <select
              value={this.state.publicarTienda}
              onChange={this.handleSelectPublicarTienda}
              className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">- PUBLICADO EN TIENDA VIRTUAL -</option>
              <option value="1">SI</option>
              <option value="0">NO</option>
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
              <div className="grid grid-cols-[0.5fr_1fr_1fr_2fr_1.3fr_1.1fr_1.1fr_0.7fr_1.4fr] gap-x-3 py-3">
                <div className="text-center">#</div>
                <div className="text-center">Tipo</div>
                <div className="text-center">Imagen</div>
                <div>Nombre</div>
                <div>Precio</div>
                <div>Medida</div>
                <div>Categoría</div>
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

Productos.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string.isRequired,
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
