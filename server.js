import Promise from "bluebird"; // eslint-disable-line no-global-assign
import cors from "cors";
import mongoose from "mongoose";
import util from "util";
// config should be imported before importing any other file
import config from "./config";
import app from "./config/express";
const db = config.database;

// make bluebird default Promise

// plugin bluebird promise in mongoose
mongoose.Promise = Promise;

// connect to mongo db
const mongoUri = `mongodb://${db.user}:${db.pass}@${db.host}:${db.port}/${
  db.dbname
}?authSource=admin`;
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  keepAlive: 1,
});
mongoose.connection.on("error", () => {
  throw new Error(`unable to connect to database: ${mongoUri}`);
});
// print mongoose logs in dev env
if (db.mongooseDebug) {
  mongoose.set("debug", true);
  // mongoose.set("debug", (collectionName, method, query, doc) => {
  //   debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  // });
}

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  // listen on port config.port
  app.listen(config.port, () => {
    console.info(`server started on port ${config.port} (${config.env})`); // eslint-disable-line no-console
  });
}

export default app;
