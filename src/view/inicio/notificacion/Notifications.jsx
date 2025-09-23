import {
  formatTime,
  isEmpty,
  formatNumberWithZeros,
  getPathNavigation,
} from '../../../helper/utils.helper';
import Paginacion from '../../../components/Paginacion';
import ContainerWrapper from '../../../components/Container';
import CustomComponent from '../../../model/class/custom-component';
import { detailNotifications } from '../../../network/rest/principal.network';
import SuccessReponse from '../../../model/class/response';
import ErrorResponse from '../../../model/class/error-response';
import { CANCELED } from '../../../model/types/types';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import { SpinnerTable } from '../../../components/Spinner';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class Notications extends CustomComponent {
  
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
    };

    this.abortControllerTable = new AbortController();
  }

  componentDidMount() {
    this.loadInit();
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
  }

  loadInit = async () => {
    if (this.state.loading) return;

    await this.setStateAsync({ paginacion: 1, restart: true });
    this.fillTable();
    await this.setStateAsync({ opcion: 0 });
  };

  paginacionContext = async (listid) => {
    await this.setStateAsync({ paginacion: listid, restart: false });
    this.onEventPaginacion();
  };

  onEventPaginacion = () => {
    switch (this.state.opcion) {
      case 0:
        this.fillTable();
        break;
      default:
        this.fillTable();
    }
  };

  fillTable = async () => {
    this.setState({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const params = {
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await detailNotifications(
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
        messageTable: response.getMessage(),
      });
    }
  };

  generateBody() {
    if (this.state.loading) {
      return (
        <SpinnerTable
          colSpan="4"
          message={'Cargando información de la tabla...'}
        />
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <tr className="text-center">
          <td colSpan="4">¡No hay datos registrados!</td>
        </tr>
      );
    }

    return this.state.lista.map((item, index) => {
      const estado =
        item.estado === 1 ? (
          <span className="text-success">DECLARAR</span>
        ) : (
          <span className="text-danger">ANULAR</span>
        );

      return (
        <tr key={index}>
          <td className="text-center">{item.id}</td>
          <td>
            <Link
              className="btn-link"
              to={getPathNavigation('cpe', `${item.serie}-${item.numeracion}`)}
            >
              {item.comprobante}
              <br />
              {item.serie}-{formatNumberWithZeros(item.numeracion)}
            </Link>
            {/* {item.comprobante}
            {<br />}
            {item.serie + '-' + item.numeracion} */}
          </td>
          <td>{estado}</td>
          <td>
            {item.fecha}
            {<br />}
            {formatTime(item.hora)}
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
                Notificaciones <small className="text-secondary">LISTA</small>
              </h5>
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
                    <th width="15%">Título</th>
                    <th width="30%">Detalle</th>
                    <th width="10%">Fecha</th>
                  </tr>
                </thead>
                <tbody>{this.generateBody()}</tbody>
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

export default Notications;
