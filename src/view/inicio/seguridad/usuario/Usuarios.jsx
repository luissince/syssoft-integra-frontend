import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isEmpty,
} from '../../../../helper/utils.helper';
import Paginacion from '../../../../components/Paginacion';
import ContainerWrapper from '../../../../components/Container';
import {
  listUsuario,
  removeUsuario,
} from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';
import CustomComponent from '../../../../model/class/custom-component';
import Button from '../../../../components/Button';
import Title from '../../../../components/Title';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import { TableResponsive } from '../../../../components/Table';
import Search from '../../../../components/Search';
import { SpinnerTable } from '../../../../components/Spinner';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class Usuarios extends CustomComponent {

  constructor(props) {
    super(props);
    this.state = {
      // add: statePrivilegio(
      //   this.props.token.userToken.menus[1].submenu[1].privilegio[0].estado,
      // ),
      // edit: statePrivilegio(
      //   this.props.token.userToken.menus[1].submenu[1].privilegio[1].estado,
      // ),
      // remove: statePrivilegio(
      //   this.props.token.userToken.menus[1].submenu[1].privilegio[2].estado,
      // ),
      // reset: statePrivilegio(
      //   this.props.token.userToken.menus[1].submenu[1].privilegio[3].estado,
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
    };

    this.abortControllerTable = new AbortController();
  }

  async componentDidMount() {
    await this.loadInit();
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
    this.setState({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const params = {
      opcion: opcion,
      buscar: buscar.trim(),
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listUsuario(
      params,
      this.abortControllerTable.signal,
    );

    if (response instanceof SuccessReponse) {
      const totalPaginacion = parseInt(
        Math.ceil(parseFloat(response.data.total) / this.state.filasPorPagina),
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
        messageTable:
          'Se produjo un error interno, intente nuevamente por favor.',
      });
    }
  };

  handleAgregar = () => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/agregar`,
    });
  };

  handleEditar = (idUsuario) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/editar`,
      search: '?idUsuario=' + idUsuario,
    });
  };

  handleResetear = (idUsuario) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/resetear`,
      search: '?idUsuario=' + idUsuario,
    });
  };

  handleBorrar(idUsuario) {
    alertDialog(
      'Usuario',
      '¿Está seguro de que desea eliminar el usuario? Esta operación no se puede deshacer.',
      async (accept) => {
        if (accept) {
          const params = {
            idUsuario: idUsuario,
          };

          alertInfo('Usuario', 'Procesando información...');

          const response = await removeUsuario(params);

          if (response instanceof SuccessReponse) {
            alertSuccess('Usuario', response.data, () => {
              this.loadInit();
            });
          }

          if (response instanceof ErrorResponse) {
            alertWarning('Usuario', response.getMessage());
          }
        }
      },
    );
  }

  generarBody() {
    if (this.state.loading) {
      return (
        <SpinnerTable
          colSpan='10'
          message='Cargando información de la tabla...'
        />
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <tr>
          <td className="text-center" colSpan="10">
            ¡No hay datos registrados!
          </td>
        </tr>
      );
    }

    return this.state.lista.map((item, index) => {
      const estado = item.estado === 1 ? 'ACTIVO' : 'INACTIVO';
      const styleEstado =
        item.estado === 1 ? 'badge badge-info' : 'badge badge-danger';

      return (
        <tr key={index}>
          <td className="text-center">{item.id}</td>
          <td>
            {item.dni}
            {<br />}
            {item.nombres + ', ' + item.apellidos}
          </td>
          <td>{item.telefono}</td>
          <td>{item.email}</td>
          <td>{item.perfil}</td>
          <td>{item.representante === 1 ? 'SI' : 'NO'}</td>
          <td className="text-center">
            <span className={styleEstado}>{estado}</span>
          </td>
          <td>
            <Button
              className="btn-outline-warning btn-sm"
              onClick={() => this.handleEditar(item.idUsuario)}
            // disabled={!this.state.edit}
            >
              <i className="bi bi-pencil"></i>
            </Button>
          </td>
          <td className="text-center">
            <Button
              className="btn-outline-danger btn-sm"
              onClick={() => this.handleBorrar(item.idUsuario)}
            // disabled={!this.state.remove}
            >
              <i className="bi bi-trash"></i>
            </Button>
          </td>
          <td>
            <Button
              className="btn-outline-info btn-sm"
              onClick={() => this.handleResetear(item.idUsuario)}
            // disabled={!this.state.reset}
            >
              <i className="bi bi-key"></i>
            </Button>
          </td>
        </tr>
      );
    });
  }

  render() {
    return (
      <ContainerWrapper>
        <Title
          title='Usuarios'
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
              ref={this.refSearch}
              onSearch={this.searchText}
              placeholder="Buscar por comprobante o cliente..."
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive
              tHead={
                <tr>
                  <th width="5%" className="text-center">
                    #
                  </th>
                  <th width="20%">Nombre y Apellidos</th>
                  <th width="10%">Telefono</th>
                  <th width="10%">Email</th>
                  <th width="10%">Perfil</th>
                  <th width="10%">Representante</th>
                  <th width="5%">Estado</th>
                  <th width="5%">Editar</th>
                  <th width="5%">Eliminar</th>
                  <th width="5%">Resetear</th>
                </tr>
              }
              tBody={this.generarBody()}
            />
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

Usuarios.propTypes = {
  history: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  location: PropTypes.shape({
    pathname: PropTypes.string
  })
}

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedUsuarios = connect(mapStateToProps, null)(Usuarios);

export default ConnectedUsuarios;