import { images } from '../../../../../../helper';
import PropTypes from 'prop-types';

const InvoiceTicket = (props) => {

  const { nombreComporbante } = props;
  const { handleOpenPreImpresion, handleOpenVenta, handleOpenCotizacion, handleOpenOptions } = props;

  return (
    <div className="invoice-ticket d-flex pl-3 align-items-center justify-content-between">
      <div className="py-3">
        <p className="h5 m-0">{nombreComporbante}</p>
      </div>
      <div className="d-flex">
        <span>
          <button
            className="btn btn-link rounded-circle h-100"
            onClick={handleOpenPreImpresion}
          >
            <img src={images.print} alt="Imprimir" />
          </button>
        </span>

        <span>
          <button
            className="btn btn-link rounded-circle h-100"
          onClick={handleOpenVenta}
          >
            <img src={images.basket} alt="Venta" />
          </button>
        </span>

        <span>
          <button
            className="btn btn-link rounded-circle h-100"
            onClick={handleOpenCotizacion}
          >
            <img src={images.document} alt="Cotización" />
          </button>
        </span>

        <span>
          <button
            className="btn btn-link rounded-circle h-100"
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

InvoiceTicket.propTypes = {
  nombreComporbante: PropTypes.string,
  handleOpenPreImpresion: PropTypes.func,
  handleOpenVenta: PropTypes.func,
  handleOpenCotizacion: PropTypes.func,
  handleOpenOptions: PropTypes.func.isRequired,
}

export default InvoiceTicket;
