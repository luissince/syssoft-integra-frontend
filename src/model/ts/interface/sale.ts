export interface SaleFilterAllInterface {
    codiso: string;
    departamento: string;
    direccion: string;
    distrito: string;
    documento: string;
    idUbigeo: number;
    idVenta: string;
    informacion: string;
    nombreComprobante: string;
    numeracion: number;
    provincia: string;
    serie: string;
    ubigeo: string;
}

export interface SaleDetailsInterface {
    cantidad: number;
    categoria: string;
    codigo: string;
    idImpuesto: string;
    idProducto: string;
    impuesto: string;
    medida: string;
    porcentaje: number;
    precio: number;
    producto: string;
}

export interface SaleCabeceraInterface {
    idVenta: string;
    fecha: string;
    hora: string;

    comprobante: string;
    serie: string;
    numeracion: string;

    tipoDoc: string;
    codigoCliente: string;
    documento: string;
    informacion: string;

    idFormaPago: string;

    estado: string;

    observacion: string | null;
    nota: string | null;

    codiso: string;

    usuario: string;
}

export interface SaleDetalleInterface {
    id: number;
    codigo: string;
    producto: string;
    imagen?: string | null;
    medida: string;
    categoria: string;
    precio: number;
    cantidad: number;
    idImpuesto: string;
    impuesto: string;
    porcentaje: number;
}

export interface SaleTransaccionDetalleInterface {
    nombre: string; // banco
    monto: number;
    observacion: string | null;
}

export interface SaleTransaccionInterface {
    idTransaccion: string;
    fecha: string;
    hora: string;
    concepto: string;
    nota: string | null;
    usuario: string;
    detalles: SaleTransaccionDetalleInterface[];
}

export interface SaleGetIdInterface {
    cabecera: SaleCabeceraInterface;
    detalles: SaleDetalleInterface[];
    transaccion: SaleTransaccionInterface[];
}