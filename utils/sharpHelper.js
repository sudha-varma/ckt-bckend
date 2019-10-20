import sharp from "sharp";
import fs from "fs";
import logger from "./logger";
import util from "./util";
const uploadRoot = "uploads/";

const scaleMultipleImages = async (base64, extension, imageResolutions) => {
  // Checking if all the required params present
  const result = {};
  if (base64 && extension && imageResolutions) {
    // Loading base64 data to buffer
    const base64URL = base64.replace(/^data:image\/\w+;base64,/, "");
    const base64Buffer = Buffer.from(base64URL, "base64");
    const imageProcessList = [];

    // Scaling image with sharp library
    Object.keys(imageResolutions).forEach(type => {
      const { height, width, imagePath } = imageResolutions[type];
      imageProcessList.push(
        scaleImage(base64Buffer, extension, height, width, imagePath).then(
          filePath => ({
            type,
            filePath,
          }),
        ),
      );
    });

    try {
      const imageProcessResults = await Promise.all(imageProcessList);
      imageProcessResults.forEach(imageData => {
        result[imageData.type] = imageData.filePath;
      });
      return result;
    } catch (err) {
      return { error: err };
    }
  }
  // if image is not uploaded then just pass
  logger.error("Required params for image scaling missing");
  return null;
};

const scaleImage = (base64Buffer, extension, height, width, imagePath) =>
  new Promise((resolve, reject) => {
    // Scaling image
    sharp(base64Buffer)
      .resize(width, height)
      .max()
      .min()
      .toFormat(extension)
      .toBuffer()
      .then(outputImage => {
        const dir = `${uploadRoot}hdfs-images/`;

        // Creating directory if doesn't exist
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }

        // Getting or creating image path
        const filePath =
          imagePath ||
          `${dir}${util.generateSalt()}_${height}_${width}.${extension}`;

        // Writing image to disk
        fs.writeFile(filePath, outputImage, fileErr => {
          if (fileErr) {
            logger.error(fileErr);
            const errObj = {
              status: 404,
              message: "Unable to upload image",
            };
            reject(errObj);
          } else {
            resolve(filePath);
          }
        });
      })
      .catch(imageErr => {
        logger.error(imageErr);
        const errObj = { status: 404, message: "Image processing failed" };
        reject(errObj);
      });
  });

  const resizeImage = function(fileObj){
    sharp(fileObj).resize(200, 200).toBuffer(function(err, buf) {
      if (err) return next(err)
      console.log('file resized successfully');
      // Do whatever you want with `buf`
    })
  }

export default { scaleMultipleImages };
