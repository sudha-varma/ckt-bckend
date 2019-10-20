import validator from "./validator";
import util from "../../../utils/util";
import messages from "../../../localization/en";
import service from "./service";
import tagService from "../tag/service";
import hdfsHelper from "../../../utils/hdfsHelper";
import sharpHelper from "../../../utils/sharpHelper";
import config from "../../../config";
import Statistics from "../statistics/statistics.player.model";


/**
 * Get Article
 * @property {string} params.id - Article Id.
 * @returns {Object}
 */
async function get(params) {
  // Validating param
  const validParam = await validator.get.validate({ params });

  const { id } = validParam.params;

  // Getting article details
  const existingDoc = await service.findById({ id });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(existingDoc);

  const promiseList = [];

  // Getting related articles
  promiseList.push(
    service.findRelatedArticle({ articleData: existingDoc.data }),
  );

  // Getting file content from HDFS
  promiseList.push(hdfsHelper.getFileContent(existingDoc.data.contentPath));

  //get the stats
  promiseList.push(
    Statistics.findOne({
      key: validParam.params.id,
    })
      .exec()
      .then(stats => {
        if (stats) {
          return stats;
        }
      }),
  );

  // Waiting for promises to complete
  const promiseListResp = await Promise.all(promiseList);

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(promiseListResp);

  // Getting json object from mongoose document
  const jsonDoc = existingDoc.data.toJSON();

  // Appending related article to the article object
  [jsonDoc.relatedArticles] = promiseListResp;

  // Appending article content to article object
  jsonDoc.content = promiseListResp[1] || "";

  jsonDoc.player_statistics = promiseListResp[2];
  //jsonDoc.content = '<p>&nbsp;Former England batsman Nick Compton announced his retirement from cricket on Thursday.<br />The 35-year-old grandson of England great Denis Compton did not play for his county Middlesex in 2018.<br />South Africa-born Compton played 16 Tests for England, scoring two hundred.<br />"After almost two decades of professional cricket, I am announcing my retirement from the game I love so much,"Compton, who helped Middlesex win the 2016 County Championship, said in a club statement.</p>\r\n<p><span class="example1"><img style="width: 100%;" src="https://farm2.staticflickr.com/1929/30463957877_d786bb01f4.jpg" alt="lable" /></span></p>\r\n<p>"Of course, the pinnacle ofmy career was following in my grandfather Denis Compton\'s footsteps, having achieved my dream of playing and winning Test series for England," added Compton, who also played for Somerset in between two spells with Middlesex.</p>\r\n player_statistics <p>Compton, who scored more than 12,000 first-class runs at an average of 40.42, including 27 hundred, was the first of 12 batsmen who partnered Alastair Cook at the top of England\'sorder in the six years after Andrew Strauss retired in 2012.<br />But following back-to-back hundreds in New Zealand in 2013, he has dropped from the side ahead of that year\'s Ashes series in England despite an opening partnership with Cook that averaged 57.93.<br />Compton was recalled during a 2-1 series victory in South Africa in 2015 but he played just three more Tests, his international career ending against Sri Lanka two years ago.<br />Compton was always unlikely to match the heights achieved by his grandfather.<br />Denis Compton scored 5,907 runs in 78 Tests, including 17 hundred at an average of 50.06 and in the 1947 season alone complied a staggering 3,816 first-class runs as Middlesex won the County Championship.</p>'
  
  // Updating response with updated object
  existingDoc.data = jsonDoc;

  return existingDoc;
}

/**
 * Get Article list.
 * @property {number} query.limit - Limit number of article to be returned.
 * @property {number} query.skip - Number of article to be skipped.
 * @property {array} query.filters - Array of article filters.
 * @property {array} query.approvalStatus - Array of approval status.
 * @property {array} query.types - Array of article types.
 * @property {array} query.isDraft - Boolean for drafted and non drafted article.
 * @property {array} query.sortBy - keys to use to record sorting.
 * @returns {Object}
 */
async function list(query) {
  // Validating query
  const validQuery = await validator.list.validate({ query });

  // Getting article list with filters
  const docs = await service.find({ query: validQuery.query });
  return docs;
}

