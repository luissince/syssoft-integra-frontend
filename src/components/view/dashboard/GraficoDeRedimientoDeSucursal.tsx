import { isEmpty } from "@/helper/utils.helper";
import DashboardInterface from "@/model/ts/interface/dashboard";

interface Props {
    data: DashboardInterface;
}

export default function GraficoDeRedimientoDeSucursal({ data }: Props) {
    return (
        <div className="bg-white rounded shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Rendimiento por Sucursal</h3>
            <div className="space-y-4">
                {!isEmpty(data.rendimientoSucursal) ? (
                    data.rendimientoSucursal.map((branch) => (
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
}