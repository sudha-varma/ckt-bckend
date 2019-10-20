import express from "express";
import controller from "./statistics.controller";
import multer from 'multer';
const storage = multer.diskStorage({
  destination : function (req, file, cb){
    cb(null, './uploads/profile_images');
  },
  filename : function(req, file, cb){
    cb(null , file.originalname);
  }
})
const upload = multer({storage : storage})

const router = express.Router(); // eslint-disable-line new-cap

router
  .route("/players_statistics")
  // create new tag (accessed at POST /api/players_stats)
  .post(upload.single('profileImage'),controller.post)

  //get player stats (accessed at GET /api/players_stats)
  .get(controller.list)

  //update player statistics
  .put(controller.update)


  

export default router;
