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
  isText,
  numberFormat,
  rounded
} from "../../../../../helper/utils.helper";
import PropTypes from 'prop-types';
import { cancelAccountsReceivableVenta, createAccountsReceivableVenta, detailAccountsReceivableVenta, obtenerVentaPdf } from "../../../../../network/rest/principal.network";
import SuccessReponse from "../../../../../model/class/response";
import ErrorResponse from "../../../../../model/class/error-response";
import { CANCELED } from "../../../../../model/types/types";
import { CONTADO, CREDITO_FIJO, CREDITO_VARIABLE } from '../../../../../model/types/forma-pago';
import React from "react";
import ModalProceso from "./component/ModalProceso";
import printJS from "print-js";
import { SpinnerView } from "../../../../../components/Spinner";
import Row from "../../../../../components/Row";
import Column from "../../../../../components/Column";
import { TableResponsive } from "../../../../../components/Table";
import { connect } from "react-redux";
import Title from "../../../../../components/Title";
import Button from "../../../../../components/Button";
import ModalTransaccion from "../../../../../components/ModalTransaccion";

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class CuentasPorCobrarAbonar extends CustomComponent {

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
      cuotas: [],

      // Atributos del mdaol de cobro
      isOpenProceso: false,
      cuota: null,
      monto: 0,

      // Atributos del modal cobrar
      isOpenTerminal: false,

      // Id principales
      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    // Referencia del modal proceso
    this.refModalProceso = React.createRef();

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
    const [factura] = await Promise.all([
      this.fetchIdFactura(id),
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
      cuotas: factura.cuotas,

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

  handleOpenModalProceso = (cuota) => {
    this.setState({ isOpenProceso: true, cuota: cuota })
  }

  handleCloseModalProceso = () => {
    this.setState({ isOpenProceso: false, cuota: null })
  }

  handleActionProceso = async (cuota, monto) => {
    this.setState({
      cuota,
      monto: Number(monto),
    }, () => {
      this.handleOpenModalTerminal();
    })
  }

  //------------------------------------------------------------------------------------------
  // Acciones del modal terminal
  //------------------------------------------------------------------------------------------

  handleOpenModalTerminal = () => {
    this.setState({ isOpenTerminal: true })
  }

  handleProcessContado = (idFormaPago, metodoPagosLista, notaTransacion, callback = async function () { }) => {
    const {
      idVenta,
      cuota,
      idUsuario,
      monto,
    } = this.state;

    alertDialog('Cuenta por Cobrar', '¿Estás seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {

          idVenta,
          idCuota: cuota.idCuota,
          idUsuario,
          monto,
          notaTransacion,
          bancosAgregados: metodoPagosLista,
        };

        await callback();
        alertInfo('Cuenta por Cobrar', 'Procesando información...');

        const response = await createAccountsReceivableVenta(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Cuenta por Cobrar', response.data, () => {
            this.props.history.goBack()
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertWarning('Cuenta por Cobrar', response.getMessage());
        }
      }
    });
  }

  handleCloseModalTerminal = async () => {
    this.setState({ isOpenTerminal: false })
  }

  handleCancelSale = async (idCuota, idTransaccion) => {
    alertDialog('Cuenta por Cobrar', '¿Estás seguro de anular?', async (accept) => {
      if (accept) {
        const params = {
          idCuota: idCuota,
          idTransaccion: idTransaccion,
          idVenta: this.state.idVenta
        }

        alertInfo('Cuenta por Cobrar', 'Procesando información...');

        const response = await cancelAccountsReceivableVenta(params);

        if (response instanceof SuccessReponse) {
          alertSuccess('Cuenta por Cobrar', response.data, () => {
            this.props.history.goBack()
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertWarning('Cuenta por Cobrar', response.getMessage());
        }
      }
    });
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

  renderDetalle() {
    return (
      this.state.detalles.map((item, index) => (
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
      ))
    );
  }

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

  renderCuotas() {
    return (
      this.state.cuotas.map((cuota, index) => {
        let montoActual = cuota.monto;

        return <React.Fragment key={index}>
          <tr className="table-success">
            <td className="text-center">{index + 1}</td>
            <td>{cuota.fecha}</td>
            <td>{"CUOTA " + cuota.cuota}</td>
            <td className={`${cuota.estado === 0 ? "text-danger" : "text-success"}`}>{cuota.estado === 0 ? "Por Cobrar" : "Cobrado"}</td>
            <td>{numberFormat(cuota.monto, this.state.codiso)}</td>
            <td className="text-center">
              <Button
                className="btn-warning btn-sm"
                onClick={() => this.handleOpenModalProceso(cuota)}
                disabled={cuota.estado === 1 ? true : false}
              >
                <i className="fa fa-money"></i>
              </Button>
            </td>
            <td className="text-center">
              <Button
                className="btn-light btn-sm"
              >
                <i className="fa fa-print"></i>
              </Button>
            </td>
          </tr>

          <tr><td colSpan="7" className="pb-0">Cobros Asociados</td></tr>
          <tr>
            <th>#</th>
            <th>Fecha y Hora</th>
            <th>Concepto</th>
            <th colSpan={2}>Nota</th>
            <th>Usuario</th>
            <th className="text-center">Anular</th>
          </tr>
          {
            cuota.transacciones.map((item, index) => {
              return (
                <React.Fragment key={index}>
                  <tr className="table-secondary">
                    <td>{index + 1}</td>
                    <td>
                      <span>{item.fecha}</span>
                      <br />
                      <span>{formatTime(item.hora)}</span>
                    </td>
                    <td>{item.concepto}</td>
                    <td colSpan={2}>{item.nota}</td>
                    <td>{item.usuario}</td>
                    <td className="text-center">
                      <Button
                        className="btn-danger btn-sm"
                        onClick={() => this.handleCancelSale(cuota.idCuota, item.idTransaccion)}
                      >
                        <i className="fa fa-close"></i>
                      </Button>
                    </td>
                  </tr>

                  <tr>
                    <td className=" text-center">#</td>
                    <td className="">Banco</td>
                    <td className="">Cobrado</td>
                    <td className="">Restante</td>
                    <td className="">Observación</td>
                  </tr>
                  {
                    item.detalles.map((detalle, index) => {
                      montoActual = montoActual - detalle.monto;
                      return (
                        <tr key={index}>
                          <td className="text-center">{index + 1}</td>
                          <td>{detalle.nombre}</td>
                          <td>{numberFormat(detalle.monto, this.state.codiso)}</td>
                          <td>{numberFormat(montoActual, this.state.codiso)}</td>
                          <td>{detalle.observacion}</td>
                        </tr>
                      );
                    })
                  }
                </React.Fragment>
              );
            })
          }
          <tr>
            <td colSpan="7">
              <hr />
            </td>
          </tr>
        </React.Fragment>
      })
    );
  }

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <ModalProceso
          refModal={this.refModalProceso}
          isOpen={this.state.isOpenProceso}
          onClose={this.handleCloseModalProceso}

          codISO={this.state.codiso}
          cuota={this.state.cuota}
          cuotas={this.state.cuotas}

          handleAction={this.handleActionProceso}
        />

        <ModalTransaccion
          tipo={"Cobro"}
          title={"Completar Cobro"}
          isOpen={this.state.isOpenTerminal}

          idSucursal={this.state.idSucursal}
          disabledCreditoFijo={true}
          codiso={this.state.codiso}
          importeTotal={this.state.monto}

          onClose={this.handleCloseModalTerminal}
          handleProcessContado={this.handleProcessContado}
          handleProcessCredito={() => { }}
        />

        <Title
          title='Cuentas por Cobrar'
          subTitle='DETALLE'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-light"
              onClick={this.handlePrintA4}
            >
              <i className="fa fa-print"></i> A4
            </Button>
            {' '}
            <Button
              className="btn-light"
              onClick={this.handlePrintTicket}
            >
              <i className="fa fa-print"></i> Ticket
            </Button>
          </Column>
        </Row>

        <Row>
          <Column className="col-lg-6 col-md-12">
            <TableResponsive
              className={"table table-light table-striped"}
              tHead={
                <>
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
                </>
              }
            />
          </Column>

          <Column className="col-lg-6 col-md-12" formGroup={true}>
            <TableResponsive
              className={"table table-light table-striped"}
              tHead={
                <>
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
                </>
              }
            />
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
              tBody={this.renderDetalle()}
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
                <tr className="table-primary">
                  <th width={"5%"}>#</th>
                  <th width={"10%"}>Fecha de Cobro</th>
                  <th width={"10%"}>Cuota</th>
                  <th width={"10%"}>Estado</th>
                  <th width={"15%"}>Monto</th>
                  <th width={"5%"} className="text-center">Cobrar</th>
                  <th width={"5%"} className="text-center">Imprimir</th>
                </tr>
              }
              tBody={this.renderCuotas()}
            />
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

CuentasPorCobrarAbonar.propTypes = {
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
  location: PropTypes.shape({
    search: PropTypes.string
  })
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedCuentasPorCobrarAbonar = connect(mapStateToProps, null)(CuentasPorCobrarAbonar);

export default ConnectedCuentasPorCobrarAbonar;