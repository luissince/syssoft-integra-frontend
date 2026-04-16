import { createSlice } from "@reduxjs/toolkit";
import { closeProject, signOut } from "../principalSlice";
import { WarehouseOptionsInterface } from "@/model/ts/interface/warehouse";
import { currentDate } from "@/helper/utils.helper";
import { AssetListInterface, AssetMetricsInterface } from "@/model/ts/interface/asset";

interface BienState {
    didMount: boolean;

    loading: boolean;
    msgLoading: string;

    fechaInicio: string;
    fechaFinal: string;

    idAlmacen: string;
    almacenes: WarehouseOptionsInterface[];

    opcion: number;
    buscar: string;
    lista: AssetListInterface[];
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

    metricas: AssetMetricsInterface;
    isOpenStock: boolean,
    vista: string;
    inventarioDetallesVisible: any;
}

const initialState: BienState = {
    didMount: false,

    loading: false,
    msgLoading: "Cargando información...",

    fechaInicio: currentDate(),
    fechaFinal: currentDate(),

    idAlmacen: "",
    almacenes: [],

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

    metricas: {
        totalCost: 0,
        totalDepreciation: 0,
        totalAssets: 0,
        totalBookValue: 0,
    },
    isOpenStock: false,
    vista: "tabla",
    inventarioDetallesVisible: {},
};

const activoBienSlice = createSlice({
    name: "ACTIVO BIEN",
    initialState,
    reducers: {
        setActivoBienState: (state, action) => (
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
    setActivoBienState,
} = activoBienSlice.actions;

export default activoBienSlice.reducer;