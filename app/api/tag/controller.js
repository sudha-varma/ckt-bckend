import validator from "./validator";
import util from "../../../utils/util";
import service from "./service";

/**
 * Get contained tag list.
 * @returns {Tag[]}
 */
async function searchName(query) {
  // Validating query
  const validQuery = await validator.searchName.validate({ query });
  const { name } = validQuery.query;

  const docs = await service.searchByName({ name, projection: "name" });
  return docs;
}

/**
 * Create new tag
 * @property {string} body.name - The name of the tag.
 * @returns {Tag}
 */
async function create(body) {
  // Validating body
  const validData = await validator.create.validate({ body });

  const validBody = validData.body;

  // Creating new tag
  const formattedDoc = await service.create({ data: validBody });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(formattedDoc);

  return formattedDoc;
}

/**
 * Get tag list.
 * @property {number} query.skip - Number of article to be skipped.
 * @property {number} query.limit - Limit number of article to be returned.
 * @returns {Tag[]}
 */

async function list(query) {
  // Validating query
  const validQuery = await validator.list.validate({ query });

  // Getting article list with filters
  const docs = await service.find({ query: validQuery.query });
  return docs;
}

export default {
  searchName,
  create,
  list,
};
