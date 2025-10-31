import React from "react";
import { cn } from "@/lib/utils";
import { formatDecimal, isEmpty, formatCurrency } from "@/helper/utils.helper";
import { SpinnerTransparent } from "../Spinner";
import Image from "../Image";
import { PRODUCTO } from "@/model/types/tipo-producto";
import Button from "../Button";

interface ListGridProps {
  items: any[];
  loading: boolean;
  onSelectItem: (item: any) => void;
  emptyMessage?: string;
  loadingMessage?: string;
  codiso?: string;
  images: { noImage: string };
}

const ListGrid: React.FC<ListGridProps> = ({
  items,
  loading,
  onSelectItem,
  emptyMessage = "Use la barra de búsqueda para encontrar su producto.",
  loadingMessage = "Buscando productos...",
  codiso,
  images,
}) => {
  return (
    <div
      className={cn(
        "p-3 h-full overflow-auto border-r border-solid border-[#cbd5e1] bg-[#f8fafc]",
        isEmpty(items) && "flex flex-row justify-center items-center gap-4"
      )}
    >
      {/* Estado: Cargando */}
      {loading && (
        <div className="text-center relative">
          <SpinnerTransparent loading={true} message={loadingMessage} />
        </div>
      )}

      {/* Estado: Vacío */}
      {!loading && isEmpty(items) && (
        <div className="text-center relative">
          <i className="bi bi-cart4 text-secondary text-2xl"></i>
          <p className="text-secondary text-lg mb-0">{emptyMessage}</p>
        </div>
      )}

      {/* Estado: Con datos */}
      {!isEmpty(items) && (
        <div className="flex justify-center flex-wrap gap-4">
          {items.map((item: any, index: number) => (
            <Button
              key={index}
              className="bg-white border border-solid border-[#e2e8f0] w-60 flex flex-col !p-0"
              onClick={() => onSelectItem(item)}
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
                <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-3 min-h-16">
                  {item.nombre}
                </h3>

                {/* Stock o servicio */}
                <div className="mt-auto space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      {item.idTipoProducto === PRODUCTO
                        ? "Stock"
                        : "Servicio"}
                    </span>
                    <span
                      className={cn(
                        "text-base font-bold",
                        item.idTipoProducto === PRODUCTO && item.cantidad <= 0
                          ? "text-red-600"
                          : "text-green-500"
                      )}
                    >
                      {formatDecimal(item.cantidad)}
                    </span>
                  </div>
                </div>

                {/* Precio */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                  <span className="text-sm font-medium text-gray-600">
                    Costo:
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(item.costo, codiso)}{" "}
                    <small className="text-xs">x {item.unidad}</small>
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
  );
};

export default ListGrid;
