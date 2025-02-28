import Button from "../../../../../../../components/Button";
import { images } from "../../../../../../../helper";
import PropTypes from 'prop-types';

const ButtonsOpciones = ({
    handleOpenProductos,
    handleOpenPrecios,
    handleOpenCantidad,
    handleOpenDatos,
    handleOpenImpresion,
    handleClearSale,
    handleOpenPedido,
    handleOpenVenta,
    handleOpenCotizacion,
    handleOpenOptions
}) => {

    return (
        <div className="w-100 btn-group btn-group-toggle overflow-auto" >
            <Button
                className='btn-light'
                onClick={handleOpenProductos}
            >
                <img className='mb-2' src={images.producto} width={22} />
                <p className='p-0 m-0'>
                    Producto(F2)
                </p>
            </Button>

            <Button
                className='btn-light'
                onClick={handleOpenPrecios}
            >
                <img className='mb-2' src={images.prices} width={22} />
                <p className='p-0 m-0'>
                    Precio(F3)
                </p>
            </Button>

            <Button
                className='btn-light'
                onClick={handleOpenCantidad}
            >
                <img className='mb-2' src={images.plus_color} width={22} />
                <p className='p-0 m-0'>
                    Cantidad(F4)
                </p>
            </Button>

            <Button
                className='btn-light'
                onClick={handleOpenDatos}
            >
                <img className='mb-2' src={images.view} width={22} />
                <p className='p-0 m-0'>
                    Datos(F5)
                </p>
            </Button>

            {/* <Button
                className='btn-light'
            >
                <img className='mb-2' src={images.linea} width={22} />
                <p className='p-0 m-0'>
                    Descuento(F6)
                </p>
            </Button> */}

            {/* <Button
                className='btn-light'
            >
                <img className='mb-2' src={images.money} width={22} />
                <p className='p-0 m-0'>
                    Sumar Precio(F7)
                </p>
            </Button> */}

            {/* <Button
                className='btn-light'
            >
                <img className='mb-2' src={images.cash_movement} width={22} />
                <p className='p-0 m-0'>
                    Caja(F8)
                </p>
            </Button> */}

            {/* <Button
                className='btn-light'
                onClick={handleOpenImpresion}
            >
                <img className='mb-2' src={images.ticket} width={22} />
                <p className='p-0 m-0'>
                    Pre Impresión(F9)
                </p>
            </Button> */}

            <Button
                className='btn-light'
                onClick={handleOpenPedido}
            >
                <img className='mb-2' src={images.invoice} width={22} />
                <p className='p-0 m-0'>
                    Pedido(F9)
                </p>
            </Button>

            <Button
                className='btn-light'
                onClick={handleClearSale}
            >
                <img className='mb-2' src={images.escoba} width={22} />
                <p className='p-0 m-0'>
                    Limpiar(F10)
                </p>
            </Button>

            <Button
                className='btn-light'
                onClick={handleOpenVenta}
            >
                <img className='mb-2' src={images.view} width={22} />
                <p className='p-0 m-0'>
                    Venta(F11)
                </p>
            </Button>

            <Button
                className='btn-light'
                onClick={handleOpenCotizacion}
            >
                <img className='mb-2' src={images.cotizacion} width={22} />
                <p className='p-0 m-0'>
                    Cotización(F12)
                </p>
            </Button>
            <Button
                className='btn-light'
                onClick={handleOpenOptions}
            >
                <img className='mb-2' src={images.configuracion} width={22} />
                <p className='p-0 m-0'>
                    Configuración
                </p>
            </Button>
        </div>
    );
}

ButtonsOpciones.propTypes = {
    handleOpenProductos: PropTypes.func,
    handleOpenPrecios: PropTypes.func,
    handleOpenCantidad: PropTypes.func,
    handleOpenDatos: PropTypes.func,
    handleOpenImpresion: PropTypes.func,
    handleClearSale: PropTypes.func,
    handleOpenPedido: PropTypes.func,
    handleOpenVenta: PropTypes.func,
    handleOpenCotizacion: PropTypes.func,
    handleOpenOptions: PropTypes.func,
}

export default ButtonsOpciones;