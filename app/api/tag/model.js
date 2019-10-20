import mongoose from "mongoose";
import constants from "../../helpers/constants";

const modelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: constants.statusTypes,
      default: "active",
    },
    articles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }],
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
 * @typedef tag
 */
export default mongoose.model("tag", modelSchema);
