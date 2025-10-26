import Button from "@/components/Button";
import Image from "@/components/Image";
import SearchInput from "@/components/SearchInput";
import Select from "@/components/Select";
import { images } from "@/helper";
import { calculateTax, calculateTaxBruto, isEmpty, numberFormat, rounded } from "@/helper/utils.helper";
import { cn } from "@/lib/utils";

interface Props {
  comprobantes: Array<any>;
  refComprobante: React.RefObject<any>;
  idComprobante: string;
  handleSelectComprobante: () => void;
  handleOpenOrdenCompra: () => void;

  proveedores: Array<any>;
  refProveedor: React.RefObject<any>;
  refProveedorValue: React.RefObject<any>;
  handleFilterProveedor: () => void;
  handleOpenModalProveedor: () => void;
  handleClearInputProveedor: () => void;
  handleSelectItemProveedor: () => void;

  almacenes: Array<any>;
  refAlmacenDestino: React.RefObject<any>;
  idAlmacenDestino: string;
  handleSelectAlmacenDestino: () => void;

  detalles: Array<any>;
  codiso: string;

  handleGuardar: () => void;
  handleLimpiar: () => void;
  handleOpenOptions: () => void;
  handleOpenModalProducto: (item: any, tipo: string) => void;
  handleRemoverProducto: (idProducto: string) => void;
}

