import Button from "@/components/Button";
import Select from "@/components/Select";
import { HeaderAction, HeaderActions } from "@/components/Title";
import { images } from "@/helper";
import { calculateTax, calculateTaxBruto, isEmpty, formatCurrency, rounded } from "@/helper/utils.helper";
import { cn } from "@/lib/utils";
import Image from "./Image";
import { Pencil, Trash } from "lucide-react";
import React from "react";

interface Props {
    type: "costo" | "precio";
    emptyMessage: string;

    comprobantes: Array<any>;
    refComprobante: React.RefObject<any>;
    idComprobante: string;
    handleSelectComprobante: () => void;

    components?: Array<React.ReactNode>;

    detalles: Array<any>;
    codiso: string;

    actions?: HeaderAction[],

    handleOpenModalProducto: (item: any, tipo: string) => void;
    handleRemoverProducto: (idProducto: string) => void;

    handleRegister: () => void;
}

const ProductTransactionPanel: React.FC<Props> = ({
    type,
    emptyMessage = "Aquí verás los productos que elijas en tu próximo pedido",

    comprobantes,
    refComprobante,
    idComprobante,
    handleSelectComprobante,

    components,

    detalles,
    codiso,

    actions,

    handleOpenModalProducto,
    handleRemoverProducto,

    handleRegister,
}) => {

    const renderTotal = () => {
        let subTotal = 0;
        let total = 0;

        for (const item of detalles) {
            const cantidad = item.cantidad;
            const valor = type === "costo" ? item.costo : item.precio;

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
                const cantidad = item.cantidad;
                const valor = type === "costo" ? item.costo : item.precio;
                const total = cantidad * valor;

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
                <Button className="btn-success w-full" onClick={handleRegister}>
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

                {components.map((component, index) => {
                    return (
                        <React.Fragment key={index}>
                            {component}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Detalles */}
            <div
                className={cn(
                    "flex flex-col text-center rounded h-full bg-[#f8fafc]",
                    isEmpty(detalles)
                        ? "justify-center items-center p-3"
                        : "overflow-auto"
                )}
            >
                {isEmpty(detalles) && (
                    <div className="text-center">
                        <i className="fa fa-shopping-basket text-secondary text-2xl"></i>
                        <p className="text-secondary text-lg mb-0">{emptyMessage}</p>
                    </div>
                )}

                {detalles.map((item, index) => {
                    const cantidad = item.cantidad ?? 0;
                    const valor = type === "costo" ? item.costo : item.precio;
                    const total = cantidad * valor;

                    return (
                        <div
                            key={index}
                            className={
                                cn(
                                    "relative",
                                    "grid [grid-template-columns:60%_20%_20%] items-center",
                                    "px-3",
                                    "bg-white border-b border-solid border-[#e2e8f0]"
                                )
                            }
                        >
                            {/* Columna 1: imagen y descripción */}
                            <div className="flex items-center">
                                <Image
                                    default={images.noImage}
                                    src={item.imagen}
                                    alt={item.nombre}
                                    width={80}
                                    height={80}
                                    className="object-contain rounded"
                                />
                                <div className="p-3 text-left">
                                    <p className="text-sm text-gray-500">{item.codigo}</p>
                                    <p className="text-base font-semibold break-words">
                                        {item.nombre}
                                    </p>
                                    <p>
                                        {formatCurrency(type === "costo" ? item.costo : item.precio, codiso)}
                                    </p>
                                </div>
                            </div>

                            {/* Columna 2: cantidad */}
                            <div className="flex flex-col justify-end items-center">
                                <div className="h-full text-base">{rounded(cantidad)}</div>
                            </div>

                            {/* Columna 3: total y acciones */}
                            <div className="flex flex-col h-full justify-between items-center">

                                <div className="flex-1 flex items-center text-lg font-semibold text-gray-800">
                                    {formatCurrency(total, codiso)}
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        className="btn-link"
                                        onClick={() => handleOpenModalProducto(item, "edit")}
                                        title="Editar producto"
                                    >
                                        <Pencil className="w-5 h-5 text-yellow-500" />
                                    </Button>

                                    <Button
                                        className="btn-link"
                                        onClick={() => handleRemoverProducto(item.idProducto)}
                                        title="Eliminar producto"
                                    >
                                        <Trash className="w-5 h-5 text-red-500" />
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

                <div className="flex justify-between items-center font-normal">
                    <p>Cantidad:</p>
                    <p className={
                        cn(
                            isEmpty(detalles) && "text-red-500"
                        )
                    }>
                        {detalles.length === 1
                            ? detalles.length + ' Producto'
                            : detalles.length + ' Productos'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProductTransactionPanel;