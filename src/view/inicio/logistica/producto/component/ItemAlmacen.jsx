const ItemAlmacen = (props) => {
  const { idAlmacen, nombreAlmacen } = props;
  const { cantidad, cantidadMinima, cantidadMaxima } = props;
  const { handleRemoveItemInventario } = props;

  return (
    <div className="row">
      <div className="col-md-2">
        <div className="form-group">
          <div className="rounded border border-secondary d-flex justify-content-center align-items-center p-4">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="50"
                height="50"
                fill="currentColor"
                className="bi bi-tag"
                viewBox="0 0 16 16"
              >
                <path d="M6 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-1 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0z" />
                <path d="M2 1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 1 6.586V2a1 1 0 0 1 1-1zm0 5.586 7 7L13.586 9l-7-7H2v4.586z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-8 d-flex text-left align-items-center">
        <div className="form-group">
          {idAlmacen && (
            <>
              <p className="m-0">{nombreAlmacen}</p>
              <p className="m-0">
                {cantidad} cantidad - {cantidadMinima} min - {cantidadMaxima}{' '}
                max
              </p>
            </>
          )}
          {!idAlmacen && (
            <>
              <p className="m-0">
                Almacen <i className="fa fa-asterisk text-danger small"></i>{' '}
              </p>
              <p className="m-0">
                {' '}
                Agregar aquí la cantidad inicial de tu producto
              </p>
            </>
          )}
        </div>
      </div>

      <div className="col-md-2 align-self-center">
        <div className="form-group">
          <button
            className="btn btn-danger"
            onClick={() => handleRemoveItemInventario(idAlmacen)}
          >
            <i className="fa fa-remove"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemAlmacen;
