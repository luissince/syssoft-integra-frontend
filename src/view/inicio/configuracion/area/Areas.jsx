import { isEmpty } from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import Paginacion from '../../../../components/Paginacion';
import { listArea } from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '@/constants/requestStatus';
import ContainerWrapper from '../../../../components/ui/container-wrapper';
import { removeArea } from '../../../../network/rest/principal.network';
import CustomComponent from '@/components/CustomComponent';
import Title from '../../../../components/Title';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableResponsive,
  TableRow,
} from '../../../../components/Table';
import Button from '../../../../components/Button';
import Search from '../../../../components/Search';
import { SpinnerTable } from '../../../../components/Spinner';
import { alertKit } from 'alert-kit';

class Area extends CustomComponent {
  constructor(props) {
    super(props);

    this.state = {
      buscar: "",

      loading: false,
      lista: [],
      restart: false,

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: "Cargando información...",
    };

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

  searchText = async (text) => {
    if (this.state.loading) return;

    if (text.trim().length === 0) return;

    await this.setStateAsync({ paginacion: 1, restart: true, buscar: text });
    this.fillTable(1, text.trim());
    await this.setStateAsync({ opcion: 1 });
  };

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
    const response = await listArea(
      params,
      this.abortControllerTable.signal,
    );

    /**
     * Si la respuesta fue existosa
     */
    if (response instanceof SuccessReponse) {
      const data = response.data;

      const totalPaginacion = parseInt(
        String(Math.ceil(Number(data.total) / this.state.filasPorPagina)),
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

  handleEditar = (idArea) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/editar`,
      search: '?idArea=' + idArea,
    });
  };

  handleDelete = async (id) => {
    const accept = await alertKit.question({
      title: 'Área',
      message: '¿Estás seguro de eliminar el Área?',
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      alertKit.loading({
        message: 'Procesando información...',
      });

      const response = await removeArea(id);

      if (response instanceof SuccessReponse) {
        alertKit.success({
          title: 'Area',
          message: response.data,
        }, () => {
          this.loadInit();
        });
      }

      if (response instanceof ErrorResponse) {
        alertKit.warning({
          title: 'Area',
          message: response.getMessage(),
        });
      }
    }
  };

  generateBody() {
    if (this.state.loading) {
      return (
        <SpinnerTable
          colSpan={7}
          message="Cargando información de la tabla..."
        />
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <TableRow>
          <TableCell className="text-center" colSpan="7">
            ¡No hay datos registrados!
          </TableCell>
        </TableRow>
      );
    }

    return this.state.lista.map((item, index) => {
      const estado =
        item.estado === 1 ? (
          <span className="badge badge-success">ACTIVO</span>
        ) : (
          <span className="badge badge-danger">INACTIVO</span>
        );

      return (
        <TableRow key={index}>
          <TableCell className="text-center">{item.id}</TableCell>
          <TableCell>{item.nombre}</TableCell>
          <TableCell className="text-center">{item.descripcion}</TableCell>
          <TableCell className="text-center">{estado}</TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-warning btn-sm"
              onClick={() => this.handleEditar(item.idArea)}
            >
              <i className="bi bi-pencil"></i>
            </Button>
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-danger btn-sm"
              onClick={() => this.handleDelete(item.idArea)}
            >
              <i className="bi bi-trash"></i>
            </Button>
          </TableCell>
        </TableRow>
      );
    });
  }

  render() {
    return (
      <ContainerWrapper>
        <Title
          title="Areas"
          subTitle="LISTA"
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Button className="btn-outline-info" onClick={this.handleAgregar}>
              <i className="bi bi-file-plus"></i> Nuevo Registro
            </Button>{' '}
            <Button className="btn-outline-secondary" onClick={this.loadInit}>
              <i className="bi bi-arrow-clockwise"></i> Recargar Vista
            </Button>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <Search
              group={true}
              iconLeft={<i className="bi bi-search"></i>}
              onSearch={this.searchText}
              placeholder="Buscar por nombre..."
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive>
              <Table className={'table-bordered'}>
                <TableHeader className="thead-light">
                  <TableRow>
                    <TableHead className="text-center" width="5%">
                      #
                    </TableHead>
                    <TableHead width="20%">Nombre</TableHead>
                    <TableHead width="20%">Descripcion</TableHead>
                    <TableHead className="text-center" width="10%">
                      Estado
                    </TableHead>
                    <TableHead className="text-center" width="5%">
                      Editar
                    </TableHead>
                    <TableHead className="text-center" width="5%">
                      Eliminar
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{this.generateBody()}</TableBody>
              </Table>
            </TableResponsive>
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

const ConnectedArea = connect(mapStateToProps, null)(Area);

export default ConnectedArea;
