import React from 'react';
import axios from 'axios';
import {
    numberFormat,
    calculateTaxBruto,
    calculateTax,
    getCurrentMonth,
    getCurrentYear,
    isNumeric,
    showModal,
    hideModal,
    currentDate,
    ModalAlertDialog,
    ModalAlertInfo,
    ModalAlertSuccess,
    ModalAlertWarning,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { apiComprobanteListcombo } from '../../../../network/api';
import { PosContainerWrapper } from '../../../../components/Container';
import { images } from "../../../../helper";

class VentaProceso extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            idCliente: '',
            idComprobante: '',
            idUsuario: this.props.token.userToken.idUsuario,
            numCuota: '',
            estado: 1,
            idMoneda: '',
            monedas: [],

            lotes: [],
            lote: '',
            idLote: '',
            filterLote: false,
            manzana: '',
            precioContado: '',

            detalleVenta: [],
            comprobantes: [],
            clientes: [],
            cliente: '',
            filterCliente: false,

            fechaInicio: currentDate(),

            idImpuesto: '',
            impuestos: [],

            idMedida: '',
            medidas: [],

            expandedOpciones: true,
            idProyecto: this.props.token.project.idProyecto,

            loading: true,
            messageWarning: '',
            msgLoading: 'Cargando datos...',

            importeTotal: 0,
            selectTipoPago: 1,

            bancos: [],
            comprobantesCobro: [],

            idComprobanteContado: '',
            idBancoContado: '',
            metodoPagoContado: '',
            montoInicialCheck: false,
            inicial: '',
            idComprobanteCredito: '',
            idBancoCredito: '',
            monthPago: getCurrentMonth(),
            yearPago: getCurrentYear(),
            metodoPagoCredito: '',
            letraMensual: '',
            frecuenciaPagoCredito: new Date().getDate() > 15 ? '30' : '15',

            inicialCreditoVariableCheck: false,
            inicialCreditoVariable: '',
            idComprobanteCreditoVariable: '',

            idBancoCreditoVariable: '',
            metodoPagoCreditoVariable: '',
            frecuenciaPago: new Date().getDate() > 15 ? '30' : '15',

            mmonth: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            year: [2015, 2016, 2017, 2018, 2019, 2020, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030],

        }

        this.refLote = React.createRef();
        this.refPrecioContado = React.createRef();
        this.refComprobante = React.createRef();
        this.refImpuesto = React.createRef();
        this.refMedida = React.createRef();
        this.refCliente = React.createRef();
        this.refMoneda = React.createRef();
        this.refCollpse = React.createRef();
        this.refCollpseContent = React.createRef();

        this.refComprobanteContado = React.createRef();
        this.refBancoContado = React.createRef();
        this.refMetodoContado = React.createRef();

        this.refMontoInicial = React.createRef();
        this.refComprobanteCredito = React.createRef();
        this.refBancoCredito = React.createRef();
        this.refMetodoCredito = React.createRef();
        this.refFechaPagoCredito = React.createRef();
        this.refNumCutoas = React.createRef();
        this.refFrecuenciaPagoCredito = React.createRef();

        this.refInicialCreditoVariable = React.createRef();
        this.refComprobanteCreditoVariable = React.createRef();
        this.refBancoCreditoVariable = React.createRef();
        this.refMetodoCreditoVariable = React.createRef();
        this.refFrecuenciaPago = React.createRef();

        this.abortControllerView = new AbortController();

        this.selectItemClient = false;
        this.selectItemLote = false;
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    async componentDidMount() {
        // viewModal("modalVentaProceso", () => {
        //     this.refBancoContado.current.focus();
        // });

        // clearModal("modalVentaProceso", async () => {
        //     await this.setStateAsync({
        //         selectTipoPago: 1,
        //         idBancoContado: '',
        //         metodoPagoContado: '',
        //         montoInicialCheck: false,
        //         inicial: '',
        //         idBancoCredito: '',
        //         metodoPagoCredito: '',
        //         letraMensual: '',
        //         frecuenciaPagoCredito: new Date().getDate() > 15 ? '30' : '15',
        //         numCuota: '',

        //         inicialCreditoVariableCheck: false,
        //         inicialCreditoVariable: '',
        //         // idComprobanteCreditoVariable: '',
        //         idBancoCreditoVariable: '',
        //         metodoPagoCreditoVariable: '',
        //         frecuenciaPago: new Date().getDate() > 15 ? '30' : '15',
        //     });
        // })
    }

    componentWillUnmount() {
        this.abortControllerView.abort();
    }


    loadData = async () => {
        try {

            const comprobanteLibre = await apiComprobanteListcombo(this.abortControllerView.signal, {
                "tipo": "2"
            });

            const facturadoCobro = await apiComprobanteListcombo(this.abortControllerView.signal, {
                "tipo": "1"
            });

            const comprobanteCobro = await apiComprobanteListcombo(this.abortControllerView.signal, {
                "tipo": "5"
            });

            let medida = await axios.get('/api/medida/listcombo', {
                signal: this.abortControllerView.signal,
            });

            const moneda = await axios.get("/api/moneda/listcombo", {
                signal: this.abortControllerView.signal,
            });

            const impuesto = await axios.get("/api/impuesto/listcombo", {
                signal: this.abortControllerView.signal,
            });

            const banco = await axios.get("/api/banco/listcombo", {
                signal: this.abortControllerView.signal,
            });

            const comprobanteFilter = comprobanteLibre.data.filter(item => item.preferida === 1);

            const comprobanteCobroFilter = [...facturadoCobro.data, ...comprobanteCobro.data].filter(item => item.preferida === 1);

            const monedaFilter = moneda.data.filter(item => item.predeterminado === 1);

            const impuestoFilter = impuesto.data.filter(item => item.preferida === 1);

            const medidaFilter = medida.data.filter(item => item.preferida === 1);

            await this.setStateAsync({
                comprobantes: comprobanteLibre.data,
                comprobantesCobro: [...facturadoCobro.data, ...comprobanteCobro.data],
                monedas: moneda.data,

                medidas: medida.data,
                impuestos: impuesto.data,

                idMoneda: monedaFilter.length > 0 ? monedaFilter[0].idMoneda : '',
                idMedida: medidaFilter.length > 0 ? medidaFilter[0].idMedida : '',
                idImpuesto: impuestoFilter.length > 0 ? impuestoFilter[0].idImpuesto : '',
                idComprobante: comprobanteFilter.length > 0 ? comprobanteFilter[0].idComprobante : '',
                idComprobanteContado: comprobanteCobroFilter.length > 0 ? comprobanteCobroFilter[0].idComprobante : '',
                idComprobanteCredito: comprobanteCobroFilter.length > 0 ? comprobanteCobroFilter[0].idComprobante : '',
                idComprobanteCreditoVariable: comprobanteCobroFilter.length > 0 ? comprobanteCobroFilter[0].idComprobante : '',

                bancos: banco.data,
                loading: false,
            });

        } catch (error) {
            if (error.message !== "canceled") {
                await this.setStateAsync({
                    msgLoading: "Se produjo un error interno, intente nuevamente."
                });
            }
        }
    }

    async addObjectTable() {
        if (this.state.idLote === '') {
            await this.setStateAsync({ messageWarning: "Seleccione un lote" })
            this.refLote.current.focus();
            return;
        }

        if (!isNumeric(this.state.precioContado)) {
            await this.setStateAsync({ messageWarning: "Ingrese el precio de venta total" })
            this.refPrecioContado.current.focus();
            return;
        }

        if (this.state.precioContado <= 0) {
            await this.setStateAsync({ messageWarning: "Ingrese un precio mayor a 0" })
            this.refPrecioContado.current.focus();
            return;
        }

        if (this.state.idImpuesto === "") {
            await this.setStateAsync({ messageWarning: "Seleccione un impuesto." });

            if (!this.refCollpseContent.current.classList.contains("show")) {
                this.refCollpse.current.classList.remove("collapsed");
                this.refCollpseContent.current.classList.add("show");
                this.refCollpse.current.attributes["aria-expanded"].value = true;
                await this.setStateAsync({
                    expandedOpciones: !(this.refCollpse.current.attributes["aria-expanded"].value.toLowerCase() === 'true')
                });
            }

            this.refImpuesto.current.focus();
            return;
        }

        if (this.state.idMedida === "") {
            await this.setStateAsync({ messageWarning: "Seleccione una unidad." })

            if (!this.refCollpseContent.current.classList.contains("show")) {
                this.refCollpse.current.classList.remove("collapsed");
                this.refCollpseContent.current.classList.add("show");
                this.refCollpse.current.attributes["aria-expanded"].value = true;
                await this.setStateAsync({
                    expandedOpciones: !(this.refCollpse.current.attributes["aria-expanded"].value.toLowerCase() === 'true')
                });
            }

            this.refMedida.current.focus();
            return;
        }

        let nombreLote = this.state.lote;
        let nombreManzana = this.state.manzana;

        if (!this.validarDuplicado(this.state.idLote)) {
            let detalle = {
                "idDetalle": this.state.idLote,
                "nombreLote": nombreLote,
                "nombreManzana": nombreManzana,
                "cantidad": 1,
                "idImpuesto": this.state.idImpuesto,
                "impuesto": this.refImpuesto.current.children[this.refImpuesto.current.selectedIndex].innerText,
                "idMedida": this.state.idMedida,
                "medida": this.refMedida.current.children[this.refMedida.current.selectedIndex].innerText,
                "precioContado": this.state.precioContado
            }

            this.state.detalleVenta.push(detalle)
        } else {
            for (let item of this.state.detalleVenta) {
                if (item.idDetalle === this.state.idLote) {
                    let currenteObject = item;
                    currenteObject.cantidad = parseFloat(currenteObject.cantidad) + 1;
                    break;
                }
            }
        }

        let newArr = [...this.state.detalleVenta];

        const impuestoFilter = this.state.impuestos.filter(item => item.preferida === 1);

        const medidaFilter = this.state.medidas.filter(item => item.preferida === 1);

        await this.setStateAsync({
            detalleVenta: newArr,
            messageWarning: '',
            precioContado: '',
            lote: '',
            idLote: '',
            manzana: '',
            idMedida: medidaFilter.length > 0 ? medidaFilter[0].idMedida : '',
            idImpuesto: impuestoFilter.length > 0 ? impuestoFilter[0].idImpuesto : '',
        });

        const { total } = this.calcularTotales();

        await this.setStateAsync({
            importeTotal: total
        });
    }

    validarDuplicado(id) {
        let value = false
        for (let item of this.state.detalleVenta) {
            if (item.idDetalle === id) {
                value = true
                break;
            }
        }
        return value
    }

    async removeObjectTable(id) {
        let newArr = [...this.state.detalleVenta];

        for (let i = 0; i < newArr.length; i++) {
            if (id === newArr[i].idDetalle) {
                newArr.splice(i, 1)
                i--;
                break;
            }
        }

        await this.setStateAsync({
            detalleVenta: newArr,
        })

        const { total } = this.calcularTotales();

        await this.setStateAsync({
            importeTotal: total
        })
    }

    async changeLote(event) {
        let precio = 0
        for (let i of this.state.lotes) {
            if (event.target.value === i.idLote) {
                precio = i.precio
                break
            }
        }
        await this.setStateAsync({
            precioContado: precio.toString()
        });

        this.refPrecioContado.current.focus();
    }

    async calcularLetraMensual() {
        if (this.state.numCuota === '') {
            return;
        }

        let saldo = this.state.importeTotal - (this.state.montoInicialCheck ? this.state.inicial : 0)
        let letra = saldo / this.state.numCuota

        await this.setStateAsync({ letraMensual: letra })
    }

    async onEventLimpiar() {
        await this.setStateAsync({
            idCliente: '',
            idComprobante: '',
            numCuota: '',
            estado: 1,
            idMoneda: '',
            monedas: [],

            lotes: [],
            lote: '',
            idLote: '',
            filterLote: false,
            manzana: '',
            precioContado: '',

            detalleVenta: [],
            comprobantes: [],
            clientes: [],
            cliente: '',
            filterCliente: false,

            idImpuesto: '',
            impuestos: [],

            idMedida: '',
            medidas: [],

            expandedOpciones: true,

            loading: true,
            messageWarning: '',

            importeTotal: 0,
            selectTipoPago: 1,

            bancos: [],
            comprobantesCobro: [],

            idComprobanteContado: '',
            idBancoContado: '',
            metodoPagoContado: '',
            montoInicialCheck: false,
            inicial: '',
            idComprobanteCredito: '',
            idBancoCredito: '',
            monthPago: getCurrentMonth(),
            yearPago: getCurrentYear(),
            metodoPagoCredito: '',
            letraMensual: '',
            frecuenciaPagoCredito: new Date().getDate() > 15 ? '30' : '15',

            inicialCreditoVariableCheck: false,
            inicialCreditoVariable: '',
            idComprobanteCreditoVariable: '',

            idBancoCreditoVariable: '',
            metodoPagoCreditoVariable: '',
            frecuenciaPago: new Date().getDate() > 15 ? '30' : '15',
        });

        this.loadData();
    }

    calcularTotales() {
        let subTotal = 0;
        let impuestoTotal = 0;
        let total = 0;

        for (let item of this.state.detalleVenta) {
            let cantidad = item.cantidad;
            let valor = parseFloat(item.precioContado);
            let filter = this.state.impuestos.filter(imp =>
                imp.idImpuesto === item.idImpuesto
            )
            let impuesto = filter.length > 0 ? filter[0].porcentaje : 0;

            let valorActual = cantidad * valor;
            let valorSubNeto = calculateTaxBruto(impuesto, valorActual);
            let valorImpuesto = calculateTax(impuesto, valorSubNeto);
            let valorNeto = valorSubNeto + valorImpuesto;

            subTotal += valorSubNeto;
            impuestoTotal += valorImpuesto;
            total += valorNeto;
        }
        return { subTotal, impuestoTotal, total }
    }

    renderTotal() {
        const { subTotal, impuestoTotal, total } = this.calcularTotales();
        let moneda = this.state.monedas.filter(item => item.idMoneda === this.state.idMoneda);
        let codigo = moneda.length > 0 ? moneda[0].codiso : "PEN";
        return (
            <>
                <tr>
                    <td className="text-left">Sub Total:</td>
                    <td className="text-right">{numberFormat(subTotal, codigo)}</td>
                </tr>
                <tr>
                    <td className="text-left">Impuesto:</td>
                    <td className="text-right">{numberFormat(impuestoTotal, codigo)}</td>
                </tr>
                <tr className="border-bottom">
                </tr>
                <tr>
                    <td className="text-left h4">Total:</td>
                    <td className="text-right h4">{numberFormat(total, codigo)}</td>
                </tr>
            </>
        )
    }

    async onEventOpenModal() {
        if (this.state.detalleVenta.length <= 0) {
            await this.setStateAsync({ messageWarning: "Agregar datos a la tabla." })
            this.refLote.current.focus()
            return;
        }

        if (this.state.idComprobante === '') {
            await this.setStateAsync({ messageWarning: "Seleccione el comprobante." })
            this.refComprobante.current.focus();
            return;
        }

        if (this.state.idCliente === "") {
            await this.setStateAsync({ messageWarning: "Seleccione el cliente." });
            this.refCliente.current.focus();
            return;
        }
        if (this.state.idMoneda === "") {
            await this.setStateAsync({ messageWarning: "Seleccione la moneda." });
            this.refMoneda.current.focus();
            return;
        }

        let validate = this.state.detalleVenta.reduce((acumulador, item) =>
            item.idImpuesto === "" ? acumulador + 1 : acumulador + 0
            , 0);

        if (validate > 0) {
            await this.setStateAsync({ messageWarning: "Hay detalles en la tabla sin impuesto seleccionado." });
            let count = 0;
            for (let item of this.state.detalleVenta) {
                count++;
                if (item.idImpuesto === "") {
                    document.getElementById(count + "imv").focus()
                }
            }
            return;
        } else {
            await this.setStateAsync({ messageWarning: "" });
        }

        showModal("modalVentaProceso")

    }

    onEventGuardar() {

        if (this.state.selectTipoPago === 1) {
            // Al contado
            if (this.state.idComprobanteContado === "") {
                this.refComprobanteContado.current.focus();
            } else if (this.state.idBancoContado === "") {
                this.refBancoContado.current.focus();
            } else if (this.state.metodoPagoContado === "") {
                this.refMetodoContado.current.focus();
            } else {
                this.onSave(this.state.selectTipoPago)
            }

        } else if (this.state.selectTipoPago === 2) {
            // Al credito fijo
            if (this.state.montoInicialCheck && !isNumeric(this.state.inicial)) {
                this.refMontoInicial.current.focus();
            } else if (parseFloat(this.state.inicial) <= 0) {
                this.refMontoInicial.current.focus();
            } else if (this.state.montoInicialCheck && this.state.idComprobanteCredito === "") {
                this.refComprobanteCredito.current.focus();
            } else if (this.state.montoInicialCheck && this.state.idBancoCredito === "") {
                this.refBancoCredito.current.focus();
            } else if (this.state.montoInicialCheck && this.state.metodoPagoCredito === "") {
                this.refMetodoCredito.current.focus();
            } else if (!isNumeric(this.state.numCuota)) {
                this.refNumCutoas.current.focus();
            } else if (parseInt(this.state.numCuota) <= 0) {
                this.refNumCutoas.current.focus();
                // monthPago: getCurrentMonth(),
                // yearPago: getCurrentYear(),
            }
            else if (this.state.frecuenciaPagoCredito === "") {
                this.refFrecuenciaPagoCredito.current.focus();
            } else {
                this.onSave(this.state.selectTipoPago)
            }

        } else {
            // Al credito variable
            if (this.state.inicialCreditoVariableCheck && !isNumeric(this.state.inicialCreditoVariable)) {
                this.refInicialCreditoVariable.current.focus();
            } else if (parseFloat(this.state.inicialCreditoVariable) <= 0) {
                this.refInicialCreditoVariable.current.focus();
            } else if (this.state.inicialCreditoVariableCheck && this.state.idComprobanteCreditoVariable === "") {
                this.refComprobanteCreditoVariable.current.focus();
            } else if (this.state.inicialCreditoVariableCheck && this.state.idBancoCreditoVariable === "") {
                this.refBancoCreditoVariable.current.focus();
            } else if (this.state.inicialCreditoVariableCheck && this.state.metodoPagoCreditoVariable === "") {
                this.refMetodoCreditoVariable.current.focus();
            } else if (this.state.frecuenciaPago === '') {
                this.refFrecuenciaPago.current.focus();
            } else {
                this.onSave(this.state.selectTipoPago)
            }
        }
    }

    async onSave(selectTipoPago) {
        ModalAlertDialog("Venta", "¿Estás seguro de continuar?", async (event) => {
            if (event) {
                try {
                    ModalAlertInfo("Venta", "Procesando información...");
                    hideModal("modalVentaProceso")

                    let result = await axios.post('/api/factura/add', {
                        "idCliente": this.state.idCliente,
                        "idUsuario": this.state.idUsuario,
                        "idComprobante": this.state.idComprobante,
                        "idMoneda": this.state.idMoneda,
                        "idMedida": this.state.idMedida,
                        "idImpuesto": this.state.idImpuesto,
                        // "tipo": this.state.selectTipoPago ? 1 : 2,
                        "tipo": selectTipoPago === 1 ? 1 : 2,
                        // "selectTipoPago": this.state.selectTipoPago,
                        "selectTipoPago": selectTipoPago === 1 ? 1
                            : selectTipoPago === 2 ? 2
                                : 3,

                        // "montoInicialCheck": this.state.montoInicialCheck,
                        "montoInicialCheck": selectTipoPago === 1 ? false
                            : selectTipoPago === 2 && this.state.montoInicialCheck ? this.state.montoInicialCheck
                                : selectTipoPago === 2 && !this.state.montoInicialCheck ? false
                                    : selectTipoPago === 3 && this.state.inicialCreditoVariableCheck ? this.state.inicialCreditoVariableCheck
                                        : selectTipoPago === 3 && !this.state.inicialCreditoVariableCheck ? false : false,

                        // "idComprobanteCobro": this.state.selectTipoPago ? this.state.idComprobanteContado : this.state.idComprobanteCredito,
                        "idComprobanteCobro": selectTipoPago === 1 ? this.state.idComprobanteContado
                            : selectTipoPago === 2 ? this.state.idComprobanteCredito : this.state.idComprobanteCreditoVariable,
                        // "idBanco": this.state.selectTipoPago ? this.state.idBancoContado : this.state.montoInicialCheck ? this.state.idBancoCredito : "",
                        "idBanco": selectTipoPago === 1 ? this.state.idBancoContado
                            : selectTipoPago === 2 && this.state.montoInicialCheck ? this.state.idBancoCredito
                                : selectTipoPago === 2 && !this.state.montoInicialCheck ? ""
                                    : selectTipoPago === 3 && this.state.inicialCreditoVariableCheck ? this.state.idBancoCreditoVariable
                                        : selectTipoPago === 3 && !this.state.inicialCreditoVariableCheck ? "" : "",

                        // "metodoPago": this.state.selectTipoPago ? this.state.metodoPagoContado : this.state.montoInicialCheck ? this.state.metodoPagoCredito : "",
                        "metodoPago": selectTipoPago === 1 ? this.state.metodoPagoContado
                            : selectTipoPago === 2 && this.state.montoInicialCheck ? this.state.metodoPagoCredito
                                : selectTipoPago === 2 && !this.state.montoInicialCheck ? ""
                                    : selectTipoPago === 3 && this.state.inicialCreditoVariableCheck ? this.state.metodoPagoCreditoVariable
                                        : selectTipoPago === 3 && !this.state.inicialCreditoVariableCheck ? "" : "",

                        // "inicial": this.state.selectTipoPago ? 0 : this.state.montoInicialCheck ? parseFloat(this.state.inicial) : 0,
                        "inicial": selectTipoPago === 1 ? 0
                            : selectTipoPago === 2 && this.state.montoInicialCheck ? parseFloat(this.state.inicial)
                                : selectTipoPago === 2 && !this.state.montoInicialCheck ? 0
                                    : selectTipoPago === 3 && this.state.inicialCreditoVariableCheck ? parseFloat(this.state.inicialCreditoVariable)
                                        : selectTipoPago === 3 && !this.state.inicialCreditoVariableCheck ? 0 : 0,

                        "fechaPago": selectTipoPago === 2 ? [this.state.yearPago, this.state.monthPago] : '',

                        // "numCuota": this.state.selectTipoPago ? 0 : parseInt(this.state.numCuota),
                        "numCuota": selectTipoPago === 1 ? 0
                            : selectTipoPago === 2 ? parseInt(this.state.numCuota)
                                : selectTipoPago === 3 ? 0 : 0,

                        // "estado": this.state.selectTipoPago ? 1 : 2,
                        "estado": selectTipoPago === 1 ? 1 : 2,
                        "frecuenciaPago": selectTipoPago === 1 ? 0
                            : selectTipoPago === 2 ? this.state.frecuenciaPagoCredito
                                : selectTipoPago === 3 ? this.state.frecuenciaPago : 0,
                        "idProyecto": this.state.idProyecto,
                        "detalleVenta": this.state.detalleVenta,
                    });

                    ModalAlertSuccess("Venta", result.data, () => {
                        this.onEventLimpiar()
                    });
                }
                catch (error) {
                    if (error.response) {
                        ModalAlertWarning("Venta", error.response.data)
                    } else {
                        ModalAlertWarning("Venta", "Se genero un error interno, intente nuevamente.")
                    }
                }
            }
        });
    }

    handleSelect = async (event, idDetalle) => {
        let updatedList = [...this.state.detalleVenta];
        for (let item of updatedList) {
            if (item.idDetalle === idDetalle) {
                item.idImpuesto = event.target.value;
                break;
            }
        }

        await this.setStateAsync({ detalleVenta: updatedList })
    }

    /** */
    onEventClearInputLote = async () => {
        await this.setStateAsync({ lotes: [], idLote: '', lote: "", manzana: "" });
        this.selectItemLote = false;
    }

    handleFilterLote = async (event) => {

        const searchWord = this.selectItemLote ? "" : event.target.value;
        await this.setStateAsync({ idLote: '', lote: searchWord });
        this.selectItemLote = false;
        if (searchWord.length === 0) {
            await this.setStateAsync({ lotes: [] });
            return;
        }

        if (this.state.filterLote) return;

        try {
            await this.setStateAsync({ filterLote: true });
            let result = await axios.get("/api/lote/listfilter", {
                params: {
                    idProyecto: this.state.idProyecto,
                    filtrar: searchWord,
                },
            });
            await this.setStateAsync({ filterLote: false, lotes: result.data });
        } catch (error) {
            await this.setStateAsync({ filterLote: false, lotes: [] });
        }
    }

    onEventSelectItemLote = async (value) => {
        await this.setStateAsync({
            lote: value.nombreLote,
            lotes: [],
            idLote: value.idLote,
            manzana: value.nombreManzana,
            precioContado: value.precio.toString()
        });
        this.selectItemLote = true;
        this.refPrecioContado.current.focus();
    }
    /** */

    onEventClearInputClient = async () => {
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

        try {
            await this.setStateAsync({ filterCliente: true });
            let result = await axios.get("/api/cliente/listfiltrar", {
                params: {
                    filtrar: searchWord,
                },
            });
            await this.setStateAsync({ filterCliente: false, clientes: result.data });
        } catch (error) {
            await this.setStateAsync({ filterCliente: false, clientes: [] });
        }
    }

    onEventSelectItemClient = async (value) => {
        await this.setStateAsync({
            cliente: value.documento + " - " + value.informacion,
            clientes: [],
            idCliente: value.idCliente
        });
        this.selectItemClient = true;
    }

    itemProducto() {
        return (
            <div className='item-view'>
                <button className='item-view_favorite btn px-1 py-0 position-absolute'>
                    <img src={images.start} alt='Preferido' />
                </button>
                <div className='item-view_describe'>
                    <p className='item-view_describe-title position-absolute'>Inv 100</p>
                    <div className='item-view_describe-image'>
                        <img src={images.sale} alt='Venta' width={96} height={96} />
                    </div>
                </div>
                <span className='lead text-center d-block my-1'><strong>cable usb lg</strong></span>
                <span className='text-center d-block ml-1 mr-1 mt-1 mb-3 text-xl '>S/8.26</span>
            </div>
        );
    }

    itemSelect() {
        return (
            <div className='invoice-item_add-item d-flex position-relative cursor-pointer'>
                <div className='item_container'>
                    <div className='pl-3 py-3 w-100 d-flex flex-column justify-content-center h-100'>
                        <div className='d-flex justify-content-between align-items-center py-1 px-3'>

                            <div className="invoice-item_add-item-options">
                                <span>
                                    <div className=" d-flex justify-content-center align-items-center h-100 invoice-item_add-item-options_button mr-1">
                                        <img src={images.edit} alt='Editar' />
                                    </div>
                                </span>
                                <span>
                                    <div className=" d-flex justify-content-center align-items-center h-100 invoice-item_add-item-options_button">
                                        <img src={images.remove} alt='Eliminar' />
                                    </div>
                                </span>
                            </div>

                            <div className='invoice-item_add-item-describe d-flex flex-column text-break text-truncate text-nowrap'>
                                <div className='invoice-item_add-item-describe-title text-truncate text-base'>
                                    cable usb lg   cable usb lg
                                </div>
                                <div className='invoice-item_add-item-describe-price d-flex text-break text-truncate text-nowrap text-sm'>
                                    S/8.00
                                </div>
                            </div>

                            <div className="invoice-item_add-item-quantity-container d-none d-sm-flex align-items-center justify-content-center">
                                <button className="btn m-0 d-flex justify-content-center align-items-center pointer">
                                    <img src={images.minus} alt='Eliminar' />
                                </button>
                                <div className="item_quantity d-flex justify-content-center align-items-center">1</div>
                                <button className="btn m-0 d-flex justify-content-center align-items-center pointer">
                                    <img src={images.plus} alt='Eliminar' />
                                </button>
                            </div>

                            <div style={{ width: "130px", height: "38px" }}>
                            </div>

                            <div className='item_total'>
                                <div className='h-100 d-flex justify-content-end align-items-start mt-2 text-base'>
                                    S/16.52
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <PosContainerWrapper>
                <section className='invoice-left'>
                    <div className='h-100 d-flex flex-column items'>
                        <div className='d-flex align-items-center justify-content-between p-4'>
                            <div className='w-100 mr-2'>
                                <div className="input-group">
                                    <div className='input-group-prepend'>
                                        <button className="btn btn-success" type="button">
                                            <img src={images.codbar} alt='Códigod de barras' />
                                        </button>
                                        <button className="btn btn-success" type="button">
                                            <img src={images.search} alt='Buscar' />
                                        </button>
                                    </div>
                                    <input type="text" className="form-control border border-success" placeholder="" aria-label="Example text with two button addons" />
                                </div>
                            </div>
                            <button className='btn btn-outline-success d-flex align-items-center justify-content-center' style={{ minWidth: "10rem" }}>
                                <div className='mr-2'>Nuevo producto</div>
                                <img src={images.add} alt='Agregar Producto' />
                            </button>
                        </div>
                        {/* <div className='p-2 w-100 h-100 d-flex d-flex align-items-center justify-content-center' style={{}}>
                            <p>no hay productos que satisfacen la búsqueda</p>
                        </div> */}
                        <div className='overflow-hidden'>
                            <div className='d-flex h-100 align-items-start justify-content-around flex-wrap mh-100 overflow-hidden overflow-y-auto my-2'>
                                {this.itemProducto()}
                                {this.itemProducto()}
                                {this.itemProducto()}
                                {this.itemProducto()}
                                {this.itemProducto()}
                                {this.itemProducto()}
                                {this.itemProducto()}
                                {this.itemProducto()}
                            </div>
                        </div>
                    </div>
                </section>
                <section className='invoice-right'>
                    <div className='invoice-ticket d-flex pl-3 align-items-center justify-content-between'>
                        <div className='py-3'>
                            <p className='h5 m-0'>Boleta de venta</p>
                        </div>
                        <div className="d-flex">
                            <span><button className='btn btn-link rounded-circle'>
                                <img src={images.print} alt='Imprimir' />
                            </button></span>
                            <span><button className='btn btn-link rounded-circle'>
                                <img src={images.cash} alt='Moneda' />
                            </button></span>
                            <span><button className='btn btn-link rounded-circle'>
                                <img src={images.options} alt='Opciones' />
                            </button></span>
                        </div>
                    </div>
                    <div className='invoice-list-prices'>
                        <div className='pt-1 pb-1 d-flex align-items-center'>
                            <div className='col-6 pl-3'>
                                <p className=''>Lista de precio</p>
                                <select className='form-control'>
                                    <option>- Precios -</option>
                                </select>
                            </div>
                            <div className='col-6'>
                                <p className=''>Lista de precio</p>
                                <select className='form-control'>
                                    <option>- Comprobantes -</option>
                                </select>
                            </div>
                        </div>
                        <div className='py-3 w-100 d-flex align-items-center'>
                            <p className='m-auto pl-3 pr-2'>Cliente:</p>
                            <select className='form-control pl-2'>
                                <option>- Clientes -</option>
                            </select>
                            <button className='btn btn-outline-success d-flex ml-3 mr-3'>
                                <img src={images.addclient} alt='Nuevo cliente' />
                                <div className='ml-2'>Nuevo</div>
                            </button>
                        </div>
                        {/* <div className='py-1 pb-3 w-100 d-flex align-items-center'>
                            <p className='m-auto pl-2 pr-2'></p>
                            <select className='form-control pl-2'>
                                <option>- Buscar Item -</option>
                            </select>
                            <button className='btn btn-success d-flex ml-3 mr-3' style={{ width: "150px" }}>
                                <div className='w-100 text-center'>Nuevo Item</div>
                            </button>
                        </div> */}
                    </div>
                    <div className='invoice-item'>
                        <div className='h-100'>
                            {/* <div className='invoice-item_no-items p-2 h-100 w-100 d-flex flex-column align-items-center justify-content-center'>
                                <img className='mb-1' src={images.basket} alt='Canasta' />
                                <div className="w-50">
                                    <span>Aquí verás los productos que elijas en tu próxima venta</span>
                                </div>
                            </div> */}


                            {this.itemSelect()}
                            {this.itemSelect()}
                            {this.itemSelect()}
                            {this.itemSelect()}

                        </div>
                    </div>
                    <div className='invoice-detail'>
                        <div className='sub-total-content px-3 mb-2'>
                            <div className='d-flex align-items-center justify-content-between py-2'>
                                <div>Sub Total</div>
                                <div>S/ 0.00</div>
                            </div>
                            <div className='d-flex align-items-center justify-content-between py-2'>
                                <div>IGV (18%)</div>
                                <div>S/ 0.00</div>
                            </div>
                        </div>
                        <div className='px-3 mb-2'>
                            <div>
                                <div>
                                    <button className='btn btn-success btn-lg w-100 d-flex align-items-center justify-content-between'>
                                        <div>Vender</div>
                                        <div>S/ 23.60</div>
                                    </button>
                                </div>
                                <div>
                                    <button className='btn btn-link w-100 d-flex align-items-center justify-content-between px-0'>
                                        <div className='text-dark'>1 Producto</div>
                                        <div className='text-success'>Cancelar</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </PosContainerWrapper>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

export default connect(mapStateToProps, null)(VentaProceso);