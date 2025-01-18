import React from "react";
import Row from "../../../../components/Row";
import Column from "../../../../components/Column";
import SearchInput from "../../../../components/SearchInput";
import Image from "../../../../components/Image";
import { images } from "../../../../helper";
import { Card, CardBody, CardHeader, CardTitle } from "../../../../components/Card";
import Input from "../../../../components/Input";
import { isEmpty } from "../../../../helper/utils.helper";
import { createCatalogProducto, documentsPdfCatalogProducto, filtrarCatalogProductos, filtrarProducto } from "../../../../network/rest/principal.network";
import SuccessReponse from "../../../../model/class/response";
import ErrorResponse from "../../../../model/class/error-response";
import Search from "../../../../components/Search";
import Button from "../../../../components/Button";
import CustomComponent from "../../../../model/class/custom-component";
import pdfVisualizer from "pdf-visualizer";
import SweetAlert from "../../../../model/class/sweet-alert";
import { CANCELED } from "../../../../model/types/types";
import { SpinnerTransparent } from "../../../../components/Spinner";

class Catalogo extends CustomComponent {

    /**
     * Inicializa un nuevo componente.
     * @param {Object} props - Las propiedades pasadas al componente.
     */
    constructor(props) {
        super(props);

        this.state = {
            producto: null,
            productos: [],

            seleccionados: [],

            catalogo: null,
            catalogos: [],
            loadingCatalogos: false,

            nombre: '',

            idUsuario: this.props.idUsuario,
        };

        this.alert = new SweetAlert();

        this.refProducto = React.createRef();
        this.refValueProducto = React.createRef();

        this.reCatalogo = React.createRef();
        this.refValueCatalogo = React.createRef();

        this.refNombre = React.createRef();

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

    async fetchFiltrarProducto(params) {
        const response = await filtrarProducto(params);

        if (response instanceof SuccessReponse) {
            return response.data;
        }

        if (response instanceof ErrorResponse) {
            return [];
        }
    }

    async fetchFiltrarCatalogo(params) {
        const response = await filtrarCatalogProductos(params);

        if (response instanceof SuccessReponse) {
            return response.data;
        }

        if (response instanceof ErrorResponse) {
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
            filtrar: searchWord,
        };

        const productos = await this.fetchFiltrarProducto(params);

        // Filtrar productos por tipoProducto !== "SERVICIO"
        const filteredProductos = productos.filter((item) => item.tipoProducto !== 'SERVICIO');

        this.setState({
            productos: filteredProductos,
        });
    }

    handleSelectItemProducto = async (value) => {
        this.refProducto.current.initialize(value.nombre);

        const filter = this.state.seleccionados.some((item) => item.idProducto === value.idProducto);
        if (!filter) {
            await this.setStateAsync({
                producto: value,
                productos: [],
                seleccionados: [...this.state.seleccionados, value],
            });
        }

        this.refValueProducto.current.focus();
        this.refValueProducto.current.select();
    }

    //------------------------------------------------------------------------------------------
    // Proceso de guardar o generar catálogo
    //------------------------------------------------------------------------------------------

    handleRemoveSeleccionado = (producto) => {
        const list = this.state.seleccionados.filter(item => item.idProducto !== producto.idProducto);
        this.setState({ seleccionados: list });
    }

    handleSaveCatalogo = () => {
        const { nombre, seleccionados, idUsuario } = this.state;


        if (isEmpty(nombre)) {
            this.alert.warning('Catálogo', 'Ingrese el nombre del catálogo.', () =>
                this.refNombre.current.focus(),
            );
            return;
        }

        if (isEmpty(seleccionados)) {
            this.alert.warning('Catálogo', 'Agregar algún producto a la lista.', () =>
                this.refValueProducto.current.focus(),
            );
            return;
        }

        this.alert.dialog('Catálogo', '¿Está seguro de continuar?', async (accept) => {
            if (accept) {
                const data = {
                    nombre: nombre,
                    productos: seleccionados,
                    idUsuario: idUsuario,
                };

                this.alert.information('Catálogo', 'Procesando información...');

                const response = await createCatalogProducto(data);

                if (response instanceof SuccessReponse) {
                    this.alert.close();
                    this.setState({ seleccionados: [], nombre: '' });
                    this.handleGenerateCatalogo(response.data.idPedido);
                }

                if (response instanceof ErrorResponse) {
                    if (response.getType() === CANCELED) return;

                    this.alert.warning('Catálogo', response.getMessage());
                }
            }
        });
    }

    handleGenerateCatalogo = async (idCatalogo) => {
        await pdfVisualizer.init({
            url: documentsPdfCatalogProducto(idCatalogo),
            title: 'Catálogo de Productos',
            titlePageNumber: 'Página',
            titleLoading: 'Cargando...',
        });
    }

    //------------------------------------------------------------------------------------------
    // Filtrar catalogos
    //------------------------------------------------------------------------------------------

    handleClearInputCatalogo = () => {
        this.setState({
            catalogos: [],
            catalogo: null,
        });
        this.reCatalogo.current.restart();
        this.refValueCatalogo.current.focus();
    }

    handleFilterCatalogo = async (tipo, value) => {
        const searchWord = value;
        this.setState({ catalogo: null });

        if (isEmpty(searchWord)) {
            this.setState({ catalogos: [] });
            return;
        }

        this.setState({ loadingCatalogos: true });

        const params = {
            tipo: tipo,
            filtrar: searchWord,
        };

        const catalogos = await this.fetchFiltrarCatalogo(params);

        this.setState({
            catalogos,
            loadingCatalogos: false
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
            <>
                <Row>
                    <Column className="mb-3 col-md-6 col-sm-12 col-12">
                        <Card className="h-100">
                            <CardHeader>
                                <CardTitle>Productos Disponisbles</CardTitle>
                            </CardHeader>
                            <CardBody>
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
                                    renderIconLeft={<i className="bi bi-search"></i>}
                                />
                            </CardBody>
                        </Card>
                    </Column>

                    <Column className="mb-3 col-md-6 col-sm-12 col-12">
                        <Card className="h-100">
                            <CardHeader>
                                <CardTitle>Productos Seleccionados</CardTitle>
                            </CardHeader>
                            <CardBody>

                                <Input
                                    label={"Nombre del Catálogo:"}
                                    placeholder="Ingrese el valor..."
                                    value={this.state.nombre}
                                    onChange={(event) => {
                                        this.setState({ nombre: event.target.value })
                                    }}
                                    refInput={this.refNombre}
                                />

                                <br />

                                {
                                    this.state.seleccionados.map((item, index) => {
                                        return (
                                            <div key={index} className="d-flex align-items-center justify-content-between mb-3">
                                                <div className="d-flex align-items-center">
                                                    <Image
                                                        default={images.noImage}
                                                        src={item.imagen}
                                                        alt={item.nombre}
                                                        width={60}
                                                    />

                                                    <div className='ml-2 mr-2'>
                                                        {item.codigo}
                                                        <br />
                                                        {item.nombre} <small>({item.categoria})</small>
                                                    </div>
                                                </div>

                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => this.handleRemoveSeleccionado(item)}
                                                >
                                                    <i className="fa fa-minus"></i>
                                                </button>
                                            </div>
                                        );
                                    })
                                }

                                <button className="btn btn-dark w-100 mb-3"
                                    onClick={this.handleSaveCatalogo}>
                                    <i className="fa fa-save"></i> Guardar Catálogo
                                </button>

                                {/* <button className="btn btn-outline-light w-100"
                                    onClick={this.handleGenerateCatalogo}>
                                    <i className="fa fa-file"></i> Generar Catálogo
                                </button> */}

                            </CardBody>
                        </Card>
                    </Column>
                </Row>

                <Row>
                    <Column>
                        <Card className="h-100">
                            <CardHeader>
                                <CardTitle>Catálogos Anteriores</CardTitle>
                            </CardHeader>
                            <CardBody>
                                <Search
                                    ref={this.reCatalogo}
                                    refInput={this.refValueCatalogo}
                                    group={true}
                                    iconLeft={<i className="bi bi-search"></i>}
                                    onSearch={this.handleFilterCatalogo.bind(this, 1)}
                                    placeholder="Buscar..."
                                    buttonRight={
                                        <>
                                            <Button
                                                className="btn-outline-success"
                                                title="Cargar Todo"
                                                icono={<i className="fa fa-filter"></i>}
                                                onClick={this.handleFilterCatalogo.bind(this, 0)}
                                            />
                                            <Button
                                                className="btn-outline-secondary"
                                                title="Limpiar"
                                                icono={<i className="fa fa-close"></i>}
                                                onClick={this.handleClearInputCatalogo}
                                            />
                                        </>
                                    }
                                />

                                {
                                    isEmpty(this.state.catalogos) && !this.state.loadingCatalogos &&
                                    <div className='position-relative w-100 p-3 text-center'>
                                        <i className="fa fa-warning"></i>
                                        <p className="m-0">Filtrar para encontrar un catálogo o has click el botón todos <i className="fa fa-filter"></i>.</p>
                                    </div>
                                }

                                {
                                    this.state.loadingCatalogos &&
                                    <div className='position-relative w-100 p-3' >
                                        <SpinnerTransparent
                                            loading={true}
                                            message={"Buscando catálogos..."}
                                        />
                                    </div>
                                }

                                <div className="py-3">
                                    {
                                        !isEmpty(this.state.catalogos) && this.state.catalogos.map((item, index) => {

                                            return (

                                                <div key={index} className="d-flex align-items-center justify-content-between mb-3">
                                                    <div className="d-flex align-items-center">
                                                        <span>
                                                            {index + 1}.   {item.nombre}
                                                        </span>
                                                    </div>

                                                    <button className="btn btn-dark"
                                                        onClick={() => this.handleGenerateCatalogo(item.idCatalogo)}>
                                                        <i className="fa fa-file"></i> Ver
                                                    </button>
                                                </div>

                                            );
                                        })
                                    }
                                </div>
                            </CardBody>
                        </Card>
                    </Column>
                </Row>
            </>
        );
    }
}

export default Catalogo;