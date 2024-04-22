import React from 'react';
import printJS from 'print-js';
import {
  alertDialog,
  alertHTML,
  alertInfo,
  alertSuccess,
  alertWarning,
  convertNullText,
  currentDate,
  formatDecimal,
  isEmpty,
  isNumeric,
  readDataFile,
  rounded,
  validateNumericInputs,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { PosContainerWrapper } from '../../../../../components/Container';
import InvoiceTicket from './component/InvoiceTicket';
import {
  createVenta,
  getPersonaPredeterminado,
  comboComprobante,
  comboImpuesto,
  comboMoneda,
  filtrarPersona,
  filtrarProductoVenta,
  preferidosProducto,
  obtenerListaPrecioProducto,
  comboTipoDocumento,
  comboBanco,
  comboAlmacen,
  obtenerVentaPdf,
  obtenerPreVentaPdf,
  listCotizacion,
  detailCotizacionVenta,
  listVenta,
  detailOnlyVentaVenta,
} from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import InvoiceDetail from './component/InvoiceDetail';
import InvoiceClient from './component/InvoiceClient';
import InvoiceVoucher from './component/InvoiceVoucher';
import InvoiceFooter from './component/InvoiceFooter';
import ModalConfiguration from './component/ModalConfiguration';
import InvoiceView from './component/InvoiceView';
import ModalSale from './component/ModalSale';
import CustomComponent from '../../../../../model/class/custom-component';
import ModalCliente from './component/ModalCliente';
import {
  VENTA,
} from '../../../../../model/types/tipo-comprobante';
import { starProduct, favoriteProducts } from '../../../../../redux/actions';
import PropTypes from 'prop-types';
import ModalProducto from './component/ModalProducto';
import { A_GRANEL, SERVICIO, UNIDADES, VALOR_MONETARIO } from '../../../../../model/types/tipo-tratamiento-producto';
import { CLIENTE_NATURAL } from '../../../../../model/types/tipo-cliente';
import { ADELANTADO, CONTADO, CREDITO_FIJO, CREDITO_VARIABLE } from '../../../../../model/types/forma-pago';
import { SpinnerView } from '../../../../../components/Spinner';
import { ModalAgregar } from './component/ModalAgregar';
import ModalImpresion from './component/ModalImpresion';
import ModalPreImpresion from './component/ModalPreImpresion';
import ModalCotizacion from './component/ModalCotizacion';
import ModalVenta from './component/ModalVenta';
import { getDni, getRuc } from '../../../../../network/rest/apisperu.network';
// import InvoiceListPrices from './component/InvoiceListPrices';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class VentaCrear extends CustomComponent {
  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      // Atributos de carga
      loading: true,
      msgLoading: 'Cargando datos...',

      // Atributos principales
      idVenta: '',
      idComprobante: '',
      idImpuesto: '',
      idMoneda: '',
      idAlmacen: '',
      comentario: '',

      // Filtrar producto
      producto: '',
      filtrarCodBar: false,
      filtrarProducto: false,

      // Filtrar cliente
      idCliente: '',
      cliente: '',
      filterCliente: false,
      nuevoCliente: null,

      // Filtrar producto mobile
      productoMobile: '',
      filterProductoMobile: false,

      // Lista de datos
      comprobantes: [],
      productos: [],
      productosMobile: [],
      clientes: [],
      impuestos: [],
      monedas: [],
      almacenes: [],
      tiposDocumentos: [],
      detalleVenta: [],

      // Atributos libres
      nombreComporbante: '',
      codiso: '',
      importeTotal: 0.0,

      // Atributos del modal impresión
      isOpenImpresion: false,

      // Atributos del modal pre impresión
      isOpenPreImpresion: false,
      loadingPreImpresion: false,
      messagePreImpresion: '',

      // Atributos del modal cotización
      isOpenCotizacion: false,
      loadingCotizacion: false,
      listaCotizacion: [],
      restartCotizacion: false,
      opcionCotizacion: 0,
      paginacionCotizacion: 0,
      totalPaginacionCotizacion: 0,
      filasPorPaginaCotizacion: 10,
      messageTableCotizacion: 'Cargando información...',
      fechaInicioCotizacion: currentDate(),
      fechaFinalCotizacion: currentDate(),

      // Atributos del modal venta
      isOpenVenta: false,
      loadingVenta: false,
      listaVenta: [],
      restartVenta: false,
      opcionVenta: 0,
      paginacionVenta: 0,
      totalPaginacionVenta: 0,
      filasPorPaginaVenta: 10,
      messageTableVenta: 'Cargando información...',
      fechaInicioVenta: currentDate(),
      fechaFinalVenta: currentDate(),

      // Atributos del modal sale
      isOpenSale: false,
      loadingModal: false,
      formaPago: CONTADO,
      bancos: [],
      bancosAgregados: [],
      numeroCuotas: '',
      frecuenciaPagoCredito: new Date().getDate() > 15 ? '30' : '15',
      frecuenciaPago: new Date().getDate() > 15 ? '30' : '15',

      // Atributos del modal agregar
      isOpenAgregar: false,
      productoAgregar: null,
      tituloAgregar: '',
      subTituloAgregar: '',
      cantidadAgregar: '',

      // Atributos del modal cliente
      loadingCliente: false,
      idTipoCliente: CLIENTE_NATURAL,
      idTipoDocumentoPn: '',
      numeroDocumentoPn: '',
      informacionPn: '',
      numerCelularPn: '',
      direccionPn: '',
      idTipoDocumentoPj: '',
      numeroDocumentoPj: '',
      informacionPj: '',
      numerCelularPj: '',
      direccionPj: '',

      // Atributos del modal producto
      loadingProducto: true,

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.initial = { ...this.state }

    // Atributos para el modal configuración
    this.idModalConfiguration = 'idModalConfiguration';
    this.refImpuesto = React.createRef();
    this.refMoneda = React.createRef();
    this.refAlmacen = React.createRef();
    this.refComentario = React.createRef();

    // Referencia al modal sale
    this.refSale = React.createRef();
    this.refMetodoPagoContenedor = React.createRef();
    this.refMetodoContado = React.createRef();
    this.refFrecuenciaPago = React.createRef();
    this.refNumeroCuotas = React.createRef();
    this.refFrecuenciaPagoCredito = React.createRef();

    // Referencia al modal impresión
    this.refModalImpresion = React.createRef();

    // Referencia al modal pre impresión
    this.refModalPreImpresion = React.createRef();

    // Referencia al modal de cotización
    this.refModalCotizacion = React.createRef();

    // Referencia al modal de cotización
    this.refModalVenta = React.createRef();

    // Referencia a la busqueda de productos
    this.refProducto = React.createRef();

    // Referencia al tipo de comprobante
    this.refComprobante = React.createRef();

    // Referencia al tipo de cliente
    this.refCliente = React.createRef();
    this.selectItemCliente = false;

    // Atributos para buscar productos el diseño mobil
    this.refProductoMobile = React.createRef();
    this.selectItemProductoMobile = false;

    // Referencia para el custom modal agregar
    this.refModalAgregar = React.createRef();
    this.refCantidadAgregar = React.createRef();

    // Atributos para el modal producto
    this.idModalProducto = 'idModalProducto';
    this.producto = null;
    this.refPrecioProducto = React.createRef();
    this.refBonificacionProducto = React.createRef();
    this.refDescripcionProducto = React.createRef();
    this.listPrecioProducto = [];

    // Atributos para el modal cliente
    this.idModalCliente = 'idModalCliente';
    this.refIdTipoDocumentoPn = React.createRef();
    this.refNumeroDocumentoPn = React.createRef();
    this.refInformacionPn = React.createRef();
    this.refNumerCelularPn = React.createRef();
    this.refDireccionPn = React.createRef();

    this.refIdTipoDocumentoPj = React.createRef();
    this.refNumeroDocumentoPj = React.createRef();
    this.refInformacionPj = React.createRef();
    this.refNumerCelularPj = React.createRef();
    this.refDireccionPj = React.createRef();

    this.abortControllerView = new AbortController();

    this.abortControllerCotizacion = new AbortController();

    this.abortControllerVenta = new AbortController();
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
    document.addEventListener('keydown', this.handleDocumentKeyDown)

    await this.initData();
  }

  /**
   * @description Método que se ejecuta antes de que el componente se desmonte del DOM.
   */
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown)

    this.abortControllerView.abort();
    this.abortControllerCotizacion.abort();
    this.abortControllerVenta.abort();
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

  async initData() {
    await this.loadingData();
  }

  loadingData = async () => {
    const [
      venta,
      monedas,
      impuestos,
      predeterminado,
      bancos,
      tiposDocumentos,
      almacenes
    ] = await Promise.all([
      this.fetchComprobante(VENTA),
      this.fetchMoneda(),
      this.fetchImpuesto(),
      this.fetchClientePredeterminado(),
      this.fetchComboBanco(),
      this.fetchTipoDocumento(),
      this.fetchAlmacen({ idSucursal: this.state.idSucursal })
    ]);

    const comprobantes = [...venta];
    const monedaFilter = monedas.find((item) => item.nacional === 1);
    const impuestoFilter = impuestos.find((item) => item.preferido === 1);
    const comprobanteFilter = comprobantes.find((item) => item.preferida === 1);
    const almacenFilter = almacenes.find((item) => item.predefinido === 1);

    if (typeof predeterminado === 'object') {
      this.handleSelectItemCliente(predeterminado);
    }

    await this.setStateAsync({
      comprobantes,
      monedas,
      impuestos,
      bancos,
      almacenes,

      idComprobante: comprobanteFilter ? comprobanteFilter.idComprobante : '',
      nombreComporbante: !comprobanteFilter ? "Ninguno" : comprobanteFilter.nombre,

      idMoneda: monedaFilter ? monedaFilter.idMoneda : '',
      codiso: monedaFilter ? monedaFilter.codiso : 'PEN',

      idImpuesto: impuestoFilter ? impuestoFilter.idImpuesto : '',

      idAlmacen: almacenFilter ? almacenFilter.idAlmacen : '',

      tiposDocumentos,

      loading: false,
    });

    this.refImpuesto.current.value = impuestoFilter ? impuestoFilter.idImpuesto : '';
    this.refMoneda.current.value = monedaFilter ? monedaFilter.idMoneda : '';
    this.refAlmacen.current.value = almacenFilter ? almacenFilter.idAlmacen : '';

    const productos = await this.fetchProductoPreferidos({ idSucursal: this.state.idSucursal, idAlmacen: almacenFilter ? almacenFilter.idAlmacen : '' });
    this.props.favoriteProducts(productos);
    await this.setStateAsync({ productos: productos });
  };


  async fetchComprobante(tipo) {
    const params = {
      tipo: tipo,
    };

    const response = await comboComprobante(
      params,
      this.abortControllerView.signal,
    );

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchMoneda() {
    const response = await comboMoneda();

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchImpuesto() {
    const response = await comboImpuesto();

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchClientePredeterminado() {
    const response = await getPersonaPredeterminado();

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchComboBanco() {
    const response = await comboBanco(
      this.state.idSucursal,
      this.abortControllerView.signal
    );

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchProductoPreferidos(params) {
    const response = await preferidosProducto(
      params,
      this.abortControllerView.signal
    );

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchObtenerListaPrecio(id) {
    const params = {
      idProducto: id,
    };

    const response = await obtenerListaPrecioProducto(
      params,
      this.abortControllerView.signal
    );

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchTipoDocumento() {
    const response = await comboTipoDocumento(
      this.abortControllerView.signal,
    );

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchFiltrarPersona(params) {
    const response = await filtrarPersona(params);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchFiltrarVenta(params) {
    const response = await filtrarProductoVenta(params);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchAlmacen(params) {
    const response = await comboAlmacen(
      params,
      this.abortControllerView.signal
    );

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  reloadView() {
    this.setState(this.initial, async () => {
      const productos = await this.fetchProductoPreferidos({ idSucursal: this.state.idSucursal, idAlmacen: this.state.idAlmacen });
      this.props.favoriteProducts(productos);
      await this.setStateAsync({ productos: productos });
      await this.loadingData();
      this.refProducto.current.focus();
    })
  }

  addItemDetalle = (producto, precio, cantidad) => {
    const detalles = this.state.detalleVenta.map(item => ({ ...item }));
    const existingItem = detalles.find((item) => item.idProducto === producto.idProducto)
    const almacen = this.state.almacenes.find(item => item.idAlmacen == this.refAlmacen.current.value)

    if (!almacen) {
      alertWarning("Venta", "Selecciona un almacen para continuar.")
      return;
    }

    if (producto.idTipoTratamientoProducto === UNIDADES) {
      if (!existingItem) {
        const inventarios = [];

        inventarios.push({
          idAlmacen: almacen.idAlmacen,
          almacen: almacen.nombre,
          idInventario: producto.idInventario,
          cantidad: cantidad ? producto.cantidad : 1,
        });

        detalles.push({
          idProducto: producto.idProducto,
          nombreProducto: producto.nombreProducto,
          idImpuesto: this.refImpuesto.current.value,
          precio: producto.precio,
          medida: producto.medida,
          idTipoTratamientoProducto: producto.idTipoTratamientoProducto,
          tipo: producto.tipo,
          inventarios: inventarios
        });
      } else {
        const existingInventario = existingItem.inventarios.some(item => item.idInventario === producto.idInventario);
        if (!existingInventario) {
          existingItem.inventarios.push({
            idAlmacen: almacen.idAlmacen,
            almacen: almacen.nombre,
            idInventario: producto.idInventario,
            cantidad: cantidad ? producto.cantidad : 1,
          });
        } else {
          for (const inventario of existingItem.inventarios) {
            if (inventario.idInventario === producto.idInventario) {
              inventario.cantidad += 1;
            }
          }
        }
      }

      this.setState({ detalleVenta: detalles });
    }

    if (producto.idTipoTratamientoProducto === VALOR_MONETARIO) {
      if (!existingItem) {
        const inventarios = [];

        inventarios.push({
          idAlmacen: almacen.idAlmacen,
          almacen: almacen.nombre,
          idInventario: producto.idInventario,
          cantidad: 1,
        });

        detalles.push({
          idProducto: producto.idProducto,
          nombreProducto: producto.nombreProducto,
          idImpuesto: this.refImpuesto.current.value,
          precio: precio,
          medida: producto.medida,
          idTipoTratamientoProducto: producto.idTipoTratamientoProducto,
          tipo: producto.tipo,
          inventarios: inventarios
        });
      } else {
        const existingInventario = existingItem.inventarios.some(item => item.idInventario === producto.idInventario);
        if (!existingInventario) {
          alertWarning("Venta", "Los productos con valor monetario se trabajan son un solo almacen y sin unidades.")
        } else {
          existingItem.precio = precio;
        }
      }

      this.setState({ detalleVenta: detalles });
    }

    if (producto.idTipoTratamientoProducto === A_GRANEL) {
      if (!existingItem) {
        const inventarios = [];

        inventarios.push({
          idAlmacen: almacen.idAlmacen,
          almacen: almacen.nombre,
          idInventario: producto.idInventario,
          cantidad: cantidad,
        });

        detalles.push({
          idProducto: producto.idProducto,
          nombreProducto: producto.nombreProducto,
          idImpuesto: this.refImpuesto.current.value,
          precio: producto.precio,
          medida: producto.medida,
          idTipoTratamientoProducto: producto.idTipoTratamientoProducto,
          tipo: producto.tipo,
          inventarios: inventarios
        });
      } else {
        const existingInventario = existingItem.inventarios.some(item => item.idInventario === producto.idInventario);
        if (!existingInventario) {
          existingItem.inventarios.push({
            idAlmacen: almacen.idAlmacen,
            almacen: almacen.nombre,
            idInventario: producto.idInventario,
            cantidad: cantidad,
          });
        } else {
          for (const inventario of existingItem.inventarios) {
            if (inventario.idInventario === producto.idInventario) {
              inventario.cantidad = cantidad;
            }
          }
        }
      }

      this.setState({ detalleVenta: detalles });
    }

    if (producto.idTipoTratamientoProducto === SERVICIO) {
      if (!existingItem) {
        detalles.push({
          idProducto: producto.idProducto,
          nombreProducto: producto.nombreProducto,
          idImpuesto: this.refImpuesto.current.value,
          precio: precio ? precio : producto.precio,
          medida: producto.medida,
          idTipoTratamientoProducto: producto.idTipoTratamientoProducto,
          tipo: producto.tipo,
          cantidad: 1,
        });
      } else {
        existingItem.cantidad = existingItem.cantidad + 1;
      }

      this.setState({ detalleVenta: detalles });
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

  handleDocumentKeyDown = (event) => {
    if (event.key === 'F1' && !this.state.isOpenImpresion && !this.state.isOpenSale && !this.state.isOpenAgregar) {
      this.handleOpenSale();
    }

    if (event.key === 'F2' && !this.state.isOpenImpresion && !this.state.isOpenSale && !this.state.isOpenAgregar) {
      this.handleClearSale();
    }
  }

  //------------------------------------------------------------------------------------------
  // Componenente busqueda
  //------------------------------------------------------------------------------------------

  handleAddItem = async (producto) => {
    if (isEmpty(this.refImpuesto.current.value)) {
      alertWarning('Venta', 'Seleccione un impuesto.', () => {
        this.handleOpenOptions();
        this.refImpuesto.current.focus();
      });
      return;
    }

    if (producto.precio <= 0) {
      alertWarning('Venta', '¡El precio no puede tener un valor de 0!');
      return;
    }

    if (producto.idTipoTratamientoProducto === UNIDADES || producto.idTipoTratamientoProducto === SERVICIO) {
      this.addItemDetalle(producto, null, null);
    }

    if (producto.idTipoTratamientoProducto === VALOR_MONETARIO) {
      this.handleOpenModalAgregar("Ingrese el valor monetario (S/, $ u otro) del producto o el total.", "Monto:", producto);
    }

    if (producto.idTipoTratamientoProducto === A_GRANEL) {
      this.handleOpenModalAgregar("Ingrese el peso del producto (KM, GM u otro).", "Peso:", producto);
    }
  }

  handleCodBarProducto = () => {
    this.setState({ filtrarCodBar: true }, () => {
      this.refProducto.current.focus();
    })
  }

  handleAllProducto = () => {
    this.setState({ filtrarCodBar: false }, () => {
      this.refProducto.current.focus();
    })
  }

  handleSelectComprobante = (event) => {
    const comprobante = this.state.comprobantes.find(item => item.idComprobante == event.target.value);

    this.setState({
      idComprobante: event.target.value,
      nombreComporbante: !comprobante ? "Ninguno" : comprobante.nombre
    });
  }

  handleFilterCodBarProducto = async (event) => {
    const searchWord = event.target.value;
    this.setState({ producto: searchWord });
  }

  handleSearchCodBarProducto = async (event) => {
    if (event.key === 'Enter') {
      await this.setStateAsync({ filtrarProducto: true });

      const params = {
        codBar: this.state.filtrarCodBar ? 1 : 0,
        filtrar: this.state.producto,
        idSucursal: this.state.idSucursal,
        idAlmacen: this.state.idAlmacen
      };

      const result = await this.fetchFiltrarVenta(params);

      if (!isEmpty(result)) {
        this.handleAddItem(result[0])
      }

      this.setState({ filtrarProducto: false, producto: '' });
    }
  }

  handleFilterAllProducto = async (event) => {
    const searchWord = event.target.value;
    this.setState({ producto: searchWord });

    if (searchWord.length === 0) {
      this.setState({ productos: this.props.productos });
      return;
    }

    if (searchWord.length <= 2) return;

    await this.setStateAsync({ filtrarProducto: true });

    const params = {
      codBar: this.state.filtrarCodBar ? 1 : 0,
      filtrar: searchWord,
      idSucursal: this.state.idSucursal,
      idAlmacen: this.state.idAlmacen
    };

    const result = await this.fetchFiltrarVenta(params);

    this.setState({
      productos: result,
      filtrarProducto: false,
    });
  }

  //------------------------------------------------------------------------------------------
  // Acciones del modal producto
  //------------------------------------------------------------------------------------------
  handleOpenModalAgregar = (titulo, subTitulo, producto) => {
    this.setState({
      isOpenAgregar: true,
      tituloAgregar: titulo,
      subTituloAgregar: subTitulo,
      productoAgregar: producto
    })
  }

  handleCloseAgregar = async () => {
    this.setState({ isOpenAgregar: false })
  }

  handleOnOpenModalAgregar = () => {

  }

  handleOnHiddenModalAgregar = async () => {
    this.setState({
      tituloAgregar: '',
      subTituloAgregar: '',
      cantidadAgregar: '',
      productoAgregar: null
    })
  }

  handleInputCantidad = (event) => {
    this.setState({ cantidadAgregar: event.target.value })
  }

  handleSaveAgregar = async () => {
    if (!isNumeric(this.state.cantidadAgregar)) {
      alertWarning("Venta", "Ingrese el valor solicitado.", () => {
        this.refCantidadAgregar.current.focus();
      })
      return;
    }

    if (this.state.productoAgregar.idTipoTratamientoProducto === VALOR_MONETARIO) {
      this.addItemDetalle(this.state.productoAgregar, parseFloat(this.state.cantidadAgregar), null);
      this.refProducto.current.focus()
    }

    if (this.state.productoAgregar.idTipoTratamientoProducto === A_GRANEL) {
      this.addItemDetalle(this.state.productoAgregar, null, parseFloat(this.state.cantidadAgregar));
      this.refProducto.current.focus()
    }

    await this.handleCloseAgregar();
    this.refProducto.current.focus();
  }

  //------------------------------------------------------------------------------------------
  // Opciones de configuración
  //------------------------------------------------------------------------------------------

  handleOpenOptions = () => {
    const invoice = document.getElementById(this.idModalConfiguration);
    this.refImpuesto.current.value = this.state.idImpuesto;
    this.refMoneda.current.value = this.state.idMoneda;
    this.refAlmacen.current.value = this.state.idAlmacen;

    invoice.classList.add('toggled');
  }

  handleCloseOptions = () => {
    const invoice = document.getElementById(this.idModalConfiguration);
    this.refImpuesto.current.value = this.state.idImpuesto;
    this.refMoneda.current.value = this.state.idMoneda;
    this.refAlmacen.current.value = this.state.idAlmacen;

    invoice.classList.remove('toggled');
  }

  handleSaveOptions = () => {
    if (isEmpty(this.refImpuesto.current.value)) {
      alertWarning('Venta', 'Seleccione un impuesto.', () =>
        this.refImpuesto.current.focus(),
      );
      return;
    }

    if (isEmpty(this.refMoneda.current.value)) {
      alertWarning('Venta', 'Seleccione una moneda.', () =>
        this.refMoneda.current.focus(),
      );
      return;
    }

    if (isEmpty(this.refAlmacen.current.value)) {
      alertWarning('Venta', 'Seleccione un almacen.', () =>
        this.refAlmacen.current.focus(),
      );
      return;
    }

    const detalleVenta = this.state.detalleVenta.map((item) => ({
      ...item,
      idImpuesto: this.refImpuesto.current.value,
    }));

    const moneda = this.state.monedas.find((item) => item.idMoneda === this.refMoneda.current.value)

    this.setState({
      idMoneda: moneda.idMoneda,
      codiso: moneda.codiso,
      idImpuesto: this.refImpuesto.current.value,
      idAlmacen: this.refAlmacen.current.value,
      comentario: this.refComentario.current.value,
      detalleVenta,
    }, async () => {
      this.handleCloseOptions();
      const productos = await this.fetchProductoPreferidos({
        idSucursal: this.state.idSucursal,
        idAlmacen: this.refAlmacen.current.value
      });
      this.props.favoriteProducts(productos);
      await this.setStateAsync({ productos: productos });
    });
  }

  //------------------------------------------------------------------------------------------
  // Modal impresión
  //------------------------------------------------------------------------------------------

  handleOpenImpresion = (idVenta) => {
    this.setState({ isOpenImpresion: true, idVenta: idVenta })
  }

  handleCloseImpresion = async () => {
    this.setState({ isOpenImpresion: false }, () => {
      this.reloadView()
    })
  }

  handleOpenImpresionA4 = () => {
    printJS({
      printable: obtenerVentaPdf(this.state.idVenta, "a4"),
      type: 'pdf',
      showModal: true,
      modalMessage: "Recuperando documento...",
      onPrintDialogClose: () => {
        this.handleCloseImpresion()
      }
    })
  }

  handleOpenImpresionTicket = () => {
    printJS({
      printable: obtenerVentaPdf(this.state.idVenta, "ticket"),
      type: 'pdf',
      showModal: true,
      modalMessage: "Recuperando documento...",
      onPrintDialogClose: () => {
        this.handleCloseImpresion()
      }
    })
  }

  //------------------------------------------------------------------------------------------
  // Opciones de pre impresión
  //------------------------------------------------------------------------------------------

  handleOpenPreImpresion = () => {
    this.setState({ isOpenPreImpresion: true })
  }

  handleClosePreImpresion = () => {
    if (this.state.loadingPreImpresion) return;

    this.setState({ isOpenPreImpresion: false })
  }

  handleOpenPreImpresionA4 = async () => {
    const { idComprobante, idCliente, idMoneda, idImpuesto, detalleVenta } = this.state;

    if (isEmpty(idComprobante)) {
      alertWarning('Venta', 'Seleccione su comprobante.', () =>
        this.refComprobante.current.focus(),
      );
      return;
    }

    if (isEmpty(idCliente)) {
      alertWarning('Venta', 'Seleccione un cliente.', () =>
        this.refCliente.current.focus(),
      );
      return;
    }

    if (isEmpty(idMoneda)) {
      alertWarning('Venta', 'Seleccione su moneda.', () =>
        this.refMoneda.current.focus(),
      );
      return;
    }

    if (isEmpty(idImpuesto)) {
      alertWarning('Venta', 'Seleccione el impuesto', () =>
        this.refMoneda.current.focus(),
      );
      return;
    }

    if (isEmpty(detalleVenta)) {
      alertWarning('Venta', 'Agregar algún producto a la lista.', () =>
        this.refProducto.current.focus(),
      );
      return;
    }

    this.setState({
      loadingPreImpresion: true,
      messagePreImpresion: 'Generando pre impresión...'
    })

    const response = await obtenerPreVentaPdf({
      idComprobante: this.state.idComprobante,
      idCliente: idCliente,

      idMoneda: idMoneda,
      idUsuario: this.state.idUsuario,
      idSucursal: this.state.idSucursal,

      detalle: detalleVenta
    }, "a4");

    if (response instanceof SuccessReponse) {
      const base64 = await readDataFile(response.data);

      this.setState({
        loadingPreImpresion: false
      })

      printJS({
        printable: base64,
        type: 'pdf',
        base64: true,
        onPrintDialogClose: () => {
          this.handleClosePreImpresion()
        }
      })
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.setState({
        loadingPreImpresion: false
      })

      alertWarning("Venta", response.getMessage())
    }
  }

  handleOpenPreImpresionTicket = async () => {
    const { idComprobante, idCliente, idMoneda, idImpuesto, detalleVenta } = this.state;

    if (isEmpty(idComprobante)) {
      alertWarning('Venta', 'Seleccione su comprobante.', () =>
        this.refComprobante.current.focus(),
      );
      return;
    }

    if (isEmpty(idCliente)) {
      alertWarning('Venta', 'Seleccione un cliente.', () =>
        this.refCliente.current.focus(),
      );
      return;
    }

    if (isEmpty(idMoneda)) {
      alertWarning('Venta', 'Seleccione su moneda.', () =>
        this.refMoneda.current.focus(),
      );
      return;
    }

    if (isEmpty(idImpuesto)) {
      alertWarning('Venta', 'Seleccione el impuesto', () =>
        this.refMoneda.current.focus(),
      );
      return;
    }

    if (isEmpty(detalleVenta)) {
      alertWarning('Venta', 'Agregar algún producto a la lista.', () =>
        this.refProducto.current.focus(),
      );
      return;
    }

    this.setState({
      loadingPreImpresion: true,
      messagePreImpresion: 'Generando pre impresión...'
    })

    const response = await obtenerPreVentaPdf({
      idComprobante: this.state.idComprobante,
      idCliente: idCliente,

      idMoneda: idMoneda,
      idUsuario: this.state.idUsuario,
      idSucursal: this.state.idSucursal,

      detalle: detalleVenta
    }, "ticket");

    if (response instanceof SuccessReponse) {
      const base64 = await readDataFile(response.data);

      this.setState({
        loadingPreImpresion: false
      })

      printJS({
        printable: base64,
        type: 'pdf',
        base64: true,
        onPrintDialogClose: () => {
          this.handleClosePreImpresion()
        }
      })
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.setState({
        loadingPreImpresion: false
      })

      alertWarning("Venta", response.getMessage())
    }
  }

  //------------------------------------------------------------------------------------------
  // Opciones de cotización
  //------------------------------------------------------------------------------------------

  handleOpenCotizacion = () => {
    this.setState({ isOpenCotizacion: true })
  }

  handleCloseCotizacion = () => {
    this.setState({ isOpenCotizacion: false })
  }

  handleOnOpenCotizacion = async () => {
    await this.loadInitCotizacion()
  }

  loadInitCotizacion = async () => {
    if (this.state.loadingCotizacion) return;

    await this.setStateAsync({ paginacionCotizacion: 1, restartCotizacion: true });
    this.fillTableCotizacion(0);
    await this.setStateAsync({ opcionCotizacion: 0 });
  };

  handleSearchTextCotizacion = async (text) => {
    if (this.state.loadingCotizacion) return;

    if (text.trim().length === 0) return;

    await this.setStateAsync({ paginacionCotizacion: 1, restartCotizacion: false });
    this.fillTableCotizacion(1, text.trim());
    await this.setStateAsync({ opcionCotizacion: 1 });
  }

  handleSearchFechaCotizacion = async () => {
    if (this.state.loadingCotizacion) return;

    if (this.state.fechaInicioCotizacion > this.state.fechaFinalCotizacion) return;

    await this.setStateAsync({ paginacionCotizacion: 1, restartCotizacion: false });
    this.fillTableCotizacion(2, '', this.state.fechaInicioCotizacion, this.state.fechaFinalCotizacion);
    await this.setStateAsync({ opcionCotizacion: 1 });
  }

  handlePaginacionCotizacion = async (listid) => {
    await this.setStateAsync({ paginacionCotizacion: listid, restartCotizacion: false });
    this.handlPaginacionCotizacion();
  };

  handlPaginacionCotizacion = () => {
    switch (this.state.opcionCotizacion) {
      case 0:
        this.fillTableCotizacion(0);
        break;
      case 1:
        this.fillTableCotizacion(1, '');
        break;
      case 2:
        this.fillTableCotizacion(2, '', this.state.fechaInicioCotizacion, this.state.fechaFinalCotizacion);
        break;
      default:
        this.fillTableCotizacion(0);
    }
  };

  fillTableCotizacion = async (opcion, buscar = '', fechaInicio = '', fechaFinal = '') => {
    this.setState({
      loadingCotizacion: true,
      listaCotizacion: [],
      messageTableCotizacion: 'Cargando información...',
    });

    const params = {
      opcion: opcion,
      buscar: buscar,
      fechaInicio: fechaInicio,
      fechaFinal: fechaFinal,
      idSucursal: this.state.idSucursal,
      posicionPagina: (this.state.paginacionCotizacion - 1) * this.state.filasPorPaginaCotizacion,
      filasPorPagina: this.state.filasPorPaginaCotizacion,
    };
    const response = await listCotizacion(params, this.abortControllerCotizacion.signal);

    if (response instanceof SuccessReponse) {
      const totalPaginacion = parseInt(
        Math.ceil(parseFloat(response.data.total) / this.state.filasPorPaginaCotizacion),
      );

      this.setState({
        loadingCotizacion: false,
        listaCotizacion: response.data.result,
        totalPaginacionCotizacion: totalPaginacion,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.setState({
        loadingCotizacion: false,
        listaCotizacion: [],
        totalPaginacionCotizacion: 0,
        messageTableCotizacion: response.getMessage(),
      });
    }
  }

  handleOnHiddenCotizacion = () => {
    this.setState({ listaCotizacion: [] });
  }

  handleFechaInicioCotizacion = (event) => {
    this.setState({
      fechaInicioCotizacion: event.target.value
    }, () => {
      this.handleSearchFechaCotizacion()
    })
  }

  handleFechaFinalCotizacion = (event) => {
    this.setState({
      fechaFinalCotizacion: event.target.value
    }, () => {
      this.handleSearchFechaCotizacion()
    })
  }

  handleSeleccionarCotizacion = async (idCotizacion) => {
    this.handleCloseCotizacion();

    this.setState({ loading: true, msgLoading: "Obteniendos datos de la cotización." });

    const params = {
      idCotizacion: idCotizacion,
      idAlmacen: this.state.idAlmacen
    };

    const response = await detailCotizacionVenta(params, this.abortControllerCotizacion.signal);

    if (response instanceof SuccessReponse) {
      this.handleSelectItemCliente(response.data.cliente);

      for (const producto of response.data.productos) {
        if (producto.idTipoTratamientoProducto === UNIDADES || producto.idTipoTratamientoProducto === SERVICIO) {
          this.addItemDetalle(producto, null, producto.cantidad);
        }
        if (producto.idTipoTratamientoProducto === VALOR_MONETARIO) {
          this.addItemDetalle(producto, producto.cantidad * producto.precio, null);
        }
        if (producto.idTipoTratamientoProducto === A_GRANEL) {
          this.addItemDetalle(producto, null, producto.cantidad);
        }
      }

      this.setState({ loading: false })
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.setState({ loading: false });
      alertWarning("Venta", response.getMessage())
    }
  }

  //------------------------------------------------------------------------------------------
  // Opciones de venta
  //------------------------------------------------------------------------------------------

  handleOpenVenta = () => {
    this.setState({ isOpenVenta: true })
  }

  handleCloseVenta = () => {
    this.setState({ isOpenVenta: false })
  }

  handleOnOpenVenta = async () => {
    await this.loadInitVenta()
  }

  loadInitVenta = async () => {
    if (this.state.loadingVenta) return;

    await this.setStateAsync({ paginacionVenta: 1, restartVenta: true });
    this.fillTableVenta(0);
    await this.setStateAsync({ opcionVenta: 0 });
  };

  handleSearchTextVenta = async (text) => {
    if (this.state.loadingVenta) return;

    if (text.trim().length === 0) return;

    await this.setStateAsync({ paginacionVenta: 1, restartVenta: false });
    this.fillTableVenta(1, text.trim());
    await this.setStateAsync({ opcionVenta: 1 });
  }

  handleSearchFechaVenta = async () => {
    if (this.state.loadingVenta) return;

    if (this.state.fechaInicioVenta > this.state.fechaFinalVenta) return;

    await this.setStateAsync({ paginacionVenta: 1, restartVenta: false });
    this.fillTableVenta(2, '', this.state.fechaInicioVenta, this.state.fechaFinalVenta);
    await this.setStateAsync({ opcionVenta: 2 });
  }

  handlePaginacionVenta = async (listid) => {
    await this.setStateAsync({ paginacionVenta: listid, restartVenta: false });
    this.handlPaginacionVenta();
  };

  handlPaginacionVenta = () => {
    switch (this.state.opcionVenta) {
      case 0:
        this.fillTableVenta(0);
        break;
      case 1:
        this.fillTableVenta(1, '',);
        break;
      case 2:
        this.fillTableVenta(2, '', this.state.fechaInicioCotizacion, this.state.fechaFinalCotizacion);
        break;
      default:
        this.fillTableVenta(0);
    }
  };

  fillTableVenta = async (opcion, buscar = '', fechaInicio = '', fechaFinal = '') => {
    this.setState({
      loadingVenta: true,
      listaVenta: [],
      messageTableVenta: 'Cargando información...',
    });

    const params = {
      opcion: opcion,
      buscar: buscar,
      fechaInicio: fechaInicio,
      fechaFinal: fechaFinal,
      idComprobante: '',
      estado: '0',
      idSucursal: this.state.idSucursal,
      posicionPagina: (this.state.paginacionVenta - 1) * this.state.filasPorPaginaVenta,
      filasPorPagina: this.state.filasPorPaginaVenta,
    };
    const response = await listVenta(params, this.abortControllerVenta.signal);

    if (response instanceof SuccessReponse) {
      const totalPaginacion = parseInt(
        Math.ceil(parseFloat(response.data.total) / this.state.filasPorPaginaVenta),
      );

      this.setState({
        loadingVenta: false,
        listaVenta: response.data.result,
        totalPaginacionVenta: totalPaginacion,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.setState({
        loadingVenta: false,
        listaVenta: [],
        totalPaginacionVenta: 0,
        messageTableVenta: response.getMessage(),
      });
    }
  }

  handleOnHiddenVenta = () => {
    this.setState({ listaVenta: [] });
  }

  handleFechaInicioVenta = (event) => {
    this.setState({
      fechaInicioVenta: event.target.value
    }, () => {
      this.handleSearchFechaVenta()
    })
  }

  handleFechaFinalVenta = (event) => {
    this.setState({
      fechaFinalVenta: event.target.value
    }, () => {
      this.handleSearchFechaVenta()
    })
  }

  handleSeleccionarVenta = async (idVenta) => {
    this.handleCloseVenta();

    this.setState({ loading: true, msgLoading: "Obteniendos datos de la venta." });

    const params = {
      idVenta: idVenta,
      idAlmacen: this.state.idAlmacen
    };

    const response = await detailOnlyVentaVenta(params, this.abortControllerCotizacion.signal);

    if (response instanceof SuccessReponse) {
      this.handleSelectItemCliente(response.data.cliente);

      for (const producto of response.data.productos) {

        if (producto.idTipoTratamientoProducto === UNIDADES || producto.idTipoTratamientoProducto === SERVICIO) {
          this.addItemDetalle(producto, null, producto.cantidad);
        }
        if (producto.idTipoTratamientoProducto === VALOR_MONETARIO) {
          this.addItemDetalle(producto, producto.cantidad * producto.precio, null);
        }
        if (producto.idTipoTratamientoProducto === A_GRANEL) {
          this.addItemDetalle(producto, null, producto.cantidad);
        }
      }

      this.setState({ loading: false })
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.setState({ loading: false });
      alertWarning("Venta", response.getMessage())
    }
  }

  //------------------------------------------------------------------------------------------
  // Modal cliente
  //------------------------------------------------------------------------------------------

  handleOpenCliente = () => {
    const invoice = document.getElementById(this.idModalCliente);
    invoice.classList.add('toggled');
  }

  handleCloseCliente = () => {
    const invoice = document.getElementById(this.idModalCliente);

    if (this.state.loadingCliente) return;

    invoice.classList.remove('toggled');
  }

  handleClickIdTipoCliente = (tipo) => {
    this.setState({ idTipoCliente: tipo })
  }

  handleSelectIdTipoDocumentoPn = (event) => {
    this.setState({ idTipoDocumentoPn: event.target.value })
  }

  handleInputNumeroDocumentoPn = (event) => {
    this.setState({ numeroDocumentoPn: event.target.value })
  }

  handleInputInformacionPn = (event) => {
    this.setState({ informacionPn: event.target.value })
  }

  handleInputNumeroCelularPn = (event) => {
    this.setState({ numerCelularPn: event.target.value })
  }

  handleInputDireccionPn = (event) => {
    this.setState({ direccionPn: event.target.value })
  }

  handleSelectIdTipoDocumentoPj = (event) => {
    this.setState({ idTipoDocumentoPj: event.target.value })
  }

  handleInputNumeroDocumentoPj = (event) => {
    this.setState({ numeroDocumentoPj: event.target.value })
  }

  handleInputInformacionPj = (event) => {
    this.setState({ informacionPj: event.target.value })
  }

  handleInputNumeroCelularPj = (event) => {
    this.setState({ numerCelularPj: event.target.value })
  }

  handleInputDireccionPj = (event) => {
    this.setState({ direccionPj: event.target.value })
  }

  handleGetApiReniec = async () => {
    if (this.state.numeroDocumentoPn.length !== 8) {
      alertWarning("Venta", 'Para iniciar la busqueda en número dni debe tener 8 caracteres.', () => {
        this.refNumeroDocumentoPn.current.focus();
      })
      return;
    }

    this.setState({
      loadingCliente: true,
      msgLoading: 'Consultando número de DNI...',
    });

    const response = await getDni(this.state.numeroDocumentoPn);

    if (response instanceof SuccessReponse) {
      this.setState({
        numeroDocumentoPn: convertNullText(response.data.dni),
        informacionPn: convertNullText(response.data.apellidoPaterno) + ' ' + convertNullText(response.data.apellidoMaterno) + ' ' + convertNullText(response.data.nombres),
        loadingCliente: false,
      });
    }

    if (response instanceof ErrorResponse) {
      alertWarning('Venta', response.getMessage(), () => {
        this.setState({
          loadingCliente: false,
        });
      });
    }
  };

  handleGetApiSunat = async () => {
    if (this.state.numeroDocumentoPj.length !== 11) {
      alertWarning("Venta", 'Para iniciar la busqueda en número ruc debe tener 11 caracteres.', () => {
        this.refNumeroDocumentoPj.current.focus();
      })
      return;
    }

    this.setState({
      loadingCliente: true,
      msgLoading: 'Consultando número de RUC...',
    });

    const response = await getRuc(this.state.numeroDocumentoPj);

    if (response instanceof SuccessReponse) {
      this.setState({
        numeroDocumentoPj: convertNullText(response.data.ruc),
        informacionPj: convertNullText(response.data.razonSocial),
        direccionPj: convertNullText(response.data.direccion),
        loadingCliente: false,
      });
    }

    if (response instanceof ErrorResponse) {
      alertWarning('Venta', response.getMessage(), () => {
        this.setState({
          loadingCliente: false,
        });
      });
    }
  };

  handleSaveClienteNatural = () => {
    const tipoDocumento = this.state.tiposDocumentos.find(item => item.idTipoDocumento === this.state.idTipoDocumentoPn);

    if (isEmpty(this.state.idTipoDocumentoPn)) {
      alertWarning("Venta", "Seleccione el tipo de documento.", () => {
        this.refIdTipoDocumentoPn.current.focus()
      })
      return;
    }

    if (isEmpty(this.state.numeroDocumentoPn)) {
      alertWarning("Venta", "Seleccione el tipo de documento.", () => {
        this.refNumeroDocumentoPn.current.focus()
      })
      return;
    }

    if (tipoDocumento && tipoDocumento.obligado === 1 && tipoDocumento.longitud !== this.state.numeroDocumentoPn.length) {
      alertWarning("Venta", `El número de documento por ser ${tipoDocumento.nombre} tiene que tener una longitud de ${tipoDocumento.longitud} carácteres.`, () => {
        this.refNumeroDocumentoPn.current.focus();
      })
      return;
    }

    if (isEmpty(this.state.informacionPn)) {
      alertWarning("Venta", "Seleccione el tipo de documento.", () => {
        this.refInformacionPn.current.focus()
      })
      return;
    }

    const nuevoCliente = {
      idTipoCliente: this.state.idTipoCliente,
      idTipoDocumento: this.state.idTipoDocumentoPn,
      numeroDocumento: this.state.numeroDocumentoPn,
      informacion: this.state.informacionPn,
      numeroCelular: this.state.numerCelularPn,
      direccion: this.state.direccionPn,
    }

    const value = {
      idCliente: "",
      documento: this.state.numeroDocumentoPn,
      informacion: this.state.informacionPn
    }

    this.setState({ nuevoCliente }, () => {
      this.handleSelectItemCliente(value);
      this.handleCloseCliente();
    })
  }

  handleSaveClienteJuridica = () => {
    const tipoDocumento = this.state.tiposDocumentos.find(item => item.idTipoDocumento === this.state.idTipoDocumentoPj);

    if (isEmpty(this.state.idTipoDocumentoPj)) {
      alertWarning("Venta", "Seleccione el tipo de documento.", () => {
        this.refIdTipoDocumentoPj.current.focus()
      })
      return;
    }

    if (isEmpty(this.state.numeroDocumentoPj)) {
      alertWarning("Venta", "Seleccione el tipo de documento.", () => {
        this.refNumeroDocumentoPj.current.focus()
      })
      return;
    }

    if (tipoDocumento && tipoDocumento.obligado === 1 && tipoDocumento.longitud !== this.state.numeroDocumentoPj.length) {
      alertWarning("Venta", `El número de documento por ser ${tipoDocumento.nombre} tiene que tener una longitud de ${tipoDocumento.longitud} carácteres.`, () => {
        this.refNumeroDocumentoPj.current.focus();
      })
      return;
    }

    if (isEmpty(this.state.informacionPj)) {
      alertWarning("Venta", "Seleccione el tipo de documento.", () => {
        this.refInformacionPj.current.focus()
      })
      return;
    }

    const nuevoCliente = {
      idTipoCliente: this.state.idTipoCliente,
      idTipoDocumento: this.state.idTipoDocumentoPj,
      numeroDocumento: this.state.numeroDocumentoPj,
      informacion: this.state.informacionPj,
      numeroCelular: this.state.numerCelularPj,
      direccion: this.state.direccionPj,
    }

    const value = {
      idCliente: "",
      documento: this.state.numeroDocumentoPj,
      informacion: this.state.informacionPj
    }

    this.setState({ nuevoCliente }, () => {
      this.handleSelectItemCliente(value);
      this.handleCloseCliente();
    })
  }

  handleSaveCliente = () => {
    if (this.state.idTipoCliente === CLIENTE_NATURAL) {
      this.handleSaveClienteNatural();
    } else {
      this.handleSaveClienteJuridica();
    }
  }

  //------------------------------------------------------------------------------------------
  // Opciones del producto y modal
  //------------------------------------------------------------------------------------------

  handleMinusProducto = async (producto, idInventario) => {
    if (producto.idTipoTratamientoProducto === SERVICIO) {
      const detalles = this.state.detalleVenta.map(item => ({ ...item }));

      let remove = false;

      for (const item of detalles) {
        if (item.idProducto === producto.idProducto) {
          if (parseFloat(item.cantidad) - 1 <= 0) {
            remove = true;
            break;
          }
          item.cantidad = Math.max(parseFloat(item.cantidad) - 1, 1)
        }
      }

      if (remove) {
        this.handleRemoveProducto(producto);
      } else {
        this.setState({ detalleVenta: detalles });
      }
    }

    if (producto.idTipoTratamientoProducto === UNIDADES || producto.idTipoTratamientoProducto === A_GRANEL) {
      const detalles = this.state.detalleVenta.map(item => ({ ...item }));

      let remove = false;

      for (const item of detalles) {
        if (item.idProducto === producto.idProducto) {
          if (item.inventarios.length === 1) {
            const inventario = item.inventarios[0];
            if (parseFloat(inventario.cantidad) - 1 <= 0) {
              remove = true;
              break;
            }
            inventario.cantidad = Math.max(parseFloat(inventario.cantidad) - 1, 1)
          } else {
            for (const inventario of item.inventarios) {
              if (inventario.idInventario === idInventario) {
                if (parseFloat(inventario.cantidad) - 1 <= 0) {
                  const indice = item.inventarios.findIndex(objeto => objeto.idInventario === idInventario)
                  item.inventarios.splice(indice, 1)
                  break;
                }

                inventario.cantidad = Math.max(parseFloat(inventario.cantidad) - 1, 1);
                break;
              }
            }
          }
        }
      }

      if (remove) {
        this.handleRemoveProducto(producto);
      } else {
        this.setState({ detalleVenta: detalles });
      }
    }
  }

  handlePlusProducto = async (producto, idInventario) => {
    if (producto.idTipoTratamientoProducto === SERVICIO) {
      const detalles = this.state.detalleVenta.map(item => ({ ...item }));

      for (const item of detalles) {
        if (item.idProducto === producto.idProducto) {
          item.cantidad = parseFloat(item.cantidad) + 1;
          break;
        }
      }

      this.setState({ detalleVenta: detalles });
    }

    if (producto.idTipoTratamientoProducto === UNIDADES || producto.idTipoTratamientoProducto === A_GRANEL) {
      const detalles = this.state.detalleVenta.map(item => ({ ...item }));

      for (const item of detalles) {
        if (item.idProducto === producto.idProducto) {
          for (const inventario of item.inventarios) {
            if (inventario.idInventario === idInventario) {
              inventario.cantidad = parseFloat(inventario.cantidad) + 1;
              break;
            }
          }
        }
      }

      this.setState({ detalleVenta: detalles });
    }
  }

  handleEditProducto = async (producto) => {
    const invoice = document.getElementById(this.idModalProducto);

    invoice.classList.add('toggled');
    const lista = await this.fetchObtenerListaPrecio(producto.idProducto);
    this.producto = producto;
    this.refPrecioProducto.current.value = producto.precio;
    this.refBonificacionProducto.current.value = 0;
    this.refDescripcionProducto.current.value = producto.nombreProducto;
    this.listPrecioProducto = lista;
    this.setState({ loadingProducto: false });
  };

  handleRemoveProducto = async (producto) => {
    const detalles = this.state.detalleVenta.filter((item) => producto.idProducto !== item.idProducto);
    this.setState({ detalleVenta: detalles, });
  };

  handleCloseProducto = () => {
    const invoice = document.getElementById(this.idModalProducto);

    if (this.state.loadingProducto) return;

    invoice.classList.remove('toggled');
    this.producto = null;
    this.listPrecioProducto = [];
    this.setState({ loadingProducto: true });
  };

  handleSaveProducto = (event) => {
    event.stopPropagation();

    const precioProducto = this.refPrecioProducto.current.value;
    const descripcionProducto = this.refDescripcionProducto.current.value;

    if (!isNumeric(precioProducto) || parseFloat(precioProducto) <= 0) {
      alertWarning('Venta', 'El precio del producto tiene un valor no admitido o es menor o igual a 0.', () => {
        this.refPrecioProducto.current.focus();
      });
      return;
    }

    if (isEmpty(descripcionProducto)) {
      alertWarning('Venta', 'La descripción del producto no puede ser vacía.', () => {
        this.refDescripcionProducto.current.focus();
      });
      return;
    }

    const producto = this.state.detalleVenta.find(item => item.idProducto === this.producto.idProducto);

    if (producto.precio !== parseFloat(precioProducto) && producto.idTipoTratamientoProducto === A_GRANEL) {
      alertWarning('Venta', 'Los productos a granel no se puede cambia el precio.');
      return;
    }

    const detalles = this.state.detalleVenta.map(item => ({ ...item }));

    for (const item of detalles) {
      if (item.idProducto === this.producto.idProducto) {
        item.nombreProducto = descripcionProducto;
        item.precio = parseFloat(precioProducto)
      }
    }

    // const updatedDetalle = this.state.detalleVenta.map((item) =>
    //   item.idProducto === this.producto.idProducto
    //     ? {
    //       ...item,
    //       nombreProducto: descripcionProducto,
    //       precio: parseFloat(precioProducto),
    //     }
    //     : item,
    // );

    this.setState({ detalleVenta: detalles });
    this.handleCloseProducto();
  }

  //------------------------------------------------------------------------------------------
  // Filtrar cliente
  //------------------------------------------------------------------------------------------

  handleClearInputCliente = async () => {
    await this.setStateAsync({
      clientes: [],
      idCliente: '',
      cliente: '',
      nuevoCliente: null,
      filterCliente: false
    });
    this.selectItemCliente = false;
  }

  handleFilterCliente = async (event) => {
    const searchWord = this.selectItemCliente ? '' : event.target.value;
    await this.setStateAsync({ idCliente: '', cliente: searchWord });

    this.selectItemCliente = false;
    if (searchWord.length === 0) {
      await this.setStateAsync({ clientes: [] });
      return;
    }

    if (this.state.filterCliente) return;

    await this.setStateAsync({ filterCliente: true });

    const params = {
      "opcion": 1,
      "filter": searchWord,
      "cliente": true,
    };

    const clientes = await this.fetchFiltrarPersona(params)

    this.setState({
      filterCliente: false,
      clientes: clientes,
    });

  }

  handleSelectItemCliente = (value) => {
    this.setState({
      cliente: value.documento + ' - ' + value.informacion,
      clientes: [],
      idCliente: value.idPersona,
    }, () => this.selectItemCliente = true);
  }

  //------------------------------------------------------------------------------------------
  // Filtrar producto mobile
  //------------------------------------------------------------------------------------------

  // handleClearInputProductoMobile = async () => {
  //   await this.setStateAsync({
  //     productosMobile: [],
  //     productoMobile: '',
  //     filterProductoMobile: false
  //   });
  //   this.selectItemProductoMobile = false;
  // }

  // handleFilterProductoMobile = async (event) => {
  //   const searchWord = this.selectItemProductoMobile ? '' : event.target.value;
  //   await this.setStateAsync({ productoMobile: searchWord });

  //   this.selectItemProductoMobile = false;
  //   if (searchWord.length === 0) {
  //     await this.setStateAsync({ productosMobile: [] });
  //     return;
  //   }

  //   if (this.state.filterProductoMobile) return;

  //   await this.setStateAsync({ filterProductoMobile: true });

  //   const params = {
  //     codBar: this.state.filtrarCodBar ? 1 : 0,
  //     filtrar: searchWord,
  //     idSucursal: this.state.idSucursal,
  //   };

  //   const result = await this.fetchFiltrarVenta(params);

  //   this.setState({
  //     productosMobile: result,
  //     filterProductoMobile: false
  //   });
  // }

  // handleSelectItemProductoMobile = (value) => {
  //   this.setState({
  //     //   cliente: value.documento + ' - ' + value.informacion,
  //     clientes: [],
  //     //   idCliente: value.idPersona,
  //   }, () => {
  //     console.log(value)
  //   });
  // }

  //------------------------------------------------------------------------------------------
  // Componente footer
  //------------------------------------------------------------------------------------------

  handleOpenSale = async () => {
    if (isEmpty(this.state.detalleVenta)) {
      alertWarning('Venta', 'La lista de productos esta vacía.', () => {
        this.refProducto.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idComprobante)) {
      alertWarning('Venta', 'Seleccione un comprobante.');
      return;
    }

    if (isEmpty(this.state.idCliente) && this.state.nuevoCliente === null) {
      alertWarning('Venta', 'Selecciona un cliente.', () => {
        this.refCliente.current.focus();
      });
      return;
    }

    this.handleOpenModalSale();
  }

  handleClearSale = async () => {
    alertDialog("Venta", "Los productos serán eliminados de la venta actual ¿Desea continuar?", async (accept) => {
      if (accept) {
        this.reloadView()
      }
    })
  }

  //------------------------------------------------------------------------------------------
  // Modal Venta
  //------------------------------------------------------------------------------------------
  handleOpenModalSale = () => {
    this.setState({ loadingModal: true, isOpenSale: true })
  }

  handleCloseModalSale = async () => {
    this.setState({ isOpenSale: false })
  }

  handleOnOpenModalSale = () => {
    const importeTotal = this.state.detalleVenta.reduce((accumulator, item) => {
      const cantidad = item.idTipoTratamientoProducto === SERVICIO
        ? item.cantidad
        : item.inventarios.reduce((acc, current) => acc + current.cantidad, 0);

      const totalProductPrice = item.precio * cantidad;
      return accumulator + totalProductPrice;
    }, 0)

    const metodo = this.state.bancos.find((item) => item.preferido === 1);

    this.refMetodoContado.current.value = metodo ? metodo.idBanco : '';

    if (metodo) {
      const item = {
        idBanco: metodo.idBanco,
        nombre: metodo.nombre,
        monto: '',
        vuelto: metodo.vuelto,
        descripcion: '',
      }

      this.setState((prevState) => ({
        bancosAgregados: [...prevState.bancosAgregados, item],
      }))
    }

    this.setState({ importeTotal, loadingModal: false });
  }

  handleOnHiddenModalSale = () => {
    this.setState({
      formaPago: CONTADO,

      frecuenciaPagoCredito: new Date().getDate() > 15 ? '30' : '15',
      numeroCuotas: '',

      frecuenciaPago: new Date().getDate() > 15 ? '30' : '15',

      bancosAgregados: [],
    })
  }

  handleSelectTipoPago = (tipo) => {
    this.setState({ formaPago: tipo });
  }

  handleSelectNumeroCuotas = (event) => {
    this.setState({ numeroCuotas: event.target.value });
  }

  handleSelectFrecuenciaPagoCredito = (event) => {
    this.setState({ frecuenciaPagoCredito: event.target.value });
  }

  handleSelectFrecuenciaPago = (event) => {
    this.setState({ frecuenciaPago: event.target.value });
  }

  handleAddBancosAgregados = () => {
    const listAdd = this.state.bancosAgregados.find((item) => item.idBanco === this.refMetodoContado.current.value);

    if (listAdd) {
      return;
    }

    const metodo = this.state.bancos.find((item) => item.idBanco === this.refMetodoContado.current.value,);

    const item = {
      idBanco: metodo.idBanco,
      nombre: metodo.nombre,
      monto: '',
      vuelto: metodo.vuelto,
      descripcion: '',
    };

    this.setState((prevState) => ({
      bancosAgregados: [...prevState.bancosAgregados, item],
    }));
  }

  handleRemoveItemBancosAgregados = (idBanco) => {
    const bancosAgregados = this.state.bancosAgregados.filter(
      (item) => item.idBanco !== idBanco,
    );
    this.setState({ bancosAgregados });
  };

  handleInputMontoBancosAgregados = (event, idBanco) => {
    const { value } = event.target;

    this.setState((prevState) => ({
      bancosAgregados: prevState.bancosAgregados.map((item) => {
        if (item.idBanco === idBanco) {
          return { ...item, monto: value ? value : '' };
        } else {
          return item;
        }
      }),
    }));
  }

  handleStarProduct = (producto) => {
    // Despachar la acción para manejar el cambio en Redux
    this.props.handleStarProduct(producto);

    // Actualizar el estado local del componente
    this.setState((prevState) => {
      const updatedProductos = prevState.productos.map((item) =>
        item.idProducto === producto.idProducto
          ? { ...item, preferido: producto.preferido }
          : item,
      );

      return {
        productos: updatedProductos,
      };
    });
  }

  handleProcessContado = async () => {
    const {
      formaPago,
      idComprobante,
      idMoneda,
      idImpuesto,
      idCliente,
      idSucursal,
      idUsuario,
      comentario,
      nuevoCliente,
      detalleVenta,
      bancosAgregados,
      importeTotal,
    } = this.state;

    let metodoPagosLista = bancosAgregados.map(item => ({ ...item }));

    if (isEmpty(metodoPagosLista)) {
      alertWarning('Venta', 'Tiene que agregar método de cobro para continuar.');
      return;
    }

    if (metodoPagosLista.some((item) => !isNumeric(item.monto))) {
      alertWarning('Venta', 'Hay montos del metodo de cobro que no tiene valor.', () => {
        validateNumericInputs(this.refMetodoPagoContenedor);
      });
      return;
    }

    const metodoCobroTotal = metodoPagosLista.reduce((accumulator, item) => accumulator += parseFloat(item.monto), 0);

    if (metodoPagosLista.length > 1) {
      if (metodoCobroTotal !== importeTotal) {
        alertWarning('Venta', 'Al tener mas de 2 métodos de cobro el monto debe ser igual al total.', () => {
          validateNumericInputs(this.refMetodoPagoContenedor);
        });
        return;
      }
    } else {
      const metodo = metodoPagosLista[0];
      if (metodo.vuelto === 1) {
        if (metodoCobroTotal < importeTotal) {
          alertWarning('Venta', 'El monto a cobrar es menor que el total.', () => {
            validateNumericInputs(this.refMetodoPagoContenedor);
          });
          return;
        }

        metodoPagosLista.forEach(item => {
          item.descripcion = `Pago con ${rounded(parseFloat(item.monto))} y su vuelto es ${rounded(parseFloat(item.monto) - importeTotal)}`;
          item.monto = importeTotal;
        });
      } else {
        if (metodoCobroTotal !== importeTotal) {
          alertWarning('Venta', 'El monto a cobrar debe ser igual al total.', () => {
            validateNumericInputs(this.refMetodoPagoContenedor);
          });
          return;
        }
      }
    }

    alertDialog('Venta', '¿Estás seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idFormaPago: formaPago,
          idComprobante: idComprobante,
          idMoneda: idMoneda,
          idImpuesto: idImpuesto,
          idCliente: idCliente,
          idSucursal: idSucursal,
          comentario: comentario,
          idUsuario: idUsuario,
          estado: 1,
          nuevoCliente: nuevoCliente,
          detalleVenta: detalleVenta,
          bancosAgregados: metodoPagosLista,
        };

        this.handleCloseModalSale();
        alertInfo('Venta', 'Procesando venta...');

        const response = await createVenta(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Venta', response.data.message, () => {
            this.handleOpenImpresion(response.data.idVenta);
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getBody() !== '') {
            const body = response.getBody().map((item) =>
              `<tr>
                  <td>${item.nombre}</td>
                  <td>${formatDecimal(item.cantidadActual)}</td>
                  <td>${formatDecimal(item.cantidadReal)}</td>
                  <td>${formatDecimal(item.cantidadActual - item.cantidadReal)}</td>
                </tr>`,
            );

            alertHTML('Venta',
              `<div class="d-flex flex-column align-items-center">
                    <h5>Productos con cantidades faltantes</h5>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad a Vender</th>
                                <th>Cantidad de Inventario</th>
                                <th>Cantidad Faltante</th>
                            </tr>
                        </thead>
                        <tbody>
                        ${body}
                        </tbody>
                    </table>
                </div>`,
            );
          } else {
            alertWarning('Venta', response.getMessage());
          }
        }
      }
    });
  };

  handleProcessCreditoFijo = async () => {
    const {
      formaPago,
      idComprobante,
      idMoneda,
      idImpuesto,
      idCliente,
      idSucursal,
      idUsuario,
      comentario,
      nuevoCliente,
      detalleVenta,
      numeroCuotas,
      frecuenciaPagoCredito,
      importeTotal
    } = this.state;

    if (!isNumeric(numeroCuotas)) {
      alertWarning("Venta", "Ingrese el número de cuotas", () => {
        this.refNumeroCuotas.current.focus()
      })
      return;
    }

    if (parseFloat(numeroCuotas) < 1) {
      alertWarning("Venta", "El número de cuotas no puede menor a 0", () => {
        this.refNumeroCuotas.current.focus()
      })
      return;
    }

    if (isEmpty(frecuenciaPagoCredito)) {
      alertWarning("Venta", "Selecciona la frecuencia de cobros.", () => {
        this.refFrecuenciaPagoCredito.current.focus()
      })
      return;
    }

    alertDialog('Venta', '¿Estás seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idFormaPago: formaPago,
          idComprobante: idComprobante,
          idMoneda: idMoneda,
          idImpuesto: idImpuesto,
          idCliente: idCliente,
          idSucursal: idSucursal,
          comentario: comentario,
          idUsuario: idUsuario,
          estado: 2,
          nuevoCliente: nuevoCliente,
          detalleVenta: detalleVenta,
          numCuotas: numeroCuotas,
          frecuenciaPagoCredito: frecuenciaPagoCredito,
          importeTotal: importeTotal
        };

        this.handleCloseModalSale();
        alertInfo('Venta', 'Procesando venta...');

        const response = await createVenta(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Venta', response.data.message, () => {
            this.handleOpenImpresion(response.data.idVenta);
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getBody() !== '') {
            const body = response.getBody().map((item) =>
              `<tr>
                  <td>${item.nombre}</td>
                  <td>${formatDecimal(item.cantidadActual)}</td>
                  <td>${formatDecimal(item.cantidadReal)}</td>
                  <td>${formatDecimal(item.cantidadActual - item.cantidadReal)}</td>
                </tr>`,
            );

            alertHTML('Venta',
              `<div class="d-flex flex-column align-items-center">
                    <h5>Productos con cantidades faltantes</h5>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad a Vender</th>
                                <th>Cantidad de Inventario</th>
                                <th>Cantidad Faltante</th>
                            </tr>
                        </thead>
                        <tbody>
                        ${body}
                        </tbody>
                    </table>
                </div>`,
            );
          } else {
            alertWarning('Venta', response.getMessage());
          }
        }
      }
    });
  };

  handleProcessCreditoVariable = async () => {
    // const {
    //   formaPago,
    //   idComprobante,
    //   idMoneda,
    //   idImpuesto,
    //   idCliente,
    //   idSucursal,
    //   idUsuario,
    //   comentario,
    //   nuevoCliente,
    //   detalleVenta,
    //   bancosAgregados,
    //   importeTotal,
    // } = this.state;
    /*
        let metodoPagoLista = [...bancosAgregados];
    
        if (isEmpty(metodoPagoLista)) {
          alertWarning('Venta', 'Tiene que agregar método de cobro para continuar.');
          return;
        }
    
        if (metodoPagoLista.filter((item) => !isNumeric(item.monto)).length !== 0) {
          alertWarning('Venta', 'Hay montos del metodo de cobro que no tiene valor.');
          return;
        }
    
        const metodoCobroTotal = metodoPagoLista.reduce((accumulator, item) => {
          return (accumulator += parseFloat(item.monto));
        }, 0);
    
        if (metodoPagoLista.length > 1) {
          if (metodoCobroTotal !== importeTotal) {
            alertWarning('Venta', 'Al tener mas de 2 métodos de cobro el monto debe ser igual al total.');
            return;
          }
        } else {
          const metodo = metodoPagoLista[0];
          if (metodo.vuelto === 1) {
            if (metodoCobroTotal < importeTotal) {
              alertWarning('Venta', 'El monto a cobrar es menor que el total.');
              return;
            }
    
            metodoPagoLista.map((item) => {
              item.descripcion = `Pago con ${rounded(parseFloat(item.monto))} y su vuelto es ${rounded(parseFloat(item.monto) - importeTotal)}`;
              item.monto = importeTotal;
              return item;
            });
          } else {
            if (metodoCobroTotal !== importeTotal) {
              alertWarning('Venta', 'El monto a cobrar debe ser igual al total.');
              return;
            }
          }
        }
    
        alertDialog('Venta', '¿Estás seguro de continuar?', async (accept) => {
          if (accept) {
            const data = {
              idFormaPago: formaPago,
              idComprobante: idComprobante,
              idMoneda: idMoneda,
              idImpuesto: idImpuesto,
              idCliente: idCliente,
              idSucursal: idSucursal,
              comentario: comentario,
              idUsuario: idUsuario,
              estado: 1,
              nuevoCliente: nuevoCliente,
              detalleVenta: detalleVenta,
              bancosAgregados: bancosAgregados,
            };
    
            this.handleCloseModalSale();
            alertInfo('Venta', 'Procesando venta...');
    
            const response = await createVenta(data);
    
            if (response instanceof SuccessReponse) {
              alertSuccess('Venta', response.data.message, () => {
                this.handleOpenImpresion(response.data.idVenta);
              });
            }
    
            if (response instanceof ErrorResponse) {
              if (response.getBody() !== '') {
                const body = response.getBody().map((item) =>
                  `<tr>
                      <td>${item.nombre}</td>
                      <td>${formatDecimal(item.cantidadActual)}</td>
                      <td>${formatDecimal(item.cantidadReal)}</td>
                      <td>${formatDecimal(item.cantidadActual - item.cantidadReal)}</td>
                    </tr>`,
                );
    
                alertHTML('Venta',
                  `<div class="d-flex flex-column align-items-center">
                        <h5>Productos con cantidades faltantes</h5>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad a Vender</th>
                                    <th>Cantidad de Inventario</th>
                                    <th>Cantidad Faltante</th>
                                </tr>
                            </thead>
                            <tbody>
                            ${body}
                            </tbody>
                        </table>
                    </div>`,
                );
              } else {
                alertWarning('Venta', response.getMessage());
              }
            }
          }
        });*/
  };

  handleProcessAdelantado = async () => {
    // const {
    //   formaPago,
    //   idComprobante,
    //   idMoneda,
    //   idImpuesto,
    //   idCliente,
    //   idSucursal,
    //   idUsuario,
    //   comentario,
    //   nuevoCliente,
    //   detalleVenta,
    //   bancosAgregados,
    //   importeTotal,
    // } = this.state;
    /*
        let metodoPagoLista = [...bancosAgregados];
    
        if (isEmpty(metodoPagoLista)) {
          alertWarning('Venta', 'Tiene que agregar método de cobro para continuar.');
          return;
        }
    
        if (metodoPagoLista.filter((item) => !isNumeric(item.monto)).length !== 0) {
          alertWarning('Venta', 'Hay montos del metodo de cobro que no tiene valor.');
          return;
        }
    
        const metodoCobroTotal = metodoPagoLista.reduce((accumulator, item) => {
          return (accumulator += parseFloat(item.monto));
        }, 0);
    
        if (metodoPagoLista.length > 1) {
          if (metodoCobroTotal !== importeTotal) {
            alertWarning('Venta', 'Al tener mas de 2 métodos de cobro el monto debe ser igual al total.');
            return;
          }
        } else {
          const metodo = metodoPagoLista[0];
          if (metodo.vuelto === 1) {
            if (metodoCobroTotal < importeTotal) {
              alertWarning('Venta', 'El monto a cobrar es menor que el total.');
              return;
            }
    
            metodoPagoLista.map((item) => {
              item.descripcion = `Pago con ${rounded(parseFloat(item.monto))} y su vuelto es ${rounded(parseFloat(item.monto) - importeTotal)}`;
              item.monto = importeTotal;
              return item;
            });
          } else {
            if (metodoCobroTotal !== importeTotal) {
              alertWarning('Venta', 'El monto a cobrar debe ser igual al total.');
              return;
            }
          }
        }
    
        alertDialog('Venta', '¿Estás seguro de continuar?', async (accept) => {
          if (accept) {
            const data = {
              idFormaPago: formaPago,
              idComprobante: idComprobante,
              idMoneda: idMoneda,
              idImpuesto: idImpuesto,
              idCliente: idCliente,
              idSucursal: idSucursal,
              comentario: comentario,
              idUsuario: idUsuario,
              estado: 1,
              nuevoCliente: nuevoCliente,
              detalleVenta: detalleVenta,
              bancosAgregados: bancosAgregados,
            };
    
            this.handleCloseModalSale();
            alertInfo('Venta', 'Procesando venta...');
    
            const response = await createVenta(data);
    
            if (response instanceof SuccessReponse) {
              alertSuccess('Venta', response.data.message, () => {
                this.handleOpenImpresion(response.data.idVenta);
              });
            }
    
            if (response instanceof ErrorResponse) {
              if (response.getBody() !== '') {
                const body = response.getBody().map((item) =>
                  `<tr>
                      <td>${item.nombre}</td>
                      <td>${formatDecimal(item.cantidadActual)}</td>
                      <td>${formatDecimal(item.cantidadReal)}</td>
                      <td>${formatDecimal(item.cantidadActual - item.cantidadReal)}</td>
                    </tr>`,
                );
    
                alertHTML('Venta',
                  `<div class="d-flex flex-column align-items-center">
                        <h5>Productos con cantidades faltantes</h5>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad a Vender</th>
                                    <th>Cantidad de Inventario</th>
                                    <th>Cantidad Faltante</th>
                                </tr>
                            </thead>
                            <tbody>
                            ${body}
                            </tbody>
                        </table>
                    </div>`,
                );
              } else {
                alertWarning('Venta', response.getMessage());
              }
            }
          }
        });*/
  };

  handleSaveSale = () => {
    if (this.state.formaPago === CONTADO) {
      this.handleProcessContado();
    }

    if (this.state.formaPago === CREDITO_FIJO) {
      this.handleProcessCreditoFijo();
    }

    if (this.state.formaPago === CREDITO_VARIABLE) {
      this.handleProcessCreditoVariable();
    }

    if (this.state.formaPago === ADELANTADO) {
      this.handleProcessAdelantado();
    }
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

  render() {
    return (
      <PosContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <ModalSale
          refModal={this.refSale}
          isOpen={this.state.isOpenSale}
          onOpen={this.handleOnOpenModalSale}
          onHidden={this.handleOnHiddenModalSale}
          onClose={this.handleCloseModalSale}

          loading={this.state.loadingModal}
          refMetodoPagoContenedor={this.refMetodoPagoContenedor}

          formaPago={this.state.formaPago}
          handleSelectTipoPago={this.handleSelectTipoPago}

          refNumeroCuotas={this.refNumeroCuotas}
          numeroCuotas={this.state.numeroCuotas}
          handleSelectNumeroCuotas={this.handleSelectNumeroCuotas}

          refFrecuenciaPagoCredito={this.refFrecuenciaPagoCredito}
          frecuenciaPagoCredito={this.state.frecuenciaPagoCredito}
          handleSelectFrecuenciaPagoCredito={this.handleSelectFrecuenciaPagoCredito}

          refFrecuenciaPago={this.refFrecuenciaPago}
          frecuenciaPago={this.state.frecuenciaPago}
          handleSelectFrecuenciaPago={this.handleSelectFrecuenciaPago}

          codiso={this.state.codiso}
          importeTotal={this.state.importeTotal}

          refMetodoContado={this.refMetodoContado}
          bancos={this.state.bancos}
          bancosAgregados={this.state.bancosAgregados}
          handleAddBancosAgregados={this.handleAddBancosAgregados}
          handleInputMontoBancosAgregados={this.handleInputMontoBancosAgregados}
          handleRemoveItemBancosAgregados={this.handleRemoveItemBancosAgregados}

          handleSaveSale={this.handleSaveSale}
        />

        <ModalImpresion
          refModal={this.refModalImpresion}
          isOpen={this.state.isOpenImpresion}
          handleClose={this.handleCloseImpresion}

          handlePrintA4={this.handleOpenImpresionA4}
          handlePrintTicket={this.handleOpenImpresionTicket}
        />

        <ModalPreImpresion
          refModal={this.refModalPreImpresion}
          isOpen={this.state.isOpenPreImpresion}
          handleClose={this.handleClosePreImpresion}

          loading={this.state.loadingPreImpresion}
          message={this.state.messagePreImpresion}

          handlePrintA4={this.handleOpenPreImpresionA4}
          handlePrintTicket={this.handleOpenPreImpresionTicket}
        />

        <ModalVenta
          refModal={this.refModalVenta}
          isOpen={this.state.isOpenVenta}
          handleOpen={this.handleOnOpenVenta}
          handleHidden={this.handleOnHiddenVenta}
          handleClose={this.handleCloseVenta}

          loading={this.state.loadingVenta}
          lista={this.state.listaVenta}
          totalPaginacion={this.state.totalPaginacionVenta}
          paginacion={this.state.paginacionVenta}
          fillTable={this.handlePaginacionVenta}
          restart={this.state.restartVenta}
          fechaInicio={this.state.fechaInicioVenta}
          fechaFinal={this.state.fechaFinalVenta}
          searchText={this.handleSearchTextVenta}
          handleRestart={this.loadInitVenta}
          handleFechaInicio={this.handleFechaInicioVenta}
          handleFechaFinal={this.handleFechaFinalVenta}
          handleSeleccionar={this.handleSeleccionarVenta}
        />

        <ModalCotizacion
          refModal={this.refModalCotizacion}
          isOpen={this.state.isOpenCotizacion}
          handleOpen={this.handleOnOpenCotizacion}
          handleHidden={this.handleOnHiddenCotizacion}
          handleClose={this.handleCloseCotizacion}

          loading={this.state.loadingCotizacion}
          lista={this.state.listaCotizacion}
          totalPaginacion={this.state.totalPaginacionCotizacion}
          paginacion={this.state.paginacionCotizacion}
          fillTable={this.handlePaginacionCotizacion}
          restart={this.state.restartCotizacion}
          fechaInicio={this.state.fechaInicioCotizacion}
          fechaFinal={this.state.fechaFinalCotizacion}
          searchText={this.handleSearchTextCotizacion}
          handleRestart={this.loadInitCotizacion}
          handleFechaInicio={this.handleFechaInicioCotizacion}
          handleFechaFinal={this.handleFechaFinalCotizacion}
          handleSeleccionar={this.handleSeleccionarCotizacion}
        />

        <section className="invoice-left">
          <InvoiceView
            codiso={this.state.codiso}
            refProducto={this.refProducto}
            producto={this.state.producto}
            productos={this.state.productos}
            filtrarCodBar={this.state.filtrarCodBar}
            filtrarProducto={this.state.filtrarProducto}
            handleCodBarProducto={this.handleCodBarProducto}
            handleAllProducto={this.handleAllProducto}
            handleFilterCodBarProducto={this.handleFilterCodBarProducto}
            handleSearchCodBarProducto={this.handleSearchCodBarProducto}
            handleFilterAllProducto={this.handleFilterAllProducto}
            handleAddItem={this.handleAddItem}
            handleStarProduct={this.handleStarProduct}
          />
        </section>
        <section className="invoice-right">
          <InvoiceTicket
            nombreComporbante={this.state.nombreComporbante}
            handleOpenPreImpresion={this.handleOpenPreImpresion}
            handleOpenVenta={this.handleOpenVenta}
            handleOpenCotizacion={this.handleOpenCotizacion}
            handleOpenOptions={this.handleOpenOptions}
          />

          <InvoiceVoucher
            refComprobante={this.refComprobante}
            idComprobante={this.state.idComprobante}
            comprobantes={this.state.comprobantes}
            handleSelectComprobante={this.handleSelectComprobante}
          />

          <InvoiceClient
            handleOpenCliente={this.handleOpenCliente}
            placeholder="Filtrar clientes..."
            refCliente={this.refCliente}
            cliente={this.state.cliente}
            clientes={this.state.clientes}
            handleClearInput={this.handleClearInputCliente}
            handleFilter={this.handleFilterCliente}
            handleSelectItem={this.handleSelectItemCliente}
          />

          {/* <InvoiceListPrices
            codiso={this.state.codiso}
            refProductoMobile={this.refProductoMobile}
            placeholder="Filtrar productos..."
            productoMobile={this.state.productoMobile}
            productos={this.state.productosMobile}
            handleClearInput={this.handleClearInputProductoMobile}
            handleFilter={this.handleFilterProductoMobile}
            handleSelectItem={this.handleSelectItemProductoMobile}
          /> */}

          <InvoiceDetail
            codiso={this.state.codiso}
            detalleVenta={this.state.detalleVenta}
            handleMinus={this.handleMinusProducto}
            handlePlus={this.handlePlusProducto}
            handleEdit={this.handleEditProducto}
            handleRemove={this.handleRemoveProducto}
          />

          <InvoiceFooter
            codiso={this.state.codiso}
            impuestos={this.state.impuestos}
            detalleVenta={this.state.detalleVenta}
            handleOpenSale={this.handleOpenSale}
            handleClearSale={this.handleClearSale}
          />
        </section>

        <ModalConfiguration
          idModalConfiguration={this.idModalConfiguration}
          refImpuesto={this.refImpuesto}
          impuestos={this.state.impuestos}
          refMoneda={this.refMoneda}
          monedas={this.state.monedas}
          refAlmacen={this.refAlmacen}
          almacenes={this.state.almacenes}
          refComentario={this.refComentario}
          handleSaveOptions={this.handleSaveOptions}
          handleCloseOptions={this.handleCloseOptions}
        />

        <ModalCliente
          idModal={this.idModalCliente}
          loading={this.state.loadingCliente}
          tiposDocumentos={this.state.tiposDocumentos}

          refIdTipoDocumentoPn={this.refIdTipoDocumentoPn}
          idTipoDocumentoPn={this.state.idTipoDocumentoPn}
          handleSelectIdTipoDocumentoPn={this.handleSelectIdTipoDocumentoPn}

          refNumeroDocumentoPn={this.refNumeroDocumentoPn}
          numeroDocumentoPn={this.state.numeroDocumentoPn}
          handleInputNumeroDocumentoPn={this.handleInputNumeroDocumentoPn}

          handleApiReniec={this.handleGetApiReniec}

          refInformacionPn={this.refInformacionPn}
          informacionPn={this.state.informacionPn}
          handleInputInformacionPn={this.handleInputInformacionPn}

          refNumerCelularPn={this.refNumerCelularPn}
          numerCelularPn={this.state.numerCelularPn}
          handleInputNumeroCelularPn={this.handleInputNumeroCelularPn}

          refDireccionPn={this.refDireccionPn}
          direccionPn={this.state.direccionPn}
          handleInputDireccionPn={this.handleInputDireccionPn}

          refIdTipoDocumentoPj={this.refIdTipoDocumentoPj}
          idTipoDocumentoPj={this.state.idTipoDocumentoPj}
          handleSelectIdTipoDocumentoPj={this.handleSelectIdTipoDocumentoPj}

          refNumeroDocumentoPj={this.refNumeroDocumentoPj}
          numeroDocumentoPj={this.state.numeroDocumentoPj}
          handleInputNumeroDocumentoPj={this.handleInputNumeroDocumentoPj}

          handleApiSunat={this.handleGetApiSunat}

          refInformacionPj={this.refInformacionPj}
          informacionPj={this.state.informacionPj}
          handleInputInformacionPj={this.handleInputInformacionPj}

          refNumerCelularPj={this.refNumerCelularPj}
          numerCelularPj={this.state.numerCelularPj}
          handleInputNumeroCelularPj={this.handleInputNumeroCelularPj}

          refDireccionPj={this.refDireccionPj}
          direccionPj={this.state.direccionPj}
          handleInputDireccionPj={this.handleInputDireccionPj}

          handleSave={this.handleSaveCliente}
          handleClickIdTipoCliente={this.handleClickIdTipoCliente}
          handleClose={this.handleCloseCliente}
        />

        <ModalProducto
          idModal={this.idModalProducto}
          loading={this.state.loadingProducto}
          producto={this.producto}
          refPrecio={this.refPrecioProducto}
          refBonificacion={this.refBonificacionProducto}
          refDescripcion={this.refDescripcionProducto}
          listPrecio={this.listPrecioProducto}
          handleSave={this.handleSaveProducto}
          handleClose={this.handleCloseProducto}
        />

        <ModalAgregar
          refModal={this.refModalAgregar}
          isOpen={this.state.isOpenAgregar}
          onOpen={this.handleOnOpenModalAgregar}
          onHidden={this.handleOnHiddenModalAgregar}
          onClose={this.handleCloseAgregar}

          title={this.state.tituloAgregar}
          subTitle={this.state.subTituloAgregar}

          refCantidad={this.refCantidadAgregar}
          cantidad={this.state.cantidadAgregar}
          handleInputCantidad={this.handleInputCantidad}

          handleAdd={this.handleSaveAgregar}
        />
      </PosContainerWrapper>
    );
  }
}

VentaCrear.propTypes = {
  productos: PropTypes.array.isRequired,
  favoriteProducts: PropTypes.func.isRequired,
  handleStarProduct: PropTypes.func.isRequired,
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string.isRequired,
    }).isRequired,
    project: PropTypes.shape({
      idSucursal: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

/**
 *
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
  return {
    token: state.reducer,
    productos: state.predeterminadoReducer.products,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleStarProduct: (idProducto) => dispatch(starProduct(idProducto)),
    favoriteProducts: (productos) => dispatch(favoriteProducts(productos)),
  };
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */

const ConnectedVentaCrear = connect(mapStateToProps, mapDispatchToProps)(VentaCrear);

export default ConnectedVentaCrear;