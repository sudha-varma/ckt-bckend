import Statistics from "./statistics.player.model";
import Article from "../../api/article/model"
import validator from "./statistics.validator";
import util from "../../../utils/util";
import messages from "../../../localization/en";
import helper from "../../helpers/helper";
import logger from "../../../utils/logger";
import sharp from "sharp";
import fs from "fs";




/**
 * Get contained user using there credentials.
 * @returns {User}
 */
function post(req, res, next) {
  new Promise((resolve, reject) => {
    sharp(req.file.path).resize(200, 200).toBuffer(function (err, buf) {
      if (err) return next(err)
      console.log('file resized successfully');
      const filePath = req.file.path;
      // Writing image to disk
      fs.writeFile(filePath, buf, fileErr => {
        if (fileErr) {
          logger.error(fileErr);
          const errObj = {
            status: 404,
            message: "Unable to upload image",
          };
          reject(errObj);
        } else {
          resolve(filePath);
        }
      });
      // Do whatever you want with `buf`
    });
  });
  const schema = validator.playerStatistics;
  // Validating req quer
  req.body.imageUrl = req.file.path;
  schema.validate({ body: req.body }, (err, validData) => {
    if (err === null) {
      Statistics.findOne({ key: validData.body.key })
        .then(savedDoc => {
          if (savedDoc) {
            const player_stats = validData.body;
            let exist = false;
            let stat_index = 0;
            for (
              let i = 0;
              i < savedDoc.statistics.length;
              i += 1
            ) {
              const reference = savedDoc.statistics[i];
              if (
                reference.name ===
                player_stats.name
              ) {
                stat_index = i;
                exist = true;
                break;
              }
            }
            if (!exist) {
              savedDoc.statistics.push(player_stats)
            } else {
              savedDoc.statistics[stat_index] = player_stats
            }
            savedDoc.save()
              .then(updatedDoc => {
                res.status(201).json({
                  code: 201,
                  data: updatedDoc,
                  message: messages.UPDATED,
                })
              }).catch(e => {
                logger.error(e.message);
                return false;
              });
          } else {
            const statistics = {
              key: validData.body.key,
              statistics: [validData.body]
            }
            const statisticsDoc = new Statistics(statistics)
            statisticsDoc.save()
              .then(savedDoc => {
                res.status(201).json({
                  code: 201,
                  data: savedDoc,
                  message: messages.CREATED,
                })
              })
              .catch(e => next(e));
          }
        }).catch(e => next(e));
    } else {
      return res.status(400).json(util.FormatJOIError(err));
    }
    return true;
  });
}

// get the list of players_stats related to specific article
function list(req, res, next) {
  const schema = validator.list;
  // Validating req query
  schema.validate({ params: req.params }, (err, validData) => {
    if (err === null) {
      const article_id = validData.params.id;
      console.log(article_id)
      //const playerStats = new Statistics(user) 

    } else {
      return res.status(400).json(util.FormatJOIError(err));
    }
    return true;
  });
}

function update(req, res, next) {
  const schema = validator.playerStatistics;
  // Validating req query
  schema.validate({ body: req.body }, (err, validData) => {
    if (err === null) {
      const player_stats = validData.body;
      Statistics.findOne({ key: player_stats.key })
        .exec()
        .then(existingDoc => {
          existingDoc.set(validData.body);
          existingDoc
            .save()
            .then(savedDoc => {
              res.json({
                code: 200,
                data: savedDoc,
                message: messages.UPDATED,
              });
            })
            .catch(e => {
              logger.error(e.message);
              const err = {
                error: { code: 422, message: messages.UNKNOWN_ERROR },
              };
              throw err;
            });
        })
        .catch(e => next(e));

    } else {
      return res.status(400).json(util.FormatJOIError(err));
    }
    return true;
  });
}

export default {
  update,
  post,
  list
};