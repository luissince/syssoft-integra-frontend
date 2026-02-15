import { isEmpty } from "@/helper/utils.helper";
import { BanknoteIcon } from "lucide-react";
import { formatCurrency } from "@/helper/utils.helper";
import DashboardInterface from "@/model/ts/interface/dashboard";

interface Props {
    data: DashboardInterface;
    moneda: {
        codiso: string;
    };
}

export default function FlujoDeCaja({ data, moneda }: Props) {
    return (
        <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Mi Dinero Hoy: ¿Dónde está?</h2>
            {
                isEmpty(data.cajaDeFlujo) ? (
                    <div className="bg-white w-full rounded-lg border border-gray-200 p-6">
                        <p className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-3">
                            <BanknoteIcon className="w-5 h-5" /> Cuentas
                        </p>
                        <p className="text-xl font-bold text-gray-900">
                            No hay transacciones
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {
                            data.cajaDeFlujo.map((item, index) => (
                                <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                                    <p className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-3"><BanknoteIcon className="w-5 h-5" /> {item.nombre}</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {formatCurrency(item.saldo, moneda.codiso)}
                                    </p>
                                </div>
                            ))
                        }
                    </div>
                )
            }
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <p className="text-lg font-semibold text-gray-900">
                    Total de Dinero: <span className="text-green-600">{formatCurrency(data.cajaDeFlujo.reduce((acum, item) => acum + item.saldo, 0), moneda.codiso)}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">Este es el dinero real que tengo disponible ahora</p>
            </div>
        </div>
    );
}