import {
  rounded,
  keyNumberFloat,
  keyNumberInteger,
  spinnerLoading,
  numberFormat,
  isNumeric,
} from '../../../../../helper/utils.helper';

const ModalSale = (props) => {
  const { idModal } = props;

  const {
    loading,
    selectTipoPago,
    handleSelectTipoPago,

    refMetodoPagoContenedor,
    refMetodoContado,

    tipoCredito,
    handleCheckTipoCredito,

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
              RESTANTE: <span>{rounded(currentAmount - total)}</span>
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
              POR COBRAR: <span>{rounded(total - currentAmount)}</span>
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
            SU CAMBIO ES: <span>{rounded(currentAmount - total)}</span>
          </h5>
        );
      } else {
        return (
          <h5 className="text-danger">
            POR COBRAR: <span>{rounded(total - currentAmount)}</span>
          </h5>
        );
      }
    } else {
      if (currentAmount >= total) {
        return (
          <>
            <h5>
              RESTANTE: <span>{rounded(currentAmount - total)}</span>
            </h5>
            <h6 className="text-danger">El método de pago no genera vuelto.</h6>
          </>
        );
      } else {
        return (
          <>
            <h5>
              POR COBRAR: <span>{rounded(total - currentAmount)}</span>
            </h5>
            <h6 className="text-danger">El método de pago no genera vuelto.</h6>
          </>
        );
      }
    }
  };

  const letraMensual = () => {
    const total = parseFloat(importeTotal);

    if (tipoCredito === '2') {
      if (!isNumeric(numeroCuotas) || numeroCuotas <= 0) return 0;

      return total / numeroCuotas;
    }

    return 0;
  };

  return (
    <div
      className="modal fade"
      id={idModal}
      data-bs-keyboard="false"
      data-bs-backdrop="static"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h6 className="modal-title">Completar Gasto</h6>
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
            {loading && spinnerLoading('Cargando datos...')}

            {/* Titutlo del modal */}
            <div className="row">
              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                <div className="text-center">
                  <h5>
                    TOTAL A COBRAR:{' '}
                    <span>{numberFormat(importeTotal, codISO)}</span>
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
              <div className="col">
                <button
                  className={`btn ${
                    selectTipoPago === 1 ? 'btn-primary' : 'btn-light'
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
              <div className="col">
                <button
                  className={`btn ${
                    selectTipoPago === 2 ? 'btn-primary' : 'btn-light'
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
                    <label>Crédito</label>
                  </div>
                </button>
              </div>
            </div>

            <br />
            {/* contado detalle */}
            {selectTipoPago === 1 && (
              <div className="row">
                <div className="col" ref={refMetodoPagoContenedor}>
                  <div className="form-row">
                    <div className="form-group col-md-12">
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

                  {metodoPagoAgregado.map((item, index) => (
                    <MetodoPago
                      key={index}
                      idMetodoPago={item.idMetodoPago}
                      nameMetodPay={item.nombre}
                      monto={item.monto}
                      handleInputMontoMetodoPay={handleInputMontoMetodoPay}
                      handleRemoveItemMetodPay={handleRemoveItemMetodPay}
                      handleSaveSale={handleSaveSale}
                    />
                  ))}
                </div>

                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                  <br />
                </div>

                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                  <div className="text-center">{generarVuelto()}</div>
                </div>
              </div>
            )}

            {/* crédito fijo */}
            {selectTipoPago === 2 && (
              <>
                <div className="row">
                  <div className="col d-flex align-items-center">
                    <div className="form-group">
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          // ref={this.refIdTipoAjuste}
                          name="tipoCredito"
                          id="1"
                          value="1"
                          checked={tipoCredito === '1'}
                          onChange={handleCheckTipoCredito}
                        />
                        <label className="form-check-label" htmlFor="1">
                          <i className="bi bi-bag-check-fill "></i> Fijo
                        </label>
                      </div>

                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="tipoCredito"
                          id="2"
                          value="2"
                          checked={tipoCredito === '2'}
                          onChange={handleCheckTipoCredito}
                        />
                        <label className="form-check-label" htmlFor="2">
                          <i className="bi bi-bag-check-fill "></i> Variable
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {tipoCredito === '1' && (
                  <>
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
                      </div>
                    </div>

                    <div className="row">
                      <div className="col">
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
                      </div>
                    </div>
                  </>
                )}

                {tipoCredito === '2' && (
                  <>
                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <span className="text-md">
                            <i className="bi bi-info-circle text-success text-lg"></i>{' '}
                            Los pagos se efectúan en función del número de
                            cuotas, con una alerta que indica la frecuencia de
                            los pagos.
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="row">
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
                              ref={refNumeroCuotas}
                              value={numeroCuotas}
                              onChange={handleSelectNumeroCuotas}
                              onKeyDown={keyNumberInteger}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col">
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
                      </div>
                    </div>

                    <div className="row">
                      <div className="col">
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
                      </div>
                    </div>
                  </>
                )}
              </>
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
  handleSaveSale,
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
        // onKeyUp={(event) => {

        //     if (event.key === 'Enter') {
        //         handleSaveSale();
        //     }
        //     event.preventDefault();
        // }}
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
          onClick={(event) => {
            handleRemoveItemMetodPay(idMetodoPago);
          }}
        >
          <i className="bi bi-trash3-fill"></i>
        </button>
      </div>
    </div>
  );
};

export default ModalSale;
