import messages from "../localization/en";
import util from "./util";

const controlHandler = (promise, params) => async (req, res, next) => {
  const boundParams = params ? params(req, res, next) : [];
  try {
    const result = await promise(...boundParams);
    if (result) {
      // Preparing host url in get call
      if (req.method === "GET") {
        result.host = `${req.protocol}://${req.get("host")}/`;
      }
      if (result.cookie) {
        res.cookie("x-access-token", result.cookie);
        delete result.cookie;
      }
      return res.status(result.status || 200).json(result);
    }
    return res
      .status(500)
      .json({ status: 500, message: messages.UNKNOWN_ERROR });
  } catch (error) {
    if (error.isJoi && error.name === "ValidationError") {
      return res.status(400).json(util.FormatJOIError(error));
    }
    if (error.status < 500) {
      return res.status(error.status || 400).json(error);
    }
    return next(error);
  }
};

const c = controlHandler;
export default c;
