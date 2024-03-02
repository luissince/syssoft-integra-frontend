import React from 'react';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import Paginacion from '../../../../../components/Paginacion';
import { alertDialog, isEmpty, spinnerLoading, keyUpSearch, alertSuccess, alertWarning, alertInfo, formatTime, formatNumberWithZeros, numberFormat, getPathNavigation } from '../../../../../helper/utils.helper';
import ErrorResponse from '../../../../../model/class/error-response';
import SuccessReponse from '../../../../../model/class/response';
import { CANCELED } from '../../../../../model/types/types';
import { cancelSalida, listSalida } from '../../../../../network/rest/principal.network';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';

class Salidas extends CustomComponent {
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

    const response = await listSalida(params, this.abortControllerTable.signal);

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
        messageTable: response.getMessage(),
      });
    }
  }

  handleAnular = (id) => {
    alertDialog('Salida', '¿Estás seguro de anular el pago.?', async (accept) => {
      if (accept) {
        const params = {
          idSalida: id,
          idUsuario: this.state.idUsuario
        }

        alertInfo("Salida", "Procesando petición...")

        const response = await cancelSalida(params);

        if (response instanceof SuccessReponse) {
          alertSuccess("Salida", response.data, async () => {
            // await this.loadInit()
          })
        }

        if (response instanceof ErrorResponse) {
          alertWarning("Salida", response.getMessage())
        }
      }
    });
  }

  generarBody() {
    if (this.state.loading) {
      return (
        <tr>
          <td className="text-center" colSpan="8">
            {spinnerLoading('Cargando información de la tabla...', true)}
          </td>
        </tr>
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <tr>
          <td className="text-center" colSpan="8">¡No hay datos registrados!</td>
        </tr>
      );
    }

    return this.state.lista.map((item, index) => {
      return (
        <tr key={index}>
          <td className={`text-center`}>{item.id}</td>
          <td>
            {item.fecha}
            <br />
            {formatTime(item.hora)}
          </td>
          <td>
            <Link className="btn-link" to={getPathNavigation(item.tipo, item.idComprobante)}>
              {item.comprobante}
              <br />
              {item.serie}-{formatNumberWithZeros(item.numeracion)}
            </Link>
            {/* {item.comprobante}
            <br />
            {item.serie}-{formatNumberWithZeros(item.numeracion)} */}
          </td>
          <td>{item.metodo}</td>
          <td>{item.descripcion}</td>
          <td className='text-center'>
            {
              item.estado === 1
                ? <span className="text-success">ACTIVO</span>
                : <span className="text-danger">ANULADO</span>
            }
          </td>
          <td className='text-right'>{numberFormat(item.monto, item.codiso)}</td>
          <td className='text-center'>
            <button
              className="btn btn-outline-danger btn-sm"
              title="Anular"
              onClick={() => this.handleAnular(item.idSalida)}>
              <i className="fa fa-remove"></i>
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
          <div className="col">
            <div className="form-group">
              <h5>
                {' '}
                Salidas <small className="text-secondary"> Lista </small>{' '}
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
              <button className="btn btn-outline-secondary"
                onClick={this.loadInit}>
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
                    <th width="5%" className="text-center">#</th>
                    <th width="10%">Fecha</th>
                    <th width="15%">Comprobante</th>
                    <th width="15%">Metodo</th>
                    <th width="15%">Descripción</th>
                    <th width="10%" className="text-center">Estado</th>
                    <th width="10%" className="text-center">Total</th>
                    <th width="5%" className="text-center">Anular</th>
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
    token: state.reducer,
  };
};

const ConnectedSalidas = connect(mapStateToProps, null)(Salidas);

export default ConnectedSalidas;
