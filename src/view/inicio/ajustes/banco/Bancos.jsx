import React from 'react';
import {
  numberFormat,
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  keyUpSearch,
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
import { TableResponsive } from '../../../../components/Table';
import { SpinnerTable } from '../../../../components/Spinner';

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

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refTxtSearch = React.createRef();

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
    this.setState({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const data = {
      opcion: opcion,
      buscar: buscar.trim().toUpperCase(),
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

  generarBody() {
    if (this.state.loading) {
      return (
        <tr>
          <td className="text-center" colSpan="9">
            <SpinnerTable
              message={'Cargando información de la tabla...'}
            />
          </td>
        </tr>
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <tr className="text-center">
          <td colSpan="9">¡No hay datos registrados!</td>
        </tr>
      );
    }

    return this.state.lista.map((item, index) => {
      return (
        <tr key={index}>
          <td className="text-center">{item.id}</td>
          <td>{item.nombre}</td>
          <td>{item.tipoCuenta.toUpperCase()}</td>
          <td>{item.moneda}</td>
          <td>{item.numCuenta}</td>
          <td className={`text-right ${item.saldo >= 0 ? 'text-success' : 'text-danger'}`}>
            {numberFormat(item.saldo, item.codiso)}
          </td>
          <td className="text-center">
            <button
              className="btn btn-outline-info btn-sm"
              title="Detalle"
              onClick={() => this.handleDetalle(item.idBanco)}
            // disabled={!this.state.view}
            >
              <i className="fa fa-eye"></i>
            </button>
          </td>

          <td className="text-center">
            <button
              className="btn btn-outline-warning btn-sm"
              title="Editar"
              onClick={() => this.handleEditar(item.idBanco)}
            // disabled={!this.state.edit}
            >
              <i className="bi bi-pencil"></i>
            </button>
          </td>

          <td className="text-center">
            <button
              className="btn btn-outline-danger btn-sm"
              title="Anular"
              onClick={() => this.handleBorrar(item.idBanco)}
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
          title='Bancos'
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
                onClick={() => this.loadingData()}
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
                  <th width="5%" className="text-center">#</th>
                  <th width="10%">Nombre</th>
                  <th width="15%">Tipo Cuenta</th>
                  <th width="10%">Moneda</th>
                  <th width="20%">Número Cuenta</th>
                  <th width="10%">Saldo</th>
                  <th width="5%" className="text-center"> Detalle </th>
                  <th width="5%" className="text-center">Editar </th>
                  <th width="5%" className="text-center">Eliminar</th>
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

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedBancos = connect(mapStateToProps, null)(Bancos);

export default ConnectedBancos;