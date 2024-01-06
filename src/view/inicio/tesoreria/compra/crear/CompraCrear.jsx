import React from 'react';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  calculateTax,
  calculateTaxBruto,
  clearModal,
  focusOnFirstInvalidInput,
  hideModal,
  isEmpty,
  isNumeric,
  isText,
  numberFormat,
  rounded,
  showModal,
  spinnerLoading,
  validateNumericInputs,
  viewModal,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { COMPRA } from '../../../../../model/types/tipo-comprobante';
import {
  comboAlmacen,
  comboComprobante,
  comboImpuesto,
  comboMetodoPago,
  comboMoneda,
  createCompra,
  filtrarCliente,
  filtrarProducto,
} from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import SearchInput from '../../../../../components/SearchInput';
import ModalSale from './component/ModalSale';
import ModalProduct from './component/ModalProduct';
import PropTypes from 'prop-types';

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
      idComprobante: '',
      idMoneda: '',
      idAlmacen: '',
      idImpuesto: '',
      observacion: '',
      nota: '',

      // Detalle del gasto
      detalle: [],

      // Lista de datos
      comprobantes: [],
      monedas: [],
      almacenes: [],
      impuestos: [],

      // Filtrar producto
      filtrarProducto: '',
      loadingProducto: false,
      producto: null,
      productos: [],

      // Filtrar cliente
      filtrarCliente: '',
      loadingCliente: false,
      cliente: null,
      clientes: [],

      // Atributos libres
      codISO: '',
      total: 0,

      // Atributos del modal sale
      loadingModal: false,
      selectTipoPago: 1,
      metodosPagoLista: [],
      metodoPagoAgregado: [],
      tipoCredito: '1',
      frecuenciaPagoFijo: new Date().getDate() > 15 ? '30' : '15',
      frecuenciaPagoVariable: new Date().getDate() > 15 ? '30' : '15',
      numeroCuotas: '',
      letraMensual: '',

      // Atributos del modal producto
      loadingModalProducto: false,
      cantidadModalProducto: '',
      costoModalProducto: '',

      // Id principales
      idUsuario: this.props.token.userToken.idUsuario,
      idSucursal: this.props.token.project.idSucursal,
    };

    this.initial = { ...this.state }

    // Referencia principales
    this.refComprobante = React.createRef();
    this.refMoneda = React.createRef();
    this.refAlmacen = React.createRef();
    this.refImpuesto = React.createRef();
    this.refObservacion = React.createRef();

    // Filtrar producto
    this.refProducto = React.createRef();
    this.selectItemProducto = false;

    // Filtrar cliente
    this.refCliente = React.createRef();
    this.selectItemCliente = false;

    // Referencia para el modal sale
    this.idModalSale = 'idModalSale';
    this.refMetodoPagoContenedor = React.createRef();
    this.refMetodoContado = React.createRef();
    this.refNumeroCuotas = React.createRef();
    this.refFrecuenciaPagoFijo = React.createRef();
    this.refFrecuenciaPagoVariable = React.createRef();

    // Referencia para el modal producto
    this.idModalProduct = 'idModalProduct';
    this.refCantidadModalProduct = React.createRef();
    this.refCostoModalProduct = React.createRef();

    //Anular las peticiones
    this.abortController = new AbortController();
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

    /**
     * Evento del modal sale
     */
    viewModal(this.idModalSale, () => {
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

      this.setState({ loadingModal: false });
    });

    clearModal(this.idModalSale, async () => {
      await this.setStateAsync({
        loadingModal: false,
        selectTipoPago: 1,
        metodoPagoAgregado: [],
        tipoCredito: '1',
        frecuenciaPagoFijo: new Date().getDate() > 15 ? '30' : '15',
        frecuenciaPagoVariable: new Date().getDate() > 15 ? '30' : '15',
        numeroCuotas: '',
        letraMensual: '',
      });
    });

    /**
     * Eventos del modal product
     */
    viewModal(this.idModalProduct, () => {
      this.refCantidadModalProduct.current.focus();

      this.setState({
        costoModalProducto: this.state.producto.costo,
        loadingModalProducto: false,
      });
    });

    clearModal(this.idModalProduct, async () => {
      await this.setStateAsync({
        productos: [],
        filtrarProducto: '',
        producto: null,
        cantidadModalProducto: '',
        costoModalProducto: '',
      });
      this.selectItemProducto = false;
    });
  }

  componentWillUnmount() {
    this.abortController.abort();
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
    const [comprobantes, monedas, metodoPagos, almacenes, impuestos] =
      await Promise.all([
        await this.fetchComprobante(COMPRA),
        await this.fetchMoneda(),
        await this.fetchMetodoPago(),
        await this.fetchComboAlmacen({ idSucursal: this.state.idSucursal }),
        await this.fetchImpuesto(),
      ]);

    const comprobante = comprobantes.find((item) => item.preferida === 1);
    const moneda = monedas.find((item) => item.nacional === 1);
    const impuesto = impuestos.find((item) => item.preferida === 1);

    this.setState({
      comprobantes,
      monedas,
      almacenes,
      impuestos,
      metodosPagoLista: metodoPagos,
      idImpuesto: isEmpty(impuesto) ? '' : impuesto.idImpuesto,
      idComprobante: isEmpty(comprobante) ? '' : comprobante.idComprobante,
      idMoneda: isEmpty(moneda) ? '' : moneda.idMoneda,
      codISO: isEmpty(moneda) ? '' : moneda.codiso,
      loading: false,
    });
  };

  //------------------------------------------------------------------------------------------
  // Peticiones HTTP
  //------------------------------------------------------------------------------------------

  async fetchFiltrarProductos(params) {
    const response = await filtrarProducto(params);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      return [];
    }
  }

  async fetchFiltrarCliente(params) {
    const response = await filtrarCliente(params);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      return [];
    }
  }

  async fetchComprobante(tipo) {
    const params = {
      tipo: tipo,
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

  async fetchComboAlmacen(params) {
    const response = await comboAlmacen(params);

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

  handleSelectComprobante = (event) => {
    this.setState({ idComprobante: event.target.value });
  };

  handleSelectMoneda = (event) => {
    this.setState({ idMoneda: event.target.value });
  };

  handleInputObservacion = (event) => {
    this.setState({ observacion: event.target.value });
  };

  handleInputNota = (event) => {
    this.setState({ nota: event.target.value });
  };

  handleSelectAlmacen = (event) => {
    this.setState({ idAlmacen: event.target.value });
  };

  handleSelectImpuesto = (event) => {
    this.setState({ idImpuesto: event.target.value });
  };

  //------------------------------------------------------------------------------------------
  // Acciones del modal sale
  //------------------------------------------------------------------------------------------

  handleSelectTipoPago = (tipo) => {
    this.setState({ selectTipoPago: tipo });
  };

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

  handleRemoveItemMetodPay = (idMetodoPago) => {
    const metodoPagoAgregado = this.state.metodoPagoAgregado.filter(
      (item) => item.idMetodoPago !== idMetodoPago,
    );
    this.setState({ metodoPagoAgregado });
  };

  handleSelectNumeroCuotas = (event) => {
    this.setState({ numeroCuotas: event.target.value });
  };

  handleSelectFrecuenciaPagoFijo = (event) => {
    this.setState({ frecuenciaPago: event.target.value });
  };

  handleSelectFrecuenciaPagoVariable = (event) => {
    this.setState({ frecuenciaPago: event.target.value });
  };

  handleProcessContado = async () => {
    const {
      selectTipoPago,

      idComprobante,
      cliente,
      idImpuesto,
      idAlmacen,
      idMoneda,
      observacion,
      nota,
      detalle,
      idUsuario,
      idSucursal,

      total,
      metodoPagoAgregado,
    } = this.state;

    let metodoPagoLista = [...metodoPagoAgregado];

    if (isEmpty(metodoPagoLista)) {
      alertWarning('Compra', 'Tiene que agregar método de cobro para continuar.', () => {
        this.refMetodoContado.current.focus();
      },
      );
      return;
    }

    if (metodoPagoLista.filter((item) => !isNumeric(item.monto)).length !== 0) {
      alertWarning('Compra', 'Hay montos del metodo de cobro que no tiene valor.', () => {
        validateNumericInputs(this.refMetodoPagoContenedor);
      },
      );
      return;
    }

    const metodoCobroTotal = metodoPagoLista.reduce(
      (accumulator, item) => (accumulator += parseFloat(item.monto)),
      0,
    );

    if (metodoPagoLista.length > 1) {
      if (metodoCobroTotal !== total) {
        alertWarning('Compra', 'Al tener mas de 2 métodos de pago el monto debe ser igual al total.', () => {
          focusOnFirstInvalidInput(this.refMetodoPagoContenedor);
        },
        );
        return;
      }
    } else {
      const metodo = metodoPagoLista[0];
      if (metodo.vuelto === 1) {
        if (metodoCobroTotal < total) {
          alertWarning('Compra', 'El monto a pago es menor que el total.', () => {
            focusOnFirstInvalidInput(this.refMetodoPagoContenedor);
          },
          );
          return;
        }

        metodoPagoLista.map((item) => {
          item.descripcion = `Pago con ${rounded(parseFloat(item.monto),)} y su vuelto es ${rounded(parseFloat(item.monto) - total)}`;
          item.monto = total;
          return item;
        });
      } else {
        if (metodoCobroTotal !== total) {
          alertWarning('Compra', 'El monto a pagar debe ser igual al total.', () => {
            focusOnFirstInvalidInput(this.refMetodoPagoContenedor);
          },
          );
          return;
        }
      }
    }

    alertDialog('Compra', '¿Está seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idComprobante: idComprobante,
          idCliente: cliente.idCliente,
          idImpuesto: idImpuesto,
          idAlmacen: idAlmacen,
          idMoneda: idMoneda,
          observacion: observacion,
          nota: nota,
          idUsuario: idUsuario,
          idSucursal: idSucursal,
          estado: 1,

          tipo: selectTipoPago,
          credito: 0,
          metodoPago: metodoPagoAgregado,

          detalle: detalle,
        };

        hideModal(this.idModalSale);
        alertInfo('Compra', 'Procesando información...');

        const response = await createCompra(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Compra', response.data, () => {
            this.handleLimpiar();
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertWarning('Compra', response.getMessage());
        }
      }
    });
  };

  handleProcessCredito = async () => {
    const {
      selectTipoPago,

      tipoCredito,
      frecuenciaPagoFijo,
      frecuenciaPagoVariable,
      numeroCuotas,

      idComprobante,
      cliente,
      idImpuesto,
      idAlmacen,
      idMoneda,
      observacion,
      nota,
      detalle,
      idUsuario,
      idSucursal,
    } = this.state;

    if (tipoCredito === '1' && isEmpty(frecuenciaPagoFijo)) {
      alertWarning('Compra', 'Seleccione la frecuenta de pago.', () => {
        this.refFrecuenciaPagoFijo.current.focus();
      });
      return;
    }

    if (tipoCredito === '2' && !isNumeric(numeroCuotas)) {
      alertWarning('Compra', 'Ingrese el número de cuotas.', () => {
        this.refNumeroCuotas.current.focus();
      });
      return;
    }

    if (tipoCredito === '2' && isEmpty(frecuenciaPagoVariable)) {
      alertWarning('Compra', 'Seleccione la frecuencia de pago.', () => {
        this.refFrecuenciaPagoVariable.current.focus();
      });
      return;
    }

    alertDialog('Compra', '¿Está seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idComprobante: idComprobante,
          idCliente: cliente.idCliente,
          idImpuesto: idImpuesto,
          idAlmacen: idAlmacen,
          idMoneda: idMoneda,
          observacion: observacion,
          nota: nota,
          idUsuario: idUsuario,
          idSucursal: idSucursal,
          estado: 2,

          tipo: selectTipoPago,
          credito: tipoCredito,
          frecuenciaPago: tipoCredito === '1' ? frecuenciaPagoFijo : frecuenciaPagoVariable,
          numeroCuotas: numeroCuotas,

          detalle: detalle,
        };

        hideModal(this.idModalSale);
        alertInfo('Compra', 'Procesando información...');

        const response = await createCompra(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Compra', response.data, () => {
            this.handleLimpiar();
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertWarning('Compra', response.getMessage());
        }
      }
    });
  };

  handleSaveSale = () => {
    if (this.state.selectTipoPago === 1) {
      this.handleProcessContado();
    }

    if (this.state.selectTipoPago === 2) {
      this.handleProcessCredito();
    }
  };

  handleCheckTipoCredito = (value) => {
    this.setState({ tipoCredito: value.target.value });
  };

  //------------------------------------------------------------------------------------------
  // Acciones del modal product
  //------------------------------------------------------------------------------------------

  handleInputCantidadModalProducto = (event) => {
    this.setState({ cantidadModalProducto: event.target.value });
  };

  handleInputCostoModalProducto = (event) => {
    this.setState({ costoModalProducto: event.target.value });
  };

  handleAddProduct = async () => {
    if (!isText(this.state.idImpuesto)) {
      alertWarning('Compra', 'Seleccione un IGV para continuar.', () => {
        hideModal(this.idModalProduct);
        this.refImpuesto.current.focus();
      });
      return;
    }

    if (!this.state.producto) return;

    const { idProducto, nombre } = this.state.producto;

    const { cantidadModalProducto, costoModalProducto, detalle } = this.state;

    if (!isNumeric(cantidadModalProducto)) return;

    if (!isNumeric(costoModalProducto)) return;

    const newDetalle = [...detalle];

    const existeDetalle = newDetalle.find(
      (item) => item.idProducto === idProducto,
    );

    const impuesto = this.state.impuestos.find(
      (item) => item.idImpuesto === this.state.idImpuesto,
    );

    if (existeDetalle) {
      existeDetalle.cantidad += parseFloat(cantidadModalProducto);
    } else {
      const data = {
        idProducto: idProducto,
        nombre: nombre,
        cantidad: parseFloat(cantidadModalProducto),
        costo: parseFloat(costoModalProducto),
        idImpuesto: impuesto.idImpuesto,
        nombreImpuesto: impuesto.nombre,
        porcentajeImpuesto: impuesto.porcentaje,
      };

      newDetalle.push(data);
    }

    const total = newDetalle.reduce(
      (accumulate, item) => (accumulate += item.cantidad * item.costo),
      0,
    );

    this.setState({
      detalle: newDetalle,
      total,
    });

    hideModal(this.idModalProduct);

    this.refProducto.current.focus();
  };

  handleRemoverProduct = (idProducto) => {
    const detalle = this.state.detalle.filter(
      (item) => item.idProducto !== idProducto,
    );
    const total = detalle.reduce(
      (accumulate, item) => (accumulate += item.cantidad * item.costo),
      0,
    );
    this.setState({ detalle, total });
  };

  //------------------------------------------------------------------------------------------
  // Filtrar productos
  //------------------------------------------------------------------------------------------

  handleClearInputProducto = async () => {
    await this.setStateAsync({
      productos: [],
      filtrarProducto: '',
      producto: null,
    });
    this.selectItemProducto = false;
  };

  handleFilterProducto = async (event) => {
    const searchWord = this.selectItemProducto ? '' : event.target.value;
    await this.setStateAsync({ producto: null, filtrarProducto: searchWord });

    this.selectItemProducto = false;
    if (searchWord.length === 0) {
      await this.setStateAsync({ productos: [] });
      return;
    }

    if (this.state.loadingProducto) return;

    await this.setStateAsync({ loadingProducto: true });

    const params = {
      filtrar: searchWord,
    };

    const productos = await this.fetchFiltrarProductos(params);

    // Filtrar productos por tipoProducto !== "SERVICIO"
    const filteredProductos = productos.filter(
      (item) => item.tipoProducto !== 'SERVICIO',
    );

    this.setState({
      productos: filteredProductos,
      loadingProducto: false,
    });
  };

  handleSelectItemProducto = async (value) => {
    await this.setStateAsync({
      producto: value,
      filtrarProducto: value.nombre,
      productos: [],
    });
    this.selectItemProducto = true;

    showModal(this.idModalProduct);
    this.setState({ loadingModalProducto: true });
  };

  //------------------------------------------------------------------------------------------
  // Filtrar cliente
  //------------------------------------------------------------------------------------------

  handleClearInputCliente = async () => {
    await this.setStateAsync({
      clientes: [],
      filtrarCliente: '',
      cliente: null,
    });
    this.selectItemCliente = false;
  };

  handleFilterCliente = async (event) => {
    const searchWord = this.selectItemCliente ? '' : event.target.value;
    await this.setStateAsync({ cliente: null, filtrarCliente: searchWord });

    this.selectItemCliente = false;
    if (searchWord.length === 0) {
      await this.setStateAsync({ clientes: [] });
      return;
    }

    if (this.state.loadingCliente) return;

    await this.setStateAsync({ loadingCliente: true });

    const params = {
      filtrar: searchWord,
    };

    const clientes = await this.fetchFiltrarCliente(params);

    await this.setStateAsync({ loadingCliente: false, clientes });
  };

  handleSelectItemCliente = async (value) => {
    await this.setStateAsync({
      cliente: value,
      filtrarCliente: value.documento + ' - ' + value.informacion,
      clientes: [],
    });
    this.selectItemCliente = true;
  };

  //------------------------------------------------------------------------------------------
  // Procesos guardar, limpiar y cerrar
  //------------------------------------------------------------------------------------------

  handleGuardar = async () => {
    const { idComprobante, cliente, idMoneda, idAlmacen, detalle } = this.state;

    if (!isText(idComprobante)) {
      alertWarning('Compra', 'Seleccione su comprobante.', () =>
        this.refComprobante.current.focus(),
      );
      return;
    }

    if (isEmpty(cliente)) {
      alertWarning('Compra', 'Seleccione un cliente.', () =>
        this.refCliente.current.focus(),
      );
      return;
    }

    if (!isText(idMoneda)) {
      alertWarning('Compra', 'Seleccione su moneda.', () =>
        this.refMoneda.current.focus(),
      );
      return;
    }

    if (!isText(idAlmacen)) {
      alertWarning('Compra', 'Seleccione su almacen.', () =>
        this.refAlmacen.current.focus(),
      );
      return;
    }

    if (isEmpty(detalle)) {
      alertWarning('Compra', 'Agregar algún producto a la lista.', () =>
        this.refProducto.current.focus(),
      );
      return;
    }

    showModal(this.idModalSale);
    await this.setStateAsync({ loadingModal: true });
  };

  handleLimpiar = async () => {
    this.setState(this.initial, async () => {
      await this.loadData();
      this.refProducto.current.focus();
    });
  };

  handleCerrar = () => {
    this.props.history.goBack();
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

  generarBody() {
    const { detalle } = this.state;

    if (isEmpty(detalle)) {
      return (
        <tr className="text-center">
          <td colSpan="6"> Agregar datos a la tabla </td>
        </tr>
      );
    }

    return detalle.map((item, index) => (
      <tr key={index}>
        <td className="text-center">{++index}</td>
        <td>{item.nombre}</td>
        <td>{rounded(item.cantidad)}</td>
        <td>{numberFormat(item.costo, this.state.codISO)}</td>
        <td>{numberFormat(item.cantidad * item.costo, this.state.codISO)}</td>
        <td className='text-center'>
          <button
            className="btn btn-outline-danger btn-sm"
            title="Eliminar"
            onClick={() => this.handleRemoverProduct(item.idProducto)}
          >
            <i className="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    ));
  }

  renderTotal() {
    let subTotal = 0;
    let total = 0;

    for (const item of this.state.detalle) {
      const cantidad = item.cantidad;
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
      const resultado = this.state.detalle.reduce((acc, item) => {
        const total = item.cantidad * item.costo;
        const subTotal = calculateTaxBruto(item.porcentajeImpuesto, total);
        const impuestoTotal = calculateTax(item.porcentajeImpuesto, subTotal);

        const existingImpuesto = acc.find(
          (imp) => imp.idImpuesto === item.idImpuesto,
        );

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
          <tr key={index}>
            <th className="text-right mb-2">{impuesto.nombre} :</th>
            <th className="text-right mb-2">
              {numberFormat(impuesto.valor, this.state.codISO)}
            </th>
          </tr>
        );
      });
    };

    return (
      <thead>
        <tr>
          <th className="text-right mb-2">SUB TOTAL :</th>
          <th className="text-right mb-2">
            {numberFormat(subTotal, this.state.codISO)}
          </th>
        </tr>
        {impuestosGenerado()}
        <tr className="border-bottom"></tr>
        <tr>
          <th className="text-right h5">TOTAL :</th>
          <th className="text-right h5">
            {numberFormat(total, this.state.codISO)}
          </th>
        </tr>
      </thead>
    );
  }

  render() {
    return (
      <ContainerWrapper>
        <ModalSale
          idModal={this.idModalSale}
          loading={this.state.loadingModal}
          selectTipoPago={this.state.selectTipoPago}
          handleSelectTipoPago={this.handleSelectTipoPago}
          refMetodoPagoContenedor={this.refMetodoPagoContenedor}
          refMetodoContado={this.refMetodoContado}
          tipoCredito={this.state.tipoCredito}
          handleCheckTipoCredito={this.handleCheckTipoCredito}
          refNumeroCuotas={this.refNumeroCuotas}
          numeroCuotas={this.state.numeroCuotas}
          handleSelectNumeroCuotas={this.handleSelectNumeroCuotas}
          refFrecuenciaPagoFijo={this.refFrecuenciaPagoFijo}
          frecuenciaPagoFijo={this.state.frecuenciaPagoFijo}
          handleSelectFrecuenciaPagoFijo={this.handleSelectFrecuenciaPagoFijo}
          refFrecuenciaPagoVariable={this.refFrecuenciaPagoVariable}
          frecuenciaPagoVariable={this.state.frecuenciaPagoVariable}
          handleSelectFrecuenciaPagoVariable={
            this.handleSelectFrecuenciaPagoVariable
          }
          letraMensual={this.state.letraMensual}
          codISO={this.state.codISO}
          importeTotal={this.state.total}
          handleSaveSale={this.handleSaveSale}
          metodosPagoLista={this.state.metodosPagoLista}
          metodoPagoAgregado={this.state.metodoPagoAgregado}
          handleAddMetodPay={this.handleAddMetodPay}
          handleInputMontoMetodoPay={this.handleInputMontoMetodoPay}
          handleRemoveItemMetodPay={this.handleRemoveItemMetodPay}
        />

        <ModalProduct
          idModal={this.idModalProduct}
          loading={this.state.loadingModalProducto}
          producto={this.state.producto}
          refCantidad={this.refCantidadModalProduct}
          cantidad={this.state.cantidadModalProducto}
          handleInputCantidad={this.handleInputCantidadModalProducto}
          refCosto={this.refCostoModalProduct}
          costo={this.state.costoModalProducto}
          handleInputCosto={this.handleInputCostoModalProducto}
          handleAddProduct={this.handleAddProduct}
        />

        {this.state.loading && spinnerLoading(this.state.msgLoading)}

        {/* Titulo */}
        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="form-group">
              <h5>
                <span role="button" onClick={this.handleCerrar}>
                  <i className="bi bi-arrow-left-short"></i>
                </span>{' '}
                Compra
                <small className="text-secondary"> crear</small>
              </h5>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12">
            {/* Filtrar y agregar concepto */}
            <div className="row">
              {/* Filtrar */}
              <div className="col">
                <SearchInput
                  showLeftIcon={true}
                  autoFocus={true}
                  placeholder="Filtrar productos..."
                  refValue={this.refProducto}
                  value={this.state.filtrarProducto}
                  data={this.state.productos}
                  handleClearInput={this.handleClearInputProducto}
                  handleFilter={this.handleFilterProducto}
                  handleSelectItem={this.handleSelectItemProducto}
                  renderItem={(value) => <>{value.nombre}</>}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="table-responsive">
                <table className="table table-striped table-bordered rounded">
                  <thead>
                    <tr>
                      <th width="5%" className="text-center">
                        #
                      </th>
                      <th width="15%">Producto</th>
                      <th width="5%">Cantidad</th>
                      <th width="5%">Costo</th>
                      <th width="5%">Total</th>
                      <th width="5%" className='text-center'>Quitar</th>
                    </tr>
                  </thead>
                  <tbody>{this.generarBody()}</tbody>
                </table>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={this.handleGuardar}
                >
                  <i className="fa fa-save"></i> Guardar
                </button>{' '}
                <button
                  type="button"
                  className="btn btn-outline-info"
                  onClick={this.handleLimpiar}
                >
                  <i className="fa fa-trash"></i> Limpiar
                </button>{' '}
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={this.handleCerrar}
                >
                  <i className="fa fa-close"></i> Cerrar
                </button>
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-12">
            <div className="form-group">
              <div className="input-group">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="bi bi-receipt"></i>
                  </div>
                </div>

                <select
                  title="Comprobantes de venta"
                  className="form-control"
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
                </select>
              </div>
            </div>

            <div className="form-group">
              <SearchInput
                showLeftIcon={true}
                placeholder="Filtrar clientes..."
                refValue={this.refCliente}
                value={this.state.filtrarCliente}
                data={this.state.clientes}
                handleClearInput={this.handleClearInputCliente}
                handleFilter={this.handleFilterCliente}
                handleSelectItem={this.handleSelectItemCliente}
                renderItem={(value) => (
                  <>{value.documento + ' - ' + value.informacion}</>
                )}
                renderIconLeft={() => <i className="bi bi-person-circle"></i>}
              />
            </div>

            <div className="form-group">
              <div className="input-group">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="bi bi-percent"></i>
                  </div>
                </div>
                <select
                  className="form-control"
                  ref={this.refImpuesto}
                  value={this.state.idImpuesto}
                  onChange={this.handleSelectImpuesto}
                >
                  <option value={''}>-- Impuesto --</option>
                  {this.state.impuestos.map((item, index) => {
                    return (
                      <option key={index} value={item.idImpuesto}>
                        {item.nombre}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="form-group">
              <div className="input-group">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="fa fa-building"></i>
                  </div>
                </div>
                <select
                  className="form-control"
                  ref={this.refAlmacen}
                  value={this.state.idAlmacen}
                  onChange={this.handleSelectAlmacen}
                >
                  <option value={''}>-- Almacen --</option>
                  {this.state.almacenes.map((item, index) => {
                    return (
                      <option key={index} value={item.idAlmacen}>
                        {item.nombre}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="form-group">
              <div className="input-group">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="bi bi-cash"></i>
                  </div>
                </div>
                <select
                  title="Lista metodo de pago"
                  className="form-control"
                  ref={this.refMoneda}
                  value={this.state.idMoneda}
                  onChange={this.handleSelectMoneda}
                >
                  <option value="">-- Moneda --</option>
                  {this.state.monedas.map((item, index) => (
                    <option key={index} value={item.idMoneda}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <div className="input-group">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="bi bi-chat-dots-fill"></i>
                  </div>
                </div>
                <textarea
                  title="Observaciones..."
                  className="form-control"
                  ref={this.refObservacion}
                  value={this.state.observacion}
                  onChange={this.handleInputObservacion}
                  placeholder="Ingrese alguna observación"
                ></textarea>
              </div>
            </div>

            <div className="form-group">
              <div className="input-group">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="bi bi-card-text"></i>
                  </div>
                </div>
                <textarea
                  title="Observaciones..."
                  className="form-control"
                  value={this.state.nota}
                  onChange={this.handleInputNota}
                  placeholder="Ingrese alguna nota"
                ></textarea>
              </div>
            </div>

            <div className="form-group">
              <table width="100%">{this.renderTotal()}</table>
            </div>
          </div>
        </div>
      </ContainerWrapper>
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
  }).isRequired
}

/**
 *
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

/** 
 *
 * Método encargado de conectar con redux y exportar la clase
 */
export default connect(mapStateToProps, null)(CompraCrear);
