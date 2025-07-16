import Button from '../../../../../../components/Button';
import Column from '../../../../../../components/Column';
import Input from '../../../../../../components/Input';
import Row from '../../../../../../components/Row';
import Select, { SelectActive } from '../../../../../../components/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../../../../components/Table';
import TextArea from '../../../../../../components/TextArea';
import { keyNumberFloat, rounded } from '../../../../../../helper/utils.helper';
import ItemAlmacen from './ItemAlmacen';
import ItemImage from './ItemImagen';
import ItemProducto from './ItemProducto';
import PropTypes from 'prop-types';

const Combo = (props) => {
  const { nombre, refNombre, handleSelectNombre } = props;

  const { codigo, refCodigo, handleInputCodigo } = props;

  const { sku, refSku, handleInputSku } = props;

  const { codigoBarras, refCodigoBarras, handleInputCodigoBarras, handleGenerateCodigoBarras } = props;

  const { codigoSunat, refCodigoSunat, handleSelectCodigoSunat } = props;

  const { idMedida, refIdMedida, handleSelectIdMedida, medidas } = props;

  const { idCategoria, refIdCategoria, handleSelectIdCategoria, categorias } = props;

  const { idMarca, refIdMarca, handleSelectIdMarca, marcas } = props;

  const { precio, refPrecio, handleInputPrecio } = props;

  const {
    combos,
    handleOpenModalProducto,
    handleInputCantidadCombos,
    handleRemoveItemCombo,
  } = props;

  const {
    activarInventario,
    inventarios,
    handleAddItemInventario,
    handleRemoveItemInventario,
  } = props;

  const { descripcionCorta, refDescripcionCorta, handleInputDescripcionCorta } = props;

  const { descripcionLarga, refDescripcionLarga, handleInputDescripcionLarga } = props;

  const {
    detalles,
    refDetalles,
    handleInputNombreDetalles,
    handleInputValorDetalles,
    handleAddDetalles,
    handleRemoveDetalles,
  } = props;

  const {
    imagenes,
    handleSelectImagenes,
    handleRemoveImagenes
  } = props;

  const {
    colores,
    coloresSeleccionados,
    handleSelectColores
  } = props;

  const {
    tallas,
    tallasSeleccionados,
    handleSelectTallas
  } = props;

  const {
    sabores,
    saboresSeleccionados,
    handleSelectSabores
  } = props;

  return (
    <>
      {/* SECTOR INFORMACIÓN GENERAL */}
      <Row>
        <Column className="col-md-12" formGroup={true}>
          <label>
            Agrupa en un solo ítem un conjunto de productos, servicios o una
            combinación entre ambos.
          </label>
        </Column>
      </Row>

      {/* SECTOR INFORMACIÓN GENERAL */}
      <Row>
        <Column className="col-12">
          <h6><span className="badge badge-primary">1</span> INFORMACIÓN GENERAL</h6>
        </Column>

        <div className="dropdown-divider"></div>

        <Column className="col-md-12" formGroup={true}>
          <Input
            label={<>
              Nombre del combo: <i className="fa fa-asterisk text-danger small"></i>
            </>}
            className={`${nombre ? '' : 'is-invalid'}`}
            placeholder="Dijite un nombre..."
            ref={refNombre}
            value={nombre}
            onChange={handleSelectNombre}
          />
        </Column>

        <Column className="col-md-6" formGroup={true}>
          <Input
            label={<>
              Código: <i className="fa fa-asterisk text-danger small"></i>
            </>}
            className={`${codigo ? '' : 'is-invalid'}`}
            placeholder="Ejemplo: CAS002 ..."
            ref={refCodigo}
            value={codigo}
            onChange={handleInputCodigo}
          />
        </Column>

        <Column className="col-md-6" formGroup={true}>
          <Input
            label={<>
              SKU:
            </>}
            placeholder="Ejemplo: CAM-NIKE-001 ..."
            ref={refSku}
            value={sku}
            onChange={handleInputSku}
          />
        </Column>

        <Column className="col-md-6" formGroup={true}>
          <Input
            group
            label={<>
              Código de Barras: <i className="bi bi-upc-scan"></i>
            </>}
            placeholder="Ejemplo: 1234567890123 ..."
            ref={refCodigoBarras}
            value={codigoBarras}
            onChange={handleInputCodigoBarras}
            buttonRight={
              <Button
                className="btn-outline-secondary"
                title="Generar Código de Barras"
                onClick={handleGenerateCodigoBarras}
              >
                <i className="bi-arrow-clockwise"></i>
              </Button>
            }
          />
        </Column>

        <Column className="col-md-6" formGroup={true}>
          <Select
            label={"Marca:"}
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
        </Column>

        <Column className="col-md-6" formGroup={true}>
          <Select
            label={<>
              Unidad de medida: <i className="fa fa-asterisk text-danger small"></i>
            </>}
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
        </Column>

        <Column className="col-md-6" formGroup={true}>
          <Select
            label={<>
              Categoria: <i className="fa fa-asterisk text-danger small"></i>
            </>}
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
        </Column>

        <Column className="col-md-6" formGroup={true}>
          <Select
            label={"Código producto SUNAT:"}
            ref={refCodigoSunat}
            value={codigoSunat}
            onChange={handleSelectCodigoSunat}
          >
            <option value="0">-- Selecciona --</option>
            <option value="1">codigo 01</option>
            <option value="2">código 02</option>
          </Select>
        </Column>
      </Row>

      {/*  SECTOR PRECIO */}
      <Row>
        <Column className="col-12" formGroup={true}>
          <h6><span className="badge badge-primary">2</span> PRECIO</h6>
        </Column>

        <div className="dropdown-divider"></div>

        <Column className="col-12" formGroup={true}>
          <label>
            Indica el valor de venta y el costo de compra de tu producto.
          </label>
        </Column>

        <Column className="col-lg-3 col-md-12 col-sm-12" formGroup={true}>
          <Input
            label={<>
              Precio base: <i className="fa fa-asterisk text-danger small"></i>
            </>}
            className={`${precio ? '' : 'is-invalid'}`}
            placeholder=" S/ 0.00"
            ref={refPrecio}
            value={precio}
            onChange={handleInputPrecio}
            onKeyDown={keyNumberFloat}
          />
        </Column>
      </Row>

      {/* SECTOR COMBO */}
      <Row>
        <Column className="col-12" formGroup={true}>
          <h6><span className="badge badge-primary">3</span> COMBO</h6>
        </Column>

        <div className="dropdown-divider"></div>

        <Column className="col-12" formGroup={true}>
          <label>
            Selecciona los productos y sus cantidades para armar un combo
          </label>
        </Column>

        <Column className="col-12" formGroup={true}>
          {combos.map((item, index) => {
            return (
              <ItemProducto
                key={index}
                item={item}
                handleInputCantidadCombos={handleInputCantidadCombos}
                handleRemoveItemCombo={handleRemoveItemCombo}
              />
            );
          })}
        </Column>

        <Column className="col-12" formGroup={true}>
          <div className="d-flex justify-content-between align-items-center">
            <Button
              className="btn text-success"
              onClick={handleOpenModalProducto}
            >
              <i className="fa fa-plus-circle"></i> Agregar producto
            </Button>

            <h5 className="text-secondary">
              Costo total: S/{' '}
              {
                rounded(combos.reduce((acumulador, item) => (acumulador += item.costo * (item.cantidad ?? 0)), 0,),)
              }
            </h5>
          </div>
        </Column>
      </Row>

      {/* SECTOR INVENTARIO */}
      {/* {activarInventario && (
        <Row>
          <Column className="col-12" formGroup={true}>
            <h6><span className="badge badge-primary">4</span> INVENTARIO INICIAL</h6>
          </Column>

          <div className="dropdown-divider"></div>

          <Column className="col-12" formGroup={true}>
            <label>
              Distribuye y controla las cantidades de tus productos en
              diferentes lugares.
            </label>
          </Column>

          <Column>
            {inventarios.map((item, index) => {
              return (
                <ItemAlmacen
                  key={index}
                  idAlmacen={item.idAlmacen}
                  nombreAlmacen={item.nombreAlmacen}
                  cantidad={item.cantidad}
                  cantidadMinima={item.cantidadMinima}
                  cantidadMaxima={item.cantidadMaxima}
                  handleRemoveItemInventario={handleRemoveItemInventario}
                />
              );
            })}
          </Column>

          <Column className="col-12" formGroup={true}>
            <Button
              className="btn text-success"
              onClick={handleAddItemInventario}
            >
              <i className="fa fa-plus-circle"></i> Agregar almacen
            </Button>
          </Column>
        </Row>
      )} */}

      {/* SECTOR DE DESCRIPCIÓN */}
      <Row>
        <Column className="col-12" formGroup={true}>
          <h6><span className="badge badge-primary">4</span> DESCRIPCIÓN </h6>
        </Column>

        <div className="dropdown-divider"></div>

        <Column className="col-12" formGroup={true}>
          <label>
            Agregar un resumen del producto
          </label>
        </Column>

        <div className="dropdown-divider"></div>

        <Column className="col-md-12" formGroup={true}>
          <TextArea
            label={"Descripción Corta:"}
            rows={3}
            ref={refDescripcionCorta}
            value={descripcionCorta}
            onChange={handleInputDescripcionCorta}
          />
        </Column>

        <Column className="col-md-12" formGroup={true}>
          <TextArea
            label={"Descripción Larga:"}
            rows={6}
            ref={refDescripcionLarga}
            value={descripcionLarga}
            onChange={handleInputDescripcionLarga}
          />
        </Column>
      </Row>

      {/* SECTOR DE DETALLES */}
      <Row>
        <Column className="col-12" formGroup={true}>
          <h6><span className="badge badge-primary">5</span> DETALLES O CARACTERISTICAS </h6>
        </Column>

        <Column className="col-12" formGroup={true}>
          <label>
            Agregar la lista de caracteristicas
          </label>
        </Column>

        <Column>
          {detalles.length !== 0 && (
            <TableResponsive>
              <Table ref={refDetalles} className={"table-bordered"}>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">#</TableHead>
                    <TableHead scope="col">Nombre</TableHead>
                    <TableHead scope="col">Valor</TableHead>
                    <TableHead className="text-center">Quitar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {
                    detalles.map((item, index) => {
                      return (
                        <TableRow key={index}>
                          <TableCell>{item.id}</TableCell>
                          <TableCell>
                            <Input
                              placeholder="Ejemplo (Medida)"
                              value={item.nombre}
                              onChange={(event) =>
                                handleInputNombreDetalles(event, item.id)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <TextArea
                              rows={6}
                              placeholder="Ejemplo (100m x 200m)"
                              value={item.valor}
                              onChange={(event) =>
                                handleInputValorDetalles(event, item.id)
                              }
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              className="btn-danger"
                              onClick={() => handleRemoveDetalles(item.id)}
                            >
                              <i className="fa fa-remove"></i>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  }
                </TableBody>
              </Table>
            </TableResponsive>
          )}
        </Column>

        <Column className="col-md-12" formGroup={true}>
          <Button
            className="text-success"
            onClick={handleAddDetalles}>
            <i className="fa fa-plus-circle"></i> Agregar Detalles
          </Button>
        </Column>
      </Row>

      {/* SECTOR DE IMAGENES */}
      <Row>
        <Column className="col-12" formGroup={true}>
          <h6><span className="badge badge-primary">6</span> IMAGENES </h6>
        </Column>

        <div className="dropdown-divider"></div>

        <Column className="col-12" formGroup={true}>
          <label>
            Agregar las imagenes que sean mas atractivas para el usuario. <b className='text-danger'>Las imagenes no debe superar los 500 KB.</b>
          </label>
          <label>
            Las imágenes deben tener un tamaño de <b>800 x 800 píxeles</b> para que se visualicen correctamente en la página web (formato recomendado *.webp).
          </label>
        </Column>

        <Column className="col-12" formGroup={true}>
          <ItemImage
            imagenes={imagenes}
            handleSelectImagenes={handleSelectImagenes}
            handleRemoveImagenes={handleRemoveImagenes}
          />
        </Column>
      </Row>


      {/* SECTOR DE COLORES */}
      <Row>
        <Column className="col-12" formGroup={true}>
          <h6><span className="badge badge-primary">9</span> COLORES </h6>
        </Column>

        <div className="dropdown-divider"></div>

        <Column className="col-12" formGroup={true}>
          <label>
            Agregar los tipos de colores
          </label>
        </Column>

        <Column className="col-12" formGroup={true}>
          <div className='d-flex flex-wrap gap-3'>
            {colores.map((item, index) => {
              const active = coloresSeleccionados.some((select) => select.idAtributo === item.idAtributo)
              return (
                <SelectActive
                  key={index}
                  id={item.idAtributo}
                  name={item.nombre}
                  active={active}
                  background={item.hexadecimal}
                  handleSelect={handleSelectColores}
                />
              );
            })}
          </div>
        </Column>
      </Row>

      {/* SECTOR DE TALLAS */}
      <Row>
        <Column className="col-12" formGroup={true}>
          <h6><span className="badge badge-primary">10</span> TALLAS </h6>
        </Column>

        <div className="dropdown-divider"></div>

        <Column className="col-12" formGroup={true}>
          <label>
            Agregar los tipos de talla
          </label>
        </Column>

        <Column className="col-12" formGroup={true}>
          <div className='d-flex flex-wrap gap-3'>
            {tallas.map((item, index) => {
              const active = tallasSeleccionados.some((select) => select.idAtributo === item.idAtributo)
              return (
                <SelectActive
                  key={index}
                  id={item.idAtributo}
                  name={item.nombre}
                  active={active}
                  handleSelect={handleSelectTallas}
                />
              );
            })}
          </div>
        </Column>
      </Row>

      {/* SECTOR DE SABORES */}
      <Row>
        <Column className="col-12" formGroup={true}>
          <h6><span className="badge badge-primary">11</span> SABORES </h6>
        </Column>

        <div className="dropdown-divider"></div>

        <Column className="col-12" formGroup={true}>
          <label>
            Agregar los tipos de sabores
          </label>
        </Column>

        <Column className="col-12" formGroup={true}>
          <div className='d-flex flex-wrap gap-3'>
            {sabores.map((item, index) => {
              const active = saboresSeleccionados.some((select) => select.idAtributo === item.idAtributo)
              return (
                <SelectActive
                  key={index}
                  id={item.idAtributo}
                  name={item.nombre}
                  active={active}
                  handleSelect={handleSelectSabores}
                />
              );
            })}
          </div>
        </Column>
      </Row>
    </>
  );
};

Combo.propTypes = {
  nombre: PropTypes.string,
  refNombre: PropTypes.object,
  handleSelectNombre: PropTypes.func,

  codigo: PropTypes.string,
  refCodigo: PropTypes.object,
  handleInputCodigo: PropTypes.func,

  sku: PropTypes.string,
  refSku: PropTypes.object,
  handleInputSku: PropTypes.func,

  codigoBarras: PropTypes.string,
  refCodigoBarras: PropTypes.object,
  handleInputCodigoBarras: PropTypes.func,
  handleGenerateCodigoBarras: PropTypes.func,

  codigoSunat: PropTypes.string,
  refCodigoSunat: PropTypes.object,
  handleSelectCodigoSunat: PropTypes.func,

  idMedida: PropTypes.string,
  refIdMedida: PropTypes.object,
  handleSelectIdMedida: PropTypes.func,
  medidas: PropTypes.array,

  idCategoria: PropTypes.string,
  refIdCategoria: PropTypes.object,
  handleSelectIdCategoria: PropTypes.func,
  categorias: PropTypes.array,

  idMarca: PropTypes.string,
  refIdMarca: PropTypes.object,
  handleSelectIdMarca: PropTypes.func,
  marcas: PropTypes.array,

  precio: PropTypes.string,
  refPrecio: PropTypes.object,
  handleInputPrecio: PropTypes.func,

  combos: PropTypes.array,
  handleOpenModalProducto: PropTypes.func,
  handleInputCantidadCombos: PropTypes.func,
  handleRemoveItemCombo: PropTypes.func,

  activarInventario: PropTypes.bool,
  inventarios: PropTypes.array,
  handleAddItemInventario: PropTypes.func,
  handleRemoveItemInventario: PropTypes.func,

  descripcionCorta: PropTypes.string,
  refDescripcionCorta: PropTypes.object,
  handleInputDescripcionCorta: PropTypes.func,

  descripcionLarga: PropTypes.string,
  refDescripcionLarga: PropTypes.object,
  handleInputDescripcionLarga: PropTypes.func,

  detalles: PropTypes.array,
  refDetalles: PropTypes.object,
  handleInputNombreDetalles: PropTypes.func,
  handleInputValorDetalles: PropTypes.func,
  handleAddDetalles: PropTypes.func,
  handleRemoveDetalles: PropTypes.func,

  imagenes: PropTypes.array,
  handleSelectImagenes: PropTypes.func,
  handleRemoveImagenes: PropTypes.func,

  colores: PropTypes.array,
  coloresSeleccionados: PropTypes.array,
  handleSelectColores: PropTypes.func,

  tallas: PropTypes.array,
  tallasSeleccionados: PropTypes.array,
  handleSelectTallas: PropTypes.func,

  sabores: PropTypes.array,
  saboresSeleccionados: PropTypes.array,
  handleSelectSabores: PropTypes.func,
}

export default Combo;