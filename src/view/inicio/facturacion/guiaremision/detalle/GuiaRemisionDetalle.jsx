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
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import PropTypes from 'prop-types';
import { SpinnerView } from '../../../../../components/Spinner';
import Title from '../../../../../components/Title';
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
import pdfVisualizer from 'pdf-visualizer';
import { ModalSendWhatsApp } from '../../../../../components/MultiModal';
import Image from '../../../../../components/Image';
import { images } from '../../../../../helper';
import { cn } from '@/lib/utils';
import { alertKit } from 'alert-kit';
import { sendWhatsAppAsync } from '@/redux/whatsapp.slice';

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
      fecha: '',
      hora: '',
      comprobante: '',
      serie: '',
      numeracion: '',
      modalidadTraslado: '',
      motivoTraslado: '',
      fechaTraslado: '',
      tipoPeso: '',
      peso: '',
      marca: '',
      numeroPlaca: '',
      documentoConductor: '',
      informacionConductor: '',
      licenciaConducir: '',
      direccionPartida: '',
      ubigeoPartida: '',
      direccionLlegada: '',
      ubigeoLlegada: '',
      usuario: '',
      estado: 0,
      comprobanteRef: '',
      serieRef: '',
      numeracionRef: '',
      cliente: '',

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

    const response = await detailGuiaRemision(
      params,
      this.abortControllerView.signal,
    );

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      alertKit.warning({
        title: 'Guia de Remision',
        message: response.getMessage(),
      }, () => {
        this.close();
      });
      return;
    }

    response instanceof SuccessReponse;
    const guiaRemision = response.data;

    const {
      fecha,
      hora,
      comprobante,
      serie,
      numeracion,
      modalidadTraslado,
      motivoTraslado,
      fechaTraslado,
      tipoPeso,
      peso,
      marca,
      numeroPlaca,
      documentoConductor,
      informacionConductor,
      licenciaConducir,
      direccionPartida,
      ubigeoPartida,
      direccionLlegada,
      ubigeoLlegada,
      usuario,
      estado,
      comprobanteRef,
      serieRef,
      numeracionRef,
      cliente,
    } = guiaRemision.cabecera;

    this.setState({
      idGuiaRemision: id,
      fecha,
      hora,
      comprobante,
      serie,
      numeracion,
      modalidadTraslado,
      motivoTraslado,
      fechaTraslado,
      tipoPeso,
      peso,
      marca,
      numeroPlaca,
      documentoConductor,
      informacionConductor,
      licenciaConducir,
      direccionPartida,
      ubigeoPartida,
      direccionLlegada,
      ubigeoLlegada,
      usuario,
      estado,
      comprobanteRef,
      serieRef,
      numeracionRef,
      cliente,

      detalles: guiaRemision.detalles,

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

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title="Guía Remisión"
          subTitle="DETALLE"
          handleGoBack={() => this.close()}
        />

        <ModalSendWhatsApp
          isOpen={this.state.isOpenSendWhatsapp}
          phone={this.state.celular}
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

        <Row>
          <Column className="col-lg-6 col-md-12">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    Fecha
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.fecha} {formatTime(this.state.hora)}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-35 p-1 font-weight-normal ">
                    Comprobante
                  </TableHead>
                  <TableHead className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.serie}-
                    {formatNumberWithZeros(this.state.numeracion)}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-35 p-1 font-weight-normal ">
                    Fecha Traslado
                  </TableHead>
                  <TableHead className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.fechaTraslado}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-35 p-1 font-weight-normal ">
                    Cliente
                  </TableHead>
                  <TableHead className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.cliente}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-35 p-1 font-weight-normal ">
                    Motivo Traslado
                  </TableHead>
                  <TableHead className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.motivoTraslado}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-35 p-1 font-weight-normal ">
                    Modalidad Traslado
                  </TableHead>
                  <TableHead className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.modalidadTraslado}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-35 p-1 font-weight-normal ">
                    Peso (KGM o TNE)
                  </TableHead>
                  <TableHead className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.tipoPeso} {this.state.peso}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-35 p-1 font-weight-normal ">
                    Comprobante Asociado
                  </TableHead>
                  <TableHead className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.comprobanteRef}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-35 p-1 font-weight-normal ">
                    Serie y Numeración
                  </TableHead>
                  <TableHead className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.serieRef}-
                    {formatNumberWithZeros(this.state.numeracionRef)}
                  </TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </Column>

          <Column className="col-lg-6 col-md-12">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="table-secondary w-35 p-1 font-weight-normal ">
                    Conductor
                  </TableHead>
                  <TableHead className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.documentoConductor},{' '}
                    {this.state.informacionConductor}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-35 p-1 font-weight-normal ">
                    Número de Licencia
                  </TableHead>
                  <TableHead className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.licenciaConducir}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-35 p-1 font-weight-normal ">
                    Número de Placa
                  </TableHead>
                  <TableHead className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.numeroPlaca}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-35 p-1 font-weight-normal ">
                    Dirección de Partida
                  </TableHead>
                  <TableHead className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.direccionPartida}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-35 p-1 font-weight-normal ">
                    Dirección de Llegada
                  </TableHead>
                  <TableHead className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.direccionLlegada}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-35 p-1 font-weight-normal ">
                    Estado:
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    <span className={cn(
                      "inline-flex items-center rounded-full",
                      "text-xs font-medium",
                      "px-2.5 py-0.5",
                      this.state.estado === 1 && "bg-green-100 text-green-800",
                      this.state.estado === 3 && "bg-red-100 text-red-800",
                    )}>
                      {this.state.estado === 1 && "ACTIVO"}
                      {this.state.estado === 3 && "ANULADO"}
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive>
              <TableTitle>Detalles</TableTitle>
              <Table className="table-light table-striped">
                <TableHeader className="table-dark">
                  <TableRow>
                    <TableHead className="text-center">#</TableHead>
                    <TableHead className="text-center">Imagen</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Unid. Medida</TableHead>
                    <TableHead>Cantidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {this.state.detalles.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center">{++index}</TableCell>
                      <TableCell className="text-center">
                        <Image
                          default={images.noImage}
                          src={item.imagen}
                          alt={item.nombre}
                          width={100}
                        />
                      </TableCell>
                      <TableCell>
                        {item.codigo}
                        <br />
                        {item.nombre}
                      </TableCell>
                      <TableCell>{item.medida}</TableCell>
                      <TableCell>{rounded(item.cantidad)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableResponsive>
          </Column>
        </Row>
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
