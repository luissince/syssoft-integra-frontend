import React from 'react';
import {
  getNumber,
  isEmpty,
  keyNumberFloat,
  rounded,
  validateNumericInputs,
} from '../../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import {
  comboAlmacen,
  comboMotivoTraslado,
  comboSucursal,
  createTraslado,
  filtrarAlmacenProducto,
} from '../../../../../network/rest/principal.network';
import { CANCELED } from '../../../../../model/types/types';
import { connect } from 'react-redux';
import SearchInput from '../../../../../components/SearchInput';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import Button from '../../../../../components/Button';
import Input from '../../../../../components/Input';
import Select from '../../../../../components/Select';
import { SpinnerView } from '../../../../../components/Spinner';
import Title from '../../../../../components/Title';
import RadioButton from '../../../../../components/RadioButton';
import Image from '../../../../../components/Image';
import { images } from '../../../../../helper';
import { SERVICIO } from '../../../../../model/types/tipo-producto';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow, TableTitle } from '../../../../../components/Table';
import { alertKit } from 'alert-kit';
import ModalLote from './ModalLote';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class TrasladorCrear extends CustomComponent {
  /**
   * Inicializa un nuevo componente.
   * @param {Object} props - Las propiedades pasadas al componente.
   */
  constructor(props) {
    super(props);

    this.state = {
      // Atributos de carga
      initialLoad: true,
      initialMessage: 'Cargando datos...',

      // Atributos principales
      paso: 1,

      producto: null,
      cantidad: 0,
      costo: 0,

      productos: [],

      idTipoTraslado: '',

      idMotivoTraslado: '',
      motivoTraslado: [],

      idAlmacenOrigenInterno: '',
      idAlmacenDestinoInterno: '',

      almacenes: [],
      almacenesExterno: [],
      almacenesOrigenInterno: [],
      almacenesDestinoInterno: [],

      idAlmacenOrigenExterno: '',
      idSucursalExterno: '',
      idAlmacenDestinoExterno: '',

      observacion: 'S/N',

      sucursales: [],

      detalles: [],

      nombreMotivoAjuste: '',
      nombreAlmacenOrigenInterno: '',
      nombreAlmacenDestinoInterno: '',
      nombreAlmacenOriginExterno: '',
      nombreSucursalExterno: '',
      nombreAlmacenDestinoExterno: '',

      // Atributos del modal lote
      isOpenLote: false,

      // Id principales
      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.initial = { ...this.state }

    // Referencial al padre
    this.refTableBody = React.createRef();

    // Referencia del formulario principal
    this.refIdTipoTraslado = React.createRef();
    this.refIdMotivoTraslado = React.createRef();

    this.refIdAlmacen = React.createRef();

    this.refIdAlmacenOriginInterno = React.createRef();
    this.refIdAlmacenDesitnoInterno = React.createRef();

    this.refIdAlmacenOrigenExterno = React.createRef();
    this.refIdSucursalExterno = React.createRef();
    this.refIdAlmacenDestinoExterno = React.createRef();

    this.refProducto = React.createRef();
    this.refValueProducto = React.createRef();

    // Referencia al modal lote
    this.refModalLote = React.createRef();

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
    await this.loadingData();
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

  async loadingData() {
    const [almacenes, motivoTraslado, sucursales] = await Promise.all([
      this.fetchComboAlmacen({ idSucursal: this.state.idSucursal }),
      this.fetchComboMotivoTraslado(),
      this.fetchComboSucursal()
    ]);

    const newSucursal = sucursales.filter(item => item.idSucursal !== this.state.idSucursal)

    await this.setStateAsync({
      almacenes,
      motivoTraslado,
      sucursales: newSucursal,
      initialLoad: false,
    });
  }

  async fetchFiltrarProducto(params) {
    const response = await filtrarAlmacenProducto(params);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
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

  async fetchComboMotivoTraslado() {
    const response = await comboMotivoTraslado(this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchComboSucursal() {
    const response = await comboSucursal(this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  addProducto(producto, lotes = null) {
    const exists = this.state.detalles.find((item) => item.idProducto === producto.idProducto)

    if (exists) {
      alertKit.warning({
        title: 'Ajuste',
        message: 'El producto ya existe en la lista.',
      });
      return;
    }

    const data = {
      idProducto: producto.idProducto,
      codigo: producto.codigo,
      nombre: producto.nombre,
      imagen: producto.imagen,
      cantidad: '',
      actual: producto.cantidad,
      unidad: producto.unidad,
      lotes: lotes ? lotes : null,
    };

    this.setState((prevState) => ({
      detalles: [...prevState.detalles, data],
    }));
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

  //------------------------------------------------------------------------------------------
  // Filtrar producto
  //------------------------------------------------------------------------------------------

  handleClearInputProducto = () => {
    this.setState({
      productos: [],
      producto: null,
    });
  };

  handleFilterProducto = async (value) => {
    const searchWord = value;
    this.setState({ producto: null, });

    if (isEmpty(searchWord)) {
      this.setState({ productos: [] });
      return;
    }

    const params = {
      idAlmacen: this.state.idTipoTraslado === "TT0001" ? this.state.idAlmacenOrigenInterno : this.state.idAlmacenOrigenExterno,
      filtrar: searchWord,
    }

    const productos = await this.fetchFiltrarProducto(params);

    // Filtrar productos por tipoProducto !== "SERVICIO"
    const filteredProductos = productos.filter((item) => item.idTipoProducto !== SERVICIO);

    this.setState({
      productos: filteredProductos,
    });
  }

  handleSelectItemProducto = (value) => {
    this.refProducto.current.initialize(value.nombre);

    if (value.lote === 1) {
      this.handleOpenLote(value);
    } else {
      this.setState({
        producto: value,
        productos: [],
      }, () => {
        this.addProducto(value);
      });
    }
  }

  handleOptionTipoTraslado = (event) => {
    this.setState({
      idTipoTraslado: event.target.value,
      almacenesOrigenInterno: this.state.almacenes
    });
  }


  handleSelectMotivojuste = (event) => {
    this.setState({ idMotivoTraslado: event.target.value, });
  }

  handleSelectAlmacenOrigenInterno = (event) => {
    const almacenesDestinoInterno = this.state.almacenesOrigenInterno.filter(item => item.idAlmacen !== event.target.value)

    const idAlmacenDestinoInterno = almacenesDestinoInterno.length === 1 ? almacenesDestinoInterno[0].idAlmacen : ""

    this.setState({
      idAlmacenOrigenInterno: event.target.value,
      idAlmacenDestinoInterno,
      almacenesDestinoInterno
    });

    if (event.target.value === '') {
      this.refIdAlmacenDesitnoInterno.current.disabled = true
    } else {
      this.refIdAlmacenDesitnoInterno.current.disabled = false
    }
  }

  handleSelectAlmacenDestinoInterno = (event) => {
    this.setState({ idAlmacenDestinoInterno: event.target.value, });
  }

  handleSelectAlmacenOrigenExterno = (event) => {
    this.setState({ idAlmacenOrigenExterno: event.target.value })
  }

  handleSelectSucursalExterno = async (event) => {
    this.setState({
      initialLoad: true,
      idSucursalExterno: event.target.value,
      idAlmacenDestinoExterno: ''
    })

    const params = {
      idSucursal: event.target.value
    }

    const almacenes = await this.fetchComboAlmacen(params, this.abortController.signal);

    this.setState({
      almacenesExterno: almacenes,
      initialLoad: false
    })

    if (event.target.value === '') {
      this.refIdAlmacenDestinoExterno.current.disabled = true
    } else {
      this.refIdAlmacenDestinoExterno.current.disabled = false
    }
  }

  handleSelectAlmacenDestinoExterno = (event) => {
    this.setState({ idAlmacenDestinoExterno: event.target.value })
  }

  handleSiguiente = () => {
    if (isEmpty(this.state.idTipoTraslado)) {
      alertKit.warning({
        title: 'Traslado',
        message: 'Seleccione el tipo de traslado.',
      }, () => {
        this.refIdTipoTraslado.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idMotivoTraslado)) {
      alertKit.warning({
        title: 'Traslado',
        message: 'Seleccione el motivo traslado.',
      }, () => {
        this.refIdMotivoTraslado.current.focus();
      });
      return;
    }

    if (this.state.idTipoTraslado === 'TT0001' && isEmpty(this.state.idAlmacenOrigenInterno)) {
      alertKit.warning({
        title: 'Traslado',
        message: 'Seleccione el almacen origin.',
      }, () => {
        this.refIdAlmacenOriginInterno.current.focus();
      });
      return;
    }

    if (this.state.idTipoTraslado === 'TT0001' && isEmpty(this.state.idAlmacenDestinoInterno)) {
      alertKit.warning({
        title: 'Traslado',
        message: 'Seleccione el almacen destino.',
      }, () => {
        this.refIdAlmacenDesitnoInterno.current.focus();
      });
      return;
    }

    if (this.state.idTipoTraslado === 'TT0002' && isEmpty(this.state.idAlmacenOrigenExterno)) {
      alertKit.warning({
        title: 'Traslado',
        message: 'Seleccione el almacen origin.',
      }, () => {
        this.refIdAlmacenOrigenExterno.current.focus();
      });
      return;
    }

    if (this.state.idTipoTraslado === 'TT0002' && isEmpty(this.state.idSucursalExterno)) {
      alertKit.warning({
        title: 'Traslado',
        message: 'Seleccione la sucursal.',
      }, () => {
        this.refIdSucursalExterno.current.focus();
      });
      return;
    }

    if (this.state.idTipoTraslado === 'TT0002' && isEmpty(this.state.idAlmacenDestinoExterno)) {
      alertKit.warning({
        title: 'Traslado',
        message: 'Seleccione el almacen destino.',
      }, () => {
        this.refIdAlmacenDestinoExterno.current.focus();
      });
      return;
    }

    if (this.state.idTipoTraslado === 'TT0001') {
      this.setState({
        nombreMotivoAjuste: this.refIdMotivoTraslado.current.options[this.refIdMotivoTraslado.current.selectedIndex].innerText,
        nombreAlmacenOrigenInterno: this.refIdAlmacenOriginInterno.current.options[this.refIdAlmacenOriginInterno.current.selectedIndex].innerText,
        nombreAlmacenDestinoInterno: this.refIdAlmacenDesitnoInterno.current.options[this.refIdAlmacenDesitnoInterno.current.selectedIndex].innerText,
        paso: 2,
      })
    } else {
      this.setState({
        nombreMotivoAjuste: this.refIdMotivoTraslado.current.options[this.refIdMotivoTraslado.current.selectedIndex].innerText,
        nombreAlmacenOriginExterno: this.refIdAlmacenOrigenExterno.current.options[this.refIdAlmacenOrigenExterno.current.selectedIndex].innerText,
        nombreSucursalExterno: this.refIdSucursalExterno.current.options[this.refIdSucursalExterno.current.selectedIndex].innerText,
        nombreAlmacenDestinoExterno: this.refIdAlmacenDestinoExterno.current.options[this.refIdAlmacenDestinoExterno.current.selectedIndex].innerText,
        paso: 2,
      })
    }
  }

  handleInputObservacion = (event) => {
    this.setState({
      observacion: event.target.value,
    });
  }

  handleRemoveDetalle = (idProducto) => {
    const detalles = this.state.detalles.filter((item) => item.idProducto !== idProducto);
    this.setState({ detalles });
  }

  handleInputDetalle = (event, idProducto) => {
    const { value } = event.target;
    this.setState((prevState) => ({
      detalles: prevState.detalles.map((item) =>
        item.idProducto === idProducto ? { ...item, cantidad: value } : item,
      ),
    }));
  }

  handleFocusInputTable = (event, isLastRow) => {
    if (event.key === 'Enter' && !isLastRow) {
      const nextInput = event.target.parentElement.parentElement.nextElementSibling.querySelector('input');
      nextInput.focus();
    }
    if (event.key === 'Enter' && isLastRow) {
      const firstInput = event.target.parentElement.parentElement.parentElement.querySelector('input');
      firstInput.focus();
    }
  }

  //------------------------------------------------------------------------------------------
  // Acciones del modal lote
  //------------------------------------------------------------------------------------------
  handleOpenLote = async (producto) => {
    this.setState({ isOpenLote: true });
    await this.refModalLote.current.loadDatos(producto);
  }

  handleCloseLote = () => {
    this.setState({ isOpenLote: false });
  }

  handleSaveLote = async (producto, lotes) => {
    this.setState({
      producto: producto,
      productos: [],
    }, () => {
      this.addProducto(producto, lotes);
    });
  };

  //------------------------------------------------------------------------------------------
  // Acciones de proceso de registro
  //------------------------------------------------------------------------------------------
  handleSave = () => {
    if (isEmpty(this.state.detalles)) {
      alertKit.warning({
        title: 'Traslado',
        message: 'Agregue productos en la lista para continuar.',
      }, () => {
        this.refValueProducto.current.focus();
      });
      return;
    }

    console.log(this.state.detalles)

    if (!isEmpty(this.state.detalles.filter(item => !item.lotes && getNumber(item.cantidad) <= 0))) {
      alertKit.warning({
        title: 'Ajuste',
        message: 'Hay cantidades en lista de productos con valor 0 o vacío.',
      }, () => {
        validateNumericInputs(this.refTableBody);
      });
      return;
    }

    alertKit.question({
      title: 'Traslado',
      message: '¿Está seguro de continuar?',
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    }, async (accept) => {
      if (accept) {
        const data = {
          idTipoTraslado: this.state.idTipoTraslado,
          idMotivoTraslado: this.state.idMotivoTraslado,
          idAlmacenOrigen: this.state.idTipoTraslado === 'TT0001' ? this.state.idAlmacenOrigenInterno : this.state.idAlmacenOrigenExterno,
          idAlmacenDestino: this.state.idTipoTraslado === 'TT0001' ? this.state.idAlmacenDestinoInterno : this.state.idAlmacenDestinoExterno,
          idSucursalDestino: this.state.idSucursalExterno,
          idSucursal: this.state.idSucursal,
          observacion: this.state.observacion,
          idUsuario: this.state.idUsuario,

          detalles: this.state.detalles,
        };

        alertKit.loading({
          message: 'Procesando petición...',
        });

        const response = await createTraslado(data);

        if (response instanceof SuccessReponse) {
          alertKit.success({
            title: 'Traslado',
            message: response.data,
          }, () => {
            this.setState(this.initial, async () => {
              await this.loadingData();
              this.refIdTipoTraslado.current.focus();
            });
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertKit.warning({
            title: 'Traslado',
            message: response.getMessage(),
          });
        }
      }
    });
  };

  handleBack = () => {
    this.setState({
      detalles: [],
      paso: 1
    })
  }

  handleClear = () => {
    alertKit.question({
      title: 'Traslado',
      message: '¿Está seguro de continuar, se va limpiar toda la información?',
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    }, async (accept) => {
      if (accept) {
        this.setState(this.initial, async () => {
          await this.loadingData();
          this.refIdTipoTraslado.current.focus();
        });
      }
    });
  }

  /*
    |--------------------------------------------------------------------------
    | Método de renderizado
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
    if (isEmpty(this.state.detalles)) {
      return (
        <TableRow>
          <TableCell className="text-center" colSpan="7">
            ¡No hay datos para mostrar!
          </TableCell>
        </TableRow>
      );
    }

    return this.state.detalles.map((item, index) => {
      const isLastRow = index === this.state.detalles.length - 1;

      const cantidad = item.lotes ? item.lotes.reduce((acum, lote) => acum + getNumber(lote.cantidadAjustar), 0) : Number(item.cantidad);

      const diferencia = item.actual - cantidad;

      return (
        <TableRow key={index}>
          <TableCell>
            <Button
              className="btn-outline-danger btn-sm"
              title="Anular"
              onClick={() => this.handleRemoveDetalle(item.idProducto)}
            >
              <i className="bi bi-trash"></i>
            </Button>
          </TableCell>
          <TableCell className="text-center">
            <Image
              default={images.noImage}
              src={item.imagen}
              alt={item.nombre}
              width={70}
            />
          </TableCell>
          <TableCell>
            {item.codigo}
            <br />
            {item.nombre}
          </TableCell>
          <TableCell>
            {
              item.lotes && (
                <small className="text-info">
                  <i className="bi bi-box-seam"></i> {item.lotes.length} lote(s)
                </small>
              )
            }

            {
              !item.lotes && (
                <Input
                  value={item.cantidad}
                  placeholder="0"
                  onChange={(event) =>
                    this.handleInputDetalle(event, item.idProducto)
                  }
                  onKeyDown={keyNumberFloat}
                  onKeyUp={(event) => this.handleFocusInputTable(event, isLastRow)}
                />
              )
            }
          </TableCell>
          <TableCell className={`${diferencia <= 0 ? "text-danger" : ""}`}>
            {rounded(diferencia)}
          </TableCell>
          <TableCell>
            {
              item.lotes && rounded(cantidad)
            }
            {
              !item.lotes && rounded(cantidad)
            }
          </TableCell>
          <TableCell>
            {item.unidad}
          </TableCell>
        </TableRow>
      );
    });
  }

  render() {
    return (
      <ContainerWrapper>

        <SpinnerView
          loading={this.state.initialLoad}
          message={this.state.initialMessage}
        />

        <Title
          title="Traslado"
          subTitle="CREAR"
          handleGoBack={() => this.props.history.goBack()}
        />

        <ModalLote
          ref={this.refModalLote}
          isOpen={this.state.isOpenLote}
          onClose={this.handleCloseLote}
          handleAdd={this.handleSaveLote}
        />

        {/* Condición para renderizar contenido específico según el estado 'paso' */}
        {this.state.paso === 1 && (
          <>
            {/* Mensaje y opciones para el primer paso */}
            <Row>
              <Column formGroup={true}>
                <p>
                  <i className="bi bi-card-list"></i> Defína alguna opciones
                  antes de continuar.
                </p>
              </Column>
            </Row>

            {/* Selección del tipo de traslado */}
            <Row>
              <Column formGroup={true}>
                <label>Seleccione el tipo de traslado:</label>

                <RadioButton
                  ref={this.refIdTipoTraslado}
                  id={"TT0001"}
                  value={"TT0001"}
                  name='ckTipoTraslado'
                  checked={this.state.idTipoTraslado === 'TT0001'}
                  onChange={this.handleOptionTipoTraslado}
                >
                  Entre almacenes
                </RadioButton>

                <RadioButton
                  id={"TT0002"}
                  value={"TT0002"}
                  name='ckTipoTraslado'
                  checked={this.state.idTipoTraslado === 'TT0002'}
                  onChange={this.handleOptionTipoTraslado}
                >
                  Entre sucursales
                </RadioButton>
              </Column>
            </Row>


            {/* Selección el motivo de traslado */}
            <Row>
              <Column formGroup={true}>
                <Select
                  label={"Seleccione el motivo del traslado:"}
                  ref={this.refIdMotivoTraslado}
                  value={this.state.idMotivoTraslado}
                  onChange={this.handleSelectMotivojuste}
                >
                  <option value="">-- Motivo traslado --</option>
                  {
                    this.state.motivoTraslado.map((item, index) => (
                      <option key={index} value={item.idMotivoTraslado}>
                        {item.nombre}
                      </option>
                    ))
                  }
                </Select>
              </Column>
            </Row>

            {
              // Verificar si el tipo de ajuste es 'TT0001'
              this.state.idTipoTraslado === 'TT0001' && (
                <>

                  {/* Selección el almacen de origen */}
                  <Row>
                    <Column formGroup={true}>
                      <Select
                        label={"Seleccione el almacen de origen:"}
                        ref={this.refIdAlmacenOriginInterno}
                        value={this.state.idAlmacenOrigenInterno}
                        onChange={this.handleSelectAlmacenOrigenInterno}
                      >
                        <option value="">-- Almacen --</option>
                        {this.state.almacenesOrigenInterno.map((item, index) => {
                          return (
                            <option key={index} value={item.idAlmacen}>
                              {item.nombre}
                            </option>
                          );
                        })}
                      </Select>
                    </Column>
                  </Row>

                  {/* Selección el almacen de destino */}
                  <Row>
                    <Column formGroup={true}>
                      <Select
                        label={"Seleccione el almacen de destino:"}
                        ref={this.refIdAlmacenDesitnoInterno}
                        value={this.state.idAlmacenDestinoInterno}
                        onChange={this.handleSelectAlmacenDestinoInterno}
                        disabled
                      >
                        <option value="">-- Almacen --</option>
                        {this.state.almacenesDestinoInterno.map((item, index) => {
                          return (
                            <option key={index} value={item.idAlmacen}>
                              {item.nombre}
                            </option>
                          );
                        })}
                      </Select>
                    </Column>
                  </Row>
                </>
              )
            }

            {
              // Verificar si el tipo de ajuste es 'TT0002'
              this.state.idTipoTraslado === 'TT0002' && (
                <>
                  <Row>
                    <Column formGroup={true}>
                      <p>
                        <i className="bi bi-arrow-bar-down"></i> Almacen de origin
                      </p>
                    </Column>
                  </Row>

                  {/* Selección el almacen de origen */}
                  <Row>
                    <Column formGroup={true}>
                      <Select
                        label={"Seleccione el almacen:"}
                        ref={this.refIdAlmacenOrigenExterno}
                        value={this.state.idAlmacenOrigenExterno}
                        onChange={this.handleSelectAlmacenOrigenExterno}
                      >
                        <option value="">-- Almacen --</option>
                        {
                          this.state.almacenes.map((item, index) => (
                            <option key={index} value={item.idAlmacen}>
                              {item.nombre}
                            </option>
                          ))
                        }
                      </Select>
                    </Column>
                  </Row>

                  <Row>
                    <Column formGroup={true}>
                      <p>
                        <i className="bi bi-arrow-bar-right"></i> Sucural y almacen de destino
                      </p>
                    </Column>
                  </Row>

                  {/* Selección la sucursal */}
                  <Row>
                    <Column className="col-md-6 col-12" formGroup={true}>
                      <Select
                        label={"Seleccione la sucursal:"}
                        ref={this.refIdSucursalExterno}
                        value={this.state.idSucursalExterno}
                        onChange={this.handleSelectSucursalExterno}>
                        <option value="">-- Sucursal --</option>
                        {
                          this.state.sucursales.map((item, index) => (
                            <option key={index} value={item.idSucursal}>
                              {item.nombre}
                            </option>
                          ))
                        }
                      </Select>
                    </Column>

                    <Column className="col-md-6 col-12" formGroup={true}>
                      <Select
                        label={"Seleccione el almacen:"}
                        ref={this.refIdAlmacenDestinoExterno}
                        value={this.state.idAlmacenDestinoExterno}
                        onChange={this.handleSelectAlmacenDestinoExterno}
                        disabled>
                        <option value="">-- Almacen --</option>
                        {
                          this.state.almacenesExterno.map((item, index) => (
                            <option key={index} value={item.idAlmacen}>
                              {item.nombre}
                            </option>
                          ))
                        }
                      </Select>
                    </Column>
                  </Row>
                </>
              )
            }


            {/* Botones de navegación */}
            <Row>
              <Column formGroup={true}>
                <Button
                  className="btn-info"
                  onClick={this.handleSiguiente}>
                  <i className="fa fa-arrow-right"></i> Siguiente
                </Button>{' '}
                <Button
                  className="btn-outline-danger"
                  onClick={() => this.props.history.goBack()}>
                  <i className="fa fa-close"></i> Cancelar
                </Button>
              </Column>
            </Row>
          </>
        )}

        {/* Condición para renderizar contenido específico según el estado 'paso' */}
        {
          this.state.paso === 2 && (
            <>
              <Row>
                <Column formGroup={true}>
                  <TableResponsive>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="table-secondary w-20 p-1 font-weight-normal ">
                            Tipo de Traslado:
                          </TableHead>
                          <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                            {this.state.idTipoTraslado === 'TT0001' ? (
                              <span>
                                Entre almacenes
                              </span>
                            ) : (
                              <span>
                                Entre sucursales
                              </span>
                            )}
                          </TableHead>
                        </TableRow>
                        {
                          this.state.idTipoTraslado === 'TT0001' && (
                            <>
                              <TableRow>
                                <TableHead className="table-secondary w-20 p-1 font-weight-normal ">
                                  Motivo ajuste:
                                </TableHead>
                                <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                                  {this.state.nombreMotivoAjuste}
                                </TableHead>
                              </TableRow>

                              <TableRow>
                                <TableHead className="table-secondary w-20 p-1 font-weight-normal ">
                                  Almacen de Origen:
                                </TableHead>
                                <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                                  {this.state.nombreAlmacenOrigenInterno}
                                </TableHead>
                              </TableRow>

                              <TableRow>
                                <TableHead className="table-secondary w-20 p-1 font-weight-normal ">
                                  Almacen de Destino:
                                </TableHead>
                                <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                                  {this.state.nombreAlmacenDestinoInterno}
                                </TableHead>
                              </TableRow>
                            </>
                          )
                        }
                        {
                          this.state.idTipoTraslado === 'TT0002' && (
                            <>
                              <TableRow>
                                <TableHead className="table-secondary w-20 p-1 font-weight-normal ">
                                  Almacen de Origen:
                                </TableHead>
                                <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                                  {this.state.nombreAlmacenOriginExterno}
                                </TableHead>
                              </TableRow>

                              <TableRow>
                                <TableHead className="table-secondary w-20 p-1 font-weight-normal ">
                                  Sucursal de Destino:
                                </TableHead>
                                <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                                  {this.state.nombreSucursalExterno}
                                </TableHead>
                              </TableRow>

                              <TableRow>
                                <TableHead className="table-secondary w-20 p-1 font-weight-normal ">
                                  Almacen de Destino:
                                </TableHead>
                                <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                                  {this.state.nombreAlmacenDestinoExterno}
                                </TableHead>
                              </TableRow>
                            </>
                          )
                        }
                      </TableHeader>
                    </Table>
                  </TableResponsive>
                </Column>
              </Row>

              <Row>
                <Column>
                  <SearchInput
                    ref={this.refProducto}
                    autoFocus={true}
                    label={"Filtrar por el código o nombre del producto:"}
                    placeholder="Filtrar productos..."
                    refValue={this.refValueProducto}
                    data={this.state.productos}
                    handleClearInput={this.handleClearInputProducto}
                    handleFilter={this.handleFilterProducto}
                    handleSelectItem={this.handleSelectItemProducto}
                    // renderItem={(value) => (
                    //   <>
                    //     {value.codigo} / {value.nombre}  <small>({value.categoria})</small>
                    //   </>
                    // )}

                    renderItem={(value) =>
                      <div className="d-flex align-items-center">
                        <Image
                          default={images.noImage}
                          src={value.imagen}
                          alt={value.nombre}
                          width={60}
                        />

                        <div className='ml-2'>
                          {value.codigo}
                          <br />
                          {value.nombre} <small>({value.categoria})</small>
                        </div>
                      </div>}
                  />
                </Column>
              </Row>

              <Row>
                <Column formGroup={true}>
                  <Input
                    label={"Ingrese alguna descripción para saber el motivo del ajuste:"}
                    placeholder="Ingrese una observación"
                    value={this.state.observacion}
                    onChange={this.handleInputObservacion}
                  />
                </Column>
              </Row>

              <Row>
                <Column>
                  <TableResponsive>
                    <TableTitle>Lista de productos:</TableTitle>
                    <Table className="table-striped table-bordered rounded">
                      <TableHeader>
                        <TableRow>
                          <TableHead width="5%">Quitar</TableHead>
                          <TableHead width="10%">Imagen</TableHead>
                          <TableHead width="30%">Clave/Nombre</TableHead>
                          <TableHead width="15%">Cantidad</TableHead>
                          <TableHead width="15%">Almacen Origen</TableHead>
                          <TableHead width="15%">Almacen Destino</TableHead>
                          <TableHead width="15%">Medida</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody ref={this.refTableBody}>
                        {this.generateBody()}
                      </TableBody>
                    </Table>
                  </TableResponsive>
                </Column>
              </Row>

              {/* Sección de botones de acción */}
              <Row>
                <Column>
                  <Button
                    className="btn-success"
                    onClick={this.handleSave}
                  >
                    <i className="fa fa-save"></i> Guardar
                  </Button>{' '}
                  <Button
                    className="btn-outline-light"
                    onClick={this.handleBack}
                  >
                    <i className="fa fa-arrow-left"></i> Atras
                  </Button>{' '}
                  <Button
                    className="btn-outline-light"
                    onClick={this.handleClear}
                  >
                    <i className="fa fa-refresh"></i> Limpiar
                  </Button>{' '}
                  <Button
                    className="btn-outline-danger"
                    onClick={() => this.props.history.goBack()}
                  >
                    <i className="fa fa-close"></i> Cancelar
                  </Button>
                </Column>
              </Row>
            </>
          )
        }
      </ContainerWrapper>
    );
  }
}

/**
 *
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};


TrasladorCrear.propTypes = {
  token: PropTypes.shape({
    project: PropTypes.shape({
      idSucursal: PropTypes.string
    }),
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string
    })
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func
  })
}


/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */

const ConnectedAjusteCrear = connect(mapStateToProps, null)(TrasladorCrear);

export default ConnectedAjusteCrear;
