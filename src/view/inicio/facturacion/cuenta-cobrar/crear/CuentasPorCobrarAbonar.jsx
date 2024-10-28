import ContainerWrapper from "../../../../../components/Container";
import CustomComponent from "../../../../../model/class/custom-component";
import {
  calculateTax,
  calculateTaxBruto,
  formatTime,
  isText,
  numberFormat,
  rounded
} from "../../../../../helper/utils.helper";
import PropTypes from 'prop-types';
import { cancelAccountsReceivableVenta, createAccountsReceivableVenta, detailAccountsReceivableVenta, documentsPdfAccountReceivableVenta, documentsPdfInvoicesVenta } from "../../../../../network/rest/principal.network";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow, TableTitle } from "../../../../../components/Table";
import { connect } from "react-redux";
import Title from "../../../../../components/Title";
import Button from "../../../../../components/Button";
import ModalTransaccion from "../../../../../components/ModalTransaccion";
import SweetAlert from "../../../../../model/class/sweet-alert";
import pdfVisualizer from "pdf-visualizer";
import { ModalImpresion } from "../../../../../components/MultiModal";
import { images } from "../../../../../helper";

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

      // Atributos del modal enviar WhatsApp
      isOpenSendWhatsapp: false,

      // Atributos del modal de cobro
      isOpenProceso: false,
      cuota: null,
      monto: 0,

      // Atributos del modal cobrar
      isOpenTerminal: false,

      // Atributos del modal impresión
      isOpenImpresion: false,
      idCuota: '',


      // Id principales
      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,

    };

    this.alert = new SweetAlert();

    // Referencia del modal proceso
    this.refModalProceso = React.createRef();

    // Referencia para el modal impresión
    this.refModalImpresion = React.createRef();

    // Referencia para el modal enviar WhatsApp
    this.refModalSendWhatsapp = React.createRef();

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
      this.close();
    }
  }

  componentWillUnmount() {
    this.abortControllerView.abort();
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

  async loadingData(id) {
    const params = {
      idVenta: id,
    };

    const response = await detailAccountsReceivableVenta(params, this.abortControllerView.signal);

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.alert.warning('Cuenta por Cobrar', response.getMessage(), () => {
        this.close();
      });
      return;
    }

    response instanceof SuccessReponse;
    const venta = response.data;

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
    } = venta.cabecera;

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

      total: venta.resumen[0].total,
      cobrado: venta.resumen[0].cobrado,

      detalles: venta.detalles,
      cuotas: venta.cuotas,

      loading: false,
    });
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

  //------------------------------------------------------------------------------------------
  // Eventos para impresión
  //------------------------------------------------------------------------------------------
  handlePrintInvoices = async (size) => {
    await pdfVisualizer.init({
      url: documentsPdfInvoicesVenta(this.state.idVenta, size),
      title: 'Cuentas Por Cobrar',
      titlePageNumber: 'Página',
      titleLoading: 'Cargando...',
    });
  }

  handlePrintAccountsPayable = async (idCuota, size) => {
    await pdfVisualizer.init({
      url: documentsPdfAccountReceivableVenta(idCuota, this.state.idVenta, size),
      title: 'Cuentas Por Cobrar',
      titlePageNumber: 'Página',
      titleLoading: 'Cargando...',
    });
  }

  //------------------------------------------------------------------------------------------
  // Modal de enviar WhatsApp
  //------------------------------------------------------------------------------------------

  handleOpenSendWhatsapp = () => {
    this.setState({ isOpenSendWhatsapp: true });
  }

  handleProcessSendWhatsapp = async (phone, callback = async function () { }) => {
    const { razonSocial } = this.props.predeterminado.empresa;
    const { paginaWeb, email } = this.props.token.project;

    const companyInfo = {
      name: razonSocial,
      website: paginaWeb,
      email: email
    };

    const documentUrl = documentsPdfInvoicesVenta(this.state.idVenta, "A4");

    // Crear mensaje con formato
    const message = `
    Hola! Somos *${companyInfo.name}*
    
    Le enviamos su comprobante de venta:
    ${documentUrl}
    
    Para cualquier consulta, puede contactarnos:
    ${companyInfo.website}
    ${companyInfo.email}

    o escribiendo a nuestro whatsapp
    
    Gracias por su preferencia! :D`.trim();

    // Limpiar y formatear el número de teléfono
    const cleanPhone = phone.replace(/\D/g, '');

    // Crear la URL de WhatsApp
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    await callback();

    // Abrir en una nueva ventana
    window.open(whatsappUrl, '_blank');
  }

  handleCloseSendWhatsapp = () => {
    this.setState({ isOpenSendWhatsapp: false });
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

  handleProcessContado = (_, metodoPagosLista, notaTransacion, callback = async function () { }) => {
    const {
      idVenta,
      cuota,
      idUsuario,
      monto,
    } = this.state;

    this.alert.dialog('Cuenta por Cobrar', '¿Estás seguro de continuar?', async (accept) => {
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
        this.alert.information('Cuenta por Cobrar', 'Procesando información...');

        const response = await createAccountsReceivableVenta(data);

        if (response instanceof SuccessReponse) {
          this.alert.close();
          this.handleOpenImpresion(cuota.idCuota);
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          this.alert.warning('Cuenta por Cobrar', response.getMessage());
        }
      }
    });
  }

  handleCloseModalTerminal = async () => {
    this.setState({ isOpenTerminal: false })
  }

  //------------------------------------------------------------------------------------------
  // Accion para anular el cobro
  //------------------------------------------------------------------------------------------
  handleCancelSale = async (idCuota, idTransaccion) => {
    this.alert.dialog('Cuenta por Cobrar', '¿Estás seguro de anular?', async (accept) => {
      if (accept) {
        const params = {
          idCuota: idCuota,
          idTransaccion: idTransaccion,
          idVenta: this.state.idVenta
        }

        this.alert.information('Cuenta por Cobrar', 'Procesando información...');

        const response = await cancelAccountsReceivableVenta(params);

        if (response instanceof SuccessReponse) {
          this.alert.success('Cuenta por Cobrar', response.data, () => {
            this.close();
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          this.alert.warning('Cuenta por Cobrar', response.getMessage());
        }
      }
    });
  }

  //------------------------------------------------------------------------------------------
  // Procesos impresión
  //------------------------------------------------------------------------------------------
  handleOpenImpresion = (idCuota) => {
    this.setState({ isOpenImpresion: true, idCuota: idCuota });
  }

  handlePrinterImpresion = (size) => {
    printJS({
      printable: documentsPdfAccountReceivableVenta(this.state.idCuota, this.state.idVenta, size),
      type: 'pdf',
      showModal: true,
      modalMessage: "Recuperando documento...",
      onPrintDialogClose: () => {
        this.handleCloseImpresion();
      }
    });
  }

  handleCloseImpresion = () => {
    this.setState({ isOpenImpresion: false }, () => {
      this.close();
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

  opcionButtonOpcion(image, title, width, alt, onClick) {
    return (
      <li>
        <Button
          contentClassName="dropdown-item"
          onClick={onClick}>
          <img
            src={image}
            width={width}
            alt={alt}
          />{" "} {title}
        </Button>
      </li>
    );
  }

  renderDetalle() {
    return (
      this.state.detalles.map((item, index) => (
        <TableRow key={index}>
          <TableCell>{++index}</TableCell>
          <TableCell>{item.producto}</TableCell>
          <TableCell>{item.medida}</TableCell>
          <TableCell>{item.categoria}</TableCell>
          <TableCell className="text-right">{rounded(item.cantidad)}</TableCell>
          <TableCell className="text-right">{item.impuesto}</TableCell>
          <TableCell className="text-right">{numberFormat(item.precio, this.state.codiso)}</TableCell>
          <TableCell className="text-right">
            {numberFormat(
              item.cantidad * item.precio,
              this.state.codiso,
            )}
          </TableCell>
        </TableRow>
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
          <TableRow key={index}>
            <TableHead className="text-right mb-2">{impuesto.nombre} :</TableHead>
            <TableHead className="text-right mb-2">
              {numberFormat(impuesto.valor, this.state.codiso)}
            </TableHead>
          </TableRow>
        );
      });
    }

    return (
      <>
        <TableRow>
          <TableHead className="text-right mb-2">SUB TOTAL :</TableHead>
          <TableHead className="text-right mb-2">
            {numberFormat(subTotal, this.state.codiso)}
          </TableHead>
        </TableRow>
        {impuestosGenerado()}
        <TableRow className="border-bottom"></TableRow>
        <TableRow>
          <TableHead className="text-right h5">TOTAL :</TableHead>
          <TableHead className="text-right h5">
            {numberFormat(total, this.state.codiso)}
          </TableHead>
        </TableRow>
      </>
    );
  }

  renderCuotas() {
    return (
      this.state.cuotas.map((cuota, index) => {
        let montoActual = cuota.monto;

        return <React.Fragment key={index}>
          <TableRow className="table-success">
            <TableCell className="text-center">{index + 1}</TableCell>
            <TableCell>{cuota.fecha}</TableCell>
            <TableCell>{"CUOTA " + cuota.cuota}</TableCell>
            <TableCell className={`${cuota.estado === 0 ? "text-danger" : "text-success"}`}>{cuota.estado === 0 ? "Por Cobrar" : "Cobrado"}</TableCell>
            <TableCell>{numberFormat(cuota.monto, this.state.codiso)}</TableCell>
            <TableCell className="text-center">
              <Button
                className="btn-warning"
                onClick={() => this.handleOpenModalProceso(cuota)}
                disabled={cuota.estado === 1 ? true : false}
              >
                <i className="fa fa-money"></i>
              </Button>
            </TableCell>
            <TableCell className="text-center">
              <div className="dropdown">
                <a
                  className="btn btn-light dropdown-toggle"
                  href="#"
                  role="button"
                  id="dropdownMenuLink"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="fa fa-th-list"></i>
                </a>

                <ul className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                  {this.opcionButtonOpcion(images.pdf, 'Archivo Pdf A4', 22, 'Pdf A4', this.handlePrintAccountsPayable.bind(this, cuota.idCuota, 'A4'))}
                  {this.opcionButtonOpcion(images.invoice, 'Archivo Pdf 80mm', 22, 'Pdf Ticket', this.handlePrintAccountsPayable.bind(this, cuota.idCuota, '80mm'))}
                  {this.opcionButtonOpcion(images.invoice, 'Archivo Pdf 58mm', 22, 'Pdf Ticket', this.handlePrintAccountsPayable.bind(this, cuota.idCuota, '54mm'))}
                </ul>
              </div>
            </TableCell>
          </TableRow>

          <TableRow><TableCell colSpan="7" className="pb-0">Cobros Asociados</TableCell></TableRow>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Fecha y Hora</TableHead>
            <TableHead>Concepto</TableHead>
            <TableHead colSpan={2}>Nota</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead className="text-center">Anular</TableHead>
          </TableRow>
          {
            cuota.transacciones.map((item, index) => {
              return (
                <React.Fragment key={index}>
                  <TableRow className="table-secondary">
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <span>{item.fecha}</span>
                      <br />
                      <span>{formatTime(item.hora)}</span>
                    </TableCell>
                    <TableCell>{item.concepto}</TableCell>
                    <TableCell colSpan={2}>{item.nota}</TableCell>
                    <TableCell>{item.usuario}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        className="btn-danger"
                        onClick={() => this.handleCancelSale(cuota.idCuota, item.idTransaccion)}
                      >
                        <i className="fa fa-close"></i>
                      </Button>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className=" text-center">#</TableCell>
                    <TableCell className="">Banco</TableCell>
                    <TableCell className="">Cobrado</TableCell>
                    <TableCell className="">Restante</TableCell>
                    <TableCell className="">Observación</TableCell>
                  </TableRow>
                  {
                    item.detalles.map((detalle, index) => {
                      montoActual = montoActual - detalle.monto;
                      return (
                        <TableRow key={index}>
                          <TableCell className="text-center">{index + 1}</TableCell>
                          <TableCell>{detalle.nombre}</TableCell>
                          <TableCell>{numberFormat(detalle.monto, this.state.codiso)}</TableCell>
                          <TableCell>{numberFormat(montoActual, this.state.codiso)}</TableCell>
                          <TableCell>{detalle.observacion}</TableCell>
                        </TableRow>
                      );
                    })
                  }
                </React.Fragment>
              );
            })
          }
          <TableRow>
            <TableCell colSpan="7">
              <hr />
            </TableCell>
          </TableRow>
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

        <ModalImpresion
          refModal={this.refModalImpresion}
          isOpen={this.state.isOpenImpresion}

          handleClose={this.handleCloseImpresion}
          handlePrinterA4={this.handlePrinterImpresion.bind(this, 'A4')}
          handlePrinter80MM={this.handlePrinterImpresion.bind(this, '80mm')}
          handlePrinter58MM={this.handlePrinterImpresion.bind(this, '58mm')}
        />

        <Title
          title='Cuentas por Cobrar'
          subTitle='DETALLE'
          handleGoBack={() => this.close()}
        />

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-light"
              onClick={this.handlePrintInvoices.bind(this, 'A4')}
            >
              <i className="fa fa-print"></i> A4
            </Button>
            {' '}
            <Button
              className="btn-light"
              onClick={this.handlePrintInvoices.bind(this, '80mm')}
            >
              <i className="fa fa-print"></i> 80MM
            </Button>
            {' '}
            <Button
              className="btn-light"
              onClick={this.handlePrintInvoices.bind(this, '58mm')}
            >
              <i className="fa fa-print"></i> 58MM
            </Button>
            {' '}
            <Button
              className="btn-light"
              onClick={this.handleOpenSendWhatsapp}
            >
              <i className="fa fa-whatsapp"></i> Whatsapp
            </Button>
          </Column>
        </Row>

        <Row>
          <Column className="col-lg-6 col-md-12">
            <TableResponsive>
              <Table className="table-light table-striped">
                <TableHeader>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal">
                      Comprobante
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.comprobante}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Cliente
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.cliente}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Fecha
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.fecha}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Notas
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.notas}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Forma de venta
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.formaPago}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Estado
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.estado}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Usuario
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.usuario}
                    </TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </TableResponsive>
          </Column>

          <Column className="col-lg-6 col-md-12" formGroup={true}>
            <TableResponsive>
              <Table className="table-light table-striped">
                <TableHeader>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Numero de Cuotas
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.numeroCuota}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Frecuencia
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.frecuenciaPago} DÍAS
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Total
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {numberFormat(this.state.total, this.state.codiso)}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal">
                      Cobrado
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal text-success">
                      {numberFormat(this.state.cobrado, this.state.codiso)}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal">
                      Por Cobrar
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal text-danger">
                      {numberFormat(this.state.total - this.state.cobrado, this.state.codiso)}
                    </TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </TableResponsive>
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive>
              <TableTitle>Detalle</TableTitle>
              <Table className="table-light table-striped">
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Impuesto</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {this.renderDetalle()}
                </TableBody>
              </Table>
            </TableResponsive>
          </Column>
        </Row>

        <Row>
          <Column className="col-lg-8 col-sm-12"></Column>
          <Column className="col-lg-4 col-sm-12">
            <Table classNameContent='w-100'>
              <TableHeader>{this.renderTotal()}</TableHeader>
            </Table>
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive>
              <TableTitle>Cuotas</TableTitle>
              <Table className="able-light">
                <TableHeader className="table-primary">
                  <TableRow className="table-primary">
                    <TableHead width={"5%"}>#</TableHead>
                    <TableHead width={"10%"}>Fecha de Cobro</TableHead>
                    <TableHead width={"10%"}>Cuota</TableHead>
                    <TableHead width={"10%"}>Estado</TableHead>
                    <TableHead width={"15%"}>Monto</TableHead>
                    <TableHead width={"5%"} className="text-center">Cobrar</TableHead>
                    <TableHead width={"5%"} className="text-center">Imprimir</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {this.renderCuotas()}
                </TableBody>
              </Table>
            </TableResponsive>
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
      paginaWeb: PropTypes.string,
      email: PropTypes.string,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    search: PropTypes.string
  }),
  predeterminado: PropTypes.shape({
    empresa: PropTypes.shape({
      razonSocial: PropTypes.string,
    })
  }),
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    predeterminado: state.predeterminado,
  };
};

const ConnectedCuentasPorCobrarAbonar = connect(mapStateToProps, null)(CuentasPorCobrarAbonar);

export default ConnectedCuentasPorCobrarAbonar;