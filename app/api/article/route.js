import express from "express";
import controller from "./controller";
import { isLoggedUser } from "../../helpers/decorator";
import c from "../../../utils/controlHandler";

const router = express.Router(); // eslint-disable-line new-cap

router
  .route("/")
  // create new article (accessed at POST /api/articles)
  .post(isLoggedUser(), c(controller.create, ({ body, user }) => [body, user]))
  // list all articles (accessed at GET /api/articles)
  .get(c(controller.list, ({ query }) => [query]));

router
  .route("/update-approval-status")
  // update multiple article's approval status (accessed at PUT /api/articles/update-approval-status)
  .put(
    isLoggedUser(),
    c(controller.updateApprovalStatus, ({ body, user }) => [body, user]),
  );

router
  .route("/bulk-delete")
  // delete multiple article (accessed at PUT /api/articles/bulkDelete)
  .delete(
    isLoggedUser(),
    c(controller.bulkDelete, ({ body, user }) => [body, user]),
  );

router
  .route("/:id")
  // update article (accessed at PUT /api/articles/:id)
  .put(
    isLoggedUser(),
    c(controller.update, ({ params, body, user }) => [params, body, user]),
  )
  // remove article (accessed at DELETE /api/articles/:id)
  .delete(
    isLoggedUser(),
    c(controller.remove, ({ params, user }) => [params, user]),
  )
  // get article (accessed at GET /api/articles/:id)
  .get(c(controller.get, ({ params }) => [params]));

export default router;
