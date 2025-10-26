import { RESPOSE, REQUEST, ERROR, CANCELED } from '../types/types';

interface HttpErrorResponse {
  response?: {
    data: any;
    status: number;
  };
  request?: any;
  message?: string;
}

class ErrorResponse {
  type: string = '';
  message: string = '';
  body: string = '';
  status: number = 400;

  constructor(error: HttpErrorResponse) {
    this.init(error);
  }

  private init(error: HttpErrorResponse): void {
    if (error.response && error.response.data instanceof Blob) {
      const reader = new FileReader();
      reader.onload = () => {
        this.type = RESPOSE;
        this.status = error.response!.status;
        this.message = reader.result as string;
        this.body = (error.response!.data as any).body || '';
      };
      reader.readAsText(error.response.data);
    } else if (error.response) {
      this.type = RESPOSE;
      this.status = error.response.status;
      this.message =
        error.response.data?.message ?? String(error.response.data);
      this.body = error.response.data?.body ?? '';
    } else if (error.request) {
      this.type = REQUEST;
      this.message = 'No se pudo obtener la respuesta del servidor.';
    } else {
      if (error.message === 'canceled') {
        this.type = CANCELED;
        this.message = 'Se canceló la solicitud al servidor.';
      } else {
        this.type = ERROR;
        this.message =
          error.message ||
          'Algo salió mal, intente en un par de minutos.';
      }
    }
  }

  getMessage(): string {
    return this.message;
  }

  getType(): string {
    return this.type;
  }

  getStatus(): number {
    return this.status;
  }

  getBody(): string {
    return this.body;
  }
}

export default ErrorResponse;
