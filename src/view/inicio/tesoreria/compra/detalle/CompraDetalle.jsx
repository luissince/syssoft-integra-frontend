import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '@/components/CustomComponent';
import {
  calculateTax,
  calculateTaxBruto,
  formatNumberWithZeros,
  formatTime,
  isEmpty,
  isText,
  formatCurrency,
  rounded,
} from '../../../../../helper/utils.helper';
import {
  createAccountsPayableCompra,
  detailCompra,
  documentsPdfInvoicesCompra,
} from '../../../../../network/rest/principal.network';
import Title from '../../../../../components/Title';
import { SpinnerView } from '../../../../../components/Spinner';
import PropTypes from 'prop-types';
import React from 'react';
import pdfVisualizer from 'pdf-visualizer';
import Image from '../../../../../components/Image';
import { images } from '../../../../../helper';
import { cn } from '@/lib/utils';
import { FORMA_PAGO_CREDITO } from '@/model/types/forma-pago';
import { Plus, Printer } from 'lucide-react';
import ModalTransaccion from '@/components/ModalTransaccion';
import { ModalPago } from '@/components/MultiModal';
import { connect } from 'react-redux';
import { alertKit } from 'alert-kit';
import { CANCELED } from '@/model/types/types';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class CompraDetalle extends CustomComponent {
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
      idCompra: '',
      cabecera: null,
      detalles: [],
      transacciones: [],
      monto: 0,

      // Atributos del modal pago
      isOpenModalPago: false,
      isOpenModalTerminal: false,

      // Id principales
      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

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
    const idCompra = new URLSearchParams(url).get('idCompra');

    if (isText(idCompra)) {
      this.loadingData(idCompra);
    } else {
      this.goBackView();
    }
  }

  componentWillUnmount() {
    this.abortControllerView.abort();

    if (pdfVisualizer.isOpen()) {
      pdfVisualizer.close();
    }
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

  async loadingData(idCompra) {
    const params = {
      idCompra: idCompra,
    };

    const { success, data } = await detailCompra(params, this.abortControllerView.signal);

    if (!success) {
      this.goBackView();
      return;
    }

    this.setState({
      idCompra: idCompra,
      cabecera: data.cabecera,
      detalles: data.detalles,
      transacciones: data.transacciones,

      loading: false,
    });
  }

  goBackView = () => {
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
  // Funcione de impresión
  //------------------------------------------------------------------------------------------
  handlePrintInvoices = async (size) => {
    const url = documentsPdfInvoicesCompra(this.state.idCompra, size);

    await pdfVisualizer.init({
      url: url,
      title: 'Compra',
      titlePageNumber: 'Página',
      titleLoading: 'Cargando...',
    });
  };

  //------------------------------------------------------------------------------------------
  // Funciones del modal pago
  //------------------------------------------------------------------------------------------

  handleOpenModalPago = async () => {
    this.setState({ isOpenModalPago: true });
  };

  handleCloseModalPago = async () => {
    this.setState({ isOpenModalPago: false });
  };

  handleProcessModalPago = async (monto) => {
    this.setState({
      monto: monto,
    }, () => {
      this.handleOpenModalTerminal();
    });
  }

  //------------------------------------------------------------------------------------------
  // Funciones del modal terminal
  //------------------------------------------------------------------------------------------

  handleOpenModalTerminal = () => {
    this.setState({ isOpenModalTerminal: true });
  };

  handleProccesoModalTerminal = async (_, metodoPagosLista, notaTransacion, callback) => {
    const { idCompra, idSucursal, idUsuario, monto } = this.state;

    const accept = await alertKit.question({
      title: 'Cuenta por Pagar',
      message: '¿Estás seguro de continuar?',
      acceptButton: { html: "<i class='fa fa-check'></i> Aceptar" },
      cancelButton: { html: "<i class='fa fa-close'></i> Cancelar" },
    });

    if (accept) {
      const body = {
        idCompra,
        idSucursal,
        idUsuario,
        monto,
        notaTransacion,
        bancosAgregados: metodoPagosLista,
      };

      await callback?.();

      alertKit.loading({
        message: 'Procesando información...',
      });

      const { success, data, message, type } = await createAccountsPayableCompra(body);

      if (!success) {
        if (type === CANCELED) return;

        alertKit.warning({
          title: 'Cuenta por Pagar',
          message: message,
        });
        return;
      }

      alertKit.success({
        title: 'Cuenta por Pagar',
        message: data,
      }, () => {
        this.handleCloseModalTerminal();
      });
    }
  }

  handleCloseModalTerminal = async () => {
    this.setState({ isOpenModalTerminal: false });
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
    const { loading, cabecera, detalles, transacciones } = this.state;

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


            { label: 'Tipo', value: () => cabecera.formaPago },

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
                  )}>
                    {cabecera.estado === 1 && "PAGADO"}
                    {cabecera.estado === 2 && "POR PAGAR"}
                    {cabecera.estado === 3 && "ANULADO"}
                  </span>
                );
              }
            },

            { label: 'Observación', value: () => cabecera.observacion },
            { label: 'Nota', value: () => cabecera.nota },

            { label: 'Usuario', value: () => cabecera.usuario },

            {
              label: 'Pagado', value: () => {
                const monto = transacciones.reduce(
                  (total, item) =>
                    total +
                    item.detalles.reduce(
                      (subtotal, detalle) => subtotal + Number(detalle.monto || 0),
                      0
                    ),
                  0
                );

                return <span className="text-green-600">{formatCurrency(monto, cabecera.codiso)}</span>
              }
            },

            {
              label: 'Restante', value: () => {
                const total = detalles.reduce(
                  (accumlate, item) => accumlate + item.costo * item.cantidad,
                  0,
                );

                const pagado = transacciones.reduce(
                  (total, item) =>
                    total +
                    item.detalles.reduce(
                      (subtotal, detalle) => subtotal + Number(detalle.monto || 0),
                      0
                    ),
                  0
                );

                return <span className="text-red-600">{formatCurrency(total - pagado, cabecera.codiso)}</span>
              }
            },

            {
              label: 'Total', value: () => {
                const monto = detalles.reduce(
                  (accumlate, item) => accumlate + item.costo * item.cantidad,
                  0,
                );

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
                <th className="p-4">Costo</th>
                <th className="p-4">Categoría</th>
                <th className="p-4 text-right">Impuesto</th>
                <th className="p-4 text-right">Cantidad</th>
                <th className="p-4 text-right">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {
                detalles.map((item, index) => {
                  return (
                    <React.Fragment key={index}>
                      <tr className="hover:bg-gray-50">
                        <td className="p-4">{item.id}</td>
                        <td className="p-4 text-center">
                          <div className="max-w-24 aspect-square relative flex items-center justify-center overflow-hidden border border-gray-200 rounded">
                            <Image
                              default={images.noImage}
                              src={item.imagen}
                              alt={item.producto}
                              overrideClass="max-w-full max-h-full w-auto h-auto object-contain block"
                            />
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-mono text-sm text-gray-500">{item.codigo}</p>
                          <p className="text-black uppercase">{item.producto}</p>
                        </td>
                        <td className="p-4 text-left">
                          {formatCurrency(item.costo, cabecera.codiso)} x <small>{item.medida}</small>
                        </td>
                        <td className="p-4">{item.categoria}</td>
                        <td className="p-4 text-right">{item.impuesto}</td>
                        <td className="p-4 text-right">{rounded(item.cantidad)}</td>
                        <td className="p-4 font-medium text-right">
                          {formatCurrency(item.cantidad * item.costo, cabecera.codiso)}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
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
      const valor = item.costo;
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
        const total = item.cantidad * item.costo;
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
    const { loading, cabecera, transacciones } = this.state;

    if (loading) return null;

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
                isEmpty(transacciones) && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">
                      No hay transacciones para mostrar.
                    </td>
                  </tr>
                )
              }

              {
                !isEmpty(transacciones) && transacciones.map((item, index) => (
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
            <tfoot>
              <tr>
                <td colSpan={5} className="p-6 text-right">
                  <p className="text-gray-800 font-bold text-right text-lg">Total: {
                    formatCurrency(transacciones.reduce(
                      (total, item) =>
                        total +
                        item.detalles.reduce(
                          (subtotal, detalle) => subtotal + Number(detalle.monto || 0),
                          0
                        ),
                      0
                    ), cabecera.codiso)
                  }
                  </p>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }

  render() {
    const { loading, msgLoading, cabecera } = this.state;

    return (
      <ContainerWrapper>
        <SpinnerView
          loading={loading}
          message={msgLoading}
        />

        <Title
          title="Compra"
          subTitle="DETALLE"
          handleGoBack={this.goBackView}
        />

        <ModalTransaccion
          tipo="Compra"
          title="Completar Compra"
          isOpen={this.state.isOpenModalTerminal}
          idSucursal={this.state.idSucursal}
          codiso={cabecera?.codiso ?? ''}
          disabledCredito={true}
          importeTotal={this.state.monto}
          onClose={this.handleCloseModalTerminal}
          handleProcessContado={this.handleProccesoModalTerminal}
          handleProcessCredito={null}
        />

        <ModalPago
          title="Pago"
          isOpen={this.state.isOpenModalPago}
          onClose={this.handleCloseModalPago}
          codiso={cabecera?.codiso ?? ''}
          detalles={this.state.detalles}
          transacciones={this.state.transacciones}
          onProcess={this.handleProcessModalPago}
        />

        {/* Acciones */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-500 flex items-center gap-2"
            onClick={this.handlePrintInvoices.bind(this, 'A4')}
          >
            <Printer className="w-4 h-4" /> A4
          </button>

          <button
            className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-500 flex items-center gap-2"
            onClick={this.handlePrintInvoices.bind(this, '80mm')}
          >
            <Printer className="w-4 h-4" /> 80MM
          </button>

          <button
            className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-500 flex items-center gap-2"
            onClick={this.handlePrintInvoices.bind(this, '58mm')}
          >
            <Printer className="w-4 h-4" /> 58MM
          </button>

          {
            cabecera && (
              cabecera.idFormaPago === FORMA_PAGO_CREDITO && (
                <button
                  className="px-4 py-2 bg-red-600 border border-red-300 text-sm font-medium rounded-lg text-white hover:bg-red-500 flex items-center gap-2"
                  onClick={() => this.handleOpenModalPago()}
                >
                  <Plus className="w-5 h-5" /> Agregar pago
                </button>
              )
            )
          }
        </div>

        {/* Cabecera */}
        {this.renderCabecera()}

        {/* Detalles */}
        {this.renderDetalles()}

        {/* Totales */}
        {this.renderTotal()}

        {/* Transacciones */}
        {this.renderTransaciones()}
      </ContainerWrapper>
    );
  }
}

CompraDetalle.propTypes = {
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
};

/**
 *
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
  return {
    token: state.principal
  };
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */

const ConnectedCompraDetalle = connect(
  mapStateToProps,
  null,
)(CompraDetalle);

export default ConnectedCompraDetalle;