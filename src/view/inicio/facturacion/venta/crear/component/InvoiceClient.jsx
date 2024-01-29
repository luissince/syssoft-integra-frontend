import SearchInput from '../../../../../../components/SearchInput';
import { images } from '../../../../../../helper';

const InvoiceClient = (props) => {
  const { placeholder, refCliente, cliente, clientes } = props;

  const { onEventClearInput, handleFilter, onEventSelectItem } = props;

  const { handleOpenCliente } = props;

  return (
    <div className="invoice-client px-3 pb-3">
      <SearchInput
        showLeftIcon={false}
        placeholder={placeholder}
        refValue={refCliente}
        value={cliente}
        data={clientes}
        handleClearInput={onEventClearInput}
        handleFilter={handleFilter}
        handleSelectItem={onEventSelectItem}
        customButton={() => (
          <button
            className="btn btn-outline-success d-flex align-items-center"
            onClick={handleOpenCliente}>
            <img src={images.addclient} alt="Nuevo cliente" />
            <div className="ml-2">Nuevo</div>
          </button>
        )}
        renderItem={(value) =>
          <>
            {value.documento + ' - ' + value.informacion}
          </>
        }
      />
    </div>
  );
};

export default InvoiceClient;
