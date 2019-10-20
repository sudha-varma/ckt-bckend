import Article from "./model";
import commonService from "../../helpers/services/commonService";

/**
 * Finding documents with provided query params
 * @property {object} query - object containing params to prepare query.
 * @property {boolean} autoSend - false if formatted output not needed.
 * @returns {documents[]}
 */
async function find({ query, projection = "", autoSend = true }) {
  const { filters, approvalStatus, types, isDraft } = query;
  const filterCriteria = {};
  if (filters) {
    filters.forEach(filter => {
      filterCriteria[`filters.${filter}`] = true;
    });
  }
  if (types) {
    filterCriteria.type = { $in: types };
  }
  filterCriteria.approvalStatus = approvalStatus
    ? { $in: approvalStatus }
    : "approved";
  filterCriteria.isDraft = isDraft || false;
  const res = await commonService.find({
    Model: Article,
    query,
    autoSend,
    projection,
    customFilters: filterCriteria,
  });
  return res;
}

/**
 * Finding document with id
 * @property {string} id - document id.
 * @property {string} errKey - key for which error object will be generated.
 * @property {boolean} autoSend - false if formatted output not needed.
 * @returns {document}
 */
async function findById({ id, errKey, autoSend = true }) {
  const res = await commonService.findById({
    Model: Article,
    id,
    errKey,
    autoSend,
  });
  return res;
}

/**
 * Finding document with reference
 * @property {object} reference - The reference object {feedSource: x, key:y}.
 * @property {string} excludedId - document id to be excluded.
 * @property {string} errKey - key for which error object will be generated.
 * @property {boolean} autoSend - false if formatted output not needed.
 * @returns {document}
 */
async function findByReference({
  reference,
  excludedId,
  errKey,
  autoSend = true,
}) {
  const res = await commonService.findByReference({
    Model: Article,
    reference,
    excludedId,
    errKey,
    autoSend,
  });
  return res;
}

/**
 * Checking if document exist with reference
 * @property {object} reference - The reference object {feedSource: x, key:y}.
 * @property {string} excludedId - document id to be excluded.
 * @property {string} errKey - key for which error object will be generated.
 * @property {boolean} autoSend - false if formatted output not needed.
 * @returns {boolean/document}
 */
async function checkDuplicate({
  reference,
  excludedId,
  errKey,
  autoSend = true,
}) {
  const res = await commonService.checkDuplicate({
    Model: Article,
    reference,
    excludedId,
    errKey,
    autoSend,
  });
  return res;
}

/**
 * Creating document
 * @property {object} data - document properties.
 * @property {boolean} autoSend - false if formatted output not needed.
 * @returns {document}
 */
async function create({ data, autoSend = true }) {
  const res = await commonService.create({ Model: Article, data, autoSend });
  return res;
}

/**
 * Updating document
 * @property {object} data - document properties.
 * @property {document} existingDoc - document which needs to be updated.
 * @property {boolean} autoSend - false if formatted output not needed.
 * @returns {document}
 */
async function updateExisting({ data, existingDoc, autoSend = true }) {
  const res = await commonService.updateExisting({
    Model: Article,
    data,
    existingDoc,
    autoSend,
  });
  return res;
}

/**
 * Updating document
 * @property {object} data - document properties.
 * @property {object} filterCriteria - criteria to fetch document to be updated.
 * @property {boolean} autoSend - false if formatted output not needed.
 * @returns {document}
 */
async function update({ data, removeData, filterCriteria, autoSend = true }) {
  const res = await commonService.update({
    Model: Article,
    data,
    removeData,
    filterCriteria,
    autoSend,
  });
  return res;
}

/**
 * Pseudo delete document
 * @property {string} id - document id to be removed.
 * @property {boolean} autoSend - false if formatted output not needed.
 * @returns {document}
 */
async function removeById({ id, autoSend = true }) {
  const res = await commonService.removeById({ Model: Article, id, autoSend });
  return res;
}

/**
 * Update multiple documents
 * @property {array} ids - array of ids.
 * @property {object} data - key and value pair on which operation will be performed.
 * @property {boolean} autoSend - false if formatted output not needed.
 * @property {string} message - custom message if required.
 * @returns {document}
 */
async function bulkUpdate({
  ids,
  data,
  removeData,
  autoSend = true,
  message = undefined,
}) {
  const filterCriteria = { _id: { $in: ids } };
  const res = await commonService.update({
    Model: Article,
    filterCriteria,
    data,
    removeData,
    autoSend,
    message,
  });
  return res;
}

/**
 * Finding documents with provided query params
 * @property {object} articleData - Article document.
 * @property {boolean} autoSend - false if formatted output not needed.
 * @returns {documents[]}
 */
async function findRelatedArticle({ articleData }) {
  if (articleData.matchId) {
    const filterCriteria = {
      matchId: articleData.matchId,
      approvalStatus: "approved",
      type: articleData.type,
      _id: { $nin: [articleData.id] },
    };
    const projection = "description imageData _id updatedAt reference";
    const relatedArticles = await commonService.find({
      Model: Article,
      query: {},
      autoSend: false,
      projection,
      customFilters: filterCriteria,
    });
    return relatedArticles;
  }
  return [];
}

/**
 * Remove existing featured articles
 * @property {object} currentArticle - Article document.
 */
async function removeFeaturedArticles(currentArticle) {
  // Proceed only if current article is approved and featured
  if (
    currentArticle.filters.featured &&
    currentArticle.approvalStatus === "approved"
  ) {
    const filterCriteria = {
      status: "active",
      approvalStatus: "approved",
      type: currentArticle.type,
      _id: { $ne: currentArticle.id },
      "filters.featured": true,
    };
    commonService.update({
      Model: Article,
      data: {},
      removeData: { "filters.featured": "" },
      filterCriteria,
      autoSend: false,
      options: { strict: false },
    });
  }
}

export default {
  find,
  findById,
  findByReference,
  checkDuplicate,
  create,
  update,
  updateExisting,
  removeById,
  bulkUpdate,
  findRelatedArticle,
  removeFeaturedArticles,
};
