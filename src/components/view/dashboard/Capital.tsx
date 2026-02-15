import { formatCurrency } from "@/helper/utils.helper";
import DashboardInterface from "@/model/ts/interface/dashboard";
import { ShoppingCart, DollarSign, Clock, TrendingUp } from "lucide-react";

interface Props {
    data: DashboardInterface;
    moneda: {
        codiso: string;
    };
}

export default function Capital({ data, moneda }: Props) {
    return (
        <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Mi Dinero: ¿Cuánto invertí y cuánto recuperé?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded">
                            <ShoppingCart className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-600">Invertí en Compras</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(data.capital.invertidoEnCompras, moneda.codiso)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Total gastado en productos</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-100 rounded">
                            <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-600">Ya Recuperé</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(data.capital.recuperadoEnVentas, moneda.codiso)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Lo que vendí hasta ahora</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-orange-100 rounded">
                            <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-600">Me Falta Recuperar</p>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(data.capital.porRecuperar, moneda.codiso)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Aún en inventario</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-100 rounded">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-600">Ganancia Bruta</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(data.capital.gananciaBruta, moneda.codiso)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Diferencia vendido vs costo</p>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-700">
                    <strong>En simple:</strong> Gasté <span className="font-bold">{formatCurrency(data.capital.invertidoEnCompras, moneda.codiso)}</span> comprando productos.<br />
                    Ya vendí por <span className="font-bold text-green-600">{formatCurrency(data.capital.recuperadoEnVentas, moneda.codiso)}</span> (gané {formatCurrency(data.capital.gananciaBruta, moneda.codiso)}).
                    Me quedan <span className="font-bold text-orange-600">{formatCurrency(data.capital.porRecuperar, moneda.codiso)}</span> en productos por vender.
                </p>
            </div>
        </div>
    );
}