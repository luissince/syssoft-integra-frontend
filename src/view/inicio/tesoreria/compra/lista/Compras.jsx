import ContainerWrapper from '@/components/ui/container-wrapper';
import CustomComponent from '@/components/CustomComponent';
import Paginacion from '@/components/Paginacion';
import {
  formatTime,
  formatNumberWithZeros,
  isEmpty,
  formatCurrency,
  currentDate,
} from '@/helper/utils.helper';
import ErrorResponse from '@/model/class/error-response';
import SuccessReponse from '@/model/class/response';
import { CANCELED } from '@/constants/requestStatus';
import {
  cancelCompra,
  listCompra,
} from '@/network/rest/principal.network';
import { connect } from 'react-redux';
import Title from '@/components/Title';
import PropTypes from 'prop-types';
import Search from '@/components/Search';
import {
  setListaCompraData,
  setListaCompraPaginacion,
} from '@/redux/predeterminadoSlice';
import React from 'react';
import { alertKit } from 'alert-kit';
import { cn } from '@/lib/utils';
import { CONTADO } from '@/model/types/forma-transaccion';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class Compras extends CustomComponent {

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

      fechaInicio: currentDate(),
      fechaFinal: currentDate(),

      buscar: "",

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: "Cargando información...",

      vista: "tabla",

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.usuario.idUsuario,
    };

    this.refSearch = React.createRef();

    this.refPaginacion = React.createRef();

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

  loadingData = async () => {
    const compraLista = this.props.compraLista;

    if (
      compraLista &&
      compraLista.data &&
      compraLista.paginacion
    ) {
      this.setState(compraLista.data);
      this.refPaginacion.current.upperPageBound = compraLista.paginacion.upperPageBound;
      this.refPaginacion.current.lowerPageBound = compraLista.paginacion.lowerPageBound;
      this.refPaginacion.current.isPrevBtnActive = compraLista.paginacion.isPrevBtnActive;
      this.refPaginacion.current.isNextBtnActive = compraLista.paginacion.isNextBtnActive;
      this.refPaginacion.current.pageBound = compraLista.paginacion.pageBound;
      this.refPaginacion.current.paginationMessage = compraLista.paginacion.paginationMessage;

      this.refSearch.current.initialize(compraLista.data.buscar);
    } else {
      await this.loadingInit();
      this.updateReduxState();
    }
  };

  updateReduxState() {
    this.props.setListaCompraData(this.state);
    this.props.setListaCompraPaginacion({
      upperPageBound: this.refPaginacion.current.upperPageBound,
      lowerPageBound: this.refPaginacion.current.lowerPageBound,
      isPrevBtnActive: this.refPaginacion.current.isPrevBtnActive,
      isNextBtnActive: this.refPaginacion.current.isNextBtnActive,
      pageBound: this.refPaginacion.current.pageBound,
      paginationMessage: this.refPaginacion.current.paginationMessage,
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

    await this.setStateAsync({ paginacion: 1, restart: true, buscar: text });
    this.fillTable(1, text.trim());
    await this.setStateAsync({ opcion: 1 });
  };

  async searchOpciones() {
    if (this.state.loading) return;

    if (this.state.fechaInicio > this.state.fechaFinal) return;

    await this.setStateAsync({ paginacion: 1, restart: true });
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
      fechaInicio: this.state.fechaInicio,
      fechaFinal: this.state.fechaFinal,
      idSucursal: this.state.idSucursal,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listCompra(params, this.abortControllerTable.signal);

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


  handleCambiarVista = (value) => {
    this.setState({ vista: value }, () => this.updateReduxState());
  };

  handleCrear = () => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/crear`,
    });
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

  handleDetalle = (idCompra) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/detalle`,
      search: '?idCompra=' + idCompra,
    });
  };

  handleAnular = async (id) => {
    const accept = await alertKit.question({
      title: "Compra",
      message: "¿Está seguro de anular la compra? Esta operación no se puede deshacer.",
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      }
    });

    if (accept) {
      const params = {
        idCompra: id,
        idUsuario: this.state.idUsuario,
      };

      alertKit.loading({
        message: "Procesando petición...",
      });

      const response = await cancelCompra(params);

      if (response instanceof SuccessReponse) {
        alertKit.success({
          title: "Compra",
          message: response.data,
        }, async () => {
          await this.loadingInit();
        });
      }

      if (response instanceof ErrorResponse) {
        if (response.getType() === CANCELED) return;

        alertKit.warning({
          title: "Compra",
          message: response.getMessage(),
        })
      }
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
          <td colSpan={9} className="px-6 py-12 text-center">
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
          <td colSpan={9} className="px-6 py-12 text-center">
            <div className="text-gray-500">
              <i className="bi bi-box text-4xl mb-3 block"></i>
              <p className="text-lg font-medium">No se encontraron ventas</p>
              <p className="text-sm">Intenta cambiar los filtros</p>
            </div>
          </td>
        </tr>
      );
    }

    return this.state.lista.map((item) => {
      const estadoClassName = cn(
        item.estado === 1 ? "bg-green-100 text-green-800" :
          item.estado === 2 ? "bg-yellow-100 text-yellow-800" :
            item.estado === 3 ? "bg-red-100 text-red-800" :
              "bg-blue-100 text-blue-800"
      );

      const estadoValue =
        item.estado === 1 ? "PAGADO" :
          item.estado === 2 ? "POR PAGAR" : "ANULADO";

      const tipo = item.idFormaPago === CONTADO
        ? "CONTADO"
        : "CREDITO"

      return (
        <tr key={item.idCompra} className="hover:bg-gray-50 transition-colors">
          <td className="px-2 py-4 text-sm text-gray-900 text-center">{item.id}</td>
          <td className="px-2 py-4 text-sm text-gray-900">
            {item.fecha}<br />
            <span className="text-xs text-gray-500">{formatTime(item.hora)}</span>
          </td>
          <td className="px-2 py-4 text-sm text-gray-900">
            <div>{item.tipoDocumento} - {item.documento}</div>
            <div className="text-xs text-gray-500">{item.informacion}</div>
          </td>
          <td className="px-2 py-4 text-sm text-gray-900">
            {item.comprobante}<br />
            <span className="font-mono">{item.serie}-{formatNumberWithZeros(item.numeracion)}</span>
          </td>
          <td className="px-2 py-4 text-sm text-gray-900">{tipo}</td>
          <td className="px-2 py-4 text-center">
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                estadoClassName
              )}
            >
              {estadoValue}
            </span>
          </td>
          <td className="px-2 py-4 text-sm font-medium text-gray-900 text-right">
            {formatCurrency(item.total, item.codiso)}
          </td>
          <td className="px-2 py-4 text-center">
            <button
              className={
                cn(
                  "rounded-md transition p-2",
                  "text-blue-600 bg-white",
                  "hover:bg-blue-50 hover:text-blue-700",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  "active:bg-blue-100 active:scale-[0.97]",
                  "disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed",
                )
              }
              title="Ver detalle"
              onClick={() => this.handleDetalle(item.idCompra)}
            >
              <i className="bi bi-eye text-lg"></i>
            </button>
          </td>
          <td className="px-2 py-4 text-center">
            <button
              className={
                cn(
                  "rounded-md transition p-2",
                  "text-red-600 bg-white",
                  "hover:bg-red-50 hover:text-red-700",
                  "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
                  "active:bg-red-100 active:scale-[0.98]",
                  "disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed",
                )
              }
              title="Anular venta"
              onClick={() => this.handleAnular(item.idCompra)}
            >
              <i className="bi bi-trash text-lg"></i>
            </button>
          </td>
        </tr>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
        {
          this.state.lista.map((item) => {
            const estadoClassName = cn(
              item.estado === 1
                ? "bg-green-100 text-green-800"
                : item.estado === 2
                  ? "bg-yellow-100 text-yellow-800"
                  : item.estado === 3
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
            );

            const estadoValue =
              item.estado === 1 ? "PAGADO" :
                item.estado === 2 ? "POR PAGAR" : "ANULADO";

            const tipo = item.idFormaPago === CONTADO
              ? "CONTADO"
              : "CREDITO"

            return (
              <div
                key={item.idCompra}
                className="bg-white rounded border transition group overflow-hidden"
              >
                <div className="flex flex-col gap-2 p-4">
                  <div className="flex justify-between items-start">
                    <h5 className="font-semibold text-gray-900 text-sm">
                      {item.comprobante} {item.serie}-{formatNumberWithZeros(item.numeracion)}
                    </h5>
                    <span className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                      estadoClassName)
                    }>
                      {estadoValue}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Fecha:</span> {item.fecha} {formatTime(item.hora)}
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Tipo Documento:</span> {item.tipoDocumento}
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">N° Documento:</span> {item.documento}
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Información:</span> {item.informacion}
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Tipo:</span> {tipo}
                  </div>

                  <div className="text-lg font-bold text-gray-900 mb-3">
                    {formatCurrency(item.total, item.codiso)}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                    <button
                      className={
                        cn(
                          "p-2 rounded-md text-sm font-medium transition",
                          "text-blue-600 bg-white",
                          "hover:bg-blue-50 hover:text-blue-700",
                          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                          "active:bg-blue-100 active:scale-[0.97]",
                          "disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed",
                        )
                      }
                      onClick={() => this.handleDetalle(item.idCompra)}
                      title="Ver detalle"
                    >
                      <i className="bi bi-eye text-lg" /> Ver
                    </button>

                    <button
                      className={
                        cn(
                          "p-2 rounded-md text-sm font-medium transition",
                          "text-red-600 bg-white",
                          "hover:bg-red-50 hover:text-red-700",
                          "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
                          "active:bg-red-100 active:scale-[0.98]",
                          "disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed",
                        )
                      }
                      onClick={() => this.handleAnular(item.idCompra)}
                      title="Anular"
                    >
                      <i className="bi bi-trash text-lg" /> Anular
                    </button>
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
          title="Compras"
          subTitle="LISTA"
          handleGoBack={() => this.props.history.goBack()}
        />

        {/* Acciones principales + Toggle vista */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <button
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2",
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

        {/* Filtros de fechas, comprobante y estado */}
        <div className="flex flex-col gap-y-4 mb-4">
          <div>
            <p className="text-gray-600 mt-1">
              Puedes ver las Compras echas con diferentes filtros, por ejemplo: fechas de emisión y filtrar.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="date"
              value={this.state.fechaInicio}
              onChange={this.handleInputFechaInico}
              className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <input
              type="date"
              value={this.state.fechaFinal}
              onChange={this.handleInputFechaFinal}
              className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="w-full mb-4">
          <Search
            group={true}
            iconLeft={<i className="bi bi-search text-gray-400"></i>}
            ref={this.refSearch}
            onSearch={this.searchText}
            placeholder="Buscar por comprobante o cliente..."
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">Proveedor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Comprobante</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Tipo</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Estado</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">Total</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">Detalle</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">Anular</th>
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

Compras.propTypes = {
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
  compraLista: PropTypes.shape({
    data: PropTypes.object,
    paginacion: PropTypes.object,
  }),
  setListaCompraData: PropTypes.func,
  setListaCompraPaginacion: PropTypes.func,
  history: PropTypes.object,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    compraLista: state.predeterminado.compraLista,
  };
};

const mapDispatchToProps = { setListaCompraData, setListaCompraPaginacion };

const ConnectedCompras = connect(mapStateToProps, mapDispatchToProps)(Compras);

export default ConnectedCompras;
