import str from "string-to-stream";
import logger from "./logger";
import hdfs from "../config/webhdfs-client";
import util from "./util";

const getFileContent = hdfsFilePath =>
  new Promise((resolve, reject) => {
    if (hdfsFilePath) {
      // Creating read streem for given HDFS path
      const remoteFileStream = hdfs.createReadStream(hdfsFilePath);
      let content = "";

      // Handling HDFS errors
      remoteFileStream.on("error", hdfsRemoteErr => {
        // Logging HDFS error
        logger.error(hdfsRemoteErr.message);
        const errObj = { status: 422, message: "Read to HDFS failed" };
        reject(errObj);
      });

      // Merging HDFS data
      remoteFileStream.on("data", hdfsFileChunk => {
        content += hdfsFileChunk;
      });

      remoteFileStream.on("finish", () => {
        resolve(content);
      });
    } else {
      resolve();
    }
  });

const uploadContent = (fileData, filePath = undefined) =>
  new Promise((resolve, reject) => {
    if (fileData) {
      // if path is not exist creating a path with random uuid
      const hdfsFilePath =
        filePath || `articles/articles-${util.generateSalt()}-article.txt`;

      // Initialize writable stream to HDFS target
      const remoteFileStream = hdfs.createWriteStream(hdfsFilePath);

      // Initialize readable stream from string data
      // Pipe fileData to HDFS
      str(fileData).pipe(remoteFileStream);

      // Handle errors
      remoteFileStream.on("error", hdfsErr => {
        logger.error(hdfsErr);
        const errObj = { status: 422, message: "Write to HDFS failed" };
        reject(errObj);
      });

      // Handle finish event
      remoteFileStream.on("finish", () => {
        resolve(hdfsFilePath);
      });
    } else {
      resolve();
    }
  });

export default { getFileContent, uploadContent };
