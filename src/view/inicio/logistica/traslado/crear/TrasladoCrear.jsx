import React from 'react';
import {
  formatDate,
  getNumber,
  isEmpty,
  keyNumberFloat,
  rounded,
  validateNumericInputs,
} from '@/helper/utils.helper';
import PropTypes from 'prop-types';
import ContainerWrapper from '@/components/ui/container-wrapper';
import CustomComponent from '@/components/CustomComponent';
import SuccessReponse from '@/model/class/response';
import ErrorResponse from '@/model/class/error-response';
import {
  comboAlmacen,
  comboMotivoTraslado,
  comboSucursal,
  createTraslado,
  filtrarAlmacenProducto,
} from '@/network/rest/principal.network';
import { CANCELED } from '@/constants/requestStatus';
import { connect } from 'react-redux';
import SearchInput from '@/components/SearchInput';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { SpinnerView } from '@/components/Spinner';
import Title from '@/components/Title';
import RadioButton from '@/components/RadioButton';
import Image from '@/components/Image';
import { images } from '@/helper';
import { SERVICIO } from '@/model/types/tipo-producto';
import { alertKit } from 'alert-kit';
import { cn } from '@/lib/utils';
import { ENTRE_ALMACENES, ENTRE_SUCURSALES } from '@/model/types/tipo-traslado';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
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
      initialMessage: "Cargando datos...",

      // Atributos principales
      paso: 1,

      producto: null,
      cantidad: 0,
      costo: 0,

      productos: [],

      idTipoTraslado: "",

      idMotivoTraslado: "",
      motivoTraslado: [],

      idAlmacenOrigenInterno: "",
      idAlmacenDestinoInterno: "",

      almacenes: [],
      almacenesExterno: [],
      almacenesOrigenInterno: [],
      almacenesDestinoInterno: [],

      idAlmacenOrigenExterno: "",
      idSucursalExterno: "",
      idAlmacenDestinoExterno: "",

      observacion: "S/N",

      sucursales: [],

      detalles: [],

      nombreMotivoTraslado: "",
      nombreAlmacenOrigenInterno: "",
      nombreAlmacenDestinoInterno: "",
      nombreAlmacenOriginExterno: "",
      nombreSucursalExterno: "",
      nombreAlmacenDestinoExterno: "",

      // Id principales
      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.usuario.idUsuario,
    };

    this.initial = { ...this.state };

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
      this.fetchComboSucursal(),
    ]);

    const newSucursal = sucursales.filter(
      (item) => item.idSucursal !== this.state.idSucursal,
    );

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

  clearView() {
    this.setState(this.initial, async () => {
      await this.loadingData();
      this.refIdTipoTraslado.current.focus();
    });
  }

  addProducto(producto) {
    const exists = this.state.detalles.find(
      (item) => item.idProducto === producto.idProducto,
    );

    if (exists) {
      alertKit.warning({
        title: "Traslado",
        message: "El producto ya existe en la lista.",
      });
      return;
    }

    const data = {
      idProducto: producto.idProducto,
      codigo: producto.codigo,
      nombre: producto.nombre,
      imagen: producto.imagen,
      unidad: producto.unidad,
      inventarioDetalles: producto.inventarioDetalles.map((item) => ({
        ...item,
        cantidadTrasladar: "",
      })),
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
  // Eventos para el traslado
  //------------------------------------------------------------------------------------------

  handleOptionTipoTraslado = (event) => {
    this.setState({
      idTipoTraslado: event.target.value,
      almacenesOrigenInterno: this.state.almacenes,
    });
  };

  handleSelectMotivojuste = (event) => {
    this.setState({ idMotivoTraslado: event.target.value });
  };

  handleSelectAlmacenOrigenInterno = (event) => {
    const almacenesDestinoInterno = this.state.almacenesOrigenInterno.filter(
      (item) => item.idAlmacen !== event.target.value,
    );

    const idAlmacenDestinoInterno =
      almacenesDestinoInterno.length === 1
        ? almacenesDestinoInterno[0].idAlmacen
        : "";

    this.setState({
      idAlmacenOrigenInterno: event.target.value,
      idAlmacenDestinoInterno,
      almacenesDestinoInterno,
    });

    if (event.target.value === "") {
      this.refIdAlmacenDesitnoInterno.current.disabled = true;
    } else {
      this.refIdAlmacenDesitnoInterno.current.disabled = false;
    }
  };

  handleSelectAlmacenDestinoInterno = (event) => {
    this.setState({ idAlmacenDestinoInterno: event.target.value });
  };

  handleSelectAlmacenOrigenExterno = (event) => {
    this.setState({ idAlmacenOrigenExterno: event.target.value });
  };

  handleSelectSucursalExterno = async (event) => {
    this.setState({
      initialLoad: true,
      idSucursalExterno: event.target.value,
      idAlmacenDestinoExterno: "",
    });

    const params = {
      idSucursal: event.target.value,
    };

    const almacenes = await this.fetchComboAlmacen(params);

    this.setState({
      almacenesExterno: almacenes,
      initialLoad: false,
    });

    if (event.target.value === "") {
      this.refIdAlmacenDestinoExterno.current.disabled = true;
    } else {
      this.refIdAlmacenDestinoExterno.current.disabled = false;
    }
  };

  handleSelectAlmacenDestinoExterno = (event) => {
    this.setState({ idAlmacenDestinoExterno: event.target.value });
  };

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
    this.setState({ producto: null });

    if (isEmpty(searchWord)) {
      this.setState({ productos: [] });
      return;
    }

    const params = {
      idAlmacen:
        this.state.idTipoTraslado === ENTRE_ALMACENES
          ? this.state.idAlmacenOrigenInterno
          : this.state.idAlmacenOrigenExterno,
      filtrar: searchWord,
    };

    const productos = await this.fetchFiltrarProducto(params);

    // Filtrar productos por tipoProducto !== "SERVICIO"
    const filteredProductos = productos.filter(
      (item) => item.idTipoProducto !== SERVICIO,
    );

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
      this.addProducto(value);
    });
  };

  handleSiguiente = () => {
    if (isEmpty(this.state.idTipoTraslado)) {
      alertKit.warning({
        title: "Traslado",
        message: "Seleccione el tipo de traslado.",
      }, () => {
        this.refIdTipoTraslado.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idMotivoTraslado)) {
      alertKit.warning({
        title: "Traslado",
        message: "Seleccione el motivo traslado.",
      }, () => {
        this.refIdMotivoTraslado.current.focus();
      });
      return;
    }

    if (
      this.state.idTipoTraslado === ENTRE_ALMACENES &&
      isEmpty(this.state.idAlmacenOrigenInterno)
    ) {
      alertKit.warning({
        title: "Traslado",
        message: "Seleccione el almacen origin.",
      }, () => {
        this.refIdAlmacenOriginInterno.current.focus();
      });
      return;
    }

    if (
      this.state.idTipoTraslado === ENTRE_ALMACENES &&
      isEmpty(this.state.idAlmacenDestinoInterno)
    ) {
      alertKit.warning({
        title: "Traslado",
        message: "Seleccione el almacen destino.",
      }, () => {
        this.refIdAlmacenDesitnoInterno.current.focus();
      });
      return;
    }

    if (
      this.state.idTipoTraslado === ENTRE_SUCURSALES &&
      isEmpty(this.state.idAlmacenOrigenExterno)
    ) {
      alertKit.warning({
        title: "Traslado",
        message: "Seleccione el almacen origin.",
      }, () => {
        this.refIdAlmacenOrigenExterno.current.focus();
      });
      return;
    }

    if (
      this.state.idTipoTraslado === ENTRE_SUCURSALES &&
      isEmpty(this.state.idSucursalExterno)
    ) {
      alertKit.warning({
        title: "Traslado",
        message: "Seleccione la sucursal.",
      }, () => {
        this.refIdSucursalExterno.current.focus();
      });
      return;
    }

    if (
      this.state.idTipoTraslado === ENTRE_SUCURSALES &&
      isEmpty(this.state.idAlmacenDestinoExterno)
    ) {
      alertKit.warning({
        title: "Traslado",
        message: "Seleccione el almacen destino.",
      }, () => {
        this.refIdAlmacenDestinoExterno.current.focus();
      });
      return;
    }

    if (this.state.idTipoTraslado === ENTRE_ALMACENES) {
      this.setState({
        nombreMotivoTraslado:
          this.refIdMotivoTraslado.current.options[
            this.refIdMotivoTraslado.current.selectedIndex
          ].innerText,
        nombreAlmacenOrigenInterno:
          this.refIdAlmacenOriginInterno.current.options[
            this.refIdAlmacenOriginInterno.current.selectedIndex
          ].innerText,
        nombreAlmacenDestinoInterno:
          this.refIdAlmacenDesitnoInterno.current.options[
            this.refIdAlmacenDesitnoInterno.current.selectedIndex
          ].innerText,
        paso: 2,
      });
    } else {
      this.setState({
        nombreMotivoTraslado:
          this.refIdMotivoTraslado.current.options[
            this.refIdMotivoTraslado.current.selectedIndex
          ].innerText,
        nombreAlmacenOriginExterno:
          this.refIdAlmacenOrigenExterno.current.options[
            this.refIdAlmacenOrigenExterno.current.selectedIndex
          ].innerText,
        nombreSucursalExterno:
          this.refIdSucursalExterno.current.options[
            this.refIdSucursalExterno.current.selectedIndex
          ].innerText,
        nombreAlmacenDestinoExterno:
          this.refIdAlmacenDestinoExterno.current.options[
            this.refIdAlmacenDestinoExterno.current.selectedIndex
          ].innerText,
        paso: 2,
      });
    }
  };

  handleInputObservacion = (event) => {
    this.setState({
      observacion: event.target.value,
    });
  };

  handleRemoveDetalle = (idProducto) => {
    const detalles = this.state.detalles.filter(
      (item) => item.idProducto !== idProducto,
    );
    this.setState({ detalles });
  };

  handleInputDetalle = (event, idKardex) => {
    const { value } = event.target;

    this.setState((prevState) => ({
      detalles: prevState.detalles.map((item) => ({
        ...item,
        inventarioDetalles: item.inventarioDetalles.map((invd) => {
          if (invd.idKardex === idKardex) {
            return {
              ...invd,
              cantidadTrasladar: value,
            };
          }
          return invd;
        }),
      })),
    }));
  };

  handleFocusInputTable = (event, isLastRow) => {
    if (event.key === "Enter" && !isLastRow) {
      const nextInput =
        event.target.parentElement.parentElement.nextElementSibling.querySelector(
          "input",
        );
      nextInput.focus();
    }

    if (event.key === "Enter" && isLastRow) {
      const firstInput =
        event.target.parentElement.parentElement.parentElement.querySelector(
          "input",
        );
      firstInput.focus();
    }
  };


  //------------------------------------------------------------------------------------------
  // Acciones de proceso de registro
  //------------------------------------------------------------------------------------------
  handleSave = async () => {
    const {
      idTipoTraslado,
      idMotivoTraslado,
      idAlmacenOrigenInterno,
      idAlmacenOrigenExterno,
      idAlmacenDestinoInterno,
      idAlmacenDestinoExterno,
      idSucursalExterno,
      idSucursal,
      observacion,
      idUsuario,
      detalles
    } = this.state

    if (isEmpty(detalles)) {
      alertKit.warning({
        title: "Traslado",
        message: "Agregue productos en la lista para continuar.",
      }, () => {
        this.refValueProducto.current.focus();
      });
      return;
    }
    if (!detalles.some((item) =>
      item.inventarioDetalles.some(
        (invd) => getNumber(invd.cantidadTrasladar) > 0
      )
    )) {
      alertKit.warning({
        title: "Traslado",
        message: "Hay cantidades en lista de productos con valor 0 o vacío.",
      }, () => {
        validateNumericInputs(this.refTableBody);
      });
      return;
    }

    const detallesFiltrados = detalles
      .map(item => {
        const detallesValidos = item.inventarioDetalles
          .filter(invd => getNumber(invd.cantidadTrasladar) > 0)
          .map(invd => ({
            ...invd,
            cantidadTrasladar: getNumber(invd.cantidadTrasladar)
          }));

        return {
          ...item,
          inventarioDetalles: detallesValidos
        };
      })
      .filter(item => item.inventarioDetalles.length > 0);

    if (isEmpty(detallesFiltrados)) {
      alertKit.warning({
        title: "Traslado",
        message: "No hay cantidades válidas para trasladar.",
      });
      return;
    }

    const accept = await alertKit.question({
      title: "Traslado",
      message: "¿Está seguro de continuar?",
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      const data = {
        idTipoTraslado: idTipoTraslado,
        idMotivoTraslado: idMotivoTraslado,
        idAlmacenOrigen:
          idTipoTraslado === ENTRE_ALMACENES
            ? idAlmacenOrigenInterno
            : idAlmacenOrigenExterno,
        idAlmacenDestino:
          idTipoTraslado === ENTRE_ALMACENES
            ? idAlmacenDestinoInterno
            : idAlmacenDestinoExterno,
        idSucursalDestino: idSucursalExterno,
        idSucursal: idSucursal,
        observacion: observacion,
        idUsuario: idUsuario,

        detalles: detallesFiltrados,
      };

      alertKit.loading({
        message: "Procesando petición...",
      });

      const response = await createTraslado(data);

      if (response instanceof SuccessReponse) {
        alertKit.success({
          title: "Traslado",
          message: response.data,
          onClose: () => {
            this.clearView();
          },
        });
      }

      if (response instanceof ErrorResponse) {
        if (response.getType() === CANCELED) return;

        alertKit.warning({
          title: "Traslado",
          message: response.getMessage(),
        });
      }
    }
  };

  handleBack = () => {
    this.setState({
      detalles: [],
      paso: 1,
    });
  };

  handleClear = async () => {
    const accept = await alertKit.question({
      title: "Traslado",
      message:
        "¿Está seguro de continuar, se va limpiar toda la información?",
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      this.clearView();
    }
  };

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
    const { detalles } = this.state;

    if (isEmpty(detalles)) {
      return (
        <tr>
          <td className="text-center p-3" colSpan={7}>
            ¡No hay datos para mostrar!
          </td>
        </tr>
      );
    }

    return detalles.map((item, index) => {
      return (
        <React.Fragment key={`producto-${item.idProducto}`}>
          {/* FILA PRINCIPAL (igual que antes) */}
          <tr>
            <td className="text-center">
              <Button
                className="btn-outline-danger btn-sm"
                title="Anular"
                onClick={() => this.handleRemoveDetalle(item.idProducto)}
              >
                <i className="bi bi-trash"></i>
              </Button>
            </td>

            <td className="text-center">
              <div className="flex justify-center py-3">
                <Image
                  default={images.noImage}
                  src={item.imagen}
                  alt={item.nombre}
                  overrideClass="w-24 h-24 object-contain"
                />
              </div>
            </td>

            <td colSpan={5}>
              <span className="font-mono text-sm text-gray-500"> {item.codigo}</span>
              <br />
              <span className="font-medium">{item.nombre}</span>
            </td>
          </tr>

          {/* CARDS POR ALMACÉN (en lugar de subtabla) */}
          {
            item.inventarioDetalles?.map((invd, index1) => {
              const isLastRow = index1 === item.inventarioDetalles.length - 1;

              const stockOriginal = getNumber(invd.cantidad);
              const trasladar = getNumber(invd.cantidadTrasladar);

              // Stock que queda
              const stockRestante =
                trasladar > 0 ? stockOriginal - trasladar : stockOriginal;

              // Cantidad a trasladar (destino)
              const destino =
                trasladar > 0 ? trasladar : 0;

              const isStockInsuficiente = stockRestante < 0;

              return (
                <tr key={`detalle-${invd.idKardex}`}>
                  <td colSpan={2} className="py-3"></td>
                  <td className="py-3">
                    {
                      <div className="text-sm space-y-1">
                        {invd.lote && (
                          <div className="font-mono text-gray-500">
                            <strong>Lote:</strong> {invd.lote}
                          </div>
                        )}

                        {invd.fechaVencimiento && (
                          <div className="font-mono text-gray-500">
                            <strong>Vence:</strong> {formatDate(invd.fechaVencimiento)}
                          </div>
                        )}

                        {invd.ubicacion && (
                          <div className="font-mono text-gray-500">
                            <strong>Ubicación:</strong> {invd.ubicacion}
                          </div>
                        )}
                      </div>
                    }
                  </td>
                  <td className="text-center py-3">
                    <Input
                      value={invd.cantidadTrasladar}
                      placeholder="0"
                      onChange={(event) =>
                        this.handleInputDetalle(event, invd.idKardex)
                      }
                      onKeyDown={keyNumberFloat}
                      onKeyUp={(event) =>
                        this.handleFocusInputTable(event, isLastRow)
                      }
                    />
                  </td>
                  {/* Cantidad restante */}
                  <td className={cn(
                    "text-center py-3",
                    stockRestante <= 0 && "text-red-700"
                  )}>
                    {rounded(stockRestante)}
                  </td>

                  {/* Almacén destino */}
                  <td
                    className={cn(
                      "text-center py-3",
                      isStockInsuficiente && "text-red-600"
                    )}
                  >
                    {rounded(destino)}
                  </td>

                  <td className="text-center py-3">{item.unidad}</td>
                </tr>
              );
            })
          }
        </React.Fragment>
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


        {/* Condición para renderizar contenido específico según el estado 'paso' */}
        {this.state.paso === 1 && (
          <>
            {/* Mensaje y opciones para el primer paso */}
            <div className="felx mb-3">
              <p>
                <i className="bi bi-card-list"></i> Defína alguna opciones antes de continuar.
              </p>
            </div>

            {/* Selección del tipo de traslado */}
            <div className="flex flex-col gap-1 mb-3">
              <label>Seleccione el tipo de traslado:</label>

              <RadioButton
                ref={this.refIdTipoTraslado}
                id={ENTRE_ALMACENES}
                value={ENTRE_ALMACENES}
                name="ckTipoTraslado"
                checked={this.state.idTipoTraslado === ENTRE_ALMACENES}
                onChange={this.handleOptionTipoTraslado}
              >
                Entre almacenes
              </RadioButton>

              <RadioButton
                id={ENTRE_SUCURSALES}
                value={ENTRE_SUCURSALES}
                name="ckTipoTraslado"
                checked={this.state.idTipoTraslado === ENTRE_SUCURSALES}
                onChange={this.handleOptionTipoTraslado}
              >
                Entre sucursales
              </RadioButton>
            </div>

            {/* Selección el motivo de traslado */}
            <div className="flex flex-col mb-3">
              <Select
                label={'Seleccione el motivo del traslado:'}
                ref={this.refIdMotivoTraslado}
                value={this.state.idMotivoTraslado}
                onChange={this.handleSelectMotivojuste}
              >
                <option value="">-- Motivo traslado --</option>
                {this.state.motivoTraslado.map((item, index) => (
                  <option key={index} value={item.idMotivoTraslado}>
                    {item.nombre}
                  </option>
                ))}
              </Select>
            </div>

            {
              // Verificar si el tipo de traslado es 'TT0001'
              this.state.idTipoTraslado === ENTRE_ALMACENES && (
                <>
                  {/* Selección el almacen de origen */}
                  <div className="mb-3">
                    <Select
                      label={'Seleccione el almacen de origen:'}
                      ref={this.refIdAlmacenOriginInterno}
                      value={this.state.idAlmacenOrigenInterno}
                      onChange={this.handleSelectAlmacenOrigenInterno}
                    >
                      <option value="">-- Almacen --</option>
                      {this.state.almacenesOrigenInterno.map(
                        (item, index) => {
                          return (
                            <option key={index} value={item.idAlmacen}>
                              {item.nombre}
                            </option>
                          );
                        },
                      )}
                    </Select>
                  </div>

                  {/* Selección el almacen de destino */}
                  <div className="mb-3">
                    <Select
                      label={'Seleccione el almacen de destino:'}
                      ref={this.refIdAlmacenDesitnoInterno}
                      value={this.state.idAlmacenDestinoInterno}
                      onChange={this.handleSelectAlmacenDestinoInterno}
                      disabled
                    >
                      <option value="">-- Almacen --</option>
                      {this.state.almacenesDestinoInterno.map(
                        (item, index) => {
                          return (
                            <option key={index} value={item.idAlmacen}>
                              {item.nombre}
                            </option>
                          );
                        },
                      )}
                    </Select>
                  </div>
                </>
              )
            }

            {
              // Verificar si el tipo de traslado es 'TT0002'
              this.state.idTipoTraslado === ENTRE_SUCURSALES && (
                <>
                  <div className="mb-3">
                    <p>
                      <i className="bi bi-arrow-bar-down"></i> Almacen de
                      origin
                    </p>
                  </div>

                  {/* Selección el almacen de origen */}
                  <div className="mb-3">
                    <Select
                      label={'Seleccione el almacen:'}
                      ref={this.refIdAlmacenOrigenExterno}
                      value={this.state.idAlmacenOrigenExterno}
                      onChange={this.handleSelectAlmacenOrigenExterno}
                    >
                      <option value="">-- Almacen --</option>
                      {this.state.almacenes.map((item, index) => (
                        <option key={index} value={item.idAlmacen}>
                          {item.nombre}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="mb-3">
                    <p>
                      <i className="bi bi-arrow-bar-right"></i> Sucural y
                      almacen de destino
                    </p>
                  </div>

                  {/* Selección la sucursal */}
                  <div className="flex flex-col md:flex-row gap-3 mb-3">
                    <div className="w-full">
                      <Select
                        label={'Seleccione la sucursal:'}
                        ref={this.refIdSucursalExterno}
                        value={this.state.idSucursalExterno}
                        onChange={this.handleSelectSucursalExterno}
                      >
                        <option value="">-- Sucursal --</option>
                        {this.state.sucursales.map((item, index) => (
                          <option key={index} value={item.idSucursal}>
                            {item.nombre}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="w-full">
                      <Select
                        label={'Seleccione el almacen:'}
                        ref={this.refIdAlmacenDestinoExterno}
                        value={this.state.idAlmacenDestinoExterno}
                        onChange={this.handleSelectAlmacenDestinoExterno}
                        disabled
                      >
                        <option value="">-- Almacen --</option>
                        {this.state.almacenesExterno.map((item, index) => (
                          <option key={index} value={item.idAlmacen}>
                            {item.nombre}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                </>
              )
            }

            {/* Botones de navegación */}
            <div className="flex gap-3">
              <Button className="btn-info" onClick={this.handleSiguiente}>
                <i className="fa fa-arrow-right"></i> Siguiente
              </Button>
              <Button
                className="btn-outline-danger"
                onClick={() => this.props.history.goBack()}
              >
                <i className="fa fa-close"></i> Cancelar
              </Button>
            </div>
          </>
        )}

        {/* Condición para renderizar contenido específico según el estado 'paso' */}
        {this.state.paso === 2 && (
          <>
            <div className="flex flex-col gap-1 mb-3">
              <p>Tipo de Traslado:</p>
              <div>
                {this.state.idTipoTraslado === ENTRE_ALMACENES ? (
                  <p className="font-bold">ENTRE ALMACENES</p>
                ) : (
                  <p className="font-bold">ENTRE SUCURSALES</p>
                )}
              </div>
            </div>

            {this.state.idTipoTraslado === ENTRE_ALMACENES && (
              <>
                <div className="flex flex-col gap-1 mb-3">
                  <p>Motivo de Traslado:</p>
                  <div>
                    <p className="font-bold"> {this.state.nombreMotivoTraslado}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1 mb-3">
                  <p>Almacen de Origen:</p>
                  <div>
                    <p className="font-bold">{this.state.nombreAlmacenOrigenInterno}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1 mb-3">
                  <p>Almacen de Destino:</p>
                  <div>
                    <p className="font-bold"> {this.state.nombreAlmacenDestinoInterno}</p>
                  </div>
                </div>
              </>
            )}

            {this.state.idTipoTraslado === ENTRE_SUCURSALES && (
              <>
                <div className="flex flex-col gap-1 mb-3">
                  <p>Almacen de Origen:</p>
                  <div>
                    <p className="font-bold">  {this.state.nombreAlmacenOriginExterno}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1 mb-3">
                  <p> Sucursal de Destino:</p>
                  <div>
                    <p className="font-bold">  {this.state.nombreSucursalExterno}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1 mb-3">
                  <p> Almacen de Destino:</p>
                  <div>
                    <p className="font-bold">{this.state.nombreAlmacenDestinoExterno}</p>
                  </div>
                </div>
              </>
            )}

            <div className="mb-3">
              <SearchInput
                ref={this.refProducto}
                autoFocus={true}
                label="Filtrar por el código o nombre del producto:"
                placeholder="Filtrar productos..."
                refValue={this.refValueProducto}
                data={this.state.productos}
                handleClearInput={this.handleClearInputProducto}
                handleFilter={this.handleFilterProducto}
                handleSelectItem={this.handleSelectItemProducto}
                renderItem={(value) => (
                  <div className="flex items-center">
                    <Image
                      default={images.noImage}
                      src={value.imagen}
                      alt={value.nombre}
                      overrideClass="w-20 h-20 object-contain"
                    />

                    <div className="ml-2">
                      {value.codigo}
                      <br />
                      {value.nombre} <small>({value.categoria})</small>
                    </div>
                  </div>
                )}
              />
            </div>

            <div className="mb-3">
              <Input
                label={
                  'Ingrese alguna descripción para saber el motivo del traslado:'
                }
                placeholder="Ingrese una observación"
                value={this.state.observacion}
                onChange={this.handleInputObservacion}
              />
            </div>

            <div className="mb-3">
              <div className="overflow-x-auto">
                <p className="mb-2">Lista de productos:</p>
                <div className="bg-white rounded border overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">Quitar</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Imagen</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">Clave/Nombre</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Cantidad</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Almacen Origen</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Almacen Destino</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Medida</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200" ref={this.refTableBody}>
                      {this.generateBody()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sección de botones de acción */}
            <div className="flex gap-3">
              <Button className="btn-success" onClick={this.handleSave}>
                <i className="fa fa-save"></i> Guardar
              </Button>
              <Button className="btn-outline-light" onClick={this.handleBack}>
                <i className="fa fa-arrow-left"></i> Atras
              </Button>
              <Button
                className="btn-outline-light"
                onClick={this.handleClear}
              >
                <i className="fa fa-refresh"></i> Limpiar
              </Button>
              <Button
                className="btn-outline-danger"
                onClick={() => this.props.history.goBack()}
              >
                <i className="fa fa-close"></i> Cancelar
              </Button>
            </div>
          </>
        )}
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
      idSucursal: PropTypes.string,
    }),
    userToken: PropTypes.shape({
      usuario: PropTypes.shape({
        idUsuario: PropTypes.string,
      }),
    }),
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func,
  }),
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */

const ConnectedTrasladorCrear = connect(mapStateToProps, null)(TrasladorCrear);

export default ConnectedTrasladorCrear;
