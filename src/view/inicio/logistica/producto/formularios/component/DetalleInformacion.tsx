import Button from "@/components/Button";
import Input from "@/components/Input";
import RadioButton from "@/components/RadioButton";
import Select, { SelectActive } from "@/components/Select";
import TextArea from "@/components/TextArea";
import { keyNumberFloat } from "@/helper/utils.helper";
import { productTypeOptions, TIPO_PRODUCTO_NORMAL, TIPO_PRODUCTO_SERVICIO } from "@/model/types/tipo-producto";
import { TIPO_TRATAMIENTO_PRODUCTO_A_GRANEL, TIPO_TRATAMIENTO_PRODUCTO_UNIDADES, TIPO_TRATAMIENTO_PRODUCTO_VALOR_MONETARIO } from "@/model/types/tipo-tratamiento-producto";
import { FaAsterisk } from "react-icons/fa";
import ItemImage from "./ItemImagen";
import { TIPO_ATRIBUTO_COLOR } from "@/model/types/tipo-atributo";

interface Props {
    idTipoProducto: string;
    handleOptionTipoProducto: (event: any) => void;

    refNombre: any;
    nombre: string;
    handleInputNombre: (event: any) => void;

    refCodigo: any;
    codigo: string;
    handleInputCodigo: (event: any) => void;

    refSku: any;
    sku: string;
    handleInputSku: (event: any) => void;

    refCodigoBarras: any;
    codigoBarras: string;
    handleInputCodigoBarras: (event: any) => void;
    handleChangeCodigoBarras: () => void;

    refIdMarca: any;
    idMarca: string;
    marcas: any[];
    handleSelectIdMarca: (event: any) => void;

    refIdMedida: any;
    idMedida: string;
    medidas: any[];
    handleSelectIdMedida: (event: any) => void;

    refIdCategoria: any;
    idCategoria: string;
    categorias: any[];
    handleSelectIdCategoria: (event: any) => void;

    idTipoTratamiento: string;
    handleOptionTipoTratamiento: (event: any) => void;

    refCosto: any;
    costo: string;
    handleInputCosto: (event: any) => void;

    refPrecio: any;
    precio: string;
    handleInputPrecio: (event: any) => void;

    refPrecios: any;
    precios: any[];
    handleAddPrecios: () => void;
    handleRemovePrecios: (id: any) => void;
    handleInputNombrePrecios: (event: any, id: any) => void;
    handleInputPrecioPrecios: (event: any, id: any) => void;

    refDescripcionCorta: any;
    descripcionCorta: string;
    handleInputDescripcionCorta: (event: any) => void;

    refDescripcionLarga: any;
    descripcionLarga: string;
    handleInputDescripcionLarga: (event: any) => void;

    refDetalles: any;
    detalles: any[];
    handleAddDetalles: () => void;
    handleRemoveDetalles: (id: any) => void;
    handleInputNombreDetalles: (event: any, id: any) => void;
    handleInputValorDetalles: (event: any, id: any) => void;

    imagenes: any[];
    handleSelectImagenes: (newImgsState: any) => void;
    handleRemoveImagenes: (newImgs: any) => void;

    atributos: any[];
    atributosSeleccionados: any[];
    handleSelectAtributo: (sabor: any) => void;
}

