import React from 'react';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../components/Container';
import { SpinnerView } from '../../../components/Spinner';
import Row from '../../../components/Row';
import Column from '../../../components/Column';
import { Card, CardBody, CardHeader, CardText, CardTitle } from '../../../components/Card';
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Table, TableBody, TableCell, TableResponsive, TableRow } from '../../../components/Table';
import Title from '../../../components/Title';
import { FileText, Package, ShoppingCart, Store } from 'lucide-react';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      msgLoading: "Cargando información...",
    }

    this.abortControllerView = new AbortController();
  }

  async componentDidMount() { 

  }

  componentWillUnmount() {
    this.abortControllerView.abort();
  }

  render() {
    const ventasMensuales = [
      { mes: 'Ene', ventas: 45000, compras: 30000 },
      { mes: 'Feb', ventas: 52000, compras: 32000 },
      { mes: 'Mar', ventas: 49000, compras: 31000 },
      { mes: 'Abr', ventas: 58000, compras: 35000 },
    ];

    const inventarioPorSucursal = [
      { sucursal: 'Principal', stock: 1200 },
      { sucursal: 'Norte', stock: 850 },
      { sucursal: 'Sur', stock: 920 },
    ];

    const cuentasPorCobrar = [
      { estado: 'Al día', valor: 45000, color: '#22c55e' },
      { estado: '1-30 días', valor: 28000, color: '#eab308' },
      { estado: '31-60 días', valor: 15000, color: '#f97316' },
      { estado: '> 60 días', valor: 12000, color: '#dc2626' },
    ];

    const cuentasPorPagar = [
      { estado: 'Al día', valor: 38000, color: '#22c55e' },
      { estado: '1-30 días', valor: 22000, color: '#eab308' },
      { estado: '31-60 días', valor: 12000, color: '#f97316' },
      { estado: '> 60 días', valor: 8000, color: '#dc2626' },
    ];


    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title='DASHBOARD'
          subTitle='RESUMEN'
        />

        <Row>
          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='m-0'>Ventas Hoy</CardTitle>
                <ShoppingCart className='text-primary' width={40} height={40}  />
              </CardHeader>
              <CardBody>
                <CardText>1,234</CardText>
                <p className="text-xs text-secondary">+12.5%</p>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='m-0'>Facturas Pendientes</CardTitle>
                <FileText className='text-warning' width={40} height={40} />
              </CardHeader>
              <CardBody>
                <CardText>23</CardText>
                <p className="text-xs text-secondary">4 vencidas</p>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className=' m-0'>Productos Bajo Stock</CardTitle>
                <Package className='text-danger' width={40} height={40} />
              </CardHeader>
              <CardBody>
                <CardText>15</CardText>
                <p className="text-xs text-secondary">Requiere atencións</p>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='m-0'>Sucursales Activas</CardTitle>
                <Store className='text-success' width={40} height={40} />
              </CardHeader>
              <CardBody>
                <CardText>4</CardText>
                <p className="text-xs text-secondary">Todas operativas</p>
              </CardBody>
            </Card>
          </Column>
        </Row>

        <Row>
          <Column className='col-xl-6 col-lg-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Tendencia de Ventas</CardTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={ventasMensuales}>
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="ventas" stroke="#2563eb" strokeWidth={2} />
                    <Line type="monotone" dataKey="compras" stroke="#dc2626" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-xl-6 col-lg-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Ventas por Comprobante</CardTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={inventarioPorSucursal}>
                    <XAxis dataKey="sucursal" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="stock" fill="#3b82f6" />
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
                <CardTitle>Cuentas por Cobrar</CardTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={cuentasPorCobrar}
                      dataKey="valor"
                      nameKey="estado"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      label={({ name, value }) => `${name}: $${value}`}
                    >
                      {cuentasPorCobrar.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-xl-6 col-lg-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Ventas por Comprobante</CardTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={cuentasPorPagar}
                      dataKey="valor"
                      nameKey="estado"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      label={({ name, value }) => `${name}: $${value}`}
                    >
                      {cuentasPorPagar.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </Column>
        </Row>

        <Row>
          <Column className='col-xl-4 col-lg-12' formGroup={true}>
            <Card>
              <CardHeader>
                <CardTitle>Cotizaciones Pendientes</CardTitle>
              </CardHeader>
              <CardBody>
                <TableResponsive>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>COT-2024-001</TableCell>
                        <TableCell className={"text-primary"}>$12,450</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableResponsive>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-xl-4 col-lg-12' formGroup={true}>
            <Card>
              <CardHeader>
                <CardTitle>Pedidos en Proceso</CardTitle>
              </CardHeader>
              <CardBody>
                <TableResponsive>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>COT-2024-001</TableCell>
                        <TableCell className={"text-success"}>En preparación</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableResponsive>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-xl-4 col-lg-12' formGroup={true}>
            <Card>
              <CardHeader>
                <CardTitle>Últimas Facturas</CardTitle>
              </CardHeader>
              <CardBody>
                <TableResponsive>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>COT-2024-001</TableCell>
                        <TableCell className={"text-danger"}>Pagada</TableCell>
                      </TableRow>
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

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedDashboard = connect(mapStateToProps, null)(Dashboard);

export default ConnectedDashboard;