import React from 'react';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isEmpty,
  keyNumberFloat,
  rounded
} from '../../../../../helper/utils.helper';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import {
  comboAlmacen,
  comboMotivoAjuste,
  createAjuste,
  filtrarAlmacenProducto,
} from '../../../../../network/rest/principal.network';
import { CANCELED } from '../../../../../model/types/types';
import { connect } from 'react-redux';
import SearchInput from '../../../../../components/SearchInput';
import PropTypes from 'prop-types';
import { DECREMENTO, INCREMENTO } from '../../../../../model/types/forma-ajuste';
import { SpinnerView } from '../../../../../components/Spinner';
import Title from '../../../../../components/Title';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import Select from '../../../../../components/Select';
import Button from '../../../../../components/Button';
import Input from '../../../../../components/Input';
import RadioButton from '../../../../../components/RadioButton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow, TableTitle } from '../../../../../components/Table';
import Image from '../../../../../components/Image';
import { images } from '../../../../../helper';
import { SERVICIO } from '../../../../../model/types/tipo-producto';
import { imagen } from '../../../../../helper/images.helper';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class LogisticaAjusteCrear extends CustomComponent {

  /**
   * Inicializa un nuevo componente.
   * @param {Object} props - Las propiedades pasadas al componente.
   */
  constructor(props) {
    super(props);

    this.state = {
      initialLoad: true,
      initialMessage: 'Cargando datos...',

      paso: 1,

      producto: null,
      cantidad: 0,
      costo: 0,

      productos: [],

      idTipoAjuste: '',
      observacion: 'S/N',

      idMotivoAjuste: '',
      motivoAjuste: [],

      idAlmacen: '',
      almacenes: [],

      detalle: [],

      nombreMotivoAjuste: '',
      nombreAlmacen: '',

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.initial = { ...this.state }

    this.refIdTipoAjuste = React.createRef();
    this.refIdMotivoAjuste = React.createRef();
    this.refIdAlmacen = React.createRef();
    this.refProducto = React.createRef();
    this.refValueProducto = React.createRef();

    this.abortController = new AbortController();
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
    await this.loadingData();
  }

  componentWillUnmount() {
    this.abortController.abort();
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

  async loadingData() {
    const [almacenes, motivoAjuste] = await Promise.all([
      this.fetchComboAlmacen({ idSucursal: this.state.idSucursal }),
      this.fetchComboMotivoAjuste(),
    ]);

    await this.setStateAsync({
      almacenes,
      motivoAjuste,
      initialLoad: false,
    });
  }

  async fetchFiltrarProducto(params) {
    const response = await filtrarAlmacenProducto(params);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      return [];
    }
  }

  async fetchComboAlmacen(params) {
    const response = await comboAlmacen(params, this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchComboMotivoAjuste() {
    const response = await comboMotivoAjuste(this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  clearView() {
    this.setState(this.initial, async () => {
      await this.loadingData();
      this.refIdTipoAjuste.current.focus();
    });
  }

  agregarProducto(producto) {
    const exists = this.state.detalle.find((item) => item.idProducto === producto.idProducto);

    if (exists) {
      alertWarning('Ajuste', 'El producto ya existe en la lista.');
      return;
    }

    const data = {
      idProducto: producto.idProducto,
      codigo: producto.codigo,
      nombre: producto.nombre,
      imagen: producto.imagen,
      cantidad: 0,
      actual: producto.cantidad,
      unidad: producto.unidad,
    };

    this.setState((prevState) => ({
      detalle: [...prevState.detalle, data],
    }));
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
  // Filtrar producto
  //------------------------------------------------------------------------------------------

  handleClearInputProducto = () => {
    this.setState({
      productos: [],
      producto: null,
    });
  }

  handleFilterProducto = async (value) => {
    const searchWord = value;
    this.setState({ producto: null });

    if (isEmpty(searchWord)) {
      this.setState({ productos: [] });
      return;
    }

    const params = {
      idAlmacen: this.state.idAlmacen,
      filtrar: searchWord,
    };

    const productos = await this.fetchFiltrarProducto(params);

    // Filtrar productos por tipoProducto !== "SERVICIO"
    const filteredProductos = productos.filter((item) => item.idTipoProducto !== SERVICIO);

    this.setState({
      productos: filteredProductos,
    });
  }

  handleSelectItemProducto = (value) => {
    this.refProducto.current.initialize(value.nombre);
    this.setState({
      producto: value,
      productos: [],
    }, () => {
      this.agregarProducto(value);
    });
  }

  handleSelectMetodoAjuste = (event) => {
    this.setState({ idMotivoAjuste: event.target.value });
  };

  handleOptionTipoAjuste = (event) => {
    this.setState({ idTipoAjuste: event.target.value });
  }

  handleSelectAlmacen = (event) => {
    this.setState({ idAlmacen: event.target.value });
  }

  handleSiguiente = () => {
    if (isEmpty(this.state.idTipoAjuste)) {
      alertWarning('Ajuste', 'Seleccione el tipo de ajuste.', () => {
        this.refIdTipoAjuste.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idMotivoAjuste)) {
      alertWarning('Ajuste', 'Seleccione el motivo del ajuste.', () => {
        this.refIdMotivoAjuste.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idAlmacen)) {
      alertWarning('Ajuste', 'Seleccione el almacen.', () => {
        this.refIdAlmacen.current.focus();
      });
      return;
    }

    this.setState({
      nombreMotivoAjuste: this.refIdMotivoAjuste.current.options[this.refIdMotivoAjuste.current.selectedIndex].innerText,
      nombreAlmacen: this.refIdAlmacen.current.options[this.refIdAlmacen.current.selectedIndex].innerText,
      paso: 2,
    });
  }

  handleInputObservacion = (event) => {
    this.setState({
      observacion: event.target.value,
    });
  }

  handleRemoveDetalle = (idProducto) => {
    const detalle = this.state.detalle.filter(
      (item) => item.idProducto !== idProducto,
    );
    this.setState({ detalle });
  }

  handleInputDetalle = (event, idProducto) => {
    const { value } = event.target;
    this.setState((prevState) => ({
      detalle: prevState.detalle.map((item) =>
        item.idProducto === idProducto ? { ...item, cantidad: value } : item,
      ),
    }));
  }

  handleFocusInputTable = (event, isLastRow) => {
    if (event.key === 'Enter' && !isLastRow) {
      const nextInput = event.target.parentElement.parentElement.nextElementSibling.querySelector('input',);
      nextInput.focus();
      nextInput.select();
    }
    if (event.key === 'Enter' && isLastRow) {
      const firstInput = event.target.parentElement.parentElement.parentElement.querySelector('input',);
      firstInput.focus();
      firstInput.select();
    }
  }

  handleSave = () => {
    if (isEmpty(this.state.detalle)) {
      alertWarning('Ajuste', 'Agregue productos en la lista para continuar.', () => {
        this.refValueProducto.current.focus();
      });
      return;
    }

    alertDialog('Ajuste', '¿Está seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idTipoAjuste: this.state.idTipoAjuste,
          idMotivoAjuste: this.state.idMotivoAjuste,
          idAlmacen: this.state.idAlmacen,
          idSucursal: this.state.idSucursal,
          observacion: this.state.observacion,
          idUsuario: this.state.idUsuario,
          detalle: this.state.detalle,
        };

        alertInfo('Ajuste', 'Procesando petición...');

        const response = await createAjuste(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Ajuste', response.data, () => {
            this.clearView();
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertWarning('Ajuste', response.getMessage());
        }
      }
    });
  }

  handleBack = () => {
    this.setState({
      paso: 1,
      detalle: []
    })
  }

  handleClear = () => {
    alertDialog('Ajuste', '¿Está seguro de continuar, se va limpiar toda la información?', async (accept) => {
      if (accept) {
        this.clearView();
      }
    });
  }

  /*
    |--------------------------------------------------------------------------
    | Método de renderizado
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

  generateBody() {
    if (isEmpty(this.state.detalle)) {
      return (
        <TableRow>
          <TableCell className="text-center" colSpan="7">
            ¡No hay datos para mostrar!
          </TableCell>
        </TableRow>
      );
    }

    return this.state.detalle.map((item, index) => {
      const isLastRow = index === this.state.detalle.length - 1;

      let diferencia = 0;

      if (this.state.idTipoAjuste === INCREMENTO) {
        diferencia = item.actual + parseFloat(item.cantidad);
      } else {
        diferencia = item.actual - parseFloat(item.cantidad);
      }

      return (
        <TableRow key={index}>
          <TableCell>
            <Button
              className="btn-outline-danger btn-sm"
              title="Anular"
              onClick={() => this.handleRemoveDetalle(item.idProducto)}
            >
              <i className="bi bi-trash"></i>
            </Button>
          </TableCell>
          <TableCell className="text-center">
            <Image
              default={images.noImage}
              src={item.imagen}
              alt={item.nombre}
              width={70}
            />
          </TableCell>
          <TableCell>
            {item.codigo}
            <br />
            {item.nombre}
          </TableCell>
          <TableCell>
            <Input
              value={item.cantidad}
              onChange={(event) =>
                this.handleInputDetalle(event, item.idProducto)
              }
              onKeyDown={keyNumberFloat}
              onKeyUp={(event) => this.handleFocusInputTable(event, isLastRow)}
            />
          </TableCell>
          <TableCell>{rounded(item.actual)}</TableCell>
          <TableCell>{rounded(diferencia)}</TableCell>
          <TableCell>{item.unidad}</TableCell>
        </TableRow>
      );
    });
  }

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.initialLoad}
          message={this.state.initialMessage}
        />

        <Title
          title="Ajuste de inventario"
          subTitle="CREAR"
          handleGoBack={() => this.props.history.goBack()}
        />

        {/* Primero paso */}
        {this.state.paso === 1 && (
          <>
            <Row>
              <Column>
                <div className="form-group">
                  <p>
                    <i className="bi bi-card-list"></i> Defína alguna opciones antes de continuar.
                  </p>
                </div>
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <label>Seleccione el tipo de ajuste:</label>

                <RadioButton
                  ref={this.refIdTipoAjuste}
                  name="ckTipoAjuste"
                  id={INCREMENTO}
                  value={INCREMENTO}
                  checked={this.state.idTipoAjuste === INCREMENTO}
                  onChange={this.handleOptionTipoAjuste}
                >
                  <i className="bi bi-plus-circle-fill text-success"></i> Incremento
                </RadioButton>

                <RadioButton
                  name="ckTipoAjuste"
                  id={DECREMENTO}
                  value={DECREMENTO}
                  checked={this.state.idTipoAjuste === DECREMENTO}
                  onChange={this.handleOptionTipoAjuste}
                >
                  <i className="bi bi-dash-circle-fill text-danger"></i> Decremento
                </RadioButton>
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <Select
                  label={"Seleccione el motivo del ajuste:"}
                  ref={this.refIdMotivoAjuste}
                  value={this.state.idMotivoAjuste}
                  onChange={this.handleSelectMetodoAjuste}
                >
                  <option value="">-- Motivo Ajuste --</option>
                  {this.state.motivoAjuste.map((item, index) => {
                    return (
                      <option key={index} value={item.idMotivoAjuste}>
                        {item.nombre}
                      </option>
                    );
                  })}
                </Select>
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <Select
                  label={"Seleccione el almacen:"}
                  ref={this.refIdAlmacen}
                  value={this.state.idAlmacen}
                  onChange={this.handleSelectAlmacen}
                >
                  <option value="">-- Almacen --</option>
                  {this.state.almacenes.map((item, index) => {
                    return (
                      <option key={index} value={item.idAlmacen}>
                        {item.nombre}
                      </option>
                    );
                  })}
                </Select>
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <Button
                  className="btn-primary"
                  onClick={this.handleSiguiente}
                >
                  <i className="fa fa-arrow-right"></i> Siguiente
                </Button>{' '}
                <Button
                  className="btn-outline-danger"
                  onClick={() => this.props.history.goBack()}
                >
                  <i className="fa fa-close"></i> Cancelar
                </Button>
              </Column>
            </Row>
          </>
        )}

        {/* Segundo paso */}
        {this.state.paso === 2 && (
          <>
            <Row>
              <Column formGroup={true}>
                <TableResponsive>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="table-secondary w-20 p-1 font-weight-normal ">
                          Tipo de Ajuste:
                        </TableHead>
                        <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                          {this.state.idTipoAjuste === INCREMENTO ? (
                            <span>
                              <i className="bi bi-plus-circle-fill text-success"></i>{' '}
                              Incremento
                            </span>
                          ) : (
                            <span>
                              {' '}
                              <i className="bi bi-dash-circle-fill text-danger"></i>{' '}
                              Decremento
                            </span>
                          )}
                        </TableHead>
                      </TableRow>
                      <TableRow>
                        <TableHead className="table-secondary w-20 p-1 font-weight-normal ">
                          Motivo de Ajuste:
                        </TableHead>
                        <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                          {this.state.nombreMotivoAjuste}
                        </TableHead>
                      </TableRow>
                      <TableRow>
                        <TableHead className="table-secondary w-20 p-1 font-weight-normal ">
                          Almacen:
                        </TableHead>
                        <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                          {this.state.nombreAlmacen}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>
                </TableResponsive>
              </Column>
            </Row>

            <Row>
              <Column>
                <SearchInput
                  ref={this.refProducto}
                  autoFocus={true}
                  label={"Filtrar por el código o nombre del producto:"}
                  placeholder="Filtrar productos..."
                  refValue={this.refValueProducto}
                  data={this.state.productos}
                  handleClearInput={this.handleClearInputProducto}
                  handleFilter={this.handleFilterProducto}
                  handleSelectItem={this.handleSelectItemProducto}
                  // renderItem={(value) => (
                  //   <>
                  //     {value.codigo} / {value.nombre}  <small>({value.categoria})</small>
                  //   </>
                  // )}

                  renderItem={(value) =>
                    <div className="d-flex align-items-center">
                      <Image
                        default={images.noImage}
                        src={value.imagen}
                        alt={value.nombre}
                        width={60}
                      />

                      <div className='ml-2'>
                        {value.codigo}
                        <br />
                        {value.nombre} <small>({value.categoria})</small>
                      </div>
                    </div>}
                  renderIconLeft={<i className="bi bi-cart4"></i>}
                />
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <Input
                  label={" Ingrese alguna descripción para saber el motivo del ajuste:"}
                  placeholder="Ingrese una observación"
                  value={this.state.observacion}
                  onChange={this.handleInputObservacion}
                />
              </Column>
            </Row>

            <Row>
              <Column>
                <TableResponsive>
                  <TableTitle>Lista de productos:</TableTitle>
                  <Table className="table-striped table-bordered rounded">
                    <TableHeader>
                      <TableRow>
                        <TableHead width="5%">Quitar</TableHead>
                        <TableHead width="10%">Imagen</TableHead>
                        <TableHead width="30%">Clave/Nombre</TableHead>
                        <TableHead width="15%">Nueva Existencia</TableHead>
                        <TableHead width="15%">Existencia Actual</TableHead>
                        <TableHead width="15%">Diferencia</TableHead>
                        <TableHead width="15%">Medida</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {this.generateBody()}
                    </TableBody>
                  </Table>
                </TableResponsive>
              </Column>
            </Row>

            <Row>
              <Column>
                <Button
                  className="btn-success"
                  onClick={this.handleSave}>
                  <i className="fa fa-save"></i> Guardar
                </Button>
                {' '}
                <Button
                  className="btn-outline-warning"
                  onClick={this.handleBack}>
                  <i className="fa fa-arrow-left"></i> Atras
                </Button>
                {' '}
                <Button
                  className="btn-outline-info"
                  onClick={this.handleClear}>
                  <i className="fa fa-trash"></i> Limpiar
                </Button>
                {' '}
                <Button
                  className="btn-outline-danger"
                  onClick={() => this.props.history.goBack()}>
                  <i className="fa fa-close"></i> Cancelar
                </Button>
              </Column>
            </Row>
          </>
        )}
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

LogisticaAjusteCrear.propTypes = {
  history: PropTypes.shape({
    goBack: PropTypes.func
  }),
  token: PropTypes.shape({
    project: PropTypes.shape({
      idSucursal: PropTypes.string
    }),
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string
    }),
  })
}

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */

const ConnectedAjusteCrear = connect(mapStateToProps, null)(LogisticaAjusteCrear);

export default ConnectedAjusteCrear;
