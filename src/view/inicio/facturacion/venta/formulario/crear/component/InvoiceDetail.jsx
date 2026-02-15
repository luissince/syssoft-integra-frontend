import { images } from '@/helper';
import { formatCurrency, rounded } from '@/helper/utils.helper';
import PropTypes from 'prop-types';
import {
  A_GRANEL,
  NINGUNO,
  UNIDADES,
  VALOR_MONETARIO,
} from '@/model/types/tipo-tratamiento-producto';
import Button from '@/components/Button';
import Image from '@/components/Image';

const InvoiceDetail = (props) => {
  const { codiso, detalleVenta } = props;

  const { handleEdit, handlePlus, handleMinus, handleRemove } = props;

  if (detalleVenta.length === 0) {
    return (
      <div className="h-full overflow-auto bg-[#f8fafc]">
        <div className="h-full">
          <div className="p-2 text-[#64748b] h-full w-full flex flex-col items-center justify-center">
            <img className="mb-1" src={images.basket} alt="Canasta" />
            <div className="w-2/4 text-center">
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
      <div className="h-full">
        {
          detalleVenta.map((producto, index) => {
            const cantidad = producto.inventarios.reduce((accInventario, inventario) => {
              const sumaInventario = inventario.inventarioDetalles.reduce((accInventarioDetalle, inventarioDetalle) => {
                return accInventarioDetalle + inventarioDetalle.cantidad;
              }, 0);
              return accInventario + sumaInventario;
            }, 0);

            return (
              <div
                key={index}
                className="invoice-item_add-item flex relative cursor-pointer"
              >
                <div className="item_container">
                  <div className="py-3 w-full h-full flex flex-col justify-center">
                    <div className="d-flex justify-content-between align-items-center py-1 px-3">
                      <div className="invoice-item_add-item-options">
                        <button
                          className="btn !flex items-center justify-center h-full invoice-item_add-item-options_button mr-1"
                          onClick={() => handleEdit(producto)}
                        >
                          <i className="fa fa-edit text-warning !text-xl"></i>
                        </button>

                        <button
                          className="btn !flex items-center justify-center h-full invoice-item_add-item-options_button"
                          onClick={() => handleRemove(producto)}
                        >
                          <i className="fa fa-trash text-danger !text-xl"></i>
                        </button>
                      </div>

                      <div className="max-w-20 aspect-square relative flex items-center justify-center overflow-hidden border border-gray-200">
                        <Image
                          default={images.noImage}
                          src={producto.imagen}
                          alt={producto.nombreProducto}
                          overrideClass="max-w-full max-h-full w-auto h-auto object-contain block"
                        />
                      </div>

                      <div className="invoice-item_add-item-describe flex flex-col text-break text-truncate text-nowrap">
                        <div className="invoice-item_add-item-describe-title text-truncate text-base">
                          <small>{producto.codigo}</small>
                          <br />
                          {producto.nombreProducto}
                        </div>

                        <div className="invoice-item_add-item-describe-price flex items-center text-break text-truncate text-nowrap text-base">
                          {
                            producto.idTipoTratamientoProducto ===
                            VALOR_MONETARIO && (
                              <>{formatCurrency(producto.precio, codiso)}</>
                            )
                          }

                          {
                            producto.idTipoTratamientoProducto !==
                            VALOR_MONETARIO && (
                              <>
                                {formatCurrency(producto.precio, codiso)}{' '}
                                <span className="text-xs ml-1">
                                  x {producto.medida}
                                </span>
                              </>
                            )
                          }
                        </div>
                      </div>

                      <div className="invoice-item_add-item-quantity-container  flex flex-col items-center justify-center">
                        {
                          producto.idTipoTratamientoProducto === NINGUNO && (
                            <div
                              key={index}
                              className="flex flex-col items-center"
                            >
                              <div className="flex"></div>
                            </div>
                          )
                        }

                        {
                          (producto.idTipoTratamientoProducto === UNIDADES ||
                            producto.idTipoTratamientoProducto === A_GRANEL) &&
                          producto.inventarios.map((item, index) => (
                            <div
                              key={index}
                              className="flex flex-col items-center"
                            >
                              <div className="mb-2">
                                <span className="text-secondary">
                                  {item.almacen}
                                </span>
                              </div>

                              <div className="flex flex-col gap-2">
                                {
                                  item.inventarioDetalles.map((inventarioDetalle, indexInventarioDetalle) => {
                                    return (
                                      <div key={indexInventarioDetalle} className="flex gap-2">
                                        <Button
                                          className="m-0 !flex justify-center items-center cursor-pointer"
                                          onClick={() => handleMinus(producto, inventarioDetalle.idKardex)}
                                        >
                                          <i className="fa fa-minus text-secondary text-xl"></i>
                                        </Button>
                                        <div className="item_quantity flex flex-col justify-center items-center">
                                          <small className="text-xs">{inventarioDetalle.lote || 'SIN LOTE'}</small>
                                          <small className="text-base font-bold">{rounded(inventarioDetalle.cantidad)}</small>
                                        </div>
                                        <Button
                                          className="m-0 !flex justify-center items-center cursor-pointer"
                                          onClick={() => handlePlus(producto, inventarioDetalle.idKardex)}
                                        >
                                          <i className="fa fa-plus text-secondary text-xl"></i>
                                        </Button>
                                      </div>
                                    );
                                  })
                                }
                              </div>
                            </div>
                          ))
                        }

                        {
                          producto.idTipoTratamientoProducto === VALOR_MONETARIO &&
                          producto.inventarios.map((item, index) => (
                            <div
                              key={index}
                              className="flex flex-col items-center"
                            >
                              <div>
                                <span className="text-secondary">
                                  {item.almacen}
                                </span>
                              </div>
                            </div>
                          ))
                        }
                      </div>

                      <div className="invoice-item_add-item-total">
                        <div className="h-full flex justify-end items-center text-base">
                          {formatCurrency(producto.precio * cantidad, codiso)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        }
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
};

export default InvoiceDetail;
