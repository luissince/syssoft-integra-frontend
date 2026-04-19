export interface KardexListDepreciacionInterface {
  cantidad: number;
  costo: number;
  depreciacionAcumuladaHoy: number;
  detalle: string;
  fecha: string;
  hora: string;
  almacen: string;
  id: number;
  idNavegacion: string;
  idProducto: string;
  opcion: string;
  producto: string;
  idInventarioActivo: string;
  serie: string;
  tipo: string;
  ubicacion: string;
  valorResidual: number;
  vidaUtil: number;
  idPersona: string;
  informacion: string;
}

export interface KardexResponseListDepreciacionInterface {
    result: KardexListDepreciacionInterface[];
    total: number;
}