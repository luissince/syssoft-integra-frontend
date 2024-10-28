import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../components/Container';
import { SpinnerView } from '../../../components/Spinner';
import Row from '../../../components/Row';
import Column from '../../../components/Column';
import { Card, CardBody, CardHeader, CardText, CardTitle } from '../../../components/Card';
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../components/Table';
import Title from '../../../components/Title';
import { ArrowDownIcon, ArrowUpIcon, DollarSign, FileText, ShoppingCart, Store } from 'lucide-react';
import { dashboardInit } from '../../../network/rest/principal.network';
import { formatDecimal, isEmpty, numberFormat } from '../../../helper/utils.helper';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class Dashboard extends React.Component {

  /**
   * 
   * Constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      msgLoading: "Cargando información...",

      codIso: this.props.moneda.codiso ?? '',
      idSucursal: this.props.token.project.idSucursal,

      totalVentas: 0,
      totalCompras: 0,
      totalCuentasPorCobrar: 0,
      totalCuentasPorPagar: 0,
      totalComprobantes: 0,
      totalInventario: 0,
      totalSucursales: 0,
      inventarios: [],
    }
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
    const params = {
      idSucursal: this.state.idSucursal,
    }

    const responde = await dashboardInit(
      params,
      this.abortControllerView.signal,
    );

    this.setState(responde.data);
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
    if (isEmpty(this.state.inventarios)) {
      return (
        <TableRow>
          <TableCell className="text-center" colSpan="4">¡No hay datos para mostrar!</TableCell>
        </TableRow>
      );
    }

    let rows = [];

    const newRows = this.state.inventarios.map((item, index) => {   
      return (
        <TableRow key={index}>
          <TableCell>{item.id}</TableCell>
          <TableCell>{item.almacen}</TableCell>
          <TableCell>{item.sucursal}</TableCell>
          <TableCell>{formatDecimal(item.total)} </TableCell>
        </TableRow>
      );
    });

    rows.push(newRows);
    return rows;
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
                <CardTitle className='text-sm m-0'>Ventas Total de Hoy</CardTitle>
                <DollarSign width={20} height={20} />
              </CardHeader>
              <CardBody>
                <CardText>{numberFormat(this.state.totalVentas, this.state.codIso)}</CardText>
                <p className="text-xs text-secondary">+20.1% del mes anterior</p>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-sm m-0'>Compras Pendientes</CardTitle>
                <DollarSign width={20} height={20} />
              </CardHeader>
              <CardBody>
                <CardText>{numberFormat(this.state.totalCompras, this.state.codIso)}</CardText>
                <p className="text-xs text-secondary">+20.1% del mes anterior</p>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-sm m-0'>Cuentas por Cobrar</CardTitle>
                <ArrowDownIcon width={20} height={20} />
              </CardHeader>
              <CardBody>
                <CardText>{numberFormat(this.state.totalCuentasPorCobrar, this.state.codIso)}</CardText>
                <p className="text-xs text-secondary">+8.2% del mes anterior</p>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-sm m-0'>Cuentas por Pagar</CardTitle>
                <ArrowUpIcon width={20} height={20} />
              </CardHeader>
              <CardBody>
                <CardText>{numberFormat(this.state.totalCuentasPorPagar, this.state.codIso)}</CardText>
                <p className="text-xs text-secondary">+20.1% del mes anterior</p>
              </CardBody>
            </Card>
          </Column>
        </Row>

        <Row>
          <Column className='col-lg-4 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='m-0'>Comprobantes Electrónicos</CardTitle>

              </CardHeader>
              <CardBody>
                <div className='d-flex flex-row align-items-center justify-content-between'>
                  <p className='text-lg m-0'><FileText width={20} height={20} /> Emitodos hoy:</p>
                  <p className='text-lg m-0'>{this.state.totalComprobantes}</p>
                </div>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-4 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='m-0'>Productos sin Inventario</CardTitle>
                <ShoppingCart width={20} height={20} />
              </CardHeader>
              <CardBody>
                <div className='d-flex flex-row align-items-center justify-content-between'>
                  <p className='text-lg m-0'><FileText width={20} height={20} /> Cantidad:</p>
                  <p className='text-lg m-0'>{this.state.totalInventario}</p>
                </div>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-4 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='m-0'>Total de Sucursales</CardTitle>
                <Store width={20} height={20} />
              </CardHeader>
              <CardBody>
                <div className='d-flex flex-row align-items-center justify-content-between'>
                  <p className='text-lg m-0'><FileText width={20} height={20} /> Total:</p>
                  <p className='text-lg m-0'>{this.state.totalSucursales}</p>
                </div>
              </CardBody>
            </Card>
          </Column>
        </Row>

        <Row>
          <Column>
            <Card>
              <CardHeader>
                <CardTitle>Inventario con cantidades faltantes</CardTitle>
              </CardHeader>
              <CardBody>
                <TableResponsive>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead width="5%">#</TableHead>
                        <TableHead width="50%">Almacen</TableHead>
                        <TableHead width="30%">Sucursal</TableHead>
                        <TableHead width="20%">Cantidad</TableHead>
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

        {/* <Row>
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
        </Row> */}

        {/* <Row>
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
        </Row> */}

        {/* <Row>
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
        </Row> */}
      </ContainerWrapper>
    );
  }
}

Dashboard.propTypes = {
  token: PropTypes.shape({
    project: PropTypes.shape({
      idSucursal: PropTypes.string,
    })
  }),
  moneda: PropTypes.shape({
    codiso: PropTypes.string,
  }),
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    moneda: state.predeterminado.moneda,
  };
};

const ConnectedDashboard = connect(mapStateToProps, null)(Dashboard);

export default ConnectedDashboard;