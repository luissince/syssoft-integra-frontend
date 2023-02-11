import { RESPOSE, REQUEST, ERROR, CANCELED } from './types';

class AxiosException {

    static type = '';
    static message = '';
    static status = 400;

    static fromAxiosError(error) {
        if (error.response) {
            this.type = RESPOSE;
            this.status = error.response.status;
            this.message = error.response.data;
        } else if (error.request) {
            this.type = REQUEST;
            this.message = "No se pudo obtener la respuesta del servidor.";
        } else {
            if (error.message === "canceled") {
                this.type = CANCELED;
                this.message = "Se canceló la solicitud la servidor";
            } else {
                this.type = ERROR;
                this.message = error.message ? error.message : "Algo salió mal, intente en un par de minutos.";
            }
        }
        return AxiosException;
    }

    static getMessage() {
        return this.message;
    }

    static getType() {
        return this.type;
    }

    static getStatus() {
        return this.status;
    }
}

export default AxiosException;