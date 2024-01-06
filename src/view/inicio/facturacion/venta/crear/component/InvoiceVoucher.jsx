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

export default InvoiceVoucher;
