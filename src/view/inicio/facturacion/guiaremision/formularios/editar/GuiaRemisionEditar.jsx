import React from 'react';
import ContainerWrapper from '../../../../../../components/Container';
import CustomComponent from '@/components/CustomComponent';
import {
  currentDate,
  keyNumberFloat,
  isEmpty,
  isText,
} from '../../../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  comboMotivoTraslado,
  comboTipoPeso,
  getIdGuiaRemision,
  getPdfGuiaRemision,
  filterVenta,
  filtrarPersona,
  filtrarVehiculo,
  getDetailsShippingGuideVenta,
  getUbigeo,
  updateGuiaRemision,
  getDetailsShippingGuideTraslado,
} from '../../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../../model/class/response';
import ErrorResponse from '../../../../../../model/class/error-response';
import { CANCELED } from '../../../../../../model/types/types';
import SearchInput from '../../../../../../components/SearchInput';
import { SpinnerView } from '../../../../../../components/Spinner';
import Row from '../../../../../../components/Row';
import Column from '../../../../../../components/Column';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableResponsive,
  TableRow,
} from '../../../../../../components/Table';
import Title from '../../../../../../components/Title';
import Button from '../../../../../../components/Button';
import Select from '../../../../../../components/Select';
import Input from '../../../../../../components/Input';
import RadioButton from '../../../../../../components/RadioButton';
import { ModalImpresion } from '../../../../../../components/MultiModal';
import { alertKit } from 'alert-kit';
import { MODALIDAD_TRASLADO } from '@/model/types/modalidad-traslado';
import { MOTIVO_TRASLADO } from '@/model/types/motivo-traslado';
import pdfVisualizer from 'pdf-visualizer';
import { Badge } from '@/components/ui/badge';
import Form from '../components/Form';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
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
      idModalidadTraslado: MODALIDAD_TRASLADO.TRANSPORTE_PUBLICO,
      idMotivoTraslado: '',
      fechaTraslado: currentDate(),
      idTipoPeso: '',
      peso: '',

      traslado: null,

      codigoAnexoPartida: '',
      direccionPartida: '',
      idUbigeoPartida: 0,

      codigoAnexoLlegada: '',
      direccionLlegada: '',
      idUbigeoLlegada: 0,

      cliente: '',
      disabledPublica: true,
      disabledPrivado: false,

      detalles: [],

      // Lista de datos
      motivoTraslado: [],
      tipoPeso: [],

      // Filtrar venta
      venta: null,
      ventas: [],

      // Filtrar vehículo
      vehiculo: null,
      vehiculos: [],

      // Filtrar conductor
      conductor: null,
      conductores: [],

      // Filtrar conductor publico
      conductorPublico: null,
      conductoresPublico: [],

      // Filtrar ubigeo partida
      ubigeosPartida: [],

      // Filtrar ubigeo llegada
      ubigeosLlegada: [],

      // Atributos del modal impresión
      isOpenImpresion: false,

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.initial = { ...this.state };

    // Referencia de los atributos principales
    this.refMotivoTraslado = React.createRef();
    this.refTipoPeso = React.createRef();
    this.refPeso = React.createRef();

    this.refCodigoAnexoPartida = React.createRef();
    this.refCodigoAnexoLlegada = React.createRef();

    this.refDireccionPartida = React.createRef();
    this.refDireccionLlegada = React.createRef();

    // Filtrar venta
    this.refVenta = React.createRef();
    this.refFiltrarVenta = React.createRef();

    // Filtrar vehículo
    this.refVehiculo = React.createRef();
    this.refFiltrarVehiculo = React.createRef();

    // Filtrar conductor
    this.refConductor = React.createRef();
    this.refFiltrarConductor = React.createRef();

    // Filtrar conductor publico
    this.refConductorPublico = React.createRef();
    this.refFiltrarConductorPublico = React.createRef();

    // Filtrar ubigeo partida
    this.refUbigeoPartida = React.createRef();
    this.refFiltrarUbigeoPartida = React.createRef();

    // Filtrar ubigeo llegada
    this.refUbigeoLlegada = React.createRef();
    this.refFiltrarUbigeoLlegada = React.createRef();

    // Referencia y variable del modal imprimir
    this.refModalImpresion = React.createRef();

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
      await this.loadData(idGuiaRemision);
    } else {
      this.handleGoBack();
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

  loadData = async (idGuiaRemision) => {
    const [motivoTraslado, tipoPeso, guiaRemision] = await Promise.all([
      this.fetchComboMotivoTraslado(),
      this.fetchComboTipoPeso(),
      this.fetchObtenerDetalle(idGuiaRemision),
    ]);

    const cabecera = guiaRemision.cabecera;

    const vehiculo = {
      idVehiculo: cabecera.idVehiculo,
      marca: cabecera.marca,
      numeroPlaca: cabecera.numeroPlaca,
    };

    const conductor = {
      documento: cabecera.documentoCoductor,
      idPersona: cabecera.idConductor,
      informacion: cabecera.informacionConductor,
    };

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

    if (!isEmpty(cabecera.idVenta)) {
      this.handleSelectItemVenta({
        documento: cabecera.documento,
        idVenta: cabecera.idVenta,
        informacion: cabecera.informacion,
        nombreComprobante: cabecera.nombreComprobante,
        numeracion: cabecera.numeracion,
        serie: cabecera.serie,
      });
    }

    if (!isEmpty(cabecera.idTraslado)) {
      await this.handleSelectItemTraslado({
        idTraslado: cabecera.idTraslado,
      });
    }

    this.handleSelectItemUbigeoPartido(ubigeoPartida);
    this.handleSelectItemUbigeoLlegada(ubigeoLlegada);

    if (cabecera.idModalidadTraslado === MODALIDAD_TRASLADO.TRANSPORTE_PUBLICO) {
      this.setState({
        disabledPublica: true,
        disabledPrivado: false,
      });

      this.handleSelectItemConductorPublico(conductor);
    } else {
      this.setState({
        disabledPublica: false,
        disabledPrivado: true,
      });

      this.handleSelectItemVehiculo(vehiculo);
      this.handleSelectItemConductor(conductor);
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

      codigoAnexoPartida: cabecera.codigoAnexoPartida,
      direccionPartida: cabecera.direccionPartida,

      codigoAnexoLlegada: cabecera.codigoAnexoLlegada,
      direccionLlegada: cabecera.direccionLlegada,

      loading: false,
    });
  };

  //------------------------------------------------------------------------------------------
  // Peticiones HTTP
  //------------------------------------------------------------------------------------------

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

  async fetchComboTipoPeso() {
    const response = await comboTipoPeso(this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchFiltrarVehiculo(params) {
    const response = await filtrarVehiculo(params, this.abortController.signal);

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

  async fetchObtenerDetalle(idGuiaRemision) {
    const response = await getIdGuiaRemision(idGuiaRemision);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
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

  handleInputModalidadTraslado = (event) => {
    this.setState({ idModalidadTraslado: event.target.value }, () => {
      if (event.target.value === MODALIDAD_TRASLADO.TRANSPORTE_PUBLICO) {
        this.setState({
          disabledPublica: true,
          disabledPrivado: false,
        });
      } else {
        this.setState({
          disabledPublica: false,
          disabledPrivado: true,
        });
      }
    });
  };

  handleSelectMotivoTraslado = (event) => {
    this.setState({ idMotivoTraslado: event.target.value });
  };

  handleInputFechaTraslado = (event) => {
    this.setState({ fechaTraslado: event.target.value });
  };

  handleSelectTipoPeso = (event) => {
    this.setState({ idTipoPeso: event.target.value });
  };

  handleInputPeso = (event) => {
    this.setState({ peso: event.target.value });
  };

  handleInputCodigoAnexoPartida = (event) => {
    this.setState({ codigoAnexoPartida: event.target.value });
  };

  handleInputDireccionPartida = (event) => {
    this.setState({ direccionPartida: event.target.value });
  };

  handleInputCodigoAnexoLlegada = (event) => {
    this.setState({ codigoAnexoLlegada: event.target.value });
  };

  handleInputDireccionLlegada = (event) => {
    this.setState({ direccionLlegada: event.target.value });
  };

  //------------------------------------------------------------------------------------------
  // Procesos impresión
  //------------------------------------------------------------------------------------------
  handleOpenImpresion = (idGuiaRemision) => {
    this.setState({ isOpenImpresion: true, idGuiaRemision: idGuiaRemision });
  };

  handlePrinterImpresion = async (size) => {
    const url = getPdfGuiaRemision(
      this.state.idGuiaRemision,
      size,
    );

    await pdfVisualizer.init({
      url: url,
      title: 'Guia de Remision',
      titlePageNumber: 'Página',
      titleLoading: 'Cargando...',
      onAfterClose: () => {
        this.handleCloseImpresion();
      },
    });
  };

  handleCloseImpresion = async () => {
    this.setState({ isOpenImpresion: false }, () => {
      this.handleGoBack();
    });
  };

  //------------------------------------------------------------------------------------------
  // Filtrar venta
  //------------------------------------------------------------------------------------------
  handleClearInputVenta = () => {
    this.setState({
      ventas: [],
      venta: null,
    });
  };

  handleFilterVenta = async (text) => {
    const searchWord = text;
    this.setState({ venta: null });

    if (isEmpty(searchWord)) {
      this.setState({ ventas: [] });
      return;
    }

    const { success, data, message } = await filterVenta(searchWord, this.state.idSucursal);

    if (!success) {
      alertKit.warning({
        title: 'Guía de Remisión',
        message: message,
      });
      return;
    }

    this.setState({
      ventas: data,
    });
  };

  handleSelectItemVenta = (value) => {
    this.refVenta.current.initialize(
      `${value.nombreComprobante} ${value.serie}-${value.numeracion}`
    );

    this.setState({
      venta: value,
      ventas: [],
    }, async () => {
      this.setState({
        loading: true,
      });

      const { success, data, message } = await getDetailsShippingGuideVenta(value.idVenta);

      if (!success) {
        alertKit.warning({
          title: 'Guia de Remisión',
          message: message,
        });
        return;
      }

      this.setState({
        detalles: data,
        loading: false,
      });
    },);
  };

  //------------------------------------------------------------------------------------------
  // Filtrar traslado
  //------------------------------------------------------------------------------------------

  handleSelectItemTraslado = async (value) => {
    // this.refVenta.current.initialize(
    //   `${value.nombreComprobante} ${value.serie}-${value.numeracion}`
    // );

    const { success, data, message } = await getDetailsShippingGuideTraslado(value.idTraslado);

    if (!success) {
      alertKit.warning({
        title: 'Guía de Remisión',
        message: message,
      }, () => {
        this.props.history.goBack();
      });
      return;
    }

    this.setState({
      traslado: value,
      detalles: data,
    });
  };

  //------------------------------------------------------------------------------------------
  // Filtrar vehículo
  //------------------------------------------------------------------------------------------
  handleClearInputVehiculo = () => {
    this.setState({
      vehiculos: [],
      vehiculo: null,
    });
  };

  handleFilterVehiculo = async (text) => {
    const searchWord = text;
    this.setState({ vehiculo: null });

    if (isEmpty(searchWord)) {
      this.setState({ vehiculos: [] });
      return;
    }

    const params = {
      filter: searchWord,
    };

    const vehiculos = await this.fetchFiltrarVehiculo(params);

    this.setState({
      vehiculos: vehiculos,
    });
  };

  handleSelectItemVehiculo = (value) => {
    this.refVehiculo.current.initialize(
      `${value.marca}-${value.numeroPlaca}`,
      true,
    );
    this.setState({
      vehiculo: value,
      vehiculos: [],
    });
  };

  //------------------------------------------------------------------------------------------
  // Filtrar conductor
  //------------------------------------------------------------------------------------------
  handleClearInputConductor = () => {
    this.setState({
      conductores: [],
      conductor: null,
    });
  };

  handleFilterConductor = async (text) => {
    const searchWord = text;
    this.setState({ conductor: null });

    if (isEmpty(searchWord)) {
      this.setState({ conductores: [] });
      return;
    }

    const params = {
      opcion: 1,
      filter: searchWord,
      conductor: true,
    };

    const conductores = await this.fetchFiltrarConductor(params);

    this.setState({
      conductores: conductores,
    });
  };

  handleSelectItemConductor = (value) => {
    this.refConductor.current.initialize(
      `${value.documento}, ${value.informacion}`,
      true,
    );
    this.setState({
      conductor: value,
      conductores: [],
    });
  };

  //------------------------------------------------------------------------------------------
  // Filtrar conductor publico
  //------------------------------------------------------------------------------------------
  handleClearInputConductorPublico = () => {
    this.setState({
      conductoresPublico: [],
      conductorPublico: null,
    });
  };

  handleFilterConductorPublico = async (text) => {
    const searchWord = text;
    this.setState({ conductorPublico: null });

    if (isEmpty(searchWord)) {
      this.setState({ conductores: [] });
      return;
    }

    const params = {
      opcion: 1,
      filter: searchWord,
      conductor: true,
    };

    const conductores = await this.fetchFiltrarConductor(params);

    this.setState({
      conductoresPublico: conductores,
    });
  };

  handleSelectItemConductorPublico = (value) => {
    this.refConductorPublico.current.initialize(
      `${value.documento}, ${value.informacion}`,
      true,
    );
    this.setState({
      conductorPublico: value,
      conductoresPublico: [],
    });
  };

  //------------------------------------------------------------------------------------------
  // Filtrar ubigeo partida
  //------------------------------------------------------------------------------------------
  handleClearInputaUbigeoPartido = () => {
    this.setState({
      ubigeosPartida: [],
      idUbigeoPartida: 0,
    });
  };

  handleFilterUbigeoPartido = async (text) => {
    const searchWord = text;
    this.setState({ idUbigeoPartida: 0 });

    if (isEmpty(searchWord)) {
      this.setState({ ubigeosPartida: [] });
      return;
    }

    const params = {
      filtrar: searchWord,
    };

    const ubigeos = await this.fetchFiltrarUbigeo(params);

    this.setState({
      ubigeosPartida: ubigeos,
    });
  };

  handleSelectItemUbigeoPartido = (value) => {
    this.refUbigeoPartida.current.initialize(
      `${value.departamento} - ${value.provincia} - ${value.distrito} (${value.ubigeo})`,
      true,
    );
    this.setState({
      ubigeosPartida: [],
      idUbigeoPartida: value.idUbigeo,
    });
  };

  //------------------------------------------------------------------------------------------
  // Filtrar ubigeo llegada
  //------------------------------------------------------------------------------------------
  handleClearInputaUbigeoLlegada = () => {
    this.setState({
      ubigeosLlegada: [],
      idUbigeoLlegada: 0,
    });
  };

  handleFilterUbigeoLlegada = async (text) => {
    const searchWord = text;
    this.setState({ idUbigeoLlegada: 0 });

    if (isEmpty(searchWord)) {
      this.setState({ ubigeosLlegada: [] });
      return;
    }

    const params = {
      filtrar: searchWord,
    };

    const ubigeos = await this.fetchFiltrarUbigeo(params);

    this.setState({
      ubigeosLlegada: ubigeos,
    });
  };

  handleSelectItemUbigeoLlegada = (value) => {
    this.refUbigeoLlegada.current.initialize(
      `${value.departamento} - ${value.provincia} - ${value.distrito} (${value.ubigeo})`,
      true,
    );
    this.setState({
      ubigeosLlegada: [],
      idUbigeoLlegada: value.idUbigeo,
    });
  };

  //------------------------------------------------------------------------------------------
  // Evento para guardar la guía de remisión
  //------------------------------------------------------------------------------------------
  handleSave = async () => {
    if (
      this.state.idMotivoTraslado === MOTIVO_TRASLADO.VENTA
      &&
      !this.state.venta
    ) {
      alertKit.warning({
        title: 'Guía de Remisión',
        message: 'Filtre una venta para continuar.',
      }, () => {
        this.refFiltrarVenta.current.focus();
      });
      return;
    }


    if (isEmpty(this.state.idMotivoTraslado)) {
      alertKit.warning({
        title: 'Guía de Remisión',
        message: 'Seleccione el motivo de traslado.',
      }, () => {
        this.refMotivoTraslado.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idTipoPeso)) {
      alertKit.warning({
        title: 'Guía de Remisión',
        message: 'Seleccione el tipo de peso.',
      }, () => {
        this.refTipoPeso.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.peso)) {
      alertKit.warning({
        title: 'Guía de Remisión',
        message: 'Ingrese el peso total.',
      }, () => {
        this.refPeso.current.focus();
      });
      return;
    }

    if (
      this.state.idModalidadTraslado === MODALIDAD_TRASLADO.TRANSPORTE_PUBLICO &&
      isEmpty(this.state.conductorPublico)
    ) {
      alertKit.warning({
        title: 'Guía de Remisión',
        message: 'Seleccione el conductor que va trandportar.',
      }, () => {
        this.refFiltrarConductorPublico.current.focus();
      });
      return;
    }

    if (
      this.state.idModalidadTraslado === MODALIDAD_TRASLADO.TRANSPORTE_PRIVADO &&
      isEmpty(this.state.vehiculo)
    ) {
      alertKit.warning({
        title: 'Guía de Remisión',
        message: 'Seleccione el vehículo que va transportar.',
      }, () => {
        this.refFiltrarVehiculo.current.focus();
      });
      return;
    }

    if (
      this.state.idModalidadTraslado === MODALIDAD_TRASLADO.TRANSPORTE_PRIVADO &&
      isEmpty(this.state.conductor)
    ) {
      alertKit.warning({
        title: 'Guía de Remisión',
        message: 'Seleccione el conductor que va transportar.',
      }, () => {
        this.refFiltrarConductor.current.focus();
      });
      return;
    }

    if (
      this.state.idModalidadTraslado === MOTIVO_TRASLADO.TRASLADO_ENTRE_ESTABLECIMIENTO_MISMA_EMPRESA &&
      isEmpty(this.state.codigoAnexoPartida)
    ) {
      alertKit.warning({
        title: 'Guía de Remisión',
        message: 'Ingrese el código de anexo de partida.',
      }, () => {
        this.refCodigoAnexoPartida.current.focus();
      });
      return;
    }


    if (isEmpty(this.state.direccionPartida)) {
      alertKit.warning({
        title: 'Guía de Remisión',
        message: 'Ingrese la dirección de partida.',
      }, () => {
        this.refDireccionPartida.current.focus();
      });
      return;
    }

    if (
      isEmpty(this.state.idUbigeoPartida) ||
      this.state.idUbigeoPartida <= 0
    ) {
      alertKit.warning({
        title: 'Guía de Remisión',
        message: 'Selecciona el ubigeo de partida.',
      }, () => {
        this.refFiltrarUbigeoPartida.current.focus();
      });
      return;
    }

    if (
      this.state.idModalidadTraslado === MOTIVO_TRASLADO.TRASLADO_ENTRE_ESTABLECIMIENTO_MISMA_EMPRESA &&
      isEmpty(this.state.codigoAnexoLlegada)
    ) {
      alertKit.warning({
        title: 'Guía de Remisión',
        message: 'Ingrese el código de anexo de llegada.',
      }, () => {
        this.refCodigoAnexoLlegada.current.focus();
      });
    }

    if (isEmpty(this.state.direccionLlegada)) {
      alertKit.warning({
        title: 'Guía de Remisión',
        message: 'Ingrese la dirección de llegada.',
      }, () => {
        this.refDireccionLlegada.current.focus();
      });
      return;
    }

    if (
      isEmpty(this.state.idUbigeoLlegada) ||
      this.state.idUbigeoLlegada <= 0
    ) {
      alertKit.warning({
        title: 'Guía de Remisión',
        message: 'Selecciona el ubigeo de llegada.',
      }, () => {
        this.refFiltrarUbigeoLlegada.current.focus();
      });
      return;
    }

    const accept = await alertKit.question({
      title: 'Guía de Remisión',
      message: '¿Está seguro de continuar?',
    });

    if (accept) {
      const data = {
        idGuiaRemision: this.state.idGuiaRemision,
        idVenta: this.state.venta?.idVenta ?? null,
        idTraslado: this.state.traslado?.idTraslado ?? null,

        idSucursal: this.state.idSucursal,
        idModalidadTraslado: this.state.idModalidadTraslado,
        idMotivoTraslado: this.state.idMotivoTraslado,
        fechaTraslado: this.state.fechaTraslado,
        idTipoPeso: this.state.idTipoPeso,
        peso: this.state.peso,
        idVehiculo: this.state.vehiculo.idVehiculo,
        idConductor:
          this.state.idModalidadTraslado === MODALIDAD_TRASLADO.TRANSPORTE_PUBLICO
            ? this.state.conductorPublico.idPersona
            : this.state.conductor.idPersona,

        codigoAnexoPartida: this.state.codigoAnexoPartida,
        direccionPartida: this.state.direccionPartida,
        idUbigeoPartida: this.state.idUbigeoPartida,

        codigoAnexoLlegada: this.state.codigoAnexoLlegada,
        direccionLlegada: this.state.direccionLlegada,
        idUbigeoLlegada: this.state.idUbigeoLlegada,

        detalles: this.state.detalles,
        estado: 1,
        idUsuario: this.state.idUsuario,
      };

      alertKit.loading({
        message: 'Procesando información...',
      });

      const response = await updateGuiaRemision(data);

      if (response instanceof SuccessReponse) {
        alertKit.close();
        this.handleOpenImpresion(response.data.idGuiaRemision);
      }

      if (response instanceof ErrorResponse) {
        if (response.getType() === CANCELED) return;

        alertKit.warning({
          title: 'Guía de Remisión',
          message: response.getMessage(),
        });
      }
    }
  };

  //------------------------------------------------------------------------------------------
  // Evento para cerrar la guía de remisión
  //------------------------------------------------------------------------------------------

  handleGoBack = () => {
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

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <ModalImpresion
          refModal={this.refModalImpresion}
          isOpen={this.state.isOpenImpresion}
          handleClose={this.handleCloseImpresion}
          handlePrinterA4={this.handlePrinterImpresion.bind(this, 'A4')}
          handlePrinter80MM={this.handlePrinterImpresion.bind(this, '80mm')}
          handlePrinter58MM={this.handlePrinterImpresion.bind(this, '58mm')}
        />

        <Title
          title="Guía Remisión"
          subTitle="EDITAR"
          icon={<i className="fa fa-edit"></i>}
          handleGoBack={this.handleGoBack}
        />

        <div className="mb-3">
          <div className="flex flex-wrap gap-3">
            <Button className="btn-warning" onClick={this.handleSave}>
              <i className="fa fa-save"></i> Guardar
            </Button>
            <Button className="btn-outline-danger" onClick={this.handleGoBack}>
              <i className="fa fa-close"></i> Cancelar
            </Button>
          </div>
        </div>


        <Form
          idMotivoTraslado={this.state.idMotivoTraslado}

          refFiltrarVenta={this.refFiltrarVenta}
          refVenta={this.refVenta}
          ventas={this.state.ventas}
          handleClearInputVenta={this.handleClearInputVenta}
          handleFilterVenta={this.handleFilterVenta}
          handleSelectItemVenta={this.handleSelectItemVenta}

          venta={this.state.venta}

          idModalidadTraslado={this.state.idModalidadTraslado}
          handleInputModalidadTraslado={this.handleInputModalidadTraslado}

          refMotivoTraslado={this.refMotivoTraslado}
          motivoTraslado={this.state.motivoTraslado}
          handleSelectMotivoTraslado={this.handleSelectMotivoTraslado}

          fechaTraslado={this.state.fechaTraslado}
          handleInputFechaTraslado={this.handleInputFechaTraslado}

          refTipoPeso={this.refTipoPeso}
          idTipoPeso={this.state.idTipoPeso}
          tipoPeso={this.state.tipoPeso}
          handleSelectTipoPeso={this.handleSelectTipoPeso}

          refPeso={this.refPeso}
          peso={this.state.peso}
          handleInputPeso={this.handleInputPeso}

          refVehiculo={this.refVehiculo}
          disabledPublica={this.state.disabledPublica}
          refFiltrarVehiculo={this.refFiltrarVehiculo}
          vehiculos={this.state.vehiculos}
          handleClearInputVehiculo={this.handleClearInputVehiculo}
          handleFilterVehiculo={this.handleFilterVehiculo}
          handleSelectItemVehiculo={this.handleSelectItemVehiculo}

          refConductor={this.refConductor}
          refFiltrarConductor={this.refFiltrarConductor}
          conductores={this.state.conductores}
          handleClearInputConductor={this.handleClearInputConductor}
          handleFilterConductor={this.handleFilterConductor}
          handleSelectItemConductor={this.handleSelectItemConductor}

          refConductorPublico={this.refConductorPublico}
          disabledPrivado={this.state.disabledPrivado}
          refFiltrarConductorPublico={this.refFiltrarConductorPublico}
          conductoresPublico={this.state.conductoresPublico}
          handleClearInputConductorPublico={this.handleClearInputConductorPublico}
          handleFilterConductorPublico={this.handleFilterConductorPublico}
          handleSelectItemConductorPublico={this.handleSelectItemConductorPublico}

          refCodigoAnexoPartida={this.refCodigoAnexoPartida}
          codigoAnexoPartida={this.state.codigoAnexoPartida}
          handleInputCodigoAnexoPartida={this.handleInputCodigoAnexoPartida}

          refDireccionPartida={this.refDireccionPartida}
          direccionPartida={this.state.direccionPartida}
          handleInputDireccionPartida={this.handleInputDireccionPartida}

          refUbigeoPartida={this.refUbigeoPartida}
          refFiltrarUbigeoPartida={this.refFiltrarUbigeoPartida}
          ubigeosPartida={this.state.ubigeosPartida}
          handleClearInputaUbigeoPartido={this.handleClearInputaUbigeoPartido}
          handleFilterUbigeoPartido={this.handleFilterUbigeoPartido}
          handleSelectItemUbigeoPartido={this.handleSelectItemUbigeoPartido}

          refCodigoAnexoLlegada={this.refCodigoAnexoLlegada}
          codigoAnexoLlegada={this.state.codigoAnexoLlegada}
          handleInputCodigoAnexoLlegada={this.handleInputCodigoAnexoLlegada}

          refDireccionLlegada={this.refDireccionLlegada}
          direccionLlegada={this.state.direccionLlegada}
          handleInputDireccionLlegada={this.handleInputDireccionLlegada}

          refUbigeoLlegada={this.refUbigeoLlegada}
          refFiltrarUbigeoLlegada={this.refFiltrarUbigeoLlegada}
          ubigeosLlegada={this.state.ubigeosLlegada}
          handleClearInputaUbigeoLlegada={this.handleClearInputaUbigeoLlegada}
          handleFilterUbigeoLlegada={this.handleFilterUbigeoLlegada}
          handleSelectItemUbigeoLlegada={this.handleSelectItemUbigeoLlegada}

          detalles={this.state.detalles}
        />
      </ContainerWrapper>
    );
  }
}

GuiaRemisionEditar.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string,
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
    token: state.principal,
  };
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */
const ConnectedGuiaRemisionCrear = connect(
  mapStateToProps,
  null,
)(GuiaRemisionEditar);

export default ConnectedGuiaRemisionCrear;
