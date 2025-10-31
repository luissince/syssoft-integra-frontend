import React, { useState, useEffect } from "react";
import {
    TrendingUp,
    ShoppingCart,
    DollarSign,
    CreditCard,
    FileText,
    ClipboardCheck,
    Users,
    CalendarIcon,
    Building2,
} from "lucide-react";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { comboSucursal, dashboardInit } from "@/network/rest/api-client";
import { CANCELED } from "@/model/types/types";
import { alertKit } from "alert-kit";
import { currentDate, formatDate, isEmpty, formatCurrency, rounded } from "@/helper/utils.helper";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import BranchInterface from "@/model/ts/interface/branch.interface";
import DashboardInterface, { StatCardInterface } from "@/model/ts/interface/dashboard.interface";
import ErrorResponse from "@/model/class/error-response";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

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

const CommercialDashboard: React.FC<Props> = ({ token, moneda }) => {
    const [dateRange, setDateRange] = useState({
        start: currentDate(),
        end: currentDate(),
    });
    const [branches, setBranches] = useState<BranchInterface[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<string>(token.project.idSucursal || '');
    const [dashboardData, setDashboardData] = useState<DashboardInterface>(null);
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

        setBranches(branchResponse.data);

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

        setDashboardData(dashboardResponde.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchDashboardData();
    }, [dateRange, selectedBranch]);

    const handleSelectStart = (selectedDate: Date) => {
        if (selectedDate) {
            console.log(selectedDate, format(selectedDate, "yyyy-MM-dd"));
            setDateRange((prev) => ({ ...prev, start: format(selectedDate, "yyyy-MM-dd") }));
        }
    };

    const handleSelectEnd = (selectedDate: Date) => {
        if (selectedDate) {
            setDateRange((prev) => ({ ...prev, end: format(selectedDate, "yyyy-MM-dd") }));
        }
    };

    const StatCard: React.FC<StatCardInterface> = ({ title, value, icon: Icon, color, trend, subtitle }) => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Rendimiento por Sucursal</h3>
            <div className="space-y-4">
                {!isEmpty(dashboardData.branchPerformance) ? (
                    dashboardData.branchPerformance.map((branch) => (
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Saldos Bancarios</h3>
            <div className="space-y-4">
                {!isEmpty(dashboardData.bankBalances) ? (
                    dashboardData.bankBalances.map((bank) => (
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

    const SalesChart = () => {
        const data = dashboardData.salesForYear.map((sale) => {
            return {
                mes: sale.nombreMes,
                [currentYear]: sale.totalActual,
                [previousYear]: sale.totalAnterior,
            }
        });

        return (
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend formatter={(value) => `Año ${value}`} />
                    <Bar
                        dataKey={previousYear.toString()}
                        name={previousYear.toString()}
                        fill="#94a3b8" // gris
                        radius={[6, 6, 0, 0]}
                    />
                    <Bar
                        dataKey={currentYear.toString()}
                        name={currentYear.toString()}
                        fill="#3b82f6" // azul
                        radius={[6, 6, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    if (loading) {
        return (
            <DashboardSkeleton />
        );
    }

    return (
        <>
            {/* Date Range Filter */}
            <div className="mb-8 bg-white flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                    <div className="space-y-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start  focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange.start ? formatDate(dateRange.start) : "Desde"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white">
                                <Calendar
                                    mode="single"
                                    selected={new Date(dateRange.start)}
                                    onSelect={handleSelectStart}
                                    locale={es}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start  focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange.end ? formatDate(dateRange.end) : "Desde"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white">
                                <Calendar
                                    mode="single"
                                    selected={new Date(dateRange.end)}
                                    onSelect={handleSelectEnd}
                                    locale={es}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div>
                    <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className={cn(
                            "w-full px-4 py-2",
                            "rounded-lg",
                            "border border-gray-300 text-sm",
                            "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                            "hover:bg-accent hover:text-accent-foreground"
                        )}
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

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Ventas Totales"
                    value={formatCurrency(dashboardData.totalSales, moneda.codiso)}
                    icon={DollarSign}
                    color="green"
                    trend={12.5}
                />
                <StatCard
                    title="Compras Totales"
                    value={formatCurrency(dashboardData.totalPurchases, moneda.codiso)}
                    icon={ShoppingCart}
                    color="blue"
                    trend={8.2}
                />
                <StatCard
                    title="Por Cobrar (Crédito)"
                    value={formatCurrency(dashboardData.creditSalesToCollect, moneda.codiso)}
                    icon={CreditCard}
                    color="yellow"
                    subtitle={`${Math.floor(Math.random() * 15) + 5} clientes`}
                />
                <StatCard
                    title="Por Pagar (Crédito)"
                    value={formatCurrency(dashboardData.creditPurchasesToPay, moneda.codiso)}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <BranchPerformanceChart />
                <BankBalanceCard />
            </div>

            <div className="w-full max-w-6xl mx-auto p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-2xl font-semibold mb-4 text-center">
                    Comparación de Ventas Mensuales: {previousYear} vs {currentYear}
                </h2>
                <SalesChart />
            </div>
        </>
    );
};

export default CommercialDashboard;