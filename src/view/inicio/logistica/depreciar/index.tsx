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
import { listarDepreciacionKardex, optionsAlmacen } from "@/network/rest/api-client";
import { filtrarProducto } from "@/network/rest/principal.network";
import { useAppSelector } from "@/redux/hooks";
import { alertKit } from "alert-kit";
import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { BsDatabaseSlash, BsEye } from "react-icons/bs";
import { cn } from "@/lib/utils";
import Paginacion from "@/components/Paginacion";
import { ACTIVO_FIJO, tipoProductoMap } from "@/model/types/tipo-producto";
import { metodoDepreciacionMap } from "@/model/types/metodo-depreciacion";
import { KardexListDepreciacionInterface } from "@/model/ts/interface/kardex";

const Depreciar = () => {
    // =============================
    // REDUX
    // =============================

    const token = useAppSelector((state) => state.principal);
    const moneda = useAppSelector((state) => state.predeterminado.moneda);

    // =============================
    // ROUTER
    // =============================

    const history = useHistory();

    // =============================
    // STATE
    // =============================

    const [loading, setLoading] = useState(false);
    const [msgLoading, setMsgLoading] = useState('Cargando información...');

    // filtros
    const [producto, setProducto] = useState<ProductoFilterInterface>(null);
    const [productos, setProductos] = useState<ProductoFilterInterface[]>([]);

    const [idAlmacen, setIdAlmacen] = useState('');
    const [almacenes, setAlmacenes] = useState<WarehouseOptionsInterface[]>([]);

    // tabla
    const [lista, setLista] = useState<KardexListDepreciacionInterface[]>([]);

    // paginación
    const [paginacion, setPaginacion] = useState(1);
    const [totalPaginacion, setTotalPaginacion] = useState(0);
    const [filasPorPagina] = useState(3);

    const [restart, setRestart] = useState(false);

    // =============================
    // REFS
    // =============================

    const refProducto = useRef<SearchInput>(null);
    const refValueProducto = useRef<HTMLInputElement>(null);
    const refIdAlmacen = useRef<HTMLSelectElement>(null);
    const refPaginacion = useRef<Paginacion>(null);

    // =============================
    // CONTROLLERS
    // =============================

    const abortControllerAlmacen = useRef<AbortController | null>(null);

    // =============================
    // API
    // =============================

    const loadAlmacen = async () => {

        abortControllerAlmacen.current = new AbortController();

        const { success, data, message, type } =
            await optionsAlmacen(
                token.project.idSucursal,
                abortControllerAlmacen.current.signal
            );

        if (!success) {

            if (type === CANCELED) return;

            alertKit.warning({
                title: "Depreciar",
                message: message,
            });

            return;
        }

        abortControllerAlmacen.current = null;

        setAlmacenes(data);
    };

    const loadAll = async () => {

        setLoading(true);

        await loadAlmacen();

        setLoading(false);
    };

    const loadDetail = async () => {

        setLoading(true);
        setMsgLoading("Cargando datos de depreciación...");

        const body = {
            idProducto: producto.idProducto,
            idAlmacen: idAlmacen,
            posicionPagina: (paginacion - 1) * filasPorPagina,
            filasPorPagina: filasPorPagina,
        };

        const { success, data, message } = await listarDepreciacionKardex(body);

        if (!success) {

            alertKit.warning({
                title: "Depreciar",
                message: message,
            });

            setLoading(false);
            return;
        }

        const total = Math.ceil(Number(data.total) / filasPorPagina);

        setTotalPaginacion(total);
        setLista(data.result);

        setLoading(false);
    };

    // =============================
    // EFFECTS
    // =============================

    useEffect(() => {

        loadAll();

        return () => {
            abortControllerAlmacen.current?.abort();
        };

    }, []);

    useEffect(() => {

        if (!producto || !idAlmacen) return;

        loadDetail();

    }, [producto, paginacion, idAlmacen]);

    // =============================
    // HANDLERS
    // =============================

    const fillTable = (page: number) => {

        setPaginacion(page);
        setRestart(false);
    };

    const handleClearInputProducto = () => {

        setProducto(null);
        setProductos([]);

        setLista([]);
        setPaginacion(1);
    };

    const handleFilterProducto = async (text: string) => {

        const searchWord = text;

        setProducto(null);

        if (isEmpty(searchWord)) {

            setProductos([]);
            return;
        }

        const params = { filtrar: searchWord };

        const response = await filtrarProducto(params);

        if (response instanceof SuccessResponse) {

            setProductos(
                response.data.filter(
                    (item: ProductoFilterInterface) =>
                        item.idTipoProducto === ACTIVO_FIJO
                )
            );
        }
    };

    const handleSelectItemProducto = (producto: ProductoFilterInterface) => {

        if (isEmpty(idAlmacen)) {

            alertKit.warning({
                title: "Depreciar",
                message: "Seleccione un almacén.",
                onClose: () => refIdAlmacen.current?.focus(),
            });

            return;
        }

        refProducto.current.initialize(producto.nombre);

        setProducto(producto);
        setProductos([]);
    };

    const handleSelectAlmacen = (event: React.ChangeEvent<HTMLSelectElement>) => {

        setIdAlmacen(event.target.value);
    };

    const handleGoDetail = (item) => {
        history.push({
            pathname: `${history.location.pathname}/detalle`,
            state: { idProducto: item.idProducto, idAlmacen: idAlmacen, serie: item.serie }
        });
    };

    // =============================
    // RENDER HELPERS
    // =============================

    const renderBody = () => {
        if (isEmpty(lista)) {
            return (<tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                        <BsDatabaseSlash className="w-12 h-12 text-gray-400" />
                        <p className="mt-2 text-sm font-medium text-gray-900">No hay datos para mostrar</p>
                        <p className="mt-1 text-sm text-gray-500">Intenta cambiar los filtros</p>
                    </div>
                </td>
            </tr>);
        }

        return lista.map((item, index) => (
            <tr key={index}>
                <td className="px-6 py-4 text-sm text-gray-900">{item.serie}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.fecha}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.cantidad}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.ubicacion}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(item.costo, moneda.codiso)}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(0, moneda.codiso)}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.vidaUtil} años</td>
                <td className="px-6 py-4 text-sm text-gray-900 text-center">
                    <button
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                        onClick={() => handleGoDetail(item)}
                    >
                        <BsEye className="h-5 w-5 text-blue-500" />
                    </button>
                </td>
            </tr>
        ));
    }

    // =============================
    // RENDER
    // =============================

    return (
        <ContainerWrapper>
            <SpinnerView
                loading={loading}
                message={msgLoading}
            />

            <Title
                title="Depreciar"
                subTitle="Lista de Depreciación"
                handleGoBack={() => history.goBack()}
            />

            <div className="flex flex-col gap-y-4 mb-4">
                <div>
                    <p className="text-gray-600 mt-1">
                        Puedes ver los activos fijos y su depreciación filtrando.
                    </p>
                </div>
            </div>

            {/* Filtros principales (estilo moderno) */}
            <div className="max-w-7xl mx-auto mb-3">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                    <div className="lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filtrar los productos por código o nombre:
                        </label>
                        <SearchInput
                            ref={refProducto}
                            autoFocus={true}
                            placeholder="Filtrar productos..."
                            refValue={refValueProducto}
                            data={productos}
                            handleClearInput={handleClearInputProducto}
                            handleFilter={handleFilterProducto}
                            handleSelectItem={handleSelectItemProducto}
                            renderItem={(value) => (
                                <div className="flex items-center">
                                    <Image
                                        default={images.noImage}
                                        src={value.imagen}
                                        alt={value.nombre}
                                        overrideClass="w-16 h-16 object-contain"
                                    />
                                    <div className="ml-2">
                                        <p className="text-xs font-bold">{value.codigo}</p>
                                        <p className="text-sm">{value.nombre}</p>
                                    </div>
                                </div>
                            )}
                            classNameContainer="w-full relative group"
                            theme="modern"
                        />
                    </div>

                    <div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Almacén
                            </label>
                            <select
                                className="w-full text-sm px-3 py-2 h-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                ref={refIdAlmacen}
                                value={idAlmacen}
                                onChange={handleSelectAlmacen}
                            >
                                <option value="">Seleccione un almacén</option>
                                {
                                    almacenes.map((item, index) => {
                                        return (
                                            <option key={index} value={item.idAlmacen}>
                                                {item.nombre}
                                            </option>
                                        );
                                    })
                                }
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Información del producto */}
            <div className="max-w-7xl mx-auto mb-3">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
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
                                <strong className="text-gray-900">Cantidad:</strong> -
                            </p>
                            <div className="text-sm text-gray-600">
                                <strong className="text-gray-900">Metodo de depreciación:</strong>
                                <p>{producto && metodoDepreciacionMap.get(producto.idMetodoDepreciacion).title}</p>
                                <p>{producto && metodoDepreciacionMap.get(producto.idMetodoDepreciacion).detail}</p>
                            </div>
                        </div>
                    </div>

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

            {/* Tabla completa */}
            <div className="w-full">
                <div className="flex items-center gap-3 mb-3">
                    <p className="text-sm font-medium text-gray-600 uppercase">Tabla de Depreciación</p>
                </div>

                <div className="w-full bg-white rounded border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            {/* Encabezado de la tabla */}
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                                        Serie
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                                        Fecha Adquisición
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                                        Cantidad
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                                        Ubicación
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                                        Costo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                                        Dep. Acum.
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                                        Vida Útil
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">
                                        Acción
                                    </th>
                                </tr>
                            </thead>

                            {/* Cuerpo de la tabla */}
                            <tbody className="bg-white divide-y divide-gray-200">
                                <React.Fragment>
                                    {renderBody()}
                                </React.Fragment>
                            </tbody>
                        </table>
                    </div>

                    <Paginacion
                        ref={refPaginacion}
                        loading={loading}
                        data={lista}
                        totalPaginacion={totalPaginacion}
                        paginacion={paginacion}
                        fillTable={fillTable}
                        restart={restart}
                        theme="modern"
                        className="md:px-4 py-3 bg-white border-t border-gray-200"
                    />
                </div>
            </div>
        </ContainerWrapper>
    );
};

export default Depreciar;
