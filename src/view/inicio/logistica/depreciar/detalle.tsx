import Image from "@/components/Image";
import SearchInput from "@/components/SearchInput";
import Select from "@/components/Select";
import { SpinnerView } from "@/components/Spinner";
import Title from "@/components/Title";
import ContainerWrapper from "@/components/ui/container-wrapper";
import { CANCELED } from "@/constants/requestStatus";
import { images } from "@/helper";
import { formatCurrency, isEmpty } from "@/helper/utils.helper";
import SuccessResponse from "@/model/class/response";
import { ProductoFilterInterface } from "@/model/ts/interface/producto";
import { WarehouseOptionsInterface } from "@/model/ts/interface/warehouse";
import { detalleDepreciacionKardex, optionsAlmacen } from "@/network/rest/api-client";
import { filtrarProducto } from "@/network/rest/principal.network";
import { useAppSelector } from "@/redux/hooks";
import { alertKit } from "alert-kit";
import { useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { BsDatabaseSlash } from "react-icons/bs";
import { cn } from "@/lib/utils";
import Paginacion from "@/components/Paginacion";
import { ACTIVO_FIJO, tipoProductoMap } from "@/model/types/tipo-producto";
import { metodoDepreciacionMap } from "@/model/types/metodo-depreciacion";
import { hi } from "date-fns/locale";

const depreciacion = [
    { year: 2021, value: 15300 },
    { year: 2022, value: 15300 },
    { year: 2023, value: 15300 },
    { year: 2024, value: 15300 },
    { year: 2025, value: 15300 },
];

const valorLibros = [
    { year: 2021, value: 69700 },
    { year: 2022, value: 54400 },
    { year: 2023, value: 39100 },
    { year: 2024, value: 23800 },
    { year: 2025, value: 8500 },
];

const lista = [
    {
        year: 2021,
        periodo: "01/01/2021 - 31/12/2021",
        inicio: 76500,
        anual: 15300,
        mensual: 1275,
        acumulada: 15300,
        deterioro: 0,
        libros: 61200,
        estado: "Activo"
    },
    {
        year: 2022,
        periodo: "01/01/2022 - 31/12/2022",
        inicio: 61200,
        anual: 15300,
        mensual: 1275,
        acumulada: 30600,
        deterioro: 0,
        libros: 45900,
        estado: "Activo"
    },
    {
        year: 2023,
        periodo: "01/01/2023 - 31/12/2023",
        inicio: 45900,
        anual: 15300,
        mensual: 1275,
        acumulada: 45900,
        deterioro: 0,
        libros: 30600,
        estado: "Activo"
    },
    {
        year: 2024,
        periodo: "01/01/2024 - 31/12/2024",
        inicio: 30600,
        anual: 15300,
        mensual: 1275,
        acumulada: 61200,
        deterioro: 0,
        libros: 15300,
        estado: "Activo"
    },
    {
        year: 2025,
        periodo: "01/01/2025 - 31/12/2025",
        inicio: 15300,
        anual: 15300,
        mensual: 1275,
        acumulada: 76500,
        deterioro: 0,
        libros: 0,
        estado: "Depreciado"
    }
];

const maxValorLibros = Math.max(...valorLibros.map(v => v.value));

const DepreciarDetalle = () => {
    // Redux
    const token = useAppSelector((state) => state.principal);
    const moneda = useAppSelector(
        (state) => state.predeterminado.moneda
    );
    const location = useLocation<{ idProducto: string, idAlmacen: string, serie: string }>();


    const { idProducto, idAlmacen, serie } = location.state || {};

    // State
    const [loading, setLoading] = useState(false);
    const [msgLoading, setMsgLoading] = useState<string>('Cargando información...');

    const [producto, setProducto] = useState<any>(null);
    const [activo, setActivo] = useState<any>(null);


    // Ref
    const history = useHistory();

    const refPaginacion = useRef<Paginacion>(null);

    // Eventos
    const abortController = useRef<AbortController | null>(null);

    if (!idProducto && !idAlmacen && !serie) {
        return history.goBack();
    }

    const loadData = async () => {
        abortController.current?.abort();
        abortController.current = new AbortController();

        setLoading(true);

        const body = {
            idProducto,
            idAlmacen,
            serie
        }

        const { success, data, message } = await detalleDepreciacionKardex(body, abortController.current.signal);

        if (!success) {
            alertKit.warning({
                title: "Depreciación",
                message: message,
                onClose: () => {
                    history.goBack();
                }
            });
            return;
        }

        console.log(idProducto, idAlmacen, serie);
        console.log(data);

        setProducto(data.producto);
        setActivo(data.activo);
        setLoading(false);
    }

    useEffect(() => {
        loadData();

        return () => {
            abortController.current?.abort();
        };
    }, []);

    // Acciones
    return (
        <ContainerWrapper>
            <SpinnerView
                loading={loading}
                message={msgLoading}
            />

            <Title
                title="Depreciar"
                subTitle="Detalle de Depreciación"
                handleGoBack={() => history.goBack()}
            />

            {/* Información del producto */}
            <div className="max-w-7xl mx-auto mb-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 bg-white rounded border p-6 gap-3">
                        <div className="flex items-center justify-between mb-3">
                            <h5 className="text-base font-semibold text-gray-900">
                                Información del Producto
                            </h5>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-gray-600">
                                <strong className="text-gray-900">Código:</strong> {producto && producto.codigo}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong className="text-gray-900">Nombre:</strong> {producto && producto.nombre}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong className="text-gray-900">Tipo de producto:</strong> {producto && tipoProductoMap.get(producto.idTipoProducto).label}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong className="text-gray-900">Cantidad:</strong> {activo && activo.cantidad}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong className="text-gray-900">Serie:</strong> {activo && activo.serie}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong className="text-gray-900">Ubicación:</strong> {activo && activo.ubicacion}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong className="text-gray-900">Valor Residual:</strong> {activo && activo.valorResidual}
                            </p>

                            <p className="text-sm text-gray-600">
                                <strong className="text-gray-900">Vida Útil:</strong> {activo && activo.vidaUtilidad}
                            </p>

                            <div className="text-sm text-gray-600">
                                <strong className="text-gray-900">Metodo de depreciación:</strong>
                                <p>{producto && metodoDepreciacionMap.get(producto.idMetodoDepreciacion).title}</p>
                                <p>{producto && metodoDepreciacionMap.get(producto.idMetodoDepreciacion).detail}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded border p-6 flex items-center justify-center">
                        <Image
                            default={images.noImage}
                            src={(producto && producto.imagen) || null}
                            alt={(producto && producto.nombre) || 'Producto sin imagen'}
                            overrideClass="w-40 h-40 object-contain"
                        />
                    </div>
                </div>
            </div>

            {/* Cards de depreciación */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <p className="text-sm font-medium text-gray-600 uppercase">Costo Original</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(0, moneda.codiso)}
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <p className="text-sm font-medium text-gray-600 uppercase">Dep. AcumuladaL</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(0, moneda.codiso)}
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <p className="text-sm font-medium text-gray-600 uppercase">Valor en Libros</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(0, moneda.codiso)}
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <p className="text-sm font-medium text-gray-600 uppercase">% Depreciado</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(0, moneda.codiso)}
                    </p>
                </div>
            </div>

            {/* Progreso de la depreciación */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Depreciación anual */}
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <p className="text-sm font-medium text-gray-600 uppercase">
                            Depreciación Anual
                        </p>
                    </div>

                    <div className="space-y-4">
                        {depreciacion.map((item, i) => (
                            <div key={i} className="flex items-center gap-4">

                                <div className="w-12 text-sm text-gray-500">
                                    {item.year}
                                </div>

                                <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
                                        style={{ width: "100%" }}
                                    />
                                </div>

                                <div className="w-24 text-right text-sm text-gray-400">
                                    S/ {item.value.toLocaleString()}
                                </div>

                            </div>
                        ))}
                    </div>
                </div>

                {/* Evolución valor en libros */}
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <p className="text-sm font-medium text-gray-600 uppercase">
                            Evolución Valor en Libros
                        </p>
                    </div>

                    <div className="space-y-4">
                        {valorLibros.map((item, i) => {

                            const porcentaje = (item.value / maxValorLibros) * 100;

                            return (
                                <div key={i} className="flex items-center gap-4">

                                    <div className="w-12 text-sm text-gray-500">
                                        {item.year}
                                    </div>

                                    <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-green-400"
                                            style={{ width: `${porcentaje}%` }}
                                        />
                                    </div>

                                    <div className="w-24 text-right text-sm text-gray-400">
                                        S/ {item.value.toLocaleString()}
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Tabla completa */}
            <div className="w-full">
                <div className="flex items-center gap-3 mb-3">
                    <p className="text-sm font-medium text-gray-600 uppercase">Tabla Completa</p>
                </div>

                <div className="w-full">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            {/* Encabezado de la tabla */}
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Año
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Período
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Val. Inicio
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Dep. Anual
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Dep. Mensual
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Dep. Acum.
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Deterioro Acum.
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Val. Libros
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                </tr>
                            </thead>

                            {/* Cuerpo de la tabla */}
                            <tbody className="bg-white divide-y divide-gray-200">
                                {/* <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <BsDatabaseSlash className="w-12 h-12 text-gray-400" />
                                            <p className="mt-2 text-sm font-medium text-gray-900">No hay datos para mostrar</p>
                                            <p className="mt-1 text-sm text-gray-500">Intenta cambiar los filtros</p>
                                        </div>
                                    </td>
                                </tr> */}
                                {
                                    lista.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 text-sm text-gray-900">{item.year}</td>

                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {item.periodo}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {formatCurrency(item.inicio, moneda.codiso)}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {formatCurrency(item.anual, moneda.codiso)}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {formatCurrency(item.mensual, moneda.codiso)}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {formatCurrency(item.acumulada, moneda.codiso)}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {formatCurrency(item.deterioro, moneda.codiso)}
                                            </td>

                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                {formatCurrency(item.libros, moneda.codiso)}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2 py-1 text-xs rounded-full",
                                                    item.estado === "Activo" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                                                )}>
                                                    {item.estado}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

                <Paginacion
                    ref={refPaginacion}
                    loading={loading}
                    data={lista}
                    totalPaginacion={lista.length}
                    paginacion={1}
                    fillTable={() => { }}
                    restart={false}
                    theme="modern"
                    className={"md:px-4 py-3 bg-white border-t border-gray-200 overflow-auto"}
                />
            </div>
        </ContainerWrapper>
    );
};

export default DepreciarDetalle;
