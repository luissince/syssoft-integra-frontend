import Button from "@/components/Button";
import Image from "@/components/Image";
import Search from "@/components/Search";
import { SpinnerTransparent } from "@/components/Spinner";
import { images } from "@/helper";
import { formatCurrency, formatDecimal, isEmpty } from "@/helper/utils.helper";
import { cn } from "@/lib/utils";
import { TIPO_PRODUCTO_SERVICIO } from "@/model/types/tipo-producto";
import { ArrowLeft } from "lucide-react";
import React from "react";

interface Props {
    loading: boolean;
    title: React.ReactNode;

    productos: Array<any>;
    codiso: string;

    handleCerrar: () => void;
    handleFilterProducto: () => void;
    handleSelectItemProducto: (item: any) => void;
}

const PanelIzquierdo: React.FC<Props> = ({
    loading,
    title,
    productos,
    codiso,
    handleCerrar,
    handleFilterProducto,
    handleSelectItemProducto
}) => {

    const refProducto = React.createRef<Search>();
    const refProductoValue = React.createRef<HTMLInputElement>();

    return (
        <div className="w-full flex flex-col relative flex-[0_0_60%]">
            <div className="flex items-center px-3 border-b border-solid border-[#cbd5e1]">
                <div className="flex">
                    <Button className="btn btn-link" onClick={handleCerrar}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </div>

                <div className="py-3 flex items-center gap-2">
                    {title}
                </div>
            </div>

            <div className="px-3 py-3 border-b border-solid border-[#cbd5e1]">
                <Search
                    ref={refProducto}
                    refInput={refProductoValue}
                    group={true}
                    iconLeft={<i className="bi bi-search "></i>}
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

            <div
                className={cn(
                    "bg-[#f8fafc] overflow-auto p-3 h-full",
                    isEmpty(productos) && 'flex flex-row justify-center items-center gap-4'
                )}
            >
                {loading && (
                    <div className="relative w-full h-full text-center">
                        <SpinnerTransparent
                            loading={true}
                            message={'Buscando productos...'}
                        />
                    </div>
                )}

                {!loading &&
                    isEmpty(productos) && (
                        <div className="text-center relative">
                            <i className="bi bi-cart4 text-secondary text-2xl"></i>
                            <p className="text-secondary text-lg mb-0">
                                Use la barra de busqueda para encontrar su producto.
                            </p>
                        </div>
                    )}

                <div className="flex justify-center flex-wrap gap-4">
                    {productos.map((item, index) => (
                        <Button
                            key={index}
                            className="btn-light w-64 bg-white border border-solid border-[#e2e8f0]"
                            onClick={() => handleSelectItemProducto(item)}
                        >
                            <div className="flex flex-col justify-center items-center p-3 text-center">
                                <div className="flex flex-col justify-center items-center mb-2">
                                    <Image
                                        default={images.noImage}
                                        src={item.imagen}
                                        alt={item.nombre}
                                        width={150}
                                        height={150}
                                        className="mb-2 object-contain"
                                    />
                                    {
                                        item.idTipoProducto === TIPO_PRODUCTO_SERVICIO ? (
                                            <p className="badge badge-success text-base">
                                                SERVICIO
                                            </p>
                                        ) : (
                                            <p
                                                className={cn(
                                                    "badge text-base",
                                                    item.cantidad <= 0 ? 'badge-danger' : 'badge-success'
                                                )}
                                            >
                                                STOCK: {formatDecimal(item.cantidad)}
                                            </p>
                                        )
                                    }
                                </div>

                                <div className="flex flex-col justify-center items-center">
                                    <span className="text-sm">{item.codigo}</span>
                                    <p className="text-base">{item.nombre}</p>
                                    <p className="text-xl font-weight-bold">
                                        <span>{formatCurrency(item.precio, codiso)}</span>
                                        <span className="text-sm"> x {item.unidad}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="w-full text-left text-sm">
                                Almacen: {item.almacen}
                            </div>
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PanelIzquierdo;