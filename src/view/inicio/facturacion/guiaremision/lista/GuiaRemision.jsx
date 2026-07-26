import React from 'react';
import PropTypes from 'prop-types';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '@/components/CustomComponent';
import {
  currentDate,
  formatNumberWithZeros,
  formatTime,
  isEmpty,
} from '../../../../../helper/utils.helper';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import SuccessReponse from '../../../../../model/class/response';
import {
  cancelGuiaRemision,
  listGuiaRemision,
} from '../../../../../network/rest/principal.network';
import { connect } from 'react-redux';
import Title from '../../../../../components/Title';
import Search from '../../../../../components/Search';
import Paginacion from '../../../../../components/Paginacion';
import {
  setListaGuiaRemisionData,
  setListaGuiaRemisionPaginacion,
} from '../../../../../redux/predeterminadoSlice';
import { alertKit } from 'alert-kit';
import { cn } from '@/lib/utils';
import { MOTIVO_TRASLADO } from '@/model/types/motivo-traslado';
import { Eye, Pencil, Trash } from 'lucide-react';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class GuiaRemision extends CustomComponent {
  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      lista: [],
      restart: false,

      fechaInicio: currentDate(),
      fechaFinal: currentDate(),
      estado: '-1',

      buscar: '',

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',

      view: "tabla",

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
  | componente en consecuencia. El método loadData puede ser responsable de realizar peticiones asíncronas
  | para obtener los datos iniciales y luego actualizar el estado del componente una vez que los datos han sido
  | recuperados. La función loadData puede ser invocada en el montaje inicial del componente para asegurarse
  | de que los datos requeridos estén disponibles antes de renderizar el componente en la interfaz de usuario.
  |
  */

  loadData = async () => {
    const guiaRemisionLista = this.props.guiaRemisionLista;
    if (
      guiaRemisionLista &&
      guiaRemisionLista.data &&
      guiaRemisionLista.paginacion
    ) {
      this.setState(guiaRemisionLista.data);
      this.refPaginacion.current.upperPageBound = guiaRemisionLista.paginacion.upperPageBound;
      this.refPaginacion.current.lowerPageBound = guiaRemisionLista.paginacion.lowerPageBound;
      this.refPaginacion.current.isPrevBtnActive = guiaRemisionLista.paginacion.isPrevBtnActive;
      this.refPaginacion.current.isNextBtnActive = guiaRemisionLista.paginacion.isNextBtnActive;
      this.refPaginacion.current.pageBound = guiaRemisionLista.paginacion.pageBound;
      this.refPaginacion.current.messagePaginacion = guiaRemisionLista.paginacion.messagePaginacion;

      this.refSearch.current.initialize(
        guiaRemisionLista.data.buscar,
      );
    } else {
      await this.loadInit();
      this.updateReduxState();
    }
  };

  updateReduxState() {
    this.props.setListaGuiaRemisionData(this.state);
    this.props.setListaGuiaRemisionPaginacion({
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
    this.setState({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const params = {
      opcion: opcion,
      buscar: buscar,
      idSucursal: this.state.idSucursal,
      fechaInicio: this.state.fechaInicio,
      fechaFinal: this.state.fechaFinal,
      estado: this.state.estado,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listGuiaRemision(
      params,
      this.abortControllerTable.signal,
    );

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
  handleChangeView(value) {
    this.setState({ view: value }, () => this.updateReduxState());
  };

  handleCrear = () => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/crear`,
    });
  };

  handleEditar = (idGuiaRemision) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/editar`,
      search: '?idGuiaRemision=' + idGuiaRemision,
    });
  };

  handleDetalle = (idGuiaRemision) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/detalle`,
      search: '?idGuiaRemision=' + idGuiaRemision,
    });
  };

  handleAnular = async (idGuiaRemision) => {
    const accept = await alertKit.question({
      title: 'Guia Remisión',
      message: '¿Estás seguro de anular la guía de remisión?',
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      const params = {
        idGuiaRemision: idGuiaRemision,
      };

      alertKit.loading({
        message: 'Procesando información...',
      });

      const response = await cancelGuiaRemision(params);

      if (response instanceof SuccessReponse) {
        alertKit.success({
          title: 'Guia Remisión',
          message: response.data,
        }, async () => {
          await this.loadInit();
        });
      }

      if (response instanceof ErrorResponse) {
        if (response.getType() === CANCELED) return;

        alertKit.warning({
          title: 'Guia Remisión',
          message: response.getMessage(),
        });
      }
    }

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

  handleSelectEstado = (event) => {
    this.setState({ estado: event.target.value }, () => {
      this.searchOpciones();
    });
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
                item.estado === 0 && "bg-red-100 text-red-800",
              )}>
                {item.estado === 1 ? "ACTIVO" : "ANULADO"}
              </span>
            );

            return (
              <div
                key={index}
                className={cn(
                  "text-sm text-gray-900",
                  view === "tabla"
                    ? "grid grid-cols-[0.5fr_1fr_1.5fr_1.5fr_1.0fr_1.0fr_0.5fr_1.5fr] py-3 gap-x-3 items-center"
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
                    {item.fecha} <br />
                    <span className="text-xs text-gray-500">{formatTime(item.hora)}</span>
                  </div>

                  <div>
                    {item.tipoDocumento} - {item.documento}
                    <br />
                    {item.informacion}
                  </div>

                  <div>
                    {item.comprobante}
                    <br />
                    {item.serie}-{formatNumberWithZeros(item.numeracion)}
                  </div>

                  <div>
                    {item.motivoTraslado}
                  </div>

                  <div>
                    {
                      item.idMotivoTraslado === MOTIVO_TRASLADO.VENTA ? (
                        <>
                          {item.comprobanteRef}
                          <br />
                          {item.serieRef}-{formatNumberWithZeros(item.numeracionRef)}</>
                      ) :
                        (
                          <></>
                        )
                    }
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
                    onClick={() => this.handleDetalle(item.idGuiaRemision)}
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
                  <button
                    onClick={() => this.handleEditar(item.idGuiaRemision)}
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
                    <Pencil className="w-5 h-5 text-yellow-500" />
                  </button>
                  <button
                    onClick={() => this.handleAnular(item.idGuiaRemision)}
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
      </div>
    );
  }

  render() {
    const { view } = this.state;

    return (
      <ContainerWrapper>
        <Title
          title="Guía de Remisión"
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
              onClick={this.handleCrear}
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
            Puedes ver todos las guías de remisión con diferentes filtros.
          </p>
        </div>

        {/* Filtros de fechas, comprobante y estado */}
        <div className="flex flex-col gap-y-4 mb-4">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Fecha Inicio */}
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
            {/* Estado */}
            <select
              value={this.state.estado}
              onChange={this.handleSelectEstado}
              className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="-1">TODOS</option>
              <option value="1">ACTIVO</option>
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
            placeholder="Filtrar por tipo/motivo de traslado..."
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
              <div className="grid grid-cols-[0.5fr_1fr_1.5fr_1.5fr_1.0fr_1.0fr_0.5fr_1.5fr] gap-x-3 py-3">
                <div className="text-center">#</div>
                <div>Fecha y Hora</div>
                <div>Cliente</div>
                <div>Comprobante</div>
                <div>Motivo Traslado</div>
                <div>Referencia</div>
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

GuiaRemision.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string.isRequired,
    }).isRequired,
    project: PropTypes.shape({
      idSucursal: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  guiaRemisionLista: PropTypes.shape({
    data: PropTypes.object,
    paginacion: PropTypes.object,
  }),
  setListaGuiaRemisionData: PropTypes.func,
  setListaGuiaRemisionPaginacion: PropTypes.func,
  history: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  location: PropTypes.object,
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    guiaRemisionLista: state.predeterminado.guiaRemisionLista,
  };
};

const mapDispatchToProps = {
  setListaGuiaRemisionData,
  setListaGuiaRemisionPaginacion,
};

const ConnectedGuiaRemision = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GuiaRemision);

export default ConnectedGuiaRemision;
