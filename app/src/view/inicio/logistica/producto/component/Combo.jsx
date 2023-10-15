const Combo = () => {
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
                            type="text"
                            className="form-control"
                            placeholder="Dijite un nombre..." />
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
                            placeholder="Ejemplo: CAS002 ..." />
                    </div>
                </div>

                <div className="col-md-6">
                    <div className='form-group'>
                        <label>Almacén: <i className="fa fa-asterisk text-danger small"></i></label>
                        <div className="input-group">
                            <select
                                className="form-control"
                            >
                                <option value="1">Princial</option>
                                <option value="2">Secundario</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className='form-group'>
                        <label>Código producto SUNAT: <i className="fa fa-asterisk text-danger small"></i></label>
                        <div className="input-group">
                            <select
                                className="form-control"
                            >
                                <option value="1">codigo 01</option>
                                <option value="2">codigo 02</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className='form-group'>
                        <label>Unidad de medida: <i className="fa fa-asterisk text-danger small"></i></label>
                        <div className="input-group">
                            <select
                                className="form-control"
                            >
                                <option value="1">unidad</option>
                                <option value="2">otro</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className='form-group'>
                        <label>Categoria: <i className="fa fa-asterisk text-danger small"></i></label>
                        <div className="input-group">
                            <select
                                className="form-control"
                            >
                                <option value="1">categoria 01</option>
                                <option value="2">categoria 02</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-12">
                    <div className='form-group'>
                        <label>Descripción: <i className="fa fa-asterisk text-danger small"></i></label>
                        <textarea className="form-control" id="" rows="3"></textarea>
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
                                className={`form-control`}
                                placeholder=" S/ 0.00"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTOR COMBO */}
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

                    <div className="row">
                        <div className="col-md-2" >
                            <div className="form-group">
                                <div className="rounded  border border-secondary d-flex justify-content-center align-items-center" style={{ "height": "80px" }}>
                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-tag" viewBox="0 0 16 16">
                                            <path d="M6 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-1 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0z" />
                                            <path d="M2 1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 1 6.586V2a1 1 0 0 1 1-1zm0 5.586 7 7L13.586 9l-7-7H2v4.586z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6 align-self-center">
                            <div className="form-group">
                                <label>Seleccionar: </label>
                                <label>Agrega aquí uno de los productos de tu combo</label>
                            </div>
                        </div>

                        <div className="col-md-2 align-self-center">
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="S/ 0.00" />
                            </div>
                        </div>

                        <div className="col-md-2 align-self-center">
                            <div className="form-group">
                                <button>
                                    <i className="fa fa"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className='col-12'>
                            <div className='form-group '>
                                <button className='btn text-success'>
                                    <i className='fa fa-plus-circle'></i> Agregar producto
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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