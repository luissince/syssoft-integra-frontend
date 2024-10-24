import PropTypes from 'prop-types';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, LabelList, Cell } from 'recharts'
import { connect } from 'react-redux';
import ContainerWrapper from '../../../components/Container';
import CustomComponent from '../../../model/class/custom-component';
import { SpinnerView } from '../../../components/Spinner';
import Title from '../../../components/Title';
import Row from '../../../components/Row';
import Column from '../../../components/Column';
import { Card, CardBody, CardTitle } from '../../../components/Card';
import Select from '../../../components/Select';
import Button from '../../../components/Button';
import pdfVisualizer from 'pdf-visualizer';
import { comboSucursal, dashboardSunat, documentsExcelCompra, documentsPdfReportsCompra } from '../../../network/rest/principal.network';
import { alertWarning, getCurrentMonth, getCurrentYear, guId, months, numberFormat, years } from '../../../helper/utils.helper';
import { downloadFileAsync } from '../../../redux/downloadSlice';
import ErrorResponse from '../../../model/class/error-response';
import { CANCELED } from '../../../model/types/types';
import SuccessReponse from '../../../model/class/response';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../components/Table';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class RepCpeSunat extends CustomComponent {

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

      month: getCurrentMonth(),
      months: months(),

      year: getCurrentYear(),
      years: years(),

      idSucursal: this.props.token.project.idSucursal,
      sucursales: [],

      ventas: [],
      ventasCompras: [],
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
    this.setState({
      loading: true,
      msgLoading: "Cargando información...",
    });

    const sucursalResponse = await comboSucursal(
      this.abortControllerView.signal,
    );

    if (sucursalResponse instanceof ErrorResponse) {
      if (sucursalResponse.getType() === CANCELED) return;

      alertWarning('Reporte Financiero', sucursalResponse.getMessage(), async () => {
        await this.loadingInit();
      });
      return;
    }

    await this.setStateAsync({
      sucursales: sucursalResponse.data,
    });
    await this.loadingData();
  }

  paginacionContext = async () => {
    if (this.state.paginacion === this.state.totalPaginacion) return;

    await this.setStateAsync({ paginacion: this.state.paginacion + 1 });
    await this.loadingData();
  }

  loadingData = async (borrarLista = false) => {
    await this.setStateAsync({
      loading: true,
      msgLoading: "Cargando información...",
      lista: borrarLista ? [] : this.state.lista,
      paginacion: borrarLista ? 1 : this.state.paginacion,
    });

    const params = {
      'month': this.state.month,
      'year': this.state.year,
      'idSucursal': this.state.idSucursal,
    }

    const dashboard = await dashboardSunat(params);

    if (dashboard instanceof ErrorResponse) {
      alertWarning('Reporte Financiero', dashboard.getMessage())
      return;
    }

    dashboard instanceof SuccessReponse;

    this.setState({
      ventas: dashboard.data.ventas,
      ventasCompras: dashboard.data.ventasCompras,
      loading: false
    });
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

  handleSelectMonth = (event) => {
    this.setState({ month: event.target.value, }, async () => {
      await this.loadingData(true);
    });
  }

  handleSelectYear = (event) => {
    this.setState({ year: event.target.value, }, async () => {
      await this.loadingData(true);
    });
  }

  handleSelectSucursal = (event) => {
    this.setState({ idSucursal: event.target.value, }, async () => {
      await this.loadingData(true);
    });
  }


  handleOpenPdf = async () => {
    await pdfVisualizer.init({
      url: documentsPdfReportsCompra(),
      title: 'Reporte de CpeSunat',
      titlePageNumber: 'Página',
      titleLoading: 'Cargando...',
    });
  }

  handleDownloadExcel = async () => {
    const id = guId();
    const url = documentsExcelCompra();
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
              onClick={this.loadingInit}>
              <i className="bi bi-arrow-clockwise"></i> Recargar Vista
            </Button>
          </Column>
        </Row>

        <Row>
          <Column className="col-lg-3 col-md-3 col-sm-12 col-12" formGroup={true}>
            <Select
              label={"Mes:"}
              value={this.state.month}
              onChange={this.handleSelectMonth}
            >
              {
                this.state.months.map((item, index) => (
                  <option key={index} value={item.value}>{item.label}</option>
                ))
              }
            </Select>
          </Column>

          <Column className="col-lg-3 col-md-3 col-sm-12 col-12" formGroup={true}>
            <Select
              label={"Año:"}
              value={this.state.year}
              onChange={this.handleSelectYear}
            >
              {
                this.state.years.map((item, index) => (
                  <option key={index} value={item.value}>{item.label}</option>
                ))
              }
            </Select>
          </Column>

          <Column className="col-lg-3 col-md-3 col-sm-12 col-12" formGroup={true}>
            <Select
              label={"Sucursal:"}
              value={this.state.idSucursal}
              onChange={this.handleSelectSucursal}
            >
              <option value="">TODOS</option>
              {
                this.state.sucursales.map((item, index) => (
                  <option key={index} value={item.idSucursal}>
                    {index + 1 + '.- ' + item.nombre}
                  </option>
                ))
              }
            </Select>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Variación de Ventas e Impuestos</CardTitle>

                <TableResponsive>
                  <Table className="border-collapse">
                    <TableHeader className="table-light">
                      <TableRow>
                        <TableHead className="border">Categoría</TableHead>
                        <TableHead className="border">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {this.state.ventas.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="p-2 border flex items-center">
                            <span className="px-2 py-1 mr-2" style={{ backgroundColor: item.color }}></span>
                            {item.nombre}
                          </TableCell>
                          <td className="p-2 border text-right">{numberFormat(item.total, this.state.codIso)}</td>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableResponsive>

                <ResponsiveContainer width="100%" height={400}>
                  <BarChart width={600} height={300} data={this.state.ventas} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                    <XAxis dataKey="nombre" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [numberFormat(value, this.state.codIso), 'Monto']}
                    />
                    <Legend />
                    <Bar dataKey="total" name="Monto">
                      {this.state.ventas.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </Column>
        </Row>

        <Row>
          <Column className='col-lg-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Ventas vs Compras</CardTitle>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    width={500}
                    height={300}
                    data={this.state.ventasCompras}
                    margin={{
                      top: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tipo" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [numberFormat(value, this.state.codIso), 'Monto']}
                    />
                    <Legend />
                    <Bar name="Total" dataKey="total" fill="#000000"  >
                      <LabelList
                        dataKey="total"
                        content={(props) => {
                          const { x, y, width, value } = props;
                          return (
                            <g>
                              <text x={x + width / 2} y={y - 5} fontSize={15} textAnchor="middle">
                                {numberFormat(value, this.state.codIso)}
                              </text>
                            </g>
                          );
                        }}
                      />
                      {this.state.ventasCompras.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </Column>
        </Row>
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
  moneda: PropTypes.shape({
    codiso: PropTypes.string,
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

const ConnectedRepCpeSunat = connect(mapStateToProps, mapDispatchToProps)(RepCpeSunat);

export default ConnectedRepCpeSunat;
