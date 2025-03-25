import React from 'react';
import ContainerWrapper from '../../../../../../components/Container';
import CustomComponent from '../../../../../../model/class/custom-component';
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
  detailOnlyVenta,
  detailUpdateGuiaRemision,
  documentsPdfInvoicesGuiaRemision,
  filtrarPersona,
  filtrarVehiculo,
  getUbigeo,
  listFiltrarVenta,
  updateGuiaRemision
} from '../../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../../model/class/response';
import ErrorResponse from '../../../../../../model/class/error-response';
import { CANCELED } from '../../../../../../model/types/types';
import SearchInput from '../../../../../../components/SearchInput';
import { SpinnerView } from '../../../../../../components/Spinner';
import Row from '../../../../../../components/Row';
import Column from '../../../../../../components/Column';
import printJS from 'print-js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../../../../components/Table';
import Title from '../../../../../../components/Title';
import Button from '../../../../../../components/Button';
import Select from '../../../../../../components/Select';
import Input from '../../../../../../components/Input';
import RadioButton from '../../../../../../components/RadioButton';
import { ModalImpresion } from '../../../../../../components/MultiModal';
import SweetAlert from '../../../../../../model/class/sweet-alert';

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
      loadingVenta: false,
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

    this.alert = new SweetAlert();

    // Referencia de los atributos principales
    this.refMotivoTraslado = React.createRef();
    this.refTipoPeso = React.createRef();
    this.refPeso = React.createRef();

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
      await this.loadingData(idGuiaRemision);
    } else {
      this.close();
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

  close = () => {
    this.props.history.goBack();
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

  //------------------------------------------------------------------------------------------
  // Procesos impresión
  //------------------------------------------------------------------------------------------
  handleOpenImpresion = (idGuiaRemision) => {
    this.setState({ isOpenImpresion: true, idGuiaRemision: idGuiaRemision })
  }

  handlePrinterImpresion = (size) => {
    printJS({
      printable: documentsPdfInvoicesGuiaRemision(this.state.idGuiaRemision, size),
      type: 'pdf',
      showModal: true,
      modalMessage: "Recuperando documento...",
      onPrintDialogClose: () => {
        this.handleCloseImpresion()
      }
    })
  }

  handleCloseImpresion = async () => {
    this.setState({ isOpenImpresion: false }, () => {
      this.close();
    })
  }

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

    const params = {
      idSucursal: this.state.idSucursal,
      filtrar: searchWord,
    };

    const ventas = await this.fetchFiltrarVentas(params);

    this.setState({
      ventas: ventas,
    });
  };

  handleSelectItemVenta = (value) => {
    this.refVenta.current.initialize(`${value.nombreComprobante} ${value.serie}-${value.numeracion}`)
    this.setState({
      venta: value,
      ventas: [],
    }, async () => {

      this.setState({
        loading: true
      })
      const ventaDetalle = await this.fetchObtenerVentaDetalle();

      this.setState({
        detalle: ventaDetalle,
        loading: false
      })
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
      true
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
      conductor: true
    };

    const conductores = await this.fetchFiltrarConductor(params);

    this.setState({
      conductores: conductores,
    });
  };

  handleSelectItemConductor = (value) => {
    this.refConductor.current.initialize(
      `${value.documento}, ${value.informacion}`,
      true
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
      conductor: true
    };

    const conductores = await this.fetchFiltrarConductor(params);

    this.setState({
      conductoresPublico: conductores,
    });
  };

  handleSelectItemConductorPublico = (value) => {
    this.refConductorPublico.current.initialize(
      `${value.documento}, ${value.informacion}`,
      true
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
      idUbigeoPartida: ''
    });
  };

  handleFilterUbigeoPartido = async (text) => {
    const searchWord = text;
    this.setState({ idUbigeoPartida: '' });

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
      true
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
      idUbigeoLlegada: ''
    });
  };

  handleFilterUbigeoLlegada = async (text) => {
    const searchWord = text;
    this.setState({ idUbigeoLlegada: '' });

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
      true
    );
    this.setState({
      ubigeosLlegada: [],
      idUbigeoLlegada: value.idUbigeo,
    });
  };

  //------------------------------------------------------------------------------------------
  // Evento para guardar la guía de remisión
  //------------------------------------------------------------------------------------------
  handleSave = () => {
    if (!this.state.venta) {
      this.alert.warning("Guía de Remisión", "Filtre una venta para continuar.", () => {
        this.refFiltrarVenta.current.focus()
      })
      return;
    }

    if (isEmpty(this.state.idMotivoTraslado)) {
      this.alert.warning("Guía de Remisión", "Seleccione el motivo de traslado.", () => {
        this.refMotivoTraslado.current.focus()
      })
      return;
    }

    if (isEmpty(this.state.idTipoPeso)) {
      this.alert.warning("Guía de Remisión", "Seleccione el tipo de peso.", () => {
        this.refTipoPeso.current.focus()
      })
      return;
    }

    if (isEmpty(this.state.peso)) {
      this.alert.warning("Guía de Remisión", "Ingrese el peso total.", () => {
        this.refPeso.current.focus()
      })
      return;
    }

    if (this.state.idModalidadTraslado === "MT0001" && isEmpty(this.state.conductorPublico)) {
      this.alert.warning("Guía de Remisión", "Seleccione el conductor que va trandportar.", () => {
        this.refFiltrarConductorPublico.current.focus()
      })
      return;
    }


    if (this.state.idModalidadTraslado === "MT0002" && isEmpty(this.state.vehiculo)) {
      this.alert.warning("Guía de Remisión", "Seleccione el vehículo que va transportar.", () => {
        this.refFiltrarVehiculo.current.focus()
      })
      return;
    }

    if (this.state.idModalidadTraslado === "MT0002" && isEmpty(this.state.conductor)) {
      this.alert.warning("Guía de Remisión", "Seleccione el conductor que va transportar.", () => {
        this.refFiltrarConductor.current.focus()
      })
      return;
    }


    if (isEmpty(this.state.direccionPartida)) {
      this.alert.warning("Guía de Remisión", "Ingrese la dirección de partida.", () => {
        this.refDireccionPartida.current.focus()
      })
      return;
    }

    if (isEmpty(this.state.idUbigeoPartida) || this.state.idUbigeoPartida <= 0) {
      this.alert.warning("Guía de Remisión", "Selecciona el ubigeo de partida.", () => {
        this.refFiltrarUbigeoPartida.current.focus()
      })
      return;
    }

    if (isEmpty(this.state.direccionLlegada)) {
      this.alert.warning("Guía de Remisión", "Ingrese la dirección de llegada.", () => {
        this.refDireccionLlegada.current.focus()
      })
      return;
    }

    if (isEmpty(this.state.idUbigeoLlegada) || this.state.idUbigeoLlegada <= 0) {
      this.alert.warning("Guía de Remisión", "Selecciona el ubigeo de llegada.", () => {
        this.refFiltrarUbigeoLlegada.current.focus()
      })
      return;
    }

    this.alert.dialog("Guía de Remisión", "¿Está seguro de continuar?", async (accept) => {
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

        this.alert.information("Guía de Remisión", "Procesando información...")

        const response = await updateGuiaRemision(data);

        if (response instanceof SuccessReponse) {
          this.alert.close();
          this.handleOpenImpresion(response.data.idGuiaRemision);
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          this.alert.warning('Guía de Remisión', response.getMessage());
        }
      }
    })
  }

  //------------------------------------------------------------------------------------------
  // Evento para cerrar la guía de remisión
  //------------------------------------------------------------------------------------------

  handleBack = () => {
    this.close();
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
          refModal={this.refModalImpresion}
          isOpen={this.state.isOpenImpresion}

          handleClose={this.handleCloseImpresion}
          handlePrinterA4={this.handlePrinterImpresion.bind(this, 'A4')}
          handlePrinter80MM={this.handlePrinterImpresion.bind(this, '80mm')}
          handlePrinter58MM={this.handlePrinterImpresion.bind(this, '58mm')}
        />

        <Title
          title='Guía Remisión'
          subTitle='EDITAR'
          icon={<i className='fa fa-edit'></i>}
          handleGoBack={() => this.close()}
        />

        <Row>
          <Column className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12" formGroup={true}>
            <Button
              className="btn-warning"
              onClick={this.handleSave}>
              <i className='fa fa-save'></i> Guardar
            </Button>
            {" "}
            <Button
              className="btn-outline-danger"
              onClick={this.handleBack}>
              <i className='fa fa-close'></i> Cancelar
            </Button>
          </Column>
        </Row>

        {/* Seleccione la venta */}
        <h6><span className='badge badge-primary'>1</span> Venta y Guía</h6>

        <div className="dropdown-divider"></div>

        <Row>
          <Column>
            <SearchInput
              ref={this.refVenta}
              autoFocus={true}
              label={<>Filtrar Venta: <i className="fa fa-asterisk text-danger small"></i></>}
              placeholder="Ejm: B001, 1, F001..."
              refValue={this.refFiltrarVenta}
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
          <Column formGroup={true}>
            <Input
              label={<>Selecciona un Cliente: <i className="fa fa-asterisk text-danger small"></i></>}
              value={this.state.venta ? `${this.state.venta.documento} - ${this.state.venta.informacion}` : ''}
              disabled />
          </Column>
        </Row>

        {/* Sección para modalidad traslado */}
        <h6><span className='badge badge-primary'>3</span> Modalidad de Traslado</h6>

        <div className="dropdown-divider"></div>

        <Row>
          <Column formGroup={true}>
            <RadioButton
              id={"MT0001"}
              value={"MT0001"}
              name={"ckModalidadTraslado"}
              checked={this.state.idModalidadTraslado === 'MT0001'}
              onChange={this.handleInputModalidadTraslado}
            >
              Público
            </RadioButton>
          </Column>

          <Column formGroup={true}>
            <RadioButton
              id={"MT0002"}
              value={"MT0002"}
              name={"ckModalidadTraslado"}
              checked={this.state.idModalidadTraslado === 'MT0002'}
              onChange={this.handleInputModalidadTraslado}
            >
              Privado
            </RadioButton>
          </Column>
        </Row>

        {/* Sección para datos del traslado */}
        <h6><span className='badge badge-primary'>4</span> Datos del Traslado</h6>

        <div className="dropdown-divider"></div>

        <Row>
          <Column className='col-md-6 col-12' formGroup={true}>
            <Select
              label={<>Motivo del traslado: <i className="fa fa-asterisk text-danger small"></i></>}
              refSelect={this.refMotivoTraslado}
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
            </Select>
          </Column>


          <Column className='col-md-6 col-12' formGroup={true}>
            <Input
              label={<>Fecha traslado:{' '}<i className="fa fa-asterisk text-danger small"></i></>}
              type="date"
              value={this.state.fechaTraslado}
              onChange={async (event) => {
                this.setState({ fechaTraslado: event.target.value });
              }}
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6 col-12" formGroup={true}>
            <Select
              label={<>Tipo Peso de Carga: <i className="fa fa-asterisk text-danger small" /></>}
              refSelect={this.refTipoPeso}
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
            </Select>
          </Column>

          <Column className="col-md-6 col-12" formGroup={true}>
            <Input
              label={<>Peso de la Carga:{' '}<i className="fa fa-asterisk text-danger small"></i></>}
              placeholder="Ejm: 0.00, 0"
              refInput={this.refPeso}
              value={this.state.peso}
              onChange={(event) => {
                this.setState({ peso: event.target.value })
              }}
              onKeyDown={keyNumberFloat}
            />
          </Column>
        </Row>

        {/* Sección de datos del vehículo */}
        <h6><span className='badge badge-primary'>5</span> Datos del Transporte Privado</h6>

        <div className="dropdown-divider"></div>

        <Row>
          <Column>
            <SearchInput
              ref={this.refVehiculo}
              label={<>Filtrar un vehículo: <i className="fa fa-asterisk text-danger small"></i></>}
              disabled={this.state.disabledPublica}
              placeholder="Filtrar por marca o número de placa..."
              refValue={this.refFiltrarVehiculo}
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
            <SearchInput
              ref={this.refConductor}
              label={<>Filtrar un Conductor (DNI): <i className="fa fa-asterisk text-danger small"></i></>}
              disabled={this.state.disabledPublica}
              placeholder="Por número de documento o apellidos y nombres..."
              refValue={this.refFiltrarConductor}
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

            <SearchInput
              ref={this.refConductorPublico}
              label={<>Selecciona una Empresa (RUC): <i className="fa fa-asterisk text-danger small"></i></>}
              disabled={this.state.disabledPrivado}
              placeholder="Por número de documento o ruc..."
              refValue={this.refFiltrarConductorPublico}
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
              <Input
                group={true}
                iconLeft={<i className="bi bi-search"></i>}
                label={<>Dirección Partida: <i className="fa fa-asterisk text-danger small"></i></>}
                placeholder="Ingrese Dirección de partida..."
                refInput={this.refDireccionPartida}
                value={this.state.direccionPartida}
                onChange={(event) => {
                  this.setState({ direccionPartida: event.target.value })
                }}
              />
            </div>

            <div className="form-group">
              <SearchInput
                ref={this.refUbigeoPartida}
                label={<>Ubigeo Partida: <i className="fa fa-asterisk text-danger small"></i></>}
                placeholder="Filtrar departamento, distrito o provincia..."
                refValue={this.refFiltrarUbigeoPartida}
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
                renderIconLeft={<i className="bi bi-search"></i>}
              />
            </div>
          </Column>

          <Column className="col-md-6 col-12">
            <h6><span className='badge badge-primary'>9</span> Punto de llegada</h6>

            <div className="dropdown-divider"></div>

            <div className="form-group">
              <Input
                group={true}
                iconLeft={<i className="bi bi-search"></i>}
                label={<>Dirección Llegada: <i className="fa fa-asterisk text-danger small"></i></>}
                placeholder="Ingrese Dirección de llegada..."
                refInput={this.refDireccionLlegada}
                value={this.state.direccionLlegada}
                onChange={(event) => {
                  this.setState({ direccionLlegada: event.target.value })
                }}
              />
            </div>

            <div className="form-group">
              <SearchInput
                ref={this.refUbigeoLlegada}
                label={<>Ubigeo Llegada: <i className="fa fa-asterisk text-danger small"></i></>}
                placeholder="Filtrar departamento, distrito o provincia..."
                refValue={this.refFiltrarUbigeoLlegada}
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
                renderIconLeft={<i className="bi bi-search"></i>}
              />
            </div>
          </Column>
        </Row>

        <h6><span className='badge badge-primary'>10</span> Detalle de Guía de Remisión</h6>

        <Row>
          <Column>
            <TableResponsive>
              <Table className="table-bordered">
                <TableHeader>
                  <TableRow>
                    <TableHead width="5%" className="text-center">#</TableHead>
                    <TableHead width="10%">Código</TableHead>
                    <TableHead width="35%">Descripción</TableHead>
                    <TableHead width="15%">Und/Medida</TableHead>
                    <TableHead width="15%">Cantidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {
                    this.state.detalle.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-center">{++index}</TableCell>
                        <TableCell>{item.codigo}</TableCell>
                        <TableCell>{item.producto}</TableCell>
                        <TableCell>{item.medida}</TableCell>
                        <TableCell>{item.cantidad}</TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </TableResponsive>
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
    token: state.principal,
  };
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */
const ConnectedGuiaRemisionCrear = connect(mapStateToProps, null)(GuiaRemisionEditar);

export default ConnectedGuiaRemisionCrear;