import React from 'react';
import CustomComponent from '../../../../model/class/custom-component';
import ContainerWrapper from '../../../../components/Container';
import { images } from '../../../../helper';
import { alertDialog, alertInfo, alertSuccess, alertWarning, clearModal, hideModal, isNumeric, isText, keyNumberFloat, showModal, spinnerLoading, viewModal } from '../../../../helper/utils.helper';
import { addProducto, comboAlmacen, comboMedida, listComboCategoria } from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import ModalInventario from './component/ModalInventario';
import { CANCELED } from '../../../../model/types/types';
import { connect } from 'react-redux';
import Producto from './component/Producto';
import Servicio from './component/Servicio';
import Combo from './component/Combo';

class ProductoAgregar extends CustomComponent {

    /**
     * 
     * Constructor
     */
    constructor(props) {
        super(props);
        this.state = {
            imagen: images.noImage,
            nombre: '',
            codigo: '',
            codigoSunat: '',

            idMedida: '',
            medidas: [],

            idCategoria: '',
            categorias: [],

            descripcion: '',

            precio: '',
            costo: '',

            almacenes: [],
            idAlmacen: '',
            nombreAlmacen: '',
            cantidad: '',
            cantidadMaxima: '',
            cantidadMinima: '',

            idUsuario: this.props.token.userToken.idUsuario,

            tipo: 1,

            loadModal: false,

            loading: true,
            msgLoading: 'Cargando datos...'
        }

        this.idModalInventario = "modalInventario";

        this.refNombre = React.createRef();
        this.refCodigo = React.createRef();
        this.refCodigoSunat = React.createRef();
        this.refIdMedida = React.createRef();
        this.refIdCategoria = React.createRef();
        this.refDescripcion = React.createRef();

        this.refPrecio = React.createRef();
        this.refCosto = React.createRef();

        this.refIdAlmacen = React.createRef();
        this.refCantidad = React.createRef();
        this.refCantidadMaxima = React.createRef();
        this.refCantidadMinima = React.createRef();
    }

    /**
     * Método de cliclo de vida
     */
    componentDidMount() {
        this.loadingData();

        viewModal(this.idModalInventario, async () => {
            const almacenes = await this.fetchComboAlmacen();

            this.setState({
                almacenes: almacenes,
                loadModal: false
            });
        });

        clearModal(this.idModalInventario, async () => {
        });
    }

    componentWillUnmount() {

    }


    /**
     * 
     * Métodos de acción
     */

    loadingData = async () => {
        const [medidas, categorias] = await Promise.all([
            await this.fetchComboMedida(),
            await this.fetchComboCategoria()
        ]);

        await this.setStateAsync({
            medidas,
            categorias,
            loading: false
        });
    };

    async fetchComboMedida() {
        const response = await comboMedida();

        if (response instanceof SuccessReponse) {
            return response.data
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            return [];
        }
    }

    async fetchComboCategoria() {
        const response = await listComboCategoria();

        if (response instanceof SuccessReponse) {
            return response.data
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            return [];
        }
    }

    async fetchComboAlmacen() {
        const response = await comboAlmacen();

        if (response instanceof SuccessReponse) {
            return response.data
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            return [];
        }
    }


    /**
     * Método de eventos
     */

    handleSelectNombre = (event) => {
        this.setState({
            nombre: event.target.value
        });
    }


    handleSelectCodigo = (event) => {
        this.setState({
            codigo: event.target.value
        });
    }

    handleSelectCodigoSunat = (event) => {
        this.setState({
            codigoSunat: event.target.value
        });
    }

    handleSelectIdMedida = (event) => {
        this.setState({
            idMedida: event.target.value
        });
    }

    handleSelectIdCategoria = (event) => {
        this.setState({
            idCategoria: event.target.value
        });
    }

    handleInputDescripcion = (event) => {
        this.setState({
            descripcion: event.target.value
        });
    }

    handleInputPrecio = (event) => {
        this.setState({
            precio: event.target.value
        });
    }

    handleInputCosto = (event) => {
        this.setState({
            costo: event.target.value
        });
    }

    handleOpenAlmacen = async () => {
        showModal(this.idModalInventario);
        this.refIdAlmacen.current.value = this.state.idAlmacen
        this.refCantidad.current.value = this.state.cantidad
        this.refCantidadMaxima.current.value = this.state.cantidadMaxima
        this.refCantidadMinima.current.value = this.state.cantidadMinima
        await this.setStateAsync({
            loadModal: true
        })
    }

