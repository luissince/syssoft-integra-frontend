import React from 'react';
import axios from 'axios';
import {
    formatMoney,
    numberFormat,
    calculateTaxBruto,
    calculateTax,
    keyNumberInteger,
    keyNumberFloat,
    getCurrentMonth,
    getCurrentYear,
    monthName,
    isNumeric,
    showModal,
    hideModal,
    viewModal,
    currentDate,
    validateDate,
    clearModal,
    spinnerLoading,
    ModalAlertDialog,
    ModalAlertInfo,
    ModalAlertSuccess,
    ModalAlertWarning,
} from '../../../helper/Tools';
import { connect } from 'react-redux';
import { apiComprobanteListcombo } from '../../../network/api';
import SearchBarClient from "../../../helper/SearchBarClient";
import SearchBarLote from "../../../helper/SearchBarLote";
import { PosContainerWrapper } from '../../container';

import sale from '../../../recursos/images/sale.svg';
import start from '../../../recursos/images/start.svg';
import codbar from '../../../recursos/images/codbar.svg';
import search from '../../../recursos/images/search.svg';
import add from '../../../recursos/images/add.svg';
import print from '../../../recursos/images/print.svg';
import cash from '../../../recursos/images/cash.svg';
import options from '../../../recursos/images/options.svg';
import addclient from '../../../recursos/images/addclient.svg';
import basket from '../../../recursos/images/basket.svg';


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
            <div style={{ flex: "0 0 22rem", cursor: "pointer", maxWidth: "16rem", borderRadius: "8px", margin: "0 2rem 2rem", boxShadow: "1px 2px 5px rgba(0,0,0,.1)", position: "relative", backgroundColor: "white", display: "flex", flexDirection: "column" }}>
                <button className='btn px-1 py-0 position-absolute' style={{
                    right: "1rem",
                    top: -"2px",
                    outline: "none",
                    boxShadow: "none",
                    height: "36px",
                    width: "36px",
                    zIndex: "1",
                    background: "#00b19d",
                    borderRadius: "0 0 8px 8px",
                    boxShadow: "1px 2px 5px rgba(0,0,0,.1)"
                }}>
                    <img src={start} />
                </button>
                <div style={{ flex: "0 0 12rem", width: "100%", borderRadius: "8px", position: "relative", overflow: "hidden" }}>
                    <p className='position-absolute' style={{
                        color: "#00b19d",
                        background: "#fafafa",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        marginLeft: "auto",
                        marginRight: "auto",
                        fontSize: "12px",
                        padding: "0 0.5rem",
                        borderRadius: "8px",
                        width: "-webkit-fit-content",
                        width: "-moz-fit-content",
                        width: "fit-content",
                        maxWidth: "100%",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        boxShadow: " 0 0 2px rgba(0,0,0,.1)"
                    }}>Inv 100</p>
                    <div style={{ top: "0", height: "100%", width: "100%", position: "absolute", alignItems: "center", justifyContent: "center", display: "flex" }}>
                        <img src={sale} width={96} height={96} />
                    </div>
                </div>
                <span className='lead text-center d-block my-1'><strong>cable usb lg</strong></span>
                <span className='text-center d-block ml-1 mr-1 mt-1 mb-3 text-xl '>S/8.26</span>
            </div>
        );
    }

    render() {
        return (
            <PosContainerWrapper>
                <section style={{ flex: "1 1 100%", position: "relative" }}>
                    <div className='h-100 d-flex flex-column' style={{ backgroundColor: "#f1f5f9" }}>
                        <div className='d-flex align-items-center  justify-content-between' style={{ padding: "1.5rem" }}>
                            <div className='w-100 mr-2'>
                                <div className="input-group">
                                    <div className='input-group-prepend'>
                                        <button className="btn btn-success" type="button">
                                            <img src={codbar} />
                                        </button>
                                        <button className="btn btn-success" type="button">
                                            <img src={search} />
                                        </button>
                                    </div>
                                    <input type="text" className="form-control border border-success" placeholder="" aria-label="Example text with two button addons" />
                                </div>
                            </div>
                            <button className='btn btn-outline-success d-flex align-items-center justify-content-center' style={{ minWidth: "10rem" }}>
                                <div className='mr-2'>Nuevo producto</div>
                                <img src={add} />
                            </button>
                        </div>
                        <div className='p-2 w-100 h-100 d-flex d-flex align-items-center justify-content-center' style={{}}>
                            <p>no hay productos que satisfacen la búsqueda</p>
                        </div>
                        {/* <div style={{ overflow: "hidden" }}>
                            <div style={{ height: "100%", maxHeight: "100%", marginTop: "12px", overflow: "hidden", overflowY: "auto", display: "flex", flexWrap: "wrap", alignContent: "flex-start", justifyContent: "space-around" }}>
                                {this.itemProducto()}
                                {this.itemProducto()}
                                {this.itemProducto()}
                                {this.itemProducto()}
                                {this.itemProducto()}
                                {this.itemProducto()}
                                {this.itemProducto()}
                                {this.itemProducto()}
                            </div>
                        </div> */}
                    </div>
                </section>
                <section style={{ flex: "0 0 40%", display: "flex", flexDirection: "column", width: "550px", maxWidth: "550px", backgroundColor: "white", borderLeft: "1px solid #cbd5e1", position: "relative" }}>
                    <div className='d-flex pl-3 align-items-center justify-content-between' style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <div className='py-3'>
                            <p className='h5 m-0'>Boleta de venta</p>
                        </div>
                        <div className="d-flex">
                            <span><button className='btn btn-link rounded-circle'>
                                <img src={print} />
                            </button></span>
                            <span><button className='btn btn-link rounded-circle'>
                                <img src={cash} />
                            </button></span>
                            <span><button className='btn btn-link rounded-circle'>
                                <img src={options} />
                            </button></span>
                        </div>
                    </div>
                    <div style={{ borderBottom: "1px solid #e2e8f0" }}>
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
                        <div className='py-3 w-100 d-flex align-items-center' style={{}}>
                            <p className='m-auto pl-3 pr-2'>Cliente:</p>
                            <select className='form-control pl-2'>
                                <option>- Clientes -</option>
                            </select>
                            <button className='btn btn-outline-success d-flex ml-3 mr-3'>
                                <img src={addclient} />
                                <div className='ml-2'>Nuevo</div>
                            </button>
                        </div>
                    </div>
                    <div style={{ height: "100%", overflow: "auto", backgroundColor: "#f8fafc" }}>
                        <div className='h-100'>
                            <div className='p-2 h-100 w-100 d-flex flex-column align-items-center justify-content-center' style={{ backgroundColor: "#f8fafc", color: "#6c757d!important", textAlign: "center", }}>
                                <img src={basket} />
                                <div className="w-50">
                                    <span style={{ color: "#64748b" }}>Aquí verás los productos que elijas en tu próxima venta</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ borderTop: "1px solid #e1e7ee", backgroundColor: "#fff", filter: "drop-shadow(0 -4px 20px rgba(199,203,207,.5))", WebkitFilter: "drop-shadow(0 -4px 20px rgba(199,203,207,.5))", WebkitAnimation: "fadeIn .2s ease" }}>
                        <div className='px-3 mb-2' style={{ backgroundColor: "#f8fafc", color: "#8996a7", marginBottom: "1.5rem" }}>
                            <div className='d-flex align-items-center justify-content-between py-2' style={{ borderBottom: "1px dashed #ccc", color: "#474747" }}>
                                <div>Sub Total</div>
                                <div>S/ 0.00</div>
                            </div>
                            <div className='d-flex align-items-center justify-content-between py-2' style={{ color: "#474747" }}>
                                <div>IGV (18%)</div>
                                <div>S/ 0.00</div>
                            </div>
                        </div>
                        <div className='px-3 mb-2'>
                            <div>
                                <div>
                                    <button className='btn btn-success btn-lg w-100 d-flex align-items-center  justify-content-between'>
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