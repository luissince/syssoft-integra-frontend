import DashboardInterface from "@/model/ts/interface/dashboard";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props {
    dashboardData: DashboardInterface;
    currentYear: number;
    previousYear: number;
}

export default function GraficoDeVentas({ dashboardData, currentYear, previousYear }: Props) {
    const data = dashboardData.ventasAnuales.map((sale) => {
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

}