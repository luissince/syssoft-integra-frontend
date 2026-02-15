import { formatCurrency } from "@/helper/utils.helper";
import { CheckCircle, XCircle } from "lucide-react";
import DashboardInterface from "@/model/ts/interface/dashboard";

interface Props {
    data: DashboardInterface,
    moneda: {
        codiso: string;
    };
}

export default function MetaDiaria({ data, moneda }: Props) {
    return (
        <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">¿Cumplí mi meta de hoy?</h2>
            <div className={`${data.metaDiaria.cumplioMeta ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-rose-500'} rounded-lg p-8 text-white shadow-lg`}>
                <div className="flex items-center justify-center md:justify-between flex-wrap">
                    <div className="text-center md:text-left">
                        <p className="text-white/80 text-sm uppercase tracking-wide mb-2">Resumen de Hoy</p>
                        <h3 className="text-4xl font-bold mb-3">{formatCurrency(data.metaDiaria.resumenDelDia, moneda.codiso)}</h3>
                        <div className="flex items-center gap-2 text-lg">
                            {data.metaDiaria.cumplioMeta ? (
                                <>
                                    <CheckCircle className="w-6 h-6" />
                                    <span>¡Meta cumplida! Sobran {formatCurrency((data.metaDiaria.resumenDelDia - data.metaDiaria.metaPorDia), moneda.codiso)}</span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-6 h-6" />
                                    <span>Faltan {formatCurrency((data.metaDiaria.metaPorDia - data.metaDiaria.resumenDelDia), moneda.codiso)} para la meta</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="text-center md:text-right">
                        <p className="text-white/80 text-sm mb-2">Meta Diaria</p>
                        <div className="text-3xl font-bold">{formatCurrency(data.metaDiaria.metaPorDia, moneda.codiso)}</div>
                        <p className="text-white/90 text-sm mt-2">
                            ({formatCurrency(data.metaDiaria.gastoFijo, moneda.codiso)} gastos fijos ÷ {data.metaDiaria.diasMes} días)
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-sm text-gray-600 mb-1">Gastos Fijos Mensuales</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(data.metaDiaria.gastoFijo, moneda.codiso)}</p>
                    <p className="text-xs text-gray-500 mt-1">Alquiler, luz, agua, sueldos</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-sm text-gray-600 mb-1">Debo Vender Mínimo</p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(data.metaDiaria.metaPorDia, moneda.codiso)}</p>
                    <p className="text-xs text-gray-500 mt-1">Por día para cubrir gastos</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-sm text-gray-600 mb-1">Proyección del Mes</p>
                    <p className="text-xl font-bold text-green-600">
                        {formatCurrency((data.metaDiaria.resumenDelDia * data.metaDiaria.diasMes), moneda.codiso)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Si mantengo este ritmo</p>
                </div>
            </div>
        </div>
    );
}