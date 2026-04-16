import React, { useEffect, useRef } from "react";
import Image from "@/components/Image";
import Paginacion from "@/components/Paginacion";
import Search from "@/components/Search";
import { SpinnerView } from "@/components/Spinner";
import Title from "@/components/Title";
import ContainerWrapper from "@/components/ui/container-wrapper";
import { CANCELED } from "@/constants/requestStatus";
import { images } from "@/helper";
import { formatCurrency, getNumber, isEmpty, rounded } from "@/helper/utils.helper";
import { cn } from "@/lib/utils";
import { listarBienKardex, metricasDepreciacionKardex, optionsAlmacen } from "@/network/rest/api-client";
import { setActivoBienState } from "@/redux/activo/bienSlice";
import { useAppSelector } from "@/redux/hooks";
import { alertKit } from "alert-kit";
import { AlertTriangle, Barcode, CheckCircle, ChevronDown, ChevronUp, PackagePlus, Plus } from "lucide-react";
import { FaBalanceScale, FaBuilding, FaChartLine, FaMoneyBillWave } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import ModalStock from "@/components/view/producto/ModalStock";
import pdfVisualizer from "pdf-visualizer";
import { documentsPdfCodbarProducto } from "@/network/rest/principal.network";

const Bienes = () => {
  // =============================
  // REDUX
  // =============================

  const state = useAppSelector((state) => state.activoBien);
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

  const refIdAlmacen = useRef<HTMLSelectElement>(null);
  const refSearch = useRef<Search>(null);
  const refPaginacion = useRef<Paginacion>(null);
  const refModalStock = useRef<ModalStock>(null);

  // =============================
  // CONTROLLERS
  // =============================

  const abortControllerAlmacen = useRef<AbortController | null>(null);
  const abortControllerMetrics = useRef<AbortController | null>(null);
  const abortControllerTable = useRef<AbortController | null>(null);

  // =============================
  // API
  // =============================

  const loadAlmacen = async () => {
    abortControllerAlmacen.current?.abort();
    abortControllerAlmacen.current = new AbortController();

    dispatch(setActivoBienState({
      loading: true,
      msgLoading: "Cargando datos de depreciación..."
    }));

    const { success, data, message, type } = await optionsAlmacen(token.project.idSucursal, abortControllerAlmacen.current.signal);

    if (!success) {
      if (type === CANCELED) return;

      abortControllerAlmacen.current = null;
      alertKit.warning({
        title: "Depreciar",
        message: message,
      });
      return;
    }

    const idAlmacen = data.find((item) => item.predefinido === 1)?.idAlmacen ?? '';
    abortControllerAlmacen.current = null;
    dispatch(setActivoBienState({
      almacenes: data,
      idAlmacen: idAlmacen,
      loading: false,
    }));
  };

  const loadMetrics = async () => {
    abortControllerMetrics.current?.abort();
    abortControllerMetrics.current = new AbortController();

    const params = {
      idAlmacen: state.idAlmacen,
    };

    const { success, data, message, type } = await metricasDepreciacionKardex(params, abortControllerMetrics.current.signal);

    if (!success) {
      if (type === CANCELED) return;

      abortControllerMetrics.current = null;
      alertKit.warning({
        title: "Depreciar",
        message: message,
      });
      return;
    }

    abortControllerMetrics.current = null;

    dispatch(setActivoBienState({
      metricas: data,
    }));
  };

  const fillTable = async () => {
    abortControllerTable.current?.abort();
    abortControllerTable.current = new AbortController();

    dispatch(setActivoBienState({
      loading: true,
      lista: [],
      messageTable: "Cargando información...",
    }));

    const params = {
      opcion: state.opcion,
      buscar: state.buscar.trim(),
      idAlmacen: state.idAlmacen,
      posicionPagina: (state.paginacion - 1) * state.filasPorPagina,
      filasPorPagina: state.filasPorPagina
    }

    const { success, data, message, type } = await listarBienKardex(params, abortControllerTable.current.signal);

    if (!success) {
      if (type === CANCELED) return;

      abortControllerTable.current = null;
      dispatch(setActivoBienState({
        loading: false,
        lista: [],
        totalPaginacion: 0,
        messageTable: message,
      }));
      return;
    }

    const totalPaginacion = parseInt(String(Math.ceil(Number(data.total) / state.filasPorPagina)));
    abortControllerTable.current = null;

    dispatch(setActivoBienState({
      lista: data.result,
      totalPaginacion,
      loading: false,
    }));
  }

  // =============================
  // EFFECTS
  // =============================

  useEffect(() => {
    const buscar = state.buscar;
    const pagState = state.paginacionState;

    if (pagState && refPaginacion.current && state.didMount) {
      refPaginacion.current.setBounds(pagState);
    }

    if (buscar && refSearch.current && state.didMount) {
      refSearch.current.initialize(buscar);
    }

    if (!state.didMount) {
      dispatch(setActivoBienState({
        didMount: true
      }));
    }

    return () => {
      abortControllerAlmacen.current?.abort();
      abortControllerMetrics.current?.abort();
      abortControllerTable.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!state.didMount) return;

      loadAlmacen();
  }, [state.didMount]);

  useEffect(() => {
    if (!state.idAlmacen) return;

    loadMetrics();
  }, [state.idAlmacen]);

  useEffect(() => {
    if (!state.idAlmacen) return;

    if (!state.didMount) return;

    fillTable();
  }, [state.didMount, state.idAlmacen, state.fechaInicio, state.fechaFinal, state.opcion, state.buscar, state.paginacion]);

  // =============================
  // FLOWS
  // =============================

  const loadInit = async () => {
    if (state.loading) return;

    dispatch(setActivoBienState({
      opcion: 0,
      paginacion: 1,
      restart: true,
    }));
  };

  // =============================
  // HANDLERS
  // =============================

  // Eventos para filtrar el producto
  const handleSearchText = async (text: string) => {
    if (state.loading) return;

    if (text.trim().length === 0) return;

    dispatch(setActivoBienState({
      opcion: 1,
      buscar: text,
      paginacion: 1,
      restart: true,
    }));
  }

  const handlePaginacion = (page: number) => {
    dispatch(setActivoBienState({
      paginacion: page,
      restart: false
    }));
  };

  // Modal de stock
  const handleOpenModalStock = async (producto: any) => {
    dispatch(setActivoBienState({
      isOpenStock: true,
    }));
    await refModalStock.current.loadDatos(producto);
  };

  const handleCloseStock = async () => {
    dispatch(setActivoBienState({
      isOpenStock: false,
    }));
  };

  // Eventos para abrir modal de codigo de barras
  const handleOpenPrinterCodBar = async (idProducto) => {
    await pdfVisualizer.init({
      url: documentsPdfCodbarProducto(),
      title: "Lista de productos - Código de Barras",
      titlePageNumber: 'Página',
      titleLoading: 'Cargando...',
    });
  };

  // Cambiar vista
  const handleChangeView = (value: string) => {
    dispatch(setActivoBienState({
      vista: value,
    }));
  };

  // Eventos de fecha de inicio
  const handleInputFechaInicio = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setActivoBienState({
      fechaInicio: event.target.value,
    }));
  };

  // Eventos de fecha final
  const handleInputFechaFinal = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setActivoBienState({
      fechaFinal: event.target.value
    }));
  };

  // Eventos de idAlmacen
  const handleSelectIdAlmacen = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setActivoBienState({
      idAlmacen: event.target.value
    }));
  };

  // =============================
  // RENDER HELPERS
  // =============================

  const determinarEstadoInventario = (item) => {
    const { cantidad, cantidadMinima, cantidadMaxima } = item;
    if (cantidad < cantidadMinima) {
      return {
        estado: "Crítico",
        clase: "bg-red-600 text-white",
        icono: AlertTriangle,
      };
    } else if (cantidad > cantidadMaxima) {
      return {
        estado: "Exceso",
        clase: "bg-blue-600 text-white",
        icono: PackagePlus,
      };
    } else {
      return {
        estado: "Óptimo",
        clase: "bg-green-500 text-white",
        icono: CheckCircle,
      };
    }
  };

  const toggleLotesVisibility = (index) => {
    dispatch(setActivoBienState({
      inventarioDetallesVisible: {
        ...state.inventarioDetallesVisible,
        [index]: !state.inventarioDetallesVisible?.[index],
      },
    }));
  };

  const renderTable = () => {
    if (state.loading) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-12 text-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-gray-500">{state.messageTable}</p>
            </div>
          </td>
        </tr>
      );
    }

    if (isEmpty(state.lista)) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-12 text-center">
            <div className="text-gray-500">
              <i className="bi bi-box text-4xl mb-3 block"></i>
              <p className="text-lg font-medium">No se encontraron ventas</p>
              <p className="text-sm">Intenta cambiar los filtros</p>
            </div>
          </td>
        </tr>
      );
    }

    return state.lista.map((item, index) => {
      const estadoInventario = determinarEstadoInventario(item);
      const tieneInventarioDetalles = item.inventarioDetalles && item.inventarioDetalles.length > 0;

      return (
        <React.Fragment key={`producto-${item.idInventario}`}>
          <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center">
                <Image
                  default={images.noImage}
                  src={item.imagen}
                  alt={item.producto}
                  overrideClass="w-20 h-20 object-contain border border-solid border-[#e2e8f0] rounded"
                />
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {item.producto}
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.codigo}
                  </div>
                  {tieneInventarioDetalles && (
                    <div className="flex items-center mt-1">
                      <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {item.inventarioDetalles.length} serie(s)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="text-sm text-gray-900">
                {item.categoria}
              </div>
            </td>
            <td className="px-6 py-4">
              <div>
                <div className={`text-sm font-medium ${getNumber(item.cantidad) <= 0 ? 'text-red-500' : 'text-gray-900'} `}>
                  {rounded(item.cantidad)} {item.medida}
                </div>
                <div className="text-xs text-gray-500">
                  Min: {item.cantidadMinima} | Max: {item.cantidadMaxima}
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="text-sm font-medium text-gray-900">
                {formatCurrency(item.costo, moneda.codiso)}
              </div>
            </td>
            <td className="px-6 py-4">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoInventario.clase}`}
              >
                <estadoInventario.icono className="h-3 w-3 mr-1" />
                {estadoInventario.estado}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex justify-center space-x-2">
                <button
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                  onClick={() => handleOpenModalStock(item)}
                >
                  <Plus className="h-5 w-5" />
                </button>
                <button
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  <Barcode className="h-5 w-5" />
                </button>
                {tieneInventarioDetalles && (
                  <button
                    onClick={() => toggleLotesVisibility(index)}
                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    {state.inventarioDetallesVisible[index] ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                )}
              </div>
            </td>
          </tr>

          {/* Lotes rows */}
          {
            tieneInventarioDetalles && state.inventarioDetallesVisible[index] && (
              <tr>
                <td colSpan={6} className="px-0 py-0 bg-gray-50">
                  <div className="rounded p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Detalles del producto
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {
                        item.inventarioDetalles.map((inventarioDetalle, inventarioDetalleIndex) => {
                          return (
                            <div
                              key={inventarioDetalle.idKardex}
                              className="bg-white rounded p-4 border"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="text-sm font-medium text-gray-900">
                                  {inventarioDetalleIndex + 1}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="text-sm">
                                  <span className="text-gray-500">Serie: </span>
                                  <span className="font-medium">{inventarioDetalle.serie || "N/A"}</span>
                                </div>

                                <div className="text-sm">
                                  <span className="text-gray-500">Vida útil: </span>
                                  <span className="font-medium">{inventarioDetalle.vidaUtil || "N/A"}</span>
                                </div>

                                <div className="text-sm">
                                  <span className="text-gray-500">Valor residual: </span>
                                  <span
                                    className={cn(
                                      "font-medium",
                                      "text-gray-900"
                                    )}
                                  >
                                    {inventarioDetalle.valorResidual || 0}
                                  </span>
                                </div>

                                <div className="text-sm">
                                  <span className="text-gray-500">Cantidad: </span>
                                  <span className="font-medium">{inventarioDetalle.cantidad} {item.medida}</span>
                                </div>

                                <div className="text-sm">
                                  <span className="text-gray-500">Ubicación: </span>
                                  <span className="font-medium">{inventarioDetalle.ubicacion || "N/A"}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>
                </td>
              </tr>
            )
          }
        </React.Fragment>
      );
    });
  }

  const renderCuadricula = () => {
    if (state.loading) {
      return (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-gray-500">{state.messageTable}</p>
        </div>
      );
    }

    if (isEmpty(state.lista)) {
      return (
        <div className="text-center py-16 rounded border text-gray-500">
          <i className="bi bi-box text-4xl mb-3 block"></i>
          <p className="text-lg font-medium">No se encontraron ventas</p>
          <p className="text-sm">Intenta cambiar los filtros</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
        {
          state.lista.map((item, index) => {
            const estadoInventario = determinarEstadoInventario(item);
            const tieneInventarioDetalles = item.inventarioDetalles && item.inventarioDetalles.length > 0;

            return (
              <div
                key={`producto-grid-${item.idInventario}`}
                className="bg-white rounded border flex flex-col h-full"
              >
                <div className="flex flex-col gap-2 p-4">
                  {/* BODY */}
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex justify-between items-start mb-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${estadoInventario.clase}`}
                      >
                        <estadoInventario.icono className="h-3 w-3 mr-1" />
                        {estadoInventario.estado}
                      </span>
                    </div>

                    <Image
                      default={images.noImage}
                      src={item.imagen}
                      alt={item.producto}
                      overrideClass="mb-3 w-full h-40 object-contain"
                    />

                    <h5 className="font-semibold text-gray-900 line-clamp-2 leading-tight text-base mb-1">
                      {item.producto}
                    </h5>

                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Código:</span> {item.codigo}
                    </div>

                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Categoría:</span> {item.categoria}
                    </div>

                    <div className="text-sm text-gray-900 mb-1">
                      <div className="flex gap-2">
                        <span className="font-medium">Stock:</span>
                        <span className={`${getNumber(item.cantidad) <= 0 ? 'text-red-500' : 'text-gray-900'} `}>
                          {rounded(item.cantidad)} <small>{item.medida}</small>
                        </span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-900 mb-1">
                      <div className="text-sm text-gray-500">
                        Min: {item.cantidadMinima} | Max: {item.cantidadMaxima}
                      </div>
                    </div>

                    <div className="text-base font-bold text-gray-900 mb-3">
                      {formatCurrency(item.costo, moneda.codiso)}
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="flex items-center flex-col justify-between gap-2 pt-3 border-t border-gray-100">
                    <div>
                      <button
                        className="flex-1 p-2 text-indigo-600 hover:bg-indigo-50 rounded-md text-sm font-medium transition"
                        onClick={() => handleOpenModalStock(item)}
                        title="Agregar stock"
                      >
                        <Plus className="h-4 w-4 inline mr-1" /> Stock
                      </button>

                      <button
                        className="flex-1 p-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm font-medium transition"
                        onClick={() => handleOpenPrinterCodBar(item.idProducto)}
                        title="Código de barras"
                      >
                        <Barcode className="h-4 w-4 inline mr-1" /> Código
                      </button>

                      {tieneInventarioDetalles && (
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm font-medium transition"
                          onClick={() => toggleLotesVisibility(index)}
                          title="Ver lotes"
                        >
                          {state.inventarioDetallesVisible[index] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Lotes expandidos */}
                    {tieneInventarioDetalles && state.inventarioDetallesVisible[index] && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h6 className="text-xs font-medium text-gray-900 mb-2">Lotes</h6>
                        <div className="space-y-3">
                          {item.inventarioDetalles.map((inventarioDetalle, inventarioDetalleIndex) => {
                            return (
                              <div key={inventarioDetalle.idKardex} className="text-xs bg-gray-50 p-2 rounded">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-medium">{inventarioDetalleIndex + 1}</span>
                                </div>
                                <div>Serie: {inventarioDetalle.serie}</div>
                                <div>Vida útil: {inventarioDetalle.vidaUtil}</div>
                                <div>Ubic.: {inventarioDetalle.ubicacion}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        }
      </div>
    );
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

      {/* Encabezado */}
      <Title
        title="Bienes"
        subTitle="LISTA"
        handleGoBack={() => history.goBack()}
      />

      {/* Modal de stock */}
      <ModalStock
        ref={refModalStock}
        isOpen={state.isOpenStock}
        onClose={handleCloseStock}
        handleSave={loadInit}
      />

      {/* Acciones principales + Toggle vista */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <button
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2",
              "bg-blue-600 text-white text-sm font-medium rounded",
              "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition",
            )}
            aria-label="Crear nueva venta"
          >
            <i className="bi bi-file-plus"></i>
            Nuevo Registro
          </button>
          <button
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2",
              "bg-gray-200 text-gray-700 text-sm font-medium rounded",
              "hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition",
            )}
            onClick={loadInit}
          >
            <i className="bi bi-arrow-clockwise"></i>
            Recargar Vista
          </button>
        </div>

        {/* Toggle vista */}
        <div className="flex bg-gray-100 rounded p-1 gap-1">
          <button
            className={
              cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-1",
                "text-sm font-medium",
                "px-4 py-2",
                "rounded-md transition ",
                state.vista === "tabla" ? "bg-white text-blue-600" : "text-gray-600 hover:text-gray-800",
              )
            }
            onClick={handleChangeView.bind(this, "tabla")}
          >
            <i className="bi bi-list-ul"></i>
            <span className="hidden sm:inline">Tabla</span>
          </button>
          <button
            className={
              cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-1",
                "text-sm font-medium",
                "px-4 py-2",
                "rounded-md transition ",
                state.vista === "cuadricula" ? "bg-white text-blue-600" : "text-gray-600 hover:text-gray-800",
              )
            }
            onClick={handleChangeView.bind(this, "cuadricula")}
          >
            <i className="bi bi-grid-3x3"></i>
            <span className="hidden sm:inline">Cuadrícula</span>
          </button>
        </div>
      </div>

      {/* Filtros de fechas, comprobante y estado */}
      <div className="flex flex-col gap-y-4 mb-4">
        <div>
          <p className="text-gray-600 mt-1">
            Puedes ver las ventas echas con diferentes filtros, por ejemplo: fechas de emisión, comprobante y estado.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="date"
            value={state.fechaInicio}
            onChange={handleInputFechaInicio}
            className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <input
            type="date"
            value={state.fechaFinal}
            onChange={handleInputFechaFinal}
            className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <select
            ref={refIdAlmacen}
            value={state.idAlmacen}
            onChange={handleSelectIdAlmacen}
            className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Almacenes --</option>
            {state.almacenes.map((item) => (
              <option key={item.idAlmacen} value={item.idAlmacen}>
                {item.nombre}
              </option>
            ))}
          </select>

          <select
            // value={this.state.estado}
            // onChange={this.handleSelectEstado}
            className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="0">TODOS</option>
            <option value="1">COBRADO</option>
            <option value="2">POR COBRAR</option>
            <option value="3">ANULADO</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaBuilding className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Activos vigentes
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {rounded(state.metricas.totalAssets, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaMoneyBillWave className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Costo total (con mejoras)
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(state.metricas.totalCost, moneda.codiso)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaChartLine className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Dep. acumulada total
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(state.metricas.totalDepreciation, moneda.codiso)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaBalanceScale className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Valor en libros hoy
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(state.metricas.totalBookValue, moneda.codiso)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="w-full mb-4">
        <Search
          group={true}
          iconLeft={<i className="bi bi-search text-gray-400"></i>}
          ref={refSearch}
          onSearch={handleSearchText}
          placeholder="Buscar por nombre del bien..."
          theme="modern"
        />
      </div>

      {/* Render condicional: Tabla o Cuadrícula */}
      <div
        className={
          state.vista === "tabla"
            ? "bg-white rounded border overflow-hidden"
            : "space-y-6"
        }
      >

        {/* 📊 Vista Tabla  */}
        {
          state.vista === "tabla" && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">Producto</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Categoría</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Stock</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Costo</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Estado</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%] text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {renderTable()}
                </tbody>
              </table>
            </div>
          )
        }

        {/* 🟦 Vista Cuadrícula */}
        {
          state.vista === "cuadricula" && (
            <>{renderCuadricula()}</>
          )
        }

        {/* ✅ Paginación única */}
        <Paginacion
          ref={refPaginacion}
          loading={state.loading}
          data={state.lista}
          totalPaginacion={state.totalPaginacion}
          paginacion={state.paginacion}
          fillTable={handlePaginacion}
          restart={state.restart}
          theme="modern"
          className={
            state.vista === "tabla"
              ? "md:px-4 py-3 bg-white border-t border-gray-200 overflow-auto"
              : "md:px-6 py-3 bg-white border rounded border-gray-200 overflow-auto"
          }
        />
      </div>
    </ContainerWrapper>
  );
};

export default Bienes;