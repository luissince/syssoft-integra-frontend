import Button from "@/components/Button";
import Search from "@/components/Search";
import { TitlePos } from "@/components/Title";
import { images } from "@/helper";
import { formatCurrency, formatDecimal, isEmpty } from "@/helper/utils.helper";
import { cn } from "@/lib/utils";
import React from "react";
import Image from "./Image";
import { SpinnerTransparent } from "./Spinner";
import { TIPO_PRODUCTO_ACTIVO_FIJO, TIPO_PRODUCTO_LOTE, TIPO_PRODUCTO_NORMAL, TIPO_PRODUCTO_SERVICIO } from "@/model/types/tipo-producto";

interface Props {
    type: "costo" | "precio";
    title: string;
    subTile?: string;
    icon?: JSX.Element;
    loadingProducto: boolean;
    loadingMessage: string;
    emptyMessage: string;
    productos: Array<any>;
    codiso: string;
    refProducto: React.RefObject<any>;
    refProductoValue: React.RefObject<any>;
    handleCerrar: () => void;
    handleFilterProducto: () => void;
    handleSelectItemProducto: (item: any) => void;
}

const ProductSelectorPanel: React.FC<Props> = ({
    type,
    title,
    subTile,
    icon,
    loadingProducto,
    loadingMessage,
    emptyMessage,
    productos,
    codiso,
    refProducto,
    refProductoValue,
    handleCerrar,
    handleFilterProducto,
    handleSelectItemProducto
}) => {
    return (
        <div className="w-full flex flex-col relative flex-[0_0_60%]" >

            {/* Header */}
            <TitlePos
                title={title}
                subTitle={subTile}
                icon={icon}
                handleGoBack={handleCerrar}
            />

            {/* Filtros */}
            <div className="px-3 py-3 border-b border-r border-solid border-[#cbd5e1]">
                <Search
                    ref={refProducto}
                    refInput={refProductoValue}
                    group={true}
                    iconLeft={<i className="bi bi-search"></i>}
                    onSearch={handleFilterProducto}
                    placeholder="Buscar..."
                    buttonRight={
                        <Button
                            className="btn-outline-secondary"
                            title="Limpiar"
                            onClick={() => {
                                refProducto.current.restart();
                                refProductoValue.current.focus();
                            }}
                        >
                            <i className="fa fa-close"></i>
                        </Button>
                    }
                />
            </div>

            {/* Productos */}
            <div
                className={cn(
                    "p-3 h-full overflow-auto border-r border-solid border-[#cbd5e1] bg-[#f8fafc]",
                    isEmpty(productos) && "flex flex-row justify-center items-center gap-4"
                )}
            >
                {/* Estado: Cargando */}
                {loadingProducto && (
                    <div className="text-center relative">
                        <SpinnerTransparent loading={true} message={loadingMessage} />
                    </div>
                )}

                {/* Estado: Vacío */}
                {!loadingProducto && isEmpty(productos) && (
                    <div className="text-center relative">
                        <i className="bi bi-cart4 text-secondary text-2xl"></i>
                        <p className="text-secondary text-lg mb-0">{emptyMessage}</p>
                    </div>
                )}

                {/* Estado: Con datos */}
                {!isEmpty(productos) && (
                    <div className="flex justify-center flex-wrap gap-4">
                        {productos.map((item: any, index: number) => (
                            <Button
                                key={index}
                                className="bg-white border border-solid border-[#e2e8f0] w-60 flex flex-col !p-0"
                                onClick={() => handleSelectItemProducto(item)}
                            >
                                <div className="flex-1 px-3 py-4 flex flex-col">
                                    <Image
                                        default={images.noImage}
                                        isFullScreen={false}
                                        src={item.imagen}
                                        alt={item.nombre}
                                        overrideClass="mb-2 w-full h-40 object-contain"
                                    />

                                    {/* Nombre */}
                                    <p className="text-base text-gray-800">
                                        {item.codigo}
                                    </p>
                                    <p className="text-lg font-semibold text-gray-800 mb-3 line-clamp-3 min-h-16">
                                        {item.nombre}
                                    </p>

                                    {/* Stock o servicio */}
                                    <div className="mt-auto space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-600">
                                                {item.idTipoProducto === TIPO_PRODUCTO_NORMAL && "Stock"}
                                                {item.idTipoProducto === TIPO_PRODUCTO_SERVICIO && "Servicio"}
                                                {item.idTipoProducto === TIPO_PRODUCTO_LOTE && "Lote"}
                                                {item.idTipoProducto === TIPO_PRODUCTO_ACTIVO_FIJO && "Activo Fijo"}
                                            </span>

                                            {
                                                item.idTipoProducto !== TIPO_PRODUCTO_SERVICIO && (
                                                    <span
                                                        className={cn(
                                                            "text-base font-bold",
                                                            item.cantidad <= 0
                                                                ? "text-red-600"
                                                                : "text-green-500"
                                                        )}
                                                    >
                                                        {formatDecimal(item.cantidad)}
                                                    </span>
                                                )
                                            }
                                        </div>
                                    </div>

                                    {/* Calcular */}
                                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                                        <span className="text-sm font-medium text-gray-600">
                                            {type === "costo" ? "Costo" : "Precio"}:
                                        </span>
                                        <span className="text-lg font-bold text-blue-600">
                                            <span>
                                                {type === "costo" && (
                                                    formatCurrency(item.costo, codiso)
                                                )}
                                                {type === "precio" && (
                                                    formatCurrency(item.precio, codiso)
                                                )}
                                            </span>
                                            <small className="text-xs"> x {item.medida}</small>
                                        </span>
                                    </div>
                                </div>

                                {/* Almacén */}
                                <div className="bg-gray-100 min-h-10 flex items-center">
                                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide text-center w-full">
                                        Almacén: {item.almacen}
                                    </span>
                                </div>
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
};

export default ProductSelectorPanel;