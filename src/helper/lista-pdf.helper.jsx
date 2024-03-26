export function pdfA4Venta(idVenta) {
    return `${import.meta.env.VITE_APP_PDF}/api/v1/venta/a4/${idVenta}`;
}

export function pdfTicketVenta(idVenta) {
    return `${import.meta.env.VITE_APP_PDF}/api/v1/venta/ticket/${idVenta}`;
}

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

export function pdfFinanzas(fechaInicio, fechaFinal, idSucursal, idUsuario) {
    // return `${import.meta.env.VITE_APP_PDF}/api/v1/finanzas/?fecha_inicio=${fechaInicio}&fecha_final=${fechaFinal}&id_sucursal=${idSucursal}&id_usuario=${idUsuario}`;
    return `${import.meta.env.VITE_APP_BACK_END}/api/reporte/financiero/pdf/`;
}
