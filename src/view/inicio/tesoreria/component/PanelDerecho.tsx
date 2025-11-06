import Button from "@/components/Button";
import DetalleGrid from "@/components/grid/DetailGrid";
import SearchInput from "@/components/SearchInput";
import Select from "@/components/Select";
import { HeaderActions } from "@/components/Title";
import { images } from "@/helper";
import { calculateTax, calculateTaxBruto, isEmpty, formatCurrency } from "@/helper/utils.helper";
import { cn } from "@/lib/utils";

interface Props {
  comprobantes: Array<any>;
  refComprobante: React.RefObject<any>;
  idComprobante: string;
  handleSelectComprobante: () => void;

  handleOpenOrdenCompra?: () => void;

  proveedores: Array<any>;
  refProveedor: React.RefObject<any>;
  refProveedorValue: React.RefObject<any>;
  handleFilterProveedor: () => void;
  handleOpenModalProveedor: () => void;
  handleClearInputProveedor: () => void;
  handleSelectItemProveedor: () => void;

  almacenes: Array<any>;
  refAlmacenDestino?: React.RefObject<any>;
  idAlmacenDestino?: string;
  handleSelectAlmacenDestino?: () => void;

  detalles: Array<any>;
  codiso: string;

  handleLimpiar?: () => void;

  handleOpenOptions: () => void;
  
  handleOpenModalProducto: (item: any, tipo: string) => void;
  handleRemoverProducto: (idProducto: string) => void;

  handleGuardar: () => void;
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
  handleLimpiar,
  handleOpenOptions,
  handleOpenModalProducto,
  handleRemoverProducto,
  handleGuardar,
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
            <p>{impuesto.nombre}:</p>
            <p>
              {formatCurrency(impuesto.valor, codiso)}
            </p>
          </div>
        );
      });
    };

    return (
      <>
        <div className="flex justify-between items-center text-gray-600">
          <p>Sub Total:</p>
          <p>
            {formatCurrency(subTotal, codiso)}
          </p>
        </div>
        {impuestosGenerado()}
        <Button className="btn-success w-full" onClick={handleGuardar}>
          <div className="flex justify-between items-center py-1">
            <p className="text-xl">Registrar(F1)</p>
            <p className="text-xl">
              {formatCurrency(total, codiso)}
            </p>
          </div>
        </Button>
      </>
    );
  }

  // border border-solid border-[#cbd5e1]

  const actions = [];

  if (handleOpenOrdenCompra) {
    actions.push({
      icon: <i className="bi bi-file-earmark-text text-xl text-secondary"></i>,
      onClick: handleOpenOrdenCompra,
      title: "Orden de compra",
    });
  }

  if (handleLimpiar) {
    actions.push({
      icon: <i className="bi bi-arrow-clockwise text-xl text-secondary"></i>,
      onClick: handleLimpiar,
      title: "Limpiar",
    });
  }

  actions.push({
    icon: <i className="bi bi-three-dots-vertical text-xl text-secondary"></i>,
    onClick: handleOpenOptions,
    title: "Opciones",
  });


  return (
    <div className="flex flex-col relative w-full">
      {/* Header */}
      <HeaderActions
        title="Resumen"
        actions={actions}
      />

      {/* Filtros */}
      <div className="flex flex-col p-3 border-b border-solid border-[#cbd5e1]" >
        <Select
          ref={refComprobante}
          value={idComprobante}
          onChange={handleSelectComprobante}
          className="mb-3"
        >
          <option value="">-- Comprobantes --</option>
          {comprobantes.map((item, index) => (
            <option key={index} value={item.idComprobante}>
              {item.nombre + ' (' + item.serie + ')'}
            </option>
          ))}
        </Select>

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
              className="btn-outline-primary !flex items-center"
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

        {
          refAlmacenDestino && (
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
          )
        }
      </div>

      {/* Detalles */}
      <DetalleGrid
        operation={"subtraction"}
        detalles={detalles}
        codiso={codiso}
        images={images}
        onEdit={(item) => handleOpenModalProducto(item, "edit")}
        onRemove={(id: string) => handleRemoverProducto(id)}
      />

      {/* Resumen */}
      <div className="flex flex-col p-3 gap-3 border-t border-solid border-[#e2e8f0]">
        {renderTotal()}

        <div className="flex justify-between items-center font-normal">
          <p className="text-gray-500">Cantidad:</p>
          <p className={
            cn(
              isEmpty(detalles) ? "text-gray-500" : "text-red-500"
            )
          }>
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