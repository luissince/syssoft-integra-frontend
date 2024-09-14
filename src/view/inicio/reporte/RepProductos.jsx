import React from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Box, DollarSign, ShoppingBag, Tag } from 'lucide-react'
import { connect } from 'react-redux';
import ContainerWrapper from '../../../components/Container';
import { SpinnerView } from '../../../components/Spinner';
import Row from '../../../components/Row';
import Column from '../../../components/Column';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import { Card, CardBody, CardHeader, CardText, CardTitle } from '../../../components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../components/Table';
import Title from '../../../components/Title';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class RepProductos extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      idSucursal: this.props.token.project.idSucursal,
      nombreSucursal: this.props.token.project.nombre,

      producto: '',
      productoCheck: true,

      loading: true,
      msgLoading: '',

      porSucursal: '0',
      sucursalCkeck: true,
    };
    this.refUseFile = React.createRef();

    this.abortControllerView = new AbortController();
  }

  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve);
    });
  }

  componentDidMount() {
    this.loadData();
  }

  componentWillUnmount() {
    this.abortControllerView.abort();
  }

  loadData = async () => {
    try {
      await this.setStateAsync({
        loading: false,
      });
    } catch (error) {
      if (error.message !== 'canceled') {
        await this.setStateAsync({
          msgLoading: 'Se produjo un error interno, intente nuevamente.',
        });
      }
    }
  };

  async onEventImprimir() {
    // const data = {
    //   idSucursal: this.state.idSucursal,
    //   estadoProducto: this.state.producto === '' ? 0 : this.state.producto,
    //   idEmpresa: 'EM0001',
    // };

    // let ciphertext = CryptoJS.AES.encrypt(
    //   JSON.stringify(data),
    //   'key-report-inmobiliaria',
    // ).toString();
    // let params = new URLSearchParams({ params: ciphertext });
    // window.open('/api/producto/reptipoProductos?' + params, '_blank');

    //Despliegue
    // window.open("/api/producto/repproductodetalle?idProducto=" + this.state.idProducto + "&idEmpresa=EM0001", "_blank");

    //Desarrollo
    // try {

    //     let result = await axios.get("/api/producto/repproductodetalle", {
    //         responseType: "blob",
    //         params: {
    //             "idProducto": this.state.idProducto,
    //             "idEmpresa": 'EM0001'
    //         }
    //     });

    //     const file = new Blob([result.data], { type: "application/pdf" });
    //     const fileURL = URL.createObjectURL(file);
    //     window.open(fileURL, "_blank");

    // } catch (error) {
    //     console.log(error)
    // }
  }

  async onEventPdfProductoCobrar() {
    // const data = {
    //   idEmpresa: 'EM0001',
    //   idSucursal: this.state.idSucursal,
    //   nombreSucursal: this.state.nombreSucursal,
    //   porSucursal: this.state.porSucursal,
    // };
    // let ciphertext = CryptoJS.AES.encrypt(
    //   JSON.stringify(data),
    //   'key-report-inmobiliaria',
    // ).toString();
    // let params = new URLSearchParams({ params: ciphertext });
    // window.open('/api/producto/replistardeudasproducto?' + params, '_blank');
  }

  async onEventExcelProductoCobrar() {
    // const data = {
    //   idEmpresa: 'EM0001',
    //   idSucursal: this.state.idSucursal,
    //   nombreSucursal: this.state.nombreSucursal,
    //   porSucursal: this.state.porSucursal,
    // };
    // let ciphertext = CryptoJS.AES.encrypt(
    //   JSON.stringify(data),
    //   'key-report-inmobiliaria',
    // ).toString();

    // this.refUseFile.current.download({
    //   name: 'Listar de Productos con Deuda',
    //   file: '/api/producto/exacellistardeudasproducto',
    //   filename: 'Listar de Productos con Deuda.xlsx',
    //   params: ciphertext,
    // });
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
          title='Reporte Productos'
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
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-base m-0'>Total Productos</CardTitle>
                <Box className='text-secondary' />
              </CardHeader>
              <CardBody>
                <CardText>1,234</CardText>
                <p className="text-xs text-secondary">+20% desde el último mes</p>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-base m-0'>Valor de Inventario</CardTitle>
                <DollarSign className='text-secondary' />
              </CardHeader>
              <CardBody>
                <CardText>$123,456</CardText>
                <p className="text-xs text-secondary">+5% desde el último mes</p>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-base m-0'>Categorías</CardTitle>
                <Tag className='text-secondary' />
              </CardHeader>
              <CardBody>
                <CardText>24</CardText>
                <p className="text-xs text-secondary">2 nuevas categorías</p>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-base m-0'>Marcas</CardTitle>
                <ShoppingBag className='text-secondary' />
              </CardHeader>
              <CardBody>
                <CardText>56</CardText>
                <p className="text-xs text-secondary">3 nuevas marcas</p>
              </CardBody>
            </Card>
          </Column>
        </Row>

        <Row>
          <Column className='col-xl-6 col-lg-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Productos Más Vendidos</CardTitle>
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
                <CardTitle>Productos Recientes</CardTitle>
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
          <Column className='col-xl-6 col-lg-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Productos Con Rotación Baja</CardTitle>
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
                <CardTitle>Productos Sin Rotación</CardTitle>
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
              <CardHeader className="d-flex justify-content-between">
                <CardTitle>Inventario y Ventas</CardTitle>
                <CardText className="text-base text-secondary">Reporte actualizado al 11/9/2024</CardText>
              </CardHeader>
              <CardBody>
                <TableResponsive>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right text-secondary" width="5%">#</TableHead>
                        <TableHead className="text-right text-secondary" width="10%">Producto</TableHead>
                        <TableHead className="text-right text-secondary" width="15%">Unidaddes Compradas</TableHead>
                        <TableHead className="text-right text-secondary" width="10%">Unidades Vendidas</TableHead>
                        <TableHead className="text-right text-secondary" width="10%">Inventario Actual</TableHead>
                        <TableHead className="text-right text-secondary" width="5%">Ganacia por Unidad</TableHead>
                        <TableHead className="text-right text-secondary" width="5%">Ganacia Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-right">1</TableCell>
                        <TableCell className="text-right">Camiseta</TableCell>
                        <TableCell className="text-right">100</TableCell>
                        <TableCell className="text-right">75</TableCell>
                        <TableCell className="text-right">25</TableCell>
                        <TableCell className="text-right">$10.00</TableCell>
                        <TableCell className="text-right">$750.00</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableResponsive>
              </CardBody>
            </Card>
          </Column>
        </Row>

        {/* {this.state.loading && spinnerLoading(this.state.msgLoading)}

        <div className="card my-1">
          <h6 className="card-header">Reporte de Productos</h6>
          <div className="card-body">
            <div className="row">
              <div className="col">
                <div className="form-group">
                  <div className="input-group">
                    <select
                      title="Lista de productos"
                      className="form-control"
                      value={this.state.producto}
                      disabled={this.state.productoCheck}
                      onChange={async (event) => {
                        await this.setStateAsync({
                          producto: event.target.value,
                        });
                        if (this.state.producto === '') {
                          await this.setStateAsync({ productoCheck: true });
                        }
                      }}
                    >
                      <option value="">Todos los Productos</option>
                      <option value="1">PRODUCTOS DISPONIBLES</option>
                      <option value="2">PRODUCTOS RESERVADOS</option>
                      <option value="3">PRODUCTOS VENDIDOS</option>
                      <option value="4">PRODUCTOS INACTIVOS</option>
                    </select>

                    <div className="input-group-append">
                      <div className="input-group-text">
                        <div className="form-check form-check-inline m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={this.state.productoCheck}
                            onChange={async (event) => {
                              await this.setStateAsync({
                                productoCheck: event.target.checked,
                              });
                              if (this.state.productoCheck) {
                                await this.setStateAsync({ producto: '' });
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col text-center">
                <button
                  className="btn btn-outline-warning btn-sm"
                  onClick={() => this.onEventImprimir()}
                >
                  <i className="bi bi-file-earmark-pdf-fill"></i> Reporte Pdf
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card my-1">
          <h6 className="card-header">Reporte de Productos por Cobrar</h6>
          <div className="card-body">
            <div className="row">
              <div className="col">
                <div className="form-group">
                  <label>
                    Sucursal<i className="fa fa-asterisk text-danger small"></i>
                  </label>
                  <div className="input-group">
                    <select
                      title="Año"
                      className="form-control"
                      disabled={this.state.sucursalCkeck}
                      value={this.state.porSucursal}
                      onChange={(event) =>
                        this.setState({ porSucursal: event.target.value })
                      }
                    >
                      <option value={'0'}>{'Por sucursal'}</option>
                      <option value={'1'}>{'Todos'}</option>
                    </select>
                    <div className="input-group-append">
                      <div className="input-group-text">
                        <div className="form-check form-check-inline m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={this.state.sucursalCkeck}
                            onChange={async (event) =>
                              await this.setStateAsync({
                                sucursalCkeck: event.target.checked,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col"></div>
            </div>

            <div className="row">
              <div className="col"></div>
              <div className="col">
                <button
                  className="btn btn-outline-warning btn-sm"
                  onClick={() => this.onEventPdfProductoCobrar()}
                >
                  <i className="bi bi-file-earmark-pdf-fill"></i> Reporte Pdf
                </button>
              </div>
              <div className="col">
                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={() => this.onEventExcelProductoCobrar()}
                >
                  <i className="bi bi-file-earmark-excel-fill"></i> Reporte
                  Excel
                </button>
              </div>
              <div className="col"></div>
            </div>
          </div>
        </div>

        <FileDownloader ref={this.refUseFile} /> */}
      </ContainerWrapper>
    );
  }
}

RepProductos.propTypes = {
  token: PropTypes.shape({
    project: PropTypes.shape({
      idSucursal: PropTypes.string,
      nombre: PropTypes.string,
    })
  }),
  history: PropTypes.object,
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedRepProductos = connect(mapStateToProps, null)(RepProductos);

export default ConnectedRepProductos;