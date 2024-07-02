import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import { calculateTax, calculateTaxBruto, formatNumberWithZeros, formatTime, getPathNavigation, isEmpty, isText, numberFormat, rounded } from '../../../../../helper/utils.helper';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import { detailCotizacion, obtenerCotizacionPdf } from '../../../../../network/rest/principal.network';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import { Table, TableResponsive } from '../../../../../components/Table';
import Title from '../../../../../components/Title';
import { SpinnerView } from '../../../../../components/Spinner';
import printJS from 'print-js';
import React from 'react';
import { Link } from 'react-router-dom';

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
      ventas: []
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
    const idCotizacion = new URLSearchParams(url).get('idCotizacion');

    if (isText(idCotizacion)) {
      this.loadingData(idCotizacion);
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

  async loadingData(id) {
    const [cotizacion] = await Promise.all([
      this.fetchDetailCotizacion(id)
    ]);

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

  async fetchDetailCotizacion(id) {
    const params = {
      idCotizacion: id,
    };

    const response = await detailCotizacion(params, this.abortControllerView.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return false;
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
  // Procesos impresión
  //------------------------------------------------------------------------------------------

  handleOpenImpresionA4 = () => {
    printJS({
      printable: obtenerCotizacionPdf(this.state.idCotizacion, "a4"),
      type: 'pdf',
      showModal: true,
      modalMessage: "Recuperando documento..."
    });
  }

  handleOpenImpresionTicket = () => {
    printJS({
      printable: obtenerCotizacionPdf(this.state.idCotizacion, "ticket"),
      type: 'pdf',
      showModal: true,
      modalMessage: "Recuperando documento..."
    });
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
          <tr key={index}>
            <th className="text-right mb-2">{impuesto.nombre} :</th>
            <th className="text-right mb-2">
              {numberFormat(impuesto.valor, this.state.codiso)}
            </th>
          </tr>
        );
      });
    }
    return (
      <>
        <tr>
          <th className="text-right mb-2">SUB TOTAL :</th>
          <th className="text-right mb-2">
            {numberFormat(subTotal, this.state.codiso)}
          </th>
        </tr>
        {impuestosGenerado()}
        <tr className="border-bottom"></tr>
        <tr>
          <th className="text-right h5">TOTAL :</th>
          <th className="text-right h5">
            {numberFormat(total, this.state.codiso)}
          </th>
        </tr>
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
          subTitle='Detalle'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column>
            <div className="form-group">
              <button
                type="button"
                className="btn btn-light"
                onClick={this.handleOpenImpresionA4}
              >
                <i className="fa fa-print"></i> A4
              </button>
              {' '}
              <button
                type="button"
                className="btn btn-light"
                onClick={this.handleOpenImpresionTicket}
              >
                <i className="fa fa-print"></i> Ticket
              </button>
            </div>
          </Column>
        </Row>

        <Row>
          <Column className="col-lg-6 col-md-6 col-sm-12 col-12">
            <TableResponsive
              className={"table table-borderless"}
              formGroup={true}
              tHead={
                <>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Fecha Compra
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.fechaHora}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Cliente
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.cliente}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Telefono
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.telefono}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Celular
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.celular}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Email
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.email}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Dirección
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.direccion}
                    </th>
                  </tr>
                </>
              }
            />
          </Column>

          <Column className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <TableResponsive
              className={"table table-borderless"}
              formGroup={true}
              tHead={
                <>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Comprobante
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.comprobante}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Serie - Numeración
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.serieNumeracion}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Estado
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.estado}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Observación
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.observacion}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Nota
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.notas}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Total
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {numberFormat(this.state.total, this.state.codiso)}
                    </th>
                  </tr>
                </>
              }
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive
              className="table table-light table-striped"
              title={"Detalle"}
              tHead={
                <tr>
                  <th>#</th>
                  <th>Descripción</th>
                  <th>Precio</th>
                  <th>Categoría</th>
                  <th>Impuesto %</th>
                  <th>Cantidad</th>
                  <th>Medida</th>
                  <th>Importe</th>
                </tr>
              }
              tBody={
                <>
                  {this.state.detalles.map((item, index) => (
                    <tr key={index}>
                      <td>{item.id}</td>
                      <td>
                        {item.codigo}
                        <br />
                        {item.producto}
                      </td>
                      <td className="text-right">
                        {numberFormat(item.precio, this.state.codiso)}
                      </td>

                      <td>{item.categoria}</td>
                      <td className="text-right">{item.impuesto}</td>
                      <td className="text-right">{rounded(item.cantidad)}</td>
                      <td>{item.medida}</td>
                      <td className="text-right">
                        {numberFormat(
                          item.cantidad * item.precio,
                          this.state.codiso,
                        )}
                      </td>
                    </tr>
                  ))}
                </>
              }
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-lg-9 col-md-9 col-sm-12 col-xs-12"></Column>
          <Column className="col-lg-3 col-md-3 col-sm-12 col-xs-12">
            <Table
              formGroup={true}
              tHead={this.renderTotal()}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive
              className="table table-light table-striped"
              title={"Ventas Asociadas"}
              tHead={
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Comprobante</th>
                  <th>Estado</th>
                </tr>
              }
              tBody={
                <>
                  {isEmpty(this.state.ventas) && (
                    <tr>
                      <td className="text-center" colSpan="4">¡No hay ventas asociadas!</td>
                    </tr>
                  )}

                  {this.state.ventas.map((item, index) => (
                    <tr key={index}>
                      <td>{item.id}</td>
                      <td>{item.fecha} <br /> {formatTime(item.hora)} </td>
                      <td>
                        <Link className="btn-link" to={getPathNavigation("venta", item.idVenta)}>
                          {item.comprobante} <br /> {item.serie}-{formatNumberWithZeros(item.numeracion)}
                        </Link>
                      </td>
                      <td>
                        <React.Fragment>
                          {item.estado === 1 && <span className="text-success">COBRADO</span>}
                          {item.estado === 2 && <span className="text-warning">POR COBRAR</span>}
                          {item.estado === 3 && <span className="text-danger">ANULADO</span>}
                          {item.estado !== 1 && item.estado !== 2 && item.estado !== 3 && <span className="text-primary">POR LLEVAR</span>}
                        </React.Fragment>
                      </td>
                    </tr>
                  ))}
                </>
              }
            />
          </Column>
        </Row>

      </ContainerWrapper>
    );
  }
}

export default CotizacionDetalle;
