import React from 'react';
import printJS from 'print-js';
import {
  convertNullText,
  formatDecimal,
  isEmpty,
  isNumeric,
  readDataFile,
  text,
} from '../../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { PosContainerWrapper } from '../../../../../../components/Container';
import InvoiceTicket from './component/InvoiceTicket';
import {
  getPersonaPredeterminado,
  comboComprobante,
  comboImpuesto,
  comboMoneda,
  filtrarPersona,
  preferidosProducto,
  obtenerListaPrecioProducto,
  comboTipoDocumento,
  comboAlmacen,
  forSaleCotizacion,
  detailOnlyVentaVenta,
  createVenta,
  obtenerPreVentaPdf,
  documentsPdfInvoicesVenta,
} from '../../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../../model/class/response';
import ErrorResponse from '../../../../../../model/class/error-response';
import { CANCELED } from '../../../../../../model/types/types';
import InvoiceDetail from './component/InvoiceDetail';
import InvoiceClient from './component/InvoiceClient';
import InvoiceVoucher from './component/InvoiceVoucher';
import InvoiceFooter from './component/InvoiceFooter';
import InvoiceView from './component/InvoiceView';
import CustomComponent from '../../../../../../model/class/custom-component';
import SidebarCliente from './component/SidebarCliente';
import {
  VENTA,
} from '../../../../../../model/types/tipo-comprobante';
import PropTypes from 'prop-types';
import { A_GRANEL, SERVICIO, UNIDADES, VALOR_MONETARIO } from '../../../../../../model/types/tipo-tratamiento-producto';
import { CLIENTE_NATURAL } from '../../../../../../model/types/tipo-cliente';
import { SpinnerView } from '../../../../../../components/Spinner';
import { getDni, getRuc } from '../../../../../../network/rest/apisperu.network';
import { setProductosFavoritos, starProduct } from '../../../../../../redux/predeterminadoSlice';
import { ModalImpresion, ModalPreImpresion } from '../../../../../../components/MultiModal';
import ModalAgregar from '../common/ModalAgregar';
import ModalCotizacion from '../common/ModalCotizacion';
import ModalVenta from '../common/ModalVenta';
import SidebarConfiguration from '../../../../../../components/SidebarConfiguration';
import ModalTransaccion from '../../../../../../components/ModalTransaccion';
import SweetAlert from '../../../../../../model/class/sweet-alert';
import SidebarProducto from './component/SidebarProducto';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class VentaCrear extends CustomComponent {

  constructor(props) {
    super(props);

    this.state = {
      // Atributos de carga
      loading: true,
      msgLoading: 'Cargando datos...',

      // Atributos principales
      idVenta: '',
      idComprobante: '',

      // Filtrar cliente
      idCliente: '',
      nuevoCliente: null,

      // Lista de datos
      comprobantes: [],
      productos: [],
      clientes: [],
      impuestos: [],
      monedas: [],
      almacenes: [],
      tiposDocumentos: [],
      detalleVenta: [],

      // Atributos libres
      nombreComporbante: '',
      codiso: '',

      // Atributos del modal impresión
      isOpenImpresion: false,

      // Atributos del modal pre impresión
      isOpenPreImpresion: false,

      // Atributos del modal cotización
      isOpenCotizacion: false,
      cotizacion: null,

      // Atributos del modal venta
      isOpenVenta: false,

      // Atributos del modal cobrar
      isOpenTerminal: false,

      // Atributos del modal configuración
      idImpuesto: '',
      idMoneda: '',
      idAlmacen: '',
      observacion: '',
      nota: '',
      cacheConfiguracion: null,

      // Atributos del modal agregar
      isOpenAgregar: false,

      // Atributos del modal cliente
      loadingCliente: false,
      idTipoCliente: CLIENTE_NATURAL,
      idTipoDocumento: '',
      numeroDocumento: '',
      informacion: '',
      numeroCelular: '',
      direccion: '',
      cacheCliente: null,

      // Atributos del modal producto
      loadingProducto: true,

      // Id principales
      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.initial = { ...this.state };

    this.alert = new SweetAlert();

    // Referencia al modal cobrar
    this.refInvoiceView = React.createRef();

    // Referencia al modal impresión
    this.refModalImpresion = React.createRef();

    // Referencia al modal de cotización
    this.refModalCotizacion = React.createRef();

    // Referencia al modal de cotización
    this.refModalVenta = React.createRef();

    // Referencia al tipo de comprobante
    this.refComprobante = React.createRef();

    // Referencia al modal agregar
    this.refModalAgregar = React.createRef();

    // Referencia al tipo de cliente
    this.refCliente = React.createRef();
    this.refValueCliente = React.createRef();

    // Atributos para el modal configuración
    this.idSidebarConfiguration = 'idSidebarConfiguration';
    this.refImpuesto = React.createRef();
    this.refMoneda = React.createRef();
    this.refAlmacen = React.createRef();
    this.refObservacion = React.createRef();
    this.refNota = React.createRef();

    // Atributos para el modal producto
    this.idSidebarProducto = 'idSidebarProducto';
    this.producto = null;
    this.refPrecioProducto = React.createRef();
    this.refBonificacionProducto = React.createRef();
    this.refDescripcionProducto = React.createRef();
    this.listPrecioProducto = [];

    // Atributos para el modal cliente
    this.idSidebarCliente = 'idSidebarCliente';
    this.refIdTipoDocumento = React.createRef();
    this.refNumeroDocumento = React.createRef();
    this.refInformacion = React.createRef();
    this.refNumeroCelular = React.createRef();
    this.refDireccion = React.createRef();

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
      tiposDocumentos,
      almacenes
    ] = await Promise.all([
      this.fetchComprobante(VENTA),
      this.fetchMoneda(),
      this.fetchImpuesto(),
      this.fetchClientePredeterminado(),
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
      almacenes,

      idComprobante: comprobanteFilter ? comprobanteFilter.idComprobante : '',
      nombreComporbante: !comprobanteFilter ? "Ninguno" : comprobanteFilter.nombre,

      idMoneda: monedaFilter ? monedaFilter.idMoneda : '',
      codiso: monedaFilter ? monedaFilter.codiso : 'PEN',

      idImpuesto: impuestoFilter ? impuestoFilter.idImpuesto : '',

      idAlmacen: almacenFilter ? almacenFilter.idAlmacen : '',

      tiposDocumentos,
    });

    const productos = await this.fetchProductoPreferidos({ idSucursal: this.state.idSucursal, idAlmacen: almacenFilter ? almacenFilter.idAlmacen : '' });
    this.props.setProductosFavoritos(productos);
    await this.setStateAsync({ productos: productos, loading: false, });
  }

  async fetchComprobante(tipo) {
    const params = {
      "tipo": tipo,
      "idSucursal": this.state.idSucursal
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

  async reloadProductoPreferidos() {
    const productos = await this.fetchProductoPreferidos({
      idSucursal: this.state.idSucursal,
      idAlmacen: this.state.idAlmacen
    });
    this.props.setProductosFavoritos(productos);
    await this.setStateAsync({ productos: productos });
  }

  reloadView = () => {
    this.setState(this.initial, async () => {
      await this.refCliente.current.restart();
      await this.loadingData();
      this.refInvoiceView.current.componentClear();
    })
  }

  addItemDetalle = (producto, precio, cantidad) => {
    const almacen = this.state.almacenes.find(item => item.idAlmacen == this.state.idAlmacen);

    const existingItem = this.state.detalleVenta.find((item) => item.idProducto === producto.idProducto);

    if (producto.idTipoTratamientoProducto === UNIDADES) {
      if (!existingItem) {
        const inventarios = [];

        inventarios.push({
          idAlmacen: almacen.idAlmacen,
          almacen: almacen.nombre,
          idInventario: producto.idInventario,
          cantidad: cantidad ? Number(producto.cantidad) : 1,
        });

        const newItem = {
          idProducto: producto.idProducto,
          codigo: producto.codigo,
          nombreProducto: producto.nombreProducto,
          idImpuesto: this.state.idImpuesto,
          precio: Number(producto.precio),
          medida: producto.medida,
          idTipoTratamientoProducto: producto.idTipoTratamientoProducto,
          tipo: producto.tipo,
          inventarios: inventarios
        };

        this.setState(prevState => ({
          detalleVenta: [...prevState.detalleVenta, newItem]
        }));

      } else {
        const existingInventario = existingItem.inventarios.some(item => item.idInventario === producto.idInventario);
        if (!existingInventario) {
          existingItem.inventarios.push({
            idAlmacen: almacen.idAlmacen,
            almacen: almacen.nombre,
            idInventario: producto.idInventario,
            cantidad: cantidad ? Number(producto.cantidad) : 1,
          });
        } else {
          for (const inventario of existingItem.inventarios) {
            if (inventario.idInventario === producto.idInventario) {
              inventario.cantidad += 1;
              break;
            }
          }
        }

        this.setState(prevState => ({
          detalleVenta: prevState.detalleVenta.map(item =>
            item.idProducto === existingItem.idProducto ? existingItem : item
          )
        }));
      }
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

        const newItem = {
          idProducto: producto.idProducto,
          codigo: producto.codigo,
          nombreProducto: producto.nombreProducto,
          idImpuesto: this.state.idImpuesto,
          precio: Number(precio),
          medida: producto.medida,
          idTipoTratamientoProducto: producto.idTipoTratamientoProducto,
          tipo: producto.tipo,
          inventarios: inventarios
        };

        this.setState(prevState => ({
          detalleVenta: [...prevState.detalleVenta, newItem]
        }));
      } else {
        existingItem.precio = Number(precio);

        this.setState(prevState => ({
          detalleVenta: prevState.detalleVenta.map(item =>
            item.idProducto === existingItem.idProducto ? existingItem : item
          )
        }));
      }
    }

    if (producto.idTipoTratamientoProducto === A_GRANEL) {
      if (!existingItem) {
        const inventarios = [];

        inventarios.push({
          idAlmacen: almacen.idAlmacen,
          almacen: almacen.nombre,
          idInventario: producto.idInventario,
          cantidad: Number(cantidad),
        });

        const newItem = {
          idProducto: producto.idProducto,
          codigo: producto.codigo,
          nombreProducto: producto.nombreProducto,
          idImpuesto: this.state.idImpuesto,
          precio: Number(producto.precio),
          medida: producto.medida,
          idTipoTratamientoProducto: producto.idTipoTratamientoProducto,
          tipo: producto.tipo,
          inventarios: inventarios
        };

        this.setState(prevState => ({
          detalleVenta: [...prevState.detalleVenta, newItem]
        }));
      } else {
        const existingInventario = existingItem.inventarios.some(item => item.idInventario === producto.idInventario);
        if (!existingInventario) {
          existingItem.inventarios.push({
            idAlmacen: almacen.idAlmacen,
            almacen: almacen.nombre,
            idInventario: producto.idInventario,
            cantidad: Number(cantidad),
          });
        } else {
          for (const inventario of existingItem.inventarios) {
            if (inventario.idInventario === producto.idInventario) {
              inventario.cantidad = Number(cantidad);
            }
          }
        }

        this.setState(prevState => ({
          detalleVenta: prevState.detalleVenta.map(item =>
            item.idProducto === existingItem.idProducto ? existingItem : item
          )
        }));
      }
    }

    if (producto.idTipoTratamientoProducto === SERVICIO) {
      if (!existingItem) {
        const newItem = {
          idProducto: producto.idProducto,
          codigo: producto.codigo,
          nombreProducto: producto.nombreProducto,
          idImpuesto: this.state.idImpuesto,
          precio: precio ? Number(precio) : Number(producto.precio),
          medida: producto.medida,
          idTipoTratamientoProducto: producto.idTipoTratamientoProducto,
          tipo: producto.tipo,
          cantidad: 1,
        };

        this.setState(prevState => ({
          detalleVenta: [...prevState.detalleVenta, newItem]
        }));
      }
    }
  }

  importeTotal = () => {
    return this.state.detalleVenta.reduce((accumulator, item) => {
      const cantidad = item.idTipoTratamientoProducto === SERVICIO
        ? item.cantidad
        : item.inventarios.reduce((acc, current) => acc + current.cantidad, 0);

      const totalProductPrice = item.precio * cantidad;
      return accumulator + totalProductPrice;
    }, 0);
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
    if (event.key === 'F1' && !this.state.isOpenImpresion && !this.state.isOpenTerminal && !this.state.isOpenAgregar && !this.state.isOpenCotizacion && !this.state.isOpenVenta) {
      this.handleOpenSale();
    }

    if (event.key === 'F2' && !this.state.isOpenImpresion && !this.state.isOpenTerminal && !this.state.isOpenAgregar && !this.state.isOpenCotizacion && !this.state.isOpenVenta) {
      this.handleClearSale();
    }
  }

  handleUpdateProductos = (data, isClear = false, initial = false) => {
    if (initial) {
      this.setState({
        productos: this.props.productos,
      });
      return
    }

    if (isClear) {
      this.setState({
        productos: data,
      });
      return
    }

    this.setState(prevState => ({
      productos: [...prevState.productos, data],
    }));
  }

  handleStarProduct = (producto) => {
    // Despachar la acción para manejar el cambio en Redux
    this.props.starProduct({
      params: {
        idSucursal: this.state.idSucursal,
        idAlmacen: this.state.idAlmacen
      },
      producto: producto
    });

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

  handleAddItem = async (producto) => {
    if (isEmpty(this.state.idImpuesto)) {
      this.alert.warning('Venta', 'Seleccione un impuesto.', () => {
        this.handleOpenOptions();
        this.refImpuesto.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idAlmacen)) {
      this.alert.warning('Venta', 'Seleccione el almacen.', () => {
        this.handleOpenOptions();
        this.refAlmacen.current.focus();
      });
      return;
    }

    if (Number(producto.precio) <= 0) {
      this.alert.warning('Venta', '¡El precio no puede tener un valor de 0!');
      return;
    }

    if (producto.idTipoTratamientoProducto === UNIDADES || producto.idTipoTratamientoProducto === SERVICIO) {
      this.addItemDetalle(producto, null, null);
    }

    if (producto.idTipoTratamientoProducto === VALOR_MONETARIO) {
      this.handleOpenAgregar("Ingrese el valor monetario (S/, $ u otro) del producto o el total.", "Monto:", producto);
    }

    if (producto.idTipoTratamientoProducto === A_GRANEL) {
      this.handleOpenAgregar("Ingrese el peso del producto (KM, GM u otro).", "Peso:", producto);
    }
  }

  //------------------------------------------------------------------------------------------
  // Componenente
  //------------------------------------------------------------------------------------------
  handleSelectComprobante = (event) => {
    const comprobante = this.state.comprobantes.find(item => item.idComprobante == event.target.value);

    this.setState({
      idComprobante: event.target.value,
      nombreComporbante: !comprobante ? "Ninguno" : comprobante.nombre
    });
  }

  //------------------------------------------------------------------------------------------
  // Acciones del modal agregar
  //------------------------------------------------------------------------------------------
  handleOpenAgregar = (titulo, subTitulo, producto) => {
    this.setState({ isOpenAgregar: true });
    this.refModalAgregar.current.loadDatos(titulo, subTitulo, producto);
  }

  handleCloseAgregar = () => {
    this.setState({ isOpenAgregar: false });
  }

  handleSaveAgregar = async (producto, cantidad) => {
    if (producto.idTipoTratamientoProducto === VALOR_MONETARIO) {
      this.addItemDetalle(producto, parseFloat(cantidad), null);
    }

    if (producto.idTipoTratamientoProducto === A_GRANEL) {
      this.addItemDetalle(producto, null, parseFloat(cantidad));
    }
  }

  //------------------------------------------------------------------------------------------
  // Opciones de configuración
  //------------------------------------------------------------------------------------------

  handleOpenOptions = () => {
    const invoice = document.getElementById(this.idSidebarConfiguration);
    invoice.classList.add('toggled');

    this.setState({
      cacheConfiguracion: {
        idImpuesto: this.state.idImpuesto,
        idMoneda: this.state.idMoneda,
        idAlmacen: this.state.idAlmacen,
        observacion: this.state.observacion,
        nota: this.state.nota,
      }
    });
  }

  handleCloseOptions = () => {
    const invoice = document.getElementById(this.idSidebarConfiguration);

    if (this.state.cacheConfiguracion) {
      this.setState({
        idImpuesto: this.state.cacheConfiguracion.idImpuesto,
        idMoneda: this.state.cacheConfiguracion.idMoneda,
        idAlmacen: this.state.cacheConfiguracion.idAlmacen,
        observacion: this.state.cacheConfiguracion.observacion,
        nota: this.state.cacheConfiguracion.nota,
      });
    }

    invoice.classList.remove('toggled');
  }

  handleSelectIdImpuesto = (event) => {
    this.setState({ idImpuesto: event.target.value })
  }

  handleSelectIdMoneda = (event) => {
    this.setState({ idMoneda: event.target.value })
  }

  handleSelectIdIdAlmacen = (event) => {
    this.setState({ idAlmacen: event.target.value })
  }

  handleInputObservacion = (event) => {
    this.setState({ observacion: event.target.value })
  }

  handleInputNota = (event) => {
    this.setState({ nota: event.target.value })
  }

  handleSaveOptions = () => {
    if (isEmpty(this.state.idImpuesto)) {
      this.alert.warning('Venta', 'Seleccione un impuesto.', () =>
        this.refImpuesto.current.focus(),
      );
      return;
    }

    if (isEmpty(this.state.idMoneda)) {
      this.alert.warning('Venta', 'Seleccione una moneda.', () =>
        this.refMoneda.current.focus(),
      );
      return;
    }

    if (isEmpty(this.state.idAlmacen)) {
      this.alert.warning('Venta', 'Seleccione un almacen.', () =>
        this.refAlmacen.current.focus(),
      );
      return;
    }

    const detalleVenta = this.state.detalleVenta.map((item) => ({
      ...item,
      idImpuesto: this.state.idImpuesto,
    }));

    const moneda = this.state.monedas.find((item) => item.idMoneda === this.state.idMoneda)

    this.setState({
      idMoneda: moneda.idMoneda,
      codiso: moneda.codiso,
      detalleVenta,
    }, async () => {
      this.reloadProductoPreferidos();

      const invoice = document.getElementById(this.idSidebarConfiguration);
      invoice.classList.remove('toggled');
    })
  }

  //------------------------------------------------------------------------------------------
  // Modal impresión
  //------------------------------------------------------------------------------------------

  handleOpenImpresion = (idVenta) => {
    this.setState({ isOpenImpresion: true, idVenta: idVenta });
  }

  handleCloseImpresion = async () => {
    this.setState({ isOpenImpresion: false });
  }

  handlePrinterImpresion = (size) => {
    printJS({
      printable: documentsPdfInvoicesVenta(this.state.idVenta, size),
      type: 'pdf',
      showModal: true,
      modalMessage: "Recuperando documento...",
      onPrintDialogClose: () => {
        this.reloadView();
        this.handleCloseImpresion();
      }
    })
  }

  //------------------------------------------------------------------------------------------
  // Opciones de pre impresión
  //------------------------------------------------------------------------------------------

  handleOpenPreImpresion = () => {
    const { idComprobante, idCliente, idMoneda, idImpuesto, detalleVenta } = this.state;

    if (isEmpty(idComprobante)) {
      this.alert.warning('Venta', 'Seleccione su comprobante.', () =>
        this.refComprobante.current.focus()
      );
      return;
    }

    if (isEmpty(idCliente)) {
      this.alert.warning('Venta', 'Seleccione un cliente.', () =>
        this.refValueCliente.current.focus()
      );
      return;
    }

    if (isEmpty(idMoneda)) {
      this.alert.warning('Venta', 'Seleccione su moneda.', () =>
        this.refMoneda.current.focus()
      );
      return;
    }

    if (isEmpty(idImpuesto)) {
      this.alert.warning('Venta', 'Seleccione el impuesto', () =>
        this.refImpuesto.current.focus()
      );
      return;
    }

    if (isEmpty(detalleVenta)) {
      this.alert.warning('Venta', 'Agregar algún producto a la lista.', () => { });
      return;
    }

    this.setState({ isOpenPreImpresion: true })
  }

  handleProcessPreImpresion = async (type, abort, success, error) => {
    const { idComprobante, idCliente, idMoneda, idUsuario, idSucursal, observacion, nota, detalleVenta } = this.state;

    const response = await obtenerPreVentaPdf({
      idComprobante: idComprobante,
      idCliente: idCliente,
      idMoneda: idMoneda,
      idUsuario: idUsuario,
      idSucursal: idSucursal,
      observacion: observacion,
      nota: nota,
      detalle: detalleVenta
    }, type, abort.signal);

    if (response instanceof SuccessReponse) {
      const base64 = await readDataFile(response.data);

      success();

      printJS({
        printable: base64,
        type: 'pdf',
        base64: true,
        onPrintDialogClose: this.handleClosePreImpresion
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      error();

      this.alert.warning("Venta", response.getMessage());
    }
  }

  handleClosePreImpresion = () => {
    this.setState({ isOpenPreImpresion: false })
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

  handleSeleccionarCotizacion = async (cotizacion) => {
    this.handleCloseCotizacion();
    this.setState({
      loading: true,
      msgLoading: "Obteniendos datos de la cotización.",
      detalleVenta: [],
      cotizacion: null,
    });

    const params = {
      idCotizacion: cotizacion.idCotizacion,
      idAlmacen: this.state.idAlmacen
    };

    const response = await forSaleCotizacion(params, this.abortControllerCotizacion.signal);

    if (response instanceof SuccessReponse) {
      if (isEmpty(response.data.productos)) {
        this.alert.warning('Venta', 'La cotización no tiene productos, ya que fue utilizado para la venta.', () => {
          this.reloadView();
        });
        return;
      }

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

      this.setState({ cotizacion, loading: false });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.setState({ loading: false });
      this.alert.warning("Venta", response.getMessage())
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

  handleSeleccionarVenta = async (idVenta) => {   
    this.handleCloseVenta();
    this.setState({
      loading: true,
      msgLoading: "Obteniendos datos de la venta.",
      detalleVenta: [],
      cotizacion: null
    });

    const params = {
      idVenta: idVenta,
      idAlmacen: this.state.idAlmacen
    };

    const response = await detailOnlyVentaVenta(params, this.abortControllerVenta.signal);

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
      this.alert.warning("Venta", response.getMessage())
    }
  }

  //------------------------------------------------------------------------------------------
  // Modal cliente
  //------------------------------------------------------------------------------------------

  handleOpenCliente = () => {
    const invoice = document.getElementById(this.idSidebarCliente);
    invoice.classList.add('toggled');
    this.setState({
      cacheCliente: {
        idTipoCliente: this.state.idTipoCliente,
        idTipoDocumento: this.state.idTipoDocumento,
        numeroDocumento: this.state.numeroDocumento,
        informacion: this.state.informacion,
        numeroCelular: this.state.numeroCelular,
        direccion: this.state.direccion,
      }
    })
  }

  handleCloseCliente = () => {
    const invoice = document.getElementById(this.idSidebarCliente);

    if (this.state.loadingCliente) return;

    if (this.state.cacheCliente) {
      this.setState({
        idTipoCliente: this.state.cacheCliente.idTipoCliente,
        idTipoDocumento: this.state.cacheCliente.idTipoDocumento,
        numeroDocumento: this.state.cacheCliente.numeroDocumento,
        informacion: this.state.cacheCliente.informacion,
        numeroCelular: this.state.cacheCliente.numeroCelular,
        direccion: this.state.cacheCliente.direccion,
      })
    }

    invoice.classList.remove('toggled');
  }

  handleClickIdTipoCliente = (event) => {
    this.setState({ idTipoCliente: event.target.value, idTipoDocumento: '' })
  }

  handleSelectIdTipoDocumento = (event) => {
    this.setState({ idTipoDocumento: event.target.value })
  }

  handleInputNumeroDocumento = (event) => {
    this.setState({ numeroDocumento: event.target.value })
  }

  handleInputInformacion = (event) => {
    this.setState({ informacion: event.target.value })
  }

  handleInputNumeroCelular = (event) => {
    this.setState({ numeroCelular: event.target.value })
  }

  handleInputDireccion = (event) => {
    this.setState({ direccion: event.target.value })
  }

  handleGetApiReniec = async () => {
    if (this.state.numeroDocumento.length !== 8) {
      this.alert.warning("Venta", 'Para iniciar la busqueda en número dni debe tener 8 caracteres.', () => {
        this.refNumeroDocumento.current.focus();
      })
      return;
    }

    this.setState({
      loadingCliente: true,
      msgLoading: 'Consultando número de DNI...',
    });

    const response = await getDni(this.state.numeroDocumento);

    if (response instanceof SuccessReponse) {
      this.setState({
        numeroDocumento: convertNullText(response.data.dni),
        informacion: convertNullText(response.data.apellidoPaterno) + ' ' + convertNullText(response.data.apellidoMaterno) + ' ' + convertNullText(response.data.nombres),
        loadingCliente: false,
      });
    }

    if (response instanceof ErrorResponse) {
      this.alert.warning('Venta', response.getMessage(), () => {
        this.setState({
          loadingCliente: false,
        });
      });
    }
  };

  handleGetApiSunat = async () => {
    if (this.state.numeroDocumento.length !== 11) {
      this.alert.warning("Venta", 'Para iniciar la busqueda en número ruc debe tener 11 caracteres.', () => {
        this.refNumeroDocumento.current.focus();
      })
      return;
    }

    this.setState({
      loadingCliente: true,
      msgLoading: 'Consultando número de RUC...',
    });

    const response = await getRuc(this.state.numeroDocumento);

    if (response instanceof SuccessReponse) {
      this.setState({
        numeroDocumento: convertNullText(response.data.ruc),
        informacion: convertNullText(response.data.razonSocial),
        direccion: convertNullText(response.data.direccion),
        loadingCliente: false,
      });
    }

    if (response instanceof ErrorResponse) {
      this.alert.warning('Venta', response.getMessage(), () => {
        this.setState({
          loadingCliente: false,
        });
      });
    }
  };

  handleSaveCliente = () => {
    const tipoDocumento = this.state.tiposDocumentos.find(item => item.idTipoDocumento === this.state.idTipoDocumento);

    if (isEmpty(this.state.idTipoDocumento)) {
      this.alert.warning("Venta", "Seleccione el tipo de documento.", () => {
        this.refIdTipoDocumento.current.focus()
      })
      return;
    }

    if (isEmpty(this.state.numeroDocumento)) {
      this.alert.warning("Venta", "Seleccione el tipo de documento.", () => {
        this.refNumeroDocumento.current.focus()
      })
      return;
    }

    if (tipoDocumento && tipoDocumento.obligado === 1 && tipoDocumento.longitud !== this.state.numeroDocumento.length) {
      this.alert.warning("Venta", `El número de documento por ser ${tipoDocumento.nombre} tiene que tener una longitud de ${tipoDocumento.longitud} carácteres.`, () => {
        this.refNumeroDocumento.current.focus();
      })
      return;
    }

    if (isEmpty(this.state.informacion)) {
      this.alert.warning("Venta", "Seleccione el tipo de documento.", () => {
        this.refInformacion.current.focus()
      })
      return;
    }

    const nuevoCliente = {
      idTipoCliente: this.state.idTipoCliente,
      idTipoDocumento: this.state.idTipoDocumento,
      numeroDocumento: text(this.state.numeroDocumento),
      informacion: text(this.state.informacion),
      numeroCelular: text(this.state.numeroCelular),
      email: "",
      direccion: text(this.state.direccion),
    }

    const value = {
      idPersona: "",
      documento: text(this.state.numeroDocumento),
      informacion: text(this.state.informacion)
    }

    this.setState({ nuevoCliente }, () => {
      this.handleSelectItemCliente(value);
      const invoice = document.getElementById(this.idSidebarCliente);
      invoice.classList.remove('toggled');
    })
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
    const invoice = document.getElementById(this.idSidebarProducto);

    invoice.classList.add('toggled');
    const lista = await this.fetchObtenerListaPrecio(producto.idProducto);
    this.producto = producto;
    this.refPrecioProducto.current.value = producto.precio;
    this.refBonificacionProducto.current.value = 0;
    this.refDescripcionProducto.current.value = producto.nombreProducto;
    this.listPrecioProducto = lista;
    this.setState({ loadingProducto: false });
  };

  handleRemoveProducto = (producto) => {
    this.setState(prevState => ({
      detalleVenta: prevState.detalleVenta.filter((item) => producto.idProducto !== item.idProducto),
    }));
  };

  handleCloseProducto = () => {
    const invoice = document.getElementById(this.idSidebarProducto);

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
    const productoActual = this.producto;

    if (!isNumeric(precioProducto) || Number(precioProducto) <= 0) {
      this.alert.warning('Venta', 'El precio del producto tiene un valor no admitido o es menor o igual a 0.', () => {
        this.refPrecioProducto.current.focus();
      });
      return;
    }

    if (isEmpty(descripcionProducto)) {
      this.alert.warning('Venta', 'La descripción del producto no puede ser vacía.', () => {
        this.refDescripcionProducto.current.focus();
      });
      return;
    }

    const producto = this.state.detalleVenta.find(item => item.idProducto === productoActual.idProducto);

    if (producto.precio !== Number(precioProducto) && producto.idTipoTratamientoProducto === VALOR_MONETARIO) {
      this.alert.warning('Venta', 'Los productos a granel no se puede cambia el precio.');
      return;
    }

    this.setState(prevState => ({
      detalleVenta: prevState.detalleVenta.map((item) => {
        if (item.idProducto === productoActual.idProducto) {
          return {
            ...item,
            nombreProducto: descripcionProducto,
            precio: Number(precioProducto)
          }
        }

        return item
      })
    }));

    this.handleCloseProducto();
  }

  //------------------------------------------------------------------------------------------
  // Filtrar cliente
  //------------------------------------------------------------------------------------------

  handleClearInputCliente = () => {
    this.setState({
      clientes: [],
      idCliente: '',
      nuevoCliente: null,
    });
  }

  handleFilterCliente = async (text) => {
    const searchWord = text;
    this.setState({ idCliente: '' });

    if (isEmpty(searchWord)) {
      this.setState({ clientes: [] });
      return;
    }

    const params = {
      "opcion": 1,
      "filter": searchWord,
      "cliente": true,
    };

    const clientes = await this.fetchFiltrarPersona(params)

    this.setState({
      clientes: clientes,
    });
  }

  handleSelectItemCliente = (value) => {
    this.refCliente.current.initialize(value.documento + ' - ' + value.informacion);
    this.setState({
      clientes: [],
      idCliente: value.idPersona,
    });
  }

  //------------------------------------------------------------------------------------------
  // Componente footer
  //------------------------------------------------------------------------------------------

  handleOpenSale = async () => {
    if (isEmpty(this.state.detalleVenta)) {
      this.alert.warning('Venta', 'La lista de productos esta vacía.', () => {

      });
      return;
    }

    if (isEmpty(this.state.idComprobante)) {
      this.alert.warning('Venta', 'Seleccione un comprobante.');
      return;
    }

    if (isEmpty(this.state.idCliente) && this.state.nuevoCliente === null) {
      this.alert.warning('Venta', 'Selecciona un cliente.', () => {
        this.refValueCliente.current.focus();
      });
      return;
    }

    this.handleOpenModalTerminal();
  }

  handleClearSale = async () => {
    this.alert.dialog("Venta", "Los productos serán eliminados de la venta actual ¿Desea continuar?", async (accept) => {
      if (accept) {
        this.reloadView()
      }
    })
  }

  //------------------------------------------------------------------------------------------
  // Acciones del modal terminal
  //------------------------------------------------------------------------------------------
  handleOpenModalTerminal = () => {
    this.setState({ isOpenTerminal: true })
  }

  handleProcessContado = (idFormaPago, metodoPagosLista, notaTransacion, callback = async function () { }) => {
    const {
      nuevoCliente,
      idUsuario,
      idSucursal,
      idCliente,
      idImpuesto,
      idMoneda,
      idComprobante,
      cotizacion,
      observacion,
      nota,
      detalleVenta
    } = this.state;

    this.alert.dialog('Venta', '¿Estás seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idFormaPago: idFormaPago,
          idComprobante: idComprobante,
          idMoneda: idMoneda,
          idImpuesto: idImpuesto,
          idCliente: idCliente,
          idSucursal: idSucursal,
          observacion: observacion,
          nota: nota,
          idUsuario: idUsuario,
          estado: 1,
          nuevoCliente: nuevoCliente,
          idCotizacion: cotizacion.idCotizacion,
          detalleVenta: detalleVenta,
          notaTransacion,
          bancosAgregados: metodoPagosLista,
        };

        await callback();
        this.alert.information('Venta', 'Procesando venta...');

        const response = await createVenta(data);

        if (response instanceof SuccessReponse) {
          this.alert.close();
          this.handleOpenImpresion(response.data.idVenta);
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

            this.alert.html('Venta',
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
            this.alert.warning('Venta', response.getMessage());
          }
        }
      }
    });
  }

  handleProcessCredito = (idFormaPago, numeroCuotas, frecuenciaPago, importeTotal, notaTransacion, callback = async function () { }) => {
    const {
      nuevoCliente,
      idUsuario,
      idSucursal,
      idCliente,
      idImpuesto,
      idMoneda,
      idComprobante,
      observacion,
      nota,
      detalleVenta
    } = this.state;


    this.alert.dialog('Venta', '¿Estás seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idFormaPago: idFormaPago,
          idComprobante: idComprobante,
          idMoneda: idMoneda,
          idImpuesto: idImpuesto,
          idCliente: idCliente,
          idSucursal: idSucursal,
          observacion: observacion,
          nota: nota,
          idUsuario: idUsuario,
          estado: 2,
          nuevoCliente: nuevoCliente,
          detalleVenta: detalleVenta,
          numeroCuotas: numeroCuotas,
          frecuenciaPago: frecuenciaPago,
          notaTransacion,
          importeTotal: importeTotal
        };

        await callback();
        this.alert.information('Venta', 'Procesando venta...');

        const response = await createVenta(data);

        if (response instanceof SuccessReponse) {
          this.alert.close();
          this.handleOpenImpresion(response.data.idVenta);
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

            this.alert.html('Venta',
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
            this.alert.warning('Venta', response.getMessage());
          }
        }
      }
    });
  }

  handleCloseModalTerminal = async () => {
    this.setState({ isOpenTerminal: false })
  }

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

        <section className="invoice-left">
          <InvoiceView
            ref={this.refInvoiceView}
            idSucursal={this.state.idSucursal}
            idAlmacen={this.state.idAlmacen}
            codiso={this.state.codiso}
            productos={this.state.productos}
            cotizacion={this.state.cotizacion}
            handleUpdateProductos={this.handleUpdateProductos}
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
            refValueCliente={this.refValueCliente}
            clientes={this.state.clientes}
            handleClearInput={this.handleClearInputCliente}
            handleFilter={this.handleFilterCliente}
            handleSelectItem={this.handleSelectItemCliente}
          />

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

        <ModalTransaccion
          tipo={"Venta"}
          title={"Completar Venta"}
          isOpen={this.state.isOpenTerminal}

          idSucursal={this.state.idSucursal}
          codiso={this.state.codiso}
          importeTotal={this.importeTotal()}

          onClose={this.handleCloseModalTerminal}
          handleProcessContado={this.handleProcessContado}
          handleProcessCredito={this.handleProcessCredito}
        />

        <ModalImpresion
          refModal={this.refModalImpresion}
          isOpen={this.state.isOpenImpresion}
          clear={this.reloadView}
          handleClose={this.handleCloseImpresion}

          handlePrinterA4={this.handlePrinterImpresion.bind(this, 'A4')}
          handlePrinter80MM={this.handlePrinterImpresion.bind(this, '80mm')}
          handlePrinter58MM={this.handlePrinterImpresion.bind(this, '58mm')}
        />

        <ModalPreImpresion
          isOpen={this.state.isOpenPreImpresion}

          handleClose={this.handleClosePreImpresion}
          handleProcess={this.handleProcessPreImpresion}
        />

        <ModalVenta
          refModal={this.refModalVenta}
          isOpen={this.state.isOpenVenta}
          idSucursal={this.state.idSucursal}
          handleClose={this.handleCloseVenta}
          handleSeleccionar={this.handleSeleccionarVenta}
        />

        <ModalCotizacion
          refModal={this.refModalCotizacion}
          isOpen={this.state.isOpenCotizacion}
          idSucursal={this.state.idSucursal}
          handleClose={this.handleCloseCotizacion}
          handleSeleccionar={this.handleSeleccionarCotizacion}
        />

        <SidebarConfiguration
          idSidebarConfiguration={this.idSidebarConfiguration}

          impuestos={this.state.impuestos}
          refImpuesto={this.refImpuesto}
          idImpuesto={this.state.idImpuesto}
          handleSelectIdImpuesto={this.handleSelectIdImpuesto}

          monedas={this.state.monedas}
          refMoneda={this.refMoneda}
          idMoneda={this.state.idMoneda}
          handleSelectIdMoneda={this.handleSelectIdMoneda}

          almacenes={this.state.almacenes}
          refAlmacen={this.refAlmacen}
          idAlmacen={this.state.idAlmacen}
          handleSelectIdIdAlmacen={this.handleSelectIdIdAlmacen}

          refObservacion={this.refObservacion}
          observacion={this.state.observacion}
          handleInputObservacion={this.handleInputObservacion}

          refNota={this.refNota}
          nota={this.state.nota}
          handleInputNota={this.handleInputNota}

          handleSaveOptions={this.handleSaveOptions}
          handleCloseOptions={this.handleCloseOptions}
        />

        <SidebarCliente
          idSidebarCliente={this.idSidebarCliente}
          loading={this.state.loadingCliente}
          tiposDocumentos={this.state.tiposDocumentos}

          idTipoCliente={this.state.idTipoCliente}
          handleClickIdTipoCliente={this.handleClickIdTipoCliente}

          refIdTipoDocumento={this.refIdTipoDocumento}
          idTipoDocumento={this.state.idTipoDocumento}
          handleSelectIdTipoDocumento={this.handleSelectIdTipoDocumento}

          refNumeroDocumento={this.refNumeroDocumento}
          numeroDocumento={this.state.numeroDocumento}
          handleInputNumeroDocumento={this.handleInputNumeroDocumento}

          handleApiReniec={this.handleGetApiReniec}
          handleApiSunat={this.handleGetApiSunat}

          refInformacion={this.refInformacion}
          informacion={this.state.informacion}
          handleInputInformacion={this.handleInputInformacion}

          refNumeroCelular={this.refNumeroCelular}
          numeroCelular={this.state.numeroCelular}
          handleInputNumeroCelular={this.handleInputNumeroCelular}

          refDireccion={this.refDireccion}
          direccion={this.state.direccion}
          handleInputDireccion={this.handleInputDireccion}

          handleSave={this.handleSaveCliente}
          handleClose={this.handleCloseCliente}
        />

        <SidebarProducto
          idSidebar={this.idSidebarProducto}
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
          ref={this.refModalAgregar}
          isOpen={this.state.isOpenAgregar}
          detalleVenta={this.state.detalleVenta}
          onClose={this.handleCloseAgregar}
          handleAdd={this.handleSaveAgregar}
        />
      </PosContainerWrapper>
    );
  }
}

VentaCrear.propTypes = {
  productos: PropTypes.array.isRequired,
  setProductosFavoritos: PropTypes.func.isRequired,
  starProduct: PropTypes.func.isRequired,
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
    token: state.principal,
    productos: state.predeterminado.productos,
  };
};

const mapDispatchToProps = { starProduct, setProductosFavoritos };

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */

const ConnectedVentaCrear = connect(mapStateToProps, mapDispatchToProps)(VentaCrear);

export default ConnectedVentaCrear;