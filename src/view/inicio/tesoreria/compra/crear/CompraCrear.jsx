import React from 'react';
import { PosContainerWrapper } from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import {
  calculateTax,
  calculateTaxBruto,
  formatDecimal,
  isEmpty,
  isText,
  numberFormat,
  rounded,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { COMPRA } from '../../../../../model/types/tipo-comprobante';
import {
  comboAlmacen,
  comboComprobante,
  comboImpuesto,
  comboMoneda,
  createCompra,
  documentsPdfInvoicesCompra,
  filtrarAlmacenProducto,
  filtrarPersona,
  forPurchaseOrdenCompra,
} from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import SearchInput from '../../../../../components/SearchInput';
import PropTypes from 'prop-types';
import { SpinnerTransparent, SpinnerView } from '../../../../../components/Spinner';
import Button from '../../../../../components/Button';
import Select from '../../../../../components/Select';
import ModalProducto from './component/ModalProducto';
import ModalTransaccion from '../../../../../components/ModalTransaccion';
import { clearCrearCompra, setCrearCompraLocal, setCrearCompraState } from '../../../../../redux/predeterminadoSlice';
import { ModalImpresion, ModalPersona } from '../../../../../components/MultiModal';
import printJS from 'print-js';
import Image from '../../../../../components/Image';
import { images } from '../../../../../helper';
import Search from '../../../../../components/Search';
import SidebarConfiguration from '../../../../../components/SidebarConfiguration';
import ModalOrdenCompra from './component/ModalOrdenCompra';
import { PRODUCTO } from '../../../../../model/types/tipo-producto';
import { alertKit } from 'alert-kit';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class CompraCrear extends CustomComponent {

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
      idCompra: '',
      idComprobante: '',
      idAlmacenDestino: '',
      idMoneda: '',
      idAlmacen: '',
      idImpuesto: '',
      observacion: '',
      nota: '',
      cacheConfiguracion: null,

      // Detalle de la compra
      detalles: [],

      // Lista de datos
      comprobantes: [],
      monedas: [],
      almacenes: [],
      impuestos: [],

      // Filtrar producto
      producto: null,
      productos: [],

      // Filtrar proveedor
      proveedor: null,
      proveedores: [],

      // Atributos libres
      codiso: '',
      total: 0,

      // Atributos del modal sale
      isOpenTerminal: false,

      // Atributos del modal producto
      isOpenProducto: false,

      // Atributos del modal impresión
      isOpenImpresion: false,

      // Atributos del modal proveedor
      isOpenProveedor: false,

      // Atributos del modal de orden de compra
      isOpenOrdenCompra: false,
      ordenCompra: null,

      // Id principales
      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.initial = { ...this.state };

    // Referencia principales
    this.refComprobante = React.createRef();
    this.refAlmacenDestino = React.createRef();

    // Filtrar producto
    this.refProducto = React.createRef();
    this.refProductoValue = React.createRef();

    // Filtrar proveedor
    this.refProveedor = React.createRef();
    this.refProveedorValue = React.createRef();

    // Referencia para el custom modal producto
    this.refModalProducto = React.createRef();

    // Referencia para el modal impresión
    this.refModalImpresion = React.createRef();

    // Referencia al modal de orden de compra
    this.refModalOrdenCompra = React.createRef();

    //Anular las peticiones
    this.abortController = new AbortController();
    this.abortControllerOrdenCompra = new AbortController();

    // Atributos para el modal configuración
    this.idSidebarConfiguration = 'idSidebarConfiguration';
    this.refImpuesto = React.createRef();
    this.refMoneda = React.createRef();
    this.refAlmacen = React.createRef();
    this.refObservacion = React.createRef();
    this.refNota = React.createRef();
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
    document.addEventListener('keydown', this.handleDocumentKeyDown)

    await this.loadData();
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown)

    this.abortController.abort();
    this.abortControllerOrdenCompra.abort();
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

  loadData = async () => {
    if (this.props.compraCrear && this.props.compraCrear.state && this.props.compraCrear.local) {
      await this.setStateAsync(this.props.compraCrear.state);
      if (this.props.compraCrear.state.proveedor) {
        this.handleSelectItemProveedor(this.props.compraCrear.state.proveedor);
      }
    } else {
      const [comprobantes, monedas, almacenes, impuestos] =
        await Promise.all([
          this.fetchComprobante(COMPRA),
          this.fetchMoneda(),
          this.fetchComboAlmacen({ idSucursal: this.state.idSucursal }),
          this.fetchImpuesto(),
        ]);

      const comprobante = comprobantes.find((item) => item.preferida === 1);
      const moneda = monedas.find((item) => item.nacional === 1);
      const impuesto = impuestos.find((item) => item.preferido === 1);
      const almacen = almacenes.find((item) => item.predefinido === 1);

      this.setState({
        comprobantes,
        monedas,
        almacenes,
        impuestos,

        idImpuesto: isEmpty(impuesto) ? '' : impuesto.idImpuesto,
        idComprobante: isEmpty(comprobante) ? '' : comprobante.idComprobante,
        idMoneda: isEmpty(moneda) ? '' : moneda.idMoneda,
        codiso: isEmpty(moneda) ? '' : moneda.codiso,
        idAlmacen: isEmpty(almacen) ? '' : almacen.idAlmacen,

        loading: false,
      }, () => {
        this.updateReduxState();
      });
    }
  };

  updateReduxState() {
    this.props.setCrearCompraState(this.state)
    this.props.setCrearCompraLocal({})
  }

  clearView = () => {
    this.setState(this.initial, async () => {
      await this.refProducto.current.restart();
      await this.refProveedor.current.restart();
      await this.props.clearCrearCompra();
      await this.loadData();

      this.refProductoValue.current.focus();

      this.updateReduxState();
    });
  }

  //------------------------------------------------------------------------------------------
  // Peticiones HTTP
  //------------------------------------------------------------------------------------------
  async fetchFiltrarProductos(params) {
    const response = await filtrarAlmacenProducto(params);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      return [];
    }
  }

  async fetchFiltrarCliente(params) {
    const response = await filtrarPersona(params);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      return [];
    }
  }

  async fetchComprobante(tipo) {
    const params = {
      "tipo": tipo,
      "idSucursal": this.state.idSucursal
    };

    const response = await comboComprobante(
      params,
      this.abortController.signal,
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
    const response = await comboMoneda(this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchComboAlmacen(params) {
    const response = await comboAlmacen(params, this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchImpuesto() {
    const response = await comboImpuesto(this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
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
    if (event.key === 'F1' && !this.state.isOpenProducto && !this.state.isOpenTerminal) {
      this.handleGuardar();
    }

    if (event.key === 'F2' && !this.state.isOpenProducto && !this.state.isOpenTerminal) {
      this.handleLimpiar();
    }
  };

  handleSelectComprobante = (event) => {
    this.setState({ idComprobante: event.target.value }, () => {
      this.updateReduxState();
    });
  };

  handleSelectAlmacenDestino = (event) => {
    this.setState({ idAlmacenDestino: event.target.value }, () => {
      this.updateReduxState();
    });
  };

  handleRemoverProducto = (idProducto) => {
    const detalles = this.state.detalles.filter((item) => item.idProducto !== idProducto).map((item, index) => ({
      ...item,
      id: ++index
    }));

    const total = detalles.reduce((accumulate, item) => {
      const cantidad = !item.lote ? item.cantidad : item.lotes.reduce((acumulador, item) => acumulador + Number(item.cantidad.value), 0);
      const costo = item.costo;
      return accumulate + cantidad * costo;
    }, 0);
    this.setState({ detalles, total }, () => {
      this.updateReduxState();
    });
  };

  //------------------------------------------------------------------------------------------
  // Acciones del modal producto
  //------------------------------------------------------------------------------------------
  handleOpenModalProducto = async (producto, type) => {
    const { idImpuesto } = this.state;

    if (isEmpty(idImpuesto)) {
      alertKit.warning({
        title: "Compra",
        message: "Seleccione un impuesto para continuar.",
      }, async () => {
        this.refImpuesto.current.focus();
      });
      return;
    }

    const item = producto;
    if (item) {
      this.setState({ isOpenProducto: true })
      await this.refModalProducto.current.loadDatos(item, type);
    }
  }

  handleCloseProducto = async () => {
    await this.setStateAsync({ isOpenProducto: false });
    this.refProductoValue.current.focus();
  }

  handleSaveProducto = async (detalles, callback = async function () { }) => {
    const total = detalles.reduce((accumulate, item) => {
      const cantidad = !item.lote ? item.cantidad : item.lotes.reduce((acumulador, item) => acumulador + Number(item.cantidad.value), 0);
      const costo = item.costo;
      return accumulate + cantidad * costo;
    }, 0);
    this.setState({ detalles, total }, () => {
      this.updateReduxState();
    });
    await callback();
  }

  //------------------------------------------------------------------------------------------
  // Acciones del modal proveedor
  //------------------------------------------------------------------------------------------
  handleOpenModalProveedor = () => {
    this.setState({ isOpenProveedor: true });
  }

  handleCloseModalProveedor = async () => {
    this.setState({ isOpenProveedor: false });
  }

  //------------------------------------------------------------------------------------------
  // Filtrar productos
  //------------------------------------------------------------------------------------------
  handleClearInputProducto = () => {
    this.setState({
      productos: [],
      loadingProducto: false,
    }, () => {
      this.updateReduxState();
    });
  };

  handleFilterProducto = async (text) => {
    const searchWord = text;

    if (isEmpty(searchWord)) {
      this.setState({ productos: [], loadingProducto: false });
      return;
    }

    this.setState({ loadingProducto: true });

    const params = {
      idAlmacen: this.state.idAlmacen,
      filtrar: searchWord,
    };

    const productos = await this.fetchFiltrarProductos(params);

    const filteredProductos = productos.filter((item) => item.tipoProducto !== 'SERVICIO');

    this.setState({
      productos: filteredProductos,
      loadingProducto: false,
    });
  };

  handleSelectItemProducto = (value) => {
    this.updateReduxState();

    this.handleOpenModalProducto(value, 'new');
  };

  //------------------------------------------------------------------------------------------
  // Filtrar proveedor
  //------------------------------------------------------------------------------------------
  handleClearInputProveedor = () => {
    this.setState({
      proveedores: [],
      proveedor: null,
    }, () => {
      this.updateReduxState();
    });
  };

  handleFilterProveedor = async (text) => {
    const searchWord = text;
    this.setState({ proveedor: null, });

    if (isEmpty(searchWord)) {
      this.setState({ proveedores: [] });
      return;
    }

    const params = {
      opcion: 1,
      filter: searchWord,
      proveedor: 1,
    };

    const proveedores = await this.fetchFiltrarCliente(params);

    this.setState({ proveedores });
  };

  handleSelectItemProveedor = async (value) => {
    this.refProveedor.current.initialize(value.documento + ' - ' + value.informacion);
    this.setState({
      proveedor: value,
      proveedores: [],
    }, () => {
      this.updateReduxState();
    });
  };

  //------------------------------------------------------------------------------------------
  // Opciones de compra
  //------------------------------------------------------------------------------------------

  handleOpenOrdenCompra = () => {
    if (isEmpty(this.state.idImpuesto)) {
      alertKit.warning({
        title: "Orden de Compra",
        message: "Seleccione un impuesto.",
      }, () => {
        this.refImpuesto.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idMoneda)) {
      alertKit.warning({
        title: "Orden de Compra",
        message: "Seleccione una moneda.",
      }, () => {
        this.refMoneda.current.focus();
      });
      return;
    }

    this.setState({ isOpenOrdenCompra: true })
  }

  handleCloseOrdenCompra = () => {
    this.setState({ isOpenOrdenCompra: false })
  }

  handleSeleccionarOrdenCompra = async (ordenCompra) => {
    this.handleCloseOrdenCompra();
    this.setState({
      loading: true,
      msgLoading: "Obteniendos datos de la orden de compra.",
      detalles: [],
      ordenCompra: null,
    });

    const params = {
      idOrdenCompra: ordenCompra.idOrdenCompra,
      idAlmacen: this.state.idAlmacenDestino
    };

    const response = await forPurchaseOrdenCompra(params, this.abortControllerOrdenCompra.signal);

    if (response instanceof SuccessReponse) {
      if (isEmpty(response.data.productos)) {
        alertKit.warning({
          title: "Orden de Compra",
          message: "La orden de compra no tiene productos, ya que fue utilizado para la compra.",
        }, () => {
          this.reloadView();
        });
        return;
      }

      this.handleSelectItemProveedor(response.data.proveedor);

      const detalles = [];

      const impuesto = this.state.impuestos.find((item) => item.idImpuesto === this.state.idImpuesto);

      for (const producto of response.data.productos) {
        const data = {
          id: response.data.productos.length + 1,
          idProducto: producto.idProducto,
          codigo: producto.codigo,
          nombre: producto.nombre,
          imagen: producto.imagen,
          cantidad: Number(producto.cantidad),
          costo: Number(producto.costo),
          idImpuesto: impuesto.idImpuesto,
          nombreImpuesto: impuesto.nombre,
          porcentajeImpuesto: impuesto.porcentaje,
        };

        detalles.push(data);
      }

      this.setState({ ordenCompra, detalles, loading: false });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.setState({ loading: false });
      alertKit.warning({
        title: "Orden de Compra",
        message: response.getMessage(),
      })
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
      alertKit.warning({
        title: "Orden de Compra",
        message: "Seleccione un impuesto.",
      }, () => {
        this.refImpuesto.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idMoneda)) {
      alertKit.warning({
        title: "Orden de Compra",
        message: "Seleccione una moneda.",
      }, () => {
        this.refMoneda.current.focus();
      });
      return;
    }

    const impuesto = this.state.impuestos.find((item) => item.idImpuesto === this.state.idImpuesto);

    const detalles = this.state.detalles.map((item) => ({
      ...item,
      idImpuesto: impuesto.idImpuesto,
      nombreImpuesto: impuesto.nombre,
      porcentajeImpuesto: impuesto.porcentaje,
    }));

    const moneda = this.state.monedas.find((item) => item.idMoneda === this.state.idMoneda)

    this.setState({
      idMoneda: moneda.idMoneda,
      codiso: moneda.codiso,
      detalles,
    }, async () => {
      this.updateReduxState();

      const invoice = document.getElementById(this.idSidebarConfiguration);
      invoice.classList.remove('toggled');
    });
  }

  //------------------------------------------------------------------------------------------
  // Procesos guardar, limpiar y cerrar
  //------------------------------------------------------------------------------------------
  handleGuardar = async () => {
    const { idComprobante, proveedor, idMoneda, idImpuesto, idAlmacenDestino, detalles } = this.state;

    if (!isText(idComprobante)) {
      alertKit.warning({
        title: "Compra",
        message: "Seleccione su comprobante.",
      }, () => {
        this.refComprobante.current.focus();
      });
      return;
    }

    if (isEmpty(proveedor)) {
      alertKit.warning({
        title: "Compra",
        message: "Seleccione un proveedor.",
      }, () => {
        this.refProveedorValue.current.focus();
      });
      return;
    }

    if (!isText(idMoneda)) {
      alertKit.warning({
        title: "Compra",
        message: "Seleccione su moneda.",
      }, () => {
        this.refMoneda.current.focus();
      });
      return;
    }
    if (!isText(idImpuesto)) {
      alertKit.warning({
        title: "Compra",
        message: "Seleccione el impuesto",
      }, () => {
        this.refImpuesto.current.focus();
      });
      return;
    }

    if (!isText(idAlmacenDestino)) {
      alertKit.warning({
        title: "Compra",
        message: "Seleccione su almacen.",
      }, () => {
        this.refAlmacenDestino.current.focus();
      });
      return;
    }

    if (isEmpty(detalles)) {
      alertKit.warning({
        title: "Compra",
        message: "Agregar algún producto a la lista.",
      }, () => {
        this.refProductoValue.current.focus();
      });
      return;
    }

    this.handleOpenModalTerminal();
  };

  handleLimpiar = async () => {
    alertKit.question({
      title: "Compra",
      message: "¿Está seguro de limpiar la compra?",
    }, (accept) => {
      if (accept) {
        this.clearView();
      }
    })
  };

  handleCerrar = () => {
    this.props.history.goBack();
  };

  //------------------------------------------------------------------------------------------
  // Acciones del modal terminal
  //------------------------------------------------------------------------------------------
  handleOpenModalTerminal = () => {
    this.setState({ isOpenTerminal: true })
  }

  handleCloseModalTerminal = () => {
    this.setState({ isOpenTerminal: false })
  }

  handleProcessContado = async (idFormaPago, metodoPagosLista, notaTransacion, callback = async function () { }) => {
    const {
      idComprobante,
      proveedor,
      idImpuesto,
      idAlmacenDestino,
      idMoneda,
      ordenCompra,
      observacion,
      nota,
      detalles,
      idUsuario,
      idSucursal
    } = this.state;

    alertKit.question({
      title: "Compra",
      message: "¿Está seguro de continuar?",
    }, async (accept) => {
      if (accept) {
        const data = {
          idFormaPago: idFormaPago,
          idComprobante: idComprobante,
          idProveedor: proveedor.idPersona,
          idImpuesto: idImpuesto,
          idAlmacen: idAlmacenDestino,
          idMoneda: idMoneda,
          idOrdenCompra: ordenCompra && ordenCompra.idOrdenCompra || null,
          observacion: observacion,
          nota: nota,
          idUsuario: idUsuario,
          idSucursal: idSucursal,
          estado: 1,
          detalles: detalles,
          notaTransacion,
          bancosAgregados: metodoPagosLista,
        };

        await callback();
        alertKit.loading({
          message: 'Procesando información...',
        });

        const response = await createCompra(data);

        if (response instanceof SuccessReponse) {
          alertKit.close();
          this.handleOpenImpresion(response.data.idCompra);
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertKit.warning({
            title: "Compra",
            message: response.getMessage(),
          });
        }
      }
    });
  };

  handleProcessCredito = async (idFormaPago, numeroCuotas, frecuenciaPago, total, notaTransacion, callback = async function () { }) => {
    const {
      idComprobante,
      proveedor,
      idImpuesto,
      idAlmacenDestino,
      idMoneda,
      ordenCompra,
      observacion,
      nota,
      detalles,
      idUsuario,
      idSucursal,
    } = this.state;

    alertKit.question({
      title: "Compra",
      message: "¿Está seguro de continuar?",
    }, async (accept) => {
      if (accept) {
        const data = {
          idFormaPago: idFormaPago,
          idComprobante: idComprobante,
          idProveedor: proveedor.idPersona,
          idImpuesto: idImpuesto,
          idAlmacen: idAlmacenDestino,
          idMoneda: idMoneda,
          idOrdenCompra: ordenCompra && ordenCompra.idOrdenCompra || null,
          observacion: observacion,
          nota: nota,
          idUsuario: idUsuario,
          idSucursal: idSucursal,
          estado: 2,
          numeroCuotas: numeroCuotas,
          frecuenciaPago: frecuenciaPago,
          detalles: detalles,
          notaTransacion,
          importeTotal: total
        };

        await callback();
        alertKit.loading({
          message: 'Procesando información...',
        });

        const response = await createCompra(data);

        if (response instanceof SuccessReponse) {
          alertKit.close();
          this.handleOpenImpresion(response.data.idCompra);
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertKit.warning({
            title: "Compra",
            message: response.getMessage(),
          });
        }
      }
    });
  };

  //------------------------------------------------------------------------------------------
  // Procesos impresión
  //------------------------------------------------------------------------------------------
  handleOpenImpresion = (idCompra) => {
    this.setState({ isOpenImpresion: true, idCompra: idCompra })
  }

  handleCloseImpresion = async () => {
    this.setState({ isOpenImpresion: false });
  }

  handlePrinterImpresion = (size) => {
    printJS({
      printable: documentsPdfInvoicesCompra(this.state.idCompra, size),
      type: 'pdf',
      showModal: true,
      modalMessage: "Recuperando documento...",
      onPrintDialogClose: () => {
        this.clearView();
        this.handleCloseImpresion();
      }
    })
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

  renderTotal() {
    let subTotal = 0;
    let total = 0;

    for (const item of this.state.detalles) {
      const cantidad = !item.lote ? item.cantidad : item.lotes.reduce((acumulador, item) => acumulador + Number(item.cantidad.value), 0);
      const valor = item.costo;

      const porcentaje = item.porcentajeImpuesto;

      const valorActual = cantidad * valor;
      const valorSubNeto = calculateTaxBruto(porcentaje, valorActual);
      const valorImpuesto = calculateTax(porcentaje, valorSubNeto);
      const valorNeto = valorSubNeto + valorImpuesto;

      subTotal += valorSubNeto;
      total += valorNeto;
    }

    const impuestosGenerado = () => {
      const resultado = this.state.detalles.reduce((acc, item) => {
        const cantidad = !item.lote ? item.cantidad : item.lotes.reduce((acumulador, item) => acumulador + Number(item.cantidad.value), 0);
        const total = cantidad * item.costo;
        const subTotal = calculateTaxBruto(item.porcentajeImpuesto, total);
        const impuestoTotal = calculateTax(item.porcentajeImpuesto, subTotal);

        const existingImpuesto = acc.find((imp) => imp.idImpuesto === item.idImpuesto);

        if (existingImpuesto) {
          existingImpuesto.valor += impuestoTotal;
        } else {
          acc.push({
            idImpuesto: item.idImpuesto,
            nombre: item.nombreImpuesto,
            valor: impuestoTotal,
          });
        }

        return acc;
      }, []);

      return resultado.map((impuesto, index) => {
        return (
          <div
            key={index}
            className='d-flex justify-content-between align-items-center text-secondary'>
            <p className='m-0 text-secondary'>{impuesto.nombre}:</p>
            <p className='m-0 text-secondary'>{numberFormat(impuesto.valor, this.state.codiso)}</p>
          </div>
        );
      });
    };

    return (
      <>
        <div className='d-flex justify-content-between align-items-center text-secondary'>
          <p className='m-0 text-secondary'>Sub Total:</p>
          <p className='m-0 text-secondary'>{numberFormat(subTotal, this.state.codiso)}</p>
        </div>
        {impuestosGenerado()}
        <Button
          className='btn-success w-100'
          onClick={this.handleGuardar}>
          <div className='d-flex justify-content-between align-items-center py-1'>
            <p className='m-0 text-xl'>Total:</p>
            <p className='m-0 text-xl'>{numberFormat(total, this.state.codiso)}</p>
          </div>
        </Button>
      </>
    );
  }

  render() {
    return (
      <PosContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <ModalTransaccion
          tipo={"Compra"}
          title={"Completar Compra"}
          isOpen={this.state.isOpenTerminal}

          idSucursal={this.state.idSucursal}
          codiso={this.state.codiso}
          importeTotal={this.state.total}

          onClose={this.handleCloseModalTerminal}
          handleProcessContado={this.handleProcessContado}
          handleProcessCredito={this.handleProcessCredito}
        />

        <ModalProducto
          ref={this.refModalProducto}
          isOpen={this.state.isOpenProducto}
          onClose={this.handleCloseProducto}

          idImpuesto={this.state.idImpuesto}
          impuestos={this.state.impuestos}
          detalles={this.state.detalles}

          handleSave={this.handleSaveProducto}
        />

        <ModalPersona
          isOpen={this.state.isOpenProveedor}
          onClose={this.handleCloseModalProveedor}

          idUsuario={this.state.idUsuario}
        />

        <ModalImpresion
          refModal={this.refModalImpresion}
          isOpen={this.state.isOpenImpresion}

          clear={this.clearView}

          handleClose={this.handleCloseImpresion}
          handlePrinterA4={this.handlePrinterImpresion.bind(this, 'A4')}
          handlePrinter80MM={this.handlePrinterImpresion.bind(this, '80mm')}
          handlePrinter58MM={this.handlePrinterImpresion.bind(this, '58mm')}
        />

        <ModalOrdenCompra
          refModal={this.refModalOrdenCompra}
          isOpen={this.state.isOpenOrdenCompra}
          idSucursal={this.state.idSucursal}
          handleClose={this.handleCloseOrdenCompra}
          handleSeleccionar={this.handleSeleccionarOrdenCompra}
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

        <div className='bg-white w-100 h-100 d-flex flex-column overflow-auto'>
          <div className='d-flex w-100 h-100'>
            {/* PANEL IZQUIERDO */}
            <div className='w-100 d-flex flex-column position-relative'
              style={{
                flex: '0 0 60%',
              }}>
              <div className='d-flex align-items-center px-3'
                style={{ borderBottom: '1px solid #cbd5e1' }}>
                <div className='d-flex'>
                  <Button
                    className='btn btn-link'
                    onClick={this.handleCerrar}>
                    <i className="bi bi-arrow-left-short text-xl text-dark"></i>
                  </Button>
                </div>

                <div className='py-3 d-flex align-items-center'>
                  <p className='h5 m-0'>Crear Compra <i className='fa fa-plus text-secondary'></i> </p>
                </div>
              </div>

              <div className='px-3 py-3'
                style={{ borderBottom: '1px solid #cbd5e1' }}>
                <Search
                  ref={this.refProducto}
                  refInput={this.refProductoValue}
                  group={true}
                  iconLeft={<i className="bi bi-search"></i>}
                  onSearch={this.handleFilterProducto}
                  placeholder="Buscar..."
                  buttonRight={
                    <Button
                      className="btn-outline-secondary"
                      title="Limpiar"
                      onClick={() => {
                        this.refProducto.current.restart();
                        this.refProductoValue.current.focus();
                      }}
                    >
                      <i className="fa fa-close"></i>
                    </Button>
                  }
                />
              </div>

              <div
                className={
                  !isEmpty(this.state.productos) ?
                    'px-3 h-100 overflow-auto p-3'
                    :
                    'px-3 h-100 overflow-auto d-flex flex-row justify-content-center align-items-center gap-4 p-3'
                }
                style={{
                  backgroundColor: '#f8fafc',
                }}>

                {
                  this.state.loadingProducto &&
                  <div className='text-center position-relative'>
                    <SpinnerTransparent
                      loading={true}
                      message={"Buscando productos..."}
                    />
                  </div>
                }

                {
                  !this.state.loadingProducto && isEmpty(this.state.productos) &&
                  <div className='text-center position-relative'>
                    <i className='bi bi-cart4 text-secondary text-2xl'></i>
                    <p className="text-secondary text-base text-lg mb-0">
                      Use la barra de busqueda para encontrar su producto.
                    </p>
                  </div>
                }

                {
                  !isEmpty(this.state.productos) && (
                    <div className='d-flex justify-content-center flex-wrap gap-4'>
                      {
                        this.state.productos.map((item, index) => (
                          <Button
                            key={index}
                            className='btn-light bg-white'
                            style={{
                              border: '1px solid #e2e8f0',
                              width: '16rem',
                            }}
                            onClick={() => this.handleSelectItemProducto(item)}
                          >
                            <div className="d-flex flex-column justify-content-center align-items-center p-3 text-center">
                              <div className='d-flex justify-content-center align-items-center flex-column'>
                                <Image
                                  default={images.noImage}
                                  src={item.imagen}
                                  alt={item.nombre}
                                  width={150}
                                  height={150}
                                  className='mb-2 object-contain'
                                />
                                <p className={`${item.idTipoProducto === PRODUCTO && item.cantidad <= 0 ? 'badge badge-danger text-base' : 'badge badge-success text-base'} `}>
                                  INV. {formatDecimal(item.cantidad)}
                                </p>
                              </div>

                              <div className='d-flex justify-content-center align-items-center flex-column'>
                                <p className='m-0 text-lg'>{item.nombre}</p>
                                <p className='m-0 text-xl font-weight-bold'>
                                  {numberFormat(item.costo, this.state.codiso)} <small>x {item.unidad}</small>
                                </p>
                              </div>
                            </div>

                            <div className='w-100 text-left text-sm'>Almacen: {item.almacen}</div>
                          </Button>
                        ))
                      }
                    </div>
                  )
                }
              </div>
            </div>

            {/* PANEL DERECHO  */}
            <div
              className='d-flex flex-column position-relative bg-white'
              style={{
                flex: '1 1 100%',
                borderLeft: '1px solid #cbd5e1',
              }}>

              <div className='d-flex justify-content-between align-items-center pl-3'
                style={{ borderBottom: '1px solid #cbd5e1' }}>
                <div className='py-3'>
                  <p className='h5 m-0'>Resumen</p>
                </div>

                <div className='d-flex justify-content-end'>
                  <Button
                    className="btn-link rounded-circle h-100"
                    onClick={this.handleOpenOrdenCompra}
                  >
                    <i className="bi bi-file-earmark-text text-xl text-secondary"></i>
                  </Button>
                  <Button
                    className='btn-link'
                    onClick={this.handleLimpiar}>
                    <i className="bi bi-arrow-clockwise text-xl text-secondary"></i>
                  </Button>
                  <Button
                    className='btn-link'
                    onClick={this.handleOpenOptions}>
                    <i className="bi bi-three-dots-vertical text-xl text-secondary"></i>
                  </Button>
                </div>
              </div>

              <div className='d-flex flex-column px-3 pt-3'
                style={{ borderBottom: '1px solid #cbd5e1' }}>
                <div className="form-group">
                  <Select
                    group={false}
                    ref={this.refComprobante}
                    value={this.state.idComprobante}
                    onChange={this.handleSelectComprobante}
                  >
                    <option value="">-- Comprobantes --</option>
                    {this.state.comprobantes.map((item, index) => (
                      <option key={index} value={item.idComprobante}>
                        {item.nombre + ' (' + item.serie + ')'}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <SearchInput
                    ref={this.refProveedor}
                    placeholder="Filtrar proveedores..."
                    refValue={this.refProveedorValue}
                    data={this.state.proveedores}
                    handleClearInput={this.handleClearInputProveedor}
                    handleFilter={this.handleFilterProveedor}
                    handleSelectItem={this.handleSelectItemProveedor}
                    customButton={
                      <Button
                        className="btn-outline-primary d-flex align-items-center"
                        onClick={this.handleOpenModalProveedor}>
                        <i className='fa fa-user-plus'></i>
                        <div className="ml-2">Nuevo</div>
                      </Button>
                    }
                    renderItem={(value) =>
                      <>
                        {value.documento + ' - ' + value.informacion}
                      </>
                    }
                  />
                </div>

                <div className="form-group">
                  <Select
                    group={false}
                    ref={this.refAlmacenDestino}
                    value={this.state.idAlmacenDestino}
                    onChange={this.handleSelectAlmacenDestino}
                  >
                    <option value="">-- Almacen de destino --</option>
                    {this.state.almacenes.map((item, index) => (
                      <option key={index} value={item.idAlmacen}>
                        {item.nombre}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div
                className={
                  isEmpty(this.state.detalles) ?
                    'd-flex flex-column justify-content-center align-items-center p-3 text-center rounded h-100'
                    :
                    'd-flex flex-column text-center rounded h-100 overflow-auto'
                }
                style={{
                  backgroundColor: '#f8fafc',
                }}>

                {isEmpty(this.state.detalles) && <div className='text-center'>
                  <i className='fa fa-shopping-basket text-secondary text-2xl'></i>
                  <p className="text-secondary text-base text-lg mb-0">
                    Aquí verás los productos que elijas en tu próxima pedido
                  </p>
                </div>}

                {
                  this.state.detalles.map((item, index) => {
                    const cantidad = !item.lote ? item.cantidad : item.lotes.reduce((acumulador, item) => acumulador + Number(item.cantidad.value), 0);
                    const costo = item.costo;

                    return (<div
                      key={index}
                      className='d-grid px-3 position-relative align-items-center bg-white'
                      style={{
                        gridTemplateColumns: '60% 20% 20%',
                        borderBottom: '1px solid #e2e8f0',
                      }}>
                      {/* Primera columna (imagen y texto) */}
                      <div className='d-flex align-items-center'>

                        <Image
                          default={images.noImage}
                          src={item.imagen}
                          alt={item.nombre}
                          width={80}
                          height={80}
                          className='object-contain'
                        />

                        <div className='p-3 text-left'>
                          <p className='m-0 text-sm'> {item.codigo}</p>
                          <p className='m-0 text-base font-weight-bold text-break'>
                            {item.nombre}
                          </p>
                          <p className='m-0'>{numberFormat(costo, this.state.codiso)}</p>
                        </div>
                      </div>

                      {/* Segundo columna (costo total) y opciones */}
                      <div className='d-flex flex-column justify-content-end align-items-center'>
                        <div className='h-100 text-xml'>{
                          rounded(cantidad)
                        }</div>
                      </div>

                      {/* Tercera columna (costo total) y opciones */}
                      <div className='d-flex flex-column justify-content-end align-items-center'>
                        <div className='h-100 text-lg'>{numberFormat(cantidad * costo, this.state.codiso)}</div>

                        <div className='d-flex align-items-end justify-content-end gap-4'>
                          <Button className='btn-link'
                            onClick={() => this.handleOpenModalProducto(item, 'edit')}>
                            <i className='fa fa-edit text-secondary text-xl'></i>
                          </Button>
                          <Button className='btn-link'
                            onClick={() => this.handleRemoverProducto(item.idProducto)}>
                            <i className='fa fa-trash text-secondary text-xl'></i>
                          </Button>
                        </div>
                      </div>
                    </div>);
                  })
                }
              </div>

              <div className="text-right text-xl font-bold d-flex flex-column p-3 gap-3"
                style={{ borderTop: '1px solid #e2e8f0' }}
              >
                {this.renderTotal()}

                <div className='d-flex justify-content-between align-items-center text-secondary'>
                  <p className='m-0 text-secondary'>Cantidad:</p>
                  <p className='m-0 text-secondary'>{this.state.detalles.length === 1 ? this.state.detalles.length + " Producto" : this.state.detalles.length + " Productos"} </p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </PosContainerWrapper>
    );
  }
}

CompraCrear.propTypes = {
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
  compraCrear: PropTypes.shape({
    state: PropTypes.object,
    local: PropTypes.object,
  }),
  setCrearCompraState: PropTypes.func,
  setCrearCompraLocal: PropTypes.func,
  clearCrearCompra: PropTypes.func,
};

/**
 *
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
  return {
    token: state.principal,
    compraCrear: state.predeterminado.compraCrear
  };
};

const mapDispatchToProps = { setCrearCompraState, setCrearCompraLocal, clearCrearCompra }

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */

const ConnectedComprasCrear = connect(mapStateToProps, mapDispatchToProps)(CompraCrear);

export default ConnectedComprasCrear;
