import React from 'react';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  keyUpSearch,
  isEmpty,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import Paginacion from '../../../../components/Paginacion';
import ContainerWrapper from '../../../../components/Container';
import CustomComponent from '../../../../model/class/custom-component';
import {
  deleteComprobante,
  listComprobante,
} from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';
import Title from '../../../../components/Title';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import { TableResponsive } from '../../../../components/Table';
import { SpinnerTable } from '../../../../components/Spinner';

class Comprobantes extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      // add: statePrivilegio(
      //   this.props.token.userToken.menus[5].submenu[0].privilegio[0].estado,
      // ),
      // edit: statePrivilegio(
      //   this.props.token.userToken.menus[5].submenu[0].privilegio[1].estado,
      // ),
      // remove: statePrivilegio(
      //   this.props.token.userToken.menus[5].submenu[0].privilegio[2].estado,
      // ),

      loading: false,
      lista: [],
      restart: false,

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',

      idUsuario: this.props.token.userToken.idUsuario,
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

    const response = await listComprobante(
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
      search: '?idComprobante=' + idBanco,
    });
  };

  handleBorrar(idComprobante) {
    alertDialog('Comprobante', '¿Estás seguro de eliminar el comprobante?', async (accept) => {
      if (accept) {
        const params = {
          idComprobante: idComprobante,
        };

        alertInfo('Comprobante', 'Procesando información...');

        const response = await deleteComprobante(params);

        if (response instanceof SuccessReponse) {
          alertSuccess('Comprobante', response.data, () => {
            this.loadInit();
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertWarning('Comprobante', response.getMessage());
        }
      }
    },
    );
  }

  generateBody() {
    if (this.state.loading) {
      return (
        <tr>
          <td className="text-center" colSpan="10">
            <SpinnerTable
              message='Cargando información de la tabla...'
            />
          </td>
        </tr>
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <tr>
          <td className="text-center" colSpan="10">
            ¡No hay comprobantes registrados!
          </td>
        </tr>
      );
    }

    return this.state.lista.map((item, index) => {
      return (
        <tr key={index}>
          <td className="text-center">{item.id}</td>
          <td>{item.tipo.toUpperCase()}</td>
          <td>{item.nombre}</td>
          <td>{item.serie}</td>
          <td>{item.numeracion}</td>
          <td className="text-center">
            <div className={`badge ${item.preferida === 1 ? 'badge-info' : 'badge-danger'}`}>{item.preferida === 1 ? 'Si' : 'No'}</div>
          </td>
          <td className="text-center">
            <div className={`badge ${item.estado === 1 ? 'badge-success' : 'badge-danger'}`}>
              {item.estado === 1 ? 'ACTIVO' : 'INACTIVO'}
            </div>
          </td>
          <td className="text-center">
            <button
              className="btn btn-outline-warning btn-sm"
              title="Editar"
              onClick={() =>
                this.handleEditar(item.idComprobante)
              }
            // disabled={!this.state.edit}
            >
              <i className="bi bi-pencil"></i>
            </button>
          </td>
          <td className="text-center">
            <button
              className="btn btn-outline-danger btn-sm"
              title="Anular"
              onClick={() =>
                this.handleBorrar(item.idComprobante)
              }
            // disabled={!this.state.remove}
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
          title='Comprobantes'
          subTitle='Lista'
        />

        <Row>
          <Column className="col-md-6 col-sm-12">
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
          </Column>

          <Column className="col-md-6 col-sm-12">
            <div className="form-group">
              <button
                className="btn btn-outline-info"
                onClick={this.handleAgregar}
              // disabled={!this.state.add}
              >
                <i className="bi bi-file-plus"></i> Nuevo Registro
              </button>{' '}
              <button
                className="btn btn-outline-secondary"
                onClick={this.loadInit}
              >
                <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>
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
                  <th width="15%">Tipo Comprobante</th>
                  <th width="20%">Nombre</th>
                  <th width="15%">Serie</th>
                  <th width="10%">Numeración</th>
                  <th width="10%">Preferida</th>
                  <th width="10%">Estado</th>
                  <th width="5%" className="text-center">
                    Edición
                  </th>
                  <th width="5%" className="text-center">
                    Anular
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

const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

const ConnectedComprobantes = connect(mapStateToProps, null)(Comprobantes);

export default ConnectedComprobantes;
