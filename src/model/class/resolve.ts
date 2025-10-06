import ErrorResponse from './error-response';
import SuccessResponse from './response';

interface HttpResponse<T = any> {
  data: T;
  headers?: Record<string, any>;
  status?: number;
  statusText?: string;
}

class Resolve {
  static async create<T = any>(value: Promise<HttpResponse<T>>): Promise<SuccessResponse<T> | ErrorResponse> {
    try {
      const response = await value;
      return new SuccessResponse<T>(response);
    } catch (ex) {
      return new ErrorResponse(ex as any);
    }
  }
}

export default Resolve;