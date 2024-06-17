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
  getRowCellIndex,
  isEmpty,
  numberFormat,
  reorder,
  rounded,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { COTIZACION } from '../../../../../model/types/tipo-comprobante';
import {
  comboComprobante,
  comboImpuesto,
  comboMoneda,
  createCotizacion,
  filtrarPersona,
  filtrarProducto,
  obtenerCotizacionPdf,
} from '../../../../../network/rest/principal.network';
import Title from '../../../../../components/Title';
import Row from '../../../../../components/Row';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import SearchInput from '../../../../../components/SearchInput';
import PropTypes from 'prop-types';
import ModalProducto from '../common/ModalProducto';
import ModalImpresion from '../common/ModalImpresion';
import ModalPreImpresion from '../common/ModalPreImpresion';
import Column from '../../../../../components/Column';
import { SpinnerView } from '../../../../../components/Spinner';
import printJS from 'print-js';
import Button from '../../../../../components/Button';
import Select from '../../../../../components/Select';
import TextArea from '../../../../../components/TextArea';
import { Table } from '../../../../../components/Table';
import { Draggable } from 'react-beautiful-dnd';
import { DragDropContext } from 'react-beautiful-dnd';
import { Droppable } from 'react-beautiful-dnd';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class CotizaciónCrear extends CustomComponent {
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

      // Atributo principal
      idCotizacion: '',

      // Atributos principales
      idComprobante: '',
      idMoneda: '',
      idImpuesto: '',
      observacion: '',
      nota: '',

      // Detalle del gasto
      detalles: [],

      // Lista de datos
      comprobantes: [],
      monedas: [],
      impuestos: [],
      medidas: [],

      // Filtrar producto
      filtrarProducto: '',
      loadingProducto: false,
      productos: [],

      // Filtrar cliente
      filtrarCliente: '',
      loadingCliente: false,
      cliente: null,
      clientes: [],

      // Atributos libres
      codISO: '',
      total: 0,

      // Atributos del modal producto
      isOpenProducto: false,

      // Atributos del modal impresión
      isOpenImpresion: false,

      // Atributos del model pre impresión
      isOpenPreImpresion: false,

      // Id principales
      idUsuario: this.props.token.userToken.idUsuario,
      idSucursal: this.props.token.project.idSucursal,
    };

    this.initial = { ...this.state };

    // Referencia principales
    this.refComprobante = React.createRef();
    this.refIdMoneda = React.createRef();
    this.refIdImpuesto = React.createRef();
    this.refObservacion = React.createRef();

    // Filtrar producto
    this.refProducto = React.createRef();
    this.selectItemProducto = false;

    // Filtrar cliente
    this.refCliente = React.createRef();
    this.selectItemCliente = false;

    // Referencia para el modal producto
    this.refModalProducto = React.createRef();

    // Referencia para el modal impresión
    this.refModalImpresion = React.createRef();

    // Referencia para el modal pre impresión
    this.refModalPreImpresion = React.createRef();

    //Anular las peticiones
    this.abortController = new AbortController();

    this.refTable = React.createRef();
    this.refTaleBody = React.createRef();
    this.index = -1;
    this.cells = [];
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

    await this.loadingData();
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

  loadingData = async () => {
    const [comprobantes, monedas, impuestos] =
      await Promise.all([
        this.fetchComprobante(COTIZACION),
        this.fetchMoneda(),
        this.fetchImpuesto(),
      ]);

    const comprobante = comprobantes.find((item) => item.preferida === 1);
    const moneda = monedas.find((item) => item.nacional === 1);
    const impuesto = impuestos.find((item) => item.preferido === 1);

    this.setState({
      comprobantes,
      monedas,
      impuestos,
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

  clearView = () => {
    this.setState(this.initial, async () => {
      await this.loadingData();
      this.refProducto.current.focus();
      this.index = -1;
      this.cells = [];
    });
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
    if (event.key === 'F1') {
      this.handleGuardar();
    }

    if (event.key === 'F2') {
      this.handleLimpiar();
    }
  }

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

  handleSelectImpuesto = (event) => {
    const idImpuesto = event.target.value;

    const impuesto = this.state.impuestos.find((item) => item.idImpuesto === idImpuesto);

    this.setState({ idImpuesto: event.target.value });

    if (idImpuesto !== "") {
      const newDetalle = [...this.state.detalles].map((item) => (
        {
          ...item,
          idImpuesto: impuesto.idImpuesto,
          nombreImpuesto: impuesto.nombre,
          porcentajeImpuesto: impuesto.porcentaje,
        }
      ));
      this.setState({
        detalle: newDetalle,
      })
    }
  };

  handleRemoverProducto = (idProducto) => {
    const detalles = this.state.detalles.filter((item) => item.idProducto !== idProducto).map((item, index) => ({
      ...item,
      id: ++index
    }), () => {
      if (isEmpty(this.state.detalles)) {
        this.index = -1;
      }
    });

    const total = detalles.reduce((accumulate, item) => (accumulate += item.cantidad * item.costo), 0);
    this.setState({ detalles, total });
  };

  //------------------------------------------------------------------------------------------
  // Acciones de la tabla
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
        this.handleOpenModalProducto()
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }

  handleOnClickTable = async (event) => {
    const { rowIndex, tBody } = getRowCellIndex(event);

    if (rowIndex === -1 || !tBody || !tBody.children) return;

    this.index = rowIndex;
    this.updateSelection(tBody.children);
  }

  handleOnDbClickTable = async (event) => {
    const { rowIndex, tBody } = getRowCellIndex(event);

    if (rowIndex === -1 || !tBody || !tBody.children) return;

    this.index = rowIndex;
    this.updateSelection(tBody.children);
    this.handleOpenModalProducto();

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
      detalles: reorder(prevState.detalles, source.index, destination.index).map((item, index) => ({ ...item, id: ++index }))
    }))

    this.index = destination.index;
    this.cells = [];
    if (this.refTaleBody.current) {
      const tbody = this.refTaleBody.current;
      this.updateSelection(tbody.children);
    }
  }

  handleOnBeforeDragStartTable = (before) => {
    const sourceIndex = before.source.index;

    if (this.refTaleBody.current) {
      const tbody = this.refTaleBody.current;
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


  //------------------------------------------------------------------------------------------
  // Acciones del modal producto
  //------------------------------------------------------------------------------------------

  handleOpenModalProducto = (producto) => {
    const { idImpuesto, detalles } = this.state;

    if (isEmpty(idImpuesto)) {
      alertWarning('Cotización', 'Seleccione un impuesto para continuar.', () => {
        this.refIdImpuesto.current.focus();
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
    this.setState({ isOpenProducto: false });
  }

  handleSaveProducto = (detalles) => {
    const total = detalles.reduce((accumulate, item) => (accumulate += item.cantidad * item.costo), 0);
    this.setState({ detalles, total });
    this.refProducto.current.focus();
  }

  //------------------------------------------------------------------------------------------
  // Filtrar productos
  //------------------------------------------------------------------------------------------

  handleClearInputProducto = async () => {
    await this.setStateAsync({
      productos: [],
      filtrarProducto: '',
    });
    this.selectItemProducto = false;
  };

  handleFilterProducto = async (event) => {
    const searchWord = this.selectItemProducto ? '' : event.target.value;
    await this.setStateAsync({ filtrarProducto: searchWord });

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

    this.setState({
      productos: productos,
      loadingProducto: false,
    });
  };

  handleSelectItemProducto = async (value) => {
    await this.setStateAsync({
      filtrarProducto: value.nombre,
      productos: [],
    });
    this.selectItemProducto = true;

    this.handleOpenModalProducto(value);
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
      opcion: 1,
      filter: searchWord,
      cliente: 1,
    };

    const clientes = await this.fetchFiltrarCliente(params);

    this.setState({ loadingCliente: false, clientes });
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
  // Procesos guardar
  //------------------------------------------------------------------------------------------

  handleGuardar = async () => {
    const { idComprobante, cliente, idMoneda, idImpuesto, observacion, nota, detalles } = this.state;

    if (isEmpty(idComprobante)) {
      alertWarning('Cotización', 'Seleccione su comprobante.', () =>
        this.refComprobante.current.focus(),
      );
      return;
    }

    if (isEmpty(cliente)) {
      alertWarning('Cotización', 'Seleccione un cliente.', () =>
        this.refCliente.current.focus(),
      );
      return;
    }

    if (isEmpty(idMoneda)) {
      alertWarning('Cotización', 'Seleccione su moneda.', () =>
        this.refIdMoneda.current.focus(),
      );
      return;
    }

    if (isEmpty(idImpuesto)) {
      alertWarning('Cotización', 'Seleccione el impuesto', () =>
        this.refIdImpuesto.current.focus(),
      );
      return;
    }

    if (isEmpty(detalles)) {
      alertWarning('Cotización', 'Agregar algún producto a la lista.', () =>
        this.refProducto.current.focus(),
      );
      return;
    }

    alertDialog('Cotización', '¿Está seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idComprobante: idComprobante,
          idCliente: cliente.idPersona,
          idMoneda: idMoneda,
          idSucursal: this.state.idSucursal,
          idUsuario: this.state.idUsuario,
          estado: 1,
          observacion: observacion,
          nota: nota,
          detalle: detalles
        };

        alertInfo('Cotización', 'Procesando información...');

        const response = await createCotizacion(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Cotización', response.data.message, () => {
            this.handleOpenImpresion(response.data.idCotizacion)
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertWarning('Cotización', response.getMessage());
        }
      }
    });
  };

  //------------------------------------------------------------------------------------------
  // Procesos limpiar
  //------------------------------------------------------------------------------------------

  handleLimpiar = async () => {
    alertDialog("Cotización", "¿Está seguro de limpiar la cotización?", (accept) => {
      if (accept) {
        this.clearView();
      }
    })
  };

  //------------------------------------------------------------------------------------------
  // Procesos impresión
  //------------------------------------------------------------------------------------------

  handleOpenImpresion = (idCotizacion) => {
    this.setState({ isOpenImpresion: true, idCotizacion: idCotizacion })
  }

  handleCloseImpresion = () => {
    this.setState({ isOpenImpresion: false }, () => {
      this.clearView();
    });
  }

  handleOpenImpresionA4 = () => {
    printJS({
      printable: obtenerCotizacionPdf(this.state.idCotizacion, "a4"),
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
      printable: obtenerCotizacionPdf(this.state.idCotizacion, "ticket"),
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
    const { idComprobante, cliente, idMoneda, idImpuesto, detalles } = this.state;

    if (isEmpty(idComprobante)) {
      alertWarning('Cotización', 'Seleccione su comprobante.', () =>
        this.refComprobante.current.focus(),
      );
      return;
    }

    if (isEmpty(cliente)) {
      alertWarning('Cotización', 'Seleccione un cliente.', () =>
        this.refCliente.current.focus(),
      );
      return;
    }

    if (isEmpty(idMoneda)) {
      alertWarning('Cotización', 'Seleccione su moneda.', () =>
        this.refIdMoneda.current.focus(),
      );
      return;
    }

    if (isEmpty(idImpuesto)) {
      alertWarning('Cotización', 'Seleccione un impuesto', () =>
        this.refIdImpuesto.current.focus(),
      );
      return;
    }

    if (isEmpty(detalles)) {
      alertWarning('Cotización', 'Agregar algún producto a la lista.', () =>
        this.refProducto.current.focus(),
      );
      return;
    }

    this.setState({ isOpenPreImpresion: true })
  }

  handleClosePreImpresion = () => {
    if (this.state.loadingPreImpresion) return;


    this.setState({ isOpenPreImpresion: false })
  }

  //------------------------------------------------------------------------------------------
  // Procesos cerrar
  //------------------------------------------------------------------------------------------

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

  generateBody() {
    const { detalles } = this.state;

    if (isEmpty(detalles)) {
      return (
        <tr className="text-center">
          <td colSpan="7"> Agregar datos a la tabla </td>
        </tr>
      );
    }

    const widthCell1 = isEmpty(this.cells) ? "auto" : this.cells[0].offsetWidth + "px";
    const widthCell2 = isEmpty(this.cells) ? "auto" : this.cells[1].offsetWidth + "px";
    const widthCell3 = isEmpty(this.cells) ? "auto" : this.cells[2].offsetWidth + "px";
    const widthCell4 = isEmpty(this.cells) ? "auto" : this.cells[3].offsetWidth + "px";
    const widthCell5 = isEmpty(this.cells) ? "auto" : this.cells[4].offsetWidth + "px";
    const widthCell6 = isEmpty(this.cells) ? "auto" : this.cells[5].offsetWidth + "px";
    const widthCell7 = isEmpty(this.cells) ? "auto" : this.cells[6].offsetWidth + "px";

    return detalles.map((item, index) => (
      <Draggable key={item.idProducto} draggableId={item.idProducto} index={index}>
        {(provided) => {
          return (
            <tr
              {...provided.draggableProps}
              ref={provided.innerRef}
              {...provided.dragHandleProps}
              className='bg-white'>
              <td className="text-center" style={{ width: widthCell1 }}>{item.id}</td>
              <td style={{ width: widthCell2 }}>{item.nombre}</td>
              <td style={{ width: widthCell3 }}>{rounded(item.cantidad)}</td>
              <td style={{ width: widthCell4 }}>{item.nombreMedida}</td>
              <td style={{ width: widthCell5 }}>{numberFormat(item.precio, this.state.codISO)}</td>
              <td style={{ width: widthCell6 }}>{numberFormat(item.cantidad * item.precio, this.state.codISO)}</td>
              <td className="text-center" style={{ width: widthCell7 }}>
                <button
                  className="btn btn-outline-danger btn-sm"
                  title="Eliminar"
                  onClick={() => this.handleRemoverProduct(item.idProducto)}>
                  <i className="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          );
        }}
      </Draggable>
    ));
  }

  renderTotal() {
    let subTotal = 0;
    let total = 0;

    for (const item of this.state.detalles) {
      const cantidad = item.cantidad;
      const valor = item.precio;

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
        const total = item.cantidad * item.precio;
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
      <>
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
      </>
    );
  }

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title='Cotización'
          subTitle='Crear'
          handleGoBack={this.handleCerrar}
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
          idCliente={this.state.cliente === null ? '' : this.state.cliente.idPersona}
          idMoneda={this.state.idMoneda}
          idUsuario={this.state.idUsuario}
          idSucursal={this.state.idSucursal}
          nota={this.state.nota}
          detalles={this.state.detalles}

          handleClose={this.handleClosePreImpresion}
        />

        <Row>
          <Column className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12">
            <Row>
              <Column>
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
              </Column>
            </Row>

            <Row>
              <Column>
                <div
                  className="table-responsive"
                  onKeyDown={this.handleKeyDownTable}>
                  <table
                    ref={this.refTable}
                    onClick={this.handleOnClickTable}
                    onDoubleClick={this.handleOnDbClickTable}
                    className={"table table-bordered table-hover table-sticky w-100"}>
                    <thead>
                      <tr>
                        <th width="5%" className="text-center">#</th>
                        <th width="15%">Producto</th>
                        <th width="5%">Cantidad</th>
                        <th width="5%">Medida</th>
                        <th width="5%">Precio</th>
                        <th width="5%">Total</th>
                        <th width="5%" className="text-center">
                          Quitar
                        </th>
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
                              this.refTaleBody.current = el;
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
                {/* <TableResponsive
                  tHead={
                    <tr>
                      <th width="5%" className="text-center">
                        #
                      </th>
                      <th width="15%">Producto</th>
                      <th width="5%">Cantidad</th>
                      <th width="5%">Medida</th>
                      <th width="5%">Precio</th>
                      <th width="5%">Total</th>
                      <th width="5%" className="text-center">
                        Quitar
                      </th>
                    </tr>
                  }
                  tBody={this.generarBody()}
                /> */}
              </Column>
            </Row>

            <Row>
              <Column>
                <div className="form-group">
                  <Button
                    className='btn-success'
                    onClick={this.handleGuardar}>
                    <i className="fa fa-save"></i> Guardar (F1)
                  </Button>
                  {' '}
                  <Button
                    className='btn-outline-info'
                    onClick={this.handleLimpiar}>
                    <i className="fa fa-trash"></i> Limpiar (F2)
                  </Button>
                  {' '}
                  <Button
                    className=" btn-outline-primary"
                    onClick={this.handleOpenPreImpresion}>
                    <i className="bi bi-printer"></i> Pre Impresión (F3)
                  </Button>
                  {' '}
                  <Button
                    className=" btn-outline-danger"
                    onClick={this.handleCerrar}>
                    <i className="fa fa-close"></i> Cerrar
                  </Button>
                </div>
              </Column>
            </Row>

            <Row>
              <Column>
                <div className="form-group">
                  <p><span className='text-danger'>*</span> <i className="bi bi-chat-dots-fill text-danger"></i> Observación, se utiliza para agregar información importante. No son visible en la impresión.</p>
                  <p><span className='text-danger'>*</span> <i className="bi bi-card-text text-danger"></i> Nota, visible en la impresión del documento.</p>
                </div>
              </Column>
            </Row>
          </Column>

          <Column className="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-12">
            <div className="form-group">
              <div className="input-group">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="bi bi-receipt"></i>
                  </div>
                </div>

                <Select
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
                <Select
                  refSelect={this.refIdImpuesto}
                  value={this.state.idImpuesto}
                  onChange={this.handleSelectImpuesto}
                >
                  <option value={''}>-- Impuesto --</option>
                  {this.state.impuestos.map((item, index) => (
                    <option key={index} value={item.idImpuesto}>
                      {item.nombre}
                    </option>
                  )
                  )}
                </Select>
              </div>
            </div>

            <div className="form-group">
              <div className="input-group">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="bi bi-cash"></i>
                  </div>
                </div>
                <Select
                  title="Lista metodo de pago"
                  refSelect={this.refIdMoneda}
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
            </div>

            <div className="form-group">
              <div className="input-group">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="bi bi-chat-dots-fill"></i>
                  </div>
                </div>
                <TextArea
                  title="Observaciones..."
                  refInput={this.refObservacion}
                  value={this.state.observacion}
                  onChange={this.handleInputObservacion}
                  placeholder="Ingrese alguna observación"
                ></TextArea>
              </div>
            </div>

            <div className="form-group">
              <div className="input-group">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="bi bi-card-text"></i>
                  </div>
                </div>
                <TextArea
                  title="Observaciones..."
                  value={this.state.nota}
                  onChange={this.handleInputNota}
                  placeholder="Ingrese alguna nota"
                ></TextArea>
              </div>
            </div>

            <div className="form-group">
              <Table
                tHead={this.renderTotal()}
              />
            </div>
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

CotizaciónCrear.propTypes = {
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
  };
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */

const ConnectedCotizaciónCrear = connect(mapStateToProps, null)(CotizaciónCrear);

export default ConnectedCotizaciónCrear;
