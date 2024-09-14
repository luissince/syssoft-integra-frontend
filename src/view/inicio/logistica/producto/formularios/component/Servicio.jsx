// import Button from '../../../../../../components/Button';
import Button from '../../../../../../components/Button';
import Column from '../../../../../../components/Column';
import Input from '../../../../../../components/Input';
import Row from '../../../../../../components/Row';
import Select, { SelectActive } from '../../../../../../components/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../../../../components/Table';
import TextArea from '../../../../../../components/TextArea';
import { keyNumberFloat } from '../../../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import ItemImage from './ItemImagen';

const Servicio = (props) => {
  const { nombre, refNombre, handleSelectNombre } = props;

  const { codigo, refCodigo, handleInputCodigo } = props;

  const { codigoSunat, refCodigoSunat, handleSelectCodigoSunat } = props;

  const { idMedida, refIdMedida, handleSelectIdMedida, medidas } = props;

  const { idCategoria, refIdCategoria, handleSelectIdCategoria, categorias } = props;

  const { idMarca, refIdMarca, handleSelectIdMarca, marcas } = props;

  const { precio, refPrecio, handleInputPrecio } = props;

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
    <div
      className="tab-pane fade "
      id="addservicio"
      role="tabpanel"
      aria-labelledby="addservicio-tab"
    >
      {/* SECTOR TITULO*/}
      <Row>
        <Column className="col-md-12" formGroup={true}>
          <label>
            Crea las actividades comerciales o de consultoría que ofreces a tus
            clientes.
          </label>
        </Column>
      </Row>

      {/* SECTOR INFORMACIÓN GENERAL */}

      <Row>
        <Column className="col-12" formGroup={true}>
          <h6><span className="badge badge-primary">1</span> INFORMACIÓN GENERAL</h6>
        </Column>

        <div className="dropdown-divider"></div>

        <Column className="col-md-12" formGroup={true}>
          <Input
            label={<>
              Nombre del servicio: <i className="fa fa-asterisk text-danger small"></i>
            </>}
            className={`${nombre ? '' : 'is-invalid'}`}
            placeholder="Dijite un nombre..."
            refInput={refNombre}
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
            refInput={refCodigo}
            value={codigo}
            onChange={handleInputCodigo}
          />
        </Column>

        <Column className="col-md-6" formGroup={true}>
          <Select
            label={"Marca:"}
            // group={true}
            refSelect={refIdMarca}
            value={idMarca}
            onChange={handleSelectIdMarca}
          // buttonRight={
          //   <Button
          //     className="btn-outline-success"
          //   >
          //     <i className="fa fa-plus"></i>
          //   </Button>
          // }
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
            // group={true}
            className={`${idMedida ? '' : 'is-invalid'}`}
            refSelect={refIdMedida}
            value={idMedida}
            onChange={handleSelectIdMedida}
          // buttonRight={
          //   <Button
          //     className="btn-outline-success"
          //   >
          //     <i className="fa fa-plus"></i>
          //   </Button>
          // }
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
            // group={true}
            className={`form-control ${idCategoria ? '' : 'is-invalid'}`}
            refSelect={refIdCategoria}
            value={idCategoria}
            onChange={handleSelectIdCategoria}
          // buttonRight={
          //   <Button
          //     className="btn-outline-success"
          //   >
          //     <i className="fa fa-plus"></i>
          //   </Button>
          // }
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
            refSelect={refCodigoSunat}
            value={codigoSunat}
            onChange={handleSelectCodigoSunat}
          >
            <option value="0">-- Selecciona --</option>
            <option value="1">codigo 01</option>
            <option value="2">código 02</option>
          </Select>
        </Column>
      </Row>

      {/* SECTOR DE PRECIO */}
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
            refInput={refPrecio}
            value={precio}
            onChange={handleInputPrecio}
            onKeyDown={keyNumberFloat}
          />
        </Column>
      </Row>

      {/* SECTOR DE DESCRIPCIÓN */}
      <Row>
        <Column className="col-12" formGroup={true}>
          <h6><span className="badge badge-primary">3</span> DESCRIPCIÓN </h6>
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
            refInput={refDescripcionCorta}
            value={descripcionCorta}
            onChange={handleInputDescripcionCorta}
          ></TextArea>
        </Column>

        <Column className="col-md-12" formGroup={true}>
          <TextArea
            label={"Descripción Larga:"}
            rows={6}
            refInput={refDescripcionLarga}
            value={descripcionLarga}
            onChange={handleInputDescripcionLarga}
          ></TextArea>
        </Column>
      </Row>

      {/* SECTOR DE DETALLES */}
      <Row>
        <Column className="col-12" formGroup={true}>
          <h6><span className="badge badge-primary">4</span> DETALLES O CARACTERISTICAS </h6>
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
          <h6><span className="badge badge-primary">5</span> IMAGENES </h6>
        </Column>

        <div className="dropdown-divider"></div>

        <Column className="col-12" formGroup={true}>
          <label>
            Agregar las imagenes que sean mas atractivas para el usuario. <b className='text-danger'>Las imagenes no debe superar los 50 KB.</b>
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
    </div>
  );
};

Servicio.propTypes = {
  nombre: PropTypes.string,
  refNombre: PropTypes.object,
  handleSelectNombre: PropTypes.func,

  codigo: PropTypes.string,
  refCodigo: PropTypes.object,
  handleInputCodigo: PropTypes.func,

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
  handleAddItemCombo: PropTypes.func,
  handleInputCantidadCombos: PropTypes.func,
  handleRemoveItemCombo: PropTypes.func,

  activarInventario: PropTypes.bool,
  inventario: PropTypes.array,
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

export default Servicio;