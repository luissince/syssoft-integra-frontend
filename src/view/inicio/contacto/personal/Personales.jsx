import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  isEmpty,
} from '@/helper/utils.helper';
import Paginacion from '@/components/Paginacion';
import ContainerWrapper from '@/components/ui/container-wrapper';
import {
  listPersonasPersonales,
  preferredPersona,
} from '@/network/rest/principal.network';
import SuccessReponse from '@/model/class/response';
import ErrorResponse from '@/model/class/error-response';
import { CANCELED } from '@/constants/requestStatus';
import CustomComponent from '@/components/CustomComponent';
import Title from '@/components/Title';
import Row from '@/components/Row';
import Column from '@/components/Column';
import Button from '@/components/Button';
import Search from '@/components/Search';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/Table';
import { SpinnerTable } from '@/components/Spinner';
import { alertKit } from 'alert-kit';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class Personales extends CustomComponent {
  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      lista: [],
      restart: false,

      buscar: "",

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: "Cargando información...",

      idSucursal: this.props.token.project.idSucursal,
    };

    this.abortControllerTable = new AbortController();
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
    await this.loadInit();
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
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

  loadInit = async () => {
    if (this.state.loading) return;

    await this.setStateAsync({ paginacion: 1, restart: true });
    this.fillTable(0);
    await this.setStateAsync({ opcion: 0 });
  };

  searchText = async (text) => {
    if (this.state.loading) return;

    if (text.trim().length === 0) return;

    await this.setStateAsync({ paginacion: 1, restart: false, buscar: text });
    this.fillTable(1, text.trim());
    await this.setStateAsync({ opcion: 1 });
  };

  paginacionContext = async (listid) => {
    await this.setStateAsync({ paginacion: listid, restart: false });
    this.onEventPaginacion();
  };

  onEventPaginacion = () => {
    switch (this.state.opcion) {
      case 0:
        this.fillTable(0);
        break;
      case 1:
        this.fillTable(1, this.state.buscar);
        break;
      default:
        this.fillTable(0);
    }
  };

  fillTable = async (opcion, buscar = "") => {
    this.setState({
      loading: true,
      lista: [],
      messageTable: "Cargando información...",
    });

    const params = {
      opcion: opcion,
      buscar: buscar.trim(),
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listPersonasPersonales(
      params,
      this.abortControllerTable.signal,
    );

    if (response instanceof SuccessReponse) {
      const totalPaginacion = parseInt(
        String(Math.ceil(Number(response.data.total) / this.state.filasPorPagina)),
      );

      this.setState({
        loading: false,
        lista: response.data.result,
        totalPaginacion: totalPaginacion,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.setState({
        loading: false,
        lista: [],
        totalPaginacion: 0,
        messageTable: response.getMessage(),
      });
    }
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

  handleEditar(idPersona) {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/editar`,
      search: '?idPersona=' + idPersona,
    });
  }

  async handlePreferred(idPersona) {
    const accept = await alertKit.question({
      title: "Personal",
      message: "¿Está seguro de que desea hacer el personal preferido?",
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      alertKit.loading({
        message: "Procesando información...",
      });

      const params = {
        idPersona: idPersona,
        rol: '4',
      };

      const response = await preferredPersona(params);

      if (response instanceof SuccessReponse) {
        alertKit.success({
          title: "Personal",
          message: response.data,
        }, () => {
          this.loadInit();
        });
      }

      if (response instanceof ErrorResponse) {
        alertKit.warning({
          title: "Personal",
          message: response.getMessage(),
        });
      }
    }
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

  generateBody() {
    if (this.state.loading) {
      return (
        <SpinnerTable
          colSpan={7}
          message="Cargando información de la tabla..."
        />
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <TableRow className="text-center">
          <TableCell colSpan={7}>¡No hay datos registrados!</TableCell>
        </TableRow>
      );
    }

    return this.state.lista.map((item, index) => {
      return (
        <TableRow key={index}>
          <TableCell className="text-center">{item.id}</TableCell>
          <TableCell>
            <span>{item.informacion}</span>
            {<br />}
            <span>{item.documento}</span>
          </TableCell>
          <TableCell>
            {item.cargo}
          </TableCell>
          <TableCell>
            <span>{item.email}</span>
            <br />
            <span>{item.celular}</span>
          </TableCell>
          <TableCell className="text-center">
            <span
              className={`badge ${item.estado === 1 ? 'badge-success' : 'badge-danger'}`}
            >
              {item.estado === 1 ? 'ACTIVO' : 'INACTIVO'}
            </span>
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-warning btn-sm"
              onClick={() => this.handleEditar(item.idPersona)}
            >
              <i className="bi bi-pencil"></i>
            </Button>
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-info btn-sm"
              onClick={() => this.handlePreferred(item.idPersona)}
            >
              <i className="bi bi-box"></i>
            </Button>
          </TableCell>
        </TableRow>
      );
    });
  }

  render() {
    return (
      <ContainerWrapper>
        <Title
          title="Personales"
          subTitle="LISTA"
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Button className="btn-outline-secondary" onClick={this.loadInit}>
              <i className="bi bi-arrow-clockwise"></i> Recargar Vista
            </Button>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <Search
              group={true}
              iconLeft={<i className="bi bi-search"></i>}
              onSearch={this.searchText}
              placeholder="Buscar clientes..."
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <Table className={'table-bordered'}>
              <TableHeader className="thead-light">
                <TableRow>
                  <TableHead width="5%" className="text-center">#</TableHead>
                  <TableHead width="35%">Nombre</TableHead>
                  <TableHead width="20%">Cargo</TableHead>
                  <TableHead width="20%">Contacto</TableHead>
                  <TableHead width="10%">Estado</TableHead>
                  <TableHead width="5%" className="text-center">Editar</TableHead>
                  <TableHead width="5%" className="text-center">Preferido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{this.generateBody()}</TableBody>
            </Table>
          </Column>
        </Row>

        <Paginacion
          loading={this.state.loading}
          data={this.state.lista}
          totalPaginacion={this.state.totalPaginacion}
          paginacion={this.state.paginacion}
          fillTable={this.paginacionContext}
          restart={this.state.restart}
        />
      </ContainerWrapper>
    );
  }
}

Personales.propTypes = {
  token: PropTypes.shape({
    project: PropTypes.shape({
      idSucursal: PropTypes.string.isRequired,
    }).isRequired,
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedPersonales = connect(mapStateToProps, null)(Personales);

export default ConnectedPersonales;
