import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../components/Container';
import { SpinnerView } from '../../../components/Spinner';
import Row from '../../../components/Row';
import Column from '../../../components/Column';
import {
  Card,
  CardBody,
  CardHeader,
  CardText,
  CardTitle,
} from '../../../components/Card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableResponsive,
  TableRow,
} from '../../../components/Table';
import Title from '../../../components/Title';
import { ArrowDownIcon, ArrowUpIcon, DollarSign, FileText } from 'lucide-react';
import { dashboardInit } from '../../../network/rest/principal.network';
import {
  isEmpty,
  months,
  numberFormat,
  rounded,
} from '../../../helper/utils.helper';
import ErrorResponse from '../../../model/class/error-response';
import { CANCELED } from '../../../model/types/types';
import { OperationsSummary } from '@/components/ui/operations-summary';
import { OperationsFlow } from '@/components/ui/operations-flow';
import { AlertsPanel } from '@/components/ui/alerts-panel';
import { QuickActions } from '@/components/ui/quick-actions';
import { RecentActivity } from '@/components/ui/recent-activity';

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
      loading: true,
      msgLoading: 'Cargando información...',

      codIso: this.props.moneda.codiso ?? '',
      idSucursal: this.props.token.project.idSucursal,

      totalVentas: 0,
      totalCompras: 0,
      totalCuentasPorCobrar: 0,
      totalCuentasPorPagar: 0,
      totalComprobantes: 0,
      totalComprobantesPorDeclarar: 0,
      totalCotizaciones: 0,
      totalCotizacionesLigadas: 0,
      totalOrdenCompra: 0,
      totalOrdenCompraLigadas: 0,
      sucursales: [],

      totalSucursales: 0,
      inventarios: [],
    };
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
    };

    const responde = await dashboardInit(
      params,
      this.abortControllerView.signal,
    );

    if (responde instanceof ErrorResponse) {
      if (responde.getType() === CANCELED) return;

      this.setState({
        msgLoading: responde.getMessage(),
      });
      return;
    }

    this.setState(responde.data);
    this.setState({ loading: false });
  };

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
    if (isEmpty(this.state.sucursales)) {
      return (
        <TableRow>
          <TableCell className="text-center" colSpan="4">
            ¡No hay datos para mostrar!
          </TableCell>
        </TableRow>
      );
    }

    let rows = [];

    const newRows = this.state.sucursales.map((item, index) => {
      return (
        <TableRow key={index}>
          <TableCell>{item.id}</TableCell>
          <TableCell>{item.sucursal}</TableCell>
          <TableCell>{numberFormat(item.total, this.state.codIso)} </TableCell>
          <TableCell className={`text-center`}>
            {rounded(item.rendimiento, 0)} %
          </TableCell>
        </TableRow>
      );
    });

    rows.push(newRows);
    return rows;
  }

  render() {
    // const ventasMensuales = [
    //   { mes: 'Ene', ventas: 45000, compras: 30000 },
    //   { mes: 'Feb', ventas: 52000, compras: 32000 },
    //   { mes: 'Mar', ventas: 49000, compras: 31000 },
    //   { mes: 'Abr', ventas: 58000, compras: 35000 },
    // ];

    // const inventarioPorSucursal = [
    //   { sucursal: 'Principal', stock: 1200 },
    //   { sucursal: 'Norte', stock: 850 },
    //   { sucursal: 'Sur', stock: 920 },
    // ];

    // const cuentasPorCobrar = [
    //   { estado: 'Al día', valor: 45000, color: '#22c55e' },
    //   { estado: '1-30 días', valor: 28000, color: '#eab308' },
    //   { estado: '31-60 días', valor: 15000, color: '#f97316' },
    //   { estado: '> 60 días', valor: 12000, color: '#dc2626' },
    // ];

    // const cuentasPorPagar = [
    //   { estado: 'Al día', valor: 38000, color: '#22c55e' },
    //   { estado: '1-30 días', valor: 22000, color: '#eab308' },
    //   { estado: '31-60 días', valor: 12000, color: '#f97316' },
    //   { estado: '> 60 días', valor: 8000, color: '#dc2626' },
    // ];

    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <OperationsSummary />
          <OperationsFlow />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AlertsPanel />
            <QuickActions />
          </div>
          <RecentActivity />
        </div>

        {/* <Title
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
                <CardText className={"text-primary"}>{numberFormat(this.state.totalVentas, this.state.codIso)}</CardText>
                <p className="text-xs text-secondary">+20.1% del mes anterior</p>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-sm m-0'>Compras Total de Hoy</CardTitle>
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
                <CardText className={"text-success"}>{numberFormat(this.state.totalCuentasPorCobrar, this.state.codIso)}</CardText>
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
                <CardText className={"text-danger"}>{numberFormat(this.state.totalCuentasPorPagar, this.state.codIso)}</CardText>
                <p className="text-xs text-secondary">+20.1% del mes anterior</p>
              </CardBody>
            </Card>
          </Column>
        </Row>

        <Row>
          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='m-0'>Comprobantes CPE</CardTitle>

              </CardHeader>
              <CardBody>
                <div className='d-flex flex-row align-items-center justify-content-between'>
                  <div className='d-flex align-items-center'>
                    <FileText width={16} height={16} className='mr-2' /> <span className='text-base'> Emitidos:</span>
                  </div>
                  <span className='text-base'>{this.state.totalComprobantes}</span>
                </div>
                <div className='d-flex flex-row align-items-center justify-content-between'>
                  <div className='d-flex align-items-center'>
                    <FileText width={16} height={16} className='mr-2' /> <span className='text-base'> Pendientes:</span>
                  </div>
                  <span className='text-base'>{this.state.totalComprobantesPorDeclarar}</span>
                </div>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='m-0'>Cotizaciones</CardTitle>
              </CardHeader>
              <CardBody>
                <div className='d-flex flex-row align-items-center justify-content-between'>
                  <div className='d-flex align-items-center'>
                    <FileText width={16} height={16} className='mr-2' /> <span className='text-base'> Emitidos:</span>
                  </div>
                  <span className='text-base'>{this.state.totalCotizaciones}</span>
                </div>
                <div className='d-flex flex-row align-items-center justify-content-between'>
                  <div className='d-flex align-items-center'>
                    <FileText width={16} height={16} className='mr-2' /> <span className='text-base'> Pendientes:</span>
                  </div>
                  <span className='text-base'>{this.state.totalCotizaciones - this.state.totalCotizacionesLigadas}</span>
                </div>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='m-0'>Orden de Compras</CardTitle>
              </CardHeader>
              <CardBody>
                <div className='d-flex flex-row align-items-center justify-content-between'>
                  <div className='d-flex align-items-center'>
                    <FileText width={16} height={16} className='mr-2' /> <span className='text-base'> Emitidos:</span>
                  </div>
                  <span className='text-base'>{this.state.totalOrdenCompra}</span>
                </div>
                <div className='d-flex flex-row align-items-center justify-content-between'>
                  <div className='d-flex align-items-center'>
                    <FileText width={16} height={16} className='mr-2' /> <span className='text-base'> Pendientes:</span>
                  </div>
                  <span className='text-base'>{this.state.totalOrdenCompra - this.state.totalOrdenCompraLigadas}</span>
                </div>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='m-0'>Pedidos</CardTitle>

              </CardHeader>
              <CardBody>
                <div className='d-flex flex-row align-items-center justify-content-between'>
                  <div className='d-flex align-items-center'>
                    <FileText width={16} height={16} className='mr-2' /> <span className='text-base'> Emitidos:</span>
                  </div>
                  <span className='text-base'>{this.state.totalComprobantes}</span>
                </div>
                <div className='d-flex flex-row align-items-center justify-content-between'>
                  <div className='d-flex align-items-center'>
                    <FileText width={16} height={16} className='mr-2' /> <span className='text-base'> Pendientes:</span>
                  </div>
                  <span className='text-base'>{this.state.totalComprobantesPorDeclarar}</span>
                </div>
              </CardBody>
            </Card>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Tendencia de Ventas</CardTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart width={300} height={300} data={[]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" name={`AÑO - ${new Date().getFullYear()}`} dataKey="total" stroke="#004099" />
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </Column>
        </Row>

        <Row>
          <Column className='col-xl-6 col-lg-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Inventario Cantidades</CardTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={{}}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombre" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="negativo" label="Nevativo" name='Nevativo' fill="#004099" />
                    <Bar dataKey="por-terminar" label="Por Terminar" name='Por Terminar' fill="#004099" />
                    <Bar dataKey="exacta" label="Exacta" name='Exacta' fill="#004099" />
                    <Bar dataKey="superado" label="Superado" name='Superado' fill="#004099" />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-xl-6 col-lg-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Inventario a Vencer</CardTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombre" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="por-vencer" label="Por Vencer" name='Por Vencer' fill="#004099" />
                    <Bar dataKey="vencidos" label="Vencidos" name='Vencidos' fill="#004099" />
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
                <CardTitle>Rendimiento por Sucursal - Mes {months()[new Date().getMonth()].label}</CardTitle>
              </CardHeader>
              <CardBody>
                <TableResponsive>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead width="5%">#</TableHead>
                        <TableHead width="30%">Sucursal</TableHead>
                        <TableHead width="30%">Ventas</TableHead>
                        <TableHead width="15%" className="text-center">Rendimiento</TableHead>
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
        </Row> */}
      </ContainerWrapper>
    );
  }
}

Dashboard.propTypes = {
  token: PropTypes.shape({
    project: PropTypes.shape({
      idSucursal: PropTypes.string,
    }),
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
