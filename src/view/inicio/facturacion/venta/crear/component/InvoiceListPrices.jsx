import PropTypes from 'prop-types';
import SearchInput from '../../../../../../components/SearchInput';
import { numberFormat } from '../../../../../../helper/utils.helper';
import { images } from '../../../../../../helper';

const InvoiceListPrices = (props) => {
  const {
    codiso,
    refProductoMobile,
    placeholder,
    productoMobile,
    productos,
    handleClearInput,
    handleFilter,
    handleSelectItem

  } = props;

  return (
    <div className="px-3 pb-3">
      <SearchInput
        showLeftIcon={false}
        placeholder={placeholder}
        refValue={refProductoMobile}
        value={productoMobile}
        data={productos}
        handleClearInput={handleClearInput}
        handleFilter={handleFilter}
        handleSelectItem={handleSelectItem}
        // customButton={() => (
        //   <button
        //     className="btn btn-outline-success d-flex align-items-center"
        //     onClick={handleOpenCliente}>
        //     <img src={images.addclient} alt="Nuevo cliente" />
        //     <div className="ml-2">Nuevo</div>
        //   </button>
        // )}
        renderItem={(value) => {

          const cantidad = value.tipo === 'PRODUCTO' ? `INV. ${value.cantidad}` : `SERVICIO`;

          return (
            <div>
              <div className='d-flex align-items-center'>
                <img src={images.sale} alt="Venta" width={64} height={64} />
                <div className='ml-2'>
                  <p className='mb-0'>{value.codigo}</p>
                  <h6 >{value.nombreProducto}</h6>
                </div>
              </div>
              <div className='d-flex justify-content-between'>
                <p
                  className={`${value.tipo === 'PRODUCTO' && value.cantidad <= 0 ? 'text-danger' : ''}`}
                >{cantidad}</p>
                <p >{numberFormat(value.precio, codiso)} </p>
              </div>
              {/* {value.nombreProducto} - {numberFormat(value.precio, codiso)} */}
            </div>

          );
        }}
      />
    </div>
  );
};

InvoiceListPrices.propTypes = {
  codiso: PropTypes.string.isRequired,
  refProductoMobile: PropTypes.object.isRequired,
  placeholder: PropTypes.string.isRequired,
  productoMobile: PropTypes.string.isRequired,
  productos: PropTypes.array.isRequired,

  handleClearInput: PropTypes.func.isRequired,
  handleFilter: PropTypes.func.isRequired,
  handleSelectItem: PropTypes.func.isRequired,
}

export default InvoiceListPrices;