const DetalleInformacion = ({
    idTipoProducto,
    handleOptionTipoProducto,

    refNombre,
    nombre,
    handleInputNombre,

    refCodigo,
    codigo,
    handleInputCodigo,

    refSku,
    sku,
    handleInputSku,

    refCodigoBarras,
    codigoBarras,
    handleInputCodigoBarras,
    handleChangeCodigoBarras,

    refIdMarca,
    idMarca,
    marcas,
    handleSelectIdMarca,

    refIdMedida,
    idMedida,
    medidas,
    handleSelectIdMedida,

    refIdCategoria,
    idCategoria,
    categorias,
    handleSelectIdCategoria,

    idTipoTratamiento,
    handleOptionTipoTratamiento,

    refCosto,
    costo,
    handleInputCosto,

    refPrecio,
    precio,
    handleInputPrecio,

    refPrecios,
    precios,
    handleAddPrecios,
    handleRemovePrecios,
    handleInputNombrePrecios,
    handleInputPrecioPrecios,

    refDescripcionCorta,
    descripcionCorta,
    handleInputDescripcionCorta,

    refDescripcionLarga,
    descripcionLarga,
    handleInputDescripcionLarga,

    refDetalles,
    detalles,
    handleAddDetalles,
    handleRemoveDetalles,
    handleInputNombreDetalles,
    handleInputValorDetalles,

    imagenes,
    handleSelectImagenes,
    handleRemoveImagenes,

    atributos,
    atributosSeleccionados,
    handleSelectAtributo,
}: Props) => {
    return (
        <div className="w-full md:w-3/5 flex flex-col gap-3">
            {/* Seleccion de tipo de producto */}
            <div className="flex flex-row flex-wrap gap-3">
                <h6 className="flex items-center gap-2">
                    <span className="badge badge-primary">-</span> TIPO DE PRODUCTO
                </h6>

                <p>
                    Selecciona el tipo de producto que deseas crear, esto te ayudará a organizar mejor tu catálogo.
                </p>

                {
                    productTypeOptions.map((item, index) => (
                        <RadioButton
                            key={`tipo-producto-${index}`}
                            className="form-check-inline"
                            id={item.value}
                            value={item.value}
                            name="ckTipoProducto"
                            checked={idTipoProducto === item.value}
                            onChange={handleOptionTipoProducto}
                        >
                            {item.label}
                        </RadioButton>

                    ))
                }
            </div>

            {/* Información general */}
            <div className="flex flex-col gap-3">

                <h6 className="flex items-center gap-2">
                    <span className="badge badge-primary">-</span> INFORMACIÓN GENERAL
                </h6>

                <p>
                    Información básica del producto, servicio, combo o activo que deseas registrar.
                </p>

                {/* Nombre del producto */}
                <div className="flex flex-col gap-2">
                    <Input
                        label={
                            <div className="flex items-center gap-1">
                                <p>Nombre del Producto:</p>  <FaAsterisk className="text-red-500" size={8} />
                            </div>
                        }
                        className={`${nombre ? '' : 'is-invalid'}`}
                        placeholder="Dijite un nombre..."
                        ref={refNombre}
                        value={nombre}
                        onChange={handleInputNombre}
                    />
                </div>

                {/* Código y SKU */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="w-full flex flex-col gap-2">
                        <Input
                            label={
                                <div className="flex items-center gap-1">
                                    <p>Código:</p>  <FaAsterisk className="text-red-500" size={8} />
                                </div>
                            }
                            className={`${codigo ? '' : 'is-invalid'}`}
                            placeholder="Ejemplo: CAS002 ..."
                            ref={refCodigo}
                            value={codigo}
                            onChange={handleInputCodigo}
                        />

                    </div>

                    <div className="w-full flex flex-col gap-2">
                        <Input
                            label={
                                <div className="flex items-center gap-1">
                                    <p>SKU:</p>
                                </div>
                            }
                            placeholder="Ejemplo: CAM-NIKE-001 ..."
                            ref={refSku}
                            value={sku}
                            onChange={handleInputSku}
                        />
                    </div>
                </div>

                {/* Código de Barras y Marca */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="w-full flex flex-col gap-2">
                        <Input
                            group
                            label={
                                <div className="flex items-center gap-1">
                                    <p>Código de Barras:</p>
                                </div>
                            }
                            placeholder="Ejemplo: 1234567890123 ..."
                            ref={refCodigoBarras}
                            value={codigoBarras}
                            onChange={handleInputCodigoBarras}
                            buttonRight={
                                <Button
                                    className="btn-outline-secondary"
                                    title="Generar Código de Barras"
                                    onClick={handleChangeCodigoBarras}
                                >
                                    <i className="bi-arrow-clockwise"></i>
                                </Button>
                            }
                        />
                    </div>

                    <div className="w-full flex flex-col gap-2">
                        <Select
                            label={
                                <div className="flex items-center gap-1">
                                    <p>Marca:</p>
                                </div>
                            }
                            ref={refIdMarca}
                            value={idMarca}
                            onChange={handleSelectIdMarca}
                        >
                            <option value="">-- Selecciona --</option>
                            {marcas.map((item, index) => (
                                <option key={index} value={item.idMarca}>
                                    {item.nombre}
                                </option>
                            ))}
                        </Select>
                    </div>
                </div>

                {/* Unidad de medida y Categoria */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="w-full flex flex-col gap-2">
                        <Select
                            label={
                                <div className="flex items-center gap-1">
                                    <p>Unidad de Medida:</p> <FaAsterisk className="text-red-500" size={8} />
                                </div>
                            }
                            className={`${idMedida ? '' : 'is-invalid'}`}
                            ref={refIdMedida}
                            value={idMedida}
                            onChange={handleSelectIdMedida}
                        >
                            <option value="">-- Selecciona --</option>
                            {medidas.map((item, index) => (
                                <option key={index} value={item.idMedida}>
                                    {item.nombre}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="w-full flex flex-col gap-2">
                        <Select
                            label={
                                <div className="flex items-center gap-1">
                                    <p>Categoría:</p> <FaAsterisk className="text-red-500" size={8} />
                                </div>
                            }
                            className={`form-control ${idCategoria ? '' : 'is-invalid'}`}
                            ref={refIdCategoria}
                            value={idCategoria}
                            onChange={handleSelectIdCategoria}
                        >
                            <option value="">-- Selecciona --</option>
                            {categorias.map((item, index) => (
                                <option key={index} value={item.idCategoria}>
                                    {item.nombre}
                                </option>
                            ))}
                        </Select>
                    </div>
                </div>
            </div>

            {/* Forma de venta */}
            {
                [TIPO_PRODUCTO_NORMAL].includes(idTipoProducto) && (
                    <div className="flex flex-col gap-3">
                        <h6 className="flex items-center gap-2">
                            <span className="badge badge-primary">-</span> FORMA DE VENTA
                        </h6>

                        <p>
                            Indica si va ser tratado como unidades, valor monetario o
                            granel(peso).
                        </p>

                        <div>
                            <RadioButton
                                className="form-check-inline"
                                id={TIPO_TRATAMIENTO_PRODUCTO_UNIDADES}
                                value={TIPO_TRATAMIENTO_PRODUCTO_UNIDADES}
                                name="ckTipoTratamiento"
                                checked={idTipoTratamiento === TIPO_TRATAMIENTO_PRODUCTO_UNIDADES}
                                onChange={handleOptionTipoTratamiento}
                            >
                                Unidades
                            </RadioButton>

                            <RadioButton
                                className="form-check-inline"
                                id={TIPO_TRATAMIENTO_PRODUCTO_VALOR_MONETARIO}
                                value={TIPO_TRATAMIENTO_PRODUCTO_VALOR_MONETARIO}
                                name="ckTipoTratamiento"
                                checked={idTipoTratamiento === TIPO_TRATAMIENTO_PRODUCTO_VALOR_MONETARIO}
                                onChange={handleOptionTipoTratamiento}
                            >
                                Valor monetario
                            </RadioButton>

                            <RadioButton
                                className="form-check-inline"
                                id={TIPO_TRATAMIENTO_PRODUCTO_A_GRANEL}
                                value={TIPO_TRATAMIENTO_PRODUCTO_A_GRANEL}
                                name="ckTipoTratamiento"
                                checked={idTipoTratamiento === TIPO_TRATAMIENTO_PRODUCTO_A_GRANEL}
                                onChange={handleOptionTipoTratamiento}
                            >
                                A Granel
                            </RadioButton>
                        </div>
                    </div>
                )
            }


            {/* Costo */}
            {
                ![TIPO_PRODUCTO_SERVICIO].includes(idTipoProducto) && (
                    <div className="flex flex-col gap-3">
                        <h6 className="flex items-center gap-2">
                            <span className="badge badge-primary">-</span> COSTO
                        </h6>

                        <p>Indica el valor de costo de compra de tu producto.</p>

                        <div className="flex flex-col gap-2">
                            <Input
                                label={
                                    <div className="flex items-center gap-1">
                                        <p>Costo Inicial:</p> <FaAsterisk className="text-red-500" size={8} />
                                    </div>
                                }
                                className={`${costo ? '' : 'is-invalid'}`}
                                placeholder="S/ 0.00"
                                ref={refCosto}
                                value={costo}
                                onChange={handleInputCosto}
                                onKeyDown={keyNumberFloat}
                            />
                        </div>
                    </div>
                )
            }

            {/* Precio */}
            <div className="flex flex-col gap-3">
                <h6 className="flex items-center gap-2">
                    <span className="badge badge-primary">-</span> PRECIO
                </h6>

                <p>Indica el valor de venta de tu producto.</p>

                <div className="flex flex-col gap-2">
                    <Input
                        label={
                            <div className="flex items-center gap-1">
                                <p>Precio Base:</p> <FaAsterisk className="text-red-500" size={8} />
                            </div>
                        }
                        className={`${precio ? '' : 'is-invalid'}`}
                        placeholder=" S/ 0.00"
                        ref={refPrecio}
                        value={precio}
                        onChange={handleInputPrecio}
                        onKeyDown={keyNumberFloat}
                    />
                </div>

                <div>
                    {
                        precios.length !== 0 && (
                            <div className="bg-white rounded border overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table ref={refPrecios} className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">#</th>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Quitar</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {
                                                precios.map((item, index) => {
                                                    return (
                                                        <tr key={index}>
                                                            <td className="px-6 py-12 text-center">{item.id}</td>
                                                            <td className="px-6 py-12 text-center">
                                                                <Input
                                                                    placeholder="Ingrese el nombre del precio..."
                                                                    value={item.nombre}
                                                                    onChange={(event) =>
                                                                        handleInputNombrePrecios(event, item.id)
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="px-6 py-12 text-center">
                                                                <Input
                                                                    placeholder="0.00"
                                                                    value={item.precio}
                                                                    onChange={(event) =>
                                                                        handleInputPrecioPrecios(event, item.id)
                                                                    }
                                                                    onKeyDown={keyNumberFloat}
                                                                />
                                                            </td>
                                                            <td className="px-6 py-12 text-center">
                                                                <Button
                                                                    className="btn-danger"
                                                                    onClick={() => handleRemovePrecios(item.id)}
                                                                >
                                                                    <i className="fa fa-remove"></i>
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    }
                </div>

                <div>
                    <Button className="text-success" onClick={handleAddPrecios}>
                        <i className="fa fa-plus-circle"></i> Agregar Lista de Precios
                    </Button>
                </div>
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-3">
                <h6 className="flex items-center gap-2">
                    <span className="badge badge-primary">-</span> DESCRIPCIÓN
                </h6>

                <p>Agregar un resumen del producto</p>

                <div className="flex flex-col gap-2">
                    <TextArea
                        label={
                            <div className="flex items-center gap-1">
                                <p>Descripción Corta:</p>
                            </div>
                        }
                        rows={3}
                        ref={refDescripcionCorta}
                        value={descripcionCorta}
                        onChange={handleInputDescripcionCorta}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <TextArea
                        label={
                            <div className="flex items-center gap-1">
                                <p>Descripción Larga:</p>
                            </div>
                        }
                        rows={6}
                        ref={refDescripcionLarga}
                        value={descripcionLarga}
                        onChange={handleInputDescripcionLarga}
                    />
                </div>
            </div>

            {/* Detalles */}
            <div className="flex flex-col gap-3">
                <h6 className="flex items-center gap-2">
                    <span className="badge badge-primary">-</span> DETALLES O
                    CARACTERISTICAS
                </h6>

                <p>Agregar la lista de caracteristicas</p>

                <div>
                    {
                        detalles.length !== 0 && (
                            <div className="bg-white rounded border overflow-hidden mt-3">
                                <div className="overflow-x-auto">
                                    <table ref={refDetalles} className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">#</th>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Nombre</th>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Valor</th>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Quitar</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {detalles.map((item, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td className="px-6 py-12 text-center">{item.id}</td>
                                                        <td className="px-6 py-12 text-center">
                                                            <Input
                                                                placeholder="Ejemplo (Medida)"
                                                                value={item.nombre}
                                                                onChange={(event) =>
                                                                    handleInputNombreDetalles(event, item.id)
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-6 py-12 text-center">
                                                            <TextArea
                                                                rows={1}
                                                                placeholder="Ejemplo (100m x 200m)"
                                                                value={item.valor}
                                                                onChange={(event) =>
                                                                    handleInputValorDetalles(event, item.id)
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-6 py-12 text-center">
                                                            <Button
                                                                className="btn-danger"
                                                                onClick={() => handleRemoveDetalles(item.id)}
                                                            >
                                                                <i className="fa fa-remove"></i>
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    }
                </div>

                <div>
                    <Button className="text-success" onClick={handleAddDetalles}>
                        <i className="fa fa-plus-circle"></i> Agregar Detalles
                    </Button>
                </div>
            </div>

            {/* Imagenes */}
            <div className="flex flex-col gap-3">
                <h6 className="flex items-center gap-2">
                    <span className="badge badge-primary">-</span> IMAGENES
                </h6>

                <p>
                    Agregar las imagenes que sean mas atractivas para el usuario.
                    <b className="text-danger">
                        Las imagenes no debe superar los 500 KB.
                    </b>
                </p>
                <p>
                    Las imágenes deben tener un tamaño de <b>800 x 800 píxeles</b> para
                    que se visualicen correctamente en la página web (formato
                    recomendado *.webp).
                </p>

                <div>
                    <ItemImage
                        imagenes={imagenes}
                        handleSelectImagenes={handleSelectImagenes}
                        handleRemoveImagenes={handleRemoveImagenes}
                    />
                </div>
            </div>

            {/* Atributos */}
            <div className="flex flex-col gap-3">
                <h6 className="flex items-center gap-2">
                    <span className="badge badge-primary">
                        -
                    </span>
                    ATRIBUTOS
                </h6>

                {atributos.map((tipo) => (
                    <div key={tipo.idTipoAtributo} className="flex flex-col gap-3">
                        <p>
                            Agregar los tipos de <span className="text-primary uppercase font-bold">{tipo.nombre.toLowerCase()}</span>
                        </p>

                        <div className="d-flex flex-wrap gap-3">
                            {tipo.atributos.map((item) => {
                                const active = atributosSeleccionados.some(
                                    (select) =>
                                        select.idAtributo === item.idAtributo
                                );

                                const background = TIPO_ATRIBUTO_COLOR === tipo.idTipoAtributo ? item.hexadecimal : null;

                                return (
                                    <SelectActive
                                        key={item.idAtributo}
                                        id={item.idAtributo}
                                        name={item.nombre}
                                        active={active}
                                        background={background}
                                        handleSelect={handleSelectAtributo}
                                    />
                                );

                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DetalleInformacion;