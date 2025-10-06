import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Settings, AlertCircle, Search, Plus, Trash2 } from 'lucide-react';

// Datos de prueba
const initialSalesData: {
    date: string;
    sales: number;
}[] = [
        { date: '2025-10-01', sales: 85 },
        { date: '2025-10-02', sales: 120 },
        { date: '2025-10-03', sales: 65 },
        { date: '2025-10-04', sales: 150 },
        { date: '2025-10-05', sales: 95 },
        { date: '2025-10-06', sales: 110 },
        { date: '2025-10-07', sales: 75 },
        { date: '2025-10-08', sales: 140 },
        { date: '2025-10-09', sales: 88 },
        { date: '2025-10-10', sales: 130 },
        { date: '2025-10-11', sales: 70 },
        { date: '2025-10-12', sales: 160 },
        { date: '2025-10-13', sales: 95 },
        { date: '2025-10-14', sales: 115 },
        { date: '2025-10-15', sales: 80 },
        { date: '2025-10-16', sales: 125 },
        { date: '2025-10-17', sales: 90 },
        { date: '2025-10-18', sales: 135 },
        { date: '2025-10-19', sales: 78 },
        { date: '2025-10-20', sales: 145 },
        { date: '2025-10-21', sales: 100 },
        { date: '2025-10-22', sales: 118 },
        { date: '2025-10-23', sales: 85 },
        { date: '2025-10-24', sales: 155 },
        { date: '2025-10-25', sales: 92 },
        { date: '2025-10-26', sales: 128 },
        { date: '2025-10-27', sales: 105 },
        { date: '2025-10-28', sales: 142 },
        { date: '2025-10-29', sales: 87 },
        { date: '2025-10-30', sales: 138 }
    ];

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

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    color: string;
    subtitle?: string;
}

interface SaleData {
    date: string;
    sales: number;
}

interface ExpenseBreakdown {
    [key: string]: number;
}

interface AnalysisData {
    label: string;
    total: number;
    avg: number;
    days: number;
    metaTotal: number;
    difference: number;
    daysAbove: number;
    daysBelow: number;
    cumple: boolean;
}

interface CustomRangeAnalysisProps {
    salesData: SaleData[];
    dailyGoal: number;
}

