import { keyNumberFloat } from '../../../../../helper/utils.helper';

const Servicio = (props) => {
  const { nombre, refNombre, handleSelectNombre } = props;

  const { codigo, refCodigo, handleInputCodigo } = props;

  const { codigoSunat, refCodigoSunat, handleSelectCodigoSunat } = props;

  const { idMedida, refIdMedida, handleSelectIdMedida, medidas } = props;

  const { idCategoria, refIdCategoria, handleSelectIdCategoria, categorias } =
    props;

  const { descripcion, refDescripcion, handleInputDescripcion } = props;

  const { precio, refPrecio, handleInputPrecio } = props;

  return (
    <div
      className="tab-pane fade "
      id="addservicio"
      role="tabpanel"
      aria-labelledby="addservicio-tab"
    >
      {/* SECTOR TITULO*/}
      <div className="row">
        <div className="form-group col-md-12">
          <label>
            Crea las actividades comerciales o de consultoría que ofreces a tus
            clientes.
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
        <div className="form-group col-md-12">
          <label>
            Nombre del servicio:{' '}
            <i className="fa fa-asterisk text-danger small"></i>
          </label>
          <input
            type="text"
            className={`form-control ${nombre ? '' : 'is-invalid'}`}
            placeholder="Dijite un nombre..."
            ref={refNombre}
            value={nombre}
            onChange={handleSelectNombre}
          />
          {nombre === '' && (
            <div className="invalid-feedback">Rellene el campo.</div>
          )}
        </div>

        <div className="form-group col-md-6">
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

        <div className="form-group col-md-6">
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

        <div className="form-group col-md-6">
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

        <div className="form-group col-md-6">
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

        <div className="form-group col-md-12">
          <label>Descripción: </label>
          <textarea
            className="form-control"
            rows="3"
            ref={refDescripcion}
            value={descripcion}
            onChange={handleInputDescripcion}
          ></textarea>
        </div>
      </div>

      {/* SECTOR DE PRECIO */}
      <div className="row">
        <div className="col">
          <h6>PRECIO</h6>
        </div>
      </div>

      <div className="dropdown-divider"></div>

      <div className="row">
        <div className="col">
          <div className="form-group">
            <label>
              Indica el valor de venta y el costo de compra de tu producto.
            </label>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-3 col-md-12 col-sm-12">
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
    </div>
  );
};

export default Servicio;
