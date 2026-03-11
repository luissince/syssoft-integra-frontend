export const LINEA_RECTA = 'MD0001';
export const DIGITOS_DECRECIENTES = 'MD0002';
export const SUMA_DE_DIGITOS = 'MD0003';


const metodoDepreciacion = [
    { value: LINEA_RECTA, label: 'Linea recta', title: 'Cuota fija anual igual durante toda la vida útil', detail: 'Línea Recta (SL) — Depreciación = (Costo - Valor Residual) / Vida Útil' },
    { value: DIGITOS_DECRECIENTES, label: 'Digitos decrecientes', title: 'Mayor depreciación en primeros años', detail: 'Doble Saldo Decreciente (DA) — Depreciación = Valor en Libros × (2 / Vida Útil)' },
    { value: SUMA_DE_DIGITOS, label: 'Suma de digitos', title: 'Depreciación acelerada basada en fracción de años', detail: 'Suma de Dígitos de Años (SY) — Fracción decreciente sobre base depreciable' },
];

export const metodoDepreciacionMap = new Map(
    metodoDepreciacion.map(item => [item.value, item])
);