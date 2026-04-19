import Button from "@/components/Button";
import Image from "@/components/Image";
import Paginacion from "@/components/Paginacion";
import SearchInput from "@/components/SearchInput";
import { SpinnerView } from "@/components/Spinner";
import TextArea from "@/components/TextArea";
import Title from "@/components/Title";
import ContainerWrapper from "@/components/ui/container-wrapper";
import { images } from "@/helper";
import { isEmpty } from "@/helper/utils.helper";
import { cn } from "@/lib/utils";
import SuccessResponse from "@/model/class/response";
import { KardexListDepreciacionInterface, KardexResponseListDepreciacionInterface } from "@/model/ts/interface/kardex";
import { PersonFilterInterface } from "@/model/ts/interface/person";
import { ProductFilterInterface } from "@/model/ts/interface/product";
import { ACTIVO_FIJO } from "@/model/types/tipo-producto";
import { createGestion, listarDepreciacionKardex } from "@/network/rest/api-client";
import { filtrarPersona, filtrarProducto } from "@/network/rest/principal.network";
import { useAppSelector } from "@/redux/hooks";
import { alertKit } from "alert-kit";
import React, { useEffect, useRef, useState } from "react";
import { BsDatabaseSlash } from "react-icons/bs";
import { FaAsterisk } from "react-icons/fa";
import { GrUserAdd } from "react-icons/gr";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

