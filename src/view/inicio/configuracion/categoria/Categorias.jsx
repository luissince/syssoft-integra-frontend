import {
  alertDialog,
  alertSuccess,
  alertWarning,
  alertInfo,
  isEmpty,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import Paginacion from '../../../../components/Paginacion';
import { listCategoria } from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';
import ContainerWrapper from '../../../../components/Container';
import { removeCategoria } from '../../../../network/rest/principal.network';
import CustomComponent from '../../../../model/class/custom-component';
import Title from '../../../../components/Title';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../../components/Table';
import Button from '../../../../components/Button';
import Search from '../../../../components/Search';
import { SpinnerTable } from '../../../../components/Spinner';

class Categorias extends CustomComponent {
  constructor(props) {
    super(props);

    this.state = {
      // add: statePrivilegio(
      //   this.props.token.userToken.menus[3].submenu[0].privilegio[0].estado,
      // ),
      // edit: statePrivilegio(
      //   this.props.token.userToken.menus[3].submenu[0].privilegio[1].estado,
      // ),
      // remove: statePrivilegio(
      //   this.props.token.userToken.menus[3].submenu[0].privilegio[2].estado,
      // ),
      // move: statePrivilegio(
      //   this.props.token.userToken.menus[3].submenu[0].privilegio[3].estado,
      // ),

      buscar: '',

      loading: false,
      lista: [],
      restart: false,

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',
    };

    this.abortControllerTable = new AbortController();
  }

  async componentDidMount() {
    this.loadInit();
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
  }

  loadInit = async () => {
    if (this.state.loading) return;

    await this.setStateAsync({ paginacion: 1, restart: true });
    this.fillTable(0, '');
    await this.setStateAsync({ opcion: 0 });
  };

  searchText = async (text) => {
    if (this.state.loading) return;

    if (text.trim().length === 0) return;

    await this.setStateAsync({ paginacion: 1, restart: false, buscar: text });
    this.fillTable(1, text.trim());
    await this.setStateAsync({ opcion: 1 });
  }

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
    /**
     * Restablecer las variables para la busqueda
     */
    this.setState({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    /**
     * Parametros para iniciar la consulta
     */
    const params = {
      opcion: opcion,
      buscar: buscar.trim().toUpperCase(),
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    /**
     * Peticion http
     */
    const response = await listCategoria(
      params,
      this.abortControllerTable.signal,
    );

    /**
     * Si la respuesta fue existosa
     */
    if (response instanceof SuccessReponse) {
      const data = response.data;

      const totalPaginacion = parseInt(
        Math.ceil(parseFloat(data.total) / this.state.filasPorPagina),
      );

      this.setState({
        loading: false,
        lista: data.result,
        totalPaginacion: totalPaginacion,
      });
    }

    /**
     * Si la respuesta fallo o fue cancelada
     */
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

  handleAgregar = () => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/agregar`,
    });
  };

  handleEditar = (idCategoria) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/editar`,
      search: '?idCategoria=' + idCategoria,
    });
  };

  handleDelete = (id) => {
    alertDialog('Categoría', '¿Estás seguro de eliminar la Categoría?', async (accept) => {
      if (accept) {
        const params = {
          idCategoria: id,
        };

        alertInfo('Categoría', 'Se esta procesando la petición...');

        const response = await removeCategoria(params);

        if (response instanceof SuccessReponse) {
          alertSuccess('Categoría', response.data, () => {
            this.loadInit();
          });
        }

        if (response instanceof ErrorResponse) {
          alertWarning('Categoría', response.getMessage());
        }
      }
    });
  };

  generateBody() {
    if (this.state.loading) {
      return (
        <SpinnerTable
          colSpan='7'
          message='Cargando información de la tabla...'
        />
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <TableRow>
          <TableCell className="text-center" colSpan="7">
            ¡No hay datos registrados!
          </TableCell>
        </TableRow>
      );
    }

    return this.state.lista.map((item, index) => {
      const estado =
        item.estado === 1 ? (
          <span className="badge badge-success">Activo</span>
        ) : (
          <span className="badge badge-danger">Inactivo</span>
        );

      return (
        <TableRow key={index}>
          <TableCell className="text-center">{item.id}</TableCell>
          <TableCell>{item.codigo}</TableCell>
          <TableCell>{item.nombre}</TableCell>
          <TableCell>{item.descripcion}</TableCell>
          <TableCell className="text-center">{estado}</TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-warning btn-sm"
              onClick={() => this.handleEditar(item.idCategoria)}
            // disabled={!this.state.edit}
            >
              <i className="bi bi-pencil"></i>
            </Button>
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-danger btn-sm"
              title=""
              onClick={() => this.handleDelete(item.idCategoria)}
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
          title='Categorias'
          subTitle='LISTA'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Button
              className='btn-outline-info'
              onClick={this.handleAgregar}
            >
              <i className="bi bi-file-plus"></i> Nuevo Registro
            </Button>
            {' '}
            <Button
              className='btn-outline-secondary'
              onClick={this.loadInit}
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
              placeholder="Buscar por cotización..."
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive>
              <Table className={"table-bordered"}>
                <TableHeader>
                  <TableRow>
                    <TableHead width="5%" className="text-center">#</TableHead>
                    <TableHead width="10%">Código</TableHead>
                    <TableHead width="25%">Nombre</TableHead>
                    <TableHead width="30%">Descripción</TableHead>
                    <TableHead width="10%" className="text-center">Estado</TableHead>
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

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedCategorias = connect(mapStateToProps, null)(Categorias);

export default ConnectedCategorias;