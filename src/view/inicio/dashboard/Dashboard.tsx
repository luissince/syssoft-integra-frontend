import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  CreditCard,
  FileText,
  ClipboardCheck,
  Users,
  Calendar,
} from "lucide-react";
import ContainerWrapper from "@/components/ui/container-wrapper";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { comboSucursal, dashboardInit } from "@/network/rest/principal.network";
import ErrorResponse from "@/model/class/error-response";
import { CANCELED } from "@/model/types/types";
import { alertKit } from "alert-kit";
import { currentDate, isEmpty, numberFormat, rounded } from "@/helper/utils.helper";
import { connect } from "react-redux";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Branch {
  idSucursal: string;
  nombre: string;
}

interface DashboardData {
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
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: number;
  subtitle?: string;
}

interface Props {
  token: {
    project: {
      idSucursal: string;
    };
  };
  moneda: {
    codiso: string;
  };
}

const currentYear = new Date().getFullYear();
const previousYear = currentYear - 1;

const data = [
  { mes: 'Ene', [currentYear]: 1200, [previousYear]: 1000 },
  { mes: 'Feb', [currentYear]: 900, [previousYear]: 1100 },
  { mes: 'Mar', [currentYear]: 1300, [previousYear]: 950 },
  { mes: 'Abr', [currentYear]: 1500, [previousYear]: 1200 },
  { mes: 'May', [currentYear]: 1100, [previousYear]: 1150 },
  { mes: 'Jun', [currentYear]: 1600, [previousYear]: 1300 },
  { mes: 'Jul', [currentYear]: 1800, [previousYear]: 1700 },
  { mes: 'Ago', [currentYear]: 2000, [previousYear]: 1900 },
  { mes: 'Sep', [currentYear]: 0, [previousYear]: 1800 },
  { mes: 'Oct', [currentYear]: 0, [previousYear]: 1700 },
  { mes: 'Nov', [currentYear]: 0, [previousYear]: 1600 },
  { mes: 'Dic', [currentYear]: 0, [previousYear]: 1500 },
];


