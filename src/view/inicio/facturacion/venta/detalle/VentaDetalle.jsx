import {
  rounded,
  formatCurrency,
  calculateTaxBruto,
  calculateTax,
  formatTime,
  isText,
  isEmpty,
  formatNumberWithZeros,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../../components/Container';
import {
  detailVenta,
  documentsPdfInvoicesVenta,
} from '../../../../../network/rest/principal.network';
import { CANCELED } from '../../../../../model/types/types';
import CustomComponent from '@/components/CustomComponent';
import {
  CONTADO,
} from '../../../../../model/types/forma-pago';
import Title from '../../../../../components/Title';
import { SpinnerView } from '../../../../../components/Spinner';
import PropTypes from 'prop-types';
import React from 'react';
import { ModalSendWhatsApp } from '../../../../../components/MultiModal';
import Image from '../../../../../components/Image';
import { images } from '../../../../../helper';
import { alertKit } from 'alert-kit';
import { Capacitor } from '@capacitor/core';
import pdfVisualizer from 'pdf-visualizer';
import ModalPrinter from './component/ModalPrinter';
import { cn } from '@/lib/utils';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class VentaDetalle extends CustomComponent {

  /**
   * Crea una nueva instancia del componente Venta.
   *
   * @param {Object} props - Propiedades recibidas del componente padre.
   */
  constructor(props) {
    super(props);

    this.state = {
      // Atributos de carga
      loading: true,
      msgLoading: 'Cargando datos...',

      idVenta: '',
      cabecera: {},
      detalles: [],
      transaccion: [],

      isOpenModalPrinter: false,
      isOpenSendWhatsapp: false,

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

  async loadingData(idVenta) {
    const params = {
      idVenta: idVenta,
    };

    const { success, data, message, type } = await detailVenta(params, this.abortControllerView.signal);

    if (!success) {
      if (type === CANCELED) return;

      alertKit.warning({
        title: 'Venta',
        message: message,
      }, () => {
        this.close();
      });
      return;
    }

    this.setState({
      idVenta: idVenta,
      cabecera: data.cabecera,
      detalles: data.detalles,
      transaccion: data.transaccion,

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
    const url = documentsPdfInvoicesVenta(this.state.idVenta, size);

    await pdfVisualizer.init({
      url: url,
      title: 'Venta',
      titlePageNumber: 'Página',
      titleLoading: 'Cargando...',
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

  handleProcessSendWhatsapp = async (
    phone,
    callback = async function () { },
  ) => {
    const { razonSocial, paginaWeb } = this.props.predeterminado.empresa;
    const { email } = this.props.token.project;

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

  renderCabecera() {
    const { loading, cabecera, detalles } = this.state;

    if (loading) return null;

    return (
      <div className="mb-8 bg-white overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-800">Cabecera</h2>
        <div className="divide-y divide-gray-100">
          {[
            {
              label: 'Fecha y Hora', value: () => {
                return cabecera.fecha + ' ' + formatTime(cabecera.hora);
              }
            },
            {
              label: 'Comprobante', value: () => {
                return cabecera.comprobante + '  ' + cabecera.serie + '-' + formatNumberWithZeros(cabecera.numeracion);
              }
            },
            {
              label: 'Cliente', value: () => {
                return cabecera.documento + ' - ' + cabecera.informacion;
              }
            },
            { label: 'N° de celular', value: () => cabecera.celular },
            { label: 'Correo electrónico', value: () => cabecera.email },

            {
              label: 'Forma de Pago', value: () => {
                return cabecera.idFormaPago === CONTADO ? 'CONTADO' : 'CREDITO'
              }
            },
            {
              label: 'Estado', value: () => {
                return (
                  <span className={cn(
                    "inline-flex items-center rounded-full",
                    "text-xs font-medium",
                    "px-2.5 py-0.5",
                    cabecera.estado === 1 && "bg-green-100 text-green-800",
                    cabecera.estado === 2 && "bg-yellow-100 text-yellow-800",
                    cabecera.estado === 3 && "bg-red-100 text-red-800",
                    cabecera.estado === 4 && "bg-blue-100 text-blue-800",
                  )}>
                    {cabecera.estado === 1 && "COBRADO"}
                    {cabecera.estado === 2 && "POR COBRAR"}
                    {cabecera.estado === 3 && "ANULADO"}
                    {cabecera.estado === 4 && "POR LLEVAR"}
                  </span>
                );
              }
            },

            { label: 'Observación', value: () => cabecera.observacion },
            { label: 'Nota', value: () => cabecera.nota },

            { label: 'Usuario', value: () => cabecera.usuario },

            {
              label: 'Total', value: () => {
                const monto = detalles.reduce(
                  (accumlate, item) => accumlate + item.precio * item.cantidad,
                  0,
                )
                return formatCurrency(monto, cabecera.codiso)
              }
            },
          ].map((item, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 py-3">
              <p>{item.label}</p>
              <p className="md:col-span-3 font-bold">{item.value()}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  renderDetalles() {
    const { loading, cabecera, detalles } = this.state;

    if (loading) return null;

    return (
      <div className="mb-8 bg-white overflow-hidden">
        <h2 className="text-lg font-semibold mb-3">Detalles</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#111727] text-left text-white text-sm">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Imagen</th>
                <th className="p-4">Producto</th>
                <th className="p-4">Categoría</th>
                <th className="p-4 text-right">Cantidad</th>
                <th className="p-4 text-right">Medida</th>
                <th className="p-4 text-right">Impuesto</th>
                <th className="p-4 text-right">Precio</th>
                <th className="p-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {
                detalles.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-4">{item.id}</td>
                    <td className="p-4 text-center">
                      <Image
                        default={images.noImage}
                        src={item.imagen}
                        alt={item.producto}
                        width={80}
                        className="mx-auto rounded border border-gray-200"
                      />
                    </td>
                    <td className="p-4">
                      <p className="font-mono text-sm text-gray-500">{item.codigo}</p>
                      <p className="text-black uppercase">{item.producto}</p>
                    </td>
                    <td className="p-4">{item.categoria}</td>
                    <td className="p-4 text-right">{rounded(item.cantidad)}</td>
                    <td className="p-4 text-right">{item.medida}</td>
                    <td className="p-4 text-right">{item.impuesto}</td>
                    <td className="p-4 text-right">
                      {formatCurrency(item.precio, cabecera.codiso)}
                    </td>
                    <td className="p-4 font-medium text-right">
                      {formatCurrency(item.cantidad * item.precio, cabecera.codiso)}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  renderTotal() {
    const { loading, cabecera, detalles } = this.state;

    if (loading) return null;

    let subTotal = 0;
    let total = 0;

    for (const item of detalles) {
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
      const resultado = detalles.reduce((acc, item) => {
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
          <th className="p-2 text-gray-600 text-right">{impuesto.nombre}:</th>
          <td className="p-2 text-gray-900 font-medium text-right">
            {formatCurrency(impuesto.valor, cabecera.codiso)}
          </td>
        </tr>
      ));
    };

    return (
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-start-9 lg:col-span-4">
          <div className="bg-white overflow-hidden">
            <table className="w-full text-right">
              <tbody>
                <tr>
                  <th className="p-2 text-gray-600 text-right">SUB TOTAL:</th>
                  <td className="p-2 text-gray-900 font-medium text-right">
                    {formatCurrency(subTotal, cabecera.codiso)}
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
                    {formatCurrency(total, cabecera.codiso)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  renderTransaciones() {
    const { loading, cabecera, transaccion } = this.state;

    if (loading) return null;

    if (isEmpty(transaccion)) {
      return (
        <tr>
          <td colSpan={5} className="p-6 text-center text-gray-500">
            No hay transacciones para mostrar.
          </td>
        </tr>
      );
    }

    return (
      <div className="bg-white overflow-hidden">
        <h2 className="text-lg font-semibold mb-3">Transacciones</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#111727] text-left text-white text-sm">
              <tr>
                <th className="p-4 text-center">#</th>
                <th className="p-4">Fecha y Hora</th>
                <th className="p-4">Concepto</th>
                <th className="p-4">Nota</th>
                <th className="p-4">Usuario</th>
              </tr>
            </thead>
            <tbody>
              {
                transaccion.map((item, index) => (
                  <React.Fragment key={index}>
                    {/* Transacción principal */}
                    <tr className="bg-green-200">
                      <td className="p-3 text-center font-medium text-gray-800">{index + 1}</td>
                      <td className="p-3">
                        <p className="font-medium">{item.fecha}</p>
                        <p className="text-sm text-gray-600">{formatTime(item.hora)}</p>
                      </td>
                      <td className="p-3 text-gray-800">{item.concepto}</td>
                      <td className="p-3 text-gray-800">{item.nota}</td>
                      <td className="p-3 text-gray-800">{item.usuario}</td>
                    </tr>

                    {/* Encabezado de detalles */}
                    <tr className="text-sm text-gray-600">
                      <td className="p-3"></td>
                      <td className="p-3">Banco</td>
                      <td className="p-3">Monto</td>
                      <td colSpan={2} className="p-2">Observación</td>
                    </tr>

                    {/* Detalles de la transacción */}
                    {item.detalles.map((detalle, idx) => (
                      <tr key={idx}>
                        <td className="p-3 text-gray-600"></td>
                        <td className="p-3 text-gray-700">{detalle.nombre}</td>
                        <td className="p-3 text-gray-900 font-medium">
                          {formatCurrency(detalle.monto, cabecera.codiso)}
                        </td>
                        <td colSpan={2} className="p-3 text-gray-700">
                          {detalle.observacion}
                        </td>
                      </tr>
                    ))}

                    {/* Separador visual */}
                    <tr>
                      <td colSpan={5} className="py-3">
                        <div className="border-t border-gray-200"></div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    );

  }

  render() {
    const { loading, msgLoading, idVenta, isOpenSendWhatsapp, isOpenModalPrinter, cabecera, detalles } = this.state;

    return (
      <ContainerWrapper>
        <SpinnerView
          loading={loading}
          message={msgLoading}
        />

        {/* Titulo */}
        <Title
          title="Venta"
          subTitle="DETALLE"
          handleGoBack={() => this.close()}
        />

        <ModalSendWhatsApp
          refModal={this.refModalSendWhatsApp}
          isOpen={isOpenSendWhatsapp}
          phone={cabecera && cabecera.celular || ""}
          handleClose={this.handleCloseSendWhatsapp}
          handleProcess={this.handleProcessSendWhatsapp}
        />

        <ModalPrinter
          isOpen={isOpenModalPrinter}
          handleClose={this.handleCloseModalPrinter}
          idVenta={idVenta}
        />

        {/* Acciones */}
        <div className="mb-6 flex flex-wrap gap-3">
          {
            Capacitor.isNativePlatform() ? (
              <button
                className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                onClick={this.handleOpenModalPrinter}
              >
                <i className="fa fa-print"></i> Imprimir
              </button>
            ) : (
              <>
                <button
                  className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={this.handlePrintInvoices.bind(this, 'A4')}
                >
                  <i className="fa fa-print"></i> A4
                </button>
                <button
                  className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={this.handlePrintInvoices.bind(this, '80mm')}
                >
                  <i className="fa fa-print"></i> 80MM
                </button>
                <button
                  className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={this.handlePrintInvoices.bind(this, '58mm')}
                >
                  <i className="fa fa-print"></i> 58MM
                </button>
              </>
            )
          }

          <button
            className="px-4 py-2 bg-green-600 border border-gray-300 text-sm font-medium rounded-lg text-white hover:bg-gray-50 flex items-center gap-2"
            onClick={this.handleOpenSendWhatsapp}
          >
            <i className="fa fa-whatsapp"></i> WhatsApp
          </button>
        </div>

        {/* Cabecera */}
        {this.renderCabecera()}

        {/* Detalles de productos */}
        {this.renderDetalles()}

        {/* Totales (flotante a la derecha en desktop) */}
        {this.renderTotal()}

        {/* Transacciones */}
        {this.renderTransaciones()}
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
      paginaWeb: PropTypes.string,
      razonSocial: PropTypes.string,
    }),
  }),
  token: PropTypes.shape({
    project: PropTypes.shape({
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
