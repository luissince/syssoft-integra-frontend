import React, { useEffect, useRef } from 'react';
import {
  formatCurrency,
  isEmpty,
  getPathNavigation,
  formatNumberWithZeros,
  formatTime,
  currentDate,
} from '@/helper/utils.helper';
import { useDispatch } from 'react-redux';
import Paginacion from '@/components/Paginacion';
import {
  comboSucursal,
  optionsUsuario,
  listTransaccion,
} from '@/network/rest/principal.network';
import ErrorResponse from '@/model/class/error-response';
import { CANCELED } from '@/constants/requestStatus';
import ContainerWrapper from '@/components/ui/container-wrapper';
import Title from '@/components/Title';
import { SpinnerView } from '@/components/Spinner';
import Search from '@/components/Search';
import { Link, useHistory } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import {
  TIPO_CONCEPTO_EGRESO,
  TIPO_CONCEPTO_INGRESO,
} from '@/model/types/tipo-concepto';
import { alertKit } from 'alert-kit';
import { useAppSelector } from '@/redux/hooks';
import { setFinanzaTransaccionState } from '@/redux/finanza/transaccionSlice';
import { cn } from '@/lib/utils';

const Transacciones = () => {
  // =============================
  // REDUX
  // =============================

  const state = useAppSelector((state) => state.finanzaTransaccion);
  const token = useAppSelector((state) => state.principal);

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
  const refSearch = useRef<Search>(null);

  // =============================
  // CONTROLLERS
  // =============================

  const abortControllerSucursal = useRef<AbortController | null>(null);
  const abortControllerUsuario = useRef<AbortController | null>(null);
  const abortControllerTable = useRef<AbortController | null>(null);

  // =============================
  // API
  // =============================

  const loadSucursal = async () => {
    abortControllerSucursal.current?.abort();
    abortControllerSucursal.current = new AbortController();

    const result = await comboSucursal(abortControllerSucursal.current.signal);

    if (result instanceof ErrorResponse) {
      if (result.getType() === CANCELED) return;

      abortControllerSucursal.current = null;
      alertKit.warning({
        title: "Transacciones",
        message: result.getMessage(),
      });
      return;
    }

    dispatch(setFinanzaTransaccionState({
      sucursales: result.data,
    }));
  }

  const loadUsuarios = async () => {
    abortControllerUsuario.current?.abort();
    abortControllerUsuario.current = new AbortController();

    const result = await optionsUsuario(abortControllerUsuario.current.signal);

    if (result instanceof ErrorResponse) {
      if (result.getType() === CANCELED) return;

      abortControllerUsuario.current = null;
      alertKit.warning({
        title: "Transacciones",
        message: result.getMessage(),
      });
      return;
    }

    dispatch(setFinanzaTransaccionState({
      usuarios: result.data,
    }));
  }

  const fillTable = async () => {
    abortControllerTable.current?.abort();
    abortControllerTable.current = new AbortController();

    dispatch(setFinanzaTransaccionState({
      loading: true,
      lista: [],
      messageTable: "Cargando información...",
    }));

    const params = {
      opcion: state.opcion,
      buscar: state.buscar.trim(),
      fechaInicio: state.fechaInicio,
      fechaFinal: state.fechaFinal,
      idTipoConcepto: state.idTipoConcepto,
      idSucursal: token.project.idSucursal,
      idUsuario: token.userToken.usuario.idUsuario,
      posicionPagina: (state.paginacion - 1) * state.filasPorPagina,
      filasPorPagina: state.filasPorPagina,
    };

    const { success, data, message, type } = await listTransaccion(params, abortControllerTable.current.signal);

    if (!success) {
      if (type === CANCELED) return;

      abortControllerTable.current = null;
      dispatch(setFinanzaTransaccionState({
        loading: false,
        lista: [],
        totalPaginacion: 0,
        messageTable: message,
      }));
      return;
    }

    const totalPaginacion = parseInt(String(Math.ceil(Number(data.total) / state.filasPorPagina)));

    abortControllerTable.current = null;
    dispatch(setFinanzaTransaccionState({
      lista: data.result,
      totalPaginacion,
      loading: false,
    }));
  };

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
      dispatch(setFinanzaTransaccionState({
        fechaInicio: currentDate(),
        fechaFinal: currentDate(),
        didMount: true
      }));
    }

    return () => {
      abortControllerSucursal.current?.abort();
      abortControllerTable.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!state.didMount) return;

    loadSucursal();
    loadUsuarios();

  }, [state.didMount]);

  useEffect(() => {
    if (!state.didMount) return;
    if (isEmpty(state.sucursales)) return;
    if (isEmpty(state.usuarios)) return;

    dispatch(setFinanzaTransaccionState({
      initialLoad: false,
    }));

  }, [state.didMount, state.sucursales, state.usuarios]);

  useEffect(() => {
    if (!state.didMount) return;
    if (isEmpty(state.sucursales)) return;
    if (isEmpty(state.usuarios)) return;

    fillTable();

  }, [state.didMount, state.opcion, state.buscar, state.paginacion, state.fechaFinal, state.fechaFinal, state.idSucursal, state.idTipoConcepto, state.idUsuario]);

  // =============================
  // FLOWS
  // =============================

  const loadInit = async () => {
    if (state.loading) return;

    dispatch(setFinanzaTransaccionState({
      opcion: 0,
      paginacion: 1,
      restart: true,
    }));
  };

  // =============================
  // HANDLERS
  // =============================

  // Eventos para filtrar los bancos
  const handleSearchText = async (text: string) => {
    if (state.loading) return;

    if (text.trim().length === 0) return;

    dispatch(setFinanzaTransaccionState({
      opcion: 1,
      buscar: text,
      paginacion: 1,
      restart: true,
    }));
  };

  const handlePaginacion = (page: number) => {
    dispatch(setFinanzaTransaccionState({
      paginacion: page,
      restart: false
    }));
  };

  // Eventos para cambiar la vista
  const handleChangeView = (value: string) => {
    dispatch(setFinanzaTransaccionState({
      vista: value,
    }));
  };


  // Eventos de fecha de inicio
  const handleInputFechaInicio = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFinanzaTransaccionState({
      opcion: 2,
      fechaInicio: event.target.value,
    }));
  };

  // Eventos de fecha final
  const handleInputFechaFinal = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFinanzaTransaccionState({
      opcion: 2,
      fechaFinal: event.target.value
    }));
  };

  // Eventos de idTipoConcepto
  const handleSelectIdTipoConcepto = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFinanzaTransaccionState({
      opcion: 2,
      idTipoConcepto: event.target.value
    }));
  };

  // Eventos de idTipoConcepto
  const handleSelectIdSucursal = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFinanzaTransaccionState({
      opcion: 2,
      idSucursal: event.target.value
    }));
  };

  // Eventos de idUsuario
  const handleSelectIdUsuario = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFinanzaTransaccionState({
      opcion: 2,
      idUsuario: event.target.value
    }));
  };

  // =============================
  // RENDER HELPERS
  // =============================
  const renderTable = () => {
    if (state.loading) {
      return (
        <tr>
          <td colSpan={7} className="px-6 py-12 text-center">
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
          <td colSpan={7} className="px-6 py-12 text-center">
            <div className="text-gray-500">
              <i className="bi bi-box text-4xl mb-3 block"></i>
              <p className="text-lg font-medium">No se encontraron ventas</p>
              <p className="text-sm">Intenta cambiar los filtros</p>
            </div>
          </td>
        </tr>
      );
    }

    return state.lista.map((item) => {
      return (
        <React.Fragment key={item.idBanco}>
          <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 text-sm text-gray-900">
              {item.id}
            </td>
            <td className="px-6 py-4 text-sm text-gray-900">
              {item.fecha} <br /> {formatTime(item.hora)}
            </td>
            <td className="px-6 py-4 text-sm text-gray-900 uppercase">
              {item.concepto}
            </td>
            <td className="px-6 py-4 text-sm text-gray-900 uppercase">
              <Link
                to={getPathNavigation(item.tipo, item.idComprobante)}
                className="btn-link"
              >
                {item.comprobante}
                <br />
                {item.serie}-{formatNumberWithZeros(item.numeracion)}{' '}
                <ExternalLink width={18} height={18} />
              </Link>
            </td>
            <td className="px-6 py-4 text-center">
              <span
                className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  item.estado === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
                )}
              >
                {item.estado === 1 ? "ACTIVO" : "INACTIVO"}
              </span>
            </td>
            <td className="px-6 py-4 text-sm uppercase">
              {item.ingreso == 0 ? (
                ''
              ) : (
                <span className="text-base">
                  <i className="fa fa-plus text-green-500"></i>{' '}
                  {formatCurrency(item.ingreso, item.codiso)}
                </span>
              )}
              {item.ingreso != 0 &&
                item.detalles.map((detalle, index) => (
                  <div key={index}>
                    <span className="text-xs">
                      {detalle.nombre}: {formatCurrency(detalle.monto, item.codiso)}
                    </span>
                  </div>
                ))}
            </td>
            <td className="px-6 py-4 text-center">
              {item.egreso == 0 ? (
                ''
              ) : (
                <span className="text-base">
                  <i className="fa fa-minus text-red-500"></i>{' '}
                  {formatCurrency(item.egreso, item.codiso)}
                </span>
              )}
              {item.egreso != 0 &&
                item.detalles.map((detalle, index) => (
                  <div key={index}>
                    <span className="text-xs">
                      {detalle.nombre}: {formatCurrency(detalle.monto, item.codiso)}
                    </span>
                  </div>
                ))}
            </td>
          </tr>
        </React.Fragment>
      );
    });
  }

  const renderCuadricula = () => {
    // --- Loading State ---
    if (state.loading) {
      return (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-gray-500">{state.messageTable}</p>
        </div>
      );
    }

    // --- Empty State ---
    if (isEmpty(state.lista)) {
      return (
        <div className="text-center py-16 rounded border text-gray-500">
          <i className="bi bi-box text-4xl mb-3 block"></i>
          <p className="text-lg font-medium">No se encontraron ventas</p>
          <p className="text-sm">Intenta cambiar los filtros</p>
        </div>
      );
    }

    // --- Grid Render ---
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
        {state.lista.map((item) => (
          <div
            key={item.idBanco}
            className="bg-white rounded border flex flex-col h-full"
          >
            <div className="flex flex-col p-4 flex-1">
              {/* --- BODY --- */}
              <div className="flex-1 flex flex-col gap-3">
                {/* Header: Concepto y Estado */}
                <div className="flex justify-between items-start mb-3">
                  <h5 className="font-semibold text-gray-900 text-sm">
                    {item.concepto}
                  </h5>
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                      item.estado === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    )}
                  >
                    {item.estado === 1 ? "ACTIVO" : "INACTIVO"}
                  </span>
                </div>

                {/* Fecha y Hora */}
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Fecha y Hora:</span> {item.fecha} <br />
                  {formatTime(item.hora)}
                </div>

                {/* Comprobante */}
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Comprobante:</span>
                  <Link
                    to={getPathNavigation(item.tipo, item.idComprobante)}
                    className="btn-link"
                  >
                    {item.comprobante}
                    <br />
                    {item.serie}-{formatNumberWithZeros(item.numeracion)}
                    <ExternalLink width={18} height={18} />
                  </Link>
                </div>

                {/* Ingreso */}
                {item.ingreso !== 0 && (
                  <div className="text-sm text-gray-600">
                    <span className="text-base">
                      <i className="fa fa-plus text-green-500"></i>
                      {formatCurrency(item.ingreso, item.codiso)}
                    </span>
                    {item.detalles.map((detalle, index) => (
                      <div key={index}>
                        <span className="text-xs">
                          {detalle.nombre}: {formatCurrency(detalle.monto, item.codiso)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Egreso */}
                {item.egreso !== 0 && (
                  <div className="text-sm text-gray-600">
                    <span className="text-base">
                      <i className="fa fa-minus text-red-500"></i>
                      {formatCurrency(item.egreso, item.codiso)}
                    </span>
                    {item.detalles.map((detalle, index) => (
                      <div key={index}>
                        <span className="text-xs">
                          {detalle.nombre}: {formatCurrency(detalle.monto, item.codiso)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* --- FOOTER --- */}
              <div className="pt-3 border-t border-gray-100 flex justify-between"></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // =============================
  // RENDER
  // =============================

  return (
    <ContainerWrapper>
      <SpinnerView
        loading={state.initialLoad}
        message={state.initialMessage}
      />

      <Title
        title="Transacciones"
        subTitle="LISTA"
        handleGoBack={() => history.goBack()}
      />

      {/* Acciones principales + Toggle vista */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-3">
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
            Puedes ver las transacciones echas con diferentes filtros, por ejemplo: fechas de emisión y estado.
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
            value={state.idTipoConcepto}
            onChange={handleSelectIdTipoConcepto}
            className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">TODOS</option>
            <option value={TIPO_CONCEPTO_INGRESO}>INGRESO</option>
            <option value={TIPO_CONCEPTO_EGRESO}>EGRESO</option>
          </select>

          <select
            value={state.idUsuario}
            onChange={handleSelectIdUsuario}
            className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">TODOS</option>
            {state.usuarios.map((item, index) => (
              <option key={index} value={item.idUsuario}>
                {item.informacion}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtros de fechas, comprobante y estado */}
      <div className="flex flex-col gap-y-4 mb-4">
        <div>
          <p className="text-gray-600 mt-1">
            Resumen de las transacciones, ingresos y egresos.
          </p>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="w-full mb-4">
        <Search
          group={true}
          iconLeft={<i className="bi bi-search text-gray-400"></i>}
          ref={refSearch}
          onSearch={handleSearchText}
          placeholder="Buscar por nombre..."
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
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%] text-center">#</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Fecha</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Concepto</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Referencia</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%] text-center">Estado</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%] text-center">Ingreso</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%] text-center">Egreso</th>
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
}

export default Transacciones;
