import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import { alertWarning, formatTime, isText } from '../../../../../helper/utils.helper';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import { detailCatalogo, documentsPdfCatalogo } from '../../../../../network/rest/principal.network';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow, TableTitle } from '../../../../../components/Table';
import Title from '../../../../../components/Title';
import { SpinnerView } from '../../../../../components/Spinner';
import Button from '../../../../../components/Button';
import PropTypes from 'prop-types';
import pdfVisualizer from 'pdf-visualizer';
import Image from '../../../../../components/Image';
import { images } from '../../../../../helper';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class CatalogoDetalle extends CustomComponent {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

      idCatalogo: '',
      nombre: '',
      fechaHora: '',
      usuario: '',

      detalles: [],
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
    const url = this.props.location.search;
    const idCatalogo = new URLSearchParams(url).get('idCatalogo');

    if (isText(idCatalogo)) {
      this.loadingData(idCatalogo);
    } else {
      this.close();
    }
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

  async loadingData(id) {
    const response = await detailCatalogo(id, this.abortControllerView.signal);

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      alertWarning('Catálogo', response.getMessage(), () => {
        this.close();
      });
      return;
    }

    response instanceof SuccessReponse;
    const { cabecera, detalles } = response.data;

    const {
      nombre,
      fecha,
      hora,
      usuario,
    } = cabecera;

    this.setState({
      idCatalogo: id,
      nombre,
      fechaHora: fecha + " " + formatTime(hora),
      usuario,

      detalles: detalles,
      loading: false,
    });
  }

  close = () => {
    this.props.history.goBack();
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

  //------------------------------------------------------------------------------------------
  // Procesos impresión
  //------------------------------------------------------------------------------------------

  handlePrintA4 = async () => {
    await pdfVisualizer.init({
      url: documentsPdfCatalogo(this.state.idCatalogo),
      title: 'Catálogo',
      titlePageNumber: 'Página',
      titleLoading: 'Cargando...',
    });
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
          title='Catálogo'
          subTitle='DETALLE'
          handleGoBack={() => this.close()}
        />

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-light"
              onClick={this.handlePrintA4}
            >
              <i className="fa fa-print"></i> A4
            </Button>
          </Column>
        </Row>

        <Row>
          <Column className="col-lg-6 col-md-6 col-sm-12 col-12" formGroup={true}>
            <TableResponsive>
              <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Nombre:
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.nombre}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Fecha:
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.fechaHora}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Usuario:
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.usuario}
                    </TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </TableResponsive>
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive>
              <TableTitle>Detalles</TableTitle>
              <Table className="table-light table-striped">
                <TableHeader className="table-dark">
                  <TableRow>
                    <TableHead width="5%" className="text-center">#</TableHead>
                    <TableHead width="20%" className="text-center">Imagen</TableHead>
                    <TableHead width="50%">Producto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {
                    this.state.detalles.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-center">{item.id}</TableCell>
                        <TableCell className="text-center">
                          <Image
                            default={images.noImage}
                            src={item.imagen}
                            alt={item.nombre}
                            width={100}
                          />
                        </TableCell>
                        <TableCell>
                          {item.codigo}
                          <br />
                          {item.nombre}
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </TableResponsive>
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

CatalogoDetalle.propTypes = {
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    search: PropTypes.string
  }),
};

export default CatalogoDetalle;
