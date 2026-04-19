export interface GestionListInterface {
    result: GestionInterface[];
    total: number;
}

export interface GestionInterface {
    idAsignacionActivo: string;
    idDocumentoActivo: string;
    idPersona: string;
    documentoPdf: string;
    documento: string;
    numeroDocumento: number;
    responsable: string;
    tipo: string;
    fecha: string;
    hora: string;
    idUsuario: string;
    gestionDetalles: GestionDetallesInterface[];
    id:number;
}

export interface GestionDetallesInterface {
    producto: string;
    imagen: string;
    codigo: string;
    sku: string;
    cantidad: number;
    categoria: string;
    serie: string;
    ubicacion: string;
}