import ContainerWrapper from '@/components/ui/container-wrapper';
import { SpinnerView } from '@/components/Spinner';
import Title from '@/components/Title';
import {
  Package,
  AlertTriangle,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import DatePickerPopover from "@/components/DatePickerPopover";
import { optionsSucursal, inventarioDashboard, optionsAlmacen } from '@/network/rest/api-client';
import { format } from 'date-fns';
import { alertKit } from 'alert-kit';
import { CANCELED } from '@/constants/requestStatus';
import { cn } from '@/lib/utils';
import BranchInterface from '@/model/ts/interface/branch';
import { formatCurrency, isEmpty, rounded } from '@/helper/utils.helper';
import { IoIosInformationCircle } from 'react-icons/io';
import { images } from '@/helper';
import Image from '@/components/Image';
import { useAppSelector } from '@/redux/hooks';
import { useHistory } from "react-router-dom";

enum URGENCIA {
  CRITICO = "critico",
  PRONTO = "pronto",
  BAJO = "bajo",
  NORMAL = "normal"
}

type ProductoBase = {
  idProducto: string
  codigo: string
  imagen: string
  nombre: string
  costo?: number
  cantidad?: number
  almacen?: string
  cantidadMinima?: number
  cantidadMaxima?: number
  ventaDiaria?: number
  diasRestantes?: number
  urgencia?: URGENCIA
}

const ReporteInventario = () => {
  const token = useAppSelector((state) => state.principal);
  const moneda = useAppSelector(
    (state) => state.predeterminado.moneda
  );

  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState('Cargando información...');

  const [sucursales, setSucursales] = useState<Array<BranchInterface>>([]);
  const [almacenes, setAlmacenes] = useState<Array<BranchInterface>>([]);

  const [fechaInicial, setFechaInicial] = useState(new Date());
  const [fechaFinal, setFechaFinal] = useState(new Date());

  const [idSucursal, setIdSucursal] = useState(token.project.idSucursal);
  const [idAlmacen, setIdAlmacen] = useState('');

  const [productosParaPedir, setProductosParaPedir] = useState<ProductoBase[]>([]);
  const [productosParaRematar, setProductosParaRematar] = useState<ProductoBase[]>([]);
  const [productosDisponibles, setProductosDisponibles] = useState<ProductoBase[]>([]);

  const abortDashboardRef = useRef<AbortController | null>(null);

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

  const loadAlmacen = async () => {
    abortDashboardRef.current = new AbortController();

    const { success, data, message, type } = await optionsAlmacen(idSucursal, abortDashboardRef.current.signal);

    if (!success) {
      if (type === CANCELED) return;

      alertKit.warning({
        title: 'Reporte General',
        message: message,
      });
      return;
    }

    setAlmacenes(data);
  }

  const loadDashboard = async () => {
    abortDashboardRef.current = new AbortController();

    const body = {
      fechaInicio: format(fechaInicial, "yyyy-MM-dd"),
      fechaFinal: format(fechaFinal, "yyyy-MM-dd"),
      idSucursal: idSucursal,
    }

    const { success, data, message, type } = await inventarioDashboard(body, abortDashboardRef.current.signal);

    if (!success) {
      if (type === CANCELED) return;

      alertKit.warning({
        title: 'Reporte General',
        message: message
      })
      return;
    }

    abortDashboardRef.current = null;
    setProductosParaPedir(data.productosParaPedir);
    setProductosParaRematar(data.productosParaRematar);
    setProductosDisponibles(data.productosDisponibles);

  }

  const loadAll = async () => {
    setLoading(true);

    await loadSucursal();
    await loadAlmacen();
    await loadDashboard();

    setLoading(false);
  }

  useEffect(() => {
    loadAll();

    return () => {
      abortDashboardRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    loadDashboard();

    return () => abortDashboardRef.current?.abort();
  }, [fechaInicial, fechaFinal, idSucursal]);

  const groupProductsByAlmacen = (data: ProductoBase[]) => {
    const map = {} as {
      [key: string]: ProductoBase & {
        almacenes: Array<{
          almacen: string,
          cantidad: number,
          cantidadMinima: number,
          cantidadMaxima: number,
          ventaDiaria: number,
          diasRestantes: number,
          urgencia: URGENCIA,
        }>
      }
    };

    data.forEach((item) => {
      if (!map[item.idProducto]) {
        map[item.idProducto] = {
          idProducto: item.idProducto,
          codigo: item.codigo,
          imagen: item.imagen,
          nombre: item.nombre,
          costo: item.costo ?? 0,
          almacenes: []
        }
      }

      map[item.idProducto].almacenes.push({
        almacen: item.almacen,
        cantidad: item.cantidad,
        cantidadMinima: item.cantidadMinima ?? 0,
        cantidadMaxima: item.cantidadMaxima ?? 0,
        ventaDiaria: item.ventaDiaria ?? 0,
        diasRestantes: item.diasRestantes ?? 0,
        urgencia: item.urgencia ?? URGENCIA.NORMAL,
      });
    });

    return Object.values(map);
  };

  const handleFechaInicial = (date: Date) => {
    setFechaInicial(date);
  };

  const handleFechaFinal = (date: Date) => {
    setFechaFinal(date);
  };

  const handleSucursalChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setIdSucursal(event.target.value)
  };


  const productosParaPedirAgrupados = groupProductsByAlmacen(productosParaPedir);
  const productosParaRematarAgrupados = groupProductsByAlmacen(productosParaRematar);
  const productosDisponiblesAgrupados = groupProductsByAlmacen(productosDisponibles);

  return (
    <ContainerWrapper>
      <SpinnerView
        loading={loading}
        message={msgLoading}
      />

      <Title
        title="Reporte General"
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
              onClick={loadDashboard}
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
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            ¡URGENTE! Productos que debo pedir
          </h3>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-[10%] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase"></th>
                    <th className="w-[20%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Almacen</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Mínimo</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venta Por Día</th>
                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {
                    isEmpty(productosParaPedirAgrupados) ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
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
                      productosParaPedirAgrupados.map((producto, idx) => (
                        <React.Fragment key={idx}>
                          {/* FILA PRINCIPAL (igual que antes) */}
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex justify-center items-center w-20 h-20 rounded border border-solid border-[#e2e8f0]">
                                <Image
                                  default={images.noImage}
                                  src={producto.imagen}
                                  alt={producto.nombre}
                                  overrideClass="w-full h-full object-contain"
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div>
                                <div className="text-sm text-gray-500">
                                  {producto.codigo}
                                </div>
                                <div className="font-medium text-gray-900">
                                  {producto.nombre}
                                </div>
                              </div>
                            </td>
                            <td colSpan={5} className="px-6 py-4 text-gray-600"></td>
                          </tr>

                          {/* CARDS POR ALMACÉN (en lugar de subtabla) */}
                          {
                            producto.almacenes.map((a, i) => {
                              return (
                                <tr key={i}>
                                  <td colSpan={2} className="px-6 py-2"></td>
                                  <td className="px-6 py-4 text-gray-600">{a.almacen}</td>
                                  <td className={cn("px-6 py-4", a.cantidad <= 0 ? "text-red-600" : "text-gray-600")}>{a.cantidad}</td>
                                  <td className="px-6 py-4 text-gray-600">{a.cantidadMinima}</td>
                                  <td className="px-6 py-4 text-gray-600">{rounded(a.ventaDiaria, 0)}</td>
                                  <td className="px-6 py-4">
                                    <p
                                      className={cn(
                                        "inline-flex px-3 py-1 rounded-full text-sm font-bold",
                                      )}>
                                      {a.urgencia === URGENCIA.CRITICO && "🔴 CRITICO"}
                                      {a.urgencia === URGENCIA.PRONTO && "🟠 PRONTO"}
                                      {a.urgencia === URGENCIA.BAJO && "🟡 BAJO"}
                                      {a.urgencia === URGENCIA.NORMAL && "🟢 NORMAL"}
                                    </p>

                                    <p
                                      className={cn(
                                        "inline-flex px-3 py-1 rounded-full text-sm",
                                      )}>
                                      {a.urgencia === URGENCIA.CRITICO && "Se acaba en menos de 3 días"}
                                      {a.urgencia === URGENCIA.PRONTO && "Queda menos de 1 semana"}
                                      {a.urgencia === URGENCIA.BAJO && "Vigilar stock"}
                                      {a.urgencia === URGENCIA.NORMAL && ''}
                                    </p>
                                  </td>
                                </tr>
                              );
                            })
                          }
                        </React.Fragment>
                      ))
                    )
                  }
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="font-semibold text-red-900">
              ⚠️ Estos productos se están vendiendo RÁPIDO pero tienes POCO stock. ¡Pídelos YA o te quedarás sin!
            </p>
          </div>
        </div>

        {/* 2. PRODUCTOS PARA REMATAR - ¿Qué NO se vende? */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-orange-600" />
            Productos para Rematar (NO se venden)
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {
                    isEmpty(productosParaRematarAgrupados) ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="text-gray-500">
                            <i className="bi bi-box text-4xl mb-3 block text-gray-400"></i>
                            <p className="text-lg font-medium">
                              No se encontraron productos
                            </p>
                            <p className="text-sm">No hay registros para rematar</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      productosParaRematarAgrupados.map((producto, idx) => (
                        <React.Fragment key={idx}>
                          <tr>
                            <td className="px-6 py-4">
                              <div className="flex justify-center items-center w-20 h-20 rounded border border-solid border-[#e2e8f0]">
                                <Image
                                  default={images.noImage}
                                  src={producto.imagen}
                                  alt={producto.nombre}
                                  overrideClass="w-full h-full object-contain"
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div>
                                <div className="text-sm text-gray-500">
                                  {producto.codigo}
                                </div>
                                <div className="font-medium text-gray-900">
                                  {producto.nombre}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {formatCurrency(producto.costo, moneda.codiso)}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {producto.almacenes.reduce((a, b) => a + b.cantidad, 0)}
                            </td>
                            <td colSpan={3}></td>
                            {/* <td className="px-6 py-4">
                              <button className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded transition-colors">
                                Hacer Oferta
                              </button>
                            </td> */}
                          </tr>

                          {/* CARDS POR ALMACÉN (en lugar de subtabla) */}
                          <tr>
                            <td colSpan={6} className="px-6 py-2 bg-gray-50">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {producto.almacenes.map((a, i) => (
                                  <div
                                    key={i}
                                    className="bg-gray-100 border border-gray-200 rounded p-3"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-medium text-gray-800">{a.almacen}</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                          Stock: <span className="font-semibold">{a.cantidad}</span>
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                          Inversión: <span className="font-semibold">{formatCurrency(a.cantidad * producto.costo, moneda.codiso)}</span>
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs text-gray-500">Mín: {a.cantidadMinima}</p>
                                        <p className="text-xs text-gray-500">Máx: {a.cantidadMaxima}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
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
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
            <p className="font-semibold text-orange-900 mb-2">
              💡 Estos productos NO se venden. Tienes dinero "dormido" aquí.
            </p>
            <p className="text-sm text-orange-800">
              <strong>Sugerencia:</strong> Haz una oferta especial (2x1, descuento 30%) para recuperar algo de dinero.
              Y <strong>a futuro: NO vuelvas a pedir estos productos</strong>.
            </p>
          </div>
        </div>

        {/* 3. PRODUCTOS DISPONIBLES - Existencia real */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <IoIosInformationCircle className="w-6 h-6 text-blue-600" />
            Productos Disponibles (Existencia Real)
          </h2>
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {
                    isEmpty(productosDisponiblesAgrupados) ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="text-gray-500">
                            <i className="bi bi-box text-4xl mb-3 block text-gray-400"></i>
                            <p className="text-lg font-medium">
                              No se encontraron productos
                            </p>
                            <p className="text-sm">No hay registros para rematar</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      productosDisponiblesAgrupados.map((producto, idx) => (
                        <React.Fragment key={idx}>
                          {/* FILA PRINCIPAL (igual que antes) */}
                          <tr>
                            <td className="px-6 py-4">
                              <div className="flex justify-center items-center w-20 h-20 rounded border border-solid border-[#e2e8f0]">
                                <Image
                                  default={images.noImage}
                                  src={producto.imagen}
                                  alt={producto.nombre}
                                  overrideClass="w-full h-full object-contain"
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div>
                                <div className="text-sm text-gray-500">{producto.codigo}</div>
                                <div className="font-medium text-gray-900">{producto.nombre}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-semibold">
                              {producto.almacenes.reduce((a, b) => a + b.cantidad, 0)}
                            </td>
                            <td colSpan={3}></td>
                          </tr>

                          {/* CARDS POR ALMACÉN (en lugar de subtabla) */}
                          <tr>
                            <td colSpan={6} className="px-6 py-2 bg-gray-50">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {producto.almacenes.map((a, i) => (
                                  <div
                                    key={i}
                                    className="bg-gray-100 border border-gray-200 rounded p-3"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-medium text-gray-800">{a.almacen}</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                          Stock: <span className="font-semibold">{a.cantidad}</span>
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs text-gray-500">Mín: {a.cantidadMinima}</p>
                                        <p className="text-xs text-gray-500">Máx: {a.cantidadMaxima}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="font-semibold text-blue-900">
              💡 Lista de productos disponibles (existencia real)
            </p>
            <p className="text-sm text-blue-800">
              Estos productos están disponibles para ser vendidos, pero no están en la lista de pedidos.
            </p>
          </div>
        </div>
      </div>

    </ContainerWrapper >
  );
}

export default ReporteInventario;