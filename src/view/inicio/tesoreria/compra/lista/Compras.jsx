import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import Paginacion from '../../../../../components/Paginacion';
import {
  formatTime,
  formatNumberWithZeros,
  isEmpty,
  numberFormat,
} from '../../../../../helper/utils.helper';
import ErrorResponse from '../../../../../model/class/error-response';
import SuccessReponse from '../../../../../model/class/response';
import { CANCELED } from '../../../../../model/types/types';
import {
  cancelCompra,
  listCompra,
} from '../../../../../network/rest/principal.network';
import { connect } from 'react-redux';
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
import PropTypes from 'prop-types';
import Button from '../../../../../components/Button';
import Search from '../../../../../components/Search';
import {
  setListaCompraData,
  setListaCompraPaginacion,
} from '../../../../../redux/predeterminadoSlice';
import React from 'react';
import { alertKit } from 'alert-kit';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class Compras extends CustomComponent {

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
      this.props.compraLista &&
      this.props.compraLista.data &&
      this.props.compraLista.paginacion
    ) {
      this.setState(this.props.compraLista.data);
      this.refPaginacion.current.upperPageBound =
        this.props.compraLista.paginacion.upperPageBound;
      this.refPaginacion.current.lowerPageBound =
        this.props.compraLista.paginacion.lowerPageBound;
      this.refPaginacion.current.isPrevBtnActive =
        this.props.compraLista.paginacion.isPrevBtnActive;
      this.refPaginacion.current.isNextBtnActive =
        this.props.compraLista.paginacion.isNextBtnActive;
      this.refPaginacion.current.pageBound =
        this.props.compraLista.paginacion.pageBound;
      this.refPaginacion.current.messagePaginacion =
        this.props.compraLista.paginacion.messagePaginacion;
    } else {
      await this.loadingInit();
      this.updateReduxState();
    }
  };

  updateReduxState() {
    this.props.setListaCompraData(this.state);
    this.props.setListaCompraPaginacion({
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

    const params = {
      opcion: opcion,
      buscar: buscar,
      idSucursal: this.state.idSucursal,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listCompra(params, this.abortControllerTable.signal);

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
      pathname: `${this.props.location.pathname}/crear`,
    });
  };

  handleDetalle = (idCompra) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/detalle`,
      search: '?idCompra=' + idCompra,
    });
  };

  handleAnular = async (id) => {
    const accept = await alertKit.question(
      {
        title: 'Compra',
        message: '¿Está seguro de anular la compra?',
        acceptButton: {
          html: "<i class='fa fa-check'></i> Aceptar",
        },
        cancelButton: {
          html: "<i class='fa fa-close'></i> Cancelar",
        },
      });

    if (accept) {
      const params = {
        idCompra: id,
        idUsuario: this.state.idUsuario,
      };

      alertKit.loading({
        message: 'Procesando petición...',
      });

      const response = await cancelCompra(params);

      if (response instanceof SuccessReponse) {
        alertKit.success({
          title: 'Compra',
          message: response.data,
        }, async () => {
          await this.loadingInit();
        });
      }

      if (response instanceof ErrorResponse) {
        if (response.getType() === CANCELED) return;

        alertKit.warning({
          title: 'Compra',
          message: response.getMessage(),
        })
      }
    }
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
          colSpan="9"
          message="Cargando información de la tabla..."
        />
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <TableRow>
          <TableCell className="text-center" colSpan="9">
            ¡No hay datos registrados!
          </TableCell>
        </TableRow>
      );
    }

    return this.state.lista.map((item, index) => {
      const estado =
        item.estado === 1 ? (
          <span className="badge badge-success">PAGADO</span>
        ) : item.estado === 2 ? (
          <span className="badge badge-warning">POR PAGAR</span>
        ) : (
          <span className="badge badge-danger">ANULADO</span>
        );

      return (
        <TableRow key={index}>
          <TableCell className={`text-center`}>{item.id}</TableCell>
          <TableCell>
            {item.fecha}
            <br />
            {formatTime(item.hora)}
          </TableCell>
          <TableCell>
            {item.tipoDocumento} - {item.documento}
            <br />
            {item.informacion}
          </TableCell>
          <TableCell>
            {item.comprobante}
            <br />
            {item.serie}-{formatNumberWithZeros(item.numeracion)}
          </TableCell>
          <TableCell>{item.tipo}</TableCell>
          <TableCell className="text-center">{estado}</TableCell>
          <TableCell className="text-right">
            {numberFormat(item.total, item.codiso)}{' '}
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-info btn-sm"
              onClick={() => this.handleDetalle(item.idCompra)}
            >
              <i className="fa fa-eye"></i>
            </Button>
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-danger btn-sm"
              onClick={() => this.handleAnular(item.idCompra)}
            >
              <i className="fa fa-remove"></i>
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
          title="Compras"
          subTitle="LISTA"
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Button className="btn-outline-info" onClick={this.handleCrear}>
              <i className="bi bi-file-plus"></i> Crear Compra
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
              onSearch={this.searchText}
              placeholder="Buscar..."
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive>
              <Table className={'table-bordered'}>
                <TableHeader className="thead-light">
                  <TableRow>
                    <TableHead width="5%" className="text-center">
                      #
                    </TableHead>
                    <TableHead width="10%">Fecha</TableHead>
                    <TableHead width="18%">Proveedor</TableHead>
                    <TableHead width="15%">Comprobante</TableHead>
                    <TableHead width="10%">Tipo</TableHead>
                    <TableHead width="10%" className="text-center">
                      Estado
                    </TableHead>
                    <TableHead width="10%" className="text-center">
                      Total
                    </TableHead>
                    <TableHead width="5%" className="text-center">
                      Detalle
                    </TableHead>
                    <TableHead width="5%" className="text-center">
                      Anular
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{this.generateBody()}</TableBody>
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

Compras.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string.isRequired,
    }).isRequired,
    project: PropTypes.shape({
      idSucursal: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  compraLista: PropTypes.shape({
    data: PropTypes.object,
    paginacion: PropTypes.object,
  }),
  setListaCompraData: PropTypes.func,
  setListaCompraPaginacion: PropTypes.func,
  history: PropTypes.object,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    compraLista: state.predeterminado.compraLista,
  };
};

const mapDispatchToProps = { setListaCompraData, setListaCompraPaginacion };

const ConnectedCompras = connect(mapStateToProps, mapDispatchToProps)(Compras);

export default ConnectedCompras;
