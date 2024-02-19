import SearchInput from '../../../../../../components/SearchInput';
import { images } from '../../../../../../helper';
import PropTypes from 'prop-types';

const InvoiceClient = (props) => {
  const { placeholder, refCliente, cliente, clientes } = props;

  const { handleClearInputClient, handleFilter, handleSelectItemClient } = props;

  const { handleOpenCliente } = props;

  return (
    <div className="invoice-client px-3 pb-3">
      <SearchInput
        showLeftIcon={false}
        placeholder={placeholder}
        refValue={refCliente}
        value={cliente}
        data={clientes}
        handleClearInput={handleClearInputClient}
        handleFilter={handleFilter}
        handleSelectItem={handleSelectItemClient}
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

InvoiceClient.propTypes = {
  placeholder: PropTypes.string.isRequired,
  refCliente: PropTypes.object.isRequired,
  cliente: PropTypes.string.isRequired,
  clientes: PropTypes.array.isRequired,

  handleClearInputClient: PropTypes.func.isRequired,
  handleFilter: PropTypes.func.isRequired,
  handleSelectItemClient: PropTypes.func.isRequired,

  handleOpenCliente: PropTypes.func.isRequired,
}

export default InvoiceClient;
