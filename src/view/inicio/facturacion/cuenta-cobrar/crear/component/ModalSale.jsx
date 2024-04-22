import { CustomModalForm } from '../../../../../../components/CustomModal';
import {
  numberFormat,
  handlePasteFloat,
  isEmpty,
} from '../../../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import Row from '../../../../../../components/Row';
import Column from '../../../../../../components/Column';
import { SpinnerView } from '../../../../../../components/Spinner';
import Input from '../../../../../../components/Input';

const ModalSale = (props) => {

  const {
    refModal,
    isOpen,
    onOpen,
    onHidden,
    onClose,

    loading,

    refCobrar,
    cobrar,
    handleInputCobrar,

    nextModalCobro,

    refMetodoContado,
    refMetodoPagoContenedor,
    monto,

    observacion,
    handleInputObservacion,

    idPlazo,
    plazos,

    bancos,
    codISO,
    bancosAgregados,
    handleAddBancosAgregados,
    handleInputMontoBancosAgregados,
    handleRemoveItemBancosAgregados,

    handleSaveSale,
  } = props;

  const generarVuelto = () => {
    const total = parseFloat(cobrar);

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

  const informacion = () => {
    const total = parseFloat(monto);

    let cobrado = 0;
    const plazo = plazos.find(item => item.idPlazo === idPlazo)
    if (plazo) {
      cobrado = plazo.ingresos.reduce((acc, item) => acc + item.monto, 0)
    }

    return (
      <Row>
        <Column>
          <div className='form-group'>
            <p className='text-left m-0'>Dueda Total: {numberFormat(total, codISO)}</p>
            <p className='text-left text-success  m-0'>Monto Cobrado: {numberFormat(cobrado, codISO)}</p>
          </div>
        </Column>

        <Column>
          <div className='form-group'>
            <p className='text-left text-info  m-0'>Monto a Cobrar: {numberFormat(cobrar, codISO)}</p>
            <p className='text-left text-info  m-0'>Monto por Cobrar: {numberFormat(total - cobrado, codISO)}</p>
            <hr className='m-0' />
            <p className='text-left text-danger  m-0'>Saldo Restante: {numberFormat(total - cobrado - cobrar, codISO)}</p>
          </div>
        </Column>
      </Row>
    );
  }

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

          {!nextModalCobro && (
            <>
              <Row>
                <Column>
                  <div className='form-group'>
                    <label>Monto a cobrar: <i className='fa fa-asterisk text-danger small'></i></label>
                    <Input
                      autoFocus={true}
                      placeholder={"0.00"}
                      refInput={refCobrar}
                      value={cobrar}
                      onChange={handleInputCobrar}
                    />
                  </div>
                </Column>
              </Row>

              <Row>
                <Column>
                  <div className='form-group'>
                    <label>Observación:</label>
                    <textarea
                      className='form-control'
                      placeholder='Ingrese algúna observación...'
                      value={observacion}
                      onChange={handleInputObservacion}>

                    </textarea>
                  </div>
                </Column>
              </Row>
            </>
          )}

          {nextModalCobro &&
            <>
              <Row>
                <Column>
                  <div className="text-center">
                    <h5>
                      TOTAL A COBRAR: <span>{numberFormat(cobrar, codISO)}</span>
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
                <Column refChildren={refMetodoPagoContenedor}>
                  <div className="form-group">
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
                  <div className="form-group">
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
                  <div className="form-group">
                    <div className="text-center">{generarVuelto()}</div>
                  </div>
                </Column>
              </Row>

              <hr className='mt-0 mb-2' />

              <Row>
                <Column className="col-12">
                  <h6>Información de deuda:</h6>
                </Column>
              </Row>

              {informacion()}
            </>
          }
        </>
      }
      footer={
        <>
          {
            !nextModalCobro && (
              <>
                <p>Los campos con <i className='fa fa-asterisk text-danger small'></i> son obligatorios </p>
                <div>
                  <button
                    type="submit"
                    className="btn btn-outline-success"
                  >
                    <i className='fa fa-arrow-right'></i> Continuar
                  </button>
                </div>
              </>
            )
          }

          {
            nextModalCobro && (
              <>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <i className='fa fa-save'></i> Completar
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={async () => await refModal.current.handleOnClose()}
                >
                  <i className='fa fa-close'></i> Cerrar
                </button>
              </>
            )
          }
        </>
      }
      classNameFooter={nextModalCobro ? "" : "footer-cm-content"}
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
        onPaste={handlePasteFloat}
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

  refCobrar: PropTypes.object.isRequired,
  cobrar: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  handleInputCobrar: PropTypes.func.isRequired,

  nextModalCobro: PropTypes.bool.isRequired,

  refMetodoPagoContenedor: PropTypes.object.isRequired,
  refMetodoContado: PropTypes.object.isRequired,
  monto: PropTypes.number.isRequired,

  observacion: PropTypes.string.isRequired,
  handleInputObservacion: PropTypes.func.isRequired,

  idPlazo: PropTypes.number.isRequired,
  plazos: PropTypes.array.isRequired,

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
