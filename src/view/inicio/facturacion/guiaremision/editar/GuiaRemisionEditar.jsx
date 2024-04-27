import React from 'react';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import {
  currentDate,
  alertDialog,
  alertWarning,
  keyNumberFloat,
  isEmpty,
  alertInfo,
  alertSuccess,
  isText,
} from '../../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { comboMotivoTraslado, comboTipoPeso, detailOnlyVenta, detailUpdateGuiaRemision, filtrarPersona, filtrarVehiculo, getUbigeo, listFiltrarVenta, obtenerGuiaRemisionPdf, updateGuiaRemision } from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import SearchInput from '../../../../../components/SearchInput';
import { SpinnerView } from '../../../../../components/Spinner';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import printJS from 'print-js';
import ModalImpresion from './componente/ModalImpresion';
import { TableResponsive } from '../../../../../components/Table';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class GuiaRemisionEditar extends CustomComponent {
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
      idGuiaRemision: '',
      isOpen: false,
      idModalidadTraslado: 'MT0001',
      idMotivoTraslado: '',
      fechaTraslado: currentDate(),
      idTipoPeso: '',
      peso: '',
      direccionPartida: '',
      idUbigeoPartida: '',
      direccionLlegada: '',
      idUbigeoLlegada: '',

      cliente: '',
      disabledPublica: true,
      disabledPrivado: false,

      detalle: [],

      // Lista de datos
      motivoTraslado: [],
      tipoPeso: [],

      // Filtrar producto
      filtrarVenta: '',
      loadingVenta: false,
      venta: null,
      ventas: [],

      // Filtrar vehículo
      filtrarVehiculo: '',
      loadingVehiculo: false,
      vehiculo: null,
      vehiculos: [],

      // Filtrar conductor
      filtrarConductor: '',
      loadingConductor: false,
      conductor: null,
      conductores: [],

      // Filtrar conductor publico
      filtrarConductorPublico: '',
      loadingConductorPublico: false,
      conductorPublico: null,
      conductoresPublico: [],

      // Filtrar ubigeo partida
      filterUbigeoPartida: '',
      loadingUbigePartida: false,
      ubigeosPartida: [],

      // Filtrar ubigeo llegada
      filterUbigeoLlegada: '',
      loadingUbigeLlegada: false,
      ubigeosLlegada: [],

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.initial = { ...this.state }

    // Referencia y variable del modal imprimir
    this.refPrinter = React.createRef();

    // Referencia de los atributos principales
    this.refMotivoTraslado = React.createRef();
    this.refTipoPeso = React.createRef();
    this.refPeso = React.createRef();

    this.refVenta = React.createRef();
    this.refDireccionPartida = React.createRef();
    this.refDireccionLlegada = React.createRef();

    // Filtrar venta
    this.refFiltrarVenta = React.createRef();
    this.selectItemVenta = false;

    // Filtrar vehículo
    this.refFiltrarVehiculo = React.createRef();
    this.selectItemVehiculo = false;

    // Filtrar conductor
    this.refFiltrarConductor = React.createRef();
    this.selectItemConductor = false;

    // Filtrar conductor publico
    this.refFiltrarConductorPublico = React.createRef();
    this.selectItemConductorPublico = false;

    // Filtrar ubigeo partida
    this.refFiltrarUbigeoPartida = React.createRef();
    this.selectItemUbigeoPartida = false;

    // Filtrar ubigeo llegada
    this.refFiltrarUbigeoLlegada = React.createRef();
    this.selectItemUbigeoLlegada = false;

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
    const url = this.props.location.search;
    const idGuiaRemision = new URLSearchParams(url).get('idGuiaRemision');
    if (isText(idGuiaRemision)) {
      await this.loadingData(idGuiaRemision);
    } else {
      this.props.history.goBack();
    }
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

  loadingData = async (idGuiaRemision) => {
    const [motivoTraslado, tipoPeso, guiaRemision] =
      await Promise.all([
        this.fetchComboMotivoTraslado(),
        this.fetchComboTipoPeso(),
        this.fetchObtenerDetalle(idGuiaRemision)
      ]);

    console.log(guiaRemision.cabecera)

    const cabecera = guiaRemision.cabecera;

    const comprobante = {
      documento: cabecera.documento,
      idVenta: cabecera.idVenta,
      informacion: cabecera.informacion,
      nombreComprobante: cabecera.nombreComprobante,
      numeracion: cabecera.numeracion,
      serie: cabecera.serie
    };

    const vehiculo = {
      idVehiculo: cabecera.idVehiculo,
      marca: cabecera.marca,
      numeroPlaca: cabecera.numeroPlaca
    }

    const conductor = {
      documento: cabecera.documentoCoductor,
      idPersona: cabecera.idConductor,
      informacion: cabecera.informacionConductor
    }

    const ubigeoPartida = {
      idUbigeo: cabecera.idUbigeopPartida,
      departamento: cabecera.departamentoPartida,
      provincia: cabecera.provinciaPartida,
      distrito: cabecera.distritoPartida,
      ubigeo: cabecera.ubigeoPartida,
    };

    const ubigeoLlegada = {
      idUbigeo: cabecera.idUbigeoLlegada,
      departamento: cabecera.departamentoLlegada,
      provincia: cabecera.provinciaLlegada,
      distrito: cabecera.distritoLlegada,
      ubigeo: cabecera.ubigeoLlegada,
    };

    this.handleSelectItemVenta(comprobante);
    this.handleSelectItemUbigeoPartido(ubigeoPartida);
    this.handleSelectItemUbigeoLlegada(ubigeoLlegada);

    if (cabecera.idModalidadTraslado === "MT0001") {
      this.setState({
        disabledPublica: true,
        disabledPrivado: false,
      })

      this.handleSelectItemConductorPublico(conductor)
    } else {
      this.setState({
        disabledPublica: false,
        disabledPrivado: true,
      });

      this.handleSelectItemVehiculo(vehiculo);
      this.handleSelectItemConductor(conductor)
    }

    this.setState({
      idGuiaRemision: idGuiaRemision,
      motivoTraslado,
      tipoPeso,
      idModalidadTraslado: cabecera.idModalidadTraslado,
      idMotivoTraslado: cabecera.idMotivoTraslado,
      fechaTraslado: cabecera.fechaTraslado,
      idTipoPeso: cabecera.idTipoPeso,
      peso: cabecera.peso.toString(),
      direccionPartida: cabecera.direccionPartida,
      direccionLlegada: cabecera.direccionLlegada,
      loading: false
    })
  }

  //------------------------------------------------------------------------------------------
  // Peticiones HTTP
  //------------------------------------------------------------------------------------------

  async fetchFiltrarVentas(params) {
    const response = await listFiltrarVenta(
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

  async fetchComboMotivoTraslado(params) {
    const response = await comboMotivoTraslado(
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

  async fetchComboTipoPeso(params) {
    const response = await comboTipoPeso(
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

  async fetchFiltrarVehiculo(params) {
    const response = await filtrarVehiculo(
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

  async fetchFiltrarConductor(params) {
    const response = await filtrarPersona(params);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      return [];
    }
  }

  async fetchFiltrarUbigeo(params) {
    const response = await getUbigeo(params);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      return [];
    }
  }

  async fetchObtenerVentaDetalle() {
    const params = {
      idVenta: this.state.venta.idVenta
    }

    const response = await detailOnlyVenta(params);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      return [];
    }
  }

  async fetchObtenerDetalle(idGuiaRemision) {
    const params = {
      idGuiaRemision: idGuiaRemision
    }

    const response = await detailUpdateGuiaRemision(params);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      return [];
    }
  }

  clearView = () => {
    this.setState(this.initial, async () => {
      await this.loadingData();
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

  //------------------------------------------------------------------------------------------
  // Eventos para traer el modald de venta
  //------------------------------------------------------------------------------------------

  handleOpenPrint = (idGuiaRemision) => {
    this.setState({ isOpen: true, idGuiaRemision: idGuiaRemision })
  }

  handleClosePrint = async () => {
    this.setState({ isOpen: false }, () => {
      this.props.history.goBack()
    })
  }

  handlePrintA4 = () => {
    printJS({
      printable: obtenerGuiaRemisionPdf(this.state.idGuiaRemision, "a4"),
      type: 'pdf',
      showModal: true,
      modalMessage: "Recuperando documento...",
      onPrintDialogClose: () => {
        this.handleClosePrint()
      }
    })
  }

  handlePrintTicket = () => {
    printJS({
      printable: obtenerGuiaRemisionPdf(this.state.idGuiaRemision, "ticket"),
      type: 'pdf',
      showModal: true,
      modalMessage: "Recuperando documento...",
      onPrintDialogClose: () => {
        this.handleClosePrint()
      }
    })
  }

  //------------------------------------------------------------------------------------------
  // Filtrar venta
  //------------------------------------------------------------------------------------------

  handleClearInputVenta = async () => {
    await this.setStateAsync({
      ventas: [],
      filtrarVenta: '',
      venta: null,
    });
    this.selectItemVenta = false;
  };

  handleFilterVenta = async (event) => {
    const searchWord = this.selectItemVenta ? '' : event.target.value;
    await this.setStateAsync({ venta: null, filtrarVenta: searchWord });

    this.selectItemVenta = false;
    if (searchWord.length === 0) {
      await this.setStateAsync({ ventas: [] });
      return;
    }

    if (this.state.loadingVenta) return;

    await this.setStateAsync({ loadingVenta: true });

    const params = {
      idSucursal: this.state.idSucursal,
      filtrar: searchWord,
    };

    const ventas = await this.fetchFiltrarVentas(params);

    this.setState({
      ventas: ventas,
      loadingVenta: false,
    });
  };

  handleSelectItemVenta = async (value) => {
    await this.setStateAsync({
      venta: value,
      filtrarVenta: `${value.nombreComprobante} ${value.serie}-${value.numeracion}`,
      ventas: [],
    });
    this.selectItemVenta = true;

    this.setState({
      loading: true
    })
    const ventaDetalle = await this.fetchObtenerVentaDetalle();

    this.setState({
      detalle: ventaDetalle,
      loading: false
    })
  };

  //------------------------------------------------------------------------------------------
  // Filtrar vehículo
  //------------------------------------------------------------------------------------------

  handleClearInputVehiculo = async () => {
    await this.setStateAsync({
      vehiculos: [],
      filtrarVehiculo: '',
      vehiculo: null,
    });
    this.selectItemVehiculo = false;
  };

  handleFilterVehiculo = async (event) => {
    const searchWord = this.selectItemVehiculo ? '' : event.target.value;
    await this.setStateAsync({ vehiculo: null, filtrarVehiculo: searchWord });

    this.selectItemVehiculo = false;
    if (searchWord.length === 0) {
      await this.setStateAsync({ vehiculos: [] });
      return;
    }

    if (this.state.loadingVehiculo) return;

    await this.setStateAsync({ loadingVehiculo: true });

    const params = {
      filter: searchWord,
    };

    const vehiculos = await this.fetchFiltrarVehiculo(params);

    this.setState({
      vehiculos: vehiculos,
      loadingVehiculo: false,
    });
  };

  handleSelectItemVehiculo = async (value) => {
    console.log(value)
    await this.setStateAsync({
      vehiculo: value,
      filtrarVehiculo: `${value.marca}-${value.numeroPlaca}`,
      vehiculos: [],
    });
    this.selectItemVehiculo = true;
  };

  //------------------------------------------------------------------------------------------
  // Filtrar conductor
  //------------------------------------------------------------------------------------------

  handleClearInputConductor = async () => {
    await this.setStateAsync({
      conductores: [],
      filtrarConductor: '',
      conductor: null,
    });
    this.selectItemConductor = false;
  };

  handleFilterConductor = async (event) => {
    const searchWord = this.selectItemConductor ? '' : event.target.value;
    await this.setStateAsync({ conductor: null, filtrarConductor: searchWord });

    this.selectItemConductor = false;
    if (searchWord.length === 0) {
      await this.setStateAsync({ conductores: [] });
      return;
    }

    if (this.state.loadingConductor) return;

    await this.setStateAsync({ loadingConductor: true });

    const params = {
      opcion: 1,
      filter: searchWord,
      conductor: true
    };

    const conductores = await this.fetchFiltrarConductor(params);

    this.setState({
      conductores: conductores,
      loadingConductor: false,
    });
  };

  handleSelectItemConductor = async (value) => {
    console.log(value)
    await this.setStateAsync({
      conductor: value,
      filtrarConductor: `${value.documento}, ${value.informacion}`,
      conductores: [],
    });
    this.selectItemConductor = true;
  };


  //------------------------------------------------------------------------------------------
  // Filtrar conductor publico
  //------------------------------------------------------------------------------------------

  handleClearInputConductorPublico = async () => {
    await this.setStateAsync({
      conductoresPublico: [],
      filtrarConductorPublico: '',
      conductorPublico: null,
    });
    this.selectItemConductorPublico = false;
  };

  handleFilterConductorPublico = async (event) => {
    const searchWord = this.selectItemConductorPublico ? '' : event.target.value;
    await this.setStateAsync({ conductorPublico: null, filtrarConductorPublico: searchWord });

    this.selectItemConductorPublico = false;
    if (searchWord.length === 0) {
      await this.setStateAsync({ conductores: [] });
      return;
    }

    if (this.state.loadingConductorPublico) return;

    await this.setStateAsync({ loadingConductorPublico: true });

    const params = {
      opcion: 1,
      filter: searchWord,
      conductor: true
    };

    const conductores = await this.fetchFiltrarConductor(params);

    this.setState({
      conductoresPublico: conductores,
      loadingConductorPublico: false,
    });
  };

  handleSelectItemConductorPublico = async (value) => {
    await this.setStateAsync({
      conductorPublico: value,
      filtrarConductorPublico: `${value.documento}, ${value.informacion}`,
      conductoresPublico: [],
    });
    this.selectItemConductorPublico = true;
  };

  //------------------------------------------------------------------------------------------
  // Filtrar ubigeo partida
  //------------------------------------------------------------------------------------------

  handleClearInputaUbigeoPartido = async () => {
    await this.setStateAsync({
      ubigeosPartida: [],
      filterUbigeoPartida: '',
      idUbigeoPartida: ''
    });
    this.selectItemUbigeoPartida = false;
  };

  handleFilterUbigeoPartido = async (event) => {
    const searchWord = this.selectItemUbigeoPartida ? '' : event.target.value;
    await this.setStateAsync({ idUbigeoPartida: '', filterUbigeoPartida: searchWord });

    this.selectItemUbigeoPartida = false;
    if (searchWord.length === 0) {
      await this.setStateAsync({ ubigeosPartida: [] });
      return;
    }

    if (this.state.loadingUbigePartida) return;

    await this.setStateAsync({ loadingUbigePartida: true });

    const params = {
      filtrar: searchWord,
    };

    const ubigeos = await this.fetchFiltrarUbigeo(params);

    this.setState({
      ubigeosPartida: ubigeos,
      loadingUbigePartida: false,
    });
  };

  handleSelectItemUbigeoPartido = async (value) => {
    await this.setStateAsync({
      filterUbigeoPartida:
        value.departamento +
        ' - ' +
        value.provincia +
        ' - ' +
        value.distrito +
        ' (' +
        value.ubigeo +
        ')',
      ubigeosPartida: [],
      idUbigeoPartida: value.idUbigeo,
    });
    this.selectItemUbigeoPartida = true;
  };

  //------------------------------------------------------------------------------------------
  // Filtrar ubigeo llegada
  //------------------------------------------------------------------------------------------

  handleClearInputaUbigeoLlegada = async () => {
    await this.setStateAsync({
      ubigeosLlegada: [],
      filterUbigeoLlegada: '',
      idUbigeoLlegada: ''
    });
    this.selectItemUbigeoLlegada = false;
  };

  handleFilterUbigeoLlegada = async (event) => {
    const searchWord = this.selectItemUbigeoLlegada ? '' : event.target.value;
    await this.setStateAsync({ idUbigeoLlegada: '', filterUbigeoLlegada: searchWord });

    this.selectItemUbigeoLlegada = false;
    if (searchWord.length === 0) {
      await this.setStateAsync({ ubigeosLlegada: [] });
      return;
    }

    if (this.state.loadingUbigeLlegada) return;

    await this.setStateAsync({ loadingUbigeLlegada: true });

    const params = {
      filtrar: searchWord,
    };

    const ubigeos = await this.fetchFiltrarUbigeo(params);

    this.setState({
      ubigeosLlegada: ubigeos,
      loadingUbigeLlegada: false,
    });
  };

  handleSelectItemUbigeoLlegada = async (value) => {
    await this.setStateAsync({
      filterUbigeoLlegada:
        value.departamento +
        ' - ' +
        value.provincia +
        ' - ' +
        value.distrito +
        ' (' +
        value.ubigeo +
        ')',
      ubigeosLlegada: [],
      idUbigeoLlegada: value.idUbigeo,
    });
    this.selectItemUbigeoLlegada = true;
  };

  //------------------------------------------------------------------------------------------
  // Evento para guardar la guía de remisión
  //------------------------------------------------------------------------------------------

  handleInputModalidadTraslado = (event) => {
    this.setState({ idModalidadTraslado: event.target.value }, () => {
      if (event.target.value === "MT0001") {
        this.setState({
          disabledPublica: true,
          disabledPrivado: false,
        })
      } else {
        this.setState({
          disabledPublica: false,
          disabledPrivado: true,
        })
      }
    });
  }

  handleBack() {
    alertDialog("Guía de Remisión", "¿Está seguro de salir?", (accept) => {
      if (accept) {
        this.props.history.goBack()
      }
    });
  }

  handleSave() {
    if (!this.state.venta) {
      alertWarning("Guía de Remisión", "Filtre una venta para continuar.", () => {
        this.refFiltrarVenta.current.focus()
      })
      return;
    }

    if (isEmpty(this.state.idMotivoTraslado)) {
      alertWarning("Guía de Remisión", "Seleccione el motivo de traslado.", () => {
        this.refMotivoTraslado.current.focus()
      })
      return;
    }

    if (isEmpty(this.state.idTipoPeso)) {
      alertWarning("Guía de Remisión", "Seleccione el tipo de peso.", () => {
        this.refTipoPeso.current.focus()
      })
      return;
    }

    if (isEmpty(this.state.peso)) {
      alertWarning("Guía de Remisión", "Ingrese el peso total.", () => {
        this.refPeso.current.focus()
      })
      return;
    }

    if (this.state.idModalidadTraslado === "MT0001" && isEmpty(this.state.conductorPublico)) {
      alertWarning("Guía de Remisión", "Seleccione el conductor que va trandportar.", () => {
        this.refFiltrarConductorPublico.current.focus()
      })
      return;
    }


    if (this.state.idModalidadTraslado === "MT0002" && isEmpty(this.state.vehiculo)) {
      alertWarning("Guía de Remisión", "Seleccione el vehículo que va transportar.", () => {
        this.refFiltrarVehiculo.current.focus()
      })
      return;
    }

    if (this.state.idModalidadTraslado === "MT0002" && isEmpty(this.state.conductor)) {
      alertWarning("Guía de Remisión", "Seleccione el conductor que va transportar.", () => {
        this.refFiltrarConductor.current.focus()
      })
      return;
    }


    if (isEmpty(this.state.direccionPartida)) {
      alertWarning("Guía de Remisión", "Ingrese la dirección de partida.", () => {
        this.refDireccionPartida.current.focus()
      })
      return;
    }

    if (isEmpty(this.state.idUbigeoPartida)) {
      alertWarning("Guía de Remisión", "Selecciona el ubigeo de partida.", () => {
        this.refFiltrarUbigeoPartida.current.focus()
      })
      return;
    }

    if (isEmpty(this.state.direccionLlegada)) {
      alertWarning("Guía de Remisión", "Ingrese la dirección de llegada.", () => {
        this.refDireccionPartida.current.focus()
      })
      return;
    }

    if (isEmpty(this.state.idUbigeoLlegada)) {
      alertWarning("Guía de Remisión", "Selecciona el ubigeo de llegada.", () => {
        this.refFiltrarUbigeoLlegada.current.focus()
      })
      return;
    }

    alertDialog("Guía de Remisión", "¿Está seguro de continuar?", async (accept) => {
      if (accept) {
        const data = {
          idGuiaRemision: this.state.idGuiaRemision,
          idVenta: this.state.venta.idVenta,
          idSucursal: this.state.idSucursal,
          idModalidadTraslado: this.state.idModalidadTraslado,
          idMotivoTraslado: this.state.idMotivoTraslado,
          fechaTraslado: this.state.fechaTraslado,
          idTipoPeso: this.state.idTipoPeso,
          peso: this.state.peso,
          idVehiculo: this.state.vehiculo.idVehiculo,
          idConductor: this.state.idModalidadTraslado === "MT0001" ? this.state.conductorPublico.idPersona : this.state.conductor.idPersona,
          direccionPartida: this.state.direccionPartida,
          idUbigeoPartida: this.state.idUbigeoPartida,
          direccionLlegada: this.state.direccionLlegada,
          idUbigeoLlegada: this.state.idUbigeoLlegada,
          detalle: this.state.detalle,
          estado: 1,
          idUsuario: this.state.idUsuario
        }

        alertInfo("Guía de Remisión", "Procesando información...")

        const response = await updateGuiaRemision(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Guía de Remisión', response.data, () => {
            this.handleOpenPrint(this.state.idGuiaRemision);
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertWarning('Guía de Remisión', response.getMessage());
        }
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

  render() {
    return (
      <ContainerWrapper>

        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <ModalImpresion
          refModal={this.refPrinter}
          isOpen={this.state.isOpen}
          handleClose={this.handleClosePrint}

          handlePrintA4={this.handlePrintA4}
          handlePrintTicket={this.handlePrintTicket}
        />


        <Row>
          <Column>
            <div className="form-group">
              <h5>
                <span role="button" onClick={() => this.handleBack()}>
                  <i className="bi bi-arrow-left-short"></i>
                </span>{' '}
                Guía Remisión
                <small className="text-secondary"> Editar </small>
              </h5>
            </div>
          </Column>
        </Row>

        <Row>
          <Column className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
            <button
              type="button"
              className="btn btn-warning"
              onClick={() => this.handleSave()}>
              <i className='fa fa-save'></i>  Guardar
            </button>
            {" "}
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => this.handleBack()}>
              <i className='fa fa-close'></i>  Cancelar
            </button>
          </Column>
        </Row>

        <br />

        {/* Seleccione la venta */}
        <h6><span className='badge badge-primary'>1</span> Venta y Guía</h6>

        <div className="dropdown-divider"></div>

        <Row>
          <Column>
            <label>
              Filtrar Venta: <i className="fa fa-asterisk text-danger small"></i>
            </label>

            <SearchInput
              showLeftIcon={false}
              autoFocus={true}
              placeholder="Ejm: B001, 1, F001..."
              refValue={this.refFiltrarVenta}
              value={this.state.filtrarVenta}
              data={this.state.ventas}
              handleClearInput={this.handleClearInputVenta}
              handleFilter={this.handleFilterVenta}
              handleSelectItem={this.handleSelectItemVenta}
              renderItem={(value) =>
                <>
                  <span>{value.nombreComprobante} {value.serie}-{value.numeracion}</span>
                  {" / "}
                  <span>{value.informacion}</span>
                </>
              }
            />
          </Column>
        </Row>

        {/* Sección de los datos del cliente */}
        <h6><span className='badge badge-primary'>2</span> Cliente</h6>

        <div className="dropdown-divider"></div>

        <Row>
          <Column>
            <div className="form-group">
              <label>
                Selecciona un Cliente: <i className="fa fa-asterisk text-danger small"></i>
              </label>
              <input
                type='text'
                className='form-control'
                value={this.state.venta ? `${this.state.venta.documento} - ${this.state.venta.informacion}` : ''}
                disabled />
            </div>
          </Column>
        </Row>

        {/* Sección para modalidad traslado */}
        <h6><span className='badge badge-primary'>3</span> Modalidad de Traslado</h6>

        <div className="dropdown-divider"></div>

        <Row>
          <Column>
            <div className="form-group">
              <div>
                <div className="form-check form-check-inline pr-5">
                  <input
                    className="form-check-input checked"
                    type="radio"
                    name="inlineRadioOptions"
                    id="MT0001"
                    value="MT0001"
                    checked={this.state.idModalidadTraslado === 'MT0001'}
                    onChange={this.handleInputModalidadTraslado}
                  />
                  <label className="form-check-label" htmlFor="MT0001">
                    {' '}
                    Público
                  </label>
                </div>
              </div>
            </div>
          </Column>

          <Column>
            <div className="form-group">
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="inlineRadioOptions"
                  id="MT0002"
                  value="MT0002"
                  checked={this.state.idModalidadTraslado === 'MT0002'}
                  onChange={this.handleInputModalidadTraslado}
                />
                <label className="form-check-label" htmlFor="MT0002">
                  {' '}
                  Privado
                </label>
              </div>
            </div>
          </Column>
        </Row>

        {/* Sección para datos del traslado */}
        <h6><span className='badge badge-primary'>4</span> Datos del Traslado</h6>

        <div className="dropdown-divider"></div>

        <Row>
          <Column className='col-md-6 col-12'>
            <div className="form-group">
              <label>
                Motivo del traslado: <i className="fa fa-asterisk text-danger small"></i>
              </label>

              <div className="input-group">
                <select className="form-control"
                  ref={this.refMotivoTraslado}
                  value={this.state.idMotivoTraslado}
                  onChange={(event) => {
                    this.setState({ idMotivoTraslado: event.target.value })
                  }}>
                  <option value="0">-- Seleccione comprobante --</option>
                  {
                    this.state.motivoTraslado.map((item, index) => (
                      <option key={index} value={item.idMotivoTraslado}>{item.nombre}</option>
                    ))
                  }
                </select>
              </div>
            </div>
          </Column>

          <Column className='col-md-6 col-12'>
            <div className="form-group">
              <label>
                Fecha traslado:{' '}<i className="fa fa-asterisk text-danger small"></i>
              </label>
              <input
                className="form-control"
                type="date"
                value={this.state.fechaTraslado}
                onChange={async (event) => {
                  this.setState({ fechaTraslado: event.target.value });
                }}
              />
            </div>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6 col-12">
            <div className="form-group">
              <label>
                Tipo Peso de Carga: <i className="fa fa-asterisk text-danger small" />
              </label>

              <div className="input-group">
                <select className="form-control"
                  ref={this.refTipoPeso}
                  value={this.state.idTipoPeso}
                  onChange={(event) => {
                    this.setState({ idTipoPeso: event.target.value })
                  }}>
                  <option value="0">-- Seleccione --</option>
                  {
                    this.state.tipoPeso.map((item, index) => (
                      <option key={index} value={item.idTipoPeso}>{item.nombre}</option>
                    ))
                  }
                </select>
              </div>
            </div>
          </Column>

          <Column className="col-md-6 col-12">
            <div className="form-group">
              <label>Peso de la Carga:{' '}<i className="fa fa-asterisk text-danger small"></i></label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ejm: 0.00, 0"
                  ref={this.refPeso}
                  value={this.state.peso}
                  onChange={(event) => {
                    this.setState({ peso: event.target.value })
                  }}
                  onKeyDown={keyNumberFloat}
                />
              </div>
            </div>
          </Column>
        </Row>

        {/* Sección de datos del vehículo */}
        <h6><span className='badge badge-primary'>5</span> Datos del Transporte Privado</h6>

        <div className="dropdown-divider"></div>

        <Row>
          <Column className='col'>
            <label>
              Filtrar un vehículo: <i className="fa fa-asterisk text-danger small"></i>
            </label>
            <SearchInput
              disabled={this.state.disabledPublica}
              showLeftIcon={false}
              placeholder="Filtrar por marca o número de placa..."
              refValue={this.refFiltrarVehiculo}
              value={this.state.filtrarVehiculo}
              data={this.state.vehiculos}
              handleClearInput={this.handleClearInputVehiculo}
              handleFilter={this.handleFilterVehiculo}
              handleSelectItem={this.handleSelectItemVehiculo}
              renderItem={(value) =>
                <>
                  <span>{value.marca}-{value.numeroPlaca}</span>
                </>
              }
            />
          </Column>
        </Row>

        {/* Sección de datos del conductor */}
        <h6><span className='badge badge-primary'>6</span> Datos del Conductor Privado</h6>

        <div className="dropdown-divider"></div>

        <Row>
          <Column>
            <label>
              Filtrar un Conductor (DNI): <i className="fa fa-asterisk text-danger small"></i>
            </label>
            <SearchInput
              disabled={this.state.disabledPublica}
              showLeftIcon={false}
              placeholder="Por número de documento o apellidos y nombres..."
              refValue={this.refFiltrarConductor}
              value={this.state.filtrarConductor}
              data={this.state.conductores}
              handleClearInput={this.handleClearInputConductor}
              handleFilter={this.handleFilterConductor}
              handleSelectItem={this.handleSelectItemConductor}
              renderItem={(value) =>
                <>
                  <span>{value.documento}, {value.informacion}</span>
                </>
              }
            />
          </Column>
        </Row>

        <h6><span className='badge badge-primary'>7</span> Datos de la Empresa a Transportar - Pública</h6>

        <div className="dropdown-divider"></div>

        <Row>
          <Column>
            {/* <div className="form-group"> */}
            <label>
              Selecciona una Empresa (RUC): <i className="fa fa-asterisk text-danger small"></i>
            </label>

            <SearchInput
              disabled={this.state.disabledPrivado}
              showLeftIcon={false}
              placeholder="Por número de documento o ruc..."
              refValue={this.refFiltrarConductorPublico}
              value={this.state.filtrarConductorPublico}
              data={this.state.conductoresPublico}
              handleClearInput={this.handleClearInputConductorPublico}
              handleFilter={this.handleFilterConductorPublico}
              handleSelectItem={this.handleSelectItemConductorPublico}
              renderItem={(value) =>
                <>
                  <span>{value.documento}, {value.informacion}</span>
                </>
              }
            />
          </Column>
        </Row>

        <div className="dropdown-divider"></div>

        <Row>
          <Column className="col-md-6 col-12">
            <h6><span className='badge badge-primary'>8</span> Punto de partida</h6>

            <div className="dropdown-divider"></div>

            <div className="form-group">
              <label>
                Dirección Partida: <i className="fa fa-asterisk text-danger small"></i>
              </label>
              <div className="input-group mb-2">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="bi bi-search"></i>
                  </div>
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ingrese Dirección de partida..."
                  ref={this.refDireccionPartida}
                  value={this.state.direccionPartida}
                  onChange={(event) => {
                    this.setState({ direccionPartida: event.target.value })
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                Ubigeo Partida: <i className="fa fa-asterisk text-danger small"></i>
              </label>
              <SearchInput
                showLeftIcon={true}
                renderIconLeft={() => <i className="bi bi-search"></i>}
                placeholder="Filtrar departamento, distrito o provincia..."
                refValue={this.refFiltrarUbigeoPartida}
                value={this.state.filterUbigeoPartida}
                data={this.state.ubigeosPartida}
                handleClearInput={this.handleClearInputaUbigeoPartido}
                handleFilter={this.handleFilterUbigeoPartido}
                handleSelectItem={this.handleSelectItemUbigeoPartido}
                renderItem={(value) =>
                  <>
                    {value.departamento} -
                    {value.provincia} -
                    {value.distrito}
                    ({value.ubigeo})
                  </>
                }
              />
            </div>
          </Column>

          <Column className="col-md-6 col12">
            <h6><span className='badge badge-primary'>9</span> Punto de llegada</h6>

            <div className="dropdown-divider"></div>

            <div className="form-group">
              <label>
                Dirección Llegada: <i className="fa fa-asterisk text-danger small"></i>
              </label>
              <div className="input-group mb-2">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="bi bi-search"></i>
                  </div>
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ingrese Dirección de llegada..."
                  ref={this.refDireccionLlegada}
                  value={this.state.direccionLlegada}
                  onChange={(event) => {
                    this.setState({ direccionLlegada: event.target.value })
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                Ubigeo Llegada: <i className="fa fa-asterisk text-danger small"></i>
              </label>
              <SearchInput
                showLeftIcon={true}
                renderIconLeft={() => <i className="bi bi-search"></i>}
                placeholder="Filtrar departamento, distrito o provincia..."
                refValue={this.refFiltrarUbigeoLlegada}
                value={this.state.filterUbigeoLlegada}
                data={this.state.ubigeosLlegada}
                handleClearInput={this.handleClearInputaUbigeoLlegada}
                handleFilter={this.handleFilterUbigeoLlegada}
                handleSelectItem={this.handleSelectItemUbigeoLlegada}
                renderItem={(value) =>
                  <>
                    {value.departamento} -
                    {value.provincia} -
                    {value.distrito}
                    ({value.ubigeo})
                  </>
                }
              />
            </div>
          </Column>
        </Row>

        <h6><span className='badge badge-primary'>10</span> Detalle de Guía de Remisión</h6>

        <Row>
          <Column>
            <TableResponsive
              tHead={
                <tr>
                  <th width="5%" className="text-center">
                    #
                  </th>
                  <th width="10%">Código</th>
                  <th width="35%">Descripción</th>
                  <th width="15%">Und/Medida</th>
                  <th width="15%">Cantidad</th>
                </tr>
              }
              tBody={
                this.state.detalle.map((item, index) => (
                  <tr key={index}>
                    <td className="text-center">{++index}</td>
                    <td>{item.codigo}</td>
                    <td>{item.producto}</td>
                    <td>{item.medida}</td>
                    <td>{item.cantidad}</td>
                  </tr>
                ))
              }
            />
          </Column>
        </Row>
      </ContainerWrapper >
    );
  }
}

GuiaRemisionEditar.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string
  }),
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
    token: state.reducer,
  };
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */
const ConnectedGuiaRemisionCrear = connect(mapStateToProps, null)(GuiaRemisionEditar);

export default ConnectedGuiaRemisionCrear;