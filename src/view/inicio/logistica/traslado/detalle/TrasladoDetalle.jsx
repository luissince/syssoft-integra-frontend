import {
  formatTime,
  rounded,
  isText,
} from '../../../../../helper/utils.helper';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { detailTraslado, getPdfTraslado } from '../../../../../network/rest/principal.network';
import { CANCELED } from '../../../../../model/types/types';
import { connect } from 'react-redux';
import { SpinnerView } from '../../../../../components/Spinner';
import Title from '../../../../../components/Title';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableResponsive,
  TableBody,
  TableRow,
  TableTitle,
} from '../../../../../components/Table';
import { images } from '../../../../../helper';
import Image from '../../../../../components/Image';
import Button from '../../../../../components/Button';
import pdfVisualizer from 'pdf-visualizer';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class TrasladoDetalle extends CustomComponent {
  
  /**
   * Crea una nueva instancia del componente Venta.
   *
   * @param {Object} props - Propiedades recibidas del componente padre.
   */
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

      idTraslado: '',

      tipo: '',
      almacenOrigen: '',
      almacenDestino: '',
      sucursalDestino: '',
      estado: 0,
      fecha: '',
      hora: '',
      motivo: '',
      observacion: '',
      detalles: [],

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
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

  componentDidMount() {
    const url = this.props.location.search;
    const idTraslado = new URLSearchParams(url).get('idTraslado');
    if (isText(idTraslado)) {
      this.loadDataId(idTraslado);
    } else {
      this.props.history.goBack();
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

  async loadDataId(id) {
    const [traslado] = await Promise.all([this.fetchDetalleTraslado(id)]);

    this.setState({
      idTraslado: id,
      fecha: traslado.cabecera.fecha,
      hora: traslado.cabecera.hora,
      tipo: traslado.cabecera.tipo,
      motivo: traslado.cabecera.motivo,
      observacion: traslado.cabecera.observacion,
      almacenOrigen: traslado.cabecera.almacenOrigen,
      almacenDestino: traslado.cabecera.almacenDestino,
      sucursalDestino: traslado.cabecera.sucursalDestino,
      estado: traslado.cabecera.estado,

      detalles: traslado.detalles,
      loading: false,
    });
  }

  async fetchDetalleTraslado(id) {
    const params = {
      idTraslado: id,
    };

    const responde = await detailTraslado(
      params,
      this.abortControllerView.signal,
    );

    if (responde instanceof SuccessReponse) {
      return responde.data;
    }

    if (responde instanceof ErrorResponse) {
      if (responde.getType() === CANCELED) return;

      return null;
    }
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
  // Eventos para impresión
  //------------------------------------------------------------------------------------------

  /**
   * Función para imprimir el pdf
   * @param {string} size - Tamaño del pdf A4, 80mm, 58mm
   * @returns {Promise<void>}
   */
  handlePrintPdf = async (size) => {
    const url = getPdfTraslado(this.state.idTraslado, size);

    await pdfVisualizer.init({
      url: url,
      title: 'Traslado',
      titlePageNumber: 'Página',
      titleLoading: 'Cargando...',
    });
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
    const {
      tipo,
      motivo,
      almacenOrigen,
      almacenDestino,
      sucursalDestino,
      estado,
      fecha,
      hora,
      observacion,
    } = this.state;

    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title="Traslado"
          subTitle="DETALLE"
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-light"
              onClick={this.handlePrintPdf.bind(this, 'A4')}
            >
              <i className="fa fa-print"></i> A4
            </Button>{' '}
            <Button
              className="btn-light"
              onClick={this.handlePrintPdf.bind(this, '80mm')}
            >
              <i className="fa fa-print"></i> 80MM
            </Button>{' '}
            <Button
              className="btn-light"
              onClick={this.handlePrintPdf.bind(this, '58mm')}
            >
              <i className="fa fa-print"></i> 58MM
            </Button>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <TableResponsive>
              <Table width="100%">
                <TableHeader>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Fecha y Hora
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {fecha} - {formatTime(hora)}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Tipo de traslado
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {tipo}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Motivo
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {motivo}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Almacen de Origen
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {almacenOrigen}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Sucursal de Destino
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {sucursalDestino}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Almacen de Destino
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {almacenDestino}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Observación
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {observacion}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Estado
                    </TableHead>
                    <TableHead
                      className={`table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal ${
                        estado === 1 ? 'text-success' : 'text-danger'
                      }`}
                    >
                      {estado === 1 ? 'ACTIVO' : 'ANULADO'}
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
              <Table className="table table-light table-striped">
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Imagen</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Unidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {this.state.detalles.map((item, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell className="text-center">{item.id}</TableCell>
                        <TableCell className="text-center">
                          <Image
                            default={images.noImage}
                            src={item.imagen}
                            alt={item.producto}
                            width={100}
                          />
                        </TableCell>
                        <TableCell>
                          {item.codigo}
                          <br />
                          {item.producto}
                        </TableCell>
                        <TableCell>{item.categoria}</TableCell>
                        <TableCell>{rounded(item.cantidad)}</TableCell>
                        <TableCell>{item.unidad}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableResponsive>
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

/**
 *
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */
const ConnectedTrasladoDetalle = connect(
  mapStateToProps,
  null,
)(TrasladoDetalle);

export default ConnectedTrasladoDetalle;
