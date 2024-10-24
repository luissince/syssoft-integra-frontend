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
import CustomComponent from '../../../model/class/custom-component';
import pdfVisualizer from 'pdf-visualizer';
import { documentsExcelProducto, documentsPdfReportsProducto } from '../../../network/rest/principal.network';
import { guId } from '../../../helper/utils.helper';
import { downloadFileAsync } from '../../../redux/downloadSlice';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class RepProductos extends CustomComponent {

  /**
   * 
   * Constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      msgLoading: "Cargando información...",
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


  handleOpenPdf = async () => {
    await pdfVisualizer.init({
      url: documentsPdfReportsProducto(),
      title: 'Reporte de Productos',
      titlePageNumber: 'Página',
      titleLoading: 'Cargando...',
    });
  }

  handleDownloadExcel = async () => {
    const id = guId();
    const url = documentsExcelProducto();
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
            {" "}
            <Button
              className="btn-outline-light"
            >
              <i className="bi bi-arrow-clockwise"></i> Recargar Vista
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
  downloadFileAsync: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    moneda: state.predeterminado.moneda,
  };
};

const mapDispatchToProps = { downloadFileAsync };

const ConnectedRepProductos = connect(mapStateToProps, mapDispatchToProps)(RepProductos);

export default ConnectedRepProductos;