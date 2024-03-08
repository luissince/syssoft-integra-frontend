import React from 'react';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isEmpty,
} from '../../../../helper/utils.helper';
import ContainerWrapper from '../../../../components/Container';
import Paginacion from '../../../../components/Paginacion';
import { keyUpSearch } from '../../../../helper/utils.helper';
import CustomComponent from '../../../../model/class/custom-component';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import {
  deleteAlmacen,
  listAlmacen,
} from '../../../../network/rest/principal.network';
import { CANCELED } from '../../../../model/types/types';
import { connect } from 'react-redux';
import Title from '../../../../components/Title';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import { TableResponsive } from '../../../../components/Table';
import { SpinnerTable } from '../../../../components/Spinner';

class Almacenes extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      lista: [],
      restart: false,

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.abortControllerTable = new AbortController();
    this.refTxtSearch = React.createRef();
  }

  componentDidMount() {
    this.loadInit();
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
  }

  /**
   * Carga la inicialización de la tabla.
   * @returns {Promise<void>} Una promesa que se resuelve después de cargar la inicialización de la tabla.
   */
  loadInit = async () => {
    if (this.state.loading) return;

    await this.setStateAsync({ paginacion: 1, restart: true });
    this.fillTable(0, '');
    await this.setStateAsync({ opcion: 0 });
  };

  /**
   * Gestiona la paginación de la tabla según el ID de la lista proporcionado.
   * @param {number} listid - El ID de la lista para la paginación.
   * @returns {Promise<void>} Una promesa que se resuelve después de gestionar la paginación de la tabla.
   */
  paginacionContext = async (listid) => {
    await this.setStateAsync({ paginacion: listid, restart: false });
    this.onEventPaginacion();
  };

  /**
   * Gestiona los eventos de paginación de la tabla.
   */
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

  /**
   * Llena la tabla con los datos recuperados según la opción y el texto de búsqueda proporcionados.
   * @param {number} opcion - La opción específica para la tabla.
   * @param {string} buscar - El texto de búsqueda que se utilizará para filtrar los datos.
   * @returns {Promise<void>} Una promesa que se resuelve después de que se completa el proceso de llenado de la tabla.
   * @example
   * // Ejemplo de uso:
   * fillTable(1, "texto de búsqueda");
   */
  fillTable = async (opcion, buscar) => {
    await this.setStateAsync({
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

    const response = await listAlmacen(
      params,
      this.abortControllerTable.signal,
    );

    if (response instanceof SuccessReponse) {
      const result = response.data.result;
      const total = response.data.total;
      const totalPaginacion = parseInt(
        Math.ceil(parseFloat(total) / this.state.filasPorPagina),
      );

      await this.setStateAsync({
        loading: false,
        lista: result,
        totalPaginacion: totalPaginacion,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      await this.setStateAsync({
        loading: false,
        lista: [],
        totalPaginacion: 0,
        messageTable: response.getMessage(),
      });
    }
  };

  /**
   * Realiza una búsqueda de texto y actualiza la tabla en función del texto proporcionado.
   * @param {string} text - El texto a buscar.
   * @returns {Promise<void>} Una promesa que se resuelve después de que se completa la búsqueda y actualización de la tabla.
   * @example
   * // Ejemplo de uso:
   * searchText("Ejemplo de texto de búsqueda");
   */
  async searchText(text) {
    if (this.state.loading) return;

    if (text.trim().length === 0) return;

    /**
     * Incrementa la paginación y reinicia el estado si se cumple la condición.
     * @type {number}
     */
    await this.setStateAsync({ paginacion: 1, restart: false });

    // Llena la tabla con el nuevo texto.
    this.fillTable(1, text.trim());

    // Actualiza la opción después de la búsqueda.
    await this.setStateAsync({ opcion: 1 });
  }

  /**
   * Esta es una función se encarga de navegar a la vista para agregar un almacen
   *
   * @returns {void}
   *
   * @example
   * // Ejemplo de uso:
   * handleAgregar();
   */
  handleAgregar = () => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/agregar`,
    });
  };

  /**
   * Esta es una función se encarga de navegar a la vista para editar almacen
   *
   * @param {string} idProducto - Id del almacen
   * @returns {void}
   *
   * @example
   * handleEditar('AL0001');
   */
  handleEditar = (idAlmacen) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/editar`,
      search: '?idAlmacen=' + idAlmacen,
    });
  };

  /**
   * Esta es una función se encarga de borrar un almacen
   *
   * @param {string} idAlmacen - Id del almacen
   * @returns {void}
   *
   * @example
   * // Ejemplo de uso:
   * handleEliminar('AL0001');
   */
  handleEliminar = (idAlmacen) => {
    alertDialog(
      'Almacén',
      '¿Está seguro de que desea eliminar el almacen? Esta operación no se puede deshacer.',
      async (accept) => {
        if (accept) {
          alertInfo('Almacén', 'Procesando información...');

          const params = {
            idAlmacen: idAlmacen,
          };

          const response = await deleteAlmacen(params);

          if (response instanceof SuccessReponse) {
            alertSuccess('Almacén', response.data, () => {
              this.loadInit();
            });
          }

          if (response instanceof ErrorResponse) {
            alertWarning('Almacén', response.getMessage());
          }
        }
      },
    );
  };

  generateBody() {
    if (this.state.loading) {
      return (
        <tr>
          <td className="text-center" colSpan="8">
            <SpinnerTable
              message='Cargando información de la tabla...'
            />
          </td>
        </tr>
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <tr className="text-center">
          <td colSpan="8">¡No hay datos registrados!</td>
        </tr>
      );
    }

    return this.state.lista.map((item, index) => {
      return (
        <tr key={index}>
          <td className="text-center">{item.id}</td>
          <td>{item.nombre}</td>
          <td>{item.direccion}</td>
          <td>
            {item.departamento + '-' + item.provincia + '-' + item.distrito}
          </td>
          <td>{item.codigoSunat}</td>
          <td className='text-center'>
            <div
              className={`badge ${item.predefinido === 1 ? 'badge-success' : 'badge-warning'}`}
            >
              {item.predefinido === 1 ? 'SI' : 'NO'}
            </div>
          </td>
          <td className="text-center">
            <button
              className="btn btn-outline-warning btn-sm"
              title="Editar"
              onClick={() => this.handleEditar(item.idAlmacen)}
            >
              <i className="bi bi-pencil"></i>
            </button>
          </td>
          <td className="text-center">
            <button
              className="btn btn-outline-danger btn-sm"
              title="Anular"
              onClick={() => this.handleEliminar(item.idAlmacen)}
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
          title='Almacenes'
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
                  placeholder="Buscar por nombre o distrito..."
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

        <Row>
          <Column>
            <TableResponsive
              tHead={
                <tr>
                  <th width="5%" className="text-center">
                    #
                  </th>
                  <th width="15%">Nombre</th>
                  <th width="25%">Dirección</th>
                  <th width="20%">Distrito</th>
                  <th width="10%">Código Sunat</th>
                  <th width="10%">Predefinido</th>
                  <th width="5%" className="text-center">
                    Editar
                  </th>
                  <th width="5%" className="text-center">
                    Eliminar
                  </th>
                </tr>
              }
              tBody={this.generateBody()}
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

/**
 *
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */

const ConnectedAlmacenes = connect(mapStateToProps, null)(Almacenes);

export default ConnectedAlmacenes;
