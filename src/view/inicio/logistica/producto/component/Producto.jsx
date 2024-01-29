import { keyNumberFloat } from '../../../../../helper/utils.helper';
import { A_GRANEL, UNIDADES, VALOR_MONETARIO } from '../../../../../model/types/tipo-tratamiento-producto';
import ItemAlmacen from './ItemAlmacen';

const Producto = (props) => {
  const { nombre, refNombre, handleSelectNombre } = props;

  const { codigo, refCodigo, handleInputCodigo } = props;

  const { codigoSunat, refCodigoSunat, handleSelectCodigoSunat } = props;

  const { idMedida, refIdMedida, handleSelectIdMedida, medidas } = props;

  const { idCategoria, refIdCategoria, handleSelectIdCategoria, categorias } = props;

  const { descripcion, refDescripcion, handleInputDescripcion } = props;

  const { idTipoTratamientoProducto, handleOptionTipoTratamientoProducto } = props;

  const { precio, refPrecio, handleInputPrecio } = props;

  const {
    precios,
    refPrecios,
    handleInputNombrePrecios,
    handleInputPrecioPrecios,
    handleAddPrecio,
    handleRemovePrecio,
  } = props;

  const { costo, refCosto, handleInputCosto } = props;

  const {
    activarInventario,
    inventario,
    handleAddItemInventario,
    handleRemoveItemInventario,
  } = props;

  return (
    <div
      className="tab-pane fade show active"
      id="addproducto"
      role="tabpanel"
      aria-labelledby="addproducto-tab"
    >
      {/* SECTOR TITULO*/}
      <div className="row">
        <div className="form-group col-md-12">
          <label>
            Crea los bienes y mercancías que vendes e indica si deseas tener el
            control de tu inventario.
          </label>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <h6>INFORMACIÓN GENERAL</h6>
        </div>
      </div>

      <div className="dropdown-divider"></div>

      {/* SECTOR INFORMACIÓN GENERAL */}
      <div className="row">
        <div className="col-md-12">
          <div className="form-group">
            <label>
              Nombre del producto:{' '}
              <i className="fa fa-asterisk text-danger small"></i>
            </label>
            <input
              type="text"
              className={`form-control ${nombre ? '' : 'is-invalid'}`}
              aria-describedby="inputError"
              placeholder="Dijite un nombre..."
              ref={refNombre}
              value={nombre}
              onChange={handleSelectNombre}
            />
            {nombre === '' && (
              <div className="invalid-feedback">Rellene el campo.</div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-group">
            <label>
              Código: <i className="fa fa-asterisk text-danger small"></i>
            </label>
            <input
              type="text"
              className={`form-control ${codigo ? '' : 'is-invalid'}`}
              placeholder="Ejemplo: CAS002 ..."
              ref={refCodigo}
              value={codigo}
              onChange={handleInputCodigo}
            />
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-group">
            <label>Código producto SUNAT:</label>
            <div className="input-group">
              <select
                className="form-control"
                ref={refCodigoSunat}
                value={codigoSunat}
                onChange={handleSelectCodigoSunat}
              >
                <option value="0">-- Selecciona --</option>
                <option value="1">codigo 01</option>
                <option value="2">código 02</option>
              </select>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-group">
            <label>
              Unidad de medida:{' '}
              <i className="fa fa-asterisk text-danger small"></i>
            </label>
            <div className="input-group">
              <select
                className={`form-control ${idMedida ? '' : 'is-invalid'}`}
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
              </select>
              {idMedida === '' && (
                <div className="invalid-feedback">Seleccione el campo.</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-group">
            <label>
              Categoria: <i className="fa fa-asterisk text-danger small"></i>
            </label>
            <div className="input-group">
              <select
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
              </select>
              {idCategoria === '' && (
                <div className="invalid-feedback">Seleccione el campo.</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-12">
          <div className="form-group">
            <label>Descripción:</label>
            <textarea
              className="form-control"
              rows="3"
              ref={refDescripcion}
              value={descripcion}
              onChange={handleInputDescripcion}
            ></textarea>
          </div>
        </div>
      </div>

      {/* OPCIONES DE VENTA */}
      <div className="row">
        <div className="col">
          <h6>FORMA DE VENTA</h6>
        </div>
      </div>

      <div className="dropdown-divider"></div>

      <div className="row">
        <div className="col">
          <div className="form-group">
            <label>
              Indica si va ser tratado como unidades, valor monetario o
              granel(peso).
            </label>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col">
          <div className="form-group">
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="tipoTratamiento"
                id={UNIDADES}
                value={UNIDADES}
                checked={idTipoTratamientoProducto === UNIDADES}
                onChange={handleOptionTipoTratamientoProducto}
              />
              <label className="form-check-label" htmlFor={UNIDADES}>
                Unidades
              </label>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="form-group">
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="tipoTratamiento"
                id={VALOR_MONETARIO}
                value={VALOR_MONETARIO}
                checked={idTipoTratamientoProducto === VALOR_MONETARIO}
                onChange={handleOptionTipoTratamientoProducto}
              />
              <label className="form-check-label" htmlFor={VALOR_MONETARIO}>
                Valor monetario
              </label>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="form-group">
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="tipoTratamiento"
                id={A_GRANEL}
                value={A_GRANEL}
                checked={idTipoTratamientoProducto === A_GRANEL}
                onChange={handleOptionTipoTratamientoProducto}
              />
              <label className="form-check-label" htmlFor={A_GRANEL}>
                A Granel
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* SECTOR COSTO */}
      <div className="row">
        <div className="col">
          <h6>COSTO</h6>
        </div>
      </div>

      <div className="dropdown-divider"></div>

      <div className="row">
        <div className="col">
          <div className="form-group">
            <label>Indica el valor de costo de compra de tu producto.</label>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-3 col-md-12">
          <div className="form-group">
            <label>
              Costo inicial:{' '}
              <i className="fa fa-asterisk text-danger small"></i>
            </label>
            <input
              type="text"
              className={`form-control ${costo ? '' : 'is-invalid'}`}
              placeholder="S/ 0.00"
              ref={refCosto}
              value={costo}
              onChange={handleInputCosto}
              onKeyDown={keyNumberFloat}
            />
            {costo === '' && (
              <div className="invalid-feedback">Rellene el campo.</div>
            )}
          </div>
        </div>
      </div>

      {/* SECTOR PRECIO */}

      <div className="row">
        <div className="col">
          <h6>PRECIO</h6>
        </div>
      </div>

      <div className="dropdown-divider"></div>

      <div className="row">
        <div className="col">
          <div className="form-group">
            <label>Indica el valor de venta de tu producto.</label>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-3 col-md-12 ">
          <div className="form-group">
            <label>
              Precio base: <i className="fa fa-asterisk text-danger small"></i>
            </label>
            <input
              type="text"
              className={`form-control ${precio ? '' : 'is-invalid'}`}
              placeholder=" S/ 0.00"
              ref={refPrecio}
              value={precio}
              onChange={handleInputPrecio}
              onKeyDown={keyNumberFloat}
            />
            {precio === '' && (
              <div className="invalid-feedback">Rellene el campo.</div>
            )}
          </div>
        </div>

        {/* <div className="col-lg-1 col-md-12 col-sm-12">
                            <div className='form-group '>
                                <div className="d-flex justify-content-center mt-2" style={{ "paddingTop": "33px" }}>
                                    <i className="fa fa-minus" aria-hidden="true"></i>
                                </div>
                            </div>
                        </div> */}

        {/* <div className="col-lg-3 col-md-12 col-sm-12">
                            <div className='form-group'>
                                <label>Costo inicial: <i className="fa fa-asterisk text-danger small"></i></label>
                                <input
                                    type="text"
                                    className={`form-control ${costo ? "" : "is-invalid"}`}
                                    placeholder="S/ 0.00"
                                    ref={refCosto}
                                    value={costo}
                                    onChange={handleInputCosto}
                                    onKeyDown={keyNumberFloat}
                                />
                                {
                                    costo === "" &&
                                    <div className="invalid-feedback">
                                        Rellene el campo.
                                    </div>
                                }
                            </div>
                        </div> */}

        {/* <div className="col-lg-1 col-12">
                            <div className='form-group'>
                                <div className="d-flex justify-content-center mt-2" style={{ "paddingTop": "33px" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
                                        <path d="M48 128c-17.7 0-32 14.3-32 32s14.3 32 32 32H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H48zm0 192c-17.7 0-32 14.3-32 32s14.3 32 32 32H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H48z" />
                                    </svg>
                                </div>
                            </div>
                        </div> */}

        {/* <div className="col-lg-4 col-md-12 col-sm-12">
                            <div className='form-group'>
                                <label>Utilidad: </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="S/ 0.00"
                                    disabled
                                    value={precio - costo} />
                            </div>
                        </div> */}
      </div>

      {precios.length !== 0 && (
        <table ref={refPrecios} className="table table-borderless">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Nombre</th>
              <th scope="col">Precio</th>
              <th className="text-center" scope="col">
                Quitar
              </th>
            </tr>
          </thead>
          <tbody>
            {precios.map((item, index) => {
              return (
                <tr key={index}>
                  <td>{item.id}</td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ingrese el nombre del precio..."
                      value={item.nombre}
                      onChange={(event) =>
                        handleInputNombrePrecios(event, item.id)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="0.00"
                      value={item.precio}
                      onChange={(event) =>
                        handleInputPrecioPrecios(event, item.id)
                      }
                      onKeyDown={keyNumberFloat}
                    />
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-danger"
                      onClick={() => handleRemovePrecio(item.id)}
                    >
                      <i className="fa fa-remove"></i>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <div className="row">
        <div className="col">
          <div className="form-group">
            <button className="btn text-success" onClick={handleAddPrecio}>
              <i className="fa fa-plus-circle"></i> Agregar Lista de Precios
            </button>
          </div>
        </div>
      </div>

      {/* SECTOR INVENTARIO */}
      {activarInventario && (
        <>
          <div className="row">
            <div className="col">
              <h6>DETALLE DE INVENTARIO</h6>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          <div className="row">
            <div className="col">
              <div className="form-group">
                <label>
                  Distribuye y controla las cantidades de tus productos en
                  diferentes lugares.
                </label>
              </div>
            </div>
          </div>

          {inventario.map((item, index) => {
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

          <div className="row">
            <div className="col">
              <div className="form-group">
                <button
                  className="btn text-success"
                  onClick={handleAddItemInventario}
                >
                  <i className="fa fa-plus-circle"></i> Agregar almacen
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Producto;
