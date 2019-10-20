import User from "./model";
import validator from "./validator";
import util from "../../../utils/util";
import messages from "../../../localization/en";
import service from "./service";

/**
 * Get contained user using there credentials.
 * @returns {User}
 */
async function loginUser(body) {
  // Validating body
  const validData = await validator.loginUser.validate({ body });

  const userData = validData.body;

  // Getting user details
  const loginData = await service.userLogin({
    email: userData.email,
    password: userData.password,
  });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(loginData);

  return loginData;
}

/**
 * Create new user
 * @property {string} req.body.email - The email of the user.
 * @property {string} req.body.password - The password of the user.
 * @returns {User}
 */
async function create(body) {
  // Validating body
  const validData = await validator.create.validate({ body });

  const userData = validData.body;

  // Getting user by email
  const existingDoc = await service.findByEmail({ email: userData.email });

  if (existingDoc !== null) {
    return {
      status: 409,
      data: existingDoc,
      message: messages.ALREADY_EXIST,
    };
  }
  const salt = util.generateSalt();
  const pwd = userData.password;
  const password = util.hashPassword(pwd, salt);
  userData.salt = salt;
  userData.password = password;

  // creating new user
  const user = await service.create({ data: userData });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(user);

  return user;
}

/**
 * Logouts user
 * @returns msg
 */
function userLogout(req, res) {
  res.cookie("x-access-token", "deleted", {
    expires: new Date(Date.now()),
  });
  res.clearCookie();
  return res.status(201).json({
    status: 201,
    data: null,
    msg: "Account has been logged out successfully",
  });
}

/**
 * Get user list.
 * @property {number} query.skip - Number of article to be skipped.
 * @property {number} query.limit - Limit number of article to be returned.
 * @returns {User[]}
 */

async function list(query) {
  // Validating query
  const validQuery = await validator.list.validate({ query });

  // Getting article list with filters
  const docs = await service.find({ query: validQuery.query });
  return docs;
}

export default {
  loginUser,
  create,
  userLogout,
  list,
};
