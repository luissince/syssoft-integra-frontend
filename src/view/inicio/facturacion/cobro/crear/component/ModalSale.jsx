import { CustomModalForm } from '../../../../../../components/CustomModal';
import Row from '../../../../../../components/Row';
import Column from '../../../../../../components/Column';
import {
  keyNumberFloat,
  numberFormat,
  isEmpty,
} from '../../../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import { SpinnerView } from '../../../../../../components/Spinner';

const ModalSale = (props) => {

  const {
    refModal,
    isOpen,
    onOpen,
    onHidden,
    onClose,

    loading,
    refMetodoContado,
    importeTotal,

    bancos,
    codISO,
    bancosAgregados,
    handleAddBancosAgregados,
    handleInputMontoBancosAgregados,
    handleRemoveItemBancosAgregados,

    handleSaveSale,
  } = props;

  const generarVuelto = () => {
    const total = parseFloat(importeTotal);

    if (isEmpty(bancosAgregados)) {
      return <h5>Agrega algún método de pago.</h5>;
    }

    const currentAmount = bancosAgregados.reduce((accumulator, item) => {
      accumulator += item.monto ? parseFloat(item.monto) : 0;
      return accumulator;
    }, 0);

    if (bancosAgregados.length > 1) {
      if (currentAmount >= total) {
        return (
          <>
            <h5>
              RESTANTE: <span>{numberFormat(currentAmount - total, codISO)}</span>
            </h5>
            <h6 className="text-danger">
              Más de dos metodos de pago no generan vuelto.
            </h6>
          </>
        );
      } else {
        return (
          <>
            <h5>
              POR COBRAR: <span>{numberFormat(total - currentAmount, codISO)}</span>
            </h5>
            <h6 className="text-danger">
              Más de dos metodos de pago no generan vuelto.
            </h6>
          </>
        );
      }
    }

    const metodo = bancosAgregados[0];
    if (metodo.vuelto === 1) {
      if (currentAmount >= total) {
        return (
          <h5>
            SU CAMBIO ES: <span>{numberFormat(currentAmount - total, codISO)}</span>
          </h5>
        );
      } else {
        return (
          <h5 className="text-danger">
            POR COBRAR: <span>{numberFormat(total - currentAmount, codISO)}</span>
          </h5>
        );
      }
    } else {
      if (currentAmount >= total) {
        return (
          <>
            <h5>
              RESTANTE: <span>{numberFormat(currentAmount - total, codISO)}</span>
            </h5>
            <h6 className="text-danger">El método de pago no genera vuelto.</h6>
          </>
        );
      } else {
        return (
          <>
            <h5>
              POR COBRAR: <span>{numberFormat(total - currentAmount, codISO)}</span>
            </h5>
            <h6 className="text-danger">El método de pago no genera vuelto.</h6>
          </>
        );
      }
    }
  };

  return (
    <CustomModalForm
      contentRef={refModal}
      isOpen={isOpen}
      onOpen={onOpen}
      onHidden={onHidden}
      onClose={onClose}
      contentLabel="Modal de Cobro"
      titleHeader="Completar Cobro"
      onSubmit={handleSaveSale}
      body={
        <>
          <SpinnerView
            loading={loading}
            message={'Cargando datos...'}
          />

          <Row>
            <Column>
              <div className="text-center">
                <h5>
                  TOTAL A COBRAR: <span>{numberFormat(importeTotal, codISO)}</span>
                </h5>
              </div>
            </Column>
          </Row>

          <Row>
            <Column className="col-md-4 col-sm-4">
              <hr />
            </Column>
            <Column className="col-md-4 col-sm-4 d-flex align-items-center justify-content-center">
              <h6 className="mb-0">-*-</h6>
            </Column>
            <Column className="col-md-4 col-sm-4">
              <hr />
            </Column>
          </Row>

          <Row>
            <Column>
              <div className='form-group'>
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

              </div>
            </Column>
          </Row>

          <Row>
            <Column className='col-12'>
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
                      type="button"
                      className="btn btn-outline-success d-flex"
                      title="Agregar Pago"
                      onClick={handleAddBancosAgregados}
                    >
                      <i className="bi bi-plus-circle-fill"></i>
                    </button>
                  </div>
                </div>
              </div>
            </Column>
          </Row>

          <Row>
            <Column className="col-12">
              <div className="text-center">{generarVuelto()}</div>
            </Column>
          </Row>
        </>
      }
      footer={
        <>
          <button
            type="submit"
            className="btn btn-primary"
          >
            <i className='fa fa-save'></i> Procesar Cobro
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={async () => await refModal.current.handleOnClose()}
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
        role='float'
        className="form-control"
        placeholder="Monto"
        value={monto}
        onChange={(event) => handleInputMontoBancosAgregados(event, idBanco)}
        onKeyDown={keyNumberFloat}
      />
      <div className="input-group-prepend">
        <div className="input-group-text">
          <span>{name}</span>
        </div>
      </div>
      <div className="input-group-append">
        <button
          type="button"
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
  importeTotal: PropTypes.number.isRequired,

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
