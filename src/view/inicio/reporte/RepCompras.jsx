import React from 'react';
import PropTypes from 'prop-types';
import { ExternalLink } from 'lucide-react'
import { alertWarning, currentDate, formatNumberWithZeros, formatTime, getPathNavigation, guId, isEmpty, numberFormat } from '../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../components/Container';
import CustomComponent from '../../../model/class/custom-component';
import { SpinnerView } from '../../../components/Spinner';
import Title from '../../../components/Title';
import Row from '../../../components/Row';
import Column from '../../../components/Column';
import { comboSucursal, comboUsuario, dashboardCompra, documentsExcelCompra, documentsPdfReportsCompra } from '../../../network/rest/principal.network';
import SuccessReponse from '../../../model/class/response';
import ErrorResponse from '../../../model/class/error-response';
import { CANCELED } from '../../../model/types/types';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../components/Table';
import { Card, CardBody, CardHeader, CardText, CardTitle } from '../../../components/Card';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import Button from '../../../components/Button';
import pdfVisualizer from 'pdf-visualizer';
import { downloadFileAsync } from '../../../redux/downloadSlice';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class RepCompras extends CustomComponent {

  /**
   * 
   * Constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      msgLoading: "Cargando información...",

      fechaInicial: currentDate(),
      fechaFinal: currentDate(),

      idUsuario: '',
      usuarios: [],

      idSucursal: this.props.token.project.idSucursal,
      sucursales: [],

      codIso: this.props.moneda.codiso ?? '',

      totalCompra: 0,
      totalContado: 0,
      totalCredito: 0,
      totalAnulado: 0,
      lista: [],
      paginacion: 1,
      totalPaginacion: 0,
      filasPorPagina: 5,
    };

    this.refFechaInicial = React.createRef();
    this.refFechaFinal = React.createRef();
    this.refUsuario = React.createRef();
    this.refIdSucursal = React.createRef();
    this.refUseFile = React.createRef();

    this.abortControllerView = new AbortController();
  }

  /*
  |--------------------------------------------------------------------------
  | Método de cliclo de vida
  |--------------------------------------------------------------------------
  |
  | El ciclo de vida de un componente en React consta de varios métodos que se ejecutan en diferentes momentos durante la vida útil
  | del componente. Estos métodos proporcionan puntos de entrada para realizar acciones específicas en cada etapa del ciclo de vida,
  | como inicializar el estado, montar el componente, actualizar el estado y desmontar el componente. Estos métodos permiten a los
  | desarrolladores controlar y realizar acciones específicas en respuesta a eventos de ciclo de vida, como la creación, actualización
  | o eliminación del componente. Entender y utilizar el ciclo de vida de React es fundamental para implementar correctamente la lógica
  | de la aplicación y optimizar el rendimiento del componente.
  |
  */

  async componentDidMount() {
    await this.loadingInit();
  }

  componentWillUnmount() {
    this.abortControllerView.abort();
  }

  /*
  |--------------------------------------------------------------------------
  | Métodos de acción
  |--------------------------------------------------------------------------
  |
  | Carga los datos iniciales necesarios para inicializar el componente. Este método se utiliza típicamente
  | para obtener datos desde un servicio externo, como una API o una base de datos, y actualizar el estado del
  | componente en consecuencia. El método loadingData puede ser responsable de realizar peticiones asíncronas
  | para obtener los datos iniciales y luego actualizar el estado del componente una vez que los datos han sido
  | recuperados. La función loadingData puede ser invocada en el montaje inicial del componente para asegurarse
  | de que los datos requeridos estén disponibles antes de renderizar el componente en la interfaz de usuario.
  |
  */

  loadingInit = async () => {
    this.setState({
      loading: true,
      msgLoading: "Cargando información...",
      lista: [],
      paginacion: 1,
      totalPaginacion: 0,
    });

    const sucursalResponse = await comboSucursal(
      this.abortControllerView.signal,
    );

    if (sucursalResponse instanceof ErrorResponse) {
      if (sucursalResponse.getType() === CANCELED) return;

      alertWarning('Reporte Compra', sucursalResponse.getMessage(), async () => {
        await this.loadingInit();
      });
      return;
    }

    const usuarioResponse = await comboUsuario(
      this.abortControllerView.signal,
    );

    if (usuarioResponse instanceof ErrorResponse) {
      if (usuarioResponse.getType() === CANCELED) return;

      alertWarning('Reporte Compra', usuarioResponse.getMessage(), async () => {
        await this.loadingInit();
      });
      return;
    }

    await this.setStateAsync({
      sucursales: sucursalResponse.data,
      usuarios: usuarioResponse.data,
    });
    await this.loadingData();
  }

  paginacionContext = async () => {
    if (this.state.paginacion === this.state.totalPaginacion) return;

    await this.setStateAsync({ paginacion: this.state.paginacion + 1 });
    await this.loadingData();
  }

  loadingData = async (borrarLista = false) => {
    await this.setStateAsync({
      loading: true,
      msgLoading: "Cargando información...",
      lista: borrarLista ? [] : this.state.lista,
      paginacion: borrarLista ? 1 : this.state.paginacion,
    });

    const params = {
      'fechaInicio': this.state.fechaInicial,
      'fechaFinal': this.state.fechaFinal,
      'idSucursal': this.state.idSucursal,
      'idUsuario': this.state.idUsuario,
      'posicionPagina': (this.state.paginacion - 1) * this.state.filasPorPagina,
      'filasPorPagina': this.state.filasPorPagina,
    }

    const dashboard = await dashboardCompra(params);

    if (dashboard instanceof ErrorResponse) {
      alertWarning('Reporte Compra', dashboard.getMessage())
      return;
    }

    dashboard instanceof SuccessReponse;

    const totalPaginacion = parseInt(
      Math.ceil(parseFloat(dashboard.data.total) / this.state.filasPorPagina),
    );

    this.setState({
      totalCompra: dashboard.data.contado + dashboard.data.credito,
      totalContado: dashboard.data.contado,
      totalCredito: dashboard.data.credito,
      totalAnulado: dashboard.data.anulado,
      lista: [...this.state.lista, ...dashboard.data.lista],
      totalPaginacion: totalPaginacion,
      loading: false
    })
  }

  /*
  |--------------------------------------------------------------------------
  | Método de eventos
  |--------------------------------------------------------------------------
  |
  | El método handle es una convención utilizada para denominar funciones que manejan eventos específicos
  | en los componentes de React. Estas funciones se utilizan comúnmente para realizar tareas o actualizaciones
  | en el estado del componente cuando ocurre un evento determinado, como hacer clic en un botón, cambiar el valor
  | de un campo de entrada, o cualquier otra interacción del usuario. Los métodos handle suelen recibir el evento
  | como parámetro y se encargan de realizar las operaciones necesarias en función de la lógica de la aplicación.
  | Por ejemplo, un método handle para un evento de clic puede actualizar el estado del componente o llamar a
  | otra función específica de la lógica de negocio. La convención de nombres handle suele combinarse con un prefijo
  | que describe el tipo de evento que maneja, como handleInputChange, handleClick, handleSubmission, entre otros. 
  |
  */

  handleDateFechaInicial = (event) => {
    this.setState({ fechaInicial: event.target.value }, async () => {
      await this.loadingData(true);
    });
  }

  handleDateFechaFinal = (event) => {
    this.setState({ fechaFinal: event.target.value, }, async () => {
      await this.loadingData(true);
    });
  }

  handleSelectSucursal = (event) => {
    this.setState({ idSucursal: event.target.value, }, async () => {
      await this.loadingData(true);
    });
  }

  handleSelectUsuario = (event) => {
    this.setState({ idUsuario: event.target.value, }, async () => {
      await this.loadingData(true);
    });
  }

  handleOpenPdf = async () => {
    await pdfVisualizer.init({
      url: documentsPdfReportsCompra(),
      title: 'Reporte de Compras',
      titlePageNumber: 'Página',
      titleLoading: 'Cargando...',
    });
  }

  handleDownloadExcel = async () => {
    const id = guId();
    const url = documentsExcelCompra();
    this.props.downloadFileAsync({ id, url });
  }

  /*
  |--------------------------------------------------------------------------
  | Método de renderización
  |--------------------------------------------------------------------------
  |
  | El método render() es esencial en los componentes de React y se encarga de determinar
  | qué debe mostrarse en la interfaz de usuario basado en el estado y las propiedades actuales
  | del componente. Este método devuelve un elemento React que describe lo que debe renderizarse
  | en la interfaz de usuario. La salida del método render() puede incluir otros componentes
  | de React, elementos HTML o una combinación de ambos. Es importante que el método render()
  | sea una función pura, es decir, no debe modificar el estado del componente ni interactuar
  | directamente con el DOM. En su lugar, debe basarse únicamente en los props y el estado
  | actuales del componente para determinar lo que se mostrará.
  |
  */

  renderLista() {
    if (isEmpty(this.state.lista)) {
      return (
        <TableRow>
          <TableCell className="text-center" colSpan="7">¡No hay datos para mostrar!</TableCell>
        </TableRow>
      );
    }

    let rows = [];

    const newRows = this.state.lista.map((item, index) => {
      const estado = item.estado === 1
        ? <span className="badge badge-success">PAGADO</span>
        : item.estado === 2
          ? <span className="badge badge-warning">POR PAGAR</span>
          : <span className="badge badge-danger">ANULADO</span>;

      return (
        <TableRow key={index}>
          <TableCell>{item.id}</TableCell>
          <TableCell>{item.fecha} <br /> {formatTime(item.hora)} </TableCell>
          <TableCell>{item.documento} <br />{item.informacion}</TableCell>
          <TableCell>
            <Link
              to={getPathNavigation("compra", item.idCompra)}
              className='btn-link'
            >
              {item.comprobante}
              <br />
              {item.serie}-{formatNumberWithZeros(item.numeracion)} <ExternalLink width={18} height={18} />
            </Link>
          </TableCell>
          <TableCell>{item.tipo}</TableCell>
          <TableCell>{estado}</TableCell>
          <TableCell>{numberFormat(item.total, item.codiso)} </TableCell>
        </TableRow>
      );
    });

    rows.push(newRows);

    rows.push(
      <TableRow key={0}>
        <TableCell className="text-center" colSpan="7">
          <Button
            disabled={this.state.paginacion === this.state.totalPaginacion}
            className="btn-outline-secondary"
            onClick={this.paginacionContext}>
            <i className='bi bi-chevron-double-down'></i> Mostrar Más
          </Button>
        </TableCell>
      </TableRow>
    );

    return rows;
  }

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title='Reporte Compras'
          subTitle='DASHBOARD'
          handleGoBack={() => this.props.history.goBack()}
        />
        
        <Row>
          <Column formGroup={true}>
            {/* <Button
              className="btn-outline-warning"
              onClick={this.handleOpenPdf}>
              <i className="bi bi-file-earmark-pdf-fill"></i> Generar Pdf
            </Button>
            {" "}
            <Button
              className="btn-outline-success"
              onClick={this.handleDownloadExcel}>
              <i className="bi bi-file-earmark-excel-fill"></i> Generar Excel
            </Button>
            {" "} */}
            <Button
              className="btn-outline-light"
              onClick={this.loadingInit}>
              <i className="bi bi-arrow-clockwise"></i> Recargar Vista
            </Button>
          </Column>
        </Row>

        <Row>
          <Column className="col-lg-3 col-md-3 col-sm-12 col-12" formGroup={true}>
            <Input
              label={"Fecha de Inicio:"}
              type="date"
              value={this.state.fechaInicial}
              onChange={this.handleDateFechaInicial}
            />
          </Column>

          <Column className="col-lg-3 col-md-3 col-sm-12 col-12" formGroup={true}>
            <Input
              label={"Fecha de Final:"}
              type="date"
              value={this.state.fechaFinal}
              onChange={this.handleDateFechaFinal}
            />
          </Column>

          <Column className="col-lg-3 col-md-3 col-sm-12 col-12" formGroup={true}>
            <Select
              label={"Sucursal:"}
              ref={this.refIdSucursal}
              value={this.state.idSucursal}
              onChange={this.handleSelectSucursal}
            >
              <option value="">TODOS</option>
              {
                this.state.sucursales.map((item, index) => (
                  <option key={index} value={item.idSucursal}>
                    {index + 1 + '.- ' + item.nombre}
                  </option>
                ))
              }
            </Select>
          </Column>

          <Column className="col-lg-3 col-md-3 col-sm-12 col-12" formGroup={true}>
            <Select
              label={"Usuario:"}
              ref={this.refUsuario}
              value={this.state.idUsuario}
              onChange={this.handleSelectUsuario}
            >
              {
                this.state.usuarios.map((item, index) => (
                  <option key={index} value={item.idUsuario}>
                    {item.nombres + ' ' + item.apellidos}
                  </option>
                ))
              }
            </Select>
          </Column>
        </Row>

        <Row>
          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Compras Totales</CardTitle>
                <CardText className={'text-success'}>{numberFormat(this.state.totalCompra, this.state.codIso)}</CardText>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Al Contado</CardTitle>
                <CardText className={'text-primary'}>{numberFormat(this.state.totalContado, this.state.codIso)}</CardText>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Al Crédito</CardTitle>
                <CardText className={'text-warning'}>{numberFormat(this.state.totalCredito, this.state.codIso)}</CardText>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Anuladas</CardTitle>
                <CardText className={'text-danger'}>{numberFormat(this.state.totalAnulado, this.state.codIso)}</CardText>
              </CardBody>
            </Card>
          </Column>
        </Row>

        <Row>
          <Column>
            <Card>
              <CardHeader>
                <CardTitle>Lista de Compras</CardTitle>
              </CardHeader>
              <CardBody>
                <TableResponsive>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead width="5%">#</TableHead>
                        <TableHead width="10%">Fecha</TableHead>
                        <TableHead width="20%">Proveedor</TableHead>
                        <TableHead width="20%">Comprobante</TableHead>
                        <TableHead width="10%">Tipo</TableHead>
                        <TableHead width="10%">Estado</TableHead>
                        <TableHead width="10%">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {this.renderLista()}
                    </TableBody>
                  </Table>
                </TableResponsive>
              </CardBody>
            </Card>
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

RepCompras.propTypes = {
  token: PropTypes.shape({
    project: PropTypes.shape({
      idSucursal: PropTypes.string,
      nombre: PropTypes.string,
    }),
  }),
  moneda: PropTypes.shape({
    codiso: PropTypes.string,
  }),
  history: PropTypes.object,
  downloadFileAsync: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    moneda: state.predeterminado.moneda,
  };
};

const mapDispatchToProps = { downloadFileAsync };

const ConnectedRepCompras = connect(mapStateToProps, mapDispatchToProps)(RepCompras);

export default ConnectedRepCompras;