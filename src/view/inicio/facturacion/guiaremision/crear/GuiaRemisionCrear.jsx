import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import {
  keyUpSearch,
  currentDate,
  spinnerLoading,
  alertDialog,
  alertWarning,
  keyNumberFloat,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { comboComprobante, comboMotivoTraslado, comboTipoPeso, createGuiaRemision, filtrarVehiculo, listFiltrar } from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import { GUIA_DE_REMISION } from '../../../../../model/types/tipo-comprobante';
import CustomModal from '../../../../../components/CustomModal';
import React from 'react';
import SearchInput from '../../../../../components/SearchInput';

class GuiaRemisionCrear extends CustomComponent {
  constructor(props) {
    super(props);

    this.state = {
      // Atributos de carga
      loading: true,
      msgLoading: 'Cargando datos...',

      // Atributos principales
      isOpen: false,
      idComprobante: '',
      idModalidadTraslado: 'MT0001',
      idMotivoTraslado: '',
      fechaTraslado: '',
      idTipoPeso: '',
      peso: '',

      cliente: '',
      disabledPublica: true,
      disabledPrivado: false,

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

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,

      fechaInicio: currentDate(),
      fechaFinal: currentDate(),
    };

    this.refVenta = React.createRef();

    // Filtrar producto
    this.refFiltrarVenta = React.createRef();
    this.selectItemVenta = false;

    // Filtrar vehículo
    this.refFiltrarVehiculo = React.createRef();
    this.selectItemVehiculo = false;

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
    const [comprobantes, motivoTraslado, tipoPeso] =
      await Promise.all([
        await this.fetchComprobante(GUIA_DE_REMISION),
        await this.fetchComboMotivoTraslado(),
        await this.fetchComboTipoPeso()
      ]);

    this.setState({
      comprobantes,
      idComprobante: comprobantes.length === 1 ? comprobantes[0].idComprobante : "",
      motivoTraslado,
      tipoPeso,
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
    const response = await listFiltrar(
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


  //------------------------------------------------------------------------------------------
  // Eventos para traer el modald de venta
  //------------------------------------------------------------------------------------------

  handleOpenPrint = () => {
    this.setState({ isOpen: true })
  }

  handleClosePrint = async () => {
    const data = this.refVenta.current;
    data.classList.add("close")
    data.addEventListener('animationend', () => {
      this.setState({ isOpen: false })
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

  handleSave() {

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
          estado: 1,
          idUsuario: this.state.idUsuario
        }

        const response = await createGuiaRemision(data);

        if (response instanceof SuccessReponse) {
          console.log(response.data)
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertWarning('Guía de Remisión"', response.getMessage());
        }
      }
    })
  }

  render() {
    return (
      <ContainerWrapper>
        {this.state.loading && spinnerLoading(this.state.msgLoading)}

        <CustomModal
          contentRef={(ref) => this.refVenta.current = ref}
          isOpen={this.state.isOpen}
          onOpen={() => {
            console.log("onOpen")
          }}
          onHidden={() => {
            console.log("onHidden")
          }}
          onClose={this.handleClosePrint}
          contentLabel="Modal de Impresión">

          <div className='w-100'>
            <div className='d-flex align-items-center justify-content-between py-2 px-3' style={{
              backgroundColor: 'rgba(0, 0, 0, 0.07)',
              borderBottom: '1px solid #dee2e6',
            }}>
              <p className='m-0'>SysSoft Integra</p>
              <button type="button"
                className='close'
                onClick={this.handleClosePrint}>
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div style={{ "position": "relative", flex: "1 1 auto", "padding": "1rem" }}>
              <div className='row'>
                <div className='col'>
                  <SearchInput
                    showLeftIcon={true}
                    autoFocus={true}
                    placeholder="Filtrar ventas..."
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
            </div>

            {/* <div className="d-flex flex-column align-items-center py-3 px-5">
              <h5>Opciones de impresión</h5>
              <div>
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
            </div> */}

            <div className='d-flex justify-content-end my-3 mx-0 pt-2 px-3' style={{
              borderTop: '1px solid #dee2e6',
            }}>
              <button type="button"
                className="btn btn-danger"
                onClick={this.handleClosePrint}>
                <i className="fa fa-close"></i> Cerrar
              </button>
            </div>
          </div>
        </CustomModal>

        <div className="row">
          <div className="col">
            <div className="form-group">
              <h5>
                <span role="button" onClick={() => this.props.history.goBack()}>
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
              className="btn btn-primary mr-2"
              onClick={() => this.handleSave()}
            >
              <i className='fa fa-save'></i>  Guardar
            </button>
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => this.props.history.goBack()}
            >
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
                  this.setStateAsync({ fechaTraslado: event.target.value });
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
              // customButton={() => (
              //   <button
              //     className="btn btn-outline-success d-flex align-items-center"
              //     onClick={() => {
              //       console.log("ddas")
              //     }}
              //     disabled={this.state.disabledPublica}>
              //     <i className='fa fa-plus'></i>
              //     <div className="ml-2">Nuevo</div>
              //   </button>
              // )}
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
              Selecciona un Conductor (DNI): <i className="fa fa-asterisk text-danger small"></i>
            </label>
            <SearchInput
              disabled={this.state.disabledPublica}
              showLeftIcon={false}
              placeholder="Ejm: B001, 1, F001..."
              refValue={this.refFiltrarVenta}
              value={this.state.filtrarVenta}
              data={this.state.ventas}
              handleClearInput={this.handleClearInputVenta}
              handleFilter={this.handleFilterVenta}
              handleSelectItem={this.handleSelectItemVenta}
              // customButton={() => (
              //   <button
              //     className="btn btn-outline-success d-flex align-items-center"
              //     onClick={() => {
              //       console.log("ddas")
              //     }}
              //     disabled={this.state.disabledPublica}>
              //     <i className='fa fa-plus'></i>
              //     <div className="ml-2">Nuevo</div>
              //   </button>
              // )}
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
              placeholder="Ejm: B001, 1, F001..."
              refValue={this.refFiltrarVenta}
              value={this.state.filtrarVenta}
              data={this.state.ventas}
              handleClearInput={this.handleClearInputVenta}
              handleFilter={this.handleFilterVenta}
              handleSelectItem={this.handleSelectItemVenta}
              // customButton={() => (
              //   <button
              //     className="btn btn-outline-success d-flex align-items-center"
              //     onClick={() => {
              //       console.log("ddas")
              //     }}
              //     disabled={this.state.disabledPrivado}>
              //     <i className='fa fa-plus'></i>
              //     <div className="ml-2">Nuevo</div>
              //   </button>
              // )}
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
                  ref={this.refTxtSearch}
                  onKeyUp={(event) =>
                    keyUpSearch(event, () =>
                      this.searchProveedor(event.target.value),
                    )
                  }
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
                  ref={this.refTxtSearch}
                  onKeyUp={(event) =>
                    keyUpSearch(event, () =>
                      this.searchProveedor(event.target.value),
                    )
                  }
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
                    <th width="15%">Peso (KG)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-center">1</td>
                    <td>10 UND</td>
                    <td>PROD0001/Pollo desmenuzado</td>
                    <td>S/. 25</td>
                    <td>S/. 1.8</td>
                    <td className="text-center">
                      <input
                        type='text'
                        className='form-control'
                        placeholder='0.00'
                      />
                    </td>
                  </tr>
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
