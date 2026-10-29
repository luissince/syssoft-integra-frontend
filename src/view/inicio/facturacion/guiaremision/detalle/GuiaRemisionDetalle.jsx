import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '@/components/CustomComponent';
import {
  isText,
  formatTime,
  rounded,
  formatNumberWithZeros
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import {
  detailGuiaRemision,
  getPdfGuiaRemision,
} from '../../../../../network/rest/principal.network';
import { CANCELED } from '../../../../../model/types/types';
import PropTypes from 'prop-types';
import { SpinnerView } from '../../../../../components/Spinner';
import Title from '../../../../../components/Title';
import pdfVisualizer from 'pdf-visualizer';
import { ModalSendWhatsApp } from '../../../../../components/MultiModal';
import Image from '../../../../../components/Image';
import { images } from '../../../../../helper';
import { cn } from '@/lib/utils';
import { alertKit } from 'alert-kit';
import { sendWhatsAppAsync } from '@/redux/whatsapp.slice';
import { CircleCheck, CircleX } from 'lucide-react';
import React from 'react';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class GuiaRemisionDetalle extends CustomComponent {
  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

      idGuiaRemision: '',
      cabecera: null,
      detalles: [],

      isOpenSendWhatsapp: false,
    };

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
    const idGuiaRemision = new URLSearchParams(url).get('idGuiaRemision');
    if (isText(idGuiaRemision)) {
      await this.loadingData(idGuiaRemision);
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
      idGuiaRemision: id,
    };

    const { success, data, message, type } = await detailGuiaRemision(
      params,
      this.abortControllerView.signal,
    );

    if (!success) {
      if (type === CANCELED) return;

      alertKit.warning({
        title: 'Guia de Remision',
        message: message,
      }, () => {
        this.close();
      });
      return;
    }

    this.setState({
      idGuiaRemision: id,
      cabecera: data.cabecera,
      detalles: data.detalles,

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
      url: getPdfGuiaRemision(this.state.idGuiaRemision, size),
      title: 'Guía de Remision',
      titlePageNumber: 'Página',
      titleLoading: 'Cargando...',
    });
  };

  //------------------------------------------------------------------------------------------
  // Modal de enviar WhatsApp
  //------------------------------------------------------------------------------------------

  handleOpenSendWhatsapp = () => {
    this.setState({ isOpenSendWhatsapp: true });
  };

  handleProcessSendWhatsapp = async (
    params,
    callback,
  ) => {
    const payload = {
      id: crypto.randomUUID(),
      to: params.phone,
      message: params.message,
      type: params.type,
    };

    if (params.type === 'pdf') {
      const { idGuiaRemision, cabecera } = this.state;

      if (!cabecera) {
        alertKit.warning({
          title: 'Guia de Remisión',
          message: 'No se pudo enviar el documento.',
        });
        return;
      }

      payload.url = getPdfGuiaRemision(idGuiaRemision, params.pdfType);

      payload.filename =
        `GUIA DE REMISIÓN ${cabecera.serie}-${cabecera.numeracion} - ${cabecera.informacion}.pdf`;

      payload.caption = params.message;
    }

    this.props.sendWhatsAppAsync(payload);

    await callback?.();
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
            { label: 'Fecha Traslado', value: () => cabecera.fechaTraslado },
            {
              label: 'Cliente', value: () => {
                return cabecera.documento + ' - ' + cabecera.informacion;
              }
            },
            { label: 'Motivo Traslado', value: () => cabecera.motivoTraslado },
            { label: 'Modalidad Traslado', value: () => cabecera.modalidadTraslado },

            {
              label: 'Peso (KGM o TNE)', value: () => {
                return cabecera.tipoPeso + ' ' + cabecera.peso
              }
            },

            {
              label: 'Comprobante Asociado', value: () => {
                return cabecera.comprobanteRef + ' ' + cabecera.serieRef + '-' + formatNumberWithZeros(cabecera.numeracionRef)
              }
            },

            {
              label: 'Conductor', value: () => {
                return cabecera.documentoConductor + ' ' + cabecera.informacionConductor
              }
            },
            { label: 'Número de Licencia', value: () => cabecera.licenciaConducir },
            { label: 'Número de Placa', value: () => cabecera.numeroPlaca },
            { label: 'Dirección de Partida', value: () => cabecera.direccionPartida },
            { label: 'Dirección de Llegada', value: () => cabecera.direccionLlegada },

            {
              label: 'Estado', value: () => {
                return (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1",
                      "font-medium",
                      cabecera.estado === 1 && "text-green-700",
                      cabecera.estado === 0 && "text-red-700",
                    )}
                  >
                    {cabecera.estado === 1 ? (
                      <>
                        <CircleCheck className="w-4 h-4" />
                        Activo
                      </>
                    ) : (
                      <>
                        <CircleX className="w-4 h-4" />
                        Anulado
                      </>
                    )}
                  </span>
                );
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
                <th className="p-4">Unid. Medida</th>
                <th className="p-4">Cantidad</th>
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
                              alt={item.nombre}
                              overrideClass="max-w-full max-h-full w-auto h-auto object-contain block"
                            />
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-mono text-sm text-gray-500">
                            {item.codigo}
                          </p>
                          <p className="text-black uppercase">
                            {item.nombre}
                          </p>
                        </td>
                        <td className="p-4 text-left">
                          {item.medida}
                        </td>
                        <td className="p-4">
                          {rounded(item.cantidad)}
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

  render() {
    const { loading, msgLoading, cabecera, isOpenSendWhatsapp } = this.state;

    return (
      <ContainerWrapper>
        <SpinnerView
          loading={loading}
          message={msgLoading}
        />

        <Title
          title="Guía Remisión"
          subTitle="DETALLE"
          handleGoBack={() => this.close()}
        />

        <ModalSendWhatsApp
          isOpen={isOpenSendWhatsapp}
          phone={cabecera}
          handleClose={this.handleCloseSendWhatsapp}
          handleProcess={this.handleProcessSendWhatsapp}
          documents={[
            {
              label: "- Seleccionar Formato -",
              value: ""
            },
            {
              label: "Formato A4",
              value: "A4"
            },
            {
              label: "Formato 80mm",
              value: "80mm"
            },
            {
              label: "Formato 58mm",
              value: "58mm"
            },
          ]}
        />

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-500 flex items-center gap-2"
            onClick={this.handlePrintInvoices.bind(this, 'A4')}
          >
            <i className="fa fa-print"></i> A4
          </button>

          <button
            className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-500 flex items-center gap-2"
            onClick={this.handlePrintInvoices.bind(this, '80mm')}
          >
            <i className="fa fa-print"></i> 80MM
          </button>

          <button
            className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-500 flex items-center gap-2"
            onClick={this.handlePrintInvoices.bind(this, '58mm')}
          >
            <i className="fa fa-print"></i> 58MM
          </button>

          <button
            className="px-4 py-2 bg-green-600 border border-gray-300 text-sm font-medium rounded-lg text-white hover:bg-green-500 flex items-center gap-2"
            onClick={this.handleOpenSendWhatsapp}
          >
            <i className="fa fa-whatsapp"></i> Whatsapp
          </button>
        </div>

        {/* Cabecera */}
        {this.renderCabecera()}

        {/* Detalles */}
        {this.renderDetalles()}
      </ContainerWrapper>
    );
  }
}

GuiaRemisionDetalle.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string.isRequired,
    }).isRequired,
    project: PropTypes.shape({
      idSucursal: PropTypes.string.isRequired,
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
      paginaWeb: PropTypes.string,
      razonSocial: PropTypes.string,
    }),
  }),
  sendWhatsAppAsync: PropTypes.func,
};


const mapStateToProps = (state) => {
  return {
    token: state.principal,
    predeterminado: state.predeterminado,
  };
};

const mapDispatchToProps = {
  sendWhatsAppAsync
};

const ConnectedGuiaRemisionDetalle = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GuiaRemisionDetalle);

export default ConnectedGuiaRemisionDetalle;
