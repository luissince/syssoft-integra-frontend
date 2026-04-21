import { createSlice } from "@reduxjs/toolkit";
import { closeProject, signOut } from "../principalSlice";

interface TransaccionState {
    didMount: boolean;

    initialLoad: boolean;
    initialMessage: string;

    fechaInicio: string;
    fechaFinal: string;
    idTipoConcepto: string;
    idSucursal: string;
    idUsuario: string;

    usuarios: any[];
    sucursales: any[];

    loading: boolean;
    msgLoading: string;

    opcion: number;
    buscar: string;
    lista: any[];
    paginacion: number;
    totalPaginacion: number;
    filasPorPagina: number;
    restart: boolean;
    messageTable: string;
    paginacionState: {
        upperPageBound: number;
        lowerPageBound: number;
        isPrevBtnActive: string;
        isNextBtnActive: string;
        pageBound: number;
        paginationMessage: string;
    };

    vista: string;
}

const initialState: TransaccionState = {
    didMount: false,

    initialLoad: true,
    initialMessage: "Cargando datos...",

    fechaInicio: "",
    fechaFinal: "",
    idTipoConcepto: "",
    idSucursal: "",
    idUsuario: "",

    usuarios: [],
    sucursales: [],

    loading: false,
    msgLoading: "Cargando información...",

    opcion: 0,
    buscar: "",
    lista: [],
    paginacion: 1,
    totalPaginacion: 0,
    filasPorPagina: 10,
    restart: false,
    messageTable: "Cargando información...",
    paginacionState: {
        upperPageBound: 3,
        lowerPageBound: 0,
        isPrevBtnActive: "disabled",
        isNextBtnActive: "",
        pageBound: 3,
        paginationMessage: "Mostrando 0 de 0 Páginas"
    },

    vista: "tabla",
};

const finanzaTransaccionSlice = createSlice({
    name: "FINANZAS TRANSACCION",
    initialState,
    reducers: {
        setFinanzaTransaccionState: (state, action) => (
            Object.assign(state, action.payload)
        ),
    },
    extraReducers: (builder) => {
        builder
            .addCase(signOut, () => initialState)
            .addCase(closeProject, () => initialState);
    },
});

export const {
    setFinanzaTransaccionState,
} = finanzaTransaccionSlice.actions;

export default finanzaTransaccionSlice.reducer;