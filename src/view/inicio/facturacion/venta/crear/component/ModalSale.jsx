import {
  keyNumberFloat,
  keyNumberInteger,
  spinnerLoading,
  numberFormat,
} from '../../../../../../helper/utils.helper';

const ModalSale = (props) => {
  const { idModalSale } = props;

  const {
    loadingModal,
    codiso,

    selectTipoPago,
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

    metodosPagoLista,
    metodoPagoAgregado,
    handleAddMetodPay,
    handleInputMontoMetodoPay,
    handleRemoveItemMetodPay,
  } = props;

  const generarVuelto = () => {
    const total = parseFloat(importeTotal);

    if (metodoPagoAgregado.length === 0) {
      return <h5>Agrega algún método de pago.</h5>;
    }

    const currentAmount = metodoPagoAgregado.reduce((accumulator, item) => {
      accumulator += item.monto ? parseFloat(item.monto) : 0;
      return accumulator;
    }, 0);

    if (metodoPagoAgregado.length > 1) {
      if (currentAmount >= total) {
        return (
          <>
            <h5>
              RESTANTE: <span>{numberFormat(currentAmount - total)}</span>
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
              POR COBRAR: <span>{numberFormat(total - currentAmount)}</span>
            </h5>
            <h6 className="text-danger">
              Más de dos metodos de pago no generan vuelto.
            </h6>
          </>
        );
      }
    }

    const metodo = metodoPagoAgregado[0];
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
                  className={`btn ${selectTipoPago === 1 ? 'btn-primary' : 'btn-light'
                    } btn-block`}
                  type="button"
                  title="Pago al contado"
                  onClick={() => handleSelectTipoPago(1)}
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
                  className={`btn ${selectTipoPago === 2 ? 'btn-primary' : 'btn-light'
                    } btn-block`}
                  type="button"
                  title="Pago al credito"
                  onClick={() => handleSelectTipoPago(2)}
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
                  className={`btn ${selectTipoPago === 3 ? 'btn-primary' : 'btn-light'
                    } btn-block`}
                  type="button"
                  title="Pago al credito"
                  onClick={() => handleSelectTipoPago(3)}
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
                  className={`btn ${selectTipoPago === 4 ? 'btn-primary' : 'btn-light'
                    } btn-block`}
                  type="button"
                  title="Pago al credito"
                  onClick={() => handleSelectTipoPago(4)}
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
            {selectTipoPago === 1 && (
              <>
                <div className="row">
                  <div className="col">
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
                          {metodosPagoLista.map((item, index) => (
                            <option key={index} value={item.idMetodoPago}>
                              {item.nombre}
                            </option>
                          ))}
                        </select>
                        <div className="input-group-append">
                          <button
                            className="btn btn-outline-success d-flex"
                            title="Agregar Pago"
                            onClick={handleAddMetodPay}
                          >
                            <i className="bi bi-plus-circle-fill"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='row'>
                  <div className='col'>
                    <div className="form-group">
                      {metodoPagoAgregado.map((item, index) => (
                        <MetodoPago
                          key={index}
                          idMetodoPago={item.idMetodoPago}
                          nameMetodPay={item.nombre}
                          monto={item.monto}
                          handleInputMontoMetodoPay={handleInputMontoMetodoPay}
                          handleRemoveItemMetodPay={handleRemoveItemMetodPay}
                        />
                      ))}
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
            {selectTipoPago === 2 && (
              <div className={`row`}>
                <div className="col">

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
            {selectTipoPago === 3 && (
              <div className={`row`}>
                <div className="col">

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
  idMetodoPago,
  nameMetodPay,
  monto,
  handleInputMontoMetodoPay,
  handleRemoveItemMetodPay,
}) => {
  return (
    <div className="input-group mb-2">
      <input
        autoFocus
        type="text"
        className="form-control"
        placeholder="Monto"
        value={monto}
        onChange={(event) => handleInputMontoMetodoPay(event, idMetodoPago)}
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
          onClick={() => handleRemoveItemMetodPay(idMetodoPago)}
        >
          <i className="bi bi-trash3-fill"></i>
        </button>
      </div>
    </div>
  );
};

export default ModalSale;