const GestionCrear = () => {

  // =============================
  // REDUX
  // =============================
  const moneda = useAppSelector((state) => state.predeterminado.moneda);
  const token = useAppSelector((state) => state.principal);

  // =============================
  // ROUTER
  // =============================
  const history = useHistory();

  // =============================
  // STATE
  // =============================

  // Estados de carga
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState("Cargando datos...");

  const [responsable, setResponsable] = useState<PersonFilterInterface | null>(null);
  const [responsables, setResponsables] = useState<PersonFilterInterface[]>([]);

  const [activo, setActivo] = useState<ProductFilterInterface | null>(null);
  const [activos, setActivos] = useState<ProductFilterInterface[]>([]);
  const [activoSeleccionado, setActivoSeleccionado] = useState<KardexListDepreciacionInterface[] | null>(null);

  const [observacion, setObservacion] = useState("");

  const [lista, setLista] = useState<KardexListDepreciacionInterface[]>([]);
  const [paginacion, setPaginacion] = useState(1);
  const [totalPaginacion, setTotalPaginacion] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(5);
  const [restart, setRestart] = useState(false);

  // =============================
  // REFS
  // =============================

  const refResponsable = useRef<any>(null);
  const refValueResponsable = useRef<any>(null);
  const refActivo = useRef<any>(null);
  const refValueActivo = useRef<any>(null);
  const refDetalle = useRef<any>(null);
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

    const { success, data, message } = await listarDepreciacionKardex(body, abortControllerDetalle.current.signal);
    if (!success) {
      alertKit.warning({
        title: "Depreciar",
        message: message,
      });

      setLoading(false);
      return;
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

  // Eventos para filtrar el responsable
  const handleClearInputResponsable = () => {
    setResponsable(null);
    setResponsables([]);
  }

  const handleFilterResponsable = async (text: string) => {
    setResponsable(null);

    if (isEmpty(text)) {
      setResponsables([]);
      return;
    }

    const params = {
      opcion: 1,
      filter: text,
      personal: true,
    };

    const response = await filtrarPersona(params);

    if (response instanceof SuccessResponse) {
      setResponsables(response.data);
    }
  }

  const handleSelectItemResponsable = (value: any) => {
    refResponsable.current.initialize(value.documento + ' - ' + value.informacion);

    setResponsable(value);
    setResponsables([]);
  }

  // Eventos para filtrar el activo
  const handleClearInputActivo = () => {
    setActivo(null);
    setActivos([]);
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

  // Evento para ingresar el detalle de la gestión
  const handleInputDetalles = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setObservacion(event.target.value);
  };

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

  // Evento para guardar la gestión
  const handleGuardar = async () => {
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
      const body = {
        tipo: "ENTREGA",
        idPersona: responsable.idPersona,
        descripcion: observacion,
        activos: activoSeleccionado?.map(item => ({
          idProducto: item.idProducto,
          idInventarioActivo: item.idInventarioActivo,
          cantidad: item.cantidad,
        })),
        idUsuario: token.userToken.usuario.idUsuario,
      };

      const { success, data, message } = await createGestion(body);

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

  const onClear = (id: number, idProducto: string) => {
    setActivoSeleccionado(prev => {
      if (!prev) return prev;

      return prev.filter(
        item =>
          !(item.id === id && item.idProducto === idProducto)
      );
    });
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
              <p className="mt-2 text-sm font-medium text-gray-900">No hay datos para mostrar</p>
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
              className={`p-1 rounded-full ${isSelected? "bg-blue-100" : "hover:bg-gray-100"} ${item.cantidad === 0 ? "cursor-not-allowed opacity-50" : ""}`}
              onClick={() => handleSelectActivo(item)}
              disabled={item.cantidad === 0}
            >
              <GrUserAdd className={`h-5 w-5 ${isSelected ? "text-blue-600" : "text-gray-500"}`} />
            </button>
          </td>
        </tr>
      );
    });
  };

  // =============================
  // RENDER
  // =============================

  return (
    <ContainerWrapper>
      <SpinnerView
        loading={loading}
        message={msgLoading}
      />

      {/* Encabezado */}
      <Title
        title="Gestion"
        subTitle="CREAR"
        handleGoBack={() => history.goBack()}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-1">
          <SearchInput
            group={true}
            label={
              <div className="flex items-center gap-1">
                <p className="text-gray-700 font-medium">Responsable:</p>  <FaAsterisk className="text-red-500" size={8} />
              </div>
            }
            ref={refResponsable}
            placeholder="Buscar responsable"
            refValue={refValueResponsable}
            data={responsables}
            handleClearInput={handleClearInputResponsable}
            handleFilter={handleFilterResponsable}
            handleSelectItem={handleSelectItemResponsable}
            renderItem={(value: any) => (
              <div className="flex flex-col">
                <span className="font-medium">{value.documento}</span>
                <span className="text-sm">{value.informacion}</span>
              </div>
            )}
            classNameContainer="w-full relative group"
          />
        </div>

        <div className="md:col-span-1">
          <SearchInput
            group={true}
            label={
              <div className="flex items-center gap-1">
                <p className="text-gray-700 font-medium">Activo:</p>  <FaAsterisk className="text-red-500" size={8} />
              </div>
            }
            ref={refActivo}
            placeholder="Buscar activo"
            refValue={refValueActivo}
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
            classNameContainer="w-full relative group"
          />
        </div>

        {responsable && (
          <div className="md:col-span-2 mt-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-lg mb-2 text-gray-700">Persona Asignada</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                {responsable.informacion.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{responsable.informacion}</p>
                <p className="text-sm text-gray-500">Documento: {responsable.documento}</p>
                <p className="text-sm text-gray-500">Área: {responsable.area || "No especificado"}</p>
                <p className="text-sm text-gray-500">Cargo: {responsable.cargo || "No especificado"}</p>
              </div>
            </div>
          </div>
        )}

        <div className="md:col-span-2">
          <TextArea
            label={
              <div className="flex items-center gap-1">
                <p className="text-gray-700 font-medium">Detalles:</p>  <FaAsterisk className="text-red-500" size={8} />
              </div>
            }
            rows={3}
            ref={refDetalle}
            value={observacion}
            onChange={handleInputDetalles}
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
                    Serrie
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

        {activoSeleccionado && activoSeleccionado.length > 0 && responsable && (
          <div className="md:col-span-2 bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-lg mb-2 text-green-700">Resumen de Asignación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* IZQUIERDA - PERSONA */}
              <div className="">
                <p className="text-sm font-medium text-gray-600">Asignado a:</p>
                <p className="font-medium">{responsable.informacion}</p>
              </div>

              {/* DERECHA - ACTIVOS */}
              <div className="flex flex-col gap-4">
                {activoSeleccionado.map((activo) => (
                  <div key={`${activo.idProducto}-${activo.id}`} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{activo.producto}</p>
                      <p className="font-medium">{activo.serie} {activo.ubicacion ? ` - ${activo.ubicacion}` : ""}</p>
                    </div>

                    <Button
                      className="btn-outline-secondary"
                      onClick={() => onClear(activo.id, activo.idProducto)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>


      <div className="flex flex-col sm:flex-row gap-3 mt-3">
        <Button
          className={`btn-success sm:w-auto w-full flex items-center justify-center gap-2 ${!activoSeleccionado || !responsable ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={handleGuardar}
          disabled={!activoSeleccionado || activoSeleccionado.length === 0 || !responsable}
        >
          <i className="fa fa-save"></i> Guardar
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

export default GestionCrear;