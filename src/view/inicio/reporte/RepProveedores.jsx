import React from 'react';
import PropTypes from 'prop-types';
import { XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ScatterChart, ZAxis, Scatter } from 'recharts'
import { CreditCard, ShoppingCart, Truck } from 'lucide-react'
import { connect } from 'react-redux';
import {
  currentDate,
  getCurrentYear,
} from '../../../helper/utils.helper';
// import SearchBarClient from '../../../components/SearchBarClient';
import ContainerWrapper from '../../../components/Container';
import { filtrarPersona } from '../../../network/rest/principal.network';
import SuccessReponse from '../../../model/class/response';
import ErrorResponse from '../../../model/class/error-response';
import { SpinnerView } from '../../../components/Spinner';
import Title from '../../../components/Title';
import Row from '../../../components/Row';
import Button from '../../../components/Button';
import Column from '../../../components/Column';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import { Card, CardBody, CardDescription, CardHeader, CardText, CardTitle } from '../../../components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../components/Table';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class RepProveedores extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      msgLoading: "Cargando información...",

      idSucursal: this.props.token.project.idSucursal,
      nombreSucursal: this.props.token.project.nombre,

      fechaIni: '',
      fechaFin: '',
      isFechaActive: false,

      idPersona: '',
      clientes: [],
      cliente: '',

      frecuenciaCheck: true,

      cada: 0,

      yearPago: getCurrentYear(),
      year: [
        2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011,
        2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2020, 2021, 2022,
        2023,
      ],
      yearCheck: true,

      porSucursal: '0',
      sucursalCkeck: true,
    };

    this.refFechaIni = React.createRef();
    this.refCliente = React.createRef();
    this.refUseFile = React.createRef();
    this.refFrecuencia = React.createRef();
    this.refYearPago = React.createRef();

    this.selectItem = false;
  }

  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve);
    });
  }

  componentDidMount() {
    this.loadData();
  }

  componentWillUnmount() { }

  loadData = async () => {
    await this.setStateAsync({
      // clientes: cliente.data,
      loading: false,
      // cambiar
      // fechaIni: '2022-07-19',
      fechaIni: currentDate(),
      fechaFin: currentDate(),
    });
  };

  onEventClearInput = async () => {
    await this.setStateAsync({ clientes: [], idPersona: '', cliente: '' });
    this.selectItem = false;
  };

  handleFilter = async (event) => {
    const searchWord = this.selectItem ? '' : event.target.value;
    await this.setStateAsync({
      idPersona: '',
      cliente: searchWord,
      idProducto: '',
      productos: [],
    });
    this.selectItem = false;
    if (searchWord.length === 0) {
      await this.setStateAsync({ clientes: [] });
      return;
    }

    if (this.state.filter) return;

    await this.setStateAsync({ filter: true });

    const params = {
      opcion: 1,
      filter: searchWord,
      cliente: true,
    };

    const response = await filtrarPersona(params);

    if (response instanceof SuccessReponse) {
      await this.setStateAsync({ filter: false, clientes: response.data });
    }

    if (response instanceof ErrorResponse) {
      await this.setStateAsync({ filter: false, clientes: [] });
    }
  };

  onEventSelectItem = async (value) => {
    await this.setStateAsync({
      cliente: value.documento + ' - ' + value.informacion,
      clientes: [],
      idPersona: value.idPersona,
    });
    this.selectItem = true;
  };

  async onEventRepCobro() {
    // if (this.state.fechaFin < this.state.fechaIni) {
    //   this.setState({
    //     messageWarning: 'La Fecha inicial no puede ser mayor a la fecha final.',
    //   });
    //   this.refFechaIni.current.focus();
    //   return;
    // }

    // const data = {
    //   idEmpresa: 'EM0001',
    //   fechaIni: this.state.fechaIni,
    //   fechaFin: this.state.fechaFin,
    //   idPersona: this.state.idPersona,
    //   cliente: this.state.cliente,
    // };

    // let ciphertext = CryptoJS.AES.encrypt(
    //   JSON.stringify(data),
    //   'key-report-inmobiliaria',
    // ).toString();
    // let params = new URLSearchParams({ params: ciphertext });
    // window.open('/api/cliente/repcliente?' + params, '_blank');
  }

  async onEventExcelCobro() {
    // if (this.state.fechaFin < this.state.fechaIni) {
    //   this.setState({
    //     messageWarning: 'La Fecha inicial no puede ser mayor a la fecha final.',
    //   });
    //   this.refFechaIni.current.focus();
    //   return;
    // }

    // const data = {
    //   idEmpresa: 'EM0001',
    //   fechaIni: this.state.fechaIni,
    //   fechaFin: this.state.fechaFin,
    //   idPersona: this.state.idPersona,
    //   cliente: this.state.cliente,
    // };

    // let ciphertext = CryptoJS.AES.encrypt(
    //   JSON.stringify(data),
    //   'key-report-inmobiliaria',
    // ).toString();

    // this.refUseFile.current.download({
    //   name: 'Reporte Cliente Aportaciones',
    //   file: '/api/cliente/excelcliente',
    //   filename: 'aportaciones.xlsx',
    //   params: ciphertext,
    // });
  }

  async onEventRepDeudas() {
    // if (!this.state.frecuenciaCheck && this.state.cada == 0) {
    //   this.setState({ messageWarning: 'Seleccione una frecuencia de pago' });
    //   this.refFrecuencia.current.focus();
    //   return;
    // }

    // const data = {
    //   idEmpresa: 'EM0001',
    //   idSucursal: this.state.idSucursal,
    //   nombreSucursal: this.state.nombreSucursal,
    //   seleccionado: this.state.frecuenciaCheck,
    //   frecuencia: this.state.cada,
    // };

    // let ciphertext = CryptoJS.AES.encrypt(
    //   JSON.stringify(data),
    //   'key-report-inmobiliaria',
    // ).toString();
    // let params = new URLSearchParams({ params: ciphertext });
    // window.open('/api/cliente/repdeudas?' + params, '_blank');
  }

  async onEventExcelDeudas() {
    // if (!this.state.frecuenciaCheck && this.state.cada == 0) {
    //   this.setState({ messageWarning: 'Seleccione una frecuencia de pago' });
    //   this.refFrecuencia.current.focus();
    //   return;
    // }

    // const data = {
    //   idEmpresa: 'EM0001',
    //   idSucursal: this.state.idSucursal,
    //   nombreSucursal: this.state.nombreSucursal,
    //   seleccionado: this.state.frecuenciaCheck,
    //   frecuencia: this.state.cada,
    // };

    // let ciphertext = CryptoJS.AES.encrypt(
    //   JSON.stringify(data),
    //   'key-report-inmobiliaria',
    // ).toString();

    // this.refUseFile.current.download({
    //   name: 'Reporte Deudas',
    //   file: '/api/cliente/exceldeudas',
    //   filename: 'Lista de Dudas por Cliente.xlsx',
    //   params: ciphertext,
    // });
  }

  async onEventPdfRegistro() {
    // const data = {
    //   idEmpresa: 'EM0001',
    //   idSucursal: this.state.idSucursal,
    //   nombreSucursal: this.state.nombreSucursal,
    //   yearPago: this.state.yearPago,
    //   porSucursal: this.state.porSucursal,
    // };
    // let ciphertext = CryptoJS.AES.encrypt(
    //   JSON.stringify(data),
    //   'key-report-inmobiliaria',
    // ).toString();
    // let params = new URLSearchParams({ params: ciphertext });
    // window.open('/api/cliente/replistarsociosporfecha?' + params, '_blank');
  }

  async onEventExcelRegistro() {
    // const data = {
    //   idEmpresa: 'EM0001',
    //   idSucursal: this.state.idSucursal,
    //   nombreSucursal: this.state.nombreSucursal,
    //   yearPago: this.state.yearPago,
    //   porSucursal: this.state.porSucursal,
    // };
    // let ciphertext = CryptoJS.AES.encrypt(
    //   JSON.stringify(data),
    //   'key-report-inmobiliaria',
    // ).toString();

    // this.refUseFile.current.download({
    //   name: 'Listar de Cliente Por Fecha',
    //   file: '/api/cliente/exacellistarsociosporfecha',
    //   filename: 'Listar de Cliente Por Fecha.xlsx',
    //   params: ciphertext,
    // });
  }

  render() {

    const data = [
      { proveedor: 'Proveedor A', precio: 100, rotacion: 50, producto: 'Producto 1' },
      { proveedor: 'Proveedor B', precio: 120, rotacion: 30, producto: 'Producto 1' },
      { proveedor: 'Proveedor C', precio: 90, rotacion: 70, producto: 'Producto 1' },
      { proveedor: 'Proveedor A', precio: 200, rotacion: 20, producto: 'Producto 2' },
      { proveedor: 'Proveedor B', precio: 180, rotacion: 40, producto: 'Producto 2' },
      { proveedor: 'Proveedor C', precio: 220, rotacion: 10, producto: 'Producto 2' },
    ];

    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title='Reporte Cliente'
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
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-base m-0'>Total Proveedores</CardTitle>
                <Truck className='text-secondary' />
              </CardHeader>
              <CardBody>
                <CardText>1,234</CardText>
                <p className="text-xs text-secondary">+3 desde el mes pasado</p>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-4 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-base m-0'>Gastos en Proveedores</CardTitle>
                <ShoppingCart className='text-secondary' />
              </CardHeader>
              <CardBody>
                <CardText>$54,321</CardText>
                <p className="text-xs text-secondary">-2.5% desde el mes pasado</p>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-4 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-base m-0'>Proveedores por Pagar</CardTitle>
                <CreditCard className='text-secondary' />
              </CardHeader>
              <CardBody>
                <CardText>$8,765</CardText>
                <p className="text-xs text-secondary">7 proveedores con pagos pendientes</p>
              </CardBody>
            </Card>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Card>
              <CardHeader>
                <CardTitle>Comparación de Proveedores: Precio vs. Rotación de Productos</CardTitle>
                <CardDescription>El tamaño de la burbuja representa la cantidad de producto disponible</CardDescription>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <XAxis dataKey="precio" name="Precio" unit="$" />
                    <YAxis dataKey="proveedor" name="Proveedor" type="category" />
                    <ZAxis dataKey="rotacion" range={[100, 1000]} name="Rotación" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Scatter name="Productos" data={data} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Card>
              <CardHeader>
                <CardTitle>Proveedores Inactivos</CardTitle>
              </CardHeader>
              <CardBody>
                <TableResponsive>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-secondary" width="30%">Nombre del Proveedor</TableHead>
                        <TableHead className="text-secondary" width="30%">Última Venta</TableHead>
                        <TableHead className="text-secondary" width="35%">Total de Ventas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Proveedor X</TableCell>
                        <TableCell>15/01/2023</TableCell>
                        <TableCell>$1,234</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableResponsive>
              </CardBody>
            </Card>
          </Column>
        </Row>

        <Row>
          <Column className='col-xl-6 col-lg-12' formGroup={true}>
            <Card>
              <CardHeader>
                <CardTitle>Productos Más Vendidos por Proveedor</CardTitle>
                <CardDescription>Top 5 productos más vendidos</CardDescription>
              </CardHeader>
              <CardBody>
                <TableResponsive>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-secondary" width="10%">Proveedor</TableHead>
                        <TableHead className="text-secondary" width="10%">Producto</TableHead>
                        <TableHead className="text-secondary" width="15%">Cantidad</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Proveedor X</TableCell>
                        <TableCell>Producto A</TableCell>
                        <TableCell>500</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableResponsive>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-xl-6 col-lg-12' formGroup={true}>
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Proveedores</CardTitle>
                <CardDescription>Proveedores con mayor volumen de ventas</CardDescription>
              </CardHeader>
              <CardBody>
                <TableResponsive>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-secondary" width="10%">Nombre</TableHead>
                        <TableHead className="text-secondary" width="15%">Ventas Totales</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Proveedor A</TableCell>
                        <TableCell>$10,234</TableCell>
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
          <h6 className="card-header">Reporte de Cliente(s)</h6>
          <div className="card-body">
            {this.state.messageWarning === '' ? null : (
              <div className="alert alert-warning" role="alert">
                <i className="bi bi-exclamation-diamond-fill"></i>{' '}
                {this.state.messageWarning}
              </div>
            )}
            <div className="row">
              <div className="col">
                <div className="form-group">
                  <label>Filtro por fechas</label>
                  <div className="custom-control custom-switch">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="customSwitch1"
                      checked={this.state.isFechaActive}
                      onChange={(event) => {
                        this.setState({
                          isFechaActive: event.target.checked,
                          fechaIni: currentDate(),
                          fechaFin: currentDate(),
                          messageWarning: '',
                        });
                      }}
                    ></input>
                    <label
                      className="custom-control-label"
                      htmlFor="customSwitch1"
                    >
                      {this.state.isFechaActive ? 'Activo' : 'Inactivo'}
                    </label>
                  </div>
                </div>
              </div>

              <div className="col">
                <div className="form-group">
                  <label>
                    Fecha inicial{' '}
                    <i className="fa fa-asterisk text-danger small"></i>
                  </label>
                  <div className="input-group">
                    <input
                      type="date"
                      className="form-control"
                      disabled={!this.state.isFechaActive}
                      ref={this.refFechaIni}
                      value={this.state.fechaIni}
                      onChange={(event) => {
                        if (event.target.value <= this.state.fechaFin) {
                          this.setState({
                            fechaIni: event.target.value,
                            messageWarning: '',
                          });
                        } else {
                          this.setState({
                            fechaIni: event.target.value,
                            messageWarning:
                              'La Fecha inicial no puede ser mayor a la fecha final.',
                          });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="col">
                <div className="form-group">
                  <label>
                    Fecha final{' '}
                    <i className="fa fa-asterisk text-danger small"></i>
                  </label>
                  <div className="input-group">
                    <input
                      type="date"
                      className="form-control"
                      disabled={!this.state.isFechaActive}
                      value={this.state.fechaFin}
                      onChange={(event) =>
                        this.setState({ fechaFin: event.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                <div className="form-group">
                  <label>Cliente(s)</label>
                  <SearchBarClient
                    desing={false}
                    placeholder="Filtrar clientes..."
                    refCliente={this.refCliente}
                    cliente={this.state.cliente}
                    clientes={this.state.clientes}
                    onEventClearInput={this.onEventClearInput}
                    handleFilter={this.handleFilter}
                    onEventSelectItem={this.onEventSelectItem}
                  />
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col"></div>
              <div className="col">
                <button
                  className="btn btn-outline-warning btn-sm"
                  onClick={() => this.onEventRepCobro()}
                >
                  <i className="bi bi-file-earmark-pdf-fill"></i> Reporte Pdf
                </button>
              </div>
              <div className="col">
                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={() => this.onEventExcelCobro()}
                >
                  <i className="bi bi-file-earmark-excel-fill"></i> Reporte
                  Excel
                </button>
              </div>
              <div className="col"></div>
            </div>
          </div>
        </div>

        <div className="card my-1">
          <h6 className="card-header">Lista de Deudas por Cliente</h6>
          <div className="card-body">
            <div className="row">
              <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                <div className="form-group">
                  <label>Seleccione segun frecuencia de pago</label>
                  <div className="input-group">
                    <select
                      title="frecuencia de deuda"
                      className="form-control"
                      ref={this.refFrecuencia}
                      value={this.state.cada}
                      disabled={this.state.frecuenciaCheck}
                      onChange={async (event) => {
                        await this.setStateAsync({ cada: event.target.value });
                        if (this.state.cada === 0) {
                          await this.setStateAsync({ frecuenciaCheck: true });
                        }
                      }}
                    >
                      <option value="0">- Seleccione</option>
                      <option value="15">Listar Ventas de cada 15</option>
                      <option value="30">Listar Ventas de cada 30</option>
                    </select>
                    <div className="input-group-append">
                      <div className="input-group-text">
                        <div className="form-check form-check-inline m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={this.state.frecuenciaCheck}
                            onChange={async (event) => {
                              await this.setStateAsync({
                                frecuenciaCheck: event.target.checked,
                              });
                              if (this.state.frecuenciaCheck) {
                                await this.setStateAsync({ cada: '' });
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col"></div>
              <div className="col">
                <button
                  className="btn btn-outline-warning btn-sm"
                  onClick={() => this.onEventRepDeudas()}
                >
                  <i className="bi bi-file-earmark-pdf-fill"></i> Reporte Pdf
                </button>
              </div>
              <div className="col">
                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={() => this.onEventExcelDeudas()}
                >
                  <i className="bi bi-file-earmark-excel-fill"></i> Reporte
                  Excel
                </button>
              </div>
              <div className="col"></div>
            </div>
          </div>
        </div>


        <div className="card my-1">
          <h6 className="card-header">
            Listar de Clientes Registrados por Fecha
          </h6>
          <div className="card-body">
            <div className="row">
              <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                <div className="form-group">
                  <label>
                    Año de inicio
                    <i className="fa fa-asterisk text-danger small"></i>
                  </label>
                  <div className="input-group">
                    <select
                      title="Año"
                      className="form-control"
                      disabled={this.state.yearCheck}
                      ref={this.refYearPago}
                      value={this.state.yearPago}
                      onChange={(event) =>
                        this.setState({ yearPago: event.target.value })
                      }
                    >
                      {this.state.year.map((item, index) => (
                        <option key={index} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <div className="input-group-append">
                      <div className="input-group-text">
                        <div className="form-check form-check-inline m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={this.state.yearCheck}
                            onChange={async (event) => {
                              await this.setStateAsync({
                                yearCheck: event.target.checked,
                              });
                              if (this.state.yearCheck) {
                                await this.setStateAsync({
                                  yearPago: getCurrentYear(),
                                });
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6 col-md-12 col-sm-12 col-12">
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
            </div>

            <div className="row mt-3">
              <div className="col"></div>
              <div className="col">
                <button
                  className="btn btn-outline-warning btn-sm"
                  onClick={() => this.onEventPdfRegistro()}
                >
                  <i className="bi bi-file-earmark-pdf-fill"></i> Reporte Pdf
                </button>
              </div>
              <div className="col">
                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={() => this.onEventExcelRegistro()}
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

RepProveedores.propTypes = {
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

const ConnectedRepProveedores = connect(mapStateToProps, null)(RepProveedores);;

export default ConnectedRepProveedores;