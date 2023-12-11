import { images } from "../../../../../helper";
import { numberFormat } from "../../../../../helper/utils.helper";

const ItemAdd = (props) => {

    const { producto, codiso } = props;

    const { detalleVenta, setStateAsync, handleOpenAndClose } = props;

    const handleMinus = async () => {
        const updatedDetalle = detalleVenta.map(item =>
            item.idProducto === producto.idProducto
                ? { ...item, cantidad: Math.max(parseFloat(item.cantidad) - 1, 1) }
                : item
        );

        await setStateAsync({
            detalleVenta: updatedDetalle,
        });
    }

    const handlePlus = async () => {
        const updatedDetalle = detalleVenta.map(item => {
            if (item.idProducto === producto.idProducto) {
                return { ...item, cantidad: parseFloat(item.cantidad) + 1 };
            }
            return item;
        });

        await setStateAsync({
            detalleVenta: updatedDetalle,
        });
    }

    const handleEdit = () => {

    }

    const handleRemove = async () => {
        const updatedDetalle = detalleVenta.filter((item) => producto.idProducto !== item.idProducto);

        await setStateAsync({
            detalleVenta: updatedDetalle,
        })
    }

    return (
        <div className='invoice-item_add-item d-flex position-relative cursor-pointer'>
            <div className='item_container'>
                <div className='pl-3 py-3 w-100 d-flex flex-column justify-content-center h-100'>
                    <div className='d-flex justify-content-between align-items-center py-1 px-3'>

                        <div className="invoice-item_add-item-options">
                            <span>
                                <div
                                    className=" d-flex justify-content-center align-items-center h-100 invoice-item_add-item-options_button mr-1"
                                    onClick={() => handleOpenAndClose(producto)}>
                                    <img src={images.edit} alt='Editar' />
                                </div>
                            </span>
                            <span>
                                <div
                                    className=" d-flex justify-content-center align-items-center h-100 invoice-item_add-item-options_button"
                                    onClick={handleRemove}>
                                    <img src={images.remove} alt='Eliminar' />
                                </div>
                            </span>
                        </div>

                        <div className='invoice-item_add-item-describe d-flex flex-column text-break text-truncate text-nowrap'>
                            <div className='invoice-item_add-item-describe-title text-truncate text-base'>
                                {producto.nombreProducto}
                            </div>
                            <div className='invoice-item_add-item-describe-price d-flex text-break text-truncate text-nowrap text-sm'>
                                {numberFormat(producto.precio, codiso)}
                            </div>
                        </div>

                        <div className="invoice-item_add-item-quantity-container d-none d-sm-flex align-items-center justify-content-center">
                            <button
                                className="btn m-0 d-flex justify-content-center align-items-center pointer"
                                onClick={handleMinus}>
                                <img src={images.minus} alt='Menorar' />
                            </button>
                            <div className="item_quantity d-flex justify-content-center align-items-center">
                                {producto.cantidad}
                            </div>
                            <button
                                className="btn m-0 d-flex justify-content-center align-items-center pointer"
                                onClick={handlePlus}>
                                <img src={images.plus} alt='Aumentar' />
                            </button>
                        </div>

                        <div className='invoice-item_add-item-total'>
                            <div className='h-100 d-flex justify-content-end align-items-center text-base'>
                                {numberFormat(producto.precio * producto.cantidad, codiso)}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default ItemAdd;