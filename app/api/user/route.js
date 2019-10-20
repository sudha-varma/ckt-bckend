import express from "express";
import controller from "./controller";
import c from "../../../utils/controlHandler";

const router = express.Router(); // eslint-disable-line new-cap
router.route("/").get(c(controller.list, ({ query }) => [query]));

router
  .route("/login")
  // create new tag (accessed at POST /api/tag)
  .post(c(controller.loginUser, ({ body }) => [body]));

router.route("/signup").post(c(controller.create, ({ body }) => [body]));
router.route("/logout").post(controller.userLogout);

export default router;
