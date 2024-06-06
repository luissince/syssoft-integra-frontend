import ContainerWrapper from "../../../../../components/Container";
import CustomComponent from "../../../../../model/class/custom-component";
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  calculateTax,
  calculateTaxBruto,
  formatTime,
  isEmpty,
  isNumeric,
  isText,
  numberFormat,
  rounded,
  validateNumericInputs
} from "../../../../../helper/utils.helper";
import { colletAccountsReceivableVenta, comboBanco, detailAccountsReceivableVenta, obtenerVentaPdf } from "../../../../../network/rest/principal.network";
import SuccessReponse from "../../../../../model/class/response";
import ErrorResponse from "../../../../../model/class/error-response";
import { CANCELED } from "../../../../../model/types/types";
import { CONTADO, CREDITO_FIJO, CREDITO_VARIABLE } from '../../../../../model/types/forma-pago';
import React from "react";
import ModalSale from "./component/ModalSale";
import printJS from "print-js";
import { SpinnerView } from "../../../../../components/Spinner";
import Row from "../../../../../components/Row";
import Column from "../../../../../components/Column";
import { TableResponsive } from "../../../../../components/Table";
import { connect } from "react-redux";

class CuentasPorPagarAmbonar extends CustomComponent {

  constructor(props) {
    super(props);
    this.state = {
      // Atributos de carga
      loading: true,
      msgLoading: 'Cargando datos...',

      // Atributos principales
      idVenta: '',
      comprobante: '',
      cliente: '',
      fecha: '',
      notas: '',
      formaPago: '',
      numeroCuota: 0,
      frecuenciaPago: '',
      estado: '',
      codiso: '',
      simbolo: '',
      usuario: '',

      total: 0,
      cobrado: 0,

      detalles: [],
      plazos: [],

      // Atributos del mdaol de cobro
      isOpenModalCobro: false,
      loadingModalCobro: false,
      nextModalCobro: false,
      idPlazo: 0,
      cobrar: '',
      monto: 0,
      bancos: [],
      bancosAgregados: [],
      observacion: '',

      // Id principales
      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    // Referencia y variable del modal cobro
    this.refCobrar = React.createRef();
    this.refMetodoPagoContenedor = React.createRef();
    this.refModalCobro = React.createRef();
    this.refMetodoContado = React.createRef();

    //Anular las peticiones
    this.abortControllerView = new AbortController();
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
    const idVenta = new URLSearchParams(url).get('idVenta');
    if (isText(idVenta)) {
      await this.loadingData(idVenta);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortControllerView.abort();
  }

  async loadingData(id) {
    const [factura, bancos] = await Promise.all([
      this.fetchIdFactura(id),
      this.fetchComboBanco(),
    ]);

    const {
      comprobante,
      serie,
      numeracion,
      documento,
      informacion,
      fecha,
      hora,
      idFormaPago,
      numeroCuota,
      frecuenciaPago,
      estado,
      simbolo,
      codiso,
      usuario,
    } = factura.cabecera;

    const nuevoEstado = estado === 1 ? <span className="text-success">COBRADO</span> : estado === 2 ? <span className="text-warning">POR COBRAR</span> : estado === 3 ? <span className="text-danger">ANULADO</span> : <span className="text-primary">POR LLEVAR</span>;

    const tipo = idFormaPago === CONTADO ? "CONTADO" : idFormaPago === CREDITO_FIJO ? "CREDITO FIJO" : idFormaPago === CREDITO_VARIABLE ? "CRÉDITO VARIABLE" : "PAGO ADELTANDO";

    this.setState({
      idVenta: id,
      comprobante: comprobante + '  ' + serie + '-' + numeracion,
      cliente: documento + ' - ' + informacion,
      fecha: fecha + ' ' + formatTime(hora),
      notas: '',
      formaPago: tipo,
      numeroCuota: parseInt(numeroCuota),
      frecuenciaPago: frecuenciaPago,
      estado: nuevoEstado,
      simbolo: simbolo,
      codiso: codiso,
      usuario: usuario,

      total: factura.resumen[0].total,
      cobrado: factura.resumen[0].cobrado,

      detalles: factura.detalles,
      plazos: factura.plazos,

      bancos,

      loading: false,
    });
  }

  async fetchIdFactura(id) {
    const params = {
      idVenta: id,
    };

    const response = await detailAccountsReceivableVenta(params, this.abortControllerView.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return false;
    }
  }

  async fetchComboBanco() {
    const response = await comboBanco(this.state.idSucursal, this.abortControllerView.signal);

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

  handlePrintA4 = () => {
    printJS({
      printable: obtenerVentaPdf(this.state.idVenta, "a4"),
      type: 'pdf',
      showModal: true,
      modalMessage: "Recuperando documento...",
      onPrintDialogClose: () => {
        console.log("onPrintDialogClose")
      }
    })
  }

  handlePrintTicket = () => {
    printJS({
      printable: obtenerVentaPdf(this.state.idVenta, "ticket"),
      type: 'pdf',
      showModal: true,
      modalMessage: "Recuperando documento...",
      onPrintDialogClose: () => {
        console.log("onPrintDialogClose")
      }
    })
  }

  //------------------------------------------------------------------------------------------
  // Eventos del modal cobro
  //------------------------------------------------------------------------------------------

  handleOpenModalCobro = (plazo) => {
    this.setState({ isOpenModalCobro: true, idPlazo: plazo.idPlazo, monto: plazo.monto })
  }

  handleOnOpenModalCobro = () => {
    let cobrado = 0;
    const plazo = this.state.plazos.find(item => item.idPlazo === this.state.idPlazo)
    if (plazo) {
      cobrado = plazo.ingresos.reduce((acc, item) => acc + item.monto, 0)
    }

    this.setState({ cobrar: this.state.monto - cobrado, loadingModalCobro: false });
  }

  handleOnHidden = () => {
    this.setState({
      nextModalCobro: false,
      cobrar: '',
      bancosAgregados: [],
      idPlazo: 0,
      observacion: '',
    });
  }

  handleCloseModalCobro = () => {
    this.setState({ isOpenModalCobro: false })
  }

  handleAddBancosAgregados = () => {
    const listAdd = this.state.bancosAgregados.find((item) => item.idBanco === this.refMetodoContado.current.value);

    if (listAdd) {
      return;
    }

    const metodo = this.state.bancos.find((item) => item.idBanco === this.refMetodoContado.current.value,);

    const item = {
      idBanco: metodo.idBanco,
      nombre: metodo.nombre,
      monto: '',
      vuelto: metodo.vuelto,
      descripcion: '',
    };

    this.setState((prevState) => ({
      bancosAgregados: [...prevState.bancosAgregados, item],
    }));
  };

  handleInputMontoBancosAgregados = (event, idBanco) => {
    const { value } = event.target;

    this.setState((prevState) => ({
      bancosAgregados: prevState.bancosAgregados.map((item) => {
        if (item.idBanco === idBanco) {
          return { ...item, monto: value ? value : '' };
        } else {
          return item;
        }
      }),
    }));
  };

  handleRemoveItemBancosAgregados = (idBanco) => {
    const bancosAgregados = this.state.bancosAgregados.filter((item) => item.idBanco !== idBanco);
    this.setState({ bancosAgregados });
  };

  handleNextModalCobro = () => {
    this.setState({ nextModalCobro: true }, () => {
      const metodo = this.state.bancos.find((item) => item.preferido === 1);

      this.refMetodoContado.current.value = metodo ? metodo.idBanco : '';

      if (metodo) {
        const item = {
          idBanco: metodo.idBanco,
          nombre: metodo.nombre,
          monto: '',
          vuelto: metodo.vuelto,
          descripcion: '',
        };

        this.setState((prevState) => ({
          bancosAgregados: [...prevState.bancosAgregados, item],
        }));
      }
    })
  }

  handleInputCobrar = (event) => {
    this.setState({ cobrar: event.target.value })
  }

  handleInputObservacion = (event) => {
    this.setState({ observacion: event.target.value })
  }

  handleSaveSale = async () => {
    if (!this.state.nextModalCobro) {
      if (!isNumeric(this.state.cobrar)) {
        alertWarning("Cobro", "Ingrese el monto a cobrar", () => {
          this.refCobrar.current.focus();
        })
        return;
      }
      this.handleNextModalCobro();
    } else {
      const {
        idVenta,
        idUsuario,
        idPlazo,
        cobrar,
        bancosAgregados,
        observacion
      } = this.state;


      // if (isEmpty(metodoPagoLista)) {
      //     alertWarning('Cobro', 'Tiene que agregar método de cobro para continuar.');
      //     return;
      // }

      // if (metodoPagoLista.filter((item) => !isNumeric(item.monto)).length !== 0) {
      //     alertWarning('Cobro', 'Hay montos del metodo de cobro que no tiene valor.', () => {
      //         validateNumericInputs(this.refMetodoPagoContenedor);
      //     });
      //     return;
      // }

      let metodoPagoLista = bancosAgregados.map(item => ({ ...item }));

      if (isEmpty(metodoPagoLista)) {
        alertWarning('Cobro', 'Tiene que agregar método de cobro para continuar.');
        return;
      }

      if (metodoPagoLista.filter((item) => !isNumeric(item.monto)).length !== 0) {
        alertWarning('Cobro', 'Hay montos del metodo de cobro que no tiene valor.', () => {
          validateNumericInputs(this.refMetodoPagoContenedor);
        });
        return;
      }

      const metodoCobroTotal = metodoPagoLista.reduce((accumulator, item) => (accumulator += parseFloat(item.monto)), 0);

      if (metodoPagoLista.length > 1) {
        if (metodoCobroTotal !== cobrar) {
          alertWarning('Cobro', 'Al tener mas de 2 métodos de cobro el monto debe ser igual al total.', () => {
            validateNumericInputs(this.refMetodoPagoContenedor);
          });
          return;
        }
      } else {
        const metodo = metodoPagoLista[0];
        if (metodo.vuelto === 1) {
          if (metodoCobroTotal < cobrar) {
            alertWarning('Cobro', 'El monto a cobrar es menor que el total.', () => {
              validateNumericInputs(this.refMetodoPagoContenedor);
            });
            return;
          }

          metodoPagoLista.forEach(item => {
            item.descripcion = `Pago con ${rounded(parseFloat(item.monto))} y su vuelto es ${rounded(parseFloat(item.monto) - cobrar)}`;
            item.monto = cobrar;
          });
        } else {
          if (metodoCobroTotal !== cobrar) {
            alertWarning('Cobro', 'El monto a cobrar debe ser igual al total.', () => {
              validateNumericInputs(this.refMetodoPagoContenedor);
            });
            return;
          }
        }
      }

      alertDialog('Cobro', '¿Está seguro de continuar?', async (accept) => {
        if (accept) {
          const data = {
            idVenta: idVenta,
            idUsuario: idUsuario,
            idPlazo: idPlazo,
            // idSucursal: idSucursal,
            estado: 1,
            observacion: observacion,
            bancosAgregados: metodoPagoLista,
          };

          this.handleCloseModalCobro();
          alertInfo('Cobro', 'Procesando información...');

          const response = await colletAccountsReceivableVenta(data);

          if (response instanceof SuccessReponse) {
            alertSuccess('Cobro', response.data, () => {
              // this.handleLimpiar();
            });
          }

          if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            alertWarning('Cobro', response.getMessage());
          }
        }
      });
    }
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

  renderTotal() {
    let subTotal = 0;
    let total = 0;

    for (const item of this.state.detalles) {
      const cantidad = item.cantidad;
      const valor = item.precio;

      const impuesto = item.porcentaje;

      const valorActual = cantidad * valor;
      const valorSubNeto = calculateTaxBruto(impuesto, valorActual);
      const valorImpuesto = calculateTax(impuesto, valorSubNeto);
      const valorNeto = valorSubNeto + valorImpuesto;

      subTotal += valorSubNeto;
      total += valorNeto;
    }

    const impuestosGenerado = () => {
      const resultado = this.state.detalles.reduce((acc, item) => {
        const total = item.cantidad * item.precio;
        const subTotal = calculateTaxBruto(item.porcentaje, total);
        const impuestoTotal = calculateTax(item.porcentaje, subTotal);

        const existingImpuesto = acc.find((imp) => imp.idImpuesto === item.idImpuesto,);

        if (existingImpuesto) {
          existingImpuesto.valor += impuestoTotal;
        } else {
          acc.push({
            idImpuesto: item.idImpuesto,
            nombre: item.impuesto,
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
              {numberFormat(impuesto.valor, this.state.codiso)}
            </th>
          </tr>
        );
      });
    }

    return (
      <>
        <tr>
          <th className="text-right mb-2">SUB TOTAL :</th>
          <th className="text-right mb-2">
            {numberFormat(subTotal, this.state.codiso)}
          </th>
        </tr>
        {impuestosGenerado()}
        <tr className="border-bottom"></tr>
        <tr>
          <th className="text-right h5">TOTAL :</th>
          <th className="text-right h5">
            {numberFormat(total, this.state.codiso)}
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

        <ModalSale
          refModal={this.refModalCobro}
          isOpen={this.state.isOpenModalCobro}
          onOpen={this.handleOnOpenModalCobro}
          onHidden={this.handleOnHidden}
          onClose={this.handleCloseModalCobro}

          loading={this.state.loadingModalCobro}

          refCobrar={this.refCobrar}
          cobrar={this.state.cobrar}
          handleInputCobrar={this.handleInputCobrar}

          nextModalCobro={this.state.nextModalCobro}

          refMetodoPagoContenedor={this.refMetodoPagoContenedor}
          refMetodoContado={this.refMetodoContado}
          monto={this.state.monto}

          observacion={this.state.observacion}
          handleInputObservacion={this.handleInputObservacion}

          idPlazo={this.state.idPlazo}
          plazos={this.state.plazos}

          bancos={this.state.bancos}
          codISO={this.state.codiso}
          bancosAgregados={this.state.bancosAgregados}
          handleAddBancosAgregados={this.handleAddBancosAgregados}
          handleInputMontoBancosAgregados={this.handleInputMontoBancosAgregados}
          handleRemoveItemBancosAgregados={this.handleRemoveItemBancosAgregados}

          handleSaveSale={this.handleSaveSale}
        />

        <Row>
          <Column>
            <div className="form-group">
              <h5>
                <span role="button" onClick={() => this.props.history.goBack()}>
                  <i className="bi bi-arrow-left-short"></i>
                </span>{' '}
                Cuentas por Cobrar
                <small className="text-secondary"> detalles</small>
              </h5>
            </div>
          </Column>
        </Row>

        <Row>
          <Column>
            <div className="form-group">
              <button
                type="button"
                className="btn btn-light"
                onClick={this.handlePrintA4}
              >
                <i className="fa fa-print"></i> A4
              </button> {' '}
              <button
                type="button"
                className="btn btn-light"
                onClick={this.handlePrintTicket}
              >
                <i className="fa fa-print"></i> Ticket
              </button>
            </div>
          </Column>
        </Row>

        <Row>
          <Column className="col-lg-6 col-md-12">
            <div className="form-group">
              <div className="table-responsive">
                <table width="100%">
                  <thead>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        Comprobante
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.comprobante}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        Cliente
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.cliente}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        Fecha
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.fecha}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        Notas
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.notas}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        Forma de venta
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.formaPago}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        Estado
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.estado}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        Usuario
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.usuario}
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
          </Column>

