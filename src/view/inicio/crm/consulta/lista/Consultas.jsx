import PropTypes from 'prop-types';
import {
  alertDialog,
  formatTime,
  isEmpty,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import Paginacion from '../../../../../components/Paginacion';
import {
  deleteConsulta,
  listConsultas,
} from '../../../../../network/rest/principal.network';
import ErrorResponse from '../../../../../model/class/error-response';
import SuccessReponse from '../../../../../model/class/response';
import { CANCELED } from '../../../../../model/types/types';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import Title from '../../../../../components/Title';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../../../components/Table';
import { SpinnerTable } from '../../../../../components/Spinner';
import Button from '../../../../../components/Button';
import Search from '../../../../../components/Search';
import { setListaConsultaData, setListaConsultaPaginacion } from '../../../../../redux/predeterminadoSlice';
import React from 'react';
import { alertKit } from 'alert-kit';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class Consultas extends CustomComponent {

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

    this.refPaginacion = React.createRef();

    this.refSearch = React.createRef();

    this.abortControllerTable = new AbortController();
  }

  async componentDidMount() {
    await this.loadingData();
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
  }

  loadingData = async () => {
    if (this.props.consultaLista && this.props.consultaLista.data && this.props.consultaLista.paginacion) {
      this.setState(this.props.consultaLista.data)
      this.refPaginacion.current.upperPageBound = this.props.consultaLista.paginacion.upperPageBound;
      this.refPaginacion.current.lowerPageBound = this.props.consultaLista.paginacion.lowerPageBound;
      this.refPaginacion.current.isPrevBtnActive = this.props.consultaLista.paginacion.isPrevBtnActive;
      this.refPaginacion.current.isNextBtnActive = this.props.consultaLista.paginacion.isNextBtnActive;
      this.refPaginacion.current.pageBound = this.props.consultaLista.paginacion.pageBound;
      this.refPaginacion.current.messagePaginacion = this.props.consultaLista.paginacion.messagePaginacion;

      this.refSearch.current.initialize(this.props.consultaLista.data.buscar);
    } else {
      await this.loadingInit();
      this.updateReduxState();
    }
  }

  updateReduxState() {
    this.props.setListaConsultaData(this.state)
    this.props.setListaConsultaPaginacion({
      upperPageBound: this.refPaginacion.current.upperPageBound,
      lowerPageBound: this.refPaginacion.current.lowerPageBound,
      isPrevBtnActive: this.refPaginacion.current.isPrevBtnActive,
      isNextBtnActive: this.refPaginacion.current.isNextBtnActive,
      pageBound: this.refPaginacion.current.pageBound,
      messagePaginacion: this.refPaginacion.current.messagePaginacion,
    });
  }

  loadingInit = async () => {
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

    const data = {
      opcion: opcion,
      buscar: buscar.trim(),
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listConsultas(data, this.abortControllerTable.signal);

    if (response instanceof SuccessReponse) {
      const totalPaginacion = parseInt(Math.ceil(parseFloat(response.data.total) / this.state.filasPorPagina),);

      this.setState({
        loading: false,
        lista: response.data.result,
        totalPaginacion: totalPaginacion,
      }, () => {
        this.updateReduxState();
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


  handleEditar = (idConsulta) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/editar`,
      search: '?idConsulta=' + idConsulta,
    });
  };

  handleDetalle = (idConsulta) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/detalle`,
      search: '?idConsulta=' + idConsulta,
    });
  };

  handleBorrar = (idConsulta) => {
    alertKit.question({
      title: "Consulta",
      message: "¿Estás seguro de eliminar la consulta?",
    }, async (accept) => {
      if (accept) {

        alertKit.loading({
          message: 'Procesando información...',
        });

        const response = await deleteConsulta(idConsulta);

        if (response instanceof SuccessReponse) {
          alertKit.success({
            title: "Consulta",
            message: response.data,
            onClose: () => {
              this.loadingInit();
            },
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertKit.warning({
            title: "Consulta",
            message: response.getMessage(),
          });
        }
      }
    },
    );
  };

  generateBody() {
    if (this.state.loading) {
      return (
        <SpinnerTable
          colSpan='9'
          message={'Cargando información de la tabla...'}
        />
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <TableRow className="text-center">
          <TableCell colSpan="9">¡No hay datos registrados!</TableCell>
        </TableRow>
      );
    }

    return this.state.lista.map((item, index) => {
      const estado = item.estado === 1
        ? <span className="badge badge-success">ACTIVO</span>
        : <span className="badge badge-danger">ANULADO</span>;

      return (
        <TableRow key={index}>
          <TableCell className="text-center">{item.id}</TableCell>
          <TableCell>{item.fecha} <br /> {formatTime(item.hora)}</TableCell>
          <TableCell>{item.nombre}</TableCell>
          <TableCell>{item.asunto}</TableCell>
          <TableCell>{item.email.toUpperCase()} <br /> {item.celular} </TableCell>
          <TableCell>{estado}</TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-info btn-sm"
              onClick={() => this.handleDetalle(item.idConsulta)}
            // disabled={!this.state.view}
            >
              <i className="fa fa-eye"></i>
            </Button>
          </TableCell>

          <TableCell className="text-center">
            <Button
              className="btn-outline-warning btn-sm"
              onClick={() => this.handleEditar(item.idConsulta)}
            // disabled={!this.state.edit}
            >
              <i className="bi bi-pencil"></i>
            </Button>
          </TableCell>

          <TableCell className="text-center">
            <Button
              className="btn-outline-danger btn-sm"
              onClick={() => this.handleBorrar(item.idConsulta)}
            // disabled={!this.state.remove}
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
          title='Consulta'
          subTitle='LISTA'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-outline-secondary"
              onClick={this.loadingInit}
            >
              <i className="bi bi-arrow-clockwise"></i> Recargar Vista
            </Button>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <Search
              group={true}
              iconLeft={<i className="bi bi-search"></i>}
              ref={this.refSearch}
              onSearch={this.searchText}
              placeholder="Buscar por nombre, consulta, email..."
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
                    <TableHead width="10%">Fecha</TableHead>
                    <TableHead width="15%">Persona</TableHead>
                    <TableHead width="20%">Asunto</TableHead>
                    <TableHead width="20%">Contacto</TableHead>
                    <TableHead width="10%">Estado</TableHead>
                    <TableHead width="5%" className="text-center"> Detalle </TableHead>
                    <TableHead width="5%" className="text-center">Editar </TableHead>
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
          ref={this.refPaginacion}
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

Consultas.propTypes = {
  token: PropTypes.shape({
    project: PropTypes.shape({
      idSucursal: PropTypes.string,
    }),
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string,
    }),
  }),
  consultaLista: PropTypes.shape({
    data: PropTypes.object,
    paginacion: PropTypes.object
  }),
  setListaConsultaData: PropTypes.func,
  setListaConsultaPaginacion: PropTypes.func,
  history: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    consultaLista: state.predeterminado.consultaLista
  };
};

const mapDispatchToProps = { setListaConsultaData, setListaConsultaPaginacion }

const ConnectedConsultas = connect(mapStateToProps, mapDispatchToProps)(Consultas);

export default ConnectedConsultas;