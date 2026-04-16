import { createSlice } from "@reduxjs/toolkit";
import { closeProject, signOut } from "../principalSlice";
import { BankListInterface } from "@/model/ts/interface/bank";

interface BancoState {
    didMount: boolean;

    loading: boolean;
    msgLoading: string;

    opcion: number;
    buscar: string;
    lista: BankListInterface[];
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

const initialState: BancoState = {
    didMount: false,
    
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

const finanzasBancoSlice = createSlice({
    name: "FINANZAS BANCO",
    initialState,
    reducers: {
        setFinanzasBancoState: (state, action) => (
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
    setFinanzasBancoState,
} = finanzasBancoSlice.actions;

export default finanzasBancoSlice.reducer;