    handleSaveAlmacen = () => {
        if (!isText(this.refIdAlmacen.current.value)) {
            alertWarning("Producto", "Seleccione el almacen.", () => {
                this.refIdAlmacen.current.focus();
            });
            return;
        }

        if (!isText(this.refCantidad.current.value)) {
            alertWarning("Producto", "Ingrese la cantidad inicial.", () => {
                this.refCantidad.current.focus();
            });
            return;
        }

        if (!isText(this.refCantidadMaxima.current.value)) {
            alertWarning("Producto", "Ingrese la cantidad máxima.", () => {
                this.refCantidadMaxima.current.focus();
            });
            return;
        }

        if (!isText(this.refCantidadMinima.current.value)) {
            alertWarning("Producto", "Ingrese la cantidad mínima.", () => {
                this.refCantidadMinima.current.focus();
            });
            return;
        }

        this.setState({
            idAlmacen: this.refIdAlmacen.current.value,
            nombreAlmacen: this.refIdAlmacen.current.options[this.refIdAlmacen.current.selectedIndex].innerText,
            cantidad: this.refCantidad.current.value,
            cantidadMaxima: this.refCantidadMaxima.current.value,
            cantidadMinima: this.refCantidadMinima.current.value,
        })

        hideModal(this.idModalInventario)
    }

    /**
     * Esta es una función se encarga de activar un tab automáticamente al llamar la función
     *
     * @param {string} idTab - Id del tab
     * @param {string} idContent - Id del contendor
     * @returns {void}
     *
     * @example
     * handleFocusTab("info-tab", "info");
     */
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

