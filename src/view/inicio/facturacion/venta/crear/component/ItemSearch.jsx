import PropTypes from 'prop-types';

const ItemSearch = (props) => {
  const {
    refProducto,
    producto,
    filtrarCodBar,
    handleCodBarProducto,
    handleAllProducto,
    handleFilterCodBarProducto,
    handleSearchCodBarProducto,
    handleFilterAllProducto
  } = props;

  return (
    <div className="d-flex align-items-center justify-content-between p-4">
      <div className="w-100 mr-2">
        <div className="input-group">
          <div className="input-group-prepend">
            <button
              className={`btn ${filtrarCodBar ? "btn-success " : "btn-outline-success"} px-3`}
              type="button"
              onClick={handleCodBarProducto}>
              <i className='fa fa-barcode'></i>
            </button>
            <button
              className={`btn ${filtrarCodBar ? "btn-outline-success" : "btn-success"}`}
              type="button"
              onClick={handleAllProducto}>
              <i className='fa fa-search px-1'></i>
            </button>
          </div>
          {
            filtrarCodBar ?
              <input
                type="text"
                className="form-control border border-success"
                placeholder={`Buscar código de barras.`}
                ref={refProducto}
                value={producto}
                onChange={handleFilterCodBarProducto}
                onKeyDown={handleSearchCodBarProducto}
                autoFocus
              />
              :
              <input
                type="text"
                className="form-control border border-success"
                placeholder={`Buscar por código, nombres.`}
                ref={refProducto}
                value={producto}
                onChange={handleFilterAllProducto}               
                autoFocus
              />
          }

        </div>
      </div>
      {/* <button className='btn btn-outline-success d-flex align-items-center justify-content-center' style={{ minWidth: "10rem" }}>
                <div className='mr-2'>Nuevo producto</div>
                <img src={images.add} alt='Agregar Producto' />
            </button> */}
    </div>
  );
};

ItemSearch.propTypes = {
  refProducto: PropTypes.object.isRequired,
  producto: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  filtrarCodBar: PropTypes.bool.isRequired,
  handleCodBarProducto: PropTypes.func.isRequired,
  handleAllProducto: PropTypes.func.isRequired,
  handleFilterCodBarProducto: PropTypes.func.isRequired,
  handleSearchCodBarProducto: PropTypes.func.isRequired,
  handleFilterAllProducto: PropTypes.func.isRequired,
}

export default ItemSearch;
