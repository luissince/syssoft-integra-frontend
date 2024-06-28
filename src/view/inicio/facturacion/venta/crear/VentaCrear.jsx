import React from 'react';
import printJS from 'print-js';
import {
  alertDialog,
  alertWarning,
  convertNullText,
  isEmpty,
  isNumeric,
  text,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { PosContainerWrapper } from '../../../../../components/Container';
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
  obtenerVentaPdf,
  detailCotizacionVenta,
  detailOnlyVentaVenta,
} from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import InvoiceDetail from './component/InvoiceDetail';
import InvoiceClient from './component/InvoiceClient';
import InvoiceVoucher from './component/InvoiceVoucher';
import InvoiceFooter from './component/InvoiceFooter';
import InvoiceView from './component/InvoiceView';
import ModalCobrar from '../common/ModalCobrar';
import CustomComponent from '../../../../../model/class/custom-component';
import ModalCliente from './component/ModalCliente';
import {
  VENTA,
} from '../../../../../model/types/tipo-comprobante';
import PropTypes from 'prop-types';
import ModalProducto from './component/ModalProducto';
import { A_GRANEL, SERVICIO, UNIDADES, VALOR_MONETARIO } from '../../../../../model/types/tipo-tratamiento-producto';
import { CLIENTE_NATURAL } from '../../../../../model/types/tipo-cliente';
import { SpinnerView } from '../../../../../components/Spinner';
import ModalAgregar from '../common/ModalAgregar';
import ModalImpresion from '../common/ModalImpresion';
import ModalPreImpresion from '../common/ModalPreImpresion';
import ModalCotizacion from '../common/ModalCotizacion';
import ModalVenta from '../common/ModalVenta';
import { getDni, getRuc } from '../../../../../network/rest/apisperu.network';
import { setProductosFavoritos, starProduct } from '../../../../../redux/predeterminadoSlice';
import ModalConfiguration from '../common/ModalConfiguration';
// import InvoiceListPrices from './component/InvoiceListPrices';

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

      // Atributos del modal impresión
      isOpenImpresion: false,

      // Atributos del modal pre impresión
      isOpenPreImpresion: false,

      // Atributos del modal cotización
      isOpenCotizacion: false,

      // Atributos del modal venta
      isOpenVenta: false,

      // Atributos del modal cobrar
      isOpenCobrar: false,

      // Atributos del modal configuración
      idImpuesto: '',
      idMoneda: '',
      idAlmacen: '',
      comentario: '',
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

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.initial = { ...this.state }

    // Referencia al modal cobrar
    this.refInvoiceView = React.createRef();

    // Referencia al modal cobrar
    this.refCobrar = React.createRef();

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
    this.selectItemCliente = false;

    // Atributos para buscar productos el diseño mobil
    this.refProductoMobile = React.createRef();
    this.selectItemProductoMobile = false;

    // Atributos para el modal configuración
    this.idModalConfiguration = 'idModalConfiguration';
    this.refImpuesto = React.createRef();
    this.refMoneda = React.createRef();
    this.refAlmacen = React.createRef();
    this.refComentario = React.createRef();

    // Atributos para el modal producto
    this.idModalProducto = 'idModalProducto';
    this.producto = null;
    this.refPrecioProducto = React.createRef();
    this.refBonificacionProducto = React.createRef();
    this.refDescripcionProducto = React.createRef();
    this.listPrecioProducto = [];

    // Atributos para el modal cliente
    this.idModalCliente = 'idModalCliente';
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

  reloadView() {
    this.setState(this.initial, async () => {
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
          cantidad: cantidad ? producto.cantidad : 1,
        });

        const newItem = {
          idProducto: producto.idProducto,
          nombreProducto: producto.nombreProducto,
          idImpuesto: this.state.idImpuesto,
          precio: producto.precio,
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
            cantidad: cantidad ? producto.cantidad : 1,
          });
        } else {
          for (const inventario of existingItem.inventarios) {
            if (inventario.idInventario === producto.idInventario) {
              inventario.cantidad += 1;
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
          nombreProducto: producto.nombreProducto,
          idImpuesto: this.state.idImpuesto,
          precio: precio,
          medida: producto.medida,
          idTipoTratamientoProducto: producto.idTipoTratamientoProducto,
          tipo: producto.tipo,
          inventarios: inventarios
        };

        this.setState(prevState => ({
          detalleVenta: [...prevState.detalleVenta, newItem]
        }));
      } else {
        existingItem.precio = precio;

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
          cantidad: cantidad,
        });

        const newItem = {
          idProducto: producto.idProducto,
          nombreProducto: producto.nombreProducto,
          idImpuesto: this.state.idImpuesto,
          precio: producto.precio,
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
            cantidad: cantidad,
          });
        } else {
          for (const inventario of existingItem.inventarios) {
            if (inventario.idInventario === producto.idInventario) {
              inventario.cantidad = cantidad;
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
          nombreProducto: producto.nombreProducto,
          idImpuesto: this.state.idImpuesto,
          precio: precio ? precio : producto.precio,
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
    if (event.key === 'F1' && !this.state.isOpenImpresion && !this.state.isOpenCobrar && !this.state.isOpenAgregar && !this.state.isOpenCotizacion && !this.state.isOpenVenta) {
      this.handleOpenSale();
    }

    if (event.key === 'F2' && !this.state.isOpenImpresion && !this.state.isOpenCobrar && !this.state.isOpenAgregar && !this.state.isOpenCotizacion && !this.state.isOpenVenta) {
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
      alertWarning('Venta', 'Seleccione un impuesto.', () => {
        this.handleOpenOptions();
        this.refImpuesto.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idAlmacen)) {
      alertWarning('Venta', 'Seleccione el almacen.', () => {
        this.handleOpenOptions();
        this.refAlmacen.current.focus();
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
    const invoice = document.getElementById(this.idModalConfiguration);
    invoice.classList.add('toggled');

    this.setState({
      cacheConfiguracion: {
        idImpuesto: this.state.idImpuesto,
        idMoneda: this.state.idMoneda,
        idAlmacen: this.state.idAlmacen,
        comentario: this.state.comentario
      }
    })
  }

  handleCloseOptions = () => {
    const invoice = document.getElementById(this.idModalConfiguration);

    if (this.state.cacheConfiguracion) {
      this.setState({
        idImpuesto: this.state.cacheConfiguracion.idImpuesto,
        idMoneda: this.state.cacheConfiguracion.idMoneda,
        idAlmacen: this.state.cacheConfiguracion.idAlmacen,
        comentario: this.state.cacheConfiguracion.comentario
      })
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

  handleInputComentario = (event) => {
    this.setState({ comentario: event.target.value })
  }

  handleSaveOptions = () => {
    if (isEmpty(this.state.idImpuesto)) {
      alertWarning('Venta', 'Seleccione un impuesto.', () =>
        this.refImpuesto.current.focus(),
      );
      return;
    }

    if (isEmpty(this.state.idMoneda)) {
      alertWarning('Venta', 'Seleccione una moneda.', () =>
        this.refMoneda.current.focus(),
      );
      return;
    }

    if (isEmpty(this.state.idAlmacen)) {
      alertWarning('Venta', 'Seleccione un almacen.', () =>
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

      const invoice = document.getElementById(this.idModalConfiguration);
      invoice.classList.remove('toggled');
    })
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
    const { idComprobante, idCliente, idMoneda, idImpuesto, detalleVenta } = this.state;

    if (isEmpty(idComprobante)) {
      alertWarning('Venta', 'Seleccione su comprobante.', () =>
        this.refComprobante.current.focus()
      );
      return;
    }

    if (isEmpty(idCliente)) {
      alertWarning('Venta', 'Seleccione un cliente.', () =>
        this.refCliente.current.focus()
      );
      return;
    }

    if (isEmpty(idMoneda)) {
      alertWarning('Venta', 'Seleccione su moneda.', () =>
        this.refMoneda.current.focus()
      );
      return;
    }

    if (isEmpty(idImpuesto)) {
      alertWarning('Venta', 'Seleccione el impuesto', () =>
        this.refImpuesto.current.focus()
      );
      return;
    }

    if (isEmpty(detalleVenta)) {
      alertWarning('Venta', 'Agregar algún producto a la lista.', () => { });
      return;
    }

    this.setState({ isOpenPreImpresion: true })
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

  handleSeleccionarCotizacion = async (idCotizacion) => {
    this.setState({ loading: true, msgLoading: "Obteniendos datos de la cotización.", detalleVenta: [] });

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

  handleSeleccionarVenta = async (idVenta) => {
    this.setState({ loading: true, msgLoading: "Obteniendos datos de la venta.", detalleVenta: [] });

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
      alertWarning("Venta", response.getMessage())
    }
  }

  //------------------------------------------------------------------------------------------
  // Modal cliente
  //------------------------------------------------------------------------------------------

  handleOpenCliente = () => {
    const invoice = document.getElementById(this.idModalCliente);
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
    const invoice = document.getElementById(this.idModalCliente);

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
      alertWarning("Venta", 'Para iniciar la busqueda en número dni debe tener 8 caracteres.', () => {
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
      alertWarning('Venta', response.getMessage(), () => {
        this.setState({
          loadingCliente: false,
        });
      });
    }
  };

  handleGetApiSunat = async () => {
    if (this.state.numeroDocumento.length !== 11) {
      alertWarning("Venta", 'Para iniciar la busqueda en número ruc debe tener 11 caracteres.', () => {
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
      alertWarning('Venta', response.getMessage(), () => {
        this.setState({
          loadingCliente: false,
        });
      });
    }
  };

  handleSaveCliente = () => {
    const tipoDocumento = this.state.tiposDocumentos.find(item => item.idTipoDocumento === this.state.idTipoDocumento);

    if (isEmpty(this.state.idTipoDocumento)) {
      alertWarning("Venta", "Seleccione el tipo de documento.", () => {
        this.refIdTipoDocumento.current.focus()
      })
      return;
    }

    if (isEmpty(this.state.numeroDocumento)) {
      alertWarning("Venta", "Seleccione el tipo de documento.", () => {
        this.refNumeroDocumento.current.focus()
      })
      return;
    }

    if (tipoDocumento && tipoDocumento.obligado === 1 && tipoDocumento.longitud !== this.state.numeroDocumento.length) {
      alertWarning("Venta", `El número de documento por ser ${tipoDocumento.nombre} tiene que tener una longitud de ${tipoDocumento.longitud} carácteres.`, () => {
        this.refNumeroDocumento.current.focus();
      })
      return;
    }

    if (isEmpty(this.state.informacion)) {
      alertWarning("Venta", "Seleccione el tipo de documento.", () => {
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
      const invoice = document.getElementById(this.idModalCliente);
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

  handleRemoveProducto = (producto) => {
    this.setState(prevState => ({
      detalleVenta: prevState.detalleVenta.filter((item) => producto.idProducto !== item.idProducto),
    }));
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
    const productoActual = this.producto;

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

    const producto = this.state.detalleVenta.find(item => item.idProducto === productoActual.idProducto);

    if (producto.precio !== parseFloat(precioProducto) && producto.idTipoTratamientoProducto === VALOR_MONETARIO) {
      alertWarning('Venta', 'Los productos a granel no se puede cambia el precio.');
      return;
    }

    this.setState(prevState => ({
      detalleVenta: prevState.detalleVenta.map((item) => {
        if (item.idProducto === productoActual.idProducto) {
          return {
            ...item,
            nombreProducto: descripcionProducto,
            precio: parseFloat(precioProducto)
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

    this.handleOpenModalCobrar();
  }

  handleClearSale = async () => {
    alertDialog("Venta", "Los productos serán eliminados de la venta actual ¿Desea continuar?", async (accept) => {
      if (accept) {
        this.reloadView()
      }
    })
  }

  //------------------------------------------------------------------------------------------
  // Modal Cobrar
  //------------------------------------------------------------------------------------------
  handleOpenModalCobrar = () => {
    this.setState({ isOpenCobrar: true })
  }

  handleCloseModalCobrar = async () => {
    this.setState({ isOpenCobrar: false })
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

        <ModalCobrar
          refModal={this.refCobrar}
          isOpen={this.state.isOpenCobrar}
          onClose={this.handleCloseModalCobrar}
          idSucursal={this.state.idSucursal}
          nuevoCliente={this.state.nuevoCliente}
          comentario={this.state.comentario}
          idUsuario={this.state.idUsuario}
          idCliente={this.state.idCliente}
          idImpuesto={this.state.idImpuesto}
          idMoneda={this.state.idMoneda}
          idComprobante={this.state.idComprobante}
          codiso={this.state.codiso}
          detalleVenta={this.state.detalleVenta}
          handleOpenImpresion={this.handleOpenImpresion}
        />

        <ModalImpresion
          refModal={this.refModalImpresion}
          isOpen={this.state.isOpenImpresion}
          handleClose={this.handleCloseImpresion}

          handlePrintA4={this.handleOpenImpresionA4}
          handlePrintTicket={this.handleOpenImpresionTicket}
        />

        <ModalPreImpresion
          isOpen={this.state.isOpenPreImpresion}

          idComprobante={this.state.idComprobante}
          idCliente={this.state.idCliente}
          idMoneda={this.state.idMoneda}
          idImpuesto={this.state.idImpuesto}
          idUsuario={this.state.idUsuario}
          idSucursal={this.state.idSucursal}
          comentario={this.state.comentario}
          detalleVenta={this.state.detalleVenta}

          handleClose={this.handleClosePreImpresion}
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

        <ModalConfiguration
          idModalConfiguration={this.idModalConfiguration}

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

          refComentario={this.refComentario}
          comentario={this.state.comentario}
          handleInputComentario={this.handleInputComentario}

          handleSaveOptions={this.handleSaveOptions}
          handleCloseOptions={this.handleCloseOptions}
        />

        <ModalCliente
          idModal={this.idModalCliente}
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