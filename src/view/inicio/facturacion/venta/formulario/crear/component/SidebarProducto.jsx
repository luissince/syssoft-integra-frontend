import {
  formatDate,
  handlePasteFloat,
  keyNumberFloat,
  rounded,
} from '@/helper/utils.helper';
import PropTypes from 'prop-types';
import { UNIDADES } from '@/model/types/tipo-tratamiento-producto';
import { SpinnerView } from '@/components/Spinner';
import Input from '@/components/Input';
import TextArea from '@/components/TextArea';
import Button from '@/components/Button';
import { usePrivilegios } from '@/hooks/use-privilegios';
import {
  CAMBIAR_PRECIO,
  EDITAR_DESCRIPCION,
  FACTURACION,
  USAR_BONIFICACION,
  VENTAS
} from '@/model/types/menu';
import { BoxIcon, CalendarIcon } from 'lucide-react';

const SidebarProducto = (props) => {

  const { getPrivilegio } = usePrivilegios(props.menus);
  const cambiarPrecio = getPrivilegio(FACTURACION, VENTAS, CAMBIAR_PRECIO);
  const usarBonificacion = getPrivilegio(FACTURACION, VENTAS, USAR_BONIFICACION);
  const editarDescripcion = getPrivilegio(FACTURACION, VENTAS, EDITAR_DESCRIPCION);

  const { idSidebar, loading, producto } = props;

  const { refPrecio, refBonificacion, refDescripcion } = props;

  const { listPrecio } = props;

  const { handleSave, handleClose } = props;

  const handleSeleccionar = (precio) => {
    refPrecio.current.value = precio.valor;
  };

  return (
    <div id={idSidebar} className="side-modal">
      <div className="side-modal_wrapper">
        <div className="card h-100 border-0 rounded-0">
          <div className="card-header">Editar producto</div>
          <Button
            contentClassName="close"
            aria-label="Close"
            onClick={handleClose}
          >
            <span>&times;</span>
          </Button>

          <div className="card-body h-100 overflow-y-auto">
            <SpinnerView loading={loading} message={'Cargando datos...'} />
            <div className="mb-3">
              <h5>
                <i className="fa fa-pencil"></i>{' '}
                {producto && producto.nombreProducto}
              </h5>
            </div>

            <div className="mb-3">
              <Input
                autoFocus={true}
                label={
                  <>
                    Precio:{' '}
                    <i className="fa fa-asterisk text-danger small"></i>
                  </>
                }
                placeholder="0.00"
                ref={refPrecio}
                disabled={!cambiarPrecio}
                onKeyDown={keyNumberFloat}
                onPaste={handlePasteFloat}
              />
            </div>

            <div className="mb-3">
              <Input
                label={'Bonificación:'}
                placeholder="0"
                ref={refBonificacion}
                disabled={!usarBonificacion}
                onKeyDown={keyNumberFloat}
                onPaste={handlePasteFloat}
              />
            </div>

            <div className="mb-3">
              <TextArea
                label={
                  <>
                    Descripción:{' '}
                    <i className="fa fa-asterisk text-danger small"></i>
                  </>
                }
                placeholder="Ingrese los datos del producto"
                ref={refDescripcion}
                disabled={!editarDescripcion}
              />
            </div>

            <div>
              <label>Lista de Precios:</label>
              <ul className="flex flex-col rounded">
                {
                  listPrecio.map((item, index) => (
                    <Button
                      key={index}
                      contentClassName="list-group-item list-group-item-action"
                      onClick={() => handleSeleccionar(item)}
                      disabled={!cambiarPrecio}
                    >
                      <i className="fa fa-hand-pointer-o"></i> {item.nombre} -{' '}
                      {item.valor}
                    </Button>
                  ))
                }
              </ul>
            </div>

            {producto && producto.idTipoTratamientoProducto === UNIDADES && (
              <div>
                <label>Cantidad por Almacen:</label>
                <ul className="flex flex-col rounded">
                  {
                    producto.inventarios.map((item, index) => {
                      const cantidad = producto.inventarios.reduce((accInventario, inventario) => {
                        const sumaInventario = inventario.inventarioDetalles.reduce((accInventarioDetalle, inventarioDetalle) => {
                          return accInventarioDetalle + inventarioDetalle.cantidad;
                        }, 0);
                        return accInventario + sumaInventario;
                      }, 0);

                      return (
                        <li key={index} className="relative block px-4 py-2 border rounded mb-2">
                          <div className="flex justify-between flex-row">
                            <div className="flex items-center gap-2">
                              <i className="bi bi-house text-muted"></i>
                              <span className="text-sm">{item.almacen}</span>
                            </div>
                            <div>
                              <span className="text-sm">
                                cantidad: {rounded(cantidad)}
                              </span>
                            </div>
                          </div>
                          <label className="mt-3">Inventario Detalles:</label>
                          <ul className="flex flex-col rounded">
                            {
                              item.inventarioDetalles.map((detalle, index) => {
                                return (
                                  <li key={index} className="flex w-full px-4 py-2 border rounded mb-2">
                                    <div className="flex w-full items-center justify-between flex-row">
                                      <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                          {/* <i className="bi bi-box text-muted"></i> */}
                                          <BoxIcon className="h-4 w-4" />
                                          <span className="text-sm">
                                            {detalle.lote || 'SIN LOTE'}
                                          </span>
                                        </div>
                                        {
                                          detalle.fechaVencimiento && (
                                            <div className="flex gap-2">
                                              <CalendarIcon className="h-4 w-4" />
                                              <span className="text-sm">
                                                {formatDate(detalle.fechaVencimiento)}
                                              </span>
                                            </div>
                                          )
                                        }
                                      </div>
                                      <div className="text-sm">
                                         <span>{rounded(detalle.cantidad)}</span> <span className="uppercase">{producto.medida}(S)</span>
                                      </div>
                                    </div>
                                  </li>
                                )
                              })
                            }
                          </ul>
                        </li>
                      );
                    })
                  }
                </ul>
              </div>
            )}
          </div>

          <div className="card-footer bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <span className="d-block">
                Campos obligatorios{' '}
                <i className="fa fa-asterisk text-danger small"></i>
              </span>
              <div>
                <Button
                  className="btn-outline-success mr-2"
                  onClick={handleSave}
                >
                  Aceptar
                </Button>
                <Button
                  className="btn-outline-secondary "
                  onClick={handleClose}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="side-modal_overlay" onClick={handleClose}></div>
    </div>
  );
};

SidebarProducto.propTypes = {
  menus: PropTypes.array.isRequired,
  idSidebar: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  producto: PropTypes.object,

  refPrecio: PropTypes.object.isRequired,
  refBonificacion: PropTypes.object.isRequired,
  refDescripcion: PropTypes.object.isRequired,

  listPrecio: PropTypes.any.isRequired,
  handleSave: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default SidebarProducto;
