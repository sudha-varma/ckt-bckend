import Joi from "joi";
import commonValidator from "../../helpers/validators/commonValidator";

export default {
  searchName: Joi.object({
    query: Joi.object({
      name: Joi.string(),
    }),
  }),
  // GET /api/article
  list: Joi.object({
    query: Joi.object({
      limit: Joi.number().integer(),
      skip: Joi.number().integer(),
    }),
  }),
  // POST /api/tag
  create: Joi.object({
    body: Joi.object({
      name: commonValidator.normalStr.required(),
    }),
  }),
};
