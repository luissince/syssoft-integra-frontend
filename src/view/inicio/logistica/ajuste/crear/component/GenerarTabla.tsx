import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import { INCREMENTO } from '@/model/types/forma-ajuste';
import { getNumber, isEmpty, keyNumberFloat, rounded } from '@/helper/utils.helper';
import Input from '@/components/Input';
import Image from '@/components/Image';
import { images } from '@/helper';
import Button from '@/components/Button';
import Row from '@/components/Row';
import Column from '@/components/Column';
import { Table, TableBody, TableHead, TableHeader, TableResponsive, TableTitle } from '@/components/Table';

interface Lote {
    codigoLote: string;
    cantidad: number;
    cantidadAjustar: number;
    fechaVencimiento: string;
    diasRestantes: number;
}

interface Props {
    refTableBody: React.RefObject<HTMLTableSectionElement>;
    idTipoAjuste: string;
    detalles: Array<{
        idProducto: string;
        codigo: string;
        nombre: string;
        imagen: string;
        actual: number;
        cantidad: number;
        unidad: string;
        lotes?: Lote[];
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

    if (isEmpty(detalles)) {
        return (
            <TableRow>
                <TableCell className="text-center" colSpan={7}>
                    ¡No hay datos para mostrar!
                </TableCell>
            </TableRow>
        );
    }

    const detailRows = detalles.map((item, index) => {
        const isLastRow = index === detalles.length - 1;

        const cantidad = item.lotes
            ? item.lotes.reduce(
                (acum, lote) => acum + getNumber(lote.cantidadAjustar),
                0,
            )
            : item.cantidad;

        let diferencia = 0;

        if (idTipoAjuste === INCREMENTO) {
            diferencia = item.actual + cantidad;
        } else {
            diferencia = item.actual - cantidad;
        }

        return (
            <TableRow key={index}>
                <TableCell>
                    <Button
                        className="btn-outline-danger btn-sm"
                        title="Anular"
                        onClick={() => handleRemoveDetalle(item.idProducto)}
                    >
                        <i className="bi bi-trash"></i>
                    </Button>
                </TableCell>
                <TableCell className="text-center">
                    <Image
                        default={images.noImage}
                        src={item.imagen}
                        alt={item.nombre}
                        width={100}
                    />
                </TableCell>
                <TableCell>
                    {item.codigo}
                    <br />
                    {item.nombre}
                </TableCell>
                <TableCell>
                    {item.lotes && (
                        <small className="text-info">
                            <i className="bi bi-box-seam"></i> {item.lotes.length} lote(s)
                        </small>
                    )}

                    {!item.lotes && (
                        <Input
                            value={cantidad}
                            type={isMobile ? 'number' : 'text'}
                            placeholder="0"
                            onChange={(event) =>
                                handleInputDetalle(event, item.idProducto)
                            }
                            onKeyDown={keyNumberFloat}
                            onKeyUp={(event) =>
                                handleFocusInputTable(event, isLastRow)
                            }
                        />
                    )}
                </TableCell>
                <TableCell>
                    {item.lotes && rounded(cantidad)}
                    {!item.lotes && rounded(cantidad)}
                </TableCell>
                <TableCell className={`${diferencia <= 0 ? 'text-danger' : ''}`}>
                    {rounded(diferencia)}
                </TableCell>
                <TableCell>{item.unidad}</TableCell>
            </TableRow>
        );
    });

    return (
        <Row>
            <Column>
                <TableResponsive>
                    <TableTitle>Lista de productos:</TableTitle>
                    <Table className="table-striped table-bordered rounded">
                        <TableHeader>
                            <TableRow>
                                <TableHead width="5%" className="text-center">Quitar</TableHead>
                                <TableHead width="15%" className="text-center">Imagen</TableHead>
                                <TableHead width="30%">Clave/Nombre</TableHead>
                                <TableHead width="15%">Nueva Existencia</TableHead>
                                <TableHead width="15%">Existencia Actual</TableHead>
                                <TableHead width="15%">Diferencia</TableHead>
                                <TableHead width="15%">Medida</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody ref={refTableBody}>{detailRows}</TableBody>
                    </Table>
                </TableResponsive>
            </Column>
        </Row>
    );
};

export default GenerarTabla;
