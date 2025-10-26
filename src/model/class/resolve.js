import ErrorResponse from "./error-response";
import SuccessResponse from "./response";

class Resolve {
  static async create(value) {
    try {
      const response = await value;
      return new SuccessResponse(response);
    } catch (ex) {
      return new ErrorResponse(ex);
    }
  }
}

export default Resolve;
