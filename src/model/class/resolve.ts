import ErrorResponse from './error-response';
import SuccessResponse from './response';

interface HttpResponse<T = any> {
  data: T;
  headers?: Record<string, any>;
  status?: number;
  statusText?: string;
}

export interface ResolveResponse<T = any> {
  success: boolean;
  data?: T;
  type?: string;
  message?: string;
  status?: number;
}

class Resolve {

  private static async resolveRaw<T>(value: Promise<HttpResponse<T>>) {
    try {
      const response = await value;
      return new SuccessResponse<T>(response);
    } catch (err) {
      return new ErrorResponse(err as any);
    }
  }

  static async resolve<T = any>(value: Promise<HttpResponse<T>>) {
    return await this.resolveRaw(value);
  }

  static async safe<T = any>(value: Promise<HttpResponse<T>>): Promise<ResolveResponse<T>> {
    const result = await this.resolveRaw(value);

    if (result instanceof SuccessResponse) {
      return {
        success: true,
        data: result.getData(),
        status: result.getStatus(),
      };
    }

    return {
      success: false,
      type: result.getType(),
      message: result.getMessage(),
      status: result.getStatus(),
    };
  }
}

export default Resolve;
