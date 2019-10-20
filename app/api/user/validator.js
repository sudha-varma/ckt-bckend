import Joi from "joi";

export default {
  loginUser: Joi.object({
    body: Joi.object({
      email: Joi.string().email({ minDomainAtoms: 2 }),
      password: Joi.string(),
    }),
  }),
  create: Joi.object({
    body: Joi.object({
      email: Joi.string().email({ minDomainAtoms: 2 }),
      password: Joi.string(),
    }),
  }),
  list: Joi.object({
    query: Joi.object({
      limit: Joi.number().integer(),
      skip: Joi.number().integer(),
    }),
  }),
};
