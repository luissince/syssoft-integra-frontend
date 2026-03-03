export interface CreditNoteListInterface {
    idUsuario: string;
    id: number;
    estado: number;
    informacion: string;
    celular: string;
    email: string;
    perfil: string;
}

export interface CreditNoteResponseInterface {
    result: CreditNoteListInterface[];
    total: number;
}

export interface CreditNoteCabeceraInterface {
  idNotaCredito: string;
  fecha: string;
  hora: string;

  tipoDocumento: string;
  documento: string;
  informacion: string;

  comprobante: string;
  serie: string;
  numeracion: string;

  motivo: string;

  comprobanteVenta: string;
  serieVenta: string;
  numeracionVenta: string;

  estado: number;
  codiso: string;
  observacion: string | null;

  total: number;
}

export interface CreditNoteDetalleInterface {
  id: number;
  codigo: string;
  producto: string;
  imagen: string | null;
  medida: string;
  categoria: string;
  precio: number;
  cantidad: number;
  idImpuesto: string;
  impuesto: string;
  porcentaje: number;
}

export interface CreditNoteGetInterface {
  cabecera: CreditNoteCabeceraInterface;
  detalles: CreditNoteDetalleInterface[];
}


