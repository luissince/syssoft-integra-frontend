import PropTypes from 'prop-types';
import {
  numberFormat,
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isEmpty,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import Paginacion from '../../../../components/Paginacion';
import {
  deleteBanco,
  listBancos,
} from '../../../../network/rest/principal.network';
import ErrorResponse from '../../../../model/class/error-response';
import SuccessReponse from '../../../../model/class/response';
import { CANCELED } from '../../../../model/types/types';
import ContainerWrapper from '../../../../components/Container';
import CustomComponent from '../../../../model/class/custom-component';
import Title from '../../../../components/Title';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../../components/Table';
import { SpinnerTable } from '../../../../components/Spinner';
import Button from '../../../../components/Button';
import Search from '../../../../components/Search';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class Bancos extends CustomComponent {

  constructor(props) {
    super(props);
    this.state = {
      // add: statePrivilegio(
      //   this.props.token.userToken.menus[5].submenu[2].privilegio[0].estado,
      // ),
      // view: statePrivilegio(
      //   this.props.token.userToken.menus[5].submenu[2].privilegio[1].estado,
      // ),
      // edit: statePrivilegio(
      //   this.props.token.userToken.menus[5].submenu[2].privilegio[2].estado,
      // ),
      // remove: statePrivilegio(
      //   this.props.token.userToken.menus[5].submenu[2].privilegio[3].estado,
      // ),

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

    this.abortControllerTable = new AbortController();
  }

  async componentDidMount() {
    await this.loadingData();
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
  }

  loadingData = async () => {
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
      const totalPaginacion = parseInt(Math.ceil(parseFloat(response.data.total) / this.state.filasPorPagina),);

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

  handleAgregar = () => {
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
    alertDialog('Banco', '¿Estás seguro de eliminar el banco?', async (accept) => {
      if (accept) {
        alertInfo('Banco', 'Procesando información...');

        const params = { idBanco: idBanco };
        const response = await deleteBanco(params);

        if (response instanceof SuccessReponse) {
          alertSuccess('Banco', response.data, () => {
            this.loadingData();
          });
        }

        if (response instanceof ErrorResponse) {
          alertWarning('Banco', response.getMessage());
        }
      }
    },
    );
  };

  generateBody() {
    if (this.state.loading) {
      return (
        <SpinnerTable
          colSpan='9'
          message={'Cargando información de la tabla...'}
        />
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <TableRow className="text-center">
          <TableCell colSpan="9">¡No hay datos registrados!</TableCell>
        </TableRow>
      );
    }

    return this.state.lista.map((item, index) => {
      return (
        <TableRow key={index}>
          <TableCell className="text-center">{item.id}</TableCell>
          <TableCell>{item.nombre}</TableCell>
          <TableCell>{item.tipoCuenta.toUpperCase()}</TableCell>
          <TableCell>{item.moneda}</TableCell>
          <TableCell>{item.numCuenta}</TableCell>
          <TableCell className={`text-right ${item.saldo >= 0 ? 'text-success' : 'text-danger'}`}>{numberFormat(item.saldo, item.codiso)}</TableCell>
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
          title='Bancos'
          subTitle='LISTA'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-outline-info"
              onClick={this.handleAgregar}
            // disabled={!this.state.add}
            >
              <i className="bi bi-file-plus"></i> Nuevo Registro
            </Button>
            {' '}
            <Button
              className="btn-outline-secondary"
              onClick={() => this.loadingData()}
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
              placeholder="Buscar por nombre..."
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
                    <TableHead width="10%">Nombre</TableHead>
                    <TableHead width="15%">Tipo Cuenta</TableHead>
                    <TableHead width="10%">Moneda</TableHead>
                    <TableHead width="20%">Número Cuenta</TableHead>
                    <TableHead width="10%">Saldo</TableHead>
                    <TableHead width="5%" className="text-center"> Detalle </TableHead>
                    <TableHead width="5%" className="text-center">Editar </TableHead>
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

Bancos.propTypes = {
  token: PropTypes.shape({
    project: PropTypes.shape({
      idSucursal: PropTypes.string,
    }),
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string,
    }),
  }),
  history: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedBancos = connect(mapStateToProps, null)(Bancos);

export default ConnectedBancos;