const Dashboard = ({ token, moneda }: Props) => {
  const [dateRange, setDateRange] = useState({
    start: currentDate(),
    end: currentDate(),
  });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>(token.project.idSucursal || '');
  const [dashboardData, setDashboardData] = useState<DashboardData>(null);
  const [loading, setLoading] = useState(true);

  const abortControllerView = new AbortController();

  // Mock data simulating the database procedure results
  const fetchDashboardData = async () => {
    setLoading(true);
    const branchResponse = await comboSucursal(
      abortControllerView.signal,
    );

    if (branchResponse instanceof ErrorResponse) {
      if (branchResponse.getType() === CANCELED) return;

      alertKit.warning({
        title: 'Dashboard',
        message: branchResponse.getMessage(),
      });
      return;
    }
    setBranches(branchResponse.data as Branch[]);

    const params = {
      fechaInicio: dateRange.start,
      fechaFinal: dateRange.end,
      idSucursal: selectedBranch,
    };

    const dashboardResponde = await dashboardInit(
      params,
      abortControllerView.signal,
    );

    if (dashboardResponde instanceof ErrorResponse) {
      if (dashboardResponde.getType() === CANCELED) return;

      alertKit.warning({
        title: 'Dashboard',
        message: dashboardResponde.getMessage(),
      });
      return;
    }

    console.log(dashboardResponde.data);
    setDashboardData(dashboardResponde.data as DashboardData);
    setLoading(false);
    // Simulate API call delay
    // setTimeout(() => {
    //   const mockData: DashboardData = {
    //     totalSales: Math.floor(Math.random() * 150000) + 50000,
    //     totalPurchases: Math.floor(Math.random() * 80000) + 20000,
    //     creditSalesToCollect: Math.floor(Math.random() * 30000) + 5000,
    //     creditPurchasesToPay: Math.floor(Math.random() * 25000) + 3000,
    //     issuedDocuments: Math.floor(Math.random() * 120) + 40,
    //     documentsToDeclare: Math.floor(Math.random() * 15) + 2,
    //     createdQuotes: Math.floor(Math.random() * 80) + 20,
    //     quotesLinkedToSales: Math.floor(Math.random() * 40) + 10,
    //     branchPerformance: [
    //       { id: 1, sucursal: 'Sucursal Central', total: 85000, rendimiento: 42.5 },
    //       { id: 2, sucursal: 'Sucursal Norte', total: 62000, rendimiento: 31.0 },
    //       { id: 3, sucursal: 'Sucursal Sur', total: 53000, rendimiento: 26.5 }
    //     ],
    //     bankBalances: [
    //       { idBanco: 'B001', nombre: 'Banco BCP', sucursal: 'Sucursal Central', saldo: 45200 },
    //       { idBanco: 'B002', nombre: 'Banco Interbank', sucursal: 'Sucursal Central', saldo: 32800 },
    //       { idBanco: 'B003', nombre: 'Banco Scotiabank', sucursal: 'Sucursal Central', saldo: 28500 }
    //     ]
    //   };
    //   setDashboardData(mockData);
    //   setLoading(false);
    // }, 1000);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, selectedBranch]);

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend, subtitle }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
          <span className="text-sm text-gray-500 ml-2">vs mes anterior</span>
        </div>
      )}
    </div>
  );

  const BranchPerformanceChart = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Rendimiento por Sucursal</h3>
      <div className="space-y-4">
        {!isEmpty(dashboardData.branchPerformance) ? (
          (dashboardData as DashboardData).branchPerformance.map((branch) => (
            <div key={branch.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{branch.sucursal}</span>
                <span className="text-gray-600">{branch.total.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${branch.rendimiento}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{branch.rendimiento.toFixed(1)}% del total</span>
              </div>
            </div>
          ))
        ) : (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        )}
      </div>
    </div>
  );

  const BankBalanceCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Saldos Bancarios</h3>
      <div className="space-y-4">
        {!isEmpty(dashboardData.bankBalances) ? (
          (dashboardData as DashboardData).bankBalances.map((bank) => (
            <div key={bank.idBanco} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{bank.nombre}</p>
                <p className="text-sm text-gray-600">{bank.sucursal}</p>
              </div>
              <p className="font-semibold text-green-600">
                {bank.saldo.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
              </p>
            </div>
          ))
        ) : (
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded mt-2"></div>
            <div className="h-12 bg-gray-200 rounded mt-2"></div>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <ContainerWrapper>
        <DashboardSkeleton />
      </ContainerWrapper>
    );
  }

  return (
    <ContainerWrapper>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Comercial</h1>
          <p className="text-gray-600 mt-1">Resumen de operaciones y rendimiento</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent border-none text-gray-700 focus:outline-none"
            >
              {
                branches.map((branch, index) => (
                  <option key={index} value={branch.idSucursal}>
                    {branch.nombre}
                  </option>
                ))
              }
            </select>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="mb-8 bg-white">
        <div className="flex items-center space-x-4">
          <div>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Ventas Totales"
          value={numberFormat(dashboardData.totalSales, moneda.codiso)}
          icon={DollarSign}
          color="green"
          trend={12.5}
        />
        <StatCard
          title="Compras Totales"
          value={numberFormat(dashboardData.totalPurchases, moneda.codiso)}
          icon={ShoppingCart}
          color="blue"
          trend={8.2}
        />
        <StatCard
          title="Por Cobrar (Crédito)"
          value={numberFormat(dashboardData.creditSalesToCollect, moneda.codiso)}
          icon={CreditCard}
          color="yellow"
          subtitle={`${Math.floor(Math.random() * 15) + 5} clientes`}
        />
        <StatCard
          title="Por Pagar (Crédito)"
          value={numberFormat(dashboardData.creditPurchasesToPay, moneda.codiso)}
          icon={CreditCard}
          color="red"
          subtitle={`${Math.floor(Math.random() * 8) + 3} proveedores`}
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Comprobantes Emitidos"
          value={rounded(dashboardData.issuedDocuments, 0)}
          icon={FileText}
          color="purple"
        />
        <StatCard
          title="Por Declarar"
          value={rounded(dashboardData.documentsToDeclare, 0)}
          icon={ClipboardCheck}
          color="orange"
          subtitle="Revisar estado"
        />
        <StatCard
          title="Cotizaciones Creadas"
          value={rounded(dashboardData.createdQuotes, 0)}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Cotizaciones Convertidas"
          value={rounded(dashboardData.quotesLinkedToSales, 0)}
          icon={TrendingUp}
          color="green"
          trend={24.3}
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BranchPerformanceChart />
        <BankBalanceCard />
      </div>

          <div className="w-full max-w-6xl mx-auto p-4 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Comparación de Ventas Mensuales: {previousYear} vs {currentYear}
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip />
          <Legend
            formatter={(value) => `Año ${value}`}
          />
          <Bar
            dataKey={previousYear}
            name={`Año ${previousYear}`}
            fill="#94a3b8" // gris
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey={currentYear}
            name={`Año ${currentYear}`}
            fill="#3b82f6" // azul
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
    </ContainerWrapper>
  );
};

const mapStateToProps = (state: {
  principal: any;
  predeterminado: any;
}) => {
  return {
    token: state.principal,
    moneda: state.predeterminado.moneda,
  };
};

const ConnectedDashboard = connect(mapStateToProps, null)(Dashboard);

export default ConnectedDashboard;