          <Column className="col-lg-6 col-md-12">
            <div className="form-group">
              <div className="table-responsive">
                <table width="100%">
                  <thead>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        Numero de Cuotas
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.numeroCuota}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        Frecuencia
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.frecuenciaPago} DÍAS
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        Total
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {numberFormat(this.state.total, this.state.codiso)}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal">
                        Cobrado
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal text-success">
                        {numberFormat(this.state.cobrado, this.state.codiso)}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal">
                        Por Cobrar
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal text-danger">
                        {numberFormat(this.state.total - this.state.cobrado, this.state.codiso)}
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive
              title={"Detalle"}
              className={"table table-light table-striped"}
              tHead={
                <tr>
                  <th>#</th>
                  <th>Concepto</th>
                  <th>Unidad</th>
                  <th>Categoría</th>
                  <th>Cantidad</th>
                  <th>Impuesto</th>
                  <th>Precio</th>
                  <th>Monto</th>
                </tr>
              }
              tBody={this.state.detalles.map((item, index) => (
                <tr key={index}>
                  <td>{++index}</td>
                  <td>{item.producto}</td>
                  <td>{item.medida}</td>
                  <td>{item.categoria}</td>
                  <td className="text-right">{rounded(item.cantidad)}</td>
                  <td className="text-right">{item.impuesto}</td>
                  <td className="text-right">
                    {numberFormat(item.precio, this.state.codiso)}
                  </td>
                  <td className="text-right">
                    {numberFormat(
                      item.cantidad * item.precio,
                      this.state.codiso,
                    )}
                  </td>
                </tr>
              ))}
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-lg-8 col-sm-12"></Column>
          <Column className="col-lg-4 col-sm-12">
            <table width="100%">
              <thead>{this.renderTotal()}</thead>
            </table>
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive
              title={"Cuotas"}
              className={"table table-light"}
              tHead={
                <tr>
                  <th>#</th>
                  <th>Fecha de Cobro</th>
                  <th>Cuota</th>
                  <th>Estado</th>
                  <th>Monto</th>
                  <th>Cobrar</th>
                  <th>Imprimir</th>
                </tr>
              }
              tBody={
                this.state.plazos.map((plazo, index) => {
                  let montoActual = plazo.monto;

                  return <React.Fragment key={index}>
                    <tr className="table-success">
                      <td className="text-center">{index + 1}</td>
                      <td>{plazo.fecha}</td>
                      <td>{"CUOTA " + plazo.cuota}</td>
                      <td className={`${plazo.estado === 0 ? "text-danger" : "text-success"}`}>{plazo.estado === 0 ? "Por Cobrar" : "Cobrado"}</td>
                      <td>{numberFormat(plazo.monto, this.state.codiso)}</td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-warning btn-sm"
                          onClick={() => this.handleOpenModalCobro(plazo)}
                          disabled={plazo.estado === 1 ? true : false}
                        >
                          <i className="fa fa-money"></i>
                        </button>
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-light btn-sm"
                        >
                          <i className="fa fa-print"></i>
                        </button>
                      </td>
                    </tr>

                    <tr><td colSpan="7" className="pb-0">Cobros Asociados</td></tr>
                    <tr>
                      <td className="pb-0 text-center">#</td>
                      <td className="pb-0">Banco</td>
                      <td className="pb-0">Fecha</td>
                      <td className="pb-0">Cobrado</td>
                      <td className="pb-0">Restante</td>
                      <td className="pb-0">Observación</td>
                    </tr>
                    {
                      plazo.ingresos.map((ingreso, index) => {
                        montoActual = montoActual - ingreso.monto;
                        return (
                          <tr key={index}>
                            <td className="text-center">{index + 1}</td>
                            <td>{ingreso.nombre}</td>
                            <td>
                              {ingreso.fecha}
                              <br />
                              {formatTime(ingreso.hora)}
                            </td>
                            <td>{numberFormat(ingreso.monto, this.state.codiso)}</td>
                            <td>{numberFormat(montoActual, this.state.codiso)}</td>
                            <td>{ingreso.descripcion}</td>
                          </tr>
                        );
                      })
                    }
                    <tr>
                      <td colSpan="9">
                        <hr />
                      </td>
                    </tr>
                  </React.Fragment>
                })
              }
            />
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedCuentasPorPagarAmbonar = connect(mapStateToProps, null)(CuentasPorPagarAmbonar);

export default ConnectedCuentasPorPagarAmbonar;