import PropTypes from 'prop-types';
import { CreditCard, DollarSign, Users } from 'lucide-react'
import { connect } from 'react-redux';
// import SearchBarClient from '../../../components/SearchBarClient';
import ContainerWrapper from '../../../components/Container';
import { SpinnerView } from '../../../components/Spinner';
import Title from '../../../components/Title';
import Row from '../../../components/Row';
import Button from '../../../components/Button';
import Column from '../../../components/Column';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import { Card, CardBody, CardDescription, CardHeader, CardText, CardTitle } from '../../../components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../components/Table';
import CustomComponent from '../../../model/class/custom-component';
import pdfVisualizer from 'pdf-visualizer';
import { documentsExcelPersonaCliente, documentsPdfReportsPersonaCliente } from '../../../network/rest/principal.network';
import { guId } from '../../../helper/utils.helper';
import { downloadFileAsync } from '../../../redux/downloadSlice';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class RepClientes extends CustomComponent {

  /**
   * 
   * Constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      msgLoading: "Cargando información...",

      idSucursal: this.props.token.project.idSucursal,
      nombreSucursal: this.props.token.project.nombre,
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

  async componentDidMount() {

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
      url: documentsPdfReportsPersonaCliente(),
      title: 'Reporte de Clientes',
      titlePageNumber: 'Página',
      titleLoading: 'Cargando...',
    });
  }

  handleDownloadExcel = async () => {
    const id = guId();
    const url = documentsExcelPersonaCliente();
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
          title='Reporte Cliente'
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
          <Column className='col-lg-4 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-base m-0'>Total Clientes</CardTitle>
                <Users className='text-secondary' />
              </CardHeader>
              <CardBody>
                <CardText>1,234</CardText>
                <p className="text-xs text-secondary">+20% desde el último mes</p>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-4 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-base m-0'>Ingresos Totales</CardTitle>
                <DollarSign className='text-secondary' />
              </CardHeader>
              <CardBody>
                <CardText>$54,321</CardText>
                <p className="text-xs text-secondary">+5.2% desde el mes pasado</p>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-4 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-base m-0'>Clientes por Cobrar</CardTitle>
                <CreditCard className='text-secondary' />
              </CardHeader>
              <CardBody>
                <CardText>$12,345</CardText>
                <p className="text-xs text-secondary">15 clientes con pagos pendientes</p>
              </CardBody>
            </Card>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Card>
              <CardHeader>
                <CardTitle>Cliente Inactivos</CardTitle>
              </CardHeader>
              <CardBody>
                <TableResponsive>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-secondary" width="30%">Nombre del Cliente</TableHead>
                        <TableHead className="text-secondary" width="30%">Última Compra</TableHead>
                        <TableHead className="text-secondary" width="35%">Total de Compras</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Cliente X</TableCell>
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
                <CardTitle>Productos Más Comprados por Cliente</CardTitle>
                <CardDescription>Top 5 productos más comprados</CardDescription>
              </CardHeader>
              <CardBody>
                <TableResponsive>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-secondary" width="10%">Cliente</TableHead>
                        <TableHead className="text-secondary" width="10%">Producto</TableHead>
                        <TableHead className="text-secondary" width="15%">Cantidad</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Cliente X</TableCell>
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
                <CardTitle>Top 5 Clientes</CardTitle>
                <CardDescription>Clientes con mayor volumen de compras</CardDescription>
              </CardHeader>
              <CardBody>
                <TableResponsive>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-secondary" width="10%">Nombre</TableHead>
                        <TableHead className="text-secondary" width="15%">Compras Totales</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Empresa A</TableCell>
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

RepClientes.propTypes = {
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

const ConnectedRepClientes = connect(mapStateToProps, mapDispatchToProps)(RepClientes);;

export default ConnectedRepClientes;