import React from 'react';
import CustomComponent from '../../../../../../model/class/custom-component';
import ContainerWrapper from '../../../../../../components/Container';
import { images } from '../../../../../../helper';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  imageBase64,
  isEmpty,
  isNumeric,
  validateNumericInputs,
} from '../../../../../../helper/utils.helper';
import {
  addProducto,
  comboMedida,
  comboCategoria,
  comboMarca,
  comboAtributo,
} from '../../../../../../network/rest/principal.network';
import PropTypes from 'prop-types';
import SuccessReponse from '../../../../../../model/class/response';
import ErrorResponse from '../../../../../../model/class/error-response';
import { CANCELED } from '../../../../../../model/types/types';
import { connect } from 'react-redux';
import Producto from '../component/Producto';
import Servicio from '../component/Servicio';
import Combo from '../component/Combo';
import DetalleImagen from '../component/DetalleImagen';
import { SERVICIO, UNIDADES } from '../../../../../../model/types/tipo-tratamiento-producto';
import Title from '../../../../../../components/Title';
import Row from '../../../../../../components/Row';
import Column from '../../../../../../components/Column';
import { SpinnerView } from '../../../../../../components/Spinner';
import ModalInventario from '../component/ModalInventario';
import ModalProducto from '../component/ModalProducto';
import { TIPO_ATRIBUTO_COLOR, TIPO_ATRIBUTO_SABOR, TIPO_ATRIBUTO_TALLA } from '../../../../../../model/types/tipo-atributo';
/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class ProductoAgregar extends CustomComponent {

  /**
   * Inicializa un nuevo componente.
   * @param {Object} props - Las propiedades pasadas al componente.
   */
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

      tipo: 'TP0001',
      imagen: {
        url: images.noImage,
      },

      publicar: false,
      negativo: false,
      preferido: false,
      estado: true,

      // producto
      nombreProducto: '',
      codigoProducto: '',
      codigoSunatProducto: '0',

      idMedidaProducto: '',
      idCategoriaProducto: '',
      idMarcaProducto: '',

      idTipoTratamientoProducto: UNIDADES,

      precioProducto: '',
      costoProducto: '',

      precios: [],
      inventariosProducto: [],

      descripcionCortaProducto: '',
      descripcionLargaProducto: '',

      detallesProducto: [],
      imagenesProducto: [],
      coloresProducto: [],
      tallasProducto: [],
      saboresProducto: [],

      // servicio
      nombreServicio: '',
      codigoServicio: '',
      codigoSunatServicio: '0',

      idMedidaServicio: '',
      idCategoriaServicio: '',
      idMarcaServicio: '',

      precioServicio: '',

      descripcionCortaServicio: '',
      descripcionLargaServicio: '',

      detallesServicio: [],
      imagenesServicio: [],
      coloresServicio: [],
      tallasServicio: [],
      saboresServicio: [],

      // combo
      nombreCombo: '',
      codigoCombo: '',
      codigoSunatCombo: '0',

      idMedidaCombo: '',
      idCategoriaCombo: '',
      idMarcaCombo: '',

      combos: [],
      precioCombo: '',
      inventariosCombo: [],

      descripcionCortaCombo: '',
      descripcionLargaCombo: '',

      detallesCombo: [],
      imagenesCombo: [],
      coloresCombo: [],
      tallasCombo: [],
      saboresCombo: [],


      // Atributos del modal inventario
      isOpenInventario: false,

      // Atributos del modal inventario
      isOpenProducto: false,

      // Lista de datos
      medidas: [],
      categorias: [],
      marcas: [],
      colores: [],
      tallas: [],
      sabores: [],

      // Id principales
      idUsuario: this.props.token.userToken.idUsuario,
    };

    // producto
    this.refNombreProducto = React.createRef();
    this.refCodigoProducto = React.createRef();
    this.refCodigoSunatProducto = React.createRef();

    this.refIdMedidaProducto = React.createRef();
    this.refIdCategoriaProducto = React.createRef();
    this.refIdMarcaProducto = React.createRef();
    this.refDescripcionCortaProducto = React.createRef();
    this.refDescripcionLargaProducto = React.createRef();

    this.refCostoProducto = React.createRef();
    this.refPrecioProducto = React.createRef();
    this.refPreciosProducto = React.createRef();

    this.refDetallesProducto = React.createRef();

    // servicio
    this.refNombreServicio = React.createRef();
    this.refCodigoServicio = React.createRef();
    this.refCodigoSunatServicio = React.createRef();

    this.refIdMedidaServicio = React.createRef();
    this.refIdCategoriaServicio = React.createRef();
    this.refIdMarcaServicio = React.createRef();
    this.refDescripcionCortaServicio = React.createRef();
    this.refDescripcionLargaServicio = React.createRef();

    this.refPrecioServicio = React.createRef();

    this.refDetallesServicio = React.createRef();

    // Combo
    this.refNombreCombo = React.createRef();
    this.refCodigoCombo = React.createRef();
    this.refCodigoSunatCombo = React.createRef();

    this.refIdMedidaCombo = React.createRef();
    this.refIdCategoriaCombo = React.createRef();
    this.refIdMarcaCombo = React.createRef();
    this.refDescripcionCortaCombo = React.createRef();
    this.refDescripcionLargaCombo = React.createRef();

    this.refPrecioCombo = React.createRef();

    this.refDetallesCombo = React.createRef();

    // Referencia para el modal inventario
    this.refModalInventario = React.createRef();

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

  /**
   * @description Método que se ejecuta después de que el componente se haya montado en el DOM.
   */
  componentDidMount() {
    this.loadingData();
  }

  /**
   * @description Método que se ejecuta antes de que el componente se desmonte del DOM.
   */
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

  /**
   * @description Método que se ejecuta después de que el componente se haya montado en el DOM.
   */
  loadingData = async () => {
    const [medidas, categorias, marcas, colores, tallas, sabores,] = await Promise.all([
      this.fetchComboMedida(),
      this.fetchComboCategoria(),
      this.fetchComboMarca(),
      this.fetchComboColor(TIPO_ATRIBUTO_COLOR),
      this.fetchComboColor(TIPO_ATRIBUTO_TALLA),
      this.fetchComboColor(TIPO_ATRIBUTO_SABOR),
    ]);

    await this.setStateAsync({
      medidas,
      categorias,
      marcas,
      colores,
      tallas,
      sabores,
      loading: false,
    });
  };

  async fetchComboMedida() {
    const response = await comboMedida(this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchComboCategoria() {
    const response = await comboCategoria(this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchComboMarca() {
    const response = await comboMarca(this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }


  async fetchComboColor(id) {
    const params = {
      idTipoAtributo: id
    }
    const response = await comboAtributo(params, this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
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
  // Acciones del modal inventario
  //------------------------------------------------------------------------------------------
  handleOpenModalInventario = () => {
    this.setState({ isOpenInventario: true })
    this.refModalInventario.current.loadDatos();
  };

  handleCloseInventario = async () => {
    this.setState({ isOpenInventario: false });
  };

  handleAddInventario = async (item, callback = async function () { }) => {
    this.setState((prevState) => ({
      inventariosProducto: [...prevState.inventariosProducto, item],
    }));

    await callback();
  };

  handleRemoveInventario = (idAlmacen) => {
    this.setState((prevState) => ({
      inventariosProducto: prevState.inventariosProducto.filter((item) => item.idAlmacen !== idAlmacen)
    }));;
  };

  //------------------------------------------------------------------------------------------
  // Acciones del modal producto
  //------------------------------------------------------------------------------------------
  handleOpenModalProducto = () => {
    this.setState({ isOpenProducto: true })
  };

  handleCloseProducto = async () => {
    this.setState({ isOpenProducto: false });
  };

  handleAddProducto = async (item, callback = async function () { }) => {
    this.setState((prevState) => ({
      combos: [...prevState.combos, item],
    }));

    await callback();
  };

  handleRemoveProducto = (idProducto) => {
    this.setState((prevState) => ({
      combos: prevState.combos.filter((item) => item.idProducto !== idProducto)
    }));
  };

  handleInputCantidadCombos = (event, idProducto) => {
    const { value } = event.target;
    this.setState((prevState) => ({
      combos: prevState.combos.map((item) =>
        item.idProducto === idProducto
          ? { ...item, cantidad: value ? parseFloat(value) : '' }
          : item,
      ),
    }));
  };

  //------------------------------------------------------------------------------------------
  // Producto
  //------------------------------------------------------------------------------------------

  handleInputNombreProducto = (event) => {
    this.setState({
      nombreProducto: event.target.value,
    });
  };

  handleInputCodigoProducto = (event) => {
    this.setState({
      codigoProducto: event.target.value,
    });
  };

  handleSelectCodigoSunatProducto = (event) => {
    this.setState({
      codigoSunatProducto: event.target.value,
    });
  };

  handleSelectIdMedidaProducto = (event) => {
    this.setState({
      idMedidaProducto: event.target.value,
    });
  };

  handleSelectIdCategoriaProducto = (event) => {
    this.setState({
      idCategoriaProducto: event.target.value,
    });
  };

  handleSelectIdMarcaProducto = (event) => {
    this.setState({
      idMarcaProducto: event.target.value,
    });
  };

  handleInputDescripcionCortaProducto = (event) => {
    this.setState({
      descripcionCortaProducto: event.target.value,
    });
  };

  handleInputDescripcionLargaProducto = (event) => {
    this.setState({
      descripcionLargaProducto: event.target.value,
    });
  };

  handleOptionTipoTratamientoProducto = (event) => {
    this.setState({
      idTipoTratamientoProducto: event.target.value,
    });
  };

  handleInputCostoProducto = (event) => {
    this.setState({
      costoProducto: event.target.value,
    });
  };


  handleInputPrecioProducto = (event) => {
    this.setState({
      precioProducto: event.target.value,
    });
  };

  handleInputNombrePreciosProducto = (event, id) => {
    const { value } = event.target;
    this.setState((prevState) => ({
      precios: prevState.precios.map((item) =>
        item.id === id ? { ...item, nombre: value } : item,
      ),
    }));
  };

  handleInputPrecioPreciosProducto = (event, id) => {
    const { value } = event.target;
    this.setState((prevState) => ({
      precios: prevState.precios.map((item) =>
        item.id === id ? { ...item, precio: value } : item,
      ),
    }));
  };

  handleAddPreciosProducto = () => {
    const data = {
      id: this.state.precios.length + 1,
      nombre: '',
      precio: '',
    };

    this.setState((prevState) => ({
      precios: [...prevState.precios, data],
    }));
  };

  handleRemovePreciosProducto = (id) => {
    const precios = this.state.precios.filter((item) => item.id !== id).map((item, index) => ({
      ...item,
      id: index + 1
    }));
    this.setState({ precios });
  };

  handleInputNombreDetallesProducto = (event, id) => {
    const { value } = event.target;
    this.setState((prevState) => ({
      detallesProducto: prevState.detallesProducto.map((item) =>
        item.id === id ? { ...item, nombre: value } : item,
      ),
    }));
  };

  handleInputValorDetallesProducto = (event, id) => {
    const { value } = event.target;
    this.setState((prevState) => ({
      detallesProducto: prevState.detallesProducto.map((item) =>
        item.id === id ? { ...item, valor: value } : item,
      ),
    }));
  };

  handleAddDetallesProducto = () => {
    const data = {
      id: this.state.detallesProducto.length + 1,
      nombre: '',
      valor: '',
    };

    this.setState((prevState) => ({
      detallesProducto: [...prevState.detallesProducto, data],
    }));
  };

  handleRemoveDetallesProducto = (id) => {
    const detallesProducto = this.state.detallesProducto.filter((item) => item.id !== id).map((item, index) => ({
      ...item,
      id: index + 1
    }));
    this.setState({ detallesProducto });
  };

  handleSelectImagenesProducto = (newImgsState) => {
    this.setState({ imagenesProducto: newImgsState });
  };

  handleRemoveImagenesProducto = (newImgs) => {
    this.setState({ imagenesProducto: newImgs });
  };

  handleSelectColoresProducto = (color) => {
    if (this.state.coloresProducto.some((item) => item.idAtributo === color.idAtributo)) {
      const coloresProducto = this.state.coloresProducto.filter((item) => item.idAtributo !== color.idAtributo);
      this.setState({
        coloresProducto: coloresProducto
      });
    } else {
      this.setState((prevState) => ({
        coloresProducto: [...prevState.coloresProducto, color]
      }));
    }
  };

  handleSelectTallasProducto = (talla) => {
    if (this.state.tallasProducto.some((item) => item.idAtributo === talla.idAtributo)) {
      const tallasProducto = this.state.tallasProducto.filter((item) => item.idAtributo !== talla.idAtributo);
      this.setState({
        tallasProducto: tallasProducto
      });
    } else {
      this.setState((prevState) => ({
        tallasProducto: [...prevState.tallasProducto, talla]
      }));
    }
  };

  handleSelectSaboresProducto = (sabor) => {
    if (this.state.saboresProducto.some((item) => item.idAtributo === sabor.idAtributo)) {
      const saboresProducto = this.state.saboresProducto.filter((item) => item.idAtributo !== sabor.idAtributo);
      this.setState({
        saboresProducto: saboresProducto
      });
    } else {
      this.setState((prevState) => ({
        saboresProducto: [...prevState.saboresProducto, sabor]
      }));
    }
  };

  //------------------------------------------------------------------------------------------
  // Servicio
  //------------------------------------------------------------------------------------------

  handleInputNombreServicio = (event) => {
    this.setState({
      nombreServicio: event.target.value,
    });
  };

  handleInputCodigoServicio = (event) => {
    this.setState({
      codigoServicio: event.target.value,
    });
  };

  handleSelectCodigoSunatServicio = (event) => {
    this.setState({
      codigoSunatServicio: event.target.value,
    });
  };

  handleSelectIdMedidaServicio = (event) => {
    this.setState({
      idMedidaServicio: event.target.value,
    });
  };

  handleSelectIdCategoriaServicio = (event) => {
    this.setState({
      idCategoriaServicio: event.target.value,
    });
  };

  handleSelectIdMarcaServicio = (event) => {
    this.setState({
      idMarcaServicio: event.target.value,
    });
  };

  handleInpuDescripcionCortaServicio = (event) => {
    this.setState({
      descripcionCortaServicio: event.target.value,
    });
  };

  handleInpuDescripcionLargaServicio = (event) => {
    this.setState({
      descripcionLargaServicio: event.target.value,
    });
  };

  handleInpuPrecioServicio = (event) => {
    this.setState({
      precioServicio: event.target.value,
    });
  };

  handleInputNombreDetallesServicio = (event, id) => {
    const { value } = event.target;
    this.setState((prevState) => ({
      detallesServicio: prevState.detallesServicio.map((item) =>
        item.id === id ? { ...item, nombre: value } : item,
      ),
    }));
  };

  handleInputValorDetallesServicio = (event, id) => {
    const { value } = event.target;
    this.setState((prevState) => ({
      detallesServicio: prevState.detallesServicio.map((item) =>
        item.id === id ? { ...item, valor: value } : item,
      ),
    }));
  };

  handleAddDetallesServicio = () => {
    const data = {
      id: this.state.detallesServicio.length + 1,
      nombre: '',
      valor: '',
    };

    this.setState((prevState) => ({
      detallesServicio: [...prevState.detallesServicio, data],
    }));
  };

  handleRemoveDetallesServicio = (id) => {
    const detallesServicio = this.state.detallesServicio.filter((item) => item.id !== id).map((item, index) => ({
      ...item,
      id: index + 1
    }));
    this.setState({ detallesServicio });
  };

  handleSelectImagenesServicio = (newImgsState) => {
    this.setState({ imagenesServicio: newImgsState });
  };

  handleRemoveImagenesServicio = (newImgs) => {
    this.setState({ imagenesServicio: newImgs });
  };

  handleSelectColoresServicio = (color) => {
    if (this.state.coloresServicio.some((item) => item.idAtributo === color.idAtributo)) {
      const coloresServicio = this.state.coloresServicio.filter((item) => item.idAtributo !== color.idAtributo);
      this.setState({
        coloresServicio: coloresServicio
      });
    } else {
      this.setState((prevState) => ({
        coloresServicio: [...prevState.coloresServicio, color]
      }));
    }
  };

  handleSelectTallasServicio = (talla) => {
    if (this.state.tallasServicio.some((item) => item.idAtributo === talla.idAtributo)) {
      const tallasServicio = this.state.tallasServicio.filter((item) => item.idAtributo !== talla.idAtributo);
      this.setState({
        tallasServicio: tallasServicio
      });
    } else {
      this.setState((prevState) => ({
        tallasServicio: [...prevState.tallasServicio, talla]
      }));
    }
  };

  handleSelectSaboresServicio = (sabor) => {
    if (this.state.saboresServicio.some((item) => item.idAtributo === sabor.idAtributo)) {
      const saboresServicio = this.state.saboresServicio.filter((item) => item.idAtributo !== sabor.idAtributo);
      this.setState({
        saboresServicio: saboresServicio
      });
    } else {
      this.setState((prevState) => ({
        saboresServicio: [...prevState.saboresServicio, sabor]
      }));
    }
  };

  //------------------------------------------------------------------------------------------
  // Combo
  //------------------------------------------------------------------------------------------

  handleInputNombreCombo = (event) => {
    this.setState({
      nombreCombo: event.target.value,
    });
  };

  handleInputCodigoCombo = (event) => {
    this.setState({
      codigoCombo: event.target.value,
    });
  };

  handleSelectCodigoSunatCombo = (event) => {
    this.setState({
      codigoSunatCombo: event.target.value,
    });
  };

  handleSelectIdMedidaCombo = (event) => {
    this.setState({
      idMedidaCombo: event.target.value,
    });
  };

  handleSelectIdCategoriaCombo = (event) => {
    this.setState({
      idCategoriaCombo: event.target.value,
    });
  };

  handleSelectIdMarcaCombo = (event) => {
    this.setState({
      idMarcaCombo: event.target.value,
    });
  }

  handleInputDescripcionCortaCombo = (event) => {
    this.setState({
      descripcionCortaCombo: event.target.value,
    });
  };

  handleInputDescripcionLargaCombo = (event) => {
    this.setState({
      descripcionLargaCombo: event.target.value,
    });
  };

  handleInputPrecioCombo = (event) => {
    this.setState({
      precioCombo: event.target.value,
    });
  };

  handleInputNombreDetallesCombo = (event, id) => {
    const { value } = event.target;
    this.setState((prevState) => ({
      detallesCombo: prevState.detallesCombo.map((item) =>
        item.id === id ? { ...item, nombre: value } : item,
      ),
    }));
  };

  handleInputValorDetallesCombo = (event, id) => {
    const { value } = event.target;
    this.setState((prevState) => ({
      detallesCombo: prevState.detallesCombo.map((item) =>
        item.id === id ? { ...item, valor: value } : item,
      ),
    }));
  };

  handleAddDetallesCombo = () => {
    const data = {
      id: this.state.detallesCombo.length + 1,
      nombre: '',
      valor: '',
    };

    this.setState((prevState) => ({
      detallesCombo: [...prevState.detallesCombo, data],
    }));
  };

  handleRemoveDetallesCombo = (id) => {
    const detallesCombo = this.state.detallesCombo.filter((item) => item.id !== id).map((item, index) => ({
      ...item,
      id: index + 1
    }));
    this.setState({ detallesCombo });
  };

  handleSelectImagenesCombo = (newImgsState) => {
    this.setState({ imagenesCombo: newImgsState });
  };

  handleRemoveImagenesCombo = (newImgs) => {
    this.setState({ imagenesCombo: newImgs });
  };

  handleSelectColoresCombo = (color) => {
    if (this.state.coloresCombo.some((item) => item.idAtributo === color.idAtributo)) {
      const coloresCombo = this.state.coloresCombo.filter((item) => item.idAtributo !== color.idAtributo);
      this.setState({
        coloresCombo: coloresCombo
      });
    } else {
      this.setState((prevState) => ({
        coloresCombo: [...prevState.coloresCombo, color]
      }));
    }
  };

  handleSelectTallasCombo = (talla) => {
    if (this.state.tallasCombo.some((item) => item.idAtributo === talla.idAtributo)) {
      const tallasCombo = this.state.tallasCombo.filter((item) => item.idAtributo !== talla.idAtributo);
      this.setState({
        tallasCombo: tallasCombo
      });
    } else {
      this.setState((prevState) => ({
        tallasCombo: [...prevState.tallasCombo, talla]
      }));
    }
  };

  handleSelectSaboresCombo = (sabor) => {
    if (this.state.saboresCombo.some((item) => item.idAtributo === sabor.idAtributo)) {
      const saboresCombo = this.state.saboresCombo.filter((item) => item.idAtributo !== sabor.idAtributo);
      this.setState({
        saboresCombo: saboresCombo
      });
    } else {
      this.setState((prevState) => ({
        saboresCombo: [...prevState.saboresCombo, sabor]
      }));
    }
  };

  //------------------------------------------------------------------------------------------
  // Detalle general
  //------------------------------------------------------------------------------------------

  handleInputImagen = async (event) => {
    const files = event.currentTarget.files;

    if (!isEmpty(files)) {
      const file = files[0];
      let url = URL.createObjectURL(file);
      const logoSend = await imageBase64(file);
      if(logoSend.size > 50){
        alertWarning("Producto", "La imagen a subir tiene que ser menor a 50 KB.")
        return;
      }
      this.setState({
        imagen: {
          // name: file.name,
          base64: logoSend.base64String,
          extension: logoSend.extension,
          width: logoSend.width,
          height: logoSend.height,
          size: logoSend.size,
          url: url
        }
      })
    } else {
      this.setState({
        imagen: {
          url: images.noImage
        }
      });
    }

    event.target.value = null;
  };

  handleRemoveImagen = () => {
    this.setState({
      imagen: {
        url: images.noImage
      }
    });
  };

  handleSelectPreferido = (event) => {
    this.setState({
      preferido: event.target.checked,
    });
  };

  handleSelectEstado = (event) => {
    this.setState({
      estado: event.target.checked,
    });
  };

  handleSelectPublico = (event) => {
    this.setState({
      publicar: event.target.checked,
    });
  };

  handleSelectNegativo = (event) => {
    this.setState({
      negativo: event.target.checked,
    });
  };

  //------------------------------------------------------------------------------------------
  // Registrar
  //------------------------------------------------------------------------------------------

  handleSaveProducto = () => {
    if (isEmpty(this.state.nombreProducto)) {
      alertWarning('Producto', 'Ingrese el nombre del producto.', () => {
        this.refNombreProducto.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.codigoProducto)) {
      alertWarning('Producto', 'Ingrese el código del producto.', () => {
        this.refCodigoProducto.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idMedidaProducto)) {
      alertWarning('Producto', 'Seleccione la medida.', () => {
        this.refIdMedidaProducto.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idCategoriaProducto)) {
      alertWarning('Producto', 'Seleccione la categoría.', () => {
        this.refIdCategoriaProducto.current.focus();
      });
      return;
    }

    if (!isNumeric(this.state.costoProducto)) {
      alertWarning('Producto', 'Ingrese el costo.', () => {
        this.refCostoProducto.current.focus();
      });
      return;
    }

    if (!isNumeric(this.state.precioProducto)) {
      alertWarning('Producto', 'Ingrese el precio.', () => {
        this.refPrecioProducto.current.focus();
      });
      return;
    }

    if (parseFloat(this.state.precioProducto) <= parseFloat(this.state.costoProducto)) {
      alertWarning('Producto', 'El costo no debe ser mayor o igual al precio.', () => {
        this.refCostoProducto.current.focus();
      });
      return;
    }

    if (this.state.precios.filter((item) => isEmpty(item.nombre)).length !== 0) {
      alertWarning('Producto', 'Hay precios sin nombre..', () => {
        validateNumericInputs(this.refPreciosProducto, 'string');
      });
      return;
    }

    if (this.state.precios.filter((item) => !isNumeric(item.precio)).length !== 0) {
      alertWarning('Producto', 'Hay precios sin valor.', () => {
        validateNumericInputs(this.refPreciosProducto);
      });
      return;
    }

    if (this.state.detallesProducto.filter((item) => isEmpty(item.nombre)).length !== 0) {
      alertWarning('Producto', 'Hay detalle sin nombre..', () => {
        validateNumericInputs(this.refDetallesProducto, 'string');
      });
      return;
    }

    if (this.state.detallesProducto.filter((item) => isEmpty(item.valor)).length !== 0) {
      alertWarning('Producto', 'Hay detalle sin valor.', () => {
        validateNumericInputs(this.refDetallesProducto);
      });
      return;
    }

    alertDialog('Producto', '¿Estás seguro de continuar?', async (accept) => {
      if (accept) {
        alertInfo('Producto', 'Procesando información...');

        const data = {
          tipo: this.state.tipo,
          nombre: this.state.nombreProducto,
          codigo: this.state.codigoProducto,
          idCodigoSunat: this.state.codigoSunatProducto,
          idMedida: this.state.idMedidaProducto,
          idCategoria: this.state.idCategoriaProducto,
          idMarca: this.state.idMarcaProducto,
          descripcionCorta: this.state.descripcionCortaProducto,
          descripcionLarga: this.state.descripcionLargaProducto,
          idTipoTratamientoProducto: this.state.idTipoTratamientoProducto,
          costo: this.state.costoProducto,
          precio: this.state.precioProducto,
          inventarios: this.state.inventariosProducto,
          precios: this.state.precios,
          publicar: this.state.publicar,
          negativo: this.state.negativo,
          preferido: this.state.preferido,
          estado: this.state.estado,

          detalles: this.state.detallesProducto,
          imagenes: this.state.imagenesProducto,
          colores: this.state.coloresProducto,
          tallas: this.state.tallasProducto,
          sabores: this.state.saboresProducto,

          imagen: this.state.imagen,

          idUsuario: this.state.idUsuario,
        };

        const response = await addProducto(data);
        if (response instanceof SuccessReponse) {
          alertSuccess('Producto', response.data, () => {
            this.props.history.goBack();
          });
        }

        if (response instanceof ErrorResponse) {
          alertWarning('Producto', response.getMessage());
        }
      }
    });
  };

  handleSaveServicio = () => {
    if (isEmpty(this.state.nombreServicio)) {
      alertWarning('Producto - Servicio', 'Ingrese el nombre del servicio.', () => {
        this.refNombreServicio.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.codigoServicio)) {
      alertWarning('Producto - Servicio', 'Ingrese el código del servicio.', () => {
        this.refCodigoServicio.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idMedidaServicio)) {
      alertWarning('Producto - Servicio', 'Seleccione la medida.', () => {
        this.refIdMedidaServicio.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idCategoriaServicio)) {
      alertWarning('Producto - Servicio', 'Seleccione la categoría.', () => {
        this.refIdCategoriaServicio.current.focus();
      });
      return;
    }

    if (!isNumeric(this.state.precioServicio)) {
      alertWarning('Producto - Servicio', 'Ingrese el precio.', () => {
        this.refPrecioServicio.current.focus();
      });
      return;
    }

    if (this.state.detallesServicio.filter((item) => isEmpty(item.nombre)).length !== 0) {
      alertWarning('Producto - Servicio', 'Hay detalle sin nombre..', () => {
        validateNumericInputs(this.refDetallesServicio, 'string');
      });
      return;
    }

    if (this.state.detallesServicio.filter((item) => isEmpty(item.valor)).length !== 0) {
      alertWarning('Producto - Servicio', 'Hay detalle sin valor.', () => {
        validateNumericInputs(this.refDetallesServicio);
      });
      return;
    }

    alertDialog('Producto - Servicio', '¿Estás seguro de continuar?', async (accept) => {
      if (accept) {
        alertInfo('Producto - Servicio', 'Procesando información...');

        const data = {
          tipo: this.state.tipo,
          nombre: this.state.nombreServicio,
          codigo: this.state.codigoServicio,
          idCodigoSunat: this.state.codigoSunatServicio,
          idMedida: this.state.idMedidaServicio,
          idCategoria: this.state.idCategoriaServicio,
          idMarca: this.state.idMarcaServicio,
          descripcionCorta: this.state.descripcionCortaServicio,
          descripcionLarga: this.state.descripcionLargaServicio,
          idTipoTratamientoProducto: SERVICIO,
          precio: this.state.precioServicio,
          costo: 0,
          inventarios: [],
          precios: [],
          publicar: this.state.publicar,
          negativo: false,
          preferido: this.state.preferido,
          estado: this.state.estado,

          detalles: this.state.detallesServicio,
          imagenes: this.state.imagenesServicio,
          colores: this.state.coloresServicio,
          tallas: this.state.tallasServicio,
          sabores: this.state.saboresServicio,

          imagen: this.state.imagen,

          idUsuario: this.state.idUsuario,
        };

        const response = await addProducto(data);
        if (response instanceof SuccessReponse) {
          alertSuccess('Producto - Servicio', response.data, () => {
            this.props.history.goBack();
          });
        }

        if (response instanceof ErrorResponse) {
          alertWarning('Producto - Servicio', response.getMessage());
        }
      }
    });
  };

  handleSaveCombo = () => {
    if (isEmpty(this.state.nombreCombo)) {
      alertWarning('Producto - Combo', 'Ingrese el nombre del combo.', () => {
        this.refNombreCombo.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.codigoCombo)) {
      alertWarning('Producto - Servicio', 'Ingrese el código del combo.', () => {
        this.refCodigoCombo.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idMedidaCombo)) {
      alertWarning('Producto - Combo', 'Seleccione la medida.', () => {
        this.refIdMedidaCombo.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idCategoriaCombo)) {
      alertWarning('Producto - Combo', 'Seleccione la categoría.', () => {
        this.refIdCategoriaCombo.current.focus();
      });
      return;
    }

    if (!isNumeric(this.state.precioCombo)) {
      alertWarning('Producto - Combo', 'Ingrese el precio.', () => {
        this.refPrecioCombo.current.focus();
      });
      return;
    }

    if (this.state.detallesCombo.filter((item) => isEmpty(item.nombre)).length !== 0) {
      alertWarning('Producto - Combo', 'Hay detalle sin nombre..', () => {
        validateNumericInputs(this.refDetallesCombo, 'string');
      });
      return;
    }

    if (this.state.detallesCombo.filter((item) => isEmpty(item.valor)).length !== 0) {
      alertWarning('Producto - Combo', 'Hay detalle sin valor.', () => {
        validateNumericInputs(this.refDetallesCombo);
      });
      return;
    }

    alertDialog('Producto - Combo', '¿Estás seguro de continuar?', async (accept) => {
      if (accept) {
        alertInfo('Producto - Combo', 'Procesando información...');

        const data = {
          tipo: this.state.tipo,
          nombre: this.state.nombreCombo,
          codigo: this.state.codigoCombo,
          idCodigoSunat: this.state.codigoSunatCombo,
          idMedida: this.state.idMedidaCombo,
          idCategoria: this.state.idCategoriaCombo,
          idMarca: this.state.idMarcaCombo,
          descripcionCorta: this.state.descripcionCortaCombo,
          descripcionLarga: this.state.descripcionLargaCombo,
          idTipoTratamientoProducto: UNIDADES,
          costo: 0,
          precio: this.state.precioCombo,
          combos: [],
          inventarios: this.state.inventariosCombo,
          precios: [],
          publicar: this.state.publicar,
          negativo: false,
          preferido: this.state.preferido,
          estado: this.state.estado,

          detalles: this.state.detallesCombo,
          imagenes: this.state.imagenesCombo,
          colores: this.state.coloresCombo,
          tallas: this.state.tallasCombo,
          sabores: this.state.saboresCombo,

          imagen: this.state.imagen,

          idUsuario: this.state.idUsuario,
        };

        const response = await addProducto(data);
        if (response instanceof SuccessReponse) {
          alertSuccess('Producto - Combo', response.data, () => {
            this.props.history.goBack();
          });
        }

        if (response instanceof ErrorResponse) {
          alertWarning('Producto - Combo', response.getMessage());
        }
      }
    });
  };

  handleRegistrar = () => {
    if (this.state.tipo === 'TP0001') {
      this.handleSaveProducto();
      return;
    }

    if (this.state.tipo === 'TP0002') {
      this.handleSaveServicio();
      return;
    }

    if (this.state.tipo === 'TP0003') {
      this.handleSaveCombo();
      return;
    }
  };

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

  render() {
    const { tipo } = this.state;

    const { nombreProducto, codigoProducto, codigoSunatProducto } = this.state;

    const { idMedidaProducto, idCategoriaProducto, idMarcaProducto, descripcionCortaProducto, descripcionLargaProducto } = this.state;

    const { idTipoTratamientoProducto } = this.state;

    const { precioProducto, costoProducto, precios } = this.state;

    const { nombreServicio, codigoServicio, codigoSunatServicio } = this.state;

    const { idMedidaServicio, idCategoriaServicio, idMarcaServicio, descripcionCortaServicio, descripcionLargaServicio } = this.state;

    const { precioServicio } = this.state;

    const { nombreCombo, codigoCombo, codigoSunatCombo } = this.state;

    const { idMedidaCombo, idCategoriaCombo, idMarcaCombo, descripcionCortaCombo, descripcionLargaCombo } = this.state;

    const { precioCombo, combos } = this.state;

    const {
      medidas,
      categorias,
      marcas,
      publicar,
      negativo,
      preferido,
      estado,
    } = this.state;

    const { imagen } = this.state;

    const { detallesProducto, detallesServicio, detallesCombo } = this.state;

    const { imagenesProducto, imagenesServicio, imagenesCombo } = this.state;

    const { colores, coloresProducto, coloresServicio, coloresCombo } = this.state;

    const { tallas, tallasProducto, tallasServicio, tallasCombo } = this.state;

    const { sabores, saboresProducto, saboresServicio, saboresCombo } = this.state;

    return (
      <ContainerWrapper>
        <ModalInventario
          ref={this.refModalInventario}
          isOpen={this.state.isOpenInventario}
          onClose={this.handleCloseInventario}

          inventarios={this.state.inventariosProducto}

          handleAddInventario={this.handleAddInventario}
        />

        <ModalProducto
          isOpen={this.state.isOpenProducto}
          onClose={this.handleCloseProducto}

          combos={this.state.combos}

          handleAddProducto={this.handleAddProducto}
        />

        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title='Producto'
          subTitle='AGREGAR'
          icon={<i className='fa fa-plus'></i>}
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column className="col-xl-8 col-lg-12 col-md-12 col-sm-12 col-12">
            <Row>
              <Column className="col-lg-12 col-md-12 col-sm-12 col-12">
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link active"
                      id="addproducto-tab"
                      data-bs-toggle="tab"
                      href="#addproducto"
                      type="button"
                      role="tab"
                      aria-controls="addproducto"
                      aria-selected={true}
                      onClick={() => this.setState({ tipo: 'TP0001' })}
                    >
                      <i className="bi bi-info-circle"></i> Producto
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="addservicio-tab"
                      data-bs-toggle="tab"
                      href="#addservicio"
                      type="button"
                      role="tab"
                      aria-controls="addservicio"
                      aria-selected={false}
                      onClick={() => this.setState({ tipo: 'TP0002' })}
                    >
                      <i className="bi bi-card-checklist"></i> Servicio
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="addcombo-tab"
                      data-bs-toggle="tab"
                      href="#addcombo"
                      type="button"
                      role="tab"
                      aria-controls="addcombo"
                      aria-selected={false}
                      onClick={() => this.setState({ tipo: 'TP0003' })}
                    >
                      <i className="bi bi-border-all"></i> Combo
                    </button>
                  </li>
                </ul>

                <div className="tab-content pt-2" id="myTabContent">
                  <Producto
                    nombre={nombreProducto}
                    refNombre={this.refNombreProducto}
                    handleSelectNombre={this.handleInputNombreProducto}

                    codigo={codigoProducto}
                    refCodigo={this.refCodigoProducto}
                    handleInputCodigo={this.handleInputCodigoProducto}

                    codigoSunat={codigoSunatProducto}
                    refCodigoSunat={this.refCodigoSunatProducto}
                    handleSelectCodigoSunat={this.handleSelectCodigoSunatProducto}

                    idMedida={idMedidaProducto}
                    refIdMedida={this.refIdMedidaProducto}
                    handleSelectIdMedida={this.handleSelectIdMedidaProducto}
                    medidas={medidas}

                    idCategoria={idCategoriaProducto}
                    refIdCategoria={this.refIdCategoriaProducto}
                    handleSelectIdCategoria={this.handleSelectIdCategoriaProducto}
                    categorias={categorias}

                    idMarca={idMarcaProducto}
                    refIdMarca={this.refIdMarcaProducto}
                    handleSelectIdMarca={this.handleSelectIdMarcaProducto}
                    marcas={marcas}

                    descripcionCorta={descripcionCortaProducto}
                    refDescripcionCorta={this.refDescripcionCortaProducto}
                    handleInputDescripcionCorta={this.handleInputDescripcionCortaProducto}

                    descripcionLarga={descripcionLargaProducto}
                    refDescripcionLarga={this.refDescripcionLargaProducto}
                    handleInputDescripcionLarga={this.handleInputDescripcionLargaProducto}

                    idTipoTratamientoProducto={idTipoTratamientoProducto}
                    handleOptionTipoTratamientoProducto={this.handleOptionTipoTratamientoProducto}

                    costo={costoProducto}
                    refCosto={this.refCostoProducto}
                    handleInputCosto={this.handleInputCostoProducto}

                    precio={precioProducto}
                    refPrecio={this.refPrecioProducto}
                    handleInputPrecio={this.handleInputPrecioProducto}

                    precios={precios}
                    refPrecios={this.refPreciosProducto}
                    handleInputNombrePrecios={this.handleInputNombrePreciosProducto}
                    handleInputPrecioPrecios={this.handleInputPrecioPreciosProducto}
                    handleAddPrecios={this.handleAddPreciosProducto}
                    handleRemovePrecios={this.handleRemovePreciosProducto}
                    activarInventario={true}

                    inventarios={this.state.inventariosProducto}
                    handleOpenModalInventario={this.handleOpenModalInventario}
                    handleRemoveItemInventario={this.handleRemoveInventario}

                    detalles={detallesProducto}
                    refDetalles={this.refDetallesProducto}
                    handleInputNombreDetalles={this.handleInputNombreDetallesProducto}
                    handleInputValorDetalles={this.handleInputValorDetallesProducto}
                    handleAddDetalles={this.handleAddDetallesProducto}
                    handleRemoveDetalles={this.handleRemoveDetallesProducto}

                    imagenes={imagenesProducto}
                    handleSelectImagenes={this.handleSelectImagenesProducto}
                    handleRemoveImagenes={this.handleRemoveImagenesProducto}

                    colores={colores}
                    coloresSeleccionados={coloresProducto}
                    handleSelectColores={this.handleSelectColoresProducto}

                    tallas={tallas}
                    tallasSeleccionados={tallasProducto}
                    handleSelectTallas={this.handleSelectTallasProducto}

                    sabores={sabores}
                    saboresSeleccionados={saboresProducto}
                    handleSelectSabores={this.handleSelectSaboresProducto}
                  />

                  <Servicio
                    nombre={nombreServicio}
                    refNombre={this.refNombreServicio}
                    handleSelectNombre={this.handleInputNombreServicio}

                    codigo={codigoServicio}
                    refCodigo={this.refCodigoServicio}
                    handleInputCodigo={this.handleInputCodigoServicio}

                    codigoSunat={codigoSunatServicio}
                    refCodigoSunat={this.refCodigoSunatServicio}
                    handleSelectCodigoSunat={this.handleSelectCodigoSunatServicio}

                    idMedida={idMedidaServicio}
                    refIdMedida={this.refIdMedidaServicio}
                    handleSelectIdMedida={this.handleSelectIdMedidaServicio}
                    medidas={medidas}

                    idCategoria={idCategoriaServicio}
                    refIdCategoria={this.refIdCategoriaServicio}
                    handleSelectIdCategoria={this.handleSelectIdCategoriaServicio}
                    categorias={categorias}

                    idMarca={idMarcaServicio}
                    refIdMarca={this.refIdMarcaServicio}
                    handleSelectIdMarca={this.handleSelectIdMarcaServicio}
                    marcas={marcas}

                    descripcionCorta={descripcionCortaServicio}
                    refDescripcionCorta={this.refDescripcionCortaServicio}
                    handleInputDescripcionCorta={this.handleInpuDescripcionCortaServicio}

                    descripcionLarga={descripcionLargaServicio}
                    refDescripcionLarga={this.refDescripcionLargaServicio}
                    handleInputDescripcionLarga={this.handleInpuDescripcionLargaServicio}

                    precio={precioServicio}
                    refPrecio={this.refPrecioServicio}
                    handleInputPrecio={this.handleInpuPrecioServicio}

                    detalles={detallesServicio}
                    refDetalles={this.refDetallesServicio}
                    handleInputNombreDetalles={this.handleInputNombreDetallesServicio}
                    handleInputValorDetalles={this.handleInputValorDetallesServicio}
                    handleAddDetalles={this.handleAddDetallesServicio}
                    handleRemoveDetalles={this.handleRemoveDetallesServicio}

                    imagenes={imagenesServicio}
                    handleSelectImagenes={this.handleSelectImagenesServicio}
                    handleRemoveImagenes={this.handleRemoveImagenesServicio}

                    colores={colores}
                    coloresSeleccionados={coloresServicio}
                    handleSelectColores={this.handleSelectColoresServicio}

                    tallas={tallas}
                    tallasSeleccionados={tallasServicio}
                    handleSelectTallas={this.handleSelectTallasServicio}

                    sabores={sabores}
                    saboresSeleccionados={saboresServicio}
                    handleSelectSabores={this.handleSelectSaboresServicio}
                  />

                  <Combo
                    nombre={nombreCombo}
                    refNombre={this.refNombreCombo}
                    handleSelectNombre={this.handleInputNombreCombo}

                    codigo={codigoCombo}
                    refCodigo={this.refCodigoCombo}
                    handleInputCodigo={this.handleInputCodigoCombo}

                    codigoSunat={codigoSunatCombo}
                    refCodigoSunat={this.refCodigoSunatCombo}
                    handleSelectCodigoSunat={this.handleSelectCodigoSunatCombo}

                    idMedida={idMedidaCombo}
                    refIdMedida={this.refIdMedidaCombo}
                    handleSelectIdMedida={this.handleSelectIdMedidaCombo}
                    medidas={medidas}

                    idCategoria={idCategoriaCombo}
                    refIdCategoria={this.refIdCategoriaCombo}
                    handleSelectIdCategoria={this.handleSelectIdCategoriaCombo}
                    categorias={categorias}

                    idMarca={idMarcaCombo}
                    refIdMarca={this.refIdMarcaCombo}
                    handleSelectIdMarca={this.handleSelectIdMarcaCombo}
                    marcas={marcas}

                    descripcionCorta={descripcionCortaCombo}
                    refDescripcionCorta={this.refDescripcionCortaCombo}
                    handleInputDescripcionCorta={this.handleInputDescripcionCortaCombo}

                    descripcionLarga={descripcionLargaCombo}
                    refDescripcionLarga={this.refDescripcionLargaCombo}
                    handleInputDescripcionLarga={this.handleInputDescripcionLargaCombo}

                    precio={precioCombo}
                    refPrecio={this.refPrecioCombo}
                    handleInputPrecio={this.handleInputPrecioCombo}
                    combos={combos}

                    handleOpenModalProducto={this.handleOpenModalProducto}
                    handleInputCantidadCombos={this.handleInputCantidadCombos}
                    handleRemoveItemCombo={this.handleRemoveProducto}

                    activarInventario={false}
                    inventarios={this.state.inventariosCombo}
                    handleAddItemInventario={() => { }}
                    handleRemoveItemInventario={() => { }}

                    detalles={detallesCombo}
                    refDetalles={this.refDetallesCombo}
                    handleInputNombreDetalles={this.handleInputNombreDetallesCombo}
                    handleInputValorDetalles={this.handleInputValorDetallesCombo}
                    handleAddDetalles={this.handleAddDetallesCombo}
                    handleRemoveDetalles={this.handleRemoveDetallesCombo}

                    imagenes={imagenesCombo}
                    handleSelectImagenes={this.handleSelectImagenesCombo}
                    handleRemoveImagenes={this.handleRemoveImagenesCombo}

                    colores={colores}
                    coloresSeleccionados={coloresCombo}
                    handleSelectColores={this.handleSelectColoresCombo}

                    tallas={tallas}
                    tallasSeleccionados={tallasCombo}
                    handleSelectTallas={this.handleSelectTallasCombo}

                    sabores={sabores}
                    saboresSeleccionados={saboresCombo}
                    handleSelectSabores={this.handleSelectSaboresCombo}
                  />

                </div>
              </Column>
            </Row>
          </Column>

          <Column className="col-xl-4 col-lg-12 col-md-12 col-sm-12 col-12">
            <DetalleImagen
              tipo={tipo}
              imagen={imagen}
              refFileImagen={this.refFileImagen}
              handleInputImagen={this.handleInputImagen}
              handleRemoveImagen={this.handleRemoveImagen}
              nombre={
                tipo === 'TP0001'
                  ? nombreProducto
                  : tipo === 'TP0002'
                    ? nombreServicio
                    : nombreCombo
              }
              precio={
                tipo === 'TP0001'
                  ? precioProducto
                  : tipo === 'TP0002'
                    ? precioServicio
                    : precioCombo
              }
              publicar={publicar}
              handleSelectPublico={this.handleSelectPublico}

              negativo={negativo}
              handleSelectNegativo={this.handleSelectNegativo}

              preferido={preferido}
              handleSelectPreferido={this.handleSelectPreferido}

              estado={estado}
              handleSelectEstado={this.handleSelectEstado}

              handleRegistrar={this.handleRegistrar}
            />
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

ProductoAgregar.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string
    })
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func
  })
}

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */
const ConnectedProductoAgregar = connect(mapStateToProps, null)(ProductoAgregar);

export default ConnectedProductoAgregar;