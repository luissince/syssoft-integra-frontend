import Column from '../../../../../../components/Column';
import { CustomModalForm } from '../../../../../../components/CustomModal';
import Row from '../../../../../../components/Row';
import { SpinnerView } from '../../../../../../components/Spinner';
import {
  keyNumberInteger,
  numberFormat,
  isNumeric,
  isEmpty,
} from '../../../../../../helper/utils.helper';
import { CONTADO, CREDITO_FIJO, CREDITO_VARIABLE } from '../../../../../../model/types/forma-cobro';
import PropTypes from 'prop-types';

const ModalSale = (props) => {

  const {
    refSale,
    isOpen,
    onOpen,
    onHidden,
    onClose,

    loading,
    selectTipoCobro,
    handleSelectTipoCobro,

    refMetodoPagoContenedor,
    refMetodoContado,

    refFrecuenciaPagoFijo,
    frecuenciaPagoFijo,
    handleSelectFrecuenciaPagoFijo,

    refNumeroCuotas,
    numeroCuotas,
    handleSelectNumeroCuotas,

    refFrecuenciaPagoVariable,
    frecuenciaPagoVariable,
    handleSelectFrecuenciaPagoVariable,

    codISO,
    importeTotal,

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

    if (bancosAgregados.lenght > 1) {
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

  const letraMensual = () => {
    const total = parseFloat(importeTotal);
    if (!isNumeric(numeroCuotas) || numeroCuotas <= 0) return 0;
    return total / numeroCuotas;
  }

  return (
    <CustomModalForm
      contentRef={(ref) => refSale.current = ref}
      isOpen={isOpen}
      onOpen={onOpen}
      onHidden={onHidden}
      onClose={onClose}
      contentLabel="Modal de Compra"
      titleHeader="Completar Compra"
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
                  TOTAL A PAGAR: <span>{numberFormat(importeTotal, codISO)}</span>
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
            <Column>
              <div className="form-group">
                <button
                  className={`btn ${selectTipoCobro === CONTADO ? 'btn-primary' : 'btn-light'} btn-block`}
                  type="button"
                  title="Pago al contado"
                  onClick={() => handleSelectTipoCobro(CONTADO)}
                >
                  <Row>
                    <Column className="col-md-12">
                      <i className="bi bi-cash-coin fa-2x"></i>
                    </Column>
                  </Row>
                  <div className="text-center">
                    <label>Contado</label>
                  </div>
                </button>
              </div>
            </Column>

            {/* Crédito fijo*/}
            {/* <div className="col">
              <button
                className={`btn ${selectTipoCobro === CREDITO_FIJO ? 'btn-primary' : 'btn-light'} btn-block`}
                type="button"
                title="Pago al credito"
                onClick={() => handleSelectTipoCobro(CREDITO_FIJO)}
              >
                <div className="row">
                  <div className="col-md-12">
                    <i className="bi bi-boxes fa-2x"></i>
                  </div>
                </div>
                <div className="text-center">
                  <label>Crédito Fijo</label>
                </div>
              </button>
            </div> */}


            {/* Crédito variable*/}
            {/* <div className="col">
              <button
                className={`btn ${selectTipoCobro === CREDITO_VARIABLE ? 'btn-primary' : 'btn-light'} btn-block`}
                type="button"
                title="Pago al credito"
                onClick={() => handleSelectTipoCobro(CREDITO_VARIABLE)}
              >
                <div className="row">
                  <div className="col-md-12">
                    <i className="bi bi-boxes fa-2x"></i>
                  </div>
                </div>
                <div className="text-center">
                  <label>Crédito Variable</label>
                </div>
              </button>
            </div> */}
          </Row>

          {/* contado detalle */}
          {selectTipoCobro === CONTADO && (
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

              <Column className="col-12">
                <div className="form-group">
                  <label>Agregar metodo de pago:</label>
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

              <Column className="col-12">
                <div className="text-center">{generarVuelto()}</div>
              </Column>
            </Row>
          )}

          {/* crédito fijo */}
          {selectTipoCobro === CREDITO_FIJO && (
            <>
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
                </Column>
              </Row>

              <Row>
                <Column>
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
                </Column>
              </Row>

              <Row>
                <Column>
                  <div className="form-group">
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <div className="input-group-text">
                          <i className="bi bi-calendar"></i>
                        </div>
                      </div>
                      <select
                        title="Lista frecuencia de pago"
                        className="form-control"
                        ref={refFrecuenciaPagoVariable}
                        value={frecuenciaPagoVariable}
                        onChange={handleSelectFrecuenciaPagoVariable}
                      >
                        <option value="">-- Frecuencia de pago --</option>
                        <option value="15">Quinsenal</option>
                        <option value="30">Mensual</option>
                      </select>
                    </div>
                  </div>
                </Column>
              </Row>

              <Row>
                <Column>
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
            </>
          )}

          {/* crédito variable */}
          {selectTipoCobro === CREDITO_VARIABLE && (
            <>
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
                </Column>
              </Row>

              <Row>
                <Column>
                  <div className="form-group">
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <div className="input-group-text">
                          <i className="bi bi-calendar"></i>
                        </div>
                      </div>
                      <select
                        title="Lista frecuencia de pago"
                        className="form-control"
                        ref={refFrecuenciaPagoFijo}
                        value={frecuenciaPagoFijo}
                        onChange={handleSelectFrecuenciaPagoFijo}
                      >
                        <option value="">-- Frecuencia de pago --</option>
                        <option value="15">Quinsenal</option>
                        <option value="30">Mensual</option>
                      </select>
                    </div>
                  </div>
                </Column>
              </Row>
            </>
          )}
        </>
      }
      footer={
        <>
          <button
            type="submit"
            className="btn btn-primary"
          >
            Completar compra
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
        role='float'
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
  refSale: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
  onHidden: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,

  loading: PropTypes.bool.isRequired,
  selectTipoCobro: PropTypes.string.isRequired,
  handleSelectTipoCobro: PropTypes.func.isRequired,

  refMetodoPagoContenedor: PropTypes.object.isRequired,
  refMetodoContado: PropTypes.object.isRequired,

  refFrecuenciaPagoFijo: PropTypes.object.isRequired,
  frecuenciaPagoFijo: PropTypes.string.isRequired,
  handleSelectFrecuenciaPagoFijo: PropTypes.func.isRequired,

  refNumeroCuotas: PropTypes.object.isRequired,
  numeroCuotas: PropTypes.string.isRequired,
  handleSelectNumeroCuotas: PropTypes.func.isRequired,

  refFrecuenciaPagoVariable: PropTypes.object.isRequired,
  frecuenciaPagoVariable: PropTypes.string.isRequired,
  handleSelectFrecuenciaPagoVariable: PropTypes.func.isRequired,

  codISO: PropTypes.string.isRequired,
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
