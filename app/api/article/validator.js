import Joi from "joi";
import constants from "../../helpers/constants";
import commonValidator from "../../helpers/validators/commonValidator";

export default {
  // GET /api/article/:id
  get: Joi.object({
    params: Joi.object({
      id: commonValidator.validMongoId.required(),
    }),
  }),

  // GET /api/article
  list: Joi.object({
    query: Joi.object({
      sortBy: Joi.array().items(
        Joi.any().valid(
          constants.sortByKeys.concat(
            "featured",
            "-featured",
            "publishedAt",
            "-publishedAt",
          ),
        ),
      ),
      filters: Joi.array().items(
        Joi.any()
          .valid(constants.articleFilterTypes)
          .required(),
      ),
      approvalStatus: Joi.array().items(
        Joi.any()
          .valid(constants.approvalStatusTypes)
          .required(),
      ),
      types: Joi.array().items(
        Joi.any()
          .valid(constants.articleTypes)
          .required(),
      ),
      isDraft: Joi.boolean(),
      limit: Joi.number().integer(),
      skip: Joi.number().integer(),
    }),
  }),

  // POST /api/article
  create: Joi.object({
    body: Joi.object({
      title: Joi.string()
        .regex(/^[\w@'-/" ]{1,200}$/)
        .required(),
      author: Joi.string().regex(/^[\w "]{1,100}$/),
      source: commonValidator.longStr,
      reference: Joi.object({
        feedSource: Joi.any()
          .valid(constants.feedSourceTypes)
          .required(),
        key: Joi.string().required(),
      }).required(),
      type: Joi.any().valid(constants.articleTypes),
      contentPath: commonValidator.longStr,
      thumbnail: commonValidator.longStr,
      description: commonValidator.veryLongStr,
      matchId: commonValidator.shortStr,
      approvalStatus: Joi.any().valid(constants.approvalStatusTypes),
      filters: Joi.array().items(
        Joi.any()
          .valid(constants.articleFilterTypes)
          .required(),
      ),
      status: Joi.any().valid(constants.statusTypes),
      isHighlight: Joi.boolean(),
      isDraft: Joi.boolean(),
      content: Joi.string(),
      imageData: Joi.object({
        base64: Joi.string().required(),
        extension: Joi.any().valid(constants.imageTypes),
      }),
      publishedAt: Joi.date(),
      timezone: Joi.string(),
      tagList: Joi.array().items(Joi.string()),
      seoRoute: Joi.string(),
      seoTags: Joi.string(),
      seoDescription: Joi.string(),
      seoKeywords: Joi.string(),
    }),
  }),

  // PUT /api/article/:id
  update: Joi.object({
    params: Joi.object({
      id: commonValidator.validMongoId.required(),
    }),
    body: Joi.object({
      title: Joi.string().regex(/^[\w@'-/" ]{1,200}$/),
      author: Joi.string().regex(/^[\w "]{1,100}$/),
      source: commonValidator.longStr,
      type: Joi.any().valid(constants.articleTypes),
      contentPath: commonValidator.longStr,
      thumbnail: commonValidator.longStr,
      description: commonValidator.veryLongStr,
      matchId: commonValidator.shortStr,
      approvalStatus: Joi.any().valid(constants.approvalStatusTypes),
      filters: Joi.array().items(
        Joi.any()
          .valid(constants.articleFilterTypes)
          .required(),
      ),
      status: Joi.any().valid(constants.statusTypes),
      isHighlight: Joi.boolean(),
      isDraft: Joi.boolean(),
      content: Joi.string(),
      imageData: Joi.object({
        base64: Joi.string().required(),
        extension: Joi.any().valid(constants.imageTypes),
      }),
      publishedAt: Joi.date(),
      timezone: Joi.string(),
      tagList: Joi.array().items(Joi.string()),
      seoRoute: Joi.string(),
      seoTags: Joi.string(),
      seoDescription: Joi.string(),
      seoKeywords: Joi.string(),
    }),
  }),

  // DELETE /api/article/:id
  remove: Joi.object({
    params: Joi.object({
      id: commonValidator.validMongoId.required(),
    }),
  }),

  // PUT /api/article/:id/approval-status
  updateApprovalStatus: Joi.object({
    body: Joi.object({
      approvalStatus: Joi.any()
        .valid(constants.approvalStatusTypes)
        .required(),
      articleIds: Joi.array()
        .items(commonValidator.validMongoId.required())
        .required(),
    }),
  }),

  // DELETE /api/article/:id/approval-status
  bulkDelete: Joi.object({
    body: Joi.object({
      articleIds: Joi.array()
        .items(commonValidator.validMongoId.required())
        .required(),
    }),
  }),
};
