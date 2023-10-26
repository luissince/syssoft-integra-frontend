import React from 'react';
import {
    alertWarning,
    clearModal,
    getCurrentMonth,
    getCurrentYear,
    showModal,
    spinnerLoading,
    viewModal,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { PosContainerWrapper } from '../../../../components/Container';
import InvoiceTicket from './component/InvoiceTicket';
import { getPredeterminado, listBancoCombo, listComprobanteCombo, listImpuestCombo, listMonedaCombo, listarClientesFilter } from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';
import InvoiceDetail from './component/InvoiceDetail';
import InvoiceClient from './component/InvoiceClient';
import InvoiceVoucher from './component/InvoiceVoucher';
import InvoiceFooter from './component/InvoiceFooter';
import ModalConfiguration from './component/ModalConfiguration';
import InvoiceView from './component/InvoiceView';
import ModalSale from './component/ModalSale';
import CustomComponent from '../../../../model/class/custom-component';

class VentaProceso extends CustomComponent {

    /**
     * 
     * Constructor
     */

    constructor(props) {
        super(props);
        this.state = {
            idComprobante: '',
            comprobantes: [],

            idUsuario: this.props.token.userToken.idUsuario,

            idMoneda: '',
            monedas: [],
            codiso: "PEN",

            producto: '',
            productos: [],
            sarchProducto: false,
            filterProducto: false,

            idCliente: '',
            clientes: [],
            cliente: '',
            filterCliente: false,

            idImpuesto: '',
            impuestos: [],

            detalleVenta: [],

            idSucursal: this.props.token.project.idSucursal,

            loading: true,
            msgLoading: 'Cargando datos...',

            // Variables del modal de venta
            loadModal: false,
            selectTipoPago: 1,

            idComprobanteContado: '',
            comprobantesCobro: [],

            metodoPagoContado: '',

            idBancoContado: '',
            bancos: [],

            montoInicialCheck: false,
            inicial: '',
            idComprobanteCredito: '',

            idBancoCredito: '',
            metodoPagoCredito: '',

            monthPago: getCurrentMonth(),
            yearPago: getCurrentYear(),

            numCuota: '',
            letraMensual: '',

            frecuenciaPagoCredito: new Date().getDate() > 15 ? '30' : '15',

            inicialCreditoVariableCheck: false,
            inicialCreditoVariable: '',

            frecuenciaPago: new Date().getDate() > 15 ? '30' : '15',
            idComprobanteCreditoVariable: '',

            idBancoCreditoVariable: '',
            metodoPagoCreditoVariable: '',

            mmonth: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            year: [2015, 2016, 2017, 2018, 2019, 2020, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030],

            importeTotal: 0.0
        }

        this.refProducto = React.createRef();

        this.refComprobante = React.createRef();
        this.refImpuesto = React.createRef();

        this.refCliente = React.createRef();
        this.refMoneda = React.createRef();

        this.refComprobanteContado = React.createRef();

        this.refBancoContado = React.createRef();
        this.refMetodoContado = React.createRef();

        this.refMontoInicial = React.createRef();
        this.refComprobanteCredito = React.createRef();

        this.refBancoCredito = React.createRef();
        this.refMetodoCredito = React.createRef();

        this.refInicialCreditoVariable = React.createRef();

        this.refFrecuenciaPago = React.createRef();
        this.refNumCutoas = React.createRef();

        this.refComprobanteCreditoVariable = React.createRef();
        this.refMetodoCreditoVariable = React.createRef();

        this.abortControllerView = new AbortController();
    }


    /**
     * Método de cliclo de vida
     */

    componentDidMount() {
        this.loadingData();

        viewModal("modalVentaProceso", () => {
            this.refBancoContado.current.focus();
            const importeTotal = this.state.detalleVenta.reduce((accumulator, item) => {
                const totalProductPrice = item.precio * item.cantidad;
                return accumulator + totalProductPrice;
            }, 0);

            this.setState({ importeTotal, loadModal: false })
        });

        clearModal("modalVentaProceso", async () => {
            await this.setStateAsync({
                selectTipoPago: 1,
                idBancoContado: '',
                metodoPagoContado: '',
                montoInicialCheck: false,
                inicial: '',
                idBancoCredito: '',
                metodoPagoCredito: '',
                letraMensual: '',
                frecuenciaPagoCredito: new Date().getDate() > 15 ? '30' : '15',
                numCuota: '',

                idComprobanteCredito: '',
                inicialCreditoVariableCheck: false,
                inicialCreditoVariable: '',
                idComprobanteCreditoVariable: '',
                idBancoCreditoVariable: '',
                metodoPagoCreditoVariable: '',
                frecuenciaPago: new Date().getDate() > 15 ? '30' : '15',
            });
        })
    }

    componentWillUnmount() {
        this.abortControllerView.abort();
    }

    /**
     * 
     * Métodos de acción
     */

    loadingData = async () => {
        const [libre, facturado, cobro, monedas, impuestos, bancos, predeterminado] = await Promise.all([
            await this.fetchComprobante("2"),
            await this.fetchComprobante("1"),
            await this.fetchComprobante("5"),
            await this.fetchMoneda(),
            await this.fetchImpuesto(),
            await this.fetchBanco(),
            await this.fetchClientePredeterminado()
        ]);

        const comprobantes = [...facturado, ...libre];
        const monedaFilter = monedas.find((item) => item.predeterminado === 1);
        const impuestoFilter = impuestos.find((item) => item.preferida === 1);
        const comprobanteFilter = comprobantes.find((item) => item.preferida === 1);
        const comprobanteCobroFilter = cobro.find((item) => item.preferida === 1);

        if (typeof predeterminado === 'object') {
            this.handleSelectItemClient(predeterminado);
        }

        await this.setStateAsync({
            comprobantes,
            comprobantesCobro: cobro,
            monedas,
            impuestos,
            bancos,

            idMoneda: monedaFilter ? monedaFilter.idMoneda : "",
            idImpuesto: impuestoFilter ? impuestoFilter.idImpuesto : "",
            idComprobante: comprobanteFilter ? comprobanteFilter.idComprobante : "",
            idComprobanteContado: comprobanteCobroFilter ? comprobanteCobroFilter.idComprobante : "",

            codiso: monedaFilter ? monedaFilter.codiso : "PEN",

            loading: false,
        });
    }


    async fetchComprobante(tipo) {
        const params = {
            "tipo": tipo
        }

        const response = await listComprobanteCombo(params, this.abortControllerView.signal);

        if (response instanceof SuccessReponse) {
            return response.data
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            return [];
        }
    }

    async fetchMoneda() {
        const response = await listMonedaCombo();

        if (response instanceof SuccessReponse) {
            return response.data
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            return [];
        }
    }

    async fetchImpuesto() {
        const response = await listImpuestCombo();

        if (response instanceof SuccessReponse) {
            return response.data
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            return [];
        }
    }

    async fetchBanco() {
        const response = await listBancoCombo();

        if (response instanceof SuccessReponse) {
            return response.data
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            return [];
        }
    }

    async fetchClientePredeterminado() {
        const response = await getPredeterminado();

        if (response instanceof SuccessReponse) {
            return response.data
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            return [];
        }
    }

    calcularLetraMensual = () => {
        if (this.state.numCuota === '') {
            return;
        }

        const saldo = this.state.importeTotal - (this.state.montoInicialCheck ? this.state.inicial : 0)
        const letra = saldo / this.state.numCuota

        this.setState({ letraMensual: letra.toFixed(2) })
    }

    /**
     * Método de eventos
     */

    handleAddItem = async (producto) => {
        if (this.state.idImpuesto === "") {
            alertWarning("Venta", "Seleccione un impuesto.");
            this.handleModalOptions();
            this.refImpuesto.current.focus();
            return;
        }

        if (producto.precio <= 0) {
            alertWarning("Venta", "¡El precio no puede tener un valor de 0!");
            return;
        }

        const detalleVenta = [...this.state.detalleVenta];
        const existingItem = detalleVenta.find(item => item.idDetalle === producto.idProducto);

        if (!existingItem) {
            detalleVenta.push({
                idDetalle: producto.idProducto,
                nombreProducto: producto.nombreProducto,
                nombreCategoria: producto.nombreCategoria,
                cantidad: 1,
                idImpuesto: this.state.idImpuesto,
                idMedida: producto.idMedida,
                precio: producto.precio
            });
        } else {
            existingItem.cantidad += 1;
        }

        await this.setStateAsync({
            detalleVenta,
        });
    }

    handleSelectComprobante = (event) => {
        this.setState({ idComprobante: event.target.value })
    }

    handleSelectImpuesto = (event) => {
        const idImpuesto = event.target.value;
        if (idImpuesto === "" || idImpuesto === null) {
            alertWarning("Venta", "¡El impuesto no debe tener un valor vacio!");
            return;
        }

        const detalleVenta = this.state.detalleVenta.map(item => ({
            ...item,
            idImpuesto: idImpuesto
        }));

        this.setState({ idImpuesto, detalleVenta });
    }

    handleSelectMoneda = (event) => {
        this.setState({ idMoneda: event.target.value, });
    }

    handleSaveOptions = () => {
        
    }

    handleModalOptions = () => {
        const invoice = document.getElementById("side-model-invoice");
        if (invoice.classList.contains("toggled")) {
            invoice.classList.remove("toggled");
        } else {
            invoice.classList.add("toggled");
        }
    }

    handleCloseOptions = (event) => {
        event.stopPropagation();
        this.handleModalOptions();
    }

    handleCloseOverlay = () => {
        this.handleModalOptions();
    }

    handle

    handleClearInputClient = async () => {
        await this.setStateAsync({ clientes: [], idCliente: '', cliente: "" });
        this.selectItemClient = false;
    }

    handleFilterClient = async (event) => {
        const searchWord = this.selectItemClient ? "" : event.target.value;
        await this.setStateAsync({ idCliente: '', cliente: searchWord });
        this.selectItemClient = false;
        if (searchWord.length === 0) {
            await this.setStateAsync({ clientes: [] });
            return;
        }

        if (this.state.filterCliente) return;


        await this.setStateAsync({ filterCliente: true });

        const params = {
            filtrar: searchWord,
        }

        const response = await listarClientesFilter(params);

        if (response instanceof SuccessReponse) {
            await this.setStateAsync({ filterCliente: false, clientes: response.data });
        }

        if (response instanceof ErrorResponse) {
            await this.setStateAsync({ filterCliente: false, clientes: [] });
        }
    }

    handleSelectItemClient = async (value) => {
        await this.setStateAsync({
            cliente: value.documento + " - " + value.informacion,
            clientes: [],
            idCliente: value.idCliente
        });
        this.selectItemClient = true;
    }

    handleOpenSale = async () => {
        if (this.state.detalleVenta.length === 0) {
            alertWarning("Venta", "La lista de productos esta vacía.");
            this.refProducto.current.focus();
            return;
        }

        if (this.state.idComprobante === "") {
            alertWarning("Venta", "Seleccione un comprobante.");
            return;
        }

        if (this.state.idCliente === "") {
            alertWarning("Venta", "Selecciona un cliente.", () => {
                this.refCliente.current.focus();
            });
            return;
        }

        showModal("modalVentaProceso");
        await this.setStateAsync({ loadModal: true })
    }

    handleClearSale = () => {
        this.refProducto.current.focus();

        this.setState({
            loading: true,
            msgLoading: 'Cargando datos...',

            idComprobante: '',
            comprobantes: [],

            idMoneda: '',
            monedas: [],
            codiso: "PEN",

            producto: '',
            productos: [],
            sarchProducto: false,
            filterProducto: false,

            idCliente: '',
            clientes: [],
            cliente: '',
            filterCliente: false,

            idImpuesto: '',
            impuestos: [],

            detalleVenta: [],

            selectTipoPago: 1,

            idComprobanteContado: '',
            comprobantesCobro: [],

            metodoPagoContado: '',

            idBancoContado: '',
            bancos: [],

            montoInicialCheck: false,
            inicial: '',
            idComprobanteCredito: '',

            idBancoCredito: '',
            metodoPagoCredito: '',

            monthPago: getCurrentMonth(),
            yearPago: getCurrentYear(),

            numCuota: '',
            letraMensual: '',

            frecuenciaPagoCredito: new Date().getDate() > 15 ? '30' : '15',

            inicialCreditoVariableCheck: false,
            inicialCreditoVariable: '',

            frecuenciaPago: new Date().getDate() > 15 ? '30' : '15',
            idComprobanteCreditoVariable: '',

            idBancoCreditoVariable: '',
            metodoPagoCreditoVariable: '',

            importeTotal: 0.0
        }, () => {
            this.loadingData();
        })

    }

    handleSelectTipoPago = (tipo) => {
        this.setState({ selectTipoPago: tipo })
    }

    handleSelectComprobanteContado = (event) => {
        this.setState({ idComprobanteContado: event.target.value })
    }

    handleSelectBancoContado = (event) => {
        this.setState({ idBancoContado: event.target.value })
    }

    handleSelectMetodoPagoContado = (event) => {
        this.setState({ metodoPagoContado: event.target.value })
    }

    handleTextMontoInicial = async (event) => {
        await this.setStateAsync({ inicial: event.target.value })
        this.calcularLetraMensual()
    }

    handleCheckMontoInicial = async (event) => {
        await this.setStateAsync({ montoInicialCheck: event.target.checked })
        this.refMontoInicial.current.focus();
    }

    handleSelectComprobanteCredito = (event) => {
        this.setState({ idComprobanteCredito: event.target.value })
    }

    handleSelectBancoCredito = (event) => {
        this.setState({ idBancoCredito: event.target.value })
    }

    handleSelectMetodoPagoCredito = (event) => {
        this.setState({ metodoPagoCredito: event.target.value })
    }

    handleSelectNumeroCuotas = async (event) => {
        await this.setStateAsync({ numCuota: event.target.value })
        this.calcularLetraMensual()
    }

    handleSelectMonthPago = (event) => {
        this.setState({ monthPago: event.target.value })
    }

    handleSelectYearPago = (event) => {
        this.setState({ yearPago: event.target.value })
    }

    handleSelectFrecuenciaPagoCredito = (event) => {
        this.setState({ frecuenciaPagoCredito: event.target.value })
    }

    handleTextInicialCreditoVariable = (event) => {
        this.setState({ inicialCreditoVariable: event.target.value })
    }

    handleCheckInicialCreditoVarible = (event) => {
        this.setState({ inicialCreditoVariableCheck: event.target.checked })
        this.refInicialCreditoVariable.current.focus();
    }

    handleSelectFrecuenciaPago = (event) => {
        this.setState({ frecuenciaPago: event.target.value })
    }

    handleSelectComprobanteCreditoVarible = (event) => {
        this.setState({ idComprobanteCreditoVariable: event.target.value })
    }

    handleSelectBancoCreditoVariable = (event) => {
        this.setState({ idBancoCreditoVariable: event.target.value })
    }

    handleSelectMetodoPagoCreditoVariable = (event) => {
        this.setState({ metodoPagoCreditoVariable: event.target.value })
    }

    /**
     * 
     * Método encargado de renderizar el html y mostrar en el DOM
     */
    render() {
        return (
            <PosContainerWrapper>

                <ModalSale
                    informacion={
                        {
                            idCliente: this.state.idCliente,
                            idComprobante: this.state.idComprobante,
                            idUsuario: this.state.idUsuario,

                            idMoneda: this.state.idMoneda,
                            idSucursal: this.state.idSucursal,

                            detalleVenta: this.state.detalleVenta
                        }
                    }
                    loadModal={this.state.loadModal}
                    selectTipoPago={this.state.selectTipoPago}
                    handleSelectTipoPago={this.handleSelectTipoPago}

                    comprobantesCobro={this.state.comprobantesCobro}
                    bancos={this.state.bancos}
                    mmonth={this.state.mmonth}
                    year={this.state.year}

                    refComprobanteContado={this.refComprobanteContado}
                    idComprobanteContado={this.state.idComprobanteContado}
                    handleSelectComprobanteContado={this.handleSelectComprobanteContado}

                    refBancoContado={this.refBancoContado}
                    idBancoContado={this.state.idBancoContado}
                    handleSelectBancoContado={this.handleSelectBancoContado}

                    refMetodoContado={this.refMetodoContado}
                    metodoPagoContado={this.state.metodoPagoContado}
                    handleSelectMetodoPagoContado={this.handleSelectMetodoPagoContado}

                    refMontoInicial={this.refMontoInicial}
                    inicial={this.state.inicial}
                    handleTextMontoInicial={this.handleTextMontoInicial}

                    montoInicialCheck={this.state.montoInicialCheck}
                    handleCheckMontoInicial={this.handleCheckMontoInicial}

                    refComprobanteCredito={this.refComprobanteCredito}
                    idComprobanteCredito={this.state.idComprobanteCredito}
                    handleSelectComprobanteCredito={this.handleSelectComprobanteCredito}

                    refBancoCredito={this.refBancoCredito}
                    idBancoCredito={this.state.idBancoCredito}
                    handleSelectBancoCredito={this.handleSelectBancoCredito}

                    refMetodoCredito={this.refMetodoCredito}
                    metodoPagoCredito={this.state.metodoPagoCredito}
                    handleSelectMetodoPagoCredito={this.handleSelectMetodoPagoCredito}

                    refNumCutoas={this.refNumCutoas}
                    numCuota={this.state.numCuota}
                    handleSelectNumeroCuotas={this.handleSelectNumeroCuotas}

                    monthPago={this.state.monthPago}
                    handleSelectMonthPago={this.handleSelectMonthPago}

                    yearPago={this.state.yearPago}
                    handleSelectYearPago={this.handleSelectYearPago}

                    refFrecuenciaPagoCredito={this.refFrecuenciaPagoCredito}
                    frecuenciaPagoCredito={this.state.frecuenciaPagoCredito}
                    handleSelectFrecuenciaPagoCredito={this.handleSelectFrecuenciaPagoCredito}

                    letraMensual={this.state.letraMensual}

                    refInicialCreditoVariable={this.refInicialCreditoVariable}
                    inicialCreditoVariable={this.state.inicialCreditoVariable}
                    handleTextInicialCreditoVariable={this.handleTextInicialCreditoVariable}

                    inicialCreditoVariableCheck={this.state.inicialCreditoVariableCheck}
                    handleCheckInicialCreditoVarible={this.handleCheckInicialCreditoVarible}

                    refComprobanteCreditoVariable={this.refComprobanteCreditoVariable}
                    idComprobanteCreditoVariable={this.state.idComprobanteCreditoVariable}
                    handleSelectComprobanteCreditoVarible={this.handleSelectComprobanteCreditoVarible}

                    refBancoCreditoVariable={this.refBancoCreditoVariable}
                    idBancoCreditoVariable={this.state.idBancoCreditoVariable}
                    handleSelectBancoCreditoVariable={this.handleSelectBancoCreditoVariable}

                    refMetodoCreditoVariable={this.refMetodoCreditoVariable}
                    metodoPagoCreditoVariable={this.state.metodoPagoCreditoVariable}
                    handleSelectMetodoPagoCreditoVariable={this.handleSelectMetodoPagoCreditoVariable}

                    refFrecuenciaPago={this.refFrecuenciaPago}
                    frecuenciaPago={this.state.frecuenciaPago}
                    handleSelectFrecuenciaPago={this.handleSelectFrecuenciaPago}

                    importeTotal={this.state.importeTotal}

                    handleClearSale={this.handleClearSale}
                />

                {
                    this.state.loading && spinnerLoading(this.state.msgLoading)
                }

                <section className='invoice-left'>
                    <InvoiceView
                        producto={this.state.producto}
                        idSucursal={this.state.idSucursal}
                        filterProducto={this.state.filterProducto}
                        setStateAsync={this.setStateAsync}

                        sarchProducto={this.state.sarchProducto}
                        productos={this.state.productos}
                        refProducto={this.refProducto}
                        handleAddItem={this.handleAddItem}
                    />
                </section>
                <section className='invoice-right'>
                    <InvoiceTicket handleCloseOptions={this.handleCloseOptions} />
                    {/* <InvoiceListPrices
                        refComprobante={this.refComprobante}
                        idComprobante={this.state.idComprobante}
                        comprobantes={this.state.comprobantes}
                        handleSelectComprobante={this.handleSelectComprobante}
                    /> */}
                    <InvoiceVoucher
                        refComprobante={this.refComprobante}
                        idComprobante={this.state.idComprobante}
                        comprobantes={this.state.comprobantes}
                        handleSelectComprobante={this.handleSelectComprobante}
                    />
                    <InvoiceClient
                        placeholder="Filtrar clientes..."
                        refCliente={this.refCliente}
                        cliente={this.state.cliente}
                        clientes={this.state.clientes}
                        onEventClearInput={this.handleClearInputClient}
                        handleFilter={this.handleFilterClient}
                        onEventSelectItem={this.handleSelectItemClient}
                    />
                    <InvoiceDetail
                        codiso={this.state.codiso}
                        setStateAsync={this.setStateAsync}
                        detalleVenta={this.state.detalleVenta}
                    />
                    <InvoiceFooter
                        codiso={this.state.codiso}
                        impuestos={this.state.impuestos}
                        detalleVenta={this.state.detalleVenta}
                        handleOpenSale={this.handleOpenSale}
                        handleClearSale={this.handleClearSale}
                    />
                </section>

                <ModalConfiguration
                    idImpuesto={this.state.idImpuesto}
                    refImpuesto={this.refImpuesto}
                    impuestos={this.state.impuestos}
                    handleSelectImpuesto={this.handleSelectImpuesto}

                    idMoneda={this.state.idMoneda}
                    refMoneda={this.refMoneda}
                    monedas={this.state.monedas}
                    handleSelectMoneda={this.handleSelectMoneda}

                    handleSaveOptions={this.handleSaveOptions}
                    handleCloseOverlay={this.handleCloseOverlay}
                    handleCloseOptions={this.handleCloseOptions}
                />
            </PosContainerWrapper>
        );
    }
}

/**
 * 
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

/**
 * 
 * Método encargado de conectar con redux y exportar la clase
 */
export default connect(mapStateToProps, null)(VentaProceso);