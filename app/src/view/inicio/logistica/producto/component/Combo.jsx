import { keyNumberFloat, rounded } from "../../../../../helper/utils.helper";
import ItemAlmacen from "./ItemAlmacen";
import ItemProducto from "./ItemProducto";

const Combo = (props) => {

    const { nombre, refNombre, handleSelectNombre } = props;

    const { codigo, refCodigo, handleInputCodigo } = props;

    const { codigoSunat, refCodigoSunat, handleSelectCodigoSunat } = props;

    const { idMedida, refIdMedida, handleSelectIdMedida, medidas } = props;

    const { idCategoria, refIdCategoria, handleSelectIdCategoria, categorias } = props;

    const { descripcion, refDescripcion, handleInputDescripcion } = props;

    const { precio, refPrecio, handleInputPrecio } = props;

    const { combos, handleAddItemCombo, handleInputCantidadCombos, handleRemoveItemCombo } = props;

    const { inventarios, handleAddItemInventario, handleRemoveItemInventario } = props;

    return (
        <div className="tab-pane fade" id="addcombo" role="tabpanel" aria-labelledby="addcombo-tab">
            {/* SECTOR INFORMACIÓN GENERAL */}
            <div className='row'>
                <div className="form-group col-md-12">
                    <label>
                        Agrupa en un solo ítem un conjunto de productos, servicios o una combinación entre ambos.
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
            <div className="row">
                <div className="col-md-12">
                    <div className='form-group'>
                        <label>Nombre del combo: <i className="fa fa-asterisk text-danger small"></i></label>
                        <input
                            className={`form-control ${nombre ? "" : "is-invalid"}`}
                            placeholder="Dijite un nombre..."
                            ref={refNombre}
                            value={nombre}
                            onChange={handleSelectNombre} />
                        {
                            nombre === "" &&
                            <div className="invalid-feedback">
                                Rellene el campo.
                            </div>
                        }
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className='form-group'>
                        <label>Código: <i className="fa fa-asterisk text-danger small"></i></label>
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
                        <label>Código producto SUNAT: <i className="fa fa-asterisk text-danger small"></i></label>
                        <div className="input-group">
                            <select
                                className="form-control"
                                ref={refCodigoSunat}
                                value={codigoSunat}
                                onChange={handleSelectCodigoSunat}
                            >
                                <option value="0">-- Selecciona --</option>
                                <option value="1">codigo 01</option>
                                <option value="2">codigo 02</option>
                            </select>
                        </div>
                    </div>
                </div>

            </div>

            <div className="row">
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

            </div>

            <div className="row">
                <div className="col-md-12">
                    <div className='form-group'>
                        <label>Descripción: <i className="fa fa-asterisk text-danger small"></i></label>
                        <textarea
                            className="form-control"
                            rows="3"
                            ref={refDescripcion}
                            value={descripcion}
                            onChange={handleInputDescripcion}>
                        </textarea>
                    </div>
                </div>
            </div>

            {/*  SECTOR PRECIO */}
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
                            Indica el valor de venta de tu producto.
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
                    </div>
                </div>
            </div>



            {/* SECTOR COMBO */}
            {nombre == '' ?
                <div className='row pt-3'>
                    <div className='col-12'>

                        <div className='row'>
                            <div className="col-12">
                                <h6>
                                    COMBO
                                </h6>
                            </div>
                        </div>

                        <div className="dropdown-divider"></div>

                        <div className="form-group">
                            <label>
                                Selecciona los productos y sus cantidades para armar un combo
                            </label>
                        </div>

                        {
                            combos.map((item, index) => {
                                return <ItemProducto
                                    key={index}
                                    item={item}
                                    handleInputCantidadCombos={handleInputCantidadCombos}
                                    handleRemoveItemCombo={handleRemoveItemCombo}
                                />;
                            })
                        }

                        <div className="row">
                            <div className='col-12'>
                                <div className='form-group'>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <button className='btn text-success'
                                            onClick={handleAddItemCombo}>
                                            <i className='fa fa-plus-circle'></i> Agregar producto
                                        </button>

                                        <h5 className="text-secondary">Costo total: S/ {rounded(combos.reduce((acumulador, item) => acumulador += item.costo * (item.cantidad ?? 0), 0))}</h5>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                :
                <div />
            }


            {/* SECTOR INVENTARIO */}
            {nombre == '' ?
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

                        {/* <div className='d-flex flex-row'>
                        <button
                            type='button'
                            className='btn'
                            onClick={handleOpenAlmacen}>
                            <div className="form-row d-flex align-items-center">
                                <div className="mr-2" >
                                    <div className="rounded border border-secondary d-flex justify-content-center align-items-center p-4" >
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" className="bi bi-tag" viewBox="0 0 16 16">
                                                <path d="M6 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-1 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0z" />
                                                <path d="M2 1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 1 6.586V2a1 1 0 0 1 1-1zm0 5.586 7 7L13.586 9l-7-7H2v4.586z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-left">
                                    <p className='m-0'>
                                        {
                                            idAlmacen === "" && (
                                                <>
                                                    Almacen <i className="fa fa-asterisk text-danger small"></i>
                                                </>
                                            )
                                        }
                                        {
                                            idAlmacen !== "" && `${nombreAlmacen}`
                                        }
                                    </p>
                                    <p className='m-0'>
                                        {
                                            idAlmacen === "" && "Agregar aquí la cantidad inicial de tu producto"
                                        }
                                        {
                                            idAlmacen !== "" && `${cantidad} cantidad - ${cantidadMinima} min - ${cantidadMaxima} max`
                                        }
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div> */}
                    </div>
                </div>
                :
                <div />
            }



            {/* SECTOR LISTAS DE PRECIOS */}
            {/* <div className='row pt-4'>
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
        </div> */}
        </div>
    );
}

export default Combo;