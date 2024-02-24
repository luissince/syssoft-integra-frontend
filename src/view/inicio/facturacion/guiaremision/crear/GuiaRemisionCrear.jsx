import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import {
  currentDate,
  spinnerLoading,
  alertDialog,
  alertWarning,
  keyNumberFloat,
  isEmpty,
  alertInfo,
  alertSuccess,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { comboComprobante, comboMotivoTraslado, comboTipoPeso, createGuiaRemision, detailOnlyVenta, filtrarPersona, filtrarVehiculo, getIdSucursal, getUbigeo, listFiltrarVenta } from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import { GUIA_DE_REMISION } from '../../../../../model/types/tipo-comprobante';
import React from 'react';
import SearchInput from '../../../../../components/SearchInput';
import { CustomModalContent } from '../../../../../components/CustomModal';
import printJS from 'print-js';
import { pdfA4GuiaRemision, pdfTicketGuiaRemision } from '../../../../../helper/lista-pdf.helper';

class GuiaRemisionCrear extends CustomComponent {
  constructor(props) {
    super(props);

    this.state = {
      // Atributos de carga
      loading: true,
      msgLoading: 'Cargando datos...',

      // Atributos principales
      idGuiaRemision: '',
      isOpen: false,
      idComprobante: '',
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
      comprobantes: [],
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
    this.refComprobante = React.createRef();
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

  async componentDidMount() {
    await this.loadData()
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  loadData = async () => {
    const [comprobantes, motivoTraslado, tipoPeso, sucursal] =
      await Promise.all([
        await this.fetchComprobante(GUIA_DE_REMISION),
        await this.fetchComboMotivoTraslado(),
        await this.fetchComboTipoPeso(),
        await this.fetchObtenerSucursal()
      ]);

    const ubigeo = {
      idUbigeo: sucursal.idUbigeo,
      departamento: sucursal.departamento,
      provincia: sucursal.provincia,
      distrito: sucursal.distrito,
      ubigeo: sucursal.ubigeo,
    };

    this.handleSelectItemUbigeoPartido(ubigeo);

    this.setState({
      comprobantes,
      idComprobante: comprobantes.length === 1 ? comprobantes[0].idComprobante : "",
      motivoTraslado,
      tipoPeso,
      direccionPartida: sucursal.direccion,
      loading: false
    })
  }

  //------------------------------------------------------------------------------------------
  // Peticiones HTTP
  //------------------------------------------------------------------------------------------


  async fetchComprobante(tipo) {
    const params = { tipo: tipo };

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

  async fetchObtenerSucursal() {
    const params = {
      idSucursal: this.state.idSucursal
    }

    const response = await getIdSucursal(params);

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

  //------------------------------------------------------------------------------------------
  // Eventos para traer el modald de venta
  //------------------------------------------------------------------------------------------
  handlePrintA4 = () => {
    printJS({
      printable: pdfA4GuiaRemision(this.state.idGuiaRemision),
      type: 'pdf',
      showModal: true,
      modalMessage: "Recuperando documento...",
      onPrintDialogClose: () => {
        console.log("onPrintDialogClose")
        this.setState(this.initial, async () => {
          await this.loadData()
        })
      }
    })
  }

  handlePrintTicket = () => {
    printJS({
      printable: pdfTicketGuiaRemision(this.state.idGuiaRemision),
      type: 'pdf',
      showModal: true,
      modalMessage: "Recuperando documento...",
      onPrintDialogClose: () => {
        console.log("onPrintDialogClose")
        this.setState(this.initial, async () => {
          await this.loadData()
        })
      }
    })
  }

  handleOpenPrint = (idGuiaRemision) => {
    this.setState({ isOpen: true, idGuiaRemision: idGuiaRemision })
  }

  handleClosePrint = async () => {
    const data = this.refPrinter.current;
    data.classList.add("close-cm")
    data.addEventListener('animationend', () => {
      this.setState({ isOpen: false }, () => {
        this.setState(this.initial, async () => {
          await this.loadData()
        })
      })
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

  handleSelectComprobante = (event) => {
    this.setState({ idComprobante: event.target.value })
  }

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

  handleClear() {
    alertDialog("Guía de Remisión", "¿Está seguro de limpiar todo el contenido?", (accept) => {
      if (accept) {
        this.setState(this.initial, async () => {
          await this.loadData()
        })
      }
    })
  }

  handleSave() {
    if (!this.state.venta) {
      alertWarning("Guía de Remisión", "Filtre una venta para continuar.", () => {
        this.refFiltrarVenta.current.focus()
      })
      return;
    }

    if (isEmpty(this.state.idComprobante)) {
      alertWarning("Guía de Remisión", "Seleccione un comprobante.", () => {
        this.refComprobante.current.focus()
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
    

    if(isEmpty(this.state.direccionPartida)){
      alertWarning("Guía de Remisión", "Ingrese la dirección de partida.", () => {
        this.refDireccionPartida.current.focus()
      })
      return;
    }

    if(isEmpty(this.state.idUbigeoPartida)){
      alertWarning("Guía de Remisión", "Selecciona el ubigeo de partida.", () => {
        this.refFiltrarUbigeoPartida.current.focus()
      })
      return;
    }

    if(isEmpty(this.state.direccionLlegada)){
      alertWarning("Guía de Remisión", "Ingrese la dirección de llegada.", () => {
        this.refDireccionPartida.current.focus()
      })
      return;
    }

    if(isEmpty(this.state.idUbigeoLlegada)){
      alertWarning("Guía de Remisión", "Selecciona el ubigeo de llegada.", () => {
        this.refFiltrarUbigeoLlegada.current.focus()
      })
      return;
    }

    alertDialog("Guía de Remisión", "¿Está seguro de continuar?", async (accept) => {
      if (accept) {
        const data = {
          idVenta: this.state.venta.idVenta,
          idSucursal: this.state.idSucursal,
          idComprobante: this.state.idComprobante,
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

        const response = await createGuiaRemision(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Guía de Remisión', response.data.message, () => {
            this.handleOpenPrint(response.data.idGuiaRemision);
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertWarning('Guía de Remisión', response.getMessage());
        }
      }
    })
  }

  render() {
    return (
      <ContainerWrapper>
        {this.state.loading && spinnerLoading(this.state.msgLoading)}

        <CustomModalContent
          contentRef={(ref) => this.refPrinter.current = ref}
          isOpen={this.state.isOpen}
          onClose={this.handleClosePrint}
          contentLabel="Modal de Impresión"
          titleHeader="SysSoft Integra"
          body={
            <>
              <h5 className='text-center'>Opciones de impresión</h5>
              <div className='d-flex justify-content-center align-items-center gap-2_5 mt-3'>
                <button type="button" className="btn btn-outline-info"
                  onClick={this.handlePrintA4}>
                  <i className="fa fa-file-pdf-o"></i> A4
                </button>
                {" "}
                <button type="button" className="btn btn-outline-info"
                  onClick={this.handlePrintTicket}>
                  <i className="fa fa-sticky-note"></i> Ticket
                </button>
              </div>
            </>
          }
          footer={
            <button type="button"
              className="btn btn-danger"
              onClick={this.handleClosePrint}>
              <i className="fa fa-close"></i> Cerrar
            </button>
          }
        />

        <div className="row">
          <div className="col">
            <div className="form-group">
              <h5>
                <span role="button" onClick={() => this.handleBack()}>
                  <i className="bi bi-arrow-left-short"></i>
                </span>{' '}
                Guía Remisión
                <small className="text-secondary"> Crear </small>
              </h5>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => this.handleSave()}>
              <i className='fa fa-save'></i>  Guardar
            </button>
            {" "}
            <button
              type="button"
              className="btn btn-outline-info"
              onClick={() => this.handleClear()}>
              <i className='fa fa-trash'></i>  Limiar
            </button>
            {" "}
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => this.handleBack()}>
              <i className='fa fa-close'></i>  Cancelar
            </button>
          </div>
        </div>

        <br />

        {/* Seleccione la venta */}
        <h6><span className='badge badge-primary'>1</span> Venta y Guía</h6>

        <div className="dropdown-divider"></div>

        <div className='row'>
          <div className='col'>
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
          </div>
        </div>

        {/* Sección del comprobante */}
        <div className="row">
          <div className="col">
            <div className="form-group">
              <label>
                Comprobante: <i className="fa fa-asterisk text-danger small"></i>
              </label>

              <div className="input-group">
                <select
                  className="form-control"
                  ref={this.refComprobante}
                  value={this.state.idComprobante}
                  onChange={this.handleSelectComprobante}>
                  <option value="">-- Seleccione --</option>
                  {
                    this.state.comprobantes.map((item, index) => (
                      <option key={index} value={item.idComprobante}>{item.nombre}</option>
                    ))
                  }
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de los datos del cliente */}
        <h6><span className='badge badge-primary'>2</span> Cliente</h6>

        <div className="dropdown-divider"></div>

        <div className="row">
          <div className="col">
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
          </div>
        </div>

        {/* Sección para modalidad traslado */}
        <h6><span className='badge badge-primary'>3</span> Modalidad de Traslado</h6>

        <div className="dropdown-divider"></div>

        <div className="row">
          <div className="col">
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
          </div>

          <div className='col'>
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
          </div>
        </div>

        {/* Sección para datos del traslado */}
        <h6><span className='badge badge-primary'>4</span> Datos del Traslado</h6>

        <div className="dropdown-divider"></div>

        <div className='row'>
          <div className='col-md-6 col-12'>
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
          </div>

          <div className='col-md-6 col-12'>
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
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 col-12">
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
          </div>

          <div className="col-md-6 col-12">
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
          </div>
        </div>

        {/* Sección de datos del vehículo */}
        <h6><span className='badge badge-primary'>5</span> Datos del Transporte Privado</h6>

        <div className="dropdown-divider"></div>

        <div className='row'>
          <div className='col'>
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
          </div>
        </div>

        {/* Sección de datos del conductor */}
        <h6><span className='badge badge-primary'>6</span> Datos del Conductor Privado</h6>

        <div className="dropdown-divider"></div>

        <div className='row'>
          <div className='col'>
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
          </div>
        </div>

        <h6><span className='badge badge-primary'>7</span> Datos de la Empresa a Transportar - Pública</h6>

        <div className="dropdown-divider"></div>

        <div className="row">
          <div className="col">
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
          </div>
        </div>

        <div className="dropdown-divider"></div>

        <div className="row">
          <div className="col-md-6 col-12">

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
          </div>

          <div className="col-md-6 col12">

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
          </div>
        </div>


        <h6><span className='badge badge-primary'>10</span> Detalle de Guía de Remisión</h6>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="table-responsive">
              <table className="table table-striped table-bordered rounded">
                <thead>
                  <tr>
                    <th width="5%" className="text-center">
                      #
                    </th>
                    <th width="10%">Código</th>
                    <th width="35%">Descripción</th>
                    <th width="15%">Und/Medida</th>
                    <th width="15%">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {
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
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
    token: state.reducer,
  };
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */
export default connect(mapStateToProps, null)(GuiaRemisionCrear);
