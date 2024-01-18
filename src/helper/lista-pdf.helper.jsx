export function pdfA4Venta(idVenta) {
    return `${import.meta.env.VITE_APP_PDF}/api/v1/venta/a4/${idVenta}`;
}

export function pdfTicketVenta(idVenta) {
    return `${import.meta.env.VITE_APP_PDF}/api/v1/venta/ticket/${idVenta}`;
}