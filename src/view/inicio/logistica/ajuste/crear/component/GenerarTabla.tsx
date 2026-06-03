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
                <TableRow>
                    <TableCell className="text-center" colSpan={7}>
                        ¡No hay datos para mostrar!
                    </TableCell>
                </TableRow>
            );
        }

        return detalles.map((item, index) => {
            const isLastRow = index === detalles.length - 1;

            const cantidad = item.cantidad;

            let diferencia = 0;

            if (idTipoAjuste === INCREMENTO) {
                diferencia = Number(item.actual) + Number(cantidad);
            } else {
                diferencia = Number(item.actual) - Number(cantidad);
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
                        <div className="flex justify-center">
                            <Image
                                default={images.noImage}
                                src={item.imagen}
                                alt={item.nombre}
                                width={100}
                            />
                        </div>
                    </TableCell>
                    <TableCell>
                        {item.codigo}
                        <br />
                        {item.nombre}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                        {rounded(cantidad)}
                    </TableCell>
                    <TableCell className={`${diferencia <= 0 ? 'text-danger' : ''}`}>
                        {rounded(diferencia)} <small>{item.unidad}</small>
                    </TableCell>
                </TableRow>
            );
        });
    }

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
                                <TableHead width="25%">Clave/Nombre</TableHead>
                                <TableHead width="15%">Nueva Existencia</TableHead>
                                <TableHead width="15%">Existencia Actual</TableHead>
                                <TableHead width="15%">Diferencia</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody ref={refTableBody}>
                            {renderBody()}
                        </TableBody>
                    </Table>
                </TableResponsive>
            </Column>
        </Row>
    );
};

export default GenerarTabla;
