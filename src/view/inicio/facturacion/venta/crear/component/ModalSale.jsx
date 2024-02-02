import {
  keyNumberFloat,
  keyNumberInteger,
  spinnerLoading,
  numberFormat,
} from '../../../../../../helper/utils.helper';
import { ADELANTADO, CONTADO, CREDITO_FIJO, CREDITO_VARIABLE } from '../../../../../../model/types/forma-pago';

const ModalSale = (props) => {
  const { idModalSale } = props;

  const {
    loadingModal,
    codiso,

    formaPago,
    handleSelectTipoPago,

    refMetodoContado,

    refNumCutoas,
    numCuota,
    handleSelectNumeroCuotas,

    refFrecuenciaPagoCredito,
    frecuenciaPagoCredito,
    handleSelectFrecuenciaPagoCredito,

    letraMensual,

    refFrecuenciaPago,
    frecuenciaPago,
    handleSelectFrecuenciaPago,

    importeTotal,

    handleSaveSale,

    bancos,
    bancosAgregados,
    handleAgregarBancos,
    handleInputMontoAgregarBancos,
    handleRemoveItemAgregarBanco,
  } = props;

  const generarVuelto = () => {
    const total = parseFloat(importeTotal);

    if (bancosAgregados.length === 0) {
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

  return (
    <div
      className="modal fade"
      id={idModalSale}
      data-bs-keyboard="false"
      data-bs-backdrop="static"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h6 className="modal-title">Completar Venta</h6>
            <button
              type="button"
              className="close"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {loadingModal && spinnerLoading('Cargando datos...')}

            {/* Titutlo del modal */}
            <div className="row">
              <div className="col">
                <div className="text-center">
                  <h5>
                    TOTAL A COBRAR: <span>{numberFormat(importeTotal, codiso)}</span>
                  </h5>
                </div>
              </div>
            </div>

            {/* Sun titulo */}
            <div className="row">
              <div className="col-md-4 col-sm-4">
                <hr />
              </div>
              <div className="col-md-4 col-sm-4 d-flex align-items-center justify-content-center">
                <h6 className="mb-0">Tipos de cobros</h6>
              </div>
              <div className="col-md-4 col-sm-4">
                <hr />
              </div>
            </div>

            {/* Tipos de venta */}
            <div className="row">
              {/* Al contado */}
              <div className="col-md-3 col-sm-3">
                <button
                  className={`btn ${formaPago === CONTADO ? 'btn-primary' : 'btn-light'
                    } btn-block`}
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
              </div>

              {/* Crédito fijo*/}
              <div className="col-md-3 col-sm-3">
                <button
                  className={`btn ${formaPago === CREDITO_FIJO ? 'btn-primary' : 'btn-light'
                    } btn-block`}
                  type="button"
                  title="Pago al credito"
                  onClick={() => handleSelectTipoPago(CREDITO_FIJO)}
                >
                  <div className="row">
                    <div className="col-md-12">
                      <i className="bi bi-boxes fa-2x"></i>
                    </div>
                  </div>
                  <div className="text-center">
                    <label>Crédito fijo</label>
                  </div>
                </button>
              </div>

              {/* Crédito variable */}
              <div className="col-md-3 col-sm-3">
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
              </div>

              {/* Pago adelantado */}
              <div className="col-md-3 col-sm-3">
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
              </div>
            </div>

            <br />
            {/* contado detalle */}
            {formaPago === CONTADO && (
              <>
                <h6>Lista de métodos:</h6>

                <div className='row'>
                  <div className='col'>
                    <div className="form-group">
                      {bancosAgregados.map((item, index) => (
                        <MetodoPago
                          key={index}
                          idBanco={item.idBanco}
                          nameMetodPay={item.nombre}
                          monto={item.monto}
                          handleInputMontoAgregarBancos={handleInputMontoAgregarBancos}
                          handleRemoveItemAgregarBanco={handleRemoveItemAgregarBanco}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <br />

                <div className="row">
                  <div className="col">
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
                            className="btn btn-outline-success d-flex"
                            title="Agregar Pago"
                            onClick={handleAgregarBancos}
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
                    <br />
                  </div>
                </div>

                <div className='row'>
                  <div className="col-12">
                    <div className="text-center">{generarVuelto()}</div>
                  </div>
                </div>
              </>
            )}

            {/* crédito fijo */}
            {formaPago === CREDITO_FIJO && (
              <div className={`row`}>
                <div className="col">

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
                        ref={refNumCutoas}
                        value={numCuota}
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
                        value={numberFormat(letraMensual, codiso)}
                        disabled={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* crédito variable */}
            {formaPago === CREDITO_VARIABLE && (
              <div className="row">
                <div className="col">

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
                </div>
              </div>
            )}

            {/* pago adelantado */}
            {formaPago === ADELANTADO && (
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
            )}
          </div>

          {/* Procesar y cerrar venta */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveSale}
            >
              Completar venta
            </button>
            <button
              type="button"
              className="btn btn-danger"
              data-bs-dismiss="modal"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetodoPago = ({
  idBanco,
  nameMetodPay,
  monto,
  handleInputMontoAgregarBancos,
  handleRemoveItemAgregarBanco,
}) => {
  return (
    <div className="input-group mb-2">
      <input
        autoFocus
        type="text"
        className="form-control"
        placeholder="Monto"
        value={monto}
        onChange={(event) => handleInputMontoAgregarBancos(event, idBanco)}
        onKeyDown={keyNumberFloat}
      />
      <div className="input-group-prepend">
        <div className="input-group-text">
          <span>{nameMetodPay}</span>
        </div>
      </div>
      <div className="input-group-append">
        <button
          className="btn btn-outline-danger d-flex"
          title="Agregar Pago"
          onClick={() => handleRemoveItemAgregarBanco(idBanco)}
        >
          <i className="bi bi-trash3-fill"></i>
        </button>
      </div>
    </div>
  );
};

export default ModalSale;
