import React from 'react';
import ContainerWrapper from '../../../../../components/Container';
import { alertDialog, alertInfo, alertSuccess, alertWarning, formatNumberWithZeros, formatTime, isEmpty, keyUpSearch, numberFormat } from '../../../../../helper/utils.helper';
import CustomComponent from '../../../../../model/class/custom-component';
import { cancelCotizacion, listCotizacion } from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import { connect } from 'react-redux';
import Title from '../../../../../components/Title';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import { TableResponsive } from '../../../../../components/Table';
import { SpinnerTable } from '../../../../../components/Spinner';

class Cotizaciones extends CustomComponent {
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

    const response = await listCotizacion(params, this.abortControllerTable.signal);

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

  handleCrear = () => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/crear`,
    });
  };

  handleEditar = (idCompra) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/editar`,
      search: '?idCotizacion=' + idCompra,
    });
  };

  handleDetalle = (idCompra) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/detalle`,
      search: '?idCotizacion=' + idCompra,
    });
  };

  handleAnular = (id) => {
    alertDialog('Cotización', '¿Estás seguro de anular la cotización?', async (accept) => {
      if (accept) {
        const params = {
          idCotizacion: id,
          idUsuario: this.state.idUsuario
        }

        alertInfo("Cotización", "Procesando petición...")

        const response = await cancelCotizacion(params);

        if (response instanceof SuccessReponse) {
          alertSuccess("Cotización", response.data, async () => {
            await this.loadInit()
          })
        }

        if (response instanceof ErrorResponse) {
          alertWarning("Cotización", response.getMessage())
        }
      }
    });
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
        <tr>
          <td className="text-center" colSpan="8">¡No hay datos registrados!</td>
        </tr>
      );
    }

    return this.state.lista.map((item, index) => {

      const estado = item.estado === 1 ? <span className="text-success">Activo</span> : <span className="text-danger">Anulado</span>;

      return (
        <tr key={index}>
          <td className={`text-center`}>{item.id}</td>
          <td>{item.fecha}<br />{formatTime(item.hora)}</td>
          <td>{item.documento}<br />{item.informacion}</td>
          <td>{item.comprobante}<br />{item.serie}-{formatNumberWithZeros(item.numeracion)}</td>
          <td className='text-center'>{estado}</td>
          <td className='text-right'>{numberFormat(item.total, item.codiso)} </td>
          <td className="text-center">
            <button
              className="btn btn-outline-primary btn-sm"
              title="Detalle"
              onClick={() => this.handleDetalle(item.idCotizacion)}>
              <i className="fa fa-eye"></i>
            </button>
          </td>
          <td className="text-center">
            <button
              className="btn btn-outline-danger btn-sm"
              title="Anular"
              onClick={() => this.handleAnular(item.idCotizacion)}>
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
        <Title
          title='Cotización'
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
                onClick={this.handleCrear}
              >
                <i className="bi bi-file-plus"></i> Crear cotización
              </button>{' '}
              <button
                className="btn btn-outline-secondary"
                onClick={this.loadInit}>
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
                  <th width="10%">Fecha</th>
                  <th width="15%">Cliente</th>
                  <th width="15%">Comprobante</th>
                  <th width="10%" className="text-center">Estado</th>
                  <th width="10%" className="text-center">Total</th>
                  <th width="5%" className="text-center">
                    Detalle
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

      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

const ConnectedCotizaciones = connect(mapStateToProps, null)(Cotizaciones);

export default ConnectedCotizaciones;