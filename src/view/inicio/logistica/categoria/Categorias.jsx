import React from 'react';
import {
  alertDialog,
  alertSuccess,
  alertWarning,
  spinnerLoading,
  statePrivilegio,
  keyUpSearch,
  alertInfo,
  isEmpty,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import Paginacion from '../../../../components/Paginacion';
import { listarCategoria } from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';
import ContainerWrapper from '../../../../components/Container';
import { removeCategoria } from '../../../../network/rest/principal.network';
import CustomComponent from '../../../../model/class/custom-component';
import Title from '../../../../components/Title';

class Categorias extends CustomComponent {
  constructor(props) {
    super(props);

    this.state = {
      add: statePrivilegio(
        this.props.token.userToken.menus[3].submenu[0].privilegio[0].estado,
      ),
      edit: statePrivilegio(
        this.props.token.userToken.menus[3].submenu[0].privilegio[1].estado,
      ),
      remove: statePrivilegio(
        this.props.token.userToken.menus[3].submenu[0].privilegio[2].estado,
      ),
      move: statePrivilegio(
        this.props.token.userToken.menus[3].submenu[0].privilegio[3].estado,
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
    const response = await listarCategoria(
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
    alertDialog(
      'Categoría',
      '¿Estás seguro de eliminar la Categoría?',
      async (accept) => {
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
      },
    );
  };

  generarBody() {
    if (this.state.loading) {
      return (
        <tr>
          <td className="text-center" colSpan="6">
            {spinnerLoading('Cargando información de la tabla...', true)}
          </td>
        </tr>
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <tr>
          <td className="text-center" colSpan="6">
            ¡No hay datos registrados!
          </td>
        </tr>
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
        <tr key={index}>
          <td className="text-center">{item.id}</td>
          <td>{item.nombre}</td>
          <td>{item.descripcion}</td>
          <td className="text-center">{estado}</td>
          <td className="text-center">
            <button
              className="btn btn-outline-warning btn-sm"
              title="Editar"
              onClick={() => this.handleEditar(item.idCategoria)}
              disabled={!this.state.edit}
            >
              <i className="bi bi-pencil"></i>
            </button>
          </td>
          <td className="text-center">
            <button
              className="btn btn-outline-danger btn-sm"
              title="Anular"
              onClick={() => this.handleDelete(item.idCategoria)}
              disabled={!this.state.remove}
            >
              <i className="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      );
    });
  }

  render() {
    return (
      <ContainerWrapper>
        <Title 
          title='Categorias'
          subTitle='LISTA'
        />

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
          <div className="col">
            <div className="table-responsive">
              <table className="table table-striped table-bordered rounded">
                <thead>
                  <tr>
                    <th width="5%" className="text-center">
                      #
                    </th>
                    <th width="20%">Nombre</th>
                    <th width="30%">Descripción</th>
                    <th width="10%" className="text-center">
                      Estado
                    </th>
                    <th width="5%" className="text-center">
                      Editar
                    </th>
                    <th width="5%" className="text-center">
                      Eliminar
                    </th>
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

const ConnectedCategorias = connect(mapStateToProps, null)(Categorias);

export default ConnectedCategorias;