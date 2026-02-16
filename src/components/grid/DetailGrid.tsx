import React from "react";
import { cn } from "@/lib/utils";
import { formatCurrency, isEmpty, rounded } from "@/helper/utils.helper";
import Image from "@/components/Image";
import Button from "@/components/Button";

type Operation = "addition" | "subtraction";

interface DetalleItem {
  idProducto: number | string;
  codigo: string;
  nombre: string;
  imagen: string;
  cantidad: number;
  costo: number;
  precio: number;
  inventarioDetalles?: { cantidad: { value: number } }[];
}

interface DetalleGridProps {
  operation: Operation;
  detalles: DetalleItem[];
  codiso?: string;
  images: { noImage: string };
  onEdit?: (item: DetalleItem) => void;
  onRemove?: (idProducto: number | string) => void;
  emptyMessage?: string;
}

const DetalleGrid: React.FC<DetalleGridProps> = ({
  operation,
  detalles,
  codiso = "PEN",
  images,
  onEdit,
  onRemove,
  emptyMessage = "Aquí verás los productos que elijas en tu próximo pedido",
}) => {
  console.log(detalles);
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

      {
        detalles.map((item, index) => {
          let cantidad = item.inventarioDetalles ? item.inventarioDetalles.reduce((acumulador, item) => acumulador + Number(item.cantidad.value), 0) : item.cantidad;

          let total = 0;

          if (operation === "addition") {
            total = cantidad * item.precio;
          } else {
            total = cantidad * item.costo;
          }

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
                <div className="max-w-20 aspect-square relative flex items-center justify-center overflow-hidden border border-gray-200">
                  <Image
                    default={images.noImage}
                    src={item.imagen}
                    alt={item.nombre}
                    overrideClass="max-w-full max-h-full w-auto h-auto object-contain block"
                  />
                </div>

                <div className="p-3 text-left">
                  <p className="text-sm text-gray-500">{item.codigo}</p>
                  <p className="text-base font-semibold break-words">
                    {item.nombre}
                  </p>
                  <p>
                    {
                      operation === "addition"
                        ? formatCurrency(item.precio, codiso)
                        : formatCurrency(item.costo, codiso)
                    }
                  </p>
                </div>
              </div>

              {/* Columna 2: cantidad */}
              <div className="flex flex-col justify-end items-center">
                <div className="h-full text-base">
                  {rounded(cantidad)}
                </div>
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
                    <i className="fa fa-edit text-warning !text-xl"></i>
                  </Button>
                  <Button
                    className="btn-link"
                    onClick={() => onRemove(item.idProducto)}
                    title="Eliminar producto"
                  >
                    <i className="fa fa-trash text-danger !text-xl"></i>
                  </Button>
                </div>
              </div>
            </div>
          );
        })
      }
    </div>
  );
};

export default DetalleGrid;
