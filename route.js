import express from "express";
import articleRoutes from "./app/api/article/route";
import tagRoutes from "./app/api/tag/route";
import userRoutes from "./app/api/user/route";
import statisticsRoutes from "./app/api/statistics/statistics.route";


const router = express.Router(); // eslint-disable-line new-cap

// TODO: use glob to match *.route files

/** GET /health-check - Check service health */
router.get("/health-check", (req, res) => res.send("OK"));

// mount article routes at /articles
router.use("/articles", articleRoutes);

// mount tags routes at /tag
router.use("/tags", tagRoutes);

// mount tags routes at /tag
router.use("/users", userRoutes);

//get statistics for a match
router.use("/statistics",statisticsRoutes)

export default router;
