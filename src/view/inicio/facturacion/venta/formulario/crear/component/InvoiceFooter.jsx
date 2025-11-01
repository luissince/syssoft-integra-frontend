import {
  calculateTax,
  calculateTaxBruto,
  formatCurrency,
} from '../../../../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import { SERVICIO } from '../../../../../../../model/types/tipo-tratamiento-producto';
import Button from '../../../../../../../components/Button';

const InvoiceFooter = (props) => {
  const { codiso, impuestos, detalleVenta, handleOpenSale, handleClearSale } =
    props;

  const totalQuantity =
    detalleVenta.length === 1
      ? detalleVenta.length + ' Producto'
      : detalleVenta.length + ' Productos';

  const subTotal = detalleVenta.reduce((accumulator, item) => {
    const cantidad =
      item.idTipoTratamientoProducto === SERVICIO
        ? item.cantidad
        : item.inventarios.reduce((acc, current) => acc + current.cantidad, 0);

    const precio = item.precio;
    const filter = impuestos.filter(
      (imp) => imp.idImpuesto === item.idImpuesto,
    );
    const impuesto = filter.length > 0 ? filter[0].porcentaje : 0;

    const total = cantidad * precio;
    return accumulator + calculateTaxBruto(impuesto, total);
  }, 0);

  const impuestosTotal = () => {
    const resultado = detalleVenta.reduce((acc, item) => {
      const impuesto = impuestos.find(
        (imp) => imp.idImpuesto === item.idImpuesto,
      );

      if (impuesto) {
        const cantidad =
          item.idTipoTratamientoProducto === SERVICIO
            ? item.cantidad
            : item.inventarios.reduce(
                (acc, current) => acc + current.cantidad,
                0,
              );

        const total = cantidad * item.precio;
        const subTotal = calculateTaxBruto(impuesto.porcentaje, total);
        const impuestoTotal = calculateTax(impuesto.porcentaje, subTotal);

        const existingImpuesto = acc.find(
          (imp) => imp.idImpuesto === impuesto.idImpuesto,
        );

        if (existingImpuesto) {
          existingImpuesto.valor += impuestoTotal;
        } else {
          acc.push({
            idImpuesto: impuesto.idImpuesto,
            nombre: impuesto.nombre,
            valor: impuestoTotal,
          });
        }
      }

      return acc;
    }, []);

    return resultado.map((impuesto, index) => {
      return (
        <div
          key={index}
          className="flex items-center justify-between py-2"
        >
          <div>{impuesto.nombre}:</div>
          <div>{formatCurrency(impuesto.valor, codiso)}</div>
        </div>
      );
    });
  };

  const total = detalleVenta.reduce((accumulator, item) => {
    const cantidad =
      item.idTipoTratamientoProducto === SERVICIO
        ? item.cantidad
        : item.inventarios.reduce((acc, current) => acc + current.cantidad, 0);

    const totalProductPrice = item.precio * cantidad;
    return accumulator + totalProductPrice;
  }, 0);

  return (
    <div className="border-t border-solid border-[#cbd5e1]">
      <div className="px-3 mb-2 text-sm text-gray-500">
        <div className="flex items-center justify-between py-2">
          <p>Sub Total:</p>
          <p>{formatCurrency(subTotal, codiso)}</p>
        </div>
        {impuestosTotal()}
      </div>
      <div className="px-3 mb-2">
        <div>
          <div>
            <Button
              className="btn-success btn-lg w-full !flex items-center justify-between"
              onClick={handleOpenSale}
            >
              <div>Cobrar (F1)</div>
              <div>{formatCurrency(total, codiso)}</div>
            </Button>
          </div>
          <div>
            <Button
              className="btn-link w-full !flex items-center justify-between px-0"
              onClick={handleClearSale}
            >
              <div className="text-dark">{totalQuantity}</div>
              <div className="text-danger">Cancelar (F2)</div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

InvoiceFooter.propTypes = {
  codiso: PropTypes.string.isRequired,
  impuestos: PropTypes.array.isRequired,
  detalleVenta: PropTypes.array.isRequired,
  handleOpenSale: PropTypes.func.isRequired,
  handleClearSale: PropTypes.func.isRequired,
};

export default InvoiceFooter;
