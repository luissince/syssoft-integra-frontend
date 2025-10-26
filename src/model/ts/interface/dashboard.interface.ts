export interface StatCardInterface {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: number;
  subtitle?: string;
}

export default interface DashboardInterface {
  totalSales: number;
  totalPurchases: number;
  creditSalesToCollect: number;
  creditPurchasesToPay: number;
  issuedDocuments: number;
  documentsToDeclare: number;
  createdQuotes: number;
  quotesLinkedToSales: number;
  branchPerformance: {
    id: number;
    sucursal: string;
    total: number;
    rendimiento: number;
  }[];
  bankBalances: {
    idBanco: string;
    nombre: string;
    sucursal: string;
    saldo: number;
  }[];
  salesForYear: {
    mes: number,
    nombreMes: string,
    totalActual: number
    totalAnterior: number
    actual: number
    anterior: number
  }[]
}