const CustomRangeAnalysis: React.FC<CustomRangeAnalysisProps> = ({ salesData, dailyGoal }) => {
    const [rangeType, setRangeType] = useState('day');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [analysis, setAnalysis] = useState<AnalysisData | null>(null);

    const analyzeRange = () => {
        let filtered = [];
        let label = '';

        if (rangeType === 'day' && startDate) {
            filtered = salesData.filter(d => d.date === startDate);
            label = `Día ${startDate}`;
        } else if (rangeType === 'week') {
            const today = new Date();
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            filtered = salesData.filter(d => {
                const date = new Date(d.date);
                return date >= weekAgo && date <= today;
            });
            label = 'Esta semana (últimos 7 días)';
        } else if (rangeType === 'custom' && startDate && endDate) {
            filtered = salesData.filter(d => d.date >= startDate && d.date <= endDate);
            label = `Del ${startDate} al ${endDate}`;
        } else if (rangeType === 'lastWeek') {
            filtered = salesData.slice(-7);
            label = 'Últimos 7 días registrados';
        }

        if (filtered.length > 0) {
            const total = filtered.reduce((sum, d) => sum + d.sales, 0);
            const avg = total / filtered.length;
            const metaTotal = dailyGoal * filtered.length;
            const daysAbove = filtered.filter(d => d.sales >= dailyGoal).length;
            const daysBelow = filtered.filter(d => d.sales < dailyGoal).length;
            const cumple = total >= metaTotal;

            setAnalysis({
                label,
                total,
                avg,
                days: filtered.length,
                metaTotal,
                difference: total - metaTotal,
                daysAbove,
                daysBelow,
                cumple
            });
        } else {
            setAnalysis(null);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Analizar Período
            </h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-gray-700 mb-2 text-sm font-medium">Tipo de Análisis</label>
                    <select
                        value={rangeType}
                        onChange={(e) => setRangeType(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="day">Un día específico</option>
                        <option value="week">Esta semana (últimos 7 días)</option>
                        <option value="lastWeek">Últimos 7 días registrados</option>
                        <option value="custom">Rango personalizado</option>
                    </select>
                </div>

                {rangeType === 'day' && (
                    <div>
                        <label className="block text-gray-700 mb-2 text-sm font-medium">Fecha</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                )}

                {rangeType === 'custom' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-2 text-sm font-medium">Desde</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2 text-sm font-medium">Hasta</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                )}

                <button
                    onClick={analyzeRange}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                    <Search className="w-5 h-5" />
                    Analizar
                </button>

                {analysis && (
                    <div className={`mt-4 p-4 rounded-lg border-2 ${analysis.cumple ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <h4 className="text-gray-900 font-bold text-lg mb-3">{analysis.label}</h4>

                        <div className="space-y-2">
                            <div className="flex justify-between text-gray-700">
                                <span>Total vendido:</span>
                                <span className="font-bold">S/ {analysis.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span>Meta del período:</span>
                                <span className="font-bold">S/ {analysis.metaTotal.toFixed(2)}</span>
                            </div>
                            <div className={`flex justify-between font-bold text-lg ${analysis.cumple ? 'text-green-600' : 'text-red-600'}`}>
                                <span>Diferencia:</span>
                                <span>{analysis.difference >= 0 ? '+' : ''}S/ {analysis.difference.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-300 pt-2 mt-2">
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Promedio diario:</span>
                                    <span>S/ {analysis.avg.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Días analizados:</span>
                                    <span>{analysis.days}</span>
                                </div>
                                <div className="flex justify-between text-green-600 text-sm">
                                    <span>Días con meta:</span>
                                    <span>{analysis.daysAbove} ({((analysis.daysAbove / analysis.days) * 100).toFixed(0)}%)</span>
                                </div>
                                <div className="flex justify-between text-red-600 text-sm">
                                    <span>Días bajo meta:</span>
                                    <span>{analysis.daysBelow} ({((analysis.daysBelow / analysis.days) * 100).toFixed(0)}%)</span>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-300">
                                <p className={`text-center font-bold text-lg ${analysis.cumple ? 'text-green-600' : 'text-red-600'}`}>
                                    {analysis.cumple ? '✓ Meta Cumplida' : '✗ Meta No Cumplida'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const DailySalesDashboard: React.FC<Props> = ({ token, moneda }) => {
    const [monthlyExpenses, setMonthlyExpenses] = useState<number>(2000);
    const [salesData, setSalesData] = useState<SaleData[]>(initialSalesData);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [newSaleDate, setNewSaleDate] = useState<string>('');
    const [newSaleAmount, setNewSaleAmount] = useState<string>('');
    const [expenseBreakdown, setExpenseBreakdown] = useState<ExpenseBreakdown>({
        alquiler: 800,
        luz: 300,
        agua: 150,
        internet: 100,
        otros: 650,
    });
    const [newExpenseName, setNewExpenseName] = useState<string>('');
    const [newExpenseAmount, setNewExpenseAmount] = useState<string>('');

    const dailyGoal = useMemo(() => monthlyExpenses / 30, [monthlyExpenses]);

    const statistics = useMemo(() => {
        const total = salesData.reduce((sum, day) => sum + day.sales, 0);
        const avg = total / salesData.length;
        const daysAbove = salesData.filter(day => day.sales >= dailyGoal).length;
        const daysBelow = salesData.filter(day => day.sales < dailyGoal).length;
        const netProfit = total - monthlyExpenses;

        return { total, avg, daysAbove, daysBelow, netProfit };
    }, [salesData, dailyGoal, monthlyExpenses]);

    const chartData = useMemo(() => {
        return salesData.map(day => ({
            ...day,
            meta: dailyGoal,
            diferencia: day.sales - dailyGoal,
            dateLabel: new Date(day.date).getDate()
        }));
    }, [salesData, dailyGoal]);

    const lastWeekData = useMemo(() => {
        return chartData.slice(-7);
    }, [chartData]);

    const handleAddSale = (): void => {
        if (newSaleDate && newSaleAmount) {
            const exists = salesData.find((s) => s.date === newSaleDate);
            if (exists) {
                setSalesData(
                    salesData.map((s) =>
                        s.date === newSaleDate ? { ...s, sales: parseFloat(newSaleAmount) } : s
                    )
                );
            } else {
                setSalesData(
                    [...salesData, { date: newSaleDate, sales: parseFloat(newSaleAmount) }].sort(
                        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                    )
                );
            }
            setNewSaleDate('');
            setNewSaleAmount('');
        }
    };

    const handleExpenseChange = (key: string, value: string) => {
        const newBreakdown: ExpenseBreakdown = { ...expenseBreakdown, [key]: parseFloat(value) || 0 };
        setExpenseBreakdown(newBreakdown);
        const total = Object.values(newBreakdown).reduce((sum, val) => sum + val, 0);
        setMonthlyExpenses(total);
    };

    const handleAddExpense = () => {
        if (newExpenseName.trim() && newExpenseAmount) {
            const cleanName = newExpenseName.trim().toLowerCase().replace(/\s+/g, '_');
            if (expenseBreakdown.hasOwnProperty(cleanName)) {
                alert('Ya existe un gasto con ese nombre');
                return;
            }
            const newBreakdown = {
                ...expenseBreakdown,
                [cleanName]: parseFloat(newExpenseAmount) || 0
            };
            setExpenseBreakdown(newBreakdown);
            const total = Object.values(newBreakdown).reduce((sum, val) => sum + val, 0);
            setMonthlyExpenses(total);
            setNewExpenseName('');
            setNewExpenseAmount('');
        }
    };

    const handleDeleteExpense = (key: string) => {
        const { [key]: removed, ...rest } = expenseBreakdown;
        setExpenseBreakdown(rest);
        const total = Object.values(rest).reduce((sum, val) => sum + val, 0);
        setMonthlyExpenses(total);
    };

    const today = salesData[salesData.length - 1];
    const todayStatus = today.sales >= dailyGoal;

    const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, subtitle }) => (
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
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div className="w-full flex items-center space-x-4">
                    <div>
                        <input
                            type="date"
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <input
                            type="date"
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="w-full flex items-center justify-end space-x-2">
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                        <Calendar className="h-5 w-5 text-gray-600" />
                        <select
                            className="bg-transparent border-none text-gray-700 focus:outline-none"
                        >
                        </select>
                    </div>

                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <Settings className="w-6 h-6 text-gray-700" />
                    </button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuración de Gastos Fijos</h2>

                    {/* Existing Expenses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {Object.entries(expenseBreakdown).map(([key, value]) => (
                            <div key={key}>
                                <label className="block text-gray-700 mb-2 capitalize text-sm font-medium">
                                    {key.replace(/_/g, ' ')}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={value}
                                        onChange={(e) => handleExpenseChange(key, e.target.value)}
                                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={() => handleDeleteExpense(key)}
                                        className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                        title="Eliminar gasto"
                                    >
                                        <Trash2 className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add New Expense */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                        <h3 className="text-gray-900 font-semibold mb-3 flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Agregar Nuevo Gasto
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                                type="text"
                                placeholder="Nombre del gasto"
                                value={newExpenseName}
                                onChange={(e) => setNewExpenseName(e.target.value)}
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <input
                                type="number"
                                placeholder="Monto mensual"
                                value={newExpenseAmount}
                                onChange={(e) => setNewExpenseAmount(e.target.value)}
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                onClick={handleAddExpense}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Agregar
                            </button>
                        </div>
                    </div>

                    {/* Total Summary */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-gray-700">Total Gastos Mensuales: <span className="text-gray-900 font-bold text-xl">S/ {monthlyExpenses.toFixed(2)}</span></p>
                        <p className="text-gray-600 text-sm mt-2">Meta diaria: S/ {dailyGoal.toFixed(2)}</p>
                    </div>
                </div>
            )}

            {/* Today's Status Card */}
            <div className={`${todayStatus ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-rose-500'} rounded-lg shadow-sm p-6 mb-8`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white/80 text-sm uppercase tracking-wide">Venta de Hoy - {today.date}</p>
                        <h2 className="text-4xl font-bold text-white mt-2">S/ {today.sales.toFixed(2)}</h2>
                        <p className="text-white/90 mt-2">
                            {todayStatus ? (
                                <span className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    ¡Meta cumplida! +S/ {(today.sales - dailyGoal).toFixed(2)}
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <TrendingDown className="w-5 h-5" />
                                    Falta S/ {(dailyGoal - today.sales).toFixed(2)} para la meta
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-white/80 text-sm">Meta Diaria</p>
                        <p className="text-3xl font-bold text-white">S/ {dailyGoal.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Ventas del Mes"
                    value={`S/ ${statistics.total.toFixed(2)}`}
                    icon={DollarSign}
                    color="blue"
                    subtitle={`Promedio: S/ ${statistics.avg.toFixed(2)}/día`}
                />
                <StatCard
                    title="Días con Meta"
                    value={statistics.daysAbove.toString()}
                    icon={TrendingUp}
                    color="green"
                    subtitle={`${((statistics.daysAbove / salesData.length) * 100).toFixed(1)}% del mes`}
                />
                <StatCard
                    title="Días Bajo Meta"
                    value={statistics.daysBelow.toString()}
                    icon={TrendingDown}
                    color="red"
                    subtitle={`${((statistics.daysBelow / salesData.length) * 100).toFixed(1)}% del mes`}
                />
                <StatCard
                    title="Ganancia Neta"
                    value={`S/ ${statistics.netProfit.toFixed(2)}`}
                    icon={AlertCircle}
                    color={statistics.netProfit >= 0 ? 'green' : 'red'}
                    subtitle="Después de gastos fijos"
                />
            </div>

            {/* Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Custom Range Analysis */}
                <CustomRangeAnalysis salesData={salesData} dailyGoal={dailyGoal} />

                {/* Last Week Bar Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Última Semana</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={lastWeekData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="dateLabel" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <ReferenceLine y={dailyGoal} stroke="#ef4444" strokeDasharray="3 3" label="Meta" />
                            <Bar dataKey="sales" fill="#3b82f6" name="Ventas" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

            </div>

            {/* Charts */}
            <div className="mb-8">

                {/* Monthly Line Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Tendencia del Mes</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="dateLabel" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <ReferenceLine y={dailyGoal} stroke="#ef4444" strokeDasharray="3 3" label="Meta" />
                            <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} name="Ventas" />
                            <Line type="monotone" dataKey="meta" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" name="Meta Diaria" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Daily Details Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Detalle Diario (Últimos 10 días)</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left text-gray-600 py-3 px-4 font-medium">Fecha</th>
                                <th className="text-right text-gray-600 py-3 px-4 font-medium">Ventas</th>
                                <th className="text-right text-gray-600 py-3 px-4 font-medium">Meta</th>
                                <th className="text-right text-gray-600 py-3 px-4 font-medium">Diferencia</th>
                                <th className="text-center text-gray-600 py-3 px-4 font-medium">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chartData.slice(-10).reverse().map((day, idx) => (
                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4 text-gray-700">{day.date}</td>
                                    <td className="py-3 px-4 text-right text-gray-900 font-semibold">S/ {day.sales.toFixed(2)}</td>
                                    <td className="py-3 px-4 text-right text-gray-600">S/ {day.meta.toFixed(2)}</td>
                                    <td className={`py-3 px-4 text-right font-semibold ${day.diferencia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {day.diferencia >= 0 ? '+' : ''}S/ {day.diferencia.toFixed(2)}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${day.sales >= day.meta ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {day.sales >= day.meta ? '✓ Cumplida' : '✗ Pendiente'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default DailySalesDashboard;