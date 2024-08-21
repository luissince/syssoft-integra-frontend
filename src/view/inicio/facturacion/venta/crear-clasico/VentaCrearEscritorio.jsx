import React from 'react';
import {
  alertDialog,
  alertHTML,
  alertInfo,
  alertSuccess,
  alertWarning,
  calculateTax,
  calculateTaxBruto,
  convertNullText,
  formatDecimal,
  getRowCellIndex,
  isEmpty,
  keyNumberPhone,
  numberFormat,
  reorder,
  rounded,
  text,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { PosContainerWrapper } from '../../../../../components/Container';
import {
  getPersonaPredeterminado,
  comboComprobante,
  comboMoneda,
  filtrarPersona,
  preferidosProducto,
  obtenerListaPrecioProducto,
  comboTipoDocumento,
  comboAlmacen,
  detailCotizacionVenta,
  detailOnlyVentaVenta,
  comboImpuesto,
  obtenerVentaPdf,
  filtrarProductoVenta,
  createVenta,
} from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import CustomComponent from '../../../../../model/class/custom-component';
import {
  VENTA,
} from '../../../../../model/types/tipo-comprobante';
import PropTypes from 'prop-types';
import { A_GRANEL, SERVICIO, UNIDADES, VALOR_MONETARIO } from '../../../../../model/types/tipo-tratamiento-producto';
import { CLIENTE_JURIDICO, CLIENTE_NATURAL } from '../../../../../model/types/tipo-cliente';
import { CONTADO } from '../../../../../model/types/forma-pago';
import ModalProdcutos from '../common/ModalProductos';
import { getDni, getRuc } from '../../../../../network/rest/apisperu.network';
import { images } from '../../../../../helper';
import Input from '../../../../../components/Input';
import Select from '../../../../../components/Select';
import Button from '../../../../../components/Button';
import { setProductosFavoritos, starProduct } from '../../../../../redux/predeterminadoSlice';
import RadioButton from '../../../../../components/RadioButton';
import SearchInput from '../../../../../components/SearchInput';
import ModalVenta from '../common/ModalVenta';
import ModalCotizacion from '../common/ModalCotizacion';
import { SpinnerView } from '../../../../../components/Spinner';
import ModalConfiguration from '../common/ModalConfiguration';
import ModalAgregar from '../common/ModalAgregar';
import printJS from 'print-js';
import ModalImpresion from '../common/ModalImpresion';
import ButtonsOpciones from './component/ButtonsOpciones';
import ModalPrecios from './component/ModalPrecios';
import ModalCantidad from './component/ModalCantidad';
import ModalDatos from './component/ModalDatos';
import ModalPreImpresion from '../common/ModalPreImpresion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ModalTransaccion from '../../../../../components/ModalTransaccion';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class VentaCrearEscritorio extends CustomComponent {

  constructor(props) {
    super(props);

    this.state = {
      // Atributos de carga
      loading: true,
      msgLoading: 'Cargando datos...',

      // Atributos principales
      idVenta: '',
      idComprobante: '',
      codigoBarras: '',
      detalleVenta: [],

      // Lista de datos
      comprobantes: [],
      clientes: [],
      impuestos: [],
      monedas: [],
      almacenes: [],
      tiposDocumentos: [],

      // Atributos libres
      nombreComporbante: '',
      codiso: '',
      importeTotal: 0,

      // Atributos del modal impresión
      isOpenImpresion: false,

      // Atributos del modal pre impresión
      isOpenPreImpresion: false,

      // Atributos del modal agregar
      isOpenAgregar: false,

      // Atributos del modal productos
      isOpenProductos: false,

      // Atributos del modal cotización
      isOpenCotizacion: false,
      idCotizacion: "",

      // Atributos del modal venta
      isOpenVenta: false,

      // Atributos del modal cobrar
      isOpenTerminal: false,

      // Atributos del modal precios
      isOpenPrecios: false,

      // Atributos del modal cantidad
      isOpenCantidad: false,

      // Atributos del modal datos
      isOpenDatos: false,

      // Atributos del modal configuración
      idImpuesto: '',
      idMoneda: '',
      idAlmacen: '',
      comentario: '',
      cacheConfiguracion: null,

      // Atributos del modal cobro
      loadingModal: false,
      formaPago: CONTADO,

      // Filtrar cliente
      idCliente: '',
      nuevoCliente: null,

      // Atributos del modal cliente
      loadingCliente: false,
      msgLoadingCliente: 'Consultado datos...',
      idTipoCliente: CLIENTE_NATURAL,
      idTipoDocumento: '',
      numeroDocumento: '',
      informacion: '',
      numeroCelular: '',
      email: '',
      direccion: '',

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.initial = { ...this.state }

    // Referencia al modal impresión
    this.refModalImpresion = React.createRef();

    // Atributos generales
    this.redCodigoBarras = React.createRef();

    // Referencia al modal de productos
    this.refModalProductos = React.createRef();

    // Referencia al modal de cotizaciones
    this.refModalCotizacion = React.createRef();

    // Referencia al modal de ventas
    this.refModalVenta = React.createRef();

    // Referencia al tipo de comprobante
    this.refComprobante = React.createRef();

    // Referencia al modal agregar
    this.refModalAgregar = React.createRef();

    // Referencia al modal agregar
    this.refModalPrecios = React.createRef();

    // Referencia al modal agregar
    this.refModalCantidad = React.createRef();

    // Referencia al modal agregar
    this.refModalDatos = React.createRef();

    // Atributos para el modal configuración
    this.idModalConfiguration = 'idModalConfiguration';
    this.refImpuesto = React.createRef();
    this.refMoneda = React.createRef();
    this.refAlmacen = React.createRef();
    this.refComentario = React.createRef();

    // Atributos para el modal cliente
    this.idModalCliente = 'idModalCliente';
    this.refIdTipoDocumento = React.createRef();
    this.refPersona = React.createRef();
    this.refNumeroDocumento = React.createRef();
    this.refInformacion = React.createRef();
    this.refNumeroCelular = React.createRef();
    this.refEmail = React.createRef();
    this.refDireccion = React.createRef();

    this.refTable = React.createRef();
    this.refTableBody = React.createRef();
    this.index = -1;
    this.cells = [];

    this.abortControllerView = new AbortController();
    this.abortControllerCotizacion = new AbortController();
    this.abortControllerVenta = new AbortController();
    this.abortControllerCliente = null;
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

    if (this.abortControllerCliente) {
      this.abortControllerCliente.abort();
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

      idTipoCliente: typeof predeterminado === 'object' ? predeterminado.idTipoCliente : '',
      idTipoDocumento: typeof predeterminado === 'object' ? predeterminado.idTipoDocumento : '',

      idMoneda: monedaFilter ? monedaFilter.idMoneda : '',
      codiso: monedaFilter ? monedaFilter.codiso : 'PEN',

      idImpuesto: impuestoFilter ? impuestoFilter.idImpuesto : '',

      idAlmacen: almacenFilter ? almacenFilter.idAlmacen : '',

      tiposDocumentos,

      loading: false,
    });

    const productos = await this.fetchProductoPreferidos({ idSucursal: this.state.idSucursal, idAlmacen: almacenFilter ? almacenFilter.idAlmacen : '' });
    this.props.setProductosFavoritos(productos);
    this.redCodigoBarras.current.focus();
  };

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

  async reloadProductoPreferidos(callback = function () { }) {
    const productos = await this.fetchProductoPreferidos({
      idSucursal: this.state.idSucursal,
      idAlmacen: this.state.idAlmacen
    });
    this.props.setProductosFavoritos(productos);
    await this.setStateAsync({ productos: productos });
    callback();
  }

  reloadView() {
    this.setState(this.initial, async () => {
      await this.refPersona.current.restart();
      await this.loadingData();
      this.index = -1;
      this.cells = [];
    })
  }

  calculateTotal = () => {
    this.setState(prevState => ({
      importeTotal: prevState.detalleVenta.reduce((accumulator, item) => {
        const cantidad = item.idTipoTratamientoProducto === SERVICIO
          ? item.cantidad
          : item.inventarios.reduce((acc, current) => acc + current.cantidad, 0);

        const totalProductPrice = item.precio * cantidad;
        return accumulator + totalProductPrice;
      }, 0)
    }));
  }

  addItemDetalle = (producto, precio, cantidad, index = -1) => {
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
          id: index === -1 ? this.state.detalleVenta.length + 1 : index,
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
          detalleVenta: [...prevState.detalleVenta, newItem],
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
          ),
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
          id: index === -1 ? this.state.detalleVenta.length + 1 : index,
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
          detalleVenta: [...prevState.detalleVenta, newItem],
        }));
      } else {
        existingItem.precio = Number(precio);

        this.setState(prevState => ({
          detalleVenta: prevState.detalleVenta.map(item =>
            item.idProducto === existingItem.idProducto ? existingItem : item
          ),
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
          id: index === -1 ? this.state.detalleVenta.length + 1 : index,
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
          detalleVenta: [...prevState.detalleVenta, newItem],
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
              inventario.cantidad = cantidad;
              break;
            }
          }
        }

        this.setState(prevState => ({
          detalleVenta: prevState.detalleVenta.map(item =>
            item.idProducto === existingItem.idProducto ? existingItem : item
          ),
        }));
      }
    }

    if (producto.idTipoTratamientoProducto === SERVICIO) {
      if (!existingItem) {
        const newItem = {
          id: index === -1 ? this.state.detalleVenta.length + 1 : index,
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
          detalleVenta: [...prevState.detalleVenta, newItem],
        }));
      }
    }

    this.calculateTotal();
  }

  generateTotals = () => {
    const { codiso, detalleVenta, impuestos } = this.state;

    const subTotal = detalleVenta.reduce((accumulator, item) => {
      const cantidad = item.idTipoTratamientoProducto === SERVICIO
        ? item.cantidad
        : item.inventarios.reduce((acc, current) => acc + current.cantidad, 0);

      const precio = item.precio;
      const filter = impuestos.filter((imp) => imp.idImpuesto === item.idImpuesto);
      const impuesto = filter.length > 0 ? filter[0].porcentaje : 0;

      const total = cantidad * precio;
      return accumulator + calculateTaxBruto(impuesto, total);
    }, 0);

    const impuestosTotal = () => {
      const resultado = detalleVenta.reduce((acc, item) => {
        const impuesto = impuestos.find(
          (imp) => imp.idImpuesto === item.idImpuesto,
        );

        if (impuesto) {
          const cantidad = item.idTipoTratamientoProducto === SERVICIO
            ? item.cantidad
            : item.inventarios.reduce((acc, current) => acc + current.cantidad, 0);

          const total = cantidad * item.precio;
          const subTotal = calculateTaxBruto(impuesto.porcentaje, total);
          const impuestoTotal = calculateTax(impuesto.porcentaje, subTotal);

          const existingImpuesto = acc.find(
            (imp) => imp.idImpuesto === impuesto.idImpuesto,
          );

          if (existingImpuesto) {
            existingImpuesto.valor += impuestoTotal;
          } else {
            acc.push({
              idImpuesto: impuesto.idImpuesto,
              nombre: impuesto.nombre,
              valor: impuestoTotal,
            });
          }
        }

        return acc;
      }, []);

      return resultado.map((impuesto, index) => {
        return (
          <div key={index} className='d-flex justify-content-between justify-content-between'>
            <span className='text-sm'>{impuesto.nombre}:</span>
            <span className='text-sm text-right'>{numberFormat(impuesto.valor, codiso)}</span>
          </div>
        );
      });
    };

    const total = detalleVenta.reduce((accumulator, item) => {
      const cantidad = item.idTipoTratamientoProducto === SERVICIO
        ? item.cantidad
        : item.inventarios.reduce((acc, current) => acc + current.cantidad, 0);

      const totalProductPrice = item.precio * cantidad;
      return accumulator + totalProductPrice;
    }, 0);

    return (
      <div className='h-100 overflow-auto p-2' style={{ borderTop: '1px solid #cbd5e1' }}>
        <div className='w-100' style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
          <div className='d-flex justify-content-between'>
            <span className='text-sm'>Subtotal:</span>
            <span className='text-sm text-right'>{numberFormat(subTotal, codiso)}</span>
          </div>

          {impuestosTotal()}

          <div className='d-flex justify-content-between'>
            <span className='text-base'>Total:</span>
            <span className='text-base text-right'>{numberFormat(total, codiso)}</span>
          </div>
        </div>
      </div>
    );
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
    if (event.key === 'F1' && !this.state.isOpenProductos && !this.state.isOpenImpresion && !this.state.isOpenTerminal && !this.state.isOpenAgregar && !this.state.isOpenCotizacion && !this.state.isOpenVenta) {
      this.handleOpenSale();
    }

    if (event.key === 'F2' && !this.state.isOpenProductos && !this.state.isOpenImpresion && !this.state.isOpenTerminal && !this.state.isOpenAgregar && !this.state.isOpenCotizacion && !this.state.isOpenVenta) {
      this.handleOpenProductos();
    }

    if ((event.ctrlKey || event.metaKey) && (event.key === 'd' || event.key === 'D')) {
      this.redCodigoBarras.current.focus();
    }
  }

  handleAddItem = async (producto) => {
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

  handleRemoveItem = (producto) => {
    this.setState(prevState => ({
      detalleVenta: prevState.detalleVenta.filter(item => item.idProducto !== producto.idProducto).map((item, index) => ({
        ...item,
        id: ++index,
      }))
    }), () => {
      if (isEmpty(this.state.detalleVenta)) {
        this.index = -1;
        this.cells = [];
      }
    });

    this.calculateTotal();
  }

  handleInputCodigoBarras = (event) => {
    this.setState({ codigoBarras: event.target.value })
  }

  handleOnKeyDownCodigoBarras = async (event) => {
    if (event.key === 'Enter') {

      this.setState({
        loading: true,
        msgLoading: 'Buscando producto...',
      });

      const params = {
        tipo: 1,
        filtrar: this.state.codigoBarras,
        idSucursal: this.state.idSucursal,
        idAlmacen: this.state.idAlmacen,
        posicionPagina: 0,
        filasPorPagina: 1,
      };

      const response = await filtrarProductoVenta(params);
      if (response instanceof SuccessReponse) {
        if (!isEmpty(response.data.lists)) {
          this.handleAddItem(response.data.lists[0])
        }

        this.setState({
          loading: false,
          codigoBarras: '',
        });
        this.redCodigoBarras.current.focus();
      }

      if (response instanceof ErrorResponse) {
        if (response.getType() === CANCELED) return;

        this.setState({
          loading: false,
          codigoBarras: '',
        });
        this.redCodigoBarras.current.focus();
      }
    }
  }

  handleOpenSale = async () => {
    const tipoDocumento = this.state.tiposDocumentos.find(item => item.idTipoDocumento === this.state.idTipoDocumento);

    if (isEmpty(this.state.detalleVenta)) {
      alertWarning('Venta', 'La lista de productos esta vacía.', () => {
        this.redCodigoBarras.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idComprobante)) {
      alertWarning('Venta', 'Seleccione un comprobante.', () => {
        this.refComprobante.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idTipoDocumento)) {
      alertWarning('Venta', 'Seleccione el tipo de documento.', () => {
        this.refIdTipoDocumento.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.numeroDocumento)) {
      alertWarning('Venta', 'Ingrese el número de documento.', () => {
        this.refNumeroDocumento.current.focus();
      });
      return;
    }

    if (tipoDocumento && tipoDocumento.obligado === 1 && tipoDocumento.longitud !== this.state.numeroDocumento.length) {
      alertWarning("Venta", `El número de documento por ser ${tipoDocumento.nombre} tiene que tener una longitud de ${tipoDocumento.longitud} carácteres.`, () => {
        this.refNumeroDocumento.current.focus();
      })
      return;
    }

    if (isEmpty(this.state.informacion)) {
      alertWarning('Venta', 'Ingrese los datos del cliente.', () => {
        this.refInformacion.current.focus();
      });
      return;
    }

    await this.setStateAsync({
      nuevoCliente: {
        idTipoCliente: this.state.idTipoCliente,
        idTipoDocumento: this.state.idTipoDocumento,
        numeroDocumento: text(this.state.numeroDocumento),
        informacion: text(this.state.informacion),
        numeroCelular: text(this.state.numeroCelular),
        email: text(this.state.email),
        direccion: text(this.state.direccion),
      }
    });

    this.handleOpenModalTerminal();
  }

  handleClearSale = async () => {
    alertDialog("Venta", "Los productos serán eliminados de la venta actual ¿Desea continuar?", async (accept) => {
      if (accept) {
        this.reloadView()
      }
    })
  }

  handleSelectComprobante = (event) => {
    const comprobante = this.state.comprobantes.find(item => item.idComprobante == event.target.value);

    this.setState({
      idComprobante: event.target.value,
      nombreComporbante: !comprobante ? "Ninguno" : comprobante.nombre
    });
  }

  //------------------------------------------------------------------------------------------
  // Acciones del modal terminal
  //------------------------------------------------------------------------------------------
  handleOpenModalTerminal = () => {
    this.setState({ isOpenTerminal: true })
  }

  handleProcessContado = (idFormaPago, metodoPagosLista, callback = async function () { }) => {
    const {
      nuevoCliente,
      comentario,
      idUsuario,
      idSucursal,
      idCliente,
      idImpuesto,
      idMoneda,
      idComprobante,
      idCotizacion,
      detalleVenta
    } = this.state;

    alertDialog('Venta', '¿Estás seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idFormaPago: idFormaPago,
          idComprobante: idComprobante,
          idMoneda: idMoneda,
          idImpuesto: idImpuesto,
          idCliente: idCliente,
          idSucursal: idSucursal,
          comentario: comentario,
          idUsuario: idUsuario,
          estado: 1,
          nuevoCliente: nuevoCliente,
          idCotizacion: idCotizacion,
          detalleVenta: detalleVenta,
          bancosAgregados: metodoPagosLista,
        };

        await callback();
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
  }

  handleProcessCredito = (idFormaPago, numeroCuotas, frecuenciaPagoCredito, importeTotal, callback = async function () { }) => {
    const {
      nuevoCliente,
      comentario,
      idUsuario,
      idSucursal,
      idCliente,
      idImpuesto,
      idMoneda,
      idComprobante,
      detalleVenta
    } = this.state;


    alertDialog('Venta', '¿Estás seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idFormaPago: idFormaPago,
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

        await callback();
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
  }

  handleCloseModalTerminal = async () => {
    this.setState({ isOpenTerminal: false })
  }

  //------------------------------------------------------------------------------------------
  // Modal de productos
  //------------------------------------------------------------------------------------------
  handleOpenProductos = () => {
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

    this.setState({ isOpenProductos: true })
  }

  handleCloseProductos = () => {
    this.setState({ isOpenProductos: false })
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
  // Acciones del modal precios
  //------------------------------------------------------------------------------------------
  handleOpenPrecios = () => {
    const item = this.state.detalleVenta[this.index];
    if (item) {
      this.setState({ isOpenPrecios: true });
      this.refModalPrecios.current.loadDatos(item);
    }
  }

  handleClosePrecios = () => {
    this.setState({ isOpenPrecios: false });
  }

  handleSavePrecios = (producto, precio) => {
    if (producto.precio !== precio && producto.idTipoTratamientoProducto === VALOR_MONETARIO) {
      alertWarning('Venta', 'Los productos a granel no se puede cambia el precio.');
      return;
    }

    this.setState(prevState => ({
      detalleVenta: prevState.detalleVenta.map((item) => {
        if (item.idProducto === producto.idProducto) {
          return {
            ...item,
            precio
          }
        }
        return item
      })
    }));

    this.calculateTotal();
  }

  //------------------------------------------------------------------------------------------
  // Acciones del modal cantidad
  //------------------------------------------------------------------------------------------
  handleOpenCantidad = () => {
    const item = this.state.detalleVenta[this.index];
    if (item) {
      this.setState({ isOpenCantidad: true });
      this.refModalCantidad.current.loadDatos(item);
    }
  }

  handleCloseCantidad = () => {
    this.setState({ isOpenCantidad: false });
  }

  handleSaveCantidad = async (idProducto, inventarios) => {
    this.setState((prevState) => ({
      detalleVenta: prevState.detalleVenta.map((item) => {
        if (item.idProducto === idProducto) {
          return {
            ...item,
            inventarios: inventarios
          }
        } else {
          return {
            ...item
          }
        }
      })
    }));

    this.calculateTotal();
  }

  //------------------------------------------------------------------------------------------
  // Acciones del modal datos
  //------------------------------------------------------------------------------------------
  handleOpenDatos = () => {
    const item = this.state.detalleVenta[this.index];
    if (item) {
      this.setState({ isOpenDatos: true });
      this.refModalDatos.current.loadDatos(item);
    }

    // this.refModalAgregar.current.loadDatos(titulo, subTitulo, producto);
  }

  handleCloseDatos = () => {
    this.setState({ isOpenDatos: false });
  }

  handleSaveDatos = async (producto, descripcion) => {
    this.setState(prevState => ({
      detalleVenta: prevState.detalleVenta.map((item) => {
        if (item.idProducto === producto.idProducto) {
          return {
            ...item,
            nombreProducto: descripcion
          }
        }
        return item
      })
    }));

    this.calculateTotal();
  }

  //------------------------------------------------------------------------------------------
  // Modal de cotización
  //------------------------------------------------------------------------------------------

  handleOpenCotizacion = () => {
    this.setState({ isOpenCotizacion: true })
  }

  handleCloseCotizacion = () => {
    this.setState({ isOpenCotizacion: false })
  }

  handleSeleccionarCotizacion = async (idCotizacion) => {
    this.handleCloseCotizacion();

    this.setState({ loading: true, msgLoading: "Obteniendos datos de la cotización.", detalleVenta: [] });

    const params = {
      idCotizacion: idCotizacion,
      idAlmacen: this.state.idAlmacen
    };

    const response = await detailCotizacionVenta(params, this.abortControllerCotizacion.signal);

    if (response instanceof SuccessReponse) {
      this.handleSelectItemCliente(response.data.cliente);
      let index = 0;
      for (const producto of response.data.productos) {
        index++;
        if (producto.idTipoTratamientoProducto === UNIDADES || producto.idTipoTratamientoProducto === SERVICIO) {
          this.addItemDetalle(producto, null, producto.cantidad, index);
        }
        if (producto.idTipoTratamientoProducto === VALOR_MONETARIO) {
          this.addItemDetalle(producto, producto.cantidad * producto.precio, null, index);
        }
        if (producto.idTipoTratamientoProducto === A_GRANEL) {
          this.addItemDetalle(producto, null, producto.cantidad, index);
        }
      }

      this.setState({ idCotizacion, loading: false })
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.setState({ loading: false });
      alertWarning("Venta", response.getMessage())
    }
  }

  //------------------------------------------------------------------------------------------
  // Modal de venta
  //------------------------------------------------------------------------------------------

  handleOpenVenta = () => {
    this.setState({ isOpenVenta: true })
  }

  handleCloseVenta = () => {
    this.setState({ isOpenVenta: false })
  }

  handleSeleccionarVenta = async (idVenta) => {
    this.handleCloseVenta();

    this.setState({ loading: true, msgLoading: "Obteniendos datos de la venta.", detalleVenta: [] });

    const params = {
      idVenta: idVenta,
      idAlmacen: this.state.idAlmacen
    };

    const response = await detailOnlyVentaVenta(params, this.abortControllerVenta.signal);

    if (response instanceof SuccessReponse) {
      this.handleSelectItemCliente(response.data.cliente);
      let index = 0;
      for (const producto of response.data.productos) {
        index++;
        if (producto.idTipoTratamientoProducto === UNIDADES || producto.idTipoTratamientoProducto === SERVICIO) {
          this.addItemDetalle(producto, null, producto.cantidad, index);
        }
        if (producto.idTipoTratamientoProducto === VALOR_MONETARIO) {
          this.addItemDetalle(producto, producto.cantidad * producto.precio, null, index);
        }
        if (producto.idTipoTratamientoProducto === A_GRANEL) {
          this.addItemDetalle(producto, null, producto.cantidad, index);
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
  // Modal cliente
  //------------------------------------------------------------------------------------------

  handleInputInformacion = (event) => {
    this.setState({ informacion: event.target.value })
  }

  handleInputNumeroCelular = (event) => {
    this.setState({ numeroCelular: event.target.value })
  }

  handleInputEmail = (event) => {
    this.setState({ email: event.target.value })
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

    this.abortControllerCliente = new AbortController();

    this.setState({
      loadingCliente: true,
      msgLoadingCliente: 'Consultando número de DNI...',
    });

    const response = await getDni(this.state.numeroDocumento, this.abortControllerCliente.signal);

    if (response instanceof SuccessReponse) {
      this.setState({
        numeroDocumento: convertNullText(response.data.dni),
        informacion: convertNullText(response.data.apellidoPaterno) + ' ' + convertNullText(response.data.apellidoMaterno) + ' ' + convertNullText(response.data.nombres),
        loadingCliente: false,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) {
        this.setState({
          loadingCliente: false,
        });
        return;
      }

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

    this.abortControllerCliente = new AbortController();

    this.setState({
      loadingCliente: true,
      msgLoadingCliente: 'Consultando número de RUC...',
    });

    const response = await getRuc(this.state.numeroDocumento, this.abortControllerCliente.signal);

    if (response instanceof SuccessReponse) {
      this.setState({
        numeroDocumento: convertNullText(response.data.ruc),
        informacion: convertNullText(response.data.razonSocial),
        direccion: convertNullText(response.data.direccion),
        loadingCliente: false,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) {
        this.setState({
          loadingCliente: false,
        });
        return;
      }

      alertWarning('Venta', response.getMessage(), () => {
        this.setState({
          loadingCliente: false,
        });
      });
    }
  };

  //------------------------------------------------------------------------------------------
  // Filtrar cliente
  //------------------------------------------------------------------------------------------

  handleClearInputCliente = () => {
    this.setState({
      clientes: [],
      idCliente: '',
      idTipoCliente: CLIENTE_NATURAL,
      idTipoDocumento: '',
      numeroDocumento: '',
      informacion: '',
      numeroCelular: '',
      email: '',
      direccion: '',
      nuevoCliente: null,
    });
  }

  handleFilterCliente = async (text) => {
    const searchWord = text;
    this.setState({ idCliente: '', numeroDocumento: searchWord });

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

  handleSetValueCliente = (value) =>{
    this.setState({
      numeroDocumento: value
    });
  }

  handleSelectItemCliente = (value) => {
    this.refPersona.current.initialize(value.documento);
    this.setState({
      clientes: [],
      idCliente: value.idPersona,
      idTipoCliente: value.idTipoCliente,
      idTipoDocumento: value.idTipoDocumento,
      numeroDocumento: value.documento,
      informacion: value.informacion,
      numeroCelular: value.celular,
      email: value.email,
      direccion: value.direccion,
    });
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

  handleSelectIdIdAlmacen = async (event, active = false, callback = function () { }) => {
    this.setState({ idAlmacen: event.target.value }, () => {
      if (active) {
        this.reloadProductoPreferidos(callback);
      }
    })
  }

  handleInputComentario = async (event) => {
    this.setState({ comentario: event.target.value });
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
    });
  }


  //------------------------------------------------------------------------------------------
  // Eventos de la tabla
  //------------------------------------------------------------------------------------------
  handleKeyDownTable = (event) => {
    const table = this.refTable.current;
    if (!table) return;

    const children = table.tBodies[0].children;
    if (children.length === 0) return;

    if (event.key === 'ArrowUp') {
      if (this.index > 0) {
        this.index--;
        this.updateSelection(children);
      }
    }

    if (event.key === 'ArrowDown') {
      if (this.index < children.length - 1) {
        this.index++;
        this.updateSelection(children);
      }
    }

    if (event.key === 'Enter') {
      if (this.index >= 0) {
        this.handleOpenDatos()
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }

  handleOnClick = async (event) => {
    const { rowIndex, tBody } = getRowCellIndex(event);

    if (rowIndex === -1 || !tBody || !tBody.children) return;

    this.index = rowIndex;
    this.updateSelection(tBody.children);
  }

  handleOnDbClick = async (event) => {
    const { rowIndex, cellIndex, tBody } = getRowCellIndex(event);

    if (rowIndex === -1 || !tBody || !tBody.children) return;

    this.index = rowIndex;
    this.updateSelection(tBody.children);

    if (cellIndex === 2) {
      this.handleOpenCantidad();
    }

    if (cellIndex === 3) {
      this.handleOpenDatos();
    }

    if (cellIndex === 4) {
      this.handleOpenPrecios();
    }
  }

  handleOnDragEndTable = async (result) => {
    const { source, destination } = result;
    if (!destination) {
      return;
    }

    if (source.index === destination.index &&
      source.droppableId === destination.droppableId
    ) {
      return;
    }

    await this.setStateAsync(prevState => ({
      detalleVenta: reorder(prevState.detalleVenta, source.index, destination.index).map((item, index) => ({ ...item, id: ++index }))
    }))

    this.index = destination.index;
    this.cells = [];
    if (this.refTableBody.current) {
      const tbody = this.refTableBody.current;
      this.updateSelection(tbody.children);
    }
  }

  handleOnBeforeDragStartTable = (before) => {
    const sourceIndex = before.source.index;

    if (this.refTableBody.current) {
      const tbody = this.refTableBody.current;
      const rows = tbody.children;
      const row = rows[sourceIndex]
      this.cells = row.children;
    }
  }

  updateSelection = (children) => {
    for (const child of children) {
      child.classList.remove("table-active");
    }

    const selectedChild = children[this.index];
    selectedChild.classList.add("table-active");
    selectedChild.scrollIntoView({ block: 'center' });
    selectedChild.focus();
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

  generateBody() {
    const { detalleVenta, codiso } = this.state;
    return detalleVenta.map((producto, key) => {

      const cantidad = producto.idTipoTratamientoProducto === SERVICIO
        ? producto.cantidad
        : producto.inventarios.reduce((acc, current) => acc + current.cantidad, 0);

      const widthCell1 = isEmpty(this.cells) ? "auto" : this.cells[0].offsetWidth + "px";
      const widthCell2 = isEmpty(this.cells) ? "auto" : this.cells[1].offsetWidth + "px";
      const widthCell3 = isEmpty(this.cells) ? "auto" : this.cells[2].offsetWidth + "px";
      const widthCell4 = isEmpty(this.cells) ? "auto" : this.cells[3].offsetWidth + "px";
      const widthCell5 = isEmpty(this.cells) ? "auto" : this.cells[4].offsetWidth + "px";
      const widthCell6 = isEmpty(this.cells) ? "auto" : this.cells[5].offsetWidth + "px";

      return (
        <Draggable key={producto.idProducto} draggableId={producto.idProducto} index={key}>
          {(provided) => {
            return (
              <tr
                {...provided.draggableProps}
                ref={provided.innerRef}
                {...provided.dragHandleProps}
                className='bg-white'
              >
                <td className='text-center' style={{ width: widthCell1 }}>{producto.id}</td>
                <td className='text-center' style={{ width: widthCell2 }}>
                  <Button
                    className='btn-outline-danger'
                    icono={<i className="bi bi-trash"></i>}
                    onClick={() => this.handleRemoveItem(producto)} />
                </td>
                <td className='text-center' style={{ width: widthCell3 }}>

                  {producto.idTipoTratamientoProducto === SERVICIO && (
                    <p>{rounded(producto.cantidad)}</p>
                  )}

                  {(producto.idTipoTratamientoProducto === UNIDADES || producto.idTipoTratamientoProducto === A_GRANEL) && producto.inventarios.map((item, index) => (
                    <div key={index} className={`${producto.inventarios.length - 1 === index ? "" : " border-bottom  mb-2"} `}>
                      <span>{item.almacen}</span>
                      <p className='my-1'>{rounded(item.cantidad)}</p>
                    </div>
                  ))}

                  {producto.idTipoTratamientoProducto === VALOR_MONETARIO && producto.inventarios.map((item, index) => (
                    <div key={index}>
                      <span>{item.almacen}</span>
                      <p className='my-1'>{rounded(item.cantidad)}</p>
                    </div>
                  ))}
                  {/* {
              producto.idTipoTratamientoProducto === SERVICIO ?
                <span key={key}>{rounded(producto.cantidad)}</span>
                :
                producto.inventarios.map((inventario, key) => (
                  <span key={key}>{rounded(inventario.cantidad)}</span>
                ))
            } */}
                </td>
                <td className='text-left' style={{ width: widthCell4 }}>
                  {producto.codigo}
                  <br />
                  {producto.nombreProducto}
                </td>
                <td className='text-center' style={{ width: widthCell5 }}>{numberFormat(producto.precio, codiso)}</td>
                {/* <td className='text-center'>0%</td> */}
                <td className='text-center' style={{ width: widthCell6 }}>{numberFormat(producto.precio * cantidad, codiso)}</td>
              </tr>
            );
          }}
        </Draggable>

      );
    });
  }

  render() {
    return (
      <PosContainerWrapper className={'flex-column bg-white'}>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <ModalTransaccion
          isOpen={this.state.isOpenTerminal}

          idSucursal={this.state.idSucursal}
          codiso={this.state.codiso}
          importeTotal={this.state.importeTotal}

          onClose={this.handleCloseModalTerminal}
          handleProcessContado={this.handleProcessContado}
          handleProcessCredito={this.handleProcessCredito}
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

        <ModalProdcutos
          refModal={this.refModalProductos}
          isOpen={this.state.isOpenProductos}
          productos={this.props.productos}
          codiso={this.state.codiso}
          idSucursal={this.state.idSucursal}

          almacenes={this.state.almacenes}
          refAlmacen={this.refAlmacen}
          idAlmacen={this.state.idAlmacen}
          handleSelectIdIdAlmacen={this.handleSelectIdIdAlmacen}

          handleClose={this.handleCloseProductos}
          handleSeleccionar={this.handleAddItem}
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

        <ModalAgregar
          ref={this.refModalAgregar}
          isOpen={this.state.isOpenAgregar}
          detalleVenta={this.state.detalleVenta}
          onClose={this.handleCloseAgregar}
          handleAdd={this.handleSaveAgregar}
        />

        <ModalPrecios
          ref={this.refModalPrecios}
          isOpen={this.state.isOpenPrecios}
          onClose={this.handleClosePrecios}
          handleSave={this.handleSavePrecios}
        />

        <ModalCantidad
          ref={this.refModalCantidad}
          isOpen={this.state.isOpenCantidad}
          onClose={this.handleCloseCantidad}
          handleSave={this.handleSaveCantidad}
        />

        <ModalDatos
          ref={this.refModalDatos}
          isOpen={this.state.isOpenDatos}
          onClose={this.handleCloseDatos}
          handleSave={this.handleSaveDatos}
        />

        {/* Crear botone */}
        <ButtonsOpciones
          handleOpenProductos={this.handleOpenProductos}
          handleOpenPrecios={this.handleOpenPrecios}
          handleOpenCantidad={this.handleOpenCantidad}
          handleOpenDatos={this.handleOpenDatos}
          handleOpenImpresion={this.handleOpenPreImpresion}
          handleClearSale={this.handleClearSale}
          handleOpenVenta={this.handleOpenVenta}
          handleOpenCotizacion={this.handleOpenCotizacion}
          handleOpenOptions={this.handleOpenOptions}
        />

        {/* Cuerpo princiapl */}
        <div className='bg-white w-100 d-flex flex-column overflow-auto ' style={{ height: 'calc(100% - 3.5rem)' }}>
          <div className='d-flex w-100 h-100 p-3'>
            <div className='w-100 d-flex flex-column position-relative mr-1' style={{
              flex: '1 1 100%',
              border: '1px solid #cbd5e1',
            }}>

              <div className='d-flex justify-content-between mb-3 pl-3 pt-3 pr-3 pb-0'>
                <div className='d-flex w-100'>
                  <div className='d-flex align-items-center mr-1'>
                    <img src={images.barcode} width={22} className='mr-1' />
                    <label className='m-0'> CTRL+D</label>
                  </div>
                  <Input
                    refInput={this.redCodigoBarras}
                    value={this.state.codigoBarras}
                    onChange={this.handleInputCodigoBarras}
                    onKeyDown={this.handleOnKeyDownCodigoBarras}
                    placeholder='Ingrese el código de barras o clave alterna... '
                  />
                </div>
              </div>

              {
                isEmpty(this.state.detalleVenta) && (
                  <div className='h-100 pl-3 pr-3 pb-3'>
                    <div className='h-100 d-flex flex-column align-items-center justify-content-center text-center'
                      style={{
                        border: '1px solid #cbd5e1',
                      }}>
                      <img
                        src={images.basket}
                        className='mb-1'
                        alt='Icono de basket'
                      />
                      <span className='text-base'>Aquí verás los productos que elijas en tu próxima venta</span>
                    </div>
                  </div>
                )
              }

              {
                !isEmpty(this.state.detalleVenta) && (
                  <div
                    className='h-100 overflow-auto pt-0 pr-3 pb-3 pl-3'
                    onKeyDown={this.handleKeyDownTable}>
                    <table
                      ref={this.refTable}
                      onClick={this.handleOnClick}
                      onDoubleClick={this.handleOnDbClick}
                      className={"table table-bordered table-hover table-sticky w-100"}>
                      <thead>
                        <tr>
                          <th width="5%">#</th>
                          <th width="5%">Quitar</th>
                          <th width="10%">Almacen/Cantidad</th>
                          <th width="20%">Descripción</th>
                          <th width="10%">Precio</th>
                          {/* <th width="10%">Descuento</th> */}
                          <th width="10%">Importe</th>
                        </tr>
                      </thead>
                      <DragDropContext
                        onDragEnd={this.handleOnDragEndTable}
                        onBeforeDragStart={this.handleOnBeforeDragStartTable}
                      >
                        <Droppable droppableId="table-body">
                          {(provided) => (
                            <tbody
                              ref={(el) => {
                                provided.innerRef(el)
                                this.refTableBody.current = el;
                              }}
                              {...provided.droppableProps}>
                              {this.generateBody()}
                              {provided.placeholder}
                            </tbody>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </table>
                  </div>
                )
              }
            </div>

            <div
              className='d-flex flex-column position-relative ml-1'
              style={{
                flex: '0 0 40%', width: '450px', maxWidth: '450px',
                border: '1px solid #cbd5e1',
              }}>

              <SpinnerView
                loading={this.state.loadingCliente}
                message={this.state.msgLoadingCliente}
                body={<>
                  <div className='mt-2'>
                    <Button className='btn-danger'
                      onClick={() => {
                        if (this.abortControllerCliente) {
                          this.abortControllerCliente.abort();
                        }
                      }}>
                      Cancelar petición <i className='fa fa-close'></i>
                    </Button>
                  </div>
                </>}
              />

              <div>
                <Button
                  className={"btn-primary btn-lg w-100 d-flex align-items-center justify-content-between py-3"}
                  onClick={this.handleOpenSale}
                >
                  <div>Cobrar (F1)</div>
                  <div>{numberFormat(this.state.importeTotal, this.state.codiso)}</div>
                </Button>
              </div>

              <div className='p-2'>
                <div className='d-flex align-items-center'>
                  <div className='mr-1'>
                    <img src={images.recibo} width={22} />
                  </div>
                  <Select
                    title="Comprobantes de venta"
                    refSelect={this.refComprobante}
                    value={this.state.idComprobante}
                    onChange={this.handleSelectComprobante}>
                    <option value={""}>Tipos de comprobante</option>
                    {this.state.comprobantes.map((item, index) => (
                      <option key={index} value={item.idComprobante}>
                        {item.nombre} ({item.serie})
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className='p-2'>
                <div className='d-flex align-items-center justify-content-between'>
                  <RadioButton
                    className='form-check-inline'
                    name='ckTipoCliente'
                    id={CLIENTE_NATURAL}
                    value={CLIENTE_NATURAL}
                    checked={this.state.idTipoCliente === CLIENTE_NATURAL}
                    onChange={(event) => {
                      this.setState({ idTipoCliente: event.target.value, idTipoDocumento: '' })
                    }}
                  >
                    <i className="bi bi-person"></i> Persona Natural {this.state.idTipoCliente === CLIENTE_NATURAL && "(" + this.state.numeroDocumento.length + ")"}
                  </RadioButton>

                  <RadioButton
                    className='form-check-inline'
                    name='ckTipoCliente'
                    id={CLIENTE_JURIDICO}
                    value={CLIENTE_JURIDICO}
                    checked={this.state.idTipoCliente === CLIENTE_JURIDICO}
                    onChange={(event) => {
                      this.setState({ idTipoCliente: event.target.value, idTipoDocumento: '' })
                    }}
                  >
                    <i className="bi bi-building"></i> Persona Juridica {this.state.idTipoCliente === CLIENTE_JURIDICO && "(" + this.state.numeroDocumento.length + ")"}
                  </RadioButton>
                </div>
              </div>

              <div className='p-2'>
                <div className='d-flex align-items-center'>
                  <div className='mr-1'>
                    <img src={images.options} width={22} />
                  </div>
                  <Select
                    value={this.state.idTipoDocumento}
                    refSelect={this.refIdTipoDocumento}
                    onChange={(event) => {
                      this.setState({ idTipoDocumento: event.target.value })
                    }}
                  >
                    <option value={""}>Tipo de documento</option>
                    {
                      this.state.idTipoCliente === CLIENTE_NATURAL && (
                        this.state.tiposDocumentos.filter((item) => item.idTipoDocumento !== 'TD0003').map((item, index) => (
                          <option key={index} value={item.idTipoDocumento}>
                            {item.nombre}
                          </option>
                        ))
                      )
                    }
                    {
                      this.state.idTipoCliente === CLIENTE_JURIDICO && (
                        this.state.tiposDocumentos.filter((item) => item.idTipoDocumento === 'TD0003').map((item, index) => (
                          <option key={index} value={item.idTipoDocumento}>
                            {item.nombre}
                          </option>
                        ))
                      )
                    }
                  </Select>
                </div>
              </div>

              <div className='p-2'>
                <div className='d-flex align-items-center'>
                  <div className='mr-1'>
                    <img src={images.search_color} width={22} />
                  </div>
                  <div className="invoice-client w-100">
                    <SearchInput
                      ref={this.refPersona}
                      classNameContainer="position-relative"
                      placeholder={'N° de documento'}
                      refValue={this.refNumeroDocumento}
                      data={this.state.clientes}
                      handleClearInput={this.handleClearInputCliente}
                      handleFilter={this.handleFilterCliente}
                      handleSelectItem={this.handleSelectItemCliente}
                      handleSetValue={this.handleSetValueCliente}
                      customButton={
                        <>
                          {
                            this.state.idTipoCliente === CLIENTE_NATURAL && (
                              <Button
                                className="btn-outline-secondary"
                                title="Reniec"
                                onClick={this.handleGetApiReniec}
                              >
                                <img src={images.reniec} alt="Reniec" width="12" />
                              </Button>
                            )
                          }
                          {
                            this.state.idTipoCliente === CLIENTE_JURIDICO && (
                              <Button
                                className="btn-outline-secondary"
                                title="Sunat"
                                onClick={this.handleGetApiSunat}
                              >
                                <img src={images.sunat} alt="Sunat" width="12" />
                              </Button>
                            )
                          }
                        </>
                      }
                      renderItem={(value) =>
                        <>
                          {value.documento + " - " + value.informacion}
                        </>
                      }
                    />
                  </div>
                </div>
              </div>

              <div className='p-2'>
                <div className='d-flex align-items-center'>
                  <div className='mr-1'>
                    <img src={images.client} width={22} />
                  </div>
                  <Input
                    placeholder={
                      this.state.idTipoCliente === CLIENTE_NATURAL ? 'Ingrese sus Apellidos y Nombres' : 'Ingrese su Razón Social'
                    }
                    refInput={this.refInformacion}
                    value={this.state.informacion}
                    onChange={this.handleInputInformacion}
                  />
                </div>
              </div>

              <div className='p-2'>
                <div className='d-flex align-items-center'>
                  <div className='mr-1'>
                    <img src={images.phone} width={22} />
                  </div>
                  <Input
                    placeholder="Ingrese el número de celular."
                    refInput={this.refNumeroCelular}
                    value={this.state.numeroCelular}
                    onChange={this.handleInputNumeroCelular}
                    onKeyDown={keyNumberPhone}
                  />
                </div>
              </div>

              <div className='p-2'>
                <div className='d-flex align-items-center'>
                  <div className='mr-1'>
                    <img src={images.email} width={22} />
                  </div>
                  <Input
                    placeholder='Ingrese su correo electrónico del cliente'
                    refInput={this.refEmail}
                    value={this.state.email}
                    onChange={this.handleInputEmail}
                  />
                </div>
              </div>

              <div className='p-2'>
                <div className='d-flex align-items-center'>
                  <div className='mr-1'>
                    <img src={images.directory} width={22} />
                  </div>
                  <Input
                    placeholder="Ingrese su dirección fiscal del cliente"
                    refInput={this.refDireccion}
                    value={this.state.direccion}
                    onChange={this.handleInputDireccion}
                  />
                </div>
              </div>
              {this.generateTotals()}
            </div>
          </div>
        </div>

        {/* Crear mas instancias */}
        {/* <div className='bg-white w-100 d-flex position-relative' style={{ borderTop: '1px solid #cbd5e1', flex: '1 1 3.5rem' }}>
          <div className='d-flex position-relative w-100 h-100' style={{ paddingRight: '4.4rem', }}>

            <div className='d-flex position-relative'>
              <div className='d-flex position-relative align-items-center justify-content-center bg-white'
                style={{
                  borderTop: '2px solid #007bff',
                  borderRight: '1px solid #cbd5e1',
                  maxWidth: '13rem',
                  minWidth: '13rem',
                  padding: '0.2rem',
                }}>
                <div className='d-flex position-relative align-items-center' style={{ marginRight: '5px' }}>
                  <svg width="18" height="18" fill="#00b19d;" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 384,160 V 128 C 384,57.42 326.579,0 256,0 C 185.42,0 128,57.42 128,128 V 160 H 32 V 432 C 32,476.183 67.817,512 112,512 H 400 C 444.183,512 480,476.183 480,432 V 160 Z M 192,128 C 192,92.71 220.71,64 256,64 C 291.29,64 320,92.71 320,128 V 160 H 192 Z M 352,248 C 338.745,248 328,237.255 328,224 C 328,210.745 338.745,200 352,200 C 365.255,200 376,210.745 376,224 C 376,237.255 365.255,248 352,248 Z M 160,248 C 146.745,248 136,237.255 136,224 C 136,210.745 146.745,200 160,200 C 173.255,200 184,210.745 184,224 C 184,237.255 173.255,248 160,248 Z"></path>
                  </svg>
                </div>
                <div
                  style={{
                    color: '#474747',
                    fontSize: '0.9rem',
                    wordWrap: 'break-word',
                    wordBreak: 'break-word',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>Venta principal</div>
              </div>
              <Button
                className='bg-white'
                style={{ borderRight: '1px solid #cbd5e1', width: '4.4rem' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.438 12.503v-2.001h5.621V5h1.942v5.502h5.562v2H13v5.56h-1.942v-5.56H5.438z">
                  </path>
                </svg>
              </Button>
            </div>
          </div>
        </div> */}
      </PosContainerWrapper>
    );
  }
}

VentaCrearEscritorio.propTypes = {
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

const ConnectedVentaCrearEscritorio = connect(mapStateToProps, mapDispatchToProps)(VentaCrearEscritorio);

export default ConnectedVentaCrearEscritorio;