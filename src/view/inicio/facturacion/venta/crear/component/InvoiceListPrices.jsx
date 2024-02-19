import PropTypes from 'prop-types';

const InvoiceListPrices = (props) => {
  const {
    refComprobante,
    idComprobante,
    comprobantes,
    handleSelectComprobante,
  } = props;

  return (
    <div className="invoice-list-prices">
      <div className="pt-1 pb-1 d-flex align-items-center">
        <div className="col-12">
          <p className="">Numeración</p>
          <select
            title="Comprobantes de venta"
            className="form-control"
            ref={refComprobante}
            value={idComprobante}
            onChange={handleSelectComprobante}
          >
            <option>-- Comprobantes --</option>
            {comprobantes.map((item, index) => (
              <option key={index} value={item.idComprobante}>
                {item.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

InvoiceListPrices.propTypes = {
  refComprobante: PropTypes.object.isRequired,
  idComprobante: PropTypes.string.isRequired,
  comprobantes: PropTypes.array.isRequired,

  handleSelectComprobante: PropTypes.func.isRequired,
}

export default InvoiceListPrices;
