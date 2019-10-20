import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compress from "compression";
import methodOverride from "method-override";
import cors from "cors";
import httpStatus from "http-status";
import helmet from "helmet";
import logger from "../utils/logger";
import routes from "../route";
import config from ".";
import APIError from "../app/helpers/APIError";
import messages from "../localization/en";

const app = express();

if (config.env === "development") {
  app.use(morgan("dev"));
}

// parse body params and attache them to req.body
app.use(bodyParser.json({ limit: config.bodyLimit }));
app.use(
  bodyParser.urlencoded({
    limit: config.bodyLimit,
    extended: true,
    parameterLimit: 50000,
  }),
);

app.use(cookieParser());
app.use(compress());
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(
  cors({
    exposedHeaders: config.corsHeaders,
    origin: config.corsOrigin,
    credentials: true,
  }),
);

// mount all routes on /api path
app.use("/api", routes);

app.use("/uploads", express.static("uploads"));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new APIError("API not found", httpStatus.NOT_FOUND, true);
  return next(err);
});

// if error is not an instanceOf APIError, convert it.
/* eslint-disable-next-line no-unused-vars */
app.use((err, req, res, next) => {
  let customErr;
  if (err.name === "MongoError") {
    switch (err.status) {
      case 11000:
        customErr = new APIError(messages.ALREADY_EXIST, 409, true);
        break;
      default:
        customErr = new APIError(err.message, err.status, err.isPublic);
    }
  }
  if (!(err instanceof APIError)) {
    customErr = new APIError(err.message, err.status, err.isPublic);
  }

  const error = customErr || err;
  logger.error(error.message);
  let obj = {
    message: error.isPublic ? error.message : httpStatus[error.status],
    status: error.status,
  };
  // error handler, send stacktrace only during development
  if (config.env === "development") {
    obj = { ...obj, stack: error.stack };
  }
  res.status(error.status).json(obj);
});

export default app;
