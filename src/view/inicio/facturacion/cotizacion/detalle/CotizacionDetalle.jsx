import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import { alertWarning, calculateTax, calculateTaxBruto, formatNumberWithZeros, formatTime, getPathNavigation, isEmpty, isText, numberFormat, rounded } from '../../../../../helper/utils.helper';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import { detailCotizacion, documentsPdfInvoicesCotizacion, documentsPdfListsCotizacion } from '../../../../../network/rest/principal.network';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow, TableTitle } from '../../../../../components/Table';
import Title from '../../../../../components/Title';
import { SpinnerView } from '../../../../../components/Spinner';
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../../../components/Button';
import PropTypes from 'prop-types';
import pdfVisualizer from 'pdf-visualizer';
import { connect } from 'react-redux';
import { ModalSendWhatsApp } from '../../../../../components/MultiModal';
import Image from '../../../../../components/Image';
import { images } from '../../../../../helper';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class CotizacionDetalle extends CustomComponent {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

      idCotizacion: '',
      fechaHora: '',

      cliente: '',
      telefono: '',
      celular: '',
      email: '',
      direccion: '',

      comprobante: '',
      serieNumeracion: '',

      estado: '',

      observacion: '',
      notas: '',

      codiso: '',
      total: 0,

      detalles: [],
      ventas: [],

      isOpenSendWhatsapp: false,
    };

    // Referencia para el modal enviar WhatsApp
    this.refModalSendWhatsApp = React.createRef();

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
    const idCotizacion = new URLSearchParams(url).get('idCotizacion');

    if (isText(idCotizacion)) {
      this.loadingData(idCotizacion);
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
      idCotizacion: id,
    };

    const response = await detailCotizacion(params, this.abortControllerView.signal);

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      alertWarning('Cotización', response.getMessage(), () => {
        this.close();
      });
      return;
    }

    response instanceof SuccessReponse;
    const cotizacion = response.data;

    const {
      fecha,
      hora,

      comprobante,
      serie,
      numeracion,

      documento,
      informacion,
      telefono,
      celular,
      email,
      direccion,

      estado,
      observacion,
      nota,
      codiso,

    } = cotizacion.cabecera;

    const monto = cotizacion.detalles.reduce((accumlate, item) => accumlate + (item.precio * item.cantidad), 0,);

    this.setState({
      idCotizacion: id,
      fechaHora: fecha + " " + formatTime(hora),

      comprobante: comprobante,
      serieNumeracion: serie + "-" + formatNumberWithZeros(numeracion),

      cliente: documento + " - " + informacion,
      telefono: telefono,
      celular: celular,
      email: email,
      direccion: direccion,

      estado: estado === 1 ? <span className='text-success'>ACTIVO</span> : <span className='text-danger'>ANULADO</span>,
      observacion: observacion,
      notas: nota,
      codiso: codiso,
      total: monto,

      detalles: cotizacion.detalles,
      ventas: cotizacion.ventas,
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
  // Procesos impresión
  //------------------------------------------------------------------------------------------

  handlePrintInvoices = async (size) => {
    await pdfVisualizer.init({
      url: documentsPdfInvoicesCotizacion(this.state.idCotizacion, size),
      title: 'Cotización',
      titlePageNumber: 'Página',
      titleLoading: 'Cargando...',
    });
  }

  handlePrintList = async (size) => {
    await pdfVisualizer.init({
      url: documentsPdfListsCotizacion(this.state.idCotizacion, size),
      title: 'Cotización',
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

    const documentUrl = documentsPdfInvoicesCotizacion(this.state.idCotizacion, "A4");

    // Crear mensaje con formato
    const message = `
    Hola! Somos *${companyInfo.name}*
    
    Le enviamos su comprobante de cotización:
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

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title='Cotización'
          subTitle='DETALLE'
          handleGoBack={() => this.close()}
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
              onClick={this.handlePrintList.bind(this, 'A4')}
            >
              <i className="fa fa-print"></i> Lista
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
          <Column className="col-lg-6 col-md-6 col-sm-12 col-12" formGroup={true}>
            <TableResponsive>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Fecha
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.fechaHora}
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
                      Telefono
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.telefono}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Celular
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.celular}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Email
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.email}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Dirección
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.direccion}
                    </TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </TableResponsive>
          </Column>

          <Column className="col-lg-6 col-md-6 col-sm-12 col-12" formGroup={true}>
            <TableResponsive>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Comprobante
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.comprobante}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Serie - Numeración
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.serieNumeracion}
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
                      Observación
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.observacion}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Nota
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.notas}
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
                </TableHeader>
              </Table>
            </TableResponsive>
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
                    <TableHead className="text-center">Imagen</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Impuesto %</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Medida</TableHead>
                    <TableHead>Importe</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {
                    this.state.detalles.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell className="text-center">
                          <Image
                            default={images.noImage}
                            src={item.imagen}
                            alt={item.producto}
                            width={100}
                          />
                        </TableCell>
                        <TableCell>
                          {item.codigo}
                          <br />
                          {item.producto}
                        </TableCell>
                        <TableCell className="text-right">
                          {numberFormat(item.precio, this.state.codiso)}
                        </TableCell>

                        <TableCell>{item.categoria}</TableCell>
                        <TableCell className="text-right">{item.impuesto}</TableCell>
                        <TableCell className="text-right">{rounded(item.cantidad)}</TableCell>
                        <TableCell>{item.medida}</TableCell>
                        <TableCell className="text-right">
                          {numberFormat(
                            item.cantidad * item.precio,
                            this.state.codiso,
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </TableResponsive>
          </Column>
        </Row>

        <Row>
          <Column className="col-lg-9 col-md-9 col-sm-12 col-xs-12"></Column>
          <Column className="col-lg-3 col-md-3 col-sm-12 col-xs-12">
            <Table classNameContent='w-100'>
              <TableHeader>{this.renderTotal()}</TableHeader>
            </Table>
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive>
              <TableTitle>Ventas Asociadas</TableTitle>
              <Table className="table-light table-striped">
                <TableHeader className="table-dark">
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Comprobante</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isEmpty(this.state.ventas) && (
                    <TableRow>
                      <td className="text-center" colSpan="4">¡No hay ventas asociadas!</td>
                    </TableRow>
                  )}

                  {this.state.ventas.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.fecha} <br /> {formatTime(item.hora)} </TableCell>
                      <TableCell>
                        <Link className="btn-link" to={getPathNavigation("venta", item.idVenta)}>
                          {item.comprobante} <br /> {item.serie}-{formatNumberWithZeros(item.numeracion)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <React.Fragment>
                          {item.estado === 1 && <span className="text-success">COBRADO</span>}
                          {item.estado === 2 && <span className="text-warning">POR COBRAR</span>}
                          {item.estado === 3 && <span className="text-danger">ANULADO</span>}
                          {item.estado !== 1 && item.estado !== 2 && item.estado !== 3 && <span className="text-primary">POR LLEVAR</span>}
                        </React.Fragment>
                      </TableCell>
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

CotizacionDetalle.propTypes = {
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
  token: PropTypes.shape({
    project: PropTypes.shape({
      paginaWeb: PropTypes.string,
      email: PropTypes.string,
    })
  }),
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    predeterminado: state.predeterminado,
  };
};

const ConnectedCotizacionDetalle = connect(mapStateToProps, null)(CotizacionDetalle);

export default ConnectedCotizacionDetalle;
