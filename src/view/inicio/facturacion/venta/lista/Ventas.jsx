import React from 'react';
import {
  numberFormat,
  formatTime,
  alertDialog,
  alertSuccess,
  alertWarning,
  isEmpty,
  formatNumberWithZeros,
  alertInfo,
  currentDate,
  getPathNavigation,
  getStatePrivilegio,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import Paginacion from '../../../../../components/Paginacion';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import PropTypes from 'prop-types';
import {
  cancelVenta,
  comboComprobante,
  listVenta,
} from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import {
  CONTADO,
  CREDITO_FIJO,
  CREDITO_VARIABLE,
} from '../../../../../model/types/forma-pago';
import Title from '../../../../../components/Title';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableResponsive,
  TableRow,
} from '../../../../../components/Table';
import { SpinnerTable, SpinnerView } from '../../../../../components/Spinner';
import { VENTA } from '../../../../../model/types/tipo-comprobante';
import ModalElegirInterfaz from './component/ModalElejirInterfaz';
import Button from '../../../../../components/Button';
import {
  setListaVentaData,
  setListaVentaPaginacion,
} from '../../../../../redux/predeterminadoSlice';
import Input from '../../../../../components/Input';
import Select from '../../../../../components/Select';
import Search from '../../../../../components/Search';
import { Link } from 'react-router-dom';
import {
  ANULAR_VENTA,
  FACTURACION,
  REALIZAR_VENTA,
  VENTAS,
  VISUALIZAR_VENTA,
} from '../../../../../model/types/menu';

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
      view: getStatePrivilegio(
        this.props.token.userToken.menus,
        FACTURACION,
        VENTAS,
        VISUALIZAR_VENTA,
      ),
      remove: getStatePrivilegio(
        this.props.token.userToken.menus,
        FACTURACION,
        VENTAS,
        ANULAR_VENTA,
      ),

      vista: 'tabla',

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
    await this.loadingData();
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

  loadingData = async () => {
    if (
      this.props.ventaLista &&
      this.props.ventaLista.data &&
      this.props.ventaLista.paginacion
    ) {
      this.setState(this.props.ventaLista.data);
      this.refPaginacion.current.upperPageBound =
        this.props.ventaLista.paginacion.upperPageBound;
      this.refPaginacion.current.lowerPageBound =
        this.props.ventaLista.paginacion.lowerPageBound;
      this.refPaginacion.current.isPrevBtnActive =
        this.props.ventaLista.paginacion.isPrevBtnActive;
      this.refPaginacion.current.isNextBtnActive =
        this.props.ventaLista.paginacion.isNextBtnActive;
      this.refPaginacion.current.pageBound =
        this.props.ventaLista.paginacion.pageBound;
      this.refPaginacion.current.messagePaginacion =
        this.props.ventaLista.paginacion.messagePaginacion;

      this.refSearch.current.initialize(this.props.ventaLista.data.buscar);
    } else {
      const [comprobantes] = await Promise.all([this.fetchComprobante(VENTA)]);

      this.setState({
        comprobantes,
        initialLoad: false,
      }, async () => {
        await this.loadingInit();
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

  loadingInit = async () => {
    if (!this.state.view) return;

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
      opcion,
      buscar: buscar.trim(),
      fechaInicio: this.state.fechaInicio,
      fechaFinal: this.state.fechaFinal,
      idComprobante: this.state.idComprobante,
      estado: this.state.estado,
      idSucursal: this.state.idSucursal,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listVenta(params, this.abortControllerTable.signal);

    if (response instanceof SuccessReponse) {
      const totalPaginacion = parseInt(
        Math.ceil(parseFloat(response.data.total) / this.state.filasPorPagina),
      );

      this.setState(
        {
          loading: false,
          lista: response.data.result,
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
    this.setState({ vista: value });
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

  handleCancelar(idVenta) {
    if (!this.state.remove) {
      alertWarning('Venta', 'No tiene privilegios para anular ventas');
      return;
    }

    alertDialog(
      'Venta',
      '¿Está seguro de que desea anular la venta? Esta operación no se puede deshacer.',
      async (accept) => {
        if (accept) {
          const params = {
            idVenta: idVenta,
            idUsuario: this.state.idUsuario,
          };

          alertInfo('Venta', 'Procesando información...');

          const response = await cancelVenta(params);

          if (response instanceof SuccessReponse) {
            alertSuccess('Venta', response.data, () => {
              this.loadingInit();
            });
          }

          if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            alertWarning('Venta', response.getMessage());
          }
        }
      },
    );
  }

  //------------------------------------------------------------------------------------------
  // Procesos Elegir Interfaz
  //------------------------------------------------------------------------------------------

  handleOpenElegirInterfaz = () => {
    if (!this.state.create) {
      alertWarning('Venta', 'No tiene privilegios para crear ventas');
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

  generateBody() {
    if (this.state.loading) {
      return (
        <SpinnerTable
          colSpan="10"
          message="Cargando información de la tabla..."
        />
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <TableRow>
          <TableCell className="text-center" colSpan="10">
            ¡No hay datos registrados!
          </TableCell>
        </TableRow>
      );
    }

    return this.state.lista.map((item, index) => {
      const estado =
        item.estado === 1 ? (
          <span className="text-success">COBRADO</span>
        ) : item.estado === 2 ? (
          <span className="text-warning">POR COBRAR</span>
        ) : item.estado === 3 ? (
          <span className="text-danger">ANULADO</span>
        ) : (
          <span className="text-primary">POR LLEVAR</span>
        );

      const tipo =
        item.idFormaPago === CONTADO
          ? 'CONTADO'
          : item.idFormaPago === CREDITO_FIJO
            ? 'CREDITO FIJO'
            : item.idFormaPago === CREDITO_VARIABLE
              ? 'CRÉDITO VARIABLE'
              : 'PAGO ADELTANDO';

      return (
        <TableRow key={index}>
          <TableCell className={`text-center`}>{item.id}</TableCell>
          <TableCell>
            {item.fecha}
            <br />
            {formatTime(item.hora)}
          </TableCell>
          <TableCell>
            {item.tipoDocumento} - {item.documento}
            <br />
            {item.informacion}
          </TableCell>
          <TableCell>
            {item.comprobante}
            <br />
            {item.serie + '-' + formatNumberWithZeros(item.numeracion)}
          </TableCell>
          <TableCell>{tipo}</TableCell>
          <TableCell className="text-center">{estado}</TableCell>
          <TableCell className="text-center">
            {' '}
            {numberFormat(item.total, item.codiso)}{' '}
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-info btn-sm"
              onClick={() => this.handleDetalle(item.idVenta)}
            // disabled={!this.state.view}
            >
              <i className="fa fa-eye"></i>
            </Button>
          </TableCell>
          <TableCell className="text-center">
            {item.guiaRemision === 1 && (
              <span className="btn btn-outline-success btn-sm">
                <i className="fa fa-check"></i>
              </span>
            )}

            {item.guiaRemision === 0 && (
              <Link
                to={getPathNavigation('guia-create', item.idVenta)}
                className="btn btn-outline-secondary btn-sm"
              >
                <i className="fa fa-truck"></i>
              </Link>
            )}
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-danger btn-sm"
              onClick={() => this.handleCancelar(item.idVenta)}
              disabled={!this.state.remove}
            >
              <i className="fa fa-remove"></i>
            </Button>
          </TableCell>
        </TableRow>
      );
    });
  }

  render() {
    const { vista } = this.state;

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
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
              onClick={this.handleOpenElegirInterfaz}
              disabled={!this.state.create}
              aria-label="Crear nueva venta"
            >
              <i className="bi bi-file-plus"></i>
              Nuevo Registro
            </button>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition"
              onClick={this.loadingInit}
            >
              <i className="bi bi-arrow-clockwise"></i>
              Recargar Vista
            </button>
          </div>

          {/* Toggle vista */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => this.handleChangeView('tabla')}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition flex items-center justify-center gap-1 ${vista === 'tabla'
                ? 'bg-white text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <i className="bi bi-list-ul"></i>
              <span className="hidden sm:inline">Tabla</span>
            </button>
            <button
              onClick={() => this.handleChangeView('cuadricula')}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition flex items-center justify-center gap-1 ${vista === 'cuadricula'
                ? 'bg-white text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <i className="bi bi-grid-3x3"></i>
              <span className="hidden sm:inline">Cuadrícula</span>
            </button>
          </div>
        </div>

        {/* Filtros de fechas, comprobante y estado */}
        <div className="mb-6 bg-white rounded-xl border p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio
              </label>
              <Input
                type="date"
                value={this.state.fechaInicio}
                onChange={this.handleInputFechaInico}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Final
              </label>
              <Input
                type="date"
                value={this.state.fechaFinal}
                onChange={this.handleInputFechaFinal}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comprobante
              </label>
              <Select
                value={this.state.idComprobante}
                onChange={this.handleSelectComprobante}
                className="w-full"
              >
                <option value="">TODOS</option>
                {this.state.comprobantes.map((item) => (
                  <option key={item.idComprobante} value={item.idComprobante}>
                    {item.nombre} - {item.serie}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <Select
                value={this.state.estado}
                onChange={this.handleSelectEstado}
                className="w-full"
              >
                <option value="0">TODOS</option>
                <option value="1">COBRADO</option>
                <option value="2">POR COBRAR</option>
                <option value="3">ANULADO</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-6 bg-white rounded-xl border p-4">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar venta(s)
            </label>
            <Search
              group={true}
              iconLeft={<i className="bi bi-search text-gray-400"></i>}
              ref={this.refSearch}
              onSearch={this.searchText}
              placeholder="Buscar por comprobante o cliente..."
              theme="modern"
            />
          </div>
        </div>

        {/* Render condicional: Tabla o Cuadrícula */}
        {vista === 'tabla' ? (
          /* 📊 Vista Tabla */
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Comprobante</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Tipo</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-20 text-center">Estado</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-24 text-right">Total</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-16 text-center">Detalle</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-16 text-center">Guía</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-16 text-center">Anular</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {this.state.loading ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                          <p className="text-gray-500">Cargando información...</p>
                        </div>
                      </td>
                    </tr>
                  ) : isEmpty(this.state.lista) ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <i className="bi bi-box text-4xl mb-3 block text-gray-400"></i>
                          <p className="text-lg font-medium">No se encontraron ventas</p>
                          <p className="text-sm">Intenta cambiar los filtros</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    this.state.lista.map((item) => {
                      const estado = item.estado === 1
                        ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">COBRADO</span>
                        : item.estado === 2
                          ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">POR COBRAR</span>
                          : item.estado === 3
                            ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">ANULADO</span>
                            : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">POR LLEVAR</span>;

                      const tipo = item.idFormaPago === CONTADO
                        ? 'CONTADO'
                        : item.idFormaPago === CREDITO_FIJO
                          ? 'CRÉDITO FIJO'
                          : item.idFormaPago === CREDITO_VARIABLE
                            ? 'CRÉDITO VARIABLE'
                            : 'PAGO ADELANTADO';

                      return (
                        <tr key={item.idVenta} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900 text-center">{item.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.fecha}<br />
                            <span className="text-xs text-gray-500">{formatTime(item.hora)}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div>{item.tipoDocumento} - {item.documento}</div>
                            <div className="text-xs text-gray-500">{item.informacion}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.comprobante}<br />
                            <span className="font-mono">{item.serie}-{formatNumberWithZeros(item.numeracion)}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{tipo}</td>
                          <td className="px-6 py-4 text-center">{estado}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                            {numberFormat(item.total, item.codiso)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                              title="Ver detalle"
                              onClick={() => this.handleDetalle(item.idVenta)}
                              disabled={!this.state.view}
                            >
                              <i className="fa fa-eye text-lg"></i>
                            </button>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {item.guiaRemision === 1 ? (
                              <span className="p-1.5 text-green-600 bg-green-50 rounded-md" title="Guía generada">
                                <i className="fa fa-check text-lg"></i>
                              </span>
                            ) : (
                              <Link
                                to={getPathNavigation('guia-create', item.idVenta)}
                                className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-md transition focus:outline-none focus:ring-2 focus:ring-gray-300"
                                title="Generar guía"
                              >
                                <i className="fa fa-truck text-lg"></i>
                              </Link>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition focus:outline-none focus:ring-2 focus:ring-red-300"
                              title="Anular venta"
                              onClick={() => this.handleCancelar(item.idVenta)}
                              disabled={!this.state.remove}
                            >
                              <i className="fa fa-trash text-lg"></i>
                            </button>
                          </td>
                        </tr>
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
              className="md:px-4 py-3 bg-white border-t border-gray-200 overflow-auto"
              theme="modern"
            />
          </div>
        ) : (
          /* 🟦 Vista Cuadrícula */
          <div className="space-y-6">
            {this.state.loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : isEmpty(this.state.lista) ? (
              <div className="text-center py-16 bg-white rounded-xl border">
                <i className="bi bi-box text-5xl mb-4 block text-gray-400"></i>
                <p className="text-lg font-medium text-gray-900 mb-2">No se encontraron ventas</p>
                <p className="text-sm text-gray-500">Intenta cambiar los filtros</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {this.state.lista.map((item) => {
                  const estadoClass = item.estado === 1
                    ? 'bg-green-100 text-green-800'
                    : item.estado === 2
                      ? 'bg-yellow-100 text-yellow-800'
                      : item.estado === 3
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800';

                  const tipo = item.idFormaPago === CONTADO
                    ? 'CONTADO'
                    : item.idFormaPago === CREDITO_FIJO
                      ? 'CRÉDITO FIJO'
                      : item.idFormaPago === CREDITO_VARIABLE
                        ? 'CRÉDITO VARIABLE'
                        : 'PAGO ADELANTADO';

                  return (
                    <div
                      key={item.idVenta}
                      className="bg-white rounded-xl border transition group overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-semibold text-gray-900 text-sm">
                            {item.comprobante} {item.serie}-{formatNumberWithZeros(item.numeracion)}
                          </h5>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${estadoClass}`}>
                            {item.estado === 1 ? 'COBRADO' : item.estado === 2 ? 'POR COBRAR' : item.estado === 3 ? 'ANULADO' : 'POR LLEVAR'}
                          </span>
                        </div>

                        <div className="text-xs text-gray-600 mb-1">
                          <span className="font-medium">Fecha:</span> {item.fecha} {formatTime(item.hora)}
                        </div>

                        <div className="text-xs text-gray-600 mb-1">
                          <span className="font-medium">Cliente:</span> {item.informacion}
                          <div className="text-xxs text-gray-500">{item.tipoDocumento} - {item.documento}</div>
                        </div>

                        <div className="text-xs text-gray-600 mb-1">
                          <span className="font-medium">Tipo:</span> {tipo}
                        </div>

                        <div className="text-lg font-bold text-gray-900 mb-3">
                          {numberFormat(item.total, item.codiso)}
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                          <button
                            className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-md text-sm font-medium transition"
                            onClick={() => this.handleDetalle(item.idVenta)}
                            disabled={!this.state.view}
                            title="Ver detalle"
                          >
                            <i className="fa fa-eye mr-1"></i> Ver
                          </button>

                          {item.guiaRemision === 0 && (
                            <Link
                              to={getPathNavigation('guia-create', item.idVenta)}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm font-medium transition"
                              title="Generar guía"
                            >
                              <i className="fa fa-truck mr-1"></i> Guía
                            </Link>
                          )}

                          {item.guiaRemision === 1 && (
                            <span className="p-2 text-green-600 bg-green-50 rounded-md text-sm font-medium" title="Guía generada">
                              <i className="fa fa-check mr-1"></i> Lista
                            </span>
                          )}

                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition"
                            onClick={() => this.handleCancelar(item.idVenta)}
                            disabled={!this.state.remove}
                            title="Anular"
                          >
                            <i className="fa fa-trash mr-1"></i> Anular
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Paginacion
              ref={this.refPaginacion}
              loading={this.state.loading}
              data={this.state.lista}
              totalPaginacion={this.state.totalPaginacion}
              paginacion={this.state.paginacion}
              fillTable={this.paginacionContext}
              restart={this.state.restart}
              className="md:px-2 py-3 bg-white border-t border-gray-200 overflow-auto"
              theme="modern"
            />
          </div>
        )}

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
