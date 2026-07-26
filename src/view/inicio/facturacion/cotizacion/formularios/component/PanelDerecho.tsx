import Button from "@/components/Button";
import Image from "@/components/Image";
import SearchInput from "@/components/SearchInput";
import Select from "@/components/Select";
import { images } from "@/helper";
import { calculateTax, calculateTaxBruto, formatCurrency, isEmpty, rounded } from "@/helper/utils.helper";
import { cn } from "@/lib/utils";
import { Pencil, Trash } from "lucide-react";
import React from "react";

interface Props {
    codiso: string;
    clientes: Array<any>;
    comprobantes: Array<any>;
    detalles: Array<any>;

    refComprobante: React.RefObject<any>;
    idComprobante: string;
    handleSelectComprobante: () => void;

    refCliente: React.RefObject<any>;
    refClienteValue: React.RefObject<any>;
    handleClearInputCliente: () => void;
    handleFilterCliente: () => void;
    handleSelectItemCliente: (value: any) => void;

    handleOpenModalPersona: () => void;

    handleOpenOptions: () => void;
    handleOpenModalProducto: (item: any) => void;
    handleRemoverProducto: (idProducto: string) => void;

    handleGuardar: () => void;
}

const PanelDerecho: React.FC<Props> = ({
    codiso,
    clientes,
    comprobantes,
    detalles,

    refComprobante,
    idComprobante,
    handleSelectComprobante,

    refCliente,
    refClienteValue,
    handleClearInputCliente,
    handleFilterCliente,
    handleSelectItemCliente,

    handleOpenModalPersona,

    handleOpenOptions,
    handleOpenModalProducto,
    handleRemoverProducto,

    handleGuardar,
}) => {

    const renderTotal = () => {
        let subTotal = 0;
        let total = 0;

        for (const item of detalles) {
            const cantidad = item.cantidad;
            const valor = item.precio;

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
                const total = item.cantidad * item.precio;
                const subTotal = calculateTaxBruto(item.porcentajeImpuesto, total);
                const impuestoTotal = calculateTax(item.porcentajeImpuesto, subTotal);

                const existingImpuesto = acc.find(
                    (imp) => imp.idImpuesto === item.idImpuesto,
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

            return resultado.map((impuesto, index) => {
                return (
                    <div
                        key={index}
                        className="flex justify-between items-center"
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
                <div className="flex justify-between items-center">
                    <p>Sub Total:</p>
                    <p>
                        {formatCurrency(subTotal, codiso)}
                    </p>
                </div>
                {impuestosGenerado()}
                <Button className="btn-success w-100" onClick={handleGuardar}>
                    <div className="flex justify-between items-center py-1">
                        <p className="text-xl">Total:</p>
                        <p className="text-xl">
                            {formatCurrency(total, codiso)}
                        </p>
                    </div>
                </Button>
            </>
        );
    }

    return (
        <div className="flex flex-col relative bg-white flex-[1_1_100%] border-l border-solid border-[#cbd5e1]">
            <div className="flex justify-between items-center px-3 border-b border-solid border-[#cbd5e1]">
                <div className="py-3">
                    <p className="h5 m-0">Resumen</p>
                </div>

                <div className="flex justify-end">
                    <Button
                        className="btn btn-link"
                        onClick={handleOpenOptions}
                    >
                        <i className="bi bi-three-dots-vertical text-xl text-secondary"></i>
                    </Button>
                </div>
            </div>

            <div
                className="flex flex-col px-3 pt-3 border-b border-solid border-[#cbd5e1]"
            >
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
                        ref={refCliente}
                        placeholder="Filtrar clientes..."
                        refValue={refClienteValue}
                        data={clientes}
                        handleClearInput={handleClearInputCliente}
                        handleFilter={handleFilterCliente}
                        handleSelectItem={handleSelectItemCliente}
                        customButton={
                            <Button
                                className="btn-outline-success d-flex align-items-center"
                                onClick={handleOpenModalPersona}
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
            </div>

            <div
                className={cn(
                    "bg-[#f8fafc] flex flex-col text-center rounded h-full",
                    isEmpty(detalles)
                        ? 'justify-center items-center p-3'
                        : 'overflow-auto'
                )}
            >
                {isEmpty(detalles) && (
                    <div className="text-center">
                        <i className="fa fa-shopping-basket text-secondary text-2xl"></i>
                        <p className="text-secondary text-lg mb-0">
                            Aquí verás los productos que elijas en tu próxima venta
                        </p>
                    </div>
                )}
                {detalles.map((item, index) => (
                    <div
                        key={index}
                        className={cn(
                            "grid",
                            "px-3",
                            "items-center",
                            "bg-white",
                            "grid-cols-[60%_15%_25%]",
                            "border-b",
                            "border-[#e2e8f0]",
                        )}
                    >
                        {/* Columna 1: Imagen + información */}
                        <div className="d-flex align-items-center">
                            <div className="me-3 w-20 h-20 flex-shrink-0">
                                <Image
                                    default={images.noImage}
                                    src={item.imagen}
                                    alt={item.nombre}
                                    overrideClass="w-full h-full rounded object-contain border"
                                />
                            </div>

                            <div className="p-2 text-left">
                                <p className="text-sm mb-1">
                                    {item.codigo}
                                </p>

                                <p className="text-base font-weight-bold text-break mb-1">
                                    {item.nombre}
                                </p>

                                <p className="mb-0">
                                    {formatCurrency(item.precio, codiso)}
                                    {' '}
                                    <small>x {item.nombreMedida}</small>
                                </p>
                            </div>
                        </div>


                        {/* Columna 2: Cantidad */}
                        <div className="d-flex justify-content-center align-items-center">
                            <span className="text-lg">
                                {rounded(item.cantidad)}
                            </span>
                        </div>


                        {/* Columna 3: Total + botones */}
                        <div className="flex flex-col h-full">
                            <div className="flex-1 flex items-center justify-end text-lg font-weight-bold">
                                {formatCurrency(
                                    item.cantidad * item.precio,
                                    codiso,
                                )}
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    className="btn-link"
                                    onClick={() => handleOpenModalProducto(item)}
                                >
                                    <Pencil className="h-4 w-4 text-yellow-500" />
                                </Button>

                                <Button
                                    className="btn-link -mr-3"
                                    onClick={() =>
                                        handleRemoverProducto(item.idProducto)
                                    }
                                >
                                    <Trash className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        </div>

                    </div>
                ))}
            </div>

            <div
                className="text-right text-xl d-flex flex-column p-3 gap-3 border-t border-solid border-[#e2e8f0]"
            >
                {renderTotal()}

                <div className="d-flex justify-content-between align-items-center">
                    <p>Cantidad:</p>
                    <p>
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