

export function pdfA4Compra(idCompra) {
    return `${import.meta.env.VITE_APP_PDF}/api/v1/compra/a4/${idCompra}`;
}

export function pdfTicketCompra(idCompra) {
    return `${import.meta.env.VITE_APP_PDF}/api/v1/compra/ticket/${idCompra}`;
}

export function pdfA4GuiaRemision(idGuiaRemision) {
    return `${import.meta.env.VITE_APP_PDF}/api/v1/guiaremision/a4/${idGuiaRemision}`;
}

export function pdfTicketGuiaRemision(idGuiaRemision) {
    return `${import.meta.env.VITE_APP_PDF}/api/v1/guiaremision/ticket/${idGuiaRemision}`;
}