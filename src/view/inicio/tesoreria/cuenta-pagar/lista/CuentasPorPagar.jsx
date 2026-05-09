import {
  formatNumberWithZeros,
  isEmpty,
  formatCurrency,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import Paginacion from '../../../../../components/Paginacion';
import ContainerWrapper from '../../../../../components/ui/container-wrapper';
import { listAccountsPayableCompra } from '../../../../../network/rest/principal.network';
import { CANCELED } from '@/constants/requestStatus';
import CustomComponent from '@/components/CustomComponent';
import Title from '../../../../../components/Title';
import PropTypes from 'prop-types';
import Search from '../../../../../components/Search';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class CuentasPorPagar extends CustomComponent {
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

      tipo: "only",
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

    this.peticion = false;
    this.abortController = null;
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
    if (!this.peticion) {
      if (this.abortController) {
        this.abortController.abort();
      }
    }
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
    this.abortController = new AbortController();

    this.setState({
      loading: true,
      lista: [],
      messageTable: "Cargando información...",
    });

    const params = {
      opcion: opcion,
      tipo: this.state.tipo,
      buscar: buscar,
      idSucursal: this.state.idSucursal,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const { success, data, message, type } = await listAccountsPayableCompra(params, this.abortController.signal);

    if (!success) {
      if (type === CANCELED) return;

      this.peticion = false;
      this.abortController = null;

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

    this.peticion = true;
    this.abortController = null;

    this.setState({
      loading: false,
      lista: data.result,
      totalPaginacion: totalPaginacion,
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

  handleCambiarVista = (value) => {
    this.setState({ vista: value });
  };

  handlePago = (idCompra) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/detalle`,
      search: '?idCompra=' + idCompra,
    });
  };

  handleSelecTipo = (event) => {
    this.setState({ tipo: event.target.value }, () => {
      this.loadingInit();
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

  renderTable() {
    if (this.state.loading) {
      return (
        <tr>
          <td colSpan={8} className="px-6 py-12 text-center">
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
          <td colSpan={8} className="px-6 py-12 text-center">
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
      return (
        <tr key={item.idCompra} className="hover:bg-gray-50 transition-colors">
          <td className="px-2 py-4 text-sm text-gray-900 text-center">
            {item.id}
          </td>
          <td className="px-2 py-4 text-sm text-gray-900">
            {item.comprobante}<br />
            <span className="font-mono">{item.serie}-{formatNumberWithZeros(item.numeracion)}</span>
          </td>
          <td className="px-2 py-4 text-sm text-gray-900">
            <div>{item.tipoDocumento} - {item.documento}</div>
            <div className="text-xs text-gray-500">{item.informacion}</div>
          </td>
          <td className="px-2 py-4 text-sm text-gray-900">
            <div>{item.plazo}</div>
            <div className="text-xs text-gray-500">
              F.V - {item.fechaVencimiento}
            </div>
          </td>

          <td className="px-2 py-4 text-sm text-green-500 text-center">
            {formatCurrency(item.total, item.codiso)}
          </td>
          <td className="px-2 py-4 text-sm text-red-500 text-center">
            {formatCurrency(item.pagado, item.codiso)}
          </td>
          <td className="px-2 py-4 text-sm text-gray-900 text-center">
            {formatCurrency(item.total - item.pagado, item.codiso)}
          </td>


          <td className="px-2 py-4 text-center">
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
              title="Detalle"
              onClick={() => this.handlePago(item.idCompra)}
            >
              <i className="fa fa-calendar-check-o text-lg"></i>
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
                    <span className="font-medium">Plaza:</span>
                    <div>{item.plazo}</div>
                    <div className="text-xs text-gray-500">
                      F.V - {item.fechaVencimiento}
                    </div>
                  </div>

                  <div className="text-lg font-bold text-gray-900 mb-3">
                    <span className="font-medium">Total:</span> {formatCurrency(item.total, item.codiso)}
                  </div>
                  <div className="text-lg font-bold text-gray-900 mb-3">
                    <span className="font-medium">Pagado:</span>  {formatCurrency(item.pagado, item.codiso)}
                  </div>
                  <div className="text-lg font-bold text-gray-900 mb-3">
                    <span className="font-medium">Por Pagar:</span> {formatCurrency(item.total - item.pagado, item.codiso)}
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
                      onClick={() => this.handlePago(item.idCompra)}
                      title="Detalle"
                    >
                      <i className="bi bi-eye text-lg" /> Pagar
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
        <Title
          title="Cuentas por Pagar"
          subTitle="LISTA"
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
              Puedes ver las Compras al crédito echas con diferentes filtros, por ejemplo: fechas de emisión y filtrar.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              value={this.state.tipo}
              onChange={this.handleSelecTipo}
              className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="only">Mostrar compras al crédito</option>
              <option value="all">Mostrar todas las compras al crédito</option>
            </select>
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
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">#</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Comprobante</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[18%]">Proveedor</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">Plazo</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Total</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Pagado</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Por Pagar</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%] text-center">Pagar</th>
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

CuentasPorPagar.propTypes = {
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
  history: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  location: PropTypes.object,
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedCuentasPorPagar = connect(
  mapStateToProps,
  null,
)(CuentasPorPagar);

export default ConnectedCuentasPorPagar;
