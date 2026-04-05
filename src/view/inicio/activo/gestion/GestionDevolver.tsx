import Button from "@/components/Button";
import SearchInput from "@/components/SearchInput";
import Select from "@/components/Select";
import TextArea from "@/components/TextArea";
import Title from "@/components/Title";
import ContainerWrapper from "@/components/ui/container-wrapper";
import { alertKit } from "alert-kit";
import { useRef, useState } from "react";
import { FaAsterisk } from "react-icons/fa";
import { useHistory } from "react-router-dom";

const GestionDevolver = () => {
  const history = useHistory();
  const [activo, setActivo] = useState<any>(null);
  const [activos, setActivos] = useState<any[]>([]);
  const [estado, setEstado] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(false);

  const refActivo = useRef<any>(null);
  const refEstado = useRef<any>(null);
  const refObservaciones = useRef<any>(null);

  const handleFilterActivo = async (text: string) => {
    // Lógica para filtrar activos (similar a tu código actual)
  };

  const handleSelectActivo = (value: any) => {
    setActivo(value);
  };

  const handleGuardarDevolucion = async () => {
    if (!activo || !estado) {
      alertKit.warning({ title: "Advertencia", message: "Debe seleccionar un activo y su estado." });
      return;
    }

    setLoading(true);
    // Lógica para registrar la devolución en el backend
    try {
      // Simulación de llamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      alertKit.success({ title: "Éxito", message: "Devolución registrada correctamente." }, () => {
        history.goBack();
      });
    } catch (error) {
      alertKit.error({ title: "Error", message: "No se pudo registrar la devolución." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContainerWrapper>
      <Title title="Devolución de Equipo" subTitle="REGISTRAR" handleGoBack={() => history.goBack()} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Buscador de activo */}
        <SearchInput
          group={true}
          label={
            <div className="flex items-center gap-1">
              <p className="text-gray-700 font-medium">Activo:</p> <FaAsterisk className="text-red-500" size={8} />
            </div>
          }
          ref={refActivo}
          placeholder="Buscar activo"
          data={activos}
          handleFilter={handleFilterActivo}
          handleSelectItem={handleSelectActivo}
          renderItem={(value) => (
            <div>
              <p className="font-medium">{value.nombre}</p>
              <p className="text-sm text-gray-500">Serie: {value.serie}</p>
            </div>
          )}
        />

        {/* Estado del equipo */}
        <div>
          <Select
            label={
              <div className="flex items-center gap-1">
                <p>Estado del equipo:</p> <FaAsterisk className="text-red-500" size={8} />
              </div>
            }
            ref={refEstado}
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Seleccionar estado</option>
            <option value="bueno">En buen estado</option>
            <option value="mantenimiento">Requiere mantenimiento</option>
            <option value="danado">Dañado</option>
          </Select>
        </div>

        {/* Observaciones */}
        <div className="md:col-span-2">
          <TextArea
            label="Observaciones:"
            rows={3}
            ref={refObservaciones}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>

        {/* Resumen de devolución */}
        {activo && (
          <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-lg mb-2 text-blue-700">Resumen de Devolución</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Activo:</p>
                <p className="font-medium">{activo.nombre} (Serie: {activo.serie})</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Estado:</p>
                <p className="font-medium">{estado || "No seleccionado"}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-3">
        <Button
          className={`btn-success sm:w-auto w-full flex items-center justify-center gap-2 ${!activo || !estado ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={handleGuardarDevolucion}
          disabled={!activo || !estado}
        >
          <i className="fa fa-save"></i> Registrar Devolución
        </Button>
        <Button
          className="btn-danger sm:w-auto w-full flex items-center justify-center gap-2"
          onClick={() => history.goBack()}
        >
          <i className="fa fa-close"></i> Cancelar
        </Button>
      </div>
    </ContainerWrapper>
  );
};

export default GestionDevolver;