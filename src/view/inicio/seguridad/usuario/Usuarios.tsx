import { useState, useEffect, useRef, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import {
  isEmpty,
} from '@/helper/utils.helper';
import Paginacion from '@/components/Paginacion';
import ContainerWrapper from '@/components/ui/container-wrapper';
import Title from '@/components/Title';
import Search from '@/components/Search';
import { alertKit } from 'alert-kit';
import { listUsuario, removeUsuario } from '@/network/rest/api-client';
import { UserListInterface } from '@/model/ts/interface/user';
import { CANCELED } from '@/constants/requestStatus';
import { cn } from '@/lib/utils';

const Usuarios = () => {
  const history = useHistory();
  const location = useLocation();
  const token = useAppSelector((state) => state.principal);

  const [loading, setLoading] = useState(false);
  const [lista, setLista] = useState<UserListInterface[]>([]);
  const [restart, setRestart] = useState(false);
  const [buscar, setBuscar] = useState("");
  const [opcion, setOpcion] = useState(0);
  const [paginacion, setPaginacion] = useState(1);
  const [totalPaginacion, setTotalPaginacion] = useState(0);
  const [filasPorPagina] = useState(10);
  const [messageTable, setMessageTable] = useState("Cargando información...");
  const [view, setView] = useState<'tabla' | 'cuadricula'>('tabla');

  const abortControllerTable = useRef<AbortController | null>(null);

  const fetchUsuarios = useCallback(async (opcionFetch = 0, buscarFetch = "") => {
    if (abortControllerTable.current) {
      abortControllerTable.current.abort();
    }
    abortControllerTable.current = new AbortController();

    setLoading(true);
    setLista([]);
    setMessageTable("Cargando información...");

    const params = {
      opcion: opcionFetch,
      buscar: buscarFetch.trim(),
      posicionPagina: (paginacion - 1) * filasPorPagina,
      filasPorPagina: filasPorPagina,
    };

    try {
      const { success, data, message, type } = await listUsuario(
        params,
        abortControllerTable.current.signal,
      );

      if (!success) {
        if (type === CANCELED) return;
        setLoading(false);
        setLista([]);
        setTotalPaginacion(0);
        setMessageTable(message);
      } else {
        const totalPag = parseInt(
          String(Math.ceil(Number(data.total) / filasPorPagina)),
        );
        setLoading(false);
        setLista(data.result);
        setTotalPaginacion(totalPag);
      }
    } catch (error) {
      setLoading(false);
      setMessageTable("Error al cargar datos");
    }
  }, [paginacion, filasPorPagina]);

  useEffect(() => {
    fetchUsuarios(opcion, buscar);
    return () => {
      if (abortControllerTable.current) {
        abortControllerTable.current.abort();
      }
    };
  }, [fetchUsuarios, opcion, buscar]);

  const loadInit = () => {
    if (loading) return;

    setPaginacion(1);
    setRestart(true);
    setOpcion(0);
    setBuscar("");
  };

  const handleSearch = (text: string) => {
    if (loading) return;

    if (text.trim().length === 0) return;
    setPaginacion(1);
    setRestart(false);
    setBuscar(text);
    setOpcion(1);
  };

  const handlePaginacion = (listid: number) => {
    setPaginacion(listid);
    setRestart(false);
  };

  const handleAgregar = () => {
    history.push({
      pathname: `${location.pathname}/agregar`,
    });
  };

  const handleEditar = (idUsuario: string) => {
    history.push({
      pathname: `${location.pathname}/editar`,
      search: '?idUsuario=' + idUsuario,
    });
  };

  const handleResetear = (idUsuario: string) => {
    history.push({
      pathname: `${location.pathname}/resetear`,
      search: '?idUsuario=' + idUsuario,
    });
  };

  const handleBorrar = async (idUsuario: string) => {
    const accept = await alertKit.question({
      title: "Usuario",
      message: "¿Está seguro de que desea eliminar el usuario? Esta operación no se puede deshacer.",
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      alertKit.loading({
        message: "Procesando información...",
      });

      const { success, data, message } = await removeUsuario(idUsuario);

      if (!success) {
        alertKit.warning({
          title: "Usuario",
          message: message,
        });
        return;
      }

      alertKit.success({
        title: "Usuario",
        message: data,
      }, () => {
        loadInit();
      });
    }
  };

  const handleChangeView = (viewType: 'tabla' | 'cuadricula') => {
    setView(viewType);
  };

  const renderTable = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={8} className="px-6 py-12 text-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-gray-500">Cargando información...</p>
            </div>
          </td>
        </tr>
      );
    }

    if (isEmpty(lista)) {
      return (
        <tr>
          <td colSpan={8} className="px-6 py-12 text-center">
            <div className="text-gray-500">
              <i className="bi bi-box text-4xl mb-3 block"></i>
              <p className="text-lg font-medium">No se encontraron ventas</p>
              <p className="text-sm">Intenta cambiar los filtros</p>
            </div>
          </td>
        </tr>
      );
    }

    return lista.map((item, index) => {
      const estado = item.estado === 1 ? 'ACTIVO' : 'INACTIVO';
      const styleEstado =
        item.estado === 1 ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800' : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800';

      return (
        <tr key={item.idUsuario} className="hover:bg-gray-50 transition-colors text-gray-900 text-sm">
          <td className="px-6 py-4 font-medium text-center">{item.id}</td>
          <td className="px-6 py-4">
            {item.informacion}
          </td>
          <td className="px-6 py-4">
            <div>{item.email}</div>
            <div className='text-xs'>{item.celular}</div>
          </td>
          <td className="px-6 py-4">{item.perfil}</td>
          <td className="px-6 py-4 text-center">
            <span className={styleEstado}>{estado}</span>
          </td>
          <td className="px-6 py-4 text-center font-medium">
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
              onClick={() => handleEditar(item.idUsuario)}
              title="Editar"
            >
              <i className="bi bi-pencil text-lg"></i>
            </button>
          </td>
          <td className="px-6 py-4 text-center font-medium">
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
              onClick={() => handleBorrar(item.idUsuario)}
              title="Eliminar"
            >
              <i className="bi bi-trash text-lg"></i>
            </button>
          </td>
          <td className="px-6 py-4 text-center font-medium">
            <button
              className={
                cn(
                  "p-2 rounded-md text-sm font-medium transition",
                  "text-blue-600 bg-white",
                  "hover:bg-blue-50 hover:text-blue-700",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  "active:bg-blue-100 active:scale-[0.98]",
                  "disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed",
                )
              }
              onClick={() => handleResetear(item.idUsuario)}
              title="Resetear clave"
            >
              <i className="bi bi-key text-lg"></i>
            </button>
          </td>
        </tr>
      );
    });
  };

  const renderGrid = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-gray-500">Cargando información...</p>
        </div>
      );
    }

    if (isEmpty(lista)) {
      return (
        <div className="text-center py-16 rounded border text-gray-500">
          <i className="bi bi-box text-4xl mb-3 block text-gray-400"></i>
          <p className="text-lg font-medium">No se encontraron ventas</p>
          <p className="text-sm">Intenta cambiar los filtros</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {lista.map((item, index) => {
          const estado = item.estado === 1 ? 'ACTIVO' : 'INACTIVO';
          const styleEstado =
            item.estado === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

          return (
            <div key={index} className="bg-white rounded border transition group overflow-hidden shadow-sm hover:shadow-md">
              <div className="flex flex-col gap-2 p-4">
                <div className="flex justify-between items-start">
                  <h5 className="font-semibold text-gray-900 text-sm truncate" title={item.informacion}>
                    {item.informacion}
                  </h5>
                  <span className={cn("inline-flex items-center px-2 py-1 rounded-full text-xs font-medium", styleEstado)}>
                    {estado}
                  </span>
                </div>

                <div className="text-sm text-gray-600">
                  <span className="font-medium">Perfil:</span> {item.perfil}
                </div>

                <div className="text-sm text-gray-600 truncate" title={item.email}>
                  <span className="font-medium">Email:</span> {item.email}
                </div>

                <div className="text-sm text-gray-600">
                  <span className="font-medium">Celular:</span> {item.celular}
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100 mt-2">
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
                    onClick={() => handleEditar(item.idUsuario)}
                    title="Editar"
                  >
                    <i className="bi bi-pencil text-lg"></i> Editar
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
                    onClick={() => handleBorrar(item.idUsuario)}

                    title="Eliminar"
                  >
                    <i className="bi bi-trash text-lg"></i>  Eliminar
                  </button>

                  <button
                    className={
                      cn(
                        "p-2 rounded-md text-sm font-medium transition",
                        "text-blue-600 bg-white",
                        "hover:bg-blue-50 hover:text-blue-700",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                        "active:bg-blue-100 active:scale-[0.98]",
                        "disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed",
                      )
                    }
                    onClick={() => handleResetear(item.idUsuario)}

                    title="Resetear"
                  >
                    <i className="bi bi-key text-lg"></i> Clave
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <ContainerWrapper>
      <Title
        title="Usuarios"
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
            onClick={handleAgregar}
            aria-label="Crear nuevo usuario"
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
            onClick={() => handleChangeView("tabla")}
            className={
              cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-1",
                "text-sm font-medium",
                "px-4 py-2",
                "rounded-md transition ",
                view === "tabla" ? "bg-white text-blue-600" : "text-gray-600 hover:text-gray-800",
              )
            }
          >
            <i className="bi bi-list-ul"></i>
            <span className="hidden sm:inline">Tabla</span>
          </button>
          <button
            onClick={() => handleChangeView("cuadricula")}
            className={
              cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-1",
                "text-sm font-medium",
                "px-4 py-2",
                "rounded-md transition ",
                view === "cuadricula" ? "bg-white text-blue-600" : "text-gray-600 hover:text-gray-800",
              )
            }
          >
            <i className="bi bi-grid-3x3"></i>
            <span className="hidden sm:inline">Cuadrícula</span>
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="w-full mb-4">
        <Search
          group={true}
          iconLeft={<i className="bi bi-search text-gray-400"></i>}
          onSearch={handleSearch}
          placeholder="Buscar por usuario..."
          theme="modern"
        />
      </div>

      {/* Render condicional: Tabla o Cuadrícula */}
      <div
        className={
          view === "tabla"
            ? "bg-white rounded border overflow-hidden"
            : "space-y-6"
        }
      >
        {/* 📊 Vista Tabla  */}
        {
          view === "tabla" && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">#</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">Información</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">Contacto</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">Perfil</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%] text-center">Estado</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%] text-center">Editar</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%] text-center">Eliminar</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%] text-center">Resetear</th>
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
          view === "cuadricula" && (
            <>{renderGrid()}</>
          )
        }

        {/* ✅ Paginación única */}
        <Paginacion
          loading={loading}
          data={lista}
          totalPaginacion={totalPaginacion}
          paginacion={paginacion}
          fillTable={handlePaginacion}
          restart={restart}
          theme="modern"
          className={
            view === "tabla"
              ? "md:px-4 py-3 bg-white border-t border-gray-200 overflow-auto"
              : "md:px-6 py-3 bg-white border rounded border-gray-200 overflow-auto"
          }
        />
      </div>
    </ContainerWrapper>
  );
};

export default Usuarios;
