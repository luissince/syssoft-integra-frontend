import React from 'react';
import {
    alertDialog,
    alertSuccess,
    alertWarning,
    clearModal,
    getCurrentMonth,
    getCurrentYear,
    isText,
    showModal,
    spinnerLoading,
    viewModal,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { PosContainerWrapper } from '../../../../components/Container';
import InvoiceTicket from './component/InvoiceTicket';
import { createFactura, getPredeterminado, listBancoCombo, listComprobanteCombo, listImpuestCombo, listMonedaCombo, listarClientesFilter } from '../../../../network/rest/principal.network';
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
import ModalCliente from './component/ModalCliente';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class VentaProceso extends CustomComponent {

    /**
     * 
     * Constructor
     */

    constructor(props) {
        super(props);

        /**
         * Estado inicial del componente.
         * @type {Object}
         */
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

            comprobantesCobro: [],
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

            importeTotal: 0.0,

            //Modal Sale
            metodosPagoLista: [
                {
                    "idMetodo": "MT0001",
                    "nombre": "Efectivo",
                    "decripcion": "",
                    "predeterminado": true,
                    "vuelto": true
                },
                {
                    "idMetodo": "MT0002",
                    "nombre": "Yape",
                    "decripcion": "",
                    "predeterminado": false,
                    "vuelto": false
                },
                {
                    "idMetodo": "MT0003",
                    "nombre": "Tarjeta de crédito",
                    "decripcion": "",
                    "predeterminado": false,
                    "vuelto": false
                }
            ],

            metodoPagoAgregado: [],
            vuelto: 0
        }

        this.refProducto = React.createRef();

        this.refComprobante = React.createRef();
        this.refImpuesto = React.createRef();

        this.refCliente = React.createRef();
        this.refMoneda = React.createRef();

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

        this.idModalConfiguration = "idModalConfiguration";

        this.idModalCliente = "idModalCliente";

        this.idModalVentaProceso = "idModalVentaProceso";

    }


    /*
    |--------------------------------------------------------------------------
    | Método de cliclo de vida
    |--------------------------------------------------------------------------
    |
    | El ciclo de vida de un componente en React consta de varios métodos que se ejecutan en diferentes momentos durante la vida útil
    | del componente. Estos métodos proporcionan puntos de entrada para realizar acciones específicas en cada etapa del ciclo de vida,
    | como inicializar el estado, montar el componente, actualizar el estado y desmontar el componente. Estos métodos permiten a los
    | desarrolladores controlar y realizar acciones específicas en respuesta a eventos de ciclo de vida, como la creación, actualización
    | o eliminación del componente. Entender y utilizar el ciclo de vida de React es fundamental para implementar correctamente la lógica
    | de la aplicación y optimizar el rendimiento del componente.
    |
    */

    /**
     * @description Método que se ejecuta después de que el componente se haya montado en el DOM.
     */
    componentDidMount() {
        this.loadingData();

        viewModal(this.idModalVentaProceso, () => {

            const importeTotal = this.state.detalleVenta.reduce((accumulator, item) => {
                const totalProductPrice = item.precio * item.cantidad;
                return accumulator + totalProductPrice;
            }, 0);


            const metodoContadoPred = this.state.metodosPagoLista.find(item => item.predeterminado === true);

            this.refMetodoContado.current.value = metodoContadoPred ? metodoContadoPred.idMetodo : ''

            if (metodoContadoPred) {
                const item = {
                    "idMetodo": metodoContadoPred.idMetodo,
                    "nombre": metodoContadoPred.nombre,
                    "monto": '',
                    "vuelto": metodoContadoPred.vuelto
                }
                this.setState(prevState => ({
                    metodoPagoAgregado: [...prevState.metodoPagoAgregado, item]
                }))
            }

            this.setState({ importeTotal, loadModal: false })
        });

        clearModal(this.idModalVentaProceso, async () => {
            await this.setStateAsync({
                selectTipoPago: 1,        

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

                metodoPagoAgregado: [],
                vuelto: 0
            });
        })
    }

    /**
    * @description Método que se ejecuta antes de que el componente se desmonte del DOM.
    */
    componentWillUnmount() {
        this.abortControllerView.abort();
    }

    /*
    |--------------------------------------------------------------------------
    | Métodos de acción
    |--------------------------------------------------------------------------
    |
    | Carga los datos iniciales necesarios para inicializar el componente. Este método se utiliza típicamente
    | para obtener datos desde un servicio externo, como una API o una base de datos, y actualizar el estado del
    | componente en consecuencia. El método loadingData puede ser responsable de realizar peticiones asíncronas
    | para obtener los datos iniciales y luego actualizar el estado del componente una vez que los datos han sido
    | recuperados. La función loadingData puede ser invocada en el montaje inicial del componente para asegurarse
    | de que los datos requeridos estén disponibles antes de renderizar el componente en la interfaz de usuario.
    |
    */

    /**
    * @description Método que se ejecuta después de que el componente se haya montado en el DOM.
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

    /*
    |--------------------------------------------------------------------------
    | Método de eventos
    |--------------------------------------------------------------------------
    |
    | El método handle es una convención utilizada para denominar funciones que manejan eventos específicos
    | en los componentes de React. Estas funciones se utilizan comúnmente para realizar tareas o actualizaciones
    | en el estado del componente cuando ocurre un evento determinado, como hacer clic en un botón, cambiar el valor
    | de un campo de entrada, o cualquier otra interacción del usuario. Los métodos handle suelen recibir el evento
    | como parámetro y se encargan de realizar las operaciones necesarias en función de la lógica de la aplicación.
    | Por ejemplo, un método handle para un evento de clic puede actualizar el estado del componente o llamar a
    | otra función específica de la lógica de negocio. La convención de nombres handle suele combinarse con un prefijo
    | que describe el tipo de evento que maneja, como handleInputChange, handleClick, handleSubmission, entre otros. 
    |
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

    handleModalOptions = () => {
        const invoice = document.getElementById(this.sideModalInovice);
        if (invoice.classList.contains("toggled")) {
            invoice.classList.remove("toggled");
        } else {
            invoice.classList.add("toggled");
        }
    }

    handleSaveOptions = () => {

    }

    handleOpenAndCloseOptions = (event) => {
        event.stopPropagation();
        this.handleModalOptions();
    }

    handleOpenAndCloseOverlay = () => {
        this.handleModalOptions();
    }


    handleModalCliente = () => {
        const invoice = document.getElementById(this.modalCliente);
        if (invoice.classList.contains("toggled")) {
            invoice.classList.remove("toggled");
        } else {
            invoice.classList.add("toggled");
        }
    }

    handleSaveCliente = () => {

    }

    handleOpenAndCloseCiente = (event) => {
        event.stopPropagation();
        this.handleModalCliente();
    }

    handleOpenAndCloseOverlayCliente = () => {
        this.handleModalCliente();
    }

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

        showModal(this.idModalVentaProceso);
        await this.setStateAsync({ loadModal: true })
    }

    
    //------------------------------------------------------------------------------------------
    // Modal Venta
    //------------------------------------------------------------------------------------------

    handleSelectTipoPago = (tipo) => {
        this.setState({ selectTipoPago: tipo })
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

            comprobantesCobro: [],

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

    handleSaveProcess = () => {    
        alertDialog("Venta", "¿Estás seguro de continuar?", async (value) => {
            if (value) {

                let numCuota = 0;
                switch (this.state.selectTipoPago) {
                    case 2:
                        numCuota = parseInt(this.state.numCuota);
                        break;
                    default: numCuota = 0;
                }

                let frecuencia = 0;
                // switch(selectTipoPago){

                // }

                const data = {
                    idComprobante: this.state.idComprobante,
                    idCliente: this.state.idCliente,
                    idUsuario: this.state.idUsuario,
                    idSucursal: this.state.idSucursal,
                    idMoneda: this.state.idMoneda,
                    tipo: this.state.selectTipoPago === 1 ? 1 : 2,
                    selectTipoPago: this.state.selectTipoPago,
                    numCuota: numCuota,
                    estado: this.state.selectTipoPago === 1 ? 1 : 2,
                    frecuenciaPago: frecuencia,                 

                    detalleVenta: this.state.detalleVenta
                }

                const response = await createFactura(data);

                if (response instanceof SuccessReponse) {
                    alertSuccess("Venta", response.data, () => {
                        this.handleClearSale();
                    });
                }

                if (response instanceof ErrorResponse) {
                    alertWarning("Venta", response.getMessage(), () => {

                    });
                }
            }
        });
    }


    //Metodos Modal Sale
    handleAddMetodPay = () => {
        const listAdd = this.state.metodoPagoAgregado.find(item => item.idMetodo === this.refMetodoContado.current.value)

        if (listAdd) {
            return
        }

        const metodo = this.state.metodosPagoLista.find(item => item.idMetodo === this.refMetodoContado.current.value);

        const item = {
            "idMetodo": metodo.idMetodo,
            "nombre": metodo.nombre,
            "monto": '',
            "vuelto": metodo.vuelto
        }

        this.setState(prevState => ({
            metodoPagoAgregado: [...prevState.metodoPagoAgregado, item]
        }))
    }

    handleRemoveItemMetodPay = (idMetodo) => {
        const metodoPagoAgregado = this.state.metodoPagoAgregado.filter(item => item.idMetodo !== idMetodo);
        this.setState({ metodoPagoAgregado })

    }

    handleInputMontoMetodoPay = async (event, idMetodo) => {
        const { value } = event.target;
        await this.setStateAsync(prevState => ({
            metodoPagoAgregado: prevState.metodoPagoAgregado.map(item =>
                item.idMetodo === idMetodo ? { ...item, monto: value ? parseFloat(value) : '' } : item
            ),
        }));

        this.handleCalcularMetodoPagoContado()
    }

    handleCalcularMetodoPagoContado = () => {
        const suma = this.state.metodoPagoAgregado.reduce((accumulator, item) => {
            const monto = item.monto ? parseFloat(item.monto) : 0
            return accumulator + monto;
        }, 0)

        if (suma >= this.state.importeTotal) {
            this.setState({
                vuelto: suma - this.state.importeTotal
            })
        } else {
            this.setState({
                vuelto: this.state.importeTotal - suma
            })
        }

        console.log(this.state.importeTotal)
    }

    /*
    |--------------------------------------------------------------------------
    | Método de cliclo de vida
    |--------------------------------------------------------------------------
    |
    | El método render() es esencial en los componentes de React y se encarga de determinar
    | qué debe mostrarse en la interfaz de usuario basado en el estado y las propiedades actuales
    | del componente. Este método devuelve un elemento React que describe lo que debe renderizarse
    | en la interfaz de usuario. La salida del método render() puede incluir otros componentes
    | de React, elementos HTML o una combinación de ambos. Es importante que el método render()
    | sea una función pura, es decir, no debe modificar el estado del componente ni interactuar
    | directamente con el DOM. En su lugar, debe basarse únicamente en los props y el estado
    | actuales del componente para determinar lo que se mostrará.
    |
    */

    render() {
        const {loadModal, selectTipoPago, comprobantesCobro} = this.state;

        return (   

            <PosContainerWrapper>

                <ModalSale
                    idModalVentaProceso={this.idModalVentaProceso}
                    loadModal={loadModal}

                    selectTipoPago={selectTipoPago}
                    handleSelectTipoPago={this.handleSelectTipoPago}

                    comprobantesCobro={comprobantesCobro}
                    bancos={this.state.bancos}
                    mmonth={this.state.mmonth}
                    year={this.state.year}           
            
                    refMetodoContado={this.refMetodoContado}

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

                    handleSaveProcess={this.handleSaveProcess}

                    // 
                    metodosPagoLista={this.state.metodosPagoLista}
                    metodoPagoAgregado={this.state.metodoPagoAgregado}
                    handleAddMetodPay={this.handleAddMetodPay}
                    handleInputMontoMetodoPay={this.handleInputMontoMetodoPay}
                    handleRemoveItemMetodPay={this.handleRemoveItemMetodPay}
                    vuelto={this.state.vuelto}
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
                    <InvoiceTicket
                        handleOpenAndCloseOptions={this.handleOpenAndCloseOptions}
                    />

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
                        handleOpenAndCloseCiente={this.handleOpenAndCloseCiente}
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
                    idModalConfiguration={this.idModalConfiguration}

                    idImpuesto={this.state.idImpuesto}
                    refImpuesto={this.refImpuesto}
                    impuestos={this.state.impuestos}
                    handleSelectImpuesto={this.handleSelectImpuesto}

                    idMoneda={this.state.idMoneda}
                    refMoneda={this.refMoneda}
                    monedas={this.state.monedas}
                    handleSelectMoneda={this.handleSelectMoneda}

                    handleSaveOptions={this.handleSaveOptions}
                    handleOpenAndCloseOverlay={this.handleOpenAndCloseOverlay}
                    handleOpenAndCloseOptions={this.handleOpenAndCloseOptions}
                />

                <ModalCliente
                    idModalCliente={this.idModalCliente}

                    handleSaveCliente={this.handleSaveCliente}
                    handleOpenAndCloseOverlayCliente={this.handleOpenAndCloseOverlayCliente}
                    handleOpenAndCloseCiente={this.handleOpenAndCloseCiente}
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