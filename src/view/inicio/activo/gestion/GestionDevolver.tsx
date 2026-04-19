import Button from "@/components/Button";
import Image from "@/components/Image";
import Paginacion from "@/components/Paginacion";
import SearchInput from "@/components/SearchInput";
import Select from "@/components/Select";
import { SpinnerView } from "@/components/Spinner";
import TextArea from "@/components/TextArea";
import Title from "@/components/Title";
import ContainerWrapper from "@/components/ui/container-wrapper";
import { images } from "@/helper";
import { isEmpty } from "@/helper/utils.helper";
import SuccessResponse from "@/model/class/response";
import { KardexListDepreciacionInterface } from "@/model/ts/interface/kardex";
import { PersonFilterInterface } from "@/model/ts/interface/person";
import { ProductFilterInterface } from "@/model/ts/interface/product";
import { ACTIVO_FIJO } from "@/model/types/tipo-producto";
import { devolverGestion, listarDepreciacionDevolucion, listarDepreciacionKardex } from "@/network/rest/api-client";
import { filtrarProducto } from "@/network/rest/principal.network";
import { useAppSelector } from "@/redux/hooks";
import { alertKit } from "alert-kit";
import { UserMinus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BsDatabaseSlash } from "react-icons/bs";
import { FaAsterisk } from "react-icons/fa";
import { useHistory } from "react-router-dom";

