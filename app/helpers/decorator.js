import helper from "./helper";
import User from "../api/user/model";
import service from "../api/user/service";

export const isLoggedUser = () => async (req, res, next) => {
  const token = req.cookies["x-access-token"];
  if (!token) {
    res.status(403).json({ status: 404, message: "Token doesn't exist" });
  }
  const { err, decodedData } = helper.verifyAccessToken(token);
  const userData = await service.findByEmail({
    id: decodedData.id,
    email: decodedData.email,
  });
  if (userData != null) {
    req.user = decodedData;
    next();
  } else {
    res.status(403).json({
      status: 403,
      message: "User doesn't exist",
    });
  }
};
