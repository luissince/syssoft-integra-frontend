
import { IconType } from "react-icons";

interface Props {
    title: string;
    value: string | number;
    icon: IconType;
    color: string;
    trend?: number;
    subtitle?: string;
}

export default function TarjetaDeEstadistica({ title, value, icon: Icon, color, trend, subtitle }: Props) {
    return (
        <div className="bg-white rounded shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <div className={`p-3 rounded bg-${color}-50`}>
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
}