import Button from '../../../../../../../components/Button';
import SearchInput from '../../../../../../../components/SearchInput';
import PropTypes from 'prop-types';

const InvoiceClient = (props) => {
  const { placeholder, refCliente, refValueCliente, clientes } = props;

  const { handleClearInput, handleFilter, handleSelectItem } = props;

  const { handleOpenCliente } = props;

  return (
    <div className="invoice-client px-3">
      <SearchInput
        ref={refCliente}
        placeholder={placeholder}
        refValue={refValueCliente}
        data={clientes}
        handleClearInput={handleClearInput}
        handleFilter={handleFilter}
        handleSelectItem={handleSelectItem}
        customButton={
          <Button
            className="btn-outline-primary d-flex align-items-center"
            onClick={handleOpenCliente}
          >
            <i className="fa fa-user-plus"></i>
            <div className="ml-2">Nuevo</div>
          </Button>
        }
        renderItem={(value) => (
          <>{value.documento + ' - ' + value.informacion}</>
        )}
      />
    </div>
  );
};

InvoiceClient.propTypes = {
  placeholder: PropTypes.string.isRequired,
  refCliente: PropTypes.object,
  refValueCliente: PropTypes.object.isRequired,
  clientes: PropTypes.array.isRequired,

  handleClearInput: PropTypes.func.isRequired,
  handleFilter: PropTypes.func.isRequired,
  handleSelectItem: PropTypes.func.isRequired,

  handleOpenCliente: PropTypes.func.isRequired,
};

export default InvoiceClient;
