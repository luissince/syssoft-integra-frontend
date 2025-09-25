import {
  rounded,
  numberFormat,
  calculateTaxBruto,
  calculateTax,
  formatTime,
  isText,
  isEmpty,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../../components/Container';
import {
  detailVenta,
  documentsPdfInvoicesVenta,
} from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import CustomComponent from '../../../../../model/class/custom-component';
import {
  CONTADO,
  CREDITO_FIJO,
  CREDITO_VARIABLE,
} from '../../../../../model/types/forma-pago';
import Title from '../../../../../components/Title';
import { SpinnerView } from '../../../../../components/Spinner';
import PropTypes from 'prop-types';
import React from 'react';
import { ModalSendWhatsApp } from '../../../../../components/MultiModal';
import Image from '../../../../../components/Image';
import { images } from '../../../../../helper';
import Math from '@/model/ts/plugins/math';
import { alertKit } from 'alert-kit';
import { Capacitor } from '@capacitor/core';
import pdfVisualizer from 'pdf-visualizer';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class VentaDetalle extends CustomComponent {
  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

      idVenta: '',
      comprobante: '',
      cliente: '',
      celular: '',
      email: '',
      fecha: '',
      formaPago: '',
      estado: '',
      codiso: '',
      simbolo: '',
      total: '',
      usuario: '',
      observacion: '',
      nota: '',

      isPrintModalOpen: false,
      availablePrinters: null,
      selectedPrinter: null, // { type: 'BLUETOOTH' | 'USB', address: string, name: string }
      selectedSize: '58mm', // valor por defecto

      isOpenSendWhatsapp: false,

      detalles: [],
      transaccion: [],
    };

    // Referencia para el modal enviar WhatsApp
    this.refModalSendWhatsApp = React.createRef();

    // Anular las peticiones
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

    const response = await detailVenta(params, this.abortControllerView.signal);

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      alertKit.warning({
        title: 'Venta',
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
      documento,
      informacion,
      celular,
      email,
      fecha,
      hora,
      idFormaPago,
      estado,
      simbolo,
      codiso,
      usuario,
      observacion,
      nota,
    } = venta.cabecera;

    const monto = venta.detalles.reduce(
      (accumlate, item) => accumlate + item.precio * item.cantidad,
      0,
    );

    const nuevoEstado =
      estado === 1 ? (
        <span className="text-success">COBRADO</span>
      ) : estado === 2 ? (
        <span className="text-warning">POR COBRAR</span>
      ) : estado === 3 ? (
        <span className="text-danger">ANULADO</span>
      ) : (
        <span className="text-primary">POR LLEVAR</span>
      );

    const tipo =
      idFormaPago === CONTADO
        ? 'CONTADO'
        : idFormaPago === CREDITO_FIJO
          ? 'CREDITO FIJO'
          : idFormaPago === CREDITO_VARIABLE
            ? 'CRÉDITO VARIABLE'
            : 'PAGO ADELTANDO';

    this.setState({
      idVenta: id,
      comprobante: comprobante + '  ' + serie + '-' + numeracion,
      cliente: documento + ' - ' + informacion,
      celular: celular,
      email: email,
      fecha: fecha + ' ' + formatTime(hora),
      formaPago: tipo,
      estado: nuevoEstado,
      simbolo: simbolo,
      codiso: codiso,
      usuario: usuario,
      observacion: observacion,
      nota: nota,
      total: rounded(monto),

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

  // Este método se llama al hacer clic en cualquier botón de impresión
  handlePrintInvoices = async (size) => {
    const url = documentsPdfInvoicesVenta(this.state.idVenta, size);

    if (Capacitor.isNativePlatform()) {
      this.setState({ selectedSize: size });
      await this.loadAndOpenPrintModal();
    } else {

      await pdfVisualizer.init({
        url: url,
        title: 'Venta',
        titlePageNumber: 'Página',
        titleLoading: 'Cargando...',
      });
    }
  };

  // Carga impresoras y abre el modal
  loadAndOpenPrintModal = async () => {
    try {
      const permiso = await Math.requestBluetoothPermission();
      if (!permiso.granted) {
        alertKit.warning({ title: 'Impresión', message: 'Permiso de Bluetooth requerido para buscar impresoras.' }, () => {
          this.setState({ loading: false });
        });
        return;
      }

      alertKit.loading({ title: 'Cargando impresoras...' });

      const result = await Math.listPrinters();

      this.setState({
        availablePrinters: result,
        isPrintModalOpen: true,
      });

      alertKit.close();
    } catch (error) {
      alertKit.warning({ title: 'Impresión', message: 'No se pudieron cargar las impresoras. Asegúrese de que estén encendidas y emparejadas.' });
    }
  };

  handleSelectPrinter = (type, device) => {
    this.setState({
      selectedPrinter: {
        type,
        address: type === 'BLUETOOTH' ? device.address : '',
        vendorId: type === 'USB' ? device.vendorId : 0,
        productId: type === 'USB' ? device.productId : 0,
        name: device.name,
      },
    });
  };

  handleSelectSize = (size) => {
    this.setState({ selectedSize: size });
  };

  handleConfirmPrint = async () => {
    const { selectedPrinter, selectedSize, idVenta } = this.state;

    if (!selectedPrinter) {
      alertKit.warning({
        title: 'Impresión',
        message: 'Por favor seleccione una impresora.',
      });
      return;
    }

    // Generar URL de la imagen del ticket (debe ser accesible localmente o pública)
    const imageUrl = "https://firebasestorage.googleapis.com/v0/b/syssoftintegra-1215c.appspot.com/o/VENTA%20N002-004640%20-%20PUBLICO%20GENERAL_pages-to-jpg-0001.jpg?alt=media&token=66270de7-3eca-406f-a3c6-f03b2ff688f0";

    // Mapear tamaño a mm
    const widthMap = { '58mm': 58, '80mm': 80, 'A4': 210 };
    const widthMm = widthMap[selectedSize] || 58;

    try {
      alertKit.loading({ title: 'Enviando a la impresora...' });

      await Math.printTicket({
        type: selectedPrinter.type,
        address: selectedPrinter.address,
        vendorId: selectedPrinter.vendorId,
        productId: selectedPrinter.productId,

        widthMm,
        message: `Venta ${this.state.comprobante}`,
        imageUrl,
      });

      alertKit.close(() => {
        this.setState({ isPrintModalOpen: false });
      });
    } catch (error) {
      alertKit.warning({ title: 'Impresión', message: 'Error al enviar a la impresora. Verifique la conexión.' });
    }
  };

  closePrintModal = () => {
    this.setState({ isPrintModalOpen: false });
  };

  //------------------------------------------------------------------------------------------
  // Modal de enviar WhatsApp
  //------------------------------------------------------------------------------------------

  handleOpenSendWhatsapp = () => {
    this.setState({ isOpenSendWhatsapp: true });
  };

  handleProcessSendWhatsapp = async (
    phone,
    callback = async function () { },
  ) => {
    const { razonSocial } = this.props.predeterminado.empresa;
    const { paginaWeb, email } = this.props.token.project;

    const companyInfo = {
      name: razonSocial,
      website: paginaWeb,
      email: email,
    };

    const documentUrl = documentsPdfInvoicesVenta(this.state.idVenta, 'A4');

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
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
      message,
    )}`;

    await callback();

    // Abrir en una nueva ventana
    window.open(whatsappUrl, '_blank');
  };

  handleCloseSendWhatsapp = () => {
    this.setState({ isOpenSendWhatsapp: false });
  };

  //------------------------------------------------------------------------------------------
  // Modal de enviar email
  //------------------------------------------------------------------------------------------

  handleSendEmail = async () => {
    // await sendEmail(this.state.idVenta);
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
          {numberFormat(item.precio, this.state.codiso)}
        </td>
        <td className="p-4 text-gray-900 font-medium text-right">
          {numberFormat(item.cantidad * item.precio, this.state.codiso)}
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

      return resultado.map((impuesto, index) => (
        <tr key={index}>
          <th className="p-3 text-gray-600 text-right">{impuesto.nombre}:</th>
          <td className="p-3 text-gray-900 font-medium text-right">
            {numberFormat(impuesto.valor, this.state.codiso)}
          </td>
        </tr>
      ));
    };

    return (
      <>
        <tr>
          <th className="p-3 text-gray-600 text-right">SUB TOTAL:</th>
          <td className="p-3 text-gray-900 font-medium text-right">
            {numberFormat(subTotal, this.state.codiso)}
          </td>
        </tr>
        {impuestosGenerado()}
        <tr>
          <td colSpan="2" className="py-2">
            <div className="border-t border-gray-200"></div>
          </td>
        </tr>
        <tr>
          <th className="p-3 text-gray-800 font-bold text-right text-lg">TOTAL:</th>
          <td className="p-3 text-gray-900 font-bold text-right text-lg">
            {numberFormat(total, this.state.codiso)}
          </td>
        </tr>
      </>
    );
  }
  renderTransaciones() {
    if (isEmpty(this.state.transaccion)) {
      return (
        <tr>
          <td colSpan="5" className="p-6 text-center text-gray-500">
            No hay transacciones para mostrar.
          </td>
        </tr>
      );
    }

    return this.state.transaccion.map((item, index) => (
      <React.Fragment key={index}>
        {/* Transacción principal */}
        <tr className="bg-green-50">
          <td className="p-3 font-medium text-gray-800">{index + 1}</td>
          <td className="p-3">
            <div className="font-medium">{item.fecha}</div>
            <div className="text-sm text-gray-600">{formatTime(item.hora)}</div>
          </td>
          <td className="p-3 text-gray-800">{item.concepto}</td>
          <td className="p-3 text-gray-800">{item.nota}</td>
          <td className="p-3 text-gray-800">{item.usuario}</td>
        </tr>

        {/* Encabezado de detalles */}
        <tr className="bg-gray-50 text-sm text-gray-600">
          <td className="p-2 text-center">#</td>
          <td className="p-2">Banco</td>
          <td className="p-2">Monto</td>
          <td colSpan="2" className="p-2">Observación</td>
        </tr>

        {/* Detalles de la transacción */}
        {item.detalles.map((detalle, idx) => (
          <tr key={idx} className="hover:bg-gray-50">
            <td className="p-3 text-center text-gray-600">{idx + 1}</td>
            <td className="p-3 text-gray-700">{detalle.nombre}</td>
            <td className="p-3 text-gray-900 font-medium">
              {numberFormat(detalle.monto, this.state.codiso)}
            </td>
            <td colSpan="2" className="p-3 text-gray-700">
              {detalle.observacion}
            </td>
          </tr>
        ))}

        {/* Separador visual */}
        <tr>
          <td colSpan="5" className="py-3">
            <div className="border-t border-gray-200"></div>
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

        <Title
          title="Venta"
          subTitle="DETALLE"
          handleGoBack={() => this.close()}
        />

        <ModalSendWhatsApp
          refModal={this.refModalSendWhatsApp}
          isOpen={this.state.isOpenSendWhatsapp}
          phone={this.state.celular}
          handleClose={this.handleCloseSendWhatsapp}
          handleProcess={this.handleProcessSendWhatsapp}
        />

        {/* Acciones */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            onClick={this.handlePrintInvoices.bind(this, 'A4')}
          >
            <i className="fa fa-print"></i> A4
          </button>
          <button
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            onClick={this.handlePrintInvoices.bind(this, '80mm')}
          >
            <i className="fa fa-print"></i> 80MM
          </button>
          <button
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            onClick={this.handlePrintInvoices.bind(this, '58mm')}
          >
            <i className="fa fa-print"></i> 58MM
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 flex items-center gap-2"
            onClick={this.handleOpenSendWhatsapp}
          >
            <i className="fa fa-whatsapp"></i> WhatsApp
          </button>
        </div>

        {/* Resumen de la venta */}
        <div className="mb-8 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {[
              { label: 'Comprobante', value: this.state.comprobante },
              { label: 'Cliente', value: this.state.cliente },
              { label: 'N° de celular y correo electrónico', value: `${this.state.celular} - ${this.state.email}` },
              { label: 'Fecha', value: this.state.fecha },
              { label: 'Observación', value: this.state.observacion },
              { label: 'Nota', value: this.state.nota },
              { label: 'Forma de Pago', value: this.state.formaPago },
              { label: 'Estado', value: this.state.estado },
              { label: 'Usuario', value: this.state.usuario },
              { label: 'Total', value: numberFormat(this.state.total, this.state.codiso) },
            ].map((item, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
                <div className="font-medium text-gray-600">{item.label}</div>
                <div className="md:col-span-3 text-gray-900">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalles de productos */}
        <div className="mb-8 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Detalles</h2>
          </div>
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
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-start-9 lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-right">
                <tbody>
                  {this.renderTotal()}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Transacciones */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Transacciones</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left text-gray-600 text-sm">
                <tr>
                  <th className="p-4">#</th>
                  <th className="p-4">Fecha y Hora</th>
                  <th className="p-4">Concepto</th>
                  <th className="p-4">Nota</th>
                  <th className="p-4">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {this.renderTransaciones()}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de selección de impresora */}
        {this.state.isPrintModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            {/* Contenedor del modal con altura máxima del 80% de la pantalla */}
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
              {/* Cabecera */}
              <div className="p-5 border-b border-gray-200 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Seleccionar impresora</h3>
                  <button
                    onClick={this.closePrintModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Contenido scrollable */}
              <div className="p-5 overflow-y-auto flex-grow">
                {/* Selector de tamaño */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tamaño de papel</label>
                  <div className="flex flex-wrap gap-2">
                    {['58mm', '80mm', 'A4'].map(size => (
                      <button
                        key={size}
                        type="button"
                        className={`px-3 py-2 text-sm rounded-lg border ${this.state.selectedSize === size
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        onClick={() => this.handleSelectSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Impresoras Bluetooth */}
                <div className="mb-5">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Bluetooth</h4>
                  {this.state.availablePrinters.bluetooth.devices.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay dispositivos emparejados.</p>
                  ) : (
                    <div className="space-y-2">
                      {this.state.availablePrinters.bluetooth.devices.map((dev, i) => (
                        <button
                          key={i}
                          type="button"
                          className={`w-full text-left p-3 rounded-lg border ${this.state.selectedPrinter?.address === dev.address
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          onClick={() => this.handleSelectPrinter('BLUETOOTH', dev)}
                        >
                          <div className="font-medium text-gray-800">{dev.name}</div>
                          <div className="text-xs text-gray-500">{dev.address}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Impresoras USB */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">USB</h4>
                  {this.state.availablePrinters.usb.devices.length === 0 ? (
                    <p className="text-sm text-gray-500">No se detectaron impresoras USB.</p>
                  ) : (
                    <div className="space-y-2">
                      {this.state.availablePrinters.usb.devices.map((dev, i) => (
                        <button
                          key={i}
                          type="button"
                          className={`w-full text-left p-3 rounded-lg border ${this.state.selectedPrinter?.address === `${dev.vendorId}:${dev.productId}`
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          onClick={() => this.handleSelectPrinter('USB', dev)}
                        >
                          <div className="font-medium text-gray-800">{dev.name}</div>
                          <div className="text-xs text-gray-500">VID: {dev.vendorId} / PID: {dev.productId}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Pie (botones) */}
              <div className="p-5 border-t border-gray-200 flex-shrink-0 flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={this.closePrintModal}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  onClick={this.handleConfirmPrint}
                  disabled={!this.state.selectedPrinter}
                >
                  Imprimir
                </button>
              </div>
            </div>
          </div>
        )}
      </ContainerWrapper>
    );
  }
}

VentaDetalle.propTypes = {
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
  token: PropTypes.shape({
    project: PropTypes.shape({
      paginaWeb: PropTypes.string,
      email: PropTypes.string,
    }),
  }),
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    predeterminado: state.predeterminado,
  };
};

const ConnectedVentaDetalle = connect(mapStateToProps, null)(VentaDetalle);

export default ConnectedVentaDetalle;
