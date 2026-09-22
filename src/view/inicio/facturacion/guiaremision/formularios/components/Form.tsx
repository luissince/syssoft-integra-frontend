import Input from "@/components/Input";
import RadioButton from "@/components/RadioButton";
import SearchInput from "@/components/SearchInput";
import Select from "@/components/Select";
import { Badge } from "@/components/ui/badge";
import { isEmpty, keyNumberFloat } from "@/helper/utils.helper";
import { MODALIDAD_TRASLADO } from "@/model/types/modalidad-traslado";
import { MOTIVO_TRASLADO } from "@/model/types/motivo-traslado";

interface FormProps {
    idMotivoTraslado: string;

    refFiltrarVenta: any;
    refVenta: React.RefObject<SearchInput>;
    ventas: Array<any>;
    handleClearInputVenta: any;
    handleFilterVenta: any;
    handleSelectItemVenta: any;

    refComprobante?: React.RefObject<HTMLSelectElement>;
    comprobantes?: Array<any>;
    idComprobante?: any;
    handleSelectComprobante?: any;

    venta: any;

    idModalidadTraslado: string;
    handleInputModalidadTraslado: any;

    refMotivoTraslado: React.RefObject<HTMLSelectElement>;
    motivoTraslado: Array<any>;
    handleSelectMotivoTraslado: any;

    fechaTraslado: string;
    handleInputFechaTraslado: any;

    refTipoPeso: React.RefObject<HTMLSelectElement>;
    idTipoPeso: string;
    tipoPeso: Array<any>;
    handleSelectTipoPeso: any;

    refPeso: React.RefObject<HTMLInputElement>;
    peso: string;
    handleInputPeso: any;

    refVehiculo: React.RefObject<SearchInput>;
    disabledPublica: boolean;
    refFiltrarVehiculo: React.RefObject<HTMLInputElement>;
    vehiculos: Array<any>;
    handleClearInputVehiculo: any;
    handleFilterVehiculo: any;
    handleSelectItemVehiculo: any;

    refConductor: React.RefObject<SearchInput>;
    refFiltrarConductor: React.RefObject<HTMLInputElement>;
    conductores: Array<any>;
    handleClearInputConductor: any;
    handleFilterConductor: any;
    handleSelectItemConductor: any;

    refConductorPublico: React.RefObject<SearchInput>;
    disabledPrivado: boolean;
    refFiltrarConductorPublico: React.RefObject<HTMLInputElement>;
    conductoresPublico: Array<any>;
    handleClearInputConductorPublico: any;
    handleFilterConductorPublico: any;
    handleSelectItemConductorPublico: any;

    refCodigoAnexoPartida: React.RefObject<HTMLInputElement>;
    codigoAnexoPartida: string;
    handleInputCodigoAnexoPartida: any;

    refDireccionPartida: React.RefObject<HTMLInputElement>;
    direccionPartida: string;
    handleInputDireccionPartida: any;

    refUbigeoPartida: React.RefObject<SearchInput>;
    refFiltrarUbigeoPartida: React.RefObject<HTMLInputElement>;
    ubigeosPartida: Array<any>;
    handleClearInputaUbigeoPartido: any;
    handleFilterUbigeoPartido: any;
    handleSelectItemUbigeoPartido: any;

    refCodigoAnexoLlegada: React.RefObject<HTMLInputElement>;
    codigoAnexoLlegada: string;
    handleInputCodigoAnexoLlegada: any;

    refDireccionLlegada: React.RefObject<HTMLInputElement>;
    direccionLlegada: string;
    handleInputDireccionLlegada: any;

    refUbigeoLlegada: React.RefObject<SearchInput>;
    refFiltrarUbigeoLlegada: React.RefObject<HTMLInputElement>;
    ubigeosLlegada: Array<any>;
    handleClearInputaUbigeoLlegada: any;
    handleFilterUbigeoLlegada: any;
    handleSelectItemUbigeoLlegada: any;

    detalles: Array<any>;
}

