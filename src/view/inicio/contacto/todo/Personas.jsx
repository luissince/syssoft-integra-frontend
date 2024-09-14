import { connect } from 'react-redux';
import {
  alertInfo,
  alertSuccess,
  alertWarning,
  alertDialog,
  isEmpty,
} from '../../../../helper/utils.helper';
import Paginacion from '../../../../components/Paginacion';
import ContainerWrapper from '../../../../components/Container';
import {
  deletePersona,
  listPersonas,
} from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';
import CustomComponent from '../../../../model/class/custom-component';
import Title from '../../../../components/Title';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../../components/Table';
import { SpinnerTable } from '../../../../components/Spinner';
import Button from '../../../../components/Button';
import Search from '../../../../components/Search';

class Personas extends CustomComponent {

  constructor(props) {
    super(props);
    this.state = {
      idSucursal: this.props.token.project.idSucursal,

      loading: false,
      lista: [],
      restart: false,

      buscar: '',

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',
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
    this.fillTable(0, '');
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
      buscar: buscar.trim(),
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listPersonas(params, this.abortControllerTable.signal,);

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

  handleAgregarCliente() {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/agregar`,
    });
  }

  handleDetalleCliente(idPersona) {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/detalle`,
      search: '?idPersona=' + idPersona,
    });
  }

  handleEditarCliente(idPersona) {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/editar`,
      search: '?idPersona=' + idPersona,
    });
  }

  handleRemoverCliente(idPersona) {
    alertDialog('Cliente', '¿Está seguro de que desea eliminar el contacto? Esta operación no se puede deshacer.', async (accept) => {
      if (accept) {
        alertInfo('Cliente', 'Procesando información...');

        const params = {
          idPersona: idPersona,
        };

        const response = await deletePersona(params);

        if (response instanceof SuccessReponse) {
          alertSuccess('Cliente', response.data, () => {
            this.loadInit();
          });
        }

        if (response instanceof ErrorResponse) {
          alertWarning('Cliente', response.getMessage());
        }
      }
    },
    );
  }

  generateBody() {
    if (this.state.loading) {
      return (
        <SpinnerTable
          colSpan='10'
          message='Cargando información de la tabla...'
        />
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <TableRow className="text-center">
          <TableCell colSpan="10">¡No hay datos registrados!</TableCell>
        </TableRow>
      );
    }

    return this.state.lista.map((item, index) => {
      return (
        <TableRow key={index}>
          <TableCell className="text-center">{item.id}</TableCell>
          <TableCell>
            {item.tipoDocumento}
            {<br />}
            {item.documento}
          </TableCell>
          <TableCell>{item.informacion}</TableCell>
          <TableCell>
            {item.celular}
            {<br />}
            {item.telefono}
          </TableCell>
          <TableCell>{item.direccion}</TableCell>
          <TableCell className="text-center">
            <div
              className={`badge ${item.predeterminado === 1 ? 'badge-success' : 'badge-warning'}`}
            >
              {item.predeterminado === 1 ? 'SI' : 'NO'}
            </div>
          </TableCell>
          <TableCell className="text-center">
            <div
              className={`badge ${item.estado === 1 ? 'badge-info' : 'badge-danger'}`}
            >
              {item.estado === 1 ? 'ACTIVO' : 'INACTIVO'}
            </div>
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-info btn-sm"
              onClick={() =>
                this.handleDetalleCliente(item.idPersona)
              }
            >
              <i className="bi bi-eye"></i>
            </Button>
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-warning btn-sm"
              onClick={() =>
                this.handleEditarCliente(item.idPersona)
              }
            >
              <i className="bi bi-pencil"></i>
            </Button>
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-danger btn-sm"
              onClick={() =>
                this.handleRemoverCliente(item.idPersona)
              }
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
          title='Contatos'
          subTitle='LISTA'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-outline-info"
              onClick={() => this.handleAgregarCliente()}
            >
              <i className="bi bi-file-plus"></i> Nuevo Registro
            </Button>{' '}
            <Button
              className="btn-outline-secondary"
              onClick={() => this.loadInit()}
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
                <TableHeader>
                  <TableRow>
                    <TableHead width="5%" className="text-center">#</TableHead>
                    <TableHead width="10%">DNI / RUC</TableHead>
                    <TableHead width="20%">Cliente</TableHead>
                    <TableHead width="10%">Cel. / Tel.</TableHead>
                    <TableHead width="15%">Dirección</TableHead>
                    <TableHead width="7%">Predeterminado</TableHead>
                    <TableHead width="7%">Estado</TableHead>
                    <TableHead width="5%" className="text-center">Detalle</TableHead>
                    <TableHead width="5%" className="text-center">Editar</TableHead>
                    <TableHead width="5%" className="text-center">Eliminar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {this.generateBody()}
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

const ConnectedPersonas = connect(mapStateToProps, null)(Personas);

export default ConnectedPersonas;
