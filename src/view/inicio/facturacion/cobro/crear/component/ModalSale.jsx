import {
  rounded,
  keyNumberFloat,
  spinnerLoading,
  numberFormat,
} from '../../../../../../helper/utils.helper';

const ModalSale = (props) => {
  const { idModalSale } = props;

  const {
    loadingModal,

    refMetodoContado,

    importeTotal,

    handleSaveSale,

    bancos,
    codISO,
    bancosAgregados,
    handleAddBancosAgregados,
    handleInputMontoBancosAgregados,
    handleRemoveItemBancosAgregados,
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
    <div
      className="modal fade"
      id={idModalSale}
      data-bs-keyboard="false"
      data-bs-backdrop="static"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h6 className="modal-title">Completar Cobro</h6>
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
                    TOTAL A COBRAR: <span>{rounded(importeTotal)}</span>
                  </h5>
                </div>
              </div>
            </div>

            {/* Sub titulo */}
            <div className="row">
              <div className="col-md-4 col-sm-4">
                <hr />
              </div>
              <div className="col-md-4 col-sm-4 d-flex align-items-center justify-content-center">
                <h6 className="mb-0">-*-</h6>
              </div>
              <div className="col-md-4 col-sm-4">
                <hr />
              </div>
            </div>

            <h5>Lista de métodos:</h5>

            {bancosAgregados.map((item, index) => (
              <MetodoPago
                key={index}
                idMetodoPago={item.idMetodoPago}
                nameMetodPay={item.nombre}
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
                        <option key={index} value={item.idMetodoPago}>
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
        onChange={(event) => handleInputMontoBancosAgregados(event, idMetodoPago)}
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
          onClick={() => handleRemoveItemBancosAgregados(idMetodoPago)}
        >
          <i className="bi bi-trash3-fill"></i>
        </button>
      </div>
    </div>
  );
};

export default ModalSale;
