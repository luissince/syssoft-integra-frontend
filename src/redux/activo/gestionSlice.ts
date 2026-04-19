import { createSlice } from "@reduxjs/toolkit";
import { closeProject, signOut } from "../principalSlice";

interface GestionState {
    loading: boolean;
    msgLoading: string;

    opcion: number;
    buscar: string;
    lista: any[];
    paginacion: number;
    totalPaginacion: number;
    filasPorPagina: number;
    restart: boolean;
    messageTable: string,
    paginacionState: {
        upperPageBound: number;
        lowerPageBound: number;
        isPrevBtnActive: string;
        isNextBtnActive: string;
        pageBound: number;
        paginationMessage: string;
    };

    vista: string;
    gestionDetallesVisible: any;
}

const initialState: GestionState = {
    loading: false,
    msgLoading: "Cargando información...",

    opcion: 0,
    buscar: "",
    lista: [],
    paginacion: 1,
    totalPaginacion: 0,
    filasPorPagina: 3,
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
    gestionDetallesVisible: false,
};

const gestionSlice = createSlice({
    name: "ACTIVO GESTION",
    initialState,
    reducers: {
        setGestionState: (state, action) => (
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
    setGestionState,
} = gestionSlice.actions;

export default gestionSlice.reducer;