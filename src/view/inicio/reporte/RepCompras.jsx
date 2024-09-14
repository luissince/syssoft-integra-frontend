import React from 'react';
import PropTypes from 'prop-types';
import { ExternalLink } from 'lucide-react'
import { currentDate, isEmpty } from '../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../components/Container';
import CustomComponent from '../../../model/class/custom-component';
import { SpinnerView } from '../../../components/Spinner';
import Title from '../../../components/Title';
import Row from '../../../components/Row';
import Column from '../../../components/Column';
import { comboComprobante, comboSucursal, comboUsuario, obtenerReporteVentaExcel, obtenerReporteVentaPdf } from '../../../network/rest/principal.network';
import SuccessReponse from '../../../model/class/response';
import ErrorResponse from '../../../model/class/error-response';
import { CANCELED } from '../../../model/types/types';
import { VENTA } from '../../../model/types/tipo-comprobante';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../components/Table';
import { Card, CardBody, CardHeader, CardText, CardTitle } from '../../../components/Card';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import Button from '../../../components/Button';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class RepCompras extends CustomComponent {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      msgLoading: "Cargando información...",

      fechaInicial: currentDate(),
      fechaFinal: currentDate(),

      idComprobante: '',
      comprobantes: [],

      idUsuario: '',
      usuarios: [],

      idSucursal: this.props.token.project.idSucursal,
      sucursales: [],
    };

    this.refFechaInicial = React.createRef();
    this.refFechaFinal = React.createRef();
    this.refComprobante = React.createRef();
    this.refUsuario = React.createRef();
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
    const [comprobantes, sucursales, usuarios] = await Promise.all([
      this.fetchComboComprobante(VENTA),
      this.fetchComboSucursal(),
      this.fetchComboUsuario(),
    ]);

    this.setState({
      comprobantes,
      sucursales,
      usuarios,
      loading: false
    })
  }

  async fetchComboComprobante(tipo) {
    const params = {
      "tipo": tipo,
      "idSucursal": this.state.idSucursal
    };

    const response = await comboComprobante(
      params,
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

  async fetchComboUsuario() {
    const response = await comboUsuario(
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

  handleSelectComprobante = (event) => {
    this.setState({ idComprobante: event.target.value, });
  }

  handleSelectSucursal = (event) => {
    this.setState({ idSucursal: event.target.value, });
  }

  handleSelectUsuario = (event) => {
    this.setState({ idUsuario: event.target.value, });
  }

  handlePdf = async () => {

    window.open(obtenerReporteVentaPdf(
      this.props.token.project.idSucursal,
      this.state.fechaInicial,
      this.state.fechaFinal,
      isEmpty(this.state.idComprobante) ? "-" : this.state.idComprobante,
      isEmpty(this.state.idSucursal) ? "-" : this.state.idSucursal,
      isEmpty(this.state.idUsuario) ? "-" : this.state.idUsuario
    ), '_blank');
  }

  handleExcel = async () => {


    this.refUseFile.current.download({
      name: 'Reporte de Ventas',
      url: obtenerReporteVentaExcel(
        this.props.token.project.idSucursal,
        this.state.fechaInicial,
        this.state.fechaFinal,
        isEmpty(this.state.idComprobante) ? "-" : this.state.idComprobante,
        isEmpty(this.state.idSucursal) ? "-" : this.state.idSucursal,
        isEmpty(this.state.idUsuario) ? "-" : this.state.idUsuario
      ),
      filename: 'ReporteVentas.xlsx',
    });
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
          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Compras Totales</CardTitle>
                <CardText>$500,000.</CardText>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Al Contado</CardTitle>
                <CardText>$500,000.</CardText>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Al Crédito</CardTitle>
                <CardText>$500,000.</CardText>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Anuladas</CardTitle>
                <CardText>$500,000.</CardText>
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
                        <TableHead width="15%">Fecha</TableHead>
                        <TableHead width="10%">Proveedor</TableHead>
                        <TableHead width="10%">Comprobante</TableHead>
                        <TableHead width="10%">Tipo</TableHead>
                        <TableHead width="10%">Estado</TableHead>
                        <TableHead width="10%">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>1</TableCell>
                        <TableCell>10/10/2024 <br /> 10:10:10 pm </TableCell>
                        <TableCell>Cliente</TableCell>
                        <TableCell>
                          <Link
                            to={"#"}
                            className='btn-link'
                          >
                            B001-000001 <ExternalLink width={18} height={18} />
                          </Link>
                        </TableCell>
                        <TableCell><span className='text-success'>Contado</span></TableCell>
                        <TableCell><span className='badge badge-success'>Estado</span></TableCell>
                        <TableCell>10.00</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableResponsive>
              </CardBody>
            </Card>
          </Column>
        </Row>

        {/* <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title='Reporte General de Ventas'
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
                <label>Comprobante(s):</label>
                <div className="input-group">
                  <select
                    title="Lista de comprobantes"
                    className="form-control"
                    ref={this.refComprobante}
                    value={this.state.idComprobante}
                    onChange={this.handleSelectComprobante}>
                    <option value="">-- Todos --</option>
                    {
                      this.state.comprobantes.map((item, index) => (
                        <option key={index} value={item.idComprobante}>
                          {item.nombre + ' (' + item.serie + ')'}
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
            <Column className={"col-lg-6 col-md-6 col-sm-6 col-12"}>
              <div className="form-group">
                <label>Usuario(s):</label>
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
                onClick={this.handlePdf}
              >
                <i className="bi bi-file-earmark-pdf-fill"></i> Generar PDF
              </button>
              {" "}
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

RepCompras.propTypes = {
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

const ConnectedRepCompras = connect(mapStateToProps, null)(RepCompras);

export default ConnectedRepCompras;