/**
 * Create new article
 * @property {string} req.body.title - The title of the article.
 * @property {string} req.body.author - The writer of the article.
 * @property {string} req.body.source - The reference of the source article.
 * @property {string} req.body.reference - The reference object {feedSource: x, key:y} of article.
 * @property {string} req.body.type - The type of article.
 * @property {string} req.body.contentPath - The HDFS file path, where body of article is saved.
 * @property {string} req.body.thumbnail - The path of the thumbnail.
 * @property {string} req.body.description - The description of the article.
 * @property {string} req.body.matchId - The match id for the article.
 * @property {string} req.body.approvalStatus - The approval status of article.
 * @property {string} req.body.filters - The filters type for the article.
 * @property {string} req.body.status - The status of article.
 * @property {string} req.body.content - The content of article.
 * @property {date} req.body.publishedAt - The publish date of the article.
 * @returns {Article}
 */
async function create(body) {
  // Validating body
  const validData = await validator.create.validate({ body });

  const validBody = validData.body;

  // Checking if document exist with same reference
  const duplicateDoc = await service.checkDuplicate({
    reference: validBody.reference,
    errKey: "body,reference",
  });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(duplicateDoc);

  // Converting filter array to object
  if (validBody.filters) {
    validBody.filters = util.ArrayToObj(validBody.filters);
  }

  const promiseList = [];
  // Setting up image scaling params
  const { imageData } = validBody;
  const base64 = (imageData && imageData.base64) || "";
  const imgExtension = (imageData && imageData.extension) || "";
  const imageResolutions = JSON.parse(
    JSON.stringify(config.defaults.imageResolutions),
  );

  // Updating article data to HDFS
  promiseList.push(hdfsHelper.uploadContent(validBody.content));

  // Scaling image with multiple resolutions
  promiseList.push(
    sharpHelper.scaleMultipleImages(base64, imgExtension, imageResolutions),
  );

  // Waiting for promises to complete
  const promiseListResp = await Promise.all(promiseList);

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(promiseListResp);

  // Getting content path
  if (promiseListResp[0]) {
    [validBody.contentPath] = promiseListResp;
  }

  // Getting scalled image urls from promise response
  if (promiseListResp[1]) {
    [, validBody.imageData] = promiseListResp;
  }

  // Creating new article
  const formattedDoc = await service.create({ data: validBody });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(formattedDoc);

  // Getting newDoc from formatted response
  const newDoc = formattedDoc.data;

  // Removing exsting featured article
  service.removeFeaturedArticles(newDoc);

  // Creating and updating tags available in body
  if (validBody.tagList) {
    const tagPromiseList = [];
    const tagListArray = [...new Set(validBody.tagList)];

    tagListArray.forEach(name => {
      tagPromiseList.push(
        tagService.createOrUpdateTags({ articleId: newDoc.id, name }),
      );
    });

    const tagPromiseResp = await Promise.all(tagPromiseList);

    const tagDataList = tagPromiseResp.map(tag => ({
      name: tag.name,
      id: tag.id,
    }));

    // Creating new article
    const updatedArticle = await service.updateExisting({
      existingDoc: newDoc,
      data: { tags: tagDataList },
      autoSend: false,
    });

    return {
      status: 201,
      data: updatedArticle,
      message: messages.CREATED,
    };
  }

  return formattedDoc;
}

/**
 * Update existing article
 * @property {string} req.body.title - The title of the article.
 * @property {string} req.body.author - The writer of the article.
 * @property {string} req.body.source - The reference of the source article.
 * @property {string} req.body.reference - The reference object {feedSource: x, key:y} of article.
 * @property {string} req.body.type - The type of article.
 * @property {string} req.body.contentPath - The HDFS file path, where body of article is saved.
 * @property {string} req.body.thumbnail - The path of the thumbnail.
 * @property {string} req.body.description - The description of the article.
 * @property {string} req.body.matchId - The match id for the article.
 * @property {string} req.body.approvalStatus - The approval status of article.
 * @property {string} req.body.filters - The filters type for the article.
 * @property {string} req.body.status - The status of article.
 * @property {string} req.body.content - The content of article.
 * @property {date} req.body.publishedAt - The publish date of the article.
 * @returns {Article}
 */
