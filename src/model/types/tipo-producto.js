import { Box, Wrench } from 'lucide-react';

export const TIPO_PRODUCTO_NORMAL = 'TP0001';
export const TIPO_PRODUCTO_SERVICIO = 'TP0002';
export const TIPO_PRODUCTO_LOTE = 'TP0003';
export const TIPO_PRODUCTO_ACTIVO_FIJO = 'TP0004';

export const productTypeOptions = [
    {
        value: TIPO_PRODUCTO_NORMAL,
        label: 'NORMAL',
        icon: Box,
        color: '#6c757d'
    },
    {
        value: TIPO_PRODUCTO_SERVICIO,
        label: 'SERVICIO',
        icon: Wrench,
        color: '#0d6efd'
    },
    // {
    //     value: TIPO_PRODUCTO_LOTE,
    //     label: 'Lote',
    //     icon: Layers,
    //     color: '#fd7e14'
    // },
    // {
    //     value: TIPO_PRODUCTO_ACTIVO_FIJO,
    //     label: 'Activo Fijo',
    //     icon: Building2,
    //     color: '#198754'
    // },
];

export const productTypeMap = new Map(
    productTypeOptions.map(item => [item.value, item])
);
