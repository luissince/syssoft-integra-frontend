import SuccessReponse from "../../model/class/response";
import ErrorResponse from "./error-response";

class Resolve {
  static async create(value) {
    try {
      const response = await value;
      return new SuccessReponse(response);
    } catch (ex) {
      return new ErrorResponse(ex);
    }
  }
}

export default Resolve;
