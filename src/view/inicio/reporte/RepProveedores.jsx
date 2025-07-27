import PropTypes from 'prop-types';
import {
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  ZAxis,
  Scatter,
} from 'recharts';
import { CreditCard, ShoppingCart, Truck } from 'lucide-react';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../components/Container';
import { SpinnerView } from '../../../components/Spinner';
import Title from '../../../components/Title';
import Row from '../../../components/Row';
import Button from '../../../components/Button';
import Column from '../../../components/Column';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardText,
  CardTitle,
} from '../../../components/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableResponsive,
  TableRow,
} from '../../../components/Table';
import CustomComponent from '../../../model/class/custom-component';
import pdfVisualizer from 'pdf-visualizer';
import {
  documentsExcelPersonaProveedor,
  documentsPdfReportsPersonaProveedor,
} from '../../../network/rest/principal.network';
import { guId } from '../../../helper/utils.helper';
import { downloadFileAsync } from '../../../redux/downloadSlice';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class RepProveedores extends CustomComponent {
  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      msgLoading: 'Cargando información...',
    };
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

  async componentDidMount() {}

  componentWillUnmount() {}

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
      url: documentsPdfReportsPersonaProveedor(),
      title: 'Reporte de Proveedores',
      titlePageNumber: 'Página',
      titleLoading: 'Cargando...',
    });
  };

  handleDownloadExcel = async () => {
    const id = guId();
    const url = documentsExcelPersonaProveedor();
    this.props.downloadFileAsync({ id, url });
  };

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
    const data = [
      {
        proveedor: 'Proveedor A',
        precio: 100,
        rotacion: 50,
        producto: 'Producto 1',
      },
      {
        proveedor: 'Proveedor B',
        precio: 120,
        rotacion: 30,
        producto: 'Producto 1',
      },
      {
        proveedor: 'Proveedor C',
        precio: 90,
        rotacion: 70,
        producto: 'Producto 1',
      },
      {
        proveedor: 'Proveedor A',
        precio: 200,
        rotacion: 20,
        producto: 'Producto 2',
      },
      {
        proveedor: 'Proveedor B',
        precio: 180,
        rotacion: 40,
        producto: 'Producto 2',
      },
      {
        proveedor: 'Proveedor C',
        precio: 220,
        rotacion: 10,
        producto: 'Producto 2',
      },
    ];

    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title="Reporte Cliente"
          subTitle="DASHBOARD"
          handleGoBack={() => this.props.history.goBack()}
        />

        {/* <Row>
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
        </Row> */}

        <Row>
          <Column
            className="col-lg-3 col-md-3 col-sm-12 col-12"
            formGroup={true}
          >
            <Input label={'Fecha de Inicio:'} type="date" />
          </Column>

          <Column
            className="col-lg-3 col-md-3 col-sm-12 col-12"
            formGroup={true}
          >
            <Input label={'Fecha de Final:'} type="date" />
          </Column>

          <Column
            className="col-lg-3 col-md-3 col-sm-12 col-12"
            formGroup={true}
          >
            <Select label={'Sucursal:'}>
              <option value="">TODOS</option>
            </Select>
          </Column>

          <Column
            className="col-lg-3 col-md-3 col-sm-12 col-12"
            formGroup={true}
          >
            <Select
              label={'Usuario:'}
              value={this.state.estado}
              onChange={this.handleSelectEstado}
            >
              <option value="0">TODOS</option>
              <option value="1">COBRADO</option>
              <option value="2">POR COBRAR</option>
              <option value="3">ANULADO</option>
            </Select>
          </Column>
        </Row>

        <Row>
          <Column
            className="col-lg-4 col-md-12 col-sm-12 col-12"
            formGroup={true}
          >
            <Card>
              <CardHeader className="d-flex flex-row align-items-center justify-content-between">
                <CardTitle className="text-base m-0">
                  Total Proveedores
                </CardTitle>
                <Truck className="text-secondary" />
              </CardHeader>
              <CardBody>
                <CardText>1,234</CardText>
                <p className="text-xs text-secondary">+3 desde el mes pasado</p>
              </CardBody>
            </Card>
          </Column>

          <Column
            className="col-lg-4 col-md-12 col-sm-12 col-12"
            formGroup={true}
          >
            <Card>
              <CardHeader className="d-flex flex-row align-items-center justify-content-between">
                <CardTitle className="text-base m-0">
                  Gastos en Proveedores
                </CardTitle>
                <ShoppingCart className="text-secondary" />
              </CardHeader>
              <CardBody>
                <CardText>$54,321</CardText>
                <p className="text-xs text-secondary">
                  -2.5% desde el mes pasado
                </p>
              </CardBody>
            </Card>
          </Column>

          <Column
            className="col-lg-4 col-md-12 col-sm-12 col-12"
            formGroup={true}
          >
            <Card>
              <CardHeader className="d-flex flex-row align-items-center justify-content-between">
                <CardTitle className="text-base m-0">
                  Proveedores por Pagar
                </CardTitle>
                <CreditCard className="text-secondary" />
              </CardHeader>
              <CardBody>
                <CardText>$8,765</CardText>
                <p className="text-xs text-secondary">
                  7 proveedores con pagos pendientes
                </p>
              </CardBody>
            </Card>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Card>
              <CardHeader>
                <CardTitle>
                  Comparación de Proveedores: Precio vs. Rotación de Productos
                </CardTitle>
                <CardDescription>
                  El tamaño de la burbuja representa la cantidad de producto
                  disponible
                </CardDescription>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <XAxis dataKey="precio" name="Precio" unit="$" />
                    <YAxis
                      dataKey="proveedor"
                      name="Proveedor"
                      type="category"
                    />
                    <ZAxis
                      dataKey="rotacion"
                      range={[100, 1000]}
                      name="Rotación"
                    />
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
                        <TableHead className="text-secondary" width="30%">
                          Nombre del Proveedor
                        </TableHead>
                        <TableHead className="text-secondary" width="30%">
                          Última Venta
                        </TableHead>
                        <TableHead className="text-secondary" width="35%">
                          Total de Ventas
                        </TableHead>
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
          <Column className="col-xl-6 col-lg-12" formGroup={true}>
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
                        <TableHead className="text-secondary" width="10%">
                          Proveedor
                        </TableHead>
                        <TableHead className="text-secondary" width="10%">
                          Producto
                        </TableHead>
                        <TableHead className="text-secondary" width="15%">
                          Cantidad
                        </TableHead>
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

          <Column className="col-xl-6 col-lg-12" formGroup={true}>
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Proveedores</CardTitle>
                <CardDescription>
                  Proveedores con mayor volumen de ventas
                </CardDescription>
              </CardHeader>
              <CardBody>
                <TableResponsive>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-secondary" width="10%">
                          Nombre
                        </TableHead>
                        <TableHead className="text-secondary" width="15%">
                          Ventas Totales
                        </TableHead>
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
  downloadFileAsync: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    moneda: state.predeterminado.moneda,
  };
};

const mapDispatchToProps = { downloadFileAsync };

const ConnectedRepProveedores = connect(
  mapStateToProps,
  mapDispatchToProps,
)(RepProveedores);

export default ConnectedRepProveedores;
