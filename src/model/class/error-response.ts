import { RESPOSE, REQUEST, ERROR, CANCELED } from '@/constants/requestStatus';

interface HttpErrorResponse {
  response?: {
    data: any;
    status: number;
  };
  request?: any;
  message?: string;
  code?: string;
  name?: string;
}

class ErrorResponse {
  type: string = "";
  message: string = "";
  body: string | Array<any> = "";
  status: number = 400;

  constructor(error: HttpErrorResponse) {
    this.init(error);
  }

  private init(error: HttpErrorResponse): void {
    // 1️⃣ CANCELACIÓN (Axios / Fetch)
    if (
      error?.code === 'ERR_CANCELED' ||
      error?.name === 'CanceledError' ||
      error?.name === 'AbortError'
    ) {
      this.type = CANCELED;
      this.message = "Se canceló la solicitud al servidor.";
      return;
    }

    // 2️⃣ RESPONSE
    if (error.response && error.response.data instanceof Blob) {
      const reader = new FileReader();
      reader.onload = () => {
        this.type = RESPOSE;
        this.status = error.response!.status;
        this.message = reader.result as string;
        this.body = (error.response!.data as any).body || "";
      };
      reader.readAsText(error.response.data);
      return;
    }

    if (error.response) {
      this.type = RESPOSE;
      this.status = error.response.status;
      this.message =
        error.response.data?.message ?? String(error.response.data);
      this.body = error.response.data?.body ?? "";
      return;
    }

    // 3️⃣ REQUEST
    if (error.request) {
      this.type = REQUEST;
      this.message = "No se pudo obtener la respuesta del servidor.";
      return;
    }

    // 4️⃣ ERROR GENERAL
    this.type = ERROR;
    this.message =
      error.message || "Algo salió mal, intente en un par de minutos.";
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

  getBody(): string | Array<any> {
    return this.body;
  }
}

export default ErrorResponse;
