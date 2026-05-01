import Image from "@/components/Image";
import Paginacion from "@/components/Paginacion";
import SearchInput from "@/components/SearchInput";
import { SpinnerView } from "@/components/Spinner";
import Title from "@/components/Title";
import ContainerWrapper from "@/components/ui/container-wrapper";
import { CANCELED } from "@/constants/requestStatus";
import { images } from "@/helper";
import { formatCurrency, isEmpty } from "@/helper/utils.helper";
import SuccessResponse from "@/model/class/response";
import { KardexListDepreciacionInterface } from "@/model/ts/interface/kardex";
import { ProductFilterInterface } from "@/model/ts/interface/product";
import { metodoDepreciacionMap } from "@/model/types/metodo-depreciacion";
import { TIPO_PRODUCTO_NORMAL, TIPO_PRODUCTO_SERVICIO, TIPO_PRODUCTO_LOTE, TIPO_PRODUCTO_ACTIVO_FIJO, tipoProductoMap } from "@/model/types/tipo-producto";
import { listarDepreciacionKardex, optionsAlmacen } from "@/network/rest/api-client";
import { filtrarProducto } from "@/network/rest/principal.network";
import { setActivoDepreciacionState } from "@/redux/activo/depreciacionSlice";
import { useAppSelector } from "@/redux/hooks";
import { alertKit } from "alert-kit";
import React, { useEffect, useRef } from "react";
import { BsDatabaseSlash, BsEye } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

