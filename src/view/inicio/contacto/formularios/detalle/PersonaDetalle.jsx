import { connect } from 'react-redux';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import Title from '../../../../../components/Title';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import {
  Card,
  CardBody,
  CardHeader,
  CardText,
  CardTitle,
} from '../../../../../components/Card';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DollarSign,
  ExternalLink,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableResponsive,
  TableRow,
} from '../../../../../components/Table';
import {
  TabContent,
  TabHead,
  TabHeader,
  TabPane,
} from '../../../../../components/Tab';
import {
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import ErrorResponse from '../../../../../model/class/error-response';
import SuccessReponse from '../../../../../model/class/response';
import { CANCELED } from '../../../../../model/types/types';
import { alertKit } from 'alert-kit';
import {
  formatDecimal,
  formatNumberWithZeros,
  formatTime,
  getPathNavigation,
  isEmpty,
  isText,
  numberFormat,
} from '../../../../../helper/utils.helper';
import { detailPersona } from '../../../../../network/rest/principal.network';
import { SpinnerView } from '../../../../../components/Spinner';
import { Link } from 'react-router-dom';
import Button from '../../../../../components/Button';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class ClienteDetalle extends CustomComponent {
  
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',
      persona: null,
      listaVentas: [],
      sumaVentas: 0,
      sumaCompras: 0,
      sumaCuentasPorCobrar: 0,
      sumaCuentasPorPagar: 0,

      transacciones: [],
      paginacionTransaccion: 1,
      totalPaginacionTransaccion: 0,
      filasPorPaginaTransaccion: 5,

      ventas: [],
      paginacionVenta: 1,
      totalPaginacionVenta: 0,
      filasPorPaginaVenta: 5,

      codiso: this.props.predeterminado.moneda.codiso,
    };

    this.abortControllerView = new AbortController();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const idPersona = new URLSearchParams(url).get('idPersona');
    if (isText(idPersona)) {
      this.loadingData(idPersona);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortControllerView.abort();
  }

  loadingInit = async () => {
    if (this.state.loading) return;

    await this.setStateAsync({ paginacion: 1 });
    this.loadingData(0);
  };

  loadingData = async (idPersona) => {
    await this.setStateAsync({ loading: true });

    const body = {
      idPersona: idPersona,

      posicionPaginaTransaccion:
        (this.state.paginacionTransaccion - 1) *
        this.state.filasPorPaginaTransaccion,
      filasPorPaginaTransaccion: this.state.filasPorPaginaTransaccion,

      posicionPaginaVenta:
        (this.state.paginacionVenta - 1) * this.state.filasPorPaginaVenta,
      filasPorPaginaVenta: this.state.filasPorPaginaVenta,
    };

    const response = await detailPersona(body, this.abortControllerView.signal);

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      alertKit.warning(
        {
          headerTitle: 'SysSoft Integra',
          title: 'Persona',
          message: response.getMessage(),
        },
        () => {
          this.props.history.goBack();
        },
      );

      return;
    }

    response instanceof SuccessReponse;
    const result = response.data;

    this.setState({
      persona: result.persona,
      listaVentas:
        result.listaVentas.length > 0
          ? result.listaVentas.map((item) => {
              return {
                ...item,
                total: Number(formatDecimal(item.total)),
              };
            })
          : [],
      sumaVentas: result.sumaVentas,
      sumaCompras: result.sumaCompras,
      sumaCuentasPorCobrar: result.sumaCuentasPorCobrar,
      sumaCuentasPorPagar: result.sumaCuentasPorPagar,
      transacciones: result.transacciones,
      ventas: result.ventas,
      loading: false,
    });
  };

  renderTransacciones() {
    if (isEmpty(this.state.transacciones)) {
      return (
        <TableRow>
          <TableCell className="text-center" colSpan="7">
            ¡No hay datos para mostrar!
          </TableCell>
        </TableRow>
      );
    }

    let rows = [];

    const newRows = this.state.transacciones.map((item, index) => {
      const estado =
        item.estado === 1 ? (
          <span className="badge badge-success">ACTIVO</span>
        ) : (
          <span className="badge badge-danger">ANULADO</span>
        );

      return (
        <TableRow key={index}>
          <TableCell>{item.id}</TableCell>
          <TableCell>{estado}</TableCell>
          <TableCell>
            {item.fecha} <br /> {formatTime(item.hora)}
          </TableCell>
          <TableCell>{item.concepto}</TableCell>
          <TableCell>
            <Link
              to={getPathNavigation(item.tipo, item.idComprobante)}
              className="btn-link"
            >
              {item.comprobante}
              <br />
              {item.serie}-{formatNumberWithZeros(item.numeracion)}{' '}
              <ExternalLink width={18} height={18} />
            </Link>
          </TableCell>
          <TableCell className="text-right">
            {item.ingreso == 0 ? (
              ''
            ) : (
              <span>
                <i className="fa fa-plus text-success"></i>{' '}
                {numberFormat(item.ingreso, item.codiso)}
              </span>
            )}
          </TableCell>
          <TableCell className="text-right">
            {item.egreso == 0 ? (
              ''
            ) : (
              <span>
                <i className="fa fa-minus text-danger"></i>{' '}
                {numberFormat(item.egreso, item.codiso)}
              </span>
            )}
          </TableCell>
        </TableRow>
      );
    });

    rows.push(newRows);

    rows.push(
      <TableRow key={0}>
        <TableCell className="text-center" colSpan="7">
          <Button
            disabled={
              this.state.paginacionTransaccion ===
              this.state.totalPaginacionTransaccion
            }
            className="btn-outline-secondary"
            onClick={() => {}}
          >
            <i className="bi bi-chevron-double-down"></i> Mostrar Más
          </Button>
        </TableCell>
      </TableRow>,
    );

    return rows;
  }

  renderVentas() {
    if (isEmpty(this.state.ventas)) {
      return (
        <TableRow>
          <TableCell className="text-center" colSpan="7">
            ¡No hay datos para mostrar!
          </TableCell>
        </TableRow>
      );
    }

    let rows = [];

    const newRows = this.state.ventas.map((item, index) => {
      const estado =
        item.estado === 1 ? (
          <span className="badge badge-success">COBRADO</span>
        ) : item.estado === 2 ? (
          <span className="badge badge-warning">POR COBRAR</span>
        ) : (
          <span className="badge badge-danger">ANULADO</span>
        );

      return (
        <TableRow key={index}>
          <TableCell>{item.id}</TableCell>
          <TableCell>
            {item.fecha} <br /> {formatTime(item.hora)}{' '}
          </TableCell>
          <TableCell>
            <Link
              to={getPathNavigation('venta', item.idVenta)}
              className="btn-link"
            >
              {item.comprobante}
              <br />
              {item.serie}-{formatNumberWithZeros(item.numeracion)}{' '}
              <ExternalLink width={18} height={18} />
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
            disabled={
              this.state.paginacionVenta === this.state.totalPaginacionVenta
            }
            className="btn-outline-secondary"
            onClick={() => {}}
          >
            <i className="bi bi-chevron-double-down"></i> Mostrar Más
          </Button>
        </TableCell>
      </TableRow>,
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
          title="Persona"
          subTitle="DETALLE"
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column
            className="col-lg-3 col-md-12 col-sm-12 col-12"
            formGroup={true}
          >
            <Card>
              <CardHeader className="d-flex flex-row align-items-center justify-content-between">
                <CardTitle>Ventas</CardTitle>
                <DollarSign width={20} height={20} />
              </CardHeader>
              <CardBody>
                <CardText>
                  {numberFormat(this.state.sumaVentas, this.state.codiso)}
                </CardText>
              </CardBody>
            </Card>
          </Column>

          <Column
            className="col-lg-3 col-md-12 col-sm-12 col-12"
            formGroup={true}
          >
            <Card>
              <CardHeader className="d-flex flex-row align-items-center justify-content-between">
                <CardTitle>Compras</CardTitle>
                <DollarSign width={20} height={20} />
              </CardHeader>
              <CardBody>
                <CardText className={'text-primary'}>
                  {numberFormat(this.state.sumaCompras, this.state.codiso)}
                </CardText>
              </CardBody>
            </Card>
          </Column>

          <Column
            className="col-lg-3 col-md-12 col-sm-12 col-12"
            formGroup={true}
          >
            <Card>
              <CardHeader className="d-flex flex-row align-items-center justify-content-between">
                <CardTitle>Cuentas por Cobrar</CardTitle>
                <ArrowDownIcon width={20} height={20} />
              </CardHeader>
              <CardBody>
                <CardText className={'text-success'}>
                  {numberFormat(
                    this.state.sumaCuentasPorCobrar,
                    this.state.codiso,
                  )}
                </CardText>
              </CardBody>
            </Card>
          </Column>

          <Column
            className="col-lg-3 col-md-12 col-sm-12 col-12"
            formGroup={true}
          >
            <Card>
              <CardHeader className="d-flex flex-row align-items-center justify-content-between">
                <CardTitle>Cuentas por Pagar</CardTitle>
                <ArrowUpIcon width={20} height={20} />
              </CardHeader>
              <CardBody>
                <CardText className={'text-danger'}>
                  {numberFormat(
                    this.state.sumaCuentasPorPagar,
                    this.state.codiso,
                  )}
                </CardText>
              </CardBody>
            </Card>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6 col-12" formGroup={true}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className=" w-30 p-1 font-weight-normal ">
                    Tipo Documento:
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {(this.state.persona && this.state.persona.tipoDocumento) ||
                      '-'}
                  </TableHead>
                </TableRow>

                <TableRow>
                  <TableHead className=" w-30 p-1 font-weight-normal ">
                    N° de documento(
                    {(this.state.persona &&
                      this.state.persona.documento.length) ||
                      0}
                    ):
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {(this.state.persona && this.state.persona.documento) ||
                      '-'}
                  </TableHead>
                </TableRow>

                <TableRow>
                  <TableHead className=" w-30 p-1 font-weight-normal">
                    Razón social o nombre completo:
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {(this.state.persona && this.state.persona.informacion) ||
                      '-'}
                  </TableHead>
                </TableRow>

                {/*  */}
                <TableRow>
                  <TableHead className=" w-30 p-1 font-weight-normal">
                    Genero:
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {(this.state.persona && this.state.persona.genero) || '-'}
                  </TableHead>
                </TableRow>

                <TableRow>
                  <TableHead className=" w-30 p-1 font-weight-normal">
                    Estado Civil:
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {(this.state.persona && this.state.persona.estadoCivil) ||
                      '-'}
                  </TableHead>
                </TableRow>

                <TableRow>
                  <TableHead className=" w-30 p-1 font-weight-normal ">
                    Fecha de Nacimiento:
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {(this.state.persona &&
                      this.state.persona.fechaNacimiento) ||
                      '-'}
                  </TableHead>
                </TableRow>
                {/*  */}
              </TableHeader>
            </Table>
          </Column>

          <Column className="col-md-6 col-12" formGroup={true}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className=" w-30 p-1 font-weight-normal">
                    Roles:
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.persona && this.state.persona.cliente
                      ? 'CLIENTE, '
                      : ''}
                    {this.state.persona && this.state.persona.proveedor
                      ? 'PROVEEDOR, '
                      : ''}
                    {this.state.persona && this.state.persona.conductor
                      ? 'CONDUCTOR'
                      : ''}
                  </TableHead>
                </TableRow>

                <TableRow>
                  <TableHead className=" w-30 p-1 font-weight-normal ">
                    Observación:
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.persona && this.state.persona.observacion}
                  </TableHead>
                </TableRow>

                <TableRow>
                  <TableHead className=" w-30 p-1 font-weight-normal ">
                    N° de Celular:
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {(this.state.persona && this.state.persona.celular) || '-'}
                  </TableHead>
                </TableRow>

                <TableRow>
                  <TableHead className=" w-30 p-1 font-weight-normal ">
                    N° de Telefono:
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {(this.state.persona && this.state.persona.telefono) || '-'}
                  </TableHead>
                </TableRow>

                <TableRow>
                  <TableHead className=" w-30 p-1 font-weight-normal ">
                    E-Mail:
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {(this.state.persona && this.state.persona.email) || '-'}
                  </TableHead>
                </TableRow>

                <TableRow>
                  <TableHead className=" w-30 p-1 font-weight-normal ">
                    Dirección:
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {(this.state.direccion && this.state.persona.direccion) ||
                      '-'}
                  </TableHead>
                </TableRow>

                <TableRow>
                  <TableHead className=" w-30 p-1 font-weight-normal ">
                    Ubigeo
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {(this.state.persona &&
                      this.state.persona.ubigeo &&
                      `${this.state.persona.departamento} - 
                      ${this.state.persona.provincia} - 
                      ${this.state.persona.distrito}
                      (${this.state.persona.ubigeo})`) ||
                      '-'}
                  </TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Tendencia de Ventas</CardTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    width={300}
                    height={300}
                    data={this.state.listaVentas}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      name={`AÑO - ${new Date().getFullYear()}`}
                      dataKey="total"
                      stroke="#004099"
                    />
                    {/* <Line type="monotone" name='Años Pasado' dataKey="atras" stroke="#82ca9d" /> */}
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </Column>
        </Row>

        <Row>
          <Column>
            <TabHeader>
              <TabHead id="transacciones" isActive={true}>
                <i className="bi bi-receipt"></i> Transacciones
              </TabHead>

              <TabHead id="ventas">
                <i className="fa fa-shopping-cart"></i> Ventas
              </TabHead>

              <TabHead id="cotizaciones">
                <i className="bi bi-file-earmark-text"></i> Cotizaciones
              </TabHead>

              <TabHead id="pedidos">
                <i className="bi bi-file-earmark-text"></i> Pedidos
              </TabHead>

              <TabHead id="guia-remision">
                <i className="fa fa-truck"></i> Guía de Remisión
              </TabHead>

              {/* <TabHead id='notas-credito'>
                <i className="bi bi-receipt-cutoff"></i> Notas de Crédito
              </TabHead> */}

              <TabHead id="compras">
                <i className="fa fa-shopping-cart"></i> Compras
              </TabHead>

              <TabHead id="orden-compra">
                <i className="bi bi-file-earmark-text"></i> Orden de Compra
              </TabHead>
            </TabHeader>

            <TabContent>
              <TabPane id="transacciones" isActive={true}>
                <Row>
                  <Column>
                    <TableResponsive>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead width="5%">#</TableHead>
                            <TableHead width="10%">Estado</TableHead>
                            <TableHead width="15%">Fecha</TableHead>
                            <TableHead width="20%">Concepto</TableHead>
                            <TableHead width="15%">Referencia</TableHead>
                            <TableHead width="10%">Ingreso</TableHead>
                            <TableHead width="10%">Egreso</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>{this.renderTransacciones()}</TableBody>
                      </Table>
                    </TableResponsive>
                  </Column>
                </Row>
              </TabPane>

              <TabPane id="ventas">
                <TableResponsive>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead width="5%">#</TableHead>
                        <TableHead width="10%">Fecha</TableHead>
                        <TableHead width="20%">Comprobante</TableHead>
                        <TableHead width="10%">Tipo</TableHead>
                        <TableHead width="10%">Estado</TableHead>
                        <TableHead width="10%">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>{this.renderVentas()}</TableBody>
                  </Table>
                </TableResponsive>
              </TabPane>

              <TabPane id="cotizaciones">
                <Row>
                  <Column>
                    <TableResponsive>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead width="5%" className="text-center">
                              #
                            </TableHead>
                            <TableHead width="10%">Fecha</TableHead>
                            <TableHead width="15%">Comprobante</TableHead>
                            <TableHead width="10%" className="text-center">
                              Estado
                            </TableHead>
                            <TableHead width="10%" className="text-center">
                              Ligado
                            </TableHead>
                            <TableHead width="10%" className="text-center">
                              Total
                            </TableHead>
                            <TableHead width="5%" className="text-center">
                              Detalle
                            </TableHead>
                            <TableHead width="5%" className="text-center">
                              Editar
                            </TableHead>
                            <TableHead width="5%" className="text-center">
                              Anular
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody></TableBody>
                      </Table>
                    </TableResponsive>
                  </Column>
                </Row>
              </TabPane>

              <TabPane id="pedidos">
                <Row>
                  <Column>
                    <TableResponsive>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead width="5%" className="text-center">
                              #
                            </TableHead>
                            <TableHead width="10%">Fecha</TableHead>
                            <TableHead width="15%">Comprobante</TableHead>
                            <TableHead width="10%" className="text-center">
                              Estado
                            </TableHead>
                            <TableHead width="10%" className="text-center">
                              Ligado
                            </TableHead>
                            <TableHead width="10%" className="text-center">
                              Total
                            </TableHead>
                            <TableHead width="5%" className="text-center">
                              Detalle
                            </TableHead>
                            <TableHead width="5%" className="text-center">
                              Editar
                            </TableHead>
                            <TableHead width="5%" className="text-center">
                              Anular
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody></TableBody>
                      </Table>
                    </TableResponsive>
                  </Column>
                </Row>
              </TabPane>

              <TabPane id="guia-remision">
                <Row>
                  <Column>
                    <TableResponsive>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead width="5%" className="text-center">
                              #
                            </TableHead>
                            <TableHead width="10%">Fecha</TableHead>
                            <TableHead width="20%">Comprobante</TableHead>
                            <TableHead width="15%">referencia</TableHead>
                            <TableHead width="10%" className="text-center">
                              Estado
                            </TableHead>
                            <TableHead width="5%" className="text-center">
                              Mostrar
                            </TableHead>
                            <TableHead width="5%" className="text-center">
                              Editar
                            </TableHead>
                            <TableHead width="5%" className="text-center">
                              Anular
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody></TableBody>
                      </Table>
                    </TableResponsive>
                  </Column>
                </Row>
              </TabPane>

              {/* <TabPane id='notas-credito'>

              </TabPane> */}

              <TabPane id="compras">
                <Row>
                  <Column>
                    <TableResponsive>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead width="5%" className="text-center">
                              #
                            </TableHead>
                            <TableHead width="10%">Fecha</TableHead>
                            <TableHead width="15%">Comprobante</TableHead>
                            <TableHead width="10%">Tipo</TableHead>
                            <TableHead width="10%" className="text-center">
                              Estado
                            </TableHead>
                            <TableHead width="10%" className="text-center">
                              Total
                            </TableHead>
                            <TableHead width="5%" className="text-center">
                              Detalle
                            </TableHead>
                            <TableHead width="5%" className="text-center">
                              Anular
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody></TableBody>
                      </Table>
                    </TableResponsive>
                  </Column>
                </Row>
              </TabPane>

              <TabPane id="orden-compra">
                <Row>
                  <Column>
                    <TableResponsive>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead width="5%" className="text-center">
                              #
                            </TableHead>
                            <TableHead width="10%">Fecha</TableHead>
                            <TableHead width="15%">Comprobante</TableHead>
                            <TableHead width="10%" className="text-center">
                              Estado
                            </TableHead>
                            <TableHead width="10%" className="text-center">
                              Ligado
                            </TableHead>
                            <TableHead width="10%" className="text-center">
                              Total
                            </TableHead>
                            <TableHead width="5%" className="text-center">
                              Detalle
                            </TableHead>
                            <TableHead width="5%" className="text-center">
                              Editar
                            </TableHead>
                            <TableHead width="5%" className="text-center">
                              Anular
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody></TableBody>
                      </Table>
                    </TableResponsive>
                  </Column>
                </Row>
              </TabPane>
            </TabContent>
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    predeterminado: state.predeterminado,
  };
};

const ConnectedClienteDetalle = connect(mapStateToProps, null)(ClienteDetalle);

export default ConnectedClienteDetalle;
