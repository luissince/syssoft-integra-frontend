import {
  rounded,
  formatCurrency,
  formatTime,
  isEmpty,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../../components/Container';
import {
  detailCobro,
  detailConsulta,
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

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class ConsultaDetalle extends CustomComponent {
  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

      idConsulta: '',
      nombre: '',
      email: '',
      celular: '',
      asunto: '',
      mensaje: '',
      estado: 0,
      fecha: '',
      hora: '',
    };

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
    const idConsulta = new URLSearchParams(url).get('idConsulta');
    if (idConsulta !== null) {
      this.loadDataId(idConsulta);
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
    const response = await detailConsulta(id, this.abortControllerView.signal);

    if (response instanceof SuccessReponse) {
      const consulta = response.data;
      this.setState({
        idConsulta: consulta.idConsulta,
        nombre: consulta.nombre,
        email: consulta.email,
        celular: consulta.celular,
        asunto: consulta.asunto,
        mensaje: consulta.mensaje,
        estado: consulta.estado,
        fecha: consulta.fecha,
        hora: consulta.hora,

        loading: false,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.props.history.goBack();
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
          title="Consulta"
          subTitle="DETALLE"
          handleGoBack={() => this.props.history.goBack()}
        />

        {/* <Row>
          <Column formGroup={true}>
            <Button
              className="btn-light"
              onClick={this.handlePrint.bind(this, 'A4')}
            >
              <i className="fa fa-print"></i> A4
            </Button>
            {' '}
            <Button
              className="btn-light"
              onClick={this.handlePrint.bind(this, '80mm')}
            >
              <i className="fa fa-print"></i> 80MM
            </Button>
            {' '}
            <Button
              className="btn-light"
              onClick={this.handlePrint.bind(this, '58mm')}
            >
              <i className="fa fa-print"></i> 58MM
            </Button>
          </Column>
        </Row> */}

        <Row>
          <Column>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    Cliente
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.nombre}
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
                    N° de celular
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.celular}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    Asunto
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.asunto}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    Mensaje
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.mensaje}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    Estado
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
                    Fecha y Hora
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.fecha} - {formatTime(this.state.hora)}
                  </TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

ConsultaDetalle.propTypes = {
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

const ConnectedConsultaDetalle = connect(
  mapStateToProps,
  null,
)(ConsultaDetalle);

export default ConnectedConsultaDetalle;
