import React, { useEffect, useRef } from 'react';
import {
  formatCurrency,
  isEmpty,
} from '@/helper/utils.helper';
import { useDispatch } from 'react-redux';
import Paginacion from '@/components/Paginacion';
import {
  deleteBanco,
  listBancos,
} from '@/network/rest/principal.network';
import ErrorResponse from '@/model/class/error-response';
import { CANCELED } from '@/constants/requestStatus';
import ContainerWrapper from '@/components/ui/container-wrapper';
import Title from '@/components/Title';
import Search from '@/components/Search';
import { alertKit } from 'alert-kit';
import { cn } from '@/lib/utils';
import { SiSlideshare } from "react-icons/si";
import { useAppSelector } from '@/redux/hooks';
import { useHistory } from 'react-router-dom';
import { setFinanzaBancoState } from '@/redux/finanza/bancoSlice';

const Bancos = () => {
  // =============================
  // REDUX
  // =============================

  const state = useAppSelector((state) => state.finanzaBanco);
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

  const abortControllerTable = useRef<AbortController | null>(null);

  // =============================
  // API
  // =============================

  const fillTable = async () => {
    abortControllerTable.current?.abort();
    abortControllerTable.current = new AbortController();

    dispatch(setFinanzaBancoState({
      loading: true,
      lista: [],
      messageTable: "Cargando información...",
    }));

    const params = {
      opcion: state.opcion,
      buscar: state.buscar.trim(),
      idSucursal: token.project.idSucursal,
      posicionPagina: (state.paginacion - 1) * state.filasPorPagina,
      filasPorPagina: state.filasPorPagina,
    };

    const { success, data, message, type } = await listBancos(params, abortControllerTable.current.signal);

    if (!success) {
      if (type === CANCELED) return;

      abortControllerTable.current = null;
      dispatch(setFinanzaBancoState({
        loading: false,
        lista: [],
        totalPaginacion: 0,
        messageTable: message,
      }));
      return;
    }

    const totalPaginacion = parseInt(String(Math.ceil(Number(data.total) / state.filasPorPagina)));

    abortControllerTable.current = null;
    dispatch(setFinanzaBancoState({
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
      dispatch(setFinanzaBancoState({
        didMount: true
      }));
    }

    return () => {
      abortControllerTable.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (state.didMount) {
      fillTable();
    }
  }, [state.didMount, state.opcion, state.buscar, state.paginacion]);

  // =============================
  // FLOWS
  // =============================

  const loadInit = async () => {
    if (state.loading) return;

    dispatch(setFinanzaBancoState({
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

    dispatch(setFinanzaBancoState({
      opcion: 1,
      buscar: text,
      paginacion: 1,
      restart: true,
    }));
  };

  const handlePaginacion = (page: number) => {
    dispatch(setFinanzaBancoState({
      paginacion: page,
      restart: false
    }));
  };

  // Eventos para cambiar la vista
  const handleChangeView = (value: string) => {
    dispatch(setFinanzaBancoState({
      vista: value,
    }));
  };

  // Eventos para ir al modulo de crear un banco
  const handleCrear = () => {
    history.push({
      pathname: `${history.location.pathname}/agregar`,
    });
  };

  // Eventos para ir al detalle de un banco
  const handleEditar = (idBanco: string) => {
    history.push({
      pathname: `${history.location.pathname}/editar`,
      search: '?idBanco=' + idBanco,
    });
  };

  // Eventos para ir al detalle de un banco
  const handleDetalle = (idBanco: string) => {
    history.push({
      pathname: `${location.pathname}/detalle`,
      search: '?idBanco=' + idBanco,
    });
  };

  const handleBorrar = async (idBanco: string) => {
    const accept = await alertKit.question({
      title: "Banco",
      message: "¿Estás seguro de eliminar el banco?",
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      alertKit.loading({ message: "Procesando información..." });

      const params = { idBanco: idBanco };
      const response = await deleteBanco(params);

      if (response instanceof ErrorResponse) {
        alertKit.warning({
          title: "Banco",
          message: response.getMessage(),
        });
        return;
      }

      alertKit.success({
        title: "Banco",
        message: response.data,
      }, () => {
        dispatch(setFinanzaBancoState({
          opcion: 0,
          paginacion: 1,
          restart: true,
        }));
      });
    }
  };

  // =============================
  // RENDER HELPERS
  // =============================

  const renderTable = () => {
    if (state.loading) {
      return (
        <tr>
          <td colSpan={11} className="px-6 py-12 text-center">
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
          <td colSpan={11} className="px-6 py-12 text-center">
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
              {item.nombre}
            </td>
            <td className="px-6 py-4 text-sm text-gray-900 uppercase">
              {item.tipoCuenta}
            </td>
            <td className="px-6 py-4 text-sm text-gray-900 uppercase">
              {item.moneda}
            </td>
            <td className="px-6 py-4 text-sm text-gray-900 uppercase">
              {item.numCuenta}
            </td>
            <td className="px-6 py-4 text-sm text-gray-500">
              <div className="flex items-center justify-center">
                {item.compartir === 1 ? <SiSlideshare className="h-5 w-5 text-green-500" /> : <SiSlideshare className="h-5 w-5" />}
              </div>
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
            <td className="px-6 py-4 text-sm text-gray-900 uppercase">
              <span className={cn(
                item.saldo <= 0 && "text-red-600",
              )}>
                {formatCurrency(item.saldo, item.codiso)}
              </span>
            </td>
            <td className="px-6 py-4 text-center">
              <button
                className={
                  cn(
                    "p-2 rounded-md text-sm font-medium transition",
                    "text-blue-600 bg-white",
                    "hover:bg-blue-50 hover:text-blue-700",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    "active:bg-blue-100 active:scale-[0.97]",
                    "disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed",
                  )
                }
                onClick={() => handleDetalle(item.idBanco)}
              >
                <i className="bi bi-eye text-lg" />
              </button>
            </td>
            <td className="px-6 py-4 text-center">
              <button
                className={
                  cn(
                    "p-2 rounded-md text-sm font-medium transition",
                    "text-yellow-600 bg-white",
                    "hover:bg-yellow-50 hover:text-yellow-700",
                    "focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2",
                    "active:bg-yellow-100 active:scale-[0.98]",
                    "disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed",
                  )
                }
                onClick={() => handleEditar(item.idBanco)}
              >
                <i className="bi bi-pencil text-lg" />
              </button>
            </td>
            <td className="px-6 py-4 text-center">
              <button
                className={
                  cn(
                    "p-2 rounded-md text-sm font-medium transition",
                    "text-red-600 bg-white",
                    "hover:bg-red-50 hover:text-red-700",
                    "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
                    "active:bg-red-100 active:scale-[0.98]",
                    "disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed",
                  )
                }
                onClick={() => handleBorrar(item.idBanco)}
              >
                <i className="bi bi-trash text-lg" />
              </button>
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
        {
          state.lista.map((item) => {
            return (
              <div
                key={item.idBanco}
                className="bg-white rounded border flex flex-col h-full">
                <div className="flex flex-col p-4 flex-1">
                  {/* BODY */}
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-semibold text-gray-900 text-sm">
                        {item.nombre}
                      </h5>

                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                          item.estado === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                        )}
                      >
                        {item.estado === 1 ? "ACTIVO" : "INACTIVO"}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Tipo de Cuenta:</span> {item.tipoCuenta}
                    </div>

                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Moneda:</span> {item.moneda}
                    </div>

                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Número de Cuenta:</span> {item.numCuenta}
                    </div>

                    <div className="text-sm text-gray-500">
                      {item.compartir === 1 ? <SiSlideshare className="h-5 w-5 text-green-500" /> : <SiSlideshare className="h-5 w-5" />}
                    </div>

                    <div className={cn(
                      "text-lg font-bold text-gray-900 mb-3",
                      item.saldo <= 0 && "text-red-600",
                    )}>
                      <span className="font-medium">Saldo:</span> {formatCurrency(item.saldo, item.codiso)}
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="pt-3 border-t border-gray-100 flex justify-between">          
                    <button
                      className={
                        cn(
                          "p-2 rounded-md text-sm font-medium transition",
                          "text-blue-600 bg-white",
                          "hover:bg-blue-50 hover:text-blue-700",
                          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                          "active:bg-blue-100 active:scale-[0.97]",
                          "disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed",
                        )
                      }
                      onClick={() => handleDetalle(item.idBanco)}
                      title="Detalle banco"
                    >
                      <i className="bi bi-eye text-lg" />
                    </button>

                    <button
                      className={
                        cn(
                          "p-2 rounded-md text-sm font-medium transition",
                          "text-yellow-600 bg-white",
                          "hover:bg-yellow-50 hover:text-yellow-700",
                          "focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2",
                          "active:bg-yellow-100 active:scale-[0.98]",
                          "disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed",
                        )
                      }
                      onClick={() => handleEditar(item.idBanco)}
                      title="Editar banco"
                    >
                      <i className="bi bi-pencil text-lg" />
                    </button>

                    <button
                      className={
                        cn(
                          "p-2 rounded-md text-sm font-medium transition",
                          "text-red-600 bg-white",
                          "hover:bg-red-50 hover:text-red-700",
                          "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
                          "active:bg-red-100 active:scale-[0.98]",
                          "disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed",
                        )
                      }
                      onClick={() => handleBorrar(item.idBanco)}
                      title="Eliminar banco"
                    >
                      <i className="bi bi-trash text-lg" />
                    </button>
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
      <Title
        title="Bancos"
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
            onClick={handleCrear}
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
            Resumen de las cuentas bancarias, efectivo, credito, billetera digital, etc.
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
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">#</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Nombre</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Tipo Cuenta</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Moneda</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">Número de Cuenta</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%] text-center">Compartir</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%] text-center">Estado</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%] text-center">Saldo</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%] text-center">Detalle</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%] text-center">Editar</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%] text-center">Eliminar</th>
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

export default Bancos;