import React from 'react';
import CustomComponent from '../../../../../../model/class/custom-component';
import ContainerWrapper from '../../../../../../components/Container';
import { images } from '../../../../../../helper';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  generateEAN13Code,
  imageBase64,
  isEmpty,
  isNumeric,
  isText,
  validateNumericInputs,
} from '../../../../../../helper/utils.helper';
import {
  comboAlmacen,
  comboMedida,
  comboCategoria,
  getIdProducto,
  updateProducto,
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
import Row from '../../../../../../components/Row';
import Column from '../../../../../../components/Column';
import Title from '../../../../../../components/Title';
import { SpinnerView } from '../../../../../../components/Spinner';
import ModalProducto from '../component/ModalProducto';
import { TIPO_ATRIBUTO_COLOR, TIPO_ATRIBUTO_SABOR, TIPO_ATRIBUTO_TALLA } from '../../../../../../model/types/tipo-atributo';
import { TabContent, TabHead, TabHeader, TabPane } from '../../../../../../components/Tab';
import { COMBO, PRODUCTO } from '../../../../../../model/types/tipo-producto';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class ProductoEditar extends CustomComponent {
  /**
   * Inicializa un nuevo componente.
   * @param {Object} props - Las propiedades pasadas al componente.
   */
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

      idTipoProducto: PRODUCTO,
      idProducto: '',
      imagen: {
        url: images.noImage,
      },

      activeTabProducto: true,
      activeTabServicio: false,
      activeTabCombo: false,

      publicar: false,
      negativo: false,
      preferido: false,
      estado: true,

      // producto
      nombreProducto: '',
      codigoProducto: '',
      skuProducto: '',
      codigoBarrasProducto: '',
      codigoSunatProducto: '0',

      idMedidaProducto: '',
      idCategoriaProducto: '',
      idMarcaProducto: '',

      idTipoTratamientoProducto: UNIDADES,

      precioProducto: '',
      costoProducto: '',

      precios: [],

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
      skuServicio: '',
      codigoBarrasServicio: '',
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
      skuCombo: '',
      codigoBarrasCombo: '',
      codigoSunatCombo: '0',

      idMedidaCombo: '',
      idCategoriaCombo: '',
      idMarcaCombo: '',
      combos: [],

      precioCombo: '',

      descripcionCortaCombo: '',
      descripcionLargaCombo: '',

      detallesCombo: [],
      imagenesCombo: [],
      coloresCombo: [],
      tallasCombo: [],
      saboresCombo: [],

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
    this.refSkuProducto = React.createRef();
    this.refCodigoBarrasProducto = React.createRef();
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
    this.refSkuServicio = React.createRef();
    this.refCodigoBarrasServicio = React.createRef();
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
    this.refSkuCombo = React.createRef();
    this.refCodigoBarrasCombo = React.createRef();
    this.refCodigoSunatCombo = React.createRef();

    this.refIdMedidaCombo = React.createRef();
    this.refIdCategoriaCombo = React.createRef();
    this.refIdMarcaCombo = React.createRef();
    this.refDescripcionCortaCombo = React.createRef();
    this.refDescripcionLargaCombo = React.createRef();

    this.refPrecioCombo = React.createRef();

    this.refDetallesCombo = React.createRef();

    this.abortController = new AbortController();
  }

  /**
   * @description Método que se ejecuta después de que el componente se haya montado en el DOM.
   */
  componentDidMount() {
    const url = this.props.location.search;
    const idproducto = new URLSearchParams(url).get('idProducto');

    if (isText(idproducto)) {
      this.loadingData(idproducto);
    } else {
      this.props.history.goBack();
    }
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

  /**
   * @description Método que se ejecuta después de que el componente se haya montado en el DOM.
   */
  loadingData = async (idProducto) => {
    const [medidas, categorias, marcas, colores, tallas, sabores, producto] = await Promise.all([
      this.fetchComboMedida(),
      this.fetchComboCategoria(),
      this.fetchComboMarca(),
      this.fetchComboColor(TIPO_ATRIBUTO_COLOR),
      this.fetchComboColor(TIPO_ATRIBUTO_TALLA),
      this.fetchComboColor(TIPO_ATRIBUTO_SABOR),
      this.fetchProducto(idProducto),
    ]);

    if (producto.idTipoProducto === PRODUCTO) {
      await this.setStateAsync({
        activeTabProducto: true,
        activeTabServicio: false,
        activeTabCombo: false,

        idTipoProducto: producto.idTipoProducto,
        nombreProducto: producto.nombre,
        codigoProducto: producto.codigo,
        skuProducto: producto.sku,
        codigoBarrasProducto: producto.codigoBarras,
        codigoSunatProducto: producto.idCodigoSunat,
        idMedidaProducto: producto.idMedida,
        idCategoriaProducto: producto.idCategoria,
        idMarcaProducto: producto.idMarca,
        descripcionCortaProducto: producto.descripcionCorta,
        descripcionLargaProducto: producto.descripcionLarga,
        idTipoTratamientoProducto: producto.idTipoTratamientoProducto,
        precioProducto: String(producto.precio),
        costoProducto: String(producto.costo),
        publicar: producto.publicar === 1 ? true : false,
        negativo: producto.negativo === 1 ? true : false,
        preferido: producto.preferido === 1 ? true : false,
        estado: producto.estado === 1 ? true : false,
        precios: producto.precios,
        detallesProducto: producto.detalles,
        imagenesProducto: producto.imagenes,
        coloresProducto: producto.colores,
        tallasProducto: producto.tallas,
        saboresProducto: producto.sabores,
      });
    } else if (producto.idTipoProducto === SERVICIO) {
      await this.setStateAsync({
        activeTabProducto: false,
        activeTabServicio: true,
        activeTabCombo: false,

        idTipoProducto: producto.idTipoProducto,
        nombreServicio: producto.nombre,
        codigoServicio: producto.codigo,
        skuServicio: producto.sku,
        codigoBarrasServicio: producto.codigoBarras,
        codigoSunatServicio: producto.idCodigoSunat,
        idMedidaServicio: producto.idMedida,
        idCategoriaServicio: producto.idCategoria,
        idMarcaServicio: producto.idMarca,
        descripcionCortaServicio: producto.descripcionCorta,
        descripcionLargaServicio: producto.descripcionLarga,
        precioServicio: String(producto.precio),
        publicar: producto.publicar === 1 ? true : false,
        negativo: producto.negativo === 1 ? true : false,
        preferido: producto.preferido === 1 ? true : false,
        estado: producto.estado === 1 ? true : false,
        detallesServicio: producto.detalles,
        imagenesServicio: producto.imagenes,
        coloresServicio: producto.colores,
        tallasProducto: producto.tallas,
        saboresProducto: producto.sabores,
      });
    } else {
      await this.setStateAsync({
        activeTabProducto: false,
        activeTabServicio: false,
        activeTabCombo: true,

        idTipoProducto: producto.idTipoProducto,
        nombreCombo: producto.nombre,
        codigoCombo: producto.codigo,
        skuCombo: producto.sku,
        codigoBarrasCombo: producto.codigoBarras,
        codigoSunatCombo: producto.idCodigoSunat,
        idMedidaCombo: producto.idMedida,
        idCategoriaCombo: producto.idCategoria,
        idMarcaCombo: producto.idMarca,
        descripcionCortaCombo: producto.descripcionCorta,
        descripcionLargaCombo: producto.descripcionLarga,
        precioCombo: String(producto.precio),
        publicar: producto.publicar === 1 ? true : false,
        preferido: producto.preferido === 1 ? true : false,
        estado: producto.estado === 1 ? true : false,
        detallesCombo: producto.detalles,
        imagenesCombo: producto.imagenes,
        coloresCombo: producto.colores,
        tallasProducto: producto.tallas,
        saboresProducto: producto.sabores,
      });
    }

    await this.setStateAsync({
      medidas,
      categorias,
      marcas,
      colores,
      tallas,
      sabores,
      imagen: producto.imagen ??
      {
        url: images.noImage
      },
      idProducto: idProducto,
      loading: false,
    });
  };

  async fetchProducto(id) {
    const response = await getIdProducto(id, this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

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

  async fetchComboAlmacen() {
    const response = await comboAlmacen(this.abortController.signal);

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

  handleInputSkuProducto = (event) => {
    this.setState({
      skuProducto: event.target.value,
    });
  };

  handleInputCodigoBarrasProducto = (event) => {
    this.setState({
      codigoBarrasProducto: event.target.value,
    });
  };

  handleGenerateCodigoBarrasProducto = () => {
    this.setState({
      codigoBarrasProducto: generateEAN13Code(),
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

  handleInputSkuServicio = (event) => {
    this.setState({
      skuServicio: event.target.value,
    });
  };

  handleInputCodigoBarrasServicio = (event) => {
    this.setState({
      codigoBarrasServicio: event.target.value,
    });
  };

  handleGenerateCodigoBarrasServicio = () => {
    this.setState({
      codigoBarrasServicio: generateEAN13Code(),
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

  handleSelectIdMarcaServicio = (event) => {
    this.setState({
      idMarcaServicio: event.target.value,
    });
  };

  handleSelectIdCategoriaServicio = (event) => {
    this.setState({
      idCategoriaServicio: event.target.value,
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

  handleInputSkuCombo = (event) => {
    this.setState({
      skuCombo: event.target.value,
    });
  };

  handleInputCodigoBarrasCombo = (event) => {
    this.setState({
      codigoBarrasCombo: event.target.value,
    });
  };

  handleGenerateCodigoBarrasCombo = () => {
    this.setState({
      codigoBarrasCombo: generateEAN13Code(),
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
  };

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
      if (logoSend.size > 500) {
        alertWarning("Producto", "La imagen a subir tiene que ser menor a 500 KB.")
        return;
      }
      this.setState({
        imagen: {
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

    if (!isNumeric(this.state.precioProducto)) {
      alertWarning('Producto', 'Ingrese el precio.', () => {
        this.refPrecioProducto.current.focus();
      });
      return;
    }

    if (!isNumeric(this.state.costoProducto)) {
      alertWarning('Producto', 'Ingrese el costo.', () => {
        this.refCostoProducto.current.focus();
      });
      return;
    }

    if (parseFloat(this.state.precioProducto) <= parseFloat(this.state.costoProducto)) {
      alertWarning('Producto', 'El costo no debe ser mayor o igual al precio.', () => {
        this.refCostoProducto.current.focus();
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
          idProducto: this.state.idProducto,
          nombre: this.state.nombreProducto,
          codigo: this.state.codigoProducto,
          sku: this.state.skuProducto,
          codigoBarras: this.state.codigoBarrasProducto,
          idCodigoSunat: this.state.codigoSunatProducto,
          idMedida: this.state.idMedidaProducto,
          idCategoria: this.state.idCategoriaProducto,
          idMarca: this.state.idMarcaProducto,
          descripcionCorta: this.state.descripcionCortaProducto,
          descripcionLarga: this.state.descripcionLargaProducto,
          idTipoTratamientoProducto: this.state.idTipoTratamientoProducto,
          costo: this.state.costoProducto,
          precio: this.state.precioProducto,
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

        const response = await updateProducto(data);
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
          idProducto: this.state.idProducto,
          nombre: this.state.nombreServicio,
          codigo: this.state.codigoServicio,
          sku: this.state.skuServicio,
          codigoBarras: this.state.codigoBarrasServicio,
          idCodigoSunat: this.state.codigoSunatServicio,
          idMedida: this.state.idMedidaServicio,
          idCategoria: this.state.idCategoriaServicio,
          idMarca: this.state.idMarcaServicio,
          descripcionCorta: this.state.descripcionCortaServicio,
          descripcionLarga: this.state.descripcionLargaServicio,
          idTipoTratamientoProducto: SERVICIO,
          costo: 0,
          precio: this.state.precioServicio,
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

        const response = await updateProducto(data);
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
          idProducto: this.state.idProducto,
          nombre: this.state.nombreCombo,
          codigo: this.state.codigoCombo,
          sku: this.state.skuCombo,
          codigoBarras: this.state.codigoBarrasCombo,
          idCodigoSunat: this.state.codigoSunatCombo,
          idMedida: this.state.idMedidaCombo,
          idCategoria: this.state.idCategoriaCombo,
          idMarca: this.state.idMarcaCombo,
          descripcionCorta: this.state.descripcionCortaCombo,
          descripcionLarga: this.state.descripcionLargaCombo,
          idTipoTratamientoProducto: UNIDADES,
          costo: 0,
          precio: this.state.precioCombo,
          precios: [],
          combos: [],
          inventarios: [],
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

        const response = await updateProducto(data);
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
    if (this.state.idTipoProducto === PRODUCTO) {
      this.handleSaveProducto();
      return;
    }

    if (this.state.idTipoProducto === SERVICIO) {
      this.handleSaveServicio();
      return;
    }

    if (this.state.idTipoProducto === COMBO) {
      this.handleSaveCombo();
      return;
    }
  };

  handleCerrar = () => {
    this.props.history.goBack();
  };

  /*
    |--------------------------------------------------------------------------
    | Método de cliclo de vida
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
    const { loading, msgLoading } = this.state;

    const { idTipoProducto } = this.state;

    const { nombreProducto, codigoProducto, skuProducto, codigoBarrasProducto, codigoSunatProducto } = this.state;

    const { idMedidaProducto, idCategoriaProducto, idMarcaProducto, descripcionCortaProducto, descripcionLargaProducto } = this.state;

    const { idTipoTratamientoProducto } = this.state;

    const { precioProducto, costoProducto, precios } = this.state;

    const { nombreServicio, codigoServicio, skuServicio, codigoBarrasServicio, codigoSunatServicio } = this.state;

    const { idMedidaServicio, idCategoriaServicio, idMarcaServicio, descripcionCortaServicio, descripcionLargaServicio } = this.state;

    const { precioServicio } = this.state;

    const { nombreCombo, codigoCombo, skuCombo, codigoBarrasCombo, codigoSunatCombo } = this.state;

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
        <ModalProducto
          isOpen={this.state.isOpenProducto}
          onClose={this.handleCloseProducto}

          combos={this.state.combos}

          handleAddProducto={this.handleAddProducto}
        />

        <SpinnerView
          loading={loading}
          message={msgLoading} />

        <Title
          title='Producto'
          subTitle='EDITAR'
          icon={<i className='fa fa-edit'></i>}
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column className="col-xl-8 col-lg-12 col-md-12 col-sm-12 col-12">
            <Row>
              <Column className="col-lg-12 col-md-12 col-sm-12 col-12">
                <TabHeader
                  onTabChange={(activeTab) => {
                    if (activeTab === 'producto-tab') {
                      this.setState({ idTipoProducto: PRODUCTO });
                    } else if (activeTab === 'servicio-tab') {
                      this.setState({ idTipoProducto: SERVICIO });
                    } else if (activeTab === 'combo-tab') {
                      this.setState({ idTipoProducto: COMBO });
                    }
                  }}
                >
                  <TabHead id='producto' isActive={this.state.activeTabProducto}>
                    <i className="bi bi-info-circle"></i> Producto
                  </TabHead>

                  <TabHead id='servicio' isActive={this.state.activeTabServicio}>
                    <i className="bi bi-card-checklist"></i> Servicio
                  </TabHead>

                  <TabHead id='combo' isActive={this.state.activeTabCombo}>
                    <i className="bi bi-border-all"></i> Combo
                  </TabHead>
                </TabHeader>

                <TabContent>
                  <TabPane id='producto' isActive={this.state.activeTabProducto}>
                    <Producto
                      nombre={nombreProducto}
                      refNombre={this.refNombreProducto}
                      handleSelectNombre={this.handleInputNombreProducto}

                      codigo={codigoProducto}
                      refCodigo={this.refCodigoProducto}
                      handleInputCodigo={this.handleInputCodigoProducto}

                      sku={skuProducto}
                      refSku={this.refSkuProducto}
                      handleInputSku={this.handleInputSkuProducto}

                      codigoBarras={codigoBarrasProducto}
                      refCodigoBarras={this.refCodigoBarrasProducto}
                      handleInputCodigoBarras={this.handleInputCodigoBarrasProducto}
                      handleGenerateCodigoBarras={this.handleGenerateCodigoBarrasProducto}

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
                      activarInventario={false}

                      inventarios={[]}
                      handleOpenModalInventario={() => { }}
                      handleRemoveItemInventario={() => { }}

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
                  </TabPane>

                  <TabPane id='servicio' isActive={this.state.activeTabServicio}>
                    <Servicio
                      nombre={nombreServicio}
                      refNombre={this.refNombreServicio}
                      handleSelectNombre={this.handleInputNombreServicio}

                      codigo={codigoServicio}
                      refCodigo={this.refCodigoServicio}
                      handleInputCodigo={this.handleInputCodigoServicio}

                      sku={skuServicio}
                      refSku={this.refSkuServicio}
                      handleInputSku={this.handleInputSkuServicio}

                      codigoBarras={codigoBarrasServicio}
                      refCodigoBarras={this.refCodigoBarrasServicio}
                      handleInputCodigoBarras={this.handleInputCodigoBarrasServicio}
                      handleGenerateCodigoBarras={this.handleGenerateCodigoBarrasServicio}

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
                  </TabPane>

                  <TabPane id='combo' isActive={this.state.activeTabCombo}>
                    <Combo
                      nombre={nombreCombo}
                      refNombre={this.refNombreCombo}
                      handleSelectNombre={this.handleInputNombreCombo}

                      codigo={codigoCombo}
                      refCodigo={this.refCodigoCombo}
                      handleInputCodigo={this.handleInputCodigoCombo}

                      sku={skuCombo}
                      refSku={this.refSkuCombo}
                      handleInputSku={this.handleInputSkuCombo}

                      codigoBarras={codigoBarrasCombo}
                      refCodigoBarras={this.refCodigoBarrasCombo}
                      handleInputCodigoBarras={this.handleInputCodigoBarrasCombo}
                      handleGenerateCodigoBarras={this.handleGenerateCodigoBarrasCombo}

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

                      inventarios={[]}
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
                  </TabPane>
                </TabContent>
              </Column>
            </Row>
          </Column>

          <Column className="col-xl-4 col-lg-12 col-md-12 col-sm-12 col-12">
            <DetalleImagen
              idTipoProducto={idTipoProducto}
              imagen={imagen}
              handleInputImagen={this.handleInputImagen}
              handleRemoveImagen={this.handleRemoveImagen}
              nombre={
                idTipoProducto === PRODUCTO
                  ? nombreProducto
                  : idTipoProducto === SERVICIO
                    ? nombreServicio
                    : nombreCombo
              }
              precio={
                idTipoProducto === PRODUCTO
                  ? precioProducto
                  : idTipoProducto === SERVICIO
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
              handleCerrar={this.handleCerrar}
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

ProductoEditar.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string
    })
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func
  }),
  location: PropTypes.shape({
    search: PropTypes.string
  })
}

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */
const ConnectedProductoEditar = connect(mapStateToProps, null)(ProductoEditar);

export default ConnectedProductoEditar;