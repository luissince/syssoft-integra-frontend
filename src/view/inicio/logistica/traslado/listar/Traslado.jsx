import React from 'react';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isEmpty,
  formatTime,
} from '../../../../../helper/utils.helper';
import ContainerWrapper from '../../../../../components/Container';
import Paginacion from '../../../../../components/Paginacion';
import { currentDate } from '../../../../../helper/utils.helper';
import CustomComponent from '../../../../../model/class/custom-component';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import {
  cancelTraslado,
  comboSucursal,
  comboTipoTraslado,
  listTraslado,
} from '../../../../../network/rest/principal.network';
import { CANCELED } from '../../../../../model/types/types';
import { connect } from 'react-redux';
import Column from '../../../../../components/Column';
import Select from '../../../../../components/Select';
import Row from '../../../../../components/Row';
import { SpinnerTable, SpinnerView } from '../../../../../components/Spinner';
import Input from '../../../../../components/Input';
import Button from '../../../../../components/Button';
import { TableResponsive } from '../../../../../components/Table';
import Title from '../../../../../components/Title';
import Search from '../../../../../components/Search';

class Traslado extends CustomComponent {
  constructor(props) {
    super(props);

    this.state = {
      initialLoad: true,
      initialMessage: 'Cargando datos...',

      idTipoTraslado: '',
      fechaInicio: currentDate(),
      fechaFinal: currentDate(),

      tipoTraslado: [],
      sucursales: [],

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

    this.refTxtSearch = React.createRef();

    this.abortControllerTable = new AbortController();
  }

  async componentDidMount() {
    this.loadingData();
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
  }

  async loadingData() {
    const [tipoTraslado, sucursales] = await Promise.all([
      this.fetchComboTipoTraslado(),
      this.fetchSucursal(),
    ]);

    await this.setStateAsync({
      tipoTraslado,
      sucursales,
      initialLoad: false,
    });
    this.loadInit();
  }

  loadInit = async () => {
    if (this.state.loading) return;

    await this.setStateAsync({ paginacion: 1, restart: true });
    this.fillTable(0);
    await this.setStateAsync({ opcion: 0 });
  }

  async searchSucursal() {
    if (this.state.loading) return;

    await this.setStateAsync({ paginacion: 1, restart: false });
    this.fillTable(0);
    await this.setStateAsync({ opcion: 0 });
  }

  searchText = async (text) => {
    if (this.state.loading) return;

    if (text.trim().length === 0) return;

    await this.setStateAsync({ paginacion: 1, restart: false, buscar: text });
    this.fillTable(1, text.trim());
    await this.setStateAsync({ opcion: 1 });
  }

  async searchFechas() {
    if (this.state.loading) return;

    if (this.state.fechaInicio > this.state.fechaFinal) return;

    await this.setStateAsync({ paginacion: 1, restart: false });
    this.fillTable(2);
    await this.setStateAsync({ opcion: 2 });
  }

  async searchTipoTraslado() {
    if (this.state.loading) return;

    await this.setStateAsync({ paginacion: 1, restart: false });
    this.fillTable(3);
    await this.setStateAsync({ opcion: 3 });
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
      case 2:
        this.fillTable(2);
        break;
      case 3:
        this.fillTable(3);
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
      idSucursal: this.state.idSucursal,
      buscar: buscar.trim(),
      fechaInicio: this.state.fechaInicio,
      fechaFinal: this.state.fechaFinal,
      idTipoTraslado: this.state.idTipoTraslado,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listTraslado(data, this.abortControllerTable.signal);

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

  async fetchComboTipoTraslado() {
    const response = await comboTipoTraslado(this.abortControllerTable.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchSucursal() {
    const response = await comboSucursal(this.abortControllerTable.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  handleSelectTipoTraslado = (event) => {
    this.setState({ idTipoTraslado: event.target.value }, () => {
      this.searchTipoTraslado();
    });
  };

  handleInputFechaInicio = (event) => {
    this.setState({ fechaInicio: event.target.value }, () => {
      this.searchFechas();
    });
  };

  handleInputFechaFinal = (event) => {
    this.setState({ fechaFinal: event.target.value }, () => {
      this.searchFechas();
    });
  };

  handleSelectSucursal = (event) => {
    this.setState({ idSucursal: event.target.value }, async () => {
      this.searchSucursal();
    })
  }

  handleAgregar = () => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/crear`,
    });
  };

  handleDetalle = (idAjuste) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/detalle`,
      search: '?idTraslado=' + idAjuste,
    });
  };

  handleCancelar = (idTraslado) => {
    alertDialog('Traslado', '¿Estás seguro de anular el traslado?', async (acccept) => {
      if (acccept) {
        alertInfo('Traslado', 'Procesando información...');

        const params = {
          idTraslado: idTraslado,
          idUsuario: this.state.idUsuario,
        };

        const response = await cancelTraslado(params);

        if (response instanceof SuccessReponse) {
          alertSuccess('Ajuste', response.data, () => {
            this.loadInit();
          });
        }

        if (response instanceof ErrorResponse) {
          alertWarning('Ajuste', response.getMessage());
        }
      }
    },
    );
  };

  generateBody = () => {
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
          <td className="text-center" colSpan="9">
            ¡No hay datos registrados!
          </td>
        </tr>
      );
    }

    return this.state.lista.map((item, index) => {
      const estado =
        item.estado === 1 ? (
          <span className="badge badge-success">Activo</span>
        ) : (
          <span className="badge badge-danger">Anulado</span>
        );


      return (
        <tr key={index}>
          <td className="text-center">{item.id}</td>
          <td>
            {item.fecha} <br />
            {formatTime(item.hora)}
          </td>
          <td>
            {item.tipo}
            <br />
            {item.motivo}
          </td>
          <td>{item.almacenOrigen}</td>
          <td>{item.almacenDestino}</td>
          <td>{item.observacion}</td>
          <td>{estado}</td>
          <td className='text-center'>
            <button
              className="btn btn-outline-info btn-sm"
              title="Editar"
              onClick={() => this.handleDetalle(item.idTraslado)}
            >
              <i className="bi bi-eye"></i>
            </button>
          </td>
          <td className='text-center'>
            <button
              className="btn btn-outline-danger btn-sm"
              title="Anular"
              onClick={() => this.handleCancelar(item.idTraslado)}
            >
              <i className="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      );
    });
  }

  render() {
    return (
      <ContainerWrapper>

        <SpinnerView
          loading={this.state.initialLoad}
          message={this.state.initialMessage}
        // body={<>
        //   <div className='d-flex flex-column align-items-center'>
        //     <p>No se pudo obtener los datos requeridos, comuníquese con su proveedor del sistema.</p>
        //     <Button
        //       className='btn-danger'>
        //       <i className='fa fa-refresh'></i> Recargar
        //     </Button>
        //   </div>
        // </>}
        />

        <Title
          title='Traslado'
          subTitle='LISTA'
        />

        <Row>
          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <Search
              onSearch={this.searchText}
              placeholder="Buscar..."
            />
          </Column>

          <Column className="col-md-6 col-sm-12" formGroup={true}>
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
          <Column className="col-md-3" formGroup={true}>
            <label>Tipo:</label>
            <Select
              value={this.state.idTipoTraslado}
              onChange={this.handleSelectTipoTraslado}
            >
              <option value="0">-- Selecciona --</option>
              {this.state.tipoTraslado.map((item, index) => (
                <option key={index} value={item.idTipoTraslado}>
                  {item.nombre}
                </option>
              ))}
            </Select>
          </Column>

          <Column className="col-md-3 col-sm-12" formGroup={true}>
            <label>Fecha Inicio:</label>
            <Input
              type="date"
              value={this.state.fechaInicio}
              onChange={this.handleInputFechaInicio}
            />
          </Column>

          <Column className="col-md-3 col-sm-12" formGroup={true}>
            <label>Fecha Final:</label>
            <Input
              type="date"
              value={this.state.fechaFinal}
              onChange={this.handleInputFechaFinal}
            />
          </Column>

          <Column className="col-md-3 col-sm-12" formGroup={true}>
            <label>Sucursal:</label>
            <Select
              value={this.state.idSucursal}
              onChange={this.handleSelectSucursal}
            >
              {
                this.state.sucursales.map((item, index) => (
                  <option key={index} value={item.idSucursal}>{item.nombre}</option>
                ))
              }
            </Select>
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive
              className={"table table-striped table-bordered rounded"}
              tHead={
                <tr>
                  <th width="5%" className="text-center">
                    #
                  </th>
                  <th width="15%">Fecha y Hora</th>
                  <th width="15%">Tipo / Motivo</th>
                  <th width="15%">Almacen Origen</th>
                  <th width="15%">Almacen Destino</th>
                  <th width="20%">Observación</th>
                  <th width="10%">Estado</th>
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

/**
 *
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */

const ConnectedTraslado = connect(mapStateToProps, null)(Traslado);

export default ConnectedTraslado;
