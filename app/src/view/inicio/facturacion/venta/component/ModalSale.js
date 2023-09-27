import { alertDialog, alertSuccess, alertWarning, formatMoney, keyNumberFloat, keyNumberInteger, monthName, spinnerLoading } from "../../../../../helper/utils.helper";
import ErrorResponse from "../../../../../model/class/error";
import SuccessReponse from "../../../../../model/class/response";
import { createFactura } from "../../../../../network/rest/principal.network";

const ModalSale = (props) => {

    const {
        informacion,

        loadModal,
        selectTipoPago,
        handleSelectTipoPago,


        comprobantesCobro,
        bancos,
        mmonth,
        year,

        refComprobanteContado,
        idComprobanteContado,
        handleSelectComprobanteContado,

        refBancoContado,
        idBancoContado,
        handleSelectBancoContado,

        refMetodoContado,
        metodoPagoContado,
        handleSelectMetodoPagoContado,

        refMontoInicial,
        inicial,
        handleTextMontoInicial,

        montoInicialCheck,
        handleCheckMontoInicial,

        refComprobanteCredito,
        idComprobanteCredito,
        handleSelectComprobanteCredito,

        refBancoCredito,
        idBancoCredito,
        handleSelectBancoCredito,

        refMetodoCredito,
        metodoPagoCredito,
        handleSelectMetodoPagoCredito,

        refNumCutoas,
        numCuota,
        handleSelectNumeroCuotas,

        monthPago,
        handleSelectMonthPago,

        yearPago,
        handleSelectYearPago,

        refFrecuenciaPagoCredito,
        frecuenciaPagoCredito,
        handleSelectFrecuenciaPagoCredito,

        letraMensual,

        refInicialCreditoVariable,
        inicialCreditoVariable,
        handleTextInicialCreditoVariable,

        inicialCreditoVariableCheck,
        handleCheckInicialCreditoVarible,

        refComprobanteCreditoVariable,
        idComprobanteCreditoVariable,
        handleSelectComprobanteCreditoVarible,

        refBancoCreditoVariable,
        idBancoCreditoVariable,
        handleSelectBancoCreditoVariable,

        refMetodoCreditoVariable,
        metodoPagoCreditoVariable,
        handleSelectMetodoPagoCreditoVariable,

        refFrecuenciaPago,
        frecuenciaPago,
        handleSelectFrecuenciaPago,

        importeTotal,
    } = props;

    const handleSaveProcess = () => {
        if (idBancoContado === "") {
            alertWarning("Venta", "Seleccione un cuenta bancaria", () => {
                refBancoContado.current.focus();
            });
            return;
        }

        alertDialog("Venta", "¿Estás seguro de continuar?", async (value) => {
            if (value) {

                let numCuota = 0;
                switch (selectTipoPago) {
                    case 2:
                        numCuota = parseInt(this.state.numCuota);
                        break;
                    default: numCuota = 0;
                }

                let frecuencia = 0;
                // switch(selectTipoPago){

                // }

                const data = {
                    idComprobante: informacion.idComprobante,
                    idCliente: informacion.idCliente,
                    idUsuario: informacion.idUsuario,
                    idProyecto: informacion.idProyecto,
                    idMoneda: informacion.idMoneda,
                    tipo: selectTipoPago === 1 ? 1 : 2,
                    selectTipoPago: selectTipoPago,
                    numCuota: numCuota,
                    estado: selectTipoPago === 1 ? 1 : 2,
                    frecuenciaPago: frecuencia,

                    idComprobanteContado: idComprobanteContado,
                    idBancoContado: idBancoContado,
                    metodoPagoContado: metodoPagoContado,

                    detalleVenta: informacion.detalleVenta
                }

                const response = await createFactura(data);

                if (response instanceof SuccessReponse) {
                    console.log(response.data)
                    alertSuccess("Venta", response.data,()=>{

                    });
                }

                if (response instanceof ErrorResponse) {
                    console.log(response.getMessage())
                    alertWarning("Venta", response.getMessage(),()=>{
                        
                    });
                }
            }
        });
    }

    return (
        <div className="modal fade" id="modalVentaProceso" data-bs-keyboard="false" data-bs-backdrop="static">
            <div className="modal-dialog modal-md modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h6 className="modal-title">Completar Venta</h6>
                        <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">

                        {loadModal ?
                            <div className="clearfix absolute-all bg-white">
                                {spinnerLoading("Cargando datos...")}
                            </div>
                            : null
                        }

                        <div className="row">
                            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                                <div className="text-center">
                                    <h5>TOTAL A PAGAR: <span>{formatMoney(importeTotal)}</span></h5>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-4 col-sm-4">
                                <hr />
                            </div>
                            <div className="col-md-4 col-sm-4 d-flex align-items-center justify-content-center">
                                <h6 className="mb-0">Tipos de pagos</h6>
                            </div>
                            <div className="col-md-4 col-sm-4">
                                <hr />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-4 col-sm-4">
                                <button className={`btn ${selectTipoPago === 1 ? "btn-primary" : "btn-light"} btn-block`}
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

                            <div className="col-md-4 col-sm-4">
                                <button className={`btn ${selectTipoPago === 2 ? "btn-primary" : "btn-light"} btn-block`}
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

                            <div className="col-md-4 col-sm-4">
                                <button className={`btn ${selectTipoPago === 3 ? "btn-primary" : "btn-light"} btn-block`}
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

                        </div>

                        <br />
                        {/* contado detalle */}
                        {
                            selectTipoPago === 1 ?
                                <div className="row">
                                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                                        <div className="form-row">
                                            <div className="form-group col-md-12">
                                                <div className="input-group">
                                                    <div className="input-group-prepend">
                                                        <div className="input-group-text"><i className="bi bi-receipt"></i></div>
                                                    </div>
                                                    <select
                                                        title="Lista de caja o banco a depositar"
                                                        className="form-control"
                                                        ref={refComprobanteContado}
                                                        value={idComprobanteContado}
                                                        onChange={handleSelectComprobanteContado}
                                                    >
                                                        <option value="">-- Comprobante --</option>
                                                        {
                                                            comprobantesCobro.map((item, index) => (
                                                                <option key={index} value={item.idComprobante}>{item.nombre + " (" + item.serie + ")"}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group col-md-12">
                                                <div className="input-group">
                                                    <div className="input-group-prepend">
                                                        <div className="input-group-text"><i className="bi bi-bank"></i></div>
                                                    </div>
                                                    <select
                                                        title="Lista de caja o banco a depositar"
                                                        className="form-control"
                                                        ref={refBancoContado}
                                                        value={idBancoContado}
                                                        onChange={handleSelectBancoContado}
                                                    >
                                                        <option value="">-- Cuenta bancaria --</option>
                                                        {
                                                            bancos.map((item, index) => (
                                                                <option key={index} value={item.idBanco}>{item.nombre}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group col-md-12">
                                                <div className="input-group">
                                                    <div className="input-group-prepend">
                                                        <div className="input-group-text"><i className="bi bi-credit-card-2-back"></i></div>
                                                    </div>
                                                    <select
                                                        title="Lista metodo de pago"
                                                        className="form-control"
                                                        ref={refMetodoContado}
                                                        value={metodoPagoContado}
                                                        onChange={handleSelectMetodoPagoContado}
                                                    >
                                                        <option value="">-- Metodo de pago --</option>
                                                        <option value="1">Efectivo</option>
                                                        <option value="2">Consignación</option>
                                                        <option value="3">Transferencia</option>
                                                        <option value="4">Cheque</option>
                                                        <option value="5">Tarjeta crédito</option>
                                                        <option value="6">Tarjeta débito</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                : null
                        }

                        {/* crédito fijo */}
                        {
                            selectTipoPago === 2 ?
                                <div className={`row`}>
                                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">

                                        <div className="form-group">
                                            <div className="input-group">
                                                <div className="input-group-prepend">
                                                    <div className="input-group-text">
                                                        <i className="bi bi-tag-fill"></i>
                                                    </div>
                                                </div>
                                                <input
                                                    title="Monto inicial"
                                                    type="text"
                                                    className="form-control"
                                                    disabled={!montoInicialCheck}
                                                    placeholder='Monto inicial'
                                                    ref={refMontoInicial}
                                                    value={inicial}
                                                    onChange={handleTextMontoInicial}
                                                    onKeyDown={keyNumberFloat}
                                                />
                                                <div className="input-group-append">
                                                    <div className="input-group-text">
                                                        <div className="form-check form-check-inline m-0">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                checked={montoInicialCheck}
                                                                onChange={handleCheckMontoInicial}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {
                                            montoInicialCheck ?
                                                <div className="form-row">
                                                    <div className="form-group col-md-12">
                                                        <div className="input-group">
                                                            <div className="input-group-prepend">
                                                                <div className="input-group-text">
                                                                    <i className="bi bi-receipt"></i>
                                                                </div>
                                                            </div>
                                                            <select
                                                                title="Lista de caja o banco a depositar"
                                                                className="form-control"
                                                                ref={refComprobanteCredito}
                                                                value={idComprobanteCredito}
                                                                onChange={handleSelectComprobanteCredito}
                                                            >
                                                                <option value="">-- Comprobante --</option>
                                                                {
                                                                    comprobantesCobro.map((item, index) => (
                                                                        <option key={index} value={item.idComprobante}>{item.nombre}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                                : null
                                        }

                                        {
                                            montoInicialCheck ?
                                                <div className="form-group">
                                                    <div className="input-group">
                                                        <div className="input-group-prepend">
                                                            <div className="input-group-text"><i className="bi bi-bank"></i></div>
                                                        </div>
                                                        <select
                                                            title="Lista de caja o banco a depositar"
                                                            className="form-control"
                                                            ref={refBancoCredito}
                                                            value={idBancoCredito}
                                                            onChange={handleSelectBancoCredito}
                                                        >
                                                            <option value="">-- Cuenta bancaria --</option>
                                                            {
                                                                bancos.map((item, index) => (
                                                                    <option key={index} value={item.idBanco}>{item.nombre}</option>
                                                                ))
                                                            }
                                                        </select>
                                                    </div>
                                                </div>
                                                : null
                                        }

                                        {
                                            montoInicialCheck ?
                                                <div className="form-group">
                                                    <div className="input-group">
                                                        <div className="input-group-prepend">
                                                            <div className="input-group-text"><i className="bi bi-credit-card-2-back"></i></div>
                                                        </div>
                                                        <select
                                                            title="Lista metodo de pago"
                                                            className="form-control"
                                                            ref={refMetodoCredito}
                                                            value={metodoPagoCredito}
                                                            onChange={handleSelectMetodoPagoCredito}
                                                        >
                                                            <option value="">-- Metodo de pago --</option>
                                                            <option value="1">Efectivo</option>
                                                            <option value="2">Consignación</option>
                                                            <option value="3">Transferencia</option>
                                                            <option value="4">Cheque</option>
                                                            <option value="5">Tarjeta crédito</option>
                                                            <option value="6">Tarjeta débito</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                : null
                                        }

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
                                                    placeholder='Número de cuotas'
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
                                                        <i className="bi bi-calendar"></i>
                                                    </div>
                                                </div>

                                                <select
                                                    title="Mes"
                                                    className="form-control"
                                                    value={monthPago}
                                                    onChange={handleSelectMonthPago}
                                                >
                                                    {
                                                        mmonth.map((item, index) => (
                                                            <option key={index} value={item}>{monthName(item)}</option>
                                                        ))
                                                    }
                                                </select>
                                                <select
                                                    title="Año"
                                                    className="form-control"
                                                    value={yearPago}
                                                    onChange={handleSelectYearPago}
                                                >
                                                    {
                                                        year.map((item, index) => (
                                                            <option key={index} value={item}>{item}</option>
                                                        ))
                                                    }
                                                </select>
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
                                                    placeholder='0.00'
                                                    value={letraMensual}
                                                    disabled={true} />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                                : null
                        }

                        {/* crédito variable */}
                        {
                            selectTipoPago === 3 ?
                                <div className={`row`}>
                                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">

                                        <div className="form-group">
                                            <div className="input-group">
                                                <div className="input-group-prepend">
                                                    <div className="input-group-text"><i className="bi bi-tag-fill"></i></div>
                                                </div>
                                                <input
                                                    title="Monto inicial"
                                                    type="text"
                                                    className="form-control"
                                                    ref={refInicialCreditoVariable}
                                                    disabled={!inicialCreditoVariableCheck}
                                                    placeholder='Monto inicial'
                                                    value={inicialCreditoVariable}
                                                    onChange={handleTextInicialCreditoVariable}
                                                    onKeyDown={keyNumberFloat}
                                                />
                                                <div className="input-group-append">
                                                    <div className="input-group-text">
                                                        <div className="form-check form-check-inline m-0">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                checked={inicialCreditoVariableCheck}
                                                                onChange={handleCheckInicialCreditoVarible}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {
                                            inicialCreditoVariableCheck ?
                                                <>
                                                    <div className="form-row">
                                                        <div className="form-group col-md-12">
                                                            <div className="input-group">
                                                                <div className="input-group-prepend">
                                                                    <div className="input-group-text"><i className="bi bi-receipt"></i></div>
                                                                </div>
                                                                <select
                                                                    title="Lista de caja o banco a depositar"
                                                                    className="form-control"
                                                                    ref={refComprobanteCreditoVariable}
                                                                    value={idComprobanteCreditoVariable}
                                                                    onChange={handleSelectComprobanteCreditoVarible}
                                                                >
                                                                    <option value="">-- Comprobante --</option>
                                                                    {
                                                                        comprobantesCobro.map((item, index) => (
                                                                            <option key={index} value={item.idComprobante}>{item.nombre}</option>
                                                                        ))
                                                                    }
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="form-group">
                                                        <div className="input-group">
                                                            <div className="input-group-prepend">
                                                                <div className="input-group-text"><i className="bi bi-bank"></i></div>
                                                            </div>
                                                            <select
                                                                title="Lista de caja o banco a depositar"
                                                                className="form-control"
                                                                ref={refBancoCreditoVariable}
                                                                value={idBancoCreditoVariable}
                                                                onChange={handleSelectBancoCreditoVariable}
                                                            >
                                                                <option value="">-- Cuenta bancaria --</option>
                                                                {
                                                                    bancos.map((item, index) => (
                                                                        <option key={index} value={item.idBanco}>{item.nombre}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="form-group">
                                                        <div className="input-group">
                                                            <div className="input-group-prepend">
                                                                <div className="input-group-text"><i className="bi bi-credit-card-2-back"></i></div>
                                                            </div>
                                                            <select
                                                                title="Lista metodo de pago"
                                                                className="form-control"
                                                                ref={refMetodoCreditoVariable}
                                                                value={metodoPagoCreditoVariable}
                                                                onChange={handleSelectMetodoPagoCreditoVariable}
                                                            >
                                                                <option value="">-- Metodo de pago --</option>
                                                                <option value="1">Efectivo</option>
                                                                <option value="2">Consignación</option>
                                                                <option value="3">Transferencia</option>
                                                                <option value="4">Cheque</option>
                                                                <option value="5">Tarjeta crédito</option>
                                                                <option value="6">Tarjeta débito</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </>

                                                : null
                                        }

                                        <div className="form-group">
                                            <div className="input-group">
                                                <div className="input-group-prepend">
                                                    <div className="input-group-text"><i className="bi bi-credit-card-2-back"></i></div>
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

                                        <div className="form-group">
                                            <div className="input-group">
                                                <div className="input-group-prepend">
                                                    <div className="input-group-text"><i className="bi bi-piggy-bank-fill"></i></div>
                                                </div>
                                                <input
                                                    title="Deuda restante"
                                                    type="text"
                                                    className="form-control"
                                                    placeholder='0.00'
                                                    value={formatMoney(importeTotal - inicialCreditoVariable)}
                                                    disabled={true} />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                                : null
                        }

                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={handleSaveProcess}>Completar venta</button>
                        <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModalSale;