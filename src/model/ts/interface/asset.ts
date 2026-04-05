
export interface AssetMetricsInterface {
    totalCost: number;
    totalDepreciation: number;
    totalAssets: number;
    totalBookValue: number;
}

export interface AssetDetailInterface {
    cantidad: number;
    costo: number;
    idAlmacen: string;
    idKardex: string;
    serie: string;
    ubicacion: string;
    valorResidual: number;
    vidaUtil: number;
}

export interface AssetListInterface {
    almacen: string;
    cantidad: number;
    cantidadMaxima: number;
    cantidadMinima: number;
    categoria: string;
    codigo: string;
    costo: number;
    descripcion: string;
    estadoStock: string;
    id: number;
    idInventario: number;
    idMetodoDepreciacion: string;
    idProducto: string;
    imagen: string | null;
    inventarioDetalles: AssetDetailInterface[];
    medida: string;
    producto: string;
}

export interface AssetResponseInterface {
    result: AssetListInterface[];
    total: number;
}
