import Joi from "joi";
import constants from "../../helpers/constants";
import commonValidator from "../../helpers/validators/commonValidator";

export default {
  playerStatistics: Joi.object({
    body : Joi.object({
        key: commonValidator.validMongoId.required(),
        imageUrl : Joi.string(),
        name : commonValidator.normalStr.required(),
    }).unknown()
  }),
  list : Joi.object({
    params: Joi.object({
        id: commonValidator.validMongoId.required(),
    })
  })
};
