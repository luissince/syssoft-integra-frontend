import React, { useState, useEffect } from "react";
import ContainerWrapper from "@/components/ui/container-wrapper";
import Title from "@/components/Title";
import { SpinnerView } from "@/components/Spinner";
import Paginacion from "@/components/Paginacion";
import { BsDatabaseSlash } from "react-icons/bs";
import { useHistory } from "react-router-dom";

interface HistorialesInterface {
  id: number;
  activo: string;
  serie: string;
  responsable: string;
  area: string;
  fechaAsignacion: string;
  fechaDevolucion: string | null;
  estado: string;
}

const Historiales = () => {
  const history = useHistory();
  const [historial, setHistorial] = useState<HistorialesInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginacion, setPaginacion] = useState(1);
  const [totalPaginacion, setTotalPaginacion] = useState(0);
  const [filasPorPagina] = useState(10);

  useEffect(() => {
    const fetchHistorial = async () => {
      setLoading(true);
      // Simulación de llamada API
      const mockData: HistorialesInterface[] = [
        { id: 1, activo: "Laptop Dell XPS 15", serie: "SN001", responsable: "Juan Pérez", area: "Ventas", fechaAsignacion: "01/04/2026", fechaDevolucion: "05/04/2026", estado: "Devuelto" },
        { id: 2, activo: "Proyector Epson", serie: "SN002", responsable: "María López", area: "Soporte Técnico", fechaAsignacion: "02/04/2026", fechaDevolucion: null, estado: "Asignado" },
      ];
      setHistorial(mockData);
      setTotalPaginacion(Math.ceil(mockData.length / filasPorPagina));
      setLoading(false);
    };
    fetchHistorial();
  }, []);

  const renderBody = () => {
    if (historial.length === 0) {
      return (
        <tr>
          <td colSpan={7} className="px-6 py-12 text-center">
            <div className="flex flex-col items-center">
              <BsDatabaseSlash className="w-12 h-12 text-gray-400" />
              <p className="mt-2 text-sm font-medium text-gray-900">No hay registros</p>
            </div>
          </td>
        </tr>
      );
    }

    return historial.map((item) => (
      <tr key={item.id} className={item.fechaDevolucion ? "bg-green-50" : "bg-yellow-50"}>
        <td className="px-6 py-4 text-sm text-gray-900">{item.activo}</td>
        <td className="px-6 py-4 text-sm text-gray-900">{item.serie}</td>
        <td className="px-6 py-4 text-sm text-gray-900">{item.responsable}</td>
        <td className="px-6 py-4 text-sm text-gray-900">{item.area}</td>
        <td className="px-6 py-4 text-sm text-gray-900">{item.fechaAsignacion}</td>
        <td className="px-6 py-4 text-sm text-gray-900">{item.fechaDevolucion || "---"}</td>
        <td className="px-6 py-4 text-sm text-gray-900">
          <span className={`px-2 py-1 rounded-full text-xs ${item.fechaDevolucion ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
            {item.estado}
          </span>
        </td>
      </tr>
    ));
  };

  return (
    <ContainerWrapper>
      <SpinnerView loading={loading} message="Cargando historial..." />

      <Title
        title="Historial"
        subTitle="ASIGNACIONES"
        handleGoBack={() => history.goBack()}
      />

      <div className="rounded border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsable</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Asignación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Devolución</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {renderBody()}
          </tbody>
        </table>

        <Paginacion
          totalPaginacion={totalPaginacion}
          paginacion={paginacion}
          fillTable={setPaginacion}
          theme="modern"
          className="md:px-4 py-3 bg-white border-t border-gray-200"
        />
      </div>
    </ContainerWrapper>
  );
};

export default Historiales;