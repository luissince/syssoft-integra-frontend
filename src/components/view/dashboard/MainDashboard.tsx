import React, { useState, useEffect, useRef } from "react";
import {
    TrendingUp,
    ShoppingCart,
    DollarSign,
    CreditCard,
    FileText,
    ClipboardCheck,
    Users,
} from "lucide-react";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { optionsSucursal, initDashboard } from "@/network/rest/api-client";
import { alertKit } from "alert-kit";
import { formatCurrency, rounded, sleep } from "@/helper/utils.helper";
import BranchInterface from "@/model/ts/interface/branch";
import DashboardInterface from "@/model/ts/interface/dashboard";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import DatePickerPopover from "@/components/DatePickerPopover";
import MetaDiaria from "./MetaDiaria";
import Capital from "./Capital";
import FlujoDeCaja from "./FlujoDeCaja";
import { useAppSelector } from "@/redux/hooks";
import TarjetaDeEstadistica from "./TarjetaDeEstadistica";
import GraficoDeRedimientoDeSucursal from "./GraficoDeRedimientoDeSucursal";
import TarjetaDeSaldoBancario from "./TarjetaDeSaldoBancario";
import GraficoDeVentas from "./GraficoDeVentas";
import { useDispatch } from "react-redux";

const currentYear = new Date().getFullYear();
const previousYear = currentYear - 1;

const MainDashboard: React.FC = () => {
    // Redux
    const dispatch = useDispatch();
    const token = useAppSelector((state) => state.principal);
    const moneda = useAppSelector(
        (state) => state.predeterminado.moneda
    );

    // State
    const [loading, setLoading] = useState(true);

    const [dateRange, setDateRange] = useState({
        start: new Date(),
        end: new Date(),
    });
    const [branches, setBranches] = useState<BranchInterface[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<string>(token.project.idSucursal || '');
    const [dashboardData, setDashboardData] = useState<DashboardInterface>(null);

    // Ref
    const branchController = useRef<AbortController | null>(null);
    const dashboardController = useRef<AbortController | null>(null);

    const loadBranches = async () => {
        setLoading(true);
        branchController.current = new AbortController();

        const { success, data, message } = await optionsSucursal(branchController.current.signal);

        if (!success) {
            alertKit.warning({
                title: 'Dashboard',
                message: message,
            });
            return;
        }
        branchController.current = null;
        setBranches(data);
        setLoading(false);
    }

    const loadDashboard = async () => {
        setLoading(true);
        dashboardController.current = new AbortController();

        const params = {
            fechaInicio: format(dateRange.start, "yyyy-MM-dd"),
            fechaFinal: format(dateRange.end, "yyyy-MM-dd"),
            idSucursal: selectedBranch,
        };

        const { success, data, message, status } = await initDashboard(
            params,
            dashboardController.current.signal,
        );

        if (!success) {
            if (status === 401) {
                window.localStorage.removeItem('login');
                window.localStorage.removeItem('project');
                window.location.href = '/';
                return;
            }

            alertKit.warning({
                title: 'Dashboard',
                message: message,
            });
            return;
        }

        dashboardController.current = null;
        setDashboardData(data);
        setLoading(false);
    }

    const loadAll = async () => {
        await loadBranches();
        await loadDashboard();
    }

    useEffect(() => {
        loadAll();

        return () => {
            branchController.current?.abort();
            dashboardController.current?.abort();
        };
    }, []);

    useEffect(() => {
        loadDashboard();

        return () => dashboardController.current?.abort();
    }, [dateRange, selectedBranch]);

    const handleSelectStart = (selectedDate: Date) => {
        if (selectedDate) {
            setDateRange((prev) => ({ ...prev, start: selectedDate }));
        }
    };

    const handleSelectEnd = (selectedDate: Date) => {
        if (selectedDate) {
            setDateRange((prev) => ({ ...prev, end: selectedDate }));
        }
    };

    if (loading) {
        return (
            <DashboardSkeleton />
        );
    }

    return (
        <>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Selecciona la vista que deseas visualizar</p>
                </div>
            </div>


            {/* Date Range Filter */}
            <div className="mb-8 bg-white flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                    <DatePickerPopover value={dateRange.start} onChange={handleSelectStart} />

                    <DatePickerPopover value={dateRange.end} onChange={handleSelectEnd} />
                </div>

                <div>
                    <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className={cn(
                            "w-full px-4 py-2",
                            "rounded",
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

            {/* 1. META DIARIA - LO MÁS IMPORTANTE */}
            <MetaDiaria
                data={dashboardData}
                moneda={moneda}
            />

            {/* 2. CAPITAL - ¿Cuánto invertí y cuánto recuperé? */}
            <Capital
                data={dashboardData}
                moneda={moneda}
            />

            {/* 3. FLUJO DE CAJA - ¿A dónde fue mi dinero? */}
            <FlujoDeCaja
                data={dashboardData}
                moneda={moneda}
            />

            {/* 4. Ventas y Compras */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <TarjetaDeEstadistica
                    title="Ventas Totales"
                    value={formatCurrency(dashboardData.totalVentas, moneda.codiso)}
                    icon={DollarSign}
                    color="green"
                    trend={12.5}
                />
                <TarjetaDeEstadistica
                    title="Compras Totales"
                    value={formatCurrency(dashboardData.totalCompras, moneda.codiso)}
                    icon={ShoppingCart}
                    color="blue"
                    trend={8.2}
                />
                <TarjetaDeEstadistica
                    title="Por Cobrar (Crédito)"
                    value={formatCurrency(dashboardData.ventasPorRecibir, moneda.codiso)}
                    icon={CreditCard}
                    color="yellow"
                    subtitle={`${Math.floor(Math.random() * 15) + 5} clientes`}
                />
                <TarjetaDeEstadistica
                    title="Por Pagar (Crédito)"
                    value={formatCurrency(dashboardData.comprasPorPagar, moneda.codiso)}
                    icon={CreditCard}
                    color="red"
                    subtitle={`${Math.floor(Math.random() * 8) + 3} proveedores`}
                />
            </div>

            {/* 5. Otros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <TarjetaDeEstadistica
                    title="Comprobantes Emitidos"
                    value={rounded(dashboardData.documentosEmitidos, 0)}
                    icon={FileText}
                    color="purple"
                />
                <TarjetaDeEstadistica
                    title="Por Declarar"
                    value={rounded(dashboardData.documentosPorDeclarar, 0)}
                    icon={ClipboardCheck}
                    color="orange"
                    subtitle="Revisar estado"
                />
                <TarjetaDeEstadistica
                    title="Cotizaciones Creadas"
                    value={rounded(dashboardData.cotizacionesCreadas, 0)}
                    icon={Users}
                    color="indigo"
                />
                <TarjetaDeEstadistica
                    title="Cotizaciones Convertidas"
                    value={rounded(dashboardData.cotizacionesEnlaceVentas, 0)}
                    icon={TrendingUp}
                    color="green"
                    trend={24.3}
                />
            </div>

            {/* Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <GraficoDeRedimientoDeSucursal data={dashboardData} />
                <TarjetaDeSaldoBancario data={dashboardData} />
            </div>

            {/* Dashboard Charts */}
            <div className="w-full max-w-6xl mx-auto p-4 bg-white rounded shadow-sm border border-gray-100">
                <h2 className="text-2xl font-semibold mb-4 text-center">
                    Comparación de Ventas Mensuales: {previousYear} vs {currentYear}
                </h2>
                <GraficoDeVentas
                    dashboardData={dashboardData}
                    currentYear={currentYear}
                    previousYear={previousYear} />
            </div>
        </>
    );
};

export default MainDashboard;