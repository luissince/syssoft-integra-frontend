import { keyNumberFloat } from "../../../../../../helper/utils.helper";

const ItemProducto = (props) => {
    const { item } = props;
    const { handleInputCantidadCombos, handleRemoveItemCombo } = props;

    return (
        <div className="row">
            <div className="col-md-2" >
                <div className="form-group">
                    <div className="rounded border border-secondary d-flex justify-content-center align-items-center p-4" >
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-tag" viewBox="0 0 16 16">
                                <path d="M6 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-1 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0z" />
                                <path d="M2 1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 1 6.586V2a1 1 0 0 1 1-1zm0 5.586 7 7L13.586 9l-7-7H2v4.586z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-md-6 d-flex text-left align-items-center">
                <div className="form-group">
                    {
                        item && (
                            <>
                                <p className='m-0'>Producto: {item.nombre}</p>
                                <p className='m-0'>Costo: {item.costo}</p>                             
                            </>
                        )
                    }
                    {
                        !item && (
                            <>
                                <p className='m-0'>Seleccionar: </p>
                                <p className='m-0'>Agrega aquí uno de los productos de tu combo</p>
                            </>
                        )
                    }
                </div>
            </div>


            <div className="col-md-2 align-self-center">
                <div className="form-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="0"
                        value={item.cantidad}
                        onChange={(event) => handleInputCantidadCombos(event, item.idProducto)}
                        onKeyDown={keyNumberFloat} />
                </div>
            </div>

            <div className="col-md-2 align-self-center">
                <div className="d-flex justify-content-end">
                    <div className="form-group">
                        <button className="btn btn-danger"
                            onClick={() => handleRemoveItemCombo(item.idProducto)}>
                            <i className="fa fa-remove"></i>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ItemProducto;