import React from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { ArrowUpIcon, ExternalLink } from 'lucide-react'
import { currentDate, isEmpty } from '../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../components/Container';
import CustomComponent from '../../../model/class/custom-component';
import { comboSucursal, comboUsuario, obtenerReporteFinanzaExcel, obtenerReporteFinanzaPdf } from '../../../network/rest/principal.network';
import SuccessReponse from '../../../model/class/response';
import ErrorResponse from '../../../model/class/error-response';
import { CANCELED } from '../../../model/types/types';
import { SpinnerView } from '../../../components/Spinner';
import Title from '../../../components/Title';
import Row from '../../../components/Row';
import Column from '../../../components/Column';
import Select from '../../../components/Select';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../components/Table';
import { Card, CardBody, CardHeader, CardText, CardTitle } from '../../../components/Card';
import { Link } from 'react-router-dom';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class RepFinanciero extends CustomComponent {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      msgLoading: "Cargando información...",

      fechaInicial: currentDate(),
      fechaFinal: currentDate(),

      idUsuario: '',
      usuarios: [],

      idSucursal: this.props.token.project.idSucursal,
      sucursales: [],
    };

    this.refFechaInicio = React.createRef();
    this.refFechaFinal = React.createRef();

    this.refSucursal = React.createRef();
    this.refUsuario = React.createRef();
    this.refUseFile = React.createRef();

    this.abortControllerView = new AbortController();
  }

  async componentDidMount() {
    await this.loadingData();
  }

  componentWillUnmount() {
    this.abortControllerView.abort();
  }

  loadingData = async () => {
    const [sucursales, usuarios] = await Promise.all([
      this.fetchComboSucursal(),
      this.fetchComboUsuario(),
    ]);

    this.setState({
      sucursales,
      usuarios,
      loading: false,
    });
  }

  async fetchComboSucursal() {
    const response = await comboSucursal(
      this.abortControllerView.signal
    );

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchComboUsuario() {
    const response = await comboUsuario(
      this.abortControllerView.signal
    );

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  handleDateFechaInicial = (event) => {
    this.setState({ fechaInicial: event.target.value, });
  }


  handleDateFechaFinal = (event) => {
    this.setState({ fechaFinal: event.target.value })
  }

  handleSelectSucursal = (event) => {
    this.setState({
      idSucursal: event.target.value,
    });
  }

  handleSelectUsuario = (event) => {
    this.setState({
      idUsuario: event.target.value,
    });
  }

  handlePdf = async () => {
    window.open(obtenerReporteFinanzaPdf(
      this.props.token.project.idSucursal,
      this.state.fechaInicial,
      this.state.fechaFinal,
      isEmpty(this.state.idSucursal) ? "-" : this.state.idSucursal,
      isEmpty(this.state.idUsuario) ? "-" : this.state.idUsuario
    ), '_blank');
  }

  handleExcel = async () => {
    this.refUseFile.current.download({
      name: 'Reporte de Financiero',
      url: obtenerReporteFinanzaExcel(
        this.props.token.project.idSucursal,
        this.state.fechaInicial,
        this.state.fechaFinal,
        isEmpty(this.state.idSucursal) ? "-" : this.state.idSucursal,
        isEmpty(this.state.idUsuario) ? "-" : this.state.idUsuario
      ),
      filename: 'ReporteFinanciero.xlsx',
    });
  }

  render() {

    const flujoCaja = [
      { mes: 'Ene', ingresos: 450000, gastos: 320000 },
      { mes: 'Feb', ingresos: 480000, gastos: 340000 },
      { mes: 'Mar', ingresos: 520000, gastos: 360000 },
      { mes: 'Abr', ingresos: 490000, gastos: 345000 },
      { mes: 'May', ingresos: 500000, gastos: 350000 },
    ]

    const gastosPorCategoria = [
      { categoria: 'Personal', valor: 150000 },
      { categoria: 'Operaciones', valor: 100000 },
      { categoria: 'Marketing', valor: 50000 },
      { categoria: 'Administración', valor: 30000 },
      { categoria: 'Otros', valor: 20000 },
    ]

    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title='Reporte Financiero'
          subTitle='DASHBOARD'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-outline-warning">
              <i className="bi bi-file-earmark-pdf-fill"></i> Generar Pdf
            </Button>
            {" "}
            <Button
              className="btn-outline-success">
              <i className="bi bi-file-earmark-excel-fill"></i> Generar Excel
            </Button>
          </Column>
        </Row>

        <Row>
          <Column className="col-lg-3 col-md-3 col-sm-12 col-12" formGroup={true}>
            <Input
              label={"Fecha de Inicio:"}
              type="date"
            />
          </Column>

          <Column className="col-lg-3 col-md-3 col-sm-12 col-12" formGroup={true}>
            <Input
              label={"Fecha de Final:"}
              type="date"
            />
          </Column>

          <Column className="col-lg-3 col-md-3 col-sm-12 col-12" formGroup={true}>
            <Select
              label={"Sucursal:"}
            >
              <option value="">TODOS</option>
            </Select>
          </Column>

          <Column className="col-lg-3 col-md-3 col-sm-12 col-12" formGroup={true}>
            <Select
              label={"Usuario:"}
              value={this.state.estado}
              onChange={this.handleSelectEstado}
            >
              <option value='0'>TODOS</option>
              <option value='1'>COBRADO</option>
              <option value='2'>POR COBRAR</option>
              <option value='3'>ANULADO</option>
            </Select>
          </Column>
        </Row>


        <Row>
          <Column className='col-lg-4 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Ingresos</CardTitle>
                <CardText>$500,000.</CardText>
                <p className="text-sm">
                  <ArrowUpIcon className="text-green-500 mr-1" />
                  10% vs mes anterior
                </p>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-4 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Egresos</CardTitle>
                <CardText>$500,000.</CardText>
                <p className="text-sm">
                  <ArrowUpIcon className="text-green-500 mr-1" />
                  10% vs mes anterior
                </p>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-4 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Utilidad</CardTitle>
                <CardText>$500,000.</CardText>
                <p className="text-sm">
                  <ArrowUpIcon className="text-green-500 mr-1" />
                  10% vs mes anterior
                </p>
              </CardBody>
            </Card>
          </Column>
        </Row>

        <Row>
          <Column className='col-lg-4 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Ratio de Liquidez</CardTitle>
                <CardText>0.70</CardText>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-4 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Ratio Deudas/Capital</CardTitle>
                <CardText>0.70</CardText>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-4 col-md-4 col-12' formGroup={true}>
          </Column>
        </Row>

        <Row>
          <Column className='col-xl-6 col-lg-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Flujo de Caja</CardTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart width={300} height={300} data={flujoCaja}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="ingresos" stroke="#8884d8" />
                    <Line type="monotone" dataKey="gastos" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-xl-6 col-lg-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Gastos por Categoría</CardTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gastosPorCategoria}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="categoria" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="valor" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </Column>
        </Row>

        <Row>
          <Column>
            <Card>
              <CardHeader>
                <CardTitle>Lista de Transacciones</CardTitle>
              </CardHeader>
              <CardBody>
                <TableResponsive>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-secondary" width="5%">#</TableHead>
                        <TableHead className="text-secondary" width="10%">Estado</TableHead>
                        <TableHead className="text-secondary" width="15%">Fecha</TableHead>
                        <TableHead className="text-secondary" width="10%">Concepto</TableHead>
                        <TableHead className="text-secondary" width="10%">Referencia</TableHead>
                        <TableHead className="text-secondary" width="5%">Débito</TableHead>
                        <TableHead className="text-secondary" width="5%">Crédito</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>1</TableCell>
                        <TableCell><span className='badge badge-success'>Estado</span></TableCell>
                        <TableCell>10/10/2024</TableCell>
                        <TableCell>VENTA</TableCell>
                        <TableCell>
                          <Link
                            to={"#"}
                            className='btn-link'
                          >
                            B001-000001 <ExternalLink width={18} height={18} />
                          </Link>
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell>10.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>1</TableCell>
                        <TableCell><span className='badge badge-success'>Estado</span></TableCell>
                        <TableCell>10/10/2024</TableCell>
                        <TableCell>VENTA</TableCell>
                        <TableCell>
                          <Link
                            to={"#"}
                            className='btn-link'
                          >
                            B001-000001 <ExternalLink width={18} height={18} />
                          </Link>
                        </TableCell>
                        <TableCell>10.00</TableCell>
                        <TableCell></TableCell>                       
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableResponsive>
              </CardBody>
            </Card>
          </Column>
        </Row>

        {/* <div className='border rounded p-3'>
          <Row>
            <Column className={"col-lg-6 col-md-6 col-sm-6 col-12"}>
              <div className="form-group">
                <label>
                  Fecha Inicial: <i className="fa fa-asterisk text-danger small"></i>
                </label>
                <div className="input-group">
                  <input
                    type="date"
                    className="form-control"
                    ref={this.refFechaInicio}
                    value={this.state.fechaInicial}
                    onChange={this.handleDateFechaInicial}
                  />
                </div>
              </div>
            </Column>
          </Row>

          <Row>
            <Column className={"col-lg-6 col-md-6 col-sm-6 col-12"}>
              <div className="form-group">
                <label>
                  Fecha Final: <i className="fa fa-asterisk text-danger small"></i>
                </label>
                <div className="input-group">
                  <input
                    type="date"
                    className="form-control"
                    ref={this.refFechaFinal}
                    value={this.state.fechaFinal}
                    onChange={this.handleDateFechaFinal}
                  />
                </div>
              </div>
            </Column>
          </Row>

          <Row>
            <Column className={"col-lg-6 col-md-6 col-sm-6 col-12"}>
              <div className="form-group">
                <label>Sucursal</label>
                <div className="input-group">
                  <select
                    title="Lista de Sucursales"
                    className="form-control"
                    ref={this.refSucursal}
                    value={this.state.idSucursal}
                    onChange={this.handleSelectSucursal}>
                    <option value="">-- Todos --</option>
                    {
                      this.state.sucursales.map((item, index) => (
                        <option key={index} value={item.idSucursal}>
                          {index + 1 + '. ' + item.nombre}
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>
            </Column>
          </Row>

          <Row>
            <Column className={"col-lg-6 col-md-6 col-sm-6 col-12"}>
              <div className="form-group">
                <label>Usuario(s)</label>
                <div className="input-group">
                  <select
                    title="Lista de usuarios"
                    className="form-control"
                    ref={this.refUsuario}
                    value={this.state.idUsuario}
                    onChange={this.handleSelectUsuario}>
                    <option value="">-- Todos --</option>
                    {
                      this.state.usuarios.map((item, index) => (
                        <option key={index} value={item.idUsuario}>
                          {item.nombres + ' ' + item.apellidos}
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>
            </Column>
          </Row>

          <Row>
            <Column>
              <button
                className="btn btn-outline-warning"
                onClick={this.handlePdf}>
                <i className="bi bi-file-earmark-pdf-fill"></i> Generar Pdf
              </button>
              {" "}
              <button
                className="btn btn-outline-success"
                onClick={this.handleExcel}>
                <i className="bi bi-file-earmark-excel-fill"></i> Generar Excel
              </button>
            </Column>
          </Row>
        </div>

        <FileDownloader ref={this.refUseFile} /> */}
      </ContainerWrapper >
    );
  }
}

RepFinanciero.propTypes = {
  token: PropTypes.shape({
    project: PropTypes.shape({
      idSucursal: PropTypes.string,
    })
  }),
  history: PropTypes.object,
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedRepFinanciero = connect(mapStateToProps, null)(RepFinanciero);

export default ConnectedRepFinanciero;