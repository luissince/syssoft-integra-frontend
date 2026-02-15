import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { INCREMENTO } from '@/model/types/forma-ajuste';
import { formatDate, getNumber, isEmpty, keyNumberFloat, rounded } from '@/helper/utils.helper';
import Input from '@/components/Input';
import Image from '@/components/Image';
import { images } from '@/helper';
import Button from '@/components/Button';
import { cn } from '@/lib/utils';

interface InventarioDetalle {
    idKardex: string;
    lote: string;
    fechaVencimiento: string;
    ubicacion: string;
    cantidad: number;
    cantidadAjustar: string;
}

interface Props {
    refTableBody: React.RefObject<HTMLTableSectionElement>;
    idTipoAjuste: string;
    detalles: Array<{
        idProducto: string;
        codigo: string;
        nombre: string;
        imagen: string;
        unidad: string;
        inventarioDetalles: InventarioDetalle[];
    }>,
    handleRemoveDetalle: (idProducto: string) => void;
    handleInputDetalle: (event: any, idProducto: string) => void;
    handleFocusInputTable: (event: any, isLastRow: boolean) => void;
}

const GenerarTabla: React.FC<Props> = ({
    refTableBody,
    idTipoAjuste,
    detalles,
    handleRemoveDetalle,
    handleInputDetalle,
    handleFocusInputTable
}) => {
    const isMobile = useIsMobile();

    const renderBody = () => {
        if (isEmpty(detalles)) {
            return (
                <tr>
                    <td className="text-center p-3" colSpan={7}>
                        ¡No hay datos para mostrar!
                    </td>
                </tr>
            );
        }

        return detalles.map((item) => {
            return (
                <React.Fragment key={`producto-${item.idProducto}`}>
                    {/* FILA PRINCIPAL (igual que antes) */}
                    <tr>
                        <td className="text-center py-3">
                            <Button
                                className="btn-outline-danger btn-sm"
                                title="Anular"
                                onClick={() => handleRemoveDetalle(item.idProducto)}
                            >
                                <i className="bi bi-trash"></i>
                            </Button>
                        </td>
                        <td className="text-center py-3">
                            <div className="flex justify-center">
                                <Image
                                    default={images.noImage}
                                    src={item.imagen}
                                    alt={item.nombre}
                                    overrideClass="w-24 h-24 object-contain"
                                />
                            </div>
                        </td>
                        <td className="py-3" colSpan={3}>
                            <span className="font-mono text-sm text-gray-500"> {item.codigo}</span>
                            <br />
                            <span className="font-medium">{item.nombre}</span>
                        </td>
                    </tr>

                    {/* CARDS POR ALMACÉN (en lugar de subtabla) */}
                    {
                        item.inventarioDetalles.map((invd, indexinvd) => {
                            const isLastRow = indexinvd === item.inventarioDetalles.length - 1;

                            const stockOriginal = getNumber(invd.cantidad);
                            const ajustar = getNumber(invd.cantidadAjustar);

                            const stockRestante = ajustar > 0 ? stockOriginal - ajustar : stockOriginal;

                            let diferencia = 0;

                            if (idTipoAjuste === INCREMENTO) {
                                diferencia = stockOriginal + ajustar
                            } else {
                                diferencia = stockOriginal - ajustar;
                            }

                            return (
                                <tr key={`detalle-${invd.idKardex}`}>
                                    <td colSpan={2} className="py-3"></td>
                                    <td className="py-3">
                                        {
                                            <div className="text-sm space-y-1">
                                                {invd.lote && (
                                                    <div className="font-mono text-gray-500">
                                                        <strong>Lote:</strong> {invd.lote}
                                                    </div>
                                                )}

                                                {invd.fechaVencimiento && (
                                                    <div className="font-mono text-gray-500">
                                                        <strong>Vence:</strong> {formatDate(invd.fechaVencimiento)}
                                                    </div>
                                                )}

                                                {invd.ubicacion && (
                                                    <div className="font-mono text-gray-500">
                                                        <strong>Ubicación:</strong> {invd.ubicacion}
                                                    </div>
                                                )}
                                            </div>
                                        }
                                    </td>
                                    <td className="text-center py-3">
                                        <Input
                                            type={isMobile ? 'number' : 'text'}
                                            value={invd.cantidadAjustar}
                                            placeholder="0"
                                            onChange={(event) =>
                                                handleInputDetalle(event, invd.idKardex)
                                            }
                                            onKeyDown={keyNumberFloat}
                                            onKeyUp={(event) =>
                                                handleFocusInputTable(event, isLastRow)
                                            }
                                        />
                                    </td>
                                    <td className={cn(
                                        "text-center py-3",
                                        stockRestante <= 0 && "text-error",
                                    )}>
                                        {rounded(stockRestante)}
                                    </td>
                                    <td
                                        className={cn(
                                            "text-center py-3",
                                            diferencia <= 0 && "text-error",
                                        )}>
                                        {rounded(diferencia)}
                                    </td>
                                </tr>
                            );
                        })
                    }
                </React.Fragment>
            );
        })
    };

    return (
        <div className="mb-3">
            <div className="overflow-x-auto">
                <p className="mb-2">Lista de productos:</p>
                <div className="bg-white rounded border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">Quitar</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">Imagen</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">Clave/Nombre</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Nueva Existencia</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Existencia Actual</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Diferencia</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200" ref={refTableBody}>
                            {renderBody()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GenerarTabla;
