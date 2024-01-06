import { RESPOSE, REQUEST, ERROR, CANCELED } from '../types/types';

class ErrorResponse {
  type = '';
  message = '';
  body = '';
  status = 400;

  constructor(error) {
    if (error.response) {
      this.type = RESPOSE;
      this.status = error.response.status;
      this.message = error.response.data.message || error.response.data;
      this.body = error.response.data.body || '';
    } else if (error.request) {
      this.type = REQUEST;
      this.message = 'No se pudo obtener la respuesta del servidor.';
    } else {
      if (error.message === 'canceled') {
        this.type = CANCELED;
        this.message = 'Se canceló la solicitud la servidor';
      } else {
        this.type = ERROR;
        this.message = error.message
          ? error.message
          : 'Algo salió mal, intente en un par de minutos.';
      }
    }
    // console.log(error.response)
  }

  getMessage() {
    return this.message;
  }

  getType() {
    return this.type;
  }

  getStatus() {
    return this.status;
  }

  getBody() {
    return this.body;
  }
}

export default ErrorResponse;
