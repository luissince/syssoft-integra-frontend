import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import Paginacion from '../../../../../components/Paginacion';
import { alertDialog, formatTime, formatNumberWithZeros, isEmpty, numberFormat, alertSuccess, alertWarning, alertInfo } from '../../../../../helper/utils.helper';
import ErrorResponse from '../../../../../model/class/error-response';
import SuccessReponse from '../../../../../model/class/response';
import { CANCELED } from '../../../../../model/types/types';
import { cancelCompra, listCompra } from '../../../../../network/rest/principal.network';
import { connect } from 'react-redux';
import Title from '../../../../../components/Title';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import { TableResponsive } from '../../../../../components/Table';
import { SpinnerTable } from '../../../../../components/Spinner';
import PropTypes from 'prop-types';
import Button from '../../../../../components/Button';
import Search from '../../../../../components/Search';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class Compras extends CustomComponent {

  /**
    *
    * Constructor
    */
  constructor(props) {
    super(props);

    this.state = {
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
    await this.loadInit();
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
  }

  loadInit = async () => {
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

    const params = {
      opcion: opcion,
      buscar: buscar,
      idSucursal: this.state.idSucursal,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listCompra(params, this.abortControllerTable.signal);

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
  }

  handleDetalle = (idCompra) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/detalle`,
      search: '?idCompra=' + idCompra,
    });
  }

  handleAnular = (id) => {
    alertDialog('Compra', '¿Estás seguro de anular la compra.?', async (accept) => {
      if (accept) {

        const params = {
          idCompra: id,
          idUsuario: this.state.idUsuario
        }

        alertInfo("Compra", "Procesando petición...")

        const response = await cancelCompra(params);

        if (response instanceof SuccessReponse) {
          alertSuccess("Compra", response.data, async () => {
            await this.loadInit()
          })
        }

        if (response instanceof ErrorResponse) {
          alertWarning("Compra", response.getMessage())
        }
      }
    });
  }

  generateBody() {
    if (this.state.loading) {
      return (
        <SpinnerTable
          colSpan='9'
          message='Cargando información de la tabla...'
        />
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <tr>
          <td className="text-center" colSpan="9">¡No hay datos registrados!</td>
        </tr>
      );
    }

    return this.state.lista.map((item, index) => {

      const estado = item.estado === 1 ? <span className="text-success">PAGADO</span> : item.estado === 2 ? <span className="text-warning">POR PAGAR</span> : <span className="text-danger">ANULADO</span>;

      return (
        <tr key={index}>
          <td className={`text-center`}>{item.id}</td>
          <td>{item.fecha}<br />{formatTime(item.hora)}</td>
          <td>{item.documento}<br />{item.informacion}</td>
          <td>{item.comprobante}<br />{item.serie}-{formatNumberWithZeros(item.numeracion)}</td>
          <td>{item.tipo}</td>
          <td className='text-center'>{estado}</td>
          <td className='text-right'>{numberFormat(item.total, item.codiso)} </td>
          <td className="text-center">
            <Button
              className="btn-outline-primary btn-sm"
              title="Detalle"
              onClick={() => this.handleDetalle(item.idCompra)}>
              <i className="fa fa-eye"></i>
            </Button>
          </td>
          <td className="text-center">
            <Button
              className="btn-outline-danger btn-sm"
              title="Anular"
              onClick={() => this.handleAnular(item.idCompra)}>
              <i className="fa fa-remove"></i>
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
          title='Compras'
          subTitle='Lista'
        />

        <Row>
          <Column className="col-md-6 col-sm-12">
            <Search
              onSearch={this.searchText}
              placeholder="Buscar..."
            />
          </Column>

          <Column className="col-md-6 col-sm-12">
            <div className="form-group">
              <button
                className="btn btn-outline-info"
                onClick={this.handleCrear}>
                <i className="bi bi-file-plus"></i> Crear compra
              </button>
              {' '}
              <button className="btn btn-outline-secondary"
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
                  <th width="15%">Proveedor</th>
                  <th width="15%">Comprobante</th>
                  <th width="10%">Tipo</th>
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

Compras.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string.isRequired,
    }).isRequired,
    project: PropTypes.shape({
      idSucursal: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.object,
  location: PropTypes.shape({
    pathname: PropTypes.string
  })
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedCompras = connect(mapStateToProps, null)(Compras);

export default ConnectedCompras;
