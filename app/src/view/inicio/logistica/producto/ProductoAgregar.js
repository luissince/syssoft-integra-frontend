import React from 'react';
import CustomComponent from '../../../../model/class/custom-component';
import ContainerWrapper from '../../../../components/Container';
import { images } from '../../../../helper';
import { alertDialog, alertInfo, alertSuccess, alertWarning, keyNumberFloat } from '../../../../helper/utils.helper';
import { addProducto } from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';

class ProductoAgregar extends CustomComponent {

    constructor(props) {
        super(props);
        this.state = {
            imagen: images.noImage,
            nombre: '',
            codigo: '',
            codigoSunat: '',
            idMedida: '',
            idCategoria: '',
            descripcion: '',

            precio: '',
            costo: '',
        }

        this.refNombre = React.createRef();
        this.refCodigo = React.createRef();
        this.refCodigoSunat = React.createRef();
        this.refIdMedida = React.createRef();
        this.refIdCategoria = React.createRef();
        this.refDescripcion = React.createRef();

        this.refPrecio = React.createRef();
        this.refCosto = React.createRef();
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

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
        if (this.state.nombre === "") {
            this.refNombre.current.focus();
            return;
        }

        if (this.state.codigo === "") {
            this.refNombre.current.focus();
            return;
        }

        if (this.state.codigoSunat === "") {
            this.refCodigoSunat.current.focus();
            return;
        }

        if (this.state.idMedida === "") {
            this.refIdMedida.current.focus();
            return;
        }

        if (this.state.idCategoria === "") {
            this.refIdCategoria.current.focus();
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
                    descripcion: this.state.descripcion
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

        return (
            <ContainerWrapper>

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
                                        <a className="nav-link active"
                                            id="addproducto-tab"
                                            data-bs-toggle="tab"
                                            href="#addproducto"
                                            role="tab"
                                            aria-controls="addproducto"
                                            aria-selected={true}>
                                            <i className="bi bi-info-circle"></i> Producto
                                        </a>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <a className="nav-link"
                                            id="addservicio-tab"
                                            data-bs-toggle="tab"
                                            href="#addservicio"
                                            role="tab"
                                            aria-controls="addservicio"
                                            aria-selected={false}>
                                            <i className="bi bi-geo-alt-fill"></i> Servicio
                                        </a>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <a className="nav-link"
                                            id="addcombo-tab"
                                            data-bs-toggle="tab"
                                            href="#addcombo"
                                            role="tab"
                                            aria-controls="addcombo"
                                            aria-selected={false}>
                                            <i className="bi bi-border-all"></i> Combo
                                        </a>
                                    </li>
                                </ul>
                                <div className="tab-content pt-2" id="myTabContent">

                                    <div className="tab-pane fade show active show" id="addproducto" role="tabpanel" aria-labelledby="addproducto-tab">
                                        {/* SECTOR TITULO*/}
                                        <div className='row'>
                                            <div className="form-group col-md-12">
                                                <label>
                                                    Crea los bienes y mercancías que vendes e indica si deseas tener el control de tu inventario.
                                                </label>
                                            </div>

                                        </div>
                                        <div className="dropdown-divider"></div>

                                        {/* SECTOR INFORMACIÓN GENERAL */}
                                        <div className='row'>
                                            <div className="form-group col-md-12">
                                                <label>Nombre del producto: <i className="fa fa-asterisk text-danger small"></i></label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${nombre ? "" : "is-invalid"}`}
                                                    aria-describedby="inputError"
                                                    placeholder="Dijite un nombre..."
                                                    ref={this.refNombre}
                                                    value={nombre}
                                                    onChange={this.handleSelectNombre}
                                                />
                                                {nombre === "" && <div className="invalid-feedback">
                                                    Rellene el campo.
                                                </div>}
                                            </div>

                                            <div className="form-group col-md-6">
                                                <label>Referencia: <i className="fa fa-asterisk text-danger small"></i></label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${codigo ? "" : "is-invalid"}`}
                                                    placeholder="Ejemplo: CAS002 ..."
                                                    ref={this.refCodigo}
                                                    value={codigo}
                                                    onChange={this.handleSelectCodigo}
                                                />
                                                {codigo === "" && <div className="invalid-feedback">
                                                    Rellene el campo.
                                                </div>}
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Código producto SUNAT: <i className="fa fa-asterisk text-danger small"></i></label>
                                                <div className="input-group">
                                                    <select
                                                        className={`form-control ${codigoSunat ? "" : "is-invalid"}`}
                                                        ref={this.refCodigoSunat}
                                                        value={codigoSunat}
                                                        onChange={this.handleSelectCodigoSunat}
                                                    >
                                                        <option value="">-- Selecciona --</option>
                                                        <option value="1">codigo 01</option>
                                                        <option value="2">código 02</option>
                                                    </select>
                                                    {codigoSunat === "" && <div className="invalid-feedback">
                                                        Seleccione el campo.
                                                    </div>}
                                                </div>
                                            </div>

                                            <div className="form-group col-md-6">
                                                <label>Unidad de medida: <i className="fa fa-asterisk text-danger small"></i></label>
                                                <div className="input-group">
                                                    <select
                                                        className={`form-control ${idMedida ? "" : "is-invalid"}`}
                                                        ref={this.refIdMedida}
                                                        value={idMedida}
                                                        onChange={this.handleSelectIdMedida}
                                                    >
                                                        <option value="">-- Selecciona --</option>
                                                        <option value="1">medida 01</option>
                                                        <option value="2">medida 02</option>
                                                    </select>
                                                    {idMedida === "" && <div className="invalid-feedback">
                                                        Seleccione el campo.
                                                    </div>}
                                                </div>
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Categoria: <i className="fa fa-asterisk text-danger small"></i></label>
                                                <div className="input-group">
                                                    <select
                                                        className={`form-control ${idCategoria ? "" : "is-invalid"}`}
                                                        ref={this.refIdCategoria}
                                                        value={idCategoria}
                                                        onChange={this.handleSelectIdCategoria}
                                                    >
                                                        <option value="">-- Selecciona --</option>
                                                        <option value="1">categoria 01</option>
                                                        <option value="2">categoria 02</option>
                                                    </select>
                                                    {idCategoria === "" && <div className="invalid-feedback">
                                                        Seleccione el campo.
                                                    </div>}
                                                </div>
                                            </div>

                                            <div className="form-group col-md-12">
                                                <label>Descripción: <i className="fa fa-asterisk text-danger small"></i></label>
                                                <textarea
                                                    className={`form-control ${descripcion ? "" : "is-invalid"}`}
                                                    id=""
                                                    rows="3"
                                                    ref={this.refDescripcion}
                                                    value={descripcion}
                                                    onChange={this.handleInputDescripcion}
                                                >
                                                </textarea>
                                                {descripcion === "" && <div className="invalid-feedback">
                                                    Rellene el campo.
                                                </div>}
                                            </div>
                                        </div>

                                        {/* SECTOR PRECIO */}
                                        <div className='row pt-3'>
                                            <div className='col-12'>
                                                <div className='form-group'>
                                                    <h5>
                                                        PRECIO
                                                    </h5>
                                                </div>

                                                <div className="dropdown-divider"></div>

                                                <div className="form-group">
                                                    <label>
                                                        Indica el valor de venta y el costo de compra de tu producto.
                                                    </label>
                                                </div>

                                                <div className="form-row">
                                                    <div className="form-group col-lg-3 col-md-12 col-sm-12">
                                                        <label>Precio base: <i className="fa fa-asterisk text-danger small"></i></label>
                                                        <input
                                                            type="text"
                                                            className={`form-control ${precio ? "" : "is-invalid"}`}
                                                            placeholder=" S/ 0.00"
                                                            ref={this.refPrecio}
                                                            value={precio}
                                                            onChange={this.handleInputPrecio}
                                                            onKeyDown={keyNumberFloat}
                                                        />
                                                        {precio === "" && <div className="invalid-feedback">
                                                            Rellene el campo.
                                                        </div>}
                                                    </div>
                                                    <div className="form-group col-lg-1 col-md-12 col-sm-12">
                                                        <div className="d-flex justify-content-center mt-2" style={{ "paddingTop": "33px" }}>
                                                            <i className="fa fa-minus" aria-hidden="true"></i>
                                                        </div>
                                                    </div>
                                                    <div className="form-group col-lg-3 col-md-12 col-sm-12">
                                                        <label>Costo inicial: <i className="fa fa-asterisk text-danger small"></i></label>
                                                        <input
                                                            type="text"
                                                            className={`form-control ${costo ? "" : "is-invalid"}`}
                                                            placeholder="S/ 0.00"
                                                            ref={this.refCosto}
                                                            value={costo}
                                                            onChange={this.handleInputCosto}
                                                            onKeyDown={keyNumberFloat}
                                                        />
                                                        {costo === "" && <div className="invalid-feedback">
                                                            Rellene el campo.
                                                        </div>}
                                                    </div>
                                                    <div className="form-group col-lg-1 col-md-12 col-sm-12">
                                                        <div className="d-flex justify-content-center mt-2" style={{ "paddingTop": "33px" }}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
                                                                <path d="M48 128c-17.7 0-32 14.3-32 32s14.3 32 32 32H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H48zm0 192c-17.7 0-32 14.3-32 32s14.3 32 32 32H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H48z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div className="form-group col-lg-4 col-md-12 col-sm-12">
                                                        <label>Utilidad: </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="S/ 0.00"
                                                            disabled />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* SECTOR INVENTARIO */}
                                        <div className='row pt-3'>
                                            <div className='col-12'>
                                                <div className='form-group'>
                                                    <h5>
                                                        DETALLE DE INVENTARIO
                                                    </h5>
                                                </div>

                                                <div className="dropdown-divider"></div>

                                                <div className="form-group">
                                                    <label>
                                                        Distribuye y controla las cantidades de tus productos en diferentes lugares.
                                                    </label>
                                                </div>

                                                <div className="form-row">
                                                    <div className="form-group col-md-2 m-3" >
                                                        <div className="rounded  border border-secondary d-flex justify-content-center align-items-center" style={{ "height": "150px" }}>
                                                            <div>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" className="bi bi-tag" viewBox="0 0 16 16">
                                                                    <path d="M6 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-1 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0z" />
                                                                    <path d="M2 1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 1 6.586V2a1 1 0 0 1 1-1zm0 5.586 7 7L13.586 9l-7-7H2v4.586z" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="form-group col-md-9 align-self-center">
                                                        <label>Principal: </label>
                                                        <label>0 cantidad - 0 min - 0 max</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* SECTOR PRECIOS */}
                                        <div className='row pt-4'>
                                            <div className='col-12'>

