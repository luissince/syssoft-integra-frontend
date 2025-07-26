import { images } from '../../../../../../../helper';
import { numberFormat } from '../../../../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import { A_GRANEL, SERVICIO, UNIDADES, VALOR_MONETARIO } from '../../../../../../../model/types/tipo-tratamiento-producto';
import Button from '../../../../../../../components/Button';
import Image from '../../../../../../../components/Image';

const InvoiceDetail = (props) => {
  const { codiso, detalleVenta } = props;

  const { handleEdit, handlePlus, handleMinus, handleRemove } = props;

  if (detalleVenta.length === 0) {
    return (
      <div className="invoice-item">
        <div className="h-100">
          <div className="invoice-item_no-items p-2 h-100 w-100 d-flex flex-column align-items-center justify-content-center">
            <img className="mb-1" src={images.basket} alt="Canasta" />
            <div className="w-50">
              <span className="text-base">
                Aquí verás los productos que elijas en tu próxima venta
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-item">
      <div className="h-100">
        {detalleVenta.map((producto, index) => {
          const cantidad = producto.idTipoTratamientoProducto === SERVICIO
            ? producto.cantidad
            : producto.inventarios.reduce((acc, current) => acc + current.cantidad, 0);

          return (
            <div
              key={index}
              className="invoice-item_add-item d-flex position-relative cursor-pointer"
            >
              <div className="item_container">
                <div className="py-3 w-100 d-flex flex-column justify-content-center h-100">
                  <div className="d-flex justify-content-between align-items-center py-1 px-3">
                    <div className="invoice-item_add-item-options">
                      <button
                        className="btn d-flex justify-content-center align-items-center h-100 invoice-item_add-item-options_button mr-1"
                        onClick={() => handleEdit(producto)}
                      >
                        <i className='fa fa-edit text-secondary text-xl'></i>
                      </button>

                      <button
                        className="btn d-flex justify-content-center align-items-center h-100 invoice-item_add-item-options_button"
                        onClick={() => handleRemove(producto)}
                      >
                        <i className='fa fa-trash text-secondary text-xl'></i>
                      </button>
                    </div>

                    <Image
                      default={images.noImage}
                      src={producto.imagen}
                      alt={producto.nombreProducto}
                      width={80}
                      height={80}
                      className='object-contain'
                    />

                    <div className="invoice-item_add-item-describe d-flex flex-column text-break text-truncate text-nowrap">
                      <div className="invoice-item_add-item-describe-title text-truncate text-base">
                        <small>{producto.codigo}</small>
                        <br />
                        {producto.nombreProducto}
                      </div>

                      <div className="invoice-item_add-item-describe-price d-flex align-items-center text-break text-truncate text-nowrap text-base">
                        {
                          producto.idTipoTratamientoProducto === VALOR_MONETARIO && (
                            <>
                              {numberFormat(producto.precio, codiso)}
                            </>
                          )
                        }

                        {
                          producto.idTipoTratamientoProducto !== VALOR_MONETARIO && (
                            <>
                              {numberFormat(producto.precio, codiso)} <span className='text-xs ml-1'>x {producto.medida}</span>
                            </>
                          )
                        }
                      </div>
                    </div>

                    <div className="invoice-item_add-item-quantity-container d-none d-sm-flex flex-column  align-items-center justify-content-center">
                      {producto.idTipoTratamientoProducto === SERVICIO && (
                        <div key={index} className="d-flex flex-column align-items-center">
                          <div className="d-flex">
                          </div>
                        </div>
                      )}

                      {(producto.idTipoTratamientoProducto === UNIDADES || producto.idTipoTratamientoProducto === A_GRANEL) && producto.inventarios.map((item, index) => (
                        <div key={index} className="d-flex flex-column align-items-center">
                          <div>
                            <span className='text-secondary'>{item.almacen}</span>
                          </div>

                          <div className="d-flex">
                            <Button
                              className="m-0 d-flex justify-content-center align-items-center pointer"
                              onClick={() => handleMinus(producto, item.idInventario)}
                            >
                              <i className='fa fa-minus text-secondary text-xl'></i>
                            </Button>
                            <div className="item_quantity d-flex justify-content-center align-items-center">
                              {item.cantidad}
                            </div>
                            <Button
                              className="m-0 d-flex justify-content-center align-items-center pointer"
                              onClick={() => handlePlus(producto, item.idInventario)}
                            >
                              <i className='fa fa-plus text-secondary text-xl'></i>
                            </Button>
                          </div>
                        </div>
                      ))}

                      {producto.idTipoTratamientoProducto === VALOR_MONETARIO && producto.inventarios.map((item, index) => (
                        <div key={index} className="d-flex flex-column align-items-center">
                          <div>
                            <span className='text-secondary'>{item.almacen}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="invoice-item_add-item-total">
                      <div className="h-100 d-flex justify-content-end align-items-center text-base">
                        {numberFormat(producto.precio * cantidad, codiso)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

InvoiceDetail.propTypes = {
  codiso: PropTypes.string.isRequired,
  detalleVenta: PropTypes.array.isRequired,

  handleEdit: PropTypes.func.isRequired,
  handlePlus: PropTypes.func.isRequired,
  handleMinus: PropTypes.func.isRequired,
  handleRemove: PropTypes.func.isRequired,
}

export default InvoiceDetail;
