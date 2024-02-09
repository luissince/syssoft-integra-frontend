import { images } from '../../../../../../helper';

const InvoiceTicket = (props) => {
  const { handleOpenPrint, handleOpenOptions } = props;

  return (
    <div className="invoice-ticket d-flex pl-3 align-items-center justify-content-between">
      <div className="py-3">
        <p className="h5 m-0">Boleta de venta</p>
      </div>
      <div className="d-flex">
        {/* <span>
          <button
            className="btn btn-link rounded-circle"
            onClick={handleOpenPrint}
          >
            <img src={images.print} alt="Imprimir" />
          </button>
        </span> */}
        <span>
          <button
            className="btn btn-link rounded-circle"
            data-bs-toggle="tooltip"
            data-bs-placement="bottom"
            title="Tooltip on bottom"
            onClick={handleOpenOptions}
          >
            <img src={images.options} alt="Opciones" />
          </button>
        </span>
      </div>
    </div>
  );
};

export default InvoiceTicket;
