import { cn } from '@/lib/utils';
import Button from '@/components/Button';
import { images } from '@/helper';
import PropTypes from 'prop-types';

const InvoiceTicket = (props) => {
  const { className } = props;
  const { nombreComporbante } = props;
  const {
    handleOpenPreImpresion,
    handleOpenVenta,
    handleOpenCotizacion,
    handleOpenPedido,
    handleOpenOptions,
  } = props;

  return (
    <div className={cn(
      "invoice-ticket pl-3 py-2 flex flex-row items-center justify-between w-full flex-wrap",
      className
    )}>
      <div>
        <p className="h5 m-0">{nombreComporbante}</p>
      </div>
      <div className="flex">
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
            onClick={handleOpenPedido}
          >
            <img src={images.invoice_gray} alt="Pedido" width={22} />
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
  className: PropTypes.string,
  nombreComporbante: PropTypes.string,
  handleOpenPreImpresion: PropTypes.func,
  handleOpenVenta: PropTypes.func,
  handleOpenCotizacion: PropTypes.func,
  handleOpenPedido: PropTypes.func,
  handleOpenOptions: PropTypes.func.isRequired,
};

export default InvoiceTicket;
