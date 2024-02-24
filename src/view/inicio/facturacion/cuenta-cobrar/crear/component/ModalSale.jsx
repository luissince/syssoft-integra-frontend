import { CustomModalContent } from '../../../../../../components/CustomModal';
import {
  keyNumberFloat,
  spinnerLoading,
  numberFormat,
  handlePasteFloat,
} from '../../../../../../helper/utils.helper';
import PropTypes from 'prop-types';

const ModalSale = (props) => {

  const {
    refModal,
    isOpen,
    onOpen,
    onHidden,
    onClose,

    loading,
    refMetodoContado,
    monto,

    bancos,
    codISO,
    bancosAgregados,
    handleAddBancosAgregados,
    handleInputMontoBancosAgregados,
    handleRemoveItemBancosAgregados,

    handleSaveSale,
  } = props;

  const generarVuelto = () => {
    const total = parseFloat(monto);

    const currentAmount = bancosAgregados.reduce((accumulator, item) => {
      accumulator += item.monto ? parseFloat(item.monto) : 0;
      return accumulator;
    }, 0);

    return (
      <div className='row'>
        <div className='col'>
          <h6 className='text-left '>Total: {numberFormat(total, codISO)}</h6>
          <h6 className='text-left '>- -</h6>
        </div>
        <div className='col'>
          <h6 className='text-left text-success'>Cobrado: {numberFormat(currentAmount, codISO)}</h6>
          <h6 className='text-left text-danger'>Por Cobrar: {numberFormat(total - currentAmount, codISO)}</h6>
        </div>
      </div>
    );
  };

  return (
    <CustomModalContent
      contentRef={(ref) => refModal.current = ref}
      isOpen={isOpen}
      onOpen={onOpen}
      onHidden={onHidden}
      onClose={onClose}
      contentLabel="Modal de Cobro"
      titleHeader="Completar Cobro"
      body={
        <>
          {loading && spinnerLoading('Cargando datos...')}

          {/* Titutlo del modal */}
          {/* <div className="row">
            <div className="col">
              <div className="text-center">
                <h5>
                  TOTAL A COBRAR: <span>{numberFormat(monto, codISO)}</span>
                </h5>
              </div>
            </div>
          </div> */}

          {/* Sub titulo */}
          {/* <div className="row">
            <div className="col-md-4 col-sm-4">
              <hr />
            </div>
            <div className="col-md-4 col-sm-4 d-flex align-items-center justify-content-center">
              <h6 className="mb-0">-*-</h6>
            </div>
            <div className="col-md-4 col-sm-4">
              <hr />
            </div>
          </div> */}

          <h6>Lista de métodos:</h6>

          {bancosAgregados.map((item, index) => (
            <MetodoPago
              key={index}
              idBanco={item.idBanco}
              name={item.nombre}
              monto={item.monto}
              handleInputMontoBancosAgregados={handleInputMontoBancosAgregados}
              handleRemoveItemBancosAgregados={handleRemoveItemBancosAgregados}
            />
          ))}

          <br />

          <div className="row">
            <div className='col-12'>
              <div className="form-group ">
                <label>Metodo de cobro:</label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <div className="input-group-text">
                      <i className="bi bi-tag-fill"></i>
                    </div>
                  </div>
                  <select
                    title="Lista metodo de cobro"
                    className="form-control"
                    ref={refMetodoContado}
                  >
                    {bancos.map((item, index) => (
                      <option key={index} value={item.idBanco}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="input-group-append">
                    <button
                      className="btn btn-outline-success d-flex"
                      title="Agregar Pago"
                      onClick={handleAddBancosAgregados}
                    >
                      <i className="bi bi-plus-circle-fill"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div className='row'>
            <div className="col-12">
              <div className="text-center">{generarVuelto()}</div>
            </div>
          </div>

        </>
      }
      footer={
        <>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveSale}
          >
            <i className='fa fa-save'></i> Procesar Cobro
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onClose}
          >
            <i className='fa fa-close'></i> Cerrar
          </button>
        </>
      }
    />
  );
};

const MetodoPago = ({
  idBanco,
  name,
  monto,
  handleInputMontoBancosAgregados,
  handleRemoveItemBancosAgregados,
}) => {
  return (
    <div className="input-group mb-2">
      <input
        autoFocus
        type="text"
        className="form-control"
        placeholder="Monto"
        value={monto}
        onChange={(event) => handleInputMontoBancosAgregados(event, idBanco)}
        onKeyDown={keyNumberFloat}
        onPaste={handlePasteFloat}
      />
      <div className="input-group-prepend">
        <div className="input-group-text">
          <span>{name}</span>
        </div>
      </div>
      <div className="input-group-append">
        <button
          className="btn btn-outline-danger d-flex"
          title="Agregar Pago"
          onClick={() => handleRemoveItemBancosAgregados(idBanco)}
        >
          <i className="bi bi-trash3-fill"></i>
        </button>
      </div>
    </div>
  );
};

ModalSale.propTypes = {
  refModal: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
  onHidden: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,

  loading: PropTypes.bool.isRequired,
  refMetodoContado: PropTypes.object.isRequired,
  monto: PropTypes.number.isRequired,

  bancos: PropTypes.array.isRequired,
  codISO: PropTypes.string.isRequired,
  bancosAgregados: PropTypes.array.isRequired,
  handleAddBancosAgregados: PropTypes.func.isRequired,
  handleInputMontoBancosAgregados: PropTypes.func.isRequired,
  handleRemoveItemBancosAgregados: PropTypes.func.isRequired,

  handleSaveSale: PropTypes.func.isRequired,
}

MetodoPago.propTypes = {
  idBanco: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  monto: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  handleInputMontoBancosAgregados: PropTypes.func.isRequired,
  handleRemoveItemBancosAgregados: PropTypes.func.isRequired,
}

export default ModalSale;
