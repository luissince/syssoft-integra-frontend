import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isEmpty,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import Paginacion from '../../../../components/Paginacion';
import ContainerWrapper from '../../../../components/Container';
import CustomComponent from '../../../../model/class/custom-component';
import {
  deleteVehiculo,
  listVehiculo,
} from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';
import Title from '../../../../components/Title';
import { SpinnerTable } from '../../../../components/Spinner';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../../components/Table';
import Button from '../../../../components/Button';
import Search from '../../../../components/Search';

class Vehiculo extends CustomComponent {

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

      idUsuario: this.props.token.userToken.idUsuario,
    };

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
    await this.setStateAsync({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const params = {
      opcion: opcion,
      buscar: buscar.trim(),
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listVehiculo(
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

  handleEditar = (idVehiculo) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/editar`,
      search: '?idVehiculo=' + idVehiculo,
    });
  };

  handleBorrar(id) {
    alertDialog('Vehículo', '¿Estás seguro de eliminar el vehículo?', async (accept) => {
      if (accept) {
        alertInfo('Vehículo', 'Procesando información...');

        const params = {
          idVehiculo: id,
        };

        const response = await deleteVehiculo(params);
        if (response instanceof SuccessReponse) {
          alertSuccess('Vehículo', response.data, () => {
            this.loadInit();
          });
        }

        if (response instanceof ErrorResponse) {
          alertWarning('Vehículo', response.getMessage());
        }
      }
    },
    );
  }

  generarBody() {
    if (this.state.loading) {
      return (
        <SpinnerTable
          colSpan='8'
          message='Cargando información de la tabla...'
        />
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <TableRow>
          <TableCell className="text-center" colSpan="8">
            ¡No hay comprobantes registrados!
          </TableCell>
        </TableRow>
      );
    }

    return this.state.lista.map((item, index) => {
      return (
        <TableRow key={index}>
          <TableCell className="text-center">{item.id}</TableCell>
          <TableCell>{item.marca}</TableCell>
          <TableCell>{item.numeroPlaca}</TableCell>
          <TableCell className="text-center">
            <div
              className={`badge ${item.preferido == 1 ? 'badge-success' : 'badge-warning'}`}
            >
              {item.preferido === 1 ? 'SI' : 'NO'}
            </div>
          </TableCell>
          <TableCell className="text-center">
            <div
              className={`badge ${item.estado === 1 ? 'badge-info' : 'badge-danger'}`}
            >
              {item.estado ? 'ACTIVO' : 'INACTIVO'}
            </div>
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-warning btn-sm"
              title="Editar"
              onClick={() => this.handleEditar(item.idVehiculo)}
            >
              <i className="bi bi-pencil"></i>
            </Button>
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-danger btn-sm"
              onClick={() => this.handleBorrar(item.idVehiculo)}
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
          title='Vehiculos'
          subTitle='LISTA'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-outline-info"
              onClick={this.handleAgregar}
            >
              <i className="bi bi-file-plus"></i> Nuevo Registro
            </Button>{' '}
            <Button
              className="btn-outline-secondary"
              onClick={this.loadInit}
            >
              <i className="bi bi-arrow-clockwise"></i>
            </Button>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <Search
              group={true}
              iconLeft={<i className="bi bi-search"></i>}
              onSearch={this.searchText}
              placeholder="Buscar por comprobante o cliente..."
            />
          </Column>
        </Row>


        <Row>
          <Column>
            <TableResponsive>
              <Table className={"table-bordered"}>
                <TableHeader className="thead-light">
                  <TableRow>
                    <TableHead width="5%" className="text-center">#</TableHead>
                    <TableHead width="25%">Marca</TableHead>
                    <TableHead width="25%">Número Placa</TableHead>
                    <TableHead width="15%">Preferida</TableHead>
                    <TableHead width="15%">Estado</TableHead>
                    <TableHead width="5%" className="text-center">Editar</TableHead>
                    <TableHead width="5%" className="text-center">Eliminar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {this.generarBody()}
                </TableBody>
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

const ConnectedProductos = connect(mapStateToProps, null)(Vehiculo);

export default ConnectedProductos;