const Depreciaciones = () => {
    // =============================
    // REDUX
    // =============================

    const state = useAppSelector((state) => state.activoDepreciacion);
    const token = useAppSelector((state) => state.principal);
    const moneda = useAppSelector((state) => state.predeterminado.moneda);

    const dispatch = useDispatch();

    // =============================
    // ROUTER
    // =============================

    const history = useHistory();

    // =============================
    // STATE
    // =============================


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
    const abortControllerDetalle = useRef<AbortController | null>(null);

    // =============================
    // API
    // =============================

    // Obtiene los almacenes disponibles
    const fetchAlmacen = async () => {
        abortControllerAlmacen.current = new AbortController();

        const { success, data, message, type } = await optionsAlmacen(token.project.idSucursal, abortControllerAlmacen.current.signal);

        if (!success) {
            if (type === CANCELED) return;

            alertKit.warning({
                title: "Depreciar",
                message: message,
            });
            return;
        }

        abortControllerAlmacen.current = null;
        dispatch(setActivoDepreciacionState({
            almacenes: data
        }));
    };

    // Obtiene los movimientos de depreciación
    const fetchDetail = async () => {
        abortControllerDetalle.current?.abort();

        abortControllerDetalle.current = new AbortController();

        dispatch(setActivoDepreciacionState({
            loading: true,
            msgLoading: "Cargando datos de depreciación..."
        }));

        const body = {
            opcion: state.opcion,
            idProducto: state.producto?.idProducto,
            idAlmacen: state.idAlmacen,
            posicionPagina: (state.paginacion - 1) * state.filasPorPagina,
            filasPorPagina: state.filasPorPagina,
        };

        const { success, data, message, type } = await listarDepreciacionKardex(body, abortControllerDetalle.current.signal);

        if (!success) {
            if (type === CANCELED) return;

            abortControllerDetalle.current = null;
            alertKit.warning({
                title: "Depreciar",
                message: message,
            });

            dispatch(setActivoDepreciacionState({
                loading: false
            }));
            return;
        }

        const total = Math.ceil(Number(data.total) / state.filasPorPagina);

        abortControllerDetalle.current = null;
        dispatch(setActivoDepreciacionState({
            totalPaginacion: total,
            lista: data.result,
            loading: false
        }));
    };

    // =============================
    // EFFECTS
    // =============================

    useEffect(() => {
        const buscar = state.buscar;
        const pagState = state.paginacionState;

        if (pagState && refPaginacion.current) {
            refPaginacion.current.setBounds(pagState);
        }

        if (buscar && refProducto.current) {
            refProducto.current.initialize(buscar);
        }

        if (!state.lista?.length) {
            loadAll();
        }

        return () => {
            abortControllerAlmacen.current?.abort();
            abortControllerDetalle.current?.abort();
        };
    }, []);

    useEffect(() => {
        if (!state.producto || !state.idAlmacen) return;

        fetchDetail();

    }, [state.producto, state.paginacion, state.idAlmacen]);

    // =============================
    // FLOWS
    // =============================

    const loadAll = async () => {
        dispatch(setActivoDepreciacionState({
            loading: true,
            msgLoading: "Cargando datos de depreciación..."
        }));

        await fetchAlmacen();

        dispatch(setActivoDepreciacionState({
            loading: false
        }));
    };


    // =============================
    // HANDLERS
    // =============================

    // Evento para cambiar la paginación
    const handleFillTable = (page: number) => {
        dispatch(setActivoDepreciacionState({
            paginacion: page,
            restart: false
        }));
    };

    // Evento completo para filtrar el producto
    const handleClearInputProducto = () => {
        dispatch(setActivoDepreciacionState({
            producto: null,
            productos: [],
            lista: [],
            paginacion: 1
        }));
    };

    const handleFilterProducto = async (text: string) => {
        dispatch(setActivoDepreciacionState({
            buscar: text,
            producto: null
        }));

        if (isEmpty(text)) {
            dispatch(setActivoDepreciacionState({
                productos: []
            }));
            return;
        }

        const params = {
            filtrar: text
        };

        const response = await filtrarProducto(params);

        if (response instanceof SuccessResponse) {
            const productosFiltrados = response.data.filter((item: ProductFilterInterface) => item.idTipoProducto === TIPO_PRODUCTO_ACTIVO_FIJO);

            dispatch(setActivoDepreciacionState({
                buscar: text,
                productos: productosFiltrados
            }));
        }
    };

    const handleSelectItemProducto = (producto: ProductFilterInterface) => {
        if (isEmpty(state.idAlmacen)) {
            alertKit.warning({
                title: "Depreciar",
                message: "Seleccione un almacén.",
                onClose: () => refIdAlmacen.current?.focus(),
            });
            return;
        }

        refProducto.current.initialize(producto.nombre);
        dispatch(setActivoDepreciacionState({
            buscar: producto.nombre,
            producto: producto,
            productos: []
        }));
    };

    // Evento para seleccionar el almacén
    const handleSelectAlmacen = (event: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setActivoDepreciacionState({
            idAlmacen: event.target.value
        }));
    };

    // Evento para ir al detalle de depreciación del producto seleccionado
    const handleGoDetail = (item: KardexListDepreciacionInterface) => {
        history.push({
            pathname: `${history.location.pathname}/detalle`,
            state: { idProducto: item.idProducto, idAlmacen: state.idAlmacen, serie: item.serie }
        });
    };

    // =============================
    // RENDER HELPERS
    // =============================

    const renderBody = () => {
        if (isEmpty(state.lista)) {
            return (
                <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                            <BsDatabaseSlash className="w-12 h-12 text-gray-400" />
                            <p className="mt-2 text-sm font-medium text-gray-900">No hay datos para mostrar</p>
                            <p className="mt-1 text-sm text-gray-500">Intenta cambiar los filtros</p>
                        </div>
                    </td>
                </tr>
            );
        }

        return state.lista.map((item, index) => (
            <tr key={index}>
                <td className="px-6 py-4 text-sm text-gray-900">{item.serie}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.fecha}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.cantidad}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.ubicacion}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(item.costo, moneda.codiso)}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(item.depreciacionAcumuladaHoy, moneda.codiso)}</td>
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
                loading={state.loading}
                message={state.msgLoading}
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
                        <label className="block text-sm text-gray-700 mb-2">
                            Filtrar los productos por código o nombre:
                        </label>
                        <SearchInput
                            ref={refProducto}
                            autoFocus={true}
                            placeholder="Filtrar productos..."
                            refValue={refValueProducto}
                            data={state.productos}
                            handleClearInput={handleClearInputProducto}
                            handleFilter={handleFilterProducto}
                            handleSelectItem={handleSelectItemProducto}
                            renderItem={(value: any) => (
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
                        <label className="block text-sm text-gray-700 mb-2">
                            Almacén
                        </label>
                        <select
                            className="w-full text-sm px-3 py-2 h-10 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            ref={refIdAlmacen}
                            value={state.idAlmacen}
                            onChange={handleSelectAlmacen}
                        >
                            <option value="">Seleccione un almacén</option>
                            {
                                state.almacenes.map((item, index) => {
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

            {/* Información del producto */}
            <div className="max-w-7xl mx-auto mb-3">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                    {/* Información del producto */}
                    <div className="lg:col-span-3 rounded border p-6 gap-3">
                        <div className="flex items-center justify-between mb-3">
                            <h5 className="text-base text-gray-900">
                                Información del Producto
                            </h5>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-gray-600">
                                <strong className="text-gray-900">Código:</strong> {state.producto && state.producto.codigo}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong className="text-gray-900">Nombre:</strong> {state.producto && state.producto.nombre}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong className="text-gray-900">Tipo de producto:</strong> {state.producto && tipoProductoMap.get(state.producto.idTipoProducto).label}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong className="text-gray-900">Cantidad:</strong> -
                            </p>
                            <div className="text-sm text-gray-600">
                                <strong className="text-gray-900">Metodo de depreciación:</strong>
                                <p>{state.producto && metodoDepreciacionMap.get(state.producto.idMetodoDepreciacion).title}</p>
                                <p>{state.producto && metodoDepreciacionMap.get(state.producto.idMetodoDepreciacion).detail}</p>
                            </div>
                        </div>
                    </div>

                    {/*  Imagen del producto */}
                    <div className="rounded border p-6 flex items-center justify-center">
                        <Image
                            default={images.noImage}
                            src={(state.producto && state.producto.imagen) || null}
                            alt={(state.producto && state.producto.nombre) || 'Producto sin imagen'}
                            overrideClass="w-40 h-40 object-contain"
                        />
                    </div>
                </div>
            </div>

            {/* Tabla de movimientos */}
            <div className="rounded border border-gray-200 overflow-hidden">
                {/* Encabezado de la tabla */}
                <div className="p-3 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-base text-gray-900">Tabla de Depreciación</h2>
                    </div>
                </div>

                {/* Contenedor de la tabla con scroll horizontal */}
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
                    loading={state.loading}
                    data={state.lista}
                    totalPaginacion={state.totalPaginacion}
                    paginacion={state.paginacion}
                    fillTable={handleFillTable}
                    restart={state.restart}
                    theme="modern"
                    className="md:px-4 py-3 bg-white border-t border-gray-200"
                />
            </div>
        </ContainerWrapper>
    );
};

export default Depreciaciones;