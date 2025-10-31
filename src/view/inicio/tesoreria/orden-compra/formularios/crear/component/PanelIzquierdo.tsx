import Button from "@/components/Button";
import ListGrid from "@/components/grid/ListGrid";
import Search from "@/components/Search";
import { TitlePos } from "@/components/Title";
import { images } from "@/helper";
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

const PanelIzquierdo: React.FC<Props> = ({
    loadingProducto,
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
            <TitlePos title="Orden de Compra" subTitle="Crear" handleGoBack={handleCerrar} />

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
            <ListGrid
                items={productos}
                loading={loadingProducto}
                onSelectItem={handleSelectItemProducto}
                emptyMessage="Use la barra de busqueda para encontrar su producto."
                loadingMessage="Cargando productos..."
                codiso={codiso}
                images={images}
            />
        </div >
    );
};

export default PanelIzquierdo;