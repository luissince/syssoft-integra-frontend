import ContainerWrapper from '@/components/ui/container-wrapper';
import { SpinnerView } from '@/components/Spinner';
import Title from '@/components/Title';
import {
  Package,
  AlertTriangle,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import DatePickerPopover from "@/components/DatePickerPopover";
import { optionsSucursal, reporteAsignacion } from '@/network/rest/api-client';
import { format } from 'date-fns';
import { alertKit } from 'alert-kit';
import { CANCELED } from '@/constants/requestStatus';
import { cn } from '@/lib/utils';
import BranchInterface from '@/model/ts/interface/branch';
import Search from '@/components/Search';
import { formatCurrency, isEmpty, rounded } from '@/helper/utils.helper';
import { useAppSelector } from '@/redux/hooks';
import { useHistory } from "react-router-dom";

enum estadoInventario {
  DISPONIBLE = "disponible",
  VENDIDO = "vendido",
  ASIGNADO = "asignado"
}

type ActivoAsignacion = {
  idDocumentoActivo: string;
  documento: string;
  tipoDocumento: string;
  persona: string;
  email: string;
  celular: string;
  telefono: string;
  fecha: string;
  hora: string;
  cantidad: number;
  serie: string;
  estado: string;
  ubicacion: string;
  marca: string;
  correlativo: string;
  producto: string;
  codigo: string;
}

const ReporteGestion = () => {
  const token = useAppSelector((state) => state.principal);

  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState('Cargando información...');


  const [fechaInicial, setFechaInicial] = useState(new Date());
  const [fechaFinal, setFechaFinal] = useState(new Date());

  const [activoAsignacion, setActivoAsignacion] = useState<ActivoAsignacion[]>([]);
  const [buscar, setBuscar] = useState('');
  const [sucursales, setSucursales] = useState<Array<BranchInterface>>([]);

  const [idSucursal, setIdSucursal] = useState(token.project.idSucursal);
  const [idAlmacen, setIdAlmacen] = useState('');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');

  const abortDashboardRef = useRef<AbortController | null>(null);

  const LoadInventarioGestion = async () => {
    abortDashboardRef.current?.abort();
    abortDashboardRef.current = new AbortController();

    const body = {
      fechaInicio: format(fechaInicial, "yyyy-MM-dd"),
      fechaFinal: format(fechaFinal, "yyyy-MM-dd"),
    }
    const { success, data, message, type } = await reporteAsignacion(
      body,
      abortDashboardRef.current.signal
    );

    if (type === CANCELED) return;

    if (!success) {
      alertKit.warning({
        title: 'ReporteGestion',
        message: message,
      });
      return;
    }

    setActivoAsignacion(data);
  }

  const loadSucursal = async () => {
    abortDashboardRef.current = new AbortController();

    const { success, data, message, type } = await optionsSucursal(abortDashboardRef.current.signal);

    if (!success) {
      if (type === CANCELED) return;

      alertKit.warning({
        title: 'Reporte General',
        message: message,
      });
      return;
    }

    abortDashboardRef.current = null;
    setSucursales(data);
  }

  const loadAll = async () => {
    setLoading(true);

    await LoadInventarioGestion();
    await loadSucursal();
    // await loadAlmacen();
    // await loadDashboard();

    setLoading(false);
  }

  useEffect(() => {
    LoadInventarioGestion();

    return () => {
      abortDashboardRef.current?.abort();
    };
  }, [fechaInicial, fechaFinal]);

  const handleSucursalChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setIdSucursal(event.target.value)
  };

  const handleFechaInicial = (date: Date) => {
    setFechaInicial(date);
  };

  const handleFechaFinal = (date: Date) => {
    setFechaFinal(date);
  };

  const searchText = (text: string) => {
    setBuscar(text.trim().toLowerCase());
  };

  const activosFiltrados = activoAsignacion.filter((activo) => {
    const coincideBusqueda = !buscar || [
      activo.documento,
      activo.tipoDocumento,
      activo.persona,
      activo.producto,
      activo.serie,
      activo.correlativo,
    ].some((valor) => valor?.toLowerCase().includes(buscar));

    const coincideEstado = !estadoSeleccionado
      || activo.estado?.toLowerCase() === estadoSeleccionado;

    return coincideBusqueda && coincideEstado;
  });

  return (
    <ContainerWrapper>
      <SpinnerView
        loading={loading}
        message={msgLoading}
      />

      <Title
        title="Reporte Asignacion"
        subTitle="de Activos Fijos"
        handleGoBack={() => history.goBack()}
      />

      <div className="space-y-3">
        {/* Controles */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <button
              disabled={loading}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded",
                loading ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              )}
              onClick={LoadInventarioGestion}
            >
              <i className={`bi bi-arrow-clockwise ${loading ? 'animate-spin' : ''}`}></i>
              {loading ? 'Recargando...' : 'Recargar Vista'}
            </button>
          </div>

          <div className="flex">
            <p className="text-gray-600 mt-1">
              Aquí puedes filtrar los registros de asignación de activos fijos por fecha, sucursal y almacén. Utiliza los controles para seleccionar el rango de fechas y las opciones deseadas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DatePickerPopover value={fechaInicial} onChange={handleFechaInicial} />

            <DatePickerPopover value={fechaFinal} onChange={handleFechaFinal} />


            <select
              value={idSucursal}
              onChange={handleSucursalChange}
              className="px-4 py-2 border border-gray-300 text-sm rounded"
            >
              <option value="">TODAS LAS SUCURSALES</option>
              {sucursales.map((item, index) => (
                <option key={index} value={item.idSucursal}>
                  {item.nombre}
                </option>
              ))}
            </select>

            <select
              value={idAlmacen}
              onChange={(event) => setIdAlmacen(event.target.value)}
              className="px-4 py-2 border border-gray-300 text-sm rounded"
            >
              <option value="">TODOS LOS ALMACENES</option>
            </select>
          </div>
        </div>
        <div className="flex flex-row gap-4 mb-4">
          {/* Barra de búsqueda */}
          <div className="w-1/2">
            <Search
              group={true}
              iconLeft={<i className="bi bi-search text-gray-400"></i>}
              onSearch={searchText}
              placeholder="Buscar por comprobante o cliente..."
              theme="modern"
            />
          </div>

          <select
            value={estadoSeleccionado}
            onChange={(event) => setEstadoSeleccionado(event.target.value)}
            aria-label="Filtrar por estado"
            className="px-4 py-2 border border-gray-300 text-sm rounded"
          >
            <option value="">TODOS LOS ESTADOS</option>
            <option value={estadoInventario.ASIGNADO}>ASIGNADO</option>
            <option value={estadoInventario.DISPONIBLE}>DISPONIBLE</option>
          </select>
        </div>

        {/* 1. PRODUCTOS PARA PEDIR - ¿Qué se está vendiendo? */}
        <div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="w-[10%] py-3 text-center text-xs font-medium text-gray-500 uppercase border">N°</th>
                    <th className="w-[20%] py-3 text-center text-xs font-medium text-gray-500 uppercase border">DNI/RUC</th>
                    <th className="w-[10%] py-3 text-center text-xs font-medium text-gray-500 uppercase border">Persona</th>
                    <th className="w-[10%] py-3 text-center text-xs font-medium text-gray-500 uppercase border">Cel. / Tel.</th>
                    <th className="w-[10%] py-3 text-center text-xs font-medium text-gray-500 uppercase border">Email</th>
                    <th className="w-[10%] py-3 text-center text-xs font-medium text-gray-500 uppercase border">Producto</th>
                    <th className="w-[10%] py-3 text-center text-xs font-medium text-gray-500 uppercase border">Serie</th>
                    <th className="w-[10%] py-3 text-center text-xs font-medium text-gray-500 uppercase border">Correlativo</th>
                    <th className="w-[10%] py-3 text-center text-xs font-medium text-gray-500 uppercase border">Marca</th>
                    <th className="w-[10%] py-3 text-center text-xs font-medium text-gray-500 uppercase border">Estado</th>
                    <th className="w-[10%] py-3 text-center text-xs font-medium text-gray-500 uppercase border">Ubicación</th>
                    <th className="w-[10%] py-3 text-center text-xs font-medium text-gray-500 uppercase border">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 border">
                  {isEmpty(activosFiltrados) ? (
                    <tr>
                      <td colSpan={12} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <i className="bi bi-box text-4xl mb-3 block text-gray-400"></i>
                          <p className="text-lg font-medium">No se encontraron registros</p>
                          <p className="text-sm">No hay asignaciones para mostrar</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    activosFiltrados.map((activo, idx) => (
                      <tr key={`${activo.idDocumentoActivo}-${idx}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4"><div className="text-sm">{idx + 1}</div></td>
                        <td className="px-6 py-4"><div className="text-sm text-gray-700">{activo.tipoDocumento}<br />{activo.documento}</div></td>
                        <td className="px-6 py-4"><div className="text-sm text-gray-700">{activo.persona}</div></td>
                        <td className="px-6 py-4"><div className="text-sm text-gray-700">{activo.celular}<br />{activo.telefono}</div></td>
                        <td className="px-6 py-4"><div className="text-sm text-gray-700">{activo.email}</div></td>
                        <td className="px-6 py-4"><div className="text-xs text-gray-700">{activo.codigo}</div><div className="text-sm text-gray-700">{activo.producto}</div></td>
                        <td className="px-6 py-4"><div className="text-sm text-gray-700">{activo.serie}</div></td>
                        <td className="px-6 py-4"><div className="text-sm text-gray-700">{activo.correlativo}</div></td>
                        <td className="px-6 py-4"><div className="text-sm text-gray-700">{activo.marca ?? 'N/A'}</div></td>
                        <td className="px-6 py-4"><div className="text-sm text-gray-700">{activo.estado}</div></td>
                        <td className="px-6 py-4"><div className="text-sm text-gray-700">{activo.ubicacion}</div></td>
                        <td className="px-6 py-4"><div className="text-sm text-gray-700">{format(new Date(activo.fecha), 'dd/MM/yyyy')}</div></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </ContainerWrapper >
  );
}

export default ReporteGestion;