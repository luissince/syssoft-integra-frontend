import Image from "@/components/Image";
import Paginacion from "@/components/Paginacion";
import { SpinnerView } from "@/components/Spinner";
import Title from "@/components/Title";
import ContainerWrapper from "@/components/ui/container-wrapper";
import { images } from "@/helper";
import { formatCurrency, isEmpty, rounded } from "@/helper/utils.helper";
import { cn } from "@/lib/utils";
import { metodoDepreciacionMap } from "@/model/types/metodo-depreciacion";
import { tipoProductoMap } from "@/model/types/tipo-producto";
import { createDepreciacionKardex, detalleDepreciacionKardex } from "@/network/rest/api-client";
import { useAppSelector } from "@/redux/hooks";
import { alertKit } from "alert-kit";
import { useEffect, useRef, useState } from "react";
import { BsDatabaseSlash } from "react-icons/bs";
import { useHistory, useLocation } from "react-router-dom";

const DepreciacionDetalle = () => {
    // =============================
    // REDUX
    // =============================

    const token = useAppSelector((state) => state.principal);

    const moneda = useAppSelector(
        (state) => state.predeterminado.moneda
    );

    // =============================
    // ROUTER
    // =============================

    const location = useLocation<{
        idProducto: string;
        idAlmacen: string;
        serie: string;
    }>();

    const history = useHistory();

    const { idProducto, idAlmacen, serie } = location.state || {};

    // =============================
    // STATE
    // =============================

    const [loading, setLoading] = useState(false);
    const [msgLoading, setMsgLoading] = useState<string>(
        "Cargando información..."
    );

    const [producto, setProducto] = useState<any>(null);
    const [activo, setActivo] = useState<any>(null);
    const [depreciaciones, setDepreciaciones] = useState<any[]>([]);

    const [costoOriginal, setCostoOriginal] = useState<number>(0);
    const [depreciacionAcumulada, setDepreciacionAcumulada] = useState<number>(0);
    const [valorLibro, setValorLibro] = useState<number>(0);
    const [porcentajeDepreciado, setPorcentajeDepreciado] = useState<number>(0);

    // =============================
    // REFS
    // =============================

    const refPaginacion = useRef<Paginacion>(null);

    const abortController = useRef<AbortController | null>(null);

    // =============================
    // VALIDACIONES
    // =============================

    if (!idProducto && !idAlmacen && !serie) {
        history.goBack();
    }

    // =============================
    // FUNCIONES
    // =============================

    const loadData = async () => {
        abortController.current?.abort();
        abortController.current = new AbortController();

        setLoading(true);

        const body = {
            idProducto,
            idAlmacen,
            serie
        };

        const { success, data, message } =
            await detalleDepreciacionKardex(
                body,
                abortController.current.signal
            );

        if (!success) {
            alertKit.warning({
                title: "Depreciación",
                message: message,
                onClose: () => history.goBack()
            });

            return;
        }

        // =============================
        // FORMATEAR DEPRECIACIONES
        // =============================

        console.log(data);

        const lista = data.depreciaciones.map((item: any) => {

            const year = new Date(item.periodo).getFullYear();

            return {
                year,
                periodo: `01/01/${year} - 31/12/${year}`,
                inicio: Number(item.valorInicio),
                anual: Number(item.depreciacion),
                mensual: Number(item.depreciacion) / 12,
                acumulada: Number(item.depreciacionAcumulada),
                deterioro: 0,
                libros: Number(item.valorLibros),
                estado:
                    Number(item.valorLibros) <= 0
                        ? "Depreciado"
                        : "Activo"
            };
        });

        // =============================
        // RESUMEN
        // =============================

        const costoOriginal = data.producto.costo || 0;

        const depreciacionAcumulada = data.metricas.depreciacionHoy;

        const valorLibro = data.metricas.valorLibrosHoy

        const porcentajeDepreciado = data.metricas.porcentajeDepreciado;

        // =============================
        // SET STATE
        // =============================

        setProducto(data.producto);
        setActivo(data.activo);
        setDepreciaciones(lista);

        setCostoOriginal(costoOriginal);
        setDepreciacionAcumulada(depreciacionAcumulada);
        setValorLibro(valorLibro);
        setPorcentajeDepreciado(porcentajeDepreciado);

        setLoading(false);
    };

    // =============================
    // EFFECT
    // =============================

    useEffect(() => {
        loadData();

        return () => {
            abortController.current?.abort();
        };
    }, []);

    const handleCrearDepreciacion = async () => {
        const accept = await alertKit.question({
            title: "Producto",
            message: "¿Estás seguro de crear la depreciación?",
            acceptButton: {
                html: "<i class='fa fa-check'></i> Aceptar",
            },
            cancelButton: {
                html: "<i class='fa fa-close'></i> Cancelar",
            },
        });

        if (accept) {
            alertKit.loading({ message: 'Procesando información...' });

            const body = {
                idProducto,
                serie
            }
            const { success, data, message } = await createDepreciacionKardex(body);

            if (!success) {
                alertKit.warning({
                    title: 'Depreciación',
                    message: message,
                });
                return;
            }

            alertKit.success({
                title: 'Depreciación',
                message: data,
            });
        }
    }

    // =============================
    // DATOS PARA GRAFICOS
    // =============================

    const depreciacionAnual = depreciaciones.map((item) => ({
        year: item.year,
        value: item.anual
    }));

    const evolucionValorLibros = depreciaciones.map((item) => ({
        year: item.year,
        value: item.libros
    }));

    const maxValorLibros =
        evolucionValorLibros.length > 0
            ? Math.max(...evolucionValorLibros.map((v) => v.value))
            : 0;

    const maxDepreciacion =
        depreciacionAnual.length > 0
            ? Math.max(...depreciacionAnual.map((v) => v.value))
            : 0;


    // Acciones
    const renderBody = () => {
        if (isEmpty(depreciaciones)) {
            return (
                <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                            <BsDatabaseSlash className="w-12 h-12 text-gray-400" />
                            <p className="mt-2 text-sm font-medium text-gray-900">
                                No hay datos para mostrar
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                Este activo aún no tiene depreciaciones generadas
                            </p>
                        </div>
                    </td>
                </tr>
            );
        }

        return (
            depreciaciones.map((item, index) => (
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
                        <span
                            className={cn(
                                "px-2 py-1 text-xs rounded-full",
                                item.estado === "Activo"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-200 text-gray-700"
                            )}
                        >
                            {item.estado}
                        </span>
                    </td>
                </tr>
            ))
        );
    }

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
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                    {/* Información del producto */}
                    <div className="lg:col-span-3 rounded border p-6 gap-3">
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
                                <strong className="text-gray-900">Vida Útil:</strong> {activo && activo.vidaUtil}
                            </p>

                            <div className="text-sm text-gray-600">
                                <strong className="text-gray-900">Metodo de depreciación:</strong>
                                <p>{producto && metodoDepreciacionMap.get(producto.idMetodoDepreciacion).title}</p>
                                <p>{producto && metodoDepreciacionMap.get(producto.idMetodoDepreciacion).detail}</p>
                            </div>
                        </div>
                    </div>

                    {/*  Imagen del producto */}
                    <div className="rounded border p-6 flex items-center justify-center">
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
                    <p className={`text-2xl font-bold ${porcentajeDepreciado === 100
                        ? "text-gray-500"
                        : "text-blue-600"
                        }`}>
                        {formatCurrency(costoOriginal, moneda.codiso)}
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <p className="text-sm font-medium text-gray-600 uppercase">Dep. AcumuladaL</p>
                    </div>
                    <p className={`text-2xl font-bold ${porcentajeDepreciado === 100
                        ? "text-gray-500"
                        : "text-blue-600"
                        }`}>
                        {formatCurrency(depreciacionAcumulada, moneda.codiso)}
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <p className="text-sm font-medium text-gray-600 uppercase">Valor en Libros</p>
                    </div>
                    <p className={`text-2xl font-bold ${porcentajeDepreciado === 100
                        ? "text-gray-500"
                        : "text-blue-600"
                        }`}>
                        {formatCurrency(valorLibro, moneda.codiso)}
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <p className="text-sm font-medium text-gray-600 uppercase">% Depreciado</p>
                    </div>
                    <p className={`text-2xl font-bold ${porcentajeDepreciado === 100
                        ? "text-gray-500"
                        : "text-blue-600"
                        }`}>
                        {rounded(porcentajeDepreciado, 0)} %
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
                        {
                            depreciacionAnual.map((item, i) => {
                                const porcentaje = (item.value / maxDepreciacion) * 100;

                                return (
                                    <div key={i} className="flex items-center gap-4">

                                        <div className="w-12 text-sm text-gray-500">
                                            {item.year}
                                        </div>

                                        <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
                                                style={{ width: `${porcentaje}%` }}
                                            />
                                        </div>

                                        <div className="w-24 text-right text-sm text-gray-400">
                                            {formatCurrency(item.value, moneda.codiso)}
                                        </div>

                                    </div>
                                );

                            })
                        }
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
                        {
                            evolucionValorLibros.map((item, i) => {

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
                                            {formatCurrency(item.value, moneda.codiso)}
                                        </div>

                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </div>

            {/* Tabla completa */}
            <div className="w-full">
                <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="text-sm font-medium text-gray-600 uppercase">Tabla Completa</p>

                    <button
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                        onClick={handleCrearDepreciacion}
                    >
                        <i className="bi bi-file-plus"></i>
                        Crear Depreciación
                    </button>
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
                                {renderBody()}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* <Paginacion
                    ref={refPaginacion}
                    loading={loading}
                    data={lista}
                    totalPaginacion={lista.length}
                    paginacion={1}
                    fillTable={() => { }}
                    restart={false}
                    theme="modern"
                    className={"md:px-4 py-3 bg-white border-t border-gray-200 overflow-auto"}
                /> */}
            </div>
        </ContainerWrapper>
    );
};

export default DepreciacionDetalle;