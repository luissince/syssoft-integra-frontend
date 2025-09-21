import PropTypes from 'prop-types';
import {
  numberFormat,
  isEmpty,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import Paginacion from '../../../../../components/Paginacion';
import {
  deleteBanco,
  listBancos,
} from '../../../../../network/rest/principal.network';
import ErrorResponse from '../../../../../model/class/error-response';
import SuccessReponse from '../../../../../model/class/response';
import { CANCELED } from '../../../../../model/types/types';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
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
} from '../../../../../components/Table';
import { SpinnerTable } from '../../../../../components/Spinner';
import Button from '../../../../../components/Button';
import Search from '../../../../../components/Search';
import {
  setListaBancoData,
  setListaBancoPaginacion,
} from '../../../../../redux/predeterminadoSlice';
import React from 'react';
import { alertKit } from 'alert-kit';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class Bancos extends CustomComponent {

  /**
   * Inicializa un nuevo componente.
   * @param {Object} props - Las propiedades pasadas al componente.
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      lista: [],
      restart: false,

      buscar: '',

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refPaginacion = React.createRef();

    this.refSearch = React.createRef();

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
    await this.loadingData();
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
   
  loadingData = async () => {
    if (
      this.props.bancoLista &&
      this.props.bancoLista.data &&
      this.props.bancoLista.paginacion
    ) {
      this.setState(this.props.bancoLista.data);
      this.refPaginacion.current.upperPageBound =
        this.props.bancoLista.paginacion.upperPageBound;
      this.refPaginacion.current.lowerPageBound =
        this.props.bancoLista.paginacion.lowerPageBound;
      this.refPaginacion.current.isPrevBtnActive =
        this.props.bancoLista.paginacion.isPrevBtnActive;
      this.refPaginacion.current.isNextBtnActive =
        this.props.bancoLista.paginacion.isNextBtnActive;
      this.refPaginacion.current.pageBound =
        this.props.bancoLista.paginacion.pageBound;
      this.refPaginacion.current.messagePaginacion =
        this.props.bancoLista.paginacion.messagePaginacion;

      this.refSearch.current.initialize(this.props.bancoLista.data.buscar);
    } else {
      await this.loadingInit();
      this.updateReduxState();
    }
  };

  updateReduxState() {
    this.props.setListaBancoData(this.state);
    this.props.setListaBancoPaginacion({
      upperPageBound: this.refPaginacion.current.upperPageBound,
      lowerPageBound: this.refPaginacion.current.lowerPageBound,
      isPrevBtnActive: this.refPaginacion.current.isPrevBtnActive,
      isNextBtnActive: this.refPaginacion.current.isNextBtnActive,
      pageBound: this.refPaginacion.current.pageBound,
      messagePaginacion: this.refPaginacion.current.messagePaginacion,
    });
  }

  loadingInit = async () => {
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

  fillTable = async (opcion, buscar = '') => {
    this.setState({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const data = {
      opcion: opcion,
      buscar: buscar.trim(),
      idSucursal: this.state.idSucursal,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listBancos(data, this.abortControllerTable.signal);

    if (response instanceof SuccessReponse) {
      const totalPaginacion = parseInt(
        Math.ceil(parseFloat(response.data.total) / this.state.filasPorPagina),
      );

      this.setState(
        {
          loading: false,
          lista: response.data.result,
          totalPaginacion: totalPaginacion,
        },
        () => {
          this.updateReduxState();
        },
      );
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

  handleCrear = () => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/agregar`,
    });
  };

  handleEditar = (idBanco) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/editar`,
      search: '?idBanco=' + idBanco,
    });
  };

  handleDetalle = (idBanco) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/detalle`,
      search: '?idBanco=' + idBanco,
    });
  };

  handleBorrar = (idBanco) => {
    alertKit.question({
      title: 'Banco',
      message: '¿Estás seguro de eliminar el banco?',
    }, async (accept) => {
      if (accept) {
        alertKit.loading({ message: 'Procesando información...' });

        const params = { idBanco: idBanco };
        const response = await deleteBanco(params);

        if (response instanceof ErrorResponse) {
          alertKit.warning({
            title: 'Banco',
            message: response.getMessage(),
          });
          return;
        }

        alertKit.success({
          title: 'Banco',
          message: response.data,
        }, () => {
          this.loadingInit();
        });
      }
    });
  };

  /*
    |--------------------------------------------------------------------------
    | Método de renderizado
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
          colSpan="11"
          message={'Cargando información de la tabla...'}
        />
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <TableRow className="text-center">
          <TableCell colSpan="11">¡No hay datos registrados!</TableCell>
        </TableRow>
      );
    }

    return this.state.lista.map((item, index) => {
      const estado =
        item.estado === 1 ? (
          <span className="text-success">ACTIVO</span>
        ) : (
          <span className="text-warning">INACTIVO</span>
        );

      const compartir = item.compartir === 1 ? <i className="fa fa-retweet text-green-500"></i> : <i className="fa fa-low-vision"></i>;

      return (
        <TableRow key={index}>
          <TableCell className="text-center">{item.id}</TableCell>
          <TableCell>{item.nombre}</TableCell>
          <TableCell>{item.tipoCuenta.toUpperCase()}</TableCell>
          <TableCell>{item.moneda}</TableCell>
          <TableCell>{item.numCuenta}</TableCell>
          <TableCell className="text-center">{compartir}</TableCell>
          <TableCell className="text-center">{item.estado}</TableCell>
          <TableCell
            className={`text-right ${item.saldo >= 0 ? 'text-success' : 'text-danger'}`}
          >
            {numberFormat(item.saldo, item.codiso)}
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-info btn-sm"
              onClick={() => this.handleDetalle(item.idBanco)}
            // disabled={!this.state.view}
            >
              <i className="fa fa-eye"></i>
            </Button>
          </TableCell>

          <TableCell className="text-center">
            <Button
              className="btn-outline-warning btn-sm"
              onClick={() => this.handleEditar(item.idBanco)}
            // disabled={!this.state.edit}
            >
              <i className="bi bi-pencil"></i>
            </Button>
          </TableCell>

          <TableCell className="text-center">
            <Button
              className="btn-outline-danger btn-sm"
              onClick={() => this.handleBorrar(item.idBanco)}
            // disabled={!this.state.remove}
            >
              <i className="bi bi-trash"></i>
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
          title="Bancos"
          subTitle="LISTA"
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-outline-info"
              onClick={this.handleCrear}
            // disabled={!this.state.add}
            >
              <i className="bi bi-file-plus"></i> Nuevo Registro
            </Button>{' '}
            <Button
              className="btn-outline-secondary"
              onClick={this.loadingInit}
            >
              <i className="bi bi-arrow-clockwise"></i> Recargar Vista
            </Button>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <Search
              group={true}
              iconLeft={<i className="bi bi-search"></i>}
              ref={this.refSearch}
              onSearch={this.searchText}
              placeholder="Buscar por nombre..."
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive>
              <Table className={'table-bordered'}>
                <TableHeader className="thead-light">
                  <TableRow>
                    <TableHead width="5%" className="text-center">#</TableHead>
                    <TableHead width="10%">Nombre</TableHead>
                    <TableHead width="15%">Tipo Cuenta</TableHead>
                    <TableHead width="10%">Moneda</TableHead>
                    <TableHead width="20%">Número Cuenta</TableHead>
                    <TableHead width="10%" className="text-center">Compartir</TableHead>
                    <TableHead width="10%" className="text-center">Estado</TableHead>
                    <TableHead width="10%" className="text-center">Saldo</TableHead>
                    <TableHead width="5%" className="text-center">Detalle</TableHead>
                    <TableHead width="5%" className="text-center">Editar</TableHead>
                    <TableHead width="5%" className="text-center">Eliminar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {this.generateBody()}
                </TableBody>
              </Table>
            </TableResponsive>
          </Column>
        </Row>

        <Paginacion
          ref={this.refPaginacion}
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

Bancos.propTypes = {
  token: PropTypes.shape({
    project: PropTypes.shape({
      idSucursal: PropTypes.string,
    }),
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string,
    }),
  }),
  bancoLista: PropTypes.shape({
    data: PropTypes.object,
    paginacion: PropTypes.object,
  }),
  setListaBancoData: PropTypes.func,
  setListaBancoPaginacion: PropTypes.func,
  history: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    bancoLista: state.predeterminado.bancoLista,
  };
};

const mapDispatchToProps = { setListaBancoData, setListaBancoPaginacion };

const ConnectedBancos = connect(mapStateToProps, mapDispatchToProps)(Bancos);

export default ConnectedBancos;
