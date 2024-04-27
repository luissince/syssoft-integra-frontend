import React from 'react';
import { connect } from 'react-redux';
import {
  spinnerLoading,
  keyUpSearch,
  isEmpty,
} from '../../../../helper/utils.helper';
import Paginacion from '../../../../components/Paginacion';
import ContainerWrapper from '../../../../components/Container';
import {
  listPersonasCliente,
} from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';
import CustomComponent from '../../../../model/class/custom-component';

class Clientes extends CustomComponent {

  constructor(props) {
    super(props);
    this.state = {
      idSucursal: this.props.token.project.idSucursal,

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

    this.idCodigo = '';
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
    this.setState({
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

    const response = await listPersonasCliente(params, this.abortControllerTable.signal,);

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


  handleDetalleCliente(idPersona) {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/detalle`,
      search: '?idPersona=' + idPersona,
    });
  }


  generarBody() {
    if (this.state.loading) {
      return (
        <tr>
          <td className="text-center" colSpan="8">
            {spinnerLoading(
              'Cargando información de la tabla...',
              true,
            )}
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
          <td>
            {item.tipoDocumento}
            {<br />}
            {item.documento}
          </td>
          <td>{item.informacion}</td>
          <td>
            {item.celular}
            {<br />}
            {item.telefono}
          </td>
          <td>{item.direccion}</td>
          <td className="text-center">
            <div
              className={`badge ${item.predeterminado === 1 ? 'badge-success' : 'badge-warning'}`}
            >
              {item.predeterminado === 1 ? 'SI' : 'NO'}
            </div>
          </td>
          <td className="text-center">
            <div
              className={`badge ${item.estado === 1 ? 'badge-info' : 'badge-danger'}`}
            >
              {item.estado === 1 ? 'ACTIVO' : 'INACTIVO'}
            </div>
          </td>
          <td className="text-center">
            <button
              className="btn btn-outline-info btn-sm"
              title="Editar"
              onClick={() =>
                this.handleDetalleCliente(item.idPersona)
              }
            >
              <i className="bi bi-eye"></i>
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
                Clientes <small className="text-secondary">LISTA</small>
              </h5>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12">
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

          <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12">
            <div className="form-group">            
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
          <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
            <div className="table-responsive">
              <table className="table table-striped table-bordered rounded">
                <thead>
                  <tr>
                    <th width="5%" className="text-center">
                      #
                    </th>
                    <th width="10%">DNI / RUC</th>
                    <th width="20%">Cliente</th>
                    <th width="10%">Cel. / Tel.</th>
                    <th width="15%">Dirección</th>
                    <th width="7%">Predeterminado</th>
                    <th width="7%">Estado</th>
                    <th width="5%" className="text-center">
                      Detalle
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {this.generarBody()}
                </tbody>
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
    token: state.reducer,
  };
};

const ConnectedClientes = connect(mapStateToProps, null)(Clientes);

export default ConnectedClientes;