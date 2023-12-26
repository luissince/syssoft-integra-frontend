import React from 'react';
import {
  alertDialog,
  alertHTML,
  alertInfo,
  alertSuccess,
  alertWarning,
  clearModal,
  formatDecimal,
  hideModal,
  isEmpty,
  isNumeric,
  isText,
  rounded,
  showModal,
  spinnerLoading,
  viewModal,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { PosContainerWrapper } from '../../../../../components/Container';
import InvoiceTicket from './component/InvoiceTicket';
import {
  comboMetodoPago,
  createFactura,
  getPredeterminado,
  comboComprobante,
  comboImpuesto,
  comboMoneda,
  filtrarCliente,
  filtrarProductoVenta,
  preferidosProducto,
  obtenerListaPrecioProducto,
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
  FACTURACION,
  VENTA_LIBRE,
} from '../../../../../model/types/tipo-comprobante';
import { starProduct, favoriteProducts } from '../../../../../redux/actions';
import ModalProducto from './component/ModalProducto';

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

    /**
     * Estado inicial del componente.
     * @type {Object}
     */
    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

      idComprobante: '',

      idMoneda: '',
      codiso: '',

      idImpuesto: '',

      producto: '',
      sarchProducto: false,
      filterProducto: false,

      idCliente: '',
      cliente: '',
      filterCliente: false,

      comentario: '',

      // Variables del modal de venta
      loadingModal: false,
      selectTipoPago: 1,

      comprobantes: [],
      productos: [],
      clientes: [],
      impuestos: [],
      monedas: [],
      detalleVenta: [],

      numCuota: '',
      letraMensual: '',

      frecuenciaPagoCredito: new Date().getDate() > 15 ? '30' : '15',

      frecuenciaPago: new Date().getDate() > 15 ? '30' : '15',

      importeTotal: 0.0,

      // modal venta
      metodosPagoLista: [],
      metodoPagoAgregado: [],

      // modal producto
      loadingProducto: true,

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    // Lista de id para los modales
    this.idModalConfiguration = 'idModalConfiguration';
    this.idModalCliente = 'idModalCliente';
    this.idModalSale = 'idModalSale';
    this.idModalProducto = 'idModalProducto';

    this.refProducto = React.createRef();

    this.refComprobante = React.createRef();

    this.refCliente = React.createRef();

    this.refImpuesto = React.createRef();

    this.refMoneda = React.createRef();

    this.refComentario = React.createRef();

    this.refMetodoContado = React.createRef();

    this.refFrecuenciaPago = React.createRef();
    this.refNumCutoas = React.createRef();
    this.refFrecuenciaPagoCredito = React.createRef();

    // atributos para el modal producto
    this.producto = null;
    this.refPrecioProducto = React.createRef();
    this.refBonificacionProducto = React.createRef();
    this.refDescripcionProducto = React.createRef();
    this.listPrecioProducto = [];

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

  /**
   * @description Método que se ejecuta después de que el componente se haya montado en el DOM.
   */
  async componentDidMount() {
    await this.initData();

    viewModal(this.idModalSale, () => {
      const importeTotal = this.state.detalleVenta.reduce(
        (accumulator, item) => {
          const totalProductPrice = item.precio * item.cantidad;
          return accumulator + totalProductPrice;
        },
        0,
      );

      const metodo = this.state.metodosPagoLista.find(
        (item) => item.predeterminado === 1,
      );

      this.refMetodoContado.current.value = metodo ? metodo.idMetodoPago : '';

      if (metodo) {
        const item = {
          idMetodoPago: metodo.idMetodoPago,
          nombre: metodo.nombre,
          monto: '',
          vuelto: metodo.vuelto,
          descripcion: '',
        };

        this.setState((prevState) => ({
          metodoPagoAgregado: [...prevState.metodoPagoAgregado, item],
        }));
      }

      this.setState({ importeTotal, loadingModal: false });
    });

    clearModal(this.idModalSale, () => {
      this.setState({
        selectTipoPago: 1,

        letraMensual: '',
        frecuenciaPagoCredito: new Date().getDate() > 15 ? '30' : '15',
        numCuota: '',

        frecuenciaPago: new Date().getDate() > 15 ? '30' : '15',

        metodoPagoAgregado: [],
      });
    });
  }

  /**
   * @description Método que se ejecuta antes de que el componente se desmonte del DOM.
   */
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

  async initData() {
    const productos = await this.fetchProductoPreferidos();

    this.props.favoriteProducts(productos);

    await this.setStateAsync({ productos: productos });

    await this.loadingData();
  }

  loadingData = async () => {
    const [
      libre,
      facturado,
      monedas,
      impuestos,
      predeterminado,
      metodoPagos,
    ] = await Promise.all([
      await this.fetchComprobante(VENTA_LIBRE),
      await this.fetchComprobante(FACTURACION),
      await this.fetchMoneda(),
      await this.fetchImpuesto(),
      await this.fetchClientePredeterminado(),
      await this.fetchMetodoPago(),
    ]);

    const comprobantes = [...facturado, ...libre];
    const monedaFilter = monedas.find((item) => item.nacional === 1);
    const impuestoFilter = impuestos.find((item) => item.preferida === 1);
    const comprobanteFilter = comprobantes.find((item) => item.preferida === 1);

    if (typeof predeterminado === 'object') {
      this.handleSelectItemClient(predeterminado);
    }

    await this.setStateAsync({
      comprobantes,
      monedas,
      impuestos,
      metodosPagoLista: metodoPagos,

      idComprobante: comprobanteFilter ? comprobanteFilter.idComprobante : '',

      idMoneda: monedaFilter ? monedaFilter.idMoneda : '',
      codiso: monedaFilter ? monedaFilter.codiso : 'PEN',

      idImpuesto: impuestoFilter ? impuestoFilter.idImpuesto : '',

      loading: false,
    });

    this.refImpuesto.current.value = impuestoFilter
      ? impuestoFilter.idImpuesto
      : '';

    this.refMoneda.current.value = monedaFilter ? monedaFilter.idMoneda : '';
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
    const response = await getPredeterminado();

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchMetodoPago() {
    const response = await comboMetodoPago();

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchProductoPreferidos() {
    const response = await preferidosProducto();

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
    const response = await obtenerListaPrecioProducto(params);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  calcularLetraMensual = () => {
    if (this.state.numCuota === '') {
      return;
    }

    const saldo = this.state.importeTotal;
    const letra = saldo / this.state.numCuota;

    this.setState({ letraMensual: letra.toFixed(2) });
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

  //------------------------------------------------------------------------------------------
  // Componenente busqueda
  //------------------------------------------------------------------------------------------

  handleAddItem = async (producto) => {
    if (!isText(this.refImpuesto.current.value)) {
      alertWarning('Venta', 'Seleccione un impuesto.', () => {
        this.handleOpenAndCloseOptions();
        this.refImpuesto.current.focus();
      });
      return;
    }

    if (producto.precio <= 0) {
      alertWarning('Venta', '¡El precio no puede tener un valor de 0!');
      return;
    }

    const detalleVenta = [...this.state.detalleVenta];
    const existingItem = detalleVenta.find(
      (item) => item.idProducto === producto.idProducto,
    );

    if (!existingItem) {
      detalleVenta.push({
        idProducto: producto.idProducto,
        nombreProducto: producto.nombreProducto,
        cantidad: 1,
        idImpuesto: this.refImpuesto.current.value,
        precio: producto.precio,
        idInventario: producto.idInventario,
        tipo: producto.tipo,
      });
    } else {
      existingItem.cantidad += 1;
    }

    await this.setStateAsync({
      detalleVenta,
    });
  };

  //------------------------------------------------------------------------------------------
  // Modal configuración
  //------------------------------------------------------------------------------------------

  handleSelectComprobante = (event) => {
    this.setState({ idComprobante: event.target.value });
  };

  handleFilterProducto = async (event) => {
    const searchWord = event.target.value;
    await this.setStateAsync({ producto: searchWord });

    if (searchWord.length === 0) {
      await this.setStateAsync({ productos: this.props.productos });
      return;
    }

    if (searchWord.length <= 2) return;

    if (this.state.filterProducto) return;

    await this.setStateAsync({ filterProducto: true, sarchProducto: true });

    const params = {
      filtrar: searchWord,
      idSucursal: this.state.idSucursal,
    };

    const response = await filtrarProductoVenta(params);

    if (response instanceof SuccessReponse) {
      await this.setStateAsync({
        filterProducto: false,
        productos: response.data,
        sarchProducto: false,
      });
    }

    if (response instanceof ErrorResponse) {
      await this.setStateAsync({
        filterProducto: false,
        productos: [],
        sarchProducto: false,
      });
    }
  };

  //------------------------------------------------------------------------------------------
  // Modal configuración
  //------------------------------------------------------------------------------------------

  handleOpenAndCloseOptions = () => {
    const invoice = document.getElementById(this.idModalConfiguration);
    this.refImpuesto.current.value = this.state.idImpuesto;
    this.refMoneda.current.value = this.state.idMoneda;

    if (invoice.classList.contains('toggled')) {
      invoice.classList.remove('toggled');
    } else {
      invoice.classList.add('toggled');
    }
  };

  handleSaveOptions = () => {
    if (!isText(this.refImpuesto.current.value)) {
      alertWarning('Venta', 'Seleccione un impuesto.', () =>
        this.refImpuesto.current.focus(),
      );
      return;
    }

    if (!isText(this.refMoneda.current.value)) {
      alertWarning('Venta', 'Seleccione una moneda.', () =>
        this.refMoneda.current.focus(),
      );
      return;
    }

    const detalleVenta = this.state.detalleVenta.map((item) => ({
      ...item,
      idImpuesto: this.refImpuesto.current.value,
    }));

    const moneda = this.state.monedas.find(
      (item) => item.idMoneda === this.refMoneda.current.value,
    );

    this.setState(
      {
        idMoneda: moneda.idMoneda,
        codiso: moneda.codiso,
        idImpuesto: this.refImpuesto.current.value,
        comentario: this.refComentario.current.value,
        detalleVenta,
      },
      () => this.handleOpenAndCloseOptions(),
    );
  };

  //------------------------------------------------------------------------------------------
  // Modal cliente
  //------------------------------------------------------------------------------------------

  handleOpenAndCloseCliente = () => {
    const invoice = document.getElementById(this.idModalCliente);
    if (invoice.classList.contains('toggled')) {
      invoice.classList.remove('toggled');
    } else {
      invoice.classList.add('toggled');
    }
  };

  handleSaveCliente = () => { };

  //------------------------------------------------------------------------------------------
  // Opciones del producto y modal
  //------------------------------------------------------------------------------------------

  handleMinusProducto = async (producto) => {
    const updatedDetalle = this.state.detalleVenta.map((item) =>
      item.idProducto === producto.idProducto
        ? { ...item, cantidad: Math.max(parseFloat(item.cantidad) - 1, 1) }
        : item,
    );

    this.setState({
      detalleVenta: updatedDetalle,
    });
  };

  handlePlusProducto = async (producto) => {
    const updatedDetalle = this.state.detalleVenta.map((item) => {
      if (item.idProducto === producto.idProducto) {
        return { ...item, cantidad: parseFloat(item.cantidad) + 1 };
      }
      return item;
    });

    this.setState({
      detalleVenta: updatedDetalle,
    });
  };

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
    const updatedDetalle = this.state.detalleVenta.filter(
      (item) => producto.idProducto !== item.idProducto,
    );

    this.setState({
      detalleVenta: updatedDetalle,
    });
  };

  handleCloseProducto = () => {
    const invoice = document.getElementById(this.idModalProducto);

    if (this.state.loadingProducto) return;

    invoice.classList.remove('toggled');
    this.producto = null;
    this.listPrecioProducto = [];
    this.setState({ loadingProducto: true });
  };

  handleSaveProducto = () => {
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

    const updatedDetalle = this.state.detalleVenta.map((item) =>
      item.idProducto === this.producto.idProducto
        ? {
          ...item,
          nombreProducto: descripcionProducto,
          precio: parseFloat(precioProducto),
        }
        : item,
    );

    this.setState({
      detalleVenta: updatedDetalle,
    });

    this.handleCloseProducto();
  };

  //------------------------------------------------------------------------------------------
  // Filtrar cliente
  //------------------------------------------------------------------------------------------

  handleClearInputClient = async () => {
    await this.setStateAsync({ clientes: [], idCliente: '', cliente: '' });
    this.selectItemClient = false;
  };

  handleFilterClient = async (event) => {
    const searchWord = this.selectItemClient ? '' : event.target.value;
    await this.setStateAsync({ idCliente: '', cliente: searchWord });
    this.selectItemClient = false;
    if (searchWord.length === 0) {
      await this.setStateAsync({ clientes: [] });
      return;
    }

    if (this.state.filterCliente) return;

    await this.setStateAsync({ filterCliente: true });

    const params = {
      filtrar: searchWord,
    };

    const response = await filtrarCliente(params);

    if (response instanceof SuccessReponse) {
      await this.setStateAsync({
        filterCliente: false,
        clientes: response.data,
      });
    }

    if (response instanceof ErrorResponse) {
      await this.setStateAsync({ filterCliente: false, clientes: [] });
    }
  };

  handleSelectItemClient = async (value) => {
    await this.setStateAsync({
      cliente: value.documento + ' - ' + value.informacion,
      clientes: [],
      idCliente: value.idCliente,
    });
    this.selectItemClient = true;
  };

  //------------------------------------------------------------------------------------------
  // Componente footer
  //------------------------------------------------------------------------------------------

  handleOpenSale = async () => {
    if (this.state.detalleVenta.length === 0) {
      alertWarning('Venta', 'La lista de productos esta vacía.');
      this.refProducto.current.focus();
      return;
    }

    if (this.state.idComprobante === '') {
      alertWarning('Venta', 'Seleccione un comprobante.');
      return;
    }

    if (this.state.idCliente === '') {
      alertWarning('Venta', 'Selecciona un cliente.', () => {
        this.refCliente.current.focus();
      });
      return;
    }

    showModal(this.idModalSale);
    await this.setStateAsync({ loadingModal: true });
  };

  handleClearSale = async () => {
    this.refProducto.current.focus();

    await this.setStateAsync({
      loading: true,
      msgLoading: 'Cargando datos...',

      idComprobante: '',

      idMoneda: '',
      codiso: '',

      idImpuesto: '',

      producto: '',
      sarchProducto: false,
      filterProducto: false,

      idCliente: '',
      cliente: '',
      filterCliente: false,

      comentario: '',

      // Variables del modal de venta
      loadingModal: false,
      selectTipoPago: 1,

      comprobantes: [],
      productos: [],
      clientes: [],
      impuestos: [],
      monedas: [],
      detalleVenta: [],

      numCuota: '',
      letraMensual: '',

      frecuenciaPagoCredito: new Date().getDate() > 15 ? '30' : '15',
      
      frecuenciaPago: new Date().getDate() > 15 ? '30' : '15',

      importeTotal: 0.0,

      // modal venta
      metodosPagoLista: [],
      metodoPagoAgregado: [],

      // modal producto
      loadingProducto: true,
    });

    const productos = await this.fetchProductoPreferidos();

    this.props.favoriteProducts(productos);

    await this.loadingData();
  };

  //------------------------------------------------------------------------------------------
  // Modal Venta
  //------------------------------------------------------------------------------------------

  handleSelectTipoPago = (tipo) => {
    this.setState({ selectTipoPago: tipo });
  };

  handleSelectNumeroCuotas = (event) => {
    this.setState({ numCuota: event.target.value }, () =>
      this.calcularLetraMensual(),
    );
  };

  handleSelectFrecuenciaPagoCredito = (event) => {
    this.setState({ frecuenciaPagoCredito: event.target.value });
  };

  handleSelectFrecuenciaPago = (event) => {
    this.setState({ frecuenciaPago: event.target.value });
  };

  //Metodos Modal Sale
  handleAddMetodPay = () => {
    const listAdd = this.state.metodoPagoAgregado.find(
      (item) => item.idMetodoPago === this.refMetodoContado.current.value,
    );

    if (listAdd) {
      return;
    }

    const metodo = this.state.metodosPagoLista.find(
      (item) => item.idMetodoPago === this.refMetodoContado.current.value,
    );

    const item = {
      idMetodoPago: metodo.idMetodoPago,
      nombre: metodo.nombre,
      monto: '',
      vuelto: metodo.vuelto,
      descripcion: '',
    };

    this.setState((prevState) => ({
      metodoPagoAgregado: [...prevState.metodoPagoAgregado, item],
    }));
  };

  handleRemoveItemMetodPay = (idMetodoPago) => {
    const metodoPagoAgregado = this.state.metodoPagoAgregado.filter(
      (item) => item.idMetodoPago !== idMetodoPago,
    );
    this.setState({ metodoPagoAgregado });
  };

  handleInputMontoMetodoPay = (event, idMetodoPago) => {
    const { value } = event.target;

    this.setState((prevState) => ({
      metodoPagoAgregado: prevState.metodoPagoAgregado.map((item) => {
        if (item.idMetodoPago === idMetodoPago) {
          return { ...item, monto: value ? value : '' };
        } else {
          return item;
        }
      }),
    }));
  };

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
  };

  handleProcessContado = async () => {
    const {
      selectTipoPago,
      idComprobante,
      idMoneda,
      idImpuesto,
      idCliente,
      idSucursal,
      idUsuario,
      comentario,
      detalleVenta,
      metodoPagoAgregado,
      importeTotal,
    } = this.state;

    let metodoPagoLista = [...metodoPagoAgregado];

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

    alertDialog('Venta', '¿Estás seguro de continuar?', async (value) => {
      if (value) {
        const data = {
          tipo: selectTipoPago,
          idComprobante: idComprobante,
          idMoneda: idMoneda,
          idImpuesto: idImpuesto,
          idCliente: idCliente,
          idSucursal: idSucursal,
          comentario: comentario,
          idUsuario: idUsuario,
          estado: 1,
          detalleVenta: detalleVenta,
          metodoPagoAgregado: metodoPagoAgregado,
        };

        hideModal(this.idModalSale);
        alertInfo('Venta', 'Procesando venta...');

        const response = await createFactura(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Venta', response.data, () => {
            // this.handleClearSale();
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getBody() !== '') {
            const body = response.getBody().map(
              (item) =>
                `<tr>
                                <td>${item.nombre}</td>
                                <td>${formatDecimal(item.cantidadActual)}</td>
                                <td>${formatDecimal(item.cantidadReal)}</td>
                                <td>${formatDecimal(
                  item.cantidadActual - item.cantidadReal,
                )}</td>
                            </tr>`,
            );

            alertHTML(
              'Venta',
              `
                        <div class="d-flex flex-column align-items-center">
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
                        </div>
                    `,
            );
          } else {
            alertWarning('Venta', response.getMessage(), () => { });
          }
        }
      }
    });
  };

  handleSaveSale = () => {
    if (this.state.selectTipoPago === 1) {
      this.handleProcessContado();
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
    const { loadingModal, selectTipoPago, } = this.state;

    const { impuestos, monedas, codiso } = this.state;

    const { idComprobante, comprobantes } = this.state;

    const { producto, idSucursal, filterProducto } = this.state;

    const { sarchProducto, productos } = this.state;

    const { cliente, clientes } = this.state;

    const { loading, msgLoading } = this.state;

    const { detalleVenta } = this.state;

    const {
      numCuota,
      frecuenciaPagoCredito,
      letraMensual,
      frecuenciaPago,
      importeTotal,
      metodosPagoLista,
      metodoPagoAgregado,
    } = this.state;

    return (
      <PosContainerWrapper>
        {loading && spinnerLoading(msgLoading)}

        <ModalSale
          idModalSale={this.idModalSale}
          loadingModal={loadingModal}
          selectTipoPago={selectTipoPago}
          codiso={codiso}
          handleSelectTipoPago={this.handleSelectTipoPago}
          refMetodoContado={this.refMetodoContado}
          refNumCutoas={this.refNumCutoas}
          numCuota={numCuota}
          handleSelectNumeroCuotas={this.handleSelectNumeroCuotas}
          refFrecuenciaPagoCredito={this.refFrecuenciaPagoCredito}
          frecuenciaPagoCredito={frecuenciaPagoCredito}
          handleSelectFrecuenciaPagoCredito={this.handleSelectFrecuenciaPagoCredito}
          letraMensual={letraMensual}
   
          refFrecuenciaPago={this.refFrecuenciaPago}
          frecuenciaPago={frecuenciaPago}
          handleSelectFrecuenciaPago={this.handleSelectFrecuenciaPago}
          importeTotal={importeTotal}
          handleSaveSale={this.handleSaveSale}
          metodosPagoLista={metodosPagoLista}
          metodoPagoAgregado={metodoPagoAgregado}
          handleAddMetodPay={this.handleAddMetodPay}
          handleInputMontoMetodoPay={this.handleInputMontoMetodoPay}
          handleRemoveItemMetodPay={this.handleRemoveItemMetodPay}
        />

        <section className="invoice-left">
          <InvoiceView
            producto={producto}
            idSucursal={idSucursal}
            filterProducto={filterProducto}
            handleFilterProducto={this.handleFilterProducto}
            sarchProducto={sarchProducto}
            productos={productos}
            refProducto={this.refProducto}
            handleAddItem={this.handleAddItem}
            handleStarProduct={this.handleStarProduct}
          />
        </section>
        <section className="invoice-right">
          <InvoiceTicket
            handleOpenAndCloseOptions={this.handleOpenAndCloseOptions}
          />

          {/* <InvoiceListPrices
                        refComprobante={this.refComprobante}
                        idComprobante={this.state.idComprobante}
                        comprobantes={this.state.comprobantes}
                        handleSelectComprobante={this.handleSelectComprobante}
                    /> */}

          <InvoiceVoucher
            refComprobante={this.refComprobante}
            idComprobante={idComprobante}
            comprobantes={comprobantes}
            handleSelectComprobante={this.handleSelectComprobante}
          />

          <InvoiceClient
            handleOpenAndCloseCliente={this.handleOpenAndCloseCliente}
            placeholder="Filtrar clientes..."
            refCliente={this.refCliente}
            cliente={cliente}
            clientes={clientes}
            onEventClearInput={this.handleClearInputClient}
            handleFilter={this.handleFilterClient}
            onEventSelectItem={this.handleSelectItemClient}
          />

          <InvoiceDetail
            codiso={codiso}
            detalleVenta={detalleVenta}
            handleMinus={this.handleMinusProducto}
            handlePlus={this.handlePlusProducto}
            handleEdit={this.handleEditProducto}
            handleRemove={this.handleRemoveProducto}
          />

          <InvoiceFooter
            codiso={codiso}
            impuestos={impuestos}
            detalleVenta={detalleVenta}
            handleOpenSale={this.handleOpenSale}
            handleClearSale={this.handleClearSale}
          />
        </section>

        <ModalConfiguration
          idModalConfiguration={this.idModalConfiguration}
          refImpuesto={this.refImpuesto}
          impuestos={impuestos}
          refMoneda={this.refMoneda}
          monedas={monedas}
          refComentario={this.refComentario}
          handleSaveOptions={this.handleSaveOptions}
          handleOpenAndCloseOptions={this.handleOpenAndCloseOptions}
        />

        <ModalCliente
          idModal={this.idModalCliente}
          handleSave={this.handleSaveCliente}
          handleOpenAndClose={this.handleOpenAndCloseCliente}
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
      </PosContainerWrapper>
    );
  }
}

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
export default connect(mapStateToProps, mapDispatchToProps)(VentaCrear);
