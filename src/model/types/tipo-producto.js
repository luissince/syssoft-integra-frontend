export const PRODUCTO = 'TP0001';
export const SERVICIO = 'TP0002';
export const COMBO = 'TP0003';
export const ACTIVO_FIJO = 'TP0004';
export const MENOR_CUANTIA = 'TP0005';
export const EXISTENCIAL = 'TP0006';

const tipoProducto = [
    { value: PRODUCTO, label: 'Producto' },
    { value: SERVICIO, label: 'Servicio' },
    { value: COMBO, label: 'Combo' },
    { value: ACTIVO_FIJO, label: 'Activo Fijo' },
    { value: MENOR_CUANTIA, label: 'Menor Cuantía' },
    { value: EXISTENCIAL, label: 'Existencial' },
];

export const tipoProductoMap = new Map(
    tipoProducto.map(item => [item.value, item])
);
