import axios from 'axios';
import SuccessReponse from './response';
import ErrorResponse from '../exception/error';

const instance = axios.create({
    baseURL: process.env.REACT_APP_END_POINT,
    timeout: 10000,
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
});

instance.interceptors.request.use((config) => {
    const data = JSON.parse(window.localStorage.getItem('login'));
    if (data !== null) {       
        config.headers.Authorization = 'Bearer ' + data.token;
    }
    return config;
});

/**
 * @method POST
 * @param {{}} params 
 * @param {AbortController} signal 
 * @returns SuccessReponse | Object
 */
export async function liberarTerreno(params, signal = null) {
    try {
        const response = await instance.post("/api/lote/liberar",
            params, {
            signal: signal
        }
        );
        return new SuccessReponse(response);
    } catch (ex) {
        return new SuccessReponse(ex);
    }
}

/**
 * @method GET
 * @param {AbortController} signal 
 * @returns SuccessReponse | Object
 */
export async function listarComboCliente(signal = null) {
    try {
        const response = await instance.get("/api/cliente/listcombo", {
            signal: signal,
        });
        return new SuccessReponse(response);
    } catch (ex) {
        return new ErrorResponse(ex);
    }
}

/**
 * @method GET
 * @param {{}} params 
 * @param {AbortController} signal 
 * @returns SuccessReponse | Object
 */
export async function loteDetalle(params, signal = null) {
    try {
        const response = await instance.get("/api/lote/detalle", {
            signal: signal,
            params: params
        });
        return new SuccessReponse(response);
    } catch (ex) {
        return new ErrorResponse(ex);
    }
}

/**
 * @method POST
 * @param {{}} params 
 * @returns SuccessReponse | Object
 */
export async function loteSocio(params) {
    try {
        const response = await instance.post("/api/lote/socio", params);
        return new SuccessReponse(response);
    } catch (ex) {
        return new ErrorResponse(ex);
    }
}

/**
 * @method POST
 * @param {{}} params 
 * @returns SuccessReponse | Object
 */
export async function loteRestablecer(params) {
    try {
        const response = await instance.post("/api/lote/restablecer", params);
        return new SuccessReponse(response);
    } catch (ex) {
        return new ErrorResponse(ex);
    }
}


/**
 * @method GET
 * @param {{}} SuccessReponse 
 * @returns SuccesReponse | Object
 */
export async function empresaConfig() {
    try {
        const response = await instance.get("/api/empresa/config");
        return new SuccessReponse(response);
    } catch (ex) {
        return new ErrorResponse(ex);
    }
}

/**
 * @method GET
 * @param {{}} SuccessReponse 
 * @returns SuccesReponse | Object
 */
export async function validToken() {
    try {
        const response = await instance.get("/api/login/validtoken");
        return new SuccessReponse(response);
    } catch (ex) {
        return new ErrorResponse(ex);
    }
}