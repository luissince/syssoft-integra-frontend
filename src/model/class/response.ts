class SuccessResponse<T = any> {
  data: T;
  headers: Record<string, any>;
  status: number;
  statusText: string;

  constructor(response: {
    data: T;
    headers?: Record<string, any>;
    status?: number;
    statusText?: string;
  }) {
    this.data = response.data;
    this.headers = response.headers ?? {};
    this.status = response.status ?? 200;
    this.statusText = response.statusText ?? 'Ok';
  }

  getData(): T {
    return this.data;
  }

  getHeaders(): Record<string, any> {
    return this.headers;
  }

  getStatus(): number {
    return this.status;
  }
}

export default SuccessResponse;
