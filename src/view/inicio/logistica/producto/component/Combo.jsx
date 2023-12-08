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

    const { activarInventario, inventario, handleAddItemInventario, handleRemoveItemInventario } = props;

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
                            className={`form-control ${codigo ? "" : "is-invalid"}`}
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
            <div className='row'>
                <div className="col">
                    <h6>
                        PRECIO
                    </h6>
                </div>
            </div>

            <div className="dropdown-divider"></div>

            <div className='row'>
                <div className="col">
                    <div className="form-group">
                        <label>
                            Indica el valor de venta de tu producto.
                        </label>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-3 col-md-12">
                    <div className="form-group ">
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

            {/* SECTOR COMBO */}
            <div className='row'>
                <div className="col">
                    <h6>
                        COMBO
                    </h6>
                </div>
            </div>

            <div className="dropdown-divider"></div>

            <div className='row'>
                <div className="col">
                    <div className="form-group">
                        <label>
                            Selecciona los productos y sus cantidades para armar un combo
                        </label>
                    </div>
                </div>
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


            {/* SECTOR INVENTARIO */}
            {
                activarInventario && (
                    <>
                        <div className='row'>
                            <div className="col">
                                <h6>
                                    DETALLE DE INVENTARIO
                                </h6>
                            </div>
                        </div>

                        <div className="dropdown-divider"></div>

                        <div className='row'>
                            <div className="col">
                                <div className="form-group">
                                    <label>
                                        Distribuye y controla las cantidades de tus productos en diferentes lugares.
                                    </label>
                                </div>
                            </div>
                        </div>

                        {
                            inventario.map((item, index) => {
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
                    </>
                )
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