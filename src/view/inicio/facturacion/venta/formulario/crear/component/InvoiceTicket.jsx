import Button from '../../../../../../../components/Button';
import { images } from '../../../../../../../helper';
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
        {/* <span>
          <Button
            className="btn-link rounded-circle h-100"
            onClick={handleOpenPreImpresion}
          >
            <img src={images.print} alt="Imprimir" />
          </Button>
        </span> */}

        <span>
          <Button
            className="btn-link rounded-circle h-100"
            onClick={handleOpenVenta}
          >
            <img src={images.basket} alt="Venta" />
          </Button>
        </span>

        <span>
          <Button
            className="btn-link rounded-circle h-100"
            onClick={handleOpenCotizacion}
          >
            <img src={images.document} alt="Cotización" />
          </Button>
        </span>

        <span>
          <Button
            className="btn-link rounded-circle h-100"
            onClick={handleOpenOptions}
          >
            <img src={images.options} alt="Opciones" />
          </Button>
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
