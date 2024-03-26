import Column from '../../../../../../components/Column';
import { CustomModalForm } from '../../../../../../components/CustomModal';
import Row from '../../../../../../components/Row';
import { SpinnerView } from '../../../../../../components/Spinner';
import {
  keyNumberInteger,
  numberFormat,
  isEmpty,
  isNumeric,
} from '../../../../../../helper/utils.helper';
import { CONTADO, CREDITO_FIJO, CREDITO_VARIABLE } from '../../../../../../model/types/forma-pago';
import PropTypes from 'prop-types';

const ModalSale = (props) => {

  const {
    refModal,
    isOpen,
    onOpen,
    onHidden,
    onClose,

    loading,
    refMetodoPagoContenedor,

    formaPago,
    handleSelectTipoPago,

    refNumeroCuotas,
    numeroCuotas,
    handleSelectNumeroCuotas,

    refFrecuenciaPagoCredito,
    frecuenciaPagoCredito,
    handleSelectFrecuenciaPagoCredito,

    refFrecuenciaPago,
    frecuenciaPago,
    handleSelectFrecuenciaPago,

    codiso,
    importeTotal,

    refMetodoContado,
    bancos,
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

    if (!bancosAgregados.length > 1) {
      if (currentAmount >= total) {
        return (
          <>
            <h5>
              RESTANTE: <span>{numberFormat(currentAmount - total, codiso)}</span>
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
              POR COBRAR: <span>{numberFormat(total - currentAmount, codiso)}</span>
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
            SU CAMBIO ES: <span>{numberFormat(currentAmount - total, codiso)}</span>
          </h5>
        );
      } else {
        return (
          <h5 className="text-danger">
            POR COBRAR: <span>{numberFormat(total - currentAmount, codiso)}</span>
          </h5>
        );
      }
    } else {
      if (currentAmount >= total) {
        return (
          <>
            <h5>
              RESTANTE: <span>{numberFormat(currentAmount - total, codiso)}</span>
            </h5>
            <h6 className="text-danger">El método de pago no genera vuelto.</h6>
          </>
        );
      } else {
        return (
          <>
            <h5>
              POR COBRAR: <span>{numberFormat(total - currentAmount, codiso)}</span>
            </h5>
            <h6 className="text-danger">El método de pago no genera vuelto.</h6>
          </>
        );
      }
    }
  };

  const letraMensual = () => {
    const total = parseFloat(importeTotal);
    if (!isNumeric(numeroCuotas) || numeroCuotas <= 0) return 0;
    return total / numeroCuotas;
  }


  return (
    <CustomModalForm
      contentRef={(ref) => refModal.current = ref}
      isOpen={isOpen}
      onOpen={onOpen}
      onHidden={onHidden}
      onClose={onClose}
      contentLabel="Modal de Venta"
      titleHeader="Completar Venta"
      onSubmit={handleSaveSale}
      body={
        <>
          <SpinnerView
            loading={loading}
            message={'Cargando datos...'}
          />

          {/* Titutlo del modal */}
          <Row>
            <Column>
              <div className="text-center">
                <h5>
                  TOTAL A COBRAR: <span>{numberFormat(importeTotal, codiso)}</span>
                </h5>
              </div>
            </Column>
          </Row>

          {/* Sun titulo */}
          <Row>
            <Column className="col-md-4 col-sm-4">
              <hr />
            </Column>
            <Column className="col-md-4 col-sm-4 d-flex align-items-center justify-content-center">
              <h6 className="mb-0">Tipos de cobros</h6>
            </Column>
            <Column className="col-md-4 col-sm-4">
              <hr />
            </Column>
          </Row>

          {/* Tipos de venta */}
          <Row>
            {/* Al contado */}
            <Column className="col-md-6 col-sm-12">
              <button
                className={`btn ${formaPago === CONTADO ? 'btn-primary' : 'btn-light'} btn-block`}
                type="button"
                title="Pago al contado"
                onClick={() => handleSelectTipoPago(CONTADO)}
              >
                <div className="row">
                  <div className="col-md-12">
                    <i className="bi bi-cash-coin fa-2x"></i>
                  </div>
                </div>
                <div className="text-center">
                  <label>Contado</label>
                </div>
              </button>
            </Column>

            {/* Crédito fijo*/}
            <Column className="col-md-6 col-sm-12">
              <button
                className={`btn ${formaPago === CREDITO_FIJO ? 'btn-primary' : 'btn-light'} btn-block`}
                type="button"
                title="Pago al credito"
                onClick={() => handleSelectTipoPago(CREDITO_FIJO)}
              >
                <Row>
                  <Column className="col-md-12">
                    <i className="bi bi-boxes fa-2x"></i>
                  </Column>
                </Row>
                <div className="text-center">
                  <label>Crédito fijo</label>
                </div>
              </button>
            </Column>

            {/* Crédito variable */}
            {/* <div className="col-md-3 col-sm-3">
              <button
                className={`btn ${formaPago === CREDITO_VARIABLE ? 'btn-primary' : 'btn-light'
                  } btn-block`}
                type="button"
                title="Pago al credito"
                onClick={() => handleSelectTipoPago(CREDITO_VARIABLE)}
              >
                <div className="row">
                  <div className="col-md-12">
                    <i className="bi bi-columns-gap fa-2x"></i>
                  </div>
                </div>
                <div className="text-center">
                  <label>Crédito variable</label>
                </div>
              </button>
            </div> */}

            {/* Pago adelantado */}
            {/* <div className="col-md-3 col-sm-3">
              <button
                className={`btn ${formaPago === ADELANTADO ? 'btn-primary' : 'btn-light'
                  } btn-block`}
                type="button"
                title="Pago al credito"
                onClick={() => handleSelectTipoPago(ADELANTADO)}
              >
                <div className="row">
                  <div className="col-md-12">
                    <i className="bi bi-columns-gap fa-2x"></i>
                  </div>
                </div>
                <div className="text-center">
                  <label>Pago Adelantado</label>
                </div>
              </button>
            </div> */}
          </Row>

          <br />
          {/* contado detalle */}
          {formaPago === CONTADO && (
            <Row >
              <Column ref={refMetodoPagoContenedor}>
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

              <Column className="col-12">
                <div className="form-group">
                  <label>Agregar método de cobro:</label>
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
                        type='button'
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

              <Column className="col-12">
                <br />
              </Column>

              <Column className="col-12">
                <div className="text-center">{generarVuelto()}</div>
              </Column>
            </Row>
          )}

          {/* crédito fijo */}
          {formaPago === CREDITO_FIJO && (
            <Row>
              <Column>

                <div className="form-group">
                  <span className="text-md">
                    <i className="bi bi-info-circle text-success text-lg"></i>{' '}
                    Los pagos se efectúan en función del número de
                    cuotas, con una alerta que indica la frecuencia de
                    los pagos.
                  </span>
                </div>

                <div className="form-group">
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <div className="input-group-text">
                        <i className="bi bi-hourglass-split"></i>
                      </div>
                    </div>
                    <input
                      title="Número de cuotas"
                      type="text"
                      className="form-control"
                      placeholder="Número de cuotas"
                      ref={refNumeroCuotas}
                      value={numeroCuotas}
                      onChange={handleSelectNumeroCuotas}
                      onKeyDown={keyNumberInteger}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <div className="input-group-text">
                        <i className="bi bi-credit-card-2-back"></i>
                      </div>
                    </div>
                    <select
                      title="Lista frecuencia de pago"
                      className="form-control"
                      ref={refFrecuenciaPagoCredito}
                      value={frecuenciaPagoCredito}
                      onChange={handleSelectFrecuenciaPagoCredito}
                    >
                      <option value="">-- Frecuencia de pago --</option>
                      <option value="15">Quinsenal</option>
                      <option value="30">Mensual</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <div className="input-group-text">
                        <i className="bi bi-coin"></i>
                      </div>
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="0.00"
                      value={letraMensual()}
                      disabled={true}
                    />
                  </div>
                </div>
              </Column>
            </Row>
          )}

          {/* crédito variable */}
          {formaPago === CREDITO_VARIABLE && (
            <Row>
              <Column>
                <div className="form-group">
                  <span className="text-md">
                    <i className="bi bi-info-circle text-success text-lg"></i>{' '}
                    Los pagos se realizan de acuerdo con la frecuencia
                    establecida, con alertas programadas para recordar
                    las fechas de pago.
                  </span>
                </div>

                <div className="form-group">
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <div className="input-group-text">
                        <i className="bi bi-credit-card-2-back"></i>
                      </div>
                    </div>
                    <select
                      title="Lista frecuencia de pago"
                      className="form-control"
                      ref={refFrecuenciaPago}
                      value={frecuenciaPago}
                      onChange={handleSelectFrecuenciaPago}
                    >
                      <option value="">-- Frecuencia de pago --</option>
                      <option value="15">Quinsenal</option>
                      <option value="30">Mensual</option>
                    </select>
                  </div>
                </div>
              </Column>
            </Row>
          )}

          {/* pago adelantado */}
          {/* {formaPago === ADELANTADO && (
            <div className="row">
              <div className="col">

                <div className="form-group">
                  <span className="text-md">
                    <i className="bi bi-info-circle text-success text-lg"></i>{' '}
                    Los pagos se efectúan de manera habitual; sin embargo, el inventario no se reduce, ya que se trata de un pago anticipado.
                  </span>
                </div>

              </div>
            </div>
          )} */}
        </>
      }
      footer={
        <>
          <button
            type="submit"
            className="btn btn-primary"
          // onClick={handleSaveSale}
          >
            Completar venta
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onClose}
          >
            Cerrar
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
        role={"float"}
        className="form-control"
        placeholder="Monto"
        value={monto}
        onChange={(event) => handleInputMontoBancosAgregados(event, idBanco)}
      />
      <div className="input-group-prepend">
        <div className="input-group-text">
          <span>{name}</span>
        </div>
      </div>
      <div className="input-group-append">
        <button
          type='button'
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
  refMetodoPagoContenedor: PropTypes.object.isRequired,

  formaPago: PropTypes.string.isRequired,
  handleSelectTipoPago: PropTypes.func.isRequired,

  refMetodoContado: PropTypes.object.isRequired,

  refNumeroCuotas: PropTypes.object.isRequired,
  numeroCuotas: PropTypes.string.isRequired,
  handleSelectNumeroCuotas: PropTypes.func.isRequired,

  refFrecuenciaPagoCredito: PropTypes.object.isRequired,
  frecuenciaPagoCredito: PropTypes.string.isRequired,
  handleSelectFrecuenciaPagoCredito: PropTypes.func.isRequired,

  refFrecuenciaPago: PropTypes.object.isRequired,
  frecuenciaPago: PropTypes.string.isRequired,
  handleSelectFrecuenciaPago: PropTypes.func.isRequired,

  codiso: PropTypes.string.isRequired,
  importeTotal: PropTypes.number.isRequired,

  bancos: PropTypes.array.isRequired,
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
