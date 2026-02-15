export interface StatCardInterface {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: number;
  subtitle?: string;
}

export default interface DashboardInterface {
  metaDiaria: {
    cumplioMeta: boolean;
    diasMes: number;
    gastoFijo: number;
    metaPorDia: number;
    resumenDelDia: number;
  };
  capital: {
    gananciaBruta: number;
    invertidoEnCompras: number;
    porRecuperar: number;
    recuperadoEnVentas: number;
  };
  cajaDeFlujo: Array<{
    idBanco: string;
    nombre: string;
    saldo: number;
  }>;
  totalVentas: number;
  totalCompras: number;
  ventasPorRecibir: number;
  comprasPorPagar: number;
  documentosEmitidos: number;
  documentosPorDeclarar: number;
  cotizacionesCreadas: number;
  cotizacionesEnlaceVentas: number;
  rendimientoSucursal: Array<{
    id: number;
    sucursal: string;
    total: number;
    rendimiento: number;
  }>;
  balanceBancario: Array<{
    idBanco: string;
    nombre: string;
    sucursal: string;
    saldo: number;
  }>;
  ventasAnuales: Array<{
    mes: number;
    nombreMes: string;
    totalActual: number;
    totalAnterior: number;
    actual: number;
    anterior: number;
  }>;
}