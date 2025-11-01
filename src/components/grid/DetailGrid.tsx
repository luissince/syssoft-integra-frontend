import React from "react";
import { cn } from "@/lib/utils";
import { formatCurrency, isEmpty, rounded } from "@/helper/utils.helper";
import Image from "../Image";
import Button from "../Button";

interface DetalleItem {
  idProducto: number | string;
  codigo: string;
  nombre: string;
  imagen: string;
  cantidad: number;
  costo: number;
  lote?: boolean;
  lotes?: { cantidad: { value: number } }[];
}

interface DetalleGridProps {
  detalles: DetalleItem[];
  codiso?: string;
  images: { noImage: string };
  onEdit?: (item: DetalleItem) => void;
  onRemove?: (idProducto: number | string) => void;
  emptyMessage?: string;
}

const DetalleGrid: React.FC<DetalleGridProps> = ({
  detalles,
  codiso = "PEN",
  images,
  onEdit,
  onRemove,
  emptyMessage = "Aquí verás los productos que elijas en tu próximo pedido",
}) => {
  return (
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
        const cantidad = !item.lote
          ? item.cantidad
          : item.lotes?.reduce(
            (acc, l) => acc + Number(l.cantidad.value),
            0
          ) ?? 0;

        const total = cantidad * item.costo;

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
                className="object-contain"
              />
              <div className="p-3 text-left">
                <p className="text-sm text-gray-500">{item.codigo}</p>
                <p className="text-base font-semibold break-words">
                  {item.nombre}
                </p>
                <p>
                  {formatCurrency(item.costo, codiso)}
                </p>
              </div>
            </div>

            {/* Columna 2: cantidad */}
            <div className="flex flex-col justify-end items-center">
              <div className="h-full text-base">{rounded(cantidad)}</div>
            </div>

            {/* Columna 3: total y acciones */}
            <div className="flex flex-col justify-end items-center gap-2">
              <div className="text-lg font-semibold text-gray-800">
                {formatCurrency(total, codiso)}
              </div>
              <div className="flex items-end justify-end gap-4">
                <Button
                  className="btn-link"
                  onClick={() => onEdit(item)}
                  title="Editar producto"
                >
                  <i className="fa fa-edit text-warning text-xl"></i>
                </Button>
                <Button
                  className="btn-link"
                  onClick={() => onRemove(item.idProducto)}
                  title="Eliminar producto"
                >
                  <i className="fa fa-trash text-danger text-xl"></i>
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DetalleGrid;
