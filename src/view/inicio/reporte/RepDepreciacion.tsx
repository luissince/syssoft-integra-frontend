import ContainerWrapper from '@/components/ui/container-wrapper';
import { SpinnerView } from '@/components/Spinner';
import Title from '@/components/Title';
import {
  Package,
  AlertTriangle,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import DatePickerPopover from "@/components/DatePickerPopover";
import { optionsSucursal } from '@/network/rest/api-client';
import { format } from 'date-fns';
import { alertKit } from 'alert-kit';
import { CANCELED } from '@/constants/requestStatus';
import { cn } from '@/lib/utils';
import BranchInterface from '@/model/ts/interface/branch';
import { formatCurrency, isEmpty, rounded } from '@/helper/utils.helper';
import { useAppSelector } from '@/redux/hooks';
import { useHistory } from "react-router-dom";
import { reporteDepreciacion } from "@/network/rest/api-client";

enum estadoInventario {
  DISPONIBLE = "disponible",
  VENDIDO = "vendido",
  ASIGNADO = "asignado"
}

type ActivoDepreciacion = {
  idProducto: string;
  serie: string;
  correlativo: string;
  fechaAdquisicion: string;
  fechaIngreso: string;
  periodo: string;
  dias: number;
  vidaUtil: number;
  costoFijo: number;
  valorInicio: number;
  enero: string;
  febrero: string,
  marzo: string,
  abril: string,
  mayo: string,
  junio: string,
  julio: string,
  agosto: string,
  septiembre: string,
  octubre: string,
  noviembre: string,
  diciembre: string,
  depreciacion: number,
  depreciacionAcumulada: number,
  valorLibros: number
}

const ReporteDepreciacion = () => {
  const token = useAppSelector((state) => state.principal);

  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState('Cargando información...');


  const [fechaInicial, setFechaInicial] = useState(new Date());
  const [fechaFinal, setFechaFinal] = useState(new Date());

  const [activoDepreciacion, setActivoDepreciacion] = useState<ActivoDepreciacion[]>([]);
  const [sucursales, setSucursales] = useState<Array<BranchInterface>>([]);

  const [idSucursal, setIdSucursal] = useState(token.project.idSucursal);
  const [idAlmacen, setIdAlmacen] = useState('');

  const abortDashboardRef = useRef<AbortController | null>(null);

  const loadInventarioActivo = async () => {
    abortDashboardRef.current?.abort();
    abortDashboardRef.current = new AbortController();

    const body = {
      fechaInicio: format(fechaInicial, "yyyy-MM-dd"),
      fechaFinal: format(fechaFinal, "yyyy-MM-dd"),
    }
    const { success, data, message, type } = await reporteDepreciacion(
      body,
      abortDashboardRef.current.signal
    );

    if (type === CANCELED) return;

    if (!success) {
      alertKit.warning({
        title: 'ReporteDepreciación',
        message: message,
      });
      return;
    }

    setActivoDepreciacion(data);
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

    await loadInventarioActivo();
    await loadSucursal();
    // await loadAlmacen();
    // await loadDashboard();

    setLoading(false);
  }

  useEffect(() => {
    loadAll();

    return () => {
      abortDashboardRef.current?.abort();
    };
  }, [fechaInicial, fechaFinal]);


  const handleFechaInicial = (date: Date) => {
    setFechaInicial(date);
  };

  const handleFechaFinal = (date: Date) => {
    setFechaFinal(date);
  };

  const handleSucursalChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setIdSucursal(event.target.value)
  };

  return (
    <ContainerWrapper>
      <SpinnerView
        loading={loading}
        message={msgLoading}
      />

      <Title
        title="Reporte Depreciación"
        subTitle="DASHBOARD"
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
              onClick={loadInventarioActivo}
            >
              <i className={`bi bi-arrow-clockwise ${loading ? 'animate-spin' : ''}`}></i>
              {loading ? 'Recargando...' : 'Recargar Vista'}
            </button>
          </div>

          <div className="flex">
            <p className="text-gray-600 mt-1">
              Análisis del estado de inventario y rendimiento de productos
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
              onChange={(e) => {

              }}
              className="px-4 py-2 border border-gray-300 text-sm rounded"
            >
              <option value="">TODOS LOS ALMACENES</option>

            </select>
          </div>
        </div>

        {/* 1. PRODUCTOS PARA PEDIR - ¿Qué se está vendiendo? */}
        <div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-[20%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TA</th>
                    <th className="w-[20%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ADQUISIC</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">INGRESO</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">FECHA DE USO</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TD</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SERIE</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CODIGO INVENTARIO</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DOLARES</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SOLES</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">VALOR NETO EN LIBROS</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DIAS</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DEPRECIACION ACUMULADA</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DEPRECIACION DEL EJERCICIO</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ENERO</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">FEBRERO</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MARZO</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ABRIL</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MAYO</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">JUNIO</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">JULIO</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AGOSTO</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SEPTIEMBRE</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OCTUBRE</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NOVIEMBRE</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DICIEMBRE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {
                    isEmpty(activoDepreciacion) ? (
                      <tr>
                        <td colSpan={27} className="px-6 py-12 text-center">
                          <div className="text-gray-500">
                            <i className="bi bi-box text-4xl mb-3 block text-gray-400"></i>
                            <p className="text-lg font-medium">
                              No se encontraron productos
                            </p>
                            <p className="text-sm">No hay registros para pedir</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      activoDepreciacion.map((inventario, idx) => (
                        <React.Fragment key={idx}>
                          {/* FILA PRINCIPAL (igual que antes) */}
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                                {inventario.correlativo.substring(0, 2)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500">
                                {format(new Date(inventario.fechaAdquisicion), 'dd/MM/yyyy')}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                                {format(new Date(inventario.fechaIngreso), 'dd/MM/yyyy')}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                                {inventario.serie.split('-')[0]}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                                {inventario.serie.split('-')[1]}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                                {inventario.correlativo}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                                {inventario.costoFijo}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                                {inventario.valorLibros}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                                {100 / inventario.vidaUtil}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                                {inventario.dias}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                                {inventario.depreciacionAcumulada}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                                {inventario.depreciacion}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                                {inventario.enero}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                                {inventario.febrero}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                                {inventario.marzo}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                                {inventario.abril}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                                {inventario.mayo}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                                {inventario.junio}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                                {inventario.julio}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                                {inventario.agosto}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                                {inventario.septiembre}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                                {inventario.octubre}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                                {inventario.noviembre}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="text-sm text-gray-500">
                                {inventario.diciembre}
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))
                    )
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </ContainerWrapper >
  );
}

export default ReporteDepreciacion;