const Form = ({
    idMotivoTraslado,

    refFiltrarVenta,
    refVenta,
    ventas,
    handleClearInputVenta,
    handleFilterVenta,
    handleSelectItemVenta,

    refComprobante,
    comprobantes,
    idComprobante,
    handleSelectComprobante,

    venta,

    idModalidadTraslado,
    handleInputModalidadTraslado,

    refMotivoTraslado,
    motivoTraslado,
    handleSelectMotivoTraslado,

    fechaTraslado,
    handleInputFechaTraslado,

    refTipoPeso,
    idTipoPeso,
    tipoPeso,
    handleSelectTipoPeso,

    refPeso,
    peso,
    handleInputPeso,

    refVehiculo,
    disabledPublica,
    refFiltrarVehiculo,
    vehiculos,
    handleClearInputVehiculo,
    handleFilterVehiculo,
    handleSelectItemVehiculo,

    refConductor,
    refFiltrarConductor,
    conductores,
    handleClearInputConductor,
    handleFilterConductor,
    handleSelectItemConductor,

    refConductorPublico,
    disabledPrivado,
    refFiltrarConductorPublico,
    conductoresPublico,
    handleClearInputConductorPublico,
    handleFilterConductorPublico,
    handleSelectItemConductorPublico,

    refCodigoAnexoPartida,
    codigoAnexoPartida,
    handleInputCodigoAnexoPartida,

    refDireccionPartida,
    direccionPartida,
    handleInputDireccionPartida,

    refUbigeoPartida,
    refFiltrarUbigeoPartida,
    ubigeosPartida,
    handleClearInputaUbigeoPartido,
    handleFilterUbigeoPartido,
    handleSelectItemUbigeoPartido,

    refCodigoAnexoLlegada,
    codigoAnexoLlegada,
    handleInputCodigoAnexoLlegada,

    refDireccionLlegada,
    direccionLlegada,
    handleInputDireccionLlegada,

    refUbigeoLlegada,
    refFiltrarUbigeoLlegada,
    ubigeosLlegada,
    handleClearInputaUbigeoLlegada,
    handleFilterUbigeoLlegada,
    handleSelectItemUbigeoLlegada,

    detalles,
}: FormProps) => {
    return (
        <>
            {/* ===================== 1 ======================= */}
            <h6>
                <span className="badge badge-primary">-</span> Guía
            </h6>

            <div className="dropdown-divider"></div>

            <div>
                {
                    idMotivoTraslado === MOTIVO_TRASLADO.TRASLADO_ENTRE_ESTABLECIMIENTO_MISMA_EMPRESA ?
                        <div className="mb-3">
                            <Badge variant="outline" className="text-sm bg-primary text-white">Ligado a un traslado</Badge>
                        </div>
                        :
                        <SearchInput
                            ref={refVenta}
                            autoFocus={true}
                            label={
                                <label>
                                    Filtrar Venta: <i className="fa fa-asterisk text-danger small"></i>
                                </label>
                            }
                            placeholder="Ejm: B001, 1, F001..."
                            refValue={refFiltrarVenta}
                            data={ventas}
                            handleClearInput={handleClearInputVenta}
                            handleFilter={handleFilterVenta}
                            handleSelectItem={handleSelectItemVenta}
                            renderItem={(value) => (
                                <>
                                    <span>
                                        {value.nombreComprobante} {value.serie}-{value.numeracion}
                                    </span>
                                    {' / '}
                                    <span>{value.informacion}</span>
                                </>
                            )}
                        />
                }
            </div>

            {/* Sección del comprobante */}
            {
                refComprobante && (
                    <div className="mb-3">
                        <Select
                            label={
                                <label>
                                    Comprobante: <i className="fa fa-asterisk text-danger small"></i>
                                </label>
                            }
                            ref={refComprobante}
                            value={idComprobante}
                            onChange={handleSelectComprobante}
                        >
                            <option value="">-- Seleccione --</option>
                            {comprobantes.map((item, index) => (
                                <option key={index} value={item.idComprobante}>
                                    {item.nombre}
                                </option>
                            ))}
                        </Select>
                    </div>
                )
            }

            {/* ===================== 2 ======================= */}
            <h6>
                <span className="badge badge-primary">-</span> Cliente
            </h6>

            <div className="dropdown-divider"></div>

            <div className="mb-3">
                <Input
                    label={
                        <label>
                            Selecciona un Cliente: <i className="fa fa-asterisk text-danger small"></i>
                        </label>
                    }
                    value={
                        venta
                            ? `${venta.documento} - ${venta.informacion}`
                            : ''
                    }
                    disabled
                />
            </div>

            {/* ===================== 3 ======================= */}
            <h6>
                <span className="badge badge-primary">-</span> Modalidad de Traslado
            </h6>

            <div className="dropdown-divider"></div>

            <div className="flex flex-col md:flex-row gap-3 mb-3">
                <div className="w-full">
                    <RadioButton
                        id={MODALIDAD_TRASLADO.TRANSPORTE_PUBLICO}
                        value={MODALIDAD_TRASLADO.TRANSPORTE_PUBLICO}
                        name={'ckModalidadTraslado'}
                        checked={idModalidadTraslado === MODALIDAD_TRASLADO.TRANSPORTE_PUBLICO}
                        onChange={handleInputModalidadTraslado}
                    >
                        Público
                    </RadioButton>
                </div>

                <div className="w-full">
                    <RadioButton
                        id={MODALIDAD_TRASLADO.TRANSPORTE_PRIVADO}
                        value={MODALIDAD_TRASLADO.TRANSPORTE_PRIVADO}
                        name={'ckModalidadTraslado'}
                        checked={idModalidadTraslado === MODALIDAD_TRASLADO.TRANSPORTE_PRIVADO}
                        onChange={handleInputModalidadTraslado}
                    >
                        Privado
                    </RadioButton>
                </div>
            </div>

            {/* ===================== 4 ======================= */}
            <h6>
                <span className="badge badge-primary">-</span> Datos del Traslado
            </h6>

            <div className="dropdown-divider"></div>

            <div className="flex flex-col md:flex-row gap-3 mb-3">
                <div className="w-full">
                    <Select
                        label={
                            <label>
                                Motivo del traslado:{' '}
                                <i className="fa fa-asterisk text-danger small"></i>
                            </label>
                        }
                        ref={refMotivoTraslado}
                        value={idMotivoTraslado}
                        onChange={handleSelectMotivoTraslado}
                    >
                        <option value="0">-- Seleccione motivo de traslado --</option>
                        {motivoTraslado.map((item, index) => (
                            <option key={index} value={item.idMotivoTraslado}>
                                {item.nombre}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className="w-full">
                    <Input
                        label={
                            <label>
                                Fecha traslado: <i className="fa fa-asterisk text-danger small"></i>
                            </label>
                        }
                        type="date"
                        value={fechaTraslado}
                        onChange={handleInputFechaTraslado}
                    />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 mb-3">
                <div className="w-full">
                    <Select
                        label={
                            <label>
                                Tipo Peso de Carga: <i className="fa fa-asterisk text-danger small" />
                            </label>
                        }
                        ref={refTipoPeso}
                        value={idTipoPeso}
                        onChange={handleSelectTipoPeso}
                    >
                        <option value="0">-- Seleccione --</option>
                        {tipoPeso.map((item, index) => (
                            <option key={index} value={item.idTipoPeso}>
                                {item.nombre}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className="w-full">
                    <Input
                        label={
                            <label>
                                Peso de la Carga: <i className="fa fa-asterisk text-danger small"></i>
                            </label>
                        }
                        placeholder="Ejm: 0.00, 0"
                        ref={refPeso}
                        value={peso}
                        onChange={handleInputPeso}
                        onKeyDown={keyNumberFloat}
                    />
                </div>
            </div>

            {/* Sección de datos del vehículo */}
            <h6>
                <span className="badge badge-primary">5</span> Datos del Transporte
                Privado
            </h6>

            <div className="dropdown-divider"></div>

            <div className="flex flex-col gap-3">
                <SearchInput
                    ref={refVehiculo}
                    label={
                        <label>
                            Filtrar un vehículo: <i className="fa fa-asterisk text-danger small"></i>
                        </label>
                    }
                    disabled={disabledPublica}
                    placeholder="Filtrar por marca o número de placa..."
                    refValue={refFiltrarVehiculo}
                    data={vehiculos}
                    handleClearInput={handleClearInputVehiculo}
                    handleFilter={handleFilterVehiculo}
                    handleSelectItem={handleSelectItemVehiculo}
                    renderItem={(value) => (
                        <>
                            <span>
                                {value.marca}-{value.numeroPlaca}
                            </span>
                        </>
                    )}
                />
            </div>

            {/* ===================== 6 ======================= */}
            <h6>
                <span className="badge badge-primary">-</span> Datos del Conductor
                Privado
            </h6>

            <div className="dropdown-divider"></div>

            <div className="flex flex-col gap-3">
                <SearchInput
                    ref={refConductor}
                    label={
                        <label>
                            Filtrar un Conductor (DNI): <i className="fa fa-asterisk text-danger small"></i>
                        </label>
                    }
                    disabled={disabledPublica}
                    placeholder="Por número de documento o apellidos y nombres..."
                    refValue={refFiltrarConductor}
                    data={conductores}
                    handleClearInput={handleClearInputConductor}
                    handleFilter={handleFilterConductor}
                    handleSelectItem={handleSelectItemConductor}
                    renderItem={(value) => (
                        <>
                            <span>
                                {value.documento}, {value.informacion}
                            </span>
                        </>
                    )}
                />
            </div>

            {/* ===================== 7 ======================= */}
            <h6>
                <span className="badge badge-primary">-</span> Datos de la Empresa a Transportar - Pública
            </h6>

            <div className="dropdown-divider"></div>

            <div className="flex flex-col gap-3">
                <SearchInput
                    ref={refConductorPublico}
                    label={
                        <label>
                            Selecciona una Empresa (RUC): <i className="fa fa-asterisk text-danger small"></i>
                        </label>
                    }
                    disabled={disabledPrivado}
                    placeholder="Por número de documento o ruc..."
                    refValue={refFiltrarConductorPublico}
                    data={conductoresPublico}
                    handleClearInput={handleClearInputConductorPublico}
                    handleFilter={handleFilterConductorPublico}
                    handleSelectItem={handleSelectItemConductorPublico}
                    renderItem={(value) => (
                        <>
                            <span>
                                {value.documento}, {value.informacion}
                            </span>
                        </>
                    )}
                />
            </div>

            <div className="dropdown-divider"></div>

            {/* ===================== 8 y 9 ======================= */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="w-full">
                    <h6>
                        <span className="badge badge-primary">-</span> Punto de partida
                    </h6>

                    <div className="dropdown-divider"></div>

                    {
                        idMotivoTraslado === MOTIVO_TRASLADO.TRASLADO_ENTRE_ESTABLECIMIENTO_MISMA_EMPRESA && (
                            <div className="form-group">
                                <Input
                                    group={true}
                                    iconLeft={<i className="bi bi-search"></i>}
                                    label={
                                        <label>
                                            Codigo Anexo Partida: <i className="fa fa-asterisk text-danger small"></i>
                                        </label>
                                    }
                                    placeholder="Ingrese su código anexo de partida..."
                                    ref={refCodigoAnexoPartida}
                                    value={codigoAnexoPartida}
                                    onChange={handleInputCodigoAnexoPartida}
                                />
                            </div>
                        )
                    }

                    <div className="form-group">
                        <Input
                            group={true}
                            iconLeft={<i className="bi bi-search"></i>}
                            label={
                                <label>
                                    Dirección Partida: <i className="fa fa-asterisk text-danger small"></i>
                                </label>
                            }
                            placeholder="Ingrese Dirección de partida..."
                            ref={refDireccionPartida}
                            value={direccionPartida}
                            onChange={handleInputDireccionPartida}
                        />
                    </div>

                    <div className="form-group">
                        <SearchInput
                            ref={refUbigeoPartida}
                            label={
                                <label>
                                    Ubigeo Partida: <i className="fa fa-asterisk text-danger small"></i>
                                </label>
                            }
                            placeholder="Filtrar departamento, distrito o provincia..."
                            refValue={refFiltrarUbigeoPartida}
                            data={ubigeosPartida}
                            handleClearInput={handleClearInputaUbigeoPartido}
                            handleFilter={handleFilterUbigeoPartido}
                            handleSelectItem={handleSelectItemUbigeoPartido}
                            renderItem={(value) => (
                                <>
                                    {value.departamento} -{value.provincia} -{value.distrito}(
                                    {value.ubigeo})
                                </>
                            )}
                            renderIconLeft={<i className="bi bi-search"></i>}
                        />
                    </div>
                </div>

                <div className="w-full">
                    <h6>
                        <span className="badge badge-primary">-</span> Punto de llegada
                    </h6>

                    <div className="dropdown-divider"></div>

                    {
                        idMotivoTraslado === MOTIVO_TRASLADO.TRASLADO_ENTRE_ESTABLECIMIENTO_MISMA_EMPRESA && (
                            <div className="form-group">
                                <Input
                                    group={true}
                                    iconLeft={<i className="bi bi-search"></i>}
                                    label={
                                        <label>
                                            Codigo Anexo Llegada: <i className="fa fa-asterisk text-danger small"></i>
                                        </label>
                                    }
                                    placeholder="Ingrese su código anexo de llegada..."
                                    ref={refCodigoAnexoLlegada}
                                    value={codigoAnexoLlegada}
                                    onChange={handleInputCodigoAnexoLlegada}
                                />
                            </div>
                        )
                    }

                    <div className="form-group">
                        <Input
                            group={true}
                            iconLeft={<i className="bi bi-search"></i>}
                            label={
                                <label>
                                    Dirección Llegada: <i className="fa fa-asterisk text-danger small"></i>
                                </label>
                            }
                            placeholder="Ingrese Dirección de llegada..."
                            ref={refDireccionLlegada}
                            value={direccionLlegada}
                            onChange={handleInputDireccionLlegada}
                        />
                    </div>

                    <div className="form-group">
                        <SearchInput
                            ref={refUbigeoLlegada}
                            label={
                                <label>
                                    Ubigeo Llegada:{' '}
                                    <i className="fa fa-asterisk text-danger small"></i>
                                </label>
                            }
                            placeholder="Filtrar departamento, distrito o provincia..."
                            refValue={refFiltrarUbigeoLlegada}
                            data={ubigeosLlegada}
                            handleClearInput={handleClearInputaUbigeoLlegada}
                            handleFilter={handleFilterUbigeoLlegada}
                            handleSelectItem={handleSelectItemUbigeoLlegada}
                            renderItem={(value) => (
                                <>
                                    {value.departamento} -{value.provincia} -{value.distrito}(
                                    {value.ubigeo})
                                </>
                            )}
                            renderIconLeft={<i className="bi bi-search"></i>}
                        />
                    </div>
                </div>
            </div>

            {/* ===================== 10 ======================= */}
            <h6>
                <span className="badge badge-primary">-</span> Detalle de Guía de
                Remisión
            </h6>


            <div className="overflow-hidden rounded border border-primary bg-white mt-3">
                <table className="w-full text-sm text-gray-700">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                        <tr className="border-b border-gray-200">
                            <th className="w-[5%] px-4 py-3 text-center font-semibold">
                                #
                            </th>
                            <th className="w-[15%] px-4 py-3 text-left font-semibold">
                                Código
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">
                                Descripción
                            </th>
                            <th className="w-[15%] px-4 py-3 text-center font-semibold">
                                Und/Medida
                            </th>
                            <th className="w-[10%] px-4 py-3 text-right font-semibold">
                                Cantidad
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {
                            isEmpty(detalles) ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-3 text-center">
                                        <div className="text-gray-500">
                                            No hay productos
                                        </div>
                                    </td>
                                </tr>
                            ) :
                                (
                                    detalles.map((item, index) => (
                                        <tr
                                            key={index}
                                            className="transition-colors hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-3 text-center text-gray-400">
                                                {index + 1}
                                            </td>

                                            <td className="px-4 py-3 font-medium text-gray-700">
                                                {item.codigo}
                                            </td>

                                            <td className="px-4 py-3 text-gray-800">
                                                {item.producto}
                                            </td>

                                            <td className="px-4 py-3 text-center text-gray-500">
                                                {item.medida}
                                            </td>

                                            <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                                {item.cantidad}
                                            </td>
                                        </tr>
                                    ))
                                )

                        }

                    </tbody>
                </table>
            </div>
        </>
    );
}

export default Form;