async function update(params, body) {
  // Validating params
  const validParam = await validator.update.validate({ params });

  // Finding the article object to update
  const doc = await service.findById({
    id: validParam.params.id,
    autoSend: false,
  });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(doc);

  // Validating body
  const validData = await validator.update.validate({ body });

  const validBody = validData.body;

  // TODO: Don't allow reference in body
  validBody.reference = doc.reference;

  // Converting filter array to object
  if (validBody.filters) {
    validBody.filters = util.ArrayToObj(validBody.filters);
  }

  const promiseList = [];
  // Setting up image scaling params
  const { imageData } = validBody;
  const base64 = (imageData && imageData.base64) || "";
  const imgExtension = (imageData && imageData.extension) || "";
  const imageResolutions = JSON.parse(
    JSON.stringify(config.defaults.imageResolutions),
  );

  const existingImageData = doc.imageData;
  if (existingImageData) {
    Object.keys(imageResolutions).forEach(type => {
      if (existingImageData[type]) {
        imageResolutions[type].imagePath = existingImageData[type];
      }
    });
  }

  // Updating article data to HDFS
  promiseList.push(
    hdfsHelper.uploadContent(validBody.content, doc.contentPath),
  );

  // Scaling image with multiple resolutions
  promiseList.push(
    sharpHelper.scaleMultipleImages(base64, imgExtension, imageResolutions),
  );

  // Waiting for promises to complete
  const promiseListResp = await Promise.all(promiseList);

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(promiseListResp);

  // Getting content path
  if (promiseListResp[0]) {
    [validBody.contentPath] = promiseListResp;
  }

  // Getting scalled image urls from promise response
  if (promiseListResp[1]) {
    [, validBody.imageData] = promiseListResp;
  }

  if (validBody.tagList) {
    // Getting list of unique tags
    const updatedTagNameList = new Set(validBody.tagList);
    let existingTagNameList = [];
    let finalTagDataList = [];
    if (doc.tags) {
      // Storing existing tags to tagData list in case of no add or delete of tags
      finalTagDataList = doc.tags;

      // Set of existing tag names
      existingTagNameList = new Set(finalTagDataList.map(tag => tag.name));
    }

    // Getting list of removed tag names
    const removedTagNames = [...existingTagNameList].filter(
      x => !updatedTagNameList.has(x),
    );

    // Excluding removed tags from final tag data list
    if (removedTagNames.length) {
      finalTagDataList = finalTagDataList.filter(tag => {
        if (!removedTagNames.includes(tag.name)) {
          return tag;
        }
        return null;
      });
    }

    // List of newly added tag names
    const addedTagNames = [...updatedTagNameList].filter(
      x => !existingTagNameList.has(x),
    );

    const tagPromiseList = [];

    // Adding new tags to db
    addedTagNames.forEach(name => {
      tagPromiseList.push(
        tagService.createOrUpdateTags({ articleId: doc.id, name }),
      );
    });

    // Deleting removed tags from db without blocking anything
    removedTagNames.forEach(name => {
      tagService.findAndRemoveTags({ articleId: doc.id, name });
    });

    // Waiting for promises to complete
    const tagPromiseResp = await Promise.all(tagPromiseList);

    finalTagDataList = finalTagDataList.concat(
      tagPromiseResp.map(tag => ({
        name: tag.name,
        id: tag.id,
      })),
    );

    // updating the final tags list in the article
    validBody.tags = finalTagDataList;
  }
  const formattedDoc = await service.updateExisting({
    existingDoc: doc,
    data: validBody,
  });

  // Removing featured filter from existing articles
  service.removeFeaturedArticles(formattedDoc.data);

  return formattedDoc;
}

/**
 * Delete Article.
 * @property {string} params.id - Article Id.
 * @returns {Object}
 */
async function remove(params) {
  // Validating param
  const validParam = await validator.remove.validate({ params });
  const { id } = validParam.params;

  // Updating status to deleted
  const deletedDoc = await service.removeById({ id });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(deletedDoc);

  return deletedDoc;
}

/**
 * Update approval status in bulk.
 * @property {string} req.body.approvalStatus - The approval status of the articles.
 * @property {string} req.body.articleIds - The array of article ids.
 * @returns {Object}
 */
async function updateApprovalStatus(body) {
  // Validating body
  const validBody = await validator.updateApprovalStatus.validate({ body });
  const { articleIds, approvalStatus } = validBody.body;

  // creating data object on which operation will be performed
  const data = { approvalStatus };

  // Updating approval status of multiple docs
  const updatedDocs = await service.bulkUpdate({ ids: articleIds, data });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(updatedDocs);

  return updatedDocs;
}

/**
 * Article delelte in bulk.
 * @property {string} req.body.articleIds - The array of article ids.
 * @returns {Object}
 */
async function bulkDelete(body) {
  // Validating body
  const validBody = await validator.bulkDelete.validate({ body });
  const { articleIds } = validBody.body;

  // To change documents status to delete
  const data = { status: "deleted" };

  // Pseudo deleting multiple docs
  const deletedDocs = await service.bulkUpdate({
    ids: articleIds,
    data,
    message: messages.DELETED,
  });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(deletedDocs);

  return deletedDocs;
}

export default {
  get,
  list,
  create,
  update,
  remove,
  updateApprovalStatus,
  bulkDelete,
};