const PanelDerecho: React.FC<Props> = ({
  comprobantes,
  refComprobante,
  idComprobante,
  handleSelectComprobante,
  handleOpenOrdenCompra,
  proveedores,
  refProveedor,
  refProveedorValue,
  handleFilterProveedor,
  handleOpenModalProveedor,
  handleClearInputProveedor,
  handleSelectItemProveedor,
  almacenes,
  refAlmacenDestino,
  idAlmacenDestino,
  handleSelectAlmacenDestino,
  detalles,
  codiso,
  handleGuardar,
  handleLimpiar,
  handleOpenOptions,
  handleOpenModalProducto,
  handleRemoverProducto,
}) => {


  const renderTotal = () => {
    let subTotal = 0;
    let total = 0;

    for (const item of detalles) {
      const cantidad = !item.lote
        ? item.cantidad
        : item.lotes.reduce(
          (acumulador: number, item: any) => acumulador + Number(item.cantidad.value),
          0,
        );
      const valor = item.costo;

      const porcentaje = item.porcentajeImpuesto;

      const valorActual = cantidad * valor;
      const valorSubNeto = calculateTaxBruto(porcentaje, valorActual);
      const valorImpuesto = calculateTax(porcentaje, valorSubNeto);
      const valorNeto = valorSubNeto + valorImpuesto;

      subTotal += valorSubNeto;
      total += valorNeto;
    }

    const impuestosGenerado = () => {
      const resultado = detalles.reduce((acc, item) => {
        const cantidad = !item.lote
          ? item.cantidad
          : item.lotes.reduce(
            (acumulador: number, item: any) => acumulador + Number(item.cantidad.value),
            0,
          );
        const total = cantidad * item.costo;
        const subTotal = calculateTaxBruto(item.porcentajeImpuesto, total);
        const impuestoTotal = calculateTax(item.porcentajeImpuesto, subTotal);

        const existingImpuesto = acc.find(
          (imp: any) => imp.idImpuesto === item.idImpuesto,
        );

        if (existingImpuesto) {
          existingImpuesto.valor += impuestoTotal;
        } else {
          acc.push({
            idImpuesto: item.idImpuesto,
            nombre: item.nombreImpuesto,
            valor: impuestoTotal,
          });
        }

        return acc;
      }, []);

      return resultado.map((impuesto: any, index: number) => {
        return (
          <div
            key={index}
            className="flex justify-between items-center text-gray-600"
          >
            <p className="m-0">{impuesto.nombre}:</p>
            <p className="m-0">
              {numberFormat(impuesto.valor, codiso)}
            </p>
          </div>
        );
      });
    };

    return (
      <>
        <div className="flex justify-between items-center text-gray-600">
          <p className="m-0">Sub Total:</p>
          <p className="m-0">
            {numberFormat(subTotal, codiso)}
          </p>
        </div>
        {impuestosGenerado()}
        <Button className="btn-success w-full" onClick={handleGuardar}>
          <div className="flex justify-between items-center py-1">
            <p className="m-0 text-xl">Registrar(F1)</p>
            <p className="m-0 text-xl">
              {numberFormat(total, codiso)}
            </p>
          </div>
        </Button>
      </>
    );
  }

  // border border-solid border-[#cbd5e1]

  return (
    <div className="flex flex-col relative w-full">
      {/* Header */}
      <div className="min-h-[50px] border-b border-solid border-[#cbd5e1]">
        <div className="flex items-center justify-between h-full">
          <div className="pl-3">
            <h5 className="m-0">Resumen</h5>
          </div>

          <div className="flex justify-end">
            <Button
              className="btn-link"
              onClick={handleOpenOrdenCompra}
            >
              <i className="bi bi-file-earmark-text text-xl text-secondary"></i>
            </Button>
            <Button className="btn-link"
              onClick={handleLimpiar}>
              <i className="bi bi-arrow-clockwise text-xl text-secondary"></i>
            </Button>
            <Button className="btn-link"
              onClick={handleOpenOptions}>
              <i className="bi bi-three-dots-vertical text-xl text-secondary"></i>
            </Button>
          </div>
        </div>
      </div>


      {/* Filtros */}
      <div className="d-flex flex-column px-3 pt-3 border-b border-solid border-[#cbd5e1]" >
        <div className="form-group">
          <Select
            ref={refComprobante}
            value={idComprobante}
            onChange={handleSelectComprobante}
          >
            <option value="">-- Comprobantes --</option>
            {comprobantes.map((item, index) => (
              <option key={index} value={item.idComprobante}>
                {item.nombre + ' (' + item.serie + ')'}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <SearchInput
            ref={refProveedor}
            placeholder="Filtrar proveedores..."
            refValue={refProveedorValue}
            data={proveedores}
            handleClearInput={handleClearInputProveedor}
            handleFilter={handleFilterProveedor}
            handleSelectItem={handleSelectItemProveedor}
            customButton={
              <Button
                className="btn-outline-primary d-flex align-items-center"
                onClick={handleOpenModalProveedor}
              >
                <i className="fa fa-user-plus"></i>
                <div className="ml-2">Nuevo</div>
              </Button>
            }
            renderItem={(value) => (
              <>{value.documento + ' - ' + value.informacion}</>
            )}
          />
        </div>

        <div className="form-group">
          <Select
            ref={refAlmacenDestino}
            value={idAlmacenDestino}
            onChange={handleSelectAlmacenDestino}
          >
            <option value="">-- Almacen de destino --</option>
            {almacenes.map((item, index) => (
              <option key={index} value={item.idAlmacen}>
                {item.nombre}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Detalles */}
      <div
        className={
          cn(
            "flex flex-col text-center rounded h-full bg-[#f8fafc]",
            isEmpty(detalles) ? "justify-center items-center p-3" : "overflow-auto"
          )
        }
      >
        {isEmpty(detalles) && (
          <div className="text-center">
            <i className="fa fa-shopping-basket text-secondary text-2xl"></i>
            <p className="text-secondary text-lg mb-0">
              Aquí verás los productos que elijas en tu próxima pedido
            </p>
          </div>
        )}

        {detalles.map((item, index) => {
          const cantidad = !item.lote
            ? item.cantidad
            : item.lotes.reduce(
              (acumulador: number, item: any) =>
                acumulador + Number(item.cantidad.value),
              0,
            );
          const costo = item.costo;

          return (
            <div
              key={index}
              className="grid px-3 relative items-center bg-white border-b border-solid border-[#e2e8f0]"
              style={{
                gridTemplateColumns: '60% 20% 20%',
              }}
            >
              {/* Primera columna (imagen y texto) */}
              <div className="flex items-center">
                <Image
                  default={images.noImage}
                  src={item.imagen}
                  alt={item.nombre}
                  width={80}
                  height={80}
                  className="object-contain"
                />

                <div className="p-3 text-left">
                  <p className="m-0 text-sm"> {item.codigo}</p>
                  <p className="m-0 text-base font-weight-bold text-break">
                    {item.nombre}
                  </p>
                  <p className="m-0">
                    {numberFormat(costo, codiso)}
                  </p>
                </div>
              </div>

              {/* Segundo columna (costo total) y opciones */}
              <div className="flex flex-col justify-end items-center">
                <div className="h-full text-xml">
                  {rounded(cantidad)}
                </div>
              </div>

              {/* Tercera columna (costo total) y opciones */}
              <div className="flex flex-col justify-end items-center">
                <div className="h-full text-lg">
                  {numberFormat(cantidad * costo, codiso)}
                </div>

                <div className="flex items-end justify-end gap-4">
                  <Button
                    className="btn-link"
                    onClick={() =>
                      handleOpenModalProducto(item, 'edit')
                    }
                  >
                    <i className="fa fa-edit text-warning text-xl"></i>
                  </Button>
                  <Button
                    className="btn-link"
                    onClick={() =>
                      handleRemoverProducto(item.idProducto)
                    }
                  >
                    <i className="fa fa-trash text-danger text-xl"></i>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen */}
      <div className="flex flex-col p-3 gap-3 border-t border-solid border-[#e2e8f0]">
        {renderTotal()}

        <div className="flex justify-between items-center font-normal text-black">
          <p className="m-0">Cantidad:</p>
          <p className="m-0">
            {detalles.length === 1
              ? detalles.length + ' Producto'
              : detalles.length + ' Productos'}{' '}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PanelDerecho;