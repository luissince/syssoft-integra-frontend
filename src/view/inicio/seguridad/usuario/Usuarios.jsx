import React from 'react';
import { connect } from 'react-redux';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  spinnerLoading,
  statePrivilegio,
  keyUpSearch,
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

class Usuarios extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      add: statePrivilegio(
        this.props.token.userToken.menus[1].submenu[1].privilegio[0].estado,
      ),
      edit: statePrivilegio(
        this.props.token.userToken.menus[1].submenu[1].privilegio[1].estado,
      ),
      remove: statePrivilegio(
        this.props.token.userToken.menus[1].submenu[1].privilegio[2].estado,
      ),
      reset: statePrivilegio(
        this.props.token.userToken.menus[1].submenu[1].privilegio[3].estado,
      ),

      loading: false,
      lista: [],
      restart: false,

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',
    };

    this.refTxtSearch = React.createRef();

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

  async searchText(text) {
    if (this.state.loading) return;

    if (text.trim().length === 0) return;

    await this.setStateAsync({ paginacion: 1, restart: false });
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
        this.fillTable(0, '');
        break;
      case 1:
        this.fillTable(1, this.refTxtSearch.current.value);
        break;
      default:
        this.fillTable(0, '');
    }
  };

  fillTable = async (opcion, buscar) => {
    await this.setStateAsync({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const params = {
      opcion: opcion,
      buscar: buscar,
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

      await this.setStateAsync({
        loading: false,
        lista: response.data.result,
        totalPaginacion: totalPaginacion,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      await this.setStateAsync({
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
        <tr>
          <td className="text-center" colSpan="10">
            {spinnerLoading('Cargando información de la tabla...', true)}
          </td>
        </tr>
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
            <button
              className="btn btn-outline-warning btn-sm"
              title="Editar"
              onClick={() => this.handleEditar(item.idUsuario)}
              disabled={!this.state.edit}
            >
              <i className="bi bi-pencil"></i>
            </button>
          </td>
          <td className="text-center">
            <button
              className="btn btn-outline-danger btn-sm"
              title="Editar"
              onClick={() => this.handleBorrar(item.idUsuario)}
              disabled={!this.state.remove}
            >
              <i className="bi bi-trash"></i>
            </button>
          </td>
          <td>
            <button
              className="btn btn-outline-info btn-sm"
              title="Resetear"
              onClick={() => this.handleResetear(item.idUsuario)}
              disabled={!this.state.reset}
            >
              <i className="bi bi-key"></i>
            </button>
          </td>
        </tr>
      );
    });
  }

  render() {
    return (
      <ContainerWrapper>
        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="form-group">
              <h5>
                Usuarios <small className="text-secondary">LISTA</small>
              </h5>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 col-sm-12">
            <div className="form-group">
              <div className="input-group mb-2">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="bi bi-search"></i>
                  </div>
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar..."
                  ref={this.refTxtSearch}
                  onKeyUp={(event) =>
                    keyUpSearch(event, () =>
                      this.searchText(event.target.value),
                    )
                  }
                />
              </div>
            </div>
          </div>
          <div className="col-md-6 col-sm-12">
            <div className="form-group">
              <button
                className="btn btn-outline-info"
                onClick={this.handleAgregar}
                disabled={!this.state.add}
              >
                <i className="bi bi-file-plus"></i> Nuevo Registro
              </button>{' '}
              <button
                className="btn btn-outline-secondary"
                onClick={() => this.loadInit()}
              >
                <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="table-responsive">
              <table className="table table-striped table-bordered rounded">
                <thead>
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
                </thead>
                <tbody>{this.generarBody()}</tbody>
              </table>
            </div>
          </div>
        </div>

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

const ConnectedUsuarios = connect(mapStateToProps, null)(Usuarios);

export default ConnectedUsuarios;