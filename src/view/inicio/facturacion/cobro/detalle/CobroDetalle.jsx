import {
  rounded,
  numberFormat,
  formatTime,
  isEmpty,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../../components/Container';
import { detailCobro, obtenerVentaPdf } from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import CustomComponent from '../../../../../model/class/custom-component';
import { SpinnerView } from '../../../../../components/Spinner';
import Title from '../../../../../components/Title';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import { Table, TableResponsive } from '../../../../../components/Table';
import Button from '../../../../../components/Button';
import printJS from 'print-js';
import PropTypes from 'prop-types';
import React from 'react';

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
      idCobro: '',
      comprobante: '',
      cliente: '',
      fecha: '',
      observacion: '',
      estado: '',
      usuario: '',
      total: '',
      codiso: '',
      simbolo: '',

      detalles: [],
      transaccion: [],

      loading: true,
      msgLoading: 'Cargando datos...',
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
    const [cobro] = await Promise.all([
      this.fetchDetailCobro(id)
    ]);

    if (cobro === null) {
      this.props.history.goBack();
      return;
    }

    const suma = cobro.detalles.reduce((acumulador, item) => acumulador + item.monto * item.cantidad, 0);

    this.setState({
      comprobante: cobro.cabecera.comprobante + ' ' + cobro.cabecera.serie + '-' + cobro.cabecera.numeracion,
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

  handlePrintA4 = () => {
    printJS({
      printable: obtenerVentaPdf(this.state.idVenta, "a4"),
      type: 'pdf',
      showModal: true,
      modalMessage: "Recuperando documento...",
      onPrintDialogClose: () => {
        console.log("onPrintDialogClose")
      }
    })
  }

  handlePrintTicket = () => {
    printJS({
      printable: obtenerVentaPdf(this.state.idVenta, "ticket"),
      type: 'pdf',
      showModal: true,
      modalMessage: "Recuperando documento...",
      onPrintDialogClose: () => {
        console.log("onPrintDialogClose")
      }
    })
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


  renderDetalles() {
    return (
      this.state.detalles.map((item, index) => {
        return (
          <tr key={index}>
            <td>{++index}</td>
            <td>{item.nombre}</td>
            <td>{rounded(item.cantidad)}</td>
            <td>
              {numberFormat(item.monto, this.state.codiso)}
            </td>
            <td>
              {numberFormat(
                item.cantidad * item.monto,
                this.state.codiso,
              )}
            </td>
          </tr>
        );
      })
    );
  }

  renderTotal() {
    const total = this.state.detalles.reduce((acumulador, item) => {
      return acumulador + item.monto * item.cantidad;
    }, 0);

    return (
      <tr>
        <th className="text-right h5">Total:</th>
        <th className="text-right h5">
          {numberFormat(total, this.state.codiso)}
        </th>
      </tr>
    );
  }


  renderTransaciones() {
    if (isEmpty(this.state.transaccion)) {
      return (
        <tr>
          <td colSpan="5" className="text-center">
            No hay transacciones para mostrar.
          </td>
        </tr>
      );
    }

    return (
      this.state.transaccion.map((item, index) => {
        return (
          <React.Fragment key={index}>
            <tr className="table-success">
              <td>{index + 1}</td>
              <td>
                <span>{item.fecha}</span>
                <br />
                <span>{formatTime(item.hora)}</span>
              </td>
              <td>{item.concepto}</td>
              <td>{item.nota}</td>
              <td>{item.usuario}</td>
            </tr>

            <tr>
              <td className="text-center">#</td>
              <td>Banco</td>
              <td>Monto</td>
              <td colSpan={2}>Observación</td>
            </tr>
            {
              item.detalles.map((detalle, index) => {
                return (
                  <tr key={index}>
                    <td className="text-center">{index + 1}</td>
                    <td>{detalle.nombre}</td>
                    <td>{numberFormat(detalle.monto, this.state.codiso)}</td>
                    <td colSpan={2}>{detalle.observacion}</td>
                  </tr>
                );
              })
            }
            <tr>
              <td colSpan="5">
                <hr />
              </td>
            </tr>
          </React.Fragment>
        );
      })
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
          title='Cobro'
          subTitle='DETALLE'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-light"
              onClick={this.handlePrintA4}
            >
              <i className="fa fa-print"></i> A4
            </Button>
            {' '}
            <Button
              className="btn-light"
              onClick={this.handlePrintTicket}
            >
              <i className="fa fa-print"></i> Ticket
            </Button>
          </Column>
        </Row>

        <Row>
          <Column>
            <Table
              formGroup={true}
              tHead={
                <>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      <span>Comprobante:</span>
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.comprobante}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Cliente:
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.cliente}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Fecha - Hora:
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.fecha}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Observación:
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.observacion}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Estado:
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.estado === 1 ? (
                        <span className="text-success font-weight-bold">
                          ACTIVO
                        </span>
                      ) : (
                        <span className="text-danger font-weight-bold">
                          ANULADO
                        </span>
                      )}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Usuario:
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.usuario}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Total:
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
              className={"table table-light table-striped"}
              title={"Detalle"}
              formGroup={true}
              tHead={
                <tr>
                  <th>#</th>
                  <th>Concepto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Total</th>
                </tr>
              }
              tBody={this.renderDetalles()}
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-lg-8 col-md-8 col-sm-12 col-12"></Column>
          <Column className="col-lg-4 col-md-4 col-sm-12 col-12">
            <Table
              formGroup={true}
              tHead={this.renderTotal()}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive
              className={"table table-light table-striped"}
              title={"Transacciones"}
              tHead={
                <tr>
                  <th>#</th>
                  <th>Fecha y Hora</th>
                  <th>Concepto</th>
                  <th>Nota</th>
                  <th>Usuario</th>
                </tr>
              }

              tBody={this.renderTransaciones()}
            />
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
    search: PropTypes.string
  })
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedCobroDetalle = connect(mapStateToProps, null)(CobroDetalle);

export default ConnectedCobroDetalle;
