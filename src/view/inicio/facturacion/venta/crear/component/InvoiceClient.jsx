import SearchBarClient from '../../../../../../components/SearchBarClient';

const InvoiceClient = (props) => {
  const { placeholder, refCliente, cliente, clientes } = props;

  const { onEventClearInput, handleFilter, onEventSelectItem } = props;

  const { handleOpenCliente } = props;

  return (
    <div className="invoice-client px-3 pb-3">
      <SearchBarClient
        desing={true}
        placeholder={placeholder}
        refCliente={refCliente}
        cliente={cliente}
        clientes={clientes}
        onEventClearInput={onEventClearInput}
        handleFilter={handleFilter}
        onEventSelectItem={onEventSelectItem}
        handleNewClient={handleOpenCliente}
      />
    </div>
  );
};

export default InvoiceClient;
