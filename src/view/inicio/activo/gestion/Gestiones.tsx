import Image from "@/components/Image";
import Paginacion from "@/components/Paginacion";
import Search from "@/components/Search";
import { SpinnerView } from "@/components/Spinner";
import Title from "@/components/Title";
import ContainerWrapper from "@/components/ui/container-wrapper";
import { CANCELED } from "@/constants/requestStatus";
import { images } from "@/helper";
import { isEmpty } from "@/helper/utils.helper";
import { cn } from "@/lib/utils";
import { listGestion } from "@/network/rest/api-client";
import { setGestionState } from "@/redux/activo/gestionSlice";
import { useAppSelector } from "@/redux/hooks";
import React, { useRef } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

const Gestiones = () => {

  // =============================
  // REDUX
  // =============================

  const state = useAppSelector((state) => state.activoGestion);
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

  const refPaginacion = useRef<Paginacion>(null);

  // =============================
  // CONTROLLERS
  // =============================

  const abortControllerTable = useRef<AbortController | null>(null);

  // =============================
  // API
  // =============================

  const fillTable = async () => {
    abortControllerTable.current?.abort();
    abortControllerTable.current = new AbortController();

    dispatch(setGestionState({
      loading: true,
      lista: [],
      messageTable: "Cargando información...",
    }));

    const params = {
      opcion: state.opcion,
      buscar: state.buscar.trim(),
      posicionPagina: (state.paginacion - 1) * state.filasPorPagina,
      filasPorPagina: state.filasPorPagina
    }

    const { success, data, message, type } = await listGestion(params, abortControllerTable.current.signal);

    if (!success) {
      if (type === CANCELED) return;

      abortControllerTable.current = null;
      dispatch(setGestionState({
        loading: false,
        lista: [],
        totalPaginacion: 0,
        messageTable: message,
      }));
      return;
    }

    const totalPaginacion = parseInt(String(Math.ceil(Number(data.total) / state.filasPorPagina)));

    abortControllerTable.current = null;
    dispatch(setGestionState({
      lista: data.result,
      totalPaginacion,
      loading: false,
    }));
  }

  // =============================
  // EFFECTS
  // =============================

  // =============================
  // HANDLERS
  // =============================

  // Eventos de paginación
  const handlePaginacion = (page: number, limit: number) => {
    // dispatch(getVentas(token.accessToken, page, limit));
  }

  // Evento de cambio de paginación
  const handleGoToBienCrear = () => {
    history.push({
      pathname: `${history.location.pathname}/crear`,
    });
  };

  // =============================
  // RENDER HELPERS
  // =============================

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
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="text-sm text-gray-900">
                {item.categoria}
              </div>
            </td>
            <td className="px-6 py-4">

            </td>
            <td className="px-6 py-4">

            </td>
            <td className="px-6 py-4">

            </td>
            <td className="px-6 py-4">

            </td>
          </tr>


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
        title="Gestiones"
        subTitle="LISTA"
        handleGoBack={() => history.goBack()}
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
            onClick={handleGoToBienCrear}
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
          // onClick={loadInit}
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
          // onClick={changeView.bind(this, "tabla")}
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
          // onClick={changeView.bind(this, "cuadricula")}
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
            // value={state.fechaInicio}
            // onChange={handleInputFechaInicio}
            className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <input
            type="date"
            // value={state.fechaFinal}
            // onChange={handleInputFechaFinal}
            className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <select
            // ref={refIdAlmacen}
            // value={state.idAlmacen}
            // onChange={handleSelectIdAlmacen}
            className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Almacenes --</option>
            {/* {state.almacenes.map((item) => (
              <option key={item.idAlmacen} value={item.idAlmacen}>
                {item.nombre}
              </option>
            ))} */}
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

      {/* Barra de búsqueda */}
      <div className="w-full mb-4">
        <Search
          group={true}
          iconLeft={<i className="bi bi-search text-gray-400"></i>}
          // ref={refSearch}
          // onSearch={handleSearchText}
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
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">Activo</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Serie</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Ubicación</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Responsable</th>
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

export default Gestiones;