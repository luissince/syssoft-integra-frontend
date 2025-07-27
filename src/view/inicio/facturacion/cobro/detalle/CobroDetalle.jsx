import {
  rounded,
  numberFormat,
  formatTime,
  isEmpty,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../../components/Container';
import {
  detailCobro,
  documentsPdfInvoicesCobro,
} from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import CustomComponent from '../../../../../model/class/custom-component';
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
import Button from '../../../../../components/Button';
import PropTypes from 'prop-types';
import React from 'react';
import pdfVisualizer from 'pdf-visualizer';
import { ModalSendWhatsApp } from '../../../../../components/MultiModal';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class CobroDetalle extends CustomComponent {
  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

      idCobro: '',
      comprobante: '',
      cliente: '',
      fecha: '',
      observacion: '',
      estado: 0,
      usuario: '',
      total: '',
      codiso: '',
      simbolo: '',

      detalles: [],
      transaccion: [],

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
    const idCobro = new URLSearchParams(url).get('idCobro');
    if (idCobro !== null) {
      this.loadDataId(idCobro);
    } else {
      this.props.history.goBack();
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
    const [cobro] = await Promise.all([this.fetchDetailCobro(id)]);

    if (cobro === null) {
      this.props.history.goBack();
      return;
    }

    const suma = cobro.detalles.reduce(
      (acumulador, item) => acumulador + item.monto * item.cantidad,
      0,
    );

    this.setState({
      idCobro: id,
      comprobante:
        cobro.cabecera.comprobante +
        ' ' +
        cobro.cabecera.serie +
        '-' +
        cobro.cabecera.numeracion,
      cliente: cobro.cabecera.documento + ' ' + cobro.cabecera.informacion,
      fecha: cobro.cabecera.fecha + ' ' + formatTime(cobro.cabecera.hora),
      observacion: cobro.cabecera.observacion,
      estado: cobro.cabecera.estado,
      usuario: cobro.cabecera.nombres + ', ' + cobro.cabecera.apellidos,
      codiso: cobro.cabecera.codiso,

      detalles: cobro.detalles,
      transaccion: cobro.transaccion,

      total: suma,

      loading: false,
    });
  }

  async fetchDetailCobro(id) {
    const params = {
      idCobro: id,
    };

    const response = await detailCobro(params, this.abortControllerView.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return null;
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

  //------------------------------------------------------------------------------------------
  // Eventos para impresión
  //------------------------------------------------------------------------------------------

  handlePrint = async (size) => {
    await pdfVisualizer.init({
      url: documentsPdfInvoicesCobro(this.state.idCobro, size),
      title: 'Ingreso',
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
    phone,
    callback = async function () {},
  ) => {
    const { razonSocial } = this.props.predeterminado.empresa;
    const { paginaWeb, email } = this.props.token.project;

    const companyInfo = {
      name: razonSocial,
      website: paginaWeb,
      email: email,
    };

    const documentUrl = documentsPdfInvoicesCobro(this.state.idCobro, 'A4');

    // Crear mensaje con formato
    const message = `
    Hola! Somos *${companyInfo.name}*
    
    Le enviamos su comprobante de ingreso:
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
    return this.state.detalles.map((item, index) => {
      return (
        <TableRow key={index}>
          <TableCell>{++index}</TableCell>
          <TableCell>{item.nombre}</TableCell>
          <TableCell>{rounded(item.cantidad)}</TableCell>
          <TableCell>{numberFormat(item.monto, this.state.codiso)}</TableCell>
          <TableCell>
            {numberFormat(item.cantidad * item.monto, this.state.codiso)}
          </TableCell>
        </TableRow>
      );
    });
  }

  renderTotal() {
    const total = this.state.detalles.reduce((acumulador, item) => {
      return acumulador + item.monto * item.cantidad;
    }, 0);

    return (
      <TableRow>
        <TableHead className="text-right h5">Total:</TableHead>
        <TableHead className="text-right h5">
          {numberFormat(total, this.state.codiso)}
        </TableHead>
      </TableRow>
    );
  }

  renderTransaciones() {
    if (isEmpty(this.state.transaccion)) {
      return (
        <TableRow>
          <TableCell colSpan="5" className="text-center">
            No hay transacciones para mostrar.
          </TableCell>
        </TableRow>
      );
    }

    return this.state.transaccion.map((item, index) => {
      return (
        <React.Fragment key={index}>
          <TableRow className="table-success">
            <TableCell>{index + 1}</TableCell>
            <TableCell>
              <span>{item.fecha}</span>
              <br />
              <span>{formatTime(item.hora)}</span>
            </TableCell>
            <TableCell>{item.concepto}</TableCell>
            <TableCell>{item.nota}</TableCell>
            <TableCell>{item.usuario}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="text-center">#</TableCell>
            <TableCell>Banco</TableCell>
            <TableCell>Monto</TableCell>
            <TableCell colSpan={2}>Observación</TableCell>
          </TableRow>
          {item.detalles.map((detalle, index) => {
            return (
              <TableRow key={index}>
                <TableCell className="text-center">{index + 1}</TableCell>
                <TableCell>{detalle.nombre}</TableCell>
                <TableCell>
                  {numberFormat(detalle.monto, this.state.codiso)}
                </TableCell>
                <TableCell colSpan={2}>{detalle.observacion}</TableCell>
              </TableRow>
            );
          })}
          <TableRow>
            <TableCell colSpan="5">
              <hr />
            </TableCell>
          </TableRow>
        </React.Fragment>
      );
    });
  }

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title="Ingreso"
          subTitle="DETALLE"
          handleGoBack={() => this.props.history.goBack()}
        />

        <ModalSendWhatsApp
          refModal={this.refModalSendWhatsApp}
          isOpen={this.state.isOpenSendWhatsapp}
          phone={this.state.celular}
          handleClose={this.handleCloseSendWhatsapp}
          handleProcess={this.handleProcessSendWhatsapp}
        />

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-light"
              onClick={this.handlePrint.bind(this, 'A4')}
            >
              <i className="fa fa-print"></i> A4
            </Button>{' '}
            <Button
              className="btn-light"
              onClick={this.handlePrint.bind(this, '80mm')}
            >
              <i className="fa fa-print"></i> 80MM
            </Button>{' '}
            <Button
              className="btn-light"
              onClick={this.handlePrint.bind(this, '58mm')}
            >
              <i className="fa fa-print"></i> 58MM
            </Button>{' '}
            <Button className="btn-light" onClick={this.handleOpenSendWhatsapp}>
              <i className="fa fa-whatsapp"></i> Whatsapp
            </Button>
          </Column>
        </Row>

        <Row>
          <Column>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    <span>Comprobante:</span>
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.comprobante}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    Cliente:
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.cliente}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    Fecha - Hora:
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.fecha}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    Observación:
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.observacion}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    Estado:
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.estado === 1 ? (
                      <span className="text-success font-weight-bold">
                        ACTIVO
                      </span>
                    ) : (
                      <span className="text-danger font-weight-bold">
                        ANULADO
                      </span>
                    )}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    Usuario:
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.usuario}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    Total:
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {numberFormat(this.state.total, this.state.codiso)}
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
                    <TableHead>#</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{this.renderDetalles()}</TableBody>
              </Table>
            </TableResponsive>
          </Column>
        </Row>

        <Row>
          <Column className="col-lg-8 col-md-8 col-sm-12 col-12"></Column>
          <Column className="col-lg-4 col-md-4 col-sm-12 col-12">
            <Table classNameContent="w-100">
              <TableHeader>{this.renderTotal()}</TableHeader>
            </Table>
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive>
              <TableTitle>Transacciones</TableTitle>
              <Table className="table-light table-striped">
                <TableHeader className="table-dark">
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Usuario</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{this.renderTransaciones()}</TableBody>
              </Table>
            </TableResponsive>
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

CobroDetalle.propTypes = {
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

const ConnectedCobroDetalle = connect(mapStateToProps, null)(CobroDetalle);

export default ConnectedCobroDetalle;