            console.log(idTab, idContent)
        }
    }


    /**
    * Esta es una función se encarga de registrar un nuevo producto
    *
    * @returns {void}
    *
    * @example
    * handleRegistrar();
    */
    handleRegistrar = () => {
        if (!isText(this.state.nombre)) {
            alertWarning("Producto", "Ingrese el nombre del producto.", () => {
                this.refNombre.current.focus();
            });
            return;
        }

        if (!isText(this.state.idMedida)) {
            alertWarning("Producto", "Seleccione la medida.", () => {
                this.refIdMedida.current.focus();
            });
            return;
        }

        if (!isText(this.state.idCategoria)) {
            alertWarning("Producto", "Seleccione la categoría.", () => {
                this.refIdCategoria.current.focus();
            });
            return;
        }

        if (!isNumeric(this.state.precio)) {
            alertWarning("Producto", "Ingrese el precio.", () => {
                this.refPrecio.current.focus();
            });
            return;
        }

        if (!isNumeric(this.state.costo)) {
            alertWarning("Producto", "Ingrese el costo.", () => {
                this.refCosto.current.focus();
            });
            return;
        }

        if (!isText(this.state.idAlmacen)) {
            alertWarning("Producto", "Agrega el almacen.", () => {
                this.handleOpenAlmacen()
            });
            return;
        }

        alertDialog("Producto", "¿Estás seguro de continuar?", async (event) => {
            if (event) {
                alertInfo("Producto", "Procesando información...")
                const data = {
                    nombre: this.state.nombre,
                    codigo: this.state.codigo,
                    codigoSunat: this.state.codigoSunat,
                    idMedida: this.state.idMedida,
                    idCategoria: this.state.idCategoria,
                    descripcion: this.state.descripcion,
                    precio: this.state.precio,
                    costo: this.state.costo,
                    idAlmacen: this.state.idAlmacen,
                    cantidad: this.state.cantidad,
                    cantidadMaxima: this.state.cantidadMaxima,
                    cantidadMinima: this.state.cantidadMinima,
                    tipo: this.state.tipo,
                    idUsuario: this.state.idUsuario
                }

                const response = await addProducto(data);
                if (response instanceof SuccessReponse) {
                    alertSuccess("Producto", response.data, () => {
                        // this.props.history.goBack();
                    })
                }

                if (response instanceof ErrorResponse) {
                    alertWarning("Producto", response.getMessage())
                }
            }
        });
    }

    render() {

        const { nombre, codigo, codigoSunat, idMedida, idCategoria, descripcion, precio, costo } = this.state;

        const { idAlmacen, nombreAlmacen, cantidad, cantidadMinima, cantidadMaxima } = this.state;

        const { medidas, categorias } = this.state;

        return (
            <ContainerWrapper>

                <ModalInventario
                    loadModal={this.state.loadModal}
                    almacenes={this.state.almacenes}

                    idModalInventario={this.idModalInventario}

                    refIdAlmacen={this.refIdAlmacen}
                    refCantidad={this.refCantidad}
                    refCantidadMaxima={this.refCantidadMaxima}
                    refCantidadMinima={this.refCantidadMinima}

                    handleSaveAlmacen={this.handleSaveAlmacen}
                />

                {
                    this.state.loading &&
                    <div className="clearfix absolute-all bg-white">
                        {spinnerLoading(this.state.msgLoading)}
                    </div>
                }

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>
                                <span role="button" onClick={() => this.props.history.goBack()}><i className="bi bi-arrow-left-short"></i></span> Producto
                                <small className="text-secondary"> Agregar</small>
                            </h5>
                        </div>
                    </div>
                </div>

                <div className='row'>
                    <div className='col-xl-8 col-lg-8 col-md-12 col-sm-12 col-12'>
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
                                            onClick={() => this.setState({ tipo: 1 })}>
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
                                            onClick={() => this.setState({ tipo: 2 })}>
                                            <i className="bi bi-geo-alt-fill"></i> Servicio
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
                                            onClick={() => this.setState({ tipo: 3 })}>
                                            <i className="bi bi-border-all"></i> Combo
                                        </button>
                                    </li>
                                </ul>

                                <div className="tab-content pt-2" id="myTabContent">
                                    <Producto
                                        nombre={nombre}
                                        refNombre={this.refNombre}
                                        handleSelectNombre={this.handleSelectNombre}

                                        codigo={codigo}
                                        refCodigo={this.refCodigo}
                                        handleSelectCodigo={this.handleSelectCodigo}

                                        codigoSunat={codigoSunat}
                                        refCodigoSunat={this.refCodigoSunat}
                                        handleSelectCodigoSunat={this.handleSelectCodigoSunat}

                                        idMedida={idMedida}
                                        refIdMedida={this.refIdMedida}
                                        handleSelectIdMedida={this.handleSelectIdMedida}
                                        medidas={medidas}

                                        idCategoria={idCategoria}
                                        refIdCategoria={this.refIdCategoria}
                                        handleSelectIdCategoria={this.handleSelectIdCategoria}
                                        categorias={categorias}

                                        descripcion={descripcion}
                                        refDescripcion={this.refDescripcion}
                                        handleInputDescripcion={this.handleInputDescripcion}

                                        precio={precio}
                                        refPrecio={this.refPrecio}
                                        handleInputPrecio={this.handleInputPrecio}

                                        costo={costo}
                                        refCosto={this.refCosto}
                                        handleInputCosto={this.handleInputCosto}

                                        idAlmacen={idAlmacen}
                                        nombreAlmacen={nombreAlmacen}
                                        cantidad={cantidad}
                                        cantidadMinima={cantidadMinima}
                                        cantidadMaxima={cantidadMaxima}

                                        handleOpenAlmacen={this.handleOpenAlmacen}
                                    />

                                    <Servicio />

                                    <Combo />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='col-xl-4 col-lg-4 col-md-12 col-sm-12 col-12'>
                        <div className="row">
                            <div className="col-md-10 col-sm-12 col-12 text-center">
                                <img src={this.state.imagen} alt="" className="card-img-top" />
                            </div>
                        </div>

                        <div className="form-row p-4">
                            <div className="form-group col-md-12">
                                <div className="form-row">
                                    <h4 className="text-black-50">{this.state.nombre !== '' ? this.state.nombre : "Producto sin nombre"}</h4>
                                </div>
                                <div className="form-row">
                                    <h2 className="text-black-50">S/ 0.00 PEN</h2>
                                </div>
                            </div>

                            <div className="dropdown-divider"></div>

                            <div className="form-group col-md-12">
                                <div className="form-row">
                                    <div className="form-group col-md-12">
                                        <div className="custom-control custom-switch">
                                            <label className="custom-control-label" for="customSwitch1">
                                                <div className="font-weight-bold text-black-50 ">Inventariable</div>
                                                <div className="text-black-50">Controla costos y cantidades</div>
                                            </label>
                                            <input type="checkbox" className="custom-control-input " id="customSwitch1" />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-12">
                                        <div className="custom-control custom-switch">
                                            <label className="custom-control-label" for="customSwitch1">
                                                <div className="font-weight-bold text-black-50 ">Venta en negativo</div>
                                                <div className="text-black-50">Vende sin unidades disponibles</div>
                                            </label>
                                            <input type="checkbox" className="custom-control-input" id="customSwitch1" />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="col-md-12">
                                        <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-block"
                                                    onClick={this.handleRegistrar}>
                                                    Guardar
                                                </button>
                                            </div>
                                            <div className="form-group col-md-6">
                                                <button type="button" className="btn btn-secondary btn-block ml-2" >
                                                    Cerrar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
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
export default connect(mapStateToProps, null)(ProductoAgregar);