const Servicio = () => {
    return (
        <div className="tab-pane fade" id="addservicio" role="tabpanel" aria-labelledby="addservicio-tab">
            {/* SECTOR TITULO*/}
            <div className='row'>
                <div className="form-group col-md-12">
                    <label>
                        Crea las actividades comerciales o de consultoría que ofreces a tus clientes.
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
                <div className="form-group col-md-12">
                    <label>Nombre del servicio: <i className="fa fa-asterisk text-danger small"></i></label>
                    <input
                        type="text"
                        className={`form-control`}
                        placeholder="Dijite un nombre..." />
                </div>

                <div className="form-group col-md-6">
                    <label>Código:</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Ejemplo: CAS002 ..." />

                </div>

                <div className="form-group col-md-6">
                    <label>Código producto SUNAT:</label>
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
                    <label>Unidad de medida: <i className="fa fa-asterisk text-danger small"></i></label>
                    <div className="input-group">
                        <select
                            className="form-control"
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
                        >
                            <option value="1">categoria 01</option>
                            <option value="2">categoria 02</option>
                        </select>
                    </div>
                </div>

                <div className="form-group col-md-12">
                    <label>Descripción: </label>
                    <textarea
                        className="form-control"
                        rows="3"></textarea>
                </div>
            </div>

            {/* SECTOR DE PRECIO */}
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
                        <div className="col-lg-3 col-md-12 col-sm-12">
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
            {/* <div className='row pt-3'>
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
        </div> */}
        </div>
    );
}

export default Servicio;