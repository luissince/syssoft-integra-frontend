import {
  rounded,
  formatCurrency,
  calculateTaxBruto,
  calculateTax,
  formatTime,
  formatNumberWithZeros,
} from '@/helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '@/components/ui/container-wrapper';
import CustomComponent from '@/components/CustomComponent';
import { getByIdNotaCredito, pdfNotaCredito } from '@/network/rest/api-client';
import { alertKit } from 'alert-kit';
import { SpinnerView } from '@/components/Spinner';
import Title from '@/components/Title';
import { Capacitor } from '@capacitor/core';
import pdfVisualizer from 'pdf-visualizer';
import { cn } from '@/lib/utils';
import Image from '@/components/Image';
import { images } from '@/helper';
import { ModalSendWhatsApp } from '@/components/MultiModal';
import React from 'react';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class NotaCreditoDetalle extends CustomComponent {

  /**
   * Crea una nueva instancia del componente Venta.
   *
   * @param {Object} props - Propiedades recibidas del componente padre.
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      msgLoading: "Cargando datos...",

      idNotaCredito: "",
      cabecera: {},
      detalles: [],

      isOpenSendWhatsapp: false,
    };

    // Referencia para el modal enviar WhatsApp
    this.refModalSendWhatsApp = React.createRef();

    // Anular las peticiones
    this.abortControllerView = null;
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
    const idResult = new URLSearchParams(url).get("idNotaCredito");
    if (idResult !== null) {
      this.loadDataId(idResult);
    } else {
      this.handleGoBack;
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
  async loadDataId(id) {
    this.abortControllerView = new AbortController();

    const { success, data, message } = await getByIdNotaCredito(id, this.abortControllerView.signal);

    if (!success) {
      alertKit.warning({
        title: 'Nota de Crédito',
        message: message,
        onClose: this.handleGoBack,
      });
      return;
    }

    this.setState({
      idNotaCredito: id,
      cabecera: data.cabecera,
      detalles: data.detalles,
      loading: false,
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

  handleGoBack = () => {
    this.props.history.goBack();
  };

  //------------------------------------------------------------------------------------------
  // Eventos para impresión
  //------------------------------------------------------------------------------------------

  handlePrintInvoices = async (size) => {
    const url = pdfNotaCredito(this.state.idNotaCredito, size);

    await pdfVisualizer.init({
      url: url,
      title: "Nota de Crédito",
      titlePageNumber: "Página",
      titleLoading: "Cargando...",
    });
  };

  //------------------------------------------------------------------------------------------
  // Eventos para impresión en mobil
  //------------------------------------------------------------------------------------------

  handleOpenModalPrinter = async () => {
    this.setState({ isOpenModalPrinter: true });
  };

  handleCloseModalPrinter = () => {
    this.setState({ isOpenModalPrinter: false });
  };


  //------------------------------------------------------------------------------------------
  // Modal de enviar WhatsApp
  //------------------------------------------------------------------------------------------

  handleOpenSendWhatsapp = () => {
    this.setState({ isOpenSendWhatsapp: true });
  };

  handleProcessSendWhatsapp = async (phone, callback = async function () { },) => {
    const { razonSocial } = this.props.predeterminado.empresa;
    const { paginaWeb, email } = this.props.token.project;

    const companyInfo = {
      name: razonSocial,
      website: paginaWeb,
      email: email,
    };

    const pdfUrl = pdfNotaCredito(this.state.idNotaCredito, "A4");

    // Crear mensaje con formato
    const message = `
      Hola! Somos *${companyInfo.name}*
      
      Le enviamos su comprobante de venta:
      ${pdfUrl}
      
      Para cualquier consulta, puede contactarnos:
      ${companyInfo.website}
      ${companyInfo.email}
  
      o escribiendo a nuestro whatsapp
      
      Gracias por su preferencia! :D`.trim();

    // Limpiar y formatear el número de teléfono
    const cleanPhone = phone.replace(/\D/g, '');

    // Crear la URL de WhatsApp
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message,)}`;

    await callback();

    // Abrir en una nueva ventana
    window.open(whatsappUrl, "_blank");
  };

  handleCloseSendWhatsapp = () => {
    this.setState({ isOpenSendWhatsapp: false });
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
    const { cabecera, detalles } = this.state;
    return detalles.map((item, index) => (
      <tr key={index} className="hover:bg-gray-50">
        <td className="p-4 text-gray-700">{item.id}</td>
        <td className="p-4 text-center">
          <div className="w-24 aspect-square relative flex items-center justify-center overflow-hidden border border-gray-200">
            <Image
              default={images.noImage}
              src={item.imagen}
              alt={item.producto}
              overrideClass="max-w-full max-h-full w-auto h-auto object-contain block"
            />
          </div>
        </td>
        <td className="p-4 text-gray-700">
          <p className="font-mono text-sm text-gray-500">{item.codigo}</p>
          <p className="font-medium">{item.producto}</p>
        </td>
        <td className="p-4 text-gray-700">{item.categoria}</td>
        <td className="p-4 text-gray-700 text-right">{rounded(item.cantidad)}</td>
        <td className="p-4 text-gray-700 text-right">{item.impuesto}</td>
        <td className="p-4 text-gray-700 text-right">
          {formatCurrency(item.precio, cabecera.codiso)} <small>x{item.medida}</small>
        </td>
        <td className="p-4 text-gray-900 font-medium text-right">
          {formatCurrency(item.cantidad * item.precio, this.state.codiso)}
        </td>
      </tr>
    ));
  }

  renderTotal() {
    const { detalles, codiso } = this.state;

    const { subTotal, total, impuestos } = detalles.reduce((acc, item) => {
      const totalItem = item.cantidad * item.precio;
      const subNeto = calculateTaxBruto(item.porcentaje, totalItem);
      const impuestoValor = calculateTax(item.porcentaje, subNeto);

      acc.subTotal += subNeto;
      acc.total += subNeto + impuestoValor;

      if (!acc.impuestos[item.idImpuesto]) {
        acc.impuestos[item.idImpuesto] = {
          nombre: item.impuesto,
          valor: 0,
        };
      }

      acc.impuestos[item.idImpuesto].valor += impuestoValor;

      return acc;
    },
      { subTotal: 0, total: 0, impuestos: {} });

    const impuestosGenerado = Object.entries(impuestos).map(
      ([id, impuesto], index) => (
        <tr key={index}>
          <th className="p-2 text-gray-600 text-right">
            {impuesto.nombre}:
          </th>
          <td className="p-2 text-gray-900 font-medium text-right">
            {formatCurrency(impuesto.valor, codiso)}
          </td>
        </tr>
      )
    );

    return (
      <>
        <tr>
          <th className="p-2 text-gray-600 text-right">SUB TOTAL:</th>
          <td className="p-2 text-gray-900 font-medium text-right">
            {formatCurrency(subTotal, codiso)}
          </td>
        </tr>

        {impuestosGenerado}

        <tr>
          <td colSpan={2} className="py-2">
            <div className="border-t border-gray-200"></div>
          </td>
        </tr>

        <tr>
          <th className="p-2 text-gray-800 font-bold text-right text-lg">
            TOTAL:
          </th>
          <td className="p-2 text-gray-900 font-bold text-right text-lg">
            {formatCurrency(total, codiso)}
          </td>
        </tr>
      </>
    );
  }

  render() {
    const { cabecera } = this.state;

    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title="Nota de Crédito"
          subTitle="DETALLE"
          handleGoBack={this.handleGoBack}
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
          {
            Capacitor.isNativePlatform() ? (
              <button
                className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                onClick={this.handleOpenModalPrinter}
              >
                <i className="fa fa-print"></i> Imprimir
              </button>
            ) : (
              <>
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
              </>
            )
          }

          <button
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 flex items-center gap-2"
            onClick={this.handleOpenSendWhatsapp}
          >
            <i className="fa fa-whatsapp !text-base"></i> WhatsApp
          </button>
        </div>

        {/* Resumen de la venta */}
        <div className="mb-8 bg-white overflow-hidden">
          <h2 className="text-base font-semibold text-gray-800 uppercase">Cabecera</h2>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {[
              { label: 'Comprobante.:', value: cabecera.comprobante + ' (' + cabecera.serie + ' - ' + formatNumberWithZeros(cabecera.numeracion) + ')' },
              { label: 'Cliente:', value: cabecera.documento + ' - ' + cabecera.informacion },
              { label: 'Motivo:', value: cabecera.motivo },
              { label: 'Fecha:', value: cabecera.fecha + ' ' + formatTime(cabecera.hora) },
              { label: 'Referencia:', value: cabecera.comprobanteVenta + ' (' + cabecera.serieVenta + '-' + formatNumberWithZeros(cabecera.numeracionVenta) + ')' },
              { label: 'Estado:', value: cabecera.estado === 1 ? "ACTIVO" : "ANULADO", valueClass: cabecera.estado === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800" },
              { label: 'Observación:', value: cabecera.observacion },
            ].map((item, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 py-2">
                <p className="text-sm text-gray-600 uppercase px-2 py-1">
                  {item.label}
                </p>
                <p className={cn(
                  "text-sm md:col-span-3 font-medium w-fit px-2 py-1 rounded",
                  item.valueClass ?? "text-gray-900"
                )}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Detalles de productos */}
        <div className="mb-8 bg-white overflow-hidden">
          <h2 className="text-base font-semibold text-gray-800 mb-3 uppercase">Detalles</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left text-gray-600 text-sm">
                <tr>
                  <th className="p-4 text-sm uppercase">#</th>
                  <th className="p-4 text-sm uppercase">Imagen</th>
                  <th className="p-4 text-sm uppercase">Producto</th>
                  <th className="p-4 text-sm uppercase">Categoría</th>
                  <th className="p-4 text-right text-sm uppercase">Cantidad</th>
                  <th className="p-4 text-right text-sm uppercase">Impuesto</th>
                  <th className="p-4 text-right text-sm uppercase">Precio</th>
                  <th className="p-4 text-right text-sm uppercase">Monto</th>
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
      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

export default connect(mapStateToProps, null)(NotaCreditoDetalle);
