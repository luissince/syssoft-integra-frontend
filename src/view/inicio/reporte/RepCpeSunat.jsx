import React from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { ArrowUpIcon, CircleArrowOutDownRight, CircleArrowOutUpLeft, ExternalLink, Percent } from 'lucide-react'
import { getFirstDayOfTheMonth, getLastDayOfTheMonth, isEmpty } from '../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../components/Container';
import CustomComponent from '../../../model/class/custom-component';
import { SpinnerView } from '../../../components/Spinner';
import Title from '../../../components/Title';
import Row from '../../../components/Row';
import Column from '../../../components/Column';
import { comboSucursal, obtenerReporteCpeSunatExcel } from '../../../network/rest/principal.network';
import SuccessReponse from '../../../model/class/response';
import ErrorResponse from '../../../model/class/error-response';
import { CANCELED } from '../../../model/types/types';
import { VENTA } from '../../../model/types/tipo-comprobante';
import { Link } from 'react-router-dom';
import { TableResponsive } from '../../../components/Table';
import { Card, CardBody, CardHeader, CardText, CardTitle } from '../../../components/Card';
import Select from '../../../components/Select';
import Input from '../../../components/Input';
import Button from '../../../components/Button';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class RepCpeSunat extends CustomComponent {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      msgLoading: "Cargando información...",

      fechaInicial: getFirstDayOfTheMonth(),
      fechaFinal: getLastDayOfTheMonth(),

      idSucursal: this.props.token.project.idSucursal,
      sucursales: [],
    };

    this.refFechaInicial = React.createRef();
    this.refFechaFinal = React.createRef();
    this.refComprobante = React.createRef();
    this.refIdSucursal = React.createRef();
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
    const [sucursales] = await Promise.all([
      this.fetchComboSucursal(VENTA)
    ]);

    this.setState({
      sucursales,
      loading: false
    })
  }

  async fetchComboSucursal() {
    const response = await comboSucursal(
      this.abortControllerView.signal,
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
    this.setState({ fechaInicial: event.target.value });
  }

  handleDateFechaFinal = (event) => {
    this.setState({ fechaFinal: event.target.value, });
  }

  handleSelectSucursal = (event) => {
    this.setState({ idSucursal: event.target.value, });
  }

  handleExcel = async () => {
    this.refUseFile.current.download({
      name: 'Reporte CPE Sunat',
      url: obtenerReporteCpeSunatExcel(
        this.props.token.project.idSucursal,
        this.state.fechaInicial,
        this.state.fechaFinal,
        isEmpty(this.state.idSucursal) ? "-" : this.state.idSucursal,
      ),
      filename: 'ReporteCPESunat ' + this.state.fechaInicial + ' al ' + this.state.fechaFinal + '.xlsx',
    });
  }

  render() {
    const gastosPorCategoria = [
      { categoria: 'Ventas', valor: 150000 },
      { categoria: 'Compras', valor: 100000 },
    ]

    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title='Reporte CPE Sunat'
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
          <Column className='col-lg-6 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-base m-0'>Total de Ventas</CardTitle>
                <CircleArrowOutUpLeft className='text-secondary' />
              </CardHeader>
              <CardBody>
                <CardText>S/. 100,000</CardText>
                <p className="text-sm">
                  <ArrowUpIcon className="text-green-500 mr-1" />
                  10% vs mes anterior
                </p>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-6 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-base m-0'>Total de Compras con Valor Fiscal</CardTitle>
                <CircleArrowOutDownRight className='text-secondary' />
              </CardHeader>
              <CardBody>
                <CardText>S/. 60,000</CardText>
                <p className="text-sm">
                  <ArrowUpIcon className="text-green-500 mr-1" />
                  10% vs mes anterior
                </p>
              </CardBody>
            </Card>
          </Column>
        </Row>

        <Row>
          <Column className='col-lg-6 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-base m-0'>IGV a Ventas</CardTitle>
                <Percent className='text-secondary' />
              </CardHeader>
              <CardBody>
                <CardText>$500,000.</CardText>
                <p className="text-sm">
                  <ArrowUpIcon className="text-green-500 mr-1" />
                  10% vs mes anterior
                </p>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-6 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-base m-0'>IGV a Compras</CardTitle>
                <Percent className='text-secondary' />
              </CardHeader>
              <CardBody>
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
          <Column formGroup={true}>
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

        {/* <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title='Reporte de Comprobantes Electrónicos'
          subTitle='FILTRAR'
        />

        <div className='border rounded p-3'>
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
                    ref={this.refFechaInicial}
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
                <label>Sucursal(s):</label>
                <div className="input-group">
                  <select
                    title="Lista de comprobantes"
                    className="form-control"
                    ref={this.refIdSucursal}
                    value={this.state.idSucursal}
                    onChange={this.handleSelectSucursal}>
                    <option value="">-- Todos --</option>
                    {
                      this.state.sucursales.map((item, index) => (
                        <option key={index} value={item.idSucursal}>
                          {index + 1 + '.- ' + item.nombre}
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
                className="btn btn-outline-success"
                onClick={this.handleExcel}
              >
                <i className="bi bi-file-earmark-excel-fill"></i> Generar Excel
              </button>
            </Column>
          </Row>
        </div>

        <FileDownloader ref={this.refUseFile} /> */}
      </ContainerWrapper>
    );
  }
}

RepCpeSunat.propTypes = {
  token: PropTypes.shape({
    project: PropTypes.shape({
      idSucursal: PropTypes.string,
      nombre: PropTypes.string,
    }),
  }),
  history: PropTypes.object,
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedRepCpeSunat = connect(mapStateToProps, null)(RepCpeSunat);

export default ConnectedRepCpeSunat;
