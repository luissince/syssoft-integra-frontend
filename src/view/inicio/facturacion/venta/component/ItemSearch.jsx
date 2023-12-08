import { images } from "../../../../../helper";

const ItemSearch = (props) => {

    const { refProducto, producto, handleFilterProducto} = props;

    return (
        <div className='d-flex align-items-center justify-content-between p-4'>
            <div className='w-100 mr-2'>
                <div className="input-group">
                    <div className='input-group-prepend'>
                        <button className="btn btn-success" type="button">
                            <img src={images.codbar} width={18} alt='Códigod de barras' />
                        </button>
                        <button className="btn btn-success active" type="button">
                            <img src={images.search} width={18} alt='Buscar' />
                        </button>
                    </div>
                    <input
                        type="text"
                        className="form-control border border-success"
                        placeholder="Buscar productos"
                        ref={refProducto}
                        value={producto}                        
                        onChange={handleFilterProducto}
                        autoFocus
                    />
                </div>
            </div>
            {/* <button className='btn btn-outline-success d-flex align-items-center justify-content-center' style={{ minWidth: "10rem" }}>
                <div className='mr-2'>Nuevo producto</div>
                <img src={images.add} alt='Agregar Producto' />
            </button> */}
        </div>
    );
}

export default ItemSearch;