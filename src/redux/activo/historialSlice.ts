import { createSlice } from "@reduxjs/toolkit";
import { closeProject, signOut } from "../principalSlice";
import { ProductFilterInterface } from "@/model/ts/interface/product";
import { WarehouseOptionsInterface } from "@/model/ts/interface/warehouse";
import { KardexListDepreciacionInterface } from "@/model/ts/interface/kardex";

interface DepreciationState {
    loading: boolean;
    msgLoading: string;

    producto: ProductFilterInterface;
    productos: ProductFilterInterface[];

    idAlmacen: string;
    almacenes: WarehouseOptionsInterface[];

    buscar: string;
    lista: KardexListDepreciacionInterface[];
    paginacion: number;
    totalPaginacion: number;
    filasPorPagina: number;
    restart: boolean;
    paginacionState: {
        upperPageBound: number;
        lowerPageBound: number;
        isPrevBtnActive: string;
        isNextBtnActive: string;
        pageBound: number;
        paginationMessage: string;
    };
}

const initialState: DepreciationState = {
    loading: false,
    msgLoading: "Cargando información...",

    producto: null,
    productos: [],

    idAlmacen: "",
    almacenes: [],

    buscar: "",
    lista: [],
    paginacion: 1,
    totalPaginacion: 0,
    filasPorPagina: 3,
    restart: false,
    paginacionState: {
        upperPageBound: 3,
        lowerPageBound: 0,
        isPrevBtnActive: "disabled",
        isNextBtnActive: "",
        pageBound: 3,
        paginationMessage: "Mostrando 0 de 0 Páginas"
    }
};

const depreciationSlice = createSlice({
    name: "ACTIVO HISTORIAL",
    initialState,
    reducers: {
        setHistorialState: (state, action) => (
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
    setHistorialState,
} = depreciationSlice.actions;

export default depreciationSlice.reducer;