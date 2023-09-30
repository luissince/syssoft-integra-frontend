import { images } from "../../../../../helper";
import ItemSearch from "./ItemSearch";
import ItemView from "./ItemView";

const InvoiceView = (props) => {

    const { refProducto,producto, productos, sarchProducto, idProyecto, filterProducto, setStateAsync, handleAddItem } = props;

    const _componentSearchItems = () => {
        if (sarchProducto) {
            return (
                <div className='p-2 w-100 h-100 d-flex flex-column align-items-center justify-content-center'>
                    <span className="loader-one"></span>
                    <p className='text-secondary mt-5 text-base'>Buscando ...</p>
                </div>
            );
        }

        if (productos.length === 0) {
            return (
                <div className='p-2 w-100 h-100 d-flex flex-column align-items-center justify-content-center'>
                    <img className='mb-1' src={images.basket} alt='Canasta' />
                    <p className='text-secondary text-base'>No hay productos que satisfacen la búsqueda</p>
                </div>
            );
        }

        return (
            <div className='overflow-hidden'>
                <div className='d-flex h-100 align-items-start justify-content-around flex-wrap mh-100 overflow-hidden overflow-y-auto my-2'>
                    {
                        productos.map((item, index) => {
                            return (
                                <ItemView
                                    key={index}
                                    name={item.nombreProducto}
                                    price={item.precio}
                                    inventory={0}
                                    handleAddItem={() => handleAddItem(item)} />
                            );
                        })
                    }
                </div>
            </div>
        );
    }

    return (
        <div className='h-100 d-flex flex-column items'>
            <ItemSearch
                refProducto={refProducto}
                producto={producto}
                idProyecto={idProyecto}
                filterProducto={filterProducto}
                setStateAsync={setStateAsync}
            />
            {
                _componentSearchItems()
            }
        </div>
    );
}

export default InvoiceView;