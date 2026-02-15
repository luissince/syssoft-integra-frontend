import {
  formatCurrency,
} from '@/helper/utils.helper';
import Button from '@/components/Button';

interface Props {
  numeroDeItems: number,
  codiso: string,
  subTotal: number,
  impuestoDetalle: () => React.ReactNode,
  total: number,
  handleOpenSale: () => void,
  handleClearSale: () => void,
};


const InvoiceFooter = (props: Props) => {
  const {
    numeroDeItems,
    codiso,
    subTotal,
    impuestoDetalle,
    total,
    handleOpenSale,
    handleClearSale
  } = props;

  return (
    <div className="border-t border-solid border-[#cbd5e1]">
      <div className="px-3 mb-2 text-sm text-gray-500">
        <div className="flex items-center justify-between py-2">
          <p>Sub Total:</p>
          <p>{formatCurrency(subTotal, codiso)}</p>
        </div>
        {impuestoDetalle()}
      </div>
      <div className="px-3 mb-2">
        <div>
          <div>
            <Button
              className="btn-success btn-lg w-full !flex items-center justify-between"
              onClick={handleOpenSale}
            >
              <div>Cobrar (F1)</div>
              <div>{formatCurrency(total, codiso)}</div>
            </Button>
          </div>
          <div>
            <Button
              className="btn-link w-full !flex items-center justify-between px-0"
              onClick={handleClearSale}
            >
              <div className="text-dark">{numeroDeItems}</div>
              <div className="text-danger">Cancelar (F2)</div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceFooter;
