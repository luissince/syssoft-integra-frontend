import axios from 'axios';
import AxiosException from '../exception';
import Response from './response';

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
 * @returns Response | Object
 */
export async function liberarTerreno(params, signal = null) {
    try {
        const response = await instance.post("/api/lote/liberar",
            params, {
            signal: signal
        }
        );
        return new Response(response);
    } catch (ex) {
        return {
            "type": AxiosException.fromAxiosError(ex).getType(),
            "status": AxiosException.fromAxiosError(ex).getStatus(),
            "message": AxiosException.fromAxiosError(ex).getMessage(),
        }
    }
}

/**
 * @method GET
 * @param {AbortController} signal 
 * @returns Response | Object
 */
export async function listarComboCliente(signal = null) {
    try {
        const response = await instance.get("/api/cliente/listcombo", {
            signal: signal,
        });
        return new Response(response);
    } catch (ex) {
        return {
            "type": AxiosException.fromAxiosError(ex).getType(),
            "status": AxiosException.fromAxiosError(ex).getStatus(),
            "message": AxiosException.fromAxiosError(ex).getMessage()
        }
    }
}

/**
 * @method GET
 * @param {{}} params 
 * @param {AbortController} signal 
 * @returns Response | Object
 */
export async function loteDetalle(params, signal = null) {
    try {
        const response = await instance.get("/api/lote/detalle", {
            signal: signal,
            params: params
        });
        return new Response(response);
    } catch (ex) {
        return {
            "type": AxiosException.fromAxiosError(ex).getType(),
            "status": AxiosException.fromAxiosError(ex).getStatus(),
            "message": AxiosException.fromAxiosError(ex).getMessage()
        }
    }
}

/**
 * @method POST
 * @param {{}} params 
 * @returns Response | Object
 */
export async function loteSocio(params) {
    try {
        const response = await instance.post("/api/lote/socio", params);
        return new Response(response);
    } catch (ex) {
        return {
            "type": AxiosException.fromAxiosError(ex).getType(),
            "status": AxiosException.fromAxiosError(ex).getStatus(),
            "message": AxiosException.fromAxiosError(ex).getMessage()
        }
    }
}

/**
 * @method POST
 * @param {{}} params 
 * @returns Response | Object
 */
export async function loteRestablecer(params) {
    try {
        const response = await instance.post("/api/lote/restablecer", params);
        return new Response(response);
    } catch (ex) {
        return {
            "type": AxiosException.fromAxiosError(ex).getType(),
            "status": AxiosException.fromAxiosError(ex).getStatus(),
            "message": AxiosException.fromAxiosError(ex).getMessage()
        }
    }
}