import Button from "@/components/Button";
import Image from "@/components/Image";
import Search from "@/components/Search";
import { SpinnerTransparent } from "@/components/Spinner";
import { images } from "@/helper";
import { formatDecimal, isEmpty, numberFormat } from "@/helper/utils.helper";
import { cn } from "@/lib/utils";
import { PRODUCTO } from "@/model/types/tipo-producto";
import { ArrowLeft, Plus } from "lucide-react";
import React from "react";

interface Props {
    loadingProducto: boolean;
    productos: Array<any>;
    codiso: string;
    refProducto: React.RefObject<any>;
    refProductoValue: React.RefObject<any>;
    handleCerrar: () => void;
    handleFilterProducto: () => void;
    handleSelectItemProducto: (item: any) => void;
}

const PanelIzquierdo: React.FC<Props> = ({ loadingProducto, productos, codiso, refProducto, refProductoValue, handleCerrar, handleFilterProducto, handleSelectItemProducto }) => {
    return (
        <div className="w-full flex flex-col relative flex-[0_0_60%]" >

            {/* Header */}
            <div className="min-h-[50px] border-b border-r border-solid border-[#cbd5e1]">
                <div className="flex items-center px-3 h-full">
                    <Button className="btn btn-link" onClick={handleCerrar}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>

                    <div className="flex items-center gap-x-2">
                        <h5 className="m-0">Compra</h5> <small className="text-gray-500">Crear</small>
                    </div>
                </div>
            </div>

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
                className={
                    cn(
                        "p-3 h-full overflow-auto border-r border-solid border-[#cbd5e1] bg-[#f8fafc]",
                        isEmpty(productos) &&
                        "flex flex-row justify-center items-center gap-4"
                    )
                }
            >
                {loadingProducto && (
                    <div className="text-center relative">
                        <SpinnerTransparent
                            loading={true}
                            message={'Buscando productos...'}
                        />
                    </div>
                )}

                {!loadingProducto &&
                    isEmpty(productos) && (
                        <div className="text-center relative">
                            <i className="bi bi-cart4 text-secondary text-2xl"></i>
                            <p className="text-secondary text-lg mb-0">
                                Use la barra de busqueda para encontrar su producto.
                            </p>
                        </div>
                    )}

                {!isEmpty(productos) && (
                    <div className="flex justify-center flex-wrap gap-4">
                        {productos.map((item: any, index: number) => (
                            <Button
                                key={index}
                                className="btn-light bg-white border border-solid border-[#e2e8f0] w-60"
                                onClick={() => handleSelectItemProducto(item)}
                            >
                                <div className="flex flex-col items-center justify-center p-3">
                                    <div className="flex flex-col justify-center items-center">
                                        <Image
                                            default={images.noImage}
                                            src={item.imagen}
                                            alt={item.nombre}
                                            width={150}
                                            height={150}
                                            className="mb-2 object-contain"
                                        />
                                        <p
                                            className={`${item.idTipoProducto === PRODUCTO &&
                                                item.cantidad <= 0
                                                ? 'badge badge-danger text-base'
                                                : 'badge badge-success text-base'
                                                } `}
                                        >
                                            STOCK: {formatDecimal(item.cantidad)}
                                        </p>
                                    </div>

                                    <div className="d-flex justify-content-center align-items-center flex-column">
                                        <p className="m-0 text-lg">{item.nombre}</p>
                                        <p className="m-0 text-xl font-weight-bold">
                                            {numberFormat(item.costo, codiso)}{' '}
                                            <small>x {item.unidad}</small>
                                        </p>
                                    </div>
                                </div>

                                <div className="w-100 text-left text-sm">
                                    Almacen: {item.almacen}
                                </div>
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
};

export default PanelIzquierdo;