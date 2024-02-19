import PropTypes from 'prop-types';

const InvoiceVoucher = (props) => {
  const {
    comprobantes,
    refComprobante,
    idComprobante,
    handleSelectComprobante,
  } = props;

  return (
    <div className="invoice-voucher px-3 pt-3">
      <div className="form-group">
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
              {item.nombre} ({item.serie})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

InvoiceVoucher.propTypes = {
  comprobantes: PropTypes.array.isRequired,
  refComprobante: PropTypes.object.isRequired,
  idComprobante: PropTypes.string.isRequired,

  handleSelectComprobante: PropTypes.func.isRequired,
}

export default InvoiceVoucher;
