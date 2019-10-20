import User from "./model";
import commonService from "../../helpers/services/commonService";
import messages from "../../../localization/en";
import helper from "../../helpers/helper";
import util from "../../../utils/util";

/**
 * Finding documents with provided query params
 * @property {object} query - object containing params to prepare query.
 * @property {boolean} autoSend - false if formatted output not needed.
 * @returns {documents[]}
 */
async function find({ query, projection = "", autoSend = true }) {
  const res = await commonService.find({
    Model: User,
    query,
    autoSend,
    projection,
  });
  return res;
}

/**
 * Finding documents which contains provided name
 * @property {string} name - name of user.
 * @property {string} projection - project the fields.
 * @property {boolean} autoSend - false if formatted output not needed.
 * @returns {documents[]}
 */
async function searchByName({ name, projection = "name", autoSend = true }) {
  const customFilters = {
    name: { $regex: name, $options: "i" },
  };
  const res = await commonService.find({
    Model: User,
    autoSend,
    projection,
    customFilters,
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
    Model: User,
    id,
    errKey,
    autoSend,
  });
  return res;
}

/**
 * Finding user with email
 * @property {string} email - email id.
 * @property {boolean} autoSend - false if formatted output not needed.
 * @returns {document}
 */
async function findByEmail({ email, id }) {
  // Getting document with email
  const data = {
    email,
    status: "active",
  };
  if (id) {
    data._id = id;
  }
  const existingDoc = await User.findOne(data);
  return existingDoc;
}

/**
 * Login login
 * @property {string} email - email id.
 * @property {boolean} autoSend - false if formatted output not needed.
 * @property {callback} response - callback function.
 * @returns {document}
 */
async function userLogin({ email, password }) {
  // Getting document with email
  const existingDoc = await findByEmail({ email });

  // Returning doc if exist
  if (
    existingDoc &&
    existingDoc.password === util.hashPassword(password, existingDoc.salt)
  ) {
    const token = helper.generateAccessToken(existingDoc);
    // Returning formatted response
    return {
      status: 200,
      data: existingDoc,
      message: messages.LOGIN_SUCCESS,
      cookie: token,
    };
  }

  // Returning error obj if does not exist
  const errObj = {
    error: {
      status: 409,
      message: messages.LOGIN_FAILED,
    },
  };

  return errObj;
}

/**
 * Creating document
 * @property {object} data - document properties.
 * @property {boolean} autoSend - false if formatted output not needed.
 * @returns {document}
 */
async function create({ data, autoSend = true }) {
  const res = await commonService.create({ Model: User, data, autoSend });
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
    Model: User,
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
    Model: User,
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
  const res = await commonService.removeById({ Model: User, id, autoSend });
  return res;
}

/**
 * Finding document with name
 * @property {object} Model - Mongoose model object.
 * @property {string} name - document name.
 * @property {string} errKey - key for which error object will be generated.
 * @property {boolean} autoSend - false if formatted output not needed.
 * @returns {document}
 */
async function findByName({ name, errKey, autoSend = true }) {
  // Getting document with name
  const existingDoc = await User.findOne({
    name,
    status: "active",
  });

  // Returning doc if exist
  if (existingDoc !== null) {
    // Returning formatted response if autosend true
    if (autoSend) {
      return {
        status: 200,
        data: existingDoc,
        message: messages.SUCCESSFULL,
      };
    }

    // Otherwise returned db object
    return existingDoc;
  }

  // Returning error obj if does not exist
  const errObj = {
    error: {
      status: 404,
      message: messages.NOT_FOUND,
    },
  };
  if (errKey) {
    errObj.error.data = [
      {
        [errKey]: messages.NOT_FOUND,
      },
    ];
  }
  return errObj;
}

/**
 * Creating or updating user by name
 * @property {string} articleId - Article id.
 * @property {string} name - User name.
 */
async function createOrUpdateTags({ articleId, name }) {
  // Finding tags by name
  const tagDoc = await findByName({
    Model: User,
    name,
    autoSend: false,
  });

  let user;
  if (tagDoc.error) {
    // Creating new user if doesn't exist
    user = await commonService.create({
      Model: User,
      data: { name, articles: [articleId] },
      autoSend: false,
    });
  } else {
    // Adding article id to the existing user
    let articlesIds = tagDoc.articles;
    articlesIds.push(articleId);
    articlesIds = [...new Set(articlesIds)];

    user = await commonService.updateExisting({
      Model: User,
      data: { tags: articlesIds },
      existingDoc: tagDoc,
      autoSend: false,
    });
  }
  return user;
}

/**
 * Find and remove tags
 * @property {string} articleId - Article id.
 * @property {string} name - User name.
 */
async function findAndRemoveTags({ articleId, name }) {
  // Finding tags by name
  const tagDoc = await findByName({
    Model: User,
    name,
    autoSend: false,
  });

  if (!tagDoc.error) {
    const articlesIds = tagDoc.articles;
    const position = articlesIds.indexOf(articleId);

    // removing articleId on a position.
    articlesIds.splice(position, 1);

    commonService.updateExisting({
      Model: User,
      data: { articles: articlesIds },
      existingDoc: tagDoc,
      autoSend: false,
    });
  }
}

export default {
  find,
  searchByName,
  findById,
  findByEmail,
  userLogin,
  create,
  update,
  updateExisting,
  removeById,
  createOrUpdateTags,
  findAndRemoveTags,
};
