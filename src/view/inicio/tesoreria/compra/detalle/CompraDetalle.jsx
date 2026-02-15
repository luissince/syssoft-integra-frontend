import ContainerWrapper from '@/components/ui/container-wrapper';
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
} from '@/helper/utils.helper';
import SuccessReponse from '@/model/class/response';
import ErrorResponse from '@/model/class/error-response';
import { CANCELED } from '@/constants/requestStatus';
import {
  detailCompra,
  documentsPdfInvoicesCompra,
} from '@/network/rest/principal.network';
import Title from '@/components/Title';
import { SpinnerView } from '@/components/Spinner';
import PropTypes from 'prop-types';
import React from 'react';
import pdfVisualizer from 'pdf-visualizer';
import Image from '@/components/Image';
import { images } from '@/helper';
import { alertKit } from 'alert-kit';
import { CONTADO } from '@/model/types/forma-transaccion';

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
      msgLoading: "Cargando datos...",

      // Atributos principales
      idCompra: "",
      comprobante: "",
      serie: "",
      numeracion: 0,
      fecha: "",
      hora: "",

      tipoDocumento: "",
      documento: "",
      informacion: "",
      telefono: "",
      celular: "",
      email: "",
      direccion: "",

      almacen: "",

      tipo: "",
      estado: "",

      observacion: "",
      notas: "",

      codiso: "",
      total: 0,

      detalles: [],
      transaccion: [],

      usuario: ""
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
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortControllerView.abort();

    if (pdfVisualizer.isOpen()) {
      pdfVisualizer.close();
    }
  }

  async loadingData(id) {

    const params = {
      idCompra: id,
    };

    const response = await detailCompra(
      params,
      this.abortControllerView.signal,
    );

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      alertKit.warning({
        title: "Compra",
        message: response.getMessage(),
      }, () => {
        this.close();
      });
      return;
    }

    response instanceof SuccessReponse;
    const compra = response.data;

    const {
      fecha,
      hora,

      comprobante,
      serie,
      numeracion,

      tipoDocumento,
      documento,
      informacion,
      telefono,
      celular,
      email,
      direccion,

      almacen,

      idFormaPago,
      estado,
      observacion,
      nota,
      codiso,

      usuario
    } = compra.cabecera;

    const monto = compra.detalles.reduce(
      (accumlate, item) => accumlate + item.costo * item.cantidad,
      0,
    );

    const nuevoEstado =
      estado === 1 ? (
        <span className="text-success">COBRADO</span>
      ) : estado === 2 ? (
        <span className="text-warning">POR COBRAR</span>
      ) : (
        <span className="text-danger">ANULADO</span>
      );

    const tipo =
      idFormaPago === CONTADO
        ? "CONTADO"
        : "CREDITO"

    this.setState({
      idCompra: id,
      fecha: fecha,
      hora: hora,

      comprobante: comprobante,
      serie: serie,
      numeracion: numeracion,

      tipoDocumento: tipoDocumento,
      documento: documento,
      informacion: informacion,
      telefono: telefono,
      celular: celular,
      email: email,
      direccion: direccion,

      almacen: almacen,

      tipo: tipo,
      estado: nuevoEstado,
      observacion: observacion,
      notas: nota,
      codiso: codiso,
      total: monto,

      detalles: compra.detalles,
      transaccion: compra.transaccion,

      usuario: usuario,

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
      url: documentsPdfInvoicesCompra(this.state.idCompra, size),
      title: 'Compra',
      titlePageNumber: 'Página',
      titleLoading: 'Cargando...',
    });
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
      <React.Fragment key={index}>
        <tr className="hover:bg-gray-50 border-b border-gray-100">
          <td className="px-4 py-3 text-gray-700">{item.id}</td>
          <td className="px-4 py-3 text-center">
            <div className="w-28 aspect-square relative flex items-center justify-center overflow-hidden border border-gray-200">
              <Image
                default={images.noImage}
                src={item.imagen}
                alt={item.producto}
                overrideClass="max-w-full max-h-full w-auto h-auto object-contain block"
              />
            </div>
          </td>
          <td className="px-4 py-3 text-gray-700">
            <p className="font-mono text-sm text-gray-500">{item.codigo}</p>
            <p className="font-medium">{item.producto}</p>
          </td>
          <td className="px-4 py-3 text-gray-700">{item.categoria}</td>
          <td className="px-4 py-3 text-gray-700 text-right">{rounded(item.cantidad)}</td>
          <td className="px-4 py-3 text-gray-700">{item.medida}</td>
          <td className="px-4 py-3 text-gray-700 text-right">{item.impuesto}</td>
          <td className="px-4 py-3 text-gray-900 font-medium text-right">
            {formatCurrency(item.costo, this.state.codiso)}
          </td>
          <td className="px-4 py-3 text-gray-900 font-medium text-right">
            {formatCurrency(item.cantidad * item.costo, this.state.codiso)}
          </td>
        </tr>

        {/* Detalles de inventario */}
        {item.inventarioDetalles && !isEmpty(item.inventarioDetalles) && (
          <tr>
            <td colSpan={9} className="py-2 bg-gray-50">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Código Lote
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Fecha Vencimiento
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Ubicación
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Cantidad
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.inventarioDetalles.map((inventarioDetalle, loteIndex) => (
                      <tr key={loteIndex} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                          {inventarioDetalle.lote}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                          {inventarioDetalle.fechaVencimiento || 'N/A'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                          {inventarioDetalle.ubicacion || 'N/A'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 text-right">
                          {rounded(inventarioDetalle.cantidad)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    ));
  }


  renderTotal() {
    let subTotal = 0;
    let total = 0;

    for (const item of this.state.detalles) {
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
      const resultado = this.state.detalles.reduce((acc, item) => {
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
          <td colSpan={5} className="px-6 py-12 text-center">
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
        </tr>

        {/* Detalles de la transacción */}
        <tr className="px-6 py-0 bg-gray-50">
          <td colSpan={5}>
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

        <Title
          title="Compra"
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

        {/* Resumen de la venta */}
        <div className="mb-8 bg-white overflow-hidden">
          <h2 className="text-base font-semibold text-gray-800 uppercase">Cabecera</h2>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {[
              { label: 'Comprobante:', value: this.state.comprobante },
              { label: 'Serie - Num.:', value: this.state.serie + '-' + formatNumberWithZeros(this.state.numeracion) },
              { label: 'Tipo Doc.:', value: this.state.tipoDocumento + " - " + this.state.documento },
              { label: 'Proveedor:', value: this.state.informacion },
              { label: 'N° de celular:', value: this.state.celular },
              { label: 'Correo electr.:', value: this.state.email },
              { label: 'Fecha:', value: this.state.fecha },
              { label: 'Hora:', value: formatTime(this.state.hora) },
              { label: 'Observación:', value: this.state.observacion },
              { label: 'Nota:', value: this.state.nota },
              { label: 'Forma de Pago:', value: this.state.tipo },
              { label: 'Estado:', value: this.state.estado },
              { label: 'Usuario:', value: this.state.usuario },
              { label: 'Almacen:', value: this.state.almacen },
              { label: 'Total:', value: formatCurrency(this.state.total, this.state.codiso) },
            ].map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 items-center gap-5 py-2">
                <p className="text-sm text-gray-600 uppercase">
                  {item.label}
                </p>
                <p className="text-sm md:col-span-3 text-gray-900 font-medium">
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
              <thead className="bg-gray-50 text-black">
                <tr>
                  <th className="p-4 text-sm uppercase">#</th>
                  <th className="p-4 text-sm uppercase">Imagen</th>
                  <th className="p-4 text-sm uppercase">Producto</th>
                  <th className="p-4 text-sm uppercase">Categoría</th>
                  <th className="p-4 text-right text-sm uppercase">Cantidad</th>
                  <th className="p-4 text-sm uppercase">Unidad</th>
                  <th className="p-4 text-right text-sm uppercase">Impuesto</th>
                  <th className="p-4 text-right text-sm uppercase">Costo</th>
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

        {/* Transacciones */}
        <div className="bg-white overflow-hidden">
          <h2 className="text-base font-semibold text-gray-800 mb-3 uppercase">Transacciones</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full ">
              <thead className="bg-gray-50 text-black">
                <tr>
                  <th className="p-4 text-sm uppercase">#</th>
                  <th className="p-4 text-sm uppercase">Fecha y Hora</th>
                  <th className="p-4 text-sm uppercase">Concepto</th>
                  <th className="p-4 text-sm uppercase">Nota</th>
                  <th className="p-4 text-sm uppercase">Usuario</th>
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

CompraDetalle.propTypes = {
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
};

export default CompraDetalle;
