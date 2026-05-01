import Button from "@/components/Button";
import Image from "@/components/Image";
import SearchInput from "@/components/SearchInput";
import { SpinnerView } from "@/components/Spinner";
import TextArea from "@/components/TextArea";
import Title from "@/components/Title";
import ContainerWrapper from "@/components/ui/container-wrapper";
import { images } from "@/helper";
import { isEmpty } from "@/helper/utils.helper";
import SuccessResponse from "@/model/class/response";
import { ProductFilterInterface } from "@/model/ts/interface/product";
import { TIPO_PRODUCTO_ACTIVO_FIJO } from "@/model/types/tipo-producto";
import { updateGestion } from "@/network/rest/api-client";
import { filtrarPersona, filtrarProducto } from "@/network/rest/principal.network";
import { alertKit } from "alert-kit";
import React, { useRef, useState } from "react";
import { FaAsterisk } from "react-icons/fa";
import { useHistory } from "react-router-dom";

const GestionEditar = () => {

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

  const [responsable, setResponsable] = useState<any>(null);
  const [responsables, setResponsables] = useState<any[]>([]);

  const [activo, setActivo] = useState<ProductFilterInterface>(null);
  const [activos, setActivos] = useState<ProductFilterInterface[]>([]);

  const [descripcion, setDescripcion] = useState("");

  // =============================
  // REFS
  // =============================

  const refResponsable = useRef<any>(null);
  const refValueResponsable = useRef<any>(null);
  const refActivo = useRef<any>(null);
  const refValueActivo = useRef<any>(null);
  const refDetalle = useRef<any>(null);

  // =============================
  // CONTROLLERS
  // =============================


  // =============================
  // HANDLERS
  // =============================

  // responsable filtro
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

  // activo filtro
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
      const productosFiltrados = response.data.filter((item: ProductFilterInterface) => item.idTipoProducto === TIPO_PRODUCTO_ACTIVO_FIJO);

      setActivos(productosFiltrados);
    }
  }

  const handleSelectItemActivo = (producto: ProductFilterInterface) => {
    refActivo.current.initialize(producto.nombre);

    setResponsable(producto);
    setResponsables([]);
  }

  // Detalle
  const handleInputDescripcion = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescripcion(event.target.value);
  };

  // Guardar
  const handleGuardar = async () => {
    const params = {
      idProducto: activo.idProducto,
      nombre: activo.nombre,
      descripcion: descripcion,
      imagen: activo.imagen,
    };

    const { success, data, message } = await updateGestion(params);

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

        <div className="md:col-span-2">
          <TextArea
            label={
              <div className="flex items-center gap-1">
                <p className="text-gray-700 font-medium">Detalles:</p>  <FaAsterisk className="text-red-500" size={8} />
              </div>
            }
            rows={3}
            ref={refDetalle}
            value={descripcion}
            onChange={handleInputDescripcion}
          />
        </div>
      </div>

       <div className="flex flex-col sm:flex-row gap-3 mt-3">
        <Button
          className="btn-warning sm:w-auto w-full flex items-center justify-center gap-2"
          onClick={handleGuardar}
        >
          <i className="fa fa-pencil"></i> Guardar
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

export default GestionEditar;