const GestionDevolver = () => {

  // =============================
  // REDUX
  // =============================
  const token = useAppSelector((state) => state.principal);

  // =============================
  // STATE
  // =============================

  // Estados de carga
  const [msgLoading, setMsgLoading] = useState("Cargando datos...");

  const history = useHistory();
  const [activo, setActivo] = useState<ProductFilterInterface | null>(null);
  const [activos, setActivos] = useState<ProductFilterInterface[]>([]);
  const [activoSeleccionado, setActivoSeleccionado] = useState<KardexListDepreciacionInterface[] | null>(null);
  const [messageData, setMessageData] = useState("No hay datos para mostrar");

  const [estado, setEstado] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(false);

  const [lista, setLista] = useState<KardexListDepreciacionInterface[]>([]);
  const [paginacion, setPaginacion] = useState(1);
  const [totalPaginacion, setTotalPaginacion] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(5);

  const [restart, setRestart] = useState(false);

  // =============================
  // REFS
  // =============================

  const refActivo = useRef<any>(null);
  const refEstado = useRef<any>(null);
  const refObservaciones = useRef<any>(null);
  const refPaginacion = useRef<any>(null);

  // =============================
  // CONTROLLERS
  // =============================

  const abortControllerDetalle = useRef<AbortController | null>(null);

  // =============================
  // API
  // =============================

  const loadDetail = async () => {
    abortControllerDetalle.current?.abort();
    abortControllerDetalle.current = new AbortController();

    setLoading(true);
    setMsgLoading("Cargando datos de depreciación...");

    const body = {
      opcion: 0,
      idProducto: activo.idProducto,
      idAlmacen: "",
      posicionPagina: (paginacion - 1) * filasPorPagina,
      filasPorPagina: filasPorPagina,
    };

    const { success, data, message } = await listarDepreciacionDevolucion(body, abortControllerDetalle.current.signal);

    if (!success) {
      alertKit.warning({
        title: "Depreciar",
        message: message,
      });

      setLoading(false);
      return;
    }

    if (data.result = data.result || []) {
      setMessageData("Los items estan sin asignar");
    }

    const total = Math.ceil(Number(data.total) / filasPorPagina);

    abortControllerDetalle.current = null;
    setTotalPaginacion(total);
    setLista(data.result);
    setLoading(false);
  };

  // =============================
  // EFFECTS
  // =============================

  useEffect(() => { setLoading(false); }, []);

  useEffect(() => {
    if (activo?.idProducto && paginacion) {
      loadDetail();
    }
  }, [activo, paginacion]);

  // =============================
  // HANDLERS
  // =============================

  // Eventos para filtrar el activo
  const handleClearInputActivo = () => {
    setActivo(null);
    setActivos([]);
    setMessageData("No hay datos para mostrar");
  }

  const handleFilterActivo = async (text: string) => {
    setActivo(null);

    if (isEmpty(text)) {
      setActivos([]);
      return;
    }

    const params = {
      filtrar: text
    };

    const response = await filtrarProducto(params);

    if (response instanceof SuccessResponse) {
      const productosFiltrados = response.data.filter((item: ProductFilterInterface) => item.idTipoProducto === ACTIVO_FIJO);

      setActivos(productosFiltrados);
    }
  }

  const handleSelectItemActivo = (producto: ProductFilterInterface) => {
    refActivo.current.initialize(producto.nombre);

    setActivo(producto);
    setLista([]);
    setActivos([]);
  }

  // Evento para seleccionar el activo
  const handleSelectActivo = (value: KardexListDepreciacionInterface) => {
    setActivoSeleccionado(prev => {
      if (!prev) return [value];

      const exists = prev.some(
        item =>
          item.id === value.id &&
          item.idProducto === value.idProducto
      );

      if (exists) {
        return prev.filter(
          item =>
            !(item.id === value.id && item.idProducto === value.idProducto)
        );
      }

      return [...prev, value];
    });
  };

  // Evento para cambiar la paginación
  const handleFillTable = (page: number) => {
    setPaginacion(page);
    setRestart(false);
  };

  const onClear = (id: number, idProducto: string) => {
    setActivoSeleccionado(prev => {
      if (!prev) return prev;

      return prev.filter(
        item =>
          !(item.id === id && item.idProducto === idProducto)
      );
    });
  };

  const handleGuardarDevolucion = async () => {
    const accept = await alertKit.question({
      title: "Gestión",
      message: "¿Estás seguro de continuar?",
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      const object = {
        tipo: "DEVOLUCION",
        descripcion: observaciones,
        activos: activoSeleccionado?.map(item => ({
          idPersona: item.idPersona,
          idProducto: item.idProducto,
          idInventarioActivo: item.idInventarioActivo,
          cantidad: item.cantidad,
        })),
        idUsuario: token.userToken.usuario.idUsuario,
      };

      const body = Object.values(
        object.activos.reduce((acc, item) => {
          if (!acc[item.idPersona]) {
            acc[item.idPersona] = {
              tipo: object.tipo,
              descripcion: object.descripcion,
              idPersona: item.idPersona,
              activos: [],
              idUsuario: object.idUsuario
            };
          }

          acc[item.idPersona].activos.push({
            idProducto: item.idProducto,
            idInventarioActivo: item.idInventarioActivo,
            cantidad: item.cantidad + 1
          });

          return acc;
        }, {})
      );

      const { success, data, message } = await devolverGestion(body);

      if (!success) {
        alertKit.warning({
          title: "Gestion",
          message: message,
        });
        return;
      }

      alertKit.success({
        title: "Gestion",
        message: data,
      }, () => {
        history.goBack();
      });
    }
  };

  // =============================
  // RENDER HELPERS
  // =============================

  const renderBody = () => {
    if (!lista || lista.length === 0) {
      return (
        <tr>
          <td colSpan={8} className="px-6 py-12 text-center">
            <div className="flex flex-col items-center">
              <BsDatabaseSlash className="w-12 h-12 text-gray-400" />
              <p className="mt-2 text-sm font-medium text-gray-900">{messageData}</p>
            </div>
          </td>
        </tr>
      );
    }

    return lista.map((item) => {
      const isSelected = activoSeleccionado?.some(
        (selected) =>
          selected.id === item.id &&
          selected.idProducto === item.idProducto
      );

      return (
        <tr
          key={`${item.idProducto}-${item.id}`}
          className={isSelected ? "bg-blue-50" : ""}
        >
          <td className="px-6 py-4 text-sm text-gray-900">{item.serie}</td>
          <td className="px-6 py-4 text-sm text-gray-900">{item.almacen}</td>
          <td className="px-6 py-4 text-sm text-gray-900">{item.ubicacion}</td>
          <td className="px-6 py-4 text-sm text-gray-900 text-center">{item.cantidad}</td>
          <td className="px-6 py-4 text-sm text-gray-900 text-center">
            <button
              className={`p-1 rounded-full ${isSelected ? "bg-blue-100" : "hover:bg-gray-100"} ${item.cantidad === 0 ? "cursor-not-allowed opacity-50" : ""}`}
              onClick={() => handleSelectActivo(item)}
            >
              <UserMinus className={`h-5 w-5 ${isSelected ? "text-blue-600" : "text-gray-500"}`} />
            </button>
          </td>
        </tr>
      );
    });
  };

  return (
    <ContainerWrapper>
      <SpinnerView loading={loading} message={msgLoading}
      />

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
          handleClearInput={handleClearInputActivo}
          handleFilter={handleFilterActivo}
          handleSelectItem={handleSelectItemActivo}
          renderItem={(value: any) => (
            <div className="flex items-center">
              <Image
                default={images.noImage}
                src={value.imagen}
                alt={value.nombre}
                overrideClass="w-16 h-16 object-contain"
              />
              <div className="ml-2">
                <p className="text-xs font-bold">{value.codigo}</p>
                <p className="text-sm">{value.nombre}</p>
              </div>
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

        {/* Tabla de movimientos */}
        <div className="md:col-span-2">
          <div className="rounded border border-gray-200 overflow-hidden">
            {/* Encabezado de la tabla */}
            <div className="p-3 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-sm text-gray-700 font-medium">Lista de series</h2>
              </div>
            </div>

            {/* Contenedor de la tabla con scroll horizontal */}
            <table className="min-w-full divide-y divide-gray-200">
              {/* Encabezado de la tabla */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Almacen
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saldo
                  </th>
                </tr>
              </thead>
              {/* Cuerpo de la tabla */}
              <tbody className="bg-white divide-y divide-gray-200">
                {renderBody()}
              </tbody>
            </table>

            <Paginacion
              ref={refPaginacion}
              loading={loading}
              data={lista}
              totalPaginacion={totalPaginacion}
              paginacion={paginacion}
              fillTable={handleFillTable}
              restart={restart}
              theme="modern"
              className="md:px-4 py-3 bg-white border-t border-gray-200"
            />
          </div>
        </div>

        {activoSeleccionado && activoSeleccionado.length > 0 && (
          <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-lg mb-2 text-blue-700">Resumen de Devolución</h3>

            {activoSeleccionado.map((activo) => (
              <div className="grid grid-cols-1 md:grid-cols-2 my-4" key={`${activo.idProducto}-${activo.id}`}>
                {/* IZQUIERDA - PERSONA */}
                <div className="">
                  <p className="text-sm font-medium text-gray-600">Asignado a:</p>
                  <p className="font-medium">{activo.informacion}</p>
                </div>

                {/* DERECHA - ACTIVOS */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{activo.producto}</p>
                      <p className="font-medium">{activo.serie} {activo.ubicacion ? `- ${activo.ubicacion}` : ""}</p>
                    </div>

                    <Button
                      className="btn-outline-secondary"
                      onClick={() => onClear(activo.id, activo.idProducto)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-3">
        <Button
          className={`btn-success sm:w-auto w-full flex items-center justify-center gap-2 ${!activoSeleccionado || activoSeleccionado.length <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={handleGuardarDevolucion}
          disabled={!activoSeleccionado || activoSeleccionado.length <= 0}
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