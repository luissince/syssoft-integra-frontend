import { images } from "../../../../../helper";
import ErrorResponse from "../../../../../model/class/error-response";
import SuccessReponse from "../../../../../model/class/response";
import { listarProductosFilter } from "../../../../../network/rest/principal.network";

const ItemSearch = (props) => {

    const { refProducto, producto, idSucursal, filterProducto, setStateAsync } = props;

    const handleFilterProducto = async (event) => {

        const searchWord = event.target.value;
        await setStateAsync({ producto: searchWord });

        if (searchWord.length === 0) {
            await setStateAsync({ productos: [] });
            return;
        }

        if (searchWord.length <= 2) return;

        if (filterProducto) return;


        await setStateAsync({ filterProducto: true, sarchProducto: true });

        const params = {
            idSucursal: idSucursal,
            filtrar: searchWord,
        }

        const response = await listarProductosFilter(params);

        if (response instanceof SuccessReponse) {
            await setStateAsync({ filterProducto: false, productos: response.data, sarchProducto: false });
        }

        if (response instanceof ErrorResponse) {
            await setStateAsync({ filterProducto: false, productos: [], sarchProducto: false });
        }
    }

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
                        value={producto}
                        ref={refProducto}
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