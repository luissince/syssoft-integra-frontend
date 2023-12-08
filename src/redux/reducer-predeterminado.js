import {
    MONEDA_NACIONAL,
    FAVORITE_PRODUCTS,
    STAR_PRODUCT
} from './types';

const initialState = {
    moneda: null,
    products: [],
}

const predeterminadoReducer = (state = initialState, action) => {
    switch (action.type) {
        case MONEDA_NACIONAL:
            return {
                ...state,
                moneda: action.moneda
            }
        case FAVORITE_PRODUCTS:
            return {
                ...state,
                products: action.productos
            }
        case STAR_PRODUCT:
            return {
                ...state,
                products: action.productos
            }
        default: return state;
    }
}

export default predeterminadoReducer;