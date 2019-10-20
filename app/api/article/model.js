import mongoose from "mongoose";
import constants from "../../helpers/constants";

const referenceSchema = new mongoose.Schema(
  {
    feedSource: {
      type: String,
      enum: constants.feedSourceTypes,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const tagsSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const imageDataSchema = new mongoose.Schema(
  {
    thumbnail: {
      type: String,
      required: true,
    },
    featureThumbnail: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const filterSchema = new mongoose.Schema({}, { _id: false, strict: false });

const modelSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
    },
    reference: {
      type: referenceSchema,
      required: true,
    },
    source: {
      type: String,
    },
    type: {
      type: String,
      enum: constants.articleTypes,
      default: "news",
    },
    contentPath: {
      type: String,
    },
    thumbnail: {
      type: String,
    },
    description: {
      type: String,
    },
    matchId: {
      type: String,
    },
    approvalStatus: {
      type: String,
      enum: constants.approvalStatusTypes,
      default: "pending",
    },
    filters: {
      type: filterSchema,
      required: true,
    },
    status: {
      type: String,
      enum: constants.statusTypes,
      default: "active",
    },
    isHighlight: {
      type: Boolean,
      default: false,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
    imageData: {
      type: imageDataSchema,
    },
    publishedAt: {
      type: Date,
    },
    timezone: {
      type: String,
    },
    tags: {
      type: [tagsSchema],
    },
    seoRoute: {
      type: String,
    },
    seoTags: {
      type: String,
    },
    seoDescription: {
      type: String,
    },
    seoKeywords: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
);

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
modelSchema.method({});

/**
 * Statics
 */
modelSchema.statics = {};

/**
 * @typedef article
 */
export default mongoose.model("article", modelSchema);
