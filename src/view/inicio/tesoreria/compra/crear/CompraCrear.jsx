import React from 'react';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import {
  calculateTax,
  calculateTaxBruto,
  getRowCellIndex,
  isEmpty,
  isText,
  numberFormat,
  rounded,
} from '../../../../../helper/utils.helper';
import Title from '../../../../../components/Title';
import { connect } from 'react-redux';
import { COMPRA } from '../../../../../model/types/tipo-comprobante';
import {
  comboAlmacen,
  comboComprobante,
  comboImpuesto,
  comboMoneda,
  createCompra,
  documentsPdfInvoicesCompra,
  filtrarPersona,
  filtrarProducto,
} from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import SearchInput from '../../../../../components/SearchInput';
import PropTypes from 'prop-types';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import { SpinnerView } from '../../../../../components/Spinner';
import Button from '../../../../../components/Button';
import Select from '../../../../../components/Select';
import TextArea from '../../../../../components/TextArea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../../../components/Table';
import ModalProducto from './component/ModalProducto';
import ModalTransaccion from '../../../../../components/ModalTransaccion';
import { clearCrearCompra, setCrearCompraLocal, setCrearCompraState } from '../../../../../redux/predeterminadoSlice';
import { ModalImpresion, ModalPersona } from '../../../../../components/MultiModal';
import printJS from 'print-js';
import SweetAlert from '../../../../../model/class/sweet-alert';

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
      idMoneda: '',
      idAlmacen: '',
      idImpuesto: '',
      observacion: '',
      nota: '',

      // Detalle del gasto
      detalles: [],

      // Lista de datos
      comprobantes: [],
      monedas: [],
      almacenes: [],
      impuestos: [],

      // Filtrar producto
      producto: null,
      productos: [],

      // Filtrar persona
      persona: null,
      personas: [],

      // Atributos libres
      codiso: '',
      total: 0,

      // Atributos del modal sale
      isOpenTerminal: false,

      // Atributos del modal producto
      isOpenProducto: false,

      // Atributos del modal impresión
      isOpenImpresion: false,

      // Atributos del modal persona
      isOpenPersona: false,

      // Id principales
      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.initial = { ...this.state };

    this.alert = new SweetAlert();

    // Referencia principales
    this.refComprobante = React.createRef();
    this.refMoneda = React.createRef();
    this.refAlmacen = React.createRef();
    this.refImpuesto = React.createRef();
    this.refObservacion = React.createRef();

    // Filtrar producto
    this.refProducto = React.createRef();
    this.refValueProducto = React.createRef();

    // Filtrar persona
    this.refPersona = React.createRef();
    this.refValuePersona = React.createRef();

    // Referencia para el custom modal producto
    this.refModalProducto = React.createRef();

    // Referencia para el modal impresión
    this.refModalImpresion = React.createRef();

    //Anular las peticiones
    this.abortController = new AbortController();

    this.refTable = React.createRef();
    this.index = -1;
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
      await this.setState(this.props.compraCrear.state);
      if (this.props.compraCrear.state.persona) {
        this.handleSelectItemPersona(this.props.compraCrear.state.persona);
      }
      this.index = this.props.compraCrear.local.index;
      const children = Array.from(this.refTable.current.tBodies[0].closest('tbody').children);
      if (this.index != -1 && children) {
        this.updateSelection(children);
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

      this.setState({
        comprobantes,
        monedas,
        almacenes,
        impuestos,
        idImpuesto: isEmpty(impuesto) ? '' : impuesto.idImpuesto,
        idComprobante: isEmpty(comprobante) ? '' : comprobante.idComprobante,
        idMoneda: isEmpty(moneda) ? '' : moneda.idMoneda,
        codiso: isEmpty(moneda) ? '' : moneda.codiso,
        loading: false,
      }, () => {
        this.updateReduxState();
      });
    }
  };

  updateReduxState() {
    this.props.setCrearCompraState(this.state)
    this.props.setCrearCompraLocal({
      index: this.index,
    })
  }

  clearView = () => {
    this.setState(this.initial, async () => {
      await this.refProducto.current.restart();
      await this.refPersona.current.restart();
      await this.props.clearCrearCompra();
      await this.loadData();

      this.refValueProducto.current.focus();
      this.index = -1;

      this.updateReduxState();
    });
  }

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

  handleSelectMoneda = (event) => {
    this.setState({ idMoneda: event.target.value }, () => {
      this.updateReduxState();
    });
  };

  handleInputObservacion = (event) => {
    this.setState({ observacion: event.target.value }, () => {
      this.updateReduxState();
    });
  };

  handleInputNota = (event) => {
    this.setState({ nota: event.target.value }, () => {
      this.updateReduxState();
    });
  };

  handleSelectAlmacen = (event) => {
    this.setState({ idAlmacen: event.target.value }, () => {
      this.updateReduxState();
    });
  };

  handleSelectImpuesto = (event) => {
    const idImpuesto = event.target.value;

    const impuesto = this.state.impuestos.find((item) => item.idImpuesto === idImpuesto);

    this.setState({ idImpuesto: event.target.value });

    if (idImpuesto !== "") {
      this.setState(prevState => ({
        detalles: prevState.detalles.map(item => ({
          ...item,
          idImpuesto: impuesto.idImpuesto,
          nombreImpuesto: impuesto.nombre,
          porcentajeImpuesto: impuesto.porcentaje,
        }))
      }), () => {
        this.updateReduxState();
      });
    }
  };

  handleRemoverProducto = (idProducto) => {
    const detalles = this.state.detalles.filter((item) => item.idProducto !== idProducto).map((item, index) => ({
      ...item,
      id: ++index
    }));

    if (isEmpty(this.state.detalles)) {
      this.index = -1;
    }

    const total = detalles.reduce((accumulate, item) => (accumulate += item.cantidad * item.costo), 0);
    this.setState({ detalles, total }, () => {
      this.updateReduxState();
    });
  };

  //------------------------------------------------------------------------------------------
  // Acciones de la tabla
  //------------------------------------------------------------------------------------------
  handleKeyDownTable = (event) => {
    const table = this.refTable.current;
    if (!table) return;

    const children = Array.from(table.tBodies[0].children);
    if (children.length === 0) return;

    if (event.key === 'ArrowUp') {
      this.index = (this.index - 1 + children.length) % children.length;
      this.updateSelection(children);
      this.updateReduxState();
      event.preventDefault();
    }

    if (event.key === 'ArrowDown') {
      this.index = (this.index + 1) % children.length;
      this.updateSelection(children);
      this.updateReduxState();
      event.preventDefault();
    }

    if (event.key === 'Enter') {
      if (this.index >= 0) {
        this.handleOpenModalProducto()
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }

  handleOnClickTable = async (event) => {
    const { rowIndex, children } = getRowCellIndex(event);

    if (rowIndex === -1) return;

    this.index = rowIndex;
    this.updateSelection(children);
    this.updateReduxState();
  }

  handleOnDbClickTable = async (event) => {
    const { rowIndex, children } = getRowCellIndex(event);

    if (rowIndex === -1) return;

    this.index = rowIndex;
    this.updateSelection(children);
    this.updateReduxState();
    this.handleOpenModalProducto();
  }

  updateSelection = (children) => {
    children.forEach(row => row.classList.remove("table-active"));

    const selectedChild = children[this.index];
    selectedChild.classList.add("table-active");
    selectedChild.scrollIntoView({ block: 'center' });
  }

  //------------------------------------------------------------------------------------------
  // Acciones del modal producto
  //------------------------------------------------------------------------------------------
  handleOpenModalProducto = (producto) => {
    const { idImpuesto, detalles } = this.state;

    if (isEmpty(idImpuesto)) {
      this.alert.warning('Compra', 'Seleccione un impuesto para continuar.', async () => {
        this.refImpuesto.current.focus();
      });
      return;
    }

    const item = producto ?? detalles[this.index];
    if (item) {
      this.setState({ isOpenProducto: true })
      this.refModalProducto.current.loadDatos(item);
    }
  }

  handleCloseProducto = async () => {
    this.setState({ isOpenProducto: false })
  }

  handleSaveProducto = async (detalles, callback = async function () { }) => {
    const total = detalles.reduce((accumulate, item) => (accumulate += item.cantidad * item.costo), 0);
    this.setState({ detalles, total }, () => {
      this.updateReduxState();
    });
    await callback();
    this.refValueProducto.current.focus();
  }

  //------------------------------------------------------------------------------------------
  // Acciones del modal persona
  //------------------------------------------------------------------------------------------
  handleOpenModalPersona = () => {
    this.setState({ isOpenPersona: true });
  }

  handleCloseModalPersona = async () => {
    this.setState({ isOpenPersona: false });
  }

  //------------------------------------------------------------------------------------------
  // Filtrar productos
  //------------------------------------------------------------------------------------------
  handleClearInputProducto = () => {
    this.setState({
      productos: [],
      producto: null,
    }, () => {
      this.updateReduxState();
    });
  };

  handleFilterProducto = async (text) => {
    const searchWord = text;
    this.setState({ producto: null });

    if (isEmpty(searchWord)) {
      this.setState({ productos: [] });
      return;
    }

    const params = {
      filtrar: searchWord,
    };

    const productos = await this.fetchFiltrarProductos(params);

    // Filtrar productos por tipoProducto !== "SERVICIO"
    const filteredProductos = productos.filter((item) => item.tipoProducto !== 'SERVICIO');

    this.setState({
      productos: filteredProductos,
    });
  };

  handleSelectItemProducto = (value) => {
    this.refProducto.current.initialize(value.nombre);
    this.setState({
      producto: value,
      productos: [],
    }, () => {
      this.updateReduxState();

      this.handleOpenModalProducto(value);
    });
  };

  //------------------------------------------------------------------------------------------
  // Filtrar persona
  //------------------------------------------------------------------------------------------
  handleClearInputPersona = () => {
    this.setState({
      personas: [],
      persona: null,
    }, () => {
      this.updateReduxState();
    });
  };

  handleFilterPersona = async (text) => {
    const searchWord = text;
    this.setState({ persona: null, });

    if (isEmpty(searchWord)) {
      this.setState({ personas: [] });
      return;
    }

    const params = {
      opcion: 1,
      filter: searchWord,
      proveedor: 1,
    };

    const personas = await this.fetchFiltrarCliente(params);

    this.setState({ personas });
  };

  handleSelectItemPersona = async (value) => {
    this.refPersona.current.initialize(value.documento + ' - ' + value.informacion);
    this.setState({
      persona: value,
      personas: [],
    }, () => {
      this.updateReduxState();
    });
  };

  //------------------------------------------------------------------------------------------
  // Procesos guardar, limpiar y cerrar
  //------------------------------------------------------------------------------------------
  handleGuardar = async () => {
    const { idComprobante, persona, idMoneda, idImpuesto, idAlmacen, detalles } = this.state;

    if (!isText(idComprobante)) {
      this.alert.warning('Compra', 'Seleccione su comprobante.', () =>
        this.refComprobante.current.focus(),
      );
      return;
    }

    if (isEmpty(persona)) {
      this.alert.warning('Compra', 'Seleccione un proveedor.', () =>
        this.refValuePersona.current.focus(),
      );
      return;
    }

    if (!isText(idMoneda)) {
      this.alert.warning('Compra', 'Seleccione su moneda.', () =>
        this.refMoneda.current.focus(),
      );
      return;
    }
    if (!isText(idImpuesto)) {
      this.alert.warning('Compra', 'Seleccione el impuesto', () =>
        this.refMoneda.current.focus(),
      );
      return;
    }

    if (!isText(idAlmacen)) {
      this.alert.warning('Compra', 'Seleccione su almacen.', () =>
        this.refAlmacen.current.focus(),
      );
      return;
    }

    if (isEmpty(detalles)) {
      this.alert.warning('Compra', 'Agregar algún producto a la lista.', () =>
        this.refValueProducto.current.focus(),
      );
      return;
    }

    this.handleOpenModalTerminal();
  };

  handleLimpiar = async () => {
    this.alert.dialog("Compra", "¿Está seguro de limpiar la compra?", (accept) => {
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
      persona,
      idImpuesto,
      idAlmacen,
      idMoneda,
      observacion,
      nota,
      detalles,
      idUsuario,
      idSucursal
    } = this.state;

    this.alert.dialog('Compra', '¿Está seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idFormaPago: idFormaPago,
          idComprobante: idComprobante,
          idProveedor: persona.idPersona,
          idImpuesto: idImpuesto,
          idAlmacen: idAlmacen,
          idMoneda: idMoneda,
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
        this.alert.information('Compra', 'Procesando información...');

        const response = await createCompra(data);

        if (response instanceof SuccessReponse) {
          this.alert.close();
          this.handleOpenImpresion(response.data.idCompra);
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          this.alert.warning('Compra', response.getMessage());
        }
      }
    });
  };

  handleProcessCredito = async (idFormaPago, numeroCuotas, frecuenciaPago, total, notaTransacion, callback = async function () { }) => {
    const {
      idComprobante,
      persona,
      idImpuesto,
      idAlmacen,
      idMoneda,
      observacion,
      nota,
      detalles,
      idUsuario,
      idSucursal,
    } = this.state;

    this.alert.dialog('Compra', '¿Está seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idFormaPago: idFormaPago,
          idComprobante: idComprobante,
          idProveedor: persona.idPersona,
          idImpuesto: idImpuesto,
          idAlmacen: idAlmacen,
          idMoneda: idMoneda,
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
        this.alert.information('Compra', 'Procesando información...');

        const response = await createCompra(data);

        if (response instanceof SuccessReponse) {
          this.alert.close();
          this.handleOpenImpresion(response.data.idCompra);
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          this.alert.warning('Compra', response.getMessage());
        }
      }
    });
  };

  //------------------------------------------------------------------------------------------
  // Procesos impresión
  //------------------------------------------------------------------------------------------
  handleOpenImpresion = (idCompra) => {
    console.log(idCompra);
    this.setState({ isOpenImpresion: true, idCompra: idCompra })
  }

  handleCloseImpresion = async () => {
    this.setState({ isOpenImpresion: false });
  }

  handlePrinterImpresion = (size) => {
    console.log(this.state.idCompra);
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

  generateBody() {
    const { detalles } = this.state;

    if (isEmpty(detalles)) {
      return (
        <tr className="text-center">
          <td colSpan="6"> Agregar datos a la tabla </td>
        </tr>
      );
    }

    return detalles.map((item, index) => (
      <TableRow
        key={index}>
        <TableCell className="text-center">{item.id}</TableCell>
        <TableCell>
          {item.codigo}
          <br />
          {item.nombre}
        </TableCell>
        <TableCell>{rounded(item.cantidad)}</TableCell>
        <TableCell>{numberFormat(item.costo, this.state.codiso)}</TableCell>
        <TableCell>{numberFormat(item.cantidad * item.costo, this.state.codiso)}</TableCell>
        <TableCell className="text-center">
          <Button
            className="btn-outline-danger btn-sm"
            title="Eliminar"
            onClick={() => this.handleRemoverProducto(item.idProducto)}>
            <i className="bi bi-trash"></i>
          </Button>
        </TableCell>
      </TableRow>
    ));
  }

  renderTotal() {
    let subTotal = 0;
    let total = 0;

    for (const item of this.state.detalles) {
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
      const resultado = this.state.detalles.reduce((acc, item) => {
        const total = item.cantidad * item.costo;
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
          <TableRow key={index}>
            <TableHead className="text-right mb-2">{impuesto.nombre} :</TableHead>
            <TableHead className="text-right mb-2">
              {numberFormat(impuesto.valor, this.state.codiso)}
            </TableHead>
          </TableRow>
        );
      });
    };

    return (
      <>
        <TableRow>
          <TableHead className="text-right mb-2">SUB TOTAL :</TableHead>
          <TableHead className="text-right mb-2">
            {numberFormat(subTotal, this.state.codiso)}
          </TableHead>
        </TableRow>
        {impuestosGenerado()}
        <TableRow className="border-bottom"></TableRow>
        <TableRow>
          <TableHead className="text-right h5">TOTAL :</TableHead>
          <TableHead className="text-right h5">
            {numberFormat(total, this.state.codiso)}
          </TableHead>
        </TableRow>
      </>
    );
  }

  render() {
    return (
      <ContainerWrapper>

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
          isOpen={this.state.isOpenPersona}
          onClose={this.handleCloseModalPersona}

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

        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title='Compra'
          subTitle='Crear'
          handleGoBack={this.handleCerrar}
        />

        <Row>
          <Column className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12">
            <Row>
              <Column>
                <SearchInput
                  ref={this.refProducto}
                  autoFocus={true}
                  placeholder="Filtrar productos..."
                  refValue={this.refValueProducto}
                  data={this.state.productos}
                  handleClearInput={this.handleClearInputProducto}
                  handleFilter={this.handleFilterProducto}
                  handleSelectItem={this.handleSelectItemProducto}
                  renderItem={(value) => <>{value.codigo} / {value.nombre}</>}
                  renderIconLeft={<i className="bi bi-cart4"></i>}
                />
              </Column>
            </Row>

            <Row>
              <Column>
                <TableResponsive
                  onKeyDown={this.handleKeyDownTable}>
                  <Table
                    ref={this.refTable}
                    tabIndex="0"
                    onClick={this.handleOnClickTable}
                    onDoubleClick={this.handleOnDbClickTable}
                    className={"table-bordered table-hover table-sticky w-100"}>
                    <TableHeader>
                      <TableRow>
                        <TableHead width="5%" className="text-center">#</TableHead>
                        <TableHead width="15%">Producto</TableHead>
                        <TableHead width="5%">Cantidad</TableHead>
                        <TableHead width="5%">Costo</TableHead>
                        <TableHead width="5%">Total</TableHead>
                        <TableHead width="5%" className="text-center">Quitar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {this.generateBody()}
                    </TableBody>
                  </Table>
                </TableResponsive>
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <Button
                  className="btn-primary"
                  onClick={this.handleGuardar}
                >
                  <i className="fa fa-arrow-right"></i> Registrar (F1)
                </Button>{' '}
                <Button
                  className="btn-outline-info"
                  onClick={this.handleLimpiar}
                >
                  <i className="fa fa-trash"></i> Limpiar (F2)
                </Button>{' '}
                <Button
                  className="btn-outline-danger"
                  onClick={this.handleCerrar}
                >
                  <i className="fa fa-close"></i> Cerrar
                </Button>
              </Column>
            </Row>
          </Column>

          <Column className="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-12">
            <div className="form-group">
              <Select
                group={true}
                iconLeft={<i className="bi bi-receipt"></i>}
                title="Comprobantes de venta"
                refSelect={this.refComprobante}
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

            <div className="form-group">
              <SearchInput
                ref={this.refPersona}
                placeholder="Filtrar proveedores..."
                refValue={this.refValuePersona}
                data={this.state.personas}
                handleClearInput={this.handleClearInputPersona}
                handleFilter={this.handleFilterPersona}
                handleSelectItem={this.handleSelectItemPersona}
                renderItem={(value) => <>{value.documento + ' - ' + value.informacion}</>}
                renderIconLeft={<i className="bi bi-person-circle"></i>}
                customButton={
                  <Button
                    className="btn-outline-success d-flex align-items-center"
                    onClick={this.handleOpenModalPersona}>
                    <i className='fa fa-plus'></i>
                    <span className="ml-2">Nuevo</span>
                  </Button>
                }
              />
            </div>

            <div className="form-group">
              <Select
                group={true}
                iconLeft={<i className="bi bi-percent"></i>}
                refSelect={this.refImpuesto}
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
              </Select>
            </div>

            <div className="form-group">
              <Select
                group={true}
                iconLeft={<i className="fa fa-building"></i>}
                refSelect={this.refAlmacen}
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
              </Select>
            </div>

            <div className="form-group">
              <Select
                group={true}
                iconLeft={<i className="bi bi-cash"></i>}
                title="Lista metodo de pago"
                refSelect={this.refMoneda}
                value={this.state.idMoneda}
                onChange={this.handleSelectMoneda}
              >
                <option value="">-- Moneda --</option>
                {this.state.monedas.map((item, index) => (
                  <option key={index} value={item.idMoneda}>
                    {item.nombre}
                  </option>
                ))}
              </Select>
            </div>

            <div className="form-group">
              <TextArea
                group={true}
                iconLeft={<i className="bi bi-chat-dots-fill"></i>}
                title="Observaciones..."
                refInput={this.refObservacion}
                value={this.state.observacion}
                onChange={this.handleInputObservacion}
                placeholder="Ingrese alguna observación">
              </TextArea>
            </div>

            <div className="form-group">
              <TextArea
                group={true}
                iconLeft={<i className="bi bi-card-text"></i>}
                title="Observaciones..."
                value={this.state.nota}
                onChange={this.handleInputNota}
                placeholder="Ingrese alguna nota">
              </TextArea>
            </div>

            <div className="form-group">
              <Table classNameContent="w-100">
                <TableHeader>{this.renderTotal()}</TableHeader>
              </Table>
            </div>
          </Column>
        </Row>
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
