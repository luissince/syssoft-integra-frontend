import {
  calculateTax,
  calculateTaxBruto,
  formatTime,
  isText,
  formatCurrency,
  rounded,
  isEmpty,
  formatNumberWithZeros,
} from '../../../../../helper/utils.helper';
import ContainerWrapper from '../../../../../components/ui/container-wrapper';
import CustomComponent from '@/components/CustomComponent';
import PropTypes from 'prop-types';
import {
  cancelAccountsReceivableVenta,
  createAccountsReceivableVenta,
  detailAccountsReceivableVenta,
  documentsPdfAccountReceivableVenta,
  documentsPdfInvoicesVenta,
} from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '@/constants/requestStatus';
import React from 'react';
import ModalProceso from './component/ModalProceso';
import printJS from 'print-js';
import { SpinnerView } from '../../../../../components/Spinner';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableResponsive,
  TableRow,
  TableTitle,
} from '../../../../../components/Table';
import { connect } from 'react-redux';
import Title from '../../../../../components/Title';
import Button from '../../../../../components/Button';
import ModalTransaccion from '../../../../../components/ModalTransaccion';
import pdfVisualizer from 'pdf-visualizer';
import {
  ModalImpresion,
  ModalSendWhatsApp,
} from '../../../../../components/MultiModal';
import { images } from '../../../../../helper';
import Image from '../../../../../components/Image';
import DropdownActions from '../../../../../components/DropdownActions';
import { alertKit } from 'alert-kit';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class CuentasPorCobrarAbonar extends CustomComponent {
  constructor(props) {
    super(props);

    this.state = {
      // Atributos de carga
      loading: true,
      msgLoading: "Cargando datos...",

      // Atributos principales
      idVenta: "",
      comprobante: "",
      serie: "",
      numeracion: 0,
      tipoDocumento: "",
      documento: "",
      informacion: "",
      plazo: "",
      fechaVencimiento: "",
      fecha: "",
      hora: "",
      nota: "",
      observacion: "",
      estado: "",
      codiso: "",
      usuario: "",

      total: 0,
      cobrado: 0,

      detalles: [],
      transaccion: [],

      // Atributos del modal de cobro
      isOpenProceso: false,
      monto: 0,

      // Atributos del modal cobrar
      isOpenTerminal: false,

      // Atributos del modal impresión
      isOpenImpresion: false,

      // Id principales
      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.usuario.idUsuario,
    };

    // Referencia del modal proceso
    this.refModalProceso = React.createRef();

    // Referencia para el modal impresión
    this.refModalImpresion = React.createRef();

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

    const response = await detailAccountsReceivableVenta(
      params,
      this.abortControllerView.signal,
    );

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      alertKit.warning({
        title: "Cuenta por Cobrar",
        message: response.getMessage(),
      }, () => {
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
      tipoDocumento,
      documento,
      informacion,
      plazo,
      fechaVencimiento,
      fecha,
      hora,
      estado,
      codiso,
      usuario,
      nota,
      observacion
    } = venta.cabecera;

    const nuevoEstado =
      estado === 1 ? (
        <span className="text-success">COBRADO</span>
      ) : estado === 2 ? (
        <span className="text-warning">POR COBRAR</span>
      ) : (
        <span className="text-danger">ANULADO</span>
      );

    this.setState({
      idVenta: id,
      comprobante: comprobante,
      serie: serie,
      numeracion: numeracion,
      tipoDocumento: tipoDocumento,
      documento: documento,
      informacion: informacion,
      plazo: plazo,
      fechaVencimiento: fechaVencimiento,
      fecha: fecha,
      hora: hora,
      estado: nuevoEstado,
      codiso: codiso,
      nota: nota,
      observacion: observacion,
      usuario: usuario,

      total: venta.resumen[0].total,
      pagado: venta.resumen[0].pagado,

      detalles: venta.detalles,
      transaccion: venta.transaccion,

      loading: false,
    });
  }

  close = () => {
    this.props.history.goBack();
  };

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
      title: "Cuentas Por Cobrar",
      titlePageNumber: "Página",
      titleLoading: "Cargando...",
    });
  };

  handlePrintAccountsPayable = async (idCuota, size) => {
    await pdfVisualizer.init({
      url: documentsPdfAccountReceivableVenta(
        idCuota,
        this.state.idVenta,
        size,
      ),
      title: "Cuentas Por Cobrar",
      titlePageNumber: "Página",
      titleLoading: "Cargando...",
    });
  };

  //------------------------------------------------------------------------------------------
  // Eventos del modal cobro
  //------------------------------------------------------------------------------------------

  handleOpenModalProceso = () => {
    this.setState({ isOpenProceso: true });
  };

  handleCloseModalProceso = () => {
    this.setState({ isOpenProceso: false });
  };

  handleActionModalProceso = async (monto) => {
    this.setState({
      monto: Number(monto),
    }, () => {
      this.handleOpenModalTerminal();
    });
  };

  //------------------------------------------------------------------------------------------
  // Acciones del modal terminal
  //------------------------------------------------------------------------------------------
  handleOpenModalTerminal = () => {
    this.setState({ isOpenTerminal: true });
  };

  handleProcessContado = async (
    _,
    metodoPagosLista,
    notaTransacion,
    callback = async function () { },
  ) => {
    const { idVenta, idSucursal, idUsuario, monto } = this.state;

    const accept = await alertKit.question({
      title: "Cuenta por Pagar",
      message: "¿Estás seguro de continuar?",
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      const data = {
        idVenta,
        idSucursal,
        idUsuario,
        monto,
        notaTransacion,
        bancosAgregados: metodoPagosLista,
      };

      await callback();

      alertKit.loading({
        message: "Procesando información...",
      });
      const response = await createAccountsReceivableVenta(data);

      if (response instanceof SuccessReponse) {
        alertKit.close();
        this.loadingData(this.state.idCompra);
      }

      if (response instanceof ErrorResponse) {
        if (response.getType() === CANCELED) return;

        alertKit.warning({
          title: "Cuenta por Cobrar",
          message: response.getMessage(),
        });
      }
    }
  };

  handleCloseModalTerminal = async () => {
    this.setState({ isOpenTerminal: false });
  };

  //------------------------------------------------------------------------------------------
  // Accion para anular el cobro
  //------------------------------------------------------------------------------------------
  handleCancelTransaction = async (idTransaccion) => {
    const accept = await alertKit.question({
      title: "Cuenta por Cobrar",
      message: '¿Estás seguro de anular?',
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      const params = {
        idVenta: this.state.idVenta,
        idTransaccion: idTransaccion,
        idUsuario: this.state.idUsuario,
      };

      alertKit.loading({
        message: "Procesando información...",
      });

      const response = await cancelAccountsReceivableVenta(params);

      if (response instanceof SuccessReponse) {
        alertKit.success({
          title: "Cuenta por Cobrar",
          message: response.data,
        }, () => {
          this.close();
        });
      }

      if (response instanceof ErrorResponse) {
        if (response.getType() === CANCELED) return;

        alertKit.warning({
          title: "Cuenta por Cobrar",
          message: response.getMessage(),
        });
      }
    }
  };

  //------------------------------------------------------------------------------------------
  // Procesos impresión
  //------------------------------------------------------------------------------------------
  handleOpenImpresion = (idCuota) => {
    this.setState({ isOpenImpresion: true, idCuota: idCuota });
  };

  handlePrinterImpresion = (size) => {
    pdfVisualizer.printer({
      printable: documentsPdfAccountReceivableVenta(
        this.state.idCuota,
        this.state.idVenta,
        size,
      ),
      type: 'pdf',
      showModal: true,
      modalMessage: 'Recuperando documento...',
      onPrintDialogClose: () => {
        this.handleCloseImpresion();
      },
    })
  };

  handleCloseImpresion = () => {
    this.setState({ isOpenImpresion: false });
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

  renderDetalles() {
    return this.state.detalles.map((item, index) => (
      <tr key={index} className="hover:bg-gray-50">
        <td className="p-4 text-gray-700">{item.id}</td>
        <td className="p-4 text-center">
          <Image
            default={images.noImage}
            src={item.imagen}
            alt={item.producto}
            width={80}
            className="mx-auto rounded border border-gray-200"
          />
        </td>
        <td className="p-4 text-gray-700">
          <div className="font-mono text-sm text-gray-500">{item.codigo}</div>
          <div>{item.producto}</div>
        </td>
        <td className="p-4 text-gray-700">{item.medida}</td>
        <td className="p-4 text-gray-700">{item.categoria}</td>
        <td className="p-4 text-gray-700 text-right">{rounded(item.cantidad)}</td>
        <td className="p-4 text-gray-700 text-right">{item.impuesto}</td>
        <td className="p-4 text-gray-700 text-right">
          {formatCurrency(item.precio, this.state.codiso)}
        </td>
        <td className="p-4 text-gray-900 font-medium text-right">
          {formatCurrency(item.cantidad * item.precio, this.state.codiso)}
        </td>
      </tr>
    ));
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

        const existingImpuesto = acc.find(
          (imp) => imp.idImpuesto === item.idImpuesto,
        );

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
            <th className="p-2 text-gray-600 text-right">{impuesto.nombre}:</th>
            <td className="p-2 text-gray-900 font-medium text-right">
              {formatCurrency(impuesto.valor, this.state.codiso)}
            </td>
          </tr>
        );
      });
    };

    return (
      <>
        <tr>
          <th className="p-2 text-gray-600 text-right">SUB TOTAL:</th>
          <td className="p-2 text-gray-900 font-medium text-right">
            {formatCurrency(subTotal, this.state.codiso)}
          </td>
        </tr>
        {impuestosGenerado()}
        <tr>
          <td colSpan={2} className="py-2">
            <div className="border-t border-gray-200"></div>
          </td>
        </tr>
        <tr>
          <th className="p-2 text-gray-800 font-bold text-right text-lg">TOTAL:</th>
          <td className="p-2 text-gray-900 font-bold text-right text-lg">
            {formatCurrency(total, this.state.codiso)}
          </td>
        </tr>
      </>
    );
  }

  renderTransaciones() {
    if (isEmpty(this.state.transaccion)) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-12 text-center">
            No hay transacciones para mostrar.
          </td>
        </tr>
      );
    }

    return this.state.transaccion.map((item, index) => (
      <React.Fragment key={index}>
        {/* Transacción principal */}
        <tr className="hover:bg-gray-50 transition-colors">
          <td className="p-3 font-medium text-gray-800">{index + 1}</td>
          <td className="p-3">
            <div className="font-medium">{item.fecha}</div>
            <div className="text-sm text-gray-600">{formatTime(item.hora)}</div>
          </td>
          <td className="p-3 text-gray-800">{item.concepto}</td>
          <td className="p-3 text-gray-800">{item.nota}</td>
          <td className="p-3 text-gray-800">{item.usuario}</td>
          <td className="p3">
            <div className="w-full flex justify-center">
              <button
                className="px-4 py-2 bg-red-500 border border-red-600 text-sm font-medium rounded text-white hover:bg-red-600 flex items-center gap-2"
                onClick={() => this.handleCancelTransaction(item.idTransaccion)}
              >
                <i className="fa fa-trash"></i> Quitar
              </button>
            </div>
          </td>
        </tr>

        {/* Detalles de la transacción */}
        <tr className="px-6 py-0 bg-gray-50">
          <td colSpan={6}>
            <div className="flex flex-row items-center gap-3 p-3">
              {item.detalles.map((detalle, idx) => (
                <div key={idx} className="w-60 flex flex-col gap-3 rounded p-3 bg-white">
                  <p className="text-sm text-gray-600">Banco: {detalle.nombre}</p>
                  <p className="text-sm text-gray-600">Monto: {formatCurrency(detalle.monto, this.state.codiso)}</p>
                  <p className="text-sm text-gray-600">Nota: {detalle.observacion}</p>
                </div>
              ))}
            </div>
          </td>
        </tr>
      </React.Fragment>
    ));
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

          idCompra={this.state.idCompra}
          codiso={this.state.codiso}
          transaccion={this.state.transaccion}
          restante={Number(this.state.total - this.state.pagado)}

          handleAction={this.handleActionModalProceso}
        />

        <ModalTransaccion
          tipo={"Abonar"}
          title={"Completar Cobro"}
          isOpen={this.state.isOpenTerminal}
          idSucursal={this.state.idSucursal}
          disabledCredito={true}
          codiso={this.state.codiso}
          importeTotal={this.state.monto}
          onClose={this.handleCloseModalTerminal}
          handleProcessContado={this.handleProcessContado}
          handleProcessCredito={null}
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
          title="Cuentas por Cobrar"
          subTitle="DETALLE"
          handleGoBack={() => this.close()}
        />

        {/* Acciones */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            onClick={this.handlePrintInvoices.bind(this, 'A4')}
          >
            <i className="fa fa-print"></i> A4
          </button>
          <button
            className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            onClick={this.handlePrintInvoices.bind(this, '80mm')}
          >
            <i className="fa fa-print"></i> 80MM
          </button>
          <button
            className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            onClick={this.handlePrintInvoices.bind(this, '58mm')}
          >
            <i className="fa fa-print"></i> 58MM
          </button>
        </div>

        {/* Resumen de la compra */}
        <div className="mb-8 bg-white overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-800">Cabecera</h2>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {[
              { label: 'Comprobante:', value: this.state.comprobante },
              { label: 'Serie - Num.:', value: this.state.serie + '-' + formatNumberWithZeros(this.state.numeracion) },
              { label: 'Tipo Doc.:', value: this.state.tipoDocumento + " - " + this.state.documento },
              { label: 'Información:', value: this.state.informacion },
              { label: 'Plazo:', value: this.state.plazo },
              { label: 'Fecha de Venc.:', value: this.state.fechaVencimiento },
              { label: 'Fecha:', value: this.state.fecha },
              { label: 'Hora:', value: formatTime(this.state.hora) },
              { label: 'Nota:', value: this.state.nota },
              { label: 'Observación:', value: this.state.observacion },
              { label: 'Estado:', value: this.state.estado },
              { label: 'Usuario:', value: this.state.usuario },
              { label: 'Por Cobrar:', value: formatCurrency(this.state.total - this.state.cobrado, this.state.codiso) },
              { label: 'Total:', value: formatCurrency(this.state.total, this.state.codiso) },
              { label: 'Cobrado:', value: formatCurrency(this.state.cobrado, this.state.codiso) },
            ].map((item, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 py-2">
                <div className="text-base font-normal text-gray-600">{item.label}</div>
                <div className="text-sm md:col-span-3 text-gray-900">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalles de productos */}
        <div className="mb-8 bg-white overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Detalles</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left text-gray-600 text-sm">
                <tr>
                  <th className="p-4">#</th>
                  <th className="p-4">Imagen</th>
                  <th className="p-4">Producto</th>
                  <th className="p-4">Unidad</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4 text-right">Cantidad</th>
                  <th className="p-4 text-right">Impuesto</th>
                  <th className="p-4 text-right">Precio</th>
                  <th className="p-4 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {this.renderDetalles()}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totales (flotante a la derecha en desktop) */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-start-9 lg:col-span-4">
            <div className="bg-white  overflow-hidden">
              <table className="w-full text-right">
                <tbody>
                  {this.renderTotal()}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Transacciones */}
        <div className="bg-white overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Transacciones</h2>

            <button
              className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded"
              onClick={this.handleOpenModalProceso}
            >
              <i className="fa fa-plus"></i> Agregar Cobro
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full ">
              <thead className="bg-gray-50 text-left text-gray-600 text-sm">
                <tr>
                  <th className="p-4 font-medium">#</th>
                  <th className="p-4 font-medium">Fecha y Hora</th>
                  <th className="p-4 font-medium">Concepto</th>
                  <th className="p-4 font-medium">Nota</th>
                  <th className="p-4 font-medium">Usuario</th>
                  <th className="p-4 font-medium text-center">Anular</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {this.renderTransaciones()}
              </tbody>
            </table>
          </div>
        </div>
      </ContainerWrapper>
    );
  }
}

CuentasPorCobrarAbonar.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      usuario: PropTypes.shape({
        idUsuario: PropTypes.string.isRequired,
      }),
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
    search: PropTypes.string,
  }),
  predeterminado: PropTypes.shape({
    empresa: PropTypes.shape({
      razonSocial: PropTypes.string,
    }),
  }),
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    predeterminado: state.predeterminado,
  };
};

const ConnectedCuentasPorCobrarAbonar = connect(
  mapStateToProps,
  null,
)(CuentasPorCobrarAbonar);

export default ConnectedCuentasPorCobrarAbonar;
