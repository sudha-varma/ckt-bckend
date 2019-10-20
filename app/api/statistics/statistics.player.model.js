import mongoose from "mongoose";
import constants from "../../helpers/constants";

const playerStatisticsSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      rank: {
        type: String
      },
      strikeRate: {
        type: String
      },
      matchesPlayed: {
        type: Number
      },
      runsScored: {
        type: Number
      },
      imageUrl : {
        type : String
      },
    },
    {
      _id : false
    }
)

const modelSchema = new mongoose.Schema(
  {
    statistics : [playerStatisticsSchema],
    key : {
        type : String,
        required : true
    }
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);



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
export default mongoose.model("player_statistics", modelSchema);