                                                <div className='form-group'>
                                                    <h5>
                                                        LISTA DE PRECIOS
                                                    </h5>
                                                </div>

                                                <div className="dropdown-divider"></div>

                                                <div className="form-group pb-2">
                                                    <label>
                                                        Asigna varios precios con valor fijo o un % de descuento sobre el precio base.
                                                    </label>
                                                </div>

                                                <div className="form-row">
                                                    <div className="form-group col-md-6">
                                                        <label>Lista de precios: </label>
                                                        <div className="input-group">
                                                            <select
                                                                className="form-control"
                                                            >
                                                                <option value="1">codigo 01</option>
                                                                <option value="2">código 02</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="form-group col-md-6">
                                                        <label>Valor:</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="tab-pane fade" id="addservicio" role="tabpanel" aria-labelledby="addservicio-tab">
                                        {/* SECTOR INFORMACIÓN GENERAL */}
                                        <div className="form-group pt-3">
                                            <label>
                                                Crea las actividades comerciales o de consultoría que ofreces a tus clientes.
                                            </label>
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        <div className="form-row">
                                            <div className="form-group col-md-12">
                                                <label>Nombre del servicio: <i className="fa fa-asterisk text-danger small"></i></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Dijite un nombre..." />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <label>Referencia: <i className="fa fa-asterisk text-danger small"></i></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    // ref={this.refTxtArea}
                                                    // value={this.state.area}
                                                    // onChange={(event) => this.setState({ area: event.target.value })}
                                                    placeholder="Ejemplo: CAS002 ..." />

                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Código producto SUNAT: <i className="fa fa-asterisk text-danger small"></i></label>
                                                <div className="input-group">
                                                    <select
                                                        className="form-control"
                                                    // value={this.state.estado}
                                                    // onChange={(event) => this.setState({ estado: event.target.value })}
                                                    >
                                                        <option value="1">codigo 01</option>
                                                        <option value="2">código 02</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <label>Unidad de medida: <i className="fa fa-asterisk text-danger small"></i></label>
                                                <div className="input-group">
                                                    <select
                                                        className="form-control"
                                                    // value={this.state.estado}
                                                    // onChange={(event) => this.setState({ estado: event.target.value })}
                                                    >
                                                        <option value="1">medida 01</option>
                                                        <option value="2">medida 02</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Categoria: <i className="fa fa-asterisk text-danger small"></i></label>
                                                <div className="input-group">
                                                    <select
                                                        className="form-control"
                                                    // value={this.state.estado}
                                                    // onChange={(event) => this.setState({ estado: event.target.value })}
                                                    >
                                                        <option value="1">categoria 01</option>
                                                        <option value="2">categoria 02</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group col-md-12">
                                                <label>Descripción: <i className="fa fa-asterisk text-danger small"></i></label>
                                                <textarea className="form-control" id="" rows="3"></textarea>
                                            </div>
                                        </div>
                                        {/* SECTOR DE PRECIO */}
                                        <div className='row pt-3'>
                                            <div className='col-lg-8 col-md-8 col-sm-8 col-xs-8'>
                                                <div className='row'>
                                                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                                        <h5>
                                                            PRECIO
                                                        </h5>
                                                    </div>
                                                </div>
                                                <div className="dropdown-divider"></div>
                                                <div className="form-group pb-2">
                                                    <label>
                                                        Indica el valor de venta y el costo de compra de tu producto.
                                                    </label>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-group col-md-3">
                                                        <label>Precio base: <i className="fa fa-asterisk text-danger small"></i></label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder=" S/0.000 " />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* SECTOR DETALLE DE INVENTARIO */}
                                        <div className='row pt-3'>
                                            <div className='col-lg-8 col-md-8 col-sm-8 col-xs-8'>
                                                <div className='row'>
                                                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                                        <h5>
                                                            LISTAS DE PRECIOS
                                                        </h5>
                                                    </div>
                                                </div>
                                                <div className="dropdown-divider"></div>
                                                <div className="form-group pb-2">
                                                    <label>
                                                        Asigna varios precios con valor fijo o un % de descuento sobre el precio base.
                                                    </label>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-group col-md-6" >
                                                        <label>Listas de prec: </label>
                                                        <select
                                                            className="form-control"
                                                        >
                                                            <option value="1">codigo 01</option>
                                                            <option value="2">código 02</option>
                                                        </select>
                                                    </div>
                                                    <div className="form-group col-md-6">
                                                        <label>Valor: </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder=" " />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="tab-pane fade" id="addcombo" role="tabpanel" aria-labelledby="addcombo-tab">
                                        {/* SECTOR INFORMACIÓN GENERAL */}
                                        <div className="form-group pt-3">
                                            <label>
                                                Agrupa en un solo ítem un conjunto de productos, servicios o una combinación entre ambos.
                                            </label>
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        <div className="form-row">
                                            <div className="form-group col-md-12">
                                                <label>Nombre del combo: <i className="fa fa-asterisk text-danger small"></i></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Dijite un nombre..." />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <label>Referencia: <i className="fa fa-asterisk text-danger small"></i></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    // ref={this.refTxtArea}
                                                    // value={this.state.area}
                                                    // onChange={(event) => this.setState({ area: event.target.value })}
                                                    placeholder="Ejemplo: CAS002 ..." />

                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Almacén: <i className="fa fa-asterisk text-danger small"></i></label>
                                                <div className="input-group">
                                                    <select
                                                        className="form-control"
                                                    // value={this.state.estado}
                                                    // onChange={(event) => this.setState({ estado: event.target.value })}
                                                    >
                                                        <option value="1">Princial</option>
                                                        <option value="2">Secundario</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <label>Código producto SUNAT: <i className="fa fa-asterisk text-danger small"></i></label>
                                                <div className="input-group">
                                                    <select
                                                        className="form-control"
                                                    // value={this.state.estado}
                                                    // onChange={(event) => this.setState({ estado: event.target.value })}
                                                    >
                                                        <option value="1">codigo 01</option>
                                                        <option value="2">codigo 02</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Unidad de medida: <i className="fa fa-asterisk text-danger small"></i></label>
                                                <div className="input-group">
                                                    <select
                                                        className="form-control"
                                                    // value={this.state.estado}
                                                    // onChange={(event) => this.setState({ estado: event.target.value })}
                                                    >
                                                        <option value="1">unidad</option>
                                                        <option value="2">otro</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <label>Categoria: <i className="fa fa-asterisk text-danger small"></i></label>
                                                <div className="input-group">
                                                    <select
                                                        className="form-control"
                                                    // value={this.state.estado}
                                                    // onChange={(event) => this.setState({ estado: event.target.value })}
                                                    >
                                                        <option value="1">categoria 01</option>
                                                        <option value="2">categoria 02</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group col-md-12">
                                                <label>Descripción: <i className="fa fa-asterisk text-danger small"></i></label>
                                                <textarea className="form-control" id="" rows="3"></textarea>
                                            </div>
                                        </div>
                                        {/*  SECTOR PRECIO */}
                                        <div className='row pt-3'>
                                            <div className='col-lg-8 col-md-8 col-sm-8 col-xs-8'>
                                                <div className='row'>
                                                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                                        <h5>
                                                            PRECIO
                                                        </h5>
                                                    </div>
                                                </div>
                                                <div className="dropdown-divider"></div>
                                                <div className="form-group pb-2">
                                                    <label>
                                                        Indica el valor de venta y el costo de compra de tu producto.
                                                    </label>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-group col-md-3">
                                                        <label>Precio base: <i className="fa fa-asterisk text-danger small"></i></label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder=" S/0.000 " />
                                                    </div>
                                                    <div className="form-group col-md-1">
                                                        <div className="d-flex justify-content-center mt-2" style={{ "paddingTop": "33px" }}>
                                                            <i className="fa fa-plus" aria-hidden="true"></i>
                                                        </div>
                                                    </div>
                                                    <div className="form-group col-md-3">
                                                        <label>Impuesto: </label>
                                                        <div className="input-group">
                                                            <select
                                                                className="form-control"
                                                            >
                                                                <option value="1">codigo 01</option>
                                                                <option value="2">código 02</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="form-group col-md-1">
                                                        <div className="d-flex justify-content-center mt-2" style={{ "paddingTop": "33px" }}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
                                                                <path d="M48 128c-17.7 0-32 14.3-32 32s14.3 32 32 32H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H48zm0 192c-17.7 0-32 14.3-32 32s14.3 32 32 32H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H48z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div className="form-group col-md-4">
                                                        <label>Precio Total: <i className="fa fa-asterisk text-danger small"></i></label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder=" " />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* SECTOR COMBO */}
                                        <div className='row pt-3'>
                                            <div className='col-lg-8 col-md-8 col-sm-8 col-xs-8'>
                                                <div className='row'>
                                                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                                        <h5>
                                                            COMBO
                                                        </h5>
                                                    </div>
                                                </div>
                                                <div className="dropdown-divider"></div>
                                                <div className="form-group pb-2">
                                                    <label>
                                                        Selecciona los productos y sus cantidades para armar un combo
                                                    </label>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-group col-md-2" >
                                                        <div className="rounded  border border-secondary d-flex justify-content-center align-items-center" style={{ "height": "80px" }}>
                                                            <div>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-tag" viewBox="0 0 16 16">
                                                                    <path d="M6 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-1 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0z" />
                                                                    <path d="M2 1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 1 6.586V2a1 1 0 0 1 1-1zm0 5.586 7 7L13.586 9l-7-7H2v4.586z" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="form-group col-md-8 align-self-center">
                                                        <label>Seleccionar: </label>
                                                        <label>Agrega aquí uno de los productos de tu combo</label>
                                                    </div>
                                                    <div className="form-group col-md-2 align-self-center">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="S/ 0.00" />
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-group col-md-2" >
                                                        <div className="rounded  border border-secondary d-flex justify-content-center align-items-center" style={{ "height": "80px" }}>
                                                            <div>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-tag" viewBox="0 0 16 16">
                                                                    <path d="M6 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-1 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0z" />
                                                                    <path d="M2 1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 1 6.586V2a1 1 0 0 1 1-1zm0 5.586 7 7L13.586 9l-7-7H2v4.586z" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="form-group col-md-8 align-self-center">
                                                        <label>Seleccionar: </label>
                                                        <label>Agrega aquí uno de los productos de tu combo</label>
                                                    </div>
                                                    <div className="form-group col-md-2 align-self-center">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="S/ 0.00" />
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-group col-md-2" >
                                                        <div className="rounded  border border-secondary d-flex justify-content-center align-items-center" style={{ "height": "80px" }}>
                                                            <div>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-tag" viewBox="0 0 16 16">
                                                                    <path d="M6 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-1 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0z" />
                                                                    <path d="M2 1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 1 6.586V2a1 1 0 0 1 1-1zm0 5.586 7 7L13.586 9l-7-7H2v4.586z" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="form-group col-md-8 align-self-center">
                                                        <label>Seleccionar: </label>
                                                        <label>Agrega aquí uno de los productos de tu combo</label>
                                                    </div>
                                                    <div className="form-group col-md-2 align-self-center">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="S/ 0.00" />
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-group col-md-10 " >
                                                        <div className="float-right">
                                                            <h4 className="text-black-50">Costo Total: </h4>
                                                        </div>

                                                    </div>
                                                    <div className="form-group col-md-2 align-self-center">
                                                        <h4 className="text-black-50">S/ 0.00</h4>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* SECTOR LISTAS DE PRECIOS */}
                                        <div className='row pt-4'>
                                            <div className='col-lg-8 col-md-8 col-sm-8 col-xs-8'>
                                                <div className='row'>
                                                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                                        <h5>
                                                            LISTA DE PRECIOS
                                                        </h5>
                                                    </div>
                                                </div>
                                                <div className="dropdown-divider"></div>
                                                <div className="form-group pb-2">
                                                    <label>
                                                        Asigna varios precios con valor fijo o un % de descuento sobre el precio base.
                                                    </label>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-group col-md-6">
                                                        <label>Lista de precios: </label>
                                                        <div className="input-group">
                                                            <select
                                                                className="form-control"
                                                            >
                                                                <option value="1">codigo 01</option>
                                                                <option value="2">código 02</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="form-group col-md-6">
                                                        <label>Valor:</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='col-xl-4 col-lg-4 col-md-12 col-sm-12 col-12'>
                        <div className="form-row">
                            <div className="col-lg-12 col-md-10 col-sm-12 col-12">
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

export default ProductoAgregar;