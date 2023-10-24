import { keyNumberFloat } from "../../../../../../helper/utils.helper";
import ItemAlmacen from "./ItemAlmacen";

const Producto = (props) => {

    const { nombre, refNombre, handleSelectNombre } = props;

    const { codigo, refCodigo, handleInputCodigo } = props;

    const { codigoSunat, refCodigoSunat, handleSelectCodigoSunat } = props;

    const { idMedida, refIdMedida, handleSelectIdMedida, medidas } = props;

    const { idCategoria, refIdCategoria, handleSelectIdCategoria, categorias } = props;

    const { descripcion, refDescripcion, handleInputDescripcion } = props;

    const { precio, refPrecio, handleInputPrecio } = props;

    const { costo, refCosto, handleInputCosto } = props;

    const { inventarios, handleAddItemInventario, handleRemoveItemInventario } = props;


    return (
        <div className="tab-pane fade show active" id="addproducto" role="tabpanel" aria-labelledby="addproducto-tab">
            {/* SECTOR TITULO*/}
            <div className='row'>
                <div className="form-group col-md-12">
                    <label>
                        Crea los bienes y mercancías que vendes e indica si deseas tener el control de tu inventario.
                    </label>
                </div>
            </div>

            <div className='row'>
                <div className="col-12">
                    <h6>
                        INFORMACIÓN GENERAL
                    </h6>
                </div>
            </div>

            <div className="dropdown-divider"></div>

            {/* SECTOR INFORMACIÓN GENERAL */}
            <div className='row'>
                <div className="col-md-12">
                    <div className='form-group'>
                        <label>Nombre del producto: <i className="fa fa-asterisk text-danger small"></i></label>
                        <input
                            type="text"
                            className={`form-control ${nombre ? "" : "is-invalid"}`}
                            aria-describedby="inputError"
                            placeholder="Dijite un nombre..."
                            ref={refNombre}
                            value={nombre}
                            onChange={handleSelectNombre}
                        />
                        {
                            nombre === "" &&
                            <div className="invalid-feedback">
                                Rellene el campo.
                            </div>
                        }
                    </div>
                </div>

                <div className="col-md-6">
                    <div className='form-group'>
                        <label>Código: </label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Ejemplo: CAS002 ..."
                            ref={refCodigo}
                            value={codigo}
                            onChange={handleInputCodigo}
                        />
                    </div>
                </div>

                <div className="col-md-6">
                    <div className='form-group'>
                        <label>Código producto SUNAT:</label>
                        <div className="input-group">
                            <select
                                className="form-control"
                                ref={refCodigoSunat}
                                value={codigoSunat}
                                onChange={handleSelectCodigoSunat}
                            >
                                <option value="0">-- Selecciona --</option>
                                <option value="1">codigo 01</option>
                                <option value="2">código 02</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className='form-group'>
                        <label>Unidad de medida: <i className="fa fa-asterisk text-danger small"></i></label>
                        <div className="input-group">
                            <select
                                className={`form-control ${idMedida ? "" : "is-invalid"}`}
                                ref={refIdMedida}
                                value={idMedida}
                                onChange={handleSelectIdMedida}
                            >
                                <option value="">-- Selecciona --</option>
                                {
                                    medidas.map((item, index) => (
                                        <option key={index} value={item.idMedida}>{item.nombre}</option>
                                    ))
                                }
                            </select>
                            {
                                idMedida === "" &&
                                <div className="invalid-feedback">
                                    Seleccione el campo.
                                </div>
                            }
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className='form-group'>
                        <label>Categoria: <i className="fa fa-asterisk text-danger small"></i></label>
                        <div className="input-group">
                            <select
                                className={`form-control ${idCategoria ? "" : "is-invalid"}`}
                                ref={refIdCategoria}
                                value={idCategoria}
                                onChange={handleSelectIdCategoria}
                            >
                                <option value="">-- Selecciona --</option>
                                {
                                    categorias.map((item, index) => (
                                        <option key={index} value={item.idCategoria}>{item.nombre}</option>
                                    ))
                                }
                            </select>
                            {
                                idCategoria === "" &&
                                <div className="invalid-feedback">
                                    Seleccione el campo.
                                </div>
                            }
                        </div>
                    </div>
                </div>

                <div className="col-md-12">
                    <div className='form-group'>
                        <label>Descripción:</label>
                        <textarea
                            className="form-control"
                            rows="3"
                            ref={refDescripcion}
                            value={descripcion}
                            onChange={handleInputDescripcion}
                        >
                        </textarea>
                    </div>
                </div>
            </div>

            {/* SECTOR PRECIO */}
            <div className='row pt-3'>
                <div className='col-12'>

                    <div className='row'>
                        <div className="col-12">
                            <h6>
                                PRECIO
                            </h6>
                        </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    <div className="form-group">
                        <label>
                            Indica el valor de venta y el costo de compra de tu producto.
                        </label>
                    </div>

                    <div className="row">
                        <div className="form-group col-lg-3 col-md-12 col-sm-12">
                            <label>Precio base: <i className="fa fa-asterisk text-danger small"></i></label>
                            <input
                                type="text"
                                className={`form-control ${precio ? "" : "is-invalid"}`}
                                placeholder=" S/ 0.00"
                                ref={refPrecio}
                                value={precio}
                                onChange={handleInputPrecio}
                                onKeyDown={keyNumberFloat}
                            />
                            {
                                precio === "" &&
                                <div className="invalid-feedback">
                                    Rellene el campo.
                                </div>
                            }
                        </div>

                        <div className="col-lg-1 col-md-12 col-sm-12">
                            <div className='form-group '>
                                <div className="d-flex justify-content-center mt-2" style={{ "paddingTop": "33px" }}>
                                    <i className="fa fa-minus" aria-hidden="true"></i>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-12 col-sm-12">
                            <div className='form-group'>
                                <label>Costo inicial: <i className="fa fa-asterisk text-danger small"></i></label>
                                <input
                                    type="text"
                                    className={`form-control ${costo ? "" : "is-invalid"}`}
                                    placeholder="S/ 0.00"
                                    ref={refCosto}
                                    value={costo}
                                    onChange={handleInputCosto}
                                    onKeyDown={keyNumberFloat}
                                />
                                {
                                    costo === "" &&
                                    <div className="invalid-feedback">
                                        Rellene el campo.
                                    </div>
                                }
                            </div>
                        </div>

                        <div className="col-lg-1 col-12">
                            <div className='form-group'>
                                <div className="d-flex justify-content-center mt-2" style={{ "paddingTop": "33px" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
                                        <path d="M48 128c-17.7 0-32 14.3-32 32s14.3 32 32 32H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H48zm0 192c-17.7 0-32 14.3-32 32s14.3 32 32 32H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H48z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-12 col-sm-12">
                            <div className='form-group'>
                                <label>Utilidad: </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="S/ 0.00"
                                    disabled
                                    value={precio - costo} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTOR INVENTARIO */}
            <div className='row pt-3'>
                <div className='col-12'>

                    <div className='row'>
                        <div className="col-12">
                            <h6>
                                DETALLE DE INVENTARIO
                            </h6>
                        </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    <div className="form-group">
                        <label>
                            Distribuye y controla las cantidades de tus productos en diferentes lugares.
                        </label>
                    </div>

                    {
                        inventarios.map((item, index) => {
                            return <ItemAlmacen
                                key={index}
                                idAlmacen={item.idAlmacen}
                                nombreAlmacen={item.nombreAlmacen}

                                cantidad={item.cantidad}
                                cantidadMinima={item.cantidadMinima}
                                cantidadMaxima={item.cantidadMaxima}

                                handleRemoveItemInventario={handleRemoveItemInventario}
                            />
                        })
                    }

                    <div className="row">
                        <div className='col-12'>
                            <div className='form-group'>
                                <button
                                    className='btn text-success'
                                    onClick={handleAddItemInventario}>
                                    <i className='fa fa-plus-circle'></i> Agregar almacen
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTOR PRECIOS */}
            {/* <div className='row pt-4'>
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
        </div> */}
        </div>
    );
}

export default Producto;