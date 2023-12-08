import React from 'react';
import CustomComponent from '../../../../../model/class/custom-component';
import ContainerWrapper from '../../../../../components/Container';
import { images } from '../../../../../helper';
import {
    alertDialog,
    alertInfo,
    alertSuccess,
    alertWarning,
    clearModal,
    hideModal,
    isEmpty,
    isNumeric,
    isText,
    showModal,
    spinnerLoading,
    viewModal
} from '../../../../../helper/utils.helper';
import {
    comboAlmacen,
    comboMedida,
    comboProductos,
    comboCategoria,
    getIdProducto,
    updateProducto
} from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import { connect } from 'react-redux';
import Producto from '../component/Producto';
import Servicio from '../component/Servicio';
import Combo from '../component/Combo';
import DetalleImagen from '../component/DetalleImagen';
import ModalProducto from '../component/ModalProducto';

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
            tipo: "TP0001",
            idProducto: '',
            imagen: images.noImage,

            // producto
            nombreProducto: '',
            codigoProducto: '',
            codigoSunatProducto: '0',

            idMedidaProducto: '',
            idCategoriaProducto: '',
            descripcionProducto: '',

            idTipoVentaProducto: 'TV0001',

            precioProducto: '',
            costoProducto: '',

            precios: [],

            publicar: false,
            negativo: false,
            inventariado: true,
            preferido: false,
            estado: true,

            // servicio
            nombreServicio: '',
            codigoServicio: '',
            codigoSunatServicio: '0',

            idMedidaServicio: '',
            idCategoriaServicio: '',
            descripcionServicio: '',

            precioServicio: '',

            // combo
            nombreCombo: '',
            codigoCombo: '',
            codigoSunatCombo: '0',

            idMedidaCombo: '',
            idCategoriaCombo: '',
            descripcionCombo: '',
            combos: [],

            precioCombo: '',

            // imagen
            fileImage: [],

            // lista libre
            medidas: [],
            categorias: [],
            productos: [],

            loadModal: false,

            loading: true,
            msgLoading: 'Cargando datos...',

            idUsuario: this.props.token.userToken.idUsuario,

        }

        /**
        * Identificador del modal de producto.
        * @type {string}
        */
        this.idModalProducto = "modalProducto";

        // producto
        this.refNombreProducto = React.createRef();
        this.refCodigoProducto = React.createRef();
        this.refCodigoSunatProducto = React.createRef();

        this.refIdMedidaProducto = React.createRef();
        this.refIdCategoriaProducto = React.createRef();
        this.refDescripcionProducto = React.createRef();

        this.refCostoProducto = React.createRef();
        this.refPrecioProducto = React.createRef();
        this.refPreciosProducto = React.createRef();

        // servicio
        this.refNombreServicio = React.createRef();
        this.refCodigoServicio = React.createRef();
        this.refCodigoSunatServicio = React.createRef();

        this.refIdMedidaServicio = React.createRef();
        this.refIdCategoriaServicio = React.createRef();
        this.refDescripcionServicio = React.createRef();

        this.refPrecioServicio = React.createRef();

        // Combo
        this.refNombreCombo = React.createRef();
        this.refCodigoCombo = React.createRef();
        this.refCodigoSunatCombo = React.createRef();

        this.refIdMedidaCombo = React.createRef();
        this.refIdCategoriaCombo = React.createRef();
        this.refDescripcionCombo = React.createRef();

        this.refPrecioCombo = React.createRef();

        //--> producto - modal
        this.refIdProductoCombo = React.createRef();
        this.refCantidadCombo = React.createRef();
        this.refUnidadCombo = React.createRef();
        this.refCostoCombo = React.createRef();

        // imagen
        this.refFileImagen = React.createRef();

        this.abortController = new AbortController();
    }

    /**
     * @description Método que se ejecuta después de que el componente se haya montado en el DOM.
     */
    componentDidMount() {
        const url = this.props.location.search;
        const idproducto = new URLSearchParams(url).get("idProducto");

        if (isText(idproducto)) {
            this.loadingData(idproducto);
        } else {
            this.props.history.goBack();
        }

        viewModal(this.idModalProducto, async () => {
            const productos = await this.fetchComboProductos();

            this.setState({
                productos: productos,
                loadModal: false
            });
        });

        clearModal(this.idModalProducto, async () => {
            this.refIdProductoCombo.current.value = "";
            this.refCantidadCombo.current.value = "";
            this.refUnidadCombo.current.value = "";
            this.refCostoCombo.current.value = "";
        });
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

        const [medidas, categorias, producto] = await Promise.all([
            await this.fetchComboMedida(),
            await this.fetchComboCategoria(),
            await this.fetchProducto(idProducto)
        ]);

        if (producto.idTipoProducto === "TP0001") {
            this.handleFocusTab("addproducto-tab", "addproducto")
            await this.setStateAsync({
                tipo: producto.idTipoProducto,
                nombreProducto: producto.nombre,
                codigoProducto: producto.codigo,
                codigoSunatProducto: producto.idCodigoSunat,
                idMedidaProducto: producto.idMedida,
                idCategoriaProducto: producto.idCategoria,
                descripcionProducto: producto.descripcion,
                idTipoVentaProducto: producto.idTipoVenta,
                precioProducto: producto.precio,
                costoProducto: producto.costo,
                publicar: producto.publicar,
                inventariado: producto.inventariado,
                negativo: producto.negativo,
                preferido: producto.preferido,
                estado: producto.estado,
                precios: producto.precios
            });
        } else if (producto.idTipoProducto === "TP0002") {
            this.handleFocusTab("addservicio-tab", "addservicio")
            await this.setStateAsync({
                tipo: producto.idTipoProducto,
                nombreServicio: producto.nombre,
                codigoServicio: producto.codigo,
                codigoSunatServicio: producto.idCodigoSunat,
                idMedidaServicio: producto.idMedida,
                idCategoriaServicio: producto.idCategoria,
                descripcionServicio: producto.descripcion,
                precioServicio: producto.precio,
                publicar: producto.publicar,
                inventariado: producto.inventariado,
                negativo: producto.negativo,
                preferido: producto.preferido,
                estado: producto.estado
            });
        } else {
            this.handleFocusTab("addcombo-tab", "addcombo")
            await this.setStateAsync({
                tipo: producto.idTipoProducto,
                nombreCombo: producto.nombre,
                codigoCombo: producto.codigo,
                codigoSunatCombo: producto.idCodigoSunat,
                idMedidaCombo: producto.idMedida,
                idCategoriaCombo: producto.idCategoria,
                descripcionCombo: producto.descripcion,
                precioCombo: producto.precio,
                publicar: producto.publicar,
                preferido: producto.preferido,
                estado: producto.estado
            });
        }

        await this.setStateAsync({
            medidas,
            categorias,
            loading: false,
            idProducto: idProducto,
        });
    };

    async fetchProducto(id) {
        const params = {
            "idProducto": id
        }

        const response = await getIdProducto(params, this.abortController.signal);

        if (response instanceof SuccessReponse) {
            return response.data
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            return [];
        }
    }

    async fetchComboMedida() {
        const response = await comboMedida(this.abortController.signal);

        if (response instanceof SuccessReponse) {
            return response.data
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            return [];
        }
    }

    async fetchComboCategoria() {
        const response = await comboCategoria(this.abortController.signal);

        if (response instanceof SuccessReponse) {
            return response.data
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            return [];
        }
    }

    async fetchComboAlmacen() {
        const response = await comboAlmacen(this.abortController.signal);

        if (response instanceof SuccessReponse) {
            return response.data
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            return [];
        }
    }

    async fetchComboProductos() {
        const response = await comboProductos(this.abortController.signal);

        if (response instanceof SuccessReponse) {
            return response.data
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
    // Producto
    //------------------------------------------------------------------------------------------

    handleInputNombreProducto = (event) => {
        this.setState({
            nombreProducto: event.target.value
        });
    }

    handleInputCodigoProducto = (event) => {
        this.setState({
            codigoProducto: event.target.value
        });
    }

    handleSelectCodigoSunatProducto = (event) => {
        this.setState({
            codigoSunatProducto: event.target.value
        });
    }

    handleSelectIdMedidaProducto = (event) => {
        this.setState({
            idMedidaProducto: event.target.value
        });
    }

    handleSelectIdCategoriaProducto = (event) => {
        this.setState({
            idCategoriaProducto: event.target.value
        });
    }

    handleInputDescripcionProducto = (event) => {
        this.setState({
            descripcionProducto: event.target.value
        });
    }

    handleOptionTipoVentaProducto = (event) => {
        this.setState({
            idTipoVentaProducto: event.target.value
        })
    }

    handleInputPrecioProducto = (event) => {
        this.setState({
            precioProducto: event.target.value
        });
    }

    handleInputCostoProducto = (event) => {
        this.setState({
            costoProducto: event.target.value
        });
    }

    handleInputNombrePreciosProducto = (event, id) => {
        const { value } = event.target;
        this.setState(prevState => ({
            precios: prevState.precios.map(item =>
                item.id === id ? { ...item, nombre: value } : item
            ),
        }));
    }

    handleInputPrecioPreciosProducto = (event, id) => {
        const { value } = event.target;
        this.setState(prevState => ({
            precios: prevState.precios.map(item =>
                item.id === id ? { ...item, precio: value } : item
            ),
        }));
    }

    handleAddPrecioProducto = () => {
        const data = {
            id: this.state.precios.length + 1,
            nombre: '',
            precio: '',
        }

        this.setState(prevState => ({
            precios: [...prevState.precios, data]
        }))
    }

    handleRemovePrecioProducto = (id) => {
        const precios = this.state.precios.filter(item => item.id !== id);
        this.setState({ precios })
    }

    handleRemoveItemInventarioProducto = (idAlmacen) => {
        const inventarioProducto = this.state.inventarioProducto.filter(item => item.idAlmacen !== idAlmacen);
        this.setState({ inventarioProducto })
    }

    //------------------------------------------------------------------------------------------
    // Servicio
    //------------------------------------------------------------------------------------------

    handleInputNombreServicio = (event) => {
        this.setState({
            nombreServicio: event.target.value
        });
    }

    handleInputCodigoServicio = (event) => {
        this.setState({
            codigoServicio: event.target.value
        });
    }

    handleSelectCodigoSunatServicio = (event) => {
        this.setState({
            codigoSunatServicio: event.target.value
        });
    }

    handleSelectIdMedidaServicio = (event) => {
        this.setState({
            idMedidaServicio: event.target.value
        });
    }

    handleSelectIdCategoriaServicio = (event) => {
        this.setState({
            idCategoriaServicio: event.target.value
        });
    }

    handleInpuDescripcionServicio = (event) => {
        this.setState({
            descripcionServicio: event.target.value
        });
    }

    handleInpuPrecioServicio = (event) => {
        this.setState({
            precioServicio: event.target.value
        });
    }

    //------------------------------------------------------------------------------------------
    // Combo
    //------------------------------------------------------------------------------------------

    handleInputNombreCombo = (event) => {
        this.setState({
            nombreCombo: event.target.value
        });
    }

    handleInputCodigoCombo = (event) => {
        this.setState({
            codigoCombo: event.target.value
        });
    }


    handleSelectCodigoSunatCombo = (event) => {
        this.setState({
            codigoSunatCombo: event.target.value
        });
    }

    handleSelectIdMedidaCombo = (event) => {
        this.setState({
            idMedidaCombo: event.target.value
        });
    }

    handleSelectIdCategoriaCombo = (event) => {
        this.setState({
            idCategoriaCombo: event.target.value
        });
    }

    handleInputDescripcionCombo = (event) => {
        this.setState({
            descripcionCombo: event.target.value
        });
    }

    handleInputPrecioCombo = (event) => {
        this.setState({
            precioCombo: event.target.value
        });
    }

    handleOpenProducto = async () => {
        showModal(this.idModalProducto);
        await this.setStateAsync({ loadModal: true })
    }

    handleSelectProductoCombo = () => {
        if (isEmpty(this.refIdProductoCombo.current.value)) return;

        const producto = this.state.productos.find(item => item.idProducto === this.refIdProductoCombo.current.value);
        this.refUnidadCombo.current.value = producto.medida;
        this.refCostoCombo.current.value = producto.costo;
    }

    handleAddItemCombo = () => {
        this.handleOpenProducto();
    }

    handleInputCantidadCombos = (event, idProducto) => {
        const { value } = event.target;
        this.setState(prevState => ({
            combos: prevState.combos.map(item =>
                item.idProducto === idProducto ? { ...item, cantidad: value ? parseFloat(value) : '' } : item
            ),
        }));
    }

    handleRemoveItemCombo = (idProducto) => {
        const combos = this.state.combos.filter(item => item.idProducto !== idProducto);
        this.setState({ combos })
    }

    handleSaveItemCombo = () => {
        if (isEmpty(this.refIdProductoCombo.current.value)) {
            alertWarning("Producto - Combo", "Seleccione un producto.", () => {
                this.refIdProductoCombo.current.focus();
            });
            return;
        }

        if (isEmpty(this.refCantidadCombo.current.value)) {
            alertWarning("Producto - Combo", "Ingrese su cantidad..", () => {
                this.refCantidadCombo.current.focus();
            });
            return;
        }

        if (parseFloat(this.refCantidadCombo.current.value) <= 0) {
            alertWarning("Producto - Combo", "Su cantidad tiene que se mayor a cero(0).", () => {
                this.refCantidadCombo.current.focus();
            });
            return;
        }

        if (this.state.combos.find(item => item.idProducto === this.refIdProductoCombo.current.value)) {
            alertWarning("Producto - Combo", "Ya se encuentra agregado el producto a la lista.", () => {
                this.refIdProductoCombo.current.focus();
            });
            return;
        }

        const producto = this.state.productos.find(item => item.idProducto === this.refIdProductoCombo.current.value);

        const item = {
            idProducto: this.refIdProductoCombo.current.value,
            nombre: this.refIdProductoCombo.current.options[this.refIdProductoCombo.current.selectedIndex].innerText,
            cantidad: this.refCantidadCombo.current.value,
            costo: producto.costo,
        }

        this.setState(prevState => ({
            combos: [...prevState.combos, item]
        }))

        hideModal(this.idModalProducto)
    }

    //------------------------------------------------------------------------------------------
    // Granel
    //------------------------------------------------------------------------------------------


    //------------------------------------------------------------------------------------------
    // Detalle general
    //------------------------------------------------------------------------------------------

    handleInputImagen = async (event) => {
        if (event.target.files.length !== 0) {
            await this.setStateAsync({
                imagen: URL.createObjectURL(event.target.files[0]),
                fileImage: event.target.files
            })
        } else {
            await this.setStateAsync({
                imagen: images.noImage,
                fileImage: []
            })
        }
    }

    handleRemoveImagen = () => {
        this.setState({
            imagen: images.noImage,
            fileImage: []
        })
    }

    handleSelectPreferido = (event) => {
        this.setState({
            preferido: event.target.checked
        });
    }

    handleSelectEstado = (event) => {
        this.setState({
            estado: event.target.checked
        });
    }

    handleSelectPublico = (event) => {
        this.setState({
            publicar: event.target.checked
        });
    }

    handleSelectNegativo = (event) => {
        this.setState({
            negativo: event.target.checked
        });
    }

    handleSelectInventariado = (event) => {
        this.setState({
            inventariado: event.target.checked
        })
    }

    //------------------------------------------------------------------------------------------
    // Registrar
    //------------------------------------------------------------------------------------------

    handleFocusTab(idTab, idContent) {
        if (!document.getElementById(idTab).classList.contains('active')) {
            for (let child of document.getElementById('myTab').childNodes) {
                child.childNodes[0].classList.remove('active')
            }
            for (let child of document.getElementById('myTabContent').childNodes) {
                child.classList.remove('show', 'active')
            }
            document.getElementById(idTab).classList.add('active');
            document.getElementById(idContent).classList.add('show', 'active');
        }
    }

    handleSaveProducto = () => {
        if (isEmpty(this.state.nombreProducto)) {
            alertWarning("Producto", "Ingrese el nombre del producto.", () => {
                this.refNombreProducto.current.focus();
            });
            return;
        }

        if (isEmpty(this.state.codigoProducto)) {
            alertWarning("Producto", "Ingrese el código del producto.", () => {
                this.refCodigoProducto.current.focus();
            });
            return;
        }

        if (isEmpty(this.state.idMedidaProducto)) {
            alertWarning("Producto", "Seleccione la medida.", () => {
                this.refIdMedidaProducto.current.focus();
            });
            return;
        }

        if (isEmpty(this.state.idCategoriaProducto)) {
            alertWarning("Producto", "Seleccione la categoría.", () => {
                this.refIdCategoriaProducto.current.focus();
            });
            return;
        }

        if (!isNumeric(this.state.precioProducto)) {
            alertWarning("Producto", "Ingrese el precio.", () => {
                this.refPrecioProducto.current.focus();
            });
            return;
        }

        if (!isNumeric(this.state.costoProducto)) {
            alertWarning("Producto", "Ingrese el costo.", () => {
                this.refCostoProducto.current.focus();
            });
            return;
        }

        if (parseFloat(this.state.precioProducto) <= parseFloat(this.state.costoProducto)) {
            alertWarning("Producto", "El costo no debe ser mayor o igual al precio.", () => {
                this.refCostoProducto.current.focus();
            });
            return;
        }

        alertDialog("Producto", "¿Estás seguro de continuar?", async (accept) => {
            if (accept) {
                alertInfo("Producto", "Procesando información...")
                const data = {
                    idProducto: this.state.idProducto,
                    nombre: this.state.nombreProducto,
                    codigo: this.state.codigoProducto,
                    idCodigoSunat: this.state.codigoSunatProducto,
                    idMedida: this.state.idMedidaProducto,
                    idCategoria: this.state.idCategoriaProducto,
                    descripcion: this.state.descripcionProducto,
                    idTipoVenta: this.state.idTipoVentaProducto,
                    costo: this.state.costoProducto,
                    precio: this.state.precioProducto,
                    precios: this.state.precios,
                    publicar: this.state.publicar,
                    inventariado: this.state.inventariado,
                    negativo: this.state.negativo,
                    preferido: this.state.preferido,
                    estado: this.state.estado,
                    idUsuario: this.state.idUsuario
                }

                const response = await updateProducto(data);
                if (response instanceof SuccessReponse) {
                    alertSuccess("Producto", response.data, () => {
                        this.props.history.goBack();
                    })
                }

                if (response instanceof ErrorResponse) {
                    alertWarning("Producto", response.getMessage())
                }
            }
        });
    }

    handleSaveServicio = () => {
        if (isEmpty(this.state.nombreServicio)) {
            alertWarning("Producto - Servicio", "Ingrese el nombre del servicio.", () => {
                this.refNombreServicio.current.focus();
            });
            return;
        }

        if (isEmpty(this.state.codigoServicio)) {
            alertWarning("Producto - Servicio", "Ingrese el código del servicio.", () => {
                this.refCodigoServicio.current.focus();
            });
            return;
        }

        if (isEmpty(this.state.idMedidaServicio)) {
            alertWarning("Producto - Servicio", "Seleccione la medida.", () => {
                this.refIdMedidaServicio.current.focus();
            });
            return;
        }

        if (isEmpty(this.state.idCategoriaServicio)) {
            alertWarning("Producto - Servicio", "Seleccione la categoría.", () => {
                this.refIdCategoriaServicio.current.focus();
            });
            return;
        }

        if (!isNumeric(this.state.precioServicio)) {
            alertWarning("Producto - Servicio", "Ingrese el precio.", () => {
                this.refPrecioServicio.current.focus();
            });
            return;
        }


        alertDialog("Producto - Servicio", "¿Estás seguro de continuar?", async (accept) => {
            if (accept) {
                alertInfo("Producto - Servicio", "Procesando información...")
                const data = {
                    idProducto: this.state.idProducto,
                    nombre: this.state.nombreServicio,
                    codigo: this.state.codigoServicio,
                    idCodigoSunat: this.state.codigoSunatServicio,
                    idMedida: this.state.idMedidaServicio,
                    idCategoria: this.state.idCategoriaServicio,
                    descripcion: this.state.descripcionServicio,
                    idTipoVenta: 'TV0004',
                    costo: 0,
                    precio: this.state.precioServicio,
                    precios: [],
                    publicar: this.state.publicar,
                    inventariado: false,
                    negativo: false,
                    preferido: this.state.preferido,
                    estado: this.state.estado,
                    idUsuario: this.state.idUsuario
                }

                const response = await updateProducto(data);
                if (response instanceof SuccessReponse) {
                    alertSuccess("Producto - Servicio", response.data, () => {
                        this.props.history.goBack();
                    })
                }

                if (response instanceof ErrorResponse) {
                    alertWarning("Producto - Servicio", response.getMessage())
                }
            }
        });
    }

    handleSaveCombo = () => {
        if (isEmpty(this.state.nombreCombo)) {
            alertWarning("Producto - Combo", "Ingrese el nombre del combo.", () => {
                this.refNombreCombo.current.focus();
            });
            return;
        }

        if (isEmpty(this.state.codigoCombo)) {
            alertWarning("Producto - Servicio", "Ingrese el código del combo.", () => {
                this.refCodigoCombo.current.focus();
            });
            return;
        }

        if (isEmpty(this.state.idMedidaCombo)) {
            alertWarning("Producto - Combo", "Seleccione la medida.", () => {
                this.refIdMedidaCombo.current.focus();
            });
            return;
        }

        if (isEmpty(this.state.idCategoriaCombo)) {
            alertWarning("Producto - Combo", "Seleccione la categoría.", () => {
                this.refIdCategoriaCombo.current.focus();
            });
            return;
        }

        if (!isNumeric(this.state.precioCombo)) {
            alertWarning("Producto - Combo", "Ingrese el precio.", () => {
                this.refPrecioCombo.current.focus();
            });
            return;
        }

        alertDialog("Producto - Combo", "¿Estás seguro de continuar?", async (accept) => {
            if (accept) {
                alertInfo("Producto - Combo", "Procesando información...")
                const data = {
                    idProducto: this.state.idProducto,
                    nombre: this.state.nombreCombo,
                    codigo: this.state.codigoCombo,
                    idCodigoSunat: this.state.codigoSunatCombo,
                    idMedida: this.state.idMedidaCombo,
                    idCategoria: this.state.idCategoriaCombo,
                    descripcion: this.state.descripcionCombo,
                    idTipoVenta: 'TV0001',
                    costo: 0,
                    precio: this.state.precioCombo,
                    precios: [],
                    combos: [],
                    inventarios: [],
                    publicar: this.state.publicar,
                    inventariado: false,
                    negativo: false,
                    preferido: this.state.preferido,
                    estado: this.state.estado,
                    idUsuario: this.state.idUsuario
                }

                const response = await updateProducto(data);
                if (response instanceof SuccessReponse) {
                    alertSuccess("Producto - Combo", response.data, () => {
                        this.props.history.goBack();
                    })
                }

                if (response instanceof ErrorResponse) {
                    alertWarning("Producto - Combo", response.getMessage())
                }
            }
        });
    }

    handleRegistrar = () => {
        if (this.state.tipo === "TP0001") {
            this.handleSaveProducto();
            return;
        }

        if (this.state.tipo === "TP0002") {
            this.handleSaveServicio();
            return;
        }

        if (this.state.tipo === "TP0003") {
            this.handleSaveCombo();
            return;
        }
    }

    handleCerrar = () => {
        this.props.history.goBack()
    }

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

        const { tipo } = this.state;

        const { nombreProducto, codigoProducto, codigoSunatProducto, } = this.state;

        const { idMedidaProducto, idCategoriaProducto, descripcionProducto } = this.state;

        const { idTipoVentaProducto } = this.state;

        const { precioProducto, costoProducto, precios } = this.state;

        const { medidas, categorias, publicar, negativo, inventariado, preferido, estado } = this.state;

        const { nombreServicio, codigoServicio, codigoSunatServicio } = this.state;

        const { idMedidaServicio, idCategoriaServicio, descripcionServicio } = this.state;

        const { precioServicio } = this.state;

        const { nombreCombo, codigoCombo, codigoSunatCombo } = this.state;

        const { idMedidaCombo, idCategoriaCombo, descripcionCombo } = this.state;

        const { precioCombo, combos } = this.state;

        const { imagen } = this.state;

        return (
            <ContainerWrapper>

                {
                    this.state.loading && spinnerLoading(this.state.msgLoading)
                }

                <ModalProducto
                    idModalProducto={this.idModalProducto}

                    loadModal={this.state.loadModal}
                    productos={this.state.productos}

                    refIdProductoCombo={this.refIdProductoCombo}
                    refCantidadCombo={this.refCantidadCombo}
                    refUnidadCombo={this.refUnidadCombo}
                    refCostoCombo={this.refCostoCombo}

                    handleSelectProductoCombo={this.handleSelectProductoCombo}
                    handleSaveItemCombo={this.handleSaveItemCombo}
                />

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-12'>
                        <div className="form-group">
                            <h5>
                                <span role="button" onClick={() => this.props.history.goBack()}><i className="bi bi-arrow-left-short"></i></span> Producto
                                <small className="text-secondary"> Editar</small>
                            </h5>
                        </div>
                    </div>
                </div>

                <div className='row'>
                    <div className='col-xl-8 col-lg-12 col-md-12 col-sm-12 col-12'>
                        <div className='row'>
                            <div className='col-lg-12 col-md-12 col-sm-12 col-12'>
                                <ul className="nav nav-tabs" id="myTab" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <button className="nav-link active"
                                            id="addproducto-tab"
                                            data-bs-toggle="tab"
                                            href="#addproducto"
                                            type="button"
                                            role="tab"
                                            aria-controls="addproducto"
                                            aria-selected={true}
                                            disabled={tipo !== "TP0001"}>
                                            <i className="bi bi-info-circle"></i> Producto
                                        </button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button className="nav-link"
                                            id="addservicio-tab"
                                            data-bs-toggle="tab"
                                            href="#addservicio"
                                            type="button"
                                            role="tab"
                                            aria-controls="addservicio"
                                            aria-selected={false}
                                            disabled={tipo !== "TP0002"}>
                                            <i className="bi bi-card-checklist"></i> Servicio
                                        </button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button className="nav-link"
                                            id="addcombo-tab"
                                            data-bs-toggle="tab"
                                            href="#addcombo"
                                            type="button"
                                            role="tab"
                                            aria-controls="addcombo"
                                            aria-selected={false}
                                            disabled={tipo !== "TP0003"}>
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

                                        descripcion={descripcionProducto}
                                        refDescripcion={this.refDescripcionProducto}
                                        handleInputDescripcion={this.handleInputDescripcionProducto}

                                        idTipoVenta={idTipoVentaProducto}
                                        handleOptionTipoVenta={this.handleOptionTipoVentaProducto}

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
                                        handleAddPrecio={this.handleAddPrecioProducto}
                                        handleRemovePrecio={this.handleRemovePrecioProducto}

                                        activarInventario={false}
                                        inventario={{}}
                                        handleAddItemInventario={() => { }}
                                        handleRemoveItemInventario={() => { }}
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

                                        descripcion={descripcionServicio}
                                        refDescripcion={this.refDescripcionServicio}
                                        handleInputDescripcion={this.handleInpuDescripcionServicio}

                                        precio={precioServicio}
                                        refPrecio={this.refPrecioServicio}
                                        handleInputPrecio={this.handleInpuPrecioServicio}
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

                                        descripcion={descripcionCombo}
                                        refDescripcion={this.refDescripcionCombo}
                                        handleInputDescripcion={this.handleInputDescripcionCombo}

                                        precio={precioCombo}
                                        refPrecio={this.refPrecioCombo}
                                        handleInputPrecio={this.handleInputPrecioCombo}

                                        combos={combos}
                                        handleAddItemCombo={this.handleAddItemCombo}
                                        handleInputCantidadCombos={this.handleInputCantidadCombos}
                                        handleRemoveItemCombo={this.handleRemoveItemCombo}

                                        activarInventario={false}
                                        inventario={[]}
                                        handleAddItemInventario={() => { }}
                                        handleRemoveItemInventario={() => { }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='col-xl-4 col-lg-12 col-md-12 col-sm-12 col-12'>
                        <DetalleImagen
                            tipo={tipo}

                            imagen={imagen}
                            refFileImagen={this.refFileImagen}
                            handleInputImagen={this.handleInputImagen}
                            handleRemoveImagen={this.handleRemoveImagen}

                            nombre={tipo === "TP0001" ? nombreProducto : tipo === "TP0002" ? nombreServicio : nombreCombo}
                            precio={tipo === "TP0001" ? precioProducto : tipo === "TP0002" ? precioServicio : precioCombo}

                            publicar={publicar}
                            handleSelectPublico={this.handleSelectPublico}

                            negativo={negativo}
                            handleSelectNegativo={this.handleSelectNegativo}

                            inventariado={inventariado}
                            handleSelectInventariado={this.handleSelectInventariado}

                            preferido={preferido}
                            handleSelectPreferido={this.handleSelectPreferido}

                            estado={estado}
                            handleSelectEstado={this.handleSelectEstado}

                            handleRegistrar={this.handleRegistrar}
                            handleCerrar={this.handleCerrar}
                        />
                    </div>
                </div>

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
        token: state.reducer
    }
}

/**
 * 
 * Método encargado de conectar con redux y exportar la clase
 */
export default connect(mapStateToProps, null)(ProductoEditar);