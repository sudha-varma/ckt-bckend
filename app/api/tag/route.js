import express from "express";
import controller from "./controller";
import { isLoggedUser } from "../../helpers/decorator";
import c from "../../../utils/controlHandler";

const router = express.Router(); // eslint-disable-line new-cap

router
  .route("/")
  // create new tag (accessed at POST /api/tag)
  .post(isLoggedUser(), c(controller.create, ({ body, user }) => [body, user]))
  // list all tags (accessed at GET /api/tags)
  .get(isLoggedUser(), c(controller.list, ({ query }) => [query]));

router
  .route("/search-name")
  .get(c(controller.searchName, ({ query }) => [query]));

export default router;
