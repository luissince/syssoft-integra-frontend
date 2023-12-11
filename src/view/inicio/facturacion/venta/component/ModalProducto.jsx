import { spinnerLoading } from "../../../../../helper/utils.helper";

const ModalProducto = (props) => {

    const { idModal, loading, producto, detalleVenta } = props;

    const { refPrecio, refBonificacion, refDescripcion } = props;

    const { refListPrecio, listPrecio } = props;

    const { handleSave, handleOpenAndClose } = props;

    const handleSeleccionar = (precio) => {
        refPrecio.current.value = precio.valor
    }

    return (
        <div id={idModal} className='side-modal'>

            <div className='side-modal_wrapper'>
                <div className="card h-100 border-0 rounded-0">
                    <div className="card-header">Editar producto</div>
                    <button
                        type="button"
                        className="close"
                        aria-label="Close"
                        onClick={handleOpenAndClose}>
                        <span aria-hidden="true">&times;</span>
                    </button>

                    <div className="card-body h-100 overflow-y-auto">
                        {loading && spinnerLoading()}

                        <div className="row">
                            <div className="col">
                                <div className="form-group">
                                    <h5><i className="fa fa-pencil"></i> {producto && producto.nombreProducto}</h5>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <div className="form-group">
                                    <label>Precio:</label>
                                    <input className="form-control"
                                        autoFocus
                                        placeholder="0.00"
                                        ref={refPrecio} />
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <div className="form-group">
                                    <label>Bonificación:</label>
                                    <input className="form-control"
                                        placeholder="0" 
                                        ref={refBonificacion}/>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <div className="form-group">
                                    <label>Descripción:</label>
                                    <textarea className="form-control"
                                        placeholder="Ingrese los datos del producto"
                                        ref={refDescripcion}>
                                    </textarea>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <div className="form-group">
                                    <label>Lista de Precios:</label>
                                    <ul className="list-group">
                                        {listPrecio.map((item, index) => (
                                            <button
                                                key={index}
                                                className="list-group-item list-group-item-action"
                                                onClick={()=>handleSeleccionar(item)}>
                                                {item.nombre} - {item.valor}
                                            </button>
                                        ))}
                                        {/* <li className="list-group-item">An item</li>
                                        <li className="list-group-item">A second item</li>
                                        <li className="list-group-item">A third item</li>
                                        <li className="list-group-item">A fourth item</li> */}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-footer bg-white">
                        <div className="d-flex align-items-center justify-content-between">
                            <span className="d-block">Campos obligatorios <i className="fa fa-asterisk text-danger small"></i></span>
                            <div>
                                <button className='btn btn-outline-success mr-2' onClick={handleSave}>Aceptar</button>
                                <button className='btn btn-outline-secondary ' onClick={handleOpenAndClose}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="side-modal_overlay" onClick={handleOpenAndClose}>
            </div>
        </div>
    );
}

export default ModalProducto;