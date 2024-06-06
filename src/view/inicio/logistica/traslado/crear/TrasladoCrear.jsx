import React from 'react';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isEmpty,
  keyNumberFloat,
  rounded,
  spinnerLoading,
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
      initialLoad: true,
      initialMessage: 'Cargando datos...',

      paso: 1,

      producto: null,
      cantidad: 0,
      costo: 0,
      filtrar: '',
      productos: [],
      loadingProducto: false,

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

      detalle: [],

      nombreMotivoAjuste: '',
      nombreAlmacenOrigenInterno: '',
      nombreAlmacenDestinoInterno: '',
      nombreAlmacenOriginExterno: '',
      nombreSucursalExterno: '',
      nombreAlmacenDestinoExterno: '',

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.initial = { ...this.state }

    this.refIdTipoTraslado = React.createRef();
    this.refIdMotivoTraslado = React.createRef();

    this.refIdAlmacen = React.createRef();

    this.refIdAlmacenOriginInterno = React.createRef();
    this.refIdAlmacenDesitnoInterno = React.createRef();

    this.refIdAlmacenOrigenExterno = React.createRef();
    this.refIdSucursalExterno = React.createRef();
    this.refIdAlmacenDestinoExterno = React.createRef();

    this.refProducto = React.createRef();

    this.inputRefs = [];

    this.selectItemProducto = false;

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

  agregarProducto(producto) {
    const exists = this.state.detalle.find((item) => item.idProducto === producto.idProducto)

    if (exists) {
      alertWarning('Ajuste', 'El producto ya existe en la lista.');
      return;
    }

    const data = {
      idProducto: producto.idProducto,
      nombre: producto.nombre,
      cantidad: 0,
      actual: producto.cantidad,
      unidad: producto.unidad,
    };

    this.inputRefs.push(React.createRef());

    this.setState((prevState) => ({
      detalle: [...prevState.detalle, data],
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

  handleClearInputProducto = async () => {
    await this.setStateAsync({
      productos: [],
      filtrar: '',
      producto: null,
      loadingProducto: false,
    });

    this.selectItemProducto = false;
  };

  handleFilterProducto = async (event) => {
    const searchWord = this.selectItemProducto ? '' : event.target.value;
    await this.setStateAsync({ producto: null, filtrar: searchWord });

    this.selectItemProducto = false;
    if (searchWord.length === 0) {
      await this.setStateAsync({ productos: [] });
      return;
    }

    if (this.state.loadingProducto) return;

    await this.setStateAsync({ loadingProducto: true });

    const params = {
      idAlmacen: this.state.idTipoTraslado === "TT0001" ? this.state.idAlmacenOrigenInterno : this.state.idAlmacenOrigenExterno,
      filtrar: searchWord,
    }

    const productos = await this.fetchFiltrarProducto(params);

    // Filtrar productos por tipoProducto !== "SERVICIO"
    const filteredProductos = productos.filter((item) => item.tipoProducto !== 'SERVICIO');

    await this.setStateAsync({
      productos: filteredProductos,
      loadingProducto: false,
    });
  }

  handleSelectItemProducto = async (value) => {
    await this.setStateAsync({
      producto: value,
      filtrar: value.nombre,
      productos: [],
    });
    this.selectItemProducto = true;

    this.agregarProducto(value);
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
      alertWarning('Traslado', 'Seleccione el tipo de traslado.', () => {
        this.refIdTipoTraslado.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idMotivoTraslado)) {
      alertWarning('Traslado', 'Seleccione el motivo traslado.', () => {
        this.refIdMotivoTraslado.current.focus();
      });
      return;
    }

    if (this.state.idTipoTraslado === 'TT0001' && isEmpty(this.state.idAlmacenOrigenInterno)) {
      alertWarning('Traslado', 'Seleccione el almacen origin.', () => {
        this.refIdAlmacenOriginInterno.current.focus();
      });
      return;
    }

    if (this.state.idTipoTraslado === 'TT0001' && isEmpty(this.state.idAlmacenDestinoInterno)) {
      alertWarning('Traslado', 'Seleccione el almacen destino.', () => {
        this.refIdAlmacenDesitnoInterno.current.focus();
      });
      return;
    }

    if (this.state.idTipoTraslado === 'TT0002' && isEmpty(this.state.idAlmacenOrigenExterno)) {
      alertWarning('Traslado', 'Seleccione el almacen origin.', () => {
        this.refIdAlmacenOrigenExterno.current.focus();
      });
      return;
    }

    if (this.state.idTipoTraslado === 'TT0002' && isEmpty(this.state.idSucursalExterno)) {
      alertWarning('Traslado', 'Seleccione la sucursal.', () => {
        this.refIdSucursalExterno.current.focus();
      });
      return;
    }

    if (this.state.idTipoTraslado === 'TT0002' && isEmpty(this.state.idAlmacenDestinoExterno)) {
      alertWarning('Traslado', 'Seleccione el almcen de destino', () => {
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
    const detalle = this.state.detalle.filter((item) => item.idProducto !== idProducto);
    this.setState({ detalle });
  }

  handleInputDetalle = (event, idProducto) => {
    const { value } = event.target;
    this.setState((prevState) => ({
      detalle: prevState.detalle.map((item) =>
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

  handleSave = () => {
    if (isEmpty(this.state.detalle)) {
      alertWarning('Traslado', 'Agregue productos en la lista para continuar.', () => {
        this.refProducto.current.focus();
      });
      return;
    }

    alertDialog('Traslado', '¿Está seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idTipoTraslado: this.state.idTipoTraslado,
          idMotivoTraslado: this.state.idMotivoTraslado,
          idAlmacenOrigen: this.state.idTipoTraslado === 'TT0001' ? this.state.idAlmacenOrigenInterno : this.state.idAlmacenOrigenExterno,
          idAlmacenDestino: this.state.idTipoTraslado === 'TT0001' ? this.state.idAlmacenDestinoInterno : this.state.idAlmacenDestinoExterno,
          idSucursalDestino: this.state.idSucursalExterno,
          idSucursal: this.state.idSucursal,
          observacion: this.state.observacion,
          estado: 1,
          idUsuario: this.state.idUsuario,

          detalle: this.state.detalle,
        };

        alertInfo('Traslado', 'Procesando petición...');

        const response = await createTraslado(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Traslado', response.data, () => {
            this.setState(this.initial, async () => {
              await this.loadingData();
              this.refIdTipoTraslado.current.focus();
            });
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertWarning('Traslado', response.getMessage());
        }
      }
    });
  };

  handleBack = () => {
    this.setState({
      detalle: [],
      paso: 1
    })
  }

  handleClear = () => {
    alertDialog('Traslado', '¿Está seguro de continuar, se va limpiar toda la información?', async (accept) => {
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

  generarBody() {
    if (isEmpty(this.state.detalle)) {
      return (
        <tr className="text-center">
          <td colSpan="6">¡No hay productos agregados!</td>
        </tr>
      );
    }

    return this.state.detalle.map((item, index) => {
      const isLastRow = index === this.state.detalle.length - 1;


      const diferencia = item.actual - parseFloat(item.cantidad);

      return (
        <tr key={index}>
          <td>
            <button
              className="btn btn-outline-danger btn-sm"
              title="Anular"
              onClick={() => this.handleRemoveDetalle(item.idProducto)}
            >
              <i className="bi bi-trash"></i>
            </button>
          </td>
          <td>{item.nombre}</td>
          <td>
            <input
              type="text"
              className="form-control"
              value={item.cantidad}
              onChange={(event) =>
                this.handleInputDetalle(event, item.idProducto)
              }
              onKeyDown={keyNumberFloat}
              onKeyUp={(event) => this.handleFocusInputTable(event, isLastRow)}
            />
          </td>
          <td className={`${diferencia <= 0 ? "text-danger" : ""}`}>{rounded(diferencia)}</td>
          <td>{rounded(item.cantidad)}</td>
          <td>{item.unidad}</td>
        </tr>
      );
    });
  }

  render() {
    return (
      // Contenedor principal utilizando un componente llamado ContainerWrapper

      <ContainerWrapper>

        {/* Mostrar un spinner de carga si initialLoad es verdadero */}

        {this.state.initialLoad && spinnerLoading(this.state.initialMessage)}

        {/* Encabezado de la página */}
        <div className="row">
          <div className="col">
            <div className="form-group">
              <h5>
                <span role="button" onClick={() => this.props.history.goBack()}>
                  <i className="bi bi-arrow-left-short"></i>
                </span>{' '}
                Traslado
                <small className="text-secondary"> CREAR</small>
              </h5>
            </div>
          </div>
        </div>

        {/* Condición para renderizar contenido específico según el estado 'paso' */}
        {this.state.paso === 1 && (
          <>
            {/* Mensaje y opciones para el primer paso */}
            <div className="row">
              <div className="col">
                <div className="form-group">
                  <p>
                    <i className="bi bi-card-list"></i> Defína alguna opciones
                    antes de continuar.
                  </p>
                </div>
              </div>
            </div>

            {/* Selección del tipo de traslado */}
            <div className="row">
              <div className="col">
                <div className="form-group">
                  <label>Seleccione el tipo de traslado:</label>
                  <div className="form-check ">
                    <input
                      className="form-check-input"
                      type="radio"
                      ref={this.refIdTipoTraslado}
                      name="tipoAjuste"
                      id="TT0001"
                      value="TT0001"
                      checked={this.state.idTipoTraslado === 'TT0001'}
                      onChange={this.handleOptionTipoTraslado}
                    />
                    <label className="form-check-label" htmlFor="TT0001">
                      Entre almacenes
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="tipoAjuste"
                      id="TT0002"
                      value="TT0002"
                      checked={this.state.idTipoTraslado === 'TT0002'}
                      onChange={this.handleOptionTipoTraslado}
                    />
                    <label className="form-check-label" htmlFor="TT0002">
                      Entre sucursales
                    </label>
                  </div>
                </div>
              </div>
            </div>


            {/* Selección el motivo de traslado */}
            <div className="row">
              <div className="col">
                <div className="form-group">
                  <label>Seleccione el motivo del traslado:</label>
                  <select
                    className="form-control"
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
                  </select>
                </div>
              </div>
            </div>

            {
              // Verificar si el tipo de ajuste es 'TT0001'
              this.state.idTipoTraslado === 'TT0001' && (
                <>

                  {/* Selección el almacen de origen */}
                  <div className="row">
                    <div className="col">
                      <div className="form-group">
                        <label>Seleccione el almacen de origen:</label>
                        <select
                          className="form-control"
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
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Selección el almacen de destino */}
                  <div className="row">
                    <div className="col">
                      <div className="form-group">
                        <label>Seleccione el almacen de destino:</label>
                        <select
                          className="form-control"
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
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )
            }

            {
              // Verificar si el tipo de ajuste es 'TT0002'
              this.state.idTipoTraslado === 'TT0002' && (
                <>
                  <div className="row">
                    <div className="col">
                      <div className="form-group">
                        <p>
                          <i className="bi bi-arrow-bar-down"></i> Almacen de origin
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Selección el almacen de origen */}
                  <div className="row">
                    <div className="col">
                      <div className="form-group">
                        <label>Seleccione el almacen:</label>
                        <select
                          className="form-control"
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
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col">
                      <div className="form-group">
                        <p>
                          <i className="bi bi-arrow-bar-right"></i> Sucural y almacen de destino
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Selección la sucursal */}
                  <div className="row">
                    <div className="col-md-6 col-12">
                      <div className="form-group">
                        <label>Seleccione la sucursal:</label>
                        <select
                          className="form-control"
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
                        </select>
                      </div>
                    </div>

                    <div className="col-md-6 col-12">
                      <div className="form-group">
                        <label>Seleccione el almacen:</label>
                        <select
                          className="form-control"
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
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )
            }


            {/* Botones de navegación */}
            <div className="row">
              <div className="col">
                <div className="form-group">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={this.handleSiguiente}>
                    <i className="fa fa-arrow-right"></i> Siguiente
                  </button>{' '}
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => this.props.history.goBack()}>
                    <i className="fa fa-close"></i> Cancelar
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Condición para renderizar contenido específico según el estado 'paso' */}
        {
          this.state.paso === 2 && (
            <>
              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <div className="table-responsive">
                      <table width="100%">
                        <thead>
                          <tr>
                            <th className="table-secondary w-20 p-1 font-weight-normal ">
                              Tipo de Traslado:
                            </th>
                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                              {this.state.idTipoTraslado === 'TT0001' ? (
                                <span>
                                  Entre almacenes
                                </span>
                              ) : (
                                <span>
                                  Entre sucursales
                                </span>
                              )}
                            </th>
                          </tr>
                          {
                            this.state.idTipoTraslado === 'TT0001' && (
                              <>
                                <tr>
                                  <th className="table-secondary w-20 p-1 font-weight-normal ">
                                    Motivo ajuste:
                                  </th>
                                  <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                                    {this.state.nombreMotivoAjuste}
                                  </th>
                                </tr>

                                <tr>
                                  <th className="table-secondary w-20 p-1 font-weight-normal ">
                                    Almacen de Origen:
                                  </th>
                                  <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                                    {this.state.nombreAlmacenOrigenInterno}
                                  </th>
                                </tr>

                                <tr>
                                  <th className="table-secondary w-20 p-1 font-weight-normal ">
                                    Almacen de Destino:
                                  </th>
                                  <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                                    {this.state.nombreAlmacenDestinoInterno}
                                  </th>
                                </tr>
                              </>
                            )
                          }
                          {
                            this.state.idTipoTraslado === 'TT0002' && (
                              <>
                                <tr>
                                  <th className="table-secondary w-20 p-1 font-weight-normal ">
                                    Almacen de Origen:
                                  </th>
                                  <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                                    {this.state.nombreAlmacenOriginExterno}
                                  </th>
                                </tr>

                                <tr>
                                  <th className="table-secondary w-20 p-1 font-weight-normal ">
                                    Sucursal de Destino:
                                  </th>
                                  <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                                    {this.state.nombreSucursalExterno}
                                  </th>
                                </tr>

                                <tr>
                                  <th className="table-secondary w-20 p-1 font-weight-normal ">
                                    Almacen de Destino:
                                  </th>
                                  <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                                    {this.state.nombreAlmacenDestinoExterno}
                                  </th>
                                </tr>
                              </>
                            )
                          }
                        </thead>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col">
                  <label>Filtrar por el código o nombre del producto::</label>
                  <SearchInput
                    autoFocus={true}
                    showLeftIcon={false}
                    placeholder="Filtrar productos..."
                    refValue={this.refProducto}
                    value={this.state.filtrar}
                    data={this.state.productos}
                    handleClearInput={this.handleClearInputProducto}
                    handleFilter={this.handleFilterProducto}
                    handleSelectItem={this.handleSelectItemProducto}
                    renderItem={(value) => (
                      <>
                        {value.nombre} / <small>{value.categoria}</small>
                      </>
                    )}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col">
                  <label>
                    Ingrese alguna descripción para saber el motivo del ajuste:
                  </label>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ingrese una observación"
                      value={this.state.observacion}
                      onChange={this.handleInputObservacion}
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col">
                  <label>Lista de productos:</label>
                  <div className="table-responsive">
                    <table className="table table-striped table-bordered rounded">
                      <thead>
                        <tr>
                          <th width="5%">Quitar</th>
                          <th width="30%">Clave/Nombre</th>
                          <th width="15%">Nueva Existencia</th>
                          <th width="15%">Almacen Origen</th>
                          <th width="15%">Almacen Destino</th>
                          <th width="15%">Medida</th>
                        </tr>
                      </thead>
                      <tbody>{this.generarBody()}</tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Sección de botones de acción */}
              <div className="row">
                <div className="col">
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={this.handleSave}
                  >
                    <i className="fa fa-save"></i> Guardar
                  </button>{' '}
                  <button
                    type="button"
                    className="btn btn-outline-warning"
                    onClick={this.handleBack}
                  >
                    <i className="fa fa-arrow-left"></i> Atras
                  </button>{' '}
                  <button
                    type="button"
                    className="btn btn-outline-info"
                    onClick={this.handleClear}
                  >
                    <i className="fa fa-trash"></i> Limpiar
                  </button>{' '}
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => this.props.history.goBack()}
                  >
                    <i className="fa fa-close"></i> Cancelar
                  </button>
                </div>
              </div>
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
