import React from 'react';
import PropTypes from 'prop-types';
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
import {
  deleteMoneda,
  listMoneda,
} from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';
import CustomComponent from '../../../../model/class/custom-component';
import Title from '../../../../components/Title';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Button from '../../../../components/Button';
import Search from '../../../../components/Search';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../../components/Table';
import { SpinnerTable } from '../../../../components/Spinner';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class Monedas extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      // add: statePrivilegio(
      //   this.props.token.userToken.menus[5].submenu[1].privilegio[0].estado,
      // ),
      // edit: statePrivilegio(
      //   this.props.token.userToken.menus[5].submenu[1].privilegio[1].estado,
      // ),
      // remove: statePrivilegio(
      //   this.props.token.userToken.menus[5].submenu[1].privilegio[2].estado,
      // ),

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

    this.refTxtNombre = React.createRef();
    this.refTxtCodIso = React.createRef();
    this.refTxtSimbolo = React.createRef();
    this.refEstado = React.createRef();

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

    const response = await listMoneda(params, this.abortControllerTable.signal);

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

  handleAgregar = () => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/agregar`,
    });
  };

  handleEditar = (idMoneda) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/editar`,
      search: '?idMoneda=' + idMoneda,
    });
  };

  handleBorrar(idMoneda) {
    alertDialog('Moneda', '¿Estás seguro de eliminar la moneda?', async (accept) => {
      if (accept) {
        const params = {
          idMoneda: idMoneda,
        };

        alertInfo('Moneda', 'Procesando información...');

        const response = await deleteMoneda(params);

        if (response instanceof SuccessReponse) {
          alertSuccess('Moneda', response.data);
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertWarning('Moneda', response.getType());
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
            ¡No hay datos registrados!
          </TableCell>
        </TableRow>
      );
    }

    return this.state.lista.map((item, index) => {
      const flag =
        item.nacional === 1 ? (
          <i
            className="fa fa-flag text-success"
            style={{ fontSize: '25px' }}
          ></i>
        ) : (
          <i></i>
        );

      const nmEstado = item.estado === 1 ? 'ACTIVO' : 'INACTIVO';
      const bgEstado = `badge ${item.estado === 1 ? 'badge-success' : 'badge-danger'
        }`;

      return (
        <TableRow key={index}>
          <TableCell className="text-center">{item.id}</TableCell>
          <TableCell>{item.nombre}</TableCell>
          <TableCell>{item.codiso}</TableCell>
          <TableCell>{item.simbolo}</TableCell>
          <TableCell className="text-center">{flag}</TableCell>
          <TableCell>
            <span className={bgEstado}>{nmEstado}</span>
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-warning btn-sm"
              onClick={() => this.handleEditar(item.idMoneda)}
            // disabled={!this.state.edit}
            >
              <i className="bi bi-pencil"></i>
            </Button>
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-danger btn-sm"
              onClick={() => this.handleBorrar(item.idMoneda)}
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
          title='Monedas'
          subTitle='LISTA'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-outline-info"
              onClick={this.handleAgregar}
            // disabled={!this.state.add}
            >
              <i className="bi bi-file-plus"></i> Nuevo Registro
            </Button>
            {' '}
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
              <Table className={"table-striped table-bordered rounded"}>
                <TableHeader className="thead-light">
                  <TableRow>
                    <TableHead width="5%" className="text-center">#</TableHead>
                    <TableHead width="25%">Moneda</TableHead>
                    <TableHead width="15%">Codigo ISO</TableHead>
                    <TableHead width="10%">Símbolo</TableHead>
                    <TableHead width="10%">Nacional</TableHead>
                    <TableHead width="10%">Estado</TableHead>
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

Monedas.propTypes = {
  history: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  location: PropTypes.shape({
    pathname: PropTypes.string
  }),
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string
    })
  })
}

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedMonedas = connect(mapStateToProps, null)(Monedas);

export default ConnectedMonedas;