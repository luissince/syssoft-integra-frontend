import {
  handlePasteFloat,
  isEmpty,
  isNumeric,
  keyNumberFloat,
  rounded,
} from '../../../../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import { TIPO_TRATAMIENTO_PRODUCTO_UNIDADES, TIPO_TRATAMIENTO_PRODUCTO_VALOR_MONETARIO } from '../../../../../../../model/types/tipo-tratamiento-producto';
import { SpinnerView } from '../../../../../../../components/Spinner';
import Input from '../../../../../../../components/Input';
import TextArea from '../../../../../../../components/TextArea';
import Button from '../../../../../../../components/Button';
import { usePrivilegios } from '@/hooks/use-privilegios';
import { CAMBIAR_PRECIO, EDITAR_DESCRIPCION, FACTURACION, USAR_BONIFICACION, VENTAS } from '@/model/types/menu';
import { useEffect, useRef, useState } from 'react';
import { getListPrecioProducto, getListPresentacionProducto } from '@/network/rest/principal.network';
import { alertKit } from 'alert-kit';

const SidebarProducto = (props) => {
  const { getPrivilegio } = usePrivilegios(props.menus);
  const cambiarPrecio = getPrivilegio(FACTURACION, VENTAS, CAMBIAR_PRECIO);
  const usarBonificacion = getPrivilegio(FACTURACION, VENTAS, USAR_BONIFICACION);
  const editarDescripcion = getPrivilegio(FACTURACION, VENTAS, EDITAR_DESCRIPCION);

  const [loading, setLoading] = useState(true);
  const [listPrecio, setListPrecioProducto] = useState([]);
  const [listPresentacion, setListPresentacionProducto] = useState([]);

  const [precio, setPrecio] = useState(0);
  const [bonificacion, setBonificacion] = useState(0);
  const [descripcion, setDescripcion] = useState('');
  const [presentacion, setPresentacion] = useState(null);

  const refPrecio = useRef(null);
  const refBonificacion = useRef(null);
  const refDescripcion = useRef(null);

  const { producto, detalleVenta } = props;

  const { handleSave, handleClose } = props;

  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (!producto) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const loadData = async () => {
      setLoading(true);

      try {
        // Ejecutamos ambas peticiones en paralelo.
        const [precios, presentaciones] = await Promise.all([
          getListPrecioProducto(producto.idProducto, controller.signal),
          getListPresentacionProducto(producto.idProducto, controller.signal),
        ]);

        // Evitamos actualizar estados si se cancelaron las peticiones.
        if (controller.signal.aborted) return;

        setListPrecioProducto(
          precios.success ? precios.data : []
        );

        setListPresentacionProducto(
          presentaciones.success ? presentaciones.data : []
        );

        setPrecio(producto.precio);
        setBonificacion(0);
        setDescripcion(producto.nombreProducto);

      } finally {
        // El finally también se ejecuta cuando ocurre un error.
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      controller.abort();

      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    };
  }, [producto]);

  const handleSelectPrecio = (precio) => {
    setPrecio(precio.valor);
  };

  const handleSelectPresentacion = (item) => {
    setPresentacion(item);
  };

  const handleOnClose = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    handleClose();
  }

  const handleOnSumit = (event) => {
    if (!isNumeric(precio) || Number(precio) <= 0) {
      alertKit.warning({
        title: 'Venta',
        message:
          'El precio del producto tiene un valor no admitido o es menor o igual a 0.',
        primaryButton: {
          html: "<i class='fa fa-check'></i> Aceptar",
        },
      }, () => {
        refPrecio.current.focus();
      });
      return;
    }

    if (isEmpty(descripcion)) {
      alertKit.warning({
        title: 'Venta',
        message: 'La descripción del producto no puede ser vacía.',
        primaryButton: {
          html: "<i class='fa fa-check'></i> Aceptar",
        },
      }, () => {
        refDescripcion.current.focus();
      });
      return;
    }

    if (
      producto.precio !== Number(precio) &&
      producto.idTipoTratamientoProducto === TIPO_TRATAMIENTO_PRODUCTO_VALOR_MONETARIO
    ) {
      alertKit.warning({
        title: 'Venta',
        message: 'Los productos a granel no se puede cambia el precio.',
      });
      return;
    }

    handleSave(event, {
      producto,
      precio,
      descripcion,
      presentacion
    });
  }

  return (
    <div className="fixed inset-0 z-[1006]">
      <div className="absolute top-0 right-0 w-full max-w-[550px] bg-white h-full transition-all">
        <div className="card h-full border-0 rounded-none">
          <div className="card-header">Editar producto</div>
          <Button
            contentClassName="absolute right-0 !text-4xl mt-2 mx-4"
            aria-label="Close"
            onClick={handleOnClose}
          >
            <span>&times;</span>
          </Button>

          <div className="card-body h-full overflow-y-auto">
            <SpinnerView loading={loading} message={'Cargando datos...'} />

            <div className="flex mb-3">
              <h5>
                <i className="fa fa-pencil"></i> {producto && producto.nombreProducto}
              </h5>
            </div>

            <div className="mb-3">
              <Input
                autoFocus={true}
                label={
                  <label>
                    Precio: <i className="fa fa-asterisk text-danger small"></i>
                  </label>
                }
                placeholder="0.00"
                ref={refPrecio}
                value={precio}
                onChange={(event) => setPrecio(event.target.value)}
                disabled={!cambiarPrecio}
                onKeyDown={keyNumberFloat}
                onPaste={handlePasteFloat}
              />
            </div>

            <div className="mb-3">
              <Input
                label="Bonificación:"
                placeholder="0"
                ref={refBonificacion}
                value={bonificacion}
                onChange={(event) => setBonificacion(event.target.value)}
                disabled={!usarBonificacion}
                onKeyDown={keyNumberFloat}
                onPaste={handlePasteFloat}
              />
            </div>

            <div className="mb-3">
              <TextArea
                label={
                  <label>
                    Descripción: <i className="fa fa-asterisk text-danger small"></i>
                  </label>
                }
                placeholder="Ingrese los datos del producto"
                ref={refDescripcion}
                value={descripcion}
                onChange={(event) => setDescripcion(event.target.value)}
                disabled={!editarDescripcion}
              />
            </div>

            <div className="mb-3">
              <label>Lista de Precios:</label>
              <ul className="list-group">
                {listPrecio.map((item, index) => (
                  <Button
                    key={index}
                    contentClassName="list-group-item list-group-item-action"
                    onClick={() => handleSelectPrecio(item)}
                    disabled={!cambiarPrecio}
                  >
                    <i className="fa fa-hand-pointer-o"></i> {item.nombre} - {item.valor}
                  </Button>
                ))}
              </ul>
            </div>

            <div className="mb-3">
              <label>Lista de Presentaciones:</label>
              <ul className="list-group">
                {listPresentacion.map((item, index) => (
                  <Button
                    key={index}
                    contentClassName="list-group-item list-group-item-action"
                    onClick={() => handleSelectPresentacion(item)}
                  >
                    <i className="fa fa-hand-pointer-o"></i> {item.nombre} - Factor de conversión {item.factor}
                  </Button>
                ))}
              </ul>
            </div>

            {producto && producto.idTipoTratamientoProducto === TIPO_TRATAMIENTO_PRODUCTO_UNIDADES && (
              <div className="mb-3">
                <label>Cantidad por Almacen:</label>
                <ul className="list-group">
                  {producto.inventarios.map((item, index) => (
                    <li key={index} className="list-group-item">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="flex items-center gap-2">
                          <i className="bi bi-house text-muted"></i>
                          <span className="text-sm">{item.almacen}</span>
                        </div>

                        <div>
                          <span className="text-sm">
                            cantidad: {rounded(item.cantidad)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="card-footer bg-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <p>
                Campos obligatorios <i className="fa fa-asterisk text-danger small"></i>
              </p>
              <div>
                <Button
                  className="btn-outline-success mr-2"
                  onClick={handleOnSumit}
                >
                  Aceptar
                </Button>
                <Button
                  className="btn-outline-secondary "
                  onClick={handleOnClose}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className=" cursor-pointer h-full bg-black/30" onClick={handleOnClose}></div>
    </div>
  );
};

SidebarProducto.propTypes = {
  menus: PropTypes.array.isRequired,
  producto: PropTypes.object,
  detalleVenta: PropTypes.array,

  handleSave: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default SidebarProducto;
