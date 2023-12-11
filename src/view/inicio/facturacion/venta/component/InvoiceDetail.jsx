import { images } from "../../../../../helper";
import ItemAdd from "./ItemAdd";

const InvoiceDetail = (props) => {

    const { codiso, setStateAsync, detalleVenta, handleOpenAndClose } = props;

    if (detalleVenta.length === 0) {
        return (
            <div className='invoice-item'>
                <div className='h-100'>
                    <div className='invoice-item_no-items p-2 h-100 w-100 d-flex flex-column align-items-center justify-content-center'>
                        <img className='mb-1' src={images.basket} alt='Canasta' />
                        <div className="w-50">
                            <span className='text-base'>Aquí verás los productos que elijas en tu próxima venta</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='invoice-item'>
            <div className='h-100'>
                {
                    detalleVenta.map((item, index) => {
                        return (
                            <ItemAdd
                                key={index}
                                producto={item}
                                codiso={codiso}
                                detalleVenta={detalleVenta}
                                setStateAsync={setStateAsync}
                                handleOpenAndClose={handleOpenAndClose}
                            />
                        );
                    })
                }
            </div>
        </div>
    );
}

export default InvoiceDetail;