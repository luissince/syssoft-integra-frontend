import DashboardInterface from "@/model/ts/interface/dashboard";
import { isEmpty } from "@/helper/utils.helper";

interface Props {
    data: DashboardInterface;
}

export default function TarjetaDeSaldoBancario({ data }: Props) {
    return (
        <div className="bg-white rounded shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Saldos Bancarios</h3>
            <div className="space-y-4">
                {!isEmpty(data.balanceBancario) ? (
                    data.balanceBancario.map((bank) => (
                        <div key={bank.idBanco} className="flex justify-between items-center p-3 bg-gray-50 rounded">
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
}