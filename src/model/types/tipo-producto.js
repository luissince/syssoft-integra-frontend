export const PRODUCTO = 'TP0001';
export const SERVICIO = 'TP0002';
export const COMBO = 'TP0003';
export const ACTIVO_FIJO = 'TP0004';

const tipoProducto = [
    { value: PRODUCTO, label: 'Producto' },
    { value: SERVICIO, label: 'Servicio' },
    { value: COMBO, label: 'Combo' },
    { value: ACTIVO_FIJO, label: 'Activo Fijo' },
];

export const tipoProductoMap = new Map(
    tipoProducto.map(item => [item